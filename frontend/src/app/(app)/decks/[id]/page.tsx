"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import placeholderCards from "@/app/lib/placeholder-cards.json";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";

const decksData: Deck[] = placeholderDecks as unknown as Deck[];
const cardsData: Card[] = placeholderCards as unknown as Card[];

export default function Deck() {
  const params = useParams();
  const deckId = params.id as string;
  const [isGridView, setIsGridView] = useState(false);

  const currentDeck = decksData.find((d) => d.id === deckId);
  if (!currentDeck) return <main className={styles.page}>Deck not found</main>;

  const childDecks: Deck[] =
    currentDeck.childDeckIds
      ?.map((id) => decksData.find((d) => d.id === id))
      .filter((d): d is Deck => !!d) ?? [];

  const cards: Card[] =
    currentDeck.cardIds
      ?.map((id) => cardsData.find((c) => c.id === id))
      .filter((c): c is Card => !!c) ?? [];

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  return (
    <main className={styles.page}>
      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={handleToggleView}
        dropdownButtons={[
          { label: "Edit Deck", onClick: () => console.log("Edit Deck clicked") },
          { label: "Add Card", onClick: () => console.log("Add Card clicked") },
          { label: "Share Deck", onClick: () => console.log("Share Deck clicked") },
        ]}
      />

      <DeckGrid decks={childDecks} cards={cards} isGridView={isGridView} />
    </main>
  );
}