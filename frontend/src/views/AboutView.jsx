import React from 'react';
import { ShieldCheck, Truck, Award, Layers, Users, MapPin, HardHat, Building } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';

export const AboutView = () => {
  const { navigateTo } = useStore();

  return (
    <div className="page-container" style={{ maxWidth: '980px' }}>
      {/* Brand Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
          <Logo size="large" showTagline={true} />
        </div>
        <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.8rem' }}>
          India's Dedicated Construction Material Supply Engine
        </h1>
        <p className="page-subtitle" style={{ maxWidth: '720px', margin: '0 auto', fontSize: '1rem' }}>
          BuildMyDestiny simplifies procurement for contractors, builders, and individual home creators by supplying 100% genuine structural materials directly from factory mother plants to construction sites.
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="responsive-split-equal" style={{ gap: '1.5rem', marginBottom: '3rem' }}>
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--light-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)', marginBottom: '1rem' }}>
            <HardHat size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '0.6rem' }}>
            Our Mission: "From Foundation to Finish"
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Construction in India has traditionally suffered from opaque local dealer cartels, delayed dispatches, unverified substandard rebars, and adulterated cement. BuildMyDestiny solves this with digital transparency, certified lab test reports (MTC), wholesale volume discounts, and scheduled crane deliveries.
          </p>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-navy)', marginBottom: '1rem' }}>
            <Truck size={24} />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '0.6rem' }}>
            Tech-Powered Logistics Network
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Operating dedicated distribution depots in Indore, Bhopal, Pithampur, Ujjain, Gwalior, Mumbai, and Delhi NCR. Our heavy fleet includes 10-wheeler dumpers, 12T Eicher carriers, and crane-assisted offloading trucks capable of handling narrow site entries and large commercial projects.
          </p>
        </div>
      </div>

      {/* 4 Pillars of Excellence */}
      <div style={{ backgroundColor: 'var(--dark-navy)', color: '#FFFFFF', borderRadius: 'var(--radius-lg)', padding: '2.5rem 1.75rem', marginBottom: '3rem', borderBottom: '4px solid var(--primary-orange)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', color: '#FFFFFF', fontWeight: '800', marginBottom: '0.4rem' }}>
            The BuildMyDestiny Standard of Excellence
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.9rem' }}>Every metric is measured for project contractors</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>25,000+</div>
            <div style={{ fontSize: '0.8rem', color: '#F2F2F2', marginTop: '4px' }}>Tonnes Material Delivered</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>4,200+</div>
            <div style={{ fontSize: '0.8rem', color: '#F2F2F2', marginTop: '4px' }}>Registered Contractors</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>100%</div>
            <div style={{ fontSize: '0.8rem', color: '#F2F2F2', marginTop: '4px' }}>BIS Certified Materials</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-orange)' }}>60 Mins</div>
            <div style={{ fontSize: '0.8rem', color: '#F2F2F2', marginTop: '4px' }}>Average Dispatch Ready</div>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
        <h3 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '0.5rem' }}>
          Partner with BuildMyDestiny on Your Next Build
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Join over 4,200+ contractors who trust BuildMyDestiny for on-time material supply.
        </p>
        <button
          onClick={() => navigateTo('contact')}
          className="btn btn-primary btn-lg"
          style={{ fontWeight: '800' }}
        >
          Contact Contractor Sales
        </button>
      </div>
    </div>
  );
};

export default AboutView;
