'use client';

import { useState } from 'react';

import styles from "./page.module.css";
import SingleCardEditor from "@/app/ui/cards/singleCardEditor/SingleCardEditor";

export default function Sharing() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1>Sharing Page</h1>

        <button
          type="button"
          className={styles.testButton}
          onClick={() => setIsModalOpen(true)}
        >
          Open single card edit
        </button>
      </main>

      <SingleCardEditor
        open={isModalOpen}
        cardId="c1"
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}