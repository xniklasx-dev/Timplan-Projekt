import { eq } from "drizzle-orm";

import { db } from "../../db/client.js";
import { User, users } from "../../db/schema.js";
import { UpdateProfileData } from "../../validation/userSchemas.js";
import { UsersRepository } from "./usersRepository.js";
import { ApiError } from "../../middleware/errorHandler.js";

export class DrizzleUsersRepository implements UsersRepository {
  async getUserById(id: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    return user ?? null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

    return user ?? null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

    return user ?? null;
  }

  async getUserByResetToken(token:string): Promise<User | null> {
    const [user] = await db
        .select()
        .from(users)
        .where(eq(users.passwordResetToken, token))
        .limit(1);

    return user ?? null;
  }

  async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
    const [newUser] = await db
        .insert(users)
        .values(userData)
        .returning();

    return newUser;
  }

  async updateUser(id: string, updates: UpdateProfileData & {
    passwordResetToken?: string | null;
    passwordResetExpires?: Date | null
  }): Promise<User> {
    const updateData: Partial<User> & {
      passwordResetToken?: string | null;
      passwordResetExpires?: Date | null } = {
      updatedAt: new Date(),
    };

    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.email !== undefined) updateData.email = updates.email;
    if (updates.displayname !== undefined) updateData.displayname = updates.displayname;
    if (updates.avatarUrl !== undefined) updateData.avatarUrl = updates.avatarUrl;
    if (updates.passwordResetToken !== undefined) updateData.passwordResetToken = updates.passwordResetToken;
    if (updates.passwordResetExpires !== undefined) updateData.passwordResetExpires = updates.passwordResetExpires;

    const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }
    return updatedUser;
  }


  async updatePassword(id: string, passwordHash: string): Promise<void> {
    const [updatedUser] = await db
        .update(users)
        .set({
          passwordHash,
          updatedAt: new Date(),
        })
        .where(eq(users.id, id))
        .returning();

    if (!updatedUser) {
      throw new ApiError(404, "User not found");
    }
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}