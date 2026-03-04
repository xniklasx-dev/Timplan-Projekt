'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import styles from './NavSearch.module.css';
import ResultBox from './resultBox/ResultBox';

import type { Card, Deck } from '@/app/lib/definitions';
import { search, type SearchResult } from '@/app/lib/search-function';

import decksData from '@/app/lib/placeholder-decks.json';
import cardsData from '@/app/lib/placeholder-cards.json';

export default function NavSearch({
  open,
  onOpen,
  onClose,
}: {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const urlQuery = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const [query, setQuery] = useState(urlQuery);

  function hydrateCard(raw: any): Card {
    return {
      ...raw,
      due: new Date(raw.due),
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      lastReview: raw.lastReview ? new Date(raw.lastReview) : undefined,
    };
  }

  function hydrateDeck(raw: any): Deck {
    return {
      ...raw,
      createdAt: new Date(raw.createdAt),
      updatedAt: new Date(raw.updatedAt),
      lastStudied: raw.lastStudied
        ? new Date(raw.lastStudied)
        : undefined,
    };
  }

  const decks = useMemo(() => decksData.map(hydrateDeck), []);
  const cards = useMemo(() => cardsData.map(hydrateCard), []);

  const showResults = open && query.trim().length > 0;

  const writeQueryToUrl = (nextQuery: string, mode: 'push' | 'replace' = 'replace') => {
    const params = new URLSearchParams(searchParams.toString());

    const trimmed = nextQuery.trim();
    if (!trimmed) params.delete('q');
    else params.set('q', trimmed);

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    if (mode === 'push') router.push(nextUrl);
    else router.replace(nextUrl);
  };

  useEffect(() => {
    if (open) {
      setQuery(urlQuery);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      inputRef.current?.blur();
    }
  }, [open, urlQuery]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (evt: PointerEvent) => {
      const target = evt.target as Node | null;
      if (!target) return;

      if (buttonRef.current?.contains(target)) return;
      if (overlayRef.current?.contains(target)) return;

      writeQueryToUrl('', 'replace');
      onClose();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, onClose, pathname, router, searchParams]);

  const items: SearchResult[] = useMemo(() => {
    if (!showResults) return [];
    return search(query, cards, decks);
  }, [showResults, query, cards, decks]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.searchButton}
        onClick={onOpen}
        aria-label="Open search"
      >
        <Image src="/search_icon.svg" alt="" width={20} height={20} />
      </button>

      <div
        ref={overlayRef}
        className={`${styles.searchOverlay} ${open ? styles.searchOpen : ''}`}
      >
        <Image src="/search_icon.svg" alt="" width={20} height={20} />

        <input
          ref={inputRef}
          className={styles.searchInput}
          type="search"
          value={query}
          onChange={(evt) => {
            const next = evt.target.value;
            setQuery(next);
            writeQueryToUrl(next, 'replace');
          }}
          placeholder="Search..."
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="button"
          className={styles.searchClose}
          onClick={() => {
            writeQueryToUrl('', 'replace');
            onClose();
          }}
          aria-label="Close search"
        >
          <Image src="/close_icon.svg" alt="" width={20} height={20} />
        </button>

        <div
          className={`${styles.resultBoxWrap} ${showResults ? styles.resultBoxOpen : ''}`}
          aria-hidden={!showResults}
        >
          <ResultBox query={query} loading={false} items={items} />
        </div>
      </div>
    </>
  );
}