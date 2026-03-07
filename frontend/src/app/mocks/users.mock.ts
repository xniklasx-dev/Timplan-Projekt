
export interface MockUser {
    id: string;
    username: string;
    email: string;
    password: string;
    token: string;
    createdAt: string;
}

export const mockUsers: MockUser[] = [
    {
        id: "1",
        username: "testuser",
        email: "test@example.com",
        password: "password",
        token: "mock-token-1",
        createdAt: new Date().toISOString(),
    },
    { 
        id: "2",
        username: "Nik test",
        email: "nik@example.com",
        password: "password",
        token: "mock-token-2",
        createdAt: new Date().toISOString(),
    },
    { 
        id: "3",
        username: "Max test",
        email: "max@example.com",
        password: "password",
        token: "mock-token-3",
        createdAt: new Date().toISOString(),
    },
    { 
        id: "4",
        username: "Tony test",
        email: "tony@example.com",
        password: "password",
        token: "mock-token-4",
        createdAt: new Date().toISOString(),
    },
    { 
        id: "5",
        username: "Leonie test",
        email: "leonie@example.com",
        password: "password",
        token: "mock-token-5",
        createdAt: new Date().toISOString(),
    },
    { 
        id: "6",
        username: "Pascal test",
        email: "pascal@example.com",
        password: "password",
        token: "mock-token-6",
        createdAt: new Date().toISOString(),
    }
];