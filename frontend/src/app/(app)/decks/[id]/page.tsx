"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import placeholderCards from "@/app/lib/placeholder-cards.json";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

const decksData: Deck[] = placeholderDecks as unknown as Deck[];
const cardsData: Card[] = placeholderCards as unknown as Card[];

const NEW_CARD_ID = "c0";

export default function Deck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [isGridView, setIsGridView] = useState(false);
  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(
    null,
  );

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

  const handleOpenNewCardEditor = () => {
    setActiveEditorCardId(NEW_CARD_ID);
  };

  const handleOpenExistingCardEditor = (cardId: string) => {
    setActiveEditorCardId(cardId);
  };

  const handleCloseEditor = () => {
    setActiveEditorCardId(null);
  };

  return (
    <main className={styles.page}>
      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={handleToggleView}
        dropdownButtonLabel="Test"
        dropdownButtons={[
          {
            label: "Edit Cards",
            onClick: () => router.push(`/cards/edit/${currentDeck.id}`),
          },
          {
            label: "Add Card",
            onClick: handleOpenNewCardEditor,
          },
          {
            label: "Edit Deck",
            onClick: () => console.log("Edit Deck clicked"),
          },
          {
            label: "Add Deck",
            onClick: () => console.log("Add Deck clicked"),
          },
        ]}
      />

      <DeckGrid
        decks={childDecks}
        cards={cards}
        isGridView={isGridView}
        onEditCardAction={handleOpenExistingCardEditor}
      />

      <SingleCardEditor
        key={activeEditorCardId ?? "closed"}
        open={activeEditorCardId !== null}
        cardId={activeEditorCardId}
        onClose={handleCloseEditor}
      />
    </main>
  );
}
