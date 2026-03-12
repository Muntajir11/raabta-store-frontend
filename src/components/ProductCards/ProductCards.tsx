import React from 'react';
import { ShoppingBag } from 'lucide-react';
import './ProductCards.css';

interface ProductCardsProps {
  category: 'normal' | 'islamic';
}

const DUMMY_PRODUCTS = [
  // Normal
  { id: 1, name: 'Essential Black Tee', price: '$25', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 2, name: 'Minimalist Logo Tee', price: '$30', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },
  { id: 3, name: 'Classic Red Accent', price: '$28', category: 'normal', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600' },
  { id: 4, name: 'Oversized Blank', price: '$35', category: 'normal', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600' },
  { id: 11, name: 'White Signature', price: '$28', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 12, name: 'Monochrome Pack', price: '$65', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },
  { id: 13, name: 'Red Box Logo', price: '$32', category: 'normal', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=600' },
  { id: 14, name: 'Vintage Wash Black', price: '$38', category: 'normal', image: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?auto=format&fit=crop&q=80&w=600' },
  { id: 15, name: 'Everyday Crewneck', price: '$45', category: 'normal', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=600' },
  { id: 16, name: 'Performance Tee', price: '$40', category: 'normal', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&q=80&w=600' },

  // Islamic
  { id: 5, name: 'Sabr Print Tee', price: '$30', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 6, name: 'Tawakkul Essential', price: '$32', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
  { id: 7, name: 'Geometric Pattern Tee', price: '$35', category: 'islamic', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600' },
  { id: 8, name: 'Arabic Calligraphy', price: '$38', category: 'islamic', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&q=80&w=600' },
  { id: 17, name: 'Alhamdulillah Tee', price: '$30', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 18, name: 'Bismillah Minimal', price: '$28', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
  { id: 19, name: 'Palestine Edition', price: '$40', category: 'islamic', image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=600' },
  { id: 20, name: 'Kufic Art Print', price: '$35', category: 'islamic', image: 'https://images.unsplash.com/photo-1527719327859-c6ce80353573?auto=format&fit=crop&q=80&w=600' },
  { id: 21, name: 'Dua Everyday', price: '$32', category: 'islamic', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&q=80&w=600' },
  { id: 22, name: 'Crescent Moon Tee', price: '$28', category: 'islamic', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&q=80&w=600' },
];

const ProductCards: React.FC<ProductCardsProps> = ({ category }) => {
  const filteredProducts = DUMMY_PRODUCTS.filter(p => p.category === category);

  return (
    <section className="products-section">
      <div className="container">
        <h3 className="products-heading">
          {category === 'normal' ? 'The Essentials' : 'Faith Collection'}
        </h3>
        <div className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img src={product.image} alt={product.name} className="product-image" loading="lazy" />
                <button className="add-to-cart-btn" aria-label="Add to cart">
                  <ShoppingBag size={20} />
                </button>
              </div>
              <div className="product-info">
                <h4 className="product-name">{product.name}</h4>
                <p className="product-price">{product.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductCards;
