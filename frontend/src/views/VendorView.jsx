import React, { useEffect, useState } from 'react';
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
  Store,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';
import api from '../services/api';

const ACCENT = '#F5A623';
const DARK = '#0A0A0A';

const money = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// ---------------------------------------------------------------------------
// Auth screen (login / register) shown when no vendor session exists
// ---------------------------------------------------------------------------
function VendorAuthScreen() {
  const { vendorLogin, vendorOtpLogin, vendorSignup, navigateTo } = useStore();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [useOtp, setUseOtp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', otp: '' });

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        if (useOtp) {
          await vendorOtpLogin(form.phone, form.otp);
        } else {
          await vendorLogin(form.email || form.phone, form.password);
        }
      } else {
        await vendorSignup(form);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 0.9rem',
    borderRadius: '10px',
    border: '1px solid #E2E8F0',
    fontSize: '0.9rem',
    marginBottom: '0.85rem',
    outline: 'none',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(160deg, ${DARK} 0%, #1a1a1a 100%)`,
        padding: '1.5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <Logo size="medium" onClick={() => navigateTo('home')} />
        </div>

        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '18px',
            padding: '1.75rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'inline-flex', padding: '10px', borderRadius: '12px', background: '#FFF4E0', marginBottom: '0.5rem' }}>
              <Store size={22} color={ACCENT} />
            </div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: DARK, margin: 0 }}>Vendor Panel</h1>
            <p style={{ fontSize: '0.85rem', color: '#64748B', margin: '0.25rem 0 0' }}>
              Sell your materials on Build My Destiny
            </p>
          </div>

          <div style={{ display: 'flex', borderRadius: '10px', background: '#F1F5F9', padding: '4px', marginBottom: '1.25rem' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  background: mode === m ? '#FFFFFF' : 'transparent',
                  color: mode === m ? DARK : '#64748B',
                  boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <input style={inputStyle} placeholder="Your Name" value={form.name} onChange={update('name')} required />
                <input
                  style={inputStyle}
                  placeholder="Business / Shop Name"
                  value={form.businessName}
                  onChange={update('businessName')}
                  required
                />
                <input style={inputStyle} placeholder="Phone Number" value={form.phone} onChange={update('phone')} />
              </>
            )}

            {mode === 'login' && useOtp ? (
              <>
                <input
                  style={inputStyle}
                  type="tel"
                  placeholder="Phone Number"
                  value={form.phone}
                  onChange={update('phone')}
                  required
                />
                <input
                  style={{ ...inputStyle, marginBottom: '0.5rem' }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit OTP"
                  value={form.otp}
                  onChange={update('otp')}
                  required
                />
              </>
            ) : (
              <>
                <input
                  style={inputStyle}
                  type={mode === 'login' ? 'text' : 'email'}
                  placeholder={mode === 'login' ? 'Email or Phone' : 'Email Address'}
                  value={form.email}
                  onChange={update('email')}
                  required={mode === 'register'}
                />
                <input
                  style={{ ...inputStyle, marginBottom: '0.5rem' }}
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={update('password')}
                  required
                />
              </>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => setUseOtp((prev) => !prev)}
                style={{
                  display: 'block',
                  margin: '0 0 1.1rem auto',
                  background: 'none',
                  border: 'none',
                  color: ACCENT,
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                }}
              >
                {useOtp ? 'Use password instead' : 'Use OTP instead'}
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '0.8rem',
                borderRadius: '10px',
                border: 'none',
                background: ACCENT,
                color: DARK,
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: isSubmitting ? 'default' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Vendor Account'}
            </button>
          </form>
        </div>

        <button
          onClick={() => navigateTo('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            margin: '1.25rem auto 0',
            background: 'none',
            border: 'none',
            color: '#B8B8B8',
            cursor: 'pointer',
            fontSize: '0.85rem',
          }}
        >
          <ArrowLeft size={15} /> Back to store
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pending / rejected approval notice
// ---------------------------------------------------------------------------
function VendorStatusBanner({ status }) {
  if (status === 'approved') return null;
  const isRejected = status === 'rejected';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '10px',
        padding: '0.9rem 1rem',
        borderRadius: '12px',
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
        <div style={{ fontSize: '0.8rem', color: isRejected ? '#B91C1C' : '#B45309', marginTop: '2px' }}>
          {isRejected
            ? 'Please contact support if you believe this is a mistake.'
            : 'You can browse your dashboard, but listing products is disabled until an admin approves your account.'}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main vendor dashboard shell
// ---------------------------------------------------------------------------
export default function VendorView() {
  const { vendorUser, vendorLogout, navigateTo, addToast } = useStore();

  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productModal, setProductModal] = useState(null); // null | {} (new) | product (edit)
  const [profileForm, setProfileForm] = useState(null);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorStats();
      setStats(res.data);
    } catch (err) {
      addToast(err?.message || 'Could not load dashboard stats', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorProducts();
      setProducts(res.data || []);
    } catch (err) {
      addToast(err?.message || 'Could not load products', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVendorOrders();
      setOrders(res.data || []);
    } catch (err) {
      addToast(err?.message || 'Could not load orders', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!vendorUser) return;
    if (tab === 'dashboard') loadDashboard();
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'profile') setProfileForm({ ...vendorUser });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, vendorUser]);

  if (!vendorUser) return <VendorAuthScreen />;

  const canSell = vendorUser.vendorStatus === 'approved';

  const saveProduct = async (data) => {
    try {
      if (data.id && products.some((p) => p.id === data.id)) {
        await api.updateVendorProduct(data.id, data);
        addToast('Product updated', 'success');
      } else {
        await api.createVendorProduct(data);
        addToast('Product created', 'success');
      }
      setProductModal(null);
      loadProducts();
    } catch (err) {
      addToast(err?.message || 'Could not save product', 'error');
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.deleteVendorProduct(id);
      addToast('Product deleted', 'success');
      loadProducts();
    } catch (err) {
      addToast(err?.message || 'Could not delete product', 'error');
    }
  };

  const updateItemStatus = async (orderId, productId, status) => {
    try {
      await api.updateVendorOrderItemStatus(orderId, productId, status);
      addToast('Order item status updated', 'success');
      loadOrders();
    } catch (err) {
      addToast(err?.message || 'Could not update status', 'error');
    }
  };

  const saveProfile = async () => {
    try {
      await api.updateVendorProfile(profileForm);
      addToast('Profile updated', 'success');
    } catch (err) {
      addToast(err?.message || 'Could not update profile', 'error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'My Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside
        style={{
          width: '230px',
          background: DARK,
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
        }}
      >
        <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Logo size="small" inverted onClick={() => navigateTo('home')} />
          <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#B8B8B8' }}>Vendor Panel</div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem' }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '0.65rem 0.75rem',
                marginBottom: '4px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                background: tab === id ? ACCENT : 'transparent',
                color: tab === id ? DARK : '#E2E8F0',
                fontWeight: 700,
                fontSize: '0.85rem',
                textAlign: 'left',
              }}
            >
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{vendorUser.businessName || vendorUser.name}</div>
          <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginBottom: '0.6rem' }}>{vendorUser.email}</div>
          <button
            onClick={vendorLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              padding: '0.5rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'transparent',
              color: '#E2E8F0',
              cursor: 'pointer',
              fontSize: '0.8rem',
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, padding: '1.75rem', overflowX: 'auto' }}>
        <VendorStatusBanner status={vendorUser.vendorStatus} />

        {tab === 'dashboard' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: DARK, marginBottom: '1rem' }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Products Listed', value: stats?.productCount ?? '—' },
                { label: 'Orders', value: stats?.orderCount ?? '—' },
                { label: 'Revenue', value: stats ? money(stats.revenue) : '—' },
              ].map((card) => (
                <div key={card.label} style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>{card.label}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, color: DARK, marginTop: '4px' }}>{isLoading ? '…' : card.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'products' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: DARK, margin: 0 }}>My Products</h2>
              <button
                disabled={!canSell}
                onClick={() => setProductModal({})}
                title={canSell ? 'Add a product' : 'Pending approval'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.6rem 1rem',
                  borderRadius: '10px',
                  border: 'none',
                  background: canSell ? ACCENT : '#E2E8F0',
                  color: canSell ? DARK : '#94A3B8',
                  fontWeight: 700,
                  cursor: canSell ? 'pointer' : 'not-allowed',
                }}
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#F8FAFC', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Price</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#94A3B8' }}>
                        {isLoading ? 'Loading…' : 'No products yet.'}
                      </td>
                    </tr>
                  )}
                  {products.map((p) => (
                    <tr key={p.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{money(p.price)}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>{p.stockCount ?? '—'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ color: p.inStock === false ? '#DC2626' : '#16A34A', fontWeight: 700 }}>
                          {p.inStock === false ? 'Out of stock' : 'In stock'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                        <button onClick={() => setProductModal(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px' }}>
                          <Edit2 size={15} color="#64748B" />
                        </button>
                        <button onClick={() => removeProduct(p.id)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                          <Trash2 size={15} color="#DC2626" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'orders' && (
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: DARK, marginBottom: '1rem' }}>Orders</h2>
            {orders.length === 0 && (
              <div style={{ background: '#fff', borderRadius: '14px', padding: '2rem', textAlign: 'center', color: '#94A3B8' }}>
                {isLoading ? 'Loading…' : 'No orders containing your products yet.'}
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {orders.map((order) => (
                <div key={order.id} style={{ background: '#fff', borderRadius: '14px', padding: '1.1rem 1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.6rem' }}>
                    <div style={{ fontWeight: 800 }}>Order #{order.orderNumber || order.id}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{order.customerName || 'Customer'} · {money(order.vendorTotal)}</div>
                  </div>
                  {(order.items || []).map((line, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '0.5rem 0',
                        borderTop: idx === 0 ? 'none' : '1px solid #F1F5F9',
                        fontSize: '0.85rem',
                      }}
                    >
                      <div>
                        {line.product?.name} × {line.quantity}
                      </div>
                      <select
                        value={line.vendorStatus || 'Processing'}
                        onChange={(e) => updateItemStatus(order.id, line.product?.id, e.target.value)}
                        style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}
                      >
                        {['Processing', 'Ready to Ship', 'Shipped', 'Delivered'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'profile' && profileForm && (
          <div style={{ maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: DARK, marginBottom: '1rem' }}>Profile</h2>
            <div style={{ background: '#fff', borderRadius: '14px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ marginBottom: '0.9rem' }}>
                <CheckCircle size={14} color={canSell ? '#16A34A' : '#D97706'} style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'capitalize' }}>{vendorUser.vendorStatus}</span>
              </div>
              {[
                { key: 'businessName', label: 'Business Name' },
                { key: 'phone', label: 'Phone' },
                { key: 'city', label: 'City' },
                { key: 'gstin', label: 'GSTIN' },
              ].map(({ key, label }) => (
                <div key={key} style={{ marginBottom: '0.85rem' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>{label}</label>
                  <input
                    value={profileForm[key] || ''}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', fontSize: '0.88rem' }}
                  />
                </div>
              ))}
              <button
                onClick={saveProfile}
                style={{ padding: '0.6rem 1.2rem', borderRadius: '10px', border: 'none', background: ACCENT, color: DARK, fontWeight: 800, cursor: 'pointer' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </main>

      {productModal !== null && (
        <ProductModal product={productModal} onClose={() => setProductModal(null)} onSave={saveProduct} />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add / edit product modal
// ---------------------------------------------------------------------------
function ProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    id: product.id || '',
    name: product.name || '',
    price: product.price || '',
    mrp: product.mrp || '',
    stockCount: product.stockCount ?? '',
    unit: product.unit || '',
    description: product.description || '',
    image: product.image || '',
    inStock: product.inStock !== false,
  });

  const update = (field) => (e) => {
    const value = field === 'inStock' ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...form,
      price: Number(form.price) || 0,
      mrp: Number(form.mrp) || Number(form.price) || 0,
      stockCount: Number(form.stockCount) || 0,
    });
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.8rem',
    borderRadius: '8px',
    border: '1px solid #E2E8F0',
    fontSize: '0.88rem',
    marginBottom: '0.8rem',
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1200,
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: '16px', padding: '1.5rem', width: '100%', maxWidth: '460px', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem', color: DARK }}>
          {product.id ? 'Edit Product' : 'Add Product'}
        </h3>
        <form onSubmit={handleSubmit}>
          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Name *</label>
          <input style={inputStyle} value={form.name} onChange={update('name')} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Price (₹) *</label>
              <input style={inputStyle} type="number" min="0" value={form.price} onChange={update('price')} required />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>MRP (₹)</label>
              <input style={inputStyle} type="number" min="0" value={form.mrp} onChange={update('mrp')} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Stock Count</label>
              <input style={inputStyle} type="number" min="0" value={form.stockCount} onChange={update('stockCount')} />
            </div>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Unit</label>
              <input style={inputStyle} placeholder="e.g. bag, piece" value={form.unit} onChange={update('unit')} />
            </div>
          </div>

          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Image URL</label>
          <input style={inputStyle} value={form.image} onChange={update('image')} placeholder="https://…" />

          <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Description</label>
          <textarea style={{ ...inputStyle, minHeight: '70px', resize: 'vertical' }} value={form.description} onChange={update('description')} />

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '1.1rem' }}>
            <input type="checkbox" checked={form.inStock} onChange={update('inStock')} /> In stock
          </label>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: '1px solid #E2E8F0', background: '#fff', cursor: 'pointer', fontWeight: 700 }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '0.65rem', borderRadius: '10px', border: 'none', background: ACCENT, color: DARK, fontWeight: 800, cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
