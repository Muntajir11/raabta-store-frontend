import { createContext, useContext } from 'react';
import { ApiRequestError, type CartItem, type CartUpsertInput } from './api';

export type CartContextValue = {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  isReady: boolean;
  addItem: (input: CartUpsertInput) => Promise<void>;
  refreshCart: () => Promise<void>;
};

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart(): CartContextValue {
  const value = useContext(CartContext);
  if (!value) throw new Error('useCart must be used within CartProvider');
  return value;
}

export function isCartError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}
