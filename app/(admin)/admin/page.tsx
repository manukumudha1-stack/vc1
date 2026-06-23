import Link from 'next/link';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import ProductModel from '@/lib/models/Product';
import MetricCard from '@/components/admin/MetricCard';
import { formatINR, stockStatus } from '@/lib/utils';
import styles from './dashboard.module.css';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  await connectDB();

  // Today's date range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  const [
    todayOrders,
    allLowStock,
    pendingShipments,
    recentOrders,
    topProducts,
    last30OrderAmounts,
  ] = await Promise.all([
    OrderModel.find({ createdAt: { $gte: todayStart, $lte: todayEnd } }).lean(),
    ProductModel.find({ stockQty: { $lte: 2 }, isActive: true }).select('name sku stockQty').lean(),
    OrderModel.countDocuments({ status: { $in: ['confirmed', 'shipped'] } }),
    OrderModel.find().sort({ createdAt: -1 }).limit(5).lean(),
    ProductModel.find({ isActive: true }).sort({ price: -1 }).limit(5).lean(),
    OrderModel.find().sort({ createdAt: -1 }).limit(30).select('total').lean(),
  ]);

  const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const todayOrderCount = todayOrders.length;
  const lowStockCount = allLowStock.length;

  // Chart data: last 30 orders amounts normalized to 0-100 for SVG path
  const amounts = last30OrderAmounts.map(o => o.total || 0).reverse();
  const maxAmt = Math.max(...amounts, 1);
  const svgW = 560;
  const svgH = 80;
  const points = amounts.map((a, i) => {
    const x = (i / Math.max(amounts.length - 1, 1)) * svgW;
    const y = svgH - (a / maxAmt) * svgH;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const polyline = points.join(' ');

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        <span className={styles.pageDate}>{today}</span>
      </div>

      <div className={styles.metrics}>
        <MetricCard
          label="Today's Revenue"
          value={formatINR(todayRevenue)}
          dotColor="#C9A84C"
        />
        <MetricCard
          label="Orders Today"
          value={todayOrderCount}
          dotColor="#1A6B6B"
        />
        <MetricCard
          label="Low Stock"
          value={lowStockCount}
          dotColor="#8B1A1A"
        />
        <MetricCard
          label="Pending Shipments"
          value={pendingShipments}
          dotColor="#8a6d2a"
        />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Revenue — Last 30 Orders</h2>
        </div>
        <div className={styles.chart}>
          <svg viewBox={`0 0 ${svgW} ${svgH + 8}`} width="100%" height="88" preserveAspectRatio="none">
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.18" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
              </linearGradient>
            </defs>
            {amounts.length > 1 && (
              <>
                <polygon
                  points={`0,${svgH} ${polyline} ${svgW},${svgH}`}
                  fill="url(#chartGrad)"
                />
                <polyline
                  points={polyline}
                  fill="none"
                  stroke="#C9A84C"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </>
            )}
          </svg>
        </div>
      </div>

      <div className={styles.grid2}>
        {/* Top Products */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Top Products</h2>
            <Link href="/admin/products" className={styles.sectionLink}>View all</Link>
          </div>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p) => (
                <tr key={String(p._id)}>
                  <td><span style={{ fontWeight: 500 }}>{p.name}</span></td>
                  <td><span className={styles.muted}>{p.sku}</span></td>
                  <td><span className={styles.amount}>{formatINR(p.price)}</span></td>
                  <td>
                    <span className={`badge badge--${stockStatus(p.stockQty)}`}>
                      {p.stockQty}
                    </span>
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr><td colSpan={4} className={styles.muted}>No products yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Low Stock Alert */}
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Low Stock Alert</h2>
            <Link href="/admin/inventory" className={styles.sectionLink}>View all</Link>
          </div>
          <div className={styles.stockList}>
            {allLowStock.slice(0, 5).map((p) => (
              <div className={styles.stockItem} key={String(p._id)}>
                <div>
                  <div className={styles.stockName}>{p.name}</div>
                  <div className={styles.stockSku}>{p.sku}</div>
                </div>
                <span className={styles.stockQty}>{p.stockQty} left</span>
              </div>
            ))}
            {allLowStock.length === 0 && (
              <span className={styles.muted}>All products are well stocked.</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Recent Orders</h2>
          <Link href="/admin/orders" className={styles.sectionLink}>View all</Link>
        </div>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={String(o._id)}>
                <td>
                  <Link href={`/admin/orders/${o._id}`} className={styles.orderNum}>
                    {o.orderNumber}
                  </Link>
                </td>
                <td className={styles.muted}>
                  {new Date(o.createdAt).toLocaleDateString('en-IN')}
                </td>
                <td>{o.shippingAddress?.name || '—'}</td>
                <td className={styles.muted}>{o.items?.length || 0} item(s)</td>
                <td className={styles.amount}>{formatINR(o.total)}</td>
                <td>
                  <span className={`badge badge--${o.status}`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={6} className={styles.muted}>No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
