import React, { useRef, useState } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import Logo from './Logo';

/**
 * Shared sign-in screen for the vendor and admin panels. Same look as the customer
 * login (white card, golden CTA, 6-box OTP) so every Build My Destiny surface feels like
 * one product. Sign-in is by mobile OTP only.
 *
 * `onLogin(phone, otp)` resolves to `{ success, message }` (the store's panel login
 * helpers already toast their own errors).
 */

// Shown on dev builds, or when VITE_SHOW_DEMO_LOGIN=true, so testers can sign in with one click.
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';

export default function PanelLogin({
  badge,
  title = 'Welcome Back!',
  subtitle = 'Login to continue',
  demoPhone,
  demoOtp = '123456',
  onLogin,
  onBack,
  footer,
  submitLabel = 'LOGIN',
  customForm = null, // replaces the OTP form (e.g. a registration form) inside the same card
}) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refs = useRef([]);

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
  };

  const onKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) refs.current[index - 1]?.focus();
  };

  const onPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = ['', '', '', '', '', ''];
    pasted.split('').forEach((d, i) => (next[i] = d));
    setOtp(next);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const fillDemo = () => {
    setPhone(demoPhone);
    setOtp(demoOtp.split(''));
    setError('');
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '').slice(-10);
    if (digits.length < 10) return setError('Please enter a valid 10-digit mobile number');
    const code = otp.join('');
    if (code.length !== 6) return setError('Please enter the complete 6-digit OTP');

    setLoading(true);
    try {
      const res = await onLogin(digits, code);
      if (res && res.success === false) setError(res.message || 'Sign in failed. Please try again.');
    } catch (err) {
      setError(err?.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bmd-panel-login-page">
      <style>{`
        .bmd-panel-login-page {
          min-height: 100vh; width: 100%; display: flex; align-items: center; justify-content: center;
          background: #F8FAFC; padding: 1rem; box-sizing: border-box;
          font-family: 'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif;
        }
        .bmd-panel-login-card {
          width: 100%; max-width: 440px; background: #FFFFFF; border-radius: 28px; border: 1px solid #E2E8F0;
          box-shadow: 0 16px 40px -10px rgba(0,0,0,0.08), 0 0 1px rgba(0,0,0,0.05);
          padding: 2.25rem 2rem; box-sizing: border-box;
        }
        @media (max-width: 480px) { .bmd-panel-login-card { padding: 1.75rem 1.25rem; border-radius: 24px; box-shadow: none; } }
        .bmd-panel-otp {
          flex: 1 1 0; min-width: 0; max-width: 52px; height: 52px; border-radius: 12px; border: 1.5px solid #CBD5E1; background: #F8FAFC;
          font-family: 'Montserrat', 'Outfit', sans-serif; font-size: 1.35rem; font-weight: 800; color: #0F172A;
          text-align: center; outline: none; transition: all .18s ease;
        }
        .bmd-panel-otp:focus { border-color: #FFB800; background: #fff; box-shadow: 0 0 0 3px rgba(255,184,0,.22); transform: translateY(-2px); }
        @media (max-width: 380px) { .bmd-panel-otp { height: 46px; font-size: 1.15rem; } }
        .bmd-panel-cta {
          width: 100%; background: linear-gradient(180deg, #FFC815 0%, #FFB300 100%); color: #111; border: none; outline: none;
          font-family: 'Montserrat', 'Outfit', sans-serif; font-size: 1.05rem; font-weight: 900; letter-spacing: .03em;
          text-transform: uppercase; padding: 16px 20px; border-radius: 999px; cursor: pointer;
          box-shadow: 0 8px 20px rgba(255,184,0,.38); transition: all .2s ease;
        }
        .bmd-panel-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 26px rgba(255,184,0,.5); }
        .bmd-panel-cta:disabled { opacity: .7; cursor: not-allowed; }
      `}</style>

      <div className="bmd-panel-login-card">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            title="Back to store"
            style={{ background: '#F1F5F9', border: 'none', borderRadius: '50%', width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#1E293B', marginBottom: '0.75rem' }}
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
        )}

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <Logo size="large" />
          {badge && (
            <div style={{ marginTop: '0.75rem' }}>
              <span style={{ display: 'inline-block', background: '#FFF8E1', border: '1px solid #FFE08A', color: '#0A0A0A', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 999 }}>
                {badge}
              </span>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ margin: '0 0 4px', fontFamily: "'Montserrat', 'Outfit', sans-serif", fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.02em' }}>{title}</h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.92rem', fontWeight: 500 }}>{subtitle}</p>
        </div>

        {customForm || (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: 14, border: '1.5px solid #CBD5E1', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', background: '#F1F5F9', borderRight: '1.5px solid #CBD5E1', color: '#0F172A', fontFamily: "'Montserrat', 'Outfit', sans-serif", fontWeight: 800, fontSize: '0.95rem' }}>
              +91
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              style={{ flex: 1, minWidth: 0, padding: '14px 16px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '0.98rem', fontWeight: 600, color: '#0F172A' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8 }}>
              <ShieldCheck size={16} color="#FF9900" />
              <span>Enter 6-Digit OTP</span>
            </label>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }} onPaste={onPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (refs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => setDigit(i, e.target.value)}
                  onKeyDown={(e) => onKeyDown(i, e)}
                  className="bmd-panel-otp"
                  autoComplete="one-time-code"
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 10, padding: '0.65rem 0.85rem', fontSize: '0.82rem', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="bmd-panel-cta">
            {loading ? 'Please wait...' : submitLabel}
          </button>
        </form>
        )}

        {SHOW_DEMO && demoPhone && !customForm && (
          <button
            type="button"
            onClick={fillDemo}
            style={{ width: '100%', marginTop: '1rem', background: '#FFF8E1', border: '1px dashed #FFB800', borderRadius: 12, padding: '0.6rem 0.75rem', color: '#0A0A0A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Demo access · {demoPhone} · OTP {demoOtp} — <span style={{ color: '#0284C7', fontWeight: 800 }}>tap to fill</span>
          </button>
        )}

        {footer && <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#64748B', fontWeight: 500 }}>{footer}</div>}
      </div>
    </div>
  );
}
