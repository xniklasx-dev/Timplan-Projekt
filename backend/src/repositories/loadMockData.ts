import type { Card, Deck, User } from "../db/schema.js";
import mockCardsJson from "../../mockData/mockCards.json" with { type: "json" };
import mockDecksJson from "../../mockData/mockDecks.json" with { type: "json" };
import mockUsersJson from "../../mockData/mockUsers.json" with { type: "json" };
import type { MemoryCardsRepository } from "./cards/memoryCardsRepository.js";
import type { MemoryDecksRepository } from "./decks/memoryDecksRepository.js";
import type { MemoryUsersRepository } from "./users/memoryUsersRepository.js";

type MemoryRepositories = {
  //add your memory repository here
  cardsRepository: MemoryCardsRepository;
  decksRepository: MemoryDecksRepository;
  usersRepository: MemoryUsersRepository;
};

type MockCard = Omit<Card, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type MockUser = Omit<User, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

type MockDeck = Omit<Deck, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export function loadMockData(repositories: MemoryRepositories): void {
  //load your mock data into your repository here
  const users = (mockUsersJson as MockUser[]).map(toUser);
  repositories.usersRepository.loadUsers(users);

  const decks = (mockDecksJson as MockDeck[]).map(toDeck);
  repositories.decksRepository.loadDecks(decks);

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

function toUser(mockUser: MockUser): User {
  return {
    ...mockUser,
    createdAt: new Date(mockUser.createdAt),
    updatedAt: new Date(mockUser.updatedAt),
  };
}

function toDeck(mockDeck: MockDeck): Deck {
  return {
    ...mockDeck,
    createdAt: new Date(mockDeck.createdAt),
    updatedAt: new Date(mockDeck.updatedAt),
  };
}
