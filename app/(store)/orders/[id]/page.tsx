import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import ProductModel from '@/lib/models/Product';
import { formatINR } from '@/lib/utils';
import styles from './page.module.css';
import CancelOrder from './CancelOrder';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

async function getOrder(id: string) {
  await connectDB();
  try {
    const order = await OrderModel.findById(id).lean();
    if (!order) return null;

    const serialized = JSON.parse(JSON.stringify(order));

    // Back-fill missing item images from the live product catalog
    const productIds = serialized.items
      .filter((i: { image?: string }) => !i.image)
      .map((i: { productId: string }) => i.productId);

    if (productIds.length > 0) {
      const products = await ProductModel.find({ _id: { $in: productIds } })
        .select('_id images')
        .lean();
      const imageMap = new Map(
        products.map((p: { _id: unknown; images?: { url: string }[] }) => [
          String(p._id),
          p.images?.[0]?.url ?? '',
        ])
      );
      serialized.items = serialized.items.map((item: { productId: string; image?: string }) => ({
        ...item,
        image: item.image || imageMap.get(item.productId) || '',
      }));
    }

    return serialized;
  } catch {
    return null;
  }
}

export default async function OrderConfirmationPage({ params }: Props) {
  const { id } = await params;
  const order  = await getOrder(id);

  if (!order) notFound();

  return (
    <div className={styles.page}>
      {/* Confirmation header */}
      <div className={styles.header}>
        <div className={styles.checkCircle}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="eyebrow">Thank you</p>
        <h1 className={`serif ${styles.title}`}>Your order is confirmed</h1>
        <p className={styles.subtitle}>
          A confirmation has been sent to <strong>{order.shippingAddress.email}</strong>
        </p>
      </div>

      <div className={styles.body}>
        {/* Order details */}
        <div className={styles.card}>
          <div className={styles.cardHead}>
            <span className="eyebrow">Order details</span>
            <span className={`badge badge--${order.status}`}>{order.status}</span>
          </div>
          <hr className="hairline-rule" />

          <div className={styles.metaRow}>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Order number</span>
              <span className={styles.metaVal}>{order.orderNumber}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Date</span>
              <span className={styles.metaVal}>
                {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaKey}>Payment</span>
              <span className={styles.metaVal}>Cash on Delivery</span>
            </div>
          </div>

          {/* Items */}
          <ul className={styles.items}>
            {order.items.map((item: { name: string; sku: string; qty: number; price: number; image?: string }, i: number) => (
              <li key={i} className={styles.item}>
                <div className={`ph ${styles.itemThumb}`}>
                  {item.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  )}
                </div>
                <div className={styles.itemInfo}>
                  <p className={styles.itemName}>{item.name}</p>
                  <p className="caption">{item.sku} · Qty {item.qty}</p>
                </div>
                <p className="price" style={{ fontSize: 15 }}>{formatINR(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>

          <hr className="hairline-rule" />

          <div className={styles.totals}>
            <div className={styles.totalRow}>
              <span className={styles.totalKey}>Subtotal</span>
              <span>{formatINR(order.subtotal)}</span>
            </div>
            <div className={`${styles.totalRow} ${styles.totalGrand}`}>
              <span>Total</span>
              <span className="price">{formatINR(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Shipping address */}
        <div className={styles.card}>
          <span className="eyebrow" style={{ display: 'block', marginBottom: 16 }}>Shipping to</span>
          <p className={styles.addrName}>{order.shippingAddress.name}</p>
          <p className={styles.addrLine}>{order.shippingAddress.line1}</p>
          {order.shippingAddress.landmark && (
            <p className={styles.addrLine}>{order.shippingAddress.landmark}</p>
          )}
          <p className={styles.addrLine}>
            {order.shippingAddress.city}, {order.shippingAddress.state} – {order.shippingAddress.pincode}
          </p>
          <p className={styles.addrLine}>{order.shippingAddress.phone}</p>
        </div>
      </div>

      {/* CTAs */}
      <div className={styles.ctas}>
        <Link href="/collections" className="btn btn--gold">
          Continue Shopping
        </Link>
        <Link href="/account" className="btn btn--outline">
          View all orders
        </Link>
        <CancelOrder orderId={String(order._id)} status={order.status} />
      </div>
    </div>
  );
}
