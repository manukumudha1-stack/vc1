import Link from 'next/link';
import { connectDB } from '@/lib/db';
import OrderModel from '@/lib/models/Order';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import MetricCard from '@/components/admin/MetricCard';
import { formatINR } from '@/lib/utils';
import styles from './reports.module.css';

export const dynamic = 'force-dynamic';

type Range = '7d' | '30d' | '90d' | 'year';

interface PageProps {
  searchParams: Promise<{ range?: string }>;
}

const RANGES: { label: string; value: Range }[] = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'Year', value: 'year' },
];

function rangeStart(range: Range): Date {
  const d = new Date();
  switch (range) {
    case '7d': d.setDate(d.getDate() - 7); break;
    case '30d': d.setDate(d.getDate() - 30); break;
    case '90d': d.setDate(d.getDate() - 90); break;
    case 'year': d.setFullYear(d.getFullYear() - 1); break;
  }
  return d;
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default async function ReportsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = (params.range ?? '30d') as Range;
  const start = rangeStart(range);

  await connectDB();

  const [orders, allProducts, collections] = await Promise.all([
    OrderModel.find({
      createdAt: { $gte: start },
      status: { $ne: 'cancelled' },
    }).lean(),
    ProductModel.find({ isActive: true }).select('collectionId region').lean(),
    CollectionModel.find().lean(),
  ]);

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const orderCount = orders.length;
  const aov = orderCount > 0 ? Math.round(revenue / orderCount) : 0;

  // Revenue by collection (using all orders' items — approximate by product count per collection)
  const collectionMap = Object.fromEntries(collections.map(c => [String(c._id), c.name]));
  const collectionRevMap: Record<string, number> = {};
  for (const o of orders) {
    for (const item of o.items || []) {
      const prod = allProducts.find(p => String(p._id) === String(item.productId));
      if (prod) {
        const cid = String(prod.collectionId);
        collectionRevMap[cid] = (collectionRevMap[cid] || 0) + (item.price * item.qty);
      }
    }
  }

  // Revenue by region
  const regionRevMap: Record<string, number> = {};
  for (const o of orders) {
    const city = o.shippingAddress?.city ?? 'Unknown';
    regionRevMap[city] = (regionRevMap[city] || 0) + (o.total || 0);
  }

  // Monthly revenue: trailing 12 months
  const monthlyRev: number[] = Array(12).fill(0);
  const now = new Date();
  for (const o of orders) {
    const oDate = new Date(o.createdAt);
    const diff = (now.getFullYear() - oDate.getFullYear()) * 12 + (now.getMonth() - oDate.getMonth());
    if (diff >= 0 && diff < 12) {
      monthlyRev[11 - diff] += o.total || 0;
    }
  }

  const maxMonthly = Math.max(...monthlyRev, 1);
  const startMonth = (now.getMonth() + 1) % 12; // earliest month index

  // Collections sorted by revenue
  const colRevEntries = Object.entries(collectionRevMap)
    .map(([id, rev]) => ({ name: collectionMap[id] ?? id, rev }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 6);
  const maxColRev = Math.max(...colRevEntries.map(c => c.rev), 1);

  // Regions sorted by revenue
  const regionEntries = Object.entries(regionRevMap)
    .map(([city, rev]) => ({ name: city, rev }))
    .sort((a, b) => b.rev - a.rev)
    .slice(0, 6);
  const maxRegRev = Math.max(...regionEntries.map(r => r.rev), 1);

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Reports</h1>
        <div className={styles.rangeToggle}>
          {RANGES.map(r => (
            <Link
              key={r.value}
              href={`/admin/reports?range=${r.value}`}
              className={`${styles.rangeBtn}${range === r.value ? ' ' + styles.active : ''}`}
            >
              {r.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Revenue" value={formatINR(revenue)} dotColor="#C9A84C" />
        <MetricCard label="Orders" value={orderCount} dotColor="#1A6B6B" />
        <MetricCard label="Avg Order Value" value={formatINR(aov)} dotColor="#8a6d2a" />
        <MetricCard label="Return Rate" value="0%" dotColor="#8C7B6B" />
      </div>

      <div className={styles.grid2}>
        {/* Revenue by Collection */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Revenue by Collection</div>
          <div className={styles.barList}>
            {colRevEntries.length === 0 && (
              <span style={{ color: '#8C7B6B', fontSize: 13 }}>No data yet.</span>
            )}
            {colRevEntries.map(item => (
              <div className={styles.barItem} key={item.name}>
                <div className={styles.barMeta}>
                  <span className={styles.barLabel}>{item.name}</span>
                  <span className={styles.barValue}>{formatINR(item.rev)}</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${Math.round((item.rev / maxColRev) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sales by Region */}
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Sales by Region</div>
          <div className={styles.barList}>
            {regionEntries.length === 0 && (
              <span style={{ color: '#8C7B6B', fontSize: 13 }}>No data yet.</span>
            )}
            {regionEntries.map(item => (
              <div className={styles.barItem} key={item.name}>
                <div className={styles.barMeta}>
                  <span className={styles.barLabel}>{item.name}</span>
                  <span className={styles.barValue}>{formatINR(item.rev)}</span>
                </div>
                <div className={styles.barTrack}>
                  <div
                    className={styles.barFill}
                    style={{ width: `${Math.round((item.rev / maxRegRev) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Revenue */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>Monthly Revenue — Trailing 12 Months</div>
        <div className={styles.monthlyChart}>
          {monthlyRev.map((val, i) => {
            const monthIdx = (startMonth + i) % 12;
            const pct = maxMonthly > 0 ? Math.round((val / maxMonthly) * 100) : 0;
            return (
              <div className={styles.monthBar} key={i} title={`${MONTHS[monthIdx]}: ${formatINR(val)}`}>
                <div className={styles.monthBarFill} style={{ height: `${pct}%` }} />
                <div className={styles.monthBarLabel}>{MONTHS[monthIdx]}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
