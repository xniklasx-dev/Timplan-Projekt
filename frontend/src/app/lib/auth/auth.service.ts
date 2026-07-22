import {LoginDTO, RegisterDTO, ResetPasswordDTO, User} from "./auth.types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

// auth/register
export async function register(data: RegisterDTO): Promise<User> {
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

// auth/requestPasswordReset
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email}),
    })
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Password reset request failed");
    }

    return res.json();
}

// auth/reset-password
export async function resetPassword(data: ResetPasswordDTO): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error ?? "Password reset failed");
    }
    return res.json();
}

// auth/updateProfile
export async function updateProfile(data: Partial<User>, token: string): Promise<User> {
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
    await fetch(`${API_BASE}/auth/logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
    });
}

// auth/deleteAvatar
export async function deleteAvatar(token: string): Promise<void> {
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