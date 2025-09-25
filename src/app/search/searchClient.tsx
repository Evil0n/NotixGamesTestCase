"use client";

import { useCallback, useEffect, useMemo, useRef, useState, ChangeEvent } from 'react';
import type { ReactElement } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type SearchItem = {
  id: string;
  title: string;
  snippet: string;
};

type SearchResponse = {
  query: string;
  items: ReadonlyArray<SearchItem>;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function SearchClient(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const qParam = searchParams.get('q') ?? '';
  const [input, setInput] = useState<string>(qParam);
  const debounced = useDebouncedValue<string>(input, 250);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

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
      setError(e instanceof Error ? e.message : 'Unknown error');
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
      return <div>Введите запрос для поиска</div>;
    }
    if (loading) {
      return <div>Загрузка…</div>;
    }
    if (error) {
      return <div style={{ color: '#b00' }}>Ошибка: {error}</div>;
    }
    if (items.length === 0) {
      return <div>Ничего не найдено</div>;
    }
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {items.map((it) => (
          <li key={it.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
            <div style={{ fontWeight: 600 }}>{it.title}</div>
            <div style={{ color: '#555' }}>{it.snippet}</div>
          </li>
        ))}
      </ul>
    );
  }, [items, loading, error, hasQuery]);

  return (
    <div style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1 style={{ marginBottom: 16 }}>Поиск</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={onChange}
          placeholder="Начните вводить…"
          aria-label="Строка поиска"
          autoFocus
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid #ccc',
            outline: 'none',
          }}
        />
        {input && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Очистить"
            style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #ccc', background: '#000' }}
          >
            Очистить
          </button>
        )}
      </div>
      <div style={{ marginTop: 16 }}>{content}</div>
    </div>
  );
}


