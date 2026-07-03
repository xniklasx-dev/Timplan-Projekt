import { Router} from "express";

import { BatchUpsertCardsSchema, CardUpdateSchema, CreateCardSchema } from "../validation/cardSchemas.js";
import { parseUUID, getUserId } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

import { cardsRepository } from "../repositories/repositories.js";

const router = Router();

async function requireDeckAccess(deckId: string, userId: string): Promise<void> {
  if (!await cardsRepository.hasDeckAccess(deckId, userId)) {
    throw new ApiError(403, "You do not have access to this deck", true, "forbidden");
  }
}

// GET /decks/:deckId/cards
router.get("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const cardsList = await cardsRepository.getCardsByDeckId(deckId, userId);

  return res.json(cardsList);
}),
);

// GET /decks/:deckId/cards/:cardId
router.get("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const card = await cardsRepository.getCardById(cardId, deckId, userId);

  if (!card) {
    throw new ApiError(404, "Card not found", true, "not_found");
  }

  return res.json(card);
}),
);

// POST /decks/:deckId/cards
router.post("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const deckId = parseUUID(req.params.deckId);
  const userId = getUserId(req);

  await requireDeckAccess(deckId, userId);

  const newCardData = {
    ...CreateCardSchema.parse(req.body),
    deckId,
  };

  const newCard = await cardsRepository.createCard(newCardData);

  return res.status(201).json(newCard);
}),
);

// PATCH /decks/:deckId/cards/:cardId
router.patch("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);
  
  const updateData = CardUpdateSchema.parse(req.body);

  const updatedCard = await cardsRepository.updateCard(cardId, deckId, updateData);

  if (!updatedCard) {
    throw new ApiError(404, "Card not found", true, "not_found");
  }

  return res.json(updatedCard);
}));

// PUT /decks/:deckId/cards
router.put("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const cardListData = {
    ...BatchUpsertCardsSchema.parse(req.body),
    deckId,
  };

  const upsertedCards = await cardsRepository.upsertManyCards(cardListData);

  res.json(upsertedCards);
}));

// DELETE /decks/:deckId/cards/:cardId
router.delete("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const deleted = await cardsRepository.deleteCard(cardId, deckId);

  if (!deleted) {
    throw new ApiError(404, "Card not found", true, "not_found");
  }

  return res.json({ message: "Card deleted successfully" });
}));

export default router;
