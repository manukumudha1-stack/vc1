import Link from 'next/link';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import OrderModel from '@/lib/models/Order';
import MetricCard from '@/components/admin/MetricCard';
import { formatINR } from '@/lib/utils';
import styles from './customers.module.css';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  await connectDB();

  const [users, allOrders] = await Promise.all([
    UserModel.find().sort({ createdAt: -1 }).lean(),
    OrderModel.find({ status: { $ne: 'cancelled' } }).select('customerId total').lean(),
  ]);

  const serialized = JSON.parse(JSON.stringify(users));

  // Build per-customer stats
  const ordersByCustomer: Record<string, { count: number; total: number }> = {};
  for (const o of allOrders) {
    const cid = o.customerId ? String(o.customerId) : null;
    if (!cid) continue;
    if (!ordersByCustomer[cid]) ordersByCustomer[cid] = { count: 0, total: 0 };
    ordersByCustomer[cid].count++;
    ordersByCustomer[cid].total += o.total || 0;
  }

  const total = serialized.length;
  const returning = serialized.filter((u: { segment: string }) => u.segment !== 'new').length;
  const allLTV = Object.values(ordersByCustomer).map(v => v.total);
  const avgLTV = allLTV.length > 0 ? Math.round(allLTV.reduce((a, b) => a + b, 0) / allLTV.length) : 0;

  return (
    <div className={styles.page}>
      <h1 className={styles.pageTitle}>Customers</h1>

      <div className={styles.metrics}>
        <MetricCard label="Total Customers" value={total} dotColor="#1A6B6B" />
        <MetricCard label="Returning Customers" value={returning} dotColor="#C9A84C" />
        <MetricCard label="Avg Order Value" value={formatINR(avgLTV)} dotColor="#8a6d2a" />
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Orders</th>
              <th>Lifetime Value</th>
              <th>Segment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((u: {
              _id: string;
              name: string;
              email: string;
              addresses?: { city: string; state: string }[];
              segment: string;
            }) => {
              const stats = ordersByCustomer[u._id] ?? { count: 0, total: 0 };
              const loc = u.addresses?.[0]
                ? `${u.addresses[0].city}, ${u.addresses[0].state}`
                : '—';
              return (
                <tr key={u._id}>
                  <td>
                    <div className={styles.name}>{u.name}</div>
                    <div className={styles.email}>{u.email}</div>
                  </td>
                  <td className={styles.muted}>{loc}</td>
                  <td>{stats.count}</td>
                  <td className={styles.amount}>{formatINR(stats.total)}</td>
                  <td>
                    <span className={`badge badge--${u.segment}`}>{u.segment}</span>
                  </td>
                  <td>
                    <Link href={`/admin/customers/${u._id}`} className={styles.btnView}>
                      View
                    </Link>
                  </td>
                </tr>
              );
            })}
            {serialized.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <div className={styles.empty}>No customers yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
