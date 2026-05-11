import { z } from "zod";
import { registry } from "./registry.js";


const DeckIdParam = z.object({
  id: z.string().openapi({ example: "5980c97c-e245-400a-b4c1-52b07feac04f" }),
});

const CardIdParam = z.object({
  id: z.string().openapi({ example: "5980c97c-e245-400a-b4c1-52b07feac04f" }),
});

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