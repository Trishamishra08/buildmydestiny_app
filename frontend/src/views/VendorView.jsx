import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  User,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Menu,
  X,
  Search,
  AlertTriangle,
  IndianRupee,
  Phone,
  MapPin,
  UploadCloud,
  Truck,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';
import PanelLogin from '../components/PanelLogin';
import api from '../services/api';

// Brand tokens - same black / white / yellow system as the customer app and the admin panel.
const ACCENT = '#FFB800';
const ACCENT_SOFT = '#FFF8E1';
const ACCENT_BORDER = '#FFE08A';
const DARK = '#0A0A0A';
const BORDER = '#E5E7EB';
const MUTED = '#6B7280';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;
const formatDate = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Fulfilment steps a vendor moves their own items through (mirrors backend utils/orderFlow.js).
const ITEM_STATUSES = ['Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered'];
const NEXT_ACTION = {
  Processing: { next: 'Ready to Ship', label: 'Mark Ready to Ship' },
  'Ready to Ship': { next: 'Shipped', label: 'Mark Shipped' },
  Shipped: { next: 'Out for Delivery', label: 'Out for Delivery' },
  'Out for Delivery': { next: 'Delivered', label: 'Mark Delivered' },
};
const STATUS_TONE = {
  Processing: { bg: '#FEF3C7', fg: '#92400E' },
  'Ready to Ship': { bg: '#E0F2FE', fg: '#075985' },
  Shipped: { bg: '#EDE9FE', fg: '#5B21B6' },
  'Out for Delivery': { bg: '#FFEDD5', fg: '#9A3412' },
  Delivered: { bg: '#DCFCE7', fg: '#166534' },
};

const StatusChip = ({ status }) => {
  const tone = STATUS_TONE[status] || { bg: '#F1F5F9', fg: '#334155' };
  return (
    <span style={{ background: tone.bg, color: tone.fg, fontSize: '0.72rem', fontWeight: 800, padding: '3px 10px', borderRadius: 999, whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
};

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.8rem',
  borderRadius: 10,
  border: `1.5px solid #D1D5DB`,
  fontSize: '0.88rem',
  outline: 'none',
  background: '#fff',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};
const labelStyle = { display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: 4 };

const primaryBtn = (disabled) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '0.6rem 1.1rem',
  borderRadius: 10,
  border: 'none',
  background: disabled ? '#E5E7EB' : ACCENT,
  color: disabled ? '#9CA3AF' : DARK,
  fontWeight: 800,
  fontSize: '0.85rem',
  cursor: disabled ? 'not-allowed' : 'pointer',
  fontFamily: 'inherit',
});

const cardStyle = { background: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' };

// ---------------------------------------------------------------------------
// Auth screen: OTP sign-in, plus registration for new vendors
// ---------------------------------------------------------------------------
function VendorAuthScreen() {
  const { vendorOtpLogin, vendorSignup, navigateTo } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', businessName: '', phone: '', email: '', city: '' });
  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const register = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await vendorSignup(form);
    } finally {
      setSubmitting(false);
    }
  };

  const toggle = (
    <span>
      {mode === 'login' ? 'New to Build My Destiny? ' : 'Already a vendor? '}
      <button
        type="button"
        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
        style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 800, cursor: 'pointer', padding: 0, fontFamily: 'inherit', fontSize: 'inherit' }}
      >
        {mode === 'login' ? 'Register as a Vendor' : 'Login'}
      </button>
    </span>
  );

  const registerForm = (
    <form onSubmit={register} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <input style={inputStyle} placeholder="Your Name *" value={form.name} onChange={update('name')} required />
      <input style={inputStyle} placeholder="Business / Shop Name *" value={form.businessName} onChange={update('businessName')} required />
      <input
        style={inputStyle}
        type="tel"
        inputMode="numeric"
        maxLength={10}
        placeholder="Mobile Number *"
        value={form.phone}
        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
        required
      />
      <input style={inputStyle} type="email" placeholder="Email (optional)" value={form.email} onChange={update('email')} />
      <input style={inputStyle} placeholder="City" value={form.city} onChange={update('city')} />
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryBtn(submitting), justifyContent: 'center', padding: '0.95rem', borderRadius: 999, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}
      >
        {submitting ? 'Please wait...' : 'Create Vendor Account'}
      </button>
      <p style={{ margin: 0, fontSize: '0.76rem', color: MUTED, textAlign: 'center' }}>
        Your account is reviewed by our team. You can sign in right away; listing products unlocks once approved.
      </p>
    </form>
  );

  return (
    <PanelLogin
      badge="Vendor Panel"
      title={mode === 'login' ? 'Welcome Back!' : 'Become a Vendor'}
      subtitle={mode === 'login' ? 'Login to manage your store' : 'Sell your materials on Build My Destiny'}
      demoPhone="9876543210"
      onLogin={vendorOtpLogin}
      onBack={() => navigateTo('home')}
      customForm={mode === 'register' ? registerForm : null}
      footer={toggle}
    />
  );
}

