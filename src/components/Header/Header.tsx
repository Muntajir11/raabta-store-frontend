import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className="container header-container">
        
        <div className="logo-group">
          <Link to="/" className="logo" style={{ textDecoration: 'none', color: 'inherit' }}>raabta.</Link>
        </div>

        <div className="header-tagline">
          Design the future
        </div>
        
        <div className="header-actions">
          <Link to="/login" className="nav-link">Log in</Link>
          <Link to="/signup" className="nav-link signup-btn">Sign up</Link>
          <button className="cart-btn" aria-label="Cart">
            <ShoppingBag size={20} />
            <span className="cart-count">0</span>
          </button>
        </div>

      </div>
    </header>
  );
};

export default Header;
