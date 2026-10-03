import React, { useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import PanelLogin from '../components/PanelLogin';

const fieldStyle = {
  width: '100%',
  padding: '14px 16px',
  borderRadius: 14,
  border: '1.5px solid #CBD5E1',
  background: '#F8FAFC',
  fontFamily: 'inherit',
  fontSize: '0.98rem',
  fontWeight: 600,
  color: '#0F172A',
  outline: 'none',
  boxSizing: 'border-box',
};

/**
 * Customer sign up. Same OTP-only flow as login: name + mobile number + OTP creates the
 * account and signs the customer in. The card chrome is shared with the panel logins.
 */
export const SignupView = () => {
  const { userOtpSignup, navigateTo, addToast } = useStore();
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = useRef([]);

  const setDigit = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) refs.current[index + 1]?.focus();
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

  const submit = async (e) => {
    e.preventDefault();
    if (form.phone.length < 10) return addToast('Please enter a valid 10-digit mobile number', 'warning');
    const code = otp.join('');
    if (code.length !== 6) return addToast('Please enter the 6-digit OTP', 'warning');

    setLoading(true);
    try {
      await userOtpSignup({ name: form.name.trim(), phone: form.phone, email: form.email.trim(), otp: code });
      navigateTo('home');
    } catch (err) {
      addToast(err.message || 'Sign up failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formEl = (
    <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
      <input
        style={fieldStyle}
        type="text"
        required
        placeholder="Full Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderRadius: 14, border: '1.5px solid #CBD5E1', overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', background: '#F1F5F9', borderRight: '1.5px solid #CBD5E1', fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>+91</div>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={10}
          required
          placeholder="Mobile Number"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
          style={{ flex: 1, minWidth: 0, padding: '14px 16px', border: 'none', outline: 'none', background: 'transparent', fontFamily: 'inherit', fontSize: '0.98rem', fontWeight: 600, color: '#0F172A' }}
        />
      </div>

      <input
        style={fieldStyle}
        type="email"
        placeholder="Email (optional)"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

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
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
              }}
              className="bmd-panel-otp"
              autoComplete="one-time-code"
              aria-label={`OTP digit ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <button type="submit" disabled={loading} className="bmd-panel-cta">
        {loading ? 'Please wait...' : 'Create Account'}
      </button>
      <p style={{ margin: 0, fontSize: '0.75rem', color: '#94A3B8', textAlign: 'center' }}>
        By creating an account you agree to our{' '}
        <button type="button" onClick={() => navigateTo('terms')} style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
          Terms &amp; Conditions
        </button>
      </p>
    </form>
  );

  return (
    <PanelLogin
      title="Create Account"
      subtitle="Join Build My Destiny"
      onBack={() => navigateTo('login')}
      customForm={formEl}
      footer={
        <span>
          Already have an account?{' '}
          <button type="button" onClick={() => navigateTo('login')} style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 800, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}>
            Login
          </button>
        </span>
      }
    />
  );
};

export default SignupView;
