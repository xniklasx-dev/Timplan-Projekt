import { Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {ChangePasswordSchema, LoginSchema, RegisterSchema, UpdateProfileSchema} from "../docs/schemas.js";
import { ApiError } from "../middleware/errorHandler.js";
import { asyncHandler } from "../middleware/asyncHandler.js"
import { UsersRepository } from "../repositories/users/usersRepository.js";
import { env } from "../config/env.js";
import { drizzleUsersRepository } from "../repositories/users/drizzleRepository.js";
import { loadMockUsers } from "../repositories/users/loadMockUsers.js";
import { memoryUsersRepository } from "../repositories/users/memoryRepository.js";
import { tokenVerifier } from "../middleware/tokenVerifier.js";

const router = Router();
// Switch mockData/PostgreSQL
const usersRepository: UsersRepository =
  env.dataSource === "memory" 
    ? loadMockUsers(memoryUsersRepository)
    : drizzleUsersRepository;

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
  const result = RegisterSchema.safeParse(req.body);

  if (!result.success) {
    throw new ApiError(400, "Invalid input"); 
  }

  const { email, username, password } = result.data;
  const existingUsername = await usersRepository.getUserByUsername(username);
  const existingEmail = await usersRepository.getUserByEmail(email);
    
  if (existingUsername) {
    throw new ApiError(409, "Username already in use");
  }
  if (existingEmail) {
    throw new ApiError(409, "Email already in use");
  }

  // Salt rounds 12
  const passwordHash = await bcrypt.hash(password, 12);

  const newUser = await usersRepository.createUser({ 
    email, username, passwordHash, displayName: null, avatarUrl: null 
  });

  const { passwordHash: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
}));


// POST /auth/login
router.post("/auth/login", asyncHandler(async(req, res) => {
  const result = LoginSchema.safeParse(req.body);
  
  if (!result.success) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const { emailOrUsername, password } = result.data;
  const user = emailOrUsername.includes("@")
    ? await usersRepository.getUserByEmail(emailOrUsername)
    : await usersRepository.getUserByUsername(emailOrUsername);

  if (!user) {
    throw new ApiError(401, "Invalid email or username");
  }

  const isValidUser = await bcrypt.compare(password, user.passwordHash);
  if (!isValidUser) {
    throw new ApiError(401, "Invalid password")
  }
  const token = jwt.sign(
    { userId: user.id },
    env.jwtSecret,
    { expiresIn: "7d" }
  );

  const { passwordHash: _, ...safeUser } = user;
  res.status(200).json({ token, user: safeUser });

}));


// POST /auth/forgot-password
router.post("/auth/forgot-password", asyncHandler(async(req, res) => {
    const { email } =  req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    // Coming soon
    res.status(200).json({
      "message": "If this email exists, a reset link has been sent" 
    });
}));


// POST /auth/logout
router.post("/auth/logout", asyncHandler(async(req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
      throw new ApiError(401, "Authorization header is missing");
  }

  tokenVerifier(authHeader);

  res.status(200).json({ message: "Logged out successfully" });
}));


// POST /auth/me/avatar
router.post("/auth/me/avatar", asyncHandler(async(req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || authHeader.length === 0) {
        throw new ApiError(401, "Authorization header is missing");
    }

    const { avatarUrl } = req.body;
    const decoded = tokenVerifier(authHeader);
    const user = await usersRepository.updateUser(decoded.userId, { avatarUrl });

    const { passwordHash: _, ...safeUser } = user;
    res.status(200).json(safeUser);
}));

//PATCH /auth/me
router.patch("/auth/me", asyncHandler(async(req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Authorization header is missing");
    }

    const decoded = tokenVerifier(authHeader);
    
    const user = await usersRepository.getUserById(decoded.userId);

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const result = UpdateProfileSchema.safeParse(req.body);

    if (!result.success) {
      throw new ApiError(400, "invalid input");
    }

    const updateUser = await usersRepository.updateUser(decoded.userId, result.data);

    
    const { passwordHash: _, ...safeUser } = updateUser;
    res.status(200).json(safeUser);
}));


// PATCH /auth/me/password
router.patch("/auth/me/password", asyncHandler(async(req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Authorization header is missing");
    }

    const result = ChangePasswordSchema.safeParse(req.body);

    if (!result.success) {
        throw new ApiError(400, "invalid input");
    }

    const { currentPassword, newPassword } = result.data;
    const  decoded = tokenVerifier(authHeader);
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

    res.status(200).json({ message: "Password updated successfully" });

}));


// DELETE /auth/me/avatar
router.delete("/auth/me/avatar", asyncHandler(async(req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Authorization header is missing");
    }

    const  decoded = tokenVerifier(authHeader);
    await usersRepository.updateUser(decoded.userId, { avatarUrl: null });

    res.status(204).send();
}));


// DELETE /auth/me
router.delete("/auth/me", asyncHandler(async(req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new ApiError(401, "Authorization header is missing");
    }

    const decoded = tokenVerifier(authHeader);
    
    const user = await usersRepository.getUserById(decoded.userId);

    if(!user) {
      throw new ApiError(404, "User not found");
    }

    await usersRepository.deleteUser(decoded.userId);

    res.status(204).send();
}));


export default router;