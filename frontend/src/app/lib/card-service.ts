import type { Card } from "./definitions";
import { apiBaseUrl } from "./definitions";

export type CardFormData = Pick<Card, "front" | "back" | "hint" | "tags">;

export type CreateCardData = CardFormData & {
  deckId: string;
};

export type UpsertCardData = CardFormData & {
  cardId?: string;
};

type BackendCard = {
  id: string;
  deckId: string;
  front: string;
  back: string;
  hint: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export async function getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
  const response = await fetch(`${apiBaseUrl}/decks/${deckId}/cards`, {
    headers: cardHeaders(userId),
    cache: "no-store",
  });

  const cards = await readResponse<BackendCard[]>(response);
  return cards.map(toFrontendCard);
}

export async function getCardById(deckId: string, cardId: string, userId: string): Promise<Card> {
  const response = await fetch(`${apiBaseUrl}/decks/${deckId}/cards/${cardId}`, {
    headers: cardHeaders(userId),
    cache: "no-store",
  });

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function createCard(cardData: CreateCardData, userId: string): Promise<Card> {
  const response = await fetch(`${apiBaseUrl}/decks/${cardData.deckId}/cards`, {
    method: "POST",
    headers: cardHeaders(userId),
    body: JSON.stringify(toCardFormat(cardData)),
  });

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function updateCard(deckId: string, cardId: string, cardData: CardFormData, userId: string): Promise<Card> {
  const response = await fetch(`${apiBaseUrl}/decks/${deckId}/cards/${cardId}`, {
    method: "PATCH",
    headers: cardHeaders(userId),
    body: JSON.stringify(toCardFormat(cardData)),
  });

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function upsertCards(deckId: string, cardsData: UpsertCardData[], userId: string): Promise<Card[]> {
  const response = await fetch(`${apiBaseUrl}/decks/${deckId}/cards`, {
    method: "PUT",
    headers: cardHeaders(userId),
    body: JSON.stringify({ cards: cardsData.map(toUpsertBody) }),
  });

  const cards = await readResponse<BackendCard[]>(response);
  return cards.map(toFrontendCard);
}

export async function deleteCard(deckId: string, cardId: string, userId: string): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/decks/${deckId}/cards/${cardId}`, {
    method: "DELETE",
    headers: cardHeaders(userId),
  });

  await readResponse<{ message: string }>(response);
}

function cardHeaders(userId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${userId}`,
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export function normalizeTags(value: string | string[] | null | undefined): string[] {
  const tags = Array.isArray(value) ? value : value?.split(",");

  return Array.from(
    new Set(
      (tags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export function toCardFormat(card: CardFormData): CardFormData {
  return {
    front: card.front.trim(),
    back: card.back.trim(),
    hint: card.hint?.trim() || null,
    tags: normalizeTags(card.tags),
  };
}

function toUpsertBody(card: UpsertCardData) {
  return {
    cardId: card.cardId,
    ...toCardFormat(card),
  };
}

function toFrontendCard(card: BackendCard): Card {
  return {
    ...card,
    hint: card.hint ?? null,
    tags: normalizeTags(card.tags),
    state: "new",
    due: new Date(),
    rating: null,
    totalReviews: 0,
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
  };
}
