"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import type { Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";

import {
  createDeck,
  getDecksWithStats,
  DeckWriteData,
} from "@/app/lib/deck-service";

import styles from "./page.module.css";

import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected deck error occurred";
}

export default function Decks() {
  const router = useRouter();
  const { user, isLoading: authIsLoading } = useAuth();

  const [isGridView, setIsGridView] = useState(false);

  const [decks, setDecks] = useState<Deck[]>([]);
  const [decksAreLoading, setDecksAreLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [deckEditorIsOpen, setDeckEditorIsOpen] = useState(false);

  useEffect(() => {
    const token = user?.token;

    if (!token) {
      setDecks([]);
      setDecksAreLoading(false);
      setLoadError(null);
      return;
    }

    let cancelled = false;

    async function loadDecks() {
      setDecksAreLoading(true);
      setLoadError(null);

      try {
        const loadedDecks = await getDecksWithStats(token!);

        if (!cancelled) {
          setDecks(loadedDecks);
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (!cancelled) {
          setDecksAreLoading(false);
        }
      }
    }

    void loadDecks();

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  function toggleView(event: ChangeEvent<HTMLInputElement>) {
    setIsGridView(event.target.checked);
  }

  function openAddDeckEditor() {
    setDeckEditorIsOpen(true);
  }

  function closeDeckEditor() {
    setDeckEditorIsOpen(false);
  }

  async function saveDeck(
    deckId: string | null,
    deckData: DeckWriteData,
  ): Promise<void> {
    const token = user?.token;

    if (!token) {
      throw new Error("You must be logged in to save a deck");
    }

    if (deckId !== null) {
      throw new Error("This page can only create new decks");
    }

    const createdDeck = await createDeck(deckData, token);

    setDecks((currentDecks) => [...currentDecks, createdDeck]);

    router.push(`/decks/${createdDeck.id}`);
  }

  const topLevelDecks = decks.filter((deck) => !deck.parentDeckId);

  return (
    <main className={styles.page}>
      <DeckHeader
        title="Deck Library"
        subtitle="Select a deck to start studying"
        isGridView={isGridView}
        onToggleViewAction={toggleView}
      />

      {authIsLoading ? (
        <p>Loading decks...</p>
      ) : !user?.token ? (
        <p role="alert">You must be logged in to load decks</p>
      ) : decksAreLoading ? (
        <p>Loading decks...</p>
      ) : loadError ? (
        <p role="alert">{loadError}</p>
      ) : (
        <DeckGrid
          decks={topLevelDecks}
          isGridView={isGridView}
          addItem={{
            label: "Add deck",
            onClickAction: openAddDeckEditor,
          }}
        />
      )}

      {deckEditorIsOpen && (
        <DeckEditor
          open
          deckId={null}
          decks={decks}
          onCloseAction={closeDeckEditor}
          onSaveAction={saveDeck}
        />
      )}
    </main>
  );
}
