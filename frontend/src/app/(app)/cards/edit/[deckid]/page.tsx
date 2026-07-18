"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { Card, Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";
import { getCardsByDeckId } from "@/app/lib/card-service";
import decksData from "@/app/lib/placeholder-decks.json";
import DeckCardsEditView from "@/app/ui/cards/deckCardsEditView/DeckCardsEditView";

import styles from "./page.module.css";

const decks = decksData as unknown as Deck[];

// TODO: Remove this function once the backend is fully implemented and the decks are fetched from the backend instead of using placeholder data.
function createPageDeck(deckId: string, cards: Card[]): Deck {
  const now = new Date();

  return {
    id: deckId,
    name: "Backend deck",
    description: "Cards loaded from the backend.",
    tags: [],
    cardIds: cards.map((card) => card.id),
    totalCards: cards.length,
    newCards: 0,
    dueToday: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export default function EditDeckCardsPage() {
  const params = useParams<{ deckid: string }>();
  const { user, isLoading: authIsLoading } = useAuth();
  const deckId = params.deckid;

  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = user?.token;

    if (!token) {
      if (!authIsLoading) {
        setError("You must be logged in to load cards.");
        setIsLoading(false);
      }

      return;
    }

    const authToken = token;
    let ignoreResult = false;

    async function loadCards() {
      setIsLoading(true);
      setError(null);

      try {
        const cards = await getCardsByDeckId(deckId, authToken);

        if (!ignoreResult) {
          setDeckCards(cards);
        }
      } catch (error) {
        if (!ignoreResult) {
          setError(
            error instanceof Error ? error.message : "Could not load cards.",
          );
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    }

    void loadCards();

    return () => {
      ignoreResult = true;
    };
  }, [authIsLoading, deckId, user?.token]);

  const deck =
    decks.find((entry) => entry.id === deckId) ??
    createPageDeck(deckId, deckCards);

  if (isLoading) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Loading cards...</h1>
          <p className={styles.description}>
            Fetching this deck&apos;s cards from the backend.
          </p>
        </section>
      </main>
    );
  }

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Cards could not be loaded</h1>
          <p className={styles.description}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DeckCardsEditView
        key={deck.id}
        deck={deck}
        initialCards={deckCards}
        token={user?.token ?? ""}
      />
    </main>
  );
}
