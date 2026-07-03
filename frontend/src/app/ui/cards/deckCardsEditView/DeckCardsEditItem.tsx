"use client";

import { useState, type Ref } from "react";

import type { Card } from "@/app/lib/definitions";

import styles from "./DeckCardsEditItem.module.css";

export type CardEditField = "front" | "back" | "hint" | "tags";

type DeckCardsEditItemProps = {
  card: Card;
  index: number;
  isNewCard: boolean;
  canDelete: boolean;
  itemRef?: Ref<HTMLElement>;
  onChange: (cardId: string, field: CardEditField, value: string) => void;
  onDelete: () => void;
};

export default function DeckCardsEditItem({
  card,
  index,
  isNewCard,
  canDelete,
  itemRef,
  onChange,
  onDelete,
}: DeckCardsEditItemProps) {
  const title = card.front.trim() || (isNewCard ? "New card" : `Card ${index + 1}`);
  const [tagsInput, setTagsInput] = useState(card.tags.join(", "));

  return (
    <article ref={itemRef} className={`${styles.card} ${isNewCard ? styles.cardNew : ""}`}>
      <div className={styles.header}>
        <div className={styles.headerText}>
          <span className={styles.index}>{isNewCard ? "Draft" : `Card ${index + 1}`}</span>
          <h2 className={styles.title}>{title}</h2>
        </div>

        {canDelete && (
          <button type="button" className={styles.deleteButton} onClick={onDelete}>
            Remove
          </button>
        )}
      </div>

      <div className={styles.fields}>
        <label className={`${styles.field} ${styles.fieldLarge}`}>
          <span className={styles.label}>Question</span>
          <textarea
            className={styles.textareaLarge}
            value={card.front}
            onChange={(event) => onChange(card.id, "front", event.target.value)}
            placeholder="Enter the card question"
          />
        </label>

        <label className={`${styles.field} ${styles.fieldLarge}`}>
          <span className={styles.label}>Answer</span>
          <textarea
            className={styles.textareaLarge}
            value={card.back}
            onChange={(event) => onChange(card.id, "back", event.target.value)}
            placeholder="Enter the card answer"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Hint</span>
          <textarea
            className={styles.textareaSmall}
            value={card.hint ?? ""}
            onChange={(event) => onChange(card.id, "hint", event.target.value)}
            placeholder="Optional hint"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Tags</span>
          <textarea
            className={styles.textareaSmall}
            value={tagsInput}
            onChange={(event) => {
              setTagsInput(event.target.value);
              onChange(card.id, "tags", event.target.value);
            }}
            onBlur={() => setTagsInput(card.tags.join(", "))}
            placeholder="Separate tags with commas"
          />
        </label>
      </div>
    </article>
  );
}
