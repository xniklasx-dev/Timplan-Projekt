import { LoginDTO, RegisterDTO, User } from "./auth.types";
import { mockUsers, MockUser } from "@/app/mocks/users.mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export async function login(data: LoginDTO): Promise<User> {
    if (USE_MOCK) {
        console.log("Search for: ", data.emailOrUsername, data.password);
        console.log("Mock users: ", mockUsers.map(u => ({username: u.username, email: u.email, password: u.password})));
        const user = mockUsers.find(
        (u) => (u.email === data.emailOrUsername ||
                u.username === data.emailOrUsername) &&
                u.password === data.password
    );

    console.log("Found user: ", user);

    if (!user) throw new Error("Invalid email or password");

        return {
            id: user.id,
            username: user.username,
            displayname: user.displayname,
            avatarUrl: user.avatarUrl,
            email: user.email,
            token: user.token ?? "mock-token-fallback",
            createdAt: user.createdAt, 
            updatedAt: user.updatedAt
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);

    return {
        id: newUser.id,
        username: newUser.username,
        displayname: newUser.displayname,
        avatarUrl: newUser.avatarUrl,
        email: newUser.email,
        token: newUser.token,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
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
    if (USE_MOCK)  return; 
    await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}