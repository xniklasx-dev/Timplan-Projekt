import type { Card } from "./definitions";

const apiBaseUrl = process.env.API_BASE_URL || "http://localhost:3001";

export type cardFormat = Pick<Card, "front" | "back" | "hint" | "tags">;

export type createCardFormat = cardFormat & {
  deckId: string;
};

export type upsertCardFormat = Partial<cardFormat> & {
  id?: string;
};

export type backendCardFormat = Omit<Card, "due" | "createdAt" | "updatedAt" > & {
  due: string;
  createdAt: string;
  updatedAt: string;
};

export async function getCardById(cardId: string, userId: string): Promise<Card> {
    const response = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
        headers: standardCardAPIHeader(userId),
        cache: "no-store"
    });
    const returnedCard = await processCardResponse<backendCardFormat>(response);
    return hydrateCard(returnedCard);
}

export async function getCardsByDeckId(deckId: string, userId: string): Promise<Card[]> {
    const response = await fetch(`${apiBaseUrl}/cards/getAllCards/${deckId}`, {
        headers: standardCardAPIHeader(userId),
        cache: "no-store"
    });
    const returnedCardArray = await processCardResponse<backendCardFormat[]>(response);
    return returnedCardArray.map(hydrateCard);
}

export async function createCard(cardData: createCardFormat, userId: string): Promise<Card> {
    const response = await fetch(`${apiBaseUrl}/cards`, {
        method: "POST",
        headers: standardCardAPIHeader(userId),
        body: JSON.stringify(cardData)
    });
    const returnedCard = await processCardResponse<backendCardFormat>(response);
    return hydrateCard(returnedCard);
}

export async function updateCard(cardId: string, cardData: upsertCardFormat, userId: string): Promise<Card> {
    const response = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
        method: "PATCH",
        headers: standardCardAPIHeader(userId),
        body: JSON.stringify(cardData)
    });
    const returnedCard = await processCardResponse<backendCardFormat>(response);
    return hydrateCard(returnedCard);
}

export async function upsertCards(deckId: string, cardsData: upsertCardFormat[], userId: string): Promise<Card[]> {
    const response = await fetch(`${apiBaseUrl}/cards`, {
        method: "POST",
        headers: standardCardAPIHeader(userId),
        body: JSON.stringify({ deckId, cardsData })
    });
    const returnedCardArray = await processCardResponse<backendCardFormat[]>(response);
    return returnedCardArray.map(hydrateCard);
}

export async function deleteCard(cardId: string, userId: string): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/cards/${cardId}`, {
        method: "DELETE",
        headers: standardCardAPIHeader(userId)
    });
    await processCardResponse<{ message: string }>(response);
}

export async function deleteCards(deckId: string, userId: string): Promise<void> {
    const response = await fetch(`${apiBaseUrl}/cards/batchDelete/${deckId}`, {
        method: "DELETE",
        headers: standardCardAPIHeader(userId)
    });
    await processCardResponse<{ message: string }>(response);
}

function standardCardAPIHeader(userId: string): HeadersInit {
    return {
        "Content-Type": "application/json",
        userId
    };
}

async function processCardResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    return response.json() as Promise<T>;
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

function hydrateCard(card: backendCardFormat): Card {
  return {
    ...card,
    hint: card.hint ?? null,
    tags: normalizeTags(card.tags),
    due: new Date(card.due),
    createdAt: new Date(card.createdAt),
    updatedAt: new Date(card.updatedAt),
  };
}

