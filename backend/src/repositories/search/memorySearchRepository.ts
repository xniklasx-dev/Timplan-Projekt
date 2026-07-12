////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { MemoryCardsRepository } from "../cards/memoryCardsRepository.js";
import { SearchRepository } from "./searchRepository.js";

export class MemorySearchRepository implements SearchRepository {
  constructor(private readonly cardsRepository: MemoryCardsRepository) {}

  async search(query: string, userId: string) {
    const lowerQuery = query.toLowerCase();
    const cards = this.cardsRepository.getCardsForUser(userId);

    return cards
      .filter((card) => {
        return card.front.toLowerCase().includes(lowerQuery)
          || card.back.toLowerCase().includes(lowerQuery)
          || card.hint?.toLowerCase().includes(lowerQuery)
          || card.tags.some((tag) => tag.toLowerCase().includes(lowerQuery));
      })
      .slice(0, 20)
      .map((card) => ({
        id: card.id,
        title: card.front,
        link: `/decks/${card.deckId}`,
        type: "card" as const,
      }));
  }
}
