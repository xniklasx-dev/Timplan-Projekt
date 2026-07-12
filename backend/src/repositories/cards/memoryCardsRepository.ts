////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { randomUUID } from "node:crypto";

import { Card } from "../../db/schema.js";
import { ApiError } from "../../middleware/errorHandler.js";
import { BatchUpsertCardsData, CardUpdateData, CreateCardData } from "../../validation/cardSchemas.js";
import { CardsRepository } from "./cardsRepository.js";

export class MemoryCardsRepository implements CardsRepository {
  private readonly cards = new Map<string, Card>();
  private readonly deckOwners = new Map<string, string>();

  loadCards(cards: Card[]): void {
    for (const card of cards) {
      this.cards.set(card.id, card);
    }
  }

  getAllCards(): Card[] {
    return Array.from(this.cards.values());
  }

  getCardsForUser(userId: string): Card[] {
    return this.getAllCards().filter((card) => this.deckOwners.get(card.deckId) === userId);
  }

  async hasDeckAccess(deckId: string, userId: string): Promise<boolean> {
    const ownerId = this.deckOwners.get(deckId);

    if (!ownerId) {
      this.deckOwners.set(deckId, userId);
      return true;
    }

    return ownerId === userId;
  }

  async getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
    if (!await this.hasDeckAccess(deckId, userId)) {
      return [];
    }

    return Array.from(this.cards.values()).filter((card) => card.deckId === deckId);
  }

  async getCardById(cardId: string, deckId: string, userId: string): Promise<Card | null> {
    if (!await this.hasDeckAccess(deckId, userId)) {
      return null;
    }

    const card = this.cards.get(cardId);

    if (!card || card.deckId !== deckId) {
      return null;
    }

    return card;
  }

  async createCard(cardData: CreateCardData): Promise<Card> {
    const now = new Date();
    const card: Card = {
      id: randomUUID(),
      deckId: cardData.deckId,
      front: cardData.front,
      back: cardData.back,
      hint: cardData.hint ?? null,
      tags: cardData.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    this.cards.set(card.id, card);

    return card;
  }

  async updateCard(cardId: string, deckId: string, cardData: CardUpdateData): Promise<Card | null> {
    const existingCard = this.cards.get(cardId);

    if (!existingCard || existingCard.deckId !== deckId) {
      return null;
    }

    const updatedCard: Card = {
      ...existingCard,
      ...withoutUndefined(cardData),
      updatedAt: new Date(),
    };

    this.cards.set(cardId, updatedCard);

    return updatedCard;
  }

  async upsertManyCards(cardsData: BatchUpsertCardsData): Promise<Card[]> {
    const existingCardIds = cardsData.cards.flatMap((card) => card.cardId ? [card.cardId] : []);

    if (!await this.cardsBelongToDeck(existingCardIds, cardsData.deckId)) {
      throw new ApiError(400, "One or more cards do not belong to this deck");
    }

    const upsertedCards = cardsData.cards.map((cardData) => {
      const existingCard = cardData.cardId ? this.cards.get(cardData.cardId) : undefined;
      const now = new Date();
      const card: Card = {
        id: cardData.cardId ?? randomUUID(),
        deckId: cardsData.deckId,
        front: cardData.front,
        back: cardData.back,
        hint: cardData.hint ?? null,
        tags: cardData.tags ?? [],
        createdAt: existingCard?.createdAt ?? now,
        updatedAt: now,
      };

      this.cards.set(card.id, card);

      return card;
    });

    return upsertedCards;
  }

  async cardsBelongToDeck(cardIds: string[], deckId: string): Promise<boolean> {
    return cardIds.every((cardId) => this.cards.get(cardId)?.deckId === deckId);
  }

  async deleteCard(cardId: string, deckId: string): Promise<boolean> {
    const existingCard = this.cards.get(cardId);

    if (!existingCard || existingCard.deckId !== deckId) {
      return false;
    }

    return this.cards.delete(cardId);
  }

  async deleteCardsByIds(deckId: string, cardIds: string[]): Promise<number> {
    let deletedCount = 0;

    for (const cardId of new Set(cardIds)) {
      if (await this.deleteCard(cardId, deckId)) {
        deletedCount += 1;
      }
    }

    return deletedCount;
  }

  async batchDeleteCard(deckId: string): Promise<void> {
    for (const card of this.cards.values()) {
      if (card.deckId === deckId) {
        this.cards.delete(card.id);
      }
    }
  }
}

function withoutUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}
