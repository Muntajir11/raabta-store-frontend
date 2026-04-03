import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ApiRequestError,
  authSession,
  cartClear,
  cartGet,
  cartRemoveItem,
  cartUpdateItemQty,
  type CartItemIdentity,
  type CartPayload,
} from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import './CartPage.css';

const CartPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartPayload>({ items: [], totalItems: 0, subtotal: 0 });
  const [error, setError] = useState<string | null>(null);
  const [workingItemId, setWorkingItemId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const { refreshCart } = useCart();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const session = await authSession();
        if (!session) {
          setIsLoggedIn(false);
          setCart({ items: [], totalItems: 0, subtotal: 0 });
          return;
        }
        setIsLoggedIn(true);
        const data = await cartGet();
        setCart(data);
      } catch (err) {
        const message =
          err instanceof ApiRequestError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Unable to load cart';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const canShowActions = useMemo(() => isLoggedIn && !loading, [isLoggedIn, loading]);

  const applyCartUpdate = async (fn: () => Promise<CartPayload>) => {
    try {
      const data = await fn();
      setCart(data);
      await refreshCart();
    } catch (err) {
      const message =
        err instanceof ApiRequestError
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Cart action failed';
      setError(message);
    }
  };

  const getItemIdentity = (item: CartPayload['items'][number]): CartItemIdentity => ({
    productId: item.productId,
    size: item.size,
    color: item.color,
    gsm: item.gsm,
  });

  const itemKey = (item: CartPayload['items'][number]) =>
    `${item.productId}|${item.size}|${item.color}|${item.gsm}`;

  const handleQtyChange = async (item: CartPayload['items'][number], nextQty: number) => {
    const identity = getItemIdentity(item);
    const key = itemKey(item);
    setWorkingItemId(key);
    setError(null);
    await applyCartUpdate(() => cartUpdateItemQty(identity, nextQty));
    setWorkingItemId(null);
  };

  const handleRemove = async (item: CartPayload['items'][number]) => {
    const identity = getItemIdentity(item);
    const key = itemKey(item);
    setWorkingItemId(key);
    setError(null);
    await applyCartUpdate(() => cartRemoveItem(identity));
    setWorkingItemId(null);
  };

  const handleClear = async () => {
    setClearing(true);
    setError(null);
    await applyCartUpdate(() => cartClear());
    setClearing(false);
  };

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header-row">
          <h2 className="cart-title">Your Cart</h2>
          {canShowActions && cart.items.length > 0 ? (
            <button
              type="button"
              className="cart-clear-btn"
              onClick={() => void handleClear()}
              disabled={clearing}
            >
              {clearing ? 'Clearing…' : 'Clear cart'}
            </button>
          ) : null}
        </div>

        {error ? <p className="cart-error">{error}</p> : null}

        {loading ? (
          <p className="cart-state">Loading cart…</p>
        ) : !isLoggedIn ? (
          <div className="cart-empty-state">
            <p className="cart-state">Log in to view your secure cart and totals.</p>
            <Link to="/login" className="cart-auth-link">
              Go to login
            </Link>
          </div>
        ) : cart.items.length === 0 ? (
          <div className="cart-empty-state">
            <p className="cart-state">Your cart is empty.</p>
            <Link to="/" className="cart-auth-link">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items-list">
              {cart.items.map((item) => {
                const currentItemKey = itemKey(item);
                const disabled = workingItemId === currentItemKey;
                return (
                  <article key={currentItemKey} className="cart-item-card">
                    <img src={item.image} alt={item.name} className="cart-item-image" />
                    <div className="cart-item-main">
                      <h3 className="cart-item-name">{item.name}</h3>
                      <p className="cart-item-meta">
                        {item.category} | {item.size} | {item.color} | {item.gsm} GSM
                      </p>
                      <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                      <div className="cart-item-actions">
                        <label htmlFor={`qty-${item.productId}`}>Qty</label>
                        <select
                          id={`qty-${currentItemKey}`}
                          value={item.qty}
                          disabled={disabled}
                          onChange={(ev) => void handleQtyChange(item, Number(ev.target.value))}
                        >
                          {Array.from({ length: 20 }).map((_, idx) => (
                            <option key={idx + 1} value={idx + 1}>
                              {idx + 1}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          className="cart-remove-btn"
                          disabled={disabled}
                          onClick={() => void handleRemove(item)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="cart-item-total">${item.lineTotal.toFixed(2)}</div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary-card">
              <h3>Order Summary</h3>
              <div className="cart-summary-row">
                <span>Items</span>
                <span>{cart.totalItems}</span>
              </div>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>${cart.subtotal.toFixed(2)}</span>
              </div>
              <button type="button" className="cart-checkout-btn">
                Proceed to Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
};

export default CartPage;
