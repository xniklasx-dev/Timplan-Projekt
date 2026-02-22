import cors from "cors";
import type { RequestHandler } from "express";
import { env } from "../config/env.js";

export function corsMiddleware(): RequestHandler {
  const allowed = new Set(env.allowedOrigins);
  const allowAll = allowed.has("*");

  return cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowAll) return callback(null, true);
      return callback(null, allowed.has(origin));
    },
    credentials: true,
  });
}