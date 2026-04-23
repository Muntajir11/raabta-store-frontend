import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { ApiRequestError, cancelMyOrder, myOrderDetail, type OrderDetail } from '../../lib/api';
import './OrdersPage.css';

function formatRs(amount: number): string {
  const n = Number(amount || 0);
  const rounded = Math.round(n * 100) / 100;
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}

const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const st = location.state as any;
    if (!st?.justPlaced) return;

    // Fire once, then clear router state so refresh doesn't re-trigger.
    try {
      const burst = (originX: number) =>
        confetti({
          particleCount: 110,
          spread: 70,
          startVelocity: 35,
          origin: { x: originX, y: 0.35 },
        });
      void burst(0.15);
      void burst(0.85);
    } finally {
      window.history.replaceState({}, '');
    }
  }, [location.state]);

  const justPlaced = Boolean((location.state as any)?.justPlaced);

  const canCancel = order?.status ? order.status !== 'shipped' && order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded' : false;

  const onCancel = async () => {
    if (!orderNumber) return;
    const ok = window.confirm('Cancel this order? This cannot be undone.');
    if (!ok) return;
    try {
      setLoading(true);
      const updated = await cancelMyOrder(orderNumber);
      setOrder(updated);
      toast.success('Order cancelled');
    } catch (err) {
      if (err instanceof ApiRequestError) toast.error(err.message);
      else if (err instanceof Error) toast.error(err.message);
      else toast.error('Unable to cancel order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!orderNumber) throw new Error('Order not found');
        const res = await myOrderDetail(orderNumber);
        setOrder(res);
      } catch (err) {
        if (err instanceof ApiRequestError) setError(err.message);
        else if (err instanceof Error) setError(err.message);
        else setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [orderNumber]);

  const itemsCount = useMemo(() => {
    return order?.items?.reduce((n, i) => n + (Number(i.qty) || 0), 0) ?? 0;
  }, [order]);

  return (
    <section className="orders-page">
      <div className="container">
        <div className="orders-head">
          <h2 className="orders-title">{orderNumber || 'Order'}</h2>
          <Link to="/orders" className="orders-link">
            Back to orders
          </Link>
        </div>

        {loading ? <div className="orders-card">Loading…</div> : null}
        {error ? <div className="orders-card orders-warn">{error}</div> : null}

        {!loading && !error && order ? (
          <>
            {justPlaced ? (
              <div className="orders-card orders-success" role="status">
                <div className="orders-success-title">Order placed!</div>
                <div className="orders-success-sub">
                  We’ll email an update when it ships. Order: <strong>{order.orderNumber}</strong>
                </div>
              </div>
            ) : null}
            <div className="orders-card">
              <div className="orders-meta">
                <div>
                  <div className="orders-meta-label">Status</div>
                  <div className={`orders-badge status-${order.status}`}>{order.status.replace('_', ' ')}</div>
                </div>
                <div>
                  <div className="orders-meta-label">Payment</div>
                  <div className="orders-meta-value">{order.paymentMethod.toUpperCase()} • {order.paymentStatus}</div>
                </div>
                <div>
                  <div className="orders-meta-label">Items</div>
                  <div className="orders-meta-value">{itemsCount}</div>
                </div>
              </div>
              {canCancel ? (
                <div className="orders-actions">
                  <button type="button" className="orders-cancel-btn" onClick={() => void onCancel()} disabled={loading}>
                    Cancel order
                  </button>
                  <div className="orders-muted" style={{ marginTop: 6 }}>
                    You can cancel before it ships.
                  </div>
                </div>
              ) : null}
            </div>

            <div className="orders-card">
              <h3 className="orders-card-title">Items</h3>
              <div className="orders-items">
                {order.items.map((i) => (
                  <Link
                    key={`${i.productId}|${i.size}|${i.color}|${i.gsm}`}
                    to={`/product/${encodeURIComponent(i.productId)}`}
                    className="orders-item orders-item-linkrow"
                  >
                    {i.image ? (
                      <img className="orders-item-thumb" src={i.image} alt={i.name || 'Product'} loading="lazy" />
                    ) : (
                      <div className="orders-item-thumb orders-thumb-placeholder" aria-label="No product image" />
                    )}
                    <div className="orders-item-main">
                      <div className="orders-item-name">{i.name}</div>
                      <div className="orders-item-sub">
                        {i.size} | {i.color} | {i.gsm} GSM • Qty {i.qty}
                      </div>
                    </div>
                    <div className="orders-item-right">Rs. {formatRs(i.unitPrice * i.qty)}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="orders-card">
              <h3 className="orders-card-title">Delivery address</h3>
              {order.shippingAddress ? (
                <div className="orders-address">
                  <div>{order.shippingAddress.address}</div>
                  <div>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                  </div>
                  {order.shippingAddress.landmark?.trim() ? <div>Landmark: {order.shippingAddress.landmark}</div> : null}
                  <div>Phone: {order.shippingAddress.phone}</div>
                </div>
              ) : (
                <div className="orders-muted">Address snapshot unavailable.</div>
              )}
            </div>

            <div className="orders-card">
              <h3 className="orders-card-title">Totals</h3>
              <div className="orders-totals">
                <div className="orders-totals-row">
                  <span>Subtotal</span>
                  <span>Rs. {formatRs(order.subtotal)}</span>
                </div>
                <div className="orders-totals-row">
                  <span>Shipping</span>
                  <span>Rs. {formatRs(order.shipping)}</span>
                </div>
                {typeof order.shippingExclGst === 'number' ? (
                  <div className="orders-totals-row" style={{ color: 'rgba(15, 23, 42, 0.75)' }}>
                    <span>Shipping (excl. GST)</span>
                    <span>Rs. {formatRs(order.shippingExclGst)}</span>
                  </div>
                ) : null}
                <div className="orders-totals-row total">
                  <span>Total</span>
                  <span>Rs. {formatRs(order.total)}</span>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
};

export default OrderDetailPage;

