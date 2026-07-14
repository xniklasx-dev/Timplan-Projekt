"use client";

import type { Card } from "@/app/lib/definitions";
import EditButton from "@/app/ui/buttons/editButton/EditButton";
import styles from "@/app/(app)/decks/page.module.css";

type SingleCardProps = {
  card: Card;
  isGridView: boolean;
  onEditAction: (cardId: string) => void;
};

export default function SingleCard(props: SingleCardProps) {
  const card = props.card;
  const isGridView = props.isGridView;
  const onEditAction = props.onEditAction;

  let cardClassName = styles.deckCard;

  if (isGridView) {
    cardClassName += " " + styles.deckCardGrid;
  } else {
    cardClassName += " " + styles.deckCardLine;
  }

  return (
    <div className={cardClassName}>
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
