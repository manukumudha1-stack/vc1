'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import styles from './FilterSidebar.module.css';

const PRICE_MIN = 0;
const PRICE_MAX = 100000;
const STEP = 500;

function fmtPrice(val: number) {
  if (val >= PRICE_MAX) return '₹1,00,000+';
  return '₹' + val.toLocaleString('en-IN');
}

function parsePrice(str: string): [number, number] {
  const [a, b] = str.split('-').map(Number);
  if (!isNaN(a) && !isNaN(b)) return [a, b];
  return [PRICE_MIN, PRICE_MAX];
}

function FilterGroup({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={styles.group}>
      <button className={styles.groupHead} onClick={() => setOpen(v => !v)} aria-expanded={open}>
        <span className={styles.groupTitle}>{title}</span>
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round"
          className={open ? styles.chevronOpen : styles.chevron}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className={styles.groupBody}>{children}</div>}
    </div>
  );
}

interface Props {
  collections?: { slug: string; name: string }[];
  currentSlug?: string;
}

export default function FilterSidebar({ collections = [], currentSlug }: Props) {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const priceParam = searchParams.get('price') ?? '';
  const [initMin, initMax] = priceParam ? parsePrice(priceParam) : [PRICE_MIN, PRICE_MAX];

  const [localMin, setLocalMin] = useState(initMin);
  const [localMax, setLocalMax] = useState(initMax);

  useEffect(() => {
    const [min, max] = priceParam ? parsePrice(priceParam) : [PRICE_MIN, PRICE_MAX];
    setLocalMin(min);
    setLocalMax(max);
  }, [priceParam]);

  const applyPrice = useCallback((min: number, max: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (min === PRICE_MIN && max === PRICE_MAX) {
      params.delete('price');
    } else {
      params.set('price', `${min}-${max}`);
    }
    router.push(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  const clearAll = useCallback(() => {
    router.push(pathname);
  }, [router, pathname]);

  const isPriceFiltered = priceParam && priceParam !== `${PRICE_MIN}-${PRICE_MAX}`;
  const hasFilters = !!isPriceFiltered;

  const minPct = ((localMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;
  const maxPct = ((localMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHead}>
        <span className="eyebrow">Filters</span>
        {hasFilters && (
          <button className={styles.clearAll} onClick={clearAll}>Clear all</button>
        )}
      </div>

      {/* Price Range */}
      <FilterGroup title="Price Range">
        {/* Live value display */}
        <div className={styles.priceValues}>
          <span className={styles.priceValue}>{fmtPrice(localMin)}</span>
          <span className={styles.priceDash}>–</span>
          <span className={styles.priceValue}>{fmtPrice(localMax)}</span>
        </div>

        {/* Dual range slider */}
        <div className={styles.sliderWrap}>
          <div className={styles.sliderTrack} />
          <div
            className={styles.sliderFill}
            style={{ left: `${minPct}%`, width: `${maxPct - minPct}%` }}
          />
          <input
            type="range"
            min={PRICE_MIN} max={PRICE_MAX} step={STEP}
            value={localMin}
            className={styles.sliderInput}
            onChange={e => setLocalMin(Math.min(Number(e.target.value), localMax - STEP))}
            onMouseUp={() => applyPrice(localMin, localMax)}
            onTouchEnd={() => applyPrice(localMin, localMax)}
          />
          <input
            type="range"
            min={PRICE_MIN} max={PRICE_MAX} step={STEP}
            value={localMax}
            className={styles.sliderInput}
            onChange={e => setLocalMax(Math.max(Number(e.target.value), localMin + STEP))}
            onMouseUp={() => applyPrice(localMin, localMax)}
            onTouchEnd={() => applyPrice(localMin, localMax)}
          />
        </div>

        <div className={styles.sliderLabels}>
          <span>₹0</span>
          <span>₹1,00,000</span>
        </div>
      </FilterGroup>

      {/* Collections */}
      {collections.length > 0 && (
        <>
          <hr className="hairline-rule" />
          <FilterGroup title="Collection">
            <ul className={styles.checkList}>
              {collections.map(col => (
                <li key={col.slug}>
                  <label className={styles.checkLabel}>
                    <input
                      type="radio"
                      name="collection"
                      className={styles.checkInput}
                      checked={currentSlug === col.slug}
                      onChange={() => router.push(`/collections/${col.slug}`)}
                    />
                    <span className={styles.checkText}>{col.name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </FilterGroup>
        </>
      )}
    </aside>
  );
}
