import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Truck, Award, FileText, ArrowUpRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';

export const Footer = () => {
  const { navigateTo } = useStore();

  return (
    <footer
      className="hide-on-mobile"
      style={{
        backgroundColor: 'var(--dark-navy)',
        color: '#FFFFFF',
        borderTop: '4px solid var(--primary-orange)',
        marginTop: '4rem',
      }}
    >
      {/* 1. Value Proposition Strip (Sliding Banner on Mobile, 4-Col Grid on Desktop) */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '1.75rem 0' }}>
        <div className="container">
          <div className="footer-slider-container">
            <div className="footer-slider-card flex items-center gap-3">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
                <Truck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>Direct Site Delivery</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Heavy truck & crane unloaded</div>
              </div>
            </div>

            <div className="footer-slider-card flex items-center gap-3">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>100% Tested Materials</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Mill Test Certificates (MTC)</div>
              </div>
            </div>

            <div className="footer-slider-card flex items-center gap-3">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
                <Award size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>Wholesale Bulk Pricing</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Tiered volume contractor rates</div>
              </div>
            </div>

            <div className="footer-slider-card flex items-center gap-3">
              <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 184, 0, 0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
                <FileText size={22} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#FFFFFF' }}>100% GST Tax Invoices</div>
                <div style={{ fontSize: '0.75rem', color: '#94A3B8' }}>Input Tax Credit (ITC) ready</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Footer Links (Responsive Desktop 4-Col, Mobile Stacked) */}
      <div style={{ padding: '3rem 0 2rem 0' }}>
        <div className="container">
          <div className="footer-links-grid" style={{ marginBottom: '2.5rem' }}>
            {/* Column 1: Brand & Contact */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Logo size="medium" inverted={true} onClick={() => navigateTo('home')} />
              <p style={{ color: '#94A3B8', fontSize: '0.84rem', lineHeight: '1.6', maxWidth: '340px' }}>
                India's leading tech-driven construction material e-commerce platform. Supplying cement, steel rebars, bricks, plumbing, and tools directly to builders & contractors.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.84rem', color: '#CBD5E1' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={15} color="#FFB800" />
                  <span>+91 1800 200 8899 (Toll Free)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={15} color="#FFB800" />
                  <span>contractor-sales@buildmydestiny.com</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={15} color="#FFB800" />
                  <span>Central Depot: Super Corridor, Indore - 452005</span>
                </div>
              </div>
            </div>

            {/* Columns 2, 3, 4: In 2-col on Mobile, 3 separate cols on Desktop */}
            <div className="footer-sublinks-mobile-2col" style={{ display: 'contents' }}>
              {/* Column 2: Shop Construction Materials */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shop Materials
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem', color: '#94A3B8' }}>
                  <li><a href="#cement" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'cement' }); }} style={{ color: '#CBD5E1' }}>Cement (OPC 53)</a></li>
                  <li><a href="#tiling" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'tiling' }); }} style={{ color: '#CBD5E1' }}>Tile Adhesives & Grouts</a></li>
                  <li><a href="#paint" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'painting' }); }} style={{ color: '#CBD5E1' }}>Paints & Emulsions</a></li>
                  <li><a href="#wires" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'wires-mcb-distribution' }); }} style={{ color: '#CBD5E1' }}>Havells Copper Wires</a></li>
                  <li><a href="#plywood" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'plywood-mdf-hdhmr' }); }} style={{ color: '#CBD5E1' }}>Plywood & HDHMR</a></li>
                  <li><a href="#fevicol" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'fevicol' }); }} style={{ color: '#CBD5E1' }}>Fevicol SH Adhesives</a></li>
                  <li><a href="#hardware" onClick={(e) => { e.preventDefault(); navigateTo('category-products', { slug: 'hinges-channels-handles' }); }} style={{ color: '#CBD5E1' }}>Hinges & Hardware</a></li>
                </ul>
              </div>

              {/* Column 3: Customer Support & Site Logistics */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Support & Policies
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem', color: '#94A3B8' }}>
                  <li><button onClick={() => navigateTo('help')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Help Center & FAQs</button></li>
                  <li><button onClick={() => navigateTo('orders')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Site Delivery Tracking</button></li>
                  <li><button onClick={() => navigateTo('contact')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Request BOQ Quote</button></li>
                  <li><button onClick={() => navigateTo('profile')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>GST Tax Invoices</button></li>
                  <li><button onClick={() => navigateTo('terms')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Unloading Policy</button></li>
                  <li><button onClick={() => navigateTo('contact')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Helpline & Escalations</button></li>
                </ul>
              </div>

              {/* Column 4: Company & Legal */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#FFFFFF', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Company Info
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.84rem', color: '#94A3B8' }}>
                  <li><button onClick={() => navigateTo('about')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>About BuildMyDestiny</button></li>
                  <li><button onClick={() => navigateTo('vendor')} style={{ background: 'none', color: '#FFB800', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}>Sell on BuildMyDestiny</button></li>
                  <li><button onClick={() => navigateTo('contact')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Headquarters</button></li>
                  <li><button onClick={() => navigateTo('terms')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Terms & Conditions</button></li>
                  <li><button onClick={() => navigateTo('privacy')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Privacy Policy</button></li>
                  <li><button onClick={() => navigateTo('about')} style={{ background: 'none', color: '#CBD5E1', cursor: 'pointer', textAlign: 'left' }}>Logistics Hubs</button></li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Bottom Legal & Tagline Strip */}
          <div
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              paddingTop: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: '0.825rem',
              color: '#64748B',
            }}
          >
            <div>
              © 2026 BuildMyDestiny Technologies Pvt. Ltd. All rights reserved.
            </div>

            <div style={{ color: 'var(--light-orange)', fontWeight: '700', letterSpacing: '0.1em' }}>
              BUILDMYDESTINY – FROM FOUNDATION TO FINISH
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <span>100% Secure B2B Payments</span>
              <span>UPI / RTGS / NEFT / Cards</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
