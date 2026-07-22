////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import { SearchQuerySchema } from "../validation/searchSchemas.js";
import { AuthHeader, ErrorResponseSchema } from "./pathSchemas.js";

export function registerSearchPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/search",
    tags: ["search"],
    description: "Search the current user's decks and cards.",
    request: {
      headers: AuthHeader,
      query: SearchQuerySchema,
    },
    responses: {
      200: {
        description: "Matching decks and cards.",
        content: {
          "application/json": {
            schema: z.array(z.object({
              id: z.string(),
              title: z.string(),
              link: z.string(),
              type: z.enum(["deck", "card"]),
            })),
          },
        },
      },
      400: {
        description: "Invalid search query.",
        content: {
          "application/json": {
            schema: ErrorResponseSchema,
          },
        },
      },
    },
  });
}
