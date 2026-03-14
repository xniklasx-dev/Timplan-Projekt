"use client";

import type { Card } from "@/app/lib/definitions";
import EditButton from "@/app/ui/buttons/editButton/EditButton";
import styles from "@/app/(app)/decks/page.module.css";

type SingleCardProps = {
  card: Card;
  isGridView: boolean;
  onEditAction: (cardId: string) => void;
  registerRefAction?: (el: HTMLDivElement | null) => void;
};

export default function SingleCard({
  card,
  isGridView,
  onEditAction,
  registerRefAction: registerRef,
}: SingleCardProps) {
  return (
    <div
      ref={registerRef}
      className={`${styles.deckCard} ${
        isGridView ? styles.deckCardGrid : styles.deckCardLine
      }`}
    >
      <div className={styles.startButtonWrapper}>
        <EditButton
          cardId={card.id}
          title="Edit Card"
          onEditAction={onEditAction}
        />
      </div>

      <div className={styles.deckTop}>
        <h2 className={styles.deckName}>{card.front}</h2>
        <p className={styles.deckDescription}>{card.back}</p>
      </div>
    </div>
  );
}
