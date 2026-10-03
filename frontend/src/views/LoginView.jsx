import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Phone,
  ShieldCheck,
  Check,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

/**
 * Build My Destiny - Redesigned Customer Login View
 * Matches exact mobile design specification:
 * - Back button & center brand logo
 * - Welcome Back! headline
 * - Mobile Number with +91 country badge
 * - 6-Digit OTP Block Boxes (with auto-focus, paste support, backspace jump) & Password toggle
 * - Remember me & Forgot Password
 * - Vibrant Golden Yellow CTA Button
 * - Social login circle buttons (Google, Facebook, Apple)
 * - Sign Up link
 */
export default function LoginView() {
  const { login, userOtpLogin, handleGoogleSignIn, navigateTo, addToast } = useStore();

  const [useOtp, setUseOtp] = useState(true); // Default to modern OTP login
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

    if (useOtp) {
      const fullOtp = otpValues.join('');
      if (fullOtp.length !== 6) {
        addToast('Please enter the complete 6-digit OTP', 'warning');
        return;
      }

      setLoading(true);
      try {
        await userOtpLogin(cleanPhone, fullOtp);
        addToast('Login successful! Welcome to Build My Destiny', 'success');
        navigateTo('home');
      } catch (err) {
        addToast(err.message || 'OTP verification failed. Please try demo OTP: 123456', 'error');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Password Login mode
    if (!password) {
      addToast('Please enter your password', 'warning');
      return;
    }

    setLoading(true);
    try {
      await login(cleanPhone, password);
      addToast('Login successful! Welcome back', 'success');
      navigateTo('home');
    } catch (err) {
      addToast(err.message || 'Login failed. Please verify credentials or use OTP.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async (provider) => {
    if (provider === 'google' && handleGoogleSignIn) {
      try {
        setLoading(true);
        await handleGoogleSignIn();
        navigateTo('home');
      } catch (err) {
        // Handled in store
      } finally {
        setLoading(false);
      }
    } else {
      addToast(`${provider.toUpperCase()} Sign-In will be available soon. Please use Mobile OTP.`, 'info');
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
          width: 48px;
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
            width: 40px;
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

          {/* OTP Mode: 6 Individual Digit Blocks */}
          {useOtp ? (
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
          ) : (
            /* Password Mode */
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                  borderRadius: '14px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 14px',
                  position: 'relative',
                  transition: 'border-color 0.15s ease',
                }}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '14px 0',
                    border: 'none',
                    outline: 'none',
                    backgroundColor: 'transparent',
                    fontFamily: 'inherit',
                    fontSize: '0.98rem',
                    color: '#0F172A',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          {/* Options: Remember me & Forgot Password / Method switch */}
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

            {/* Toggle Switch / Forgot password */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => {
                  setUseOtp((prev) => !prev);
                  setOtpValues(['', '', '', '', '', '']);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#0284C7',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {useOtp ? 'Use Password' : 'Use OTP'}
              </button>

              {!useOtp && (
                <>
                  <span style={{ color: '#CBD5E1' }}>•</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('forgot-password')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#0284C7',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot Password?
                  </button>
                </>
              )}
            </div>
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

        {/* Divider: or continue with */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            margin: '1.75rem 0 1.25rem 0',
            color: '#94A3B8',
            fontSize: '0.82rem',
            fontWeight: 500,
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
          <span style={{ padding: '0 12px' }}>or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
        </div>

        {/* Social Login Circle Buttons (Google, Facebook, Apple) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '1.75rem',
          }}
        >
          {/* Google Button */}
          <button
            type="button"
            className="bmd-social-circle"
            onClick={() => handleSocialClick('google')}
            title="Continue with Google"
            aria-label="Continue with Google"
          >
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </button>

          {/* Facebook Button */}
          <button
            type="button"
            className="bmd-social-circle"
            onClick={() => handleSocialClick('facebook')}
            title="Continue with Facebook"
            aria-label="Continue with Facebook"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#1877F2">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </button>

          {/* Apple Button */}
          <button
            type="button"
            className="bmd-social-circle"
            onClick={() => handleSocialClick('apple')}
            title="Continue with Apple"
            aria-label="Continue with Apple"
          >
            <svg width="20" height="20" viewBox="0 0 170 170" fill="#000000">
              <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.81-11.96-14.34-6.3-9.55-11.16-20.48-14.59-32.8-3.42-12.31-5.14-23.77-5.14-34.37 0-14.78 3.83-27.18 11.49-37.21 7.66-10.02 17.38-15.17 29.17-15.44 4.89 0 10.15 1.25 15.78 3.75 5.63 2.5 9.4 3.79 11.31 3.89 1.52 0 5.48-1.34 11.89-4.03 6.4-2.69 11.77-3.87 16.11-3.56 12.16.89 22.08 5.69 29.76 14.4-10.65 6.41-15.86 15.34-15.63 26.79.23 9.13 3.69 16.73 10.38 22.8 6.69 6.07 14.54 9.61 23.54 10.63-2.17 6.42-4.78 12.93-7.84 19.53zM119.22 31.06c0-7.39 2.66-14.39 7.98-21.01 5.32-6.62 11.89-10.05 19.7-10.05.22 1.09.33 2.07.33 2.94 0 7.39-2.77 14.34-8.31 20.85-5.54 6.51-12.27 10.02-20.19 10.53-.22-1.09-.33-2.18-.33-3.26z" />
            </svg>
          </button>
        </div>

        {/* Footer: Create an account */}
        <div
          style={{
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
