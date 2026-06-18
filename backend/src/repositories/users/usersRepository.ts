import { User } from "../../db/schema.js";
import { UpdateProfileData } from "../../docs/schemas.js";

export interface UsersRepository {
    getUserById(id: string): Promise<User | null>;

    getUserByEmail(email: string): Promise<User | null>;

    getUserByUsername(username: string): Promise<User | null>;

    createUser(user: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;

    updateUser(id: string, updates: UpdateProfileData): Promise<User>;

    deleteUser(id: string): Promise<void>;
}