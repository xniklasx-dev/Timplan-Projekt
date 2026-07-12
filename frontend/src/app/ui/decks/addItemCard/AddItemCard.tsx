"use client";

import styles from "@/app/(app)/decks/page.module.css";

type AddItemCardProps = {
  isGridView: boolean;
  label: string;
  onClickAction: () => void;
};

export default function AddItemCard({
  isGridView,
  label,
  onClickAction,
}: AddItemCardProps) {
  const className = [
    styles.deckCard,
    styles.addItemCard,
    isGridView ? styles.addItemCardGrid : styles.addItemCardLine,
  ].join(" ");

  return (
    <button
      type="button"
      className={className}
      onClick={onClickAction}
      aria-label={label}
      title={label}
    >
      <span className={styles.addItemPlus} aria-hidden="true">
        +
      </span>
    </button>
  );
}
