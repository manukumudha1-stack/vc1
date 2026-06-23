'use client';

import { useState } from 'react';
import styles from './GalleryClient.module.css';

interface GalleryImage {
  url?: string;
  caption?: string;
}

interface GalleryClientProps {
  images: GalleryImage[];
  productName: string;
}

export default function GalleryClient({ images, productName }: GalleryClientProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  // Ensure at least 5 placeholder images
  const gallery: GalleryImage[] = images.length > 0
    ? images
    : Array.from({ length: 5 }, (_, i) => ({ caption: `${productName} — View ${i + 1}` }));

  return (
    <div className={styles.gallery}>
      {/* Thumbnails */}
      <div className={styles.thumbs}>
        {gallery.map((img, i) => (
          <button
            key={i}
            className={`${styles.thumb} ${activeIdx === i ? styles.thumbActive : ''}`}
            onClick={() => setActiveIdx(i)}
            aria-label={img.caption ?? `View ${i + 1}`}
          >
            <div className={`ph ${styles.thumbPh}`}>
              {img.url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img.url} alt={img.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main stage */}
      <div className={styles.stage}>
        <div className={`ph ${styles.stagePh}`}>
          {gallery[activeIdx]?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gallery[activeIdx].url}
              alt={gallery[activeIdx]?.caption ?? productName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          )}
          {gallery[activeIdx]?.caption && (
            <span className="ph__cap">{gallery[activeIdx].caption}</span>
          )}
        </div>

        {/* Prev/Next arrows */}
        {gallery.length > 1 && (
          <>
            <button
              className={`${styles.arrow} ${styles.arrowPrev}`}
              onClick={() => setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length)}
              aria-label="Previous image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button
              className={`${styles.arrow} ${styles.arrowNext}`}
              onClick={() => setActiveIdx((i) => (i + 1) % gallery.length)}
              aria-label="Next image"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
