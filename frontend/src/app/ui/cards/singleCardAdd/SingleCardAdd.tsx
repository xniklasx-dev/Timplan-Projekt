"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import type { Card } from "@/app/lib/definitions";
import { createCard, normalizeTags } from "@/app/lib/card-service";
import ConfirmDialog from "@/app/ui/confirmDialog/ConfirmDialog";
import Toast from "@/app/ui/toast/Toast";

import styles from "./SingleCardAdd.module.css";

type SingleCardAddProps = {
  open: boolean;
  deckId: string;
  token: string;
  onClose: () => void;
  onCreated?: (card: Card) => void;
};

export default function SingleCardAdd({ open, deckId, token, onClose, onCreated }: SingleCardAddProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [hint, setHint] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const tags = normalizeTags(tagsInput);
  const hasChanges = front.trim() !== "" || back.trim() !== "" || hint.trim() !== "" || tags.length > 0;
  const canCreate = front.trim() !== "" && back.trim() !== "" && Boolean(token) && !isSaving;

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;

      if (isSaving) return;

      if (showCloseConfirm) return;

      if (hasChanges) {
        setShowCloseConfirm(true);
        return;
      }

      onClose();
    }

    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, hasChanges, isSaving, onClose, showCloseConfirm]);

  useEffect(() => {
    if (!open) return;

    setFront("");
    setBack("");
    setHint("");
    setTagsInput("");
    setError(null);
    setIsSaving(false);
    setShowCloseConfirm(false);
  }, [open, deckId]);

  function requestClose() {
    if (isSaving) return;

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

  async function handleCreate() {
    if (!token) {
      setError("You must be logged in to create a card.");
      return;
    }

    if (!canCreate) return;

    setIsSaving(true);
    setError(null);

    try {
      const createdCard = await createCard({
        deckId,
        front,
        back,
        hint,
        tags,
      }, token);

      onCreated?.(createdCard);
      setToastMessage("Card created successfully.");
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Could not create card");
    } finally {
      setIsSaving(false);
    }
  }

  if (!open && !toastMessage) return null;

  return (
    <>
      <Toast title="Created" message={toastMessage} onClose={() => setToastMessage(null)} />
      <ConfirmDialog
        open={showCloseConfirm}
        title="Close without saving?"
        message="Your new card has unsaved changes. If you close now, this draft will be lost."
        confirmLabel="Close anyway"
        onConfirm={closeWithoutSaving}
        onCancel={() => setShowCloseConfirm(false)}
      />

      {open && deckId && (
        <div className={styles.overlay}>
          <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="single-card-add-title">
            <div className={styles.header}>
              <div className={styles.headerMain}>
                <span className={styles.eyebrow}>Card Add</span>

                <h2 id="single-card-add-title" className={styles.title}>
                  Create new card
                </h2>
              </div>

              <button type="button" className={styles.closeButton} onClick={requestClose} aria-label="Close modal">
                <Image src="/close_icon.svg" alt="" width={20} height={20} />
              </button>
            </div>

            <div className={styles.content}>
              <div className={styles.fieldGrid}>
                <label className={`${styles.field} ${styles.fieldLarge}`}>
                  <span className={styles.label}>Question</span>
                  <textarea
                    className={styles.textareaLarge}
                    value={front}
                    onChange={(event) => setFront(event.target.value)}
                    placeholder="Enter the card question"
                  />
                </label>

                <label className={`${styles.field} ${styles.fieldLarge}`}>
                  <span className={styles.label}>Answer</span>
                  <textarea
                    className={styles.textareaLarge}
                    value={back}
                    onChange={(event) => setBack(event.target.value)}
                    placeholder="Enter the card answer"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Hint</span>
                  <textarea
                    className={styles.textareaSmall}
                    value={hint}
                    onChange={(event) => setHint(event.target.value)}
                    placeholder="Optional hint"
                  />
                </label>

                <label className={styles.field}>
                  <span className={styles.label}>Tags</span>
                  <div className={styles.tagControl}>
                    <textarea
                      className={styles.textareaSmall}
                      value={tagsInput}
                      onChange={(event) => setTagsInput(event.target.value)}
                      onBlur={() => setTagsInput(tags.join(", "))}
                      placeholder="Enter tags separated by commas"
                    />

                    {tags.length > 0 && (
                      <div className={styles.tagPreview}>
                        {tags.map((tag) => (
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
              <button type="button" className={styles.secondaryButton} onClick={requestClose}>
                Cancel
              </button>

              <button
                type="button"
                className={`${styles.primaryButton} ${canCreate ? styles.primaryButtonActive : ""}`}
                onClick={handleCreate}
                disabled={!canCreate}
              >
                {isSaving ? "Creating..." : "Create card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
