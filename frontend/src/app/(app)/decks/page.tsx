"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Deck } from '../../lib/definitions';
import Link from "next/link";
import styles from "./page.module.css";
import placeholderDecks from "@/app/lib/placeholder-decks.json";
import StartLessonButton from "../../ui/buttons/startLessonButton/StartLessonButton";

const initialDecks: Deck[] = placeholderDecks as unknown as Deck[];

export default function Decks() {
  const [isGridView, setIsGridView] = useState(false);

  const [decks] = useState<Deck[] | null>(initialDecks);

  const router = useRouter();

  const cardRefs = useRef(new Map<string, HTMLElement>());

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

    const first = measure();

    setIsGridView(next);

    requestAnimationFrame(() => {
      const last = measure();

      cardRefs.current.forEach((el, id) => {
        const a = first.get(id);
        const b = last.get(id);
        if (!a || !b) return;

        const dx = a.left - b.left;
        const dy = a.top - b.top;
        const sx = a.width / b.width;
        const sy = a.height / b.height;

        if (dx === 0 && dy === 0 && sx === 1 && sy === 1) return;

        el.animate(
          [
            { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
            { transform: "translate(0px, 0px) scale(1, 1)" },
          ],
          {
            duration: 380,
            easing: "cubic-bezier(.2, .8, .2, 1)",
          },
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
          decks
            .filter((deck) => !deck.parentDeckId || +deck.parentDeckId <= 0)
            .map((deck) => (
              <Link
                key={deck.id}
                href={`/decks/${deck.id}`}
                ref={(el) => {
                  if (!el) return;
                  cardRefs.current.set(deck.id, el);
                }}
                className={`${styles.deckCard} ${isGridView ? styles.deckCardGrid : styles.deckCardLine
                  }`}
              >
                <div className={styles.startButtonWrapper}>
                  <StartLessonButton
                    title={deck.cardIds?.length === 0 ? "No cards in this deck yet" : "Start studying"}
                    disabled={deck.cardIds?.length === 0}
                    onClick={(e: React.MouseEvent) => {
                      e.preventDefault();
                      e.stopPropagation();

                      if (deck.cardIds.length === 0) return;

                      router.push("/learning/" + deck.id);
                    }}
                  />
                </div>

                <div className={styles.deckTop}>
                  <h2 className={styles.deckName}>{deck.name}</h2>
                  {deck.description && (
                    <p className={styles.deckDescription}>{deck.description}</p>
                  )}
                </div>

                <div className={styles.deckStats}>
                  <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.cardIds.length}</span>
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

                  <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.learningCards}</span>
                    <span className={styles.statLabel}>Learning</span>
                  </div>

                  <div className={styles.stat}>
                    <span className={styles.statValue}>{deck.reviewCards}</span>
                    <span className={styles.statLabel}>Review</span>
                  </div>

                </div>
              </Link>
            ))
        )}
      </section>
    </main>
  );
}
