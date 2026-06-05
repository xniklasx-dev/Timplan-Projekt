'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './SingleCardAdd.module.css';

import type { Card } from '@/app/lib/definitions';
import {
  createCard,
  normalizeTags,
  type CreateCardPayload,
} from '@/app/lib/card-service';

type SingleCardAddProps = {
  open: boolean;
  deckId: string;
  userId: string;
  onClose: () => void;
  onCreate?: (card: Card) => void;
};

function createNewCard(deckId: string): CreateCardPayload {
  return {
    deckId,
    front: '',
    back: '',
    hint: '',
    tags: [],
  };
}

type SingleCardAddContentProps = {
  deckId: string;
  userId: string;
  onClose: () => void;
  onCreate?: (card: Card) => void;
};

function SingleCardAddContent({
  deckId,
  userId,
  onClose,
  onCreate,
}: SingleCardAddContentProps) {
  const [draft, setDraft] = useState<CreateCardPayload>(() => createNewCard(deckId));
  const [tagText, setTagText] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasUnsavedChanges = useMemo(() => {
    return (
      draft.front.trim() !== '' ||
      draft.back.trim() !== '' ||
      (draft.hint ?? '').trim() !== '' ||
      draft.tags.length > 0
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
    field: 'front' | 'back' | 'hint' | 'tags',
    value: string
  ) {
    setDraft((current) => ({
      ...current,
      [field]: field === 'tags' ? normalizeTags(value) : value,
    }));
  }

  function updateTags(value: string) {
    setTagText(value);
    updateField('tags', value);
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

  async function handleCreate() {
    if (!canCreate || isCreating) return;

    const payload: CreateCardPayload = {
      ...draft,
      front: draft.front.trim(),
      back: draft.back.trim(),
      hint: draft.hint?.trim() || undefined,
      tags: normalizeTags(draft.tags),
    };

    setIsCreating(true);
    setError(null);

    try {
      const newCard = await createCard(payload, userId);

      onCreate?.(newCard);
      onClose();
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'Could not create card.'
      );
    } finally {
      setIsCreating(false);
    }
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
              <span className={styles.metaPill}>State: new</span>
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
            <label className={`${styles.field} ${styles.fieldLarge}`}>
              <span className={styles.label}>Question</span>
              <textarea
                className={styles.textareaLarge}
                value={draft.front}
                onChange={(event) => updateField('front', event.target.value)}
                placeholder="What should appear on the front of the card?"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldLarge}`}>
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
              <span className={styles.label}>Tags</span>
              <div className={styles.tagControl}>
                <textarea
                  className={styles.textareaSmall}
                  value={tagText}
                  onChange={(event) => updateTags(event.target.value)}
                  onBlur={() => setTagText(draft.tags.join(', '))}
                  placeholder="typescript, basics"
                />
                {draft.tags.length > 0 && (
                  <div className={styles.tagPreview}>
                    {draft.tags.map((tag) => (
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
            Cancel
          </button>

          <button
            type="button"
            className={`${styles.primaryButton} ${
              canCreate ? styles.primaryButtonActive : ''
            }`}
            onClick={handleCreate}
            disabled={!canCreate || isCreating}
          >
            {isCreating ? 'Creating...' : 'Create card'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SingleCardAdd({
  open,
  deckId,
  userId,
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
      userId={userId}
      onClose={onClose}
      onCreate={onCreate}
    />
  );
}
