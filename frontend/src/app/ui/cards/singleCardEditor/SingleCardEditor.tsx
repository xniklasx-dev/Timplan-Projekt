"use client";

import { useEffect, useMemo, useState } from "react";

import styles from "./SingleCardEditor.module.css";

import type { Card } from "@/app/lib/definitions";
import { getCardById, normalizeTags, toCardFormat, updateCard } from "@/app/lib/card-service";

type SingleCardEditorProperties = {
  open: boolean;
  cardId: string;
  userId: string;
  onClose: () => void;
  onSaved?: (updatedCard: Card) => void;
}

export default function SingleCardEditor({ open, cardId, userId, onClose, onSaved }: SingleCardEditorProperties) {
  const [originalCard, setOriginalCard] = useState<Card | null>(null);
  const [draftCard, setDraftCard] = useState<Card | null>(null);
  const [tagsInput, setTagsInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !cardId) return;

    if (!userId) {
      setIsLoading(false);
      setError("User not authenticated");
      setOriginalCard(null);
      setDraftCard(null);
      return;
    }
    
    let ignore = false;

    async function fetchCard() {
      setIsLoading(true);
      setError(null);
      setOriginalCard(null);
      setDraftCard(null);

      try {
          const card = await getCardById(cardId, userId);
          if (!ignore) {
            setOriginalCard(card);
            setDraftCard(card);
            setTagsInput(card.tags.join(", "));
          }
      } catch (e) {
        if (!ignore) {
          setError(e instanceof Error ? e.message : "Could not fetch card");
        }
      } finally {
        if (!ignore) {
        setIsLoading(false);
        }
      }
    }

    fetchCard();

    return () => {
      ignore = true;
    };
  }, [open, cardId, userId]);

  const hasUnsavedChanges = useMemo(() => {
    if (!originalCard || !draftCard) return false;
    return (
      draftCard.front !== originalCard.front ||
      draftCard.back !== originalCard.back ||
      (draftCard.hint ?? "") !== originalCard.hint ||
      normalizeTags(draftCard.tags).join('\u0000') !== normalizeTags(originalCard.tags).join('\u0000')
    );
  } , [originalCard, draftCard]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (hasUnsavedChanges) {
          const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
          if (!confirmClose) {
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
  }, [open, hasUnsavedChanges, onClose]);

  function updateField(field: "front" | "back" | "hint" | "tags", value: string) {
    setDraftCard((current) => {
      if (!current) return current;
      return { 
        ...current, 
        [field]: field === "tags" ? normalizeTags(value) : value
      };
    });
  }

  function updateTagsInput(value: string) {
    setTagsInput(value);
    updateField("tags", value);
  }

  function handleClose() {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close?");
      if (!confirmClose) {
        return;
      }
    }
    onClose();
  }

  function handleOverlayClick() {
    handleClose();
  }

  async function handleSave() {
    if (!cardId || !draftCard || !userId || !hasUnsavedChanges || isSaving) return;

    if (draftCard.front.trim() === "" || draftCard.back.trim() === "") {
      setError("Front and back fields are required");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = await updateCard(cardId, toCardFormat(draftCard), userId);

      setOriginalCard(saved);
      setDraftCard({...saved});
      onSaved?.(saved);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save card");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open || !cardId) return null;

  if (isLoading || !draftCard) {
    return (
      <div className={styles.overlay} onClick={handleOverlayClick}>
        <div
          className={styles.modal}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="single-card-edit-title"
        >
          <div className={styles.header}>
            <div className={styles.headerMain}>
              <span className={styles.eyebrow}>Single Card Edit</span>
              <h2 id="single-card-edit-title" className={styles.title}>
                {isLoading ? 'Loading card' : 'Card unavailable'}
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
            {isLoading ? (
              "Loading card data..."
            ) : error ?? (
              <>
                No card was found for id: <strong>{cardId}</strong>
              </>
            )}
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
        aria-labelledby="single-card-edit-title"
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.eyebrow}>Single Card Edit</span>

            <h2 id="single-card-edit-title" className={styles.title}>
              {draftCard.front.trim() || 'Untitled card'}
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>State: {draftCard.state}</span>
              <span className={styles.metaPill}>{draftCard.tags.length} tags</span>
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
            <label className={`${styles.field} ${styles.fieldLarge}`}>
              <span className={styles.label}>Question</span>
              <textarea
                className={styles.textareaLarge}
                value={draftCard.front}
                onChange={(event) => updateField('front', event.target.value)}
                placeholder="Enter the card question"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldLarge}`}>
              <span className={styles.label}>Answer</span>
              <textarea
                className={styles.textareaLarge}
                value={draftCard.back}
                onChange={(event) => updateField('back', event.target.value)}
                placeholder="Enter the card answer"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Hint</span>
              <textarea
                className={styles.textareaSmall}
                value={draftCard.hint ?? ''}
                onChange={(event) => updateField('hint', event.target.value)}
                placeholder="Optional hint"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Tags</span>
              <div className={styles.tagControl}>
                <textarea
                  className={styles.textareaSmall}
                  value={tagsInput}
                  onChange={(event) => updateTagsInput(event.target.value)}
                  onBlur={() => setTagsInput(draftCard.tags.join(', '))}
                  placeholder="typescript, basics"
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
              hasUnsavedChanges ? styles.primaryButtonActive : ''
            }`}
            onClick={handleSave}
            disabled={!hasUnsavedChanges || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
