"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth/AuthContext";
import {CardProgressApiError,createCardProgress,getCardProgress,updateCardProgress} from "@/app/lib/card-progress-service";
import { getCardsByDeckId } from "@/app/lib/card-service";
import { getDeck, updateDeck } from "@/app/lib/deck-service";
import dateData from "@/app/lib/placeholder-dateData.json";
import LearningEndPage from "@/app/ui/learning_cards/learning_end_page";
import LearnCard from "../../../ui/learning_cards/learning_cards";
import type { Card, Deck, StatsMap } from "../../../lib/definitions";
import { isDueToday, rateCard } from "../../../lib/learning-service";
import styles from "./LearningSession.module.css";

type LearningMode = "due" | "all";
type SessionAction = "again" | "completed" | "skipped";

type LearningSessionProps = {deckId: string; mode: LearningMode;};

async function loadOrCreateProgress(
  deckId: string,
  card: Card,
  token: string,
): Promise<Card> {
  try {
    const progress = await getCardProgress(deckId, card.id, token);
    return { ...card, ...progress };
  } catch (error) {
    if (!(error instanceof CardProgressApiError) || error.status !== 404) {
      throw error;
    }

    const progress = await createCardProgress(
      deckId,
      card.id,
      { state: "new", rating: null, totalReviews: 0 },
      token,
    );
    return { ...card, ...progress };
  }
}

export default function LearningSession({ deckId, mode }: LearningSessionProps) {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();
  const token = user?.token;

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [resultCards, setResultCards] = useState<Card[]>([]);
  const [actionHistory, setActionHistory] = useState<SessionAction[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [stats, setStats] = useState<StatsMap>(dateData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const lastStudiedWasSaved = useRef(false);
  const currentCard = sessionCards[currentIndex];

  useEffect(() => {
    if (authIsLoading) return;

    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadCards() {
      try {
        setIsLoading(true);
        setLoadError(null);
        setSaveError(null);

        const [deck, cards] = await Promise.all([
          getDeck(deckId, authToken),
          getCardsByDeckId(deckId, authToken),
        ]);
        const cardsWithProgress = await Promise.all(
          cards.map((card) => loadOrCreateProgress(deckId, card, authToken)),
        );

        const learnableCards = cardsWithProgress;
        const now = new Date();
        const selectedCards = 
          mode === "all" ? learnableCards : learnableCards.filter((card) => isDueToday(card,now),);

        if (!cancelled) {
          setSelectedDeck(deck);
          setSessionCards(selectedCards);
          setTotalCards(selectedCards.length);
          setCurrentIndex(0);
          setResultCards([]);
          setActionHistory([]);
          setLearnedCount(0);
          lastStudiedWasSaved.current = false;
        }
      } catch (caughtError) {
        if (!cancelled) {
          setLoadError(
            caughtError instanceof Error
              ? caughtError.message
              : "Cards could not be loaded. Please try again later.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadCards();

    return () => {
      cancelled = true;
    };
  }, [authIsLoading, deckId, mode, token]);

  const changeIndex = (index: number) => {
    if (index >= 0 && index < sessionCards.length) {
      setCurrentIndex(index);
    }};

  const handlePrev = () => {
    const lastAction = actionHistory.at(-1);

    if (!lastAction) return;

    setActionHistory((previous) => previous.slice(0, -1));

    if (lastAction === "completed") {
      setLearnedCount((previous) => Math.max(0, previous - 1));
      setResultCards((previous) => previous.slice(0, -1));
    }

    if (lastAction === "skipped") {
      setLearnedCount((previous) => Math.max(0, previous - 1));
    }

    if (lastAction === "again") {
      setSessionCards((previous) => previous.slice(0, -1));
    }

    changeIndex(currentIndex - 1);
  };

  const handleSkip = () => {
    setActionHistory((previous) => [...previous, "skipped"]);
    setLearnedCount((previous) => previous + 1);
    setCurrentIndex((previous) => previous + 1);
  };

  // ki generiert
  const handleRestart = () => {
    const restartedCards = Array.from(
      new Map(
        sessionCards.map((card) => [card.id, card] as const),
      ).values(),
    );

    setSessionCards(restartedCards);
    setResultCards([]);
    setActionHistory([]);
    setCurrentIndex(0);
    setLearnedCount(0);
    setTotalCards(restartedCards.length);
    setSaveError(null);
    lastStudiedWasSaved.current = false;
  };

  const handleBackToDashboard = () => {
    router.push("/learning");
  };
  // ende ki generiert

  const handleRate = async (rating: NonNullable<Card["rating"]>) => {
    if (!currentCard || !token || isSaving) return;

    const { updatedCard, updatedStats } = rateCard(currentCard, rating, stats);

    try {
      setIsSaving(true);
      setSaveError(null);

      const savedProgress = await updateCardProgress(
        deckId,
        currentCard.id,
        {
          state: updatedCard.state,
          rating,
          due: updatedCard.due,
          totalReviews: updatedCard.totalReviews,
        },
        token,
      );
      const savedCard: Card = { ...updatedCard, ...savedProgress };

      if (!lastStudiedWasSaved.current) {
        lastStudiedWasSaved.current = true;

        try {
          const updatedDeck = await updateDeck(deckId,{lastStudied: new Date()},token,);
          setSelectedDeck(updatedDeck);} 
        catch {
          lastStudiedWasSaved.current = false;
          setSaveError(
            "The rating was saved, but last studied could not be updated.",
          );}
      }

      setStats(updatedStats);

      if (rating === "again") {
        setActionHistory((previous) => [...previous, "again"]);
        const updatedCards = [...sessionCards];
        updatedCards[currentIndex] = savedCard;
        updatedCards.push(savedCard);
        setSessionCards(updatedCards);} 
      else {
        setActionHistory((previous) => [...previous, "completed"]);
        const updatedCards = [...sessionCards];
        updatedCards[currentIndex] = savedCard;
        setSessionCards(updatedCards);
        setResultCards((prev) => [...prev, savedCard]);
        setLearnedCount((prev) => prev + 1);
      }

      setCurrentIndex((prev) => prev + 1);} 
      catch (caughtError) {
        setSaveError(caughtError instanceof Error? caughtError.message: "Learning progress could not be saved. Please try again later.",);} 
      finally {
        setIsSaving(false);}
  };

  if (authIsLoading || isLoading) {
    return <div>Learning cards are loading...</div>;
  }

  if (!token) {
    return <div>Please log in first.</div>;
  }

  if (loadError) {
    return <div>{loadError}</div>;
  }

  if (!selectedDeck) {
    return <div>Deck not found</div>;
  }
  
  if (!currentCard) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          {saveError && <p role="alert">{saveError}</p>}
          <LearningEndPage
            deckCards={resultCards}
            selectedDeck={selectedDeck}
            canRestart={sessionCards.length > 0}
            onRestart={handleRestart}
          />
        </main>
      </div>);}
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{selectedDeck.name} {learnedCount}/{totalCards}</h1>
        {saveError && <p role="alert">{saveError}</p>}
        <LearnCard key={currentCard.id + "-" + currentIndex} card={currentCard} currentIndex={currentIndex} isSaving={isSaving} onBack={handleBackToDashboard} onRate={handleRate} onPrev={handlePrev} onSkip={handleSkip} />
      </main>
    </div>
  );
}
