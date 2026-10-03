import React from 'react';
import { CheckCircle2, Truck, Calendar, MapPin, Download, ArrowRight, Home } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MOCK_ORDERS } from '../data/mockData';
import { printTaxInvoice } from '../utils/printInvoice';
import { getDeliverySchedule } from '../utils/deliverySchedule';

export const OrderConfirmationView = () => {
  const { viewParams, navigateTo, addToast, siteSettings } = useStore();
  const order = viewParams?.order || MOCK_ORDERS[0];
  const deliveryInfo = getDeliverySchedule(order);

  const handleDownloadInvoice = () => {
    printTaxInvoice(order, siteSettings);
  };

  return (
    <div className="container page-container">
      <div
        style={{
          maxWidth: '740px',
          margin: '0 auto',
          backgroundColor: '#FFFFFF',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-md)',
          overflow: 'hidden',
        }}
      >
        {/* Success Header Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
            color: '#FFFFFF',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            borderBottom: '4px solid var(--primary-orange)',
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(244, 119, 33, 0.2)',
              border: '2px solid var(--primary-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              color: 'var(--primary-orange)',
            }}
          >
            <CheckCircle2 size={32} />
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: '800', color: '#FFFFFF', marginBottom: '0.4rem' }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: '#CBD5E1', fontSize: '0.925rem', marginBottom: '1rem' }}>
            Thank you for ordering with BuildMyDestiny. Your structural materials are allocated at our central logistics depot.
          </p>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              fontWeight: '800',
              letterSpacing: '0.04em',
              color: '#FFFFFF',
            }}
          >
            Order Reference ID: {order.id}
          </div>
        </div>

        {/* Order Details Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Prominent Delivery Date Notice Banner */}
          <div
            style={{
              backgroundColor: '#FFF8E1',
              border: '1.5px solid #FFE08A',
              borderRadius: '12px',
              padding: '14px 18px',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: '#FFB800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0A0A',
                flexShrink: 0,
              }}
            >
              <Truck size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: '#0A0A0A' }}>
                Your order will be delivered on {order.deliveryDate || deliveryInfo.deliveryDate}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4B5563', marginTop: '2px', fontWeight: '600' }}>
                {deliveryInfo.isAfter8PM
                  ? `Placed after 8:00 PM (${order.date || deliveryInfo.orderDate}) · Scheduled for priority delivery tomorrow.`
                  : `Dispatched from nearest hub for same-day delivery today.`}
              </div>
            </div>
          </div>

          {/* Key Quick Facts Grid */}
          <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                <Truck size={16} />
                <span>Expected Site Delivery:</span>
              </div>
              <div style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
                {order.expectedDelivery || deliveryInfo.expectedDelivery}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Slot: {order.deliverySlot}
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-orange)', fontWeight: '700', fontSize: '0.85rem', marginBottom: '4px' }}>
                <MapPin size={16} />
                <span>Site Destination:</span>
              </div>
              <div style={{ fontSize: '0.925rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                {order.siteAddress?.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                {order.siteAddress?.addressLine}, {order.siteAddress?.city} ({order.siteAddress?.pincode})
              </div>
            </div>
          </div>

          {/* Items Ordered List */}
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Materials Scheduled for Dispatch:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {order.items?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '9px 12px',
                    backgroundColor: 'var(--bg-surface)',
                    borderRadius: 'var(--radius-xs)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '0.85rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{item.product?.name}</span>
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({item.quantity} {item.product?.unit}s)</span>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--primary-navy)' }}>
                    ₹{(item.price * item.quantity)?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total & GST Invoice info */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--navy-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Amount Paid (Inclusive of GST):</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary-orange)' }}>
                ₹{order.summary?.totalAmount?.toLocaleString()}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadInvoice}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}
            >
              <Download size={14} />
              <span>Tax Invoice & MTC</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="responsive-split-equal" style={{ gap: '10px' }}>
            <button
              onClick={() => navigateTo('order-tracking', { id: order.id, orderId: order.id, order })}
              className="btn btn-primary btn-lg"
              style={{ fontWeight: '800', display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
            >
              <Truck size={18} />
              <span>Track Live Delivery</span>
            </button>

            <button
              onClick={() => navigateTo('home')}
              className="btn btn-secondary btn-lg"
              style={{ display: 'inline-flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}
            >
              <Home size={18} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationView;
