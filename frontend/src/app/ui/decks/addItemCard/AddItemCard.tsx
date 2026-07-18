"use client";

import Image from "next/image";

import styles from "../decks.module.css";

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
      <Image
        src="/add_circle_icon.svg"
        alt=""
        width={64}
        height={64}
        className={styles.addItemIcon}
        aria-hidden="true"
      />
    </button>
  );
}
