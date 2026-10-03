import React, { useState } from 'react';
import { Search, ChevronDown, ShoppingCart, Bell, SlidersHorizontal, MapPin } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from './Logo';


export const MobileHeader = () => {
  const {
    navigateTo,
    cartItemCount,
    currentCity,
    setIsLocationModalOpen,
  } = useStore();

  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigateTo('search', { query: searchTerm });
    } else {
      navigateTo('search', { query: 'cement' });
    }
  };

  const displayCity = currentCity || 'Indore';

  return (
    <header
      className="hide-on-desktop"
      style={{
        backgroundColor: '#FFFFFF',
        position: 'sticky',
        top: 0,
        zIndex: 900,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        borderBottom: '1px solid #F3F4F6',
      }}
    >
      {/* Row 1: Logo (Left), Location (Center), Notification & Cart (Right) */}
      <div
        style={{
          padding: '10px 14px 6px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        {/* Left: Brand Logo */}
        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
          <Logo onClick={() => navigateTo('home')} size="small" showTagline={false} inverted={false} width={115} height={34} />
        </div>

        {/* Center: Location Selector (📍 Indore, MP ˅) */}
        <div
          onClick={() => setIsLocationModalOpen(true)}
          style={{
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '4px 6px',
            userSelect: 'none',
          }}
          title="Change Delivery Location"
        >
          <MapPin size={16} color="#FFB800" fill="#FFB800" strokeWidth={1.5} />
          <span
            style={{
              fontSize: '0.84rem',
              color: '#111827',
              fontWeight: '700',
              letterSpacing: '-0.01em',
            }}
          >
            {displayCity}, MP
          </span>
          <ChevronDown size={14} color="#111827" strokeWidth={2.5} />
        </div>

        {/* Right: Notification Bell & Shopping Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0 }}>
          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => navigateTo('notifications')}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111827',
            }}
            aria-label="Notifications"
          >
            <Bell size={21} strokeWidth={2} />
            {/* Notification yellow dot */}
            <span
              style={{
                position: 'absolute',
                top: '1px',
                right: '2px',
                width: '7px',
                height: '7px',
                borderRadius: '50%',
                backgroundColor: '#FFB800',
                border: '1.5px solid #FFFFFF',
              }}
            />
          </button>

          {/* Cart Icon with Yellow Circular Badge */}
          <button
            type="button"
            onClick={() => navigateTo('cart')}
            style={{
              position: 'relative',
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#111827',
            }}
            aria-label="Shopping Cart"
          >
            <ShoppingCart size={22} strokeWidth={2} />
            <span
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-8px',
                backgroundColor: '#FFB800',
                color: '#111827',
                fontSize: '0.62rem',
                fontWeight: '900',
                minWidth: '16px',
                height: '16px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #FFFFFF',
                lineHeight: 1,
                padding: '0 2px',
              }}
            >
              {cartItemCount > 0 ? cartItemCount : 3}
            </span>
          </button>
        </div>
      </div>

      {/* Row 2: Search Bar with Filter Sliders Icon */}
      <div
        style={{
          padding: '4px 14px 10px 14px',
        }}
      >
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ position: 'absolute', left: '12px', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
            <Search size={18} color="#9CA3AF" strokeWidth={2.2} />
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for cement, bricks, steel, tiles..."
            style={{
              width: '100%',
              height: '42px',
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E5E7EB',
              borderRadius: '12px',
              padding: '0 40px 0 38px',
              fontSize: '0.86rem',
              color: '#111827',
              boxShadow: 'none',
              outline: 'none',
              transition: 'border-color 0.15s ease',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#FFB800')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
          />

          <button
            type="button"
            onClick={() => navigateTo('categories')}
            style={{
              position: 'absolute',
              right: '10px',
              background: 'none',
              border: 'none',
              color: '#111827',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            aria-label="Filter Categories"
          >
            <SlidersHorizontal size={18} strokeWidth={2.2} />
          </button>
        </form>
      </div>
    </header>
  );
};

export default MobileHeader;
