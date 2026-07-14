import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import * as crypto from "crypto";

import {
  ChangePasswordSchema,
  LoginSchema,
  RegisterSchema, ResetPasswordSchema,
  UpdateProfileSchema
} from "../validation/userSchemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js"
import { env } from "../config/env.js";
import { usersRepository } from "../repositories/repositories.js";
import { tokenVerifier } from "../middleware/tokenVerifier.js";
import { sendResetEmail } from "../utils/mailUtils.js";

const router = Router();

// GET /auth/me
router.get("/auth/me", asyncHandler(async(req, res) => {
  const authHeader = req.headers.authorization;
  if(!authHeader) {
    throw new ApiError(401, "Authorization header is missing")
  }

  const decoded = tokenVerifier(authHeader);
  const user = await usersRepository.getUserById(decoded.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json(safeUser)
}));

// POST /auth/register
router.post("/auth/register", asyncHandler(async(req, res) => {
  const result = RegisterSchema.parse(req.body);
  if (!result) {
    throw new ApiError(400, "Invalid input");
  }

  const { email, username, password } = result;
  const existingUsername = await usersRepository.getUserByUsername(username);
  const existingEmail = await usersRepository.getUserByEmail(email);
  if (existingUsername) {
    throw new ApiError(409, "Username already in use");
  }
  if (existingEmail) {
    throw new ApiError(409, "Email already in use");
  }

  // Salt rounds 8
  const passwordHash = await bcrypt.hash(password, 8);
  const newUser = await usersRepository.createUser({
    email,
    username,
    passwordHash,
    displayname: null,
    avatarUrl: null,
    passwordResetToken: null,
    passwordResetExpires: null
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
}));


// POST /auth/login
router.post("/auth/login", asyncHandler(async(req, res) => {
  const result = LoginSchema.parse(req.body);
  if (!result) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const { emailOrUsername, password } = result;
  const user = emailOrUsername.includes("@")
      ? await usersRepository.getUserByEmail(emailOrUsername)
      : await usersRepository.getUserByUsername(emailOrUsername);
  if (!user) {
    throw new ApiError(401, "Invalid email or username");
  }

  const isValidUser = await bcrypt.compare(password, user!.passwordHash);
  if (!isValidUser) {
    throw new ApiError(401, "Invalid password")
  }

  const token = jwt.sign(
      { userId: user!.id },
      env.jwtSecret,
      { expiresIn: "7d" }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ token, user: safeUser });
}));

// POST /auth/forgot-password
router.post("/auth/forgot-password", asyncHandler(async(req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await usersRepository.getUserByEmail(email);
  if (!user) {
    return res.status(200).json({
      "message": "If this email exists, a reset link has been sent"
    });
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  const expiresAt = new Date(Date.now() + 3600000);
  await usersRepository.updateUser(user.id, {
    passwordResetToken: hashedToken,
    passwordResetExpires: expiresAt
  });

  await sendResetEmail(user.email, resetToken);
  res.status(200).json({
    "message": "If this email exists, a reset link has been sent"
  });
}));

// POST /auth/reset-password
router.post("/auth/reset-password", asyncHandler(async(req, res) => {
  const result = ResetPasswordSchema.parse(req.body);
  if (!result) {
    throw new ApiError(400, "Invalid input");
  }

  const { token, newPassword } = result;
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await usersRepository.getUserByResetToken(hashedToken);
  if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(newPassword, 8);
  await usersRepository.updatePassword(user.id, passwordHash);
  await usersRepository.updateUser(user.id, {
    passwordResetToken: null,
    passwordResetExpires: null
  });

  res.status(200).json({
    message: "Password reset successfully"
  });
}));

// POST /auth/logout
router.post("/auth/logout", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  tokenVerifier(authHeader);
  res.status(200).json({message: "Logged out successfully"});
}));


// POST /auth/me/avatar
router.post("/auth/me/avatar", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader.length === 0) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const {avatarUrl} = req.body;
  const decoded = tokenVerifier(authHeader);
  const user = await usersRepository.updateUser(decoded.userId, {avatarUrl});
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const {passwordHash: _, ...safeUser} = user;
  res.status(200).json(safeUser);
}));

//PATCH /auth/me
router.patch("/auth/me", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const decoded = tokenVerifier(authHeader);
  const user = await usersRepository.getUserById(decoded.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const result = UpdateProfileSchema.parse(req.body);
  if (!result) {
    throw new ApiError(400, "invalid input");
  }

  const updateUser = await usersRepository.updateUser(decoded.userId, result);
  const {passwordHash: _, ...safeUser} = updateUser;
  res.status(200).json(safeUser);
}));


// PATCH /auth/me/password
router.patch("/auth/me/password", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const result = ChangePasswordSchema.parse(req.body);
  if (!result) {
    throw new ApiError(400, "invalid input");
  }

  const {currentPassword, newPassword} = result;
  const decoded = tokenVerifier(authHeader);
  const user = await usersRepository.getUserById(decoded.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    throw new ApiError(401, "Invalid password");
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await usersRepository.updatePassword(decoded.userId, passwordHash);
  res.status(200).json({message: "Password updated successfully"});
}));


// DELETE /auth/me/avatar
router.delete("/auth/me/avatar", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const decoded = tokenVerifier(authHeader);
  await usersRepository.updateUser(decoded.userId, {avatarUrl: null});
  res.status(204).send();
}));


// DELETE /auth/me
router.delete("/auth/me", asyncHandler(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    throw new ApiError(401, "Authorization header is missing");
  }

  const decoded = tokenVerifier(authHeader);
  const user = await usersRepository.getUserById(decoded.userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  await usersRepository.deleteUser(decoded.userId);
  res.status(204).send();
}));

  export default router;