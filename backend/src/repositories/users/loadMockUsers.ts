import type { User } from "../../db/schema.js";
import { MemoryUsersRepository, memoryUsersRepository } from "../users/memoryRepository.js";
import mockUsersJson from "../../../mockData/mockUsers.json" with { type: "json" };

type MockUser = Omit<User, "due" | "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

const loadedRepositories = new WeakSet<MemoryUsersRepository>();

export function loadMockUsers(repository: MemoryUsersRepository = memoryUsersRepository): MemoryUsersRepository {
  if (loadedRepositories.has(repository)) {
    return repository;
  }

  repository.loadUsers((mockUsersJson as MockUser[]).map(toUser));
  loadedRepositories.add(repository);

  return repository;
}

function toUser(mockUser: MockUser): User {
  return {
    ...mockUser,
    createdAt: new Date(mockUser.createdAt),
    updatedAt: new Date(mockUser.updatedAt),
  };
}
