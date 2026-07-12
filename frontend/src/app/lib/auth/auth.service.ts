import { LoginDTO, RegisterDTO, User } from "./auth.types";
import { mockUsers, MockUser } from "@/app/mocks/users.mock";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

function findMockUserByToken(token: string): MockUser {
    const user = mockUsers.find(u => u.token === token || token.includes(u.id));
    if (!user) {
        if (mockUsers.length > 0) return mockUsers[0];
        throw new Error("Unauthorized (Mock Token invalid)");
    }
    return user;
}

// auth/register
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

// auth/login
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

    const { user, token } = await res.json();
    return { ...user, token };
}


// auth/updateProfile
export async function updateProfile(data: Partial<User>, token: string): Promise<User> {
    if (USE_MOCK) {
        const user = findMockUserByToken(token);
        if (data.username) user.username = data.username;
        if (data.displayname) user.displayname = data.displayname;
        if (data.email) user.email = data.email;
        user.updatedAt = new Date().toISOString();
        return { ...user };
    }
    const res = await fetch(`${API_BASE}/auth/me`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Update Profile failed");
    }

    return res.json();
}

// auth/updatePassword
export async function updatePassword(data: { currentPassword: string; newPassword: string }, token: string): Promise<void> {
    if (USE_MOCK) {
        const user = findMockUserByToken(token);
        if (user.password !== data.currentPassword) {
            throw new Error("Invalid current password");
        }
        user.password = data.newPassword;
        user.updatedAt = new Date().toISOString();
        return;
    }
    const res = await fetch(`${API_BASE}/auth/me/password`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Update password failed");
    }
    await  res.text();
    return;
}

// auth/updateAvatar
export async function updateAvatar(avatarUrl: string, token: string): Promise<User> {
    if (USE_MOCK) {
        const user = findMockUserByToken(token);
        user.avatarUrl = avatarUrl;
        user.updatedAt = new Date().toISOString();
        return { ...user };
    }
    const res = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ avatarUrl })
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Update avatar failed");
    }

    return res.json();
}

// auth/logout
export async function logout(): Promise<void> {
    if (USE_MOCK)  return;
    await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

// auth/deleteAvatar
export async function deleteAvatar(token: string): Promise<void> {
    if (USE_MOCK) return ;
    const res = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const error  = await res.json();
        throw new Error(error.error ?? "Delete avatar failed");
    }
}

// auth/deleteAccount
export async function deleteAccount(token: string): Promise<void> {
    if (USE_MOCK) return;
    const res = await fetch(`${API_BASE}/auth/me`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) {
        const error  = await res.json();
        throw new Error(error.error ?? "Delete account failed");
    }
}