import Link from 'next/link';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import { formatINR } from '@/lib/utils';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

type Status = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const TABS: { label: string; value: Status }[] = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface PageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const activeStatus = (params.status ?? 'all') as Status;

  await connectDB();

  const query = activeStatus !== 'all' ? { status: activeStatus } : {};
  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(orders));

  // Count per tab
  const counts = await Promise.all(
    TABS.map(tab =>
      tab.value === 'all'
        ? OrderModel.countDocuments()
        : OrderModel.countDocuments({ status: tab.value })
    )
  );

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Orders</h1>
      </div>

      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/admin/orders' : `/admin/orders?status=${tab.value}`}
            className={`${styles.tab}${activeStatus === tab.value ? ' ' + styles.active : ''}`}
          >
            {tab.label}
            <span className={styles.tabCount}>{counts[i]}</span>
          </Link>
        ))}
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Item(s)</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((o: {
              _id: string;
              orderNumber: string;
              createdAt: string;
              shippingAddress: { name: string };
              items: { name: string; qty: number }[];
              payment: { method: string; status: string };
              total: number;
              status: string;
            }) => (
              <tr key={o._id}>
                <td>
                  <span className={styles.orderNum}>{o.orderNumber}</span>
                </td>
                <td className={styles.muted}>
                  {new Date(o.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td>{o.shippingAddress?.name || '—'}</td>
                <td className={styles.muted}>
                  {o.items?.length === 1
                    ? o.items[0].name
                    : `${o.items?.length || 0} items`}
                </td>
                <td>
                  <span className={styles.muted}>{o.payment?.method || 'COD'}</span>
                </td>
                <td className={styles.amount}>{formatINR(o.total)}</td>
                <td>
                  <span className={`badge badge--${o.status}`}>{o.status}</span>
                </td>
                <td>
                  <Link href={`/admin/orders/${o._id}`} className={styles.btnView}>
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {serialized.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className={styles.empty}>No orders found.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
