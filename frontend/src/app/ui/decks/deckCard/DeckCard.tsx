"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Deck } from "@/app/lib/definitions";
import type { MouseEvent } from "react";
import DropdownButton from "@/app/ui/buttons/dropdownButton/DropdownButton";
import styles from "../decks.module.css";

type DeckCardProps = {
  deck: Deck;
};

export default function DeckCard({ deck }: DeckCardProps) {
  const router = useRouter();

  const deckCardStyle = deck.color
    ? {
      borderColor: deck.color,
    }
    : undefined;

  const handleStudyMenuClick = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
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
      className={styles.deckCard}
      style={deckCardStyle}
    >
      <div
        className={styles.startButtonWrapper}
        onClick={handleStudyMenuClick}
      >
        <DropdownButton
          triggerIconSrc="/play_lesson_icon.svg"
          triggerAriaLabel="Study cards"
          items={[
            {
              label: "Study All Cards",
              onClick: () => {
                router.push(`/learning/${deck.id}?mode=all`);
              },
              disabled: deck.totalCards === 0,
            },
            {
              label: "Study Due Cards",
              onClick: () => {
                router.push(`/learning/${deck.id}?mode=due`);
              },
              disabled: deck.dueToday === 0,
            },
          ]}
          align="right"
        />
      </div>

      <div className={[styles.deckTop, styles.deckCardContent].join(" ")}> {/* THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION */}
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
