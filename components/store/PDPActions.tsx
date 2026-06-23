'use client';

import { useState } from 'react';
import { useCartStore, useCartDrawerStore } from '@/store/cart';

interface PDPActionsProps {
  productId: string;
  name: string;
  sku: string;
  price: number;
  imageUrl?: string;
}

export default function PDPActions({ productId, name, sku, price, imageUrl }: PDPActionsProps) {
  const [wishlisted, setWishlisted] = useState(false);
  const addItem    = useCartStore((s) => s.addItem);
  const openDrawer = useCartDrawerStore((s) => s.openDrawer);

  function handleAddToBag() {
    addItem({ productId, name, sku, price, qty: 1, image: imageUrl });
    openDrawer();
  }

  return (
    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
      <button className="btn btn--gold" style={{ flex: 1 }} onClick={handleAddToBag}>
        Add to Bag
      </button>
      <button
        className="btn btn--outline"
        style={{ padding: '16px 20px' }}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        onClick={() => setWishlisted((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
      </button>
    </div>
  );
}
