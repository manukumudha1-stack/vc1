import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import CollectionModel from '@/lib/models/Collection';
import CollectionForm from '@/components/admin/CollectionForm';
import styles from '../../../products/products.module.css';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCollectionPage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();

  const collection = await CollectionModel.findOne({ slug }).lean();
  if (!collection) notFound();

  const serialized = JSON.parse(JSON.stringify(collection));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Edit Collection</h1>
      </div>
      <CollectionForm
        mode="edit"
        initialData={{
          _id: serialized._id,
          slug: serialized.slug,
          name: serialized.name,
          description: serialized.description ?? '',
          coverImageUrl: serialized.coverImageUrl ?? '',
          sortOrder: serialized.sortOrder ?? 0,
        }}
      />
    </div>
  );
}
