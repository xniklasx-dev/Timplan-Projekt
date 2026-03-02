"use client";
import { useParams } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";
import LearnCard from "../../../ui/learning_cards/learning_cards";
import DashboardLearning from "@/app/ui/learning_cards/dashboard_learning";

import decksData from "@/app/lib/placeholder-decks.json";
import cardsData from "@/app/lib/placeholder-cards.json";

import { Deck, Card } from "../../../lib/definitions";
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
  const initialDeckCards = getCardsForDeck(selectedDeck, cards);

  const [deckCards, setDeckCards] = useState(initialDeckCards);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentCard = deckCards[currentIndex];

  const changeIndex = (index: number) => {
    if (index >= 0 && index < deckCards.length) {
      setCurrentIndex(index);
    }};

  const handleRate = (rating: 0 | 1 | 2 | 3) => {
    const updatedCard = rateCard(currentCard, rating);

    // Karte im Array ersetzen
    const updatedCards = [...deckCards];
    updatedCards[currentIndex] = updatedCard;

    setDeckCards(updatedCards);
    setCurrentIndex((prev) => prev + 1);}
  
  if (!currentCard) {
    return <div>Session beendet 🎉</div>;}
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>{selectedDeck.name} {currentIndex + 1}/{selectedDeck.totalCards}</h1>
        <LearnCard key={currentCard.id} card={currentCard} currentIndex={currentIndex} onRate={handleRate} changeIndex={changeIndex} />
      </main>
    </div>
  );
}

