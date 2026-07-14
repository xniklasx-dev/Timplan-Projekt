"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deck } from "@/app/lib/definitions";
import type { MouseEvent } from "react";
import StartLessonButton from "@/app/ui/buttons/startLessonButton/StartLessonButton";
import styles from "@/app/(app)/decks/page.module.css";

type DeckCardProps = {
  deck: Deck;
  isGridView: boolean;
};

export default function DeckCard({ deck, isGridView }: DeckCardProps) {
  const router = useRouter();

  const hasCards = deck.totalCards > 0;

  let cardClassName = styles.deckCard;

  if (isGridView) {
    cardClassName += " " + styles.deckCardGrid;
  } else {
    cardClassName += " " + styles.deckCardLine;
  }

  const deckCardStyle = deck.color
    ? {
        borderColor: deck.color,
      }
    : undefined;

  let startButtonTitle = "No cards in this deck yet";

  if (hasCards) {
    startButtonTitle = "StartStudying";
  }

  const handleStartLesson = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!hasCards) {
      return;
    }

    router.push("/learning/" + deck.id);
  };

  let showDescription = false;
  if (deck.description) {
    showDescription = true;
  }

  let showSubdecks = false;
  if (deck.childDeckIds && deck.childDeckIds.length > 0) {
    showSubdecks = true;
  }

  return (
    <Link
      href={`/decks/${deck.id}`}
      className={cardClassName}
      style={deckCardStyle}
    >
      <div className={styles.startButtonWrapper}>
        <StartLessonButton
          title={startButtonTitle}
          disabled={!hasCards}
          onClick={handleStartLesson}
        />
      </div>

      <div className={styles.deckTop}>
        <h2 className={styles.deckName}>{deck.name}</h2>

        {showDescription && (
          <p className={styles.deckDescription}>{deck.description}</p>
        )}
      </div>

      <div className={styles.deckStats}>
        <div className={styles.stat}>
          <span className={styles.statValue}>{deck.totalCards}</span>
          <span className={styles.statLabel}>Cards</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>{deck.dueToday}</span>
          <span className={styles.statLabel}>Due</span>
        </div>

        <div className={styles.stat}>
          <span className={styles.statValue}>{deck.newCards}</span>
          <span className={styles.statLabel}>New</span>
        </div>

        {showSubdecks && (
          <div className={styles.stat}>
            <span className={styles.statValue}>
              {deck.childDeckIds?.length}
            </span>
            <span className={styles.statLabel}>Subdecks</span>
          </div>
        )}
      </div>
    </Link>
  );
}
