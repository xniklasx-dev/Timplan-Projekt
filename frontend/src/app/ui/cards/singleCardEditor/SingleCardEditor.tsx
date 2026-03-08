'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './SingleCardEditor.module.css';

import type { Card } from '@/app/lib/definitions';
import cardsData from '@/app/lib/placeholder-cards.json';

type SingleCardEditorProps = {
  open: boolean;
  cardId: string | null;
  onClose: () => void;
};

const allCards = cardsData as unknown as Card[];

function normalizeCard(card: Card): Card {
  return {
    ...card,
    hint: card.hint ?? '',
    extra: card.extra ?? '',
  };
}

export default function SingleCardEditor({
  open,
  cardId,
  onClose,
}: SingleCardEditorProps) {
  const baseCard = useMemo(() => {
    if (!cardId) return null;
    return allCards.find((card) => card.id === cardId) ?? null;
  }, [cardId]);

  const normalizedBaseCard = useMemo(() => {
    return baseCard ? normalizeCard(baseCard) : null;
  }, [baseCard]);

  const [draft, setDraft] = useState<Card | null>(
    normalizedBaseCard ? { ...normalizedBaseCard } : null
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!normalizedBaseCard || !draft) return false;

    return (
      draft.front !== normalizedBaseCard.front ||
      draft.back !== normalizedBaseCard.back ||
      (draft.hint ?? '') !== (normalizedBaseCard.hint ?? '') ||
      (draft.extra ?? '') !== (normalizedBaseCard.extra ?? '')
    );
  }, [normalizedBaseCard, draft]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (hasUnsavedChanges) {
          const shouldClose = window.confirm(
            'You have unsaved changes. Do you really want to close this editor?'
          );

          if (!shouldClose) {
            return;
          }
        }

        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose, hasUnsavedChanges]);

  function updateField(
    field: 'front' | 'back' | 'hint' | 'extra',
    value: string
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function handleClose() {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        'You have unsaved changes. Do you really want to close this editor?'
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
  }

  if (!open || !cardId) {
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
          aria-labelledby="single-card-edit-title"
        >
          <div className={styles.header}>
            <div className={styles.headerMain}>
              <span className={styles.eyebrow}>Single Card Edit</span>
              <h2 id="single-card-edit-title" className={styles.title}>
                2  Card not found
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
            No card was found for id: <strong>{cardId}</strong>
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
              {draft.front.trim() || 'Untitled card'}
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>Card ID: {draft.id}</span>
              <span className={styles.metaPill}>State: {draft.state}</span>
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
            <label className={styles.field}>
              <span className={styles.label}>Question</span>
              <textarea
                className={styles.textareaLarge}
                value={draft.front}
                onChange={(event) => updateField('front', event.target.value)}
                placeholder="Enter the card question"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Answer</span>
              <textarea
                className={styles.textareaLarge}
                value={draft.back}
                onChange={(event) => updateField('back', event.target.value)}
                placeholder="Enter the card answer"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Hint</span>
              <textarea
                className={styles.textareaSmall}
                value={draft.hint ?? ''}
                onChange={(event) => updateField('hint', event.target.value)}
                placeholder="Optional hint"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Extra</span>
              <textarea
                className={styles.textareaSmall}
                value={draft.extra ?? ''}
                onChange={(event) => updateField('extra', event.target.value)}
                placeholder="Additional context or notes"
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
              hasUnsavedChanges ? styles.primaryButtonActive : ''
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