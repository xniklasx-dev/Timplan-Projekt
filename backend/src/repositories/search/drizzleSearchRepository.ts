////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import { and, asc, eq, or, sql } from "drizzle-orm";
import type { SQLWrapper } from "drizzle-orm";

import { db } from "../../db/client.js";
import { cards, decks } from "../../db/schema.js";
import { SearchRepository } from "./searchRepository.js";

export class DrizzleSearchRepository implements SearchRepository {
  async search(query: string, userId: string) {
    const deckMatches = await db
      .select({id: decks.id,title: decks.name})
      .from(decks)
      .where(and(
        eq(decks.userId, userId),
        or(
          containsText(decks.name, query),
          containsText(decks.description, query),
          containsText(sql`array_to_string(${decks.tags}, ' ')`, query),
        ),
      ))
      .orderBy(asc(decks.name))
      .limit(10);

    const cardMatches = await db
      .select({id: cards.id,deckId: cards.deckId, title: cards.front})
      .from(cards)
      .innerJoin(decks, eq(decks.id, cards.deckId))
      .where(and(
        eq(decks.userId, userId),
        or(
          containsText(cards.front, query),
          containsText(cards.back, query),
          containsText(cards.hint, query),
          containsText(sql`array_to_string(${cards.tags}, ' ')`, query),
        ),
      ))
      .orderBy(asc(cards.front))
      .limit(20 - deckMatches.length);

    return [
      ...deckMatches.map((deck) => ({
        id: deck.id,
        title: deck.title,
        link: `/decks/${deck.id}`,
        type: "deck" as const,
      })),
      ...cardMatches.map((card) => ({
        id: card.id,
        title: card.title,
        link: `/decks/${card.deckId}`,
        type: "card" as const,
      })),
    ];
  }
}

function containsText(column: SQLWrapper, query: string) {
  return sql<boolean>`position(lower(${query}) in lower(coalesce(${column}, ''))) > 0`;
}
