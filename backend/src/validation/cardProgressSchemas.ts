import { z } from "zod";
import { cardStateEnum } from "../db/schema.js";
import {
  DateTimeSchema,
  NullableStringSchema,
  OptionalTagsSchema,
  TagsSchema,
  UUIDSchema,
} from "./commonSchemas.js";

const CardStateSchema = z.enum(cardStateEnum.enumValues);

export const CardProgressSchema = z
  .object({
    cardId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    state: CardStateSchema.default("new").openapi({
      example: "new",
    }),

    due: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    totalReviews: z.number().int().nonnegative().default(0).openapi({
      example: 10,
    }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("CardProgress");

export type CardProgressData = z.output<typeof CardProgressSchema>;