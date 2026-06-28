'use client';

import { useState, FormEvent, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

type View = 'signin' | 'register' | 'forgot' | 'enter-otp';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function GoogleButton({ callbackUrl }: { callbackUrl: string }) {
  return (
    <button
      type="button"
      onClick={() => signIn('google', { callbackUrl })}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '14px 24px',
        borderRadius: '100px',
        border: '1px solid var(--hairline)',
        background: 'var(--color-background-primary)',
        color: 'var(--color-text-primary)',
        fontSize: '13px',
        fontWeight: 500,
        letterSpacing: '0.06em',
        cursor: 'pointer',
        transition: 'border-color 0.25s, box-shadow 0.25s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--color-accent-gold)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(201,168,76,.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--hairline)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" fill="#4285F4"/>
        <path d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" fill="#34A853"/>
        <path d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 0 0 0 10.76l3.98-3.09z" fill="#FBBC05"/>
        <path d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0c-4.69 0-8.74 2.7-10.71 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" fill="#EA4335"/>
      </svg>
      Continue with Google
    </button>
  );
}

function Divider() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
      <div style={{ flex: 1, height: '1px', background: 'var(--hairline)' }} />
      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', letterSpacing: '0.06em' }}>or</span>
      <div style={{ flex: 1, height: '1px', background: 'var(--hairline)' }} />
    </div>
  );
}

function LinkButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        color: 'var(--color-accent-gold)',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        textDecoration: 'underline',
      }}
    >
      {children}
    </button>
  );
}

function SignInPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/account';

  const [view, setView] = useState<View>('signin');

  const [signInEmail, setSignInEmail]       = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError]       = useState('');
  const [signInLoading, setSignInLoading]   = useState(false);

  const [regName, setRegName]               = useState('');
  const [regEmail, setRegEmail]             = useState('');
  const [regEmailError, setRegEmailError]   = useState('');
  const [regPhone, setRegPhone]             = useState('');
  const [regPhoneError, setRegPhoneError]   = useState('');
  const [regPassword, setRegPassword]       = useState('');
  const [regConfirm, setRegConfirm]         = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirm, setShowRegConfirm]   = useState(false);
  const [regError, setRegError]             = useState('');
  const [regLoading, setRegLoading]         = useState(false);

  const [forgotEmail, setForgotEmail]       = useState('');
  const [forgotError, setForgotError]       = useState('');
  const [forgotLoading, setForgotLoading]   = useState(false);
  const [sentEmail, setSentEmail]           = useState('');

  const [otpValue, setOtpValue]             = useState('');
  const [otpPassword, setOtpPassword]       = useState('');
  const [otpConfirm, setOtpConfirm]         = useState('');
  const [otpError, setOtpError]             = useState('');
  const [otpLoading, setOtpLoading]         = useState(false);
  const [otpSuccess, setOtpSuccess]         = useState(false);

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    const result = await signIn('user-credentials', {
      email: signInEmail,
      password: signInPassword,
      redirect: false,
    });
    setSignInLoading(false);
    if (result?.error) {
      setSignInError('Invalid email or password.');
      return;
    }
    router.push(callbackUrl);
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    setRegError('');
    setRegEmailError('');
    setRegPhoneError('');

    if (!regName.trim()) { setRegError('Name is required.'); return; }
    if (!EMAIL_RE.test(regEmail)) { setRegEmailError('Please enter a valid email.'); return; }
    if (!/^\+?[0-9]{10,13}$/.test(regPhone.replace(/\s/g, ''))) { setRegPhoneError('Enter a valid 10-digit phone number.'); return; }
    if (regPassword.length < 8) { setRegError('Password must be at least 8 characters.'); return; }
    if (regPassword !== regConfirm) { setRegError('Passwords do not match.'); return; }

    setRegLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName.trim(), email: regEmail, phone: regPhone.trim(), password: regPassword }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setRegError(data.error ?? 'Registration failed.');
        setRegLoading(false);
        return;
      }
      const result = await signIn('user-credentials', {
        email: regEmail,
        password: regPassword,
        redirect: false,
      });
      if (result?.error) {
        setRegError('Account created but sign-in failed. Please sign in manually.');
        setRegLoading(false);
        setView('signin');
        return;
      }
      router.push('/account');
    } catch {
      setRegError('Something went wrong. Please try again.');
      setRegLoading(false);
    }
  }

  async function handleForgot(e: FormEvent) {
    e.preventDefault();
    setForgotError('');
    if (!EMAIL_RE.test(forgotEmail)) { setForgotError('Please enter a valid email.'); return; }
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setForgotError(data.error ?? 'Something went wrong.');
        setForgotLoading(false);
        return;
      }
      setSentEmail(forgotEmail);
      setOtpValue('');
      setOtpPassword('');
      setOtpConfirm('');
      setOtpError('');
      setOtpSuccess(false);
      setView('enter-otp');
    } catch {
      setForgotError('Something went wrong. Please try again.');
    } finally {
      setForgotLoading(false);
    }
  }

  async function handleResetOtp(e: FormEvent) {
    e.preventDefault();
    setOtpError('');
    if (!/^\d{6}$/.test(otpValue)) { setOtpError('Enter the 6-digit OTP from your email.'); return; }
    if (otpPassword.length < 8)    { setOtpError('Password must be at least 8 characters.'); return; }
    if (otpPassword !== otpConfirm) { setOtpError('Passwords do not match.'); return; }
    setOtpLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: sentEmail, otp: otpValue, password: otpPassword }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) { setOtpError(data.error ?? 'Something went wrong.'); return; }
      setOtpSuccess(true);
      setTimeout(() => setView('signin'), 2500);
    } catch {
      setOtpError('Something went wrong. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  }

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

        {view === 'signin' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="serif" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
                Welcome back
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Sign in to access your orders, wishlist and more.
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--hairline)' }} />

            <form onSubmit={handleSignIn} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              />
              {signInError && (
                <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{signInError}</p>
              )}
              <button
                type="submit"
                disabled={signInLoading}
                className="btn btn--gold"
                style={{ width: '100%', opacity: signInLoading ? 0.7 : 1 }}
              >
                {signInLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>

            <Divider />
            <GoogleButton callbackUrl={callbackUrl} />

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              <LinkButton onClick={() => setView('forgot')}>Forgot password?</LinkButton>
            </p>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              New here?{' '}
              <LinkButton onClick={() => setView('register')}>Create an account</LinkButton>
            </p>

            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', lineHeight: 1.6, letterSpacing: '0.02em' }}>
              By signing in you agree to our{' '}
              <a href="/terms" style={{ color: 'var(--color-accent-gold)' }}>Terms</a>{' '}
              and{' '}
              <a href="/privacy" style={{ color: 'var(--color-accent-gold)' }}>Privacy Policy</a>.
            </p>
          </>
        )}

        {view === 'register' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="serif" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
                Create account
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Join VC to explore our curated saree collections.
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--hairline)' }} />

            <form onSubmit={handleRegister} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Full name"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={regEmail}
                  onChange={(e) => { setRegEmail(e.target.value); if (regEmailError) setRegEmailError(''); }}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--hairline)';
                    if (regEmail && !EMAIL_RE.test(regEmail)) setRegEmailError('Please enter a valid email.');
                  }}
                />
                {regEmailError && (
                  <p style={{ fontSize: '12px', color: '#c0392b', margin: 0, textAlign: 'left' }}>{regEmailError}</p>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <input
                  type="tel"
                  placeholder="Phone number (10 digits)"
                  value={regPhone}
                  onChange={(e) => { setRegPhone(e.target.value); if (regPhoneError) setRegPhoneError(''); }}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--hairline)';
                    if (regPhone && !/^\+?[0-9]{10,13}$/.test(regPhone.replace(/\s/g, ''))) {
                      setRegPhoneError('Enter a valid 10-digit phone number.');
                    }
                  }}
                />
                {regPhoneError && (
                  <p style={{ fontSize: '12px', color: '#c0392b', margin: 0, textAlign: 'left' }}>{regPhoneError}</p>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  placeholder="Password (min 8 characters)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showRegPassword ? 'Hide password' : 'Show password'}
                >
                  {showRegPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showRegConfirm ? 'text' : 'password'}
                  placeholder="Confirm password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  required
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowRegConfirm(v => !v)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                    color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center',
                  }}
                  tabIndex={-1}
                  aria-label={showRegConfirm ? 'Hide password' : 'Show password'}
                >
                  {showRegConfirm ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {regError && (
                <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{regError}</p>
              )}
              <button
                type="submit"
                disabled={regLoading}
                className="btn btn--gold"
                style={{ width: '100%', opacity: regLoading ? 0.7 : 1 }}
              >
                {regLoading ? 'Creating account…' : 'Create account'}
              </button>
            </form>

            <Divider />
            <GoogleButton callbackUrl={callbackUrl} />

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Already have an account?{' '}
              <LinkButton onClick={() => setView('signin')}>Sign in</LinkButton>
            </p>
          </>
        )}

        {view === 'forgot' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="serif" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
                Forgot password
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Enter your email and we&apos;ll send you a one-time password.
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--hairline)' }} />

            <form onSubmit={handleForgot} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="email"
                placeholder="Email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
              />
              {forgotError && (
                <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{forgotError}</p>
              )}
              <button
                type="submit"
                disabled={forgotLoading}
                className="btn btn--gold"
                style={{ width: '100%', opacity: forgotLoading ? 0.7 : 1 }}
              >
                {forgotLoading ? 'Sending…' : 'Send OTP'}
              </button>
            </form>

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              <LinkButton onClick={() => setView('signin')}>Back to sign in</LinkButton>
            </p>
          </>
        )}

        {view === 'enter-otp' && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h1 className="serif" style={{ fontSize: '28px', fontWeight: 400, letterSpacing: '0.02em', color: 'var(--color-text-primary)' }}>
                Enter OTP
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                We sent a 6-digit code to{' '}
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{sentEmail}</span>.
                Enter it below along with your new password.
              </p>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'var(--hairline)' }} />

            {otpSuccess ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', lineHeight: 1.6, textAlign: 'center' }}>
                Password updated successfully. Taking you to sign in…
              </p>
            ) : (
              <form onSubmit={handleResetOtp} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="6-digit OTP"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                  style={{ ...inputStyle, letterSpacing: '0.2em', textAlign: 'center', fontSize: '20px' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                />
                <input
                  type="password"
                  placeholder="New password (min 8 characters)"
                  value={otpPassword}
                  onChange={(e) => setOtpPassword(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={otpConfirm}
                  onChange={(e) => setOtpConfirm(e.target.value)}
                  required
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)'; }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--hairline)'; }}
                />
                {otpError && (
                  <p style={{ fontSize: '13px', color: '#c0392b', margin: 0 }}>{otpError}</p>
                )}
                <button
                  type="submit"
                  disabled={otpLoading}
                  className="btn btn--gold"
                  style={{ width: '100%', opacity: otpLoading ? 0.7 : 1 }}
                >
                  {otpLoading ? 'Verifying…' : 'Reset password'}
                </button>
              </form>
            )}

            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Didn&apos;t receive it?{' '}
              <LinkButton onClick={() => setView('forgot')}>Resend OTP</LinkButton>
              {' · '}
              <LinkButton onClick={() => setView('signin')}>Back to sign in</LinkButton>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageInner />
    </Suspense>
  );
}
