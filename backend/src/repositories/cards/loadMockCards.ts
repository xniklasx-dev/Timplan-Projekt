import type { Card } from "../../db/schema.js";
import { MemoryCardsRepository, memoryCardsRepository } from "./memoryRepository.js";
import mockCardsJson from "../../../mockData/mockCards.json" with { type: "json" };

type MockCard = Omit<Card, "due" | "createdAt" | "updatedAt"> & {
  due: string;
  createdAt: string;
  updatedAt: string;
};

const loadedRepositories = new WeakSet<MemoryCardsRepository>();

export function loadMockCards(repository: MemoryCardsRepository = memoryCardsRepository): MemoryCardsRepository {
  if (loadedRepositories.has(repository)) {
    return repository;
  }

  repository.loadCards((mockCardsJson as MockCard[]).map(toCard));
  loadedRepositories.add(repository);

  return repository;
}

function toCard(mockCard: MockCard): Card {
  return {
    ...mockCard,
    due: new Date(mockCard.due),
    createdAt: new Date(mockCard.createdAt),
    updatedAt: new Date(mockCard.updatedAt),
  };
}
