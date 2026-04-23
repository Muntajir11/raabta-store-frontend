import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ApiRequestError,
  authSession,
  cartClear,
  cartGet,
  cartRemoveItem,
  profileGet,
  type CartItemIdentity,
  type CartPayload,
  type ProfileUser,
} from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { INDIAN_STATES } from '../../lib/india-states';
import './CartPage.css';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState<CartPayload>({ items: [], totalItems: 0, subtotal: 0 });
  const [error, setError] = useState<string | null>(null);
  const [workingItemId, setWorkingItemId] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
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
          setProfile(null);
          return;
        }
        setIsLoggedIn(true);
        const [data, p] = await Promise.all([cartGet(), profileGet()]);
        setCart(data);
        setProfile(p);
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

  const hasValidShipping = useMemo(() => {
    if (!profile) return false;
    const phone = profile.phone.trim();
    const address = profile.address.trim();
    const city = profile.city.trim();
    const stateValue = profile.state.trim();
    const pincode = profile.pincode.trim();
    const phoneOk = /^[6-9]\d{9}$/.test(phone);
    const addressOk = address.length >= 5;
    const cityOk = city.length >= 2;
    const stateOk = INDIAN_STATES.includes(stateValue);
    const pincodeOk = /^\d{6}$/.test(pincode);
    return phoneOk && addressOk && cityOk && stateOk && pincodeOk;
  }, [profile]);

  const handleCheckout = () => {
    if (!hasValidShipping) {
      toast.error('Add your phone number and shipping address before checkout.');
      return;
    }
    navigate('/checkout');
  };

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
                      <p className="cart-item-price">Rs. {Math.round(item.price)} each</p>
                      <div className="cart-item-actions">
                        <span className="cart-qty-pill" aria-label={`Quantity ${item.qty}`}>
                          Qty: {item.qty}
                        </span>
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
                    <div className="cart-item-total">Rs. {Math.round(item.lineTotal)}</div>
                  </article>
                );
              })}
            </div>

            <aside className="cart-summary-card">
              <h3>Order Summary</h3>
              {canShowActions && !hasValidShipping ? (
                <div className="cart-shipping-warning" role="alert">
                  <p className="cart-shipping-warning-text">
                    Add your shipping address and phone number to continue.
                  </p>
                  <Link to="/account#address" className="cart-auth-link">
                    Add address
                  </Link>
                </div>
              ) : null}
              <div className="cart-summary-row">
                <span>Items</span>
                <span>{cart.totalItems}</span>
              </div>
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>Rs. {Math.round(cart.subtotal)}</span>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <span>Rs. {Math.round(cart.subtotal)}</span>
              </div>
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={handleCheckout}
                disabled={canShowActions && !hasValidShipping}
                aria-disabled={canShowActions && !hasValidShipping ? true : undefined}
              >
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
