import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

export function registerHealthPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/health",
    tags: ["system"],
    description: "Health check – returns backend and database status.",
    responses: {
      200: {
        description: "OK",
        content: {
          "application/json": {
            schema: z.object({
              status: z.string(),
              backend: z.string(),
              database: z.string(),
              durationMs: z.number(),
              timestamp: z.string(),
            }),
          },
        },
      },
    },
  });
}
