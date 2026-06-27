import { create } from 'zustand';

interface WishlistStore {
  productIds: string[];
  initialized: boolean;
  init: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  productIds: [],
  initialized: false,

  async init() {
    if (get().initialized) return;
    try {
      const res = await fetch('/api/wishlist');
      if (res.ok) {
        const data = await res.json() as { productIds: string[] };
        set({ productIds: data.productIds, initialized: true });
      } else {
        // Mark initialized so we don't keep retrying; user just isn't signed in
        set({ initialized: true });
      }
    } catch {
      set({ initialized: true });
    }
  },

  async toggle(productId: string) {
    if (!get().initialized) await get().init();
    const prev = get().productIds;
    const next = prev.includes(productId)
      ? prev.filter((id) => id !== productId)
      : [...prev, productId];
    set({ productIds: next });
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        // Server rejected the request — roll back the optimistic update
        set({ productIds: prev });
        console.error('[wishlist] POST failed', res.status);
      } else {
        // Sync with the server's authoritative list
        const data = await res.json() as { productIds: string[] };
        set({ productIds: data.productIds });
      }
    } catch {
      set({ productIds: prev });
    }
  },
}));
