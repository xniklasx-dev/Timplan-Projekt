"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/app/lib/auth/AuthContext";
import {
  CardProgressApiError,
  getCardProgress,
} from "@/app/lib/card-progress-service";
import { getCardsByDeckId } from "@/app/lib/card-service";
import { getDecks } from "@/app/lib/deck-service";
import type { Card, Deck } from "@/app/lib/definitions";
import styles from "./dashboard_learning.module.css";

type CardCounts = {
  new: number;
  easy: number;
  good: number;
  hard: number;
};

async function addProgressToCard(card: Card, token: string): Promise<Card> {
  try {
    const progress = await getCardProgress(card.deckId, card.id, token);
    return { ...card, ...progress };
  } catch (error) {
    if (error instanceof CardProgressApiError && error.status === 404) {
      return card;
    }

    throw error;
  }
}

function countCards(cards: Card[]): CardCounts {
  return cards.reduce<CardCounts>(
    (counts, card) => {
      if (card.rating === null) counts.new += 1;
      else if (card.rating === "easy") counts.easy += 1;
      else if (card.rating === "good") counts.good += 1;
      else counts.hard += 1;

      return counts;
    },
    { new: 0, easy: 0, good: 0, hard: 0 },
  );
}

function percentage(value: number, total: number): string {
  return total === 0 ? "0%" : `${(value / total) * 100}%`;
}

export default function DashboardLearning() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authIsLoading) return;

    const token = user?.token;

    if (!token) {
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadDashboard() {
      try {
        setIsLoading(true);
        setError(null);

        const loadedDecks = await getDecks(authToken);
        const cardLists = await Promise.all(
          loadedDecks.map((deck) => getCardsByDeckId(deck.id, authToken)),
        );
        const cardsWithProgress = await Promise.all(
          cardLists.flat().map((card) => addProgressToCard(card, authToken)),
        );

        if (!cancelled) {
          setDecks(loadedDecks);
          setCards(cardsWithProgress);
        }
      } catch (caughtError) {
        if (!cancelled) {
          setError(
            caughtError instanceof Error
              ? caughtError.message
              : "Learning data could not be loaded.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void loadDashboard();

    return () => {
      cancelled = true;
    };
  }, [authIsLoading, user?.token]);

  if (authIsLoading || isLoading) {
    return <div>Learning data is loading...</div>;
  }

  if (!user?.token) {
    return <div>Please log in first.</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const displayedDecks = [...decks]
    .sort(
      (first, second) =>
        (second.lastStudied?.getTime() ?? 0) -
        (first.lastStudied?.getTime() ?? 0),
    )
    .slice(0, 5);

  return (
    <div className={styles.outer}>
      <div className={styles.recentlyStudied}>
        {displayedDecks.map((deck) => {
          const deckCards = cards.filter((card) => card.deckId === deck.id);
          const cardCounts = countCards(deckCards);
          const totalCards = deckCards.length;
          const dueToday = deckCards.filter(
            (card) => card.state === "new" || card.due <= new Date(),
          ).length;

          return (
            <div key={deck.id} className={styles.deck}>
              <h2>{deck.name}</h2>
              <div className={styles.line} />

              <div className={styles.difficultyWrapper}>
                <div className={styles.difficultyBar}>
                  <div
                    className={styles.new}
                    style={{ width: percentage(cardCounts.new, totalCards) }}
                  />
                  <div
                    className={styles.easy}
                    style={{ width: percentage(cardCounts.easy, totalCards) }}
                  />
                  <div
                    className={styles.medium}
                    style={{ width: percentage(cardCounts.good, totalCards) }}
                  />
                  <div
                    className={styles.hard}
                    style={{ width: percentage(cardCounts.hard, totalCards) }}
                  />
                </div>

                <div className={styles.tooltip}>
                  New: {cardCounts.new} <br />
                  Easy: {cardCounts.easy} <br />
                  Good: {cardCounts.good} <br />
                  Hard: {cardCounts.hard} <br />
                  Total: {totalCards}
                </div>
              </div>

              <p className={styles.lastLearned}>
                Last learned: {deck.lastStudied?.toLocaleDateString() ?? "Never"}
              </p>
              <p className={styles.cardsDueToday}>
                Cards due today: {dueToday}
              </p>
              <button
                className={
                  dueToday > 0
                    ? styles.learn_button_active
                    : styles.learn_button_inactive
                }
                disabled={dueToday === 0}
                onClick={() => router.push(`/learning/${deck.id}`)}
              >
                Learn
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
