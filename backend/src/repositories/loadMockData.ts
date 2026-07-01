import type { Card } from "../db/schema.js";
import mockCardsJson from "../../mockData/mockCards.json" with { type: "json" };
import type { MemoryCardsRepository } from "./cards/memoryCardsRepository.js";

type MemoryRepositories = {
  //add your memory repository here
  cardsRepository: MemoryCardsRepository;
};

type MockCard = Omit<Card, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function loadMockData(repositories: MemoryRepositories): void {
  //load your mock data into your repository here
  const cards = (mockCardsJson as MockCard[]).map(toCard);
  repositories.cardsRepository.loadCards(cards);
}

function toCard(mockCard: MockCard): Card {
  return {
    ...mockCard,
    createdAt: new Date(mockCard.createdAt),
    updatedAt: new Date(mockCard.updatedAt),
  };
}
