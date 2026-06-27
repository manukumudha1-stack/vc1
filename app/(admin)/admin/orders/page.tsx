import Link from 'next/link';
import { Suspense } from 'react';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import { formatINR } from '@/lib/utils';
import OrderSearchBar from './OrderSearchBar';
import styles from './orders.module.css';

export const dynamic = 'force-dynamic';

type Status = 'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

const TABS: { label: string; value: Status }[] = [
  { label: 'All',       value: 'all' },
  { label: 'Pending',   value: 'pending' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'Shipped',   value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
  { label: 'Cancelled', value: 'cancelled' },
];

interface PageProps {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}

export default async function OrdersPage({ searchParams }: PageProps) {
  const params       = await searchParams;
  const activeStatus = (params.status ?? 'all') as Status;
  const q            = params.q?.trim() ?? '';
  const from         = params.from ?? '';
  const to           = params.to   ?? '';

  await connectDB();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {};

  if (activeStatus !== 'all') query.status = activeStatus;

  if (q) {
    const re = { $regex: q, $options: 'i' };
    query.$or = [
      { 'shippingAddress.name':  re },
      { 'shippingAddress.phone': re },
      { 'shippingAddress.email': re },
      { 'items.sku':             re },
    ];
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(from);
    if (to)   query.createdAt.$lte = new Date(to + 'T23:59:59.999Z');
  }

  const orders = await OrderModel.find(query).sort({ createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(orders));

  const counts = await Promise.all(
    TABS.map(tab =>
      tab.value === 'all'
        ? OrderModel.countDocuments()
        : OrderModel.countDocuments({ status: tab.value })
    )
  );

  function tabHref(status: Status) {
    const p = new URLSearchParams();
    if (status !== 'all') p.set('status', status);
    if (q)    p.set('q', q);
    if (from) p.set('from', from);
    if (to)   p.set('to', to);
    const qs = p.toString();
    return `/admin/orders${qs ? '?' + qs : ''}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Orders</h1>
        <span className={styles.resultCount}>
          {serialized.length} result{serialized.length !== 1 ? 's' : ''}
          {(q || from || to) ? ' (filtered)' : ''}
        </span>
      </div>

      {/* Search bar */}
      <Suspense fallback={null}>
        <OrderSearchBar q={q} from={from} to={to} />
      </Suspense>

      {/* Status tabs */}
      <div className={styles.tabs}>
        {TABS.map((tab, i) => (
          <Link
            key={tab.value}
            href={tabHref(tab.value)}
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
              shippingAddress: { name: string; phone: string; email: string };
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
                  {new Date(o.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <div className={styles.customerName}>{o.shippingAddress?.name || '—'}</div>
                  {o.shippingAddress?.phone && (
                    <div className={styles.customerSub}>{o.shippingAddress.phone}</div>
                  )}
                  {o.shippingAddress?.email && (
                    <div className={styles.customerSub}>{o.shippingAddress.email}</div>
                  )}
                </td>
                <td className={styles.muted}>
                  {o.items?.length === 1
                    ? o.items[0].name
                    : `${o.items?.length || 0} items`}
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
                <td colSpan={7}>
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
