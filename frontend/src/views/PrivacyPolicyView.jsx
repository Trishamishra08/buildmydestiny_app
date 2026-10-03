import React from 'react';
import { ArrowLeft, ShieldCheck, Lock, FileText, CheckCircle2, Building, Mail, Phone } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';

export const PrivacyPolicyView = () => {
  const { navigateTo, user } = useStore();

  return (
    <div className="page-container" style={{ maxWidth: '840px', padding: '1rem 1rem 3rem 1rem', width: '100%' }}>
      {/* Top Header Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #E2E8F0',
          gap: '12px',
        }}
      >
        <button
          type="button"
          onClick={() => navigateTo(user ? 'home' : 'login')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #CBD5E1',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '0.85rem',
            fontWeight: '700',
            color: '#334155',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
          }}
        >
          <ArrowLeft size={16} />
          {user ? 'Back to Home' : 'Back to Sign In'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size="small" />
        </div>
      </div>

      {/* Main Title Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.6rem', color: '#0F172A', fontWeight: '800', margin: '0 0 6px 0' }}>
            Privacy Policy
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
            Effective Date: September 2026 • BuildMyDestiny Technologies & Building Logistics Pvt. Ltd.
          </p>
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#F2F2F2',
            color: '#0A0A0A',
            border: '1px solid #CBD5E1',
            padding: '6px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            fontWeight: '700',
          }}
        >
          <ShieldCheck size={16} />
          100% Data Protection Verified
        </div>
      </div>

      {/* Policy Content Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '2rem 1.75rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.75rem',
          fontSize: '0.925rem',
          color: '#334155',
          lineHeight: '1.7',
        }}
      >
        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Building size={20} color="#FFB800" />
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', margin: 0 }}>
              1. Information We Collect
            </h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            When you register an account or place bulk construction orders on BuildMyDestiny, we collect essential business and site information including:
          </p>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.88rem' }}>
            <li><strong>Contractor & Builder Details:</strong> Full name, firm/company name, contact telephone number, and email.</li>
            <li><strong>Tax & Invoicing Information:</strong> Business GSTIN, Billing Address, and e-Way Bill compliance details for B2B input tax credits.</li>
            <li><strong>Site Logistics Coordinates:</strong> Construction plot/site addresses, landmark, city, 6-digit pincode, and on-site supervisor contact details.</li>
            <li><strong>Transaction Histories:</strong> Material orders, delivery slips, unloading preferences, and digital payment identifiers.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <ShieldCheck size={20} color="#0A0A0A" />
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', margin: 0 }}>
              2. How We Use Your Information
            </h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            Your information is collected solely to provide uninterrupted material dispatch and supply chain services:
          </p>
          <ul style={{ marginTop: '0.5rem', marginBottom: 0, paddingLeft: '1.25rem', color: '#475569', fontSize: '0.88rem' }}>
            <li>Direct procurement from verified cement, steel, and building material manufacturers.</li>
            <li>Real-time heavy transport tracking, route optimization, and crane/manual unloading coordination.</li>
            <li>Generating official digital tax invoices, test certificates (MTC), and warranty documents.</li>
            <li>Security verification and account protection via SMS OTPs.</li>
          </ul>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <Lock size={20} color="#FFB800" />
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', margin: 0 }}>
              3. Payment & Data Security
            </h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            All electronic payments (UPI, Credit/Debit Cards, Net Banking, RTGS/NEFT) are executed via RBI-authorized 256-bit SSL encrypted payment gateways (e.g. Razorpay). <strong>BuildMyDestiny does not store confidential card CVV or banking security PINs on our servers.</strong>
          </p>
        </section>

        <section>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
            <FileText size={20} color="#0A0A0A" />
            <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', margin: 0 }}>
              4. Data Sharing & Third-Party Protections
            </h2>
          </div>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            We do not sell, rent, or trade your personal or contractor business data to any marketing third parties. Delivery coordinates and site supervisor numbers are shared only with the assigned transport driver and depot hub manager solely for order fulfillment.
          </p>
        </section>

        <section style={{ borderTop: '1px solid #F1F5F9', paddingTop: '1.25rem' }}>
          <h2 style={{ fontSize: '1.1rem', color: '#0F172A', fontWeight: '800', marginBottom: '0.5rem' }}>
            5. Contact Our Privacy Officer
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: '0 0 0.5rem 0' }}>
            For privacy inquiries, data deletion requests, or GST profile updates, please contact us:
          </p>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.85rem', color: '#334155' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={16} color="#FFB800" /> support@buildmydestiny.com
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Phone size={16} color="#FFB800" /> +91 98260 11223
            </span>
          </div>
        </section>

        {/* Back to Login Button */}
        <div style={{ textAlign: 'center', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }}>
          <button
            type="button"
            onClick={() => navigateTo(user ? 'home' : 'login')}
            style={{
              backgroundColor: '#FFB800',
              color: '#0A0A0A',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: '700',
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255,184,0,0.35)',
            }}
          >
            {user ? 'Return to Home Store' : 'Return to Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyView;
