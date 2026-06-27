'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import collStyles from './collections.module.css';

export default function CollectionDeleteButton({
  slug,
  productCount,
}: {
  slug: string;
  productCount: number;
}) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await fetch(`/api/collections/${slug}`, { method: 'DELETE' });
    setShowDialog(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <>
      <button
        className={collStyles.btnDelete}
        disabled={loading}
        onClick={() => setShowDialog(true)}
      >
        {loading ? '…' : 'Delete'}
      </button>

      {showDialog && (
        <ConfirmDialog
          title="Delete Collection"
          message={
            productCount > 0
              ? `This collection has ${productCount} product(s). They will be unlinked but not deleted. The collection itself will be permanently removed.`
              : `Collection "${slug}" will be permanently deleted. This cannot be undone.`
          }
          confirmLabel={loading ? 'Deleting…' : 'Delete'}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
