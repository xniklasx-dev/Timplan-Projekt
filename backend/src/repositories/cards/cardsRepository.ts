import { Card } from "../../db/schema.js";
import { BatchUpsertCardsData, CreateCardData, CardUpdateData } from "../../docs/schemas.js";

export interface CardsRepository {
  hasDeckAccess(deckId: string, userId: string): Promise<boolean>;
  
  hasCardAccess(cardId: string, userId: string): Promise<boolean>;

  hasCardsAccess(cardIds: string[], userId: string): Promise<boolean>;

  getCardsByDeckId(deckId: string, userId: string): Promise<Card[]>;

  getCardById(cardId: string, userId: string): Promise<Card | null>;

  createCard(cardData: CreateCardData): Promise<Card>;

  updateCard(cardId: string, cardData: CardUpdateData): Promise<Card | null>;

  upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]>;

  deleteCard(cardId: string): Promise<void>;
}
