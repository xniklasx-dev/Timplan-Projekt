import { Router } from "express";
import healthRouter from "./health.js";
import docsRouter from "./docs.js";

const router = Router();

// API routes
router.use(healthRouter);

// docs
router.use("/docs", docsRouter);

export default router;
