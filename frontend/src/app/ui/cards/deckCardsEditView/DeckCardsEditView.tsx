////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { Card, Deck } from "@/app/lib/definitions";
import { deleteCards, normalizeTags, upsertCards, type UpsertCardData } from "@/app/lib/card-service";
import ConfirmDialog from "@/app/ui/confirmDialog/ConfirmDialog";
import Toast from "@/app/ui/toast/Toast";

import DeckCardsEditItem, { type CardEditField } from "./DeckCardsEditItem";
import styles from "./DeckCardsEditView.module.css";

type DeckCardsEditViewProps = {
  deck: Deck;
  initialCards: Card[];
  token: string;
};

function normalizeCard(card: Card): Card {
  return {
    ...card,
    hint: card.hint ?? "",
  };
}

function createEmptyCard(deckId: string, index: number): Card {
  const now = new Date();

  return {
    id: `new-${deckId}-${Date.now()}-${index}`,
    deckId,
    front: "",
    back: "",
    hint: "",
    tags: [],
    state: "new",
    due: now,
    rating: null,
    totalReviews: 0,
    createdAt: now,
    updatedAt: now,
  };
}

function isNewCard(card: Card): boolean {
  return card.id.startsWith("new-");
}

function isCardEmpty(card: Card): boolean {
  return (
    card.front.trim() === "" &&
    card.back.trim() === "" &&
    (card.hint ?? "").trim() === "" &&
    card.tags.length === 0
  );
}

function cardKey(card: Card): string {
  return [
    card.id,
    card.front.trim(),
    card.back.trim(),
    (card.hint ?? "").trim(),
    card.tags.join(","),
  ].join("|");
}

function ensureTrailingEmptyCard(cards: Card[], deckId: string): Card[] {
  if (cards.length === 0) {
    return [createEmptyCard(deckId, 1)];
  }

  const lastCard = cards[cards.length - 1];

  if (lastCard && isCardEmpty(lastCard)) {
    return cards;
  }

  return [...cards, createEmptyCard(deckId, cards.length + 1)];
}

