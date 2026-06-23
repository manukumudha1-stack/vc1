import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import { formatINR } from '@/lib/utils';
import OrderStatusUpdate from './OrderStatusUpdate';
import styles from './order-detail.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

function stepIndex(status: string) {
  return STEPS.indexOf(status);
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  await connectDB();

  const order = await OrderModel.findById(id).lean();
  if (!order) notFound();

  const o = JSON.parse(JSON.stringify(order));
  const isCancelled = o.status === 'cancelled';
  const currentStep = stepIndex(o.status);

  return (
    <div className={styles.page}>
      <Link href="/admin/orders" className={styles.back}>← Back to Orders</Link>

      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>{o.orderNumber}</h1>
        <span className={`badge badge--${o.status}`}>{o.status}</span>
      </div>

      {/* Fulfilment Stepper or Cancelled Banner */}
      {isCancelled ? (
        <div className={styles.cancelledBanner}>
          This order was cancelled.
        </div>
      ) : (
        <div className={styles.card}>
          <div className={styles.stepper}>
            {STEPS.map((step, i) => {
              const done = i <= currentStep;
              const current = i === currentStep;
              return (
                <div key={step} className={`${styles.step}${done ? ' ' + styles.done : ''}${current ? ' ' + styles.current : ''}`}>
                  <div className={styles.stepDot}>{done ? '✓' : i + 1}</div>
                  <div className={styles.stepLabel}>{step.charAt(0).toUpperCase() + step.slice(1)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <div className={styles.main}>
          {/* Items */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Order Items</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {o.items.map((item: { name: string; sku: string; qty: number; price: number }, i: number) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{item.name}</td>
                    <td className={styles.muted}>{item.sku}</td>
                    <td>{item.qty}</td>
                    <td>{formatINR(item.price)}</td>
                    <td className={styles.amount}>{formatINR(item.price * item.qty)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Order Summary */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Order Summary</div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Subtotal</span>
              <span className={styles.summaryValue}>{formatINR(o.subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Shipping</span>
              <span className={styles.summaryValue}>Free</span>
            </div>
            <div className={styles.summaryRow}>
              <span className={styles.summaryLabel}>Total</span>
              <span className={styles.summaryTotal}>{formatINR(o.total)}</span>
            </div>
          </div>

          {/* Update Status */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Update Status</div>
            <OrderStatusUpdate orderId={o._id} currentStatus={o.status} />
          </div>
        </div>

        <div className={styles.sidebar}>
          {/* Customer Info */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Customer</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Name</span>
              <span className={styles.infoValue}>{o.shippingAddress?.name || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Phone</span>
              <span className={styles.infoValue}>{o.shippingAddress?.phone || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{o.shippingAddress?.email || '—'}</span>
            </div>
          </div>

          {/* Shipping Address */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Shipping Address</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Address</span>
              <span className={styles.infoValue}>{o.shippingAddress?.line1}</span>
            </div>
            {o.shippingAddress?.landmark && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Landmark</span>
                <span className={styles.infoValue}>{o.shippingAddress.landmark}</span>
              </div>
            )}
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>City</span>
              <span className={styles.infoValue}>{o.shippingAddress?.city}, {o.shippingAddress?.state} — {o.shippingAddress?.pincode}</span>
            </div>
          </div>

          {/* Payment */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Payment</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Method</span>
              <span className={styles.infoValue}>{o.payment?.method || 'COD'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.infoValue}>{o.payment?.status}</span>
            </div>
          </div>

          {/* Notes */}
          {o.notes && (
            <div className={styles.card}>
              <div className={styles.cardTitle}>Notes</div>
              <p style={{ fontSize: 13, color: '#8C7B6B' }}>{o.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
