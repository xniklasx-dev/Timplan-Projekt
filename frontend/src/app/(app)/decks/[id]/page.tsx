"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import { useAuth } from "@/app/lib/auth/AuthContext";
import {
  createDeck,
  deleteDeck as deleteDeckRequest,
  getDecks,
  toDeckWriteData,
  updateDeck,
  withChildDeckIds,
} from "@/app/lib/deck-service";
import placeholderCards from "@/app/lib/placeholder-cards.json";
import DeckNavigator from "@/app/ui/decks/deckNavigator/DeckNavigator";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

const startCards: Card[] = placeholderCards as unknown as Card[];

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

  const [loadedDecksForToken, setLoadedDecksForToken] = useState<string | null>(
    null,
  );

  const [deckRequestError, setDeckRequestError] = useState<string | null>(null);

  const [deckActionError, setDeckActionError] = useState<string | null>(null);

  const [isGridView, setIsGridView] = useState(false);
  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(
    null,
  );
  const [isCardAddOpen, setIsCardAddOpen] = useState(false);
  const [createdCards, setCreatedCards] = useState<Card[]>([]);
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

    let cancelled = false;

    getDecks(token)
      .then((loadedDecks) => {
        if (cancelled) {
          return;
        }

        setDecks(loadedDecks);
        setDeckRequestError(null);
        setLoadedDecksForToken(token);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setDeckRequestError(
          error instanceof Error ? error.message : "Failed to load decks",
        );

        setLoadedDecksForToken(token);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const isUnauthenticated = !authIsLoading && !user?.token;

  const decksAreLoading =
    authIsLoading || Boolean(user?.token && loadedDecksForToken !== user.token);

  const deckLoadError = isUnauthenticated
    ? "You must be logged in to load this deck"
    : loadedDecksForToken === user?.token
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

  const currentDeck = decks.find((deck) => deck.id === deckId);

  if (!currentDeck) {
    return <main className={styles.page}>Deck not found</main>;
  }

  const childDecks: Deck[] = [];
  if (currentDeck.childDeckIds) {
    for (const childDeckId of currentDeck.childDeckIds) {
      const foundDeck = decks.find((deck) => deck.id === childDeckId);

      if (foundDeck) {
        childDecks.push(foundDeck);
      }
    }
  }

  const cards: Card[] = [];
  if (currentDeck.cardIds) {
    for (const cardId of currentDeck.cardIds) {
      const foundCard = startCards.find((card) => card.id === cardId);

      if (foundCard) {
        cards.push(foundCard);
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
    setCreatedCards((currentCards) => {
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

  const displayedCards = [
    ...cards,
    ...createdCards.filter(
      (createdCard) =>
        createdCard.deckId === deckId &&
        !cards.some((card) => card.id === createdCard.id),
    ),
  ];

  return (
    <main className={styles.page}>
      <DeckNavigator decks={decks} />

      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={toggleView}
        dropdownButtonLabel="Test"
        dropdownButtons={[
          {
            label: "Edit Cards",
            onClick: () => router.push(`/cards/edit/${currentDeck.id}`),
          },
          {
            label: "Add Card",
            onClick: openNewCardEditor,
          },
          {
            label: "Edit Deck",
            onClick: openDeckEditor,
          },
          {
            label: "Add Deck",
            onClick: openAddDeckEditor,
          },
          {
            label: "Delete Deck",
            onClick: () => {
              void deleteCurrentDeck();
            },
          },
        ]}
      />

      {deckActionError && <p role="alert">{deckActionError}</p>}

      <DeckGrid
        decks={childDecks}
        cards={displayedCards}
        isGridView={isGridView}
        onEditCardAction={openExistingCardEditor}
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
