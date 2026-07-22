"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import type { Card, Deck } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";

import {
  applyCardStatsToDeck,
  createDeck,
  deleteDeck as deleteDeckRequest,
  getDeckCardsWithProgress,
  getDecks,
  updateDeck,
  withChildDeckIds,
  type DeckWriteData,
} from "@/app/lib/deck-service";

/////////////////////////////////////////////////////////////
// FOLLOWING PART WAS CREATED USING AI, NOT FOR EVALUATION //
/////////////////////////////////////////////////////////////

import { deleteCard as deleteCardRequest } from "@/app/lib/card-service";

////////////////////
// END OF AI PART //
////////////////////

import styles from "../page.module.css";

import DeckNavigator from "@/app/ui/decks/deckNavigator/DeckNavigator";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

type DeckEditorMode = "create" | "edit" | null;

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function DeckPage() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading: authIsLoading } = useAuth();

  const deckId = params.id as string;
  const token = user?.token;

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [cardDeleteError, setCardDeleteError] = useState<string | null>(null);

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
      setIsLoading(false);
      return;
    }

    const authToken = token;
    let cancelled = false;

    async function loadDeckData() {
      setIsLoading(true);
      setLoadError(null);

      try {
        const loadedDecks = await getDecks(authToken);
        const visibleDecks = loadedDecks.filter(
          (deck) => deck.id === deckId || deck.parentDeckId === deckId,
        );

        const loadedDeckData = await Promise.all(
          visibleDecks.map(async (deck) => {
            const deckCards = await getDeckCardsWithProgress(
              deck.id,
              authToken,
            );

            return {
              deck: applyCardStatsToDeck(deck, deckCards),
              cards: deckCards,
            };
          }),
        );

        if (cancelled) {
          return;
        }

        const loadedDeckDataById = new Map(
          loadedDeckData.map((item) => [item.deck.id, item]),
        );

        setDecks(
          loadedDecks.map(
            (deck) => loadedDeckDataById.get(deck.id)?.deck ?? deck,
          ),
        );

        const currentDeckData = loadedDeckData.find(
          (item) => item.deck.id === deckId,
        );

        setCards(currentDeckData?.cards ?? []);
      } catch (error) {
        if (!cancelled) {
          setLoadError(getErrorMessage(error, "Failed to load deck data"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadDeckData();

    return () => {
      cancelled = true;
    };
  }, [token, deckId]);

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

  if (isLoading) {
    return <main className={styles.page}>Loading deck...</main>;
  }

  if (loadError) {
    return (
      <main className={styles.page}>
        <p role="alert">{loadError}</p>
      </main>
    );
  }

  const displayedDecks = decks.map((deck) =>
    deck.id === deckId ? applyCardStatsToDeck(deck, cards) : deck,
  );

  const currentDeck = displayedDecks.find((deck) => deck.id === deckId);

  if (!currentDeck) {
    return <main className={styles.page}>Deck not found</main>;
  }

  const authToken = token;
  const currentDeckId = currentDeck.id;

  const childDecks = displayedDecks.filter(
    (deck) => deck.parentDeckId === currentDeckId,
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

  function handleCardSaved(updatedCard: Card) {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === updatedCard.id ? updatedCard : card,
      ),
    );
  }

  function openExistingCardEditor(cardId: string) {
    setIsCardAddOpen(false);
    setActiveEditorCardId(cardId);
  }

  function closeCardEditor() {
    setActiveEditorCardId(null);
  }

  /////////////////////////////////////////////////////////////
  // FOLLOWING PART WAS CREATED USING AI, NOT FOR EVALUATION //
  /////////////////////////////////////////////////////////////

  async function deleteCard(cardId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this card?",
    );

    if (!confirmed) {
      return;
    }

    setCardDeleteError(null);

    try {
      await deleteCardRequest(currentDeckId, cardId, authToken);
      setCards((currentCards) =>
        currentCards.filter((card) => card.id !== cardId),
      );
    } catch (error) {
      setCardDeleteError(getErrorMessage(error, "Failed to delete card"));
    }
  }

  ////////////////////
  // END OF AI PART //
  ////////////////////

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
      ? await createDeck(deckData, authToken)
      : await updateDeck(savedDeckId, deckData, authToken);

    setDecks((currentDecks) => {
      const updatedDecks = isNewDeck
        ? [...currentDecks, persistedDeck]
        : currentDecks.map((deck) =>
            deck.id === persistedDeck.id
              ? {
                  ...persistedDeck,
                  cardIds: deck.cardIds,
                  childDeckIds: deck.childDeckIds,
                  totalCards: deck.totalCards,
                  newCards: deck.newCards,
                  dueToday: deck.dueToday,
                }
              : deck,
          );

      return withChildDeckIds(updatedDecks);
    });

    if (isNewDeck) {
      router.push(`/decks/${persistedDeck.id}`);
    }
  }

  async function deleteCurrentDeck() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deck?",
    );

    if (!confirmed) {
      return;
    }

    setDeleteError(null);

    try {
      await deleteDeckRequest(currentDeckId, authToken);
      router.push("/decks");
    } catch (error) {
      setDeleteError(getErrorMessage(error, "Failed to delete deck"));
    }
  }

  return (
    <main className={styles.page}>
      <DeckNavigator decks={displayedDecks} />

      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={toggleView}
        onAddCardAction={openNewCardEditor}
        editButtons={[
          {
            label: "Edit Cards",
            onClick: () => {
              router.push(`/cards/edit/${currentDeckId}`);
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
          router.push(`/learning/${currentDeckId}?mode=all`);
        }}
        startLessonDisabled={cards.length === 0}
      />

      {deleteError && <p role="alert">{deleteError}</p>}
      {cardDeleteError && <p role="alert">{cardDeleteError}</p>}  {/* THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION */}

      <DeckGrid
        decks={childDecks}
        cards={cards}
        isGridView={isGridView}
        onEditCardAction={openExistingCardEditor}
        onDeleteCardAction={(cardId) => {
          void deleteCard(cardId);
        }} // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION
        addItem={{
          label: "Add deck",
          onClickAction: openAddDeckEditor,
        }}
      />

      <SingleCardAdd
        open={isCardAddOpen}
        deckId={currentDeckId}
        token={authToken}
        onClose={closeCardAdd}
        onCreated={handleCardCreated}
      />

      <SingleCardEditor
        open={activeEditorCardId !== null}
        deckId={currentDeckId}
        cardId={activeEditorCardId ?? ""}
        token={authToken}
        onClose={closeCardEditor}
        onSaved={handleCardSaved}
      />

      {deckEditorMode !== null && (
        <DeckEditor
          deck={deckEditorMode === "edit" ? currentDeck : undefined}
          parentDeckId={deckEditorMode === "create" ? currentDeckId : undefined}
          parentDeckName={
            deckEditorMode === "create" ? currentDeck.name : undefined
          }
          onCloseAction={closeDeckEditor}
          onSaveAction={saveDeck}
        />
      )}
    </main>
  );
}