// ---------------------------------------------------------------------------
// Account approval notice
// ---------------------------------------------------------------------------
function VendorStatusBanner({ status }) {
  if (status === 'approved') return null;
  const isRejected = status === 'rejected';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '0.9rem 1rem',
        borderRadius: 12,
        margin: '0 0 1.25rem',
        background: isRejected ? '#FEF2F2' : '#FFFBEB',
        border: `1px solid ${isRejected ? '#FECACA' : '#FDE68A'}`,
      }}
    >
      {isRejected ? <XCircle size={18} color="#DC2626" /> : <Clock size={18} color="#D97706" />}
      <div>
        <div style={{ fontWeight: 700, fontSize: '0.88rem', color: isRejected ? '#991B1B' : '#92400E' }}>
          {isRejected ? 'Your vendor account was not approved' : 'Your vendor account is pending approval'}
        </div>
        <div style={{ fontSize: '0.8rem', color: isRejected ? '#B91C1C' : '#B45309', marginTop: 2 }}>
          {isRejected
            ? 'Please contact support if you believe this is a mistake.'
            : 'You can explore your dashboard, but listing products is disabled until an admin approves your account.'}
        </div>
      </div>
    </div>
  );
}

const PageHeader = ({ title, subtitle, action }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: '1.25rem' }}>
    <div>
      <h1 style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif", fontSize: '1.5rem', fontWeight: 800, color: DARK, margin: 0 }}>{title}</h1>
      {subtitle && <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: MUTED }}>{subtitle}</p>}
    </div>
    {action}
  </div>
);

