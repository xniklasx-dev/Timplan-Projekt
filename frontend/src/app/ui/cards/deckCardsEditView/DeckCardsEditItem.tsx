'use client';

import type { Ref } from 'react';

import styles from './DeckCardsEditItem.module.css';

import type { Card } from '@/app/lib/definitions';

type DeckCardsEditItemProps = {
  card: Card;
  index: number;
  isNewCard?: boolean;
  itemRef?: Ref<HTMLElement>;
  onChange: (
    cardId: string,
    field: 'front' | 'back' | 'hint' | 'extra',
    value: string
  ) => void;
};

export default function DeckCardsEditItem({
  card,
  index,
  isNewCard = false,
  itemRef,
  onChange,
}: DeckCardsEditItemProps) {
  return (
    <article
      ref={itemRef}
      className={`${styles.card} ${isNewCard ? styles.cardNew : ''}`}
    >
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.index}>
            {isNewCard
              ? 'New card'
              : `Card ${String(index + 1).padStart(2, '0')}`}
          </span>
          <h2 className={styles.title}>
            {isNewCard
              ? 'Add a new card'
              : card.front.trim() || `Untitled card ${index + 1}`}
          </h2>
        </div>

        <span className={styles.badge}>
          {isNewCard ? 'draft' : card.state}
        </span>
      </div>

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.label}>Question</span>
          <textarea
            className={styles.textareaLarge}
            value={card.front}
            onChange={(event) =>
              onChange(card.id, 'front', event.target.value)
            }
            placeholder="Enter the card question"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Answer</span>
          <textarea
            className={styles.textareaLarge}
            value={card.back}
            onChange={(event) =>
              onChange(card.id, 'back', event.target.value)
            }
            placeholder="Enter the card answer"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Hint</span>
          <textarea
            className={styles.textareaSmall}
            value={card.hint ?? ''}
            onChange={(event) =>
              onChange(card.id, 'hint', event.target.value)
            }
            placeholder="Optional hint"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Extra</span>
          <textarea
            className={styles.textareaSmall}
            value={card.extra ?? ''}
            onChange={(event) =>
              onChange(card.id, 'extra', event.target.value)
            }
            placeholder="Additional context or notes"
          />
        </label>
      </div>
    </article>
  );
}