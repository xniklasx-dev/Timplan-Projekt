////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  BatchDeleteCardsSchema,
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
} from "../validation/cardSchemas.js";
import {
  AuthHeader,
  CardIdParam,
  DeckIdParam,
  ErrorResponseSchema,
  MessageResponseSchema,
} from "./pathSchemas.js";

export function registerCardPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/decks/{deckId}/cards",
    tags: ["cards"],
    description: "List cards in a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
    },
    responses: {
      200: {
        description: "Cards in the requested deck.",
        content: { "application/json": { schema: z.array(CardSchema) } },
      },
      400: {
        description: "Invalid deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/decks/{deckId}/cards/{cardId}",
    tags: ["cards"],
    description: "Get a single card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam.merge(CardIdParam),
    },
    responses: {
      200: {
        description: "The requested card.",
        content: { "application/json": { schema: CardSchema } },
      },
      400: {
        description: "Invalid deck or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the card.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/decks/{deckId}/cards",
    tags: ["cards"],
    description: "Create a card in a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
      body: { content: { "application/json": { schema: CreateCardSchema } } },
    },
    responses: {
      201: {
        description: "Card created.",
        content: { "application/json": { schema: CardSchema } },
      },
      400: {
        description: "Invalid request body or deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/decks/{deckId}/cards/{cardId}",
    tags: ["cards"],
    description: "Update a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam.merge(CardIdParam),
      body: { content: { "application/json": { schema: CardUpdateSchema } } },
    },
    responses: {
      200: {
        description: "Card updated.",
        content: { "application/json": { schema: CardSchema } },
      },
      400: {
        description: "Invalid request body, deck id, or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the card.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "put",
    path: "/decks/{deckId}/cards",
    tags: ["cards"],
    description: "Create or update cards in a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
      body: { content: { "application/json": { schema: BatchUpsertCardsSchema } } },
    },
    responses: {
      200: {
        description: "Cards created or updated.",
        content: { "application/json": { schema: z.array(CardSchema) } },
      },
      400: {
        description: "Invalid request body, deck id, or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck or one of the cards.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/decks/{deckId}/cards/batch-delete",
    tags: ["cards"],
    description: "Delete multiple cards from a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
      body: { content: { "application/json": { schema: BatchDeleteCardsSchema } } },
    },
    responses: {
      200: {
        description: "Cards deleted.",
        content: {
          "application/json": {
            schema: z.object({ deletedCount: z.number().int().nonnegative() }),
          },
        },
      },
      400: {
        description: "Invalid request body or deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/decks/{deckId}/cards/{cardId}",
    tags: ["cards"],
    description: "Delete a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam.merge(CardIdParam),
    },
    responses: {
      200: {
        description: "Card deleted.",
        content: { "application/json": { schema: MessageResponseSchema } },
      },
      400: {
        description: "Invalid deck or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the card.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
