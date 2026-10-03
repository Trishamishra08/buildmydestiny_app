import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

/**
 * BillDetailsCard
 * Matches exact reference design:
 * - Sub Total (Inclusive of GST)
 * - Discount
 * - Wallet
 * - Delivery Charge (with dotted underline)
 * - Handling Charge (with dotted underline)
 * - Total
 */
export const BillDetailsCard = ({
  subtotal = 0,
  discount = 0,
  walletDiscount = 0,
  deliveryFee = 0,
  handlingFee = 0,
  total = 0,
  title = 'Bill Details',
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #E2E8F0',
        padding: '16px 18px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
      }}
    >
      {/* Header with toggle */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
          {title}
        </span>
        <div style={{ color: '#0F172A' }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isOpen && (
        <div style={{ marginTop: '12px' }}>
          <div style={{ borderTop: '1px solid #F1F5F9', marginBottom: '12px' }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.92rem' }}>
            {/* Sub Total */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
              <span>Sub Total (Inclusive of GST)</span>
              <span style={{ fontWeight: '700', color: '#0F172A' }}>
                ₹{Number(subtotal || 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Discount */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
              <span>Discount</span>
              <span style={{ fontWeight: '700', color: discount > 0 ? '#0A0A0A' : '#0F172A' }}>
                {discount > 0 ? `-₹${Number(discount).toLocaleString('en-IN')}` : '₹0'}
              </span>
            </div>

            {/* Wallet */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
              <span>Wallet</span>
              <span style={{ fontWeight: '700', color: walletDiscount > 0 ? '#0A0A0A' : '#0F172A' }}>
                {walletDiscount > 0 ? `-₹${Number(walletDiscount).toLocaleString('en-IN')}` : '₹0'}
              </span>
            </div>

            {/* Delivery Charge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
              <span
                style={{ textDecoration: 'underline dotted', cursor: 'pointer', textUnderlineOffset: '3px' }}
                title="Direct Site Logistics Freight"
              >
                Delivery Charge
              </span>
              <span style={{ fontWeight: '700', color: deliveryFee === 0 ? '#0A0A0A' : '#0F172A' }}>
                {deliveryFee === 0 ? 'FREE' : `₹${Number(deliveryFee).toLocaleString('en-IN')}`}
              </span>
            </div>

            {/* Handling Charge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
              <span
                style={{ textDecoration: 'underline dotted', cursor: 'pointer', textUnderlineOffset: '3px' }}
                title="Ground Level Crane & Helper Handling"
              >
                Handling Charge
              </span>
              <span style={{ fontWeight: '700', color: handlingFee === 0 ? '#0A0A0A' : '#0F172A' }}>
                {handlingFee === 0 ? '₹0' : `₹${Number(handlingFee).toLocaleString('en-IN')}`}
              </span>
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #E2E8F0', margin: '4px 0' }} />

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '2px',
              }}
            >
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                Total
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0F172A' }}>
                ₹{Number(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillDetailsCard;
