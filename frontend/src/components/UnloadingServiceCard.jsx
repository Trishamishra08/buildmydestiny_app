import React from 'react';
import { useStore } from '../context/StoreContext';

export const UnloadingServiceCard = () => {
  const {
    siteSettings,
    cartSubtotal,
    isUnloadingSelected,
    setIsUnloadingSelected,
  } = useStore();

  const standardFee = siteSettings?.unloadingChargeStandard ?? 199;
  const freeThreshold = siteSettings?.freeUnloadingThreshold ?? 50000;
  const isFree = cartSubtotal >= freeThreshold;
  const displayPrice = isFree ? 0 : standardFee;

  const helperText = siteSettings?.unloadingHelperText || '1 Helper';
  const descriptionText =
    siteSettings?.unloadingDescription ||
    "Includes unloading & keeping at designated place on ground level. Doesn't include shifting to upper floors.";

  return (
    <div
      style={{
        backgroundColor: '#FFF8E1', // Soft yellow background matching brand theme
        borderRadius: '14px',
        padding: '12px 14px',
        border: '1px solid #FFE08A',
        marginBottom: '4px',
      }}
    >
      {/* Top description text */}
      <div
        style={{
          fontSize: '0.74rem',
          color: '#374151',
          lineHeight: '1.4',
          marginBottom: '10px',
          fontWeight: '500',
        }}
      >
        {descriptionText}
      </div>

      {/* White inner card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: '1px solid #E2E8F0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}
      >
        {/* Left: Truck icon + Titles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Custom Mini Truck Icon matching reference */}
          <div
            style={{
              width: '42px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="40" height="32" viewBox="0 0 40 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Truck Cargo Box */}
              <rect x="8" y="4" width="18" height="18" rx="2" fill="#FFB800" stroke="#0A0A0A" strokeWidth="1.5" />
              <line x1="14" y1="4" x2="14" y2="22" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="2 1" />
              <line x1="20" y1="4" x2="20" y2="22" stroke="#0A0A0A" strokeWidth="1" strokeDasharray="2 1" />

              {/* Truck Cabin */}
              <path d="M26 10H32L35 15V22H26V10Z" fill="#0A0A0A" stroke="#0A0A0A" strokeWidth="1.5" />
              {/* Window */}
              <path d="M28 12H31.5L33.5 15H28V12Z" fill="#F2F2F2" />
              {/* Bumper */}
              <rect x="34" y="19" width="3" height="3" rx="1" fill="#0A0A0A" />

              {/* Chassis */}
              <rect x="5" y="21" width="31" height="3" rx="1" fill="#475569" />

              {/* Wheels */}
              <circle cx="12" cy="24" r="3.5" fill="#0A0A0A" stroke="#0F172A" strokeWidth="1" />
              <circle cx="12" cy="24" r="1.5" fill="#94A3B8" />

              <circle cx="29" cy="24" r="3.5" fill="#0A0A0A" stroke="#0F172A" strokeWidth="1" />
              <circle cx="29" cy="24" r="1.5" fill="#94A3B8" />

              {/* Speed lines on left */}
              <path d="M2 12H5M1 16H6M3 20H5" stroke="#94A3B8" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>

          <div>
            <div
              style={{
                fontSize: '0.88rem',
                fontWeight: '800',
                color: '#0F172A',
                lineHeight: '1.2',
                marginBottom: '2px',
              }}
            >
              Unloading Service
            </div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#64748B',
                fontWeight: '500',
              }}
            >
              {helperText}
            </div>
          </div>
        </div>

        {/* Right: Add button & Price */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
          <button
            type="button"
            onClick={() => setIsUnloadingSelected(!isUnloadingSelected)}
            style={{
              padding: isUnloadingSelected ? '4px 12px' : '4px 20px',
              borderRadius: '8px',
              border: '1.5px solid #0A0A0A',
              backgroundColor: isUnloadingSelected ? '#FFB800' : '#FFFFFF',
              color: '#0A0A0A',
              fontSize: '0.82rem',
              fontWeight: '700',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              boxShadow: isUnloadingSelected ? '0 1px 3px rgba(255, 184, 0, 0.35)' : 'none',
            }}
          >
            {isUnloadingSelected ? 'Added ✓' : 'Add'}
          </button>

          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: '800',
              color: '#0F172A',
            }}
          >
            {isFree ? (
              <span style={{ color: '#0A0A0A' }}>FREE</span>
            ) : (
              `₹${standardFee.toLocaleString('en-IN')}`
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnloadingServiceCard;
