'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import styles from './ProductCard.module.css';

interface ProductCardProps {
  name: string;
  slug: string;
  price: number;
  meta?: string;
  pill?: string;
  pillVariant?: 'silk' | 'cotton' | 'crepe';
  imageCaption?: string;
  urgency?: number;
}

export default function ProductCard({
  name,
  slug,
  price,
  meta,
  pill,
  pillVariant = 'silk',
  imageCaption,
  urgency,
}: ProductCardProps) {
  const [wishlisted, setWishlisted] = useState(false);

  return (
    <article className={styles.card}>
      <Link href={`/products/${slug}`} className={styles.imageWrap} tabIndex={-1} aria-hidden="true">
        {/* Primary placeholder */}
        <div className={`ph ${styles.ph}`}>
          {imageCaption && <span className="ph__cap">{imageCaption}</span>}
        </div>
        {/* Hover second image */}
        <div className={`ph ${styles.phHover}`} aria-hidden="true" />
      </Link>

      {/* Wishlist */}
      <button
        className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
        onClick={() => setWishlisted((v) => !v)}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>

      <div className={styles.body}>
        {/* Urgency badge */}
        {urgency !== undefined && urgency > 0 && urgency <= 3 && (
          <span className={`badge badge--low ${styles.urgency}`}>
            Only {urgency} left
          </span>
        )}

        <Link href={`/products/${slug}`} className={styles.nameLink}>
          <h3 className={`serif ${styles.name}`}>{name}</h3>
        </Link>

        {meta && <p className={`caption ${styles.meta}`}>{meta}</p>}

        <div className={styles.row}>
          <span className="price">{formatINR(price)}</span>
          {pill && (
            <span className={`pill pill--${pillVariant}`}>{pill}</span>
          )}
        </div>
      </div>
    </article>
  );
}
