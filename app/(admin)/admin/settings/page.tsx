import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import LookbookModel from '@/lib/models/Lookbook';
import SettingsForm from './SettingsForm';
import LookbookSection from './LookbookSection';
import styles from './settings.module.css';

export const dynamic = 'force-dynamic';

const DEFAULT_TRUST = [
  'Free shipping above ₹5,000',
  'Easy 15-day returns',
  'Secure payment',
  '100% authentic handloom',
];

export default async function SettingsPage() {
  await connectDB();

  const [raw, lookbookItems] = await Promise.all([
    SiteConfigModel.findOne({}).lean(),
    LookbookModel.find().sort({ sortOrder: 1, createdAt: -1 }).lean(),
  ]);

  const cfg = raw ? JSON.parse(JSON.stringify(raw)) : null;
  const items = JSON.parse(JSON.stringify(lookbookItems));

  const emptyPageContents = { ourStory: '', theWeavers: '', care: '', shipping: '', returns: '', privacy: '', terms: '' };
  const emptyHeroBanner = { enabled: false, line1: '', line2: '' };

  const initialData = {
    trustItems:   cfg?.trustItems ?? DEFAULT_TRUST,
    pageContents: { ...emptyPageContents, ...(cfg?.pageContents ?? {}) },
    heroBanner:   { ...emptyHeroBanner,   ...(cfg?.heroBanner  ?? {}) },
  };

  return (
    <div className={styles.page}>
      <div className={styles.topbar}>
        <h1 className={styles.pageTitle}>Site Settings</h1>
      </div>
      <SettingsForm initialData={initialData} />
      <LookbookSection items={items} />
    </div>
  );
}
