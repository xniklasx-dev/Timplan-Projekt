import { Card, Deck } from "./definitions";

export function getDeckById(decks: Deck[], id: string): Deck | undefined {
  return decks.find((deck) => String(deck.id) === id);
}

export function getCardsForDeck(deck: Deck, allCards: Card[]): Card[] {
  return allCards.filter((card) => deck.cardIds.includes(card.id));
}

export function getNextCard(cards: Card[], currentIndex: number): Card | null {
  if (currentIndex + 1 >= cards.length) return null;
  return cards[currentIndex + 1];
}

/**
 * Bewertet eine Karte (Again/Hard/Good/Easy)
 */
export function rateCard(card: Card, rating: 0 | 1 | 2 | 3): Card {
  const now = new Date();

  return {
    ...card,
    rating,
    totalReviews: card.totalReviews + 1,
    correctReviews:
      rating >= 2 ? card.correctReviews + 1 : card.correctReviews,
    lastReview: now,
    due: calculateNextDueDate(rating),
    state: getNewState(rating),
    updatedAt: now,
  };
}

/**
 * Berechnet das nächste Fälligkeitsdatum (vereinfachtes SRS)
 */
function calculateNextDueDate(rating: 0 | 1 | 2 | 3): Date {
  const now = new Date();
  const daysMap = {
    0: 0,  // again
    1: 1,  // hard
    2: 3,  // good
    3: 7,  // easy
  };

  const days = daysMap[rating];
  now.setDate(now.getDate() + days);
  return now;
}

/**
 * Setzt den neuen Lernstatus
 */
function getNewState(rating: 0 | 1 | 2 | 3): Card["state"] {
  if (rating === 0) return "learning";
  if (rating === 1) return "learning";
  return "review";
}
