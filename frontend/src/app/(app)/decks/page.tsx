"use client";

import { useState } from "react";
import type { Deck } from "@/app/lib/definitions";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import styles from "./page.module.css";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";

const initialDecks: Deck[] = placeholderDecks as unknown as Deck[];

export default function Decks() {
  const [isGridView, setIsGridView] = useState(false);
  const [decks] = useState<Deck[] | null>(initialDecks);

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  const handleEditCard = (cardId: string) => {
    console.log(`Edit card with ID: ${cardId}`);
  };

  const topLevelDecks =
    decks?.filter((deck) => !deck.parentDeckId || +deck.parentDeckId <= 0) ??
    [];

  return (
    <main className={styles.page}>
      <DeckHeader
        title="Deck Library"
        subtitle="Select a deck to start studying"
        isGridView={isGridView}
        onToggleViewAction={handleToggleView}
        dropdownButtonLabel="Test"
        dropdownButtons={[
          { label: "Add Deck", onClick: () => console.log("Add Deck clicked") },
        ]}
      />

      <DeckGrid
        decks={topLevelDecks}
        isGridView={isGridView}
        onEditCardAction={handleEditCard}
      />
    </main>
  );
}
