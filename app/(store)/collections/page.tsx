import Link from 'next/link';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import HeroCanvas from '@/components/store/HeroCanvas';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'All Collections — VC' };

async function getCollections() {
  await connectDB();
  return CollectionModel.find({}).sort({ sortOrder: 1, name: 1 }).lean();
}

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className={styles.page}>
      {/* Hero */}
      <div className={styles.hero}>
        <HeroCanvas />
        <div className={styles.heroOverlay}>
          <p className="eyebrow">{collections.length} collections</p>
          <h1 className={`serif ${styles.heroTitle}`}>All Collections</h1>
          <p className={styles.heroDesc}>
            Explore our range of handpicked silk sarees — each collection tells a distinct story of craft and heritage.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className={styles.body}>
        {collections.length === 0 ? (
          <p className={styles.empty}>No collections available yet.</p>
        ) : (
          <div className={styles.grid}>
            {collections.map((col) => (
              <Link
                key={String(col._id)}
                href={`/collections/${col.slug}`}
                className={styles.card}
              >
                <div className={styles.cardImage}>
                  {(col as { coverImageUrl?: string }).coverImageUrl ? (
                    <img
                      src={(col as { coverImageUrl?: string }).coverImageUrl}
                      alt={col.name}
                    />
                  ) : (
                    <span className={styles.cardPlaceholder}>◈</span>
                  )}
                </div>
                <div className={styles.cardBody}>
                  <p className={`eyebrow ${styles.cardEyebrow}`}>Collection</p>
                  <h2 className={`serif ${styles.cardTitle}`}>{col.name}</h2>
                  {(col as { description?: string }).description && (
                    <p className={styles.cardDesc}>
                      {(col as { description?: string }).description}
                    </p>
                  )}
                  <span className={`link ${styles.cardCta}`}>View sarees →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
