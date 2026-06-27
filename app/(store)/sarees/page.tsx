import Link from 'next/link';
import { connectDB } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import ProductCard from '@/components/store/ProductCard';
import styles from './sarees.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'All Sarees — VC' };

async function getAllSarees() {
  await connectDB();
  // Featured first, then all others — both groups sorted by stockQty descending
  const products = await ProductModel
    .find({ isActive: true })
    .sort({ isFeatured: -1, stockQty: -1 })
    .lean();
  return JSON.parse(JSON.stringify(products));
}

export default async function SareesPage() {
  const products = await getAllSarees();

  const featuredCount = products.filter((p: { isFeatured?: boolean }) => p.isFeatured).length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <p className="eyebrow">The full collection</p>
        <h1 className={`serif ${styles.title}`}>All Sarees</h1>
        <p className={styles.subtitle}>
          {products.length} piece{products.length !== 1 ? 's' : ''} — featured selections first
        </p>
      </div>

      {featuredCount > 0 && (
        <div className={styles.sectionLabel}>
          <span className={styles.sectionPill}>★ Featured</span>
          <span className={styles.sectionLine} />
        </div>
      )}

      <div className={styles.grid}>
        {products.map((p: {
          _id: string;
          slug: string;
          name: string;
          price: number;
          fabric: string;
          region: string;
          stockQty: number;
          isFeatured?: boolean;
          images?: { url: string }[];
        }, i: number) => {
          const showDivider = featuredCount > 0 && i === featuredCount;
          return (
            <div key={p._id} className={styles.cardWrap}>
              {showDivider && (
                <div className={styles.divider}>
                  <span className={styles.dividerLine} />
                  <span className={styles.dividerLabel}>All sarees by availability</span>
                  <span className={styles.dividerLine} />
                </div>
              )}
              <ProductCard
                productId={String(p._id)}
                name={p.name}
                slug={p.slug}
                price={p.price}
                meta={p.region}
                pill={p.fabric}
                pillVariant="silk"
                imageUrl={p.images?.[0]?.url}
                hoverImageUrl={p.images?.[1]?.url}
                imageCaption={p.name}
                urgency={p.stockQty <= 3 ? p.stockQty : undefined}
              />
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <p style={{ textAlign: 'center', color: '#8C7B6B', padding: '64px 0' }}>
          No sarees available yet.
        </p>
      )}

      <div className={styles.back}>
        <Link href="/collections" className="link">← Browse by collection</Link>
      </div>
    </div>
  );
}
