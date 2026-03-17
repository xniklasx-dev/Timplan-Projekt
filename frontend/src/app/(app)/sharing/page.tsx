'use client';

import { useState } from 'react';

import styles from "./page.module.css";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";
import SingleCardAdd from '@/app/ui/cards/singleCardAdd/SingleCardAdd';

export default function Sharing() {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Sharing Page</h1>

        <button
          type="button"
          className={styles.testButton}
          onClick={() => setIsAddOpen(true)}
        >
          Open single card add
        </button>
      </main>

      <SingleCardAdd
        open={isAddOpen}
        deckId="1"
        onClose={() => setIsAddOpen(false)}
        onCreate={() => {}}
      />
    </div>
  );
}