import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

import {
  ChangePasswordSchema,
  ForgotPasswordSchema,
  LoginSchema,
  RegisterSchema,
  UpdateProfileSchema,
  UserSchema,
} from "../validation/userSchemas.js";
import { AuthHeader, ErrorResponseSchema, MessageResponseSchema } from "./pathSchemas.js";

const AuthResponseSchema = z.object({
  token: z.string().openapi({
    example: "your-token",
  }),
  user: UserSchema,
});

export function registerAuthPaths(registry: OpenAPIRegistry): void {
  registry.registerPath({
    method: "get",
    path: "/auth/me",
    tags: ["auth"],
    description: "Get the current user's profile.",
    request: { headers: AuthHeader },
    responses: {
      200: { description: "Current user profile.", content: { "application/json": { schema: UserSchema } } },
      401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/register",
    tags: ["auth"],
    description: "Register a new user.",
    request: { body: { content: { "application/json": { schema: RegisterSchema } } } },
    responses: {
      201: { description: "User registered.", content: { "application/json": { schema: UserSchema } } },
      400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
      409: { description: "Email already in use.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/login",
    tags: ["auth"],
    description: "Login a user.",
    request: { body: { content: { "application/json": { schema: LoginSchema } } } },
    responses: {
      200: { description: "User logged in.", content: { "application/json": { schema: AuthResponseSchema } } },
      400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
      401: { description: "Invalid email or password.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/forgot-password",
    tags: ["auth"],
    description: "Reset email sent if the address exists.",
    request: { body: { content: { "application/json": { schema: ForgotPasswordSchema } } } },
    responses: {
      200: { description: "Password reset email sent.", content: { "application/json": { schema: MessageResponseSchema } } },
      400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/logout",
    tags: ["auth"],
    description: "Logout a user.",
    request: { headers: AuthHeader },
    responses: {
      200: { description: "User logged out.", content: { "application/json": { schema: MessageResponseSchema } } },
      401: { description: "Invalid token.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/auth/me",
    tags: ["auth"],
    description: "Update the current user's profile.",
    request: {
      headers: AuthHeader,
      body: { content: { "application/json": { schema: UpdateProfileSchema } } },
    },
    responses: {
      200: { description: "User profile updated.", content: { "application/json": { schema: UserSchema } } },
      400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
      401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "post",
    path: "/auth/me/avatar",
    tags: ["auth"],
    description: "Update the current user's avatar.",
    request: {
      headers: AuthHeader,
      body: {
        content: {
          "application/json": {
            schema: z.object({ avatarUrl: z.url() }),
          },
        },
      },
    },
    responses: {
      200: { description: "Avatar updated.", content: { "application/json": { schema: UserSchema } } },
      401: { description: "Authentication required.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "patch",
    path: "/auth/me/password",
    tags: ["auth"],
    description: "Change the current user's password.",
    request: {
      headers: AuthHeader,
      body: { content: { "application/json": { schema: ChangePasswordSchema } } },
    },
    responses: {
      200: { description: "Password updated.", content: { "application/json": { schema: MessageResponseSchema } } },
      400: { description: "Invalid request body.", content: { "application/json": { schema: ErrorResponseSchema } } },
      401: { description: "Authentication required or current password is invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/auth/me/avatar",
    tags: ["auth"],
    description: "Remove the current user's avatar.",
    request: { headers: AuthHeader },
    responses: {
      204: { description: "Avatar removed." },
      401: { description: "Authentication required.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });

  registry.registerPath({
    method: "delete",
    path: "/auth/me",
    tags: ["auth"],
    description: "Delete current user's account.",
    request: { headers: AuthHeader },
    responses: {
      204: { description: "User deleted." },
      401: { description: "Authentication required, header missing or invalid.", content: { "application/json": { schema: ErrorResponseSchema } } },
    },
  });
}
