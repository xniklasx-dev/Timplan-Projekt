import styles from "./page.module.css";

type DeckPreview = {
  id: string;
  name: string;
  description?: string;

  tags?: string[];
  cardIds?: string[];

  color?: string;
  icon?: string;
  parentDeckId?: string;

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

const mockDecksCount : number = 16;

function generateMockDecks(count: number): DeckPreview[] {
  const generatedMockDecks: DeckPreview[] = [];

  for (let i = 1; i <= count; i++) {
    generatedMockDecks.push({
      id: i.toString(), 
      name: `Deck ${i}`,
      description: `Description for Deck ${i}`,
      totalCards: Math.floor(Math.random() * 500) + 50,
      dueToday: Math.floor(Math.random() * 50),
      newCards: Math.floor(Math.random() * 20),
    });
  }
  return generatedMockDecks;
}

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
  
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Deck Library</h1>
        <p className={styles.subtitle}>
          Select a deck to start studying
        </p>
      </header>

      <section className={styles.deckGrid}>
        {generateMockDecks(mockDecksCount).map((deck) => (
          <div key={deck.id} className={styles.deckCard}>
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

            <button className={styles.studyButton}>
              Study
            </button>
          </div>
        ))}
      </section>
    </main>
  );
}
