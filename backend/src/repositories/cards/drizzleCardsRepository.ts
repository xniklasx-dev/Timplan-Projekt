import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";
import { db } from "../../db/client.js";
import { Card, cards, decks } from "../../db/schema.js";
import { ApiError } from "../../middleware/errorHandler.js";
import { BatchUpsertCardsData, CardUpdateData, CreateCardData } from "../../validation/cardSchemas.js";
import { CardsRepository } from "./cardsRepository.js";

const cardColumns = getTableColumns(cards);

export class DrizzleCardsRepository implements CardsRepository {
  async hasDeckAccess(deckId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ id: decks.id })
      .from(decks)
      .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
      .limit(1);

    return result.length > 0;
  }

  async getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
    return db
      .select(cardColumns)
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.deckId, deckId), eq(decks.userId, userId)));
  }

  async getCardById(cardId: string, deckId: string, userId: string): Promise<Card | null> {
    const [card] = await db
      .select(cardColumns)
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.id, cardId), eq(decks.userId, userId), eq(cards.deckId, deckId)))
      .limit(1);

    return card ?? null;
  }

  async createCard(cardData: CreateCardData): Promise<Card> {
    const [newCard] = await db.insert(cards).values(cardData).returning();

    return newCard;
  }

  async updateCard(cardId: string, deckId: string, cardData: CardUpdateData): Promise<Card | null> {
    const [updatedCard] = await db
      .update(cards)
      .set({
        ...cardData,
        updatedAt: new Date(),
      })
      .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
      .returning();

    return updatedCard ?? null;
  }

  async upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]> {
    const existingCardIds = cardsData.cards.flatMap((card) => card.cardId ? [card.cardId] : []);

    if (!await this.cardsBelongToDeck(existingCardIds, cardsData.deckId)) {
      throw new ApiError(400, "One or more cards do not belong to this deck");
    }

    const values = cardsData.cards.map((card) => ({
      id: card.cardId,
      deckId: cardsData.deckId,
      front: card.front,
      back: card.back,
      hint: card.hint,
      tags: card.tags,
    }));

    return db
      .insert(cards)
      .values(values)
      .onConflictDoUpdate({
        target: cards.id,
        set: {
          front: sql`EXCLUDED.front`,
          back: sql`EXCLUDED.back`,
          hint: sql`EXCLUDED.hint`,
          tags: sql`EXCLUDED.tags`,
          updatedAt: new Date(),
        },
        setWhere: eq(cards.deckId, cardsData.deckId),
      })
      .returning();
  }

  async cardsBelongToDeck(cardIds: string[], deckId: string): Promise<boolean> {
    const uniqueCardIds = Array.from(new Set(cardIds));

    if (uniqueCardIds.length === 0) {
      return true;
    }

    const matchingCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(and(inArray(cards.id, uniqueCardIds), eq(cards.deckId, deckId)));

    return matchingCards.length === uniqueCardIds.length;
  }

  async deleteCard(cardId: string, deckId: string): Promise<boolean> {
    const deletedCards = await db
      .delete(cards)
      .where(and(eq(cards.id, cardId), eq(cards.deckId, deckId)))
      .returning({ id: cards.id });

    return deletedCards.length > 0;
  }

  async deleteCardsByIds(deckId: string, cardIds: string[]): Promise<number> {
    if (cardIds.length === 0) {
      return 0;
    }

    const deletedCards = await db
      .delete(cards)
      .where(and(eq(cards.deckId, deckId), inArray(cards.id, cardIds)))
      .returning({ id: cards.id });

    return deletedCards.length;
  }

  async batchDeleteCard(deckId: string): Promise<void> {
    await db.delete(cards).where(eq(cards.deckId, deckId));
  }
}
