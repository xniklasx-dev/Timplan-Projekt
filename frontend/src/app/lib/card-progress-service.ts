import {apiBaseUrl, type Card} from "./definitions";

const progressApiBase = apiBaseUrl.replace(/\/+$/, "");

export type CardProgress = {
    cardId: string;
    state: Card["state"];
    rating: CardProgressRating;
    due: Date;
    totalReviews: number;
    createdAt: Date;
    updatedAt: Date;
};

export type CardProgressRating = "again" | "hard" | "good" | "easy" | null;

export class CardProgressApiError extends Error {
    constructor(message: string, public readonly status: number) {
        super(message);
        this.name = "CardProgressApiError";
    }
}

export type CreateCardProgressData = {
    state?: Card["state"];
    rating?: CardProgressRating;
    due?: Date;
    totalReviews?: number;
};

export type UpdateCardProgressData = Partial<CreateCardProgressData>

type BackendCardProgress = {
    cardId: string;
    state: Card["state"];
    rating: CardProgressRating;
    due: string;
    totalReviews: number;
    createdAt: string;
    updatedAt: string;
};

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

    if(responseText) {
        try {
            responseData = JSON.parse(responseText);} 
        catch {
            responseData = responseText;}
    }
    if (!response.ok) {
        const errorData = typeof responseData === "object" && responseData !== null? (responseData as { message?: string; error?: string }) : null;
        throw new CardProgressApiError(
            errorData?.message ?? errorData?.error ?? `CardProgress request failed with status ${response.status}`,
            response.status,
        );
    }
    return responseData as T;
}

function toFrontendProgress( progress: BackendCardProgress): CardProgress {
    return {
        ...progress,
        due: new Date(progress.due),
        createdAt: new Date(progress.createdAt),
        updatedAt: new Date(progress.updatedAt),
    };
}

function toBackendProgressData(data: CreateCardProgressData | UpdateCardProgressData){
    return {
        ...data,
        due: data.due?.toISOString(),
    };
}

export async function getCardProgress(deckId: string, cardId: string, token: string): Promise<CardProgress> {
    const response = await fetch(`${progressApiBase}/decks/${deckId}/cards/${cardId}/progress`, { headers: createHeaders(token), cache: "no-store" },);
    const progress = await readResponse<BackendCardProgress>(response);
    return toFrontendProgress(progress);
}

export async function createCardProgress(deckId: string, cardId: string, data: CreateCardProgressData, token: string): Promise<CardProgress> {
    const response = await fetch(`${progressApiBase}/decks/${deckId}/cards/${cardId}/progress`, {
        method: "POST",
        headers: createHeaders(token, true),
        body: JSON.stringify(toBackendProgressData(data)),
    });
    const progress = await readResponse<BackendCardProgress>(response);
    return toFrontendProgress(progress);
}

export async function updateCardProgress(deckId: string, cardId: string, data: UpdateCardProgressData, token: string): Promise<CardProgress> {
    const response = await fetch(`${progressApiBase}/decks/${deckId}/cards/${cardId}/progress`, {
        method: "PATCH",
        headers: createHeaders(token, true),
        body: JSON.stringify(toBackendProgressData(data)),
    });
    const progress = await readResponse<BackendCardProgress>(response);
    return toFrontendProgress(progress);
}

export async function deleteCardProgress(deckId: string, cardId: string, token: string): Promise<void> {
    const response = await fetch(`${progressApiBase}/decks/${deckId}/cards/${cardId}/progress`, {
        method: "DELETE",
        headers: createHeaders(token),
    });
    await readResponse<{message: string}>(response);
}
