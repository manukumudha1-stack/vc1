'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import styles from '../products/products.module.css';

export default function LookbookDeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await fetch(`/api/lookbook/${id}`, { method: 'DELETE' });
    setShowDialog(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className={styles.btnEdit}
        style={{ color: '#c0392b', borderColor: 'rgba(192,57,43,0.3)', background: 'rgba(192,57,43,0.05)' }}
      >
        Delete
      </button>

      {showDialog && (
        <ConfirmDialog
          title="Delete Entry"
          message="This lookbook entry will be permanently deleted. This cannot be undone."
          confirmLabel={loading ? 'Deleting…' : 'Delete'}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
