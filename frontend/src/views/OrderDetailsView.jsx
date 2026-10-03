import React from 'react';
import {
  ChevronLeft,
  Package,
  CheckCircle2,
  Truck,
  Zap,
  MapPin,
  Phone,
  Download,
  ShieldCheck,
  RotateCw,
  Clock,
  HelpCircle,
  FileText,
  CreditCard,
  Building,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { MOCK_ORDERS } from '../data/mockData';
import { printTaxInvoice } from '../utils/printInvoice';
import { getDeliverySchedule } from '../utils/deliverySchedule';

export const OrderDetailsView = () => {
  const { viewParams, navigateTo, addToast, getOrderById, addToCart, siteSettings } = useStore();

  const orderId =
    viewParams?.id ||
    viewParams?.orderId ||
    viewParams?.order?.id ||
    '89418210';

  const order = getOrderById(orderId) || viewParams?.order || MOCK_ORDERS[0];
  const deliveryInfo = getDeliverySchedule(order);

  const handleDownloadInvoice = () => {
    printTaxInvoice(order, siteSettings);
  };

  const handleDownloadMTC = () => {
    addToast(`Downloading Mill Test Certificate (MTC) Batch #${order.id}...`, 'success');
  };

  const handleReorder = () => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        if (item.product) {
          addToCart(item.product, item.quantity || 1);
        }
      });
      addToast(`Re-added items from Order #${order.id} to cart`, 'success');
      navigateTo('cart');
    } else {
      addToast('No items available to reorder', 'error');
    }
  };

  const renderStatusBadge = () => {
    const status = (order.statusCode || order.status || '').toLowerCase();

    if (status === 'delivered') {
      return (
        <span
          style={{
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            border: '1px solid #0A0A0A',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '4px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
          }}
        >
          <CheckCircle2 size={13} strokeWidth={2.5} />
          DELIVERED
        </span>
      );
    }

    if (status === 'out_for_delivery' || status.includes('out')) {
      return (
        <span
          style={{
            backgroundColor: '#FFB800',
            color: '#0A0A0A',
            border: '1px solid #E6A600',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '4px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
          }}
        >
          <Truck size={13} strokeWidth={2.5} />
          OUT FOR DELIVERY
        </span>
      );
    }

    if (status === 'cancelled') {
      return (
        <span
          style={{
            backgroundColor: '#F2F2F2',
            color: '#4B5563',
            border: '1px solid #E2E8F0',
            borderRadius: '9999px',
            fontSize: '0.72rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '4px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            textTransform: 'uppercase',
          }}
        >
          CANCELLED
        </span>
      );
    }

    // Confirmed / In Progress
    return (
      <span
        style={{
          backgroundColor: '#F2F2F2',
          color: '#0A0A0A',
          border: '1px solid #E2E8F0',
          borderRadius: '9999px',
          fontSize: '0.72rem',
          fontWeight: '800',
          letterSpacing: '0.03em',
          padding: '4px 12px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          textTransform: 'uppercase',
        }}
      >
        <Package size={13} strokeWidth={2.5} />
        CONFIRMED
      </span>
    );
  };

  const steps = order.tracking?.steps || [
    { title: 'Order Placed', time: `${order.date} · ${order.time}`, done: true, desc: 'Order verified & invoice generated' },
    { title: 'Order Confirmed', time: 'Express Depot Verified', done: true, desc: 'Stock allocated at central hub' },
    { title: 'Packing & Loading', time: order.statusCode === 'delivered' ? 'Completed' : 'In Progress', done: order.statusCode === 'delivered' || order.statusCode === 'out_for_delivery', desc: 'Loaded with tamper-evident seal' },
    { title: 'Out for Delivery', time: order.statusCode === 'delivered' ? 'Completed' : 'Expected soon', done: order.statusCode === 'delivered' || order.statusCode === 'out_for_delivery', desc: 'En route to site' },
    { title: 'Delivered', time: order.statusCode === 'delivered' ? `Delivered at ${order.time}` : 'Pending handover', done: order.statusCode === 'delivered', desc: 'Direct site handover with OTP verification' },
  ];

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        paddingBottom: '90px',
      }}
    >
      <div
        style={{
          maxWidth: '680px',
          margin: '0 auto',
          padding: '16px 14px 28px 14px',
        }}
      >
        {/* 1. Clean Top Header Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginBottom: '18px',
            paddingTop: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => navigateTo('orders')}
              style={{
                background: 'none',
                border: 'none',
                padding: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0F172A',
                marginLeft: '-4px',
              }}
              title="Back to My Orders"
            >
              <ChevronLeft size={26} strokeWidth={2.5} />
            </button>

            <div>
              <h1
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '800',
                  color: '#0F172A',
                  lineHeight: '1.2',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                Order #{order.id}
              </h1>
              <span style={{ fontSize: '0.76rem', color: '#64748B', fontWeight: '500' }}>
                Placed {order.date} · {order.time}
              </span>
            </div>
          </div>

          <div>{renderStatusBadge()}</div>
        </div>

        {/* Dynamic Delivery Date Notice Banner */}
        <div
          style={{
            backgroundColor: '#FFF8E1',
            border: '1.5px solid #FFE08A',
            borderRadius: '14px',
            padding: '12px 16px',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FFB800',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0A0A',
                flexShrink: 0,
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: '800', color: '#0A0A0A' }}>
                Your order will be delivered on {order.deliveryDate || deliveryInfo.deliveryDate}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#4B5563', fontWeight: '500' }}>
                {deliveryInfo.isAfter8PM
                  ? `Night Order · Scheduled for next day priority delivery (${order.deliveryDate || deliveryInfo.deliveryDate})`
                  : `Express daytime delivery active`}
              </div>
            </div>
          </div>
          <span
            style={{
              backgroundColor: '#FFE08A',
              color: '#0A0A0A',
              fontSize: '0.72rem',
              fontWeight: '800',
              padding: '4px 9px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {order.deliveryDate || deliveryInfo.deliveryDate}
          </span>
        </div>

        {/* 2. Live Order Tracking Timeline Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '18px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF8E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}
              >
                <Truck size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  Delivery Progress
                </h3>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  {order.statusCode === 'delivered'
                    ? 'Consignment safely delivered & unloaded'
                    : `Express Site Delivery · ETA: ${order.expressTime || '85-90 mins'}`}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('order-tracking', { id: order.id, orderId: order.id, order })}
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '6px 12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Live Map</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div style={{ position: 'relative', paddingLeft: '8px' }}>
            {steps.map((step, idx) => {
              const isLast = idx === steps.length - 1;
              const isCurrent = step.done && (!steps[idx + 1] || !steps[idx + 1].done);

              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    position: 'relative',
                    paddingBottom: isLast ? '0' : '16px',
                  }}
                >
                  {/* Vertical connecting line */}
                  {!isLast && (
                    <div
                      style={{
                        position: 'absolute',
                        left: '11px',
                        top: '22px',
                        bottom: 0,
                        width: '2px',
                        backgroundColor: step.done ? '#0A0A0A' : '#E2E8F0',
                      }}
                    />
                  )}

                  {/* Step Dot */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: step.done ? '#0A0A0A' : '#F1F5F9',
                      border: step.done ? '2px solid #0A0A0A' : '2px solid #CBD5E1',
                      color: step.done ? '#FFFFFF' : '#94A3B8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      flexShrink: 0,
                      zIndex: 2,
                    }}
                  >
                    {step.done ? <Check size={13} strokeWidth={3} /> : idx + 1}
                  </div>

                  {/* Step Info */}
                  <div style={{ flex: 1, minWidth: 0, paddingTop: '2px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.86rem',
                          fontWeight: step.done ? '700' : '600',
                          color: step.done ? '#0F172A' : '#64748B',
                        }}
                      >
                        {step.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: '500' }}>
                        {step.time}
                      </span>
                    </div>
                    {step.desc && (
                      <p style={{ fontSize: '0.76rem', color: '#64748B', margin: '2px 0 0 0' }}>
                        {step.desc}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Assigned Driver Box (if active) */}
          {order.tracking?.driverName && (
            <div
              style={{
                marginTop: '14px',
                padding: '10px 12px',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div>
                <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: '600' }}>
                  Assigned Logistics Partner
                </span>
                <div style={{ fontSize: '0.84rem', fontWeight: '700', color: '#0F172A' }}>
                  {order.tracking.driverName} • {order.tracking.vehicleNumber}
                </div>
              </div>

              {order.tracking.driverPhone && (
                <a
                  href={`tel:${order.tracking.driverPhone}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#0F172A',
                    fontSize: '0.76rem',
                    fontWeight: '700',
                    textDecoration: 'none',
                  }}
                >
                  <Phone size={12} color="#0A0A0A" />
                  <span>Call Rider</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* 3. Consignment Items Breakdown Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '18px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '14px',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Items in this Order ({order.items?.length || 1})
            </h3>
            <span
              style={{
                backgroundColor: '#FFF8E1',
                color: '#0A0A0A',
                border: '1px solid #FFE08A',
                borderRadius: '9999px',
                fontSize: '0.66rem',
                fontWeight: '800',
                padding: '2px 7px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
              }}
            >
              <Zap size={10} fill="#0A0A0A" /> EXPRESS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {order.items?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  paddingBottom: idx === order.items.length - 1 ? '0' : '12px',
                  borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #F1F5F9',
                }}
              >
                <div
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    backgroundColor: '#FAFAFA',
                    border: '1px solid #F1F5F9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    flexShrink: 0,
                    padding: '3px',
                  }}
                >
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '6px' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=200';
                    }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: '700',
                      color: '#0A0A0A',
                      textTransform: 'uppercase',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {item.product?.brand || 'GENUINE MATERIAL'}
                  </div>
                  <div
                    style={{
                      fontSize: '0.86rem',
                      fontWeight: '700',
                      color: '#0F172A',
                      lineHeight: '1.3',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {item.product?.name}
                  </div>
                  <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: '2px' }}>
                    Qty: <strong>{item.quantity}</strong> • ₹{item.price?.toLocaleString()} each
                  </div>
                </div>

                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.98rem', fontWeight: '800', color: '#0F172A' }}>
                    ₹{(item.price * (item.quantity || 1))?.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Site Delivery Address Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '18px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                backgroundColor: '#FFF8E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0A0A',
              }}
            >
              <MapPin size={16} />
            </div>
            <h3 style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              Site Delivery Destination
            </h3>
          </div>

          <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0F172A', marginBottom: '4px' }}>
            {order.siteAddress?.title || 'Construction Site Destination'}
          </div>
          <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: '1.4', marginBottom: '8px' }}>
            {order.siteAddress?.addressLine}, {order.siteAddress?.city} - {order.siteAddress?.pincode}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            <div>
              <strong>Site In-charge:</strong> {order.siteAddress?.inCharge || 'Er. Rajesh Malviya'}
            </div>
            <div>
              <strong>Contact Phone:</strong> {order.siteAddress?.phone || '+91 98260 11223'}
            </div>
          </div>

          {order.siteAddress?.gateNotes && (
            <div
              style={{
                marginTop: '10px',
                padding: '8px 10px',
                backgroundColor: '#F8FAFC',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                fontSize: '0.76rem',
                color: '#475569',
              }}
            >
              <strong>Gate / Unloading Instructions:</strong> {order.siteAddress.gateNotes}
            </div>
          )}
        </div>

        {/* 5. Payment & Tax Compliance Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '18px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  backgroundColor: '#F2F2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}
              >
                <CreditCard size={16} />
              </div>
              <h3 style={{ fontSize: '0.94rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Payment & Tax Details
              </h3>
            </div>

            <span
              style={{
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                border: '1px solid #0A0A0A',
                borderRadius: '9999px',
                fontSize: '0.66rem',
                fontWeight: '800',
                padding: '2px 8px',
              }}
            >
              {order.payment?.status || 'PAID'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Payment Mode:</span>
              <span style={{ fontWeight: '700', color: '#0F172A' }}>
                {order.payment?.method || order.paymentMode?.toUpperCase() || 'ONLINE'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>Transaction ID:</span>
              <span style={{ fontWeight: '600', color: '#0F172A', fontFamily: 'monospace' }}>
                {order.payment?.transactionId || `TXN-${order.id}`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748B' }}>GST Invoice Ref:</span>
              <span style={{ fontWeight: '600', color: '#0A0A0A' }}>
                MST-INV-{order.id}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleDownloadInvoice}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <Download size={14} />
              <span>Tax Invoice</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMTC}
              style={{
                flex: 1,
                minWidth: '130px',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                fontSize: '0.78rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              <ShieldCheck size={14} color="#0A0A0A" />
              <span>MTC Certificate</span>
            </button>
          </div>
        </div>

        {/* 6. Invoice Price Summary Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            padding: '18px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            marginBottom: '20px',
          }}
        >
          <h3
            style={{
              fontSize: '0.94rem',
              fontWeight: '800',
              color: '#0F172A',
              margin: '0 0 12px 0',
              paddingBottom: '10px',
              borderBottom: '1px solid #F1F5F9',
            }}
          >
            Bill Summary
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Material Subtotal:</span>
              <span style={{ fontWeight: '600', color: '#0F172A' }}>
                ₹{(order.summary?.subtotal || order.totalPrice || 305).toLocaleString()}
              </span>
            </div>

            {order.summary?.bulkDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0A0A0A', fontWeight: '700' }}>
                <span>Contractor Volume Rebate:</span>
                <span>- ₹{order.summary.bulkDiscount.toLocaleString()}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>Site Delivery Freight:</span>
              {(order.summary?.deliveryCharge || 0) === 0 ? (
                <span style={{ color: '#0A0A0A', fontWeight: '700' }}>FREE</span>
              ) : (
                <span style={{ color: '#0F172A', fontWeight: '700' }}>₹{order.summary.deliveryCharge.toLocaleString('en-IN')}</span>
              )}
            </div>

            {order.summary?.unloadingCharge > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Site Unloading & Crane Handling:</span>
                <span style={{ color: '#0F172A', fontWeight: '600' }}>
                  ₹{order.summary.unloadingCharge.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
              <span>GST Tax ({order.summary?.isGstInclusive ? 'Included' : 'Added'}):</span>
              <span style={{ color: '#0F172A', fontWeight: '600' }}>
                ₹{(order.summary?.gstAmount || 0).toLocaleString('en-IN')}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                paddingTop: '10px',
                borderTop: '1.5px dashed #E2E8F0',
                marginTop: '4px',
              }}
            >
              <span style={{ fontWeight: '800', fontSize: '0.96rem', color: '#0F172A' }}>
                Grand Total:
              </span>
              <span style={{ fontWeight: '800', fontSize: '1.3rem', color: '#0F172A' }}>
                ₹{(order.summary?.totalAmount || order.totalPrice || 305).toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* 7. Bottom Action Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            onClick={handleReorder}
            style={{
              flex: 1,
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: 'none',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <RotateCw size={16} />
            <span>Reorder Materials</span>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('help')}
            style={{
              padding: '12px 18px',
              borderRadius: '12px',
              backgroundColor: '#FFFFFF',
              color: '#0F172A',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.88rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <HelpCircle size={16} color="#64748B" />
            <span>Need Help?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsView;
