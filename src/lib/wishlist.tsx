import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AUTH_EVENT_NAME, ApiRequestError, wishlistAdd, wishlistGet, wishlistRemove } from './api';

export type WishlistStatus = 'idle' | 'loading' | 'ready' | 'error';

type WishlistContextValue = {
  status: WishlistStatus;
  error: string | null;
  ids: string[];
  ensureLoaded: () => Promise<string[]>;
  has: (productId: string) => boolean;
  add: (productId: string) => Promise<void>;
  remove: (productId: string) => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<WishlistStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [ids, setIds] = useState<string[]>([]);

  const inflight = useRef<Promise<string[]> | null>(null);

  const ensureLoaded = useCallback(async (): Promise<string[]> => {
    if (status === 'ready') return ids;
    if (inflight.current) return inflight.current;
    setStatus('loading');
    setError(null);
    inflight.current = wishlistGet()
      .then((res) => {
        setIds(res.items);
        setStatus('ready');
        return res.items;
      })
      .catch((err: unknown) => {
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unable to load wishlist';
        setError(message);
        setStatus('error');
        setIds([]);
        return [];
      })
      .finally(() => {
        inflight.current = null;
      });
    return inflight.current;
  }, [ids, status]);

  useEffect(() => {
    // refresh wishlist after login/logout
    const onAuth = () => {
      setStatus('idle');
      setError(null);
      setIds([]);
      // Do not auto-fetch on auth changes (logout causes expected 401 noise).
      // We'll fetch lazily when a page actually needs wishlist.
    };
    window.addEventListener(AUTH_EVENT_NAME, onAuth);
    return () => window.removeEventListener(AUTH_EVENT_NAME, onAuth);
  }, [ensureLoaded]);

  const has = useCallback((productId: string) => ids.includes(productId), [ids]);

  const add = useCallback(async (productId: string) => {
    setError(null);
    const res = await wishlistAdd(productId);
    setIds(res.items);
    setStatus('ready');
  }, []);

  const remove = useCallback(async (productId: string) => {
    setError(null);
    const res = await wishlistRemove(productId);
    setIds(res.items);
    setStatus('ready');
  }, []);

  const value = useMemo<WishlistContextValue>(
    () => ({ status, error, ids, ensureLoaded, has, add, remove }),
    [status, error, ids, ensureLoaded, has, add, remove]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}

