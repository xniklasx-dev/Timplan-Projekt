import type {Card, CardProgress} from "../../db/schema.js";
import type {CardProgressData, CreateCardProgressData, CardProgressUpdateData} from "../../validation/cardProgressSchemas.js";
import type {CardProgressRepository} from "./cardProgressRepository.js";

type CardsReader = {
    getAllCards(): Card[];
    hasDeckAccess(deckId: string, userId: string,): Promise<boolean>;}

export class MemoryCardProgressRepository implements CardProgressRepository {
    private readonly progressByCardId= new Map<string, CardProgress>();

    constructor(private readonly cardsRepository: CardsReader,) {}

    loadCardProgress(progresslist: CardProgress[]): void {
        for (const progress of progresslist) {
            this.progressByCardId.set(progress.cardId, cloneProgress(progress),);}}
        
    async getCardProgress(cardId: string, userId: string): Promise<CardProgress | null> {
        const progress = this.progressByCardId.get(cardId);
        return progress ? cloneProgress(progress) : null;
    }

    async createCardProgress(cardId: string, userId: string, progressData: CreateCardProgressData): Promise<CardProgress | null> {
        if (this.progressByCardId.has(cardId)) {
            return null;}

        const now = new Date();
        const progress: CardProgress = {
            cardId,
            state: progressData.state ?? "new",
            rating: progressData.rating ?? null,
            due: progressData.due ? new Date(progressData.due): now,
            totalReviews: progressData.totalReviews ?? 0,
            createdAt: now,
            updatedAt: now,
        };

        this.progressByCardId.set(cardId, progress);

        return cloneProgress(progress);}
    
    async updateCardProgress(cardId: string, userId: string, progressData: CardProgressUpdateData): Promise<CardProgress | null> {
        const existingProgress = this.progressByCardId.get(cardId);

        if (!existingProgress) {
            return null;}

        const updatedProgress: CardProgress = {
            ...existingProgress,
            ...withoutUndefined(progressData),
            due: progressData.due? new Date(progressData.due): existingProgress.due,
            updatedAt: new Date(),
        };

        this.progressByCardId.set(cardId, updatedProgress);

        return cloneProgress(updatedProgress);}

    async deleteCardProgress(cardId: string, userId: string): Promise<boolean> {
        return this.progressByCardId.delete(cardId);}

    async hasDeckAccess(cardId: string, userId: string,): Promise<boolean> {
        const card = this.cardsRepository.getAllCards().find((card) => card.id === cardId);

        if (!card) {
            return false;}

    return this.cardsRepository.hasDeckAccess(card.deckId,userId,);
}}


function withoutUndefined<T extends object>(data: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;}

function cloneProgress(progress: CardProgress): CardProgress {
    return {
        ...progress,
        due: new Date(progress.due.getTime()),
        createdAt: new Date(progress.createdAt.getTime()),
        updatedAt: new Date(progress.updatedAt.getTime()),};
}