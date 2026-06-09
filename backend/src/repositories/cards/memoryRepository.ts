import { randomUUID } from "node:crypto";

import { Card } from "../../db/schema.js";
import { BatchUpsertCardsData, CardUpdateData, CreateCardData } from "../../docs/schemas.js";
import { CardsRepository } from "./cardsRepository.js";

export class MemoryCardsRepository implements CardsRepository {
  private readonly cards = new Map<string, Card>();
  private readonly deckOwners = new Map<string, string>();

  loadCards(cards: Card[]): void {
    for (const card of cards) {
      this.cards.set(card.id, card);
    }
  }

  // TODO: implement sobald nik die decks gemacht hat
  async hasDeckAccess(deckId: string, userId: string): Promise<boolean> {
    
    /*const ownerId = this.deckOwners.get(deckId);

    if (!ownerId) {
      this.deckOwners.set(deckId, userId);
      return true;
    }

    return ownerId === userId;*/
    return true
  }

  async hasCardAccess(cardId: string, userId: string): Promise<boolean> {
    const card = this.cards.get(cardId);

    if (!card) {
      return false;
    }

    return this.hasDeckAccess(card.deckId, userId);
  }

  async hasCardsAccess(cardIds: string[], userId: string): Promise<boolean> {
    if (cardIds.length === 0) {
      return true;
    }

    const ownedCards = await Promise.all(
      cardIds.map((cardId) => this.hasCardAccess(cardId, userId)),
    );

    return ownedCards.every(Boolean);
  }

  async getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
    return Array.from(this.cards.values()).filter((card) => card.deckId === deckId);
  }

  async getCardById(cardId: string, userId: string): Promise<Card | null> {
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
      state: "new",
      due: now,
      rating: null,
      totalReviews: 0,
      createdAt: now,
      updatedAt: now,
    };

    this.cards.set(card.id, card);

    return card;
  }

  async updateCard(cardId: string, cardData: CardUpdateData): Promise<Card | null> {
    const existingCard = this.cards.get(cardId);

    if (!existingCard) {
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
    const now = new Date();
    const upsertedCards = cardsData.cards.map((cardData) => {
      const existingCard = cardData.id ? this.cards.get(cardData.id) : undefined;
      const card: Card = {
        id: cardData.id ?? randomUUID(),
        deckId: cardsData.deckId,
        front: cardData.front,
        back: cardData.back,
        hint: cardData.hint ?? null,
        tags: cardData.tags ?? [],
        state: existingCard?.state ?? "new",
        due: existingCard?.due ?? now,
        rating: existingCard?.rating ?? null,
        totalReviews: existingCard?.totalReviews ?? 0,
        createdAt: existingCard?.createdAt ?? now,
        updatedAt: now,
      };

      this.cards.set(card.id, card);

      return card;
    });

    return upsertedCards;
  }

  async deleteCard(cardId: string): Promise<void> {
    this.cards.delete(cardId);
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

export const memoryCardsRepository = new MemoryCardsRepository();
