import { ApiError } from "../middleware/errorHandler.js";
import { type Request } from "express";
import { UUIDSchema } from "../validation/commonSchemas.js";
import { tokenVerifier } from "../middleware/tokenVerifier.js";

export function parseUUID(id: string) {
  return UUIDSchema.parse(id);
}

export function getUserId(req: Request): string {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const { userId } = tokenVerifier(authHeader);
  return parseUUID(userId);
}