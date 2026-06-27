'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === '/admin') return null;

  return (
    <div style={{ padding: '24px 32px 0' }}>
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
          color: '#6b7280',
          fontSize: 13,
          padding: 0,
          transition: 'color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
        onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"/>
          <polyline points="12 19 5 12 12 5"/>
        </svg>
        Back
      </button>
    </div>
  );
}
