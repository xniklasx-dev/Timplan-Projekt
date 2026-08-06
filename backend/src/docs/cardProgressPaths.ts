import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";

import {
  CardProgressSchema,
  CardProgressUpdateSchema,
  CreateCardProgressSchema,
} from "../validation/cardProgressSchemas.js";
import {
  AuthHeader,
  CardIdParam,
  DeckIdParam,
  ErrorResponseSchema,
  MessageResponseSchema,
} from "./pathSchemas.js";

const CardProgressParams = DeckIdParam.merge(CardIdParam);

export function registerCardProgressPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/decks/{deckId}/cards/{cardId}/progress",
    tags: ["card-progress"],
    description: "Get the learning progress for a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: CardProgressParams,
    },
    responses: {
      200: {
        description: "The requested card progress.",
        content: { "application/json": { schema: CardProgressSchema } },
      },
      400: {
        description: "Invalid deck or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      401: {
        description: "Authentication required.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card or card progress not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/decks/{deckId}/cards/{cardId}/progress",
    tags: ["card-progress"],
    description: "Create learning progress for a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: CardProgressParams,
      body: {
        content: { "application/json": { schema: CreateCardProgressSchema } },
      },
    },
    responses: {
      201: {
        description: "Card progress created.",
        content: { "application/json": { schema: CardProgressSchema } },
      },
      400: {
        description: "Invalid request body, deck id, or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      401: {
        description: "Authentication required.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      409: {
        description: "Card progress already exists.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/decks/{deckId}/cards/{cardId}/progress",
    tags: ["card-progress"],
    description: "Update the learning progress for a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: CardProgressParams,
      body: {
        content: { "application/json": { schema: CardProgressUpdateSchema } },
      },
    },
    responses: {
      200: {
        description: "Card progress updated.",
        content: { "application/json": { schema: CardProgressSchema } },
      },
      400: {
        description: "Invalid request body, deck id, or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      401: {
        description: "Authentication required.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card or card progress not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/decks/{deckId}/cards/{cardId}/progress",
    tags: ["card-progress"],
    description: "Delete the learning progress for a card owned by the current user.",
    request: {
      headers: AuthHeader,
      params: CardProgressParams,
    },
    responses: {
      200: {
        description: "Card progress deleted.",
        content: { "application/json": { schema: MessageResponseSchema } },
      },
      400: {
        description: "Invalid deck or card id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      401: {
        description: "Authentication required.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      403: {
        description: "The user does not own the deck.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Card or card progress not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
