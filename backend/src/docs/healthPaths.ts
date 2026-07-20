////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export function registerHealthPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["system"],
    description: "Health check – returns the current backend status.",
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: z.object({
              status: z.string(),
              timestamp: z.string(),
            }),
          },
        },
      },
    },
  });
}
