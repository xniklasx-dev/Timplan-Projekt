import type { Request } from "express";

import { ApiError } from "../middleware/errorHandler.js";
import { tokenVerifier } from "../middleware/tokenVerifier.js";

export function getDeckUserId(req: Request): string {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const { userId } = tokenVerifier(authHeader);

  return userId;
}
