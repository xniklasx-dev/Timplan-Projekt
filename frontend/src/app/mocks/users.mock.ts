
export interface MockUser {
    id: string;
    username: string;
    displayName?: string;
    avatarUrl?: string;
    email: string;
    password: string;
    token: string;
    createdAt: string;
    updatedAt: string;
}

export const mockUsers: MockUser[] = [
    {
        id: "1",
        username: "testuser",
        displayName: "Test User",
        email: "test@example.com",
        password: "password",
        token: "mock-token-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    { 
        id: "2",
        username: "niktest",
        displayName: "Nik",
        email: "nik@example.com",
        password: "password",
        token: "mock-token-2",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    { 
        id: "3",
        username: "maxtest",
        displayName: "Max",
        email: "max@example.com",
        password: "password",
        token: "mock-token-3",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    { 
        id: "4",
        username: "tonytest",
        displayName: "Tony",
        email: "tony@example.com",
        password: "password",
        token: "mock-token-4",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    { 
        id: "5",
        username: "leonietest",
        displayName: "Leonie",
        email: "leonie@example.com",
        password: "password",
        token: "mock-token-5",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    { 
        id: "6",
        username: "pascaltest",
        displayName: "Pascal",
        email: "pascal@example.com",
        password: "password",
        token: "mock-token-6",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
];