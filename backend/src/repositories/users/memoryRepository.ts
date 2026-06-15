import { randomUUID } from "node:crypto";

import { User } from "../../db/schema.js";
import { UpdateUserData } from "../../docs/schemas.js";
import { UsersRepository } from "./usersRepository.js";

export class MemoryUsersRepository implements UsersRepository {
    private readonly users = new Map<string, User>();

    loadUsers(users: User[]): void {
        for (const user of users) {
            this.users.set(user.id, user);
        }
    }

    async getUserById(id: string): Promise<User | null> {
        return this.users.get(id) ?? null;
    }

    async getUserByEmail(email: string): Promise<User | null> {
        for (const user of this.users.values()) {
            if (user.email === email) {
                return user;
            }
        }
        return null;
    }

    async createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User> {
        const now = new Date();
        const userData:  User = {
            id: randomUUID(),
            ...user,
            createdAt: now,
            updatedAt: now,
        };
        this.users.set(userData.id, userData);
        return userData;
    }

    async updateUser(id: string, data: UpdateUserData): Promise<User | null> {
        const existingUser = this.users.get(id);

        if(!existingUser) {
            // return null;
            throw Error('User ${id} not found');
        } 
        const updatedUser: User = {
            ...existingUser,
            ...withoutUndefined(data),
            updatedAt: new Date(),
        };
        this.users.set(id, updatedUser);
        return updatedUser;
    }

    async deleteUser(id: string): Promise<void> {
        this.users.delete(id);
    }
}

function withoutUndefined<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

export const memoryUsersRepository = new MemoryUsersRepository();
