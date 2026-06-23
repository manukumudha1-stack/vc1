'use client';

import { useState, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './FilterSidebar.module.css';

const COLOR_SWATCHES = [
  { label: 'Temple Red',   value: 'temple-red',   hex: '#8B1A1A' },
  { label: 'Gold',         value: 'gold',          hex: '#C9A84C' },
  { label: 'Ivory',        value: 'ivory',         hex: '#FFF8EE' },
  { label: 'Peacock Teal', value: 'peacock-teal',  hex: '#1A6B6B' },
  { label: 'Midnight Blue',value: 'midnight-blue', hex: '#1a2a5e' },
  { label: 'Mauve',        value: 'mauve',         hex: '#8B6B8B' },
  { label: 'Forest Green', value: 'forest-green',  hex: '#3B5E3B' },
  { label: 'Blush Pink',   value: 'blush',         hex: '#E8A0A0' },
];

const PRICE_RANGES = [
  { label: 'Under ₹15,000',  value: '0-15000' },
  { label: '₹15,000 – ₹30,000', value: '15000-30000' },
  { label: '₹30,000 – ₹60,000', value: '30000-60000' },
  { label: 'Above ₹60,000', value: '60000-999999' },
];

const ZARI_TYPES = ['Pure Gold Zari', 'Silver Zari', 'Copper Zari', 'Synthetic Zari'];
const OCCASIONS  = ['Bridal', 'Wedding', 'Festive', 'Casual', 'Office'];
const REGIONS    = ['Kanchipuram', 'Varanasi', 'Chanderi', 'Bhagalpur', 'Mysore'];

function FilterGroup({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.group}>
      <button className={styles.groupHead} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span className={styles.groupTitle}>{title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={open ? styles.chevronOpen : styles.chevron}
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && <div className={styles.groupBody}>{children}</div>}
    </div>
  );
}

export default function FilterSidebar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const getParam  = (key: string) => searchParams.get(key) ?? '';
  const getParams = (key: string) => searchParams.getAll(key);

  const updateParam = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const toggleMultiParam = useCallback((key: string, value: string) => {
    const params   = new URLSearchParams(searchParams.toString());
    const existing = params.getAll(key);
    params.delete(key);
    if (existing.includes(value)) {
      existing.filter((v) => v !== value).forEach((v) => params.append(key, v));
    } else {
      [...existing, value].forEach((v) => params.append(key, v));
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const activeColors   = getParams('color');
  const activePrice    = getParam('price');
  const activeZari     = getParams('zari');
  const activeOccasion = getParams('occasion');
  const activeRegion   = getParams('region');

  const hasFilters = activeColors.length > 0 || activePrice || activeZari.length > 0 || activeOccasion.length > 0 || activeRegion.length > 0;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHead}>
        <span className="eyebrow">Filters</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={clearAll}>
            Clear all
          </button>
        )}
      </div>

      {/* Color */}
      <FilterGroup title="Colour">
        <div className={styles.swatches}>
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c.value}
              className={`${styles.swatch} ${activeColors.includes(c.value) ? styles.swatchActive : ''}`}
              style={{ background: c.hex }}
              title={c.label}
              aria-label={`${c.label}${activeColors.includes(c.value) ? ' (selected)' : ''}`}
              onClick={() => toggleMultiParam('color', c.value)}
            />
          ))}
        </div>
      </FilterGroup>

      <hr className="hairline-rule" />

      {/* Price */}
      <FilterGroup title="Price Range">
        <ul className={styles.checkList}>
          {PRICE_RANGES.map((r) => (
            <li key={r.value}>
              <label className={styles.checkLabel}>
                <input
                  type="radio"
                  name="price"
                  className={styles.checkInput}
                  checked={activePrice === r.value}
                  onChange={() => updateParam('price', activePrice === r.value ? '' : r.value)}
                />
                <span className={styles.checkText}>{r.label}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <hr className="hairline-rule" />

      {/* Zari */}
      <FilterGroup title="Zari Type">
        <ul className={styles.checkList}>
          {ZARI_TYPES.map((z) => (
            <li key={z}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkInput}
                  checked={activeZari.includes(z)}
                  onChange={() => toggleMultiParam('zari', z)}
                />
                <span className={styles.checkText}>{z}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <hr className="hairline-rule" />

      {/* Occasion */}
      <FilterGroup title="Occasion">
        <ul className={styles.checkList}>
          {OCCASIONS.map((o) => (
            <li key={o}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkInput}
                  checked={activeOccasion.includes(o)}
                  onChange={() => toggleMultiParam('occasion', o)}
                />
                <span className={styles.checkText}>{o}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <hr className="hairline-rule" />

      {/* Region */}
      <FilterGroup title="Region" defaultOpen={false}>
        <ul className={styles.checkList}>
          {REGIONS.map((r) => (
            <li key={r}>
              <label className={styles.checkLabel}>
                <input
                  type="checkbox"
                  className={styles.checkInput}
                  checked={activeRegion.includes(r)}
                  onChange={() => toggleMultiParam('region', r)}
                />
                <span className={styles.checkText}>{r}</span>
              </label>
            </li>
          ))}
        </ul>
      </FilterGroup>
    </aside>
  );
}
