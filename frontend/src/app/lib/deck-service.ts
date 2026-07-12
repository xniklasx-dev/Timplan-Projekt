import { apiBaseUrl, type Deck } from "./definitions";

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
};

export type DeckWriteData = {
  parentDeckId?: string | null;
  name: string;
  description?: string | null;
  tags?: string[] | null;
  color?: string | null;
};

type ApiErrorResponse = {
  status?: string;
  message?: string;
  error?: string;
};

const deckApiBase = apiBaseUrl.replace(/\/+$/, "");

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
      `Deck request failed with status ${response.status}`;

    throw new Error(message);
  }

  return responseData as T;
}

function toFrontendDeck(backendDeck: BackendDeck): Deck {
  return {
    id: backendDeck.id,
    name: backendDeck.name,
    description: backendDeck.description ?? "",
    tags: backendDeck.tags ? [...backendDeck.tags] : [],
    cardIds: [],
    color: backendDeck.color ?? "",
    parentDeckId: backendDeck.parentDeckId ?? undefined,
    childDeckIds: [],

    totalCards: 0,
    newCards: 0,
    learningCards: 0,
    reviewCards: 0,
    dueToday: 0,
    studiedToday: 0,
    lastStudied: undefined,

    createdAt: new Date(backendDeck.createdAt),
    updatedAt: new Date(backendDeck.updatedAt),

    deleted: false,
    revision: 1,
  };
}

export function withChildDeckIds(decks: Deck[]): Deck[] {
  const childIdsByParent = new Map<string, string[]>();

  for (const deck of decks) {
    if (!deck.parentDeckId) {
      continue;
    }

    const currentChildIds = childIdsByParent.get(deck.parentDeckId) ?? [];

    currentChildIds.push(deck.id);

    childIdsByParent.set(deck.parentDeckId, currentChildIds);
  }

  return decks.map((deck) => ({
    ...deck,
    childDeckIds: childIdsByParent.get(deck.id) ?? [],
  }));
}

export function toDeckWriteData(deck: Deck): DeckWriteData {
  const description = deck.description?.trim() ?? "";

  const color = deck.color?.trim() ?? "";

  return {
    parentDeckId: deck.parentDeckId ?? null,
    name: deck.name.trim(),
    description: description || null,
    tags: deck.tags.length > 0 ? [...deck.tags] : null,
    color: color || null,
  };
}

export async function getDecks(token: string): Promise<Deck[]> {
  const response = await fetch(`${deckApiBase}/decks`, {
    method: "GET",
    headers: createHeaders(token),
    cache: "no-store",
  });

  const backendDecks = await readResponse<BackendDeck[]>(response);

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

  const backendDeck = await readResponse<BackendDeck>(response);

  return toFrontendDeck(backendDeck);
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

  const backendDeck = await readResponse<BackendDeck>(response);

  return toFrontendDeck(backendDeck);
}

export async function updateDeck(
  deckId: string,
  deckData: DeckWriteData,
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

  const backendDeck = await readResponse<BackendDeck>(response);

  return toFrontendDeck(backendDeck);
}

export async function deleteDeck(deckId: string, token: string): Promise<void> {
  const response = await fetch(
    `${deckApiBase}/decks/${encodeURIComponent(deckId)}`,
    {
      method: "DELETE",
      headers: createHeaders(token),
    },
  );

  await readResponse<void>(response);
}
