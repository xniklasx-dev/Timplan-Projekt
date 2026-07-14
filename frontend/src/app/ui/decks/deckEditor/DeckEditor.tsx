"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import styles from "./deckEditor.module.css";

import type { Deck } from "@/app/lib/definitions";
import type { DeckWriteData } from "@/app/lib/deck-service";

type DeckEditorProps = {
  open: boolean;
  deckId: string | null;
  parentDeckId?: string;
  decks: Deck[];
  onCloseAction: () => void;
  onSaveAction: (
    deckId: string | null,
    deckData: DeckWriteData,
  ) => Promise<void>;
};

const DECK_COLOR_PRESETS = [
  { label: "Red", value: "#ef4444" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Green", value: "#22c55e" },
  { label: "Yellow", value: "#eab308" },
  { label: "Orange", value: "#f97316" },
  { label: "Pink", value: "#ec4899" },
  { label: "White", value: "#ffffff" },
  { label: "Black", value: "#000000" },
  { label: "Brown", value: "#92400e" },
] as const;

const CUSTOM_COLOR_VALUE = "__custom__";

function isHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function parseTags(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0);
}

export default function DeckEditor({
  open,
  deckId,
  parentDeckId,
  decks,
  onCloseAction,
  onSaveAction,
}: DeckEditorProps) {
  const selectedDeck =
    deckId === null ? undefined : decks.find((deck) => deck.id === deckId);

  const isNewDeck = deckId === null;
  const deckNotFound = !isNewDeck && selectedDeck === undefined;
  const currentParentDeckId = isNewDeck
    ? parentDeckId
    : selectedDeck?.parentDeckId;

  const [name, setName] = useState(selectedDeck?.name ?? "");
  const [description, setDescription] = useState(
    selectedDeck?.description ?? "",
  );
  const [color, setColor] = useState(selectedDeck?.color ?? "");

  const normalizedColor = color.toLowerCase();

  const colorPickerValue = isHexColor(normalizedColor)
    ? normalizedColor
    : "#ffffff";

  const presetSelectValue = DECK_COLOR_PRESETS.some(
    (preset) => preset.value === normalizedColor,
  )
    ? normalizedColor
    : normalizedColor
      ? CUSTOM_COLOR_VALUE
      : "";

  const [tagsInput, setTagsInput] = useState(
    selectedDeck?.tags.join(", ") ?? "",
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    setName(selectedDeck?.name ?? "");
    setDescription(selectedDeck?.description ?? "");
    setColor(selectedDeck?.color ?? "");
    setTagsInput(selectedDeck?.tags.join(", ") ?? "");
    setSaveError(null);
    setIsSaving(false);
  }, [open, deckId, parentDeckId, selectedDeck]);

  async function handleSave() {
    const trimmedName = name.trim();

    if (deckNotFound || isSaving || trimmedName.length === 0) {
      return;
    }

    const tags = parseTags(tagsInput);

    const deckData: DeckWriteData = {
      parentDeckId: currentParentDeckId ?? null,
      name: trimmedName,
      description: description.trim() || null,
      tags: tags.length > 0 ? tags : null,
      color: color.trim() || null,
    };

    setSaveError(null);
    setIsSaving(true);

    try {
      await onSaveAction(deckId, deckData);
      onCloseAction();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to save deck";

      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }

  if (!open) {
    return null;
  }

  let title = name.trim();
  if (deckNotFound) {
    title = "Deck not found";
  } else if (title.length === 0) {
    title = isNewDeck ? "Untitled new deck" : "Untitled deck";
  }

  const deckTypeLabel = isNewDeck
    ? currentParentDeckId
      ? "New child deck"
      : "New top-level deck"
    : `Deck ID: ${deckId}`;

  return (
    <div className={styles.overlay} onClick={onCloseAction}>
      <form
        className={styles.modal}
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
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
              {title}
            </h2>

            {!deckNotFound && (
              <div className={styles.metaRow}>
                <span className={styles.metaPill}>{deckTypeLabel}</span>

                {selectedDeck && (
                  <>
                    <span className={styles.metaPill}>
                      Cards: {selectedDeck.totalCards}
                    </span>
                    <span className={styles.metaPill}>
                      Due today: {selectedDeck.dueToday}
                    </span>
                  </>
                )}

                {currentParentDeckId && (
                  <span className={styles.metaPill}>
                    Parent: {currentParentDeckId}
                  </span>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onCloseAction}
            aria-label="Close modal"
          >
            <Image src="/close_icon.svg" alt="" width={20} height={20} />
          </button>
        </div>

        {deckNotFound ? (
          <div className={styles.content}>
            <p className={styles.notFoundText}>
              The requested deck could not be found.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.content}>
              <div className={styles.fieldGrid}>
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="deck-name">
                    Deck name
                  </label>
                  <input
                    id="deck-name"
                    name="name"
                    className={styles.input}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter the deck name"
                    required
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="deck-description">
                    Description
                  </label>
                  <textarea
                    id="deck-description"
                    name="description"
                    className={styles.textareaLarge}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional deck description"
                  />
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <span className={styles.label}>Color</span>

                  <div className={styles.colorControls}>
                    <label className={styles.colorPickerGroup}>
                      <input
                        type="color"
                        className={styles.colorPicker}
                        value={colorPickerValue}
                        onChange={(event) => {
                          setColor(event.target.value.toLowerCase());
                        }}
                        aria-label="Choose a custom deck color"
                      />

                      <span className={styles.colorValue}>
                        {normalizedColor || "No color selected"}
                      </span>
                    </label>

                    <select
                      className={`${styles.input} ${styles.colorPresetSelect}`}
                      value={presetSelectValue}
                      onChange={(event) => {
                        const selectedColor = event.target.value;

                        if (selectedColor !== CUSTOM_COLOR_VALUE) {
                          setColor(selectedColor);
                        }
                      }}
                      aria-label="Choose a preset deck color"
                    >
                      <option value="">No color</option>

                      <option value={CUSTOM_COLOR_VALUE} disabled>
                        Custom color
                      </option>

                      {DECK_COLOR_PRESETS.map((preset) => (
                        <option key={preset.value} value={preset.value}>
                          {preset.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <label className={styles.label} htmlFor="deck-tags">
                    Tags
                  </label>
                  <textarea
                    id="deck-tags"
                    name="tags"
                    className={styles.textareaSmall}
                    value={tagsInput}
                    onChange={(event) => setTagsInput(event.target.value)}
                    placeholder="Separate tags with commas"
                  />
                </div>
              </div>
            </div>

            {saveError && (
              <p className={styles.notFoundText} role="alert">
                {saveError}
              </p>
            )}
          </>
        )}

        <div className={styles.footer}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onCloseAction}
          >
            Close
          </button>

          {!deckNotFound && (
            <button
              type="submit"
              className={`${styles.primaryButton} ${
                name.trim().length > 0 ? styles.primaryButtonActive : ""
              }`}
              disabled={isSaving || name.trim().length === 0}
            >
              {isSaving
                ? "Saving..."
                : isNewDeck
                  ? "Create deck"
                  : "Save changes"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
