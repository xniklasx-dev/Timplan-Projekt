'use client';

import { useEffect, useMemo, useState } from 'react';

import styles from './SingleCardEditor.module.css';

import type { Card } from '@/app/lib/definitions';
import {
  getCardById,
  normalizeTags,
  toCardDraft,
  updateCard,
} from '@/app/lib/card-service';

type SingleCardEditorProps = {
  open: boolean;
  cardId: string | null;
  userId?: string;
  onClose: () => void;
  onSaved?: (card: Card) => void;
};

function normalizeCard(card: Card): Card {
  return {
    ...card,
    hint: card.hint ?? '',
    tags: normalizeTags(card.tags),
  };
}

export default function SingleCardEditor({
  open,
  cardId,
  userId,
  onClose,
  onSaved,
}: SingleCardEditorProps) {
  const [baseCard, setBaseCard] = useState<Card | null>(null);
  const [draft, setDraft] = useState<Card | null>(null);
  const [tagText, setTagText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !cardId) {
      return;
    }

    if (!userId) {
      setIsLoading(false);
      setError('A backend user id is required to load this card.');
      setBaseCard(null);
      setDraft(null);
      return;
    }

    const activeCardId = cardId;
    const activeUserId = userId;
    let ignore = false;

    async function loadCard() {
      setIsLoading(true);
      setError(null);
      setBaseCard(null);
      setDraft(null);

      try {
        const card = normalizeCard(await getCardById(activeCardId, activeUserId));

        if (!ignore) {
          setBaseCard(card);
          setDraft({ ...card });
          setTagText(card.tags.join(', '));
        }
      } catch (loadError) {
        if (!ignore) {
          setError(
            loadError instanceof Error ? loadError.message : 'Could not load card.'
          );
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCard();

    return () => {
      ignore = true;
    };
  }, [open, cardId, userId]);

  const hasUnsavedChanges = useMemo(() => {
    if (!baseCard || !draft) return false;

    return (
      draft.front !== baseCard.front ||
      draft.back !== baseCard.back ||
      (draft.hint ?? '') !== (baseCard.hint ?? '') ||
      draft.tags.join('\u0000') !== baseCard.tags.join('\u0000')
    );
  }, [baseCard, draft]);

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
    field: 'front' | 'back' | 'hint' | 'tags',
    value: string
  ) {
    setDraft((current) =>
      current
        ? {
            ...current,
            [field]: field === 'tags' ? normalizeTags(value) : value,
          }
        : current
    );
  }

  function updateTags(value: string) {
    setTagText(value);
    updateField('tags', value);
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

  async function handleSave() {
    if (!cardId || !draft || !userId || !hasUnsavedChanges || isSaving) return;

    if (draft.front.trim() === '' || draft.back.trim() === '') {
      setError('Question and answer are required.');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const saved = normalizeCard(await updateCard(cardId, toCardDraft(draft), userId));

      setBaseCard(saved);
      setDraft({ ...saved });
      onSaved?.(saved);
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Could not save card.'
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (!open || !cardId) {
    return null;
  }

  if (isLoading || !draft) {
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
            {error ?? (
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
              {draft.front.trim() || 'Untitled card'}
            </h2>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>State: {draft.state}</span>
              <span className={styles.metaPill}>{draft.tags.length} tags</span>
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
                placeholder="Enter the card question"
              />
            </label>

            <label className={`${styles.field} ${styles.fieldLarge}`}>
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
