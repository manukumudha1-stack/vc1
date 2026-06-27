import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import PageContent from '@/components/store/PageContent';
import ComingSoon from '@/components/store/ComingSoon';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'The Weavers — VC' };

export default async function WeaversPage() {
  await connectDB();
  const cfg = await SiteConfigModel.findOne({}).lean();
  const dbContent = cfg?.pageContents?.theWeavers ?? '';

  if (dbContent) {
    return (
      <PageContent
        eyebrow="The Artisans"
        title="The Weavers"
        content={dbContent}
      />
    );
  }

  return <ComingSoon title="The Weavers" subtitle="Meet the artisans behind every thread." />;
}
