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

type ApiErrorResponse = {
  status?: string;
  message?: string;
  error?: string;
};

const cardApiBase = apiBaseUrl.replace(/\/+$/, "");

export async function getCardsByDeckId(deckId: string, token: string): Promise<Card[]> {
  const response = await fetch(`${cardApiBase}/decks/${deckId}/cards`, {
    headers: createHeaders(token),
    cache: "no-store",
  });

  const cards = await readResponse<BackendCard[]>(response);
  return cards.map(toFrontendCard);
}

export async function getCardById(deckId: string, cardId: string, token: string): Promise<Card> {
  const response = await fetch(
    `${cardApiBase}/decks/${deckId}/cards/${cardId}`,
    {
      headers: createHeaders(token),
      cache: "no-store",
    },
  );

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function createCard(cardData: CreateCardData, token: string): Promise<Card> {
  const response = await fetch(`${cardApiBase}/decks/${cardData.deckId}/cards`, {
    method: "POST",
    headers: createHeaders(token, true),
    body: JSON.stringify(toCardFormat(cardData)),
  });

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function updateCard(deckId: string, cardId: string, cardData: CardFormData, token: string): Promise<Card> {
  const response = await fetch(
    `${cardApiBase}/decks/${deckId}/cards/${cardId}`,
    {
      method: "PATCH",
      headers: createHeaders(token, true),
      body: JSON.stringify(toCardFormat(cardData)),
    },
  );

  const card = await readResponse<BackendCard>(response);
  return toFrontendCard(card);
}

export async function upsertCards(deckId: string, cardsData: UpsertCardData[], token: string): Promise<Card[]> {
  const response = await fetch(`${cardApiBase}/decks/${deckId}/cards`, {
    method: "PUT",
    headers: createHeaders(token, true),
    body: JSON.stringify({ cards: cardsData.map(toUpsertBody) }),
  });

  const cards = await readResponse<BackendCard[]>(response);
  return cards.map(toFrontendCard);
}

export async function deleteCard(deckId: string, cardId: string, token: string): Promise<void> {
  const response = await fetch(
    `${cardApiBase}/decks/${deckId}/cards/${cardId}`,
    {
      method: "DELETE",
      headers: createHeaders(token),
    },
  );

  await readResponse<void>(response);
}

export async function deleteCards(deckId: string, cardIds: string[], token: string): Promise<number> {
  const response = await fetch(`${cardApiBase}/decks/${deckId}/cards/batch-delete`, {
    method: "DELETE",
    headers: createHeaders(token, true),
    body: JSON.stringify({ cardIds }),
  });

  const result = await readResponse<{ deletedCount: number }>(response);
  return result.deletedCount;
}

function createHeaders(token: string, withBody = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (withBody) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  let responseData: unknown;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    const errorData =
      typeof responseData === "object" && responseData !== null
        ? (responseData as ApiErrorResponse)
        : null;

    const message =
      errorData?.message ??
      errorData?.error ??
      `Card request failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseData as T;
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
