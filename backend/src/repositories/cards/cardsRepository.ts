import { Card } from "../../db/schema.js";
import { BatchUpsertCardsData, CreateCardData, CardUpdateData } from "../../validation/cardSchemas.js";

export interface CardsRepository {
  getCardsByDeckId(deckId: string, userId: string): Promise<Card[]>;

  getCardById(cardId: string, deckId: string, userId: string): Promise<Card | null>;

  createCard(cardData: CreateCardData): Promise<Card>;

  updateCard(cardId: string, deckId: string, cardData: CardUpdateData): Promise<Card | null>;

  upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]>;

  cardsBelongToDeck(cardIds: string[], deckId: string): Promise<boolean>;

  deleteCard(cardId: string, deckId: string): Promise<boolean>;

  deleteCardsByIds(deckId: string, cardIds: string[]): Promise<number>;

  batchDeleteCard(deckId: string): Promise<void>;
}
