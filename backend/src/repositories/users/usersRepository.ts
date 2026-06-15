import { User } from "../../db/schema.js";
import { UserData, UpdateUserData } from "../../docs/schemas.js";

export interface UsersRepository {
    getUserById(id: string): Promise<UserData | null>;

    getUserByEmail(email: string): Promise<UserData | null>;

    createUser(user: Omit<UserData, "id" | "createdAt" | "updatedAt">): Promise<UserData>;

    updateUser(id: string, updates: UpdateUserData): Promise<UserData>;

    deleteUser(id: string): Promise<void>;
}