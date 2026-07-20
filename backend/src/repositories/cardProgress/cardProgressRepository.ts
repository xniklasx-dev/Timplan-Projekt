import type {CardProgress} from '../../db/schema.js';
import type {CreateCardProgressData, CardProgressUpdateData} from '../../validation/cardProgressSchemas.js';

export interface CardProgressRepository {
  getCardProgress(cardId: string, userId: string): Promise<CardProgress | null>;
  createCardProgress(cardId: string, userId: string, data: CreateCardProgressData): Promise<CardProgress | null>;
  updateCardProgress(cardId: string, userId: string, data: CardProgressUpdateData): Promise<CardProgress | null>;
  deleteCardProgress(cardId: string, userId: string): Promise<boolean>;
  hasDeckAccess(cardId: string, userId: string): Promise<boolean>;
}