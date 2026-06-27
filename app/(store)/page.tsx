import Link from 'next/link';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import LookbookModel from '@/lib/models/Lookbook';
import SiteConfigModel from '@/lib/models/SiteConfig';
import { formatINR } from '@/lib/utils';
import ProductCard from '@/components/store/ProductCard';
import RevealOnScroll from '@/components/store/RevealOnScroll';
import HeroCanvas from '@/components/store/HeroCanvas';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

const DEFAULT_TRUST = [
  'Free shipping above ₹5,000',
  'Easy 15-day returns',
  'Secure payment',
  '100% authentic handloom',
];

async function getHomeData() {
  try {
    await connectDB();

    const FEATURED_LIMIT = 4;

    const [collections, markedFeatured, lookbookItems, siteConfig] = await Promise.all([
      CollectionModel.find({}).sort({ sortOrder: 1 }).limit(4).lean(),
      ProductModel.find({ isActive: true, isFeatured: true }).sort({ stockQty: -1 }).limit(FEATURED_LIMIT).lean(),
      LookbookModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).limit(6).lean(),
      SiteConfigModel.findOne({}).lean(),
    ]);

    const remaining = FEATURED_LIMIT - markedFeatured.length;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const featuredIds = markedFeatured.map((p: any) => p._id);
    const topStock = remaining > 0
      ? await ProductModel.find({ isActive: true, _id: { $nin: featuredIds } }).sort({ stockQty: -1 }).limit(remaining).lean()
      : [];
    const featuredProducts = [...markedFeatured, ...topStock];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hb = (siteConfig as any)?.heroBanner;
    return {
      collections:      JSON.parse(JSON.stringify(collections)),
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
      lookbookItems:    JSON.parse(JSON.stringify(lookbookItems)),
      trustItems:       (siteConfig?.trustItems as string[] | undefined) ?? DEFAULT_TRUST,
      heroBanner:       hb?.enabled && hb?.line1 ? { line1: hb.line1 as string, line2: (hb.line2 ?? '') as string } : null,
    };
  } catch {
    return { collections: [], featuredProducts: [], lookbookItems: [], trustItems: DEFAULT_TRUST, heroBanner: null };
  }
}

