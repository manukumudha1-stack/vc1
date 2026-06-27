import Link from 'next/link';
import { connectDB } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import CollectionModel from '@/lib/models/Collection';
import { formatINR, stockStatus } from '@/lib/utils';
import ProductDeleteButton from './ProductDeleteButton';
import styles from './products.module.css';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = params.q ?? '';
  const page = Math.max(1, parseInt(params.page ?? '1', 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  await connectDB();

  const query = q
    ? {
        $or: [
          { name: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
        ],
      }
    : {};

  const [products, total, collections] = await Promise.all([
    ProductModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('collectionId').lean(),
    ProductModel.countDocuments(query),
    CollectionModel.find().lean(),
  ]);

  const collectionMap = Object.fromEntries(collections.map(c => [String(c._id), c.name]));
  const serialized = JSON.parse(JSON.stringify(products));
  const totalPages = Math.ceil(total / limit);

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <h1 className={styles.pageTitle}>Products</h1>
          <form method="GET">
            <input
              className={styles.search}
              name="q"
              defaultValue={q}
              placeholder="Search name or SKU…"
            />
          </form>
        </div>
        <Link href="/admin/products/new" className={styles.btnAdd}>
          + Add Product
        </Link>
      </div>

      <div className={styles.card}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 56 }}></th>
              <th>Name</th>
              <th>SKU</th>
              <th>Collection</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {serialized.map((p: {
              _id: string;
              name: string;
              sku: string;
              slug: string;
              collectionId: { _id: string; name: string } | string;
              price: number;
              stockQty: number;
              isFeatured: boolean;
              isActive: boolean;
              images?: { url: string }[];
            }) => {
              const colName = typeof p.collectionId === 'object' && p.collectionId !== null
                ? (p.collectionId as { name: string }).name
                : collectionMap[p.collectionId as string] ?? '—';
              const status = stockStatus(p.stockQty);
              const img = p.images?.[0]?.url;
              return (
                <tr key={p._id}>
                  <td>
                    <div className={styles.imgPlaceholder}>
                      {img ? <img src={img} alt={p.name} /> : null}
                    </div>
                  </td>
                  <td>
                    <div className={styles.productName}>{p.name}</div>
                    {p.isFeatured && (
                      <span className={styles.featuredBadge}>★ Featured</span>
                    )}
                  </td>
                  <td><span className={styles.sku}>{p.sku}</span></td>
                  <td>{colName}</td>
                  <td><span className={styles.price}>{formatINR(p.price)}</span></td>
                  <td>{p.stockQty}</td>
                  <td>
                    <span className={`badge badge--${status}`}>{status}</span>
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <Link href={`/admin/products/${p._id}/edit`} className={styles.btnEdit}>
                        Edit
                      </Link>
                      <ProductDeleteButton slug={p.slug} name={p.name} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {serialized.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className={styles.empty}>
                    {q ? `No products matching "${q}".` : 'No products yet.'}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13 }}>
          {page > 1 && (
            <Link href={`?q=${q}&page=${page - 1}`} className={styles.btnEdit}>← Prev</Link>
          )}
          <span style={{ color: '#8C7B6B' }}>Page {page} of {totalPages}</span>
          {page < totalPages && (
            <Link href={`?q=${q}&page=${page + 1}`} className={styles.btnEdit}>Next →</Link>
          )}
        </div>
      )}
    </div>
  );
}
