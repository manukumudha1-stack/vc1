export const metadata = { title: 'Care Instructions — VC' };

export default function CarePage() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      <p className="eyebrow" style={{ marginBottom: 8 }}>Preserve the Weave</p>
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 32 }}>Care Instructions</h1>

      {[
        {
          heading: 'Dry Clean Only',
          body: 'All silk sarees should be dry cleaned to maintain their lustre and prevent shrinkage. Avoid machine wash or hand wash unless the label specifically permits it.',
        },
        {
          heading: 'Storage',
          body: 'Store in a breathable muslin cloth. Avoid plastic covers as they trap moisture. Refold sarees in a different direction every few months to prevent permanent crease lines.',
        },
        {
          heading: 'Sunlight & Heat',
          body: 'Keep silk away from direct sunlight for extended periods — UV exposure fades the colour. Do not iron zari borders directly; use a damp cloth as a buffer or iron on reverse.',
        },
        {
          heading: 'Stains',
          body: 'Blot — never rub — any liquid spills immediately with a clean dry cloth. Take the saree to a professional dry cleaner as soon as possible.',
        },
        {
          heading: 'First Wear',
          body: 'For Kanjivaram and Banarasi silks, avoid contact with perfume, deodorant, or perspiration on the zari border. These can cause tarnishing over time.',
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
