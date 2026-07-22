import { apiBaseUrl, type Card, type Deck } from "./definitions";
import { getCardsByDeckId } from "./card-service";
import { getCardProgress } from "./card-progress-service";
import { isDueToday } from "./learning-service";

export type BackendDeck = {
  id: string;
  userId: string;
  parentDeckId: string | null;
  name: string;
  description: string | null;
  tags: string[] | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  lastStudied: string | null;
};

export type DeckWriteData = {
  parentDeckId?: string | null;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  color?: string | null;
};

export type DeckUpdateLastStudied = {
  lastStudied: Date;
};

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

const deckApiBase = apiBaseUrl.replace(/\/+$/, "");

function createHeaders(token: string, includeContentType = false): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
    Authorization: `Bearer ${token}`,
  };

  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

async function checkResponse(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  let message = `Deck request failed with status ${response.status}`;

  const responseText = await response.text();

  if (responseText) {
    try {
      const errorData = JSON.parse(responseText) as ApiErrorResponse;

      message = errorData.message ?? errorData.error ?? message;
    } catch {
      message = responseText;
    }
  }

  throw new Error(message);
}

function toFrontendDeck(backendDeck: BackendDeck): Deck {
  return {
    id: backendDeck.id,
    name: backendDeck.name,
    description: backendDeck.description ?? "",
    tags: backendDeck.tags ?? [],
    cardIds: [],
    color: backendDeck.color ?? "",
    parentDeckId: backendDeck.parentDeckId ?? undefined,
    childDeckIds: [],

    totalCards: 0,
    newCards: 0,
    dueToday: 0,
    lastStudied: backendDeck.lastStudied
      ? new Date(backendDeck.lastStudied)
      : undefined,

    createdAt: new Date(backendDeck.createdAt),
    updatedAt: new Date(backendDeck.updatedAt),
  };
}

async function readDeckResponse(response: Response): Promise<Deck> {
  await checkResponse(response);

  const backendDeck = (await response.json()) as BackendDeck;

  return toFrontendDeck(backendDeck);
}

export function applyCardStatsToDeck(deck: Deck, cards: Card[]): Deck {
  return {
    ...deck,

    cardIds: cards.map((card) => card.id),

    totalCards: cards.length,

    newCards: cards.filter((card) => card.state === "new").length,

    dueToday: cards.filter((card) => isDueToday(card)).length,
  };
}

export async function getDeckCardsWithProgress(
  deckId: string,
  token: string,
): Promise<Card[]> {
  const cards = await getCardsByDeckId(deckId, token);

  return Promise.all(
    cards.map(async (card) => {
      try {
        const progress = await getCardProgress(deckId, card.id, token);
        return { ...card, ...progress };
      } catch {
        return card;
      }
    }),
  );
}

export function withChildDeckIds(decks: Deck[]): Deck[] {
  return decks.map((deck) => {
    const childDeckIds = decks
      .filter((childDeck) => childDeck.parentDeckId === deck.id)
      .map((childDeck) => childDeck.id);

    return {
      ...deck,
      childDeckIds,
    };
  });
}

export async function getDecks(token: string): Promise<Deck[]> {
  const response = await fetch(`${deckApiBase}/decks`, {
    method: "GET",
    headers: createHeaders(token),
    cache: "no-store",
  });

  await checkResponse(response);

  const backendDecks = (await response.json()) as BackendDeck[];

  return withChildDeckIds(backendDecks.map(toFrontendDeck));
}

export async function getDeck(deckId: string, token: string): Promise<Deck> {
  const response = await fetch(
    `${deckApiBase}/decks/${encodeURIComponent(deckId)}`,
    {
      method: "GET",
      headers: createHeaders(token),
      cache: "no-store",
    },
  );

  return readDeckResponse(response);
}

export async function getDecksWithStats(token: string): Promise<Deck[]> {
  const decks = await getDecks(token);
  const topLevelDecks = decks.filter((deck) => !deck.parentDeckId);

  const topLevelDecksWithStats = await Promise.all(
    topLevelDecks.map(async (deck) => {
      const cards = await getDeckCardsWithProgress(deck.id, token);

      return applyCardStatsToDeck(deck, cards);
    }),
  );

  const statsByDeckId = new Map(
    topLevelDecksWithStats.map((deck) => [deck.id, deck]),
  );

  return decks.map((deck) => statsByDeckId.get(deck.id) ?? deck);
}

export async function createDeck(
  deckData: DeckWriteData,
  token: string,
): Promise<Deck> {
  const response = await fetch(`${deckApiBase}/decks`, {
    method: "POST",
    headers: createHeaders(token, true),
    body: JSON.stringify(deckData),
  });

  return readDeckResponse(response);
}

export async function updateDeck(
  deckId: string,
  deckData: DeckWriteData | DeckUpdateLastStudied,
  token: string,
): Promise<Deck> {
  const response = await fetch(
    `${deckApiBase}/decks/${encodeURIComponent(deckId)}`,
    {
      method: "PATCH",
      headers: createHeaders(token, true),
      body: JSON.stringify(deckData),
    },
  );

  return readDeckResponse(response);
}

export async function deleteDeck(deckId: string, token: string): Promise<void> {
  const response = await fetch(
    `${deckApiBase}/decks/${encodeURIComponent(deckId)}`,
    {
      method: "DELETE",
      headers: createHeaders(token),
    },
  );

  await checkResponse(response);
}
