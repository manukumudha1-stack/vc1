import Link from 'next/link';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import styles from '../products/products.module.css';
import collStyles from './collections.module.css';
import CollectionDeleteButton from './CollectionDeleteButton';

export const dynamic = 'force-dynamic';

export default async function CollectionsPage() {
  await connectDB();

  const collections = await CollectionModel.find().sort({ sortOrder: 1 }).lean();

  const productCounts = await ProductModel.aggregate([
    { $group: { _id: '$collectionId', count: { $sum: 1 } } },
  ]);
  const countMap: Record<string, number> = {};
  for (const row of productCounts) {
    if (row._id) countMap[String(row._id)] = row.count;
  }

  const serialized = JSON.parse(JSON.stringify(collections));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Collections</h1>
        <Link href="/admin/collections/new" className={styles.btnAdd}>
          + Add Collection
        </Link>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Sort Order</th>
              <th>Products</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((c: {
              _id: string;
              name: string;
              slug: string;
              description: string;
              sortOrder: number;
            }) => (
              <tr key={c._id}>
                <td>
                  <div className={collStyles.collName}>{c.name}</div>
                  {c.description && (
                    <div className={collStyles.collDesc}>
                      {c.description.slice(0, 80)}{c.description.length > 80 ? '…' : ''}
                    </div>
                  )}
                </td>
                <td>
                  <code className={collStyles.slug}>{c.slug}</code>
                </td>
                <td>{c.sortOrder}</td>
                <td>{countMap[c._id] ?? 0}</td>
                <td>
                  <div className={collStyles.actions}>
                    <Link href={`/admin/collections/${c.slug}/edit`} className={collStyles.btnEdit}>
                      Edit
                    </Link>
                    <CollectionDeleteButton slug={c.slug} productCount={countMap[c._id] ?? 0} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {serialized.length === 0 && (
          <div className={collStyles.empty}>
            No collections yet. <Link href="/admin/collections/new">Add one</Link>.
          </div>
        )}
      </div>
    </div>
  );
}
