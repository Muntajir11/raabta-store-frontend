import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import './ProductCards.css';
import { useCart } from '../../lib/cart-context';
import type { ProductItem } from '../../lib/api';
import { FALLBACK_PRODUCT_IMAGE_URL, FALLBACK_PRODUCTS } from '../../data/products';

interface ProductCardsProps {
  category: string;
}

const getHeading = (category: string) => {
  if (category === 'normal') return 'The Essentials';
  if (category === 'islamic') return 'Faith Collection';
  return category.charAt(0).toUpperCase() + category.slice(1) + ' Collection';
};

const ProductCards: React.FC<ProductCardsProps> = ({ category }) => {
  const { addItem } = useCart();
  const [feedback, setFeedback] = useState<string | null>(null);
  const visibleProducts: ProductItem[] = FALLBACK_PRODUCTS;

  const handleAddToCart = async (product: ProductItem) => {
    const defaultSize = product.sizes[0] || 'M';
    const defaultColor = product.colors[0] || 'Black';
    const defaultGsmOption = product.gsmOptions[0] || { gsm: 180, price: product.price };

    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: defaultGsmOption.price,
        image: product.image,
        category: product.category,
        size: defaultSize,
        color: defaultColor,
        gsm: defaultGsmOption.gsm,
        qty: 1,
      });
      setFeedback(`${product.name} added to cart`);
      window.setTimeout(() => setFeedback(null), 1600);
    } catch {
      setFeedback('Unable to add item right now');
      window.setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <section className="products-section">
      <div className="container">
        <h3 className="products-heading">{getHeading(category)}</h3>
        {feedback ? <p className="products-feedback">{feedback}</p> : null}
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
                  src={product.image}
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
                <button
                  type="button"
                  className="add-to-cart-btn"
                  aria-label={`Add ${product.name} to cart`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    void handleAddToCart(product);
                  }}
                >
                  <ShoppingBag size={20} />
                </button>
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
                  <p className="product-price">Rs. {Math.round(product.price * 83)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCards;
