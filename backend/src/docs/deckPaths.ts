////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  CreateDeckSchema,
  DeckSchema,
  DeckUpdateSchema,
} from "../validation/deckSchemas.js";
import { AuthHeader, DeckIdParam, ErrorResponseSchema } from "./pathSchemas.js";

export function registerDeckPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/decks",
    tags: ["decks"],
    description: "List the current user's decks.",
    request: { headers: AuthHeader },
    responses: {
      200: {
        description: "Decks owned by the current user.",
        content: { "application/json": { schema: z.array(DeckSchema) } },
      },
      401: {
        description: "Authentication required.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "get",
    path: "/decks/{deckId}",
    tags: ["decks"],
    description: "Get one deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
    },
    responses: {
      200: {
        description: "The requested deck.",
        content: { "application/json": { schema: DeckSchema } },
      },
      400: {
        description: "Invalid deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Deck not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/decks",
    tags: ["decks"],
    description: "Create a deck for the current user.",
    request: {
      headers: AuthHeader,
      body: { content: { "application/json": { schema: CreateDeckSchema } } },
    },
    responses: {
      201: {
        description: "Deck created.",
        content: { "application/json": { schema: DeckSchema } },
      },
      400: {
        description: "Invalid request body.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/decks/{deckId}",
    tags: ["decks"],
    description: "Update a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
      body: { content: { "application/json": { schema: DeckUpdateSchema } } },
    },
    responses: {
      200: {
        description: "Deck updated.",
        content: { "application/json": { schema: DeckSchema } },
      },
      400: {
        description: "Invalid request body or deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Deck not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/decks/{deckId}",
    tags: ["decks"],
    description: "Delete a deck owned by the current user.",
    request: {
      headers: AuthHeader,
      params: DeckIdParam,
    },
    responses: {
      204: {
        description: "Deck deleted.",
      },
      400: {
        description: "Invalid deck id.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
      404: {
        description: "Deck not found.",
        content: { "application/json": { schema: ErrorResponseSchema } },
      },
    },
  });
}
