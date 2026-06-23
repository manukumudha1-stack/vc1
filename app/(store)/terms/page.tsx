export const metadata = { title: 'Terms of Use — VC' };

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Legal</p>
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 8 }}>Terms of Use</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 40 }}>Last updated: June 2025</p>

      {[
        {
          heading: 'Acceptance of Terms',
          body: 'By accessing or using vc-sarees.com, you agree to be bound by these Terms of Use. If you do not agree, please do not use this website.',
        },
        {
          heading: 'Products & Pricing',
          body: 'All prices are in Indian Rupees (₹) and include GST where applicable. We reserve the right to change prices at any time. Orders are confirmed at the price displayed at the time of purchase.',
        },
        {
          heading: 'Orders & Payment',
          body: 'Placing an order constitutes an offer to purchase. We reserve the right to cancel any order due to stock unavailability, pricing errors, or suspected fraud. Full refunds will be issued for cancelled orders.',
        },
        {
          heading: 'Intellectual Property',
          body: 'All content on this website — including images, text, and design — is the property of VC and may not be reproduced without prior written permission.',
        },
        {
          heading: 'Limitation of Liability',
          body: 'VC shall not be liable for any indirect, incidental, or consequential damages arising from the use of this website or from the purchase of products.',
        },
        {
          heading: 'Governing Law',
          body: 'These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Bengaluru, Karnataka.',
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
