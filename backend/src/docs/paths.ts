import { z } from "zod";
import { registry } from "./registry.js";
import { CardSchema } from "./schemas.js";

const DeckIdParam = z.object({
  deckId: z.string().openapi({ example: "ts-basics" }),
});

const CardIdParam = z.object({
  cardId: z.string().openapi({ example: "card-123" }),
});

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["system"],
  description: "Health check",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({ status: z.string() }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/decks/getAllCardsforDeck/{deckId}",
  tags: ["decks"],
  description: "Returns all cards belonging to a specific deck.",
  request: {
    params: DeckIdParam,
  },
  responses: {
    200: {
      description: "List of cards in the deck",
      content: {
        "application/json": {
          schema: z.array(CardSchema),
        },
      },
    },
    500: { description: "Internal server error" },
  },
});

