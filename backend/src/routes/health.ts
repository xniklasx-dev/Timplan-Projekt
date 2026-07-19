import { Router } from "express";

const router = Router();

router.get("/health", (_req, res) => {
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

export default router;
