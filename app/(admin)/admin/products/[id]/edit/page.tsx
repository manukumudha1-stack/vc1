import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import ProductModel from '@/lib/models/Product';
import ProductForm from '@/components/admin/ProductForm';
import styles from '../../products.module.css';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  await connectDB();

  const product = await ProductModel.findById(id).lean();
  if (!product) notFound();

  const serialized = JSON.parse(JSON.stringify(product));

  const initialData = {
    _id: serialized._id,
    slug: serialized.slug,
    name: serialized.name,
    sku: serialized.sku,
    collectionId: serialized.collectionId,
    fabric: serialized.fabric,
    region: serialized.region,
    zariType: serialized.zariType,
    occasion: Array.isArray(serialized.occasion) ? serialized.occasion.join(', ') : '',
    price: serialized.price,
    stockQty: serialized.stockQty,
    blousePiece: serialized.blousePiece,
    weaver: serialized.weaver,
    makerImageUrl: serialized.makerImageUrl ?? '',
    isFeatured: serialized.isFeatured ?? false,
    description: serialized.description,
    story: serialized.story,
    careInstructions: serialized.careInstructions,
    images: (serialized.images ?? []).map((img: { url: string }) => img.url),
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Edit Product</h1>
      </div>
      <ProductForm mode="edit" initialData={initialData} />
    </div>
  );
}
