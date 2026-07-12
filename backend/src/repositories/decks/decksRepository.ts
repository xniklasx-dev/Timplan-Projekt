import type { Deck } from "../../db/schema.js";
import type {
  CreateDeckData,
  DeckUpdateData,
} from "../../validation/deckSchemas.js";

export interface DecksRepository {
  hasDeckAccess(deckId: string, userId: string): Promise<boolean>;

  getDecksByUserId(userId: string): Promise<Deck[]>;

  getDeckById(deckId: string, userId: string): Promise<Deck | null>;

  createDeck(deckData: CreateDeckData): Promise<Deck>;

  updateDeck(
    deckId: string,
    userId: string,
    deckData: DeckUpdateData,
  ): Promise<Deck | null>;

  deleteDeck(deckId: string, userId: string): Promise<boolean>;
}
