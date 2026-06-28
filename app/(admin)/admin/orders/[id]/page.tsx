import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import { formatINR } from '@/lib/utils';
import OrderStatusUpdate from './OrderStatusUpdate';
import OrderNotes from './OrderNotes';
import styles from './order-detail.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

const STEPS = ['pending', 'confirmed', 'shipped', 'delivered'];

const STATUS_LABELS: Record<string, string> = {
  placed:    'Order Placed',
  pending:   'Pending',
  confirmed: 'Confirmed',
  shipped:   'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

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

  // Build status → date map from history; pending falls back to createdAt
  const statusDateMap: Record<string, string> = { pending: o.createdAt };
  ((o.statusHistory ?? []) as { status: string; changedAt: string }[]).forEach((ev) => {
    statusDateMap[ev.status] = ev.changedAt;
  });

  return (
    <div className={styles.page}>
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
              const dateStr = statusDateMap[step];
              return (
                <div key={step} className={`${styles.step}${done ? ' ' + styles.done : ''}${current ? ' ' + styles.current : ''}`}>
                  <div className={styles.stepDot}>{done ? '✓' : i + 1}</div>
                  <div className={styles.stepLabel}>{step.charAt(0).toUpperCase() + step.slice(1)}</div>
                  {dateStr && <div className={styles.stepDate}>{fmtDate(dateStr)}</div>}
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

          {/* Notes */}
          <OrderNotes orderId={o._id} initialNotes={o.notes ?? ''} />
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

          {/* Activity Timeline */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Activity</div>
            {(() => {
              const history: { status: string; changedAt: string }[] =
                o.statusHistory?.length
                  ? o.statusHistory
                  : [{ status: 'placed', changedAt: o.createdAt }];
              return (
                <div className={styles.timeline}>
                  {history.map((ev, i) => (
                    <div key={i} className={`${styles.timelineItem}${i === history.length - 1 ? ' ' + styles.timelineLast : ''}`}>
                      <div className={styles.timelineDot} />
                      <div className={styles.timelineBody}>
                        <div className={styles.timelineStatus}>
                          {STATUS_LABELS[ev.status] ?? ev.status}
                        </div>
                        <div className={styles.timelineTime}>
                          {fmtDateTime(ev.changedAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
}
