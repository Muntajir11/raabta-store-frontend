import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { productsList, type ProductItem } from './api';

export type ProductsStatus = 'idle' | 'loading' | 'ready' | 'error';

type ProductsContextValue = {
  status: ProductsStatus;
  error: string | null;
  ensureLoaded: () => Promise<ProductItem[]>;
  getAll: () => ProductItem[];
  getById: (id: string) => ProductItem | undefined;
  getBySection: (sectionName: string) => ProductItem[];
};

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ProductsStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<ProductItem[]>([]);

  const inflight = useRef<Promise<ProductItem[]> | null>(null);

  const ensureLoaded = useCallback(async (): Promise<ProductItem[]> => {
    if (status === 'ready') return items;
    if (inflight.current) return inflight.current;

    setStatus('loading');
    setError(null);

    inflight.current = productsList()
      .then((next) => {
        setItems(next);
        setStatus('ready');
        return next;
      })
      .catch((err: unknown) => {
        const message = err instanceof Error && err.message ? err.message : 'Unable to load products';
        setError(message);
        setStatus('error');
        setItems([]);
        throw err;
      })
      .finally(() => {
        inflight.current = null;
      });

    return inflight.current;
  }, [items, status]);

  const latestFirst = useMemo(() => items.slice().reverse(), [items]);

  const getAll = useCallback((): ProductItem[] => latestFirst, [latestFirst]);
  const getById = useCallback((id: string): ProductItem | undefined => {
    return latestFirst.find((p) => p.id === id);
  }, [latestFirst]);
  const getBySection = useCallback(
    (sectionName: string): ProductItem[] => {
      const s = sectionName.trim();
      if (!s) return [];
      return latestFirst.filter((p) => p.category === s);
    },
    [latestFirst]
  );

  const value = useMemo<ProductsContextValue>(
    () => ({
      status,
      error,
      ensureLoaded,
      getAll,
      getById,
      getBySection,
    }),
    [status, error, ensureLoaded, getAll, getById, getBySection]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}

