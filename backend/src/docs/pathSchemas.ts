import { z } from "zod";

export const AuthHeader = z.object({
  Authorization: z.string().openapi({
    param: {
      name: "Authorization",
      in: "header",
      required: true,
    },
    example: "Bearer your-token",
  }),
});

export const DeckIdParam = z.object({
  deckId: z.string().openapi({
    param: {
      name: "deckId",
      in: "path",
      required: true,
    },
    example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
  }),
});

export const CardIdParam = z.object({
  cardId: z.string().openapi({
    param: {
      name: "cardId",
      in: "path",
      required: true,
    },
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",
  }),
});

export const ErrorResponseSchema = z.object({
  message: z.string().openapi({
    example: "Resource not found",
  }),
});

export const MessageResponseSchema = z.object({
  message: z.string().openapi({
    example: "Operation completed successfully",
  }),
});
