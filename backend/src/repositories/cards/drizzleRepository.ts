import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";

import { db } from "../../db/client.js";
import { Card, cards, decks } from "../../db/schema.js";
import { BatchUpsertCardsData, CardUpdateData, CreateCardData } from "../../docs/schemas.js";
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

  async hasCardAccess(cardId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ id: cards.id })
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.id, cardId), eq(decks.userId, userId)))
      .limit(1);

    return result.length > 0;
  }

  async hasCardsAccess(cardIds: string[], userId: string): Promise<boolean> {
    if (cardIds.length === 0) {
      return true;
    }

    const ownedCards = await db
      .select({ id: cards.id })
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(inArray(cards.id, cardIds), eq(decks.userId, userId)));

    return ownedCards.length === cardIds.length;
  }

  async getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
    return db
      .select(cardColumns)
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.deckId, deckId), eq(decks.userId, userId)));
  }

  async getCardById(cardId: string, userId: string): Promise<Card | null> {
    const [card] = await db
      .select(cardColumns)
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.id, cardId), eq(decks.userId, userId)))
      .limit(1);

    return card ?? null;
  }

  async createCard(cardData: CreateCardData): Promise<Card> {
    const [newCard] = await db.insert(cards).values(cardData).returning();

    return newCard;
  }

  async updateCard(cardId: string, cardData: CardUpdateData): Promise<Card | null> {
    const [updatedCard] = await db
      .update(cards)
      .set({
        ...cardData,
        updatedAt: new Date(),
      })
      .where(eq(cards.id, cardId))
      .returning();

    return updatedCard ?? null;
  }

  async upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]> {
    const values = cardsData.cards.map((card) => ({
      id: card.id,
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
      })
      .returning();
  }

  async deleteCard(cardId: string): Promise<void> {
    await db.delete(cards).where(eq(cards.id, cardId));
  }

  async batchDeleteCard(deckId: string): Promise<void> {
    await db.delete(cards).where(eq(cards.deckId, deckId));
  }
}

export const drizzleCardsRepository = new DrizzleCardsRepository();
