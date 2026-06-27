import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import ProductCard from '@/components/store/ProductCard';
import FilterSidebar from '@/components/store/FilterSidebar';
import SortSelect from '@/components/store/SortSelect';
import HeroCanvas from '@/components/store/HeroCanvas';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface SearchParams {
  price?: string;
  sort?: string;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

async function getCollectionData(slug: string, searchParams: SearchParams) {
  await connectDB();

  const [collection, allCollections] = await Promise.all([
    CollectionModel.findOne({ slug }).lean(),
    CollectionModel.find({}).sort({ sortOrder: 1, name: 1 }).lean(),
  ]);

  if (!collection) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    collectionId: (collection as { _id: unknown })._id,
    isActive: true,
  };

  if (searchParams.price) {
    const [min, max] = searchParams.price.split('-').map(Number);
    query.price = { $gte: min, $lte: max };
  }

  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (searchParams.sort === 'price-asc')  sort = { price: 1 };
  if (searchParams.sort === 'price-desc') sort = { price: -1 };
  if (searchParams.sort === 'newest')     sort = { createdAt: -1 };

  const products = await ProductModel.find(query).sort(sort).lean();

  return {
    collection:     JSON.parse(JSON.stringify(collection)),
    allCollections: JSON.parse(JSON.stringify(allCollections)),
    products:       JSON.parse(JSON.stringify(products)),
  };
}

function ActiveFilterChips({ searchParams }: { searchParams: SearchParams }) {
  if (!searchParams.price) return null;

  const [min, max] = searchParams.price.split('-').map(Number);
  const fmt = (v: number) => v >= 100000 ? '₹1,00,000+' : '₹' + v.toLocaleString('en-IN');

  return (
    <div className={styles.activeChips}>
      <span className={styles.chip}>
        Price: {fmt(min)} – {fmt(max)}
      </span>
    </div>
  );
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug }   = await params;
  const resolvedSP = await searchParams;
  const data       = await getCollectionData(slug, resolvedSP);

  if (!data) notFound();

  const { collection, allCollections, products } = data;

  return (
    <div className={styles.page}>
      {/* Collection hero */}
      <div className={styles.hero}>
        <HeroCanvas />
        <div className={styles.heroOverlay}>
          <p className="eyebrow">{products.length} pieces</p>
          <h1 className={`serif ${styles.heroTitle}`}>{collection.name}</h1>
          {collection.description && (
            <p className={styles.heroDesc}>{collection.description}</p>
          )}
        </div>
      </div>

      {/* Body: sidebar + grid */}
      <div className={styles.body}>
        {/* Sidebar */}
        <Suspense fallback={<div className={styles.sidebarSkeleton} />}>
          <FilterSidebar
            collections={allCollections.map((c: { slug: string; name: string }) => ({ slug: c.slug, name: c.name }))}
            currentSlug={slug}
          />
        </Suspense>

        {/* Main content */}
        <div className={styles.main}>
          <div className={styles.toolbar}>
            <ActiveFilterChips searchParams={resolvedSP} />
            <div className={styles.sortWrap}>
              <label className="caption">Sort:</label>
              <SortSelect current={resolvedSP.sort ?? 'newest'} />
            </div>
          </div>

          {products.length === 0 ? (
            <div className={styles.empty}>
              <p className={`serif ${styles.emptyTitle}`}>No sarees match your filters.</p>
              <Link href={`/collections/${slug}`} className="btn btn--outline" style={{ marginTop: 24 }}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((p: { _id: string; slug: string; name: string; price: number; fabric: string; region: string; stockQty: number; images?: { url: string }[] }) => (
                <ProductCard
                  key={p._id}
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
