import { Router } from "express";
import healthRouter from "./health.js";
import cardsRouter from "./cards.js";
import cardProgressRouter from "./cardProgress.js";
import decksRouter from "./decks.js";
import searchRouter from "./search.js";
import authRouter from "./auth.js";
import docsRouter from "./docs.js";

const router = Router();

router.use(healthRouter);
router.use(cardsRouter);
router.use(cardProgressRouter);
router.use(decksRouter);
router.use(searchRouter);
router.use(authRouter);
router.use(docsRouter);

export default router;
