import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AUTH_EVENT_NAME,
  authSession,
  cartAddItem,
  cartGet,
  cartMerge,
  type CartItem,
  type CartMutationInput,
  type CartUpsertInput,
} from './api';
import { CartContext } from './cart-context';

const GUEST_CART_STORAGE_KEY = 'raabta_guest_cart_v1';

function readGuestCart(): CartUpsertInput[] {
  const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => {
      return (
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartUpsertInput).productId === 'string' &&
        typeof (item as CartUpsertInput).name === 'string' &&
        typeof (item as CartUpsertInput).price === 'number' &&
        typeof (item as CartUpsertInput).image === 'string' &&
        typeof (item as CartUpsertInput).category === 'string' &&
        typeof (item as CartUpsertInput).size === 'string' &&
        typeof (item as CartUpsertInput).color === 'string' &&
        typeof (item as CartUpsertInput).gsm === 'number' &&
        typeof (item as CartUpsertInput).qty === 'number'
      );
    });
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartUpsertInput[]) {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
}

function clearGuestCart() {
  localStorage.removeItem(GUEST_CART_STORAGE_KEY);
}

function toGuestView(items: CartUpsertInput[]): { items: CartItem[]; totalItems: number; subtotal: number } {
  const normalized = items.map((item) => ({
    ...item,
    qty: Math.max(1, Math.min(20, Math.floor(item.qty))),
  }));
  const viewItems: CartItem[] = normalized.map((item) => ({
    ...item,
    lineTotal: Number((item.price * item.qty).toFixed(2)),
  }));
  return {
    items: viewItems,
    totalItems: viewItems.reduce((sum, item) => sum + item.qty, 0),
    subtotal: Number(viewItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)),
  };
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const setFromSnapshot = useCallback((snapshot: { items: CartItem[]; totalItems: number; subtotal: number }) => {
    setItems(snapshot.items);
    setTotalItems(snapshot.totalItems);
    setSubtotal(snapshot.subtotal);
  }, []);

  const refreshCart = useCallback(async () => {
    const session = await authSession();
    if (session) {
      const guestItems = readGuestCart();
      if (guestItems.length > 0) {
        const safeMergeItems: CartMutationInput[] = guestItems.map((item) => ({
          productId: item.productId,
          size: item.size,
          color: item.color,
          gsm: item.gsm,
          qty: item.qty,
        }));
        await cartMerge(safeMergeItems);
        clearGuestCart();
      }
      const serverCart = await cartGet();
      setFromSnapshot(serverCart);
      return;
    }
    setFromSnapshot(toGuestView(readGuestCart()));
  }, [setFromSnapshot]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        await refreshCart();
      } finally {
        setIsReady(true);
      }
    };
    void bootstrap();
  }, [refreshCart]);

  useEffect(() => {
    const onAuthChanged = () => {
      void refreshCart();
    };
    window.addEventListener(AUTH_EVENT_NAME, onAuthChanged);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, onAuthChanged);
    };
  }, [refreshCart]);

  const addItem = useCallback(
    async (input: CartUpsertInput) => {
      const normalized: CartUpsertInput = {
        ...input,
        qty: Math.max(1, Math.min(20, Math.floor(input.qty))),
      };
      const session = await authSession();
      if (session) {
        const serverCart = await cartAddItem({
          productId: normalized.productId,
          size: normalized.size,
          color: normalized.color,
          gsm: normalized.gsm,
          qty: normalized.qty,
        });
        setFromSnapshot(serverCart);
        return;
      }

      const guest = readGuestCart();
      const idx = guest.findIndex((item) => item.productId === normalized.productId);
      if (idx === -1) {
        guest.push(normalized);
      } else {
        guest[idx] = {
          ...guest[idx],
          name: normalized.name,
          price: normalized.price,
          image: normalized.image,
          category: normalized.category,
          qty: Math.min(20, guest[idx].qty + normalized.qty),
        };
      }
      writeGuestCart(guest);
      setFromSnapshot(toGuestView(guest));
    },
    [setFromSnapshot]
  );

  const value = useMemo(
    () => ({ items, totalItems, subtotal, isReady, addItem, refreshCart }),
    [items, totalItems, subtotal, isReady, addItem, refreshCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
