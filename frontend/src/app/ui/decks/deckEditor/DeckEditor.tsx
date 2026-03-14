"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./deckEditor.module.css";

import type { Deck } from "@/app/lib/definitions";

type DeckEditorProps = {
  open: boolean;
  deckId: string | null;
  parentDeckId?: string;
  decks: Deck[];
  onClose: () => void;
  onSaveAction: (deck: Deck, options: { isNew: boolean }) => void;
};

function createDeckId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `deck-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeDeck(deck: Deck): Deck {
  return {
    ...deck,
    description: deck.description ?? "",
    color: deck.color ?? "",
    icon: deck.icon ?? "",
    parentDeckId: deck.parentDeckId ?? undefined,
    childDeckIds: deck.childDeckIds ?? [],
    cardIds: deck.cardIds ?? [],
  };
}

function createEmptyDeck(parentDeckId?: string): Deck {
  const now = new Date();

  return {
    id: createDeckId(),
    name: "",
    description: "",
    tags: [],
    cardIds: [],
    color: "",
    icon: "",
    parentDeckId,
    childDeckIds: [],
    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    dueToday: 0,
    studiedToday: 0,
    lastStudied: undefined,
    createdAt: now,
    updatedAt: now,
    deleted: false,
    revision: 1,
  };
}

export default function DeckEditor({
  open,
  deckId,
  parentDeckId,
  decks,
  onClose,
  onSaveAction,
}: DeckEditorProps) {
  const baseDeck = useMemo(() => {
    if (!deckId) return null;
    return decks.find((deck) => deck.id === deckId) ?? null;
  }, [deckId, decks]);

  const isNewDeck = !baseDeck;

  const normalizedBaseDeck = useMemo(() => {
    if (baseDeck) {
      return normalizeDeck(baseDeck);
    }

    return createEmptyDeck(parentDeckId);
  }, [baseDeck, parentDeckId]);

  const [draft, setDraft] = useState<Deck>({ ...normalizedBaseDeck });
  const [tagsInput, setTagsInput] = useState(
    normalizedBaseDeck.tags.join(", "),
  );

  const hasUnsavedChanges = useMemo(() => {
    const normalizedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return (
      draft.name !== normalizedBaseDeck.name ||
      (draft.description ?? "") !== (normalizedBaseDeck.description ?? "") ||
      (draft.color ?? "") !== (normalizedBaseDeck.color ?? "") ||
      (draft.icon ?? "") !== (normalizedBaseDeck.icon ?? "") ||
      (draft.parentDeckId ?? "") !== (normalizedBaseDeck.parentDeckId ?? "") ||
      normalizedTags.join("|") !== normalizedBaseDeck.tags.join("|")
    );
  }, [normalizedBaseDeck, draft, tagsInput]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (hasUnsavedChanges) {
          const shouldClose = window.confirm(
            "You have unsaved changes. Do you really want to close this editor?",
          );

          if (!shouldClose) {
            return;
          }
        }

        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, hasUnsavedChanges]);

  function updateField(
    field: "name" | "description" | "color" | "icon",
    value: string,
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleClose() {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        "You have unsaved changes. Do you really want to close this editor?",
      );

      if (!shouldClose) {
        return;
      }
    }

    onClose();
  }

  function handleOverlayClick() {
    handleClose();
  }

  function handleSave() {
    const normalizedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const now = new Date();

    const nextDeck: Deck = {
      ...draft,
      name: draft.name.trim(),
      description: (draft.description ?? "").trim(),
      color: (draft.color ?? "").trim(),
      icon: (draft.icon ?? "").trim(),
      tags: normalizedTags,
      parentDeckId: draft.parentDeckId ?? parentDeckId ?? undefined,
      updatedAt: now,
      createdAt: isNewDeck ? now : draft.createdAt,
      revision: isNewDeck ? 1 : draft.revision + 1,
    };

    onSaveAction(nextDeck, { isNew: isNewDeck });
    onClose();
  }

  if (!open) {
    return null;
  }

  const deckTypeLabel = isNewDeck
    ? draft.parentDeckId
      ? "New child deck"
      : "New top-level deck"
    : `Deck ID: ${draft.id}`;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="deck-edit-title"
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.eyebrow}>
              {isNewDeck ? "Create Deck" : "Deck Edit"}
            </span>

            <h2 id="deck-edit-title" className={styles.title}>
              {draft.name.trim() ||
                (isNewDeck ? "Untitled new deck" : "Untitled deck")}
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>{deckTypeLabel}</span>

              {!isNewDeck && (
                <>
                  <span className={styles.metaPill}>
                    Cards: {draft.totalCards}
                  </span>
                  <span className={styles.metaPill}>
                    Due today: {draft.dueToday}
                  </span>
                  <span className={styles.metaPill}>
                    Revision: {draft.revision}
                  </span>
                </>
              )}

              {draft.parentDeckId && (
                <span className={styles.metaPill}>
                  Parent: {draft.parentDeckId}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.fieldGrid}>
            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Deck name</span>
              <input
                className={styles.input}
                value={draft.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="Enter the deck name"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Description</span>
              <textarea
                className={styles.textareaLarge}
                value={draft.description ?? ""}
                onChange={(event) =>
                  updateField("description", event.target.value)
                }
                placeholder="Optional deck description"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Color</span>
              <input
                className={styles.input}
                value={draft.color ?? ""}
                onChange={(event) => updateField("color", event.target.value)}
                placeholder="e.g. #5a0f2e"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Icon</span>
              <input
                className={styles.input}
                value={draft.icon ?? ""}
                onChange={(event) => updateField("icon", event.target.value)}
                placeholder="e.g. book-open"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldFull}`}>
              <span className={styles.label}>Tags</span>
              <textarea
                className={styles.textareaSmall}
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="Separate tags with commas"
              />
            </label>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleClose}
          >
            Close
          </button>

          <button
            type="button"
            className={`${styles.primaryButton} ${
              hasUnsavedChanges ? styles.primaryButtonActive : ""
            }`}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || !draft.name.trim()}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
