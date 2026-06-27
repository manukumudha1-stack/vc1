import { connectDB } from '@/lib/db';
import LookbookModel from '@/lib/models/Lookbook';
import RevealOnScroll from '@/components/store/RevealOnScroll';
import HeroCanvas from '@/components/store/HeroCanvas';
import styles from './lookbook.module.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Lookbook — VC' };

export default async function LookbookPage() {
  await connectDB();
  const items = await LookbookModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
  const serialized: { _id: string; imageUrl: string; caption: string }[] = JSON.parse(JSON.stringify(items));

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <HeroCanvas />
        <div className={styles.heroContent}>
          <p className="eyebrow">Styled for every occasion</p>
          <h1 className={`serif ${styles.heroTitle}`}>Lookbook</h1>
        </div>
      </section>

      <section className={styles.grid}>
        {serialized.length === 0 ? (
          <div className={styles.empty}>
            <p>No lookbook entries yet. Check back soon.</p>
          </div>
        ) : (
          serialized.map((item, i) => (
            <RevealOnScroll key={item._id} delay={i * 50}>
              <div className={styles.item}>
                {item.imageUrl
                  ? <img src={item.imageUrl} alt={item.caption} className={styles.image} />
                  : <div className={`ph ${styles.image}`} />
                }
                {item.caption && (
                  <div className={styles.caption}>{item.caption}</div>
                )}
              </div>
            </RevealOnScroll>
          ))
        )}
      </section>
    </div>
  );
}
