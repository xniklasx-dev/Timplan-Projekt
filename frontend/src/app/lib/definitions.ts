//This file contains type defitions
export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
} | null;

export type Card = {
  id: string;
  deckId: string;

  front: string;
  back: string;
  hint?: string | null;

  tags: string[];

  state: "new" | "learning" | "review" | "suspended";

  due: Date;
  rating: "again" | "hard" | "good" | "easy" | 0 | 1 | 2 | 3 | null;

  totalReviews: number;

  createdAt: Date;
  updatedAt: Date;
};

export type Deck = {
  id: string;
  name: string;
  description?: string;

  tags: string[];
  cardIds: string[];

  color?: string;
  parentDeckId?: string;
  childDeckIds?: string[];

  totalCards: number;
  newCards: number;
  dueToday: number;
  lastStudied?: Date;

  createdAt: Date;
  updatedAt: Date;
};

export type DateData = {
  date: string; // "YYYY-MM-DD"
  cardIds: string[];
  easy: number;
  medium: number;
  hard: number;
};

export type StatsMap = Record<string, DateData>;