const EmptyState = ({ icon: Icon, text }) => (
  <div style={{ ...cardStyle, padding: '2.5rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
    <Icon size={28} style={{ marginBottom: 8 }} />
    <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{text}</div>
  </div>
);

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
function DashboardTab({ stats, loading, canSell, goTo, openNewProduct }) {
  const cards = [
    { label: 'Products Listed', value: stats?.productCount, icon: Package },
    { label: 'Pending Orders', value: stats?.pendingOrders, icon: Clock, highlight: true },
    { label: 'Delivered Orders', value: stats?.deliveredOrders, icon: CheckCircle },
    { label: 'Total Sales', value: stats ? money(stats.revenue) : undefined, icon: IndianRupee },
  ];
  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="A snapshot of your store on Build My Destiny"
        action={
          <button onClick={openNewProduct} disabled={!canSell} style={primaryBtn(!canSell)} title={canSell ? 'Add a product' : 'Pending approval'}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {cards.map(({ label, value, icon: Icon, highlight }) => (
          <div key={label} style={{ ...cardStyle, padding: '1.1rem 1.25rem', borderColor: highlight ? ACCENT_BORDER : BORDER, background: highlight ? ACCENT_SOFT : '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.78rem', color: MUTED, fontWeight: 700 }}>{label}</span>
              <span style={{ width: 32, height: 32, borderRadius: 9, background: highlight ? ACCENT : '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={DARK} />
              </span>
            </div>
            <div style={{ fontSize: '1.65rem', fontWeight: 800, color: DARK, marginTop: 8 }}>{loading && value === undefined ? '…' : value ?? 0}</div>
          </div>
        ))}
      </div>

      {stats && (stats.lowStockCount > 0 || stats.outOfStockCount > 0) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.8rem 1rem', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <AlertTriangle size={18} color="#D97706" />
          <span style={{ fontSize: '0.85rem', color: '#92400E', fontWeight: 600, flex: 1 }}>
            {stats.lowStockCount > 0 && `${stats.lowStockCount} product${stats.lowStockCount > 1 ? 's' : ''} running low on stock. `}
            {stats.outOfStockCount > 0 && `${stats.outOfStockCount} out of stock.`}
          </span>
          <button onClick={() => goTo('products')} style={{ background: 'none', border: 'none', color: '#92400E', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
            Review stock →
          </button>
        </div>
      )}

      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', borderBottom: `1px solid ${BORDER}` }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: DARK }}>Recent Orders</h2>
          <button onClick={() => goTo('orders')} style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 2 }}>
            View all <ChevronRight size={14} />
          </button>
        </div>
        {(stats?.recentOrders || []).length === 0 ? (
          <div style={{ padding: '1.75rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.88rem' }}>
            {loading ? 'Loading…' : 'No orders for your products yet.'}
          </div>
        ) : (
          stats.recentOrders.map((order) => (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '0.85rem 1.25rem', borderTop: `1px solid #F3F4F6`, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.9rem', color: DARK }}>#{order.orderNumber}</div>
                <div style={{ fontSize: '0.78rem', color: MUTED }}>{order.customerName} · {formatDate(order.createdAt)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusChip status={order.status} />
                <span style={{ fontWeight: 800, color: DARK }}>{money(order.vendorTotal)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
function ProductsTab({ products, loading, canSell, categories, onAdd, onEdit, onDelete, onToggleStock }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const categoryNames = useMemo(() => ['All', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))], [products]);
  const visible = products.filter((p) => {
    if (category !== 'All' && p.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || [p.name, p.brand, p.category].some((v) => String(v || '').toLowerCase().includes(q));
  });

  return (
    <div>
      <PageHeader
        title="My Products"
        subtitle={`${products.length} product${products.length === 1 ? '' : 's'} listed in the Build My Destiny store`}
        action={
          <button disabled={!canSell} onClick={onAdd} title={canSell ? 'Add a product' : 'Pending approval'} style={primaryBtn(!canSell)}>
            <Plus size={16} /> Add Product
          </button>
        }
      />

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: '1rem' }}>
        <div style={{ position: 'relative', flex: '1 1 240px' }}>
          <Search size={16} color="#9CA3AF" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input style={{ ...inputStyle, paddingLeft: 36 }} placeholder="Search products, brands…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select style={{ ...inputStyle, width: 'auto', minWidth: 160 }} value={category} onChange={(e) => setCategory(e.target.value)}>
          {categoryNames.map((c) => (
            <option key={c} value={c}>{c === 'All' ? 'All categories' : c}</option>
          ))}
        </select>
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={Package} text={loading ? 'Loading…' : products.length === 0 ? (canSell ? 'No products yet — add your first product.' : 'Products can be added once your account is approved.') : 'No products match your search.'} />
      ) : (
        <div style={{ ...cardStyle, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 720 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', textAlign: 'left', color: MUTED, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => {
                const outOfStock = p.inStock === false || Number(p.stockCount) === 0;
                const low = !outOfStock && Number(p.stockCount) <= 10;
                return (
                  <tr key={p.id} style={{ borderTop: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 10, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {p.image ? <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#9CA3AF" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: DARK }}>{p.name}</div>
                          {p.brand && <div style={{ fontSize: '0.74rem', color: MUTED }}>{p.brand}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.7rem 1rem', color: '#374151' }}>{p.category || '—'}</td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <div style={{ fontWeight: 800 }}>{money(p.price)}{p.unit ? <span style={{ fontWeight: 500, color: MUTED }}> / {p.unit}</span> : null}</div>
                      {Number(p.mrp) > Number(p.price) && <div style={{ fontSize: '0.74rem', color: '#9CA3AF', textDecoration: 'line-through' }}>{money(p.mrp)}</div>}
                    </td>
                    <td style={{ padding: '0.7rem 1rem', fontWeight: 700, color: low ? '#B45309' : DARK }}>{p.stockCount ?? '—'}{low && ' ⚠'}</td>
                    <td style={{ padding: '0.7rem 1rem' }}>
                      <button
                        onClick={() => onToggleStock(p)}
                        title="Click to toggle availability"
                        style={{ border: 'none', cursor: 'pointer', padding: '3px 10px', borderRadius: 999, fontWeight: 800, fontSize: '0.72rem', background: outOfStock ? '#FEE2E2' : '#DCFCE7', color: outOfStock ? '#B91C1C' : '#166534' }}
                      >
                        {outOfStock ? 'Out of stock' : 'In stock'}
                      </button>
                    </td>
                    <td style={{ padding: '0.7rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button onClick={() => onEdit(p)} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: 10 }}>
                        <Edit2 size={16} color="#64748B" />
                      </button>
                      <button onClick={() => onDelete(p)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <Trash2 size={16} color="#DC2626" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
const ORDER_TABS = [
  { id: 'new', label: 'New', match: (o) => o.items.some((l) => (l.vendorStatus || 'Processing') === 'Processing') },
  { id: 'progress', label: 'In Progress', match: (o) => o.items.some((l) => ['Ready to Ship', 'Shipped', 'Out for Delivery'].includes(l.vendorStatus)) },
  { id: 'delivered', label: 'Delivered', match: (o) => o.items.every((l) => l.vendorStatus === 'Delivered') },
  { id: 'all', label: 'All', match: () => true },
];

function OrdersTab({ orders, loading, onUpdateStatus, busyKey }) {
  const [tab, setTab] = useState('new');
  const counts = Object.fromEntries(ORDER_TABS.map((t) => [t.id, orders.filter(t.match).length]));
  const visible = orders.filter(ORDER_TABS.find((t) => t.id === tab).match);

  return (
    <div>
      <PageHeader title="Orders" subtitle="Orders containing your products. Update each item as you pack and ship it — customers see the progress live." />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: '1rem' }}>
        {ORDER_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: 999,
              border: `1.5px solid ${tab === t.id ? ACCENT : BORDER}`,
              background: tab === t.id ? ACCENT : '#fff',
              color: DARK,
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {t.label} <span style={{ opacity: 0.65 }}>({counts[t.id]})</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon={ShoppingBag} text={loading ? 'Loading…' : 'No orders in this view.'} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {visible.map((order) => {
            const addr = order.siteAddress || order.shippingAddress || {};
            const addrLine = [addr.street || addr.addressLine, addr.city, addr.state].filter(Boolean).join(', ') + (addr.pincode ? ` - ${addr.pincode}` : '');
            const paid = /^paid/i.test(order.paymentStatus || order.payment?.status || '');
            return (
              <div key={order.id} style={{ ...cardStyle, overflow: 'hidden' }}>
                <div style={{ padding: '1rem 1.25rem', background: '#FAFAFA', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: DARK }}>Order #{order.orderNumber || order.id}</div>
                    <div style={{ fontSize: '0.76rem', color: MUTED }}>{formatDate(order.createdAt)} · {order.paymentMethod || order.payment?.method || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: DARK }}>{money(order.vendorTotal)}</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: paid ? '#166534' : '#B45309' }}>{paid ? 'PAID' : 'PAY ON DELIVERY'}</span>
                  </div>
                </div>

                <div style={{ padding: '0.9rem 1.25rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', borderBottom: `1px solid #F3F4F6`, fontSize: '0.82rem', color: '#374151' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User size={15} color={MUTED} />
                    <span style={{ fontWeight: 700 }}>{order.customerName || addr.recipientName || 'Customer'}</span>
                  </div>
                  {(order.customerPhone || addr.phone) && (
                    <a href={`tel:${order.customerPhone || addr.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>
                      <Phone size={15} /> {order.customerPhone || addr.phone}
                    </a>
                  )}
                  {addrLine && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flex: '1 1 260px' }}>
                      <MapPin size={15} color={MUTED} style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>{addrLine}</span>
                    </div>
                  )}
                </div>

                {order.items.map((line, idx) => {
                  const status = line.vendorStatus || 'Processing';
                  const action = NEXT_ACTION[status];
                  const key = `${order.id}:${line.product?.id}`;
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.25rem', borderTop: idx === 0 ? 'none' : '1px solid #F3F4F6', flexWrap: 'wrap' }}>
                      <div style={{ width: 46, height: 46, borderRadius: 10, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {line.product?.image ? <img src={line.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#9CA3AF" />}
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: DARK, fontSize: '0.88rem' }}>{line.product?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: MUTED }}>
                          {line.quantity}{line.product?.unit ? ` ${line.product.unit}` : ''} × {money(line.price)} = <b style={{ color: DARK }}>{money(line.lineTotal ?? line.price * line.quantity)}</b>
                        </div>
                      </div>
                      <StatusChip status={status} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {action && (
                          <button
                            disabled={busyKey === key}
                            onClick={() => onUpdateStatus(order.id, line.product?.id, action.next)}
                            style={{ ...primaryBtn(busyKey === key), padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            <Truck size={14} /> {action.label}
                          </button>
                        )}
                        <select
                          aria-label="Set status"
                          value={status}
                          disabled={busyKey === key}
                          onChange={(e) => onUpdateStatus(order.id, line.product?.id, e.target.value)}
                          style={{ padding: '0.4rem 0.5rem', borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: '0.76rem', background: '#fff' }}
                        >
                          {ITEM_STATUSES.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
function ProfileTab({ vendorUser, profileForm, setProfileForm, onSave, saving }) {
  if (!profileForm) return null;
  const approved = vendorUser.vendorStatus === 'approved';
  const fields = [
    { key: 'businessName', label: 'Business / Shop Name' },
    { key: 'name', label: 'Contact Person', readOnly: true },
    { key: 'phone', label: 'Mobile Number' },
    { key: 'email', label: 'Email', readOnly: true },
    { key: 'city', label: 'City' },
    { key: 'gstin', label: 'GSTIN' },
  ];
  return (
    <div style={{ maxWidth: 560 }}>
      <PageHeader title="Store Profile" subtitle="Details customers and our team see for your store" />
      <div style={{ ...cardStyle, padding: '1.25rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: approved ? '#DCFCE7' : '#FEF3C7', color: approved ? '#166534' : '#92400E', fontWeight: 800, fontSize: '0.76rem', textTransform: 'capitalize', marginBottom: '1rem' }}>
          {approved ? <CheckCircle size={14} /> : <Clock size={14} />} {vendorUser.vendorStatus}
        </div>
        {fields.map(({ key, label, readOnly }) => (
          <div key={key} style={{ marginBottom: '0.9rem' }}>
            <label style={labelStyle}>{label}</label>
            <input
              value={profileForm[key] || ''}
              readOnly={readOnly}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
              style={{ ...inputStyle, background: readOnly ? '#F9FAFB' : '#fff', color: readOnly ? MUTED : DARK }}
            />
          </div>
        ))}
        <button onClick={onSave} disabled={saving} style={primaryBtn(saving)}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main shell
// ---------------------------------------------------------------------------
const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'My Products', icon: Package },
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'profile', label: 'Profile', icon: User },
];

const ORDER_POLL_MS = 20000;

export default function VendorView() {
  const { vendorUser, vendorLogout, navigateTo, addToast, categories, viewParams } = useStore();

  const [tab, setTab] = useState(() => (NAV_ITEMS.some((n) => n.id === viewParams?.tab) ? viewParams.tab : 'dashboard'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | {} (new) | product (edit)
  const [profileForm, setProfileForm] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [busyKey, setBusyKey] = useState(null);
  const knownOrderIds = useRef(null);

  const run = useCallback(
    async (fn, errorText) => {
      setLoading(true);
      try {
        return await fn();
      } catch (err) {
        addToast(err?.message || errorText, 'error');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [addToast]
  );

  const loadStats = useCallback(async () => {
    const res = await run(() => api.getVendorStats(), 'Could not load dashboard stats');
    if (res) setStats(res.data);
  }, [run]);

  const loadProducts = useCallback(async () => {
    const res = await run(() => api.getVendorProducts(), 'Could not load products');
    if (res) setProducts(res.data || []);
  }, [run]);

  const loadOrders = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        const res = await api.getVendorOrders();
        const list = res.data || [];
        // Tell the vendor when a new order arrives while the panel is open.
        if (knownOrderIds.current) {
          const fresh = list.filter((o) => !knownOrderIds.current.has(o.id));
          if (fresh.length) addToast(`${fresh.length} new order${fresh.length > 1 ? 's' : ''} received!`, 'success', 6000);
        }
        knownOrderIds.current = new Set(list.map((o) => o.id));
        setOrders(list);
      } catch (err) {
        if (!silent) addToast(err?.message || 'Could not load orders', 'error');
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [addToast]
  );

  const vendorId = vendorUser?.id;

  // Initial load of everything + keep orders fresh while the panel is open.
  useEffect(() => {
    if (!vendorId) return undefined;
    loadOrders();
    loadProducts();
    loadStats();
    const timer = setInterval(() => loadOrders({ silent: true }), ORDER_POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    if (tab === 'dashboard') loadStats();
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders({ silent: true });
    if (tab === 'profile') {
      api
        .getVendorProfile()
        .then((res) => setProfileForm({ ...res.data }))
        .catch(() => setProfileForm({ ...vendorUser }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, vendorId]);

  if (!vendorUser) return <VendorAuthScreen />;

  const canSell = vendorUser.vendorStatus === 'approved';
  const pendingOrderCount = orders.filter((o) => o.items.some((l) => (l.vendorStatus || 'Processing') === 'Processing')).length;

  const goTo = (id) => {
    setTab(id);
    navigateTo('vendor', { tab: id }, true);
    setDrawerOpen(false);
  };

  const saveProduct = async (data) => {
    try {
      if (data.id && products.some((p) => p.id === data.id)) {
        await api.updateVendorProduct(data.id, data);
        addToast('Product updated', 'success');
      } else {
        await api.createVendorProduct(data);
        addToast('Product added to the store', 'success');
      }
      setProductModal(null);
      loadProducts();
      loadStats();
    } catch (err) {
      addToast(err?.message || 'Could not save product', 'error');
    }
  };

  const removeProduct = async (product) => {
    if (!window.confirm(`Delete "${product.name}"? Customers will no longer see it.`)) return;
    try {
      await api.deleteVendorProduct(product.id);
      addToast('Product deleted', 'success');
      loadProducts();
      loadStats();
    } catch (err) {
      addToast(err?.message || 'Could not delete product', 'error');
    }
  };

  const toggleStock = async (product) => {
    const outOfStock = product.inStock === false || Number(product.stockCount) === 0;
    try {
      await api.updateVendorProduct(product.id, {
        inStock: outOfStock,
        stockCount: outOfStock && Number(product.stockCount) === 0 ? 10 : product.stockCount,
      });
      loadProducts();
      loadStats();
    } catch (err) {
      addToast(err?.message || 'Could not update stock', 'error');
    }
  };

  const updateItemStatus = async (orderId, productId, status) => {
    const key = `${orderId}:${productId}`;
    setBusyKey(key);
    try {
      await api.updateVendorOrderItemStatus(orderId, productId, status);
      addToast(`Marked as ${status}`, 'success');
      await loadOrders({ silent: true });
      loadStats();
    } catch (err) {
      addToast(err?.message || 'Could not update status', 'error');
    } finally {
      setBusyKey(null);
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.updateVendorProfile({
        businessName: profileForm.businessName,
        phone: profileForm.phone,
        city: profileForm.city,
        gstin: profileForm.gstin,
      });
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err?.message || 'Could not update profile', 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div className="bmd-vendor-shell">
      <style>{`
        .bmd-vendor-shell { min-height: 100vh; display: flex; background: #F2F2F2; color: ${DARK};
          font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif; font-size: 14px; }
        .bmd-vendor-sidebar { width: 252px; background: #fff; border-right: 1px solid ${BORDER}; display: flex; flex-direction: column;
          flex-shrink: 0; position: sticky; top: 0; height: 100vh; z-index: 60; }
        .bmd-vendor-main { flex: 1; min-width: 0; padding: 1.75rem; }
        .bmd-vendor-topbar { display: none; }
        .bmd-vendor-backdrop { display: none; }
        .bmd-vendor-nav-btn { width: 100%; display: flex; align-items: center; gap: 10px; padding: 0.65rem 0.8rem; margin-bottom: 4px;
          border-radius: 10px; border: none; cursor: pointer; font-weight: 700; font-size: 0.86rem; text-align: left;
          background: transparent; color: #1F2937; font-family: inherit; transition: background .15s ease; }
        .bmd-vendor-nav-btn:hover { background: #F3F4F6; }
        .bmd-vendor-nav-btn.active { background: ${ACCENT}; color: ${DARK}; }
        @media (max-width: 900px) {
          .bmd-vendor-sidebar { position: fixed; left: 0; top: 0; transform: translateX(-100%); transition: transform .22s ease; box-shadow: none; }
          .bmd-vendor-sidebar.open { transform: translateX(0); box-shadow: 0 0 40px rgba(0,0,0,.25); }
          .bmd-vendor-backdrop.open { display: block; position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 55; }
          .bmd-vendor-topbar { display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 40;
            background: #fff; border-bottom: 1px solid ${BORDER}; padding: 0.6rem 1rem; }
          .bmd-vendor-main { padding: 1rem; }
          .bmd-vendor-col { flex-direction: column; }
        }
      `}</style>

      <div className={`bmd-vendor-backdrop ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)} />

      <aside className={`bmd-vendor-sidebar ${drawerOpen ? 'open' : ''}`}>
        <div style={{ height: 68, padding: '0 1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER}` }}>
          <Logo size="medium" onClick={() => goTo('dashboard')} />
          <button onClick={() => setDrawerOpen(false)} aria-label="Close menu" className="bmd-vendor-topbar-close" style={{ background: 'none', border: 'none', cursor: 'pointer', display: drawerOpen ? 'block' : 'none' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0.9rem 1.1rem 0.4rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 999, padding: '3px 12px', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
            <Store size={12} /> Vendor Panel
          </span>
        </div>

        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', overflowY: 'auto' }}>
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => goTo(id)} className={`bmd-vendor-nav-btn ${tab === id ? 'active' : ''}`}>
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
              {id === 'orders' && pendingOrderCount > 0 && (
                <span style={{ background: tab === id ? DARK : ACCENT, color: tab === id ? '#fff' : DARK, fontSize: '0.7rem', fontWeight: 800, borderRadius: 999, padding: '1px 8px' }}>
                  {pendingOrderCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0.9rem 1.1rem', borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: '0.84rem', fontWeight: 800 }}>{vendorUser.businessName || vendorUser.name}</div>
          <div style={{ fontSize: '0.74rem', color: MUTED, marginBottom: '0.7rem' }}>+91 {String(vendorUser.phone || '').replace(/\D/g, '').slice(-10)}</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigateTo('home')}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem', borderRadius: 9, border: `1px solid ${BORDER}`, background: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}
            >
              <ArrowLeft size={14} /> Store
            </button>
            <button
              onClick={vendorLogout}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '0.5rem', borderRadius: 9, border: 'none', background: DARK, color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, fontFamily: 'inherit' }}
            >
              <LogOut size={14} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="bmd-vendor-topbar">
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <Menu size={22} />
          </button>
          <Logo size="small" />
          <span style={{ width: 22 }} />
        </div>

        <main className="bmd-vendor-main">
          <VendorStatusBanner status={vendorUser.vendorStatus} />

          {tab === 'dashboard' && (
            <DashboardTab stats={stats} loading={loading} canSell={canSell} goTo={goTo} openNewProduct={() => setProductModal({})} />
          )}
          {tab === 'products' && (
            <ProductsTab
              products={products}
              loading={loading}
              canSell={canSell}
              categories={categories}
              onAdd={() => setProductModal({})}
              onEdit={(p) => setProductModal(p)}
              onDelete={removeProduct}
              onToggleStock={toggleStock}
            />
          )}
          {tab === 'orders' && <OrdersTab orders={orders} loading={loading} onUpdateStatus={updateItemStatus} busyKey={busyKey} />}
          {tab === 'profile' && (
            <ProfileTab vendorUser={vendorUser} profileForm={profileForm} setProfileForm={setProfileForm} onSave={saveProfile} saving={savingProfile} />
          )}
        </main>
      </div>

      {productModal !== null && (
        <ProductModal product={productModal} categories={categories} onClose={() => setProductModal(null)} onSave={saveProduct} canSell={canSell} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / edit product modal
// ---------------------------------------------------------------------------
function ProductModal({ product, categories = [], onClose, onSave, canSell }) {
  const isEdit = Boolean(product.id);
  const [form, setForm] = useState({
    id: product.id || '',
    name: product.name || '',
    brand: product.brand || '',
    categorySlug: product.categorySlug || '',
    subcategory: product.subcategory || '',
    price: product.price ?? '',
    mrp: product.mrp ?? '',
    stockCount: product.stockCount ?? '',
    unit: product.unit || '',
    moq: product.moq ?? 1,
    description: product.description || '',
    image: product.image || '',
    inStock: product.inStock !== false,
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const { addToast } = useStore();

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const selectedCategory = categories.find((c) => c.slug === form.categorySlug);
  const subcategories = Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : [];

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadImage(file, 'buildmydestiny/products');
      set('image', res?.data?.url || '');
    } catch (err) {
      addToast(err?.message || 'Image upload failed. You can paste an image URL instead.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.categorySlug) return addToast('Please choose a category', 'warning');
    setSaving(true);
    const price = Number(form.price) || 0;
    const { categorySlug, ...rest } = form;
    await onSave({
      ...rest,
      category: selectedCategory?.name || '',
      categorySlug,
      section: selectedCategory?.section || '',
      price,
      mrp: Number(form.mrp) || price,
      stockCount: Number(form.stockCount) || 0,
      moq: Math.max(1, Number(form.moq) || 1),
    });
    setSaving(false);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 560, maxHeight: '92vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 1.5rem', borderBottom: `1px solid ${BORDER}`, position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{isEdit ? 'Edit Product' : 'Add Product'}</h3>
          <button onClick={onClose} aria-label="Close" style={{ background: '#F3F4F6', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={submit} style={{ padding: '1.25rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={labelStyle}>Product Name *</label>
            <input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. UltraTech Cement (OPC 53)" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Category *</label>
              <select
                style={inputStyle}
                value={form.categorySlug}
                onChange={(e) => setForm((prev) => ({ ...prev, categorySlug: e.target.value, subcategory: '' }))}
                required
              >
                <option value="">Select category</option>
                {categories.filter((c) => c.isActive !== false).map((c) => (
                  <option key={c.id || c.slug} value={c.slug}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Sub Category</label>
              <select style={inputStyle} value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} disabled={!subcategories.length}>
                <option value="">{subcategories.length ? 'Select sub category' : 'None available'}</option>
                {subcategories.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Selling Price (₹) *</label>
              <input style={inputStyle} type="number" min="1" value={form.price} onChange={(e) => set('price', e.target.value)} required />
            </div>
            <div>
              <label style={labelStyle}>MRP (₹)</label>
              <input style={inputStyle} type="number" min="0" value={form.mrp} onChange={(e) => set('mrp', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Stock *</label>
              <input style={inputStyle} type="number" min="0" value={form.stockCount} onChange={(e) => set('stockCount', e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Unit</label>
              <input style={inputStyle} placeholder="bag, piece, kg…" value={form.unit} onChange={(e) => set('unit', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Min. Order Qty</label>
              <input style={inputStyle} type="number" min="1" value={form.moq} onChange={(e) => set('moq', e.target.value)} />
            </div>
            <div>
              <label style={labelStyle}>Brand</label>
              <input style={inputStyle} value={form.brand} onChange={(e) => set('brand', e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Product Image</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ width: 72, height: 72, borderRadius: 12, background: '#F3F4F6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {form.image ? <img src={form.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={24} color="#9CA3AF" />}
              </div>
              <div style={{ flex: 1, minWidth: 180 }}>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => upload(e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.45rem 0.85rem', borderRadius: 9, border: `1.5px dashed ${ACCENT}`, background: ACCENT_SOFT, cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem', fontFamily: 'inherit', marginBottom: 6 }}
                >
                  <UploadCloud size={15} /> {uploading ? 'Uploading…' : 'Upload image'}
                </button>
                <input style={{ ...inputStyle, padding: '0.45rem 0.7rem', fontSize: '0.8rem' }} value={form.image} onChange={(e) => set('image', e.target.value)} placeholder="…or paste an image URL" />
              </div>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Grade, size, usage and other details customers should know" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
            <input type="checkbox" checked={form.inStock} onChange={(e) => set('inStock', e.target.checked)} style={{ accentColor: ACCENT, width: 16, height: 16 }} /> Available for sale
          </label>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>
              Cancel
            </button>
            <button type="submit" disabled={saving || uploading || (!canSell && !isEdit)} style={{ ...primaryBtn(saving || uploading), flex: 1, justifyContent: 'center', padding: '0.75rem' }}>
              {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add to Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
