import { Card, Deck, DateData, StatsMap } from "./definitions";

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


export function rateCard(card: Card, rating: 0 | 1 | 2 | 3, stats: StatsMap): { updatedCard: Card; updatedStats: StatsMap } {
  const now = new Date();
  const todayKey = now.toISOString().split("T")[0];

  const difficulty: "easy" | "medium" | "hard" =
    rating >= 3 ? "hard" : rating === 2 ? "medium" : "easy";

  const todayEntry = stats[todayKey];
  let updatedStats = stats;

  if (todayEntry) {
    if (!todayEntry.cardIds.includes(card.id)) {
      updatedStats = {
        ...stats,
        [todayKey]: {
          ...todayEntry,
          cardIds: [...todayEntry.cardIds, card.id],
          [difficulty]: todayEntry[difficulty] + 1
        }
      };
    }
  }else{
    updatedStats = {
      ...stats,
      [todayKey]: {
        date: todayKey,
        cardIds: [card.id],
        easy: difficulty === "easy" ? 1 : 0,
        medium: difficulty === "medium" ? 1 : 0,
        hard: difficulty === "hard" ? 1 : 0
      }
   };
  }

  const updatedCard: Card = {
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
  return { updatedCard, updatedStats };
}

function calculateNextDueDate(rating: 0 | 1 | 2 | 3): Date {
  const now = new Date();
  const daysMap = {
    0: 0, 
    1: 1, 
    2: 3,
    3: 7,
  };

  const days = daysMap[rating];
  now.setDate(now.getDate() + days);
  return now;
}


function getNewState(rating: 0 | 1 | 2 | 3): Card["state"] {
  if (rating === 0) return "learning";
  if (rating === 1) return "learning";
  return "review";
}
