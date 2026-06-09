import { Router } from "express";

import { BatchUpsertCardsSchema, CardUpdateSchema, CreateCardSchema } from "../docs/schemas.js";
import { parseUUID } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { CardsRepository } from "../repositories/cards/cardsRepository.js";
import { env } from "../config/env.js";
import { drizzleCardsRepository } from "../repositories/cards/drizzleRepository.js";
import { loadMockCards } from "../repositories/cards/loadMockCards.js";
import { memoryCardsRepository } from "../repositories/cards/memoryRepository.js";

const router = Router();
const cardsRepository: CardsRepository =
  env.dataSource === "memory" ? loadMockCards(memoryCardsRepository) : drizzleCardsRepository;

async function requireDeckAccess(deckId: string, userId: string): Promise<void> {
  if (!await cardsRepository.hasDeckAccess(deckId, userId)) {
    throw new ApiError(403, "You do not have access to this deck");
  }
}

async function requireCardAccess(cardId: string, userId: string): Promise<void> {
  if (!await cardsRepository.hasCardAccess(cardId, userId)) {
    throw new ApiError(403, "You do not have access to this card");
  }
}

async function requireCardsAccess(cardIds: string[], userId: string): Promise<void> {
  if (!await cardsRepository.hasCardsAccess(cardIds, userId)) {
    throw new ApiError(403, "You do not have access to one or more cards");
  }
}

// GET /cards/getAllCards/:deckId
router.get("/cards/getAllCards/:deckId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  const cardsList = await cardsRepository.getCardsByDeckId(deckId, userId);

  return res.json(cardsList);
}),
);

// GET /cards/:cardId
router.get("/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, userId);

  const card = await cardsRepository.getCardById(cardId, userId);

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  return res.json(card);
}),
);

// POST /cards
router.post("/cards", asyncHandler(async (req, res) => {
  const deckId = parseUUID(req.body.deckId);
  const userId = parseUUID(req.header("userId") as string);

  await requireDeckAccess(deckId, userId);

  const newCardData = CreateCardSchema.parse(req.body);

  const newCard = await cardsRepository.createCard(newCardData);

  return res.status(201).json(newCard);
}),
);

// PATCH /cards/:cardId
router.patch("/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, userId);
  
  const updateData = CardUpdateSchema.parse(req.body);

  const updatedCard = await cardsRepository.updateCard(cardId, updateData);

  if (!updatedCard) {
    throw new ApiError(404, "Card not found");
  }

  return res.json(updatedCard);
}));

// PUT /cards
router.put("/cards", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const body = BatchUpsertCardsSchema.parse(req.body);
  const existingCardIds = body.cards
      .map((card) => card.id)
      .filter((id): id is string => id !== undefined);


  await requireDeckAccess(body.deckId, userId);
  await requireCardsAccess(existingCardIds, userId);

  const upsertedCards = await cardsRepository.upsertManyCards(body);

    res.status(200).json(upsertedCards);
}));

// DELETE /cards/:cardId
router.delete("/cards/:cardId", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.cardId);

  await requireCardAccess(cardId, userId);

  await cardsRepository.deleteCard(cardId);

  return res.status(200).json({ message: "Card deleted successfully" });
  }),
);

// DELETE /cards/batchDelete/:deckId
router.delete("/cards/batchDelete/:deckId", asyncHandler(async (req,res) => {
  const userId = parseUUID(req.header("userId") as string);
  const deckId = parseUUID(req.params.deckId);

  await requireDeckAccess(deckId, userId);

  await cardsRepository.batchDeleteCard(deckId);

  return res.status(200).json({ message: "Cards deleted Sucessfully" });
}),
);

export default router;
