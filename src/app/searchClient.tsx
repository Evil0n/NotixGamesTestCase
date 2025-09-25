"use client";

import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import type { ReactElement } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './search.module.scss';
import type { SearchItem, SearchResponse } from './types';
import { DEBOUNCE_DELAY } from './constants';

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export const SearchClient = (): ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qParam = searchParams.get('q') ?? '';
  const [input, setInput] = useState<string>(qParam);
  const debounced = useDebouncedValue<string>(input, DEBOUNCE_DELAY);

  const [items, setItems] = useState<ReadonlyArray<SearchItem>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const lastIssuedIdRef = useRef<number>(0);
  const lastHandledIdRef = useRef<number>(0);

  useEffect(() => {
    setInput(qParam);
  }, [qParam]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debounced) {
      params.set('q', debounced);
    } else {
      params.delete('q');
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [debounced, pathname, router, searchParams]);

  const fetchSearch = useCallback(async (query: string): Promise<void> => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    const requestId = lastIssuedIdRef.current + 1;
    lastIssuedIdRef.current = requestId;

    setLoading(true);
    setError(null);

    try {
      const url = query ? `/api/search?q=${encodeURIComponent(query)}` : `/api/search`;
      const res = await fetch(url, { signal: controller.signal, cache: 'no-store' });

      if (!res.ok) {
        if (res.status === 499) return;
        throw new Error(`HTTP ${res.status}`);
      }

      const data: SearchResponse = await res.json();
      if (requestId < lastHandledIdRef.current) {
        return;
      }
      lastHandledIdRef.current = requestId;
      setItems(data.items);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        return;
      }
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('Unknown error');
      }
    } finally {
      if (requestId >= lastHandledIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void fetchSearch(debounced);
  }, [debounced, fetchSearch]);

  const onChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.currentTarget.value);
  }, []);

  const onClear = useCallback(() => {
    setInput('');
  }, []);

  const hasQuery = input.trim().length > 0;

  const content = useMemo(() => {
    if (!hasQuery && items.length === 0) {
      return <div className={styles.emptyState}>Введите запрос для поиска</div>;
    }
    if (loading) {
      return <div className={styles.loading}>Загрузка…</div>;
    }
    if (error) {
      return <div className={styles.error}>Ошибка: {error}</div>;
    }
    if (items.length === 0) {
      return <div className={styles.emptyState}>Ничего не найдено</div>;
    }
    return (
      <ul className={styles.resultsList}>
        {items.map((it) => (
          <li key={it.id} className={styles.resultItem}>
            <div className={styles.resultTitle}>{it.title}</div>
            <div className={styles.resultSnippet}>{it.snippet}</div>
          </li>
        ))}
      </ul>
    );
  }, [items, loading, error, hasQuery]);

  return (
    <div className={styles.searchContainer}>
      <h1 className={styles.searchTitle}>Поиск</h1>
      <div className={styles.searchControls}>
        <input
          type="text"
          value={input}
          onChange={onChange}
          placeholder="Начните вводить…"
          aria-label="Строка поиска"
          autoFocus
          className={styles.searchInput}
        />
        {input && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Очистить"
            className={styles.clearButton}
          >
            Очистить
          </button>
        )}
      </div>
      <div className={styles.searchContent}>{content}</div>
    </div>
  );
}
