"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";
import LearnCard from "../../../ui/learning_cards/learning_cards";
import LearningEndPage from "@/app/ui/learning_cards/learning_end_page";

import decksData from "@/app/lib/placeholder-decks.json";
import cardsData from "@/app/lib/placeholder-cards.json";
import dateData from "@/app/lib/placeholder-dateData.json";

import { Deck, Card, StatsMap } from "../../../lib/definitions";
import { getDeckById, getCardsForDeck, rateCard } from "../../../lib/learning-service";

function hydrateCard(raw: any): Card {
  return {
    ...raw,
    due: new Date(raw.due),
    createdAt: new Date(raw.createdAt),
    updatedAt: new Date(raw.updatedAt),
    lastReview: raw.lastReview ? new Date(raw.lastReview) : undefined,
  };
}

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

const decks: Deck[] = decksData.map(hydrateDeck);
const cards: Card[] = cardsData.map(hydrateCard);



export default function Learning() {
  const params = useParams();
  const deckId = String(params.deckId);

  const selectedDeck = getDeckById(decks, deckId);
  if (!selectedDeck) {
    return <div>Deck nicht gefunden</div>;
  }
  const initialDeckCards = getCardsForDeck(selectedDeck, cards) .filter(card => card.due <= new Date());

  const [deckCards, setDeckCards] = useState(initialDeckCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [learnedCount, setLearnedCount] = useState(0);
  const [stats, setStats]= useState<StatsMap>(dateData);

  const currentCard = deckCards[currentIndex];

  const changeIndex = (index: number) => {
    if (index >= 0 && index < deckCards.length) {
      setCurrentIndex(index);
    }};

  const handleRate = (rating: 0 | 1 | 2 | 3) => {
    const { updatedCard, updatedStats } = rateCard(currentCard, rating, stats);

    setStats(updatedStats);

    // Karte im Array ersetzen
    if (rating === 0){
      const updatedCards = [...deckCards, updatedCard];
      updatedCards[currentIndex] = updatedCard;

      setDeckCards(updatedCards);
    }
    else{
    const updatedCards = [...deckCards];
    updatedCards[currentIndex] = updatedCard;
    setLearnedCount((prev) => prev + 1);

    setDeckCards(updatedCards);
    }

    setCurrentIndex((prev) => prev + 1);}
  
  if (!currentCard) {
    return (
      <div className={styles.page}>
        <main className={styles.main}>
          <h1>Congratulations! You've completed the deck {selectedDeck.name}!</h1>
          <LearningEndPage deckCards={deckCards}/>
        </main>
      </div>);}
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{selectedDeck.name} {learnedCount}/{initialDeckCards.length}</h1>
        <LearnCard key={currentCard.id + "-" + currentIndex} card={currentCard} currentIndex={currentIndex} onRate={handleRate} changeIndex={changeIndex} deckLength={initialDeckCards.length} />
      </main>
    </div>
  );
}