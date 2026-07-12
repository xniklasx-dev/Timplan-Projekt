"use client";
import { useState } from "react";
import { useAuth } from "@/app/lib/auth/AuthContext";
import Link from "next/link";

import styles from "./page.module.css";
import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

const TEST_DECK_ID = "d54f4045-6ebc-4af8-a7ce-a3ce3b1b905f";
const TEST_CARD_ID = "8a4683f1-7914-4c04-9d99-2a3bc9a21841";

export default function Testing() {
  const { user } = useAuth();
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Testing Page</h1>

        <p className={styles.testInfo}>
          Deck: <code>{TEST_DECK_ID}</code><br />
          Card: <code>{TEST_CARD_ID}</code>
        </p>

        {!user?.token && <p className={styles.testWarning}>Log in with the backend to test card requests.</p>}

        <div className={styles.testButtonRow}>
          <button
            type="button"
            className={styles.testButton}
            onClick={() => setShowAddCard(true)}
            disabled={!user?.token}
          >
            Test add card
          </button>

          <button
            type="button"
            className={styles.testButton}
            onClick={() => setShowEditCard(true)}
            disabled={!user?.token}
          >
            Test edit card
          </button>

          <Link
            className={`${styles.testButton} ${!user?.token ? styles.testButtonDisabled : ""}`}
            href={`/cards/edit/${TEST_DECK_ID}`}
            aria-disabled={!user?.token}
            onClick={(event) => {
              if (!user?.token) event.preventDefault();
            }}
          >
            Test bulk edit
          </Link>
        </div>

        <SingleCardAdd
          open={showAddCard}
          deckId={TEST_DECK_ID}
          token={user?.token ?? ""}
          onClose={() => setShowAddCard(false)}
        />

        <SingleCardEditor
          open={showEditCard}
          deckId={TEST_DECK_ID}
          cardId={TEST_CARD_ID}
          token={user?.token ?? ""}
          onClose={() => setShowEditCard(false)}
          onSaved={() => setShowEditCard(false)}
        />
      </main>
    </div>
  );
}
