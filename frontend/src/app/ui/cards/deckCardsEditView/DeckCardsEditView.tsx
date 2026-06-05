'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import styles from './DeckCardsEditView.module.css';

import type { Card, Deck } from '@/app/lib/definitions';
import { normalizeTags, toCardDraft, upsertCards } from '@/app/lib/card-service';
import DeckCardsEditItem from './DeckCardsEditItem';

type DeckCardsEditViewProps = {
  deck: Deck;
  initialCards: Card[];
  userId: string;
};

function normalizeCard(card: Card): Card {
  return {
    ...card,
    hint: card.hint ?? '',
    tags: normalizeTags(card.tags),
  };
}

function createEmptyCard(deckId: string, index: number): Card {
  const now = new Date();

  return {
    id: `new-${deckId}-${Date.now()}-${index}`,
    deckId,
    front: '',
    back: '',
    hint: '',
    tags: [],
    state: 'new',
    due: now,
    rating: null,
    totalReviews: 0,
    correctReviews: 0,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    revision: 1,
  };
}

function isCardEmpty(card: Card): boolean {
  return (
    card.front.trim() === '' &&
    card.back.trim() === '' &&
    (card.hint ?? '').trim() === '' &&
    card.tags.length === 0
  );
}

export default function DeckCardsEditView({
  deck,
  initialCards,
  userId,
}: DeckCardsEditViewProps) {
  const normalizedInitialCards = useMemo(
    () => initialCards.map(normalizeCard),
    [initialCards]
  );

  const [localCards, setLocalCards] = useState<Card[]>(() => {
    const baseCards = normalizedInitialCards.map((card) => ({ ...card }));
    return [...baseCards, createEmptyCard(deck.id, baseCards.length + 1)];
  });
  const [savedCards, setSavedCards] = useState<Card[]>(normalizedInitialCards);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    const realCards = localCards.filter((card) => !isCardEmpty(card));

    const totalCards = realCards.length;
    const cardsWithHint = realCards.filter(
      (card) => (card.hint ?? '').trim().length > 0
    ).length;
    const uniqueTags = new Set(realCards.flatMap((card) => card.tags));

    return {
      totalCards,
      cardsWithHint,
      totalTags: uniqueTags.size,
    };
  }, [localCards]);

  const hasUnsavedChanges = useMemo(() => {
    const realCards = localCards.filter((card) => !isCardEmpty(card));

    if (realCards.length !== savedCards.length) {
      return true;
    }

    return realCards.some((card, index) => {
      const initialCard = savedCards[index];

      if (!initialCard) return true;

      return (
        card.front !== initialCard.front ||
        card.back !== initialCard.back ||
        (card.hint ?? '') !== (initialCard.hint ?? '') ||
        card.tags.join('\u0000') !== initialCard.tags.join('\u0000')
      );
    });
  }, [localCards, savedCards]);

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
    field: 'front' | 'back' | 'hint' | 'tags',
    value: string
  ) {
    setLocalCards((current) => {
      const updated = current.map((card) =>
        card.id === cardId
          ? {
              ...card,
              [field]: field === 'tags' ? normalizeTags(value) : value,
            }
          : card
      );

      return ensureTrailingEmptyCard(updated);
    });
  }

  async function handleSave() {
    const realCards = localCards.filter((card) => !isCardEmpty(card));

    if (realCards.some((card) => card.front.trim() === '' || card.back.trim() === '')) {
      setError('Every saved card needs a question and an answer.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = realCards.map((card) => ({
        ...(card.id.startsWith('new-') ? {} : { id: card.id }),
        ...toCardDraft(card),
      }));
      const saved = (await upsertCards(deck.id, payload, userId)).map(normalizeCard);

      setSavedCards(saved);
      setLocalCards(ensureTrailingEmptyCard(saved.map((card) => ({ ...card }))));
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save cards.');
    } finally {
      setIsSaving(false);
    }
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
              {stats.totalTags} tags
            </span>
          </div>
          {error && <p className={styles.errorText}>{error}</p>}
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
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      <div className={styles.scrollArea}>
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
                onChange={updateCardField}
              />
            );
          })}
        </div>
      </div>

    </section>
  );
}
