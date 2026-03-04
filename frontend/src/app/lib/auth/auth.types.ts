
export interface LoginDTO {
    email: string;
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
    email: string;
    token: string;
}