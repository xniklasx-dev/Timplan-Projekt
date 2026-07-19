import { env } from "../config/env.js";
import type { CardsRepository } from "./cards/cardsRepository.js";
import { DrizzleCardsRepository } from "./cards/drizzleCardsRepository.js";
import { MemoryCardsRepository } from "./cards/memoryCardsRepository.js";
import { loadMockData } from "./loadMockData.js";
import { DrizzleSearchRepository } from "./search/drizzleSearchRepository.js";
import { MemorySearchRepository } from "./search/memorySearchRepository.js";
import type { SearchRepository } from "./search/searchRepository.js";
import type { UsersRepository } from "./users/usersRepository.js";
import { DrizzleUsersRepository } from "./users/drizzleUsersRepository.js";
import { MemoryUsersRepository } from "./users/memoryUsersRepository.js";
import type { DecksRepository } from "./decks/decksRepository.js";
import { DrizzleDecksRepository } from "./decks/drizzleDecksRepository.js";
import { MemoryDecksRepository } from "./decks/memoryDecksRepository.js";

type Repositories = {
  //add your repository interface here
  cardsRepository: CardsRepository;
  searchRepository: SearchRepository;
  usersRepository: UsersRepository;
  decksRepository: DecksRepository;
};

function createRepositories(): Repositories {
  if (env.dataSource === "memory") {
    //create your memory repository here
    const cardsRepository = new MemoryCardsRepository();
    const usersRepository = new MemoryUsersRepository();
    const decksRepository = new MemoryDecksRepository(cardsRepository);

    loadMockData({
      //pass your memory repository to the mock loader here
      cardsRepository,
      decksRepository,
      usersRepository,
    });

    return {
      //return your memory repository here
      cardsRepository,
      searchRepository: new MemorySearchRepository(cardsRepository, decksRepository),
      usersRepository,
      decksRepository,
    };
  }

  return {
    //create and return your Drizzle repository here
    cardsRepository: new DrizzleCardsRepository(),
    searchRepository: new DrizzleSearchRepository(),
    usersRepository: new DrizzleUsersRepository(),
    decksRepository: new DrizzleDecksRepository(),
  };
}

export const {
  //add your repository here
  cardsRepository,
  searchRepository,
  usersRepository,
  decksRepository,
} = createRepositories();
