import Link from 'next/link';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import { formatINR } from '@/lib/utils';
import ProductCard from '@/components/store/ProductCard';
import RevealOnScroll from '@/components/store/RevealOnScroll';
import HeroCanvas from '@/components/store/HeroCanvas';
import styles from './page.module.css';

async function getHomeData() {
  try {
    await connectDB();

    const [collections, featuredProducts] = await Promise.all([
      CollectionModel.find({}).sort({ sortOrder: 1 }).limit(4).lean(),
      ProductModel.find({ isActive: true }).sort({ createdAt: -1 }).limit(4).lean(),
    ]);

    return {
      collections: JSON.parse(JSON.stringify(collections)),
      featuredProducts: JSON.parse(JSON.stringify(featuredProducts)),
    };
  } catch {
    return { collections: [], featuredProducts: [] };
  }
}

/* LOOKBOOK placeholders */
const LOOKBOOK_ITEMS = [
  { caption: 'Bridal — Kanjivaram Ruby' },
  { caption: 'Heritage — Banarasi Gold' },
  { caption: 'Festive — Peacock Teal' },
  { caption: 'Casual — Chanderi Ivory' },
  { caption: 'Wedding — Temple Red' },
  { caption: 'Contemporary — Sage' },
];

export default async function HomePage() {
  const { collections, featuredProducts } = await getHomeData();

  return (
    <div className={styles.page}>
      {/* ===== HERO ===== */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <HeroCanvas />
        </div>
        <div className={styles.heroContent}>
          <h1 className={`serif ${styles.heroH1}`}>
            Woven in gold.<br />
            Worn through generations.
          </h1>
          <p className={styles.heroSub}>
            Each saree carries a story of heritage, artistry, and timeless elegance.
          </p>
          <div className={styles.heroCtas}>
            <Link href="/collections/ilkal-silk" className="btn btn--gold">
              Explore Collections
            </Link>
            <Link href="/heritage" className="btn btn--ghost">
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* ===== TRUST STRIP ===== */}
      <RevealOnScroll className={styles.trustStrip}>
        <div className={styles.trustInner}>
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
            <span>Free shipping above ₹5,000</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>Easy 15-day returns</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Secure payment</span>
          </div>
          <div className={styles.trustDivider} />
          <div className={styles.trustItem}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            <span>100% authentic handloom</span>
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
        </div>

        <div className={styles.collectionsGrid}>
          {collections.length > 0 ? (
            collections.map((col: { _id: string; slug: string; name: string; description: string }, i: number) => (
              <RevealOnScroll key={col._id} delay={i * 80}>
                <Link href={`/collections/${col.slug}`} className={styles.collectionTile}>
                  <div className={`ph ${styles.collectionPh}`}>
                    <span className="ph__cap">{col.name}</span>
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
          <Link href="/collections" className="link">View all</Link>
        </div>

        <div className={styles.productsGrid}>
          {featuredProducts.length > 0 ? (
            featuredProducts.map((p: { _id: string; slug: string; name: string; price: number; fabric: string; region: string; stockQty: number }, i: number) => (
              <RevealOnScroll key={p._id} delay={i * 80}>
                <ProductCard
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  meta={p.region}
                  pill={p.fabric}
                  pillVariant="silk"
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

      {/* ===== CRAFT SECTION ===== */}
      <section className={styles.craftSection}>
        <div className={styles.craftContent}>
          <RevealOnScroll>
            <p className="eyebrow">The art of handloom</p>
            <h2 className={`serif ${styles.craftTitle}`}>
              Six yards of living heritage
            </h2>
            <p className={styles.craftBody}>
              Every VC saree is hand-woven by master weavers who have inherited their craft
              through generations. From selecting the finest mulberry silk to threading the
              loom with real gold zari, each saree takes four to six weeks to complete.
            </p>
            <Link href="/heritage" className="btn btn--outline" style={{ marginTop: '32px', display: 'inline-flex' }}>
              Discover the craft
            </Link>
          </RevealOnScroll>
        </div>
        <div className={styles.craftImage}>
          <div className={`ph ${styles.craftPh}`}>
            <span className="ph__cap">Weaver at loom — Kanchipuram</span>
          </div>
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
          {LOOKBOOK_ITEMS.map((item, i) => (
            <RevealOnScroll key={item.caption} delay={i * 60}>
              <div className={`ph ${styles.lookbookItem}`}>
                <span className="ph__cap">{item.caption}</span>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </div>
  );
}
