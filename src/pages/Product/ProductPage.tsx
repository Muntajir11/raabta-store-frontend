import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler } from 'lucide-react';
import type { ProductItem } from '../../lib/api';
import { useProducts } from '../../lib/products';
import { useCart } from '../../lib/cart-context';
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
    void ensureLoaded().finally(() => setLoading(false));
  }, [ensureLoaded, routeId]);

  const item: ProductItem | undefined = useMemo(() => {
    if (!routeId) return undefined;
    return getById(routeId);
  }, [getById, routeId]);

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
  const sizes = item.sizes ?? ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = item.colors ?? [];
  const gsmOptions = item.gsmOptions ?? [];

  const effectiveColor = selectedColor || colors[0] || '';
  const effectiveGsm = selectedGsm ?? (gsmOptions[0]?.gsm ?? null);

  const inventory = item.inventory || [];
  const hasInventory = inventory.length > 0;

  const qtyForVariant = (size: string, color: string, gsm: number | null): number | null => {
    if (!hasInventory) return null;
    if (!gsm || !color) return 0;
    const row = inventory.find(
      (r) =>
        String(r.size).trim().toUpperCase() === String(size).trim().toUpperCase() &&
        String(r.color).trim().toLowerCase() === String(color).trim().toLowerCase() &&
        Number(r.gsm) === Number(gsm)
    );
    return row ? Number(row.qty) : 0;
  };

  const isSizeAvailable = (size: string): boolean => {
    if (!hasInventory) return true;
    const q = qtyForVariant(size, effectiveColor, effectiveGsm);
    return (q ?? 0) > 0;
  };

  const selectedGsmPrice = useMemo(() => {
    if (!effectiveGsm) return item.price;
    const opt = gsmOptions.find((o) => Number(o.gsm) === Number(effectiveGsm));
    return opt?.price ?? item.price;
  }, [effectiveGsm, gsmOptions, item.price]);

  const priceLabel = `Rs. ${Math.round(selectedGsmPrice)}`;
  const rating = 4.8;
  const reviewsCount = 128;
  const description = PLACEHOLDER_DESCRIPTION;

  async function handleAddToBag() {
    if (!item) return;
    if (!effectiveColor || !effectiveGsm) return;
    if (!selectedSize) return;
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
        color: effectiveColor,
        gsm: effectiveGsm,
        qty: 1,
      });
    } finally {
      setAdding(false);
    }
  }

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

          <div className="product-rating">
            <span className="rating-badge">★ {rating ?? 4.8}</span>
            <span className="reviews-count">{reviewsCount ?? 128} Reviews</span>
          </div>

          <div className="product-price-section">
            <span className="current-price">{priceLabel}</span>
          </div>
          <p className="inclusive-taxes">inclusive of all taxes</p>

          {colors.length > 0 && (
            <div className="color-selection">
              <h4>COLOR</h4>
              <div className="color-options">
                {colors.map((color, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`color-swatch ${String(effectiveColor).toLowerCase() === String(color).toLowerCase() ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>
          )}

          {gsmOptions.length > 0 ? (
            <div className="color-selection">
              <h4>GSM</h4>
              <div className="color-options">
                {gsmOptions.map((o) => (
                  <button
                    key={o.gsm}
                    type="button"
                    className={`size-btn ${effectiveGsm === o.gsm ? 'selected' : ''}`}
                    onClick={() => setSelectedGsm(o.gsm)}
                  >
                    {o.gsm}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="size-selection">
            <div className="size-header">
              <h4>SELECT SIZE</h4>
              <button type="button" className="size-guide" onClick={() => setIsSizeGuideOpen(true)}>
                <Ruler size={16} /> Size Guide
              </button>
            </div>
            <div className="size-options">
              {sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  disabled={!isSizeAvailable(size)}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''} ${!isSizeAvailable(size) ? 'disabled' : ''}`}
                  onClick={() => {
                    if (!isSizeAvailable(size)) return;
                    setSelectedSize(size);
                  }}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-actions">
            <button
              type="button"
              className="btn-add-to-bag"
              disabled={!selectedSize || (hasInventory && !isSizeAvailable(selectedSize)) || adding}
              onClick={() => void handleAddToBag()}
            >
              <ShoppingBag size={20} /> {adding ? 'ADDING…' : 'ADD TO BAG'}
            </button>
            <button type="button" className="btn-wishlist">
              <Heart size={20} /> WISHLIST
            </button>
          </div>

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

      <ProductReviews productId={undefined} rating={rating} reviewsCount={reviewsCount} />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductPage;
