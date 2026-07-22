"use client";

import type { ChangeEvent } from "react";

import DropdownButton from "../../buttons/dropdownButton/DropdownButton";
import StartLessonButton from "../../buttons/startLessonButton/StartLessonButton";

import buttonStyles from "../../buttons/buttons.module.css";
import styles from "../decks.module.css";

type DropdownItem = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type DeckHeaderProps = {
  title: string;
  subtitle?: string;

  isGridView: boolean;

  onToggleViewAction: (event: ChangeEvent<HTMLInputElement>) => void; // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION

  onAddCardAction?: () => void;

  editButtons?: DropdownItem[];

  onDeleteDeckAction?: () => void;

  onStartLessonAction?: () => void;

  startLessonDisabled?: boolean;
};

export default function DeckHeader({
  title = "",
  subtitle = "",
  isGridView,
  onToggleViewAction, // THIS LINE WAS CREATED USING AI, NOT FOR EVALUATION
  onAddCardAction,
  editButtons = [],
  onDeleteDeckAction,
  onStartLessonAction,
  startLessonDisabled = false,
}: DeckHeaderProps) {
  const showDeckActions =
    onAddCardAction !== undefined ||
    editButtons.length > 0 ||
    onDeleteDeckAction !== undefined ||
    onStartLessonAction !== undefined;

  return (
    <header className={styles.header}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{title}</h1>

        <div className={styles.headerControls}>
          {showDeckActions && (
            <div className={styles.deckHeaderActions}>
              {onAddCardAction && (
                <button
                  type="button"
                  className={[buttonStyles.base, buttonStyles.iconButton].join(
                    " ",
                  )}
                  onClick={onAddCardAction}
                  aria-label="Add card"
                  title="Add card"
                >
                  <span
                    className={[
                      styles.headerActionIcon,
                      styles.addCircleActionIcon,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>
              )}

              {editButtons.length > 0 && (
                <DropdownButton
                  triggerIconSrc="/edit_icon.svg"
                  triggerAriaLabel="Edit options"
                  items={editButtons}
                  align="right"
                />
              )}

              {onStartLessonAction && (
                <StartLessonButton
                  type="button"
                  onClick={onStartLessonAction}
                  disabled={startLessonDisabled}
                  aria-label="Study All Cards"
                  title={
                    startLessonDisabled
                      ? "This deck has no cards"
                      : "Study All Cards"
                  }
                />
              )}

              {onDeleteDeckAction && (
                <button
                  type="button"
                  className={[
                    buttonStyles.base,
                    buttonStyles.iconButton,
                    buttonStyles.dangerIconButton,
                  ].join(" ")}
                  onClick={onDeleteDeckAction}
                  aria-label="Delete deck"
                  title="Delete deck"
                >
                  <span
                    className={[
                      styles.headerActionIcon,
                      styles.deleteActionIcon,
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>
          )}

          {/*
              FOLLOWING PART WAS CREATED USING AI, NOT FOR EVALUATION 
          */}

          <label className={styles.viewToggle}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={isGridView}
              onChange={onToggleViewAction}
              aria-label="Toggle deck view"
            />

            <div className={styles.toggleTrack}>
              <div className={styles.toggleIndicator} />

              <span className={styles.toggleOption}>
                <svg
                  viewBox="0 0 24 24"
                  className={styles.icon}
                  aria-hidden="true"
                >
                  <rect x="4" y="5" width="16" height="3" rx="1" />
                  <rect x="4" y="10.5" width="16" height="3" rx="1" />
                  <rect x="4" y="16" width="16" height="3" rx="1" />
                </svg>
              </span>

              <span className={styles.toggleOption}>
                <svg
                  viewBox="0 0 24 24"
                  className={styles.icon}
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
            </div>
          </label>

          {/*
              END OF AI PART 
          */}
        </div>
      </div>

      <p className={styles.subtitle}>{subtitle}</p>
    </header>
  );
}
