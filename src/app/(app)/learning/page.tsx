"use client";
import { useState } from "react";
import styles from "./page.module.css";
import LearnCard from "@/app/ui/learning_cards/learning_cards";
import {decks} from "@/app/lib/placeholder-decks";
import {cards} from "@/app/lib/placeholder-cards";
import { getCardsForDeck, rateCard } from "@/app/lib/learning-service";


export default function Learning() {
  const selectedDeck = decks[0];
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
        <LearnCard card={currentCard} currentIndex={currentIndex} onRate={handleRate} changeIndex={changeIndex} />
      </main>
    </div>
  );
}

