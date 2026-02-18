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
  id: number;
  question: string;
  answer: string;
  createdAt: Date;
  updatedAt: Date;
};