"use client";

import { useState } from "react";
import Link from "next/link";

import styles from "./page.module.css";
import SingleCardAdd from "@/app/ui/cards/singleCardAdd/SingleCardAdd";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

const TEST_DECK_ID = "4992f5a6-2220-48a1-ac6c-1c762526bd45";
const TEST_CARD_ID = "87894550-48d2-43c3-b5df-c77361fd687b";
const TEST_USER_ID = "833cfb77-79b1-4f23-bfb0-51c1cbecd7ae";

export default function Testing() {
  const [showAddCard, setShowAddCard] = useState(false);
  const [showEditCard, setShowEditCard] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Testing Page</h1>

        <div className={styles.testButtonRow}>
          <button type="button" className={styles.testButton} onClick={() => setShowAddCard(true)}>
            Test add card
          </button>

          <button type="button" className={styles.testButton} onClick={() => setShowEditCard(true)}>
            Test edit card
          </button>

          <Link className={styles.testButton} href={`/cards/edit/${TEST_DECK_ID}`}>
            Test bulk edit
          </Link>
        </div>

        <SingleCardAdd
          open={showAddCard}
          deckId={TEST_DECK_ID}
          userId={TEST_USER_ID}
          onClose={() => setShowAddCard(false)}
        />

        <SingleCardEditor
          open={showEditCard}
          deckId={TEST_DECK_ID}
          cardId={TEST_CARD_ID}
          userId={TEST_USER_ID}
          onClose={() => setShowEditCard(false)}
          onSaved={() => setShowEditCard(false)}
        />
      </main>
    </div>
  );
}
