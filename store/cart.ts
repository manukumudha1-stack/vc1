import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  qty: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem(item: CartItem): void;
  removeItem(productId: string): void;
  updateQty(productId: string, qty: number): void;
  clearCart(): void;
  total(): number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem(item: CartItem) {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, qty: i.qty + item.qty }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        });
      },

      removeItem(productId: string) {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQty(productId: string, qty: number) {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, qty } : i
          ),
        }));
      },

      clearCart() {
        set({ items: [] });
      },

      total() {
        return get().items.reduce((sum, i) => sum + i.price * i.qty, 0);
      },
    }),
    {
      name: 'vc-cart',
      storage: {
        getItem: (key) => {
          if (typeof window === 'undefined') return null;
          const val = localStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        },
        setItem: (key, value) => {
          if (typeof window !== 'undefined') {
            localStorage.setItem(key, JSON.stringify(value));
          }
        },
        removeItem: (key) => {
          if (typeof window !== 'undefined') {
            localStorage.removeItem(key);
          }
        },
      },
    }
  )
);

/* ---- Cart Drawer store ---- */
interface DrawerStore {
  open: boolean;
  openDrawer(): void;
  closeDrawer(): void;
}

export const useCartDrawerStore = create<DrawerStore>((set) => ({
  open: false,
  openDrawer: () => set({ open: true }),
  closeDrawer: () => set({ open: false }),
}));
