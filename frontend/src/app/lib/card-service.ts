import type { Card } from "@/app/lib/definitions";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export type CardDraft = {
  front: string;
  back: string;
  hint?: string | null;
  tags: string[];
};

export type CreateCardPayload = CardDraft & {
  deckId: string;
};

export type UpsertCardPayload = CardDraft & {
  id?: string;
};

type BackendCard = Omit<
  Card,
  "due" | "createdAt" | "updatedAt" | "lastReview" | "correctReviews" | "deleted" | "revision"
> & {
  due: string;
  createdAt: string;
  updatedAt: string;
  lastReview?: string;
  correctReviews?: number;
  deleted?: boolean;
  revision?: number;
};

function cardHeaders(userId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    userId,
  };
}

async function readResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  let message = "Card request failed";

  try {
    const body = (await response.json()) as { error?: string; message?: string };
    message = body.error ?? body.message ?? message;
  } catch {
    message = response.statusText || message;
  }

  throw new Error(message);
}

export function normalizeTags(value: string | string[] | null | undefined): string[] {
  const rawTags = Array.isArray(value) ? value : value?.split(",");

  return Array.from(
    new Set(
      (rawTags ?? [])
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );
}

export function toCardDraft(card: Pick<Card, "front" | "back" | "hint" | "tags">): CardDraft {
  return {
    front: card.front.trim(),
    back: card.back.trim(),
    hint: card.hint?.trim() || undefined,
    tags: normalizeTags(card.tags),
  };
}

function hydrateCard(card: BackendCard): Card {
  return {
    ...card,
    hint: card.hint ?? null,
    tags: normalizeTags(card.tags),
    due: new Date(card.due),
    lastReview: card.lastReview ? new Date(card.lastReview) : undefined,
    correctReviews: card.correctReviews ?? 0,
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
    deleted: card.deleted ?? false,
    revision: card.revision ?? 1,
  };
}

export async function getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
  const params = new URLSearchParams({ deckId });
  const response = await fetch(`${API_BASE}/cards?${params.toString()}`, {
    headers: cardHeaders(userId),
    cache: "no-store",
  });

  const cards = await readResponse<BackendCard[]>(response);
  return cards.map(hydrateCard);
}

export async function getCardById(cardId: string, userId: string): Promise<Card> {
  const response = await fetch(`${API_BASE}/cards/${cardId}`, {
    headers: cardHeaders(userId),
    cache: "no-store",
  });

  const card = await readResponse<BackendCard>(response);
  return hydrateCard(card);
}

export async function createCard(payload: CreateCardPayload, userId: string): Promise<Card> {
  const response = await fetch(`${API_BASE}/cards`, {
    method: "POST",
    headers: cardHeaders(userId),
    body: JSON.stringify(payload),
  });

  const card = await readResponse<BackendCard>(response);
  return hydrateCard(card);
}

export async function updateCard(
  cardId: string,
  payload: Partial<CardDraft>,
  userId: string,
): Promise<Card> {
  const response = await fetch(`${API_BASE}/cards/${cardId}`, {
    method: "PATCH",
    headers: cardHeaders(userId),
    body: JSON.stringify(payload),
  });

  const card = await readResponse<BackendCard>(response);
  return hydrateCard(card);
}

export async function upsertCards(
  deckId: string,
  cards: UpsertCardPayload[],
  userId: string,
): Promise<Card[]> {
  const response = await fetch(`${API_BASE}/cards`, {
    method: "PUT",
    headers: cardHeaders(userId),
    body: JSON.stringify({ deckId, cards }),
  });

  const savedCards = await readResponse<BackendCard[]>(response);
  return savedCards.map(hydrateCard);
}

export async function deleteCard(cardId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/cards/${cardId}`, {
    method: "DELETE",
    headers: cardHeaders(userId),
  });

  await readResponse<{ message: string }>(response);
}