export default async function HomePage() {
  const { collections, featuredProducts, lookbookItems, trustItems, heroBanner } = await getHomeData();

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <HeroCanvas />
        </div>
        <div className={styles.heroContent}>
          <h1 className={`serif ${styles.heroH1}`}>
            Woven in <span className={styles.heroAccent}>gold.</span><br />
            Worn through generations.
          </h1>
          <p className={styles.heroSub}>
            Each saree carries a story of heritage, artistry, and timeless elegance.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/collections" className="btn btn--gold">
              Explore Collections
            </Link>
            <Link href="/heritage" className="btn btn--ghost">
              Our Story
            </Link>
          </div>
        </div>

        {heroBanner && (
          <div className={styles.heroBanner}>
            <span className={styles.heroBannerLine1}>{heroBanner.line1}</span>
            {heroBanner.line2 && (
              <span className={styles.heroBannerLine2}>{heroBanner.line2}</span>
            )}
          </div>
        )}
      </section>

      {/* ===== TRUST STRIP ===== */}
      <RevealOnScroll className={styles.trustStrip}>
        <div className={styles.trustInner}>
          {/* Icon 0: arrow (shipping) */}
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>{trustItems[0] ?? ''}</span>
          </div>
          <div className={styles.trustDivider} />
          {/* Icon 1: refresh (returns) */}
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>{trustItems[1] ?? ''}</span>
          </div>
          <div className={styles.trustDivider} />
          {/* Icon 2: lock (secure payment) */}
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>{trustItems[2] ?? ''}</span>
          </div>
          <div className={styles.trustDivider} />
          {/* Icon 3: shield (authentic) */}
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>{trustItems[3] ?? ''}</span>
          </div>
        </div>
      </RevealOnScroll>

      {/* ===== COLLECTIONS GRID ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <RevealOnScroll>
            <p className="eyebrow">Curated for you</p>
            <h2 className={`serif ${styles.sectionTitle}`}>Our Collections</h2>
          </RevealOnScroll>
          <Link href="/collections" className="link">View all</Link>
        </div>

        <div className={styles.collectionsGrid}>
          {collections.length > 0 ? (
            collections.map((col: { _id: string; slug: string; name: string; description: string; coverImageUrl?: string }, i: number) => (
              <RevealOnScroll key={col._id} delay={i * 80}>
                <Link href={`/collections/${col.slug}`} className={styles.collectionTile}>
                  <div className={`ph ${styles.collectionPh}`}>
                    {col.coverImageUrl
                      ? <img src={col.coverImageUrl} alt={col.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      : <span className="ph__cap">{col.name}</span>
                    }
                  </div>
                  <div className={styles.collectionInfo}>
                    <h3 className={`serif ${styles.collectionName}`}>{col.name}</h3>
                    {col.description && (
                      <p className={`caption ${styles.collectionDesc}`}>{col.description}</p>
                    )}
                  </div>
                </Link>
              </RevealOnScroll>
            ))
          ) : (
            /* Fallback static tiles */
            ['Bridal Kanjivaram', 'Banarasi Silk', 'Chanderi Cotton', 'Tussar Silk'].map((name, i) => (
              <RevealOnScroll key={name} delay={i * 80}>
                <Link href={`/collections/${name.toLowerCase().replace(/\s+/g, '-')}`} className={styles.collectionTile}>
                  <div className={`ph ${styles.collectionPh}`}>
                    <span className="ph__cap">{name}</span>
                  </div>
                  <div className={styles.collectionInfo}>
                    <h3 className={`serif ${styles.collectionName}`}>{name}</h3>
                  </div>
                </Link>
              </RevealOnScroll>
            ))
          )}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <RevealOnScroll>
            <p className="eyebrow">New arrivals</p>
            <h2 className={`serif ${styles.sectionTitle}`}>Featured Sarees</h2>
          </RevealOnScroll>
          <Link href="/sarees" className="link">View all</Link>
        </div>

        <div className={styles.productsGrid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p: { _id: string; slug: string; name: string; price: number; fabric: string; region: string; stockQty: number; images?: { url: string }[] }, i: number) => (
              <RevealOnScroll key={p._id} delay={i * 80}>
                <ProductCard
                  productId={p._id}
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
              </RevealOnScroll>
            ))
          ) : (
            /* Fallback static cards */
            [
              { name: 'Ruby Kadambam', slug: 'ruby-kadambam', price: 38500, meta: 'Kanjivaram', pill: 'Silk', caption: 'Bridal — Temple Ruby' },
              { name: 'Gold Brocade Temple', slug: 'gold-brocade-temple', price: 52000, meta: 'Banarasi', pill: 'Silk', caption: 'Heritage — Pure Gold Zari' },
              { name: 'Ivory Chanderi', slug: 'ivory-chanderi', price: 14800, meta: 'Chanderi', pill: 'Cotton', caption: 'Festive — Natural Ivory' },
              { name: 'Peacock Teal Tussar', slug: 'peacock-teal-tussar', price: 22000, meta: 'Bhagalpur', pill: 'Tussar', caption: 'Contemporary — Peacock' },
            ].map((p, i) => (
              <RevealOnScroll key={p.slug} delay={i * 80}>
                <ProductCard
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  meta={p.meta}
                  pill={p.pill}
                  imageCaption={p.caption}
                />
              </RevealOnScroll>
            ))
          )}
        </div>
      </section>

      {/* ===== LOOKBOOK ===== */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <RevealOnScroll>
            <p className="eyebrow">Styled for every occasion</p>
            <h2 className={`serif ${styles.sectionTitle}`}>Lookbook</h2>
          </RevealOnScroll>
          <Link href="/lookbook" className="link">See all looks</Link>
        </div>

        <div className={styles.lookbookGrid}>
          {lookbookItems.length === 0 ? (
            <p style={{ color: '#8C7B6B', fontSize: 14 }}>No lookbook entries yet.</p>
          ) : lookbookItems.map((item: { _id: string; imageUrl: string; caption: string }, i: number) => (
            <RevealOnScroll key={item._id} delay={i * 60}>
              <div className={styles.lookbookItem} style={{ position: 'relative', overflow: 'hidden' }}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.caption} style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                  : <div className="ph" style={{ width: '100%', height: '100%' }} />
                }
                {item.caption && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 16px 16px', background: 'linear-gradient(transparent, rgba(28,18,8,0.55))', color: '#FFF8EE', fontSize: 12, letterSpacing: '0.05em' }}>
                    {item.caption}
                  </div>
                )}
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
