'use client';

import Link from 'next/link';
import styles from './ResultBox.module.css';

interface Props {
  query: string;
  loading: boolean;
  error: boolean;
  items: Array<{
    id: string;
    title: string;
    link: string;
    type: 'deck' | 'card';
  }>;
  onResultClick: () => void;
}

export default function ResultBox({ query, loading, error, items, onResultClick }: Props) {
  const trimmedQuery = query.trim();
  const resultAmount = items.length;

  let statusText = '';
  if (loading) {
    statusText = `Searching for "${trimmedQuery}"…`;
  } else if (error) {
    statusText = 'Search could not be loaded.';
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
                  <span className={styles.type}>{item.type}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
