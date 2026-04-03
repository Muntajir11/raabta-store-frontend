import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { CircleUserRound, Menu, Search, ShoppingBag, X } from 'lucide-react';
import './Header.css';
import logoImg from '../../assets/raabta/YOUR - 2.JPG.jpeg';
import {
  AUTH_EVENT_NAME,
  authLogout,
  authSession,
} from '../../lib/api';
import { useCart } from '../../lib/cart-context';

const Header: React.FC = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const { totalItems } = useCart();
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

  useEffect(() => {
    setMobileNavOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileNavOpen]);

  const handleLogout = async () => {
    try {
      await authLogout();
      setIsProfileMenuOpen(false);
      setMobileNavOpen(false);
    } catch {
      setIsLoggedIn(false);
    }
  };

  const segmentClass = ({ isActive }: { isActive: boolean }, categoryId: string) => {
    const customisationActive =
      categoryId === 'customisation' &&
      (location.pathname.startsWith('/customisation/') || location.pathname === '/category/customisation');
    const active = categoryId === 'customisation' ? customisationActive : isActive;
    return `nav-link segment-link mobile-nav-segment mobile-nav-link${active ? ' active' : ''}`;
  };

  const mobileDrawer =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className={`mobile-nav-backdrop${mobileNavOpen ? ' is-open' : ''}`}
              aria-hidden={!mobileNavOpen}
              onClick={() => setMobileNavOpen(false)}
            />
            <aside
              className={`mobile-nav-drawer${mobileNavOpen ? ' is-open' : ''}`}
              id="mobile-primary-nav"
              aria-hidden={!mobileNavOpen}
            >
              <div className="mobile-nav-drawer-head">
                <span className="mobile-nav-drawer-title">Menu</span>
                <button
                  type="button"
                  className="mobile-nav-close"
                  aria-label="Close menu"
                  onClick={() => setMobileNavOpen(false)}
                >
                  <X size={22} strokeWidth={2} aria-hidden />
                </button>
              </div>
              <nav className="mobile-nav-body" aria-label="Main navigation">
                {isLoggedIn ? (
                  <div className="mobile-nav-block">
                    <p className="mobile-nav-block-label">Account</p>
                    <Link to="#" className="mobile-nav-link mobile-nav-link--primary" onClick={() => setMobileNavOpen(false)}>
                      My account
                    </Link>
                    <Link to="#" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                      My address
                    </Link>
                    <Link to="#" className="mobile-nav-link" onClick={() => setMobileNavOpen(false)}>
                      Settings
                    </Link>
                    <button type="button" className="mobile-nav-link mobile-nav-link--danger" onClick={() => void handleLogout()}>
                      Log out
                    </button>
                  </div>
                ) : (
                  <div className="mobile-nav-block">
                    <p className="mobile-nav-block-label">Account</p>
                    <Link to="/login" className="mobile-nav-link mobile-nav-link--primary" onClick={() => setMobileNavOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/signup" className="mobile-nav-link mobile-nav-link--outline" onClick={() => setMobileNavOpen(false)}>
                      Sign up
                    </Link>
                  </div>
                )}
                <div className="mobile-nav-block">
                  <p className="mobile-nav-block-label">Shop</p>
                  {categories.map((category) => (
                    <NavLink
                      key={category.id || 'home'}
                      to={category.id ? `/category/${category.id}` : '/'}
                      end={!category.id}
                      className={(p) => segmentClass(p, category.id)}
                      onClick={() => setMobileNavOpen(false)}
                    >
                      {category.label}
                    </NavLink>
                  ))}
                </div>
              </nav>
            </aside>
          </>,
          document.body,
        )
      : null;

  return (
    <header className="header">
      {mobileDrawer}
      <div className="container header-container">
        <button
          type="button"
          className="header-burger"
          aria-label="Open menu"
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-primary-nav"
          onClick={() => setMobileNavOpen(true)}
        >
          <Menu size={22} strokeWidth={2} aria-hidden />
        </button>

        <div className="logo-group">
          <Link to="/" className="logo-link">
            <img src={logoImg} alt="raabta." className="header-logo-img" />
          </Link>
        </div>

        <div className="header-segments header-segments--desktop">
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              <NavLink
                to={category.id ? `/category/${category.id}` : '/'}
                end={!category.id}
                className={({ isActive }) => {
                  const customisationActive =
                    category.id === 'customisation' &&
                    (location.pathname.startsWith('/customisation/') ||
                      location.pathname === '/category/customisation');
                  const active =
                    category.id === 'customisation' ? customisationActive : isActive;
                  return `nav-link segment-link${active ? ' active' : ''}`;
                }}
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
            <Link to="/cart" className="cart-btn" aria-label={`Cart, ${totalItems} items`}>
              <span className="cart-btn-main">
                <ShoppingBag size={20} aria-hidden />
                <span className="cart-count">{totalItems}</span>
              </span>
              <span className="cart-label">Cart</span>
            </Link>

            {!isLoggedIn ? (
              <div className="auth-actions header-desktop-only">
                <Link to="/login" className="nav-link">
                  Log in
                </Link>
                <Link to="/signup" className="nav-link signup-btn">
                  Sign up
                </Link>
              </div>
            ) : null}

            <div className="profile-menu-wrap header-desktop-only" ref={profileMenuRef}>
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
