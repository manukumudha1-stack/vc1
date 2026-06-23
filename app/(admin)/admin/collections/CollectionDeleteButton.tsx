'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import collStyles from './collections.module.css';

export default function CollectionDeleteButton({
  slug,
  productCount,
}: {
  slug: string;
  productCount: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete collection "${slug}"? This cannot be undone.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/collections/${slug}`, { method: 'DELETE' });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      className={collStyles.btnDelete}
      disabled={productCount > 0 || loading}
      title={productCount > 0 ? `Cannot delete: ${productCount} product(s) in this collection` : 'Delete collection'}
      onClick={handleDelete}
    >
      {loading ? '…' : 'Delete'}
    </button>
  );
}
