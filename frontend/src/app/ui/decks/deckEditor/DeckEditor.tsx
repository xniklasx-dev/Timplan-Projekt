"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./deckEditor.module.css";

import type { Deck } from "@/app/lib/definitions";
import decksData from "@/app/lib/placeholder-decks.json";

type DeckEditorProps = {
  open: boolean;
  deckId: string | null;
  onClose: () => void;
};

const allDecks = decksData as unknown as Deck[];

function normalizeDeck(deck: Deck): Deck {
  return {
    ...deck,
    description: deck.description ?? "",
    color: deck.color ?? "",
    icon: deck.icon ?? "",
    childDeckIds: deck.childDeckIds ?? [],
  };
}

export default function DeckEditor({ open, deckId, onClose }: DeckEditorProps) {
  const baseDeck = useMemo(() => {
    if (!deckId) return null;
    return allDecks.find((deck) => deck.id === deckId) ?? null;
  }, [deckId]);

  const normalizedBaseDeck = useMemo(() => {
    return baseDeck ? normalizeDeck(baseDeck) : null;
  }, [baseDeck]);

  const [draft, setDraft] = useState<Deck | null>(
    normalizedBaseDeck ? { ...normalizedBaseDeck } : null,
  );

  const [tagsInput, setTagsInput] = useState(
    normalizedBaseDeck ? normalizedBaseDeck.tags.join(", ") : "",
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!normalizedBaseDeck || !draft) return false;

    const normalizedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    return (
      draft.name !== normalizedBaseDeck.name ||
      (draft.description ?? "") !== (normalizedBaseDeck.description ?? "") ||
      (draft.color ?? "") !== (normalizedBaseDeck.color ?? "") ||
      (draft.icon ?? "") !== (normalizedBaseDeck.icon ?? "") ||
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
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current,
    );
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
    if (!draft) return;

    const normalizedTags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    setDraft({
      ...draft,
      tags: normalizedTags,
    });
  }

  if (!open || !deckId) {
    return null;
  }

  if (!draft) {
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
              <span className={styles.eyebrow}>Deck Edit</span>
              <h2 id="deck-edit-title" className={styles.title}>
                Deck not found
              </h2>
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

          <p className={styles.notFoundText}>
            No deck was found for id: <strong>{deckId}</strong>
          </p>

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <span className={styles.eyebrow}>Deck Edit</span>

            <h2 id="deck-edit-title" className={styles.title}>
              {draft.name.trim() || "Untitled deck"}
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>Deck ID: {draft.id}</span>
              <span className={styles.metaPill}>Cards: {draft.totalCards}</span>
              <span className={styles.metaPill}>
                Due today: {draft.dueToday}
              </span>
              <span className={styles.metaPill}>
                Revision: {draft.revision}
              </span>
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
            disabled={!hasUnsavedChanges}
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
