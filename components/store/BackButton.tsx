'use client';

import { useRouter, usePathname } from 'next/navigation';

const HIDE_ON = new Set(['/', '/checkout']);

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (HIDE_ON.has(pathname)) return null;

  return (
    <div style={{ padding: '12px var(--margin-desktop, 48px) 0' }}>
      <button
        onClick={() => router.back()}
        aria-label="Go back"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          fontSize: 13,
          letterSpacing: '0.06em',
          padding: '4px 0',
          transition: 'color 0.2s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-text-primary)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--color-text-secondary)')}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back
      </button>
    </div>
  );
}
