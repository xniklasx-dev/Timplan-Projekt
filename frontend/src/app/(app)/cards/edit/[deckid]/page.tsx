"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import type { Card, Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";
import { getCardsByDeckId } from "@/app/lib/card-service";
import { getDeck } from "@/app/lib/deck-service";
import DeckCardsEditView from "@/app/ui/cards/deckCardsEditView/DeckCardsEditView";

import styles from "./page.module.css";

export default function EditDeckCardsPage() {
  const params = useParams<{ deckid: string }>();
  const { user, isLoading: authIsLoading } = useAuth();
  const deckId = params.deckid;

  const [deck, setDeck] = useState<Deck | null>(null);
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

    async function loadDeckAndCards() {
      setIsLoading(true);
      setError(null);

      try {
        const [loadedDeck, cards] = await Promise.all([
          getDeck(deckId, authToken),
          getCardsByDeckId(deckId, authToken),
        ]);

        if (!ignoreResult) {
          setDeck(loadedDeck);
          setDeckCards(cards);
        }
      } catch (error) {
        if (!ignoreResult) {
          setDeck(null);
          setDeckCards([]);
          setError(error instanceof Error ? error.message : "Could not load deck and cards.");
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    }

    void loadDeckAndCards();

    return () => {
      ignoreResult = true;
    };
  }, [authIsLoading, deckId, user?.token]);

  if (error) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Deck could not be loaded</h1>
          <p className={styles.description} role="alert">{error}</p>
        </section>
      </main>
    );
  }

  if (isLoading || !deck || deck.id !== deckId) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Loading deck...</h1>
          <p className={styles.description}>Fetching the deck and its cards from the backend.</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DeckCardsEditView key={deck.id} deck={deck} initialCards={deckCards} token={user?.token ?? ""} />
    </main>
  );
}
