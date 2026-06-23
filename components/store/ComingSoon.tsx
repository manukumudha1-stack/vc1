import Link from 'next/link';

interface Props {
  title: string;
  subtitle?: string;
}

export default function ComingSoon({ title, subtitle }: Props) {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '64px 24px',
    }}>
      <p className="eyebrow" style={{ marginBottom: 12 }}>Coming Soon</p>
      <h1 className="serif" style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', marginBottom: 16 }}>{title}</h1>
      {subtitle && (
        <p style={{ color: 'var(--color-text-muted)', maxWidth: 480, marginBottom: 32 }}>{subtitle}</p>
      )}
      <Link href="/" className="btn btn--gold">Back to Home</Link>
    </div>
  );
}
