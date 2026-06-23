export const metadata = { title: 'Shipping Policy — VC' };

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Delivery</p>
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 32 }}>Shipping Policy</h1>

      {[
        {
          heading: 'Free Shipping',
          body: 'Orders above ₹5,000 qualify for complimentary shipping across India. A flat shipping charge of ₹199 applies to orders below ₹5,000.',
        },
        {
          heading: 'Delivery Timeline',
          body: 'Orders are dispatched within 1–2 business days. Delivery typically takes 3–7 business days depending on your location. Remote areas may take up to 10 business days.',
        },
        {
          heading: 'Order Tracking',
          body: 'Once dispatched, you will receive an SMS and email with tracking details. You can also view your order status on the My Orders page.',
        },
        {
          heading: 'Cash on Delivery',
          body: 'COD is available across most serviceable pincodes. A COD handling fee of ₹50 may apply. Verify serviceability by entering your pincode on the product page.',
        },
        {
          heading: 'International Shipping',
          body: 'We currently ship only within India. International shipping is coming soon — sign up for updates.',
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
