//This file contains type defitions

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

  lastReview?: Date;

  totalReviews: number;
  correctReviews: number;

  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;

  revision: number;
};

export type Deck = {
  id: string;
  name: string;
  description?: string;

  tags: string[];
  cardIds: string[];

  color?: string;
  icon?: string;
  parentDeckId?: string;
  childDeckIds?: string[];

  totalCards: number;
  newCards: number;
  learningCards: number;
  reviewCards: number;
  dueToday: number;

  studiedToday: number;
  lastStudied?: Date;

  createdAt: Date;
  updatedAt: Date;
  deleted: boolean;

  revision: number;
};

export type DateData = {
  date: string; // "YYYY-MM-DD"
  cardIds: string[];
  easy: number;
  medium: number;
  hard: number;
}

export type StatsMap = Record<string, DateData>;
