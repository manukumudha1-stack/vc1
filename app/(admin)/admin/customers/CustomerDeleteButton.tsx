'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from './customers.module.css';

interface Props {
  id: string;
  name: string;
  redirectAfter?: boolean;
}

export default function CustomerDeleteButton({ id, name, redirectAfter }: Props) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await fetch(`/api/customers/${id}`, { method: 'DELETE' });
    setShowDialog(false);
    setLoading(false);
    if (redirectAfter) {
      router.push('/admin/customers');
    } else {
      router.refresh();
    }
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className={styles.btnView}
        style={{ color: '#c0392b', borderColor: 'rgba(192,57,43,0.3)', background: 'rgba(192,57,43,0.05)' }}
      >
        Delete
      </button>

      {showDialog && (
        <ConfirmDialog
          title="Delete Customer"
          message={`"${name}" will be permanently deleted. This cannot be undone.`}
          confirmLabel={loading ? 'Deleting…' : 'Delete'}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
