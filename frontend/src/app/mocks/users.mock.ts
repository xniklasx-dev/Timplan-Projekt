
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
        email: "testuser@example.com",
        password: "password",
        token: "mock-token-1",
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        username: "johndoe",
        email: "john@example.com",
        password: "password123",
        token: "mock-token-2",
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        username: "janedoe",
        email: "jane@example.com",
        password: "password456",
        token: "mock-token-3",
        createdAt: new Date().toISOString(),
    }
];