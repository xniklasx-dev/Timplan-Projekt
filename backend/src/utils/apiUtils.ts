import { and, eq, inArray } from "drizzle-orm";
import { db } from "../db/client.js";
import { cards, decks } from "../db/schema.js";
import { ApiError } from "../middleware/errorHandler.js";
import { UUIDSchema } from "../docs/schemas.js";

export function parseUUID(id: string) {
  return UUIDSchema.parse(id);
}

export async function isDeckOwnedByUser(deckId: string, userId: string): Promise<boolean> {
  const result = await db
  .select({ id: decks.id })
  .from(decks)
  .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
  .limit(1);

  return result.length > 0;
}

export async function isCardOwnedByUser(cardId: string, userId: string): Promise<boolean> {
  const result = await db
  .select({ id: cards.id })
  .from(cards)
  .innerJoin(decks, eq(decks.id, cards.deckId))
  .where(and(eq(cards.id, cardId), eq(decks.userId, userId)))
  .limit(1);

  return result.length > 0;
}

export async function requireDeckOwnership(deckId: string, userId: string): Promise<void> {
  if (!await isDeckOwnedByUser(deckId, userId)) {
    throw new ApiError(403, "You do not have access to this deck");
  }
}

export async function requireCardOwnership(cardId: string, userId: string): Promise<void> {
  if (!await isCardOwnedByUser(cardId, userId)) {
    throw new ApiError(403, "You do not have access to this card");
  }
}

export async function requireCardsOwnership(cardIds: string[],currentUserId: string,): Promise<void> {
  if (cardIds.length === 0) {
    return;
  }

  const ownedCards = await db
    .select({ id: cards.id })
    .from(cards)
    .innerJoin(decks, eq(decks.id, cards.deckId))
    .where(and(inArray(cards.id, cardIds), eq(decks.userId, currentUserId)));

  if (ownedCards.length !== cardIds.length) {
    throw new ApiError(403, "You do not have access to one or more cards");
  }
}