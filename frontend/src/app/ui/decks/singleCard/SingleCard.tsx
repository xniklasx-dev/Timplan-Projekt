"use client";

import type { MouseEvent } from "react"; // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION
import type { Card } from "@/app/lib/definitions";
import EditButton from "@/app/ui/buttons/editButton/EditButton";
import buttonStyles from "@/app/ui/buttons/buttons.module.css"; // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION 
import styles from "../decks.module.css";

type SingleCardProps = {
  card: Card;
  onEditAction: (cardId: string) => void;
  onDeleteAction: (cardId: string) => void; // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION
};

export default function SingleCard(props: SingleCardProps) {
  const card = props.card;
  const onEditAction = props.onEditAction;

  /////////////////////////////////////////////////////////////
  // FOLLOWING PART WAS CREATED USING AI, NOT FOR EVALUATION //
  /////////////////////////////////////////////////////////////

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    props.onDeleteAction(card.id);
  }

  ////////////////////
  // END OF AI PART //
  ////////////////////

  return (
    <div className={styles.deckCard}>
      <div className={styles.cardActionWrapper}>
        <EditButton
          cardId={card.id}
          title="Edit Card"
          onEditAction={onEditAction}
        />

        {/*
          FOLLOWING PART WAS CREATED USING AI, NOT FOR EVALUATION
        */}

        <button
          type="button"
          className={[
            buttonStyles.base,
            buttonStyles.iconButton,
            buttonStyles.dangerIconButton,
          ].join(" ")}
          onClick={handleDelete}
          aria-label="Delete card"
          title="Delete card"
        >
          <span
            className={[styles.headerActionIcon, styles.deleteActionIcon].join(
              " ",
            )}
            aria-hidden="true"
          />
        </button>

        {/*
          END OF AI PART
        */}

      </div>

      <div className={[styles.deckTop, styles.cardContent].join(" ")}>
        <h2 className={styles.deckName}>{card.front}</h2>
        <p className={styles.deckDescription}>{card.back}</p>
      </div>
    </div>
  );
}
