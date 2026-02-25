import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const MediaSchema = z
  .object({
    id: z.string().openapi({ example: "media-123" }),
    type: z.enum(["image", "audio", "video"]).openapi({ example: "image" }),
    url: z.string().url().openapi({ example: "https://example.com/image.png" }),
  })
  .openapi("Media");

export const CardSchema = z
  .object({
    id: z.string().openapi({ example: "card-123" }),
    deckId: z.string().openapi({ example: "deck-ts-basics" }),

    front: z.string().openapi({ example: "What is TypeScript?" }),
    back: z.string().openapi({ example: "A typed superset of JavaScript." }),
    hint: z.string().optional().openapi({ example: "Think about types" }),
    extra: z.string().optional().openapi({ example: "Compiled to JS" }),

    tags: z.array(z.string()).openapi({ example: ["typescript", "basics"] }),
    media: z.array(MediaSchema).openapi({ example: [] }),

    state: z.enum(["new", "learning", "review", "suspended"]).openapi({ example: "review" }),

    due: z.string().datetime().openapi({ example: "2026-02-26T10:00:00Z" }),

    rating: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3)]).openapi({ example: 2 }),

    lastReview: z.string().datetime().optional().openapi({ example: "2026-02-25T10:00:00Z" }),

    totalReviews: z.number().int().nonnegative().openapi({ example: 10 }),
    correctReviews: z.number().int().nonnegative().openapi({ example: 8 }),

    createdAt: z.string().datetime().openapi({ example: "2026-02-10T09:00:00Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-02-25T09:00:00Z" }),
    deleted: z.boolean().openapi({ example: false }),

    revision: z.number().int().nonnegative().openapi({ example: 3 }),
  })
  .openapi("Card");

export const DeckSchema = z
  .object({
    id: z.string().openapi({ example: "deck-ts-basics" }),
    name: z.string().openapi({ example: "TypeScript Basics" }),
    description: z.string().optional().openapi({ example: "Learn TypeScript fundamentals" }),

    tags: z.array(z.string()).openapi({ example: ["typescript"] }),
    cardIds: z.array(z.string()).openapi({ example: ["card-1", "card-2"] }),

    color: z.string().optional().openapi({ example: "#420420" }),
    icon: z.string().optional().openapi({ example: "code" }),
    parentDeckId: z.string().optional().openapi({ example: "deck-programming" }),
    childDeckIds: z.array(z.string()).optional().openapi({ example: ["deck-ts-advanced"] }),

    totalCards: z.number().int().nonnegative().openapi({ example: 50 }),
    newCards: z.number().int().nonnegative().openapi({ example: 10 }),
    learningCards: z.number().int().nonnegative().openapi({ example: 5 }),
    reviewCards: z.number().int().nonnegative().openapi({ example: 35 }),
    dueToday: z.number().int().nonnegative().openapi({ example: 12 }),

    studiedToday: z.number().int().nonnegative().openapi({ example: 4 }),
    lastStudied: z.string().datetime().optional().openapi({ example: "2026-02-25T20:00:00Z" }),

    createdAt: z.string().datetime().openapi({ example: "2026-02-01T12:00:00Z" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-02-25T12:00:00Z" }),
    deleted: z.boolean().openapi({ example: false }),

    revision: z.number().int().nonnegative().openapi({ example: 1 }),
  })
  .openapi("Deck");


export const CardUpdateSchema = CardSchema
  .omit({ id: true })
  .partial()
  .openapi("CardUpdate");
