import { Router } from "express";
import { json } from "stream/consumers";
import { readFileSync } from "fs";

const router = Router();

router.get("/decks/getAllCardsforDeck/:deckId", (req, res) => {
  const { deckId } = req.params;
  let data;
  try {
    data = JSON.parse(readFileSync("./mockData/mockCards.json", "utf-8"));
  } catch (error) {
    console.error("Error reading or parsing cards.json:", error);
    return res.status(500).json(error);
  }
  const filteredData = data.filter((card: { deckId: string }) => card.deckId === deckId);

  res.status(200);
  res.json(filteredData);
});

export default router;