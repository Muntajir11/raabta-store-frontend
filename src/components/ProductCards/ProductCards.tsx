import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { DUMMY_PRODUCTS } from '../../data/products';
import './ProductCards.css';

interface ProductCardsProps {
  category: string;
}


const getHeading = (category: string) => {
  if (category === 'normal') return 'The Essentials';
  if (category === 'islamic') return 'Faith Collection';
  return category.charAt(0).toUpperCase() + category.slice(1) + ' Collection';
};

const ProductCards: React.FC<ProductCardsProps> = ({ category }) => {
  // Use existing products for their respective categories, or render all 20 for placeholder categories
  const isSpecialCategory = category === 'normal' || category === 'islamic';
  const filteredProducts = isSpecialCategory 
    ? DUMMY_PRODUCTS.filter(p => p.category === category)
    : DUMMY_PRODUCTS;

  return (
    <section className="products-section">
      <div className="container">
        <h3 className="products-heading">
          {getHeading(category)}
        </h3>
        <div className="products-grid">
          {filteredProducts.map((product, idx) => (
            <Link to={`/product/${product.id}`} key={`${product.id}-${idx}`} className="product-card" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                <button 
                  className="add-to-cart-btn" 
                  aria-label="Add to cart"
                  onClick={(e) => {
                    e.preventDefault(); // Prevent navigating if they just click add to cart directly from the list
                    // Add to cart logic ...
                  }}
                >
                  <ShoppingBag size={20} />
                </button>
              </div>
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCards;
