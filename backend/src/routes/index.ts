import { Router } from "express";
import healthRouter from "./health.js";
import cardsRouter from "./cards.js";
import decksRouter from "./decks.js";
import authRouter from "./auth.js";
import docsRouter from "./docs.js";

const router = Router();

router.use(healthRouter);
router.use(cardsRouter);
router.use(decksRouter);
router.use(authRouter);
router.use("/docs", docsRouter);

export default router;
