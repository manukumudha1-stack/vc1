'use client';

import { useState } from 'react';
import styles from './order-detail.module.css';

interface Props {
  orderId: string;
  initialNotes: string;
}

export default function OrderNotes({ orderId, initialNotes }: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [saved, setSaved] = useState(initialNotes);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isDirty = notes !== saved;

  async function handleSave() {
    setSaving(true);
    setError('');
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSaved(notes);
    } catch {
      setError('Could not save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Notes</div>
      <textarea
        className={styles.notesTextarea}
        placeholder="Add delivery notes, internal remarks, or follow-up actions…"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={5}
      />
      {error && <p className={styles.notesError}>{error}</p>}
      <div className={styles.notesFooter}>
        <span className={styles.muted} style={{ fontSize: 12 }}>
          {notes.length} characters
        </span>
        <button
          className={styles.btnUpdate}
          onClick={handleSave}
          disabled={saving || !isDirty}
        >
          {saving ? 'Saving…' : 'Save Notes'}
        </button>
      </div>
    </div>
  );
}
