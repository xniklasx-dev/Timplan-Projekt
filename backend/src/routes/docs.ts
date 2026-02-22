import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { openapi } from "../docs/openapi.js";

const router = Router();

// Swagger UI at /docs
router.use("/", swaggerUi.serve, swaggerUi.setup(openapi));

export default router;
