import { Router } from "express";

import { BatchUpsertCardsSchema, CardUpdateSchema, CreateCardSchema } from "../docs/schemas.js";
import { parseUUID } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { CardsRepository } from "../repositories/cards/cardsRepository.js";
import { env } from "../config/env.js";
import { drizzleCardsRepository } from "../repositories/cards/drizzleCardsRepository.js";
import { loadMockCards } from "../repositories/cards/loadMockCards.js";
import { memoryCardsRepository } from "../repositories/cards/memoryCardsRepository.js";

const router = Router();
const cardsRepository: CardsRepository = env.dataSource === "memory" ? loadMockCards(memoryCardsRepository) : drizzleCardsRepository;

async function requireDeckAccess(deckId: string, userId: string): Promise<void> {
  if (!await cardsRepository.hasDeckAccess(deckId, userId)) {
    throw new ApiError(403, "You do not have access to this deck");
  }
}

// GET /decks/:deckId/cards
router.get("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const cardsList = await cardsRepository.getCardsByDeckId(deckId, userId);

  return res.json(cardsList);
}),
);

// GET /decks/:deckId/cards/:cardId
router.get("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const card = await cardsRepository.getCardById(cardId, userId);

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  return res.json(card);
}),
);

// POST /decks/:deckId/cards
router.post("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const deckId = parseUUID(req.body.deckId);
  const userId = parseUUID(req.header("userId") as string);

  await requireDeckAccess(deckId, userId);

  const newCardData = CreateCardSchema.parse(req.body);

  const newCard = await cardsRepository.createCard(newCardData);

  return res.status(201).json(newCard);
}),
);

// PATCH /decks/:deckId/cards/:cardId
router.patch("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);
  
  const updateData = CardUpdateSchema.parse(req.body);

  const updatedCard = await cardsRepository.updateCard(cardId, updateData);

  if (!updatedCard) {
    throw new ApiError(404, "Card not found");
  }

  return res.json(updatedCard);
}));

// PUT /decks/:deckId/cards
router.put("/decks/:deckId/cards", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const cardListData = BatchUpsertCardsSchema.parse(req.body);

  const upsertedCards = await cardsRepository.upsertManyCards(cardListData);

  res.json(upsertedCards);
}));

// DELETE /decks/:deckId/cards/:cardId
router.delete("/decks/:deckId/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  await cardsRepository.deleteCard(cardId);

  return res.json({ message: "Card deleted successfully" });
  }),
);

export default router;
