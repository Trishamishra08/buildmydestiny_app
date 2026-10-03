import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Phone, Mail, Key } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';

export const ForgotPasswordView = () => {
  const { navigateTo, addToast } = useStore();
  const [identifier, setIdentifier] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPass, setNewPass] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!identifier) return;
    setIsOtpSent(true);
    addToast(`OTP sent to ${identifier}`, 'info');
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    addToast('Password successfully updated! Please sign in.', 'success');
    navigateTo('login');
  };

  return (
    <div className="page-container no-bottom-nav" style={{ maxWidth: '480px' }}>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem',
          overflow: 'hidden',
        }}
      >
        <button
          onClick={() => navigateTo('login')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary-navy)', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', marginBottom: '1rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <h1 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '4px' }}>
            {isOtpSent ? 'Verify OTP & Reset PIN' : 'Recover Builder Account'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {isOtpSent ? `Enter the 4-digit code sent to ${identifier}` : 'Enter your registered mobile or email to receive a password reset OTP'}
          </p>
        </div>

        {!isOtpSent ? (
          <form onSubmit={handleSendOtp}>
            <div className="form-group">
              <label className="form-label">Registered Mobile or Email</label>
              <input
                type="text"
                required
                placeholder="+91 98260 11223"
                className="form-control"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ fontWeight: '800', marginTop: '1rem' }}>
              Send Verification OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label className="form-label">4-Digit Verification Code</label>
              <input
                type="text"
                maxLength={4}
                required
                placeholder="4829"
                className="form-control"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                style={{ textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem', fontWeight: '800' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ fontWeight: '800', marginTop: '1rem' }}>
              Update Password & Sign In
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordView;
