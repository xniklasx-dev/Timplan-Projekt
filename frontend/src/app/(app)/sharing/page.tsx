'use client';

import { useMemo, useState } from "react";

import {
  createCard,
  deleteCard,
  getCardById,
  getCardsByDeckId,
  updateCard,
  upsertCards,
} from "@/app/lib/card-service";
import type { Card } from "@/app/lib/definitions";
import { useAuth } from "@/app/lib/auth/AuthContext";
import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import styles from "./page.module.css";

const TEST_DECK_ID = "2c6eddbc-ac07-4326-a298-9b7ab158fbd5";

export default function Sharing() {
  const { user } = useAuth();
  const [cards, setCards] = useState<Card[]>([]);
  const [createdCardId, setCreatedCardId] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [output, setOutput] = useState("No card test has run yet.");

  const firstCardId = useMemo(() => cards[0]?.id ?? createdCardId, [cards, createdCardId]);

  function writeResult(title: string, data: unknown) {
    setOutput(`${title}\n${JSON.stringify(data, null, 2)}`);
  }

  async function runTest(label: string, test: (userId: string) => Promise<unknown>) {
    if (!user?.id) {
      setOutput("Log in first so the card API can receive a userId header.");
      return;
    }

    setIsRunning(label);

    try {
      const result = await test(user.id);
      writeResult(label, result);
    } catch (error) {
      writeResult(`${label} failed`, {
        message: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsRunning(null);
    }
  }

  function makeTestDraft(label: string) {
    return {
      deckId: TEST_DECK_ID,
      front: `Sharing test card ${label}`,
      back: `Created from sharing page at ${new Date().toISOString()}`,
      hint: "Temporary API test card",
      tags: ["sharing-test", "cards-api"],
    };
  }

  function handleModalCardCreated(card: Card) {
    setCreatedCardId(card.id);
    setCards((currentCards) => [...currentCards, card]);
    writeResult("SingleCardAdd created card", card);
  }

  function handleModalCardSaved(card: Card) {
    setCards((currentCards) =>
      currentCards.map((currentCard) =>
        currentCard.id === card.id ? card : currentCard,
      ),
    );
    writeResult("SingleCardEditor saved card", card);
  }

  function openEditModal() {
    if (!firstCardId) {
      setOutput("Load or create a card first, then open the edit modal.");
      return;
    }

    setIsEditModalOpen(true);
  }

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Sharing Page</h1>

        <div className={styles.sections}>
          <section className={styles.testPanel}>
            <div>
              <h2 className={styles.panelTitle}>Card API test buttons</h2>
              <p className={styles.deckId}>Deck: {TEST_DECK_ID}</p>
            </div>

            <div className={styles.buttonGrid}>
              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null}
                onClick={() =>
                  runTest("GET /cards", async (userId) => {
                    const deckCards = await getCardsByDeckId(TEST_DECK_ID, userId);
                    setCards(deckCards);
                    return deckCards;
                  })
                }
              >
                {isRunning === "GET /cards" ? "Running..." : "Get deck cards"}
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null}
                onClick={() =>
                  runTest("POST /cards", async (userId) => {
                    const card = await createCard(makeTestDraft("create"), userId);
                    setCreatedCardId(card.id);
                    setCards((currentCards) => [...currentCards, card]);
                    return card;
                  })
                }
              >
                {isRunning === "POST /cards" ? "Running..." : "Create card"}
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null || !firstCardId}
                onClick={() =>
                  runTest("GET /cards/:id", async (userId) => {
                    if (!firstCardId) throw new Error("Load or create a card first.");
                    return getCardById(firstCardId, userId);
                  })
                }
              >
                {isRunning === "GET /cards/:id" ? "Running..." : "Get first card"}
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null || !firstCardId}
                onClick={() =>
                  runTest("PATCH /cards/:id", async (userId) => {
                    if (!firstCardId) throw new Error("Load or create a card first.");
                    const card = await updateCard(
                      firstCardId,
                      {
                        hint: `Updated from sharing page at ${new Date().toLocaleTimeString()}`,
                        tags: ["sharing-test", "patched"],
                      },
                      userId,
                    );
                    setCards((currentCards) =>
                      currentCards.map((currentCard) =>
                        currentCard.id === card.id ? card : currentCard,
                      ),
                    );
                    return card;
                  })
                }
              >
                {isRunning === "PATCH /cards/:id" ? "Running..." : "Update first card"}
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null}
                onClick={() =>
                  runTest("PUT /cards", async (userId) => {
                    const savedCards = await upsertCards(
                      TEST_DECK_ID,
                      [
                        {
                          front: "Sharing upsert card A",
                          back: "Created via batch upsert",
                          hint: "Batch test",
                          tags: ["sharing-test", "upsert"],
                        },
                        {
                          front: "Sharing upsert card B",
                          back: "Created via batch upsert",
                          hint: "Batch test",
                          tags: ["sharing-test", "upsert"],
                        },
                      ],
                      userId,
                    );
                    setCards(savedCards);
                    return savedCards;
                  })
                }
              >
                {isRunning === "PUT /cards" ? "Running..." : "Batch upsert"}
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null || !createdCardId}
                onClick={() =>
                  runTest("DELETE /cards/:id", async (userId) => {
                    if (!createdCardId) {
                      throw new Error("Create a test card first. This button only deletes that card.");
                    }

                    await deleteCard(createdCardId, userId);
                    setCards((currentCards) =>
                      currentCards.filter((card) => card.id !== createdCardId),
                    );
                    setCreatedCardId(null);
                    return { deletedCardId: createdCardId };
                  })
                }
              >
                {isRunning === "DELETE /cards/:id" ? "Running..." : "Delete created card"}
              </button>
            </div>

            <pre className={styles.output}>{output}</pre>
          </section>

          <section className={styles.testPanel}>
            <div>
              <h2 className={styles.panelTitle}>Card UI modal test</h2>
              <p className={styles.deckId}>
                Uses the existing card modals from <span className={styles.code}>ui/cards</span>.
              </p>
            </div>

            <div className={styles.buttonGrid}>
              <button
                type="button"
                className={styles.testButton}
                disabled={!user?.id}
                onClick={() => setIsAddModalOpen(true)}
              >
                Open add card modal
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={!user?.id || !firstCardId}
                onClick={openEditModal}
              >
                Open edit first card modal
              </button>

              <button
                type="button"
                className={styles.testButton}
                disabled={isRunning !== null}
                onClick={() =>
                  runTest("Reload cards for modals", async (userId) => {
                    const deckCards = await getCardsByDeckId(TEST_DECK_ID, userId);
                    setCards(deckCards);
                    return deckCards;
                  })
                }
              >
                Reload cards
              </button>
            </div>

            <p className={styles.modalHint}>
              Current edit target: {firstCardId ?? "none"}
            </p>
          </section>
        </div>

        {user?.id && (
          <>
            <SingleCardAdd
              open={isAddModalOpen}
              deckId={TEST_DECK_ID}
              userId={user.id}
              onClose={() => setIsAddModalOpen(false)}
              onCreate={handleModalCardCreated}
            />

            <SingleCardEditor
              key={firstCardId ?? "no-card"}
              open={isEditModalOpen}
              cardId={firstCardId}
              userId={user.id}
              onClose={() => setIsEditModalOpen(false)}
              onSaved={handleModalCardSaved}
            />
          </>
        )}
      </main>
    </div>
  );
}
