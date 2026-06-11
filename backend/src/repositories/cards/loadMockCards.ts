////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import type { Card } from "../../db/schema.js";
import mockCardsJson from "../../../mockData/mockCards.json" with { type: "json" };
import { memoryCardsRepository } from "./memoryCardsRepository.js";

type MockCard = Omit<Card, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

memoryCardsRepository.loadCards((mockCardsJson as MockCard[]).map(toCard));

export const mockCardsRepository = memoryCardsRepository;

function toCard(mockCard: MockCard): Card {

  return {
    ...mockCard,
    createdAt: new Date(mockCard.createdAt),
    updatedAt: new Date(mockCard.updatedAt),
  };
}
