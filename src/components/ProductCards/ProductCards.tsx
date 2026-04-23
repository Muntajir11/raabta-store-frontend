import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import './ProductCards.css';
import type { ProductItem } from '../../lib/api';
import { useProducts } from '../../lib/products';
import { routeCategoryToSectionName } from '../../lib/product-sections';
import { productCardImageUrl } from '../../lib/cloudinary';

interface ProductCardsProps {
  category: string;
}

const getHeading = (category: string) => {
  if (category === 'normal') return 'Raabta Lifestyle Collections';
  if (category === 'islamic') return 'Raabta Studio Collection';
  return category.charAt(0).toUpperCase() + category.slice(1) + ' Collection';
};

const ProductCards: React.FC<ProductCardsProps> = ({ category }) => {
  const { status, error, ensureLoaded, reload, getBySection } = useProducts();

  const sectionName = useMemo(() => routeCategoryToSectionName(category), [category]);

  useEffect(() => {
    ensureLoaded().catch(() => {});
  }, [ensureLoaded]);

  const visibleProducts: ProductItem[] = useMemo(() => {
    if (!sectionName) return [];
    return getBySection(sectionName);
  }, [getBySection, sectionName]);

  const FALLBACK_PRODUCT_IMAGE_URL = 'https://placehold.co/600x700?text=Raabta';

  return (
    <section className="products-section">
      <div className="container">
        <h3 className="products-heading">{getHeading(category)}</h3>
        {status === 'loading' ? <p className="products-feedback">Loading products…</p> : null}
        {status === 'error' ? (
          <div className="products-feedback">
            <p style={{ margin: 0 }}>No products found.</p>
            <p style={{ margin: '0.25rem 0 0', opacity: 0.8 }}>
              {error || 'The server is unreachable right now.'}
            </p>
            <button
              type="button"
              className="contact-btn"
              style={{ marginTop: '0.75rem' }}
              onClick={() => void reload().catch(() => {})}
            >
              Try again
            </button>
          </div>
        ) : status === 'ready' && visibleProducts.length === 0 ? (
          <div className="products-feedback">
            <p style={{ margin: 0 }}>No products found.</p>
            <button
              type="button"
              className="contact-btn"
              style={{ marginTop: '0.75rem' }}
              onClick={() => void reload().catch(() => {})}
            >
              Refresh
            </button>
          </div>
        ) : null}

        {visibleProducts.length > 0 ? (
          <div className="products-grid">
            {visibleProducts.map((product, idx) => (
            <Link
              key={`${product.id}-${idx}`}
              to={`/product/${product.id}`}
              className="product-card"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="product-image-wrapper">
                <img
                  src={productCardImageUrl(product.image, 430)}
                  srcSet={`${productCardImageUrl(product.image, 430)} 430w, ${productCardImageUrl(product.image, 600)} 600w`}
                  sizes="(max-width: 768px) 50vw, 33vw"
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                  onError={(ev) => {
                    ev.currentTarget.onerror = null;
                    ev.currentTarget.src = FALLBACK_PRODUCT_IMAGE_URL;
                  }}
                />
                <div className="product-rating-badge">
                  <Star size={13} fill="currentColor" />
                  <span>4.8</span>
                </div>
              </div>
              <div className="product-info">
                <div className="product-meta-row">
                  <p className="product-brand">Raabta&reg;</p>
                  <button
                    className="wishlist-btn"
                    aria-label={`Add ${product.name} to wishlist`}
                    type="button"
                    onClick={(e) => e.preventDefault()}
                  >
                    <Heart size={18} />
                  </button>
                </div>
                <h4 className="product-name">{product.name}</h4>
                <div className="product-price-row">
                  <p className="product-price">Rs. {Math.round(product.price)}</p>
                </div>
              </div>
            </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default ProductCards;
