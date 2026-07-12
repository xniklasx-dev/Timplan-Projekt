"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import { useAuth } from "@/app/lib/auth/AuthContext";
import {
  applyCardStatsToDeck,
  createDeck,
  deleteDeck as deleteDeckRequest,
  getDecks,
  toDeckWriteData,
  updateDeck,
  withChildDeckIds,
} from "@/app/lib/deck-service";
import DeckNavigator from "@/app/ui/decks/deckNavigator/DeckNavigator";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";
import { getCardsByDeckId } from "@/app/lib/card-service";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
  parentDeckId?: string;
};

type SaveDeckOptions = {
  isNew: boolean;
};

export default function Deck() {
  const params = useParams();
  const router = useRouter();

  const { user, isLoading: authIsLoading } = useAuth();

  const deckId = params.id as string;

  const [decks, setDecks] = useState<Deck[]>([]);
  const [cards, setCards] = useState<Card[]>([]);

  const decksWithCurrentStats = useMemo(() => {
    const updatedDecks = decks.map((deck) =>
      deck.id === deckId ? applyCardStatsToDeck(deck, cards) : deck,
    );

    return withChildDeckIds(updatedDecks);
  }, [decks, cards, deckId]);

  const [completedDataRequestKey, setCompletedDataRequestKey] = useState<
    string | null
  >(null);

  const [deckRequestError, setDeckRequestError] = useState<string | null>(null);

  const [deckActionError, setDeckActionError] = useState<string | null>(null);

  const [isGridView, setIsGridView] = useState(false);
  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(
    null,
  );
  const [isCardAddOpen, setIsCardAddOpen] = useState(false);
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({
    open: false,
    deckId: null,
    parentDeckId: undefined,
  });

  useEffect(() => {
    const token = user?.token;

    if (!token) {
      return;
    }

    const requestKey = `${token}:${deckId}`;
    let cancelled = false;

    Promise.all([getDecks(token), getCardsByDeckId(deckId, token)])
      .then(([loadedDecks, loadedCards]) => {
        if (cancelled) {
          return;
        }

        setDecks(loadedDecks);
        setCards(loadedCards);
        setDeckRequestError(null);
        setCompletedDataRequestKey(requestKey);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setDeckRequestError(
          error instanceof Error ? error.message : "Failed to load deck data",
        );

        setCompletedDataRequestKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.token, deckId]);

  const currentDataRequestKey = user?.token ? `${user.token}:${deckId}` : null;

  const isUnauthenticated = !authIsLoading && !user?.token;

  const decksAreLoading =
    authIsLoading ||
    Boolean(
      currentDataRequestKey &&
      completedDataRequestKey !== currentDataRequestKey,
    );

  const deckLoadError = isUnauthenticated
    ? "You must be logged in to load this deck"
    : completedDataRequestKey === currentDataRequestKey
      ? deckRequestError
      : null;

  if (authIsLoading || decksAreLoading) {
    return <main className={styles.page}>Loading deck...</main>;
  }

  if (deckLoadError) {
    return (
      <main className={styles.page}>
        <p role="alert">{deckLoadError}</p>
      </main>
    );
  }

  const currentDeck = decksWithCurrentStats.find((deck) => deck.id === deckId);

  if (!currentDeck) {
    return <main className={styles.page}>Deck not found</main>;
  }

  const childDecks: Deck[] = [];
  if (currentDeck.childDeckIds) {
    for (const childDeckId of currentDeck.childDeckIds) {
      const foundDeck = decksWithCurrentStats.find(
        (deck) => deck.id === childDeckId,
      );

      if (foundDeck) {
        childDecks.push(foundDeck);
      }
    }
  }

  const toggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  const openNewCardEditor = () => {
    setActiveEditorCardId(null);
    setIsCardAddOpen(true);
  };

  const closeCardAdd = () => {
    setIsCardAddOpen(false);
  };

  const handleCardCreated = (createdCard: Card) => {
    setCards((currentCards) => {
      if (currentCards.some((card) => card.id === createdCard.id)) {
        return currentCards;
      }

      return [...currentCards, createdCard];
    });
  };

  const openExistingCardEditor = (cardId: string) => {
    setIsCardAddOpen(false);
    setActiveEditorCardId(cardId);
  };

  const closeCardEditor = () => {
    setActiveEditorCardId(null);
  };

  const openDeckEditor = () => {
    setDeckEditorState({
      open: true,
      deckId: currentDeck.id,
      parentDeckId: currentDeck.parentDeckId,
    });
  };

  const openAddDeckEditor = () => {
    setDeckEditorState({
      open: true,
      deckId: null,
      parentDeckId: currentDeck.id,
    });
  };

  const closeDeckEditor = () => {
    setDeckEditorState({
      open: false,
      deckId: null,
      parentDeckId: undefined,
    });
  };

  const saveDeck = async (
    savedDeck: Deck,
    options: SaveDeckOptions,
  ): Promise<void> => {
    if (!user?.token) {
      const error = new Error("You must be logged in to save a deck");

      setDeckActionError(error.message);

      throw error;
    }

    setDeckActionError(null);

    try {
      const requestData = toDeckWriteData(savedDeck);

      const persistedDeck = options.isNew
        ? await createDeck(requestData, user.token)
        : await updateDeck(savedDeck.id, requestData, user.token);

      setDecks((currentDecks) => {
        const updatedDecks = options.isNew
          ? [...currentDecks, persistedDeck]
          : currentDecks.map((deck) =>
              deck.id === persistedDeck.id ? persistedDeck : deck,
            );

        return withChildDeckIds(updatedDecks);
      });

      if (options.isNew) {
        router.push(`/decks/${persistedDeck.id}`);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save deck";

      setDeckActionError(message);

      throw error;
    }
  };

  const deleteCurrentDeck = async (): Promise<void> => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this deck?",
    );

    if (!confirmed) {
      return;
    }

    if (!user?.token) {
      setDeckActionError("You must be logged in to delete a deck");
      return;
    }

    setDeckActionError(null);

    try {
      await deleteDeckRequest(currentDeck.id, user.token);

      router.push("/decks");
    } catch (error) {
      setDeckActionError(
        error instanceof Error ? error.message : "Failed to delete deck",
      );
    }
  };

  let deckEditorKey = "";

  if (deckEditorState.deckId !== null) {
    deckEditorKey = deckEditorState.deckId;
  } else if (deckEditorState.parentDeckId) {
    deckEditorKey = `new-${deckEditorState.parentDeckId}`;
  } else {
    deckEditorKey = "new-root";
  }

  if (deckEditorState.open) {
    deckEditorKey += "-open";
  } else {
    deckEditorKey += "-closed";
  }

  return (
    <main className={styles.page}>
      <DeckNavigator decks={decks} />

      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={toggleView}
        onAddDeckAction={openAddDeckEditor}
        editButtons={[
          {
            label: "Edit Cards",
            onClick: () => router.push(`/cards/edit/${currentDeck.id}`),
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

      {deckActionError && <p role="alert">{deckActionError}</p>}

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
        token={user?.token ?? ""}
        onClose={closeCardAdd}
        onCreated={handleCardCreated}
      />

      <SingleCardEditor
        key={activeEditorCardId ?? "closed"}
        open={activeEditorCardId !== null}
        deckId={deckId}
        cardId={activeEditorCardId ?? ""}
        token={user?.token ?? ""}
        onClose={closeCardEditor}
        onSaved={closeCardEditor}
      />

      <DeckEditor
        key={deckEditorKey}
        open={deckEditorState.open}
        deckId={deckEditorState.deckId}
        parentDeckId={deckEditorState.parentDeckId}
        decks={decks}
        onCloseAction={closeDeckEditor}
        onSaveAction={saveDeck}
      />
    </main>
  );
}
