'use client';

import Link from 'next/link';
import styles from './ResultBox.module.css';

interface Props {
  query: string;
  loading: boolean;
  items: Array<{ id: string; title: string; link: string }>;
}

export default function ResultBox({ query, loading, items }: Props) {
  const trimmedQuery = query.trim();
  const resultAmount = items.length;

  let statusText = '';
  if (loading) {
    statusText = trimmedQuery
      ? `Loading results for "${trimmedQuery}"…`
      : 'Loading…';
  } else if (resultAmount === 0) {
    statusText = trimmedQuery
      ? `No results for "${trimmedQuery}".`
      : 'No results.';
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
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={styles.skeletonRow} />
            ))}
        </div>
        ) : resultAmount === 0 ? (
          <div className={styles.empty}>
            Try a different keyword.
          </div>
        ) : (
          <ul className={styles.list} aria-label="Search results">
            {items.map((item) => (
              <li key={item.id} className={styles.item}>
                <Link className={styles.link} href={item.link}>
                  {item.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}