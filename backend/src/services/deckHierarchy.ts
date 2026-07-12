import { ApiError } from "../middleware/errorHandler.js";
import type { DecksRepository } from "../repositories/decks/decksRepository.js";

type ValidateDeckParentOptions = {
  decksRepository: DecksRepository;
  userId: string;
  parentDeckId: string | null | undefined;

  deckId?: string;
};

export async function validateDeckParent({
  decksRepository,
  userId,
  parentDeckId,
  deckId,
}: ValidateDeckParentOptions): Promise<void> {
  if (parentDeckId === null || parentDeckId === undefined) {
    return;
  }

  if (deckId && parentDeckId === deckId) {
    throw new ApiError(400, "A deck cannot be its own parent");
  }

  const userDecks = await decksRepository.getDecksByUserId(userId);

  const decksById = new Map(userDecks.map((deck) => [deck.id, deck]));

  const requestedParent = decksById.get(parentDeckId);

  if (!requestedParent) {
    throw new ApiError(400, "Parent deck does not exist or is not accessible");
  }

  const visitedDeckIds = new Set<string>();

  let currentDeck = requestedParent;

  while (currentDeck) {
    if (deckId && currentDeck.id === deckId) {
      throw new ApiError(400, "The requested parent would create a deck cycle");
    }

    if (visitedDeckIds.has(currentDeck.id)) {
      throw new ApiError(409, "The existing deck hierarchy contains a cycle");
    }

    visitedDeckIds.add(currentDeck.id);

    if (!currentDeck.parentDeckId) {
      break;
    }

    const nextDeck = decksById.get(currentDeck.parentDeckId);

    if (!nextDeck) {
      throw new ApiError(409, "The existing deck hierarchy is inconsistent");
    }

    currentDeck = nextDeck;
  }
}
