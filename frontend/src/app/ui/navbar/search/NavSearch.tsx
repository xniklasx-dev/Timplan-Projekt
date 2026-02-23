'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './NavSearch.module.css';
import Image from 'next/image';
import ResultBox from './resultBox/ResultBox';

interface Props {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const testItems = [
  { id: '1', title: 'React Basics – Components & Props', link: '/decks/react-basics' },
  { id: '2', title: 'Understanding useEffect and Dependencies', link: '/decks/useeffect-guide' },
  { id: '3', title: 'TypeScript Generics Explained', link: '/decks/typescript-generics' },
  { id: '4', title: 'Next.js App Router Deep Dive', link: '/decks/nextjs-app-router' },
  { id: '5', title: 'JavaScript Closures & Scope', link: '/decks/js-closures' },
  { id: '6', title: 'Async/Await vs Promises', link: '/decks/async-await' },
  { id: '7', title: 'CSS Flexbox & Grid Layout', link: '/decks/css-layout' },
  { id: '8', title: 'Clean Architecture in Frontend Apps', link: '/decks/clean-architecture' },
];

export default function NavSearch({ open, onOpen, onClose }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const urlQuery = useMemo(() => searchParams.get('q') ?? '', [searchParams]);
  const [query, setQuery] = useState(urlQuery);

  const [loading, setLoading] = useState(false);
  const showResults = open && query.trim().length > 0;

  useEffect(() => {
    if (open) {
      setQuery(urlQuery);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      setQuery('');
      inputRef.current?.blur();
    }
  }, [open, urlQuery]);

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
    if (!open) return;

    function onPointerDown(evt: PointerEvent) {
      const target = evt.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (overlayRef.current?.contains(target)) return;

      writeQueryToUrl('', 'replace');
      onClose();
    }

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, onClose]);

  useEffect(() => {
    if (!showResults) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const t = window.setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => window.clearTimeout(t);
  }, [showResults, query]);

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
          <ResultBox query={query} loading={loading} items={testItems} />
        </div>
      </div>
    </>
  );
}