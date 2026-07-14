"use client";

import type { Card, Deck } from "@/app/lib/definitions";

import DeckCard from "../deckCard/DeckCard";
import SingleCard from "../singleCard/SingleCard";
import AddItemCard from "../addItemCard/AddItemCard";

import styles from "@/app/(app)/decks/page.module.css";

type AddItemConfig = {
  label: string;
  onClickAction: () => void;
};

type DeckGridProps = {
  decks?: Deck[];
  cards?: Card[];
  isGridView: boolean;
  onEditCardAction: (cardId: string) => void;
  addItem?: AddItemConfig;
};

export default function DeckGrid({
  decks = [],
  cards = [],
  isGridView,
  onEditCardAction,
  addItem,
}: DeckGridProps) {
  if (decks.length === 0 && cards.length === 0 && !addItem) {
    return <p className={styles.subtitle}>No items found</p>;
  }

  const layoutClass = isGridView ? styles.deckGrid : styles.deckLine;

  return (
    <section className={layoutClass}>
      {addItem && (
        <AddItemCard
          isGridView={isGridView}
          label={addItem.label}
          onClickAction={addItem.onClickAction}
        />
      )}

      {decks.map((deck) => (
        <DeckCard key={`deck-${deck.id}`} deck={deck} isGridView={isGridView} />
      ))}

      {cards.map((card) => (
        <SingleCard
          key={`card-${card.id}`}
          card={card}
          isGridView={isGridView}
          onEditAction={onEditCardAction}
        />
      ))}
    </section>
  );
}
