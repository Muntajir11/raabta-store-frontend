import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Ruler } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../../data/products';
import ProductReviews from '../../components/ProductReviews/ProductReviews';
import './ProductPage.css';
const ProductPage: React.FC = () => {

  const navigate = useNavigate();
  const productId = parseInt(useParams<{ productId: string }>().productId || '0', 10);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0);

  const product = DUMMY_PRODUCTS.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/')} className="btn-back">Go Back Home</button>
      </div>
    );
  }

  const images = product.images || [product.image];

  return (
    <div className="product-page">
      <div className="product-page-container">
        {/* Left Column - Image Gallery */}
        <div className="product-gallery">
          {images.length > 1 && (
            <div className="thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`thumbnail ${selectedImageIdx === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImageIdx(idx)}
                >
                  <img src={img} alt={`${product.name} view ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
          <div className="main-image">
            <img src={images[selectedImageIdx]} alt={product.name} />
          </div>
        </div>

        {/* Right Column - Product Info */}
        <div className="product-details">
          <div className="product-header">
            <h3 className="brand-name">{product.brand || 'I.M.J Exclusive'}</h3>
            <h1 className="product-title">{product.name}</h1>
          </div>

          {product.rating && (
            <div className="product-rating">
              <span className="rating-badge">★ {product.rating}</span>
              <span className="reviews-count">{product.reviewsCount} Reviews</span>
            </div>
          )}

          <div className="product-price-section">
            <span className="current-price">{product.price}</span>
            {product.mrp && <span className="mrp-price">{product.mrp}</span>}
            {product.discount && <span className="discount-tag">{product.discount}</span>}
          </div>
          <p className="inclusive-taxes">inclusive of all taxes</p>

          {(product.colors && product.colors.length > 0) && (
            <div className="color-selection">
              <h4>COLOR</h4>
              <div className="color-options">
                {product.colors.map((color, idx) => (
                  <div key={idx} className={`color-swatch ${idx === 0 ? 'selected' : ''}`} style={{ backgroundColor: color }}></div>
                ))}
              </div>
            </div>
          )}

          <div className="size-selection">
            <div className="size-header">
              <h4>SELECT SIZE</h4>
              <button className="size-guide">
                <Ruler size={16} /> Size Guide
              </button>
            </div>
            <div className="size-options">
              {(product.sizes || ['S', 'M', 'L', 'XL', 'XXL']).map(size => (
                <button
                  key={size}
                  className={`size-btn ${selectedSize === size ? 'selected' : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="product-actions">
            <button className="btn-add-to-bag">
              <ShoppingBag size={20} /> ADD TO BAG
            </button>
            <button className="btn-wishlist">
              <Heart size={20} /> WISHLIST
            </button>
          </div>

          <div className="product-offers">
            <h4>Apply Coupon</h4>
            <div className="coupon-input">
              <input type="text" placeholder="Enter coupon code" />
              <button>APPLY</button>
            </div>
          </div>

          <div className="delivery-check">
            <h4>Check Delivery</h4>
            <div className="pincode-input">
              <input type="text" placeholder="Enter PIN code" maxLength={6} />
              <button>CHECK</button>
            </div>
            <p className="delivery-hint">Please enter PIN code to check delivery time & Pay on Delivery Availability</p>
          </div>

          <div className="product-accordion">
            <div className="accordion-header">
              <h4>Product Description</h4>
            </div>
            <div className="accordion-content">
              <p>{product.description}</p>
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

      {/* Review Section */}
      <ProductReviews productId={product.id} rating={product.rating} reviewsCount={product.reviewsCount} />
    </div>
  );
};

export default ProductPage;
