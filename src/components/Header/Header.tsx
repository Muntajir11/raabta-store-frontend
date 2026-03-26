import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CircleUserRound, ShoppingBag, Search } from 'lucide-react';
import './Header.css';
import logoImg from '../../assets/raabta/YOUR - 2.JPG.jpeg';
import {
  AUTH_EVENT_NAME,
  authLogout,
  authSession,
} from '../../lib/api';

const Header: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const categories = [
    { id: '', label: 'Home' },
    { id: 'anime', label: 'Anime' },
    { id: 'sports', label: 'Sports' },
    { id: 'streetwear', label: 'Streetwear' },
    { id: 'customisation', label: 'Customisation' },
    { id: 'islamic', label: 'Islamic' },
  ];

  useEffect(() => {
    const refreshAuthState = async () => {
      try {
        const session = await authSession();
        setIsLoggedIn(Boolean(session));
      } catch {
        setIsLoggedIn(false);
      }
    };
    void refreshAuthState();
    window.addEventListener(AUTH_EVENT_NAME, refreshAuthState);
    return () => {
      window.removeEventListener(AUTH_EVENT_NAME, refreshAuthState);
    };
  }, []);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!profileMenuRef.current) return;
      const target = event.target as Node;
      if (!profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authLogout();
      setIsProfileMenuOpen(false);
    } catch {
      setIsLoggedIn(false);
    }
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
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <NavLink
                to={category.id ? `/category/${category.id}` : '/'}
                end={!category.id}
                className={({ isActive }) =>
                  `nav-link segment-link${isActive ? ' active' : ''}`
                }
              >
                {category.label}
              </NavLink>
              {index < categories.length - 1 ? (
                <span className="separator">|</span>
              ) : null}
            </React.Fragment>
          ))}
        </div>

        <div className="header-tools">
          <div className="header-search">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input type="text" placeholder="Search by Keyword" className="search-input" />
            </div>
          </div>

          <div className="header-actions">
            <button className="cart-btn" aria-label="Cart">
              <ShoppingBag size={20} />
              <span className="cart-count">0</span>
            </button>

            {!isLoggedIn ? (
              <div className="auth-actions">
              <>
                <Link to="/login" className="nav-link">Log in</Link>
                <Link to="/signup" className="nav-link signup-btn">Sign up</Link>
              </>
              </div>
            ) : null}

            <div className="profile-menu-wrap" ref={profileMenuRef}>
              <button
                className="profile-btn"
                type="button"
                aria-label="Profile"
                aria-expanded={isProfileMenuOpen}
                onClick={() => {
                  setIsProfileMenuOpen((prev) => !prev);
                }}
              >
                <CircleUserRound size={20} />
              </button>

              {isProfileMenuOpen ? (
                <div className="profile-menu-card" role="menu" aria-label="Profile menu">
                  {isLoggedIn ? (
                    <>
                      <Link to="#" className="profile-menu-item" role="menuitem">
                        My Account
                      </Link>
                      <Link to="#" className="profile-menu-item" role="menuitem">
                        My Address
                      </Link>
                      <Link to="#" className="profile-menu-item" role="menuitem">
                        Settings
                      </Link>
                      <button
                        type="button"
                        className="profile-menu-item profile-menu-logout"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="profile-menu-item" role="menuitem">
                        Log in
                      </Link>
                      <Link to="/signup" className="profile-menu-item" role="menuitem">
                        Sign up
                      </Link>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
