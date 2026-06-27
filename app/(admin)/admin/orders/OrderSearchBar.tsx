'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import styles from './orders.module.css';

interface Props {
  q: string;
  from: string;
  to: string;
}

export default function OrderSearchBar({ q: initQ, from: initFrom, to: initTo }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ]       = useState(initQ);
  const [from, setFrom] = useState(initFrom);
  const [to, setTo]     = useState(initTo);

  useEffect(() => { setQ(initQ); },    [initQ]);
  useEffect(() => { setFrom(initFrom); }, [initFrom]);
  useEffect(() => { setTo(initTo); },  [initTo]);

  function apply(overrides?: { q?: string; from?: string; to?: string }) {
    const params = new URLSearchParams(searchParams.toString());
    const qVal    = overrides?.q    ?? q;
    const fromVal = overrides?.from ?? from;
    const toVal   = overrides?.to   ?? to;

    qVal    ? params.set('q', qVal)       : params.delete('q');
    fromVal ? params.set('from', fromVal) : params.delete('from');
    toVal   ? params.set('to', toVal)     : params.delete('to');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearAll() {
    setQ(''); setFrom(''); setTo('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.delete('from');
    params.delete('to');
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`);
  }

  // Check both local state AND URL — URL may still have filter after user clears input
  const urlHasFilters = !!(searchParams.get('q') || searchParams.get('from') || searchParams.get('to'));
  const hasFilters = urlHasFilters || !!(q || from || to);

  return (
    <div className={styles.searchBar}>
      {/* Text search */}
      <div className={styles.searchField}>
        <svg className={styles.searchIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Name, phone, email or SKU…"
          value={q}
          onChange={e => {
            const val = e.target.value;
            setQ(val);
            if (val === '') apply({ q: '' }); // auto-apply when cleared via backspace
          }}
          onKeyDown={e => e.key === 'Enter' && apply()}
        />
        {q && (
          <button className={styles.clearInput} onClick={() => { setQ(''); apply({ q: '' }); }} aria-label="Clear">
            ×
          </button>
        )}
      </div>

      {/* Date range */}
      <div className={styles.dateRange}>
        <input
          className={styles.dateInput}
          type="date"
          value={from}
          max={to || undefined}
          onChange={e => { setFrom(e.target.value); apply({ from: e.target.value }); }}
        />
        <span className={styles.dateSep}>to</span>
        <input
          className={styles.dateInput}
          type="date"
          value={to}
          min={from || undefined}
          onChange={e => { setTo(e.target.value); apply({ to: e.target.value }); }}
        />
      </div>

      {/* Search + Clear */}
      <button className={styles.btnSearch} onClick={() => apply()}>
        Search
      </button>

      {hasFilters && (
        <button className={styles.btnClear} onClick={clearAll}>
          Clear
        </button>
      )}
    </div>
  );
}
