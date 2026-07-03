import { ApiError } from "../middleware/errorHandler.js";
import { type Request } from "express";
import { UUIDSchema } from "../validation/commonSchemas.js";

export function parseUUID(id: string) {
  return UUIDSchema.parse(id);
}

export function getUserId(req: Request): string {
  const authHeader = req.header("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(401, "Missing bearer token", true, "unauthorized");
  }

  const token = authHeader.replace("Bearer ", "");
  return parseUUID(token);
}