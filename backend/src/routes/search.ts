import { Router } from "express";

import { getUserId } from "../utils/apiUtils.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { SearchQuerySchema } from "../validation/searchSchemas.js";

import { searchRepository } from "../repositories/repositories.js";

const router = Router();

// GET /search?q=searchTerm
router.get("/search", asyncHandler(async (req, res) => {
  const userId = getUserId(req);
  const { q } = SearchQuerySchema.parse(req.query);

  const results = await searchRepository.search(q, userId);

  return res.json(results);
}));

export default router;
