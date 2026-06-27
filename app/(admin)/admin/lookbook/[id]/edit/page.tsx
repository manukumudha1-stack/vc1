import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import LookbookModel from '@/lib/models/Lookbook';
import LookbookForm from '@/components/admin/LookbookForm';
import styles from '../../../products/products.module.css';

export const dynamic = 'force-dynamic';

export default async function EditLookbookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();
  const item = await LookbookModel.findById(id).lean();
  if (!item) notFound();
  const data = JSON.parse(JSON.stringify(item));

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Edit Lookbook Entry</h1>
      </div>
      <LookbookForm
        mode="edit"
        initialData={{
          _id:       data._id,
          imageUrl:  data.imageUrl,
          caption:   data.caption,
          sortOrder: data.sortOrder,
          isActive:  data.isActive,
        }}
      />
    </div>
  );
}
