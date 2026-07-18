import { Router } from "express";

import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../middleware/errorHandler.js";
import { decksRepository } from "../repositories/repositories.js";
import { validateDeckParent } from "../services/deckHierarchy.js";
import { getUserId, parseUUID } from "../utils/apiUtils.js";
import {
  CreateDeckSchema,
  DeckUpdateSchema,
} from "../validation/deckSchemas.js";

const router = Router();

router.get(
  "/decks",
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    const userDecks = await decksRepository.getDecksByUserId(userId);

    return res.status(200).json(userDecks);
  }),
);

router.get(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const deckId = parseUUID(req.params.deckId);

    const deck = await decksRepository.getDeckById(deckId, userId);

    if (!deck) {
      throw new ApiError(404, "Deck not found");
    }

    return res.status(200).json(deck);
  }),
);

router.post(
  "/decks",
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);

    const input = CreateDeckSchema.parse(req.body);

    await validateDeckParent({
      decksRepository,
      userId,
      parentDeckId: input.parentDeckId,
    });

    const createdDeck = await decksRepository.createDeck({
      ...input,
      userId,
    });

    return res.status(201).json(createdDeck);
  }),
);

router.patch(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const deckId = parseUUID(req.params.deckId);

    const existingDeck = await decksRepository.getDeckById(deckId, userId);

    if (!existingDeck) {
      throw new ApiError(404, "Deck not found");
    }

    const input = DeckUpdateSchema.parse(req.body);

    if (input.parentDeckId !== undefined) {
      await validateDeckParent({
        decksRepository,
        userId,
        deckId,
        parentDeckId: input.parentDeckId,
      });
    }

    const updatedDeck = await decksRepository.updateDeck(deckId, userId, input);

    return res.status(200).json(updatedDeck);
  }),
);

router.delete(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const deckId = parseUUID(req.params.deckId);

    const deleted = await decksRepository.deleteDeck(deckId, userId);

    if (!deleted) {
      throw new ApiError(404, "Deck not found");
    }

    return res.status(204).send();
  }),
);

export default router;
