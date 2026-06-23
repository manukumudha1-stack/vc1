import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import MetricCard from '@/components/admin/MetricCard';
import { formatINR } from '@/lib/utils';
import styles from './customer-detail.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  await connectDB();

  const user = await UserModel.findById(id).lean();
  if (!user) notFound();

  const orders = await OrderModel.find({ customerId: id })
    .sort({ createdAt: -1 })
    .lean();

  const u = JSON.parse(JSON.stringify(user));
  const os = JSON.parse(JSON.stringify(orders));

  const validOrders = os.filter((o: { status: string }) => o.status !== 'cancelled');
  const ltv = validOrders.reduce((s: number, o: { total: number }) => s + o.total, 0);
  const orderCount = validOrders.length;
  const aov = orderCount > 0 ? Math.round(ltv / orderCount) : 0;
  const since = new Date(u.createdAt).getFullYear();

  const primaryAddress = u.addresses?.[0];

  return (
    <div className={styles.page}>
      <Link href="/admin/customers" className={styles.back}>← Back to Customers</Link>

      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>{u.name}</h1>
        <span className={`badge badge--${u.segment}`}>{u.segment}</span>
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Lifetime Value" value={formatINR(ltv)} dotColor="#C9A84C" />
        <MetricCard label="Orders" value={orderCount} dotColor="#1A6B6B" />
        <MetricCard label="Avg Order Value" value={formatINR(aov)} dotColor="#8a6d2a" />
        <MetricCard label="Customer Since" value={since} dotColor="#8C7B6B" />
      </div>

      <div className={styles.grid}>
        <div className={styles.main}>
          {/* Order History */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Order History</div>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {os.map((o: { _id: string; orderNumber: string; createdAt: string; items: { name: string }[]; total: number; status: string }) => (
                  <tr key={o._id}>
                    <td>
                      <Link href={`/admin/orders/${o._id}`} className={styles.orderNum}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className={styles.muted}>
                      {new Date(o.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className={styles.muted}>{o.items?.length || 0}</td>
                    <td className={styles.amount}>{formatINR(o.total)}</td>
                    <td>
                      <span className={`badge badge--${o.status}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
                {os.length === 0 && (
                  <tr>
                    <td colSpan={5} className={styles.muted}>No orders yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.sidebar}>
          {/* Contact */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Contact</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{u.email}</span>
            </div>
            {u.phone && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Phone</span>
                <span className={styles.infoValue}>{u.phone}</span>
              </div>
            )}
            {primaryAddress && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Address</span>
                <span className={styles.infoValue}>
                  {primaryAddress.line1}, {primaryAddress.city}, {primaryAddress.state} — {primaryAddress.pincode}
                </span>
              </div>
            )}
          </div>

          {/* Clienteling */}
          <div className={styles.card}>
            <div className={styles.cardTitle}>Clienteling</div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Favourite Collection</span>
              <span className={styles.infoValue}>{u.preferences?.favouriteCollection || '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Notes</span>
              <textarea
                className={styles.notesArea}
                defaultValue={u.preferences?.notes || ''}
                readOnly
                placeholder="No notes yet."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
