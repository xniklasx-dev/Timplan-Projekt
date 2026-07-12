import { z } from "zod";
import { registry } from "./registry.js";
import {
  BatchUpsertCardsSchema,
  CardSchema,
  CardUpdateSchema,
  CreateCardSchema,
} from "../validation/cardSchemas.js";

import {
  UserSchema,
  RegisterSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  UpdateProfileSchema,
} from  "../validation/userSchemas.js";

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
  cardId: z.string().openapi({
    param: {
      name: "cardId",
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
  path: "/decks/{deckId}/cards/{cardId}",
  tags: ["cards"],
  description: "List cards in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam.merge(CardIdParam),
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
  path: "/decks/{deckId}/cards/{cardId}",
  tags: ["cards"],
  description: "Get a single card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam.merge(CardIdParam),
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
  path: "/decks/{deckId}/cards",
  tags: ["cards"],
  description: "Create a card in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam,
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
  path: "/decks/{deckId}/cards/{cardId}",
  tags: ["cards"],
  description: "Update a card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam.merge(CardIdParam),
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
  path: "/decks/{deckId}/cards",
  tags: ["cards"],
  description: "Create or update cards in a deck owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam,
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
  path: "/decks/{deckId}/cards/{cardId}",
  tags: ["cards"],
  description: "Delete a card owned by the current user.",
  request: {
    headers: UserIdHeader,
    params: DeckIdParam.merge(CardIdParam),
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

const AuthHeader = z.object({
  Authorization: z.string().openapi({
    param: {
      name: "Authorization",
      in: "header",
      required: true,
    },
    example: "Bearer mock-token",
  }),
});

const AuthResponseSchema = z.object({
  token: z.string().openapi({
    example: "mock-token",
  }),
  user: UserSchema,
});

const MessageResponseSchema = z.object({
  message: z.string().openapi({
    example: "Password reset email sent",
  }),
});

registry.registerPath({
  method: "get",
  path: "/auth/me",
  tags: ["auth"],
  description: "Get the current user's profile.",
  request: { headers: AuthHeader, },
  responses: {
    200: { description: "Current user profile.", content: { "application/json": { schema: UserSchema } } },
    401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["auth"],
  description: "Register a new user.",
  request: { body: { content: { "application/json": { schema: RegisterSchema } } } },
  responses: {
    201: { description: "User registered.", content: { "application/json": { schema: AuthResponseSchema } } },
    400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
    409: { description: "Email already in use.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["auth"],
  description: "Login a user.",
  request: { body: { content: { "application/json": { schema: LoginSchema } } } },
  responses: {
    200: { description: "User logged in.", content: { "application/json": { schema: AuthResponseSchema } } },
    400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Invalid email or password.", content: { "application/json": { schema: ErrorResponseSchema } } },
  }
});

registry.registerPath({
  method: "post",
  path: "/auth/forgot-password",
  tags: ["auth"],
  description: "Reset email sent if the address exists.",
  request: { body: { content: { "application/json": { schema: ForgotPasswordSchema } } } },
  responses: {
    200: { description: "Password reset email sent.", content: { "application/json": { schema: MessageResponseSchema } } },
    400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/reset-password",
  tags: ["auth"],
  description: "Reset the password for a user by reset token.",
  request: { body: { content: { "application/json": { schema: ResetPasswordSchema } } } },
  responses: {
    200: { description: "Password reset succesfully, email sent.", content: { "application/json": { schema: MessageResponseSchema } } },
    400: { description: "Invalid or expired token.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "post",
  path: "/auth/logout",
  tags: ["auth"],
  description: "Logout a user.",
  request: {
    headers: AuthHeader,
  },
  responses: {
    200: { description: "User logged out.", content: { "application/json": { schema: MessageResponseSchema } } },
    401: { description: "Invalid token.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "patch",
  path: "/auth/me",
  tags: ["auth"],
  description: "Update the current user's profile.",
  request: {
    headers: AuthHeader,
    body: { content: { "application/json": { schema: UpdateProfileSchema } } },
  },
  responses: {
    200: { description: "User profile updated.", content: { "application/json": { schema: UserSchema } } },
    400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
    401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});

registry.registerPath({
  method: "delete",
  path: "/auth/me",
  tags: ["auth"],
  description: "Delete current user's account.",
  request: {
    headers: AuthHeader,
  },
  responses: {
    200: { description: "User deleted.", content: { "application/json": { schema: MessageResponseSchema } } },
    401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
  },
});