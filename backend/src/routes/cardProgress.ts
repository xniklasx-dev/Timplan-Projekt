import { Router } from "express";
import {CardProgressUpdateSchema,CreateCardProgressSchema,} from "../validation/cardProgressSchemas.js";
import { getUserId, parseUUID } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

import {cardProgressRepository,cardsRepository,} from "../repositories/repositories.js";

const router = Router();

async function requireCardAccess(cardId: string,deckId: string,userId: string,): Promise<void> {
  if (!await cardsRepository.hasDeckAccess(deckId, userId)) {
    throw new ApiError(403, "You do not have access to this deck", true, "forbidden");}

  const card = await cardsRepository.getCardById(cardId, deckId, userId);

  if (!card) {
    throw new ApiError(404, "Card not found", true, "not_found");}
}

//GET the progress of a card
router.get("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, deckId, userId);

  const progress = await cardProgressRepository.getCardProgress(cardId, userId);

  if (!progress) {
    throw new ApiError(404, "Card progress not found");}

  return res.json(progress);
}));

//POST new progress of a card
router.post("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, deckId, userId);

  const parsedData = CreateCardProgressSchema.parse(req.body);

  const createdProgress = await cardProgressRepository.createCardProgress(cardId, userId, parsedData);

  if (!createdProgress) {
    throw new ApiError(409, "Card progress already exists");
  }

  return res.status(201).json(createdProgress);
}));

//PATCH update progress of a card
router.patch("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, deckId, userId);

  const updateData = CardProgressUpdateSchema.parse(req.body);
  const updatedProgress = await cardProgressRepository.updateCardProgress(
    cardId,
    userId,
    updateData,
  );

  if (!updatedProgress) {
    throw new ApiError(404, "Card progress not found", true, "not_found");
  }

  return res.json(updatedProgress);
}));

//DELETE progress of a card
router.delete("/decks/:deckId/cards/:cardId/progress", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, deckId, userId);

  const deleted = await cardProgressRepository.deleteCardProgress(cardId, userId);

  if (!deleted) {
    throw new ApiError(404, "Card progress not found", true, "not_found");
  }

  return res.json({ message: "Card progress deleted successfully" });
}));

export default router;