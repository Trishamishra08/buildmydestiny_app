import React from 'react';
import { ShieldCheck, Store } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';

/** Entry screen of the panel site (VITE_APP_MODE=panel): pick the admin or the vendor panel. */
export default function PanelHome() {
  const { navigateTo } = useStore();
  const option = (view, title, text, Icon) => (
    <button
      onClick={() => navigateTo(view)}
      style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left', padding: '1rem 1.1rem', borderRadius: 16, border: '1.5px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
    >
      <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color="#0A0A0A" />
      </span>
      <span>
        <span style={{ display: 'block', fontWeight: 800, color: '#0F172A', fontSize: '1rem' }}>{title}</span>
        <span style={{ display: 'block', color: '#64748B', fontSize: '0.82rem', marginTop: 2 }}>{text}</span>
      </span>
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '1rem', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#fff', borderRadius: 28, border: '1px solid #E2E8F0', padding: '2.25rem 1.75rem', boxShadow: '0 16px 40px -10px rgba(0,0,0,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Logo size="large" />
          <h1 style={{ margin: '1rem 0 4px', fontSize: '1.5rem', fontWeight: 900, color: '#0F172A' }}>Partner & Admin Portal</h1>
          <p style={{ margin: 0, color: '#64748B', fontSize: '0.9rem' }}>Choose where you want to sign in</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {option('vendor', 'Vendor Panel', 'Manage your products and orders', Store)}
          {option('admin', 'Admin Panel', 'Platform administration (restricted)', ShieldCheck)}
        </div>
      </div>
    </div>
  );
}
