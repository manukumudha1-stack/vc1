import Link from 'next/link';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';

async function getCollections() {
  await connectDB();
  return CollectionModel.find({}).sort({ name: 1 }).lean();
}

export const metadata = { title: 'All Collections — VC' };

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ textAlign: 'center', marginBottom: 8 }}>Curated Weaves</p>
      <h1 className="serif" style={{ textAlign: 'center', fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>
        All Collections
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', maxWidth: 560, margin: '0 auto 48px' }}>
        Explore our range of handpicked silk sarees — each collection tells a distinct story of craft and heritage.
      </p>

      {collections.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>No collections available yet.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 32,
        }}>
          {collections.map((col) => (
            <Link
              key={String(col._id)}
              href={`/collections/${col.slug}`}
              style={{
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid var(--color-border)',
                borderRadius: 4,
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
              }}
            >
              {/* Placeholder image area */}
              <div style={{
                aspectRatio: '4/3',
                background: 'var(--color-surface-warm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {(col as { coverImage?: string }).coverImage ? (
                  <img
                    src={(col as { coverImage?: string }).coverImage}
                    alt={col.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: 48, opacity: 0.15 }}>◈</span>
                )}
              </div>
              <div style={{ padding: '20px 24px' }}>
                <p className="eyebrow" style={{ marginBottom: 6, fontSize: 11 }}>Collection</p>
                <h2 className="serif" style={{ fontSize: '1.25rem', marginBottom: 8 }}>{col.name}</h2>
                {(col as { description?: string }).description && (
                  <p style={{
                    fontSize: 14,
                    color: 'var(--color-text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {(col as { description?: string }).description}
                  </p>
                )}
                <span className="link" style={{ marginTop: 12, display: 'inline-block', fontSize: 14 }}>
                  View sarees →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
