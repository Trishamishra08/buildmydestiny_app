import React from 'react';
import { ArrowLeft, FileText, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';

export const TermsView = () => {
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

      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        <h1 style={{ fontSize: '1.6rem', color: '#0F172A', fontWeight: '800', margin: '0 0 6px 0' }}>
          Terms & Conditions of Supply
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
          Last Updated: September 2026 • BuildMyDestiny Technologies & Building Logistics Pvt. Ltd.
        </p>
      </div>

      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '2rem 1.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '1.75rem', fontSize: '0.925rem', color: '#334155', lineHeight: '1.7' }}>
        <section>
          <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', marginBottom: '0.5rem' }}>
            1. Scope of Material Supply & Direct Site Delivery
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            BuildMyDestiny acts as an authorized direct-procurement platform facilitating the supply of primary structural construction materials (including Cement, TMT Rebars, AAC Blocks, Sand, Plumbing, Electrical, Tiles, and Tools) directly from certified manufacturer mother plants and logistics hubs to the buyer's specified site.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', marginBottom: '0.5rem' }}>
            2. Site Access, Vehicle Entry & Unloading Protocols
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            It is the responsibility of the purchaser / site contractor to ensure adequate road approach width for heavy commercial carriers (e.g. 10-wheeler dumpers, 12T Eicher carriers, or crane trucks). In cases where heavy entry is restricted by municipal authorities or narrow streets, transshipment onto smaller mini-carriers will be coordinated.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', marginBottom: '0.5rem' }}>
            3. Quality Standards & Manufacturer Test Certificates (MTC)
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            All cement and TMT steel consignments comply strictly with the relevant Bureau of Indian Standards (IS 12269 for OPC 53 Grade Cement, IS 1786:2008 for Fe 550D/500D TMT Rebars). The official batch Manufacturer Test Certificate (MTC) is attached digitally to every dispatched order.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.15rem', color: '#0F172A', fontWeight: '800', marginBottom: '0.5rem' }}>
            4. GST Compliance & Input Tax Credit (ITC)
          </h2>
          <p style={{ color: '#475569', fontSize: '0.88rem', margin: 0 }}>
            All commercial builder purchases are accompanied by 100% compliant B2B tax invoices reflecting the buyer's GSTIN and e-Way bill generated on the national GST portal.
          </p>
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

export default TermsView;
