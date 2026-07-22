////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
"use client";

import Link from "next/link";

import type { SearchResult } from "@/app/lib/search-service";

import styles from "./ResultBox.module.css";

type ResultBoxProps = {
  query: string;
  loading: boolean;
  error: boolean;
  items: SearchResult[];
  onResultClick: () => void;
};

export default function ResultBox({ query, loading, error, items, onResultClick }: ResultBoxProps) {
  const trimmedQuery = query.trim();
  const resultAmount = items.length;

  let statusText = "";
  if (loading) {
    statusText = `Searching for "${trimmedQuery}"…`;
  } else if (error) {
    statusText = "Search could not be loaded.";
  } else if (resultAmount === 0) {
    statusText = `No results for "${trimmedQuery}".`;
  } else {
    statusText =
      resultAmount === 1
        ? `1 result for "${trimmedQuery}".`
        : `${resultAmount} results for "${trimmedQuery}".`;
  }

  return (
    <div className={styles.resultBox}>
      <p className={styles.status} role="status" aria-live="polite">
        {statusText}
      </p>

      <div className={styles.scrollArea}>
        {loading ? (
          <div className={styles.skeletonWrap} aria-hidden="true">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className={styles.skeletonRow} />
            ))}
          </div>
        ) : error ? (
          <div className={styles.empty}>Please try again in a moment.</div>
        ) : resultAmount === 0 ? (
          <div className={styles.empty}>Try a different keyword.</div>
        ) : (
          <ul className={styles.list} aria-label="Search results">
            {items.map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <Link className={styles.link} href={item.link} onClick={onResultClick}>
                  <span className={styles.title}>{item.title}</span>
                  <span className={styles.type} data-type={item.type}>{item.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
