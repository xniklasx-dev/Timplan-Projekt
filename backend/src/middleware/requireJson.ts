import type { Request, Response, NextFunction } from "express";
import { ApiError } from "./errorHandler.js";

export function requireJsonResponse(req: Request, _res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    return next();
  }
  
  const acceptsJson = req.accepts('json');
  if (!acceptsJson) {
    return next(new ApiError(406, "Request must include Accept: application/json", true, "not_acceptable"));
  }
  next();
}

export function requireJsonInBody(req: Request, _res: Response, next: NextFunction) {
  if (req.method === "OPTIONS") {
    return next();
  }
  const methodRequiresBody = ["POST", "PUT", "PATCH"].includes(req.method);
  if (methodRequiresBody && !req.is('application/json')) {
    return next(new ApiError(415, "Content-Type must be application/json", true, "unsupported_media_type"));
  }
  next();
}