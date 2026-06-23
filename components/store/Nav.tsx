'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart';
import { useCartDrawerStore } from '@/store/cart';
import styles from './Nav.module.css';

interface ProductHit {
  _id: string;
  name: string;
  slug: string;
  price: number;
}

export default function Nav() {
  const router = useRouter();

  const [scrolled, setScrolled]       = useState(false);
  const [mobileOpen, setMobileOpen]   = useState(false);
  const [theme, setTheme]             = useState<'day' | 'night'>('day');

  // Search state
  const [searchOpen, setSearchOpen]   = useState(false);
  const [query, setQuery]             = useState('');
  const [results, setResults]         = useState<ProductHit[]>([]);
  const [searching, setSearching]     = useState(false);
  const searchInputRef                = useRef<HTMLInputElement>(null);
  const searchTimerRef                = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cartCount  = useCartStore((s) => s.items.length);
  const openDrawer = useCartDrawerStore((s) => s.openDrawer);

  /* Scroll detection */
  useEffect(() => {
    const threshold = window.innerHeight * 0.7;
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Sync theme */
  useEffect(() => {
    const stored = document.documentElement.getAttribute('data-theme');
    if (stored === 'night') setTheme('night');
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'day' ? 'night' : 'day';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
  }, [theme]);

  /* Lock scroll when mobile nav or search open */
  useEffect(() => {
    document.body.style.overflow = (mobileOpen || searchOpen) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen, searchOpen]);

  /* Focus search input when overlay opens */
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [searchOpen]);

  /* Debounced search */
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    if (!query.trim()) { setResults([]); return; }

    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res  = await fetch(`/api/products?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        setResults(data.products ?? []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [query]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchOpen(false);
    router.push(`/collections?q=${encodeURIComponent(query.trim())}`);
  }

  function handleResultClick() {
    setSearchOpen(false);
  }

  /* Close search on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>

          {/* Left: empty placeholder for symmetry */}
          <ul className={styles.links} />

          {/* Centre: logo */}
          <Link href="/" className={styles.logo} aria-label="VC — Home">
            <span className={`serif ${styles.logoText}`}>VC</span>
          </Link>

          {/* Right: icons */}
          <div className={styles.icons}>
            {/* Search */}
            <button className={styles.iconBtn} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </button>

            {/* Theme toggle */}
            <button className={styles.iconBtn} aria-label="Toggle theme" onClick={toggleTheme}>
              {theme === 'day' ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </button>

            {/* Account */}
            <Link href="/account" className={styles.iconBtn} aria-label="Account">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </Link>

            {/* Cart */}
            <button className={styles.iconBtn} aria-label="Cart" onClick={openDrawer}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>

            {/* Mobile burger */}
            <button
              className={styles.burger}
              aria-label="Menu"
              onClick={() => setMobileOpen(true)}
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      {searchOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            paddingTop: 80,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setSearchOpen(false); }}
        >
          <div style={{
            background: 'var(--color-surface)',
            width: '100%', maxWidth: 640,
            borderRadius: 4,
            boxShadow: '0 8px 40px rgba(0,0,0,0.18)',
            overflow: 'hidden',
            margin: '0 16px',
          }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', padding: '0 16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, opacity: 0.5 }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={searchInputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search sarees, fabric, region…"
                style={{
                  flex: 1,
                  border: 'none', outline: 'none',
                  background: 'transparent',
                  padding: '18px 12px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  color: 'var(--color-text)',
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, opacity: 0.5 }}
                aria-label="Close search"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </form>

            {/* Results */}
            {query.trim() && (
              <div style={{ borderTop: '1px solid var(--color-border)' }}>
                {searching && (
                  <p style={{ padding: '16px 20px', color: 'var(--color-text-muted)', fontSize: 14 }}>Searching…</p>
                )}
                {!searching && results.length === 0 && (
                  <p style={{ padding: '16px 20px', color: 'var(--color-text-muted)', fontSize: 14 }}>
                    No results for &ldquo;{query}&rdquo;
                  </p>
                )}
                {!searching && results.map((p) => (
                  <Link
                    key={p._id}
                    href={`/products/${p.slug}`}
                    onClick={handleResultClick}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 20px',
                      textDecoration: 'none', color: 'inherit',
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-surface-warm)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 15 }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                      ₹{p.price.toLocaleString('en-IN')}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className={styles.mobileOverlay}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <div className={`${styles.mobileDrawer} ${mobileOpen ? styles.mobileDrawerOpen : ''}`}>
        <div className={styles.mobileDrawerHead}>
          <span className={`serif ${styles.logoText}`}>VC</span>
          <button
            className={styles.closeBtn}
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <nav className={styles.mobileLinks}>
          <Link href="/collections" className={`serif ${styles.mobileNavLink}`} onClick={() => setMobileOpen(false)}>
            Collections
          </Link>
          <Link href="/account" className={`serif ${styles.mobileNavLink}`} onClick={() => setMobileOpen(false)}>
            Account
          </Link>
        </nav>
      </div>
    </>
  );
}
