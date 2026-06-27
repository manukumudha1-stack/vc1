import Link from 'next/link';
import LookbookDeleteButton from '../lookbook/LookbookDeleteButton';
import gridStyles from '../lookbook/lookbook.module.css';
import styles from './settings.module.css';
import prodStyles from '../products/products.module.css';

interface LookbookItem {
  _id: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  isActive: boolean;
}

export default function LookbookSection({ items }: { items: LookbookItem[] }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Lookbook</h2>
        <Link href="/admin/lookbook/new" className={prodStyles.btnAdd}>
          + Add Entry
        </Link>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: '#8C7B6B' }}>No lookbook entries yet.</p>
      ) : (
        <div className={gridStyles.grid}>
          {items.map(item => (
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
                <Link href={`/admin/lookbook/${item._id}/edit`} className={prodStyles.btnEdit}>
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
