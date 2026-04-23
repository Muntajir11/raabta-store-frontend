import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import './Header.css';
import logoImg from '../../assets/raabta/YOUR - 2.JPG.jpeg';
import {
  AUTH_EVENT_NAME,
  authLogout,
  authSession,
} from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { avatarDataUrlFromSeed, randomAvatarDataUrl } from '../../lib/avatar';

const Header: React.FC = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const avatarSrc = useRef<string>(randomAvatarDataUrl());
  const { totalItems } = useCart();
  const categories = [
    { id: '', label: 'Home' },
    { id: 'anime', label: 'Anime' },
    { id: 'gaming', label: 'Gaming' },
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
        if (session?.avatarSeed) {
          avatarSrc.current = avatarDataUrlFromSeed(session.avatarSeed);
        } else {
          avatarSrc.current = randomAvatarDataUrl();
        }
      } catch {
        setIsLoggedIn(false);
        avatarSrc.current = randomAvatarDataUrl();
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
                {isLoggedIn ? (
                  <div className="mobile-nav-block">
                    <p className="mobile-nav-block-label">Account</p>
                    <Link
                      to="/account"
                      className="nav-link segment-link mobile-nav-segment mobile-nav-link"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      My account
                    </Link>
                    <Link
                      to="/orders"
                      className="nav-link segment-link mobile-nav-segment mobile-nav-link"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      My orders
                    </Link>
                    <Link
                      to="/wishlist"
                      className="nav-link segment-link mobile-nav-segment mobile-nav-link"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      to="/settings"
                      className="nav-link segment-link mobile-nav-segment mobile-nav-link"
                      onClick={() => setMobileNavOpen(false)}
                    >
                      Settings
                    </Link>
                  </div>
                ) : (
                  <div className="mobile-nav-block">
                    <p className="mobile-nav-block-label">Account</p>
                    <div className="auth-segmented auth-segmented--mobile" role="group" aria-label="Auth">
                      <NavLink
                        to="/login"
                        className={({ isActive }) => `auth-pill${isActive ? ' auth-pill--active' : ''}`}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        Log in
                      </NavLink>
                      <NavLink
                        to="/signup"
                        className={({ isActive }) => `auth-pill${isActive ? ' auth-pill--active' : ''}`}
                        onClick={() => setMobileNavOpen(false)}
                      >
                        Sign up
                      </NavLink>
                    </div>
                  </div>
                )}
                {isLoggedIn ? (
                  <div className="mobile-nav-block">
                    <button
                      type="button"
                      className="nav-link segment-link mobile-nav-segment mobile-nav-link mobile-nav-logout"
                      onClick={() => void handleLogout()}
                    >
                      Log out
                    </button>
                  </div>
                ) : null}
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
              <div className="auth-segmented header-desktop-only" role="group" aria-label="Auth">
                <NavLink
                  to="/login"
                  className={({ isActive }) => `auth-pill${isActive ? ' auth-pill--active' : ''}`}
                >
                  Log in
                </NavLink>
                <NavLink
                  to="/signup"
                  className={({ isActive }) => `auth-pill${isActive ? ' auth-pill--active' : ''}`}
                >
                  Sign up
                </NavLink>
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
                <img className="profile-avatar" src={avatarSrc.current} alt="" aria-hidden />
              </button>

              {isProfileMenuOpen ? (
                <div className="profile-menu-card" role="menu" aria-label="Profile menu">
                  {isLoggedIn ? (
                    <>
                      <Link to="/account" className="profile-menu-item" role="menuitem">
                        My Account
                      </Link>
                      <Link to="/orders" className="profile-menu-item" role="menuitem">
                        My orders
                      </Link>
                      <Link to="/wishlist" className="profile-menu-item" role="menuitem">
                        Wishlist
                      </Link>
                      <Link to="/settings" className="profile-menu-item" role="menuitem">
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
