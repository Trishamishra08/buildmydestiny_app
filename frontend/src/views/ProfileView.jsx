import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  User,
  ClipboardList,
  MapPin,
  Headphones,
  Truck,
  RotateCcw,
  ShieldCheck,
  FileText,
  LogOut,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Building,
  Sliders,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ProfileView = () => {
  const { user, adminUser, logout, navigateTo, addToast, addresses, orders, openLoginModal } = useStore();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState(null); // 'shipping' | 'refund' | null

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    company: user?.company || '',
    email: user?.email || '',
    gstin: user?.gstin || '',
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsEditModalOpen(false);
    addToast('Profile updated successfully', 'success');
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout();
    addToast('Logged out successfully', 'info');
    navigateTo('home');
  };

  const handleConfirmDelete = () => {
    setIsDeleteModalOpen(false);
    logout();
    addToast('Account scheduled for deletion', 'info');
    navigateTo('home');
  };

  const isAdmin = user?.role?.toLowerCase() === 'admin' || !!adminUser;

  const menuItems = [
    ...(isAdmin
      ? [
          {
            id: 'admin',
            title: '⚡ Admin Control Hub (Store & Logistics)',
            icon: Sliders,
            onClick: () => navigateTo('admin'),
          },
        ]
      : []),
    {
      id: 'orders',
      title: 'Order History',
      icon: ClipboardList,
      onClick: () => (user ? navigateTo('orders') : openLoginModal('login', () => navigateTo('orders'))),
    },
    {
      id: 'addresses',
      title: 'My Site Addresses',
      icon: MapPin,
      onClick: () => (user ? navigateTo('addresses') : openLoginModal('login', () => navigateTo('addresses'))),
    },
    {
      id: 'support',
      title: 'BuildMyDestiny Support & FAQs',
      icon: Headphones,
      onClick: () => navigateTo('help'),
    },
    {
      id: 'shipping',
      title: 'Site Delivery & Freight Policy',
      icon: Truck,
      onClick: () => setActivePolicyModal('shipping'),
    },
    {
      id: 'refund',
      title: 'Material Return & Replacement Policy',
      icon: RotateCcw,
      onClick: () => setActivePolicyModal('refund'),
    },
    {
      id: 'privacy',
      title: 'Privacy Policy',
      icon: ShieldCheck,
      onClick: () => navigateTo('privacy'),
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      icon: FileText,
      onClick: () => navigateTo('terms'),
    },
    ...(user
      ? [
          {
            id: 'logout',
            title: 'Log Out',
            icon: LogOut,
            isDanger: true,
            onClick: () => setIsLogoutModalOpen(true),
          },
          {
            id: 'delete',
            title: 'Delete Account',
            icon: Trash2,
            isDanger: true,
            onClick: () => setIsDeleteModalOpen(true),
          },
        ]
      : []),
  ];

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        minHeight: '100vh',
        paddingBottom: '85px',
      }}
    >
      <div
        style={{
          maxWidth: '540px',
          margin: '0 auto',
          padding: '16px 16px 28px 16px',
        }}
      >
        {/* 1. Top Header Bar: Back Arrow + My Profile Title (Matching Screenshot) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '18px',
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

          <h1
            style={{
              fontSize: '1.45rem',
              fontWeight: '800',
              color: '#0F172A',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: '1.2',
            }}
          >
            My Profile
          </h1>
        </div>

        {/* 2. User Profile Card / Guest Card */}
        {user ? (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              marginBottom: '18px',
            }}
          >
            {/* Left Avatar + User Details */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* User Squircle Avatar Box */}
              <div
                style={{
                  width: '54px',
                  height: '54px',
                  borderRadius: '14px',
                  backgroundColor: '#F2F2F2',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <User size={26} color="#0A0A0A" strokeWidth={1.8} />
              </div>

              {/* Name & Phone Number with Country Tag */}
              <div>
                <div
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: '800',
                    color: '#0F172A',
                    letterSpacing: '-0.01em',
                    lineHeight: '1.2',
                    marginBottom: '5px',
                  }}
                >
                  {user.name}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      backgroundColor: '#F1F5F9',
                      color: '#64748B',
                      fontSize: '0.68rem',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                      padding: '2px 7px',
                      borderRadius: '5px',
                      lineHeight: '1.2',
                    }}
                  >
                    {user.role || 'Contractor'}
                  </span>

                  <span
                    style={{
                      fontSize: '0.88rem',
                      color: '#475569',
                      fontWeight: '600',
                    }}
                  >
                    {user.phone || user.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Edit Button Box */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#F1F5F9',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                transition: 'all 0.15s ease',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E8F0';
                e.currentTarget.style.color = '#0F172A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F1F5F9';
                e.currentTarget.style.color = '#475569';
              }}
              title="Edit Profile"
            >
              <Edit3 size={18} />
            </button>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1.5px solid #FFE08A',
              background: 'linear-gradient(135deg, #FFF8E1 0%, #FFFFFF 100%)',
              padding: '18px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(255,184,0,0.15)',
              marginBottom: '18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '14px',
                  backgroundColor: '#FFF8E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-orange)',
                  flexShrink: 0,
                }}
              >
                <User size={24} />
              </div>
              <div>
                <div style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '2px' }}>
                  Guest Visitor
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Sign in or register to unlock wholesale contractor pricing & save project sites.
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => openLoginModal('login')}
              className="btn btn-primary btn-sm"
              style={{ fontWeight: '800', whiteSpace: 'nowrap' }}
            >
              Sign In
            </button>
          </div>
        )}

        {/* 3. Menu Cards List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {menuItems.map((item) => {
            const IconComp = item.icon;
            const isDanger = item.isDanger;

            return (
              <div
                key={item.id}
                onClick={item.onClick}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  userSelect: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = isDanger ? '#CBD5E1' : '#CBD5E1';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E2E8F0';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                {/* Left Area: Blue Icon Container + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Icon Box with Blue Color styling (or Soft Red for logout/delete) */}
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: isDanger ? '#F2F2F2' : '#FFF8E1',
                      border: isDanger ? '1px solid #E2E8F0' : '1px solid #FFE08A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconComp
                      size={19}
                      color={isDanger ? '#0A0A0A' : '#0A0A0A'}
                      strokeWidth={2.2}
                    />
                  </div>

                  <span
                    style={{
                      fontSize: '0.94rem',
                      fontWeight: '600',
                      color: isDanger ? '#0A0A0A' : '#1E293B',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.title}
                  </span>
                </div>

                {/* Right Area: Chevron Arrow */}
                <ChevronRight
                  size={18}
                  color={isDanger ? '#94A3B8' : '#94A3B8'}
                  strokeWidth={2.2}
                />
              </div>
            );
          })}
        </div>

        {/* 4. Version Info Text */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '28px',
            marginBottom: '10px',
            fontSize: '0.8rem',
            color: '#94A3B8',
            fontWeight: '500',
            letterSpacing: '0.02em',
          }}
        >
          Version 7.0.1 | 406
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MODALS & POPUPS */}
      {/* ========================================================= */}

      {/* A. Edit Profile Modal */}
      {isEditModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setIsEditModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '440px',
              width: '100%',
              padding: '22px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Edit Profile Details
              </h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Company / Firm Name
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '0.88rem' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '4px' }}>
                  GSTIN (For B2B Tax Invoicing)
                </label>
                <input
                  type="text"
                  value={formData.gstin}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  style={{ width: '100%', height: '40px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '0 12px', fontSize: '0.88rem', textTransform: 'uppercase' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, height: '42px', borderRadius: '8px', border: 'none', backgroundColor: '#FFB800', color: '#0A0A0A', fontWeight: '700', cursor: 'pointer' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Policy Modal (Shipping / Refund) */}
      {activePolicyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setActivePolicyModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '460px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {activePolicyModal === 'shipping' ? (
                  <Truck size={22} color="#0A0A0A" />
                ) : (
                  <RotateCcw size={22} color="#0A0A0A" />
                )}
                <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                  {activePolicyModal === 'shipping' ? 'Shipping Policy' : 'Refund & Cancellation Policy'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {activePolicyModal === 'shipping' ? (
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.55', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p>
                  <strong>⚡ 60-90 Mins Express Site Delivery:</strong> Instant delivery for adhesives, hardware, wires, paints, and urgent site supplies across active service cities.
                </p>
                <p>
                  <strong>🚛 Heavy Materials Dispatch:</strong> Cement, TMT bars, and plywood consignments are dispatched on certified 10-wheeler trucks or crane-assist dumpers directly from our regional depot.
                </p>
                <p>
                  <strong>📍 Gate Handover & Unloading:</strong> Orders are verified via secure OTP upon arrival with digital structural test certificate (MTC) tagged.
                </p>
              </div>
            ) : (
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.55', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p>
                  <strong>🔄 100% Hassle-Free Refunds:</strong> If materials received are defective or damaged during transit, instant replacement or full refund is initiated within 24 hours.
                </p>
                <p>
                  <strong>⏱️ Order Cancellation:</strong> Orders can be cancelled free of charge before truck loading and dispatch from the hub.
                </p>
                <p>
                  <strong>📦 Return Window:</strong> Unopened full boxes of tiles, undamaged wire coils, and sealed adhesive cans can be returned within 7 days of site delivery.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => setActivePolicyModal(null)}
              style={{
                width: '100%',
                height: '42px',
                marginTop: '18px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '700',
                cursor: 'pointer',
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}

      {/* C. Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setIsLogoutModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F2F2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <LogOut size={22} color="#0A0A0A" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Log Out of Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '20px' }}>
              Are you sure you want to sign out from your BuildMyDestiny contractor account?
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsLogoutModalOpen(false)}
                style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                style={{ flex: 1, height: '42px', borderRadius: '8px', border: 'none', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer' }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* D. Delete Account Confirmation Modal */}
      {isDeleteModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            zIndex: 10000,
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => setIsDeleteModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              maxWidth: '380px',
              width: '100%',
              padding: '24px 20px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#F2F2F2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px auto',
              }}
            >
              <Trash2 size={22} color="#0A0A0A" />
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px' }}>
              Delete Account?
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#64748B', marginBottom: '20px' }}>
              This action is permanent and will remove all saved site addresses, order invoices, and contractor cashback points.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                style={{ flex: 1, height: '42px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F8FAFC', color: '#475569', fontWeight: '700', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                style={{ flex: 1, height: '42px', borderRadius: '8px', border: 'none', backgroundColor: '#0A0A0A', color: '#FFFFFF', fontWeight: '700', cursor: 'pointer' }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileView;
