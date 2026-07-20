"use client";
import styles from "./dashboard_learning.module.css";

import decksData from "@/app/lib/placeholder-decks.json";
import cardsData from "@/app/lib/placeholder-cards.json";

import { Deck, Card } from "../../lib/definitions";
import { useRouter } from "next/navigation";

type RawCard = Omit<Card, "due" | "createdAt" | "updatedAt" | "lastReview"> & {
  due: string;
  createdAt: string;
  updatedAt: string;
  lastReview?: string;
};

function hydrateCard(raw: RawCard): Card {
  return {
    ...raw,
    due: new Date(raw.due),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
  };
}

type RawDeck = Omit<Deck, "createdAt" | "updatedAt" | "lastStudied"> & {
  createdAt: string;
  updatedAt: string;
  lastStudied?: string;
};

function hydrateDeck(raw: RawDeck): Deck {
  return {
    ...raw,
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastStudied: raw.lastStudied ? new Date(raw.lastStudied) : undefined,
  };
}

const rawDecks = decksData as RawDeck[];
const decks: Deck[] = rawDecks.map(hydrateDeck);
const rawCards = cardsData as RawCard[];
const cards: Card[] = rawCards.map(hydrateCard);

export default function DashboardLearning() {
  const router = useRouter();

  /*
  const recentlyStudiedDecks = decks
    .filter(deck => deck.lastStudied)
    .sort(
      (a, b) =>
        b.lastStudied!.getTime() - a.lastStudied!.getTime()
    )
    .slice(0, 5);
*/

  return (
    <div className={styles.outer}>
      {/*
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
                const totalCards = cardCounts.new + cardCounts.easy + cardCounts.medium + cardCounts.hard;

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
                    {(() => {
                      const learn = deckCards.filter(c => c.due <= new Date()).length > 0;
                      if(learn) {
                      return <button className={styles.learn_button_active} onClick={() => router.push("/learning/" + deck.id)}>Learn</button>;}
                      else {
                        return <button className={styles.learn_button_inactive} >Learn</button>;
                      }
                    })()}
                  </div>
                );
            })}
            </div> */}
    </div>
  );
}
