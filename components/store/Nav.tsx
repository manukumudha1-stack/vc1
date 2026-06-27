'use client';

import { useState, useEffect, useCallback, useRef, Fragment } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useCartStore } from '@/store/cart';
import { useCartDrawerStore } from '@/store/cart';
import styles from './Nav.module.css';

interface ProductHit {
  _id: string;
  name: string;
  slug: string;
  price: number;
}

const BACK_HIDE = new Set(['/', '/checkout']);

function isMongoId(s: string) { return /^[0-9a-f]{24}$/i.test(s); }

function buildCrumbs(pathname: string): { label: string; href?: string }[] {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return [];
  const crumbs: { label: string; href?: string }[] = [{ label: 'Home', href: '/' }];
  segments.forEach((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    const isLast = i === segments.length - 1;
    const label = isMongoId(seg)
      ? 'Details'
      : seg.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    crumbs.push({ label, href: isLast ? undefined : href });
  });
  return crumbs;
}

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const crumbs = buildCrumbs(pathname);

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
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

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
        {!BACK_HIDE.has(pathname) && (
          <button className={styles.backBtn} aria-label="Go back" onClick={() => router.back()}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
            </svg>
          </button>
        )}
        <div className={styles.inner}>

          {/* Left: breadcrumb */}
          <div className={styles.breadcrumbNav}>
            {crumbs.map((crumb, i) => (
              <Fragment key={i}>
                {i > 0 && <span className={styles.crumbSep}>›</span>}
                {crumb.href ? (
                  <Link href={crumb.href} className={styles.crumb}>{crumb.label}</Link>
                ) : (
                  <span className={styles.crumbCurrent}>{crumb.label}</span>
                )}
              </Fragment>
            ))}
          </div>

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
            <div ref={accountRef} style={{ position: 'relative' }}>
              <button
                className={styles.iconBtn}
                aria-label="Account"
                onClick={() => isSignedIn ? setAccountOpen(o => !o) : router.push('/auth/signin')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
              {isSignedIn && accountOpen && (
                <div className={styles.accountDropdown}>
                  <Link href="/account" className={styles.accountDropdownItem} onClick={() => setAccountOpen(false)}>
                    My Account
                  </Link>
                  <button
                    className={`${styles.accountDropdownItem} ${styles.accountDropdownSignOut}`}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

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
            background: '#FAF6EF',
            width: '100%', maxWidth: 640,
            borderRadius: 8,
            boxShadow: '0 20px 60px rgba(28,18,8,0.35)',
            border: '1px solid rgba(201,168,76,0.25)',
            overflow: 'hidden',
            margin: '0 16px',
          }}>
            <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', padding: '0 16px', borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8C7B6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
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
                  padding: '20px 14px',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  color: '#1C1208',
                }}
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8, color: '#8C7B6B', display: 'flex' }}
                aria-label="Close search"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </form>

            {/* Results */}
            {query.trim() && (
              <div>
                {searching && (
                  <p style={{ padding: '16px 20px', color: '#8C7B6B', fontSize: 14 }}>Searching…</p>
                )}
                {!searching && results.length === 0 && (
                  <p style={{ padding: '16px 20px', color: '#8C7B6B', fontSize: 14 }}>
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
                      padding: '14px 20px',
                      textDecoration: 'none', color: '#1C1208',
                      borderBottom: '1px solid rgba(201,168,76,0.12)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = '#F0E9DA')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ fontSize: 15 }}>{p.name}</span>
                    <span style={{ fontSize: 13, color: '#8C7B6B' }}>
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
          {isSignedIn ? (
            <>
              <Link href="/account" className={`serif ${styles.mobileNavLink}`} onClick={() => setMobileOpen(false)}>
                Account
              </Link>
              <button
                className={`serif ${styles.mobileNavLink} ${styles.mobileSignOut}`}
                onClick={() => { setMobileOpen(false); signOut({ callbackUrl: '/' }); }}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth/signin" className={`serif ${styles.mobileNavLink}`} onClick={() => setMobileOpen(false)}>
              Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}
