import { User } from "../../db/schema.js";
import { UpdateProfileData } from "../../validation/userSchemas.js";

export interface UsersRepository {
  getUserById(id: string): Promise<User | null>;

  getUserByEmail(email: string): Promise<User | null>;

  getUserByUsername(username: string): Promise<User | null>;

  getUserByResetToken(token: string): Promise<User | null>;

  createUser(user: Omit<User, "id" | "createdAt" | "updatedAt"> & {
      passwordHash: string;
      passwordResetToken: string | null;
      passwordResetExpires: Date | null
  }): Promise<User>;

  updateUser(id: string, updates: UpdateProfileData & {
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null
  }): Promise<User>;

  updatePassword(id: string, passwordHash: string): Promise<void>

  deleteUser(id: string): Promise<void>;
}