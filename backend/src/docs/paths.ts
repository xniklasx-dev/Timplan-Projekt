import { z } from "zod";
import { registry } from "./registry.js";
import {
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
} from "./schemas.js";

const UserIdHeader = z.object({
  userId: z.string().openapi({
    param: {
      name: "userId",
      in: "header",
      required: true,
    },
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",
  }),
});

const DeckIdParam = z.object({
  deckId: z.string().openapi({
    param: {
      name: "deckId",
      in: "path",
      required: true,
    },
    example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
  }),
});

const CardIdParam = z.object({
  id: z.string().openapi({
    param: {
      name: "id",
      in: "path",
      required: true,
    },
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",
  }),
});

const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    example: "Card not found",
  }),
});

const DeleteCardResponseSchema = z.object({
  message: z.string().openapi({
    example: "Card deleted successfully",
  }),
});

const BatchDeleteCardsResponseSchema = z.object({
  message: z.string().openapi({
    example: "Cards deleted Sucessfully",
  }),
});

registry.registerPath({
  method: "get",
  path: "/health",
  tags: ["system"],
  description: "Health check – returns backend and database status.",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: z.object({
            status: z.string(),
            backend: z.string(),
            database: z.string(),
            durationMs: z.number(),
            timestamp: z.string(),
          }),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/cards/getAllCards/{deckId}",
  tags: ["cards"],
  description: "List cards in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam,
  },
  responses: {
    200: {
      description: "Cards in the requested deck.",
      content: {
        "application/json": {
          schema: z.array(CardSchema),
        },
      },
    },
    400: {
      description: "Invalid user or deck id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the deck.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/cards/{id}",
  tags: ["cards"],
  description: "Get a single card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: CardIdParam,
  },
  responses: {
    200: {
      description: "The requested card.",
      content: {
        "application/json": {
          schema: CardSchema,
        },
      },
    },
    400: {
      description: "Invalid user or card id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the card.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Card not found.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/cards",
  tags: ["cards"],
  description: "Create a card in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    body: {
      content: {
        "application/json": {
          schema: CreateCardSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Card created.",
      content: {
        "application/json": {
          schema: CardSchema,
        },
      },
    },
    400: {
      description: "Invalid request body, user id, or deck id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the deck.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "patch",
  path: "/cards/{id}",
  tags: ["cards"],
  description: "Update a card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: CardIdParam,
    body: {
      content: {
        "application/json": {
          schema: CardUpdateSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Card updated.",
      content: {
        "application/json": {
          schema: CardSchema,
        },
      },
    },
    400: {
      description: "Invalid request body, user id, or card id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the card.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Card not found.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "put",
  path: "/cards",
  tags: ["cards"],
  description: "Create or update cards in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    body: {
      content: {
        "application/json": {
          schema: BatchUpsertCardsSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Cards created or updated.",
      content: {
        "application/json": {
          schema: z.array(CardSchema),
        },
      },
    },
    400: {
      description: "Invalid request body, user id, deck id, or card id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the deck or one of the cards.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/cards/{id}",
  tags: ["cards"],
  description: "Delete a card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: CardIdParam,
  },
  responses: {
    200: {
      description: "Card deleted.",
      content: {
        "application/json": {
          schema: DeleteCardResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid user or card id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the card.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    404: {
      description: "Card not found.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});

registry.registerPath({
  method: "delete",
  path: "/cards/batchDelete/{deckId}",
  tags: ["cards"],
  description: "Delete all cards in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam,
  },
  responses: {
    200: {
      description: "Cards deleted.",
      content: {
        "application/json": {
          schema: BatchDeleteCardsResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid user or deck id.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
    403: {
      description: "The user does not own the deck.",
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
    },
  },
});
