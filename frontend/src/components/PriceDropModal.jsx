import React from 'react';
import { X, Flame, TrendingDown, Clock, ArrowRight, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/mockData';

export const PriceDropModal = () => {
  const { isPriceDropOpen, setIsPriceDropOpen, navigateTo, addToCart } = useStore();

  if (!isPriceDropOpen) return null;

  // Filter products with 20%+ discount
  const priceDropItems = PRODUCTS.filter((p) => (p.discountPercent || 0) >= 20 || parseInt(p.discount || '0') >= 20);

  return (
    <div className="modal-overlay" onClick={() => setIsPriceDropOpen(false)}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Header with High-Energy Electric Blue Gradient */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Flame size={20} color="#FFB800" />
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', fontWeight: '800', color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                ⚡ Live Flash Drops
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF' }}>
                Today's Special Price Drops
              </h3>
            </div>
          </div>

          <button
            onClick={() => setIsPriceDropOpen(false)}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Timer Bar */}
        <div
          style={{
            backgroundColor: '#FFF8E1',
            padding: '8px 1.5rem',
            borderBottom: '1px solid #FFE08A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.8rem',
            color: '#0A0A0A',
            fontWeight: '600',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={14} color="#0A0A0A" />
            <span>Direct Manufacturer Subsidized Wholesale Rates</span>
          </div>
          <span style={{ backgroundColor: '#FFB800', color: '#0A0A0A', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: '800' }}>
            Ends in 03h 42m
          </span>
        </div>

        {/* Product Deals List */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '55vh', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {priceDropItems.map((prod) => (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 12px',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#FFFFFF',
                transition: 'var(--transition)',
              }}
            >
              {/* Product Thumbnail with discount badge */}
              <div style={{ width: '64px', height: '64px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', position: 'relative', flexShrink: 0, backgroundColor: 'var(--bg-surface)' }}>
                <img src={prod.image} alt={prod.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    left: '2px',
                    backgroundColor: '#FFB800',
                    color: '#0A0A0A',
                    fontSize: '0.62rem',
                    fontWeight: '800',
                    padding: '1px 4px',
                    borderRadius: '3px',
                  }}
                >
                  {prod.discount}
                </span>
              </div>

              {/* Title & Pricing */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  {prod.brand}
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prod.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                    ₹{prod.price.toLocaleString()}
                  </span>
                  {prod.mrp && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                      ₹{prod.mrp.toLocaleString()}
                    </span>
                  )}
                  <span style={{ fontSize: '0.7rem', color: 'var(--qc-green)', fontWeight: '700' }}>
                    Save ₹{(prod.mrp ? prod.mrp - prod.price : 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  addToCart(prod, 1);
                  setIsPriceDropOpen(false);
                }}
                style={{
                  backgroundColor: 'var(--qc-green)',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-xs)',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ShoppingCart size={13} />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Prices refreshed every 6 hours based on depot index
          </span>
          <button
            onClick={() => {
              setIsPriceDropOpen(false);
              navigateTo('categories');
            }}
            className="btn btn-navy btn-sm"
          >
            <span>Explore All Materials</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PriceDropModal;
