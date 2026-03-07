import { LoginDTO, RegisterDTO, User } from "./auth.types";
import { mockUsers, MockUser } from "../../mocks/users.mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

export async function login(data: LoginDTO): Promise<User> {
    if (USE_MOCK) {
        const user = mockUsers.find(
        (u) => u.email === data.email && u.password === data.password
    );

    if (!user) throw new Error("Invalid email or password");

        return {
            id: user.id,
            username: user.username,
            email: user.email,
            token: user.token ?? "mock-token-fallback" 
        };       
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Login failed");
    }

    return res.json();
}

export async function register(data: RegisterDTO): Promise<User> {
    if (USE_MOCK) {
        const newUser: MockUser = {
        id: crypto.randomUUID(),
        ...data,
        token: "mock-token-" + Date.now(),
        createdAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);

    return {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        token: newUser.token
    };
}

const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
});

if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error ?? "Registration failed");
}

return res.json();
}

export async function logout(): Promise<void> {
    if (USE_MOCK) { return; 
        await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        });
    }
}