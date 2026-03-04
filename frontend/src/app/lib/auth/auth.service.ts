import { LoginDTO, RegisterDTO, User } from "./auth.types";
import { mockUsers, MockUser } from "../../mocks/users.mock";

export async function login(data: LoginDTO): Promise<User> {
  const user = mockUsers.find(
    (u) => u.email === data.email && u.password === data.password
  );

    if (!user) {
        throw new Error("Invalid email or password");
    }

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        token: user.token ?? "mock-token-fallback" 
    };
}

export async function register(data: RegisterDTO): Promise<User> {
    const newUser: MockUser = {
        id: crypto.randomUUID(),
        ...data,
        token: "mock-token-" + Date.now(),
        createdAt: new Date().toISOString()
    }

    mockUsers.push(newUser);

    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        token: newUser.token
    };
}