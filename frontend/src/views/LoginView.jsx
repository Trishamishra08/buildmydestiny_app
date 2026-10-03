import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

/**
 * Build My Destiny - Redesigned Customer Login View
 * Matches exact mobile design specification:
 * - Back button & center brand logo
 * - Welcome Back! headline
 * - Mobile Number with +91 country badge
 * - 6-Digit OTP Block Boxes (with auto-focus, paste support, backspace jump)
 * - Remember me
 * - Vibrant Golden Yellow CTA Button
 * - Sign Up link
 *
 * Sign-in is by mobile OTP only: there is no password or social login here.
 */
// Demo credentials are shown on dev builds, or when VITE_SHOW_DEMO_LOGIN=true.
const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';

export default function LoginView() {
  const { userOtpLogin, navigateTo, addToast } = useStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(true);
  const [countdown, setCountdown] = useState(30);

  // 6-digit OTP array state
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer;
    if (otpSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [otpSent, countdown]);

  // Handle single digit OTP input change & auto-advance
  const handleOtpChange = (index, value) => {
    // Only accept numeric digit
    const cleanVal = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otpValues];
    newOtp[index] = cleanVal;
    setOtpValues(newOtp);

    // Auto-focus next input box if filled
    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace navigation in OTP boxes
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpValues[index] && index > 0) {
        otpInputRefs.current[index - 1]?.focus();
      }
    }
  };

  // Handle pasting full 6-digit OTP code into any box
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasteData) return;

    const newOtp = ['', '', '', '', '', ''];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }
    setOtpValues(newOtp);

    // Focus last filled box or next empty
    const nextFocusIndex = Math.min(pasteData.length, 5);
    otpInputRefs.current[nextFocusIndex]?.focus();
  };

  const fillDemo = () => {
    setPhoneNumber('9876543210');
    setOtpValues(['1', '2', '3', '4', '5', '6']);
  };

  // Resend OTP handler
  const handleResendOtp = () => {
    if (countdown > 0) return;
    setCountdown(30);
    setOtpValues(['', '', '', '', '', '']);
    otpInputRefs.current[0]?.focus();
    addToast('OTP sent successfully! (Use demo OTP: 123456)', 'info');
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const cleanPhone = phoneNumber.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      addToast('Please enter a valid 10-digit mobile number', 'warning');
      return;
    }

    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      addToast('Please enter the complete 6-digit OTP', 'warning');
      return;
    }

    setLoading(true);
    try {
      await userOtpLogin(cleanPhone, fullOtp);
      navigateTo('home');
    } catch (err) {
      addToast(err.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8FAFC',
        padding: '1rem',
        fontFamily: "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        .bmd-login-card {
          width: 100%;
          max-width: 440px;
          background: #FFFFFF;
          border-radius: 28px;
          border: 1px solid #E2E8F0;
          box-shadow: 0 16px 40px -10px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.05);
          padding: 2.25rem 2rem;
          position: relative;
          box-sizing: border-box;
        }

        @media (max-width: 480px) {
          .bmd-login-card {
            border-radius: 24px;
            padding: 1.75rem 1.25rem;
            box-shadow: none;
            border: 1px solid #EEF2F6;
          }
        }

        .bmd-otp-box {
          flex: 1 1 0;
          min-width: 0;
          max-width: 52px;
          height: 52px;
          border-radius: 12px;
          border: 1.5px solid #CBD5E1;
          background-color: #F8FAFC;
          font-family: 'Montserrat', sans-serif;
          font-size: 1.35rem;
          font-weight: 800;
          color: #0F172A;
          text-align: center;
          outline: none;
          transition: all 0.18s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .bmd-otp-box:focus {
          border-color: #FFB800;
          background-color: #FFFFFF;
          box-shadow: 0 0 0 3px rgba(255, 184, 0, 0.22);
          transform: translateY(-2px);
        }

        @media (max-width: 380px) {
          .bmd-otp-box {
            height: 46px;
            font-size: 1.15rem;
            border-radius: 10px;
          }
        }

        .bmd-submit-btn {
          width: 100%;
          background: linear-gradient(180deg, #FFC815 0%, #FFB300 100%);
          color: #111111;
          border: none;
          outline: none;
          font-family: 'Montserrat', 'Outfit', sans-serif;
          font-size: 1.05rem;
          font-weight: 900;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          padding: 16px 20px;
          border-radius: 999px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 8px 20px rgba(255, 184, 0, 0.38);
          transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .bmd-submit-btn:hover {
          transform: translateY(-2px);
          background: linear-gradient(180deg, #FFD233 0%, #FFBD14 100%);
          box-shadow: 0 12px 26px rgba(255, 184, 0, 0.5);
        }

        .bmd-submit-btn:active {
          transform: translateY(1px);
          box-shadow: 0 4px 12px rgba(255, 184, 0, 0.3);
        }

        .bmd-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .bmd-social-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        }

        .bmd-social-circle:hover {
          transform: translateY(-2px) scale(1.05);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
          border-color: #CBD5E1;
        }
      `}</style>

      <div className="bmd-login-card">
        {/* Top Bar with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            style={{
              background: '#F1F5F9',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#1E293B',
              transition: 'all 0.15s ease',
            }}
            title="Go Back"
          >
            <ArrowLeft size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* Brand Logo & Identity */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'flex-end',
              gap: '4px',
              height: '36px',
              marginBottom: '8px',
            }}
          >
            {/* Left Bar (Orange/Yellow) */}
            <div
              style={{
                width: '8px',
                height: '22px',
                backgroundColor: '#FF9900',
                borderRadius: '2px 2px 0 0',
              }}
            />
            {/* Center Bar (Tall Charcoal/Black) */}
            <div
              style={{
                width: '8px',
                height: '36px',
                backgroundColor: '#1E293B',
                borderRadius: '2px 2px 0 0',
              }}
            />
            {/* Right Bar (Charcoal/Yellow) */}
            <div
              style={{
                width: '8px',
                height: '18px',
                backgroundColor: '#FFB800',
                borderRadius: '2px 2px 0 0',
              }}
            />
          </div>

          <h2
            style={{
              margin: 0,
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.2rem',
              fontWeight: 900,
              letterSpacing: '0.02em',
              lineHeight: 1.1,
              textTransform: 'uppercase',
            }}
          >
            <span style={{ color: '#0F172A' }}>BUILD MY </span>
            <span style={{ color: '#FF9900' }}>DESTINY</span>
          </h2>

          <p
            style={{
              margin: '3px 0 0 0',
              color: '#64748B',
              fontSize: '0.8rem',
              fontWeight: 500,
            }}
          >
            Construction Made Easy
          </p>
        </div>

        {/* Welcome Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <h1
            style={{
              margin: '0 0 4px 0',
              fontFamily: "'Montserrat', sans-serif",
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#0F172A',
              letterSpacing: '-0.02em',
            }}
          >
            Welcome Back!
          </h1>
          <p
            style={{
              margin: 0,
              color: '#64748B',
              fontSize: '0.92rem',
              fontWeight: 500,
            }}
          >
            Login to continue
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Mobile Number Input Group */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                borderRadius: '14px',
                border: '1.5px solid #CBD5E1',
                overflow: 'hidden',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = '#FFB800')}
              onBlur={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
            >
              {/* +91 Country Badge */}
              <div
                style={{
                  padding: '14px 16px',
                  backgroundColor: '#F1F5F9',
                  borderRight: '1.5px solid #CBD5E1',
                  color: '#0F172A',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>+91</span>
              </div>

              {/* Number Input */}
              <input
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                placeholder="Mobile Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                style={{
                  flex: 1,
                  padding: '14px 16px',
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: '0.98rem',
                  fontWeight: 600,
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* 6 Individual OTP Digit Blocks */}
          <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <label
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    color: '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <ShieldCheck size={16} color="#FF9900" />
                  <span>Enter 6-Digit OTP</span>
                </label>

                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: countdown > 0 ? '#94A3B8' : '#0284C7',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: countdown > 0 ? 'default' : 'pointer',
                    padding: 0,
                  }}
                >
                  {countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>

              {/* 6 OTP Box Slots */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '6px',
                }}
                onPaste={handleOtpPaste}
              >
                {otpValues.map((val, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={val}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="bmd-otp-box"
                    autoComplete="one-time-code"
                  />
                ))}
              </div>
          </div>

          {/* Options: Remember me */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.84rem',
            }}
          >
            {/* Custom Checkbox */}
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: '#334155',
                fontWeight: 600,
              }}
            >
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{
                  accentColor: '#FFB800',
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer',
                }}
              />
              <span>Remember me</span>
            </label>

          </div>

          {/* Main Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="bmd-submit-btn"
          >
            <span>{loading ? 'Please wait...' : 'LOGIN'}</span>
          </button>
        </form>

        {SHOW_DEMO && (
          <button
            type="button"
            onClick={fillDemo}
            style={{ width: '100%', marginTop: '1rem', background: '#FFF8E1', border: '1px dashed #FFB800', borderRadius: 12, padding: '0.6rem 0.75rem', color: '#0A0A0A', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Demo access · 9876543210 · OTP 123456 — <span style={{ color: '#0284C7', fontWeight: 800 }}>tap to fill</span>
          </button>
        )}

        {/* Footer: Create an account */}
        <div
          style={{
            marginTop: '1.5rem',
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#64748B',
            fontWeight: 500,
          }}
        >
          <span>New here? </span>
          <button
            type="button"
            onClick={() => navigateTo('signup')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284C7',
              fontWeight: 800,
              cursor: 'pointer',
              padding: 0,
              fontFamily: 'inherit',
              fontSize: '0.9rem',
            }}
          >
            Create an Account
          </button>
        </div>
      </div>
    </div>
  );
}
