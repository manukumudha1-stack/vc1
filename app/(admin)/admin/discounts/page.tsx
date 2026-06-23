import { connectDB } from '@/lib/db';
import DiscountModel from '@/lib/models/Discount';
import MetricCard from '@/components/admin/MetricCard';
import { CreateOfferButton, EditDiscountButton } from './DiscountActions';
import styles from './discounts.module.css';

export const dynamic = 'force-dynamic';

export default async function DiscountsPage() {
  await connectDB();

  const discounts = await DiscountModel.find().sort({ createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(discounts));

  const active = serialized.filter((d: { status: string }) => d.status === 'active').length;
  const redemptions = serialized.reduce((sum: number, d: { usageCount: number }) => sum + (d.usageCount || 0), 0);
  const flatDiscounts = serialized.filter((d: { value: { kind: string; amount: number } }) => d.value.kind !== 'free_shipping');
  const avgDiscount = flatDiscounts.length > 0
    ? Math.round(flatDiscounts.reduce((s: number, d: { value: { amount: number } }) => s + d.value.amount, 0) / flatDiscounts.length)
    : 0;

  function formatValue(d: { value: { kind: string; amount: number } }) {
    if (d.value.kind === 'free_shipping') return 'Free Shipping';
    if (d.value.kind === 'percent') return `${d.value.amount}%`;
    return `₹${d.value.amount}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Discounts</h1>
        <CreateOfferButton />
      </div>

      <div className={styles.metrics}>
        <MetricCard label="Active Codes" value={active} dotColor="#3f6b3f" />
        <MetricCard label="Total Redemptions" value={redemptions} dotColor="#C9A84C" />
        <MetricCard label="Avg Discount" value={`₹${avgDiscount}`} dotColor="#8a6d2a" />
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Applies To</th>
              <th>Used</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((d: {
              _id: string;
              code: string;
              type: string;
              value: { kind: string; amount: number };
              appliesTo: string;
              usageCount: number;
              validUntil?: string;
              status: string;
            }) => (
              <tr key={d._id}>
                <td><span className={styles.code}>{d.code}</span></td>
                <td className={styles.muted}>{d.type}</td>
                <td>{formatValue(d)}</td>
                <td className={styles.muted}>{d.appliesTo}</td>
                <td>{d.usageCount}</td>
                <td className={styles.muted}>
                  {d.validUntil ? new Date(d.validUntil).toLocaleDateString('en-IN') : '—'}
                </td>
                <td>
                  <span className={`badge badge--${d.status}`}>{d.status}</span>
                </td>
                <td>
                  <EditDiscountButton />
                </td>
              </tr>
            ))}
            {serialized.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className={styles.empty}>No discount codes yet.</div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
