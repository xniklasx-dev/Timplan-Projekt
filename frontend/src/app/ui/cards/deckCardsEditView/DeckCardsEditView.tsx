'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import styles from './DeckCardsEditView.module.css';

import type { Card, Deck } from '@/app/lib/definitions';
import DeckCardsEditItem from './DeckCardsEditItem';

type DeckCardsEditViewProps = {
  deck: Deck;
  initialCards: Card[];
};

function normalizeCard(card: Card): Card {
  return {
    ...card,
    hint: card.hint ?? '',
    extra: card.extra ?? '',
  };
}

function createEmptyCard(deckId: string, index: number): Card {
  const now = new Date().toISOString();

  return {
    id: `new-${deckId}-${Date.now()}-${index}`,
    deckId,
    front: '',
    back: '',
    hint: '',
    extra: '',
    tags: [],
    media: [],
    state: 'new',
    due: now as unknown as Date,
    rating: 0,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: now as unknown as Date,
    updatedAt: now as unknown as Date,
    deleted: false,
    revision: 1,
  };
}

function isCardEmpty(card: Card): boolean {
  return (
    card.front.trim() === '' &&
    card.back.trim() === '' &&
    (card.hint ?? '').trim() === '' &&
    (card.extra ?? '').trim() === ''
  );
}

export default function DeckCardsEditView({
  deck,
  initialCards,
}: DeckCardsEditViewProps) {
  const normalizedInitialCards = useMemo(
    () => initialCards.map(normalizeCard),
    [initialCards]
  );

  const [localCards, setLocalCards] = useState<Card[]>(() => {
    const baseCards = normalizedInitialCards.map((card) => ({ ...card }));
    return [...baseCards, createEmptyCard(deck.id, baseCards.length + 1)];
  });

  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const newCardRef = useRef<HTMLElement | null>(null);

  const stats = useMemo(() => {
    const realCards = localCards.filter((card) => !isCardEmpty(card));

    const totalCards = realCards.length;
    const cardsWithHint = realCards.filter(
      (card) => (card.hint ?? '').trim().length > 0
    ).length;
    const cardsWithExtra = realCards.filter(
      (card) => (card.extra ?? '').trim().length > 0
    ).length;

    return {
      totalCards,
      cardsWithHint,
      cardsWithExtra,
    };
  }, [localCards]);

  const hasUnsavedChanges = useMemo(() => {
    const realCards = localCards.filter((card) => !isCardEmpty(card));

    if (realCards.length !== normalizedInitialCards.length) {
      return true;
    }

    return realCards.some((card, index) => {
      const initialCard = normalizedInitialCards[index];

      if (!initialCard) return true;

      return (
        card.front !== initialCard.front ||
        card.back !== initialCard.back ||
        (card.hint ?? '') !== (initialCard.hint ?? '') ||
        (card.extra ?? '') !== (initialCard.extra ?? '')
      );
    });
  }, [localCards, normalizedInitialCards]);

  function ensureTrailingEmptyCard(cards: Card[]) {
    if (cards.length === 0) {
      return [createEmptyCard(deck.id, 1)];
    }

    const lastCard = cards[cards.length - 1];

    if (lastCard && isCardEmpty(lastCard)) {
      return cards;
    }

    return [...cards, createEmptyCard(deck.id, cards.length + 1)];
  }

  function updateCardField(
    cardId: string,
    field: 'front' | 'back' | 'hint' | 'extra',
    value: string
  ) {
    setLocalCards((current) => {
      const updated = current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              [field]: value,
            }
          : card
      );

      return ensureTrailingEmptyCard(updated);
    });
  }

  function handleBackToDeckClick(
    event: React.MouseEvent<HTMLAnchorElement, MouseEvent>
  ) {
    if (!hasUnsavedChanges) {
      return;
    }

    const shouldLeave = window.confirm(
      'You have unsaved changes. Do you really want to leave this page?'
    );

    if (!shouldLeave) {
      event.preventDefault();
    }
  }

  function scrollToTop() {
    scrollAreaRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }

  function scrollToNewCard() {
    newCardRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <h1 className={styles.title}>Edit {deck.name} Cards</h1>

          <div className={styles.statsRow}>
            <span className={styles.statPill}>
              {stats.totalCards} {stats.totalCards === 1 ? 'card' : 'cards'}
            </span>
            <span className={styles.statPill}>
              {stats.cardsWithHint} with hint
            </span>
            <span className={styles.statPill}>
              {stats.cardsWithExtra} with extra
            </span>
          </div>
        </div>

        <div className={styles.actions}>
          <Link
            href={`/decks/${deck.id}`}
            className={styles.secondaryButton}
            onClick={handleBackToDeckClick}
          >
            Back to deck
          </Link>

          <button
            type="button"
            className={`${styles.primaryButton} ${
              hasUnsavedChanges ? styles.primaryButtonActive : ''
            }`}
            aria-label="Save changes"
            disabled={!hasUnsavedChanges}
          >
            Save changes
          </button>
        </div>
      </div>

      <div ref={scrollAreaRef} className={styles.scrollArea}>
        <div className={styles.list}>
          {localCards.map((card, index) => {
            const isNewCard =
              isCardEmpty(card) && index === localCards.length - 1;

            return (
              <DeckCardsEditItem
                key={card.id}
                card={card}
                index={index}
                isNewCard={isNewCard}
                itemRef={isNewCard ? newCardRef : undefined}
                onChange={updateCardField}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.floatingNav}>
        <button
          type="button"
          className={styles.floatingButton}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ↑
        </button>

        <button
          type="button"
          className={`${styles.floatingButton} ${styles.floatingButtonAccent}`}
          onClick={scrollToNewCard}
          aria-label="Jump to new card"
          title="Jump to new card"
        >
          ↓
        </button>
      </div>
    </section>
  );
}