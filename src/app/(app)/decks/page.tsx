'use client';

import { useState } from "react";
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

/*  // Example of static mock data
const mockDecks: DeckPreview[] = [
  {
    id: "1",
    name: "German Vocabulary",
    description: "Daily learning words",
    totalCards: 320,
    dueToday: 24,
    newCards: 10,
  },
  {
    id: "2",
    name: "Biology",
    description: "Cells & systems",
    totalCards: 120,
    dueToday: 5,
    newCards: 3,
  },
  {
    id: "3",
    name: "History 20th Century",
    totalCards: 210,
    dueToday: 0,
    newCards: 0,
  },
  {
    id: "4",
    name: "Physics Formulas",
    description: "Exam preparation",
    totalCards: 75,
    dueToday: 12,
    newCards: 5,
  },
  {
    id: "5",
    name: "German Vocabulary",
    description: "Daily learning words",
    totalCards: 320,
    dueToday: 24,
    newCards: 10,
  },
  {
    id: "6",
    name: "Biology",
    description: "Cells & systems",
    totalCards: 120,
    dueToday: 5,
    newCards: 3,
  },
];
*/

export default function Decks() {

  const [isGridView, setIsGridView] = useState(false);

  const [decks] = useState<DeckPreview[] | null>(initialDecks);

  const handleToggleView = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsGridView(event.target.checked);
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Deck Library</h1>

          <label className={styles.viewToggle}>
            <input type="checkbox" className={styles.toggleInput} checked={isGridView} onChange={handleToggleView} />

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
              className={`${styles.deckCard} ${isGridView ? styles.deckCardGrid : styles.deckCardLine
                }`}
            >
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

              <StartLessonButton />

            </div>
          ))
        )}
      </section>

    </main>
  );
}
