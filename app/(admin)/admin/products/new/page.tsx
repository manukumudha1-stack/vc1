import ProductForm from '@/components/admin/ProductForm';
import styles from '../products.module.css';

export default function NewProductPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>New Product</h1>
      </div>
      <ProductForm mode="new" />
    </div>
  );
}
