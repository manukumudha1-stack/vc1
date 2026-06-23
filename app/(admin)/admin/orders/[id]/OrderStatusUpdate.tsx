'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './order-detail.module.css';

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

interface Props {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusUpdate({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleUpdate() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update status');
      }
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      {error && (
        <div style={{ marginBottom: 10, fontSize: 12, color: '#8B1A1A' }}>{error}</div>
      )}
      <div className={styles.statusForm}>
        <select
          className={styles.select}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUSES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button
          className={styles.btnUpdate}
          onClick={handleUpdate}
          disabled={saving || status === currentStatus}
        >
          {saving ? 'Saving…' : 'Update Status'}
        </button>
      </div>
    </div>
  );
}
