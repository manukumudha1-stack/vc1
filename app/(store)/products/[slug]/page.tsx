import { notFound } from 'next/navigation';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import CollectionModel from '@/lib/models/Collection';
import { formatINR, stockStatus } from '@/lib/utils';
import GalleryClient from '@/components/store/GalleryClient';
import PincodeCheck from '@/components/store/PincodeCheck';
import PDPActions from '@/components/store/PDPActions';
import PDPAccordion from '@/components/store/PDPAccordion';
import ProductCard from '@/components/store/ProductCard';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProductData(slug: string) {
  await connectDB();

  const product = await ProductModel.findOne({ slug, isActive: true }).lean();
  if (!product) return null;

  const p = product as typeof product & { _id: unknown; collectionId: unknown };

  const [collection, related] = await Promise.all([
    CollectionModel.findById(p.collectionId).lean(),
    ProductModel.find({
      collectionId: p.collectionId,
      isActive: true,
      slug: { $ne: slug },
    })
      .limit(4)
      .lean(),
  ]);

  return {
    product:    JSON.parse(JSON.stringify(product)),
    collection: JSON.parse(JSON.stringify(collection)),
    related:    JSON.parse(JSON.stringify(related)),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const data     = await getProductData(slug);
  if (!data) notFound();

  const { product: p, collection, related } = data;

  const stock  = stockStatus(p.stockQty);
  const images = p.images ?? [];

  const accordionItems = [
    ...(p.careInstructions ? [{ title: 'Care Instructions', content: p.careInstructions }] : []),
    { title: 'Fabric & Weave', content: `Fabric: ${p.fabric || 'Silk'}\nWeave: ${p.zariType || 'Traditional'}\nRegion: ${p.region || '—'}` },
    { title: 'Shipping & Returns', content: 'Free shipping on orders above ₹5,000. Delivered in 5–7 business days.\n\nEasy 15-day returns on unworn, unwashed sarees with original packaging.' },
  ];

  return (
    <div className={styles.page}>
      {/* Main grid */}
      <div className={styles.main}>
        {/* Gallery */}
        <div className={styles.galleryCol}>
          <GalleryClient images={images} productName={p.name} />
        </div>

        {/* Info */}
        <div className={styles.infoCol}>
          {/* Region badge */}
          {p.region && (
            <span className={`badge badge--instock ${styles.regionBadge}`}>{p.region}</span>
          )}

          <h1 className={`serif ${styles.title}`}>{p.name}</h1>

          {/* Pills */}
          <div className={styles.pills}>
            {p.fabric && <span className="pill pill--silk">{p.fabric}</span>}
            {p.zariType && <span className="pill pill--cotton">{p.zariType}</span>}
            {(p.occasion ?? []).slice(0, 2).map((occ: string) => (
              <span key={occ} className="pill pill--crepe">{occ}</span>
            ))}
          </div>

          {/* Price */}
          <p className={`price ${styles.price}`}>{formatINR(p.price)}</p>

          {/* Stock */}
          {stock === 'low' && p.stockQty > 0 && (
            <p className={`badge badge--low ${styles.stockBadge}`}>
              Only {p.stockQty} left
            </p>
          )}
          {stock === 'out' && (
            <p className={`badge badge--out ${styles.stockBadge}`}>Out of stock</p>
          )}

          {/* Description */}
          {p.description && (
            <p className={styles.description}>{p.description}</p>
          )}

          {/* Add to bag / wishlist */}
          {stock !== 'out' && (
            <PDPActions
              productId={p._id}
              name={p.name}
              sku={p.sku}
              price={p.price}
              imageUrl={images[0]?.url}
            />
          )}

          {/* Spec table */}
          <table className={styles.specTable}>
            <tbody>
              {p.fabric && (
                <tr>
                  <td className={styles.specKey}>Fabric</td>
                  <td className={styles.specVal}>{p.fabric}</td>
                </tr>
              )}
              {p.zariType && (
                <tr>
                  <td className={styles.specKey}>Zari</td>
                  <td className={styles.specVal}>{p.zariType}</td>
                </tr>
              )}
              {p.blousePiece && (
                <tr>
                  <td className={styles.specKey}>Blouse Piece</td>
                  <td className={styles.specVal}>
                    {p.blousePiece === 'included' ? 'Included' : p.blousePiece === 'on_request' ? 'On request' : 'Not included'}
                  </td>
                </tr>
              )}
              {p.weaver && (
                <tr>
                  <td className={styles.specKey}>Weaver</td>
                  <td className={styles.specVal}>{p.weaver}</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pincode check */}
          <PincodeCheck />

          {/* Accordion */}
          <PDPAccordion items={accordionItems} />
        </div>
      </div>

      {/* Story section */}
      {(p.story || p.makerImageUrl) && (
        <section className={styles.story}>
          <div className={styles.storyInner}>
            <p className="eyebrow">The story behind</p>
            <h2 className={`serif ${styles.storyTitle}`}>Maker's Note</h2>
            <p className={styles.storyText}>{p.story}</p>
          </div>
          <div className={`ph ${styles.storyImage}`}>
            {(() => {
              const src = p.makerImageUrl || images[0]?.url;
              return src
                ? <img src={src} alt={p.makerImageUrl ? `${p.weaver || 'Maker'} — ${p.name}` : p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                : <span className="ph__cap">{p.name} — Detail</span>;
            })()}
          </div>
        </section>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.relatedHead}>
            <p className="eyebrow">From the same collection</p>
            <h2 className={`serif ${styles.relatedTitle}`}>You may also love</h2>
          </div>
          <div className={styles.relatedGrid}>
            {related.map((r: { _id: string; slug: string; name: string; price: number; fabric: string; region: string; stockQty: number; images?: { url: string }[] }) => (
              <ProductCard
                key={r._id}
                name={r.name}
                slug={r.slug}
                price={r.price}
                meta={r.region}
                pill={r.fabric}
                pillVariant="silk"
                imageUrl={r.images?.[0]?.url}
                hoverImageUrl={r.images?.[1]?.url}
                imageCaption={r.name}
                urgency={r.stockQty <= 3 ? r.stockQty : undefined}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
