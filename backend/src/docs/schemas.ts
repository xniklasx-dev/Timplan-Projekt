import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CardSchema = z
  .object({
    id: z.string().openapi({ example: "5980c97c-e245-400a-b4c1-52b07feac04f" }),
    deckId: z.string().openapi({ example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f" }),

    front: z.string().openapi({ example: "What is TypeScript?" }),
    back: z.string().openapi({ example: "A typed superset of JavaScript." }),
    hint: z.string().optional().openapi({ example: "Think about types" }),

    tags: z.array(z.string()).openapi({ example: ["typescript", "basics"] }),
    state: z
      .enum(["new", "learning", "review", "suspended"])
      .openapi({ example: "new" }),

    due: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),

    rating: z
      .enum(["again", "hard", "good", "easy"])
      .openapi({ example: "good" }),

    totalReviews: z.number().int().nonnegative().openapi({ example: 10 }),

    createdAt: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),

  })
  .openapi("Card");

export const CardUpdateSchema = CardSchema.omit({ id: true })
  .partial()
  .openapi("CardUpdate");

export const DeckSchema = z
  .object({
    id: z.string().openapi({ example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f" }),
    userId: z.string().openapi({ example: "5980c97c-e245-400a-b4c1-52b07feac04f" }),

    name: z.string().openapi({ example: "TypeScript Basics" }),
    description: z
      .string()
      .optional()
      .openapi({ example: "Learn TypeScript fundamentals" }),

    tags: z.array(z.string()).openapi({ example: ["typescript"] }),

    color: z.string().optional().openapi({ example: "#420420" }),
    icon: z.string().optional().openapi({ example: "code" }),
    parentDeckId: z.string().optional(),

    createdAt: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),
    updatedAt: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),
  })
  .openapi("Deck");

export const DateDataSchema = z
  .object({
    id: z.string().openapi({ example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f" }),
    userId: z.string().openapi({ example: "5980c97c-e245-400a-b4c1-52b07feac04f" }),

    date: z.string().datetime().openapi({ example: "2026-05-06 18:53:54.378963+00" }),
    easy: z.number().int().nonnegative().openapi({ example: 5 }),
    medium: z.number().int().nonnegative().openapi({ example: 3 }),
    hard: z.number().int().nonnegative().openapi({ example: 2 }),
  })
  .openapi("DateData");

