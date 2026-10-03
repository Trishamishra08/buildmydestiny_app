import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';

export const SignupView = () => {
  const { signup, navigateTo } = useStore();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await signup({
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        role: 'Customer',
      });
      navigateTo('home');
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container no-bottom-nav" style={{ maxWidth: '480px' }}>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          padding: '1.5rem 1.25rem',
          overflow: 'hidden',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.6rem' }}>
            <Logo size="small" />
          </div>
          <h1 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '4px' }}>
            Create Your Account
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Quick sign up to manage site orders, deliveries & e-Invoices
          </p>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: '#F2F2F2', border: '1px solid #CBD5E1', color: '#0A0A0A', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Anand Mehta"
              className="form-control"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Mobile Number *</label>
            <input
              type="tel"
              required
              placeholder="+91 98260 00000"
              className="form-control"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Email Address (Optional)</label>
            <input
              type="email"
              placeholder="name@email.com (optional)"
              className="form-control"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="responsive-split-equal" style={{ gap: '0.75rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.825rem', fontWeight: 700 }}>Confirm Password *</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="form-control"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-lg btn-block"
            style={{ fontWeight: '800', marginTop: '0.5rem' }}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Redirect */}
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already registered on BuildMyDestiny?{' '}
          <button
            type="button"
            onClick={() => navigateTo('login')}
            style={{ background: 'none', border: 'none', color: 'var(--primary-orange)', fontWeight: '800', cursor: 'pointer' }}
          >
            Sign In Here
          </button>
        </div>

        {/* Privacy Policy & Terms Link (Accessible without login) */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '1rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid #F1F5F9',
            fontSize: '0.78rem',
            color: '#64748B',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            onClick={() => navigateTo('privacy')}
            style={{
              background: 'none',
              border: 'none',
              color: '#0A0A0A',
              fontWeight: '700',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
              fontSize: '0.78rem',
            }}
          >
            Privacy Policy
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => navigateTo('terms')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
              fontSize: '0.78rem',
            }}
          >
            Terms of Service
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignupView;
