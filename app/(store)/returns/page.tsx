import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import PageContent from '@/components/store/PageContent';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Returns & Exchange — VC' };

export default async function ReturnsPage() {
  await connectDB();
  const cfg = await SiteConfigModel.findOne({}).lean();
  const dbContent = cfg?.pageContents?.returns ?? '';

  if (dbContent) {
    return <PageContent eyebrow="Hassle-Free" title="Returns & Exchange" content={dbContent} />;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Hassle-Free</p>
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 32 }}>Returns &amp; Exchange</h1>

      {[
        {
          heading: '15-Day Return Window',
          body: 'If you are not satisfied with your purchase, you may request a return within 15 days of delivery. The saree must be unused, unwashed, and returned in its original packaging.',
        },
        {
          heading: 'How to Initiate a Return',
          body: 'Email us at support@vc-sarees.com with your order number and reason for return. Our team will arrange a pickup at no cost to you for qualifying returns.',
        },
        {
          heading: 'Non-Returnable Items',
          body: 'Customised sarees, blouse-stitched orders, and items marked "Final Sale" are not eligible for return or exchange.',
        },
        {
          heading: 'Refunds',
          body: 'Once the returned item is received and inspected, refunds are processed within 5–7 business days to your original payment method. COD refunds are issued as bank transfers.',
        },
        {
          heading: 'Exchange',
          body: 'We offer exchanges for size or colour where stock is available. Please mention "exchange" in your return request and specify the preferred item.',
        },
      ].map((section) => (
        <div key={section.heading} style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>{section.heading}</h2>
          <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{section.body}</p>
        </div>
      ))}
    </div>
  );
}
