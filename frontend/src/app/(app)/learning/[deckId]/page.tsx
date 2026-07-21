"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

import { useAuth } from "@/app/lib/auth/AuthContext";
import {CardProgressApiError,createCardProgress,getCardProgress,updateCardProgress} from "@/app/lib/card-progress-service";
import { getCardsByDeckId } from "@/app/lib/card-service";
import { getDeck, updateDeck } from "@/app/lib/deck-service";
import dateData from "@/app/lib/placeholder-dateData.json";
import LearningEndPage from "@/app/ui/learning_cards/learning_end_page";
import LearnCard from "../../../ui/learning_cards/learning_cards";
import type { Card, Deck, StatsMap } from "../../../lib/definitions";
import { rateCard } from "../../../lib/learning-service";
import styles from "./page.module.css";

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

export default function Learning() {
  const params = useParams();
  const deckId = String(params.deckId);
  const { user, isLoading: authIsLoading } = useAuth();
  const token = user?.token;

  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [sessionCards, setSessionCards] = useState<Card[]>([]);
  const [resultCards, setResultCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [totalCards, setTotalCards] = useState(0);
  const [stats, setStats] = useState<StatsMap>(dateData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(null);

        const [deck, cards] = await Promise.all([
          getDeck(deckId, authToken),
          getCardsByDeckId(deckId, authToken),
        ]);
        const cardsWithProgress = await Promise.all(
          cards.map((card) => loadOrCreateProgress(deckId, card, authToken)),
        );
        const dueCards = cardsWithProgress.filter(
          (card) => card.state === "new" || card.due <= new Date(),
        );

        if (!cancelled) {
          setSelectedDeck(deck);
          setSessionCards(dueCards);
          setTotalCards(dueCards.length);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
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
  }, [authIsLoading, deckId, token]);

  useEffect(() => {
    if (!token || !selectedDeck || currentCard || resultCards.length === 0 || lastStudiedWasSaved.current) return;

    lastStudiedWasSaved.current = true;

    void updateDeck(deckId, { lastStudied: new Date() }, token).catch((caughtError) => {
      lastStudiedWasSaved.current = false;
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Last studied could not be saved. Please try again later.",
      );
    });
  }, [currentCard, deckId, resultCards.length, selectedDeck, token]);

  const changeIndex = (index: number) => {
    if (index >= 0 && index < sessionCards.length) {
      setCurrentIndex(index);
    }};

  const handlePrev = () => {
    setLearnedCount((prev) => prev - 1);
    changeIndex(currentIndex - 1);
  }

  const handleSkip = () => {
    setLearnedCount((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };
  
  const handleRate = async (rating: NonNullable<Card["rating"]>) => {
    if (!currentCard || !token || isSaving) return;

    const { updatedCard, updatedStats } = rateCard(currentCard, rating, stats);

    try {
      setIsSaving(true);
      setError(null);

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

      setStats(updatedStats);

      if (rating === "again") {
        const updatedCards = [...sessionCards];
        updatedCards[currentIndex] = savedCard;
        updatedCards.push(savedCard);
        setSessionCards(updatedCards);
      } else {
        const updatedCards = [...sessionCards];
        updatedCards[currentIndex] = savedCard;
        setSessionCards(updatedCards);
        setResultCards((prev) => [...prev, savedCard]);
        setLearnedCount((prev) => prev + 1);
      }

      setCurrentIndex((prev) => prev + 1);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Card progress could not be saved. Please try again later.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (authIsLoading || isLoading) {
    return <div>Learning cards are loading...</div>;
  }

  if (!token) {
    return <div>Please log in first.</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!selectedDeck) {
    return <div>Deck not found</div>;
  }
  
  if (!currentCard) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <LearningEndPage deckCards={resultCards} selectedDeck={selectedDeck} />
        </main>
      </div>);}
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{selectedDeck.name} {learnedCount}/{totalCards}</h1>
        <LearnCard key={currentCard.id + "-" + currentIndex} card={currentCard} currentIndex={currentIndex} isSaving={isSaving} onRate={handleRate} onPrev={handlePrev} onSkip={handleSkip} />
      </main>
    </div>
  );
}
