import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ShoppingCart, Wallet, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';

export const MobileHeader = () => {
  const {
    navigateTo,
    cartItemCount,
    currentCity,
    currentPincode,
    setIsLocationModalOpen,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll listener to hide logo and move search bar to top
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 25);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const searchPlaceholders = [
    'Search for Fevicol',
    'Search for Cement',
    'Search for Havells Wires',
    'Search for Action Tesa HDHMR',
    'Search for CenturyPly',
    'Search for Asian Paints',
    'Search for Godrej Locks',
  ];

  // Rotate search placeholder every 2.8 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigateTo('search', { query: searchTerm });
    } else {
      navigateTo('search', { query: searchPlaceholders[placeholderIndex].replace('Search for ', '') });
    }
  };

  return (
    <header
      className="hide-on-desktop"
      style={{
        backgroundColor: '#0A0A0A',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: isScrolled ? '0 3px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.15)',
        transition: 'box-shadow 0.25s ease',
      }}
    >
      {/* Row 1: Left (Logo + Location Pill), Right (Wallet Pill + Cart Icon) */}
      <div
        style={{
          padding: '8px 12px 6px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Left: Brand Logo + Location Pincode Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <Logo onClick={() => navigateTo('home')} size="small" showTagline={false} inverted />

          {/* Location Pincode Pill (Shifted Left next to Logo) */}
          <div
            onClick={() => setIsLocationModalOpen(true)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              padding: '3px 8px',
              backgroundColor: '#1A1A1A',
              borderRadius: '9999px',
              border: '1px solid #333333',
              height: '26px',
              transition: 'var(--transition)',
            }}
            title="Change Delivery Location"
          >
            <span style={{ fontSize: '0.72rem', color: '#FFFFFF', fontWeight: '700', letterSpacing: '-0.01em' }}>
              {currentPincode || '452005'}
            </span>
            <ChevronDown size={11} color="var(--primary-orange)" strokeWidth={2.5} />
          </div>
        </div>

        {/* Right: Dark Cart Icon */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>


          {/* Yellow Cart Circle Button with Black Notification Badge */}
          <button
            onClick={() => navigateTo('cart')}
            style={{
              position: 'relative',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0A0A0A',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              flexShrink: 0,
            }}
          >
            <ShoppingCart size={15} />
            {cartItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: '0.58rem',
                  fontWeight: '900',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #0A0A0A',
                  lineHeight: 1,
                  padding: '1px',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Row 2: Search Bar — Sticks at Top when Scrolled */}
      <div
        style={{
          padding: isScrolled ? '8px 12px 8px 12px' : '0 12px 8px 12px',
          transition: 'padding 0.2s ease',
          backgroundColor: '#0A0A0A',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search size={18} color="var(--text-primary)" strokeWidth={2.2} />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholders[placeholderIndex]}
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid var(--border-medium)',
              borderRadius: '10px',
              padding: '0 36px 0 40px',
              fontSize: '0.92rem',
              color: 'var(--text-primary)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
            }}
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>
    </header>
  );
};

export default MobileHeader;
