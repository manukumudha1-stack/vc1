import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import PageContent from '@/components/store/PageContent';
import ComingSoon from '@/components/store/ComingSoon';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Our Heritage — VC' };

export default async function HeritagePage() {
  await connectDB();
  const cfg = await SiteConfigModel.findOne({}).lean();
  const dbContent = cfg?.pageContents?.ourStory ?? '';

  if (dbContent) {
    return (
      <PageContent
        eyebrow="The House of VC"
        title="Our Story"
        content={dbContent}
      />
    );
  }

  return (
    <ComingSoon
      title="Our Heritage"
      subtitle="Discover the stories of master weavers and centuries-old craft traditions."
    />
  );
}
