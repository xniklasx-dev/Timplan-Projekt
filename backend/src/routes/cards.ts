import { Router } from "express";

const router = Router();

// GET /cards?deckId=...
router.get("/cards", async (req, res) => {
 /// to do 
});

// GET /cards/:id
router.get("/cards/:id", async (req, res) => {
  /// to do 
});

// POST /cards
router.post("/cards", async (req, res) => {
 /// to do 
});

// PATCH /cards/:id
router.patch("/cards/:id", async (req, res) => {
  /// to do 
});

// DELETE /cards/:id
router.delete("/cards/:id", async (req, res) => {
  /// to do
});

export default router;

