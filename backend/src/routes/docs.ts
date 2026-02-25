import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { getOpenApiDocument } from "../docs/openapi.js";

const router = Router();

const doc = getOpenApiDocument();

router.get("/openapi.json", (_req, res) => {
  res.json(doc);
});

router.use("/", swaggerUi.serve, swaggerUi.setup(doc));

export default router;