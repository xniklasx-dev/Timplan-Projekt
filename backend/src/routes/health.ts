import { Router } from "express";
import { sql } from "drizzle-orm";
import { db } from "../db/client.js";

const router = Router();

router.get("/health", async (_req, res) => {
  const startedAt = Date.now();

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

