import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/health", async (_req, res) => {
  const startedAt = Date.now();

  if (env.dataSource === "memory") {
    return res.json({
      status: "ok",
      backend: "ok",
      database: "ok",
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }

  try {
    await db.execute(sql`SELECT 1`);

    res.status(200).json({
      status: "ok",
      backend: "ok",
      database: "ok",
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "degraded",
      backend: "ok",
      database: "error",
      message: error instanceof Error ? error.message : "Unknown error",
      durationMs: Date.now() - startedAt,
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;

