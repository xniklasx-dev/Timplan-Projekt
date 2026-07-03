"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import type { Deck } from "@/app/lib/definitions";
import placeholderDecks from "@/app/lib/placeholder-decks.json";

import styles from "./page.module.css";

import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
};

type SaveDeckOptions = {
  isNew: boolean;
};

const STORAGE_KEY = "timplan-decks";
const startDecks: Deck[] = placeholderDecks as unknown as Deck[];

function loadDecks(): Deck[] {
  if (typeof window === "undefined") {
    return startDecks;
  }

  try {
    const savedDecks = window.localStorage.getItem(STORAGE_KEY);

    if (savedDecks === null) {
      return startDecks;
    }

    const parsedDecks = JSON.parse(savedDecks) as Deck[];

    if (!Array.isArray(parsedDecks) || parsedDecks.length === 0) {
      return startDecks;
    }

    return parsedDecks;
  } catch {
    return startDecks;
  }
}

export default function Decks() {
  const router = useRouter();

  const [isGridView, setIsGridView] = useState(false);
  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({ open: false, deckId: null });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  const toggleView = (event: ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  const editCard = (cardId: string) => {
    console.log("Edit card with ID: ", cardId);
  };

  const openAddDeckEditor = () => {
    setDeckEditorState({ open: true, deckId: null });
  };

  const closeDeckEditor = () => {
    setDeckEditorState({ open: false, deckId: null });
  };

  const saveDeck = (savedDeck: Deck, options: SaveDeckOptions) => {
    setDecks((currentDecks) => {
      if (options.isNew) {
        return [...currentDecks, savedDeck];
      }

      return currentDecks.map((deck) => {
        if (deck.id === savedDeck.id) {
          return savedDeck;
        }

        return deck;
      });
    });

    if (options.isNew) {
      router.push(`/decks/${savedDeck.id}`);
    }
  };

  const topLevelDecks = decks.filter((deck) => {
    if (!deck.parentDeckId) {
      return true;
    }

    return Number(deck.parentDeckId) <= 0;
  });

  let editorKey = "new-top-level";

  if (deckEditorState.deckId !== null) {
    editorKey = deckEditorState.deckId;
  }

  if (deckEditorState.open) {
    editorKey = editorKey + "-open";
  } else {
    editorKey = editorKey + "-closed";
  }

  return (
    <main className={styles.page}>
      <DeckHeader
        title="Deck Library"
        subtitle="Select a deck to start studying"
        isGridView={isGridView}
        onToggleViewAction={toggleView}
        dropdownButtonLabel="Test"
        dropdownButtons={[
          {
            label: "Add Deck",
            onClick: openAddDeckEditor,
          },
        ]}
      />

      <DeckGrid
        decks={topLevelDecks}
        isGridView={isGridView}
        onEditCardAction={editCard}
      />

      <DeckEditor
        key={editorKey}
        open={deckEditorState.open}
        deckId={deckEditorState.deckId}
        decks={decks}
        onCloseAction={closeDeckEditor}
        onSaveAction={saveDeck}
      />
    </main>
  );
}