import { redirect } from 'next/navigation';
import Link from 'next/link';
import mongoose from 'mongoose';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import UserModel from '@/lib/models/User';
import ProductModel from '@/lib/models/Product';
import { formatINR } from '@/lib/utils';
import styles from '../page.module.css';
import wishStyles from './page.module.css';

export const dynamic = 'force-dynamic';

type WishlistProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  fabric: string;
  region: string;
  stockQty: number;
  images: { url: string }[];
};

async function getWishlistProducts(email: string): Promise<WishlistProduct[]> {
  await connectDB();
  const user = await UserModel.findOne({ email }).select('wishlist').lean() as { wishlist?: mongoose.Types.ObjectId[] } | null;
  if (!user?.wishlist?.length) return [];

  const products = await ProductModel
    .find({ _id: { $in: user.wishlist as mongoose.Types.ObjectId[] }, isActive: true })
    .select('name slug price fabric region stockQty images')
    .lean();

  return JSON.parse(JSON.stringify(products));
}

export default async function WishlistPage() {
  const session = await auth();
  if (!session?.user?.email) redirect('/auth/signin');

  const products = await getWishlistProducts(session.user.email);

  return (
    <div className={styles.page}>
      <div className={styles.sectionHead} style={{ paddingTop: 0 }}>
        <h1 className={`serif ${styles.sectionTitle}`}>Wishlist</h1>
        <Link href="/account" className="link" style={{ fontSize: 13 }}>
          ← Back to account
        </Link>
      </div>

      <hr className="hairline-rule" style={{ margin: '20px 0 40px' }} />

      {products.length === 0 ? (
        <div className={styles.empty}>
          <p className={`serif ${styles.emptyTitle}`}>Your wishlist is empty</p>
          <p className={styles.emptySub}>Tap the heart on any saree to save it here.</p>
          <Link href="/sarees" className="btn btn--gold" style={{ marginTop: 24 }}>
            Browse sarees
          </Link>
        </div>
      ) : (
        <>
          <p className="caption" style={{ marginBottom: 32, color: 'var(--color-text-secondary)' }}>
            {products.length} saved saree{products.length !== 1 ? 's' : ''}
          </p>
          <div className={wishStyles.grid}>
            {products.map((p) => (
              <Link key={p._id} href={`/products/${p.slug}`} className={wishStyles.card}>
                <div className={wishStyles.imgWrap}>
                  {p.images?.[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    <div className="ph" style={{ width: '100%', height: '100%' }} />
                  )}
                </div>
                <div className={wishStyles.cardBody}>
                  <h3 className={`serif ${wishStyles.cardName}`}>{p.name}</h3>
                  {p.region && <p className={`caption ${wishStyles.cardMeta}`}>{p.region}</p>}
                  <div className={wishStyles.cardRow}>
                    <span className="price">{formatINR(p.price)}</span>
                    {p.stockQty <= 3 && p.stockQty > 0 && (
                      <span className="badge badge--low">Only {p.stockQty} left</span>
                    )}
                    {p.stockQty === 0 && (
                      <span className="badge badge--oos">Sold out</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
