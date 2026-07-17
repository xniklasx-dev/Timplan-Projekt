import { z } from "zod";
import { cardRatingEnum, cardStateEnum } from "../db/schema.js";
import {DateTimeSchema,NullableStringSchema,OptionalTagsSchema,TagsSchema,UUIDSchema,} from "./commonSchemas.js";

const CardStateSchema = z.enum(cardStateEnum.enumValues);
const CardRatingSchema = z.enum(cardRatingEnum.enumValues);

export const CardProgressSchema = z.object({
  cardId: UUIDSchema.openapi({
    example: "5980c97c-e245-400a-b4c1-52b07feac04f",}),

  state: CardStateSchema.default("new").openapi({
    example: "new",}),

  rating: CardRatingSchema.nullable().openapi({
    example: "good",}),

  due: DateTimeSchema.openapi({
    example: "2026-05-06T18:53:54.378Z",}),

  totalReviews: z.number().int().nonnegative().default(0).openapi({
    example: 10,}),

  createdAt: DateTimeSchema.openapi({
    example: "2026-05-06T18:53:54.378Z",}),

  updatedAt: DateTimeSchema.openapi({
    example: "2026-05-06T18:53:54.378Z",}),
}).openapi("CardProgress");

export const CreateCardProgressSchema = z.object({
  state: CardStateSchema.default("new").openapi({
    example: "new",}),

  rating: CardRatingSchema.nullable().optional().openapi({
    example: "good",}),

  due: DateTimeSchema.optional().openapi({
    example: "2026-05-06T18:53:54.378Z",}),

  totalReviews: z.number().int().nonnegative().default(0).optional().openapi({
    example: 10,}),
});

export const CardProgressUpdateSchema = z.object({
  state: CardStateSchema.optional(),

  rating: CardRatingSchema.nullable().optional(),

  due: DateTimeSchema.optional(),

  totalReviews: z.number().int().nonnegative().optional(),
})
.strict()
.refine((data) => Object.keys(data).length > 0, {
  message: "At least one field must be provided",
}).openapi("CardProgressUpdate");

export type CardProgressData = z.output<typeof CardProgressSchema>;
export type CreateCardProgressData = z.input<typeof CreateCardProgressSchema>;
export type CardProgressUpdateData = z.input<typeof CardProgressUpdateSchema>;