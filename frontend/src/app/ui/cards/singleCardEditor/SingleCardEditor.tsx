"use client";

import { useEffect, useState } from "react";

import type { Card } from "@/app/lib/definitions";
import { getCardById, normalizeTags, toCardFormat, updateCard } from "@/app/lib/card-service";
import ConfirmDialog from "@/app/ui/confirmDialog/ConfirmDialog";
import Toast from "@/app/ui/toast/Toast";

import styles from "./SingleCardEditor.module.css";

type SingleCardEditorProps = {
  open: boolean;
  deckId: string;
  cardId: string;
  userId: string;
  onClose: () => void;
  onSaved?: (updatedCard: Card) => void;
};

type EditableField = "front" | "back" | "hint";

export default function SingleCardEditor({ open, deckId, cardId, userId, onClose, onSaved }: SingleCardEditorProps) {
  const [originalCard, setOriginalCard] = useState<Card | null>(null);
  const [draftCard, setDraftCard] = useState<Card | null>(null);
  const [tagsInput, setTagsInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const hasChanges = cardWasChanged(originalCard, draftCard);

  useEffect(() => {
    if (!open || !deckId || !cardId) return;

    if (!userId) {
      setError("User not authenticated");
      setOriginalCard(null);
      setDraftCard(null);
      setIsLoading(false);
      return;
    }

    let ignoreResult = false;

    async function loadCard() {
      setIsLoading(true);
      setError(null);
      setOriginalCard(null);
      setDraftCard(null);

      try {
        const card = await getCardById(deckId, cardId, userId);

        if (ignoreResult) return;

        setOriginalCard(card);
        setDraftCard(card);
        setTagsInput(card.tags.join(", "));
      } catch (error) {
        if (!ignoreResult) {
          setError(error instanceof Error ? error.message : "Could not fetch card");
        }
      } finally {
        if (!ignoreResult) {
          setIsLoading(false);
        }
      }
    }

    void loadCard();

    return () => {
      ignoreResult = true;
    };
  }, [open, deckId, cardId, userId]);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (showCloseConfirm) return;

      if (hasChanges) {
        setShowCloseConfirm(true);
        return;
      }

      onClose();
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [open, hasChanges, onClose, showCloseConfirm]);

  function handleClose() {
    if (hasChanges) {
      setShowCloseConfirm(true);
      return;
    }

    onClose();
  }

  function closeWithoutSaving() {
    setShowCloseConfirm(false);
    onClose();
  }

  function changeField(field: EditableField, value: string) {
    setDraftCard((card) => {
      if (!card) return card;

      return {
        ...card,
        [field]: value,
      };
    });
  }

  function changeTags(value: string) {
    setTagsInput(value);

    setDraftCard((card) => {
      if (!card) return card;

      return {
        ...card,
        tags: normalizeTags(value),
      };
    });
  }

  async function saveCard() {
    if (!draftCard || !userId || !hasChanges || isSaving) return;

    if (draftCard.front.trim() === "" || draftCard.back.trim() === "") {
      setError("Front and back fields are required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const savedCard = await updateCard(deckId, cardId, toCardFormat(draftCard), userId);

      setOriginalCard(savedCard);
      setDraftCard(savedCard);
      setTagsInput(savedCard.tags.join(", "));
      onSaved?.(savedCard);
      setToastMessage("Card saved successfully.");
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not save card");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open && !toastMessage) return null;

  if (isLoading || !draftCard) {
    return (
      <>
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        <ConfirmDialog
          open={showCloseConfirm}
          title="Close without saving?"
          message="This card has unsaved changes. If you close now, your edits will be lost."
          confirmLabel="Close anyway"
          onConfirm={closeWithoutSaving}
          onCancel={() => setShowCloseConfirm(false)}
        />

        <div className={styles.overlay}>
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.header}>
              <div className={styles.headerMain}>
                <span className={styles.eyebrow}>Card Edit</span>
                <h2 className={styles.title}>{isLoading ? "Loading card..." : "Card unavailable"}</h2>
              </div>

              <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
                ×
              </button>
            </div>

            <div className={styles.content}>
              <p className={styles.notFoundText}>
                {isLoading ? (
                  "Loading card data..."
                ) : error ? (
                  error
                ) : (
                  <>
                    No card was found for id: <strong>{cardId}</strong>
                  </>
                )}
              </p>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.secondaryButton} onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      <ConfirmDialog
        open={showCloseConfirm}
        title="Close without saving?"
        message="This card has unsaved changes. If you close now, your edits will be lost."
        confirmLabel="Close anyway"
        onConfirm={closeWithoutSaving}
        onCancel={() => setShowCloseConfirm(false)}
      />

      {open && deckId && cardId && (
        <div className={styles.overlay}>
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="single-card-edit-title"
          >
            <div className={styles.header}>
              <div className={styles.headerMain}>
                <span className={styles.eyebrow}>Card Edit</span>

                <h2 id="single-card-edit-title" className={styles.title}>
                  {draftCard.front.trim() || "Untitled card"}
                </h2>
              </div>

              <button type="button" className={styles.closeButton} onClick={handleClose} aria-label="Close modal">
                ×
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.fieldGrid}>
                <label className={`${styles.field} ${styles.fieldLarge}`}>
                  <span className={styles.label}>Question</span>
                  <textarea
                    className={styles.textareaLarge}
                    value={draftCard.front}
                    onChange={(event) => changeField("front", event.target.value)}
                    placeholder="Enter the card question"
                  />
                </label>

                <label className={`${styles.field} ${styles.fieldLarge}`}>
                  <span className={styles.label}>Answer</span>
                  <textarea
                    className={styles.textareaLarge}
                    value={draftCard.back}
                    onChange={(event) => changeField("back", event.target.value)}
                    placeholder="Enter the card answer"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Hint</span>
                  <textarea
                    className={styles.textareaSmall}
                    value={draftCard.hint ?? ""}
                    onChange={(event) => changeField("hint", event.target.value)}
                    placeholder="Optional hint"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Tags</span>
                  <div className={styles.tagControl}>
                    <textarea
                      className={styles.textareaSmall}
                      value={tagsInput}
                      onChange={(event) => changeTags(event.target.value)}
                      onBlur={() => setTagsInput(draftCard.tags.join(", "))}
                      placeholder="Enter tags separated by commas"
                    />

                    {draftCard.tags.length > 0 && (
                      <div className={styles.tagPreview}>
                        {draftCard.tags.map((tag) => (
                          <span key={tag} className={styles.tag}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </label>
              </div>

              {error && <p className={styles.errorText}>{error}</p>}
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.secondaryButton} onClick={handleClose}>
                Close
              </button>

              <button
                type="button"
                className={`${styles.primaryButton} ${hasChanges ? styles.primaryButtonActive : ""}`}
                onClick={saveCard}
                disabled={!hasChanges || isSaving}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function cardWasChanged(originalCard: Card | null, draftCard: Card | null) {
  if (!originalCard || !draftCard) return false;

  return (
    draftCard.front !== originalCard.front ||
    draftCard.back !== originalCard.back ||
    hintKey(draftCard.hint) !== hintKey(originalCard.hint) ||
    tagsKey(draftCard.tags) !== tagsKey(originalCard.tags)
  );
}

function hintKey(hint: string | null | undefined) {
  return hint?.trim() ?? "";
}

function tagsKey(tags: string[]) {
  return normalizeTags(tags).join("\u0000");
}
