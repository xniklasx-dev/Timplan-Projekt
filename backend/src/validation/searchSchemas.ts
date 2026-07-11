////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import { z } from "zod";

export const SearchQuerySchema = z
  .object({
    q: z.string().trim().min(1).max(100),
  })
  .strict();
