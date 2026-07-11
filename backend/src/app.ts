import express from "express";
import routes from "./routes/index.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requireJsonResponse, requireJsonInBody } from "./middleware/requireJson.js";

export function createApp() {
  const app = express();

  app.use(corsMiddleware());

  app.use(requireJsonResponse);
  app.use(requireJsonInBody);
  app.use(express.json());
  
  app.use(routes);

  app.use((_req, res) => {
    res.status(404).json({ error: "not_found", message: "Route not found" });
  });

  app.use(errorHandler);

  return app;
}
