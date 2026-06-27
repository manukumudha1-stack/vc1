'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [lightbox, setLightbox] = useState(false);

  // Ensure at least 5 placeholder images
  const gallery: GalleryImage[] = images.length > 0
    ? images
    : Array.from({ length: 5 }, (_, i) => ({ caption: `${productName} — View ${i + 1}` }));

  const prev = useCallback(() => setActiveIdx(i => (i - 1 + gallery.length) % gallery.length), [gallery.length]);
  const next = useCallback(() => setActiveIdx(i => (i + 1) % gallery.length), [gallery.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, prev, next]);

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
                <img src={img.url} alt={img.caption ?? ''} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Main stage */}
      <div className={styles.stage}>
        <div
          className={`ph ${styles.stagePh} ${styles.stageClickable}`}
          onClick={() => gallery[activeIdx]?.url && setLightbox(true)}
          title="Click to zoom"
        >
          {gallery[activeIdx]?.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gallery[activeIdx].url}
              alt={gallery[activeIdx]?.caption ?? productName}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
          {gallery[activeIdx]?.caption && (
            <span className="ph__cap">{gallery[activeIdx].caption}</span>
          )}
        </div>

        {/* Zoom hint */}
        {gallery[activeIdx]?.url && (
          <button
            className={styles.zoomBtn}
            onClick={() => setLightbox(true)}
            aria-label="Zoom image"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </button>
        )}

        {/* Prev/Next arrows */}
        {gallery.length > 1 && (
          <>
            <button className={`${styles.arrow} ${styles.arrowPrev}`} onClick={prev} aria-label="Previous image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <button className={`${styles.arrow} ${styles.arrowNext}`} onClick={next} aria-label="Next image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className={styles.lightboxBackdrop} onClick={() => setLightbox(false)}>
          <div className={styles.lightboxInner} onClick={e => e.stopPropagation()}>
            {/* Close */}
            <button className={styles.lightboxClose} onClick={() => setLightbox(false)} aria-label="Close zoom">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery[activeIdx]?.url}
              alt={gallery[activeIdx]?.caption ?? productName}
              className={styles.lightboxImg}
            />

            {/* Counter */}
            <p className={styles.lightboxCounter}>{activeIdx + 1} / {gallery.length}</p>

            {/* Arrows */}
            {gallery.length > 1 && (
              <>
                <button className={`${styles.arrow} ${styles.lightboxPrev}`} onClick={prev} aria-label="Previous image">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                </button>
                <button className={`${styles.arrow} ${styles.lightboxNext}`} onClick={next} aria-label="Next image">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
