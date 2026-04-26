import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import './Header.css';
import {
  AUTH_EVENT_NAME,
  authLogout,
  authSession,
  hasAuthHint,
} from '../../lib/api';
import { useCart } from '../../lib/cart-context';
import { avatarDataUrlFromSeed, randomAvatarDataUrl } from '../../lib/avatar';

const Header: React.FC = () => {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profileMenuOpenedAtPath, setProfileMenuOpenedAtPath] = useState<string>('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileNavOpenedAtPath, setMobileNavOpenedAtPath] = useState<string>('');
  const [query, setQuery] = useState('');
  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>(() => randomAvatarDataUrl());
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
      if (!hasAuthHint()) {
        setIsLoggedIn(false);
        setAvatarUrl(randomAvatarDataUrl());
        return;
      }
      try {
        const session = await authSession();
        setIsLoggedIn(Boolean(session));
        if (session?.avatarSeed) {
          setAvatarUrl(avatarDataUrlFromSeed(session.avatarSeed));
        } else {
          setAvatarUrl(randomAvatarDataUrl());
        }
      } catch {
        setIsLoggedIn(false);
        setAvatarUrl(randomAvatarDataUrl());
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

  const isMobileNavVisible = mobileNavOpen && mobileNavOpenedAtPath === location.pathname;
  const isProfileMenuVisible = isProfileMenuOpen && profileMenuOpenedAtPath === location.pathname;

  useEffect(() => {
    if (!isMobileNavVisible) return;
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
  }, [isMobileNavVisible]);

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

  const activeSegmentId = useMemo(() => {
    if (location.pathname === '/') return '';
    const m = location.pathname.match(/^\/category\/([^/]+)/);
    return m?.[1] ?? null;
  }, [location.pathname]);

  const mobileDrawer =
    typeof document !== 'undefined'
      ? createPortal(
          <>
            <div
              className={`mobile-nav-backdrop${isMobileNavVisible ? ' is-open' : ''}`}
              aria-hidden={!isMobileNavVisible}
              onClick={() => setMobileNavOpen(false)}
            />
            <aside
              className={`mobile-nav-drawer${isMobileNavVisible ? ' is-open' : ''}`}
              id="mobile-primary-nav"
              aria-hidden={!isMobileNavVisible}
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
        <div className="header-left">
          <div className="logo-group">
            <Link to="/" className="logo-link header-wordmark" aria-label="Raabta home">
              raabta<span aria-hidden>.</span>
            </Link>
          </div>

          <button
            type="button"
            className="header-burger"
            aria-label="Open menu"
            aria-expanded={isMobileNavVisible}
            aria-controls="mobile-primary-nav"
            onClick={() => {
              setMobileNavOpenedAtPath(location.pathname);
              setMobileNavOpen(true);
            }}
          >
            <Menu size={22} strokeWidth={2} aria-hidden />
          </button>
        </div>

        <nav className="header-segments header-segments--desktop" aria-label="Shop sections">
          {categories.map((category) => (
            <NavLink
              key={category.id || 'home-desktop'}
              to={category.id ? `/category/${category.id}` : '/'}
              end={!category.id}
              className={({ isActive }) => segmentClass({ isActive }, category.id)}
              aria-current={activeSegmentId === category.id ? 'page' : undefined}
            >
              {category.label}
            </NavLink>
          ))}
        </nav>

        <div className="header-right">
          <div className="header-search">
            <div className="search-wrapper">
              <Search size={18} className="search-icon" />
              <input
                type="search"
                placeholder="Search products…"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
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

            {isLoggedIn ? (
              <div className="profile-menu-wrap header-desktop-only" ref={profileMenuRef}>
                <button
                  className="profile-btn"
                  type="button"
                  aria-label="Profile"
                  aria-expanded={isProfileMenuVisible}
                  onClick={() =>
                    setIsProfileMenuOpen((prev) => {
                      if (!prev) setProfileMenuOpenedAtPath(location.pathname);
                      return !prev;
                    })
                  }
                >
                  <img className="profile-avatar" src={avatarUrl} alt="" aria-hidden />
                </button>

                {isProfileMenuVisible ? (
                  <div className="profile-menu-card" role="menu" aria-label="Profile menu">
                    <Link to="/account" className="profile-menu-item" role="menuitem">
                      My account
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
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
