////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { randomUUID } from "node:crypto";

import { Card } from "../../db/schema.js";
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

  // TODO: implement sobald nik die decks gemacht hat
  async hasDeckAccess(_deckId: string, _userId: string): Promise<boolean> {
    
    /*const ownerId = this.deckOwners.get(deckId);

    if (!ownerId) {
      this.deckOwners.set(deckId, userId);
      return true;
    }

    return ownerId === userId;*/
    return true
  }

  async getCardsByDeckId(deckId: string, _userId: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter((card) => card.deckId === deckId);
  }

  async getCardById(cardId: string, _deckId: string, _userId: string): Promise<Card | null> {
    return this.cards.get(cardId) ?? null;
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

  async deleteCard(cardId: string, deckId: string): Promise<boolean> {
    const existingCard = this.cards.get(cardId);

    if (!existingCard || existingCard.deckId !== deckId) {
      return false;
    }

    return this.cards.delete(cardId);
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
