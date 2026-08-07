import { Card, Deck, StatsMap } from "./definitions";

export function getDeckById(decks: Deck[], id: string): Deck | undefined {
  return decks.find((deck) => String(deck.id) === id);
}

export function getCardsForDeck(deck: Deck, allCards: Card[]): Card[] {
  return allCards.filter((card) => deck.cardIds.includes(card.id));
}

export function isDueToday(card: Card, now: Date = new Date()): boolean {
  if (card.state === "new") return true;

  const endOfToday = new Date(now);
  endOfToday.setHours(23, 59, 59, 999);

  return card.due <= endOfToday;
}

export function getNextCard(cards: Card[], currentIndex: number): Card | null {
  if (currentIndex + 1 >= cards.length) return null;
  return cards[currentIndex + 1];
}


export function rateCard(card: Card, rating: NonNullable<Card["rating"]>, stats: StatsMap): { updatedCard: Card; updatedStats: StatsMap } {
  const now = new Date();
  const todayKey = now.toISOString().split("T")[0];

  const difficulty: "easy" | "medium" | "hard" =
    rating === "easy" ? "easy" : rating === "good" ? "medium" : "hard";

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
    due: calculateNextDueDate(rating),
    state: getNewState(rating),
    updatedAt: now,
  };
  return { updatedCard, updatedStats };
}

function calculateNextDueDate(rating: NonNullable<Card["rating"]>): Date {
  const now = new Date();
  const daysMap = {
    again: 0,
    hard: 0,
    good: 1,
    easy: 2,
  };

  const days = daysMap[rating];
  now.setDate(now.getDate() + days);
  return now;
}


function getNewState(rating: NonNullable<Card["rating"]>): Card["state"] {
  if (rating === "again" || rating === "hard") return "learning";
  return "review";
}
