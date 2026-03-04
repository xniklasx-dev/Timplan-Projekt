import { Card, Deck } from "./definitions";

export type SearchResult = {
  id: string;
  title: string;
  link: string;
};

export function searchCards(cards: Card[], lowerQuery: string): Card[] {
  return cards.filter((card) => {
    const front = card.front.toLowerCase();
    const back = card.back.toLowerCase();
    return front.includes(lowerQuery) || back.includes(lowerQuery);
  });
}

export function searchDecks(decks: Deck[], lowerQuery: string): Deck[] {
  return decks.filter((deck) => deck.name.toLowerCase().includes(lowerQuery));
}

export function fillSearchResults(cards: Card[], decks: Deck[]): SearchResult[] {
  const cardResults = cards.map((card) => ({
    id: `card-${card.id}`,
    title: card.front,
    link: `/decks/${card.deckId}`,
  }));

  const deckResults = decks.map((deck) => ({
    id: `deck-${deck.id}`,
    title: deck.name,
    link: `/decks/${deck.id}`,
  }));

  return [...deckResults, ...cardResults];
}

export function search(query: string, cards: Card[], decks: Deck[]): SearchResult[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const lowerQuery = trimmed.toLowerCase();
  const foundCards = searchCards(cards, lowerQuery);
  const foundDecks = searchDecks(decks, lowerQuery);

  return fillSearchResults(foundCards, foundDecks);
}