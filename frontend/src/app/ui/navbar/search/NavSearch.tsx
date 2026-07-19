////////////////////////////////////////////////////////
// THIS FILE WAS CREATED USING AI, NOT FOR EVALUATION //
////////////////////////////////////////////////////////
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { useAuth } from "@/app/lib/auth/AuthContext";
import { search, type SearchResult } from "@/app/lib/search-service";

import styles from "./NavSearch.module.css";
import ResultBox from "./resultBox/ResultBox";

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

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [items, setItems] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const showResults = open && query.trim().length > 0;

  function writeQueryToUrl(nextQuery: string) {
    const params = new URLSearchParams(searchParams.toString());

    const trimmed = nextQuery.trim();
    if (!trimmed) params.delete("q");
    else params.set("q", trimmed);

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(nextUrl);
  }

  function handleQueryChange(event: ChangeEvent<HTMLInputElement>) {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    writeQueryToUrl(nextQuery);
  }

  function handleClose() {
    setQuery("");
    writeQueryToUrl("");
    onClose();
  }

  function handleResultClick() {
    setQuery("");
    onClose();
  }

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      inputRef.current?.blur();
    }
  }, [open]);

  useEffect(() => {
    const trimmedQuery = query.trim();
    const token = user?.token;

    if (!open || !trimmedQuery || !token) {
      setItems([]);
      setLoading(false);
      setError(false);
      return;
    }

    setLoading(true);
    setError(false);
    setItems([]);
    let ignoreResult = false;

    const timeout = window.setTimeout(async () => {
      try {
        const results = await search(trimmedQuery, token);

        if (!ignoreResult) {
          setItems(results);
        }
      } catch {
        if (!ignoreResult) {
          setError(true);
        }
      } finally {
        if (!ignoreResult) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      ignoreResult = true;
      window.clearTimeout(timeout);
    };
  }, [open, query, user?.token]);

  useEffect(() => {
    if (!open) return;

    function closeSearch() {
      setQuery("");
      const params = new URLSearchParams(searchParams.toString());
      params.delete("q");
      const queryString = params.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname);
      onClose();
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node | null;
      if (!target) return;

      if (buttonRef.current?.contains(target)) return;
      if (overlayRef.current?.contains(target)) return;

      closeSearch();
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSearch();
    }

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose, pathname, router, searchParams]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.searchButton}
        onClick={onOpen}
        aria-label="Open search"
        aria-expanded={open}
        aria-controls="navbar-search"
      >
        <Image src="/search_icon.svg" alt="" width={20} height={20} />
      </button>

      <div
        id="navbar-search"
        ref={overlayRef}
        className={`${styles.searchOverlay} ${open ? styles.searchOpen : ""}`}
        role="search"
      >
        <Image src="/search_icon.svg" alt="" width={20} height={20} />

        <input
          ref={inputRef}
          className={styles.searchInput}
          type="search"
          value={query}
          onChange={handleQueryChange}
          placeholder="Search..."
          aria-label="Search decks and cards"
          autoComplete="off"
          spellCheck={false}
        />

        <button
          type="button"
          className={styles.searchClose}
          onClick={handleClose}
          aria-label="Close search"
        >
          <Image src="/close_icon.svg" alt="" width={20} height={20} />
        </button>

        <div
          className={`${styles.resultBoxWrap} ${showResults ? styles.resultBoxOpen : ""}`}
          aria-hidden={!showResults}
        >
          {showResults && (
            <ResultBox query={query} loading={loading} error={error} items={items} onResultClick={handleResultClick} />
          )}
        </div>
      </div>
    </>
  );
}
