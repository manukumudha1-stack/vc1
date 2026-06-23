'use client';

import { useState, FormEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

const inputStyle: React.CSSProperties = {
  padding: '14px 16px',
  border: '1px solid var(--hairline)',
  background: 'var(--color-background-primary)',
  borderRadius: '6px',
  fontFamily: 'inherit',
  width: '100%',
  fontSize: '15px',
  outline: 'none',
  boxSizing: 'border-box',
  color: 'var(--color-text-primary)',
};

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p style={{ fontSize: '14px', color: '#c0392b', textAlign: 'center' }}>
        Invalid link. Please request a new password reset.
      </p>
    );
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
          Your password has been updated successfully.
        </p>
        <a
          href="/auth/signin"
          style={{
            color: 'var(--color-accent-gold)',
            fontSize: '14px',
            textDecoration: 'underline',
          }}
        >
          Sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <input
        type="password"
        placeholder="New password (min 8 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
      />
      <input
        type="password"
        placeholder="Confirm new password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
      />
      {error && (
        <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{error}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="btn btn--gold"
        style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-background-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: 'var(--color-background-ivory)',
          border: '1px solid var(--hairline)',
          borderRadius: '8px',
          padding: '52px 44px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <div
          className="serif"
          style={{
            fontSize: '38px',
            fontWeight: 400,
            letterSpacing: '0.32em',
            color: 'var(--color-text-primary)',
            lineHeight: 1,
          }}
        >
          VC
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <h1 className="serif" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
            Reset password
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            Choose a new password for your VC account.
          </p>
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--hairline)' }} />

        <Suspense fallback={<p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
