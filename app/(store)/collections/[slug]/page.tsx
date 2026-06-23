import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import ProductModel from '@/lib/models/Product';
import ProductCard from '@/components/store/ProductCard';
import FilterSidebar from '@/components/store/FilterSidebar';
import SortSelect from '@/components/store/SortSelect';
import styles from './page.module.css';

interface SearchParams {
  price?: string;
  zari?: string | string[];
  occasion?: string | string[];
  region?: string | string[];
  sort?: string;
}

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
}

async function getCollectionData(slug: string, searchParams: SearchParams) {
  await connectDB();

  const collection = await CollectionModel.findOne({ slug }).lean();
  if (!collection) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: Record<string, any> = {
    collectionId: (collection as { _id: unknown })._id,
    isActive: true,
  };

  // Price filter
  if (searchParams.price) {
    const [min, max] = searchParams.price.split('-').map(Number);
    query.price = { $gte: min, $lte: max };
  }

  // Zari filter
  const zari = Array.isArray(searchParams.zari) ? searchParams.zari : searchParams.zari ? [searchParams.zari] : [];
  if (zari.length > 0) query.zariType = { $in: zari };

  // Occasion filter
  const occasion = Array.isArray(searchParams.occasion) ? searchParams.occasion : searchParams.occasion ? [searchParams.occasion] : [];
  if (occasion.length > 0) query.occasion = { $in: occasion };

  // Region filter
  const region = Array.isArray(searchParams.region) ? searchParams.region : searchParams.region ? [searchParams.region] : [];
  if (region.length > 0) query.region = { $in: region };

  // Sort
  let sort: Record<string, 1 | -1> = { createdAt: -1 };
  if (searchParams.sort === 'price-asc')  sort = { price: 1 };
  if (searchParams.sort === 'price-desc') sort = { price: -1 };
  if (searchParams.sort === 'newest')     sort = { createdAt: -1 };

  const products = await ProductModel.find(query).sort(sort).lean();

  return {
    collection: JSON.parse(JSON.stringify(collection)),
    products:   JSON.parse(JSON.stringify(products)),
  };
}

function ActiveFilterChips({ searchParams }: { searchParams: SearchParams }) {
  const chips: { label: string; key: string; value: string }[] = [];

  if (searchParams.price) {
    chips.push({ label: `Price: ${searchParams.price.replace('-', ' – ')}`, key: 'price', value: searchParams.price });
  }

  const toArr = (v?: string | string[]) => Array.isArray(v) ? v : v ? [v] : [];
  toArr(searchParams.zari).forEach((v)     => chips.push({ label: v, key: 'zari', value: v }));
  toArr(searchParams.occasion).forEach((v) => chips.push({ label: v, key: 'occasion', value: v }));
  toArr(searchParams.region).forEach((v)   => chips.push({ label: v, key: 'region', value: v }));

  if (chips.length === 0) return null;

  return (
    <div className={styles.activeChips}>
      {chips.map((chip) => (
        <span key={`${chip.key}-${chip.value}`} className={styles.chip}>
          {chip.label}
        </span>
      ))}
    </div>
  );
}

export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug }        = await params;
  const resolvedSP      = await searchParams;
  const data            = await getCollectionData(slug, resolvedSP);

  if (!data) notFound();

  const { collection, products } = data;

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/" className="link">Home</Link>
        <span className={styles.sep}>›</span>
        <Link href="/collections" className="link">Collections</Link>
        <span className={styles.sep}>›</span>
        <span className={styles.current}>{collection.name}</span>
      </div>

      {/* Collection hero */}
      <div className={styles.hero}>
        <div className={`ph ${styles.heroPh}`}>
          <span className="ph__cap">{collection.name}</span>
        </div>
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
          <FilterSidebar />
        </Suspense>

        {/* Main content */}
        <div className={styles.main}>
          {/* Sort + active filters row */}
          <div className={styles.toolbar}>
            <ActiveFilterChips searchParams={resolvedSP} />
            <div className={styles.sortWrap}>
              <label className="caption">Sort:</label>
              <SortSelect current={resolvedSP.sort ?? 'newest'} />
            </div>
          </div>

          {/* Product grid */}
          {products.length === 0 ? (
            <div className={styles.empty}>
              <p className={`serif ${styles.emptyTitle}`}>No sarees match your filters.</p>
              <Link href={`/collections/${slug}`} className="btn btn--outline" style={{ marginTop: 24 }}>
                Clear filters
              </Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {products.map((p: { _id: string; slug: string; name: string; price: number; fabric: string; region: string; stockQty: number }) => (
                <ProductCard
                  key={p._id}
                  name={p.name}
                  slug={p.slug}
                  price={p.price}
                  meta={p.region}
                  pill={p.fabric}
                  pillVariant="silk"
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
