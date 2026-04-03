import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler } from 'lucide-react';
import type { Product } from '../../data/products';
import { DUMMY_PRODUCTS, FALLBACK_PRODUCTS } from '../../data/products';
import { productsList, type ProductItem } from '../../lib/api';
import ProductReviews from '../../components/ProductReviews/ProductReviews';
import SizeGuideModal from '../../components/SizeGuideModal/SizeGuideModal';
import './ProductPage.css';

type Resolved =
  | { kind: 'dummy'; product: Product }
  | { kind: 'catalog'; item: ProductItem };

function resolveProduct(routeId: string | undefined): Resolved | null {
  if (!routeId) return null;

  const numericId = /^\d+$/.test(routeId) ? parseInt(routeId, 10) : NaN;
  if (!Number.isNaN(numericId)) {
    const dummy = DUMMY_PRODUCTS.find((p) => p.id === numericId);
    if (dummy) return { kind: 'dummy', product: dummy };
  }
  return null;
}

const PLACEHOLDER_DESCRIPTION =
  'This is a premium quality garment made from 100% breathable cotton. Carefully designed for maximum comfort and an oversized, relaxed fit. Perfect for everyday wear.';

function inrFromUsd(usd: number): number {
  return Math.round(usd * 83);
}

const ProductPage: React.FC = () => {
  const navigate = useNavigate();
  const routeId = useParams<{ productId: string }>().productId;
  const [resolved, setResolved] = useState<Resolved | null | undefined>(undefined);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    setSelectedImageIdx(0);
    setSelectedSize('');

    const staticMatch = resolveProduct(routeId);
    if (staticMatch) {
      setResolved(staticMatch);
      return;
    }

    if (!routeId) {
      setResolved(null);
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        const items = await productsList();
        const item = items.find((p) => p.id === routeId) ?? null;
        if (cancelled) return;
        if (item) setResolved({ kind: 'catalog', item });
        else setResolved(null);
      } catch {
        if (cancelled) return;
        const item = FALLBACK_PRODUCTS.find((p) => p.id === routeId) ?? null;
        setResolved(item ? { kind: 'catalog', item } : null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [routeId]);

  if (resolved === undefined) {
    return (
      <div className="product-not-found">
        <p className="product-page-loading">Loading product…</p>
      </div>
    );
  }

  if (resolved === null) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <button type="button" onClick={() => navigate('/')} className="btn-back">
          Go Back Home
        </button>
      </div>
    );
  }

  const isDummy = resolved.kind === 'dummy';
  const product = isDummy ? resolved.product : null;
  const item = !isDummy ? resolved.item : null;

  const name = product?.name ?? item!.name;
  const brand = product?.brand ?? 'Raabta®';
  const images = product?.images ?? [product?.image ?? item!.image];
  const sizes = product?.sizes ?? item!.sizes ?? ['S', 'M', 'L', 'XL', 'XXL'];
  const colors = product?.colors ?? item!.colors ?? [];

  const priceLabel = product?.price ?? `Rs. ${inrFromUsd(item!.gsmOptions[0]?.price ?? item!.price)}`;
  const mrp = product?.mrp;
  const discount = product?.discount;
  const rating = product?.rating;
  const reviewsCount = product?.reviewsCount;
  const description = product?.description ?? PLACEHOLDER_DESCRIPTION;

  const reviewsProductId = isDummy ? product!.id : undefined;

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
            {mrp && <span className="mrp-price">{mrp}</span>}
            {discount && <span className="discount-tag">{discount}</span>}
          </div>
          <p className="inclusive-taxes">inclusive of all taxes</p>

          {colors.length > 0 && (
            <div className="color-selection">
              <h4>COLOR</h4>
              <div className="color-options">
                {colors.map((color, idx) => (
                  <div
                    key={idx}
                    className={`color-swatch ${idx === 0 ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

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
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-actions">
            <button type="button" className="btn-add-to-bag">
              <ShoppingBag size={20} /> ADD TO BAG
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

      <ProductReviews productId={reviewsProductId} rating={rating} reviewsCount={reviewsCount} />

      <SizeGuideModal isOpen={isSizeGuideOpen} onClose={() => setIsSizeGuideOpen(false)} />
    </div>
  );
};

export default ProductPage;
