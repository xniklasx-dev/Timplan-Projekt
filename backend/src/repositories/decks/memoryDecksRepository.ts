////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { randomUUID } from "node:crypto";

import type { Deck } from "../../db/schema.js";
import type {
  CreateDeckData,
  DeckUpdateData,
} from "../../validation/deckSchemas.js";
import type { CardsRepository } from "../cards/cardsRepository.js";
import type { DecksRepository } from "./decksRepository.js";

type CardCleanupRepository = Pick<CardsRepository, "batchDeleteCard">;

export class MemoryDecksRepository implements DecksRepository {
  private readonly decks = new Map<string, Deck>();

  constructor(private readonly cardsRepository: CardCleanupRepository) {}

  loadDecks(decks: Deck[]): void {
    for (const deck of decks) {
      this.decks.set(deck.id, cloneDeck(deck));
    }
  }

  getAllDecks(): Deck[] {
    return Array.from(this.decks.values()).map(cloneDeck);
  }

  async hasDeckAccess(deckId: string, userId: string): Promise<boolean> {
    const deck = this.decks.get(deckId);

    return deck?.userId === userId;
  }

  async getDecksByUserId(userId: string): Promise<Deck[]> {
    return Array.from(this.decks.values())
      .filter((deck) => deck.userId === userId)
      .sort((firstDeck, secondDeck) =>
        firstDeck.name.localeCompare(secondDeck.name, "de", {
          sensitivity: "base",
          numeric: true,
        }),
      )
      .map(cloneDeck);
  }

  async getDeckById(deckId: string, userId: string): Promise<Deck | null> {
    const deck = this.decks.get(deckId);

    if (!deck || deck.userId !== userId) {
      return null;
    }

    return cloneDeck(deck);
  }

  async createDeck(deckData: CreateDeckData): Promise<Deck> {
    const now = new Date();

    const deck: Deck = {
      id: randomUUID(),
      userId: deckData.userId,
      parentDeckId: deckData.parentDeckId ?? null,
      name: deckData.name,
      description: deckData.description ?? null,
      tags: deckData.tags ? [...deckData.tags] : null,
      color: deckData.color ?? null,
      createdAt: now,
      updatedAt: now,
      lastStudied: null,
    };

    this.decks.set(deck.id, deck);

    return cloneDeck(deck);
  }

  async updateDeck(
    deckId: string,
    userId: string,
    deckData: DeckUpdateData,
  ): Promise<Deck | null> {
    const existingDeck = this.decks.get(deckId);

    if (!existingDeck || existingDeck.userId !== userId) {
      return null;
    }

    const definedUpdateData = removeUndefinedValues(deckData);

    const updatedTags =
      definedUpdateData.tags === undefined
        ? existingDeck.tags
        : definedUpdateData.tags === null
          ? null
          : [...definedUpdateData.tags];

    const updatedDeck: Deck = {
      ...existingDeck,
      ...definedUpdateData,

      tags: updatedTags,

      id: existingDeck.id,
      userId: existingDeck.userId,
      createdAt: existingDeck.createdAt,

      updatedAt: new Date(),
    };

    this.decks.set(deckId, updatedDeck);

    return cloneDeck(updatedDeck);
  }

  async deleteDeck(deckId: string, userId: string): Promise<boolean> {
    const existingDeck = this.decks.get(deckId);

    if (!existingDeck || existingDeck.userId !== userId) {
      return false;
    }

    await this.cardsRepository.batchDeleteCard(deckId);

    const now = new Date();

    for (const childDeck of this.decks.values()) {
      if (childDeck.parentDeckId !== deckId) {
        continue;
      }

      this.decks.set(childDeck.id, {
        ...childDeck,
        parentDeckId: existingDeck.parentDeckId,
        updatedAt: now,
      });
    }

    return this.decks.delete(deckId);
  }
}

function removeUndefinedValues<T extends object>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

function cloneDeck(deck: Deck): Deck {
  return {
    ...deck,
    tags: deck.tags ? [...deck.tags] : null,
    createdAt: new Date(deck.createdAt),
    updatedAt: new Date(deck.updatedAt),
    lastStudied: deck.lastStudied ? new Date(deck.lastStudied) : null,
  };
}
