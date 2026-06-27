import { connectDB } from '@/lib/db';
import SiteConfigModel from '@/lib/models/SiteConfig';
import PageContent from '@/components/store/PageContent';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Privacy Policy — VC' };

export default async function PrivacyPage() {
  await connectDB();
  const cfg = await SiteConfigModel.findOne({}).lean();
  const dbContent = cfg?.pageContents?.privacy ?? '';

  if (dbContent) {
    return <PageContent eyebrow="Legal" title="Privacy Policy" content={dbContent} />;
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Legal</p>
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 8 }}>Privacy Policy</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 40 }}>Last updated: June 2025</p>

      {[
        {
          heading: 'Information We Collect',
          body: 'We collect information you provide directly — such as your name, email, phone, and shipping address when you place an order or create an account. We also collect browsing data via cookies to improve your experience.',
        },
        {
          heading: 'How We Use Your Information',
          body: 'Your information is used to process orders, send order updates, respond to customer service requests, and improve our platform. We do not sell your personal data to third parties.',
        },
        {
          heading: 'Data Security',
          body: 'We use industry-standard encryption (TLS) for all data transmission. Payment information is processed securely and is never stored on our servers.',
        },
        {
          heading: 'Cookies',
          body: 'We use essential cookies to keep your cart and session active. Analytics cookies help us understand usage patterns. You may disable non-essential cookies via your browser settings.',
        },
        {
          heading: 'Your Rights',
          body: 'You may request access to, correction of, or deletion of your personal data at any time by contacting support@vc-sarees.com.',
        },
        {
          heading: 'Contact',
          body: 'For privacy-related queries, write to: privacy@vc-sarees.com. We aim to respond within 72 hours.',
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
