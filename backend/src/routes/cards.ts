import { Router } from "express";
import { eq, sql } from "drizzle-orm";
import { db } from "../db/client.js";
import { cards, NewCard } from "../db/schema.js";
import { BatchUpsertCardsSchema, CardUpdateSchema, CreateCardSchema } from "../docs/schemas.js";
import { parseUUID, requireDeckOwnership, requireCardOwnership, requireCardsOwnership } from "../utils/apiUtils.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = Router();

// GET /cards?deckId=...
router.get("/cards", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const deckId = parseUUID(req.query.deckId as string);

  await requireDeckOwnership(deckId, userId);

  const cardsList = await db
  .select()
  .from(cards)
  .where(eq(cards.deckId, deckId));

  return res.json(cardsList);
}),
);

// GET /cards/:id:userId
router.get("/cards/:id", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.id);

  await requireCardOwnership(cardId, userId);

  const [card] = await db
  .select()
  .from(cards)
  .where(eq(cards.id, req.params.id))
  .limit(1);

  if (!card) {
    throw new ApiError(404, "Card not found");
  }

  return res.json(card);
}),
);

// POST /cards
router.post("/cards", asyncHandler(async (req, res) => {
  const { deckId, front, back, hint, tags } = CreateCardSchema.parse(req.body);
  const userId = parseUUID(req.header("userId") as string);

  await requireDeckOwnership(deckId, userId);

  const newCardData: NewCard = {
    deckId:deckId,
    front:front,
    back:back,
    hint:hint,
    tags:tags,
  };

  const [newCard] = await db.insert(cards).values(newCardData).returning();

  return res.status(201).json(newCard);
}),
);

// PATCH /cards/:id
router.patch("/cards/:id", asyncHandler(async (req, res) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.id);

  await requireCardOwnership(cardId, userId);
  
  const updateData = CardUpdateSchema.parse(req.body);

  const [updatedCard] = await db.update(cards).set(updateData).where(eq(cards.id, req.params.id)).returning();

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


  await requireDeckOwnership(body.deckId, userId);
  await requireCardsOwnership(existingCardIds, userId);

  const values = body.cards.map((card) => ({
    id: card.id,
    deckId: body.deckId,
    front: card.front,
    back: card.back,
    hint: card.hint,
    tags: card.tags,
  }));

  const upsertedCards = await db
    .insert(cards)
    .values(values)
    .onConflictDoUpdate({
      target: cards.id,
      set: {
        front: sql`EXCLUDED.front`,
        back: sql`EXCLUDED.back`,
        hint: sql`EXCLUDED.hint`,
        tags: sql`EXCLUDED.tags`,
      }
    })
    .returning();

    res.status(200).json(upsertedCards);
}));

// DELETE /cards/:id
router.delete("/cards/:id", asyncHandler(async (req, res, next) => {
  const userId = parseUUID(req.header("userId") as string);
  const cardId = parseUUID(req.params.id);

  await requireCardOwnership(cardId, userId);

  const deleteResult = await db.delete(cards).where(eq(cards.id, req.params.id)).returning();
  if (deleteResult.length === 0) {
      return next(new ApiError(404, "Card not found"));
    }
    return res.json({ message: "Card deleted successfully" }).status(200);
  }),
);

export default router;