export default function DeckCardsEditView({ deck, initialCards, token }: DeckCardsEditViewProps) {
  const router = useRouter();
  const baseCards = initialCards.map(normalizeCard);

  const [savedCards, setSavedCards] = useState<Card[]>(baseCards);
  const [cards, setCards] = useState<Card[]>(() => ensureTrailingEmptyCard(baseCards, deck.id));
  const [deletedCardIds, setDeletedCardIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const newCardRef = useRef<HTMLElement | null>(null);

  const realCards = cards.filter((card) => !isCardEmpty(card));
  const savedKeys = savedCards.map(cardKey);
  const currentKeys = realCards.map(cardKey);
  const hasUnsavedChanges =
    deletedCardIds.length > 0 ||
    savedKeys.length !== currentKeys.length ||
    currentKeys.some((key, index) => key !== savedKeys[index]);

  const cardsWithHint = realCards.filter((card) => (card.hint ?? "").trim() !== "").length;
  const cardsWithTags = realCards.filter((card) => card.tags.length > 0).length;

  function changeCard(cardId: string, field: CardEditField, value: string) {
    setCards((currentCards) => {
      const updatedCards = currentCards.map((card) => {
        if (card.id !== cardId) {
          return card;
        }

        if (field === "tags") {
          return {
            ...card,
            tags: normalizeTags(value),
          };
        }

        return {
          ...card,
          [field]: value,
        };
      });

      return ensureTrailingEmptyCard(updatedCards, deck.id);
    });
  }

  function removeCard(card: Card) {
    if (isCardEmpty(card)) return;

    if (!isNewCard(card)) {
      setDeletedCardIds((currentIds) => {
        if (currentIds.includes(card.id)) {
          return currentIds;
        }

        return [...currentIds, card.id];
      });
    }

    setError(null);
    setCards((currentCards) => {
      const updatedCards = currentCards.filter((entry) => entry.id !== card.id);
      return ensureTrailingEmptyCard(updatedCards, deck.id);
    });
  }

  function validateCards(): boolean {
    const incompleteCard = realCards.find((card) => card.front.trim() === "" || card.back.trim() === "");

    if (incompleteCard) {
      setError("Every card needs a question and an answer before saving.");
      return false;
    }

    setError(null);
    return true;
  }

  async function handleSave() {
    if (!hasUnsavedChanges || isSaving || !validateCards()) return;

    if (!token) {
      setError("You must be logged in to save cards.");
      return;
    }

    const cardsToSave: UpsertCardData[] = realCards.map((card) => ({
      cardId: isNewCard(card) ? undefined : card.id,
      front: card.front,
      back: card.back,
      hint: card.hint,
      tags: card.tags,
    }));

    setIsSaving(true);

    try {
      if (deletedCardIds.length > 0) {
        await deleteCards(deck.id, deletedCardIds, token);
      }

      const saved = cardsToSave.length > 0 ? await upsertCards(deck.id, cardsToSave, token) : [];
      const normalizedSavedCards = saved.map(normalizeCard);

      setSavedCards(normalizedSavedCards);
      setDeletedCardIds([]);
      setCards(ensureTrailingEmptyCard(normalizedSavedCards, deck.id));
      setToastMessage("Cards saved successfully.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save cards.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleBackToDeckClick(event: React.MouseEvent<HTMLAnchorElement>) {
    if (!hasUnsavedChanges) return;

    event.preventDefault();
    setShowLeaveConfirm(true);
  }

  function leaveWithoutSaving() {
    setShowLeaveConfirm(false);
    router.push(`/decks/${deck.id}`);
  }

  function scrollToNewCard() {
    newCardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <section className={styles.wrapper}>
      <Toast title="Saved" message={toastMessage} onClose={() => setToastMessage(null)} />
      <ConfirmDialog
        open={showLeaveConfirm}
        title="Leave without saving?"
        message="Your bulk card changes are not saved yet. If you leave now, the editor changes will be lost."
        confirmLabel="Leave page"
        onConfirm={leaveWithoutSaving}
        onCancel={() => setShowLeaveConfirm(false)}
      />

      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <span className={styles.eyebrow}>Bulk card editor</span>
          <h1 className={styles.title}>{deck.name}</h1>

          <div className={styles.statsRow}>
            <span className={styles.statPill}>
              {realCards.length} {realCards.length === 1 ? "card" : "cards"}
            </span>
            <span className={styles.statPill}>{cardsWithHint} with hint</span>
            <span className={styles.statPill}>{cardsWithTags} with tags</span>
            {deletedCardIds.length > 0 && (
              <span className={`${styles.statPill} ${styles.statPillRemoved}`}>{deletedCardIds.length} removed</span>
            )}
          </div>
        </div>

        <div className={styles.actions}>
          <Link href={`/decks/${deck.id}`} className={styles.secondaryButton} onClick={handleBackToDeckClick}>
            Back
          </Link>

          <button type="button" className={styles.secondaryButton} onClick={scrollToNewCard}>
            New card
          </button>

          <button
            type="button"
            className={`${styles.primaryButton} ${hasUnsavedChanges ? styles.primaryButtonActive : ""}`}
            disabled={!hasUnsavedChanges || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {error && <p className={styles.errorText} role="alert">{error}</p>}

      <div className={styles.list}>
        {cards.map((card, index) => {
          const isTrailingEmptyCard = isCardEmpty(card) && index === cards.length - 1;

          return (
            <DeckCardsEditItem
              key={card.id}
              card={card}
              index={index}
              isNewCard={isTrailingEmptyCard || isNewCard(card)}
              canDelete={!isTrailingEmptyCard}
              itemRef={isTrailingEmptyCard ? newCardRef : undefined}
              onChange={changeCard}
              onDelete={() => removeCard(card)}
            />
          );
        })}
      </div>
    </section>
  );
}
