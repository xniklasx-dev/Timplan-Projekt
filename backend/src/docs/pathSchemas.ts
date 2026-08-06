////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import { z } from "zod";

import { UUIDSchema } from "../validation/commonSchemas.js";

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
  deckId: UUIDSchema.openapi({
    param: {
      name: "deckId",
      in: "path",
      required: true,
    },
    example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
  }),
});

export const CardIdParam = z.object({
  cardId: UUIDSchema.openapi({
    param: {
      name: "cardId",
      in: "path",
      required: true,
    },
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",
  }),
});

export const ErrorResponseSchema = z.object({
  status: z.string().openapi({
    example: "error",
  }),
  message: z.string().openapi({
    example: "Resource not found",
  }),
  code: z.string().optional().openapi({
    example: "VALIDATION_ERROR",
  }),
  errors: z
    .array(
      z.object({
        field: z.string().optional().openapi({ example: "deckId" }),
        code: z.string().openapi({ example: "invalid_format" }),
        message: z.string().openapi({ example: "Invalid UUID" }),
      }),
    )
    .optional(),
});

export const MessageResponseSchema = z.object({
  message: z.string().openapi({
    example: "Operation completed successfully",
  }),
});
