import { and, asc, eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { decks, type Deck } from "../../db/schema.js";
import type {
  CreateDeckData,
  DeckUpdateData,
} from "../../validation/deckSchemas.js";
import type { DecksRepository } from "./decksRepository.js";

export class DrizzleDecksRepository implements DecksRepository {
  async hasDeckAccess(deckId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({
        id: decks.id,
      })
      .from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .limit(1);

    return result.length > 0;
  }

  async getDecksByUserId(userId: string): Promise<Deck[]> {
    return db
      .select()
      .from(decks)
      .where(eq(decks.userId, userId))
      .orderBy(asc(decks.createdAt));
  }

  async getDeckById(deckId: string, userId: string): Promise<Deck | null> {
    const [deck] = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .limit(1);

    return deck ?? null;
  }

  async createDeck(deckData: CreateDeckData): Promise<Deck> {
    const [createdDeck] = await db
      .insert(decks)
      .values({
        userId: deckData.userId,
        parentDeckId: deckData.parentDeckId ?? null,
        name: deckData.name,
        description: deckData.description ?? null,
        tags: deckData.tags ?? null,
        color: deckData.color ?? null,
      })
      .returning();

    if (!createdDeck) {
      throw new Error("Failed to create deck");
    }

    return createdDeck;
  }

  async updateDeck(
    deckId: string,
    userId: string,
    deckData: DeckUpdateData,
  ): Promise<Deck | null> {
    const [updatedDeck] = await db
      .update(decks)
      .set({
        ...deckData,
        updatedAt: new Date(),
      })
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .returning();

    return updatedDeck ?? null;
  }

  async deleteDeck(deckId: string, userId: string): Promise<boolean> {
    const deletedDecks = await db
      .delete(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .returning({
        id: decks.id,
      });

    return deletedDecks.length > 0;
  }
}
