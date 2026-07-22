////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////

import { z } from "zod";
import { DateSchema, UUIDSchema } from "./commonSchemas.js";

export const DateDataSchema = z
  .object({
    id: UUIDSchema.openapi({
      example: "9f3049bb-97fe-489e-bff9-207dc7cf4a4f",
    }),

    userId: UUIDSchema.openapi({
      example: "5980c97c-e245-400a-b4c1-52b07feac04f",
    }),

    date: DateSchema.openapi({
      example: "2026-05-06",
    }),

    easy: z.number().int().nonnegative().openapi({
      example: 5,
    }),

    medium: z.number().int().nonnegative().openapi({
      example: 3,
    }),

    hard: z.number().int().nonnegative().openapi({
      example: 2,
    }),
  })
  .openapi("DateData");

export const CreateDateDataSchema = DateDataSchema.pick({
  date: true,
  easy: true,
  medium: true,
  hard: true,
})
  .partial({
    easy: true,
    medium: true,
    hard: true,
  })
  .strict()
  .openapi("CreateDateData");

export const DateDataUpdateSchema = DateDataSchema.pick({
  easy: true,
  medium: true,
  hard: true,
})
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .openapi("DateDataUpdate");

export type DateDataData = z.output<typeof DateDataSchema>;
export type CreateDateDataData = z.input<typeof CreateDateDataSchema> & { userId: string };
export type DateDataUpdateData = z.input<typeof DateDataUpdateSchema>;

