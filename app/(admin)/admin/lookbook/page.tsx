import Link from 'next/link';
import { connectDB } from '@/lib/db';
import LookbookModel from '@/lib/models/Lookbook';
import styles from '../products/products.module.css';
import gridStyles from './lookbook.module.css';
import LookbookDeleteButton from './LookbookDeleteButton';

export const dynamic = 'force-dynamic';

export default async function LookbookAdminPage() {
  await connectDB();
  const items = await LookbookModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(items));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Lookbook</h1>
        <Link href="/admin/lookbook/new" className={styles.btnAdd}>
          + Add Entry
        </Link>
      </div>

      {serialized.length === 0 ? (
        <div className={styles.card}>
          <div className={styles.empty}>No lookbook entries yet. Add one to get started.</div>
        </div>
      ) : (
        <div className={gridStyles.grid}>
          {serialized.map((item: { _id: string; imageUrl: string; caption: string; sortOrder: number; isActive: boolean }) => (
            <div key={item._id} className={gridStyles.card}>
              <div className={gridStyles.imageWrap}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.caption} className={gridStyles.image} />
                  : <div className={gridStyles.imagePh}>No image</div>
                }
                {!item.isActive && (
                  <span className={gridStyles.inactiveBadge}>Hidden</span>
                )}
              </div>
              <div className={gridStyles.info}>
                <p className={gridStyles.caption}>{item.caption || '—'}</p>
                <p className={gridStyles.meta}>Sort: {item.sortOrder}</p>
              </div>
              <div className={gridStyles.actions}>
                <Link href={`/admin/lookbook/${item._id}/edit`} className={styles.btnEdit}>
                  Edit
                </Link>
                <LookbookDeleteButton id={item._id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
