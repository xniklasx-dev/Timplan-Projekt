import { Router } from "express";
import { env } from "../config/env.js";

import { CardProgressSchema } from "../validation/cardProgressSchemas.js";
import { parseUUID } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

import { CardProgressRepository } from "../repositories/cardProgress/cardProgressRepository.js";
import { mockCardProgressRepository } from "../repositories/cardProgress/memoryCardProgressRepository.js";
import { drizzleCardProgressRepository } from "../repositories/cardProgress/drizzleCardProgressRepository.js";

const router = Router();

const cardProgressRepository: CardProgressRepository =
  env.dataSource === "memory"
    ? mockCardProgressRepository
    : drizzleCardProgressRepository;

async function requireCardAccess( cardId: string, userId: string): Promise<void> {
  if (!await cardProgressRepository.hasDeckAccess(cardId, userId)) {
    throw new ApiError(403, "You do not have access to this card");
  }
}

//GET the progress of a card
router.get("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, userId);

  const progress = await cardProgressRepository.getCardProgress(cardId, userId);

  if (!progress) {
    throw new ApiError(404, "Card progress not found");
  }

  return res.json(progress);
}));

//GET the progress of all cards in a deck

//POST new progress of a card
router.post("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, userId);

  const parsedData = CardProgressSchema.parse(req.body);

  const updatedProgress = await cardProgressRepository.updateCardProgress(cardId, userId, parsedData);

  return res.json(updatedProgress);
}));

//PATCH update progress of a card

//PUT upsert progress of a card

//DELETE progress of a card