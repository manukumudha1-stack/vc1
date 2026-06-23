'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useCartStore, useCartDrawerStore } from '@/store/cart';
import { formatINR } from '@/lib/utils';
import styles from './CartDrawer.module.css';

export default function CartDrawer() {
  const open        = useCartDrawerStore((s) => s.open);
  const closeDrawer = useCartDrawerStore((s) => s.closeDrawer);

  const items     = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQty  = useCartStore((s) => s.updateQty);
  const total      = useCartStore((s) => s.total);

  /* Lock scroll when open */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${open ? styles.backdropVisible : ''}`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${open ? styles.drawerOpen : ''}`}
        aria-label="Shopping cart"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className={styles.head}>
          <h2 className={`serif ${styles.title}`}>Your Bag</h2>
          <span className={styles.count}>{items.length} {items.length === 1 ? 'item' : 'items'}</span>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Close cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <hr className="hairline-rule" />

        {/* Body */}
        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={styles.emptyIcon}>
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
                <line x1="3" y1="6" x2="21" y2="6"/>
                <path d="M16 10a4 4 0 0 1-8 0"/>
              </svg>
              <p className={`serif ${styles.emptyTitle}`}>Your bag is empty</p>
              <p className={styles.emptyText}>Discover our handcrafted sarees</p>
              <button className="btn btn--outline" style={{ marginTop: 24 }} onClick={closeDrawer}>
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className={styles.itemList}>
              {items.map((item) => (
                <li key={item.productId} className={styles.item}>
                  {/* Placeholder image */}
                  <div className={`ph ${styles.itemImage}`}>
                    {item.image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  <div className={styles.itemDetails}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className="caption">{item.sku}</p>
                    <p className={`price ${styles.itemPrice}`}>{formatINR(item.price)}</p>

                    <div className={styles.itemActions}>
                      {/* Qty controls */}
                      <div className={styles.qtyControl}>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.productId, item.qty - 1)}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className={styles.qtyNum}>{item.qty}</span>
                        <button
                          className={styles.qtyBtn}
                          onClick={() => updateQty(item.productId, item.qty + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove */}
                      <button
                        className={styles.removeBtn}
                        onClick={() => removeItem(item.productId)}
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer: subtotal + checkout */}
        {items.length > 0 && (
          <div className={styles.foot}>
            <hr className="hairline-rule" />
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>Subtotal</span>
              <span className={`price ${styles.subtotalAmt}`}>{formatINR(total())}</span>
            </div>
            <p className={styles.shippingNote}>Shipping calculated at checkout</p>
            <Link
              href="/checkout"
              className={`btn btn--gold ${styles.checkoutBtn}`}
              onClick={closeDrawer}
            >
              Proceed to Checkout
            </Link>
            <button
              className={`btn btn--ghost ${styles.continueBtn}`}
              onClick={closeDrawer}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
