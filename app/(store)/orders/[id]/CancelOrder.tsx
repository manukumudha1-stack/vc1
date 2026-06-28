'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  orderId: string;
  status: string;
}

const CANCELLABLE = ['pending', 'confirmed'];

export default function CancelOrder({ orderId, status }: Props) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  if (!CANCELLABLE.includes(status)) return null;

  async function handleCancel() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: 'POST' });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        setConfirming(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setConfirming(false);
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', margin: 0, textAlign: 'center' }}>
          Cancel this order? This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              padding: '12px 24px',
              borderRadius: '100px',
              border: '1px solid #c0392b',
              background: 'transparent',
              color: '#c0392b',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Cancelling…' : 'Yes, cancel'}
          </button>
          <button
            onClick={() => setConfirming(false)}
            disabled={loading}
            className="btn btn--outline"
            style={{ padding: '12px 24px' }}
          >
            Keep order
          </button>
        </div>
        {error && (
          <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <button
        onClick={() => setConfirming(true)}
        className="btn btn--outline"
      >
        Cancel Order
      </button>
      {error && (
        <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}
