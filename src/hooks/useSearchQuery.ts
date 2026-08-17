import { useState, useRef, useCallback, useEffect } from 'react';
import type { Product, CommittedParams } from '../types';
import { searchProducts, PAGE_LIMIT } from '../api';

// ─── LRU Cache ────────────────────────────────────────────────────────────────
// Map preserves insertion order so .keys().next() is always the oldest entry.

interface CacheEntry {
  products: Product[];
  total: number;
}

const MAX_CACHE_SIZE = 10;
const lruCache = new Map<string, CacheEntry>();

function makeCacheKey(params: CommittedParams, skip: number): string {
  const { query, category, sort } = params;
  return `${query}|${category}|${sort.sortBy}|${sort.order}|${skip}`;
}

function getCached(key: string): CacheEntry | undefined {
  const entry = lruCache.get(key);
  if (entry) {
    // Move to end (most-recently-used)
    lruCache.delete(key);
    lruCache.set(key, entry);
  }
  return entry;
}

function putCached(key: string, entry: CacheEntry): void {
  if (lruCache.has(key)) lruCache.delete(key);
  lruCache.set(key, entry);
  if (lruCache.size > MAX_CACHE_SIZE) {
    lruCache.delete(lruCache.keys().next().value!);
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface UseSearchQueryResult {
  products: Product[];
  total: number;
  /** True while the FIRST page is loading (shows skeleton) */
  loading: boolean;
  /** True while additional pages are being appended */
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => void;
}

export function useSearchQuery(params: CommittedParams): UseSearchQueryResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Monotonically increasing — each new top-level fetch gets a higher ID.
  // A response only commits its results if its ID matches the current one.
  const requestSeqRef = useRef(0);

  // The AbortController for the in-flight request (if any)
  const controllerRef = useRef<AbortController | null>(null);

  // Current page offset — lives in a ref so loadMore can read it synchronously
  // without stale closure issues.
  const skipRef = useRef(0);

  // Keep a ref of the current params so loadMore can access them
  const paramsRef = useRef<CommittedParams>(params);

  const hasMore = products.length < total;

  // ── Core fetch ──────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (
      fetchParams: CommittedParams,
      skip: number,
      append: boolean,
    ) => {
      // Abort previous request
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      // Capture this request's sequence number
      const mySeq = ++requestSeqRef.current;

      // ── Cache check ──────────────────────────────────────────────────────────
      const key = makeCacheKey(fetchParams, skip);
      const cached = getCached(key);
      if (cached) {
        if (mySeq !== requestSeqRef.current) return; // raced
        if (append) {
          setProducts(prev => [...prev, ...cached.products]);
        } else {
          setProducts(cached.products);
        }
        setTotal(cached.total);
        setLoading(false);
        setLoadingMore(false);
        setError(null);
        return;
      }

      // ── Network ──────────────────────────────────────────────────────────────
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const data = await searchProducts(
          {
            query: fetchParams.query,
            category: fetchParams.category,
            sortBy: fetchParams.sort.sortBy,
            order: fetchParams.sort.order,
            skip,
          },
          controller.signal,
        );

        // Race guard: only commit if this is still the latest request
        if (mySeq !== requestSeqRef.current) return;

        putCached(key, { products: data.products, total: data.total });

        if (append) {
          setProducts(prev => [...prev, ...data.products]);
        } else {
          setProducts(data.products);
        }
        setTotal(data.total);
        setError(null);
      } catch (err) {
        if (mySeq !== requestSeqRef.current) return;
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message ?? 'Something went wrong');
      } finally {
        if (mySeq === requestSeqRef.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [],
  );

  // ── Trigger on param changes ─────────────────────────────────────────────
  useEffect(() => {
    paramsRef.current = params;
    skipRef.current = 0;
    setProducts([]);
    setTotal(0);
    fetchPage(params, 0, false);
    // We deliberately spread primitives as deps so the object identity doesn't matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query, params.category, params.sort.sortBy, params.sort.order, fetchPage]);

  // ── Infinite scroll trigger ──────────────────────────────────────────────
  const loadMore = useCallback(() => {
    if (loadingMore || loading || !hasMore) return;
    const nextSkip = skipRef.current + PAGE_LIMIT;
    skipRef.current = nextSkip;
    fetchPage(paramsRef.current, nextSkip, true);
  }, [loadingMore, loading, hasMore, fetchPage]);

  return { products, total, loading, loadingMore, error, hasMore, loadMore };
}
