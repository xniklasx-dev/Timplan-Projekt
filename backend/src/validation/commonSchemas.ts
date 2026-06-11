import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);

export const UUIDSchema = z.uuid();
export const DateTimeSchema = z.iso.datetime();
export const DateSchema = z.iso.date();

export const TagsSchema = z.array(z.string().min(1));
export const OptionalTagsSchema = TagsSchema.optional().default([]);
export const NullableStringSchema = z.string().nullable();
export const NullableUUIDSchema = UUIDSchema.nullable();

