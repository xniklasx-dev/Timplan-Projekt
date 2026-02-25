import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import { getOpenApiDocument } from "./openapi.js";

export function mountSwagger(app: Express) {
  const doc = getOpenApiDocument();

  app.get("/openapi.json", (_req, res) => {
    res.json(doc);
  });

  app.use("/docs", swaggerUi.serve, swaggerUi.setup(doc));
}
