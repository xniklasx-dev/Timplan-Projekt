"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Card, Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";

import {
  applyCardStatsToDeck,
  createDeck,
  deleteDeck as deleteDeckRequest,
  getDecksWithStats,
  updateDeck,
  withChildDeckIds,
  DeckWriteData,
} from "@/app/lib/deck-service";

import { getCardsByDeckId } from "@/app/lib/card-service";

import styles from "../page.module.css";

import DeckNavigator from "@/app/ui/decks/deckNavigator/DeckNavigator";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

type DeckEditorMode = "create" | "edit" | null;

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading: authIsLoading } = useAuth();

  const deckId = params.id as string;
  const token = user?.token;

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  const [dataAreLoading, setDataAreLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [isGridView, setIsGridView] = useState(false);

  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(
    null,
  );

  const [isCardAddOpen, setIsCardAddOpen] = useState(false);

  const [deckEditorMode, setDeckEditorMode] = useState<DeckEditorMode>(null);

  useEffect(() => {
    if (!token) {
      setDecks([]);
      setCards([]);
      setLoadError(null);
      setDataAreLoading(false);
      return;
    }

    let cancelled = false;

    async function loadDeckData() {
      setDataAreLoading(true);
      setLoadError(null);

      try {
        const [loadedDecks, loadedCards] = await Promise.all([
          getDecksWithStats(token!),
          getCardsByDeckId(deckId, token!),
        ]);

        if (!cancelled) {
          setDecks(loadedDecks);
          setCards(loadedCards);
        }
      } catch (error) {
        if (!cancelled) {
          const message =
            error instanceof Error ? error.message : "Failed to load deck data";

          setLoadError(message);
        }
      } finally {
        if (!cancelled) {
          setDataAreLoading(false);
        }
      }
    }

    void loadDeckData();

    return () => {
      cancelled = true;
    };
  }, [token, deckId]);

  const decksWithUpdatetStats = withChildDeckIds(
    decks.map((deck) =>
      deck.id === deckId ? applyCardStatsToDeck(deck, cards) : deck,
    ),
  );

  if (authIsLoading) {
    return <main className={styles.page}>Loading deck...</main>;
  }

  if (!token) {
    return (
      <main className={styles.page}>
        <p role="alert">You must be logged in to load this deck</p>
      </main>
    );
  }

  if (dataAreLoading) {
    return <main className={styles.page}>Loading deck...</main>;
  }

  if (loadError) {
    return (
      <main className={styles.page}>
        <p role="alert">{loadError}</p>
      </main>
    );
  }

  const currentDeck = decksWithUpdatetStats.find((deck) => deck.id === deckId);

  if (!currentDeck) {
    return <main className={styles.page}>Deck not found</main>;
  }

  const childDecks = decksWithUpdatetStats.filter(
    (deck) => deck.parentDeckId === currentDeck.id,
  );

  function toggleView(event: ChangeEvent<HTMLInputElement>) {
    setIsGridView(event.target.checked);
  }

  function openNewCardEditor() {
    setActiveEditorCardId(null);
    setIsCardAddOpen(true);
  }

  function closeCardAdd() {
    setIsCardAddOpen(false);
  }

  function handleCardCreated(createdCard: Card) {
    setCards((currentCards) => {
      const cardAlreadyExists = currentCards.some(
        (card) => card.id === createdCard.id,
      );

      if (cardAlreadyExists) {
        return currentCards;
      }

      return [...currentCards, createdCard];
    });
  }

  function openExistingCardEditor(cardId: string) {
    setIsCardAddOpen(false);
    setActiveEditorCardId(cardId);
  }

  function closeCardEditor() {
    setActiveEditorCardId(null);
  }

  function openDeckEditor() {
    setDeckEditorMode("edit");
  }

  function openAddDeckEditor() {
    setDeckEditorMode("create");
  }

  function closeDeckEditor() {
    setDeckEditorMode(null);
  }

  async function saveDeck(
    savedDeckId: string | null,
    deckData: DeckWriteData,
  ): Promise<void> {
    const isNewDeck = savedDeckId === null;

    const persistedDeck = isNewDeck
      ? await createDeck(deckData, token!)
      : await updateDeck(savedDeckId, deckData, token!);

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
  }

  async function deleteCurrentDeck(): Promise<void> {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deck?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteDeckRequest(currentDeck!.id, token!);
      router.push("/decks");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete deck";

      setDeleteError(message);
    }
  }

  return (
    <main className={styles.page}>
      <DeckNavigator decks={decksWithUpdatetStats} />

      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={toggleView}
        onAddDeckAction={openAddDeckEditor}
        editButtons={[
          {
            label: "Edit Cards",
            onClick: () => {
              router.push(`/cards/edit/${currentDeck.id}`);
            },
          },
          {
            label: "Edit Deck",
            onClick: openDeckEditor,
          },
        ]}
        onDeleteDeckAction={() => {
          void deleteCurrentDeck();
        }}
        onStartLessonAction={() => {
          router.push(`/learning/${currentDeck.id}`);
        }}
        startLessonDisabled={cards.length === 0}
      />

      {deleteError && <p role="alert">{deleteError}</p>}

      <DeckGrid
        decks={childDecks}
        cards={cards}
        isGridView={isGridView}
        onEditCardAction={openExistingCardEditor}
        addItem={{
          label: "Add card",
          onClickAction: openNewCardEditor,
        }}
      />

      <SingleCardAdd
        open={isCardAddOpen}
        deckId={deckId}
        token={token}
        onClose={closeCardAdd}
        onCreated={handleCardCreated}
      />

      <SingleCardEditor
        key={activeEditorCardId ?? "closed"}
        open={activeEditorCardId !== null}
        deckId={deckId}
        cardId={activeEditorCardId ?? ""}
        token={token}
        onClose={closeCardEditor}
        onSaved={closeCardEditor}
      />

      {deckEditorMode !== null && (
        <DeckEditor
          open
          deckId={deckEditorMode === "edit" ? currentDeck.id : null}
          parentDeckId={
            deckEditorMode === "create" ? currentDeck.id : undefined
          }
          decks={decks}
          onCloseAction={closeDeckEditor}
          onSaveAction={saveDeck}
        />
      )}
    </main>
  );
}
