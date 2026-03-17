'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './SingleCardAdd.module.css';

import type { Card } from '@/app/lib/definitions';

type SingleCardAddProps = {
  open: boolean;
  deckId: string;
  onClose: () => void;
  onCreate: (card: Card) => void;
};

function createNewCard(deckId: string): Card {
  const now = new Date();

  return {
    id:
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `card-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    deckId,

    front: '',
    back: '',
    hint: '',
    extra: '',

    tags: [],
    media: [],

    state: 'new',
    due: now,
    rating: 0,

    lastReview: undefined,

    totalReviews: 0,
    correctReviews: 0,

    createdAt: now,
    updatedAt: now,
    deleted: false,

    revision: 1,
  };
}

type SingleCardAddContentProps = {
  deckId: string;
  onClose: () => void;
  onCreate: (card: Card) => void;
};

function SingleCardAddContent({
  deckId,
  onClose,
  onCreate,
}: SingleCardAddContentProps) {
  const [draft, setDraft] = useState<Card>(() => createNewCard(deckId));

  const hasUnsavedChanges = useMemo(() => {
    return (
      draft.front.trim() !== '' ||
      draft.back.trim() !== '' ||
      (draft.hint ?? '').trim() !== '' ||
      (draft.extra ?? '').trim() !== ''
    );
  }, [draft]);

  const canCreate = useMemo(() => {
    return draft.front.trim() !== '' && draft.back.trim() !== '';
  }, [draft.front, draft.back]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (hasUnsavedChanges) {
          const shouldClose = window.confirm(
            'You have unsaved changes. Do you really want to close this form?'
          );

          if (!shouldClose) {
            return;
          }
        }

        onClose();
      }
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasUnsavedChanges, onClose]);

  function updateField(
    field: 'front' | 'back' | 'hint' | 'extra',
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      [field]: value,
      updatedAt: new Date(),
    }));
  }

  function handleClose() {
    if (hasUnsavedChanges) {
      const shouldClose = window.confirm(
        'You have unsaved changes. Do you really want to close this form?'
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

  function handleCreate() {
    if (!canCreate) return;

    const now = new Date();

    const newCard: Card = {
      ...draft,
      front: draft.front.trim(),
      back: draft.back.trim(),
      hint: draft.hint?.trim() ?? '',
      extra: draft.extra?.trim() ?? '',
      createdAt: now,
      updatedAt: now,
    };

    onCreate(newCard);
    onClose();
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="single-card-add-title"
      >
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.eyebrow}>Single Card Add</span>

            <h2 id="single-card-add-title" className={styles.title}>
              Create new card
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>State: {draft.state}</span>
              <span className={styles.metaPill}>Deck: {draft.deckId}</span>
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
                placeholder="What should appear on the front of the card?"
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Answer</span>
              <textarea
                className={styles.textareaLarge}
                value={draft.back}
                onChange={(event) => updateField('back', event.target.value)}
                placeholder="What is the correct answer?"
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
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.primaryButton} ${
              canCreate ? styles.primaryButtonActive : ''
            }`}
            onClick={handleCreate}
            disabled={!canCreate}
          >
            Create card
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SingleCardAdd({
  open,
  deckId,
  onClose,
  onCreate,
}: SingleCardAddProps) {
  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <SingleCardAddContent
      key={deckId}
      deckId={deckId}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}