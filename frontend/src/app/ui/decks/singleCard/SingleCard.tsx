"use client";

import type { Card } from "@/app/lib/definitions";
import EditButton from "@/app/ui/buttons/editButton/EditButton";
import styles from "../decks.module.css";

type SingleCardProps = {
  card: Card;
  onEditAction: (cardId: string) => void;
};

export default function SingleCard(props: SingleCardProps) {
  const card = props.card;
  const onEditAction = props.onEditAction;

  return (
    <div className={styles.deckCard}>
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
