import React from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  content: string;
}

function renderContent(text: string) {
  return text
    .split('\n\n')
    .map(block => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith('## ')) {
        return (
          <h2
            key={i}
            style={{ fontSize: '1.15rem', fontWeight: 600, marginTop: 40, marginBottom: 10, color: '#1C1208' }}
          >
            {block.slice(3).trim()}
          </h2>
        );
      }
      return (
        <p key={i} style={{ color: 'var(--color-text-muted)', lineHeight: 1.8, marginBottom: 24 }}>
          {block}
        </p>
      );
    });
}

export default function PageContent({ eyebrow, title, subtitle, content }: Props) {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 24px' }}>
      {eyebrow && <p className="eyebrow" style={{ marginBottom: 8 }}>{eyebrow}</p>}
      <h1 className="serif" style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: subtitle ? 12 : 40 }}>
        {title}
      </h1>
      {subtitle && (
        <p style={{ color: 'var(--color-text-muted)', marginBottom: 40 }}>{subtitle}</p>
      )}
      <div>{renderContent(content)}</div>
    </div>
  );
}
