import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search } from 'lucide-react';
import './Header.css';
import logoImg from '../../assets/raabta/YOUR - 2.JPG.jpeg';
import {
  AUTH_EVENT_NAME,
  clearAuthToken,
  getAuthToken,
} from '../../lib/api';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(getAuthToken()));

  useEffect(() => {
    const refreshAuthState = () => setIsLoggedIn(Boolean(getAuthToken()));
    window.addEventListener('storage', refreshAuthState);
    window.addEventListener(AUTH_EVENT_NAME, refreshAuthState);
    return () => {
      window.removeEventListener('storage', refreshAuthState);
      window.removeEventListener(AUTH_EVENT_NAME, refreshAuthState);
    };
  }, []);

  const handleLogout = () => {
    clearAuthToken();
  };

  return (
    <header className="header">
      <div className="container header-container">

        <div className="logo-group">
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="raabta." className="header-logo-img" />
          </Link>
        </div>

        <div className="header-segments">
          <Link to="/category/anime" className="nav-link">Anime</Link> <span className="separator">|</span>
          <Link to="/category/sports" className="nav-link">Sports</Link> <span className="separator">|</span>
          <Link to="/category/streetwear" className="nav-link">Streetwear</Link> <span className="separator">|</span>
          <Link to="/category/customisation" className="nav-link">Customisation</Link> <span className="separator">|</span>
          <Link to="/category/islamic" className="nav-link">Islamic</Link>
        </div>

        <div className="header-search">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input type="text" placeholder="Search by Keyword" className="search-input" />
          </div>
        </div>

        <div className="header-actions">
          {isLoggedIn ? (
            <button
              type="button"
              className="nav-link logout-btn"
              onClick={handleLogout}
            >
              Log out
            </button>
          ) : (
            <>
              <Link to="/login" className="nav-link">Log in</Link>
              <Link to="/signup" className="nav-link signup-btn">Sign up</Link>
            </>
          )}
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
