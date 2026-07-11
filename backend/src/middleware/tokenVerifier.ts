import { env } from "../config/env.js";
import { ApiError } from "./errorHandler.js";
import jwt from "jsonwebtoken";

// Expects "Bearer token" in Authorization header
export function tokenVerifier(authHeader: string): { userId: string } {
    const token = authHeader.split(" ") [1];
    let decoded: { userId: string };
    try {
        decoded = jwt.verify(token, env.jwtSecret) as { userId: string };
    } catch {
        throw new ApiError(401, "Invalid or expired token");
    }

    return decoded;
}