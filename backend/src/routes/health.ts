import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200);
  res.json({ status: "ok" });
});

export default router;
