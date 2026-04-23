import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import { ApiRequestError, type ProductItem } from '../../lib/api';
import { useProducts } from '../../lib/products';
import { useCart } from '../../lib/cart-context';
import { useWishlist } from '../../lib/wishlist';
import ProductReviews from '../../components/ProductReviews/ProductReviews';
import SizeGuideModal from '../../components/SizeGuideModal/SizeGuideModal';
import './ProductPage.css';

const PLACEHOLDER_DESCRIPTION =
  'This is a premium quality garment made from 100% breathable cotton. Carefully designed for maximum comfort and an oversized, relaxed fit. Perfect for everyday wear.';

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const routeId = useParams<{ productId: string }>().productId;
  const { status, ensureLoaded, getById } = useProducts();
  const { addItem } = useCart();
  const wishlist = useWishlist();
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedGsm, setSelectedGsm] = useState<number | null>(null);
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedSize('');
    setSelectedColor('');
    setSelectedGsm(null);
    setLoading(true);
    ensureLoaded()
      .catch(() => {})
      .finally(() => setLoading(false));
    void wishlist.ensureLoaded();
  }, [ensureLoaded, routeId]);

  const item: ProductItem | undefined = useMemo(() => {
    if (!routeId) return undefined;
    return getById(routeId);
  }, [getById, routeId]);

  const uniq = (vals: string[]) => Array.from(new Set(vals));
  const normSize = (v: string) => String(v || '').trim().toUpperCase();
  const normColor = (v: string) => String(v || '').trim().toLowerCase();

  const inventory = useMemo(() => (Array.isArray(item?.inventory) ? item?.inventory ?? [] : []), [item]);
  const hasInventory = inventory.length > 0;

  const gsmOptions = item?.gsmOptions ?? [];
  const fallbackColors = item?.colors ?? [];
  const fallbackSizes = item?.sizes ?? ['S', 'M', 'L', 'XL', 'XXL'];

  const allSizes = useMemo(() => {
    if (!hasInventory) return fallbackSizes;
    const raw = uniq(inventory.map((r) => normSize(r.size)).filter(Boolean));
    const order = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL'];
    const rank = (s: string): number => {
      const idx = order.indexOf(normSize(s));
      if (idx !== -1) return idx;
      const n = Number.parseInt(String(s).replace(/[^\d]/g, ''), 10);
      if (Number.isFinite(n)) return 1000 + n;
      return 10_000;
    };
    return raw.slice().sort((a, b) => {
      const ra = rank(a);
      const rb = rank(b);
      if (ra !== rb) return ra - rb;
      return String(a).localeCompare(String(b));
    });
  }, [fallbackSizes, hasInventory, inventory]);

  // Do not auto-select size; user must choose.
  const effectiveSize = selectedSize;

  const colors = useMemo(() => {
    if (!hasInventory) return fallbackColors;
    if (!effectiveSize) {
      return uniq(inventory.map((r) => String(r.color).trim()).filter(Boolean));
    }
    return uniq(
      inventory
        .filter((r) => normSize(r.size) === normSize(effectiveSize))
        .map((r) => String(r.color).trim())
        .filter(Boolean)
    );
  }, [effectiveSize, fallbackColors, hasInventory, inventory]);

  // Do not auto-select color; user must choose.
  const effectiveColor = selectedColor;

  const gsms = useMemo(() => {
    if (!hasInventory) return gsmOptions.map((o) => o.gsm);
    if (!effectiveSize) {
      return Array.from(new Set(inventory.map((r) => Number(r.gsm)).filter((n) => Number.isFinite(n)))).sort(
        (a, b) => a - b
      );
    }
    const base = inventory.filter((r) => normSize(r.size) === normSize(effectiveSize));
    const filtered = effectiveColor ? base.filter((r) => normColor(r.color) === normColor(effectiveColor)) : base;
    return Array.from(new Set(filtered.map((r) => Number(r.gsm)).filter((n) => Number.isFinite(n)))).sort(
      (a, b) => a - b
    );
  }, [effectiveColor, effectiveSize, gsmOptions, hasInventory, inventory]);

  // Do not auto-select GSM; user must choose.
  const effectiveGsm = selectedGsm;

  const isSizeAvailable = (size: string): boolean => {
    if (!hasInventory) return true;
    const sizeNorm = normSize(size);
    const rows = inventory.filter((r) => normSize(r.size) === sizeNorm);
    if (!rows.length) return false;
    const total = rows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0);
    return total > 0;
  };

  const isColorAvailable = (color: string): boolean => {
    if (!hasInventory) return true;
    const rows = inventory.filter((r) => {
      if (effectiveSize && normSize(r.size) !== normSize(effectiveSize)) return false;
      return normColor(r.color) === normColor(color);
    });
    return rows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0) > 0;
  };

  const isGsmAvailable = (gsm: number): boolean => {
    if (!hasInventory) return true;
    const rows = inventory.filter(
      (r) =>
        (effectiveSize ? normSize(r.size) === normSize(effectiveSize) : true) &&
        (effectiveColor ? normColor(r.color) === normColor(effectiveColor) : true) &&
        Number(r.gsm) === Number(gsm)
    );
    return rows.reduce((sum, r) => sum + (Number(r.qty) || 0), 0) > 0;
  };

  // Note: we intentionally do NOT auto-select color/GSM.
  // We only clear invalid selections when upstream choices change.
  useEffect(() => {
    if (!hasInventory) return;
    if (!selectedColor) return;
    if (colors.some((c) => normColor(c) === normColor(selectedColor))) return;
    setSelectedColor('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInventory, effectiveSize, colors.join('|')]);

  useEffect(() => {
    if (!hasInventory) return;
    if (selectedGsm === null) return;
    if (gsms.includes(selectedGsm)) return;
    setSelectedGsm(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasInventory, effectiveSize, effectiveColor, gsms.join('|')]);

  const colorToHex = (name: string): string => {
    const key = normColor(name);
    const map: Record<string, string> = {
      black: '#111827',
      white: '#ffffff',
      'sage green': '#9caf88',
      sage: '#9caf88',
      green: '#16a34a',
      red: '#dc2626',
      blue: '#2563eb',
      navy: '#0f172a',
      grey: '#9ca3af',
      gray: '#9ca3af',
      beige: '#e7dbc8',
      brown: '#8b5e34',
      cream: '#fff7ed',
      pink: '#ec4899',
      purple: '#7c3aed',
      maroon: '#7f1d1d',
      yellow: '#facc15',
      orange: '#f97316',
    };
    return map[key] || '#e5e7eb';
  };

  const selectedGsmPrice = useMemo(() => {
    if (!effectiveGsm) return item?.price ?? 0;
    const opt = gsmOptions.find((o) => Number(o.gsm) === Number(effectiveGsm));
    return opt?.price ?? (item?.price ?? 0);
  }, [effectiveGsm, gsmOptions, item?.price]);

  const priceLabel = `Rs. ${Math.round(selectedGsmPrice)}`;
  const rating = null;
  const reviewsCount = null;
  const description = PLACEHOLDER_DESCRIPTION;

  const missingSelections = useMemo(() => {
    const missing: string[] = [];
    if (!selectedSize) missing.push('size');
    if (!selectedColor) missing.push('color');
    if (!selectedGsm) missing.push('GSM');
    return missing;
  }, [selectedColor, selectedGsm, selectedSize]);

  async function handleAddToBag() {
    if (!item) return;
    if (!selectedSize) {
      toast.error('Please select a size.');
      return;
    }
    if (!selectedColor) {
      toast.error('Please select a color.');
      return;
    }
    if (!selectedGsm) {
      toast.error('Please select a GSM.');
      return;
    }
    if (hasInventory && !isSizeAvailable(selectedSize)) return;

    setAdding(true);
    try {
      await addItem({
        productId: item.id,
        name: item.name,
        price: selectedGsmPrice,
        image: item.image,
        category: item.category,
        size: selectedSize,
        color: selectedColor,
        gsm: selectedGsm,
        qty: 1,
      });
      toast.success('Added to cart');
    } catch (err) {
      if (err instanceof ApiRequestError) {
        toast.error(err.message || 'Could not add to cart');
      } else {
        toast.error('Could not add to cart. Please try again.');
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleWishlistToggle() {
    if (!item) return;
    try {
      await wishlist.ensureLoaded();
      if (wishlist.has(item.id)) {
        await wishlist.remove(item.id);
        toast.success('Removed from wishlist');
      } else {
        await wishlist.add(item.id);
        toast.success('Added to wishlist');
      }
    } catch (err) {
      const msg =
        err instanceof ApiRequestError
          ? err.status === 401
            ? 'Please log in to use wishlist'
            : err.message
          : 'Could not update wishlist';
      toast.error(msg);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="product-not-found">
        <p className="product-page-loading">Loading product…</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <button type="button" onClick={() => navigate('/')} className="btn-back">
          Go Back Home
        </button>
      </div>
    );
  }

  const name = item.name;
  const brand = 'Raabta®';
  const images = [item.image];

  return (
    <div className="product-page">
      <div className="product-page-container">
        <div className="product-gallery">
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${selectedImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIdx(idx)}
                >
                  <img src={img} alt={`${name} view ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="main-image">
            <img src={images[selectedImageIdx]} alt={name} />
          </div>
        </div>

        <div className="product-details">
          <div className="product-header">
            <h3 className="brand-name">{brand}</h3>
            <h1 className="product-title">{name}</h1>
          </div>

          {rating && reviewsCount ? (
            <div className="product-rating">
              <span className="rating-badge">★ {rating}</span>
              <span className="reviews-count">{reviewsCount} Reviews</span>
            </div>
          ) : null}

          <div className="product-price-section">
            <span className="current-price">{priceLabel}</span>
          </div>
          <p className="inclusive-taxes">inclusive of all taxes</p>

          <div className="size-selection">
            <div className="size-header">
              <h4>SELECT SIZE</h4>
              <button type="button" className="size-guide" onClick={() => setIsSizeGuideOpen(true)}>
                <Ruler size={16} /> Size Guide
              </button>
            </div>
            <div className="size-options">
              {allSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={!isSizeAvailable(size)}
                  className={`size-btn ${normSize(selectedSize) === normSize(size) ? 'selected' : ''} ${!isSizeAvailable(size) ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isSizeAvailable(size)) return;
                    setSelectedSize(size);
                    setSelectedColor('');
                    setSelectedGsm(null);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {colors.length > 0 && (
            <div className="color-selection">
              <h4>COLOR</h4>
              <div className="color-options">
                {colors.map((color) => {
                  const selected = normColor(effectiveColor) === normColor(color);
                  const disabled = hasInventory ? !isColorAvailable(color) : false;
                  return (
                    <button
                      key={color}
                      type="button"
                      disabled={disabled}
                      className={`color-pill ${selected ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                      title={String(color)}
                      aria-label={String(color)}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedColor(color);
                      }}
                    >
                      <span
                        className="color-dot"
                        style={{ backgroundColor: colorToHex(color) }}
                        aria-hidden
                      />
                      <span className="color-label">{String(color)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {gsms.length > 0 ? (
            <div className="color-selection">
              <h4>GSM</h4>
              <div className="color-options">
                {gsms.map((gsm) => {
                  const disabled = hasInventory ? !isGsmAvailable(gsm) : false;
                  return (
                    <button
                      key={gsm}
                      type="button"
                      disabled={disabled}
                      className={`size-btn ${effectiveGsm === gsm ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
                      onClick={() => {
                        if (disabled) return;
                        setSelectedGsm(gsm);
                      }}
                    >
                      {gsm}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div className="product-actions">
            <button
              type="button"
              className="btn-add-to-bag"
              disabled={
                (hasInventory && !isSizeAvailable(selectedSize)) ||
                adding
              }
              onClick={() => void handleAddToBag()}
            >
              <ShoppingBag size={20} /> {adding ? 'ADDING…' : 'ADD TO BAG'}
            </button>
            <button type="button" className="btn-wishlist" onClick={() => void handleWishlistToggle()}>
              <Heart size={20} /> {item && wishlist.has(item.id) ? 'WISHLISTED' : 'WISHLIST'}
            </button>
          </div>
          {missingSelections.length ? (
            <p className="mt-2 text-sm text-slate-600">
              Select {missingSelections.join(', ')} to add to bag.
            </p>
          ) : null}

          <div className="product-offers">
            <h4>Apply Coupon</h4>
            <div className="coupon-input">
              <input type="text" placeholder="Enter coupon code" />
              <button type="button">APPLY</button>
            </div>
          </div>

          <div className="delivery-check">
            <h4>Check Delivery</h4>
            <div className="pincode-input">
              <input type="text" placeholder="Enter PIN code" maxLength={6} />
              <button type="button">CHECK</button>
            </div>
            <p className="delivery-hint">
              Please enter PIN code to check delivery time & Pay on Delivery Availability
            </p>
          </div>

          <div className="product-accordion">
            <div className="accordion-header">
              <h4>Product Description</h4>
            </div>
            <div className="accordion-content">
              <p>{description}</p>
              <ul>
                <li>Regular fit</li>
                <li>100% Cotton, 180 GSM</li>
                <li>Machine wash</li>
                <li>Made in India</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <ProductReviews productId={routeId || ''} />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductPage;
