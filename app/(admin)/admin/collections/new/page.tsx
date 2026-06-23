import CollectionForm from '@/components/admin/CollectionForm';
import styles from '../../products/products.module.css';

export default function NewCollectionPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>New Collection</h1>
      </div>
      <CollectionForm mode="new" />
    </div>
  );
}
