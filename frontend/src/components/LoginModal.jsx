import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';

export const LoginModal = () => {
  const {
    isLoginModalOpen,
    closeLoginModal,
    loginModalMode,
    setLoginModalMode,
    login,
    userOtpLogin,
        signup,
    navigateTo,
    usersList,
  } = useStore();

  const [mode, setMode] = useState(loginModalMode || 'login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [useOtp, setUseOtp] = useState(false);

  // Sign In Form State
  const [signInIdentifier, setSignInIdentifier] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [otpPhone, setOtpPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  // Sign Up Form State
  const [signUpData, setSignUpData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Sync mode with store when opened
  useEffect(() => {
    if (loginModalMode) {
      setMode(loginModalMode);
    }
    setErrorMsg('');
  }, [loginModalMode, isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  
  // Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (useOtp) {
      if (!otpPhone || !otpCode) {
        setErrorMsg('Please enter your phone number and the OTP.');
        return;
      }
      setLoading(true);
      try {
        await userOtpLogin(otpPhone, otpCode);
      } catch (err) {
        setErrorMsg(err.message || 'OTP login failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!signInIdentifier || !signInPassword) {
      setErrorMsg('Please enter both your registered email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      await login(signInIdentifier, signInPassword);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!signUpData.name || !signUpData.phone || !signUpData.password) {
      setErrorMsg('Please fill in your name, mobile number, and password.');
      return;
    }

    if (signUpData.password !== signUpData.confirmPassword) {
      setErrorMsg('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: signUpData.name,
        phone: signUpData.phone,
        email: signUpData.email,
        password: signUpData.password,
        role: 'Customer',
      });
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out',
      }}
      onClick={closeLoginModal}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          border: '1px solid #E2E8F0',
          animation: 'scaleUp 0.2s ease-out',
          position: 'relative',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Close Button */}
        <button
          onClick={closeLoginModal}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: '#F1F5F9',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#64748B',
            transition: 'all 0.15s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#E2E8F0';
            e.currentTarget.style.color = '#0F172A';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F1F5F9';
            e.currentTarget.style.color = '#64748B';
          }}
          title="Close Dialog"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div
          style={{
            padding: '1.5rem 1.5rem 1rem 1.5rem',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            textAlign: 'center',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
            <Logo size="medium" showTagline={true} />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0A0A0A', margin: '0 0 4px 0' }}>
            {mode === 'login' ? 'Sign In to Your Account' : 'Create Builder Account'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748B', margin: 0 }}>
            {mode === 'login'
              ? 'Access wholesale site rates, live GPS tracking & e-Invoices'
              : 'Direct depot pricing, crane delivery & 100% ITC tax invoice'}
          </p>

          {/* Tab Switcher (Sign In / Register) */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#E2E8F0',
              borderRadius: '10px',
              padding: '3px',
              marginTop: '1rem',
              gap: '4px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginModalMode('login');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem 0',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'login' ? '#FFFFFF' : 'transparent',
                color: mode === 'login' ? '#0A0A0A' : '#64748B',
                fontWeight: mode === 'login' ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLoginModalMode('register');
                setErrorMsg('');
              }}
              style={{
                flex: 1,
                padding: '0.5rem 0',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mode === 'register' ? '#FFFFFF' : 'transparent',
                color: mode === 'register' ? '#0A0A0A' : '#64748B',
                fontWeight: mode === 'register' ? 800 : 600,
                fontSize: '0.825rem',
                cursor: 'pointer',
                boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Register Account
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                backgroundColor: '#F2F2F2',
                border: '1px solid #CBD5E1',
                color: '#0A0A0A',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.825rem',
                marginBottom: '1rem',
                fontWeight: 600,
              }}
            >
              {errorMsg}
            </div>
          )}

          {/* ========================================================= */}
          {/* A. SIGN IN FORM                                           */}
          {/* ========================================================= */}
          {mode === 'login' ? (
            <form onSubmit={handleSignInSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {useOtp ? (
                // OTP login block - shown in place of the email/password fields when toggled on
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Mobile Number
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="tel"
                        required
                        placeholder="Enter phone number"
                        value={otpPhone}
                        onChange={(e) => setOtpPhone(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', color: '#0F172A' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      OTP
                    </label>
                    <div style={{ position: 'relative' }}>
                      <ShieldCheck size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="Enter 6-digit OTP"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        style={{ width: '100%', padding: '0.65rem 0.75rem 0.65rem 2.4rem', borderRadius: '8px', border: '1.5px solid #CBD5E1', fontSize: '0.875rem', outline: 'none', color: '#0F172A', letterSpacing: '0.2em' }}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Mobile Number or Email
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail
                        size={16}
                        color="#94A3B8"
                        style={{ position: 'absolute', left: '12px', top: '12px' }}
                      />
                      <input
                        type="text"
                        required
                        placeholder="+91 98260 11223 or name@company.com"
                        value={signInIdentifier}
                        onChange={(e) => setSignInIdentifier(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.875rem',
                          outline: 'none',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          closeLoginModal();
                          navigateTo('forgot-password');
                        }}
                        style={{ background: 'none', border: 'none', color: '#0A0A0A', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <Lock
                        size={16}
                        color="#94A3B8"
                        style={{ position: 'absolute', left: '12px', top: '12px' }}
                      />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={signInPassword}
                        onChange={(e) => setSignInPassword(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '0.65rem 2.4rem 0.65rem 2.4rem',
                          borderRadius: '8px',
                          border: '1.5px solid #CBD5E1',
                          fontSize: '0.875rem',
                          outline: 'none',
                          color: '#0F172A',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '10px',
                          background: 'none',
                          border: 'none',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          padding: '2px',
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="button"
                onClick={() => { setUseOtp((prev) => !prev); setErrorMsg(''); }}
                style={{ background: 'none', border: 'none', color: '#0A0A0A', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', alignSelf: 'flex-end', marginTop: '-0.5rem' }}
              >
                {useOtp ? 'Use password instead' : 'Use OTP instead'}
              </button>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#FFB800',
                  color: '#0A0A0A',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(255, 184, 0, 0.35)',
                  marginTop: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to BuildMyDestiny'}</span>
                <ArrowRight size={16} />
              </button>

              {/* Google One-Click Sign In */}
              <div style={{ textAlign: 'center', margin: '0.65rem 0 0.4rem 0', position: 'relative' }}>
                <div style={{ borderTop: '1px solid #E2E8F0', position: 'absolute', top: '50%', left: 0, right: 0 }} />
                <span style={{ position: 'relative', background: '#FFFFFF', padding: '0 8px', fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>
                  Or continue with
                </span>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.6rem 1rem',
                  backgroundColor: '#FFFFFF',
                  color: '#1E293B',
                  borderRadius: '8px',
                  border: '1.5px solid #CBD5E1',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.15s ease',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

            </form>
          ) : (
            /* ========================================================= */
            /* B. SIGN UP / REGISTRATION FORM                            */
            /* ========================================================= */
            <form onSubmit={handleSignUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                  Full Name *
                </label>
                <div style={{ position: 'relative' }}>
                  <User
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anand Sharma"
                    value={signUpData.name}
                    onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                  Mobile Number *
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 00000"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                  Email Address (Optional)
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={16}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '12px', top: '12px' }}
                  />
                  <input
                    type="email"
                    placeholder="name@email.com (optional)"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem 0.65rem 2.4rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.875rem',
                      outline: 'none',
                      color: '#0F172A',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.25rem' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={signUpData.confirmPassword}
                    onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <span>{loading ? 'Creating account...' : 'Create BuildMyDestiny Account'}</span>
                <CheckCircle2 size={16} color="#FFB800" />
              </button>

              
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
