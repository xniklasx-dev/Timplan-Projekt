import { Card } from "../../db/schema.js";
import { BatchUpsertCardsData, CreateCardData, CardUpdateData } from "../../validation/cardSchemas.js";

export interface CardsRepository {
  hasDeckAccess(deckId: string, userId: string): Promise<boolean>;

  getCardsByDeckId(deckId: string, userId: string): Promise<Card[]>;

  getCardById(cardId: string, userId: string): Promise<Card | null>;

  createCard(cardData: CreateCardData): Promise<Card>;

  updateCard(cardId: string, deckId: string, cardData: CardUpdateData): Promise<Card | null>;

  upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]>;

  deleteCard(cardId: string, deckId: string): Promise<boolean>;

  batchDeleteCard(deckId: string): Promise<void>;
}
