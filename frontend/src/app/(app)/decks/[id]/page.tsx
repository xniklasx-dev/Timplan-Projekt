"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { Deck, Card } from "@/app/lib/definitions";
import styles from "../page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import placeholderCards from "@/app/lib/placeholder-cards.json";
import DeckHeader from "@/app/ui/decks/deckHeader/DeckHeader";
import DeckGrid from "@/app/ui/decks/deckGrid/DeckGrid";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import DeckEditor from "@/app/ui/decks/deckEditor/DeckEditor";

const initialDecksData: Deck[] = placeholderDecks as unknown as Deck[];
const cardsData: Card[] = placeholderCards as unknown as Card[];

const NEW_CARD_ID = "c0";
const DECKS_STORAGE_KEY = "timplan-decks";

type DeckEditorState = {
  open: boolean;
  deckId: string | null;
  parentDeckId?: string;
};

function loadDecks(): Deck[] {
  if (typeof window === "undefined") {
    return initialDecksData;
  }

  try {
    const storedDecks = window.localStorage.getItem(DECKS_STORAGE_KEY);

    if (!storedDecks) {
      return initialDecksData;
    }

    const parsedDecks = JSON.parse(storedDecks) as Deck[];

    return Array.isArray(parsedDecks) && parsedDecks.length > 0
      ? parsedDecks
      : initialDecksData;
  } catch {
    return initialDecksData;
  }
}

export default function Deck() {
  const params = useParams();
  const router = useRouter();
  const deckId = params.id as string;

  const [decks, setDecks] = useState<Deck[]>(loadDecks);
  const [isGridView, setIsGridView] = useState(false);
  const [activeEditorCardId, setActiveEditorCardId] = useState<string | null>(
    null,
  );
  const [deckEditorState, setDeckEditorState] = useState<DeckEditorState>({
    open: false,
    deckId: null,
    parentDeckId: undefined,
  });

  useEffect(() => {
    window.localStorage.setItem(DECKS_STORAGE_KEY, JSON.stringify(decks));
  }, [decks]);

  const currentDeck = decks.find((d) => d.id === deckId);
  if (!currentDeck) return <main className={styles.page}>Deck not found</main>;

  const childDecks: Deck[] =
    currentDeck.childDeckIds
      ?.map((id) => decks.find((d) => d.id === id))
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

  const handleOpenDeckEditor = () => {
    setDeckEditorState({
      open: true,
      deckId: currentDeck.id,
      parentDeckId: currentDeck.parentDeckId,
    });
  };

  const handleOpenAddDeckEditor = () => {
    setDeckEditorState({
      open: true,
      deckId: null,
      parentDeckId: currentDeck.id,
    });
  };

  const handleCloseDeckEditor = () => {
    setDeckEditorState({
      open: false,
      deckId: null,
      parentDeckId: undefined,
    });
  };

  const handleSaveDeck = (savedDeck: Deck, options: { isNew: boolean }) => {
    setDecks((currentDecks) => {
      if (options.isNew) {
        const updatedParentDecks = currentDecks.map((deck) => {
          if (deck.id !== currentDeck.id) {
            return deck;
          }

          const currentChildDeckIds = deck.childDeckIds ?? [];

          return {
            ...deck,
            childDeckIds: currentChildDeckIds.includes(savedDeck.id)
              ? currentChildDeckIds
              : [...currentChildDeckIds, savedDeck.id],
            updatedAt: new Date(),
            revision: deck.revision + 1,
          };
        });

        return [...updatedParentDecks, savedDeck];
      }

      return currentDecks.map((deck) =>
        deck.id === savedDeck.id ? savedDeck : deck,
      );
    });

    if (options.isNew) {
      router.push(`/decks/${savedDeck.id}`);
    }
  };

  return (
    <main className={styles.page}>
      <DeckHeader
        title={currentDeck.name}
        subtitle={currentDeck.description}
        isGridView={isGridView}
        onToggleViewAction={handleToggleView}
        dropdownButtonLabel="Actions"
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
            onClick: handleOpenDeckEditor,
          },
          {
            label: "Add Deck",
            onClick: handleOpenAddDeckEditor,
          },
          {
            label: "Delete Deck",
            onClick: () => {
              if (
                window.confirm("Are you sure you want to delete this deck?")
              ) {
                setDecks((currentDecks) =>
                  currentDecks.filter((deck) => deck.id !== currentDeck.id),
                );
                router.push("/decks");
              }
            },
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

      <DeckEditor
        key={`${deckEditorState.deckId ?? `new-${deckEditorState.parentDeckId ?? "root"}`}-${
          deckEditorState.open ? "open" : "closed"
        }`}
        open={deckEditorState.open}
        deckId={deckEditorState.deckId}
        parentDeckId={deckEditorState.parentDeckId}
        decks={decks}
        onClose={handleCloseDeckEditor}
        onSaveAction={handleSaveDeck}
      />
    </main>
  );
}
