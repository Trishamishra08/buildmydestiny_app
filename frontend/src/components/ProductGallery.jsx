import React, { useState } from 'react';
import { ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react';

export const ProductGallery = ({ images = [], alt = '' }) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages = images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Main Image Frame */}
      <div
        style={{
          position: 'relative',
          height: 'clamp(260px, 60vw, 380px)',
          width: '100%',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-xs)',
        }}
      >
        <img
          src={displayImages[activeIdx]}
          alt={alt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease',
            transform: isZoomed ? 'scale(1.4)' : 'scale(1)',
            cursor: 'zoom-in',
          }}
          onClick={() => setIsZoomed(!isZoomed)}
        />

        {/* Zoom Hint */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            backgroundColor: 'rgba(10, 10, 10, 0.75)',
            color: '#FFFFFF',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            backdropFilter: 'blur(4px)',
            pointerEvents: 'none',
          }}
        >
          <ZoomIn size={13} />
          <span>{isZoomed ? 'Zoomed' : 'Tap to Zoom'}</span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '4px',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setActiveIdx(idx);
                setIsZoomed(false);
              }}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: 'var(--radius-xs)',
                border: `2px solid ${activeIdx === idx ? 'var(--primary-orange)' : 'var(--border-subtle)'}`,
                padding: '2px',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0,
                transition: 'border-color 0.2s ease',
              }}
            >
              <img src={img} alt={`${alt} thumbnail ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
