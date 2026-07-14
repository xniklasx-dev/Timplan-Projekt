"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

import type { Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";

import {
  createDeck,
  getDecksWithStats,
  DeckWriteData,
  updateDeck,
  withChildDeckIds,
} from "@/app/lib/deck-service";

import styles from "./page.module.css";

import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
};

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
  const [completedDeckRequestKey, setCompletedDeckRequestKey] = useState<
    string | null
  >(null);
  const [deckRequestError, setDeckRequestError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({
    open: false,
    deckId: null,
  });

  useEffect(() => {
    const token = user?.token;

    if (!token) {
      return;
    }

    const requestKey = `${reloadCounter}:${token}`;

    let cancelled = false;

    getDecksWithStats(token)
      .then((loadedDecks) => {
        if (cancelled) {
          return;
        }

        setDecks(loadedDecks);
        setDeckRequestError(null);
        setCompletedDeckRequestKey(requestKey);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setDeckRequestError(getErrorMessage(error));

        setCompletedDeckRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.token, reloadCounter]);

  const currentDeckRequestKey = user?.token
    ? `${reloadCounter}:${user.token}`
    : null;

  const isUnauthenticated = !authIsLoading && !user?.token;

  const decksAreLoading =
    authIsLoading ||
    Boolean(
      currentDeckRequestKey &&
      completedDeckRequestKey !== currentDeckRequestKey,
    );

  const loadError = isUnauthenticated
    ? "You must be logged in to load decks"
    : completedDeckRequestKey === currentDeckRequestKey
      ? deckRequestError
      : null;

  const toggleView = (event: ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  const editCard = (cardId: string) => {
    console.log("Edit card with ID: ", cardId);
  };

  const openAddDeckEditor = () => {
    setActionError(null);

    setDeckEditorState({
      open: true,
      deckId: null,
    });
  };

  const closeDeckEditor = () => {
    setDeckEditorState({ open: false, deckId: null });
  };

  const saveDeck = async (
    savedDeckId: string | null,
    deckData: DeckWriteData,
  ): Promise<void> => {
    if (!user?.token) {
      const error = new Error("You must be logged in to save a deck");
      setActionError(error.message);
      throw error;
    }

    setActionError(null);

    try {
      const isNewDeck = savedDeckId === null;

      const persistedDeck = isNewDeck
        ? await createDeck(deckData, user.token)
        : await updateDeck(savedDeckId, deckData, user.token);

      setDecks((currentDecks) => {
        const updatedDecks = isNewDeck
          ? [...currentDecks, persistedDeck]
          : currentDecks.map((deck) =>
              deck.id === persistedDeck.id ? persistedDeck : deck,
            );

        return withChildDeckIds(updatedDecks);
      });

      if (isNewDeck) {
        router.push(`/decks/${persistedDeck.id}`);
      }
    } catch (error) {
      setActionError(getErrorMessage(error));
      throw error;
    }
  };

  const topLevelDecks = decks.filter((deck) => !deck.parentDeckId);

  return (
    <main className={styles.page}>
      <DeckHeader
        title="Deck Library"
        subtitle="Select a deck to start studying"
        isGridView={isGridView}
        onToggleViewAction={toggleView}
      />

      {actionError && <p role="alert">{actionError}</p>}

      {decksAreLoading ? (
        <p>Loading decks...</p>
      ) : loadError ? (
        <div role="alert">
          <p>{loadError}</p>

          <button
            type="button"
            onClick={() => setReloadCounter((current) => current + 1)}
          >
            Retry
          </button>
        </div>
      ) : (
        <DeckGrid
          decks={topLevelDecks}
          isGridView={isGridView}
          onEditCardAction={editCard}
          addItem={{
            label: "Add deck",
            onClickAction: openAddDeckEditor,
          }}
        />
      )}

      <DeckEditor
        open={deckEditorState.open}
        deckId={deckEditorState.deckId}
        decks={decks}
        onCloseAction={closeDeckEditor}
        onSaveAction={saveDeck}
      />
    </main>
  );
}
