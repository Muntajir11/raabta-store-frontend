import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ApiRequestError,
  placeCodOrder,
  profileGet,
  type CheckoutQuote,
  type ProfileUser,
} from '../../lib/api';
import { INDIAN_STATES } from '../../lib/india-states';
import { useCart } from '../../lib/cart-context';
import { checkoutSignature, getOrFetchCheckoutQuote, invalidateCheckoutQuoteCache, type PaymentType } from '../../lib/checkout-quote-cache';
import './CheckoutPage.css';

function formatRs(amount: number): string {
  const n = Number(amount || 0);
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const [loading, setLoading] = useState(true);
  const [quoteCod, setQuoteCod] = useState<CheckoutQuote | null>(null);
  const [quotePrepaid, setQuotePrepaid] = useState<CheckoutQuote | null>(null);
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [error, setError] = useState<{ code?: string; message: string } | null>(null);
  const [paymentType, setPaymentType] = useState<PaymentType>('COD');
  const lastSigRef = useRef<string>('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const p = await profileGet();
        setProfile(p);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setError({ code: err.code, message: err.message });
        } else if (err instanceof Error) {
          setError({ message: err.message });
        } else {
          setError({ message: 'Failed to load checkout' });
        }
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const signature = useMemo(() => {
    if (!profile) return '';
    return checkoutSignature({ items: cart.items, pincode: profile.pincode });
  }, [cart.items, profile]);

  useEffect(() => {
    if (!profile || !cart.isReady) return;
    if (!cart.totalItems) {
      setQuoteCod(null);
      setQuotePrepaid(null);
      setError({ code: 'VALIDATION_ERROR', message: 'Your cart is empty' });
      return;
    }

    // If cart/pincode changes, bust cache to avoid stale quotes.
    if (signature && lastSigRef.current && lastSigRef.current !== signature) {
      invalidateCheckoutQuoteCache();
    }
    lastSigRef.current = signature;

    const loadQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const [cod, prepaid] = await Promise.all([
          getOrFetchCheckoutQuote({ signature, paymentType: 'COD' }),
          getOrFetchCheckoutQuote({ signature, paymentType: 'Prepaid' }),
        ]);
        setQuoteCod(cod);
        setQuotePrepaid(prepaid);
      } catch (err) {
        if (err instanceof ApiRequestError) {
          setError({ code: err.code, message: err.message });
        } else if (err instanceof Error) {
          setError({ message: err.message });
        } else {
          setError({ message: 'Failed to load checkout' });
        }
      } finally {
        setLoading(false);
      }
    };

    void loadQuotes();
  }, [cart.isReady, cart.totalItems, profile, signature]);

  const hasValidShipping = useMemo(() => {
    if (!profile) return false;
    const shipName = profile.shippingName.trim();
    const shipPhone = profile.shippingPhone.trim();
    const line1 = profile.shippingAddressLine1.trim();
    const line2 = profile.shippingAddressLine2.trim();
    const landmark = profile.shippingLandmark.trim();
    const city = profile.shippingCity.trim();
    const stateValue = profile.shippingState.trim();
    const pincode = profile.shippingPincode.trim();
    const country = profile.shippingCountry.trim();

    const nameOk = shipName.length >= 2;
    const phoneOk = /^[6-9]\d{9}$/.test(shipPhone);
    const line1Ok = line1.length >= 2;
    const line2Ok = line2.length >= 2;
    const landmarkOk = landmark.length >= 2;
    const cityOk = city.length >= 2;
    const stateOk = INDIAN_STATES.includes(stateValue);
    const pincodeOk = /^\d{6}$/.test(pincode);
    const countryOk = country === 'India';
    return nameOk && phoneOk && line1Ok && line2Ok && landmarkOk && cityOk && stateOk && pincodeOk && countryOk;
  }, [profile]);

  const placeOrderDisabledReason = useMemo(() => {
    if (loading) return 'Loading…';
    if (!hasValidShipping) return 'Add address to continue';
    if (paymentType === 'Prepaid') return 'Payment coming soon';
    const selected = paymentType === 'COD' ? quoteCod : quotePrepaid;
    if (!selected) return 'Quote unavailable';
    return '';
  }, [hasValidShipping, loading, paymentType, quoteCod, quotePrepaid]);

  const onPlaceOrder = async () => {
    if (placeOrderDisabledReason) {
      toast(placeOrderDisabledReason);
      return;
    }
    try {
      setLoading(true);
      const order = await placeCodOrder();
      await cart.refreshCart();
      invalidateCheckoutQuoteCache();
      toast.success(`Order placed: ${order.orderNumber}`);
      navigate(`/orders/${encodeURIComponent(order.orderNumber)}`, { state: { justPlaced: true } });
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message);
      } else if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error('Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-head">
            <h2 className="checkout-title">Checkout</h2>
            <Link to="/cart" className="checkout-back">
              ← Back to cart
            </Link>
          </div>
          <div className="checkout-card">Loading checkout…</div>
        </div>
      </section>
    );
  }

  if (!hasValidShipping) {
    return (
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-head">
            <h2 className="checkout-title">Checkout</h2>
            <Link to="/cart" className="checkout-back">
              ← Back to cart
            </Link>
          </div>
          <div className="checkout-card">
            <div className="checkout-banner">
              <div className="checkout-banner-title">Complete your address to continue</div>
              <div className="checkout-banner-sub">
                Add phone number, address, city, state, and pincode.
              </div>
            </div>
            <div className="checkout-actions">
              <Link to="/account#address" className="checkout-link-btn">
                Edit address
              </Link>
              <Link to="/cart" className="checkout-link-btn secondary">
                Back to cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error?.code === 'VALIDATION_ERROR') {
    return (
      <section className="checkout-page">
        <div className="container">
          <div className="checkout-head">
            <h2 className="checkout-title">Checkout</h2>
            <Link to="/cart" className="checkout-back">
              ← Back to cart
            </Link>
          </div>
          <div className="checkout-card">
            <div className="checkout-banner warn">
              <div className="checkout-banner-title">{error.message}</div>
              <div className="checkout-banner-sub">Add items to your cart to continue.</div>
            </div>
            <div className="checkout-actions">
              <Link to="/cart" className="checkout-link-btn">
                Back to cart
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="checkout-page">
      <div className="container">
        <div className="checkout-head">
          <h2 className="checkout-title">Checkout</h2>
          <Link to="/cart" className="checkout-back">
            ← Back to cart
          </Link>
        </div>

        {error ? (
          <div className="checkout-card">
            <div className="checkout-banner warn">
              <div className="checkout-banner-title">Could not get a live quote</div>
              <div className="checkout-banner-sub">{error.message}</div>
            </div>
          </div>
        ) : null}

        <div className="checkout-grid">
          <div className="checkout-card">
            <h3 className="checkout-card-title">Items</h3>
            {cart.items.length ? (
              <div className="checkout-items">
                {cart.items.map((item) => (
                  <div
                    key={`${item.productId}|${item.size}|${item.color}|${item.gsm}`}
                    className="checkout-item"
                  >
                    <img src={item.image} alt={item.name} className="checkout-item-img" />
                    <div className="checkout-item-main">
                      <div className="checkout-item-name">{item.name}</div>
                      <div className="checkout-item-meta">
                        {item.size} | {item.color} | {item.gsm} GSM • Qty {item.qty}
                      </div>
                    </div>
                    <div className="checkout-item-total">Rs. {formatRs(item.lineTotal)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="checkout-muted">Your cart is empty.</div>
            )}
          </div>

          <div className="checkout-card">
            <h3 className="checkout-card-title">Deliver to</h3>
            {profile ? (
              <div className="checkout-address">
                <div className="checkout-address-line" style={{ fontWeight: 800 }}>
                  {profile.shippingName}
                </div>
                <div className="checkout-address-line">
                  {profile.shippingAddressLine1}
                </div>
                <div className="checkout-address-line">
                  {profile.shippingAddressLine2}
                </div>
                <div className="checkout-address-line">
                  {profile.shippingCity}, {profile.shippingState} {profile.shippingPincode}
                </div>
                <div className="checkout-address-line">Landmark: {profile.shippingLandmark}</div>
                <div className="checkout-address-line">Phone: {profile.shippingPhone}</div>
                <div className="checkout-actions">
                  <Link to="/account#address" className="checkout-link-btn secondary">
                    Edit address
                  </Link>
                </div>
              </div>
            ) : (
              <div className="checkout-muted">Address unavailable.</div>
            )}
          </div>

          <div className="checkout-card">
            <h3 className="checkout-card-title">Totals</h3>
            <div className="checkout-row" role="group" aria-label="Payment method">
              <span>Payment method</span>
              <span style={{ display: 'flex', gap: 10 }}>
                <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="COD"
                    checked={paymentType === 'COD'}
                    onChange={() => setPaymentType('COD')}
                  />
                  COD
                </label>
                <label style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
                  <input
                    type="radio"
                    name="paymentType"
                    value="Prepaid"
                    checked={paymentType === 'Prepaid'}
                    onChange={() => setPaymentType('Prepaid')}
                  />
                  Prepaid
                </label>
              </span>
            </div>
            <div className="checkout-totals">
              {(() => {
                const quote = paymentType === 'COD' ? quoteCod : quotePrepaid;
                return (
                  <>
                    <div className="checkout-row">
                      <span>Subtotal</span>
                      <span>Rs. {formatRs(quote?.subtotal ?? cart.subtotal)}</span>
                    </div>
                    <div className="checkout-row">
                      <span>Shipping</span>
                      <span>
                        Rs. {formatRs(quote?.shipping ?? 0)}{' '}
                        {quote?.provider === 'fallback' ? (
                          <span className="checkout-note">Using fallback rate</span>
                        ) : null}
                      </span>
                    </div>
                    {quote?.provider === 'delhivery' && quote.shippingBreakdown?.lines?.length ? (
                      <div className="checkout-tax" aria-label="GST breakdown">
                  {quote.shippingBreakdown.lines
                    .filter((l) => l && typeof l.key === 'string' && l.key === 'gross')
                    .slice(0, 1)
                    .map((line) => (
                      <div key={line.key} className="checkout-tax-row">
                        <span className="checkout-tax-label">Shipping (excl. GST)</span>
                        <span className="checkout-tax-amount">Rs. {formatRs(line.amount)}</span>
                      </div>
                    ))}
                        {quote.shippingBreakdown.lines
                          .filter(
                            (l) =>
                              l &&
                              typeof l.key === 'string' &&
                              (l.key === 'cgst' || l.key === 'sgst' || l.key === 'igst')
                          )
                          .map((line) => (
                            <div key={line.key} className="checkout-tax-row">
                              <span className="checkout-tax-label">{line.label}</span>
                              <span className="checkout-tax-amount">Rs. {formatRs(line.amount)}</span>
                            </div>
                          ))}
                      </div>
                    ) : null}
                    <div className="checkout-row total">
                      <span>Total</span>
                      <span>Rs. {formatRs(quote?.total ?? cart.subtotal)}</span>
                    </div>
                    {quote && quote.serviceable === false ? (
                      <div className="checkout-banner warn">
                        <div className="checkout-banner-title">We don’t deliver to {quote.pincode} yet</div>
                        <div className="checkout-banner-sub">You can still review your cart and address.</div>
                      </div>
                    ) : null}
                    {paymentType === 'Prepaid' ? (
                      <button type="button" className="checkout-place-btn" onClick={onPlaceOrder} disabled>
                        Payment coming soon
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="checkout-place-btn"
                        onClick={onPlaceOrder}
                        disabled={Boolean(placeOrderDisabledReason)}
                      >
                        Place order (Cash on Delivery)
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CheckoutPage;

