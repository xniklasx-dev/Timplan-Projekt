////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { z } from "zod";
import {
  DateTimeSchema,
  NullableStringSchema,
  NullableUUIDSchema,
  TagsSchema,
  UUIDSchema,
} from "./commonSchemas.js";

const DeckNameSchema = z.string().trim().min(1, "Deck name must not be empty");

export const DeckSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    userId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    parentDeckId: NullableUUIDSchema.openapi({
      example: "1fd82b13-9e3e-4b5e-a29f-d7cc772e66e1",
    }),

    name: DeckNameSchema.openapi({
      example: "TypeScript Basics",
    }),

    description: NullableStringSchema.openapi({
      example: "Learn TypeScript fundamentals",
    }),

    tags: TagsSchema.nullable().openapi({
      example: ["typescript"],
    }),

    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .nullable()
      .openapi({
        example: "#420420",
      }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    lastStudied: DateTimeSchema.nullable().openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("Deck");

export const CreateDeckSchema = DeckSchema.pick({
  parentDeckId: true,
  name: true,
  description: true,
  tags: true,
  color: true,
})
  .extend({
    parentDeckId: NullableUUIDSchema.optional().openapi({
      example: "1fd82b13-9e3e-4b5e-a29f-d7cc772e66e1",
    }),

    description: NullableStringSchema.optional().openapi({
      example: "Learn TypeScript fundamentals",
    }),

    tags: TagsSchema.nullable()
      .optional()
      .openapi({
        example: ["typescript"],
      }),

    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .nullable()
      .optional()
      .openapi({
        example: "#420420",
      }),
  })
  .strict()
  .openapi("CreateDeck");

export const DeckUpdateSchema = CreateDeckSchema.partial()
  .extend({
    lastStudied: DateTimeSchema.transform((value) => new Date(value)).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("DeckUpdate");

export type DeckData = z.output<typeof DeckSchema>;
export type CreateDeckData = z.input<typeof CreateDeckSchema> & {
  userId: string;
};
export type DeckUpdateData = z.output<typeof DeckUpdateSchema>;
