import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Package,
  CheckCircle2,
  Truck,
  Zap,
  RotateCw,
  Search,
  Clock,
  AlertCircle,
  XCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getDeliverySchedule } from '../utils/deliverySchedule';

export const MyOrdersView = () => {
  const { orders: storeOrders, navigateTo, user, adminUser, openLoginModal } = useStore();
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'active' | 'delivered' | 'cancelled'

  if (!user) {
    return (
      <div className="container page-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: 'var(--primary-navy)' }}>
            <Package size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '0.5rem', fontWeight: '800' }}>
            Sign In to View Material Orders
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Track live transit status, truck dispatch GPS & download B2B tax invoices for your construction sites.
          </p>
          <button
            onClick={() => openLoginModal('login', () => navigateTo('orders'))}
            className="btn btn-primary btn-lg mobile-w-full"
            style={{ fontWeight: '800' }}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  // With an admin session open in this browser the store holds every customer's
  // orders, so keep only the ones that belong to the signed-in shopper.
  const ownsOrder = (o) =>
    (o.userId && String(o.userId) === String(user.id)) ||
    (!!o.customerEmail && !!user.email && o.customerEmail.toLowerCase() === user.email.toLowerCase());
  const orders = adminUser ? storeOrders.filter(ownsOrder) : storeOrders;

  const activeOrdersCount = orders.filter(
    (o) => o.statusCode !== 'delivered' && o.statusCode !== 'cancelled'
  ).length;
  const deliveredOrdersCount = orders.filter((o) => o.statusCode === 'delivered').length;
  const cancelledOrdersCount = orders.filter((o) => o.statusCode === 'cancelled').length;

  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'active') return order.statusCode !== 'delivered' && order.statusCode !== 'cancelled';
    if (activeTab === 'delivered') return order.statusCode === 'delivered';
    if (activeTab === 'cancelled') return order.statusCode === 'cancelled';
    return true;
  });

  const renderStatusBadge = (order) => {
    const status = (order.statusCode || order.status || '').toLowerCase();

    if (status === 'delivered') {
      return (
        <span
          style={{
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            border: '1px solid #0A0A0A',
            borderRadius: '9999px',
            fontSize: '0.66rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '3px 9px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
          }}
        >
          <CheckCircle2 size={12} strokeWidth={2.5} />
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
            fontSize: '0.66rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '3px 9px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
          }}
        >
          <Truck size={12} strokeWidth={2.5} />
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
            fontSize: '0.66rem',
            fontWeight: '800',
            letterSpacing: '0.03em',
            padding: '3px 9px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textTransform: 'uppercase',
          }}
        >
          <XCircle size={12} strokeWidth={2.5} />
          CANCELLED
        </span>
      );
    }

    // Default Confirmed / In Progress
    return (
      <span
        style={{
          backgroundColor: '#F2F2F2',
          color: '#0A0A0A',
          border: '1px solid #E2E8F0',
          borderRadius: '9999px',
          fontSize: '0.66rem',
          fontWeight: '800',
          letterSpacing: '0.03em',
          padding: '3px 9px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          textTransform: 'uppercase',
        }}
      >
        <Package size={12} strokeWidth={2.5} />
        CONFIRMED
      </span>
    );
  };

  return (
    <div
      style={{
        backgroundColor: '#F8FAFC',
        minHeight: '100vh',
        paddingBottom: '80px',
      }}
    >
      <div
        style={{
          maxWidth: '640px',
          margin: '0 auto',
          padding: '16px 14px 24px 14px',
        }}
      >
        {/* 1. Header Bar: Back Arrow, Title & Subtitle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            marginBottom: '16px',
            paddingTop: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => navigateTo('home')}
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
            title="Back to Home"
          >
            <ChevronLeft size={26} strokeWidth={2.5} />
          </button>

          <div>
            <h1
              style={{
                fontSize: '1.4rem',
                fontWeight: '800',
                color: '#0F172A',
                lineHeight: '1.2',
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              My orders
            </h1>
            <p
              style={{
                fontSize: '0.84rem',
                color: '#64748B',
                marginTop: '4px',
                marginBottom: 0,
                fontWeight: '500',
              }}
            >
              {orders.length} orders · Track deliveries and view history
            </p>
          </div>
        </div>

        {/* 2. Filter Tabs (Pills with Badge Counts) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            paddingBottom: '14px',
            marginBottom: '6px',
          }}
        >
          {[
            { id: 'all', label: 'All', count: orders.length },
            { id: 'active', label: 'Active', count: activeOrdersCount },
            { id: 'delivered', label: 'Delivered', count: deliveredOrdersCount },
            { id: 'cancelled', label: 'Cancelled', count: cancelledOrdersCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 14px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? '#0F172A' : '#FFFFFF',
                  color: isActive ? '#FFFFFF' : '#334155',
                  border: isActive ? '1px solid #0F172A' : '1px solid #E2E8F0',
                  fontSize: '0.84rem',
                  fontWeight: isActive ? '700' : '600',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: isActive ? '0 2px 6px rgba(15, 23, 42, 0.15)' : 'none',
                  transition: 'all 0.15s ease',
                  flexShrink: 0,
                }}
              >
                <span>{tab.label}</span>
                <span
                  style={{
                    backgroundColor: isActive ? '#334155' : '#F1F5F9',
                    color: isActive ? '#FFFFFF' : '#64748B',
                    fontSize: '0.72rem',
                    fontWeight: '800',
                    padding: '1px 7px',
                    borderRadius: '9999px',
                    minWidth: '18px',
                    textAlign: 'center',
                  }}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 3. Orders List */}
        {filteredOrders.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {filteredOrders.map((order) => {
              const firstItem = order.items?.[0];
              const itemSummary =
                order.items
                  ?.map((i) => i.product?.name || 'Material Item')
                  .join(' | ') || 'Material Item';

              const itemCount = order.items?.reduce((sum, i) => sum + (i.quantity || 1), 0) || 1;
              const paymentMode = order.paymentMode || 'online';
              const orderDeliveryInfo = getDeliverySchedule(order);
              const formattedPrice = (
                order.summary?.totalAmount ||
                order.totalPrice ||
                order.grandTotal ||
                0
              ).toLocaleString('en-IN');

              const timestampText =
                order.statusCode === 'delivered'
                  ? `Delivered ${order.date} · ${order.time}`
                  : `Placed ${order.date} · ${order.time}`;

              return (
                <div
                  key={order.id}
                  onClick={() => navigateTo('order-details', { id: order.id, orderId: order.id, order })}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: '1px solid #E2E8F0',
                    padding: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.06)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.03)';
                  }}
                >
                  {/* Top Section: Left Thumbnail + Right Details */}
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    {/* Left Thumbnail Box */}
                    <div
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '12px',
                        border: '1px solid #F1F5F9',
                        backgroundColor: '#FAFAFA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden',
                        padding: '4px',
                      }}
                    >
                      {firstItem?.product?.image ? (
                        <img
                          src={firstItem.product.image}
                          alt={firstItem.product.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            borderRadius: '8px',
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=200';
                          }}
                        />
                      ) : (
                        <Package size={24} color="#94A3B8" />
                      )}
                    </div>

                    {/* Right Details Column */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Row 1: Order ID + Status Pill */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '8px',
                          marginBottom: '3px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '0.98rem',
                            fontWeight: '800',
                            color: '#0F172A',
                            letterSpacing: '-0.01em',
                          }}
                        >
                          Order #{order.id}
                        </span>

                        {renderStatusBadge(order)}
                      </div>

                      {/* Row 2: Placed / Delivered Timestamp */}
                      <div
                        style={{
                          fontSize: '0.76rem',
                          color: '#64748B',
                          fontWeight: '500',
                          marginBottom: '6px',
                        }}
                      >
                        {timestampText}
                      </div>

                      {/* Row 3: Items Description (Ellipsized) */}
                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: '#334155',
                          fontWeight: '500',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginBottom: '8px',
                          lineHeight: '1.3',
                        }}
                        title={itemSummary}
                      >
                        {itemSummary}
                      </div>

                      {/* Row 4: Express / Scheduled Delivery Badge + Time */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '8px',
                          marginBottom: '12px',
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: orderDeliveryInfo.isAfter8PM ? '#F2F2F2' : '#FFF8E1',
                            color: '#0A0A0A',
                            border: orderDeliveryInfo.isAfter8PM ? '1px solid #E2E8F0' : '1px solid #FFE08A',
                            borderRadius: '9999px',
                            fontSize: '0.66rem',
                            fontWeight: '800',
                            letterSpacing: '0.02em',
                            padding: '2px 7px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <Truck size={11} />
                          {orderDeliveryInfo.isAfter8PM ? 'NEXT DAY' : 'EXPRESS'}
                        </span>

                        <span
                          style={{
                            fontSize: '0.78rem',
                            color: '#334155',
                            fontWeight: '700',
                          }}
                        >
                          Delivery: {order.deliveryDate || orderDeliveryInfo.deliveryDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row / Separator: Items & Payment Mode (Left), Total Price & Chevron (Right) */}
                  <div
                    style={{
                      borderTop: '1px solid #F1F5F9',
                      paddingTop: '10px',
                      marginTop: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.82rem',
                        color: '#64748B',
                        fontWeight: '500',
                      }}
                    >
                      {order.itemCountText ||
                        `${itemCount} item${itemCount > 1 ? 's' : ''} · ${paymentMode}`}
                    </span>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: '800',
                          color: '#0F172A',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        ₹{formattedPrice}
                      </span>
                      <ChevronRight size={18} color="#94A3B8" strokeWidth={2.2} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '48px 20px',
              textAlign: 'center',
              marginTop: '12px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#F8FAFC',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
              }}
            >
              <Package size={30} color="#94A3B8" />
            </div>
            <h3
              style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: '#0F172A',
                marginBottom: '6px',
              }}
            >
              No {activeTab !== 'all' ? activeTab : ''} orders found
            </h3>
            <p
              style={{
                fontSize: '0.85rem',
                color: '#64748B',
                maxWidth: '300px',
                margin: '0 auto 20px auto',
              }}
            >
              You don't have any {activeTab !== 'all' ? activeTab : ''} orders in your account right now.
            </p>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              style={{
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '9999px',
                padding: '10px 22px',
                fontWeight: '700',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Browse Materials
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersView;
