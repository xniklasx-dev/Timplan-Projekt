'use client';

import { useLayoutEffect, useRef, useState } from "react";
import styles from "./page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import StartLessonButton from "@/app/ui/buttons/startLessonButton/StartLessonButton";

type DeckPreview = {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  cardIds?: string[];
  color?: string;
  icon?: string;
  parentDeckId?: string;
  childDeckIds?: string[];
  totalCards: number;
  newCards: number;
  learningCards?: number;
  reviewCards?: number;
  dueToday: number;
  studiedToday?: number;
  lastStudied?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  deleted?: boolean;
  revision?: number;
};

const initialDecks: DeckPreview[] = placeholderDecks as unknown as DeckPreview[];

export default function Decks() {
  const [isGridView, setIsGridView] = useState(false);
  const [decks] = useState<DeckPreview[] | null>(initialDecks);

  // Keep a ref to each deck card DOM node
  const cardRefs = useRef(new Map<string, HTMLDivElement>());

  // Helps avoid animation on first mount
  const hasMounted = useRef(false);
  useLayoutEffect(() => {
    hasMounted.current = true;
  }, []);

  const measure = () => {
    const rects = new Map<string, DOMRect>();
    cardRefs.current.forEach((el, id) => {
      rects.set(id, el.getBoundingClientRect());
    });
    return rects;
  };

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasMounted.current) {
      setIsGridView(event.target.checked);
      return;
    }

    const next = event.target.checked;

    // FIRST
    const first = measure();

    // Change layout
    setIsGridView(next);

    // LAST (after React applies the new layout)
    requestAnimationFrame(() => {
      const last = measure();

      // INVERT + PLAY
      cardRefs.current.forEach((el, id) => {
        const a = first.get(id);
        const b = last.get(id);
        if (!a || !b) return;

        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;

        // If nothing changed, skip
        if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;

        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
            { transform: "translate(0px, 0px) scale(1, 1)" },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.2, .8, .2, 1)",
          }
        );
      });
    });
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Deck Library</h1>

          <label className={styles.viewToggle}>
            <input
              type="checkbox"
              className={styles.toggleInput}
              checked={isGridView}
              onChange={handleToggleView}
            />

            <div className={styles.toggleTrack}>
              <div className={styles.toggleIndicator}></div>

              <span className={styles.toggleOption}>
                <svg viewBox="0 0 24 24" className={styles.icon}>
                  <rect x="4" y="5" width="16" height="3" rx="1" />
                  <rect x="4" y="10.5" width="16" height="3" rx="1" />
                  <rect x="4" y="16" width="16" height="3" rx="1" />
                </svg>
              </span>

              <span className={styles.toggleOption}>
                <svg viewBox="0 0 24 24" className={styles.icon}>
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
            </div>
          </label>
        </div>

        <p className={styles.subtitle}>Select a deck to start studying</p>
      </header>

      <section className={isGridView ? styles.deckGrid : styles.deckLine}>
        {!decks ? (
          <p className={styles.subtitle}>Loading decks...</p>
        ) : (
          decks.map((deck) => (
            <div
              key={deck.id}
              ref={(el) => {
                if (!el) return;
                cardRefs.current.set(deck.id, el);
              }}
              className={`${styles.deckCard} ${
                isGridView ? styles.deckCardGrid : styles.deckCardLine
              }`}
            >
              <div className={styles.startButtonWrapper}>
                <StartLessonButton />
              </div>

              <div className={styles.deckTop}>
                <h2 className={styles.deckName}>{deck.name}</h2>
                {deck.description && (
                  <p className={styles.deckDescription}>{deck.description}</p>
                )}
              </div>

              <div className={styles.deckStats}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{deck.totalCards}</span>
                  <span className={styles.statLabel}>Cards</span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.statValue}>{deck.dueToday}</span>
                  <span className={styles.statLabel}>Due</span>
                </div>

                <div className={styles.stat}>
                  <span className={styles.statValue}>{deck.newCards}</span>
                  <span className={styles.statLabel}>New</span>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
