export const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Timplan API",
    description: "API documentation for the Timplan project.",
    version: "0.1.0",
  },
  paths: {
    "/health": {
      get: {
        tags: ["system"],
        description: "Health check",
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { status: { type: "string" } },
                  required: ["status"],
                },
              },
            },
          },
        },
      },
    },
  },
} as const;
