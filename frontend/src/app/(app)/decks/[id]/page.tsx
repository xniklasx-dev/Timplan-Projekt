"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import placeholderCards from "@/app/lib/placeholder-cards.json";
import DeckNavigator from "@/app/ui/decks/deckNavigator/DeckNavigator";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

const startDecks: Deck[] = placeholderDecks as unknown as Deck[];
const startCards: Card[] = placeholderCards as unknown as Card[];

const NEW_CARD_ID = "c0";
const STORAGE_KEY = "timplan-decks";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
  parentDeckId?: string;
};

type SaveDeckOptions = {
  isNew: boolean;
}

function loadDecks(): Deck[] {
  if (typeof window === "undefined") {
    return startDecks;
  }

  try {
    const savedDecks = localStorage.getItem(STORAGE_KEY);

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

export default function Deck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [isGridView, setIsGridView] = useState(false);
  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(null);
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({
    open: false,
    deckId: null,
    parentDeckId: undefined,
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

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
    setActiveEditorCardId(NEW_CARD_ID);
  };

  const openExistingCardEditor = (cardId: string) => {
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

  const saveDeck = (savedDeck: Deck, options: SaveDeckOptions) => {
    setDecks((currentDecks) => {
      if (options.isNew) {
        const updatedDecks = currentDecks.map((deck) => {
          if (deck.id === currentDeck.id) {
            const oldChildDeckIds = deck.childDeckIds ?? [];
            let newChildDeckIds = oldChildDeckIds;

            if (!oldChildDeckIds.includes(savedDeck.id)) {
              newChildDeckIds = oldChildDeckIds.concat(savedDeck.id);
            }

            return {
              ...deck,
              childDeckIds: newChildDeckIds,
              updatedAt: new Date(),
              revision: deck.revision + 1,
            };
          }

          return deck;
        });

        return updatedDecks.concat(savedDeck);
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

  const deleteDeck = () => {
    const confirmed = window.confirm("Are you sure you want to delete this deck?");

    if (!confirmed) {
      return;
    }

    setDecks((currentDecks) => {
      return currentDecks.filter((deck) => deck.id !== currentDeck.id);
    });

    router.push("/decks");
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
            onClick: deleteDeck,
          },
        ]}
      />

      <DeckGrid
        decks={childDecks}
        cards={cards}
        isGridView={isGridView}
        onEditCardAction={openExistingCardEditor}
      />

      <SingleCardEditor
        key={activeEditorCardId ?? "closed"}
        open={activeEditorCardId !== null}
        cardId={activeEditorCardId}
        onClose={closeCardEditor}
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
