'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';

import styles from './page.module.css';

import type { Card, Deck } from '@/app/lib/definitions';
import decksData from '@/app/lib/placeholder-decks.json';
import { getCardsByDeckId } from '@/app/lib/card-service';
import { useAuth } from '@/app/lib/auth/AuthContext';

import DeckCardsEditView from '@/app/ui/cards/deckCardsEditView/DeckCardsEditView';

const decks = decksData as unknown as Deck[];

export default function EditDeckCardsPage() {
  const params = useParams<{ deckid: string }>();
  const deckId = params.deckid;
  const { user } = useAuth();
  const [deckCards, setDeckCards] = useState<Card[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const deck = useMemo(
    () =>
      decks.find((entry) => entry.id === deckId) ?? {
        id: deckId,
        name: 'Backend deck',
        tags: [],
        cardIds: [],
        totalCards: 0,
        newCards: 0,
        learningCards: 0,
        reviewCards: 0,
        dueToday: 0,
        studiedToday: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        deleted: false,
        revision: 1,
      },
    [deckId]
  );

  useEffect(() => {
    const userId = user?.id ?? '';

    if (!userId) {
      setIsLoadingCards(false);
      setError('You need to be logged in before cards can be loaded.');
      return;
    }

    let ignore = false;

    async function loadCards() {
      setIsLoadingCards(true);
      setError(null);

      try {
        const cards = await getCardsByDeckId(deckId, userId);

        if (!ignore) {
          setDeckCards(cards);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : 'Could not load cards.'
          );
          setDeckCards([]);
        }
      } finally {
        if (!ignore) {
          setIsLoadingCards(false);
        }
      }
    }

    loadCards();

    return () => {
      ignore = true;
    };
  }, [deckId, user?.id]);

  if (isLoadingCards) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Loading cards</h1>
          <p className={styles.description}>
            Pulling the newest card data from the backend.
          </p>
        </section>
      </main>
    );
  }

  if (error || !user?.id) {
    return (
      <main className={styles.page}>
        <section className={styles.emptyState}>
          <h1 className={styles.title}>Cards unavailable</h1>
          <p className={styles.description}>{error}</p>
        </section>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <DeckCardsEditView deck={deck} initialCards={deckCards} userId={user.id} />
    </main>
  );
}
