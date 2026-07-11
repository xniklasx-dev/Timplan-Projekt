
export interface LoginDTO {
    emailOrUsername: string;
    password: string;
}

export interface RegisterDTO {
    username: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    email: string;
    token: string;
    createdAt?: string;
    updatedAt?: string;
}