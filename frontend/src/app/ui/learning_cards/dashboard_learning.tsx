import styles from './dashboard_learning.module.css';

import decksData from "@/app/lib/placeholder-decks.json";
import cardsData from "@/app/lib/placeholder-cards.json";

import { Deck, Card } from "../../lib/definitions";

function hydrateDeck(raw: any): Deck {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastStudied: raw.lastStudied
      ? new Date(raw.lastStudied)
      : undefined,
  };
}

function hydrateCard(raw: any): Card {
  return {
    ...raw,
    due: new Date(raw.due),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastReview: raw.lastReview ? new Date(raw.lastReview) : undefined,
  };
}

const decks: Deck[] = decksData.map(hydrateDeck);
const cards: Card[] = cardsData.map(hydrateCard);



export default function DashboardLearning() {
    const recentlyStudiedDecks = decks
    .filter(deck => deck.lastStudied)
    .sort(
      (a, b) =>
        b.lastStudied!.getTime() - a.lastStudied!.getTime()
    )
    .slice(0, 5);


    
    return (
        <div className={styles.outer}>
            <div className={styles.recentlyStudied}>
              {recentlyStudiedDecks.map(deck => {
                const deckCards = cards.filter(c => c.deckId === deck.id);
                const cardCounts = deckCards.reduce(
                  (acc, card) => {
                    if (card.rating === 0) acc.new += 1;
                    else if(card.rating === 1) acc.easy += 1;
                    else if (card.rating === 2) acc.medium += 1;
                    else if (card.rating === 3) acc.hard += 1;
                    return acc;
                  },
                  { new: 0, easy: 0, medium: 0, hard: 0 }
                );
                const totalCards = cardCounts.easy + cardCounts.medium + cardCounts.hard;

                return (
                  <div key={deck.id} className={styles.deck}>
                    <h2>{deck.name}</h2>
                    <div className={styles.line}></div>
                    <div className={styles.difficultyWrapper}>
                      <div className={styles.difficultyBar}>
                        <div className={styles.new} style={{ width: `${(cardCounts.new / totalCards) * 100}%` }}/>
                        <div className={styles.easy} style={{ width: `${(cardCounts.easy / totalCards) * 100}%` }}/>
                        <div className={styles.medium} style={{ width: `${(cardCounts.medium / totalCards) * 100}%` }}/>
                        <div className={styles.hard} style={{ width: `${(cardCounts.hard / totalCards) * 100}%` }}/>
                      </div>
                      <div className={styles.tooltip}>
                        New: {cardCounts.new} <br />
                        Easy: {cardCounts.easy} <br />
                        Medium: {cardCounts.medium} <br />
                        Hard: {cardCounts.hard} <br />
                        Total: {totalCards}
                      </div>
                    </div>
                    <p className={styles.lastLearned}>Last learned: {deck.lastStudied?.toLocaleDateString()}</p>
                    <p className={styles.cardsDueToday}>Cards due today: {deckCards.filter(c => c.due <= new Date()).length}</p> 
                    {deckCards.filter(c => c.due <= new Date()).length > 0 && (
                      <button className={styles.learn_button}>Learn</button>
                    )}
                  </div>
                );
            })}
            </div>
        </div>
    );
}