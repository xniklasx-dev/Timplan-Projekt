"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Deck } from "@/app/lib/definitions";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import styles from "./page.module.css";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

const initialDecks: Deck[] = placeholderDecks as unknown as Deck[];
const DECKS_STORAGE_KEY = "timplan-decks";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
};

function loadDecks(): Deck[] {
  if (typeof window === "undefined") {
    return initialDecks;
  }

  try {
    const storedDecks = window.localStorage.getItem(DECKS_STORAGE_KEY);

    if (!storedDecks) {
      return initialDecks;
    }

    const parsedDecks = JSON.parse(storedDecks) as Deck[];

    return Array.isArray(parsedDecks) && parsedDecks.length > 0
      ? parsedDecks
      : initialDecks;
  } catch {
    return initialDecks;
  }
}

export default function Decks() {
  const router = useRouter();

  const [isGridView, setIsGridView] = useState(false);
  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({
    open: false,
    deckId: null,
  });

  useEffect(() => {
    window.localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  const handleEditCard = (cardId: string) => {
    console.log(`Edit card with ID: ${cardId}`);
  };

  const handleOpenAddDeckEditor = () => {
    setDeckEditorState({
      open: true,
      deckId: null,
    });
  };

  const handleCloseDeckEditor = () => {
    setDeckEditorState({
      open: false,
      deckId: null,
    });
  };

  const handleSaveDeck = (savedDeck: Deck, options: { isNew: boolean }) => {
    setDecks((currentDecks) => {
      if (options.isNew) {
        return [...currentDecks, savedDeck];
      }

      return currentDecks.map((deck) =>
        deck.id === savedDeck.id ? savedDeck : deck,
      );
    });

    if (options.isNew) {
      router.push(`/decks/${savedDeck.id}`);
    }
  };

  const topLevelDecks =
    decks.filter((deck) => !deck.parentDeckId || +deck.parentDeckId <= 0) ?? [];

  return (
    <main className={styles.page}>
      <DeckHeader
        title="Deck Library"
        subtitle="Select a deck to start studying"
        isGridView={isGridView}
        onToggleViewAction={handleToggleView}
        dropdownButtonLabel="Test"
        dropdownButtons={[
          {
            label: "Add Deck",
            onClick: handleOpenAddDeckEditor,
          },
        ]}
      />

      <DeckGrid
        decks={topLevelDecks}
        isGridView={isGridView}
        onEditCardAction={handleEditCard}
      />

      <DeckEditor
        key={`${
          deckEditorState.deckId ?? "new-top-level"
        }-${deckEditorState.open ? "open" : "closed"}`}
        open={deckEditorState.open}
        deckId={deckEditorState.deckId}
        decks={decks}
        onClose={handleCloseDeckEditor}
        onSaveAction={handleSaveDeck}
      />
    </main>
  );
}
