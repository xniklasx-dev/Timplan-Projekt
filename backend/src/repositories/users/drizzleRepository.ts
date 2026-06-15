import { and, eq, getTableColumns, inArray, sql } from "drizzle-orm";

import { db } from "../../db/client.js";
import { Card, User, users } from "../../db/schema.js";
import { CardUpdateData, UpdateUserData } from "../../docs/schemas.js";
import { UsersRepository } from "./usersRepository.js";

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

    async createUser(userData: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
        const [newUser] = await db
            .insert(users)
            .values(userData)
            .returning();

        return newUser;
    }

    async updateUser(id: string, updates: UpdateUserData): Promise<User | null> {
        const [updatedUser] = await db
            .update(users)
            .set({
                ...updates,
                updatedAt: new Date(),
            })
            .where(eq(users.id, id))
            .returning();

        return updatedUser ?? null;
    }

    async deleteUser(id: string): Promise<void> {
        await db.delete(users).where(eq(users.id, id));
    }
}

export const drizzleUsersRepository = new DrizzleUsersRepository();
