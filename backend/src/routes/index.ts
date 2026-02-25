import { Router } from "express";
import healthRouter from "./health.js";
import decksRouter from "./decks.js";
import docsRouter from "./docs.js";

const router = Router();

// API routes
router.use(healthRouter);
router.use(decksRouter);

// docs
router.use("/docs", docsRouter);

export default router;
