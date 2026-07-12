import { Router } from "express";

import { asyncHandler } from "../middleware/asyncHandler.js";
import { ApiError } from "../middleware/errorHandler.js";
import { decksRepository } from "../repositories/repositories.js";
import { validateDeckParent } from "../services/deckHierarchy.js";
import { getDeckUserId } from "../utils/deckAuth.js";
import {
  CreateDeckSchema,
  DeckUpdateSchema,
} from "../validation/deckSchemas.js";
import { UUIDSchema } from "../validation/commonSchemas.js";

const router = Router();

router.get(
  "/decks",
  asyncHandler(async (req, res) => {
    const userId = getDeckUserId(req);

    const userDecks = await decksRepository.getDecksByUserId(userId);

    return res.status(200).json(userDecks);
  }),
);

router.get(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getDeckUserId(req);
    const deckId = UUIDSchema.parse(req.params.deckId);

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
    const userId = getDeckUserId(req);

    const input = CreateDeckSchema.parse(req.body);

    const normalizedName = input.name.trim();

    if (!normalizedName) {
      throw new ApiError(400, "Deck name must not be empty");
    }

    await validateDeckParent({
      decksRepository,
      userId,
      parentDeckId: input.parentDeckId,
    });

    const createdDeck = await decksRepository.createDeck({
      ...input,
      name: normalizedName,
      userId,
    });

    return res.status(201).json(createdDeck);
  }),
);

router.patch(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getDeckUserId(req);
    const deckId = UUIDSchema.parse(req.params.deckId);

    const existingDeck = await decksRepository.getDeckById(deckId, userId);

    if (!existingDeck) {
      throw new ApiError(404, "Deck not found");
    }

    const input = DeckUpdateSchema.parse(req.body);

    const updateData = {
      ...input,
    };

    if (input.name !== undefined) {
      const normalizedName = input.name.trim();

      if (!normalizedName) {
        throw new ApiError(400, "Deck name must not be empty");
      }

      updateData.name = normalizedName;
    }

    if (Object.prototype.hasOwnProperty.call(input, "parentDeckId")) {
      await validateDeckParent({
        decksRepository,
        userId,
        deckId,
        parentDeckId: input.parentDeckId,
      });
    }

    const updatedDeck = await decksRepository.updateDeck(
      deckId,
      userId,
      updateData,
    );

    if (!updatedDeck) {
      throw new ApiError(404, "Deck not found");
    }

    return res.status(200).json(updatedDeck);
  }),
);

router.delete(
  "/decks/:deckId",
  asyncHandler(async (req, res) => {
    const userId = getDeckUserId(req);
    const deckId = UUIDSchema.parse(req.params.deckId);

    const deleted = await decksRepository.deleteDeck(deckId, userId);

    if (!deleted) {
      throw new ApiError(404, "Deck not found");
    }

    return res.status(204).send();
  }),
);

export default router;
