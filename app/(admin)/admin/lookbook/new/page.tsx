import LookbookForm from '@/components/admin/LookbookForm';
import styles from '../../products/products.module.css';

export default function NewLookbookPage() {
  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Add Lookbook Entry</h1>
      </div>
      <LookbookForm mode="new" />
    </div>
  );
}
