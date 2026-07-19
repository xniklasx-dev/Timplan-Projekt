////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { MemoryCardsRepository } from "../cards/memoryCardsRepository.js";
import type { MemoryDecksRepository } from "../decks/memoryDecksRepository.js";
import { SearchRepository } from "./searchRepository.js";

export class MemorySearchRepository implements SearchRepository {
  constructor(
    private readonly cardsRepository: MemoryCardsRepository,
    private readonly decksRepository: MemoryDecksRepository,
  ) {}

  async search(query: string, userId: string) {
    const lowerQuery = query.toLowerCase();
    const decks = await this.decksRepository.getDecksByUserId(userId);

    const deckMatches = decks
      .filter((deck) => {
        return deck.name.toLowerCase().includes(lowerQuery)
          || deck.description?.toLowerCase().includes(lowerQuery)
          || deck.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery));
      })
      .sort((firstDeck, secondDeck) => firstDeck.name.localeCompare(secondDeck.name))
      .slice(0, 10);

    const deckIds = new Set(decks.map((deck) => deck.id));
    const cardLimit = 20 - deckMatches.length;

    const cardMatches = this.cardsRepository
      .getAllCards()
      .filter((card) => deckIds.has(card.deckId))
      .filter((card) => {
        return card.front.toLowerCase().includes(lowerQuery)
          || card.back.toLowerCase().includes(lowerQuery)
          || card.hint?.toLowerCase().includes(lowerQuery)
          || card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
      })
      .sort((firstCard, secondCard) => firstCard.front.localeCompare(secondCard.front))
      .slice(0, cardLimit);

    return [
      ...deckMatches.map((deck) => ({
        id: deck.id,
        title: deck.name,
        link: `/decks/${deck.id}`,
        type: "deck" as const,
      })),
      ...cardMatches.map((card) => ({
        id: card.id,
        title: card.front,
        link: `/decks/${card.deckId}`,
        type: "card" as const,
      })),
    ];
  }
}
