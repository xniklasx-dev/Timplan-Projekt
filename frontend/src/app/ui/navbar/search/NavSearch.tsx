'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';

import styles from './NavSearch.module.css';
import ResultBox from './resultBox/ResultBox';
import { useAuth } from '@/app/lib/auth/AuthContext';
import { search, type SearchResult } from '@/app/lib/search-service';

type NavSearchProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export default function NavSearch({ open, onOpen, onClose }: NavSearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
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
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      inputRef.current?.blur();
    }
  }, [open]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!open || !trimmedQuery || !user) {
      setItems([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    setItems([]);

    const timeout = window.setTimeout(async () => {
      try {
        const results = await search(trimmedQuery, user.id);
        setItems(results);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [open, query, user]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (evt: PointerEvent) => {
      const target = evt.target as Node | null;
      if (!target) return;

      if (buttonRef.current?.contains(target)) return;
      if (overlayRef.current?.contains(target)) return;

      setQuery('');
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
      onClose();
    };

    document.addEventListener('pointerdown', onPointerDown, true);
    return () => document.removeEventListener('pointerdown', onPointerDown, true);
  }, [open, onClose, pathname, router, searchParams]);

  return (
    <>
      <button ref={buttonRef} type="button" className={styles.searchButton} onClick={onOpen} aria-label="Open search">
        <Image src="/search_icon.svg" alt="" width={20} height={20} />
      </button>

      <div ref={overlayRef} className={`${styles.searchOverlay} ${open ? styles.searchOpen : ''}`}>
        <Image src="/search_icon.svg" alt="" width={20} height={20} />

        <input
          ref={inputRef}
          className={styles.searchInput}
          type="search"
          value={query}
          onChange={(evt) => {
            const nextQuery = evt.target.value;
            setQuery(nextQuery);
            writeQueryToUrl(nextQuery, 'replace');
          }}
          placeholder="Search..."
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="button"
          className={styles.searchClose}
          onClick={() => {
            setQuery('');
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
          <ResultBox
            query={query}
            loading={loading}
            error={error}
            items={items}
            onResultClick={() => {
              setQuery('');
              onClose();
            }}
          />
        </div>
      </div>
    </>
  );
}
