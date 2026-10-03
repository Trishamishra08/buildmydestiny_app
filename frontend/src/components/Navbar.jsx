import React from 'react';
import { Wrench, Calendar, ShieldCheck, User, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../controllers/useAuth';

export const Navbar = ({ currentTab, setCurrentTab, onOpenAuthModal }) => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'mistris', label: 'Find Mistris' },
    { id: 'bookings', label: 'My Bookings' },
  ];

  const handleNavClick = (tabId) => {
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-subtle)', borderRadius: 0 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '72px' }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNavClick('home')} 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
        >
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0b0f19',
            boxShadow: '0 4px 14px rgba(245, 158, 11, 0.4)'
          }}>
            <Wrench size={22} strokeWidth={2.5} />
          </div>
          <div>
            <div style={{ fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #ffffff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              BUILD MY DESTINY<span style={{ color: '#f59e0b', WebkitTextFillColor: '#f59e0b' }}>.</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '-4px' }}>
              Expert Handyman Network
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                background: 'none',
                color: currentTab === item.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: currentTab === item.id ? '700' : '500',
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'var(--transition)',
                padding: '0.5rem 0',
                borderBottom: currentTab === item.id ? '2px solid var(--primary)' : '2px solid transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right CTA / Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => handleNavClick('bookings')}
                className="btn btn-secondary btn-sm"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Calendar size={15} />
                <span>My Bookings</span>
              </button>
              <div 
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#f59e0b', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: '600', maxWidth: '110px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <button
                  onClick={logout}
                  title="Logout"
                  style={{ background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.55rem 1.2rem' }}
            >
              <User size={16} />
              <span>Login / Register</span>
            </button>
          )}

          {/* Mobile hamburger button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="mobile-toggle-btn"
            style={{ display: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-card)' }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 0',
                color: currentTab === item.id ? 'var(--primary)' : 'var(--text-primary)',
                fontWeight: currentTab === item.id ? '700' : '500',
                background: 'transparent',
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};

export default Navbar;
