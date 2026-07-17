//AI-generated code
import { and, eq, getTableColumns } from "drizzle-orm";

import { db } from "../../db/client.js";
import {
  cardProgress,
  cards,
  decks,
  type CardProgress,
} from "../../db/schema.js";
import type {
  CardProgressUpdateData,
  CreateCardProgressData,
} from "../../validation/cardProgressSchemas.js";
import type { CardProgressRepository } from "./cardProgressRepository.js";

const cardProgressColumns = getTableColumns(cardProgress);

export class DrizzleCardProgressRepository implements CardProgressRepository {
  async hasDeckAccess(cardId: string, userId: string): Promise<boolean> {
    const result = await db
      .select({ id: cards.id })
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cards.id, cardId), eq(decks.userId, userId)))
      .limit(1);

    return result.length > 0;
  }

  async getCardProgress(
    cardId: string,
    userId: string,
  ): Promise<CardProgress | null> {
    const [progress] = await db
      .select(cardProgressColumns)
      .from(cardProgress)
      .innerJoin(cards, eq(cards.id, cardProgress.cardId))
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(eq(cardProgress.cardId, cardId), eq(decks.userId, userId)))
      .limit(1);

    return progress ?? null;
  }

  async createCardProgress(
    cardId: string,
    userId: string,
    data: CreateCardProgressData,
  ): Promise<CardProgress | null> {
    if (!await this.hasDeckAccess(cardId, userId)) {
      return null;
    }

    const [createdProgress] = await db
      .insert(cardProgress)
      .values({
        cardId,
        state: data.state ?? "new",
        rating: data.rating ?? null,
        due: data.due ? new Date(data.due) : new Date(),
        totalReviews: data.totalReviews ?? 0,
      })
      .onConflictDoNothing({ target: cardProgress.cardId })
      .returning();

    return createdProgress ?? null;
  }

  async updateCardProgress(
    cardId: string,
    userId: string,
    data: CardProgressUpdateData,
  ): Promise<CardProgress | null> {
    if (!await this.hasDeckAccess(cardId, userId)) {
      return null;
    }

    const [updatedProgress] = await db
      .update(cardProgress)
      .set({
        ...data,
        due: data.due ? new Date(data.due) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(cardProgress.cardId, cardId))
      .returning();

    return updatedProgress ?? null;
  }

  async deleteCardProgress(cardId: string, userId: string): Promise<boolean> {
    if (!await this.hasDeckAccess(cardId, userId)) {
      return false;
    }

    const deletedProgress = await db
      .delete(cardProgress)
      .where(eq(cardProgress.cardId, cardId))
      .returning({ cardId: cardProgress.cardId });

    return deletedProgress.length > 0;
  }
}

export const drizzleCardProgressRepository =
  new DrizzleCardProgressRepository();
