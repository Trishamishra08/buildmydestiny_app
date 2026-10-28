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
  Users,
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

const SHOW_DEMO_OTP = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO_LOGIN === 'true';

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
  const [form, setForm] = useState({ name: '', businessName: '', phone: '', email: '', city: '', otp: '' });
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
      <input
        style={{ ...inputStyle, letterSpacing: '0.35em', textAlign: 'center', fontWeight: 800 }}
        type="text"
        inputMode="numeric"
        maxLength={6}
        placeholder="6-digit OTP *"
        value={form.otp}
        onChange={(e) => setForm((prev) => ({ ...prev, otp: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
        required
      />
      {SHOW_DEMO_OTP && <p style={{ margin: '-0.4rem 0 0', fontSize: '0.75rem', color: MUTED, textAlign: 'center' }}>Demo OTP: 123456</p>}
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryBtn(submitting), justifyContent: 'center', padding: '0.95rem', borderRadius: 999, fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}
      >
        {submitting ? 'Please wait...' : 'Create Vendor Account'}
      </button>
      <p style={{ margin: 0, fontSize: '0.76rem', color: MUTED, textAlign: 'center' }}>
        Your mobile number is verified with the OTP. Our team then reviews your account; listing products unlocks once approved.
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

      {stats?.earnings && (
        <div style={{ ...cardStyle, padding: '1.1rem 1.25rem', marginBottom: '1.25rem' }}>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.8rem' }}>Earnings &amp; tax</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
            {[
              ['Payout (delivered)', money(stats.earnings.delivered.payout), '#166534'],
              ['In progress', money(stats.earnings.inProgress.payout), DARK],
              ['GST collected', money(stats.earnings.delivered.gstAmount + stats.earnings.inProgress.gstAmount), DARK],
              ['Platform fee', money(stats.earnings.delivered.commission + stats.earnings.inProgress.commission), '#B45309'],
            ].map(([label, value, tone]) => (
              <div key={label}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: MUTED }}>{label}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: tone }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats?.delayedOrders > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0.8rem 1rem', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <Clock size={18} color="#DC2626" />
          <span style={{ fontSize: '0.85rem', color: '#991B1B', fontWeight: 600, flex: 1 }}>
            {stats.delayedOrders} order{stats.delayedOrders > 1 ? 's are' : ' is'} past the delivery time promised to the customer.
          </span>
          <button onClick={() => goTo('orders')} style={{ background: 'none', border: 'none', color: '#991B1B', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem' }}>
            Open orders →
          </button>
        </div>
      )}

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
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', minWidth: 800 }}>
            <thead>
              <tr style={{ background: '#F9FAFB', textAlign: 'left', color: MUTED, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Product</th>
                <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                <th style={{ padding: '0.75rem 1rem' }}>GST</th>
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
                    <td style={{ padding: '0.7rem 1rem', fontSize: '0.8rem' }}>
                      {p.effectiveGstRate !== undefined ? (
                        <>
                          <div style={{ fontWeight: 700 }}>{p.effectiveGstRate}%</div>
                          <div style={{ fontSize: '0.7rem', color: MUTED }}>
                            {p.gstSource === 'product' ? 'Set by you' : p.gstSource === 'category' ? 'Category default' : 'Site default'}
                            {p.effectiveHsn ? ` · HSN ${p.effectiveHsn}` : ''}
                          </div>
                        </>
                      ) : '—'}
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

const fmtLeft = (minutes) => {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  const text = h ? `${h}h ${m}m` : `${m}m`;
  return minutes < 0 ? `${text} overdue` : `${text} left`;
};

const formatTime = (value) => {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '';
  return d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
};

// The slowest status across the vendor's items in an order
const orderStatusOf = (order) =>
  order.items
    .map((l) => l.vendorStatus || 'Processing')
    .sort((a, b) => ITEM_STATUSES.indexOf(a) - ITEM_STATUSES.indexOf(b))[0] || 'Processing';

// Who is delivering is asked when the order leaves the vendor.
const NEEDS_RIDER = ['Shipped', 'Out for Delivery'];

const VEHICLE_TYPES = ['Bike', 'Auto', 'Mini truck', 'Pickup', 'Truck', 'Tempo', 'Other'];

function RiderModal({ order, status, deliveryMen = [], onClose, onSubmit, busy }) {
  const saved = order.shipment?.rider || {};
  const onDuty = deliveryMen.filter((m) => m.active !== false);
  const [pick, setPick] = useState(saved.deliveryManId && onDuty.some((m) => m.id === saved.deliveryManId) ? saved.deliveryManId : onDuty.length ? onDuty[0].id : 'other');
  const [form, setForm] = useState({ driverName: saved.name || '', driverPhone: saved.phone || '', vehicleNumber: saved.vehicleNumber || '', note: '', saveToTeam: true });
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const required = status === 'Shipped' || status === 'Out for Delivery';
  const manual = pick === 'other';
  const phoneOk = /^[6-9]\d{9}$/.test(form.driverPhone.replace(/\D/g, '').slice(-10));
  const valid = !required || (manual ? form.driverName.trim() && phoneOk : Boolean(pick));

  const submit = () =>
    onSubmit(
      manual
        ? { ...form }
        : { deliveryManId: pick, note: form.note }
    );

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', padding: '1.4rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>Mark order #{order.orderNumber || order.id} as {status}</h3>
        <p style={{ margin: '6px 0 1rem', fontSize: '0.82rem', color: MUTED }}>
          {required ? 'Choose who is delivering. The customer sees their name and can call them.' : 'Add a note for the customer (optional).'}
        </p>

        {required && (
          <>
            {onDuty.length > 0 && (
              <div style={{ display: 'grid', gap: 8, marginBottom: '0.8rem' }}>
                {onDuty.map((m) => (
                  <label key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0.6rem 0.8rem', borderRadius: 12, border: `1.5px solid ${pick === m.id ? ACCENT : BORDER}`, background: pick === m.id ? ACCENT_SOFT : '#fff', cursor: 'pointer' }}>
                    <input type="radio" name="rider" checked={pick === m.id} onChange={() => setPick(m.id)} style={{ accentColor: ACCENT }} />
                    <span style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 800, fontSize: '0.86rem' }}>{m.name}</span>
                      <span style={{ display: 'block', fontSize: '0.74rem', color: MUTED }}>{m.phone}{m.vehicleType ? ` · ${m.vehicleType}` : ''}{m.vehicleNumber ? ` · ${m.vehicleNumber}` : ''}</span>
                    </span>
                    {m.activeDeliveries > 0 && <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#9A3412', background: '#FFEDD5', borderRadius: 999, padding: '2px 8px' }}>{m.activeDeliveries} on road</span>}
                  </label>
                ))}
                <label style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '0.6rem 0.8rem', borderRadius: 12, border: `1.5px solid ${manual ? ACCENT : BORDER}`, background: manual ? ACCENT_SOFT : '#fff', cursor: 'pointer' }}>
                  <input type="radio" name="rider" checked={manual} onChange={() => setPick('other')} style={{ accentColor: ACCENT }} />
                  <span style={{ fontWeight: 700, fontSize: '0.84rem' }}>Someone else (enter details)</span>
                </label>
              </div>
            )}

            {manual && (
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                <div>
                  <label style={labelStyle}>Delivery person *</label>
                  <input style={inputStyle} value={form.driverName} onChange={(e) => set('driverName', e.target.value)} placeholder="Name" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
                  <div>
                    <label style={labelStyle}>Mobile *</label>
                    <input style={inputStyle} inputMode="numeric" value={form.driverPhone} onChange={(e) => set('driverPhone', e.target.value)} placeholder="10 digit number" />
                  </div>
                  <div>
                    <label style={labelStyle}>Vehicle no.</label>
                    <input style={inputStyle} value={form.vehicleNumber} onChange={(e) => set('vehicleNumber', e.target.value.toUpperCase())} placeholder="MP09 AB 1234" />
                  </div>
                </div>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={form.saveToTeam} onChange={(e) => set('saveToTeam', e.target.checked)} style={{ accentColor: ACCENT }} /> Save to my delivery team
                </label>
              </div>
            )}
          </>
        )}

        <div style={{ marginTop: '0.7rem' }}>
          <label style={labelStyle}>Note</label>
          <input style={inputStyle} value={form.note} onChange={(e) => set('note', e.target.value)} placeholder="e.g. Left the warehouse at 2:30 PM" />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: '1.1rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Cancel</button>
          <button disabled={!valid || busy} onClick={submit} style={{ ...primaryBtn(!valid || busy), flex: 1, justifyContent: 'center' }}>
            {busy ? 'Updating…' : `Confirm ${status}`}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Delivery team
// ---------------------------------------------------------------------------
const emptyMan = { id: '', name: '', phone: '', vehicleType: 'Bike', vehicleNumber: '', notes: '', active: true };

function DeliveryTeamTab({ deliveryMen, loading, onSave, onDelete, onToggle }) {
  const [form, setForm] = useState(null); // null = closed
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));
  const phoneOk = form && /^[6-9]\d{9}$/.test(String(form.phone).replace(/\D/g, '').slice(-10));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const ok = await onSave(form);
    setSaving(false);
    if (ok) setForm(null);
  };

  return (
    <div>
      <PageHeader
        title="Delivery Team"
        subtitle="Save your delivery people once, then pick one when you ship an order. Customers see their name and can call them."
        action={<button onClick={() => setForm({ ...emptyMan })} style={primaryBtn(false)}><Plus size={16} /> Add delivery person</button>}
      />

      {deliveryMen.length === 0 ? (
        <EmptyState icon={Truck} text={loading ? 'Loading…' : 'No delivery people saved yet. Add your first one.'} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {deliveryMen.map((m) => (
            <div key={m.id} style={{ ...cardStyle, padding: '1rem 1.1rem', opacity: m.active === false ? 0.6 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', minWidth: 0 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 800, color: DARK }}>{m.name}</div>
                    <a href={`tel:${m.phone}`} style={{ fontSize: '0.8rem', color: '#0284C7', textDecoration: 'none', fontWeight: 600 }}>{m.phone}</a>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
                  <button onClick={() => setForm({ ...emptyMan, ...m })} title="Edit" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 size={15} color="#64748B" /></button>
                  <button onClick={() => onDelete(m)} title="Remove" style={{ background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={15} color="#DC2626" /></button>
                </div>
              </div>
              <div style={{ fontSize: '0.78rem', color: MUTED, marginTop: 8 }}>
                {[m.vehicleType, m.vehicleNumber].filter(Boolean).join(' · ') || 'No vehicle details'}
              </div>
              {m.notes && <div style={{ fontSize: '0.76rem', color: MUTED, marginTop: 4 }}>{m.notes}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: m.activeDeliveries ? '#9A3412' : MUTED }}>
                  {m.activeDeliveries ? `${m.activeDeliveries} order${m.activeDeliveries > 1 ? 's' : ''} on the road` : 'Free'}
                </span>
                <button
                  onClick={() => onToggle(m)}
                  style={{ border: 'none', cursor: 'pointer', padding: '3px 10px', borderRadius: 999, fontWeight: 800, fontSize: '0.72rem', background: m.active === false ? '#F1F5F9' : '#DCFCE7', color: m.active === false ? '#475569' : '#166534' }}
                >
                  {m.active === false ? 'Off duty' : 'On duty'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {form && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200, padding: '1rem' }} onClick={() => setForm(null)}>
          <form onSubmit={submit} onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 18, width: '100%', maxWidth: 440, padding: '1.4rem', display: 'grid', gap: '0.8rem', boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800 }}>{form.id ? 'Edit delivery person' : 'Add delivery person'}</h3>
            <div><label style={labelStyle}>Name *</label><input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} required /></div>
            <div>
              <label style={labelStyle}>Mobile number *</label>
              <input style={inputStyle} inputMode="numeric" value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="10 digit number" required />
              {form.phone && !phoneOk && <div style={{ fontSize: '0.72rem', color: '#B91C1C', marginTop: 3 }}>Enter a valid 10 digit mobile number</div>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem' }}>
              <div>
                <label style={labelStyle}>Vehicle</label>
                <select style={inputStyle} value={form.vehicleType} onChange={(e) => set('vehicleType', e.target.value)}>
                  {VEHICLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label style={labelStyle}>Vehicle number</label><input style={inputStyle} value={form.vehicleNumber} onChange={(e) => set('vehicleNumber', e.target.value.toUpperCase())} placeholder="MP09 AB 1234" /></div>
            </div>
            <div><label style={labelStyle}>Notes</label><input style={inputStyle} value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="e.g. Heavy loads only, works 9am–6pm" /></div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              <button type="button" onClick={() => setForm(null)} style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: `1.5px solid ${BORDER}`, background: '#fff', cursor: 'pointer', fontWeight: 700, fontFamily: 'inherit' }}>Cancel</button>
              <button type="submit" disabled={saving || !phoneOk || form.name.trim().length < 2} style={{ ...primaryBtn(saving || !phoneOk || form.name.trim().length < 2), flex: 1, justifyContent: 'center' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const SettleCell = ({ label, value, tone }) => (
  <div style={{ minWidth: 110 }}>
    <div style={{ fontSize: '0.68rem', fontWeight: 700, color: MUTED, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: tone || DARK }}>{value}</div>
  </div>
);

function OrdersTab({ orders, loading, onUpdateStatus, onUpdateOrder, busyKey, deliveryMen }) {
  const [tab, setTab] = useState('new');
  const [riderFor, setRiderFor] = useState(null); // { order, status }
  const counts = Object.fromEntries(ORDER_TABS.map((t) => [t.id, orders.filter(t.match).length]));
  const visible = orders.filter(ORDER_TABS.find((t) => t.id === tab).match);

  const submitRider = async (form) => {
    const ok = await onUpdateOrder(riderFor.order.id, {
      status: riderFor.status,
      deliveryManId: form.deliveryManId,
      driverName: form.driverName,
      driverPhone: form.driverPhone,
      vehicleNumber: form.vehicleNumber,
      note: form.note,
      saveToTeam: Boolean(form.saveToTeam),
    });
    if (ok) setRiderFor(null);
  };

  return (
    <div>
      <PageHeader title="Orders" subtitle="You deliver your own orders. Move each order through packing, shipping and delivery — customers see the progress live." />

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
            const addrLine = [addr.street || addr.addressLine, addr.landmark, addr.city, addr.state].filter(Boolean).join(', ') + (addr.pincode ? ` - ${addr.pincode}` : '');
            const paid = /^paid/i.test(order.paymentStatus || order.payment?.status || '');
            const overall = orderStatusOf(order);
            const nextAction = NEXT_ACTION[overall];
            const st = order.settlement || {};
            const orderKey = `${order.id}:*`;
            const rider = order.shipment?.rider;
            const gstSplit = st.igst > 0 ? `IGST ${money(st.igst)}` : `CGST ${money(st.cgst)} + SGST ${money(st.sgst)}`;
            return (
              <div key={order.id} style={{ ...cardStyle, overflow: 'hidden', borderColor: order.isDelayed ? '#FCA5A5' : BORDER }}>
                <div style={{ padding: '1rem 1.25rem', background: '#FAFAFA', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: DARK, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      Order #{order.orderNumber || order.id} <StatusChip status={overall} />
                    </div>
                    <div style={{ fontSize: '0.76rem', color: MUTED }}>{formatDate(order.createdAt)} · {order.paymentMethod || order.payment?.method || '—'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: DARK }}>{money(order.vendorTotal)}</div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: paid ? '#166534' : '#B45309' }}>
                      {paid ? 'PAID ONLINE' : `COLLECT ${money(order.collectOnDelivery)} ON DELIVERY`}
                    </span>
                  </div>
                </div>

                {/* Delivery promise for this order's zone */}
                <div style={{ padding: '0.7rem 1.25rem', display: 'flex', gap: '1.25rem', flexWrap: 'wrap', alignItems: 'center', background: order.isDelayed ? '#FEF2F2' : '#F0F9FF', borderBottom: `1px solid ${BORDER}`, fontSize: '0.8rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                    <MapPin size={14} /> {order.deliveryZone?.name || 'Delivery zone'}
                  </span>
                  {order.promisedBy && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} /> Deliver by <b>{formatTime(order.promisedBy)}</b>
                    </span>
                  )}
                  {order.minutesLeft !== null && order.minutesLeft !== undefined && (
                    <span style={{ fontWeight: 800, color: order.isDelayed ? '#B91C1C' : '#0369A1' }}>{fmtLeft(order.minutesLeft)}</span>
                  )}
                  {rider?.name && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                      <Truck size={14} /> {rider.name}{rider.phone ? ` · ${rider.phone}` : ''}{rider.vehicleNumber ? ` · ${rider.vehicleNumber}` : ''}
                    </span>
                  )}
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
                  {(order.unloadingNotes || order.vehicleAccess || order.deliverySlot) && (
                    <div style={{ flex: '1 1 100%', fontSize: '0.78rem', color: MUTED }}>
                      {[order.deliverySlot && `Slot: ${order.deliverySlot}`, order.vehicleAccess && `Vehicle access: ${order.vehicleAccess}`, order.unloadingNotes].filter(Boolean).join(' · ')}
                    </div>
                  )}
                </div>

                {order.items.map((line, idx) => {
                  const status = line.vendorStatus || 'Processing';
                  const action = NEXT_ACTION[status];
                  const key = `${order.id}:${line.product?.id}`;
                  const s = line.settlement || {};
                  return (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.85rem 1.25rem', borderTop: idx === 0 ? 'none' : '1px solid #F3F4F6', flexWrap: 'wrap' }}>
                      <div style={{ width: 46, height: 46, borderRadius: 10, background: '#F3F4F6', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {line.product?.image ? <img src={line.product.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Package size={18} color="#9CA3AF" />}
                      </div>
                      <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: DARK, fontSize: '0.88rem' }}>{line.product?.name}</div>
                        <div style={{ fontSize: '0.78rem', color: MUTED }}>
                          {line.quantity}{line.product?.unit ? ` ${line.product.unit}` : ''} × {money(line.price)} = <b style={{ color: DARK }}>{money(line.lineTotal ?? line.price * line.quantity)}</b>
                          {s.gstRate !== null && s.gstRate !== undefined && <> · GST {s.gstRate}% ({money(s.gstAmount)}){s.hsnCode ? ` · HSN ${s.hsnCode}` : ''}</>}
                        </div>
                      </div>
                      <StatusChip status={status} />
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        {action && !NEEDS_RIDER.includes(action.next) && (
                          <button
                            disabled={busyKey === key}
                            onClick={() => onUpdateStatus(order.id, line.product?.id, action.next)}
                            style={{ ...primaryBtn(busyKey === key), padding: '0.45rem 0.85rem', fontSize: '0.78rem' }}
                          >
                            <Truck size={14} /> {action.label}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Money breakdown for this vendor's part of the order */}
                <div style={{ padding: '0.9rem 1.25rem', borderTop: `1px solid ${BORDER}`, background: '#FCFCFD', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <SettleCell label="Taxable value" value={money(st.taxable)} />
                  <SettleCell label={`GST (${gstSplit})`} value={money(st.gstAmount)} />
                  <SettleCell label="Platform fee" value={`- ${money(st.commission)}`} tone="#B45309" />
                  <SettleCell label="Your payout" value={money(st.payout)} tone="#166534" />
                  {nextAction && (
                    <button
                      disabled={busyKey === orderKey}
                      onClick={() =>
                        NEEDS_RIDER.includes(nextAction.next) || nextAction.next === 'Delivered'
                          ? setRiderFor({ order, status: nextAction.next })
                          : onUpdateOrder(order.id, { status: nextAction.next })
                      }
                      style={{ ...primaryBtn(busyKey === orderKey), marginLeft: 'auto' }}
                    >
                      <Truck size={15} /> {order.items.length > 1 ? `${nextAction.label} (all items)` : nextAction.label}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {riderFor && (
        <RiderModal
          order={riderFor.order}
          status={riderFor.status}
          deliveryMen={deliveryMen}
          busy={busyKey === `${riderFor.order.id}:*`}
          onClose={() => setRiderFor(null)}
          onSubmit={submitRider}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------
const Section = ({ title, hint, children }) => (
  <div style={{ ...cardStyle, padding: '1.25rem', marginBottom: '1rem' }}>
    <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>{title}</h3>
    {hint && <p style={{ margin: '3px 0 0.9rem', fontSize: '0.78rem', color: MUTED }}>{hint}</p>}
    {!hint && <div style={{ height: '0.8rem' }} />}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>{children}</div>
  </div>
);

const Field = ({ label, children, full }) => (
  <div style={full ? { gridColumn: '1 / -1' } : undefined}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

function ProfileTab({ vendorUser, profileForm, setProfileForm, meta, onSave, saving }) {
  if (!profileForm) return null;
  const approved = vendorUser.vendorStatus === 'approved';
  const completion = profileForm.profileCompletion || { percent: 0, missing: [] };
  const set = (key, value) => setProfileForm((prev) => ({ ...prev, [key]: value }));
  const setIn = (group, key, value) => setProfileForm((prev) => ({ ...prev, [group]: { ...(prev[group] || {}), [key]: value } }));
  const zones = meta?.zones || [];
  const selectedZones = profileForm.serviceZones || [];
  const toggleZone = (id) => set('serviceZones', selectedZones.includes(id) ? selectedZones.filter((z) => z !== id) : [...selectedZones, id]);
  const pickup = profileForm.pickupAddress || {};
  const bank = profileForm.bankDetails || {};

  return (
    <div style={{ maxWidth: 820 }}>
      <PageHeader title="Store Profile" subtitle="Your business, tax, pickup, bank and delivery details" />

      <div style={{ ...cardStyle, padding: '1.1rem 1.25rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: approved ? '#DCFCE7' : '#FEF3C7', color: approved ? '#166534' : '#92400E', fontWeight: 800, fontSize: '0.76rem', textTransform: 'capitalize' }}>
            {approved ? <CheckCircle size={14} /> : <Clock size={14} />} {vendorUser.vendorStatus}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={profileForm.isAcceptingOrders !== false} onChange={(e) => set('isAcceptingOrders', e.target.checked)} style={{ accentColor: ACCENT, width: 16, height: 16 }} />
            Accepting new orders
          </label>
        </div>
        <div style={{ marginTop: '0.9rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', fontWeight: 700, marginBottom: 5 }}>
            <span>Profile {completion.percent}% complete</span>
            {completion.missing.length > 0 && <span style={{ color: MUTED, fontWeight: 600 }}>Missing: {completion.missing.map((m) => m.label).join(', ')}</span>}
          </div>
          <div style={{ height: 8, borderRadius: 999, background: '#F3F4F6', overflow: 'hidden' }}>
            <div style={{ width: `${completion.percent}%`, height: '100%', background: completion.percent === 100 ? '#16A34A' : ACCENT, transition: 'width .3s' }} />
          </div>
        </div>
      </div>

      <Section title="Business" hint="Shown to customers on your products and invoices">
        <Field label="Business / Shop Name *"><input style={inputStyle} value={profileForm.businessName || ''} onChange={(e) => set('businessName', e.target.value)} /></Field>
        <Field label="Business Type">
          <select style={inputStyle} value={profileForm.businessType || ''} onChange={(e) => set('businessType', e.target.value)}>
            <option value="">Select</option>
            {(meta?.businessTypes || ['Manufacturer', 'Distributor', 'Wholesaler', 'Dealer', 'Retailer']).map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Contact Person"><input style={{ ...inputStyle, background: '#F9FAFB', color: MUTED }} value={profileForm.name || ''} readOnly /></Field>
        <Field label="Email"><input style={{ ...inputStyle, background: '#F9FAFB', color: MUTED }} value={profileForm.email || ''} readOnly /></Field>
        <Field label="Mobile Number"><input style={inputStyle} inputMode="numeric" value={profileForm.phone || ''} onChange={(e) => set('phone', e.target.value)} /></Field>
        <Field label="Customer Support Number"><input style={inputStyle} inputMode="numeric" value={profileForm.supportPhone || ''} onChange={(e) => set('supportPhone', e.target.value)} /></Field>
        <Field label="About your business" full>
          <textarea style={{ ...inputStyle, minHeight: 64, resize: 'vertical' }} value={profileForm.businessDescription || ''} onChange={(e) => set('businessDescription', e.target.value)} placeholder="What you sell, brands you stock, years in business…" />
        </Field>
      </Section>

      <Section title="Tax details" hint="Used for GST invoices and your payouts">
        <Field label="GST registered?">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.86rem', paddingTop: 8 }}>
            <input type="checkbox" checked={Boolean(profileForm.gstRegistered)} onChange={(e) => set('gstRegistered', e.target.checked)} style={{ accentColor: ACCENT, width: 16, height: 16 }} /> Yes, I have a GSTIN
          </label>
        </Field>
        <Field label={`GSTIN${profileForm.gstRegistered ? ' *' : ''}`}>
          <input style={inputStyle} maxLength={15} value={profileForm.gstin || ''} onChange={(e) => set('gstin', e.target.value.toUpperCase())} placeholder="23ABCDE1234F1Z5" />
        </Field>
        <Field label="PAN">
          <input style={inputStyle} maxLength={10} value={profileForm.pan || ''} onChange={(e) => set('pan', e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
        </Field>
      </Section>

      <Section title="Pickup / store address" hint="Where orders are packed and dispatched from. Its state decides CGST + SGST vs IGST.">
        <Field label="Street / Building" full><input style={inputStyle} value={pickup.street || ''} onChange={(e) => setIn('pickupAddress', 'street', e.target.value)} /></Field>
        <Field label="Landmark"><input style={inputStyle} value={pickup.landmark || ''} onChange={(e) => setIn('pickupAddress', 'landmark', e.target.value)} /></Field>
        <Field label="City"><input style={inputStyle} value={pickup.city || ''} onChange={(e) => setIn('pickupAddress', 'city', e.target.value)} /></Field>
        <Field label="State"><input style={inputStyle} value={pickup.state || ''} onChange={(e) => setIn('pickupAddress', 'state', e.target.value)} placeholder="Madhya Pradesh" /></Field>
        <Field label="Pincode"><input style={inputStyle} inputMode="numeric" maxLength={6} value={pickup.pincode || ''} onChange={(e) => setIn('pickupAddress', 'pincode', e.target.value.replace(/\D/g, ''))} /></Field>
      </Section>

      <Section title="Bank account" hint="Your payouts (sales + GST − platform fee) are paid here">
        <Field label="Account holder name"><input style={inputStyle} value={bank.accountHolder || ''} onChange={(e) => setIn('bankDetails', 'accountHolder', e.target.value)} /></Field>
        <Field label="Account number"><input style={inputStyle} inputMode="numeric" value={bank.accountNumber || ''} onChange={(e) => setIn('bankDetails', 'accountNumber', e.target.value.replace(/\D/g, ''))} /></Field>
        <Field label="IFSC"><input style={inputStyle} maxLength={11} value={bank.ifsc || ''} onChange={(e) => setIn('bankDetails', 'ifsc', e.target.value.toUpperCase())} placeholder="HDFC0001234" /></Field>
        <Field label="Bank name"><input style={inputStyle} value={bank.bankName || ''} onChange={(e) => setIn('bankDetails', 'bankName', e.target.value)} /></Field>
        <Field label="UPI ID (optional)"><input style={inputStyle} value={bank.upiId || ''} onChange={(e) => setIn('bankDetails', 'upiId', e.target.value)} /></Field>
      </Section>

      <div style={{ ...cardStyle, padding: '1.25rem', marginBottom: '1rem' }}>
        <h3 style={{ margin: 0, fontSize: '0.98rem', fontWeight: 800 }}>Delivery zones</h3>
        <p style={{ margin: '3px 0 0.9rem', fontSize: '0.78rem', color: MUTED }}>
          You deliver these orders yourself. Customers in a zone you select can order your products and expect delivery within the zone's time.
          {selectedZones.length === 0 && ' Nothing selected means you deliver to every zone.'}
        </p>
        {zones.length === 0 ? (
          <div style={{ fontSize: '0.84rem', color: MUTED }}>The admin has not set up delivery zones yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '0.6rem' }}>
            {zones.map((z) => {
              const on = selectedZones.includes(z.id);
              return (
                <label key={z.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '0.7rem 0.8rem', borderRadius: 12, border: `1.5px solid ${on ? ACCENT : BORDER}`, background: on ? ACCENT_SOFT : '#fff', cursor: 'pointer' }}>
                  <input type="checkbox" checked={on} onChange={() => toggleZone(z.id)} style={{ accentColor: ACCENT, width: 16, height: 16, marginTop: 2 }} />
                  <span>
                    <span style={{ display: 'block', fontWeight: 800, fontSize: '0.86rem' }}>{z.name}</span>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: MUTED }}>
                      {z.city ? `${z.city} · ` : ''}within {z.etaMinutes >= 60 ? `${Math.round((z.etaMinutes / 60) * 10) / 10} hr` : `${z.etaMinutes} min`} · {z.pincodes.length} pincode{z.pincodes.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={onSave} disabled={saving} style={primaryBtn(saving)}>
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
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
  { id: 'team', label: 'Delivery Team', icon: Users },
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
  const [deliveryMen, setDeliveryMen] = useState([]);
  const [meta, setMeta] = useState(null); // live categories, GST slabs, zones, defaults
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

  const loadDeliveryMen = useCallback(async () => {
    try {
      const res = await api.getDeliveryMen();
      setDeliveryMen(res.data || []);
    } catch {
      /* the list is optional - shipping still works with details typed in */
    }
  }, []);

  const vendorId = vendorUser?.id;

  // Initial load of everything + keep orders fresh while the panel is open.
  useEffect(() => {
    if (!vendorId) return undefined;
    loadOrders();
    loadProducts();
    loadStats();
    api.getVendorMeta().then((res) => setMeta(res.data)).catch(() => {});
    loadDeliveryMen();
    const timer = setInterval(() => loadOrders({ silent: true }), ORDER_POLL_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vendorId]);

  useEffect(() => {
    if (!vendorId) return;
    if (tab === 'dashboard') loadStats();
    if (tab === 'products') {
      loadProducts();
      api.getVendorMeta().then((res) => setMeta(res.data)).catch(() => {});
    }
    if (tab === 'orders') {
      loadOrders({ silent: true });
      loadDeliveryMen();
    }
    if (tab === 'team') loadDeliveryMen();
    if (tab === 'profile') {
      api.getVendorMeta().then((res) => setMeta(res.data)).catch(() => {});
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

  // Move all of this vendor's items in an order (optionally with the delivery person's details).
  const updateOrderStatus = async (orderId, { saveToTeam, ...payload }) => {
    setBusyKey(`${orderId}:*`);
    try {
      // Keep a delivery person typed in by hand, if asked, so next time they can just be picked.
      if (saveToTeam && !payload.deliveryManId && payload.driverName && payload.driverPhone) {
        try {
          const saved = await api.createDeliveryMan({ name: payload.driverName, phone: payload.driverPhone, vehicleNumber: payload.vehicleNumber });
          payload = { status: payload.status, note: payload.note, deliveryManId: saved.data.id };
          loadDeliveryMen();
        } catch {
          /* already saved or invalid for the team list - ship with the typed details */
        }
      }
      await api.updateVendorOrderStatus(orderId, payload);
      addToast(`Order marked as ${payload.status}`, 'success');
      await loadOrders({ silent: true });
      loadStats();
      return true;
    } catch (err) {
      addToast(err?.message || 'Could not update the order', 'error');
      return false;
    } finally {
      setBusyKey(null);
    }
  };

  const saveDeliveryMan = async (man) => {
    try {
      const data = { name: man.name, phone: man.phone, vehicleType: man.vehicleType, vehicleNumber: man.vehicleNumber, notes: man.notes, active: man.active !== false };
      if (man.id) await api.updateDeliveryMan(man.id, data);
      else await api.createDeliveryMan(data);
      addToast(man.id ? 'Delivery person updated' : 'Delivery person added', 'success');
      loadDeliveryMen();
      return true;
    } catch (err) {
      addToast(err?.message || 'Could not save the delivery person', 'error');
      return false;
    }
  };

  const removeDeliveryMan = async (man) => {
    if (!window.confirm(`Remove ${man.name} from your delivery team?`)) return;
    try {
      await api.deleteDeliveryMan(man.id);
      addToast('Removed from your team', 'success');
      loadDeliveryMen();
    } catch (err) {
      addToast(err?.message || 'Could not remove', 'error');
    }
  };

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.updateVendorProfile({
        businessName: profileForm.businessName,
        businessType: profileForm.businessType,
        businessDescription: profileForm.businessDescription,
        phone: profileForm.phone,
        supportPhone: profileForm.supportPhone,
        gstRegistered: Boolean(profileForm.gstRegistered),
        gstin: profileForm.gstin,
        pan: profileForm.pan,
        pickupAddress: profileForm.pickupAddress,
        bankDetails: profileForm.bankDetails,
        serviceZones: profileForm.serviceZones || [],
        isAcceptingOrders: profileForm.isAcceptingOrders !== false,
      });
      if (res?.data) setProfileForm({ ...res.data });
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
              categories={meta?.categories?.length ? meta.categories : categories}
              onAdd={() => setProductModal({})}
              onEdit={(p) => setProductModal(p)}
              onDelete={removeProduct}
              onToggleStock={toggleStock}
            />
          )}
          {tab === 'orders' && <OrdersTab orders={orders} loading={loading} onUpdateStatus={updateItemStatus} onUpdateOrder={updateOrderStatus} busyKey={busyKey} deliveryMen={deliveryMen} />}
          {tab === 'team' && (
            <DeliveryTeamTab
              deliveryMen={deliveryMen}
              loading={loading}
              onSave={saveDeliveryMan}
              onDelete={removeDeliveryMan}
              onToggle={(m) => saveDeliveryMan({ ...m, active: m.active === false })}
            />
          )}
          {tab === 'profile' && (
            <ProfileTab vendorUser={vendorUser} profileForm={profileForm} setProfileForm={setProfileForm} meta={meta} onSave={saveProfile} saving={savingProfile} />
          )}
        </main>
      </div>

      {productModal !== null && (
        <ProductModal product={productModal} categories={meta?.categories?.length ? meta.categories : categories} meta={meta} onClose={() => setProductModal(null)} onSave={saveProduct} canSell={canSell} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / edit product modal
// ---------------------------------------------------------------------------
function ProductModal({ product, categories = [], meta, onClose, onSave, canSell }) {
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
    gstRatePercent: product.gstRatePercent ?? '',
    hsnCode: product.hsnCode || '',
    wholesaleTiers: Array.isArray(product.wholesaleTiers) ? product.wholesaleTiers : [],
  });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);
  const { addToast } = useStore();

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const selectedCategory = categories.find((c) => c.slug === form.categorySlug);
  const subcategories = (Array.isArray(selectedCategory?.subcategories) ? selectedCategory.subcategories : []).map((sub) =>
    sub && typeof sub === 'object' ? sub.name ?? sub.label ?? '' : sub
  );

  // The GST the customer is charged: the product's own rate, else the category's, else the site's.
  const slabs = meta?.gstSlabs || [0, 5, 12, 18, 28];
  const categoryRate = selectedCategory?.gstRatePercent;
  const hasCategoryRate = categoryRate !== undefined && categoryRate !== null && categoryRate !== '';
  const inheritedRate = hasCategoryRate ? Number(categoryRate) : meta?.defaultGstRate ?? 18;
  const gstRate = form.gstRatePercent === '' ? inheritedRate : Number(form.gstRatePercent);
  const priceNum = Number(form.price) || 0;
  const inclusive = Boolean(meta?.isGstInclusive);
  const gstOnPrice = inclusive ? priceNum - priceNum / (1 + gstRate / 100) : (priceNum * gstRate) / 100;
  const setTier = (i, field, value) =>
    setForm((prev) => ({ ...prev, wholesaleTiers: prev.wholesaleTiers.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)) }));

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
      categorySlug,
      gstRatePercent: form.gstRatePercent === '' ? null : Number(form.gstRatePercent),
      wholesaleTiers: form.wholesaleTiers
        .map((t) => ({ minQty: Number(t.minQty), price: Number(t.price) }))
        .filter((t) => t.minQty > 1 && t.price > 0),
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>GST Rate</label>
              <select style={inputStyle} value={form.gstRatePercent} onChange={(e) => set('gstRatePercent', e.target.value)}>
                <option value="">{hasCategoryRate ? `Category default (${inheritedRate}%)` : `Store default (${inheritedRate}%)`}</option>
                {slabs.map((r) => (
                  <option key={r} value={r}>{r}%</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>HSN Code</label>
              <input
                style={inputStyle}
                inputMode="numeric"
                maxLength={8}
                value={form.hsnCode}
                onChange={(e) => set('hsnCode', e.target.value.replace(/\D/g, ''))}
                placeholder={selectedCategory?.hsnCode ? `Default ${selectedCategory.hsnCode}` : 'e.g. 25232930'}
              />
            </div>
          </div>
          {priceNum > 0 && (
            <div style={{ fontSize: '0.78rem', background: ACCENT_SOFT, border: `1px solid ${ACCENT_BORDER}`, borderRadius: 10, padding: '0.55rem 0.8rem' }}>
              {inclusive
                ? `Your price includes ${gstRate}% GST (${money(Math.round(gstOnPrice))}). Taxable value ${money(Math.round(priceNum - gstOnPrice))}.`
                : `Customer pays ${money(priceNum)} + ${gstRate}% GST (${money(Math.round(gstOnPrice))}) = ${money(Math.round(priceNum + gstOnPrice))} per ${form.unit || 'unit'}.`}
            </div>
          )}

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={labelStyle}>Bulk pricing (optional)</label>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, wholesaleTiers: [...prev.wholesaleTiers, { minQty: '', price: '' }] }))}
                style={{ background: 'none', border: 'none', color: '#0284C7', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
              >
                + Add tier
              </button>
            </div>
            {form.wholesaleTiers.map((tier, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <input style={inputStyle} type="number" min="2" placeholder="Min qty" value={tier.minQty} onChange={(e) => setTier(i, 'minQty', e.target.value)} />
                <input style={inputStyle} type="number" min="1" placeholder="Price per unit (₹)" value={tier.price} onChange={(e) => setTier(i, 'price', e.target.value)} />
                <button type="button" onClick={() => setForm((prev) => ({ ...prev, wholesaleTiers: prev.wholesaleTiers.filter((_, idx) => idx !== i) }))} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Trash2 size={15} color="#DC2626" />
                </button>
              </div>
            ))}
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
