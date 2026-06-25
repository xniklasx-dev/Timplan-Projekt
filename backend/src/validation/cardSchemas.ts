////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { z } from "zod";
import { cardRatingEnum, cardStateEnum } from "../db/schema.js";
import {
  DateTimeSchema,
  NullableStringSchema,
  OptionalTagsSchema,
  TagsSchema,
  UUIDSchema,
} from "./commonSchemas.js";

const CardStateSchema = z.enum(cardStateEnum.enumValues);
const CardRatingSchema = z.enum(cardRatingEnum.enumValues);

export const CardSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    deckId: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    front: z.string().min(1).openapi({
      example: "What is TypeScript?",
    }),

    back: z.string().min(1).openapi({
      example: "A typed superset of JavaScript.",
    }),

    hint: NullableStringSchema.openapi({
      example: "Think about types",
    }),

    tags: TagsSchema.default([]).openapi({
      example: ["typescript", "basics"],
    }),

    createdAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),

    updatedAt: DateTimeSchema.openapi({
      example: "2026-05-06T18:53:54.378Z",
    }),
  })
  .openapi("Card");

export const CardProgressSchema = z
  .object({
    cardId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    state: CardStateSchema.default("new").openapi({
      example: "new",
    }),

    rating: CardRatingSchema.nullable().openapi({
      example: "good",
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

export const CreateCardSchema = CardSchema.pick({
  front: true,
  back: true,
  hint: true,
  tags: true,
})
  .extend({
    hint: NullableStringSchema.optional().openapi({
      example: "Think about types",
    }),

    tags: OptionalTagsSchema.openapi({
      example: ["typescript", "basics"],
    }),
  })
  .strict()
  .openapi("CreateCard");

export const CardUpdateSchema = CardSchema.pick({
  front: true,
  back: true,
  hint: true,
  tags: true,
})
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("CardUpdate");

export const UpsertCardSchema = CreateCardSchema.extend({
  cardId: UUIDSchema.optional().openapi({
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",
  }),
})
  .strict()
  .openapi("UpsertCard");

const BatchUpsertCardsObjectSchema = z
  .object({
    cards: z.array(UpsertCardSchema).min(1).openapi({
      example: [
        {
          cardId: "5980c97c-e245-400a-b4c1-52b07feac04f",
          front: "What is TypeScript?",
          back: "A typed superset of JavaScript.",
          hint: "Think about types",
          tags: ["typescript", "basics"],
        },
        {
          cardId: "1fd82b13-9e3e-4b5e-a29f-d7cc772e66e1",
          front: "What is Express?",
          back: "A Node.js web framework.",
          tags: ["backend"],
        },
      ],
    }),
  })
  .strict();

export const BatchUpsertCardsSchema = z
  .preprocess((value) => {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return value;
    }

    const data = value as Record<string, unknown>;

    if ("cards" in data || !("cardsData" in data)) {
      return data;
    }

    const { cardsData, ...rest } = data;

    return {
      ...rest,
      cards: cardsData,
    };
  }, BatchUpsertCardsObjectSchema)
  .openapi("BatchUpsertCards");

export type CardData = z.output<typeof CardSchema>;
export type CardProgressData = z.output<typeof CardProgressSchema>;
export type CreateCardData = z.input<typeof CreateCardSchema> & { deckId: string };
export type CardUpdateData = z.input<typeof CardUpdateSchema>;
export type UpsertCardData = z.input<typeof UpsertCardSchema>;
export type BatchUpsertCardsData = z.output<typeof BatchUpsertCardsSchema> & { deckId: string };

