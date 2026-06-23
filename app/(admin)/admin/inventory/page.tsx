import Link from 'next/link';
import { connectDB } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import { stockStatus } from '@/lib/utils';
import styles from './inventory.module.css';

export const dynamic = 'force-dynamic';

export default async function InventoryPage() {
  await connectDB();

  const products = await ProductModel.find({ isActive: true })
    .sort({ stockQty: 1 })
    .select('name sku stockQty')
    .lean();

  const serialized = JSON.parse(JSON.stringify(products));
  const total = serialized.length;
  const lowCount = serialized.filter((p: { stockQty: number }) => p.stockQty > 0 && p.stockQty <= 2).length;
  const outCount = serialized.filter((p: { stockQty: number }) => p.stockQty === 0).length;

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Inventory</h1>
        <div className={styles.summaryPills}>
          <div className={styles.summaryPill}>Total <span>{total}</span></div>
          <div className={styles.summaryPill}>Low Stock <span>{lowCount}</span></div>
          <div className={styles.summaryPill}>Out of Stock <span>{outCount}</span></div>
        </div>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((p: { _id: string; name: string; sku: string; stockQty: number }) => {
              const status = stockStatus(p.stockQty);
              return (
                <tr key={p._id}>
                  <td style={{ fontWeight: 500 }}>{p.name}</td>
                  <td><span className={styles.sku}>{p.sku}</span></td>
                  <td>{p.stockQty}</td>
                  <td>
                    <span className={`badge badge--${status}`}>{status}</span>
                  </td>
                  <td>
                    <Link href={`/admin/products/${p._id}/edit`} className={styles.btnEdit}>
                      Edit
                    </Link>
                  </td>
                </tr>
              );
            })}
            {serialized.length === 0 && (
              <tr>
                <td colSpan={5}><div className={styles.empty}>No products found.</div></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
