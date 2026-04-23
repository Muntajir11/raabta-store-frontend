import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ApiRequestError } from '../../lib/api';
import { useProducts } from '../../lib/products';
import { useWishlist } from '../../lib/wishlist';

export default function WishlistPage() {
  const { status: productsStatus, ensureLoaded, getById } = useProducts();
  const wishlist = useWishlist();

  useEffect(() => {
    void ensureLoaded();
    void wishlist.ensureLoaded();
  }, [ensureLoaded, wishlist]);

  const items = useMemo(() => {
    return wishlist.ids
      .map((id) => getById(id))
      .filter(Boolean);
  }, [getById, wishlist.ids]);

  async function onRemove(productId: string) {
    try {
      await wishlist.remove(productId);
      toast.success('Removed from wishlist');
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.status === 401
            ? 'Please log in to view wishlist'
            : err.message
          : 'Could not update wishlist';
      toast.error(msg);
    }
  }

  const isLoading = wishlist.status === 'loading' || productsStatus === 'loading';

  return (
    <section className="cart-page">
      <div className="container">
        <div className="cart-header-row">
          <h2 className="cart-title">Wishlist</h2>
        </div>

        {wishlist.status === 'error' ? <p className="cart-error">{wishlist.error}</p> : null}

        {isLoading ? (
          <p className="cart-state">Loading wishlist…</p>
        ) : wishlist.ids.length === 0 ? (
          <div className="cart-empty-state">
            <p className="cart-state">Your wishlist is empty.</p>
            <Link to="/" className="cart-auth-link">
              Continue shopping
            </Link>
          </div>
        ) : items.length === 0 ? (
          <p className="cart-state">Wishlist items are not available right now.</p>
        ) : (
          <div className="cart-items-list">
            {items.map((p) => (
              <article key={p!.id} className="cart-item-card">
                <img src={p!.image} alt={p!.name} className="cart-item-image" />
                <div className="cart-item-main">
                  <h3 className="cart-item-name">{p!.name}</h3>
                  <p className="cart-item-meta">{p!.category}</p>
                  <p className="cart-item-price">Rs. {Math.round(p!.price)}</p>
                  <div className="cart-item-actions">
                    <Link to={`/product/${p!.id}`} className="cart-auth-link">
                      View
                    </Link>
                    <button type="button" className="cart-remove-btn" onClick={() => void onRemove(p!.id)}>
                      Remove
                    </button>
                  </div>
                </div>
                <div className="cart-item-total" />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

