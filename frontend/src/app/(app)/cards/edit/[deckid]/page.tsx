'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';

import styles from './page.module.css';

import type { Card, Deck } from '@/app/lib/definitions';
import decksData from '@/app/lib/placeholder-decks.json';
import cardsData from '@/app/lib/placeholder-cards.json';

import DeckCardsEditView from '@/app/ui/cards/deckCardsEditView/DeckCardsEditView';

const decks = decksData as unknown as Deck[];
const cards = cardsData as unknown as Card[];

export default function EditDeckCardsPage() {
  const params = useParams<{ deckid: string }>();
  const deckId = params.deckid;

  const deck = useMemo(
    () => decks.find((entry) => entry.id === deckId),
    [deckId]
  );

  const deckCards = useMemo(
    () =>
      cards.filter(
        (card) => card.deckId === deckId && !card.deleted
      ),
    [deckId]
  );

  if (!deck) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Deck not found</h1>
          <p className={styles.description}>
            No deck exists for this route parameter.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DeckCardsEditView deck={deck} initialCards={deckCards} />
    </main>
  );
}