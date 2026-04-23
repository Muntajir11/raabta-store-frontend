import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiRequestError, myOrdersList, type OrderListItem } from '../../lib/api';
import './OrdersPage.css';

const OrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<OrderListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await myOrdersList({ page: 1, limit: 30 });
        setItems(res.items);
      } catch (err) {
        if (err instanceof ApiRequestError) setError(err.message);
        else if (err instanceof Error) setError(err.message);
        else setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  return (
    <section className="orders-page">
      <div className="container">
        <div className="orders-head">
          <h2 className="orders-title">My orders</h2>
          <Link to="/account" className="orders-link">
            Back to account
          </Link>
        </div>

        {loading ? <div className="orders-card">Loading…</div> : null}
        {error ? <div className="orders-card orders-warn">{error}</div> : null}

        {!loading && !error && items.length === 0 ? (
          <div className="orders-card">No orders yet.</div>
        ) : null}

        {!loading && !error && items.length ? (
          <div className="orders-list">
            {items.map((o) => (
              <div key={o.orderNumber} className="orders-card orders-row">
                <div className="orders-left">
                  {o.firstItem?.productId ? (
                    <Link to={`/product/${encodeURIComponent(o.firstItem.productId)}`} className="orders-thumb-link">
                      {o.firstItem?.image ? (
                        <img className="orders-thumb" src={o.firstItem.image} alt={o.firstItem.name || 'Product'} loading="lazy" />
                      ) : (
                        <div className="orders-thumb orders-thumb-placeholder" aria-label="No product image" />
                      )}
                    </Link>
                  ) : (
                    <div className="orders-thumb orders-thumb-placeholder" aria-label="No product image" />
                  )}
                </div>

                <div className="orders-mid">
                  <div className="orders-row-title">
                    {o.firstItem?.productId ? (
                      <Link to={`/product/${encodeURIComponent(o.firstItem.productId)}`} className="orders-item-link">
                        {o.firstItem?.name || 'Order'}
                      </Link>
                    ) : (
                      <span>{o.orderNumber}</span>
                    )}
                  </div>
                  <div className="orders-row-sub">
                    {o.firstItem?.size || o.firstItem?.color || o.firstItem?.gsm ? (
                      <>
                        {[o.firstItem?.size, o.firstItem?.color, o.firstItem?.gsm ? `${o.firstItem.gsm} GSM` : null]
                          .filter(Boolean)
                          .join(' • ')}{' '}
                        •{' '}
                      </>
                    ) : null}
                    {o.orderNumber} • {new Date(o.createdAt).toLocaleString('en-IN')}
                    {typeof o.moreCount === 'number' && o.moreCount > 0 ? ` • +${o.moreCount} more items` : null}
                  </div>
                  <div className="orders-row-sub">
                    {o.itemsCount} items • {o.paymentMethod.toUpperCase()}
                  </div>
                  <div className={`orders-badge status-${o.status}`}>{o.status.replace('_', ' ')}</div>
                </div>

                <div className="orders-right">
                  <div className="orders-row-total">Rs. {o.total.toFixed(2)}</div>
                  <Link to={`/orders/${encodeURIComponent(o.orderNumber)}`} className="orders-link orders-view">
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default OrdersPage;

