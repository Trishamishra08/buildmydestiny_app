import React from 'react';
import { Home, LayoutGrid, ClipboardList, User, Flame } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav = () => {
  const { currentView, navigateTo, orders, user, setIsQuotationOpen, openLoginModal } = useStore();

  const activeOrdersCount = orders.filter((o) => o.statusCode !== 'delivered' && o.statusCode !== 'cancelled').length;

  const isHomeActive = currentView === 'home';
  const isCategoriesActive = currentView === 'categories' || currentView === 'category-products' || currentView === 'product-details';
  const isOrdersActive = currentView === 'orders' || currentView === 'order-details' || currentView === 'order-tracking' || currentView === 'order-confirmation';
  const isAccountActive = currentView === 'profile' || currentView === 'addresses' || currentView === 'notifications' || currentView === 'login' || currentView === 'signup' || currentView === 'forgot-password';

  // Do not show the 5-tab generic bottom bar on product details, cart, or checkout view (as they use dedicated bottom action bars)
  if (currentView === 'product-details' || currentView === 'cart' || currentView === 'checkout') return null;

  return (
    <nav
      className="hide-on-desktop"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#0A0A0A',
        borderTop: '1px solid #1F1F1F',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 9000,
        boxShadow: '0 -3px 14px rgba(0,0,0,0.25)',
        height: '62px',
        padding: '0 8px calc(env(safe-area-inset-bottom, 0px) + 2px) 8px',
      }}
    >
      {/* 1. Home Tab */}
      <button
        onClick={() => navigateTo('home')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: isHomeActive ? 'var(--primary-orange)' : '#9CA3AF',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'var(--transition)',
        }}
      >
        <Home size={21} fill="none" strokeWidth={isHomeActive ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isHomeActive ? '800' : '600' }}>
          Home
        </span>
      </button>

      {/* 2. Categories Tab */}
      <button
        onClick={() => navigateTo('categories')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: isCategoriesActive ? 'var(--primary-orange)' : '#9CA3AF',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'var(--transition)',
        }}
      >
        <LayoutGrid size={21} strokeWidth={isCategoriesActive ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isCategoriesActive ? '800' : '600' }}>
          Categories
        </span>
      </button>

      {/* 3. Orders Tab */}
      <button
        onClick={() => (user ? navigateTo('orders') : openLoginModal('login', () => navigateTo('orders')))}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: isOrdersActive ? 'var(--primary-orange)' : '#9CA3AF',
          cursor: 'pointer',
          position: 'relative',
          padding: '4px 0',
          transition: 'var(--transition)',
        }}
      >
        <div style={{ position: 'relative' }}>
          <ClipboardList size={21} strokeWidth={isOrdersActive ? 2.5 : 2} />
          {activeOrdersCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-8px',
                backgroundColor: 'var(--primary-orange)',
                color: '#0A0A0A',
                fontSize: '0.58rem',
                fontWeight: '900',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #0A0A0A',
              }}
            >
              {activeOrdersCount}
            </span>
          )}
        </div>
        <span style={{ fontSize: '0.68rem', fontWeight: isOrdersActive ? '800' : '600' }}>
          Orders
        </span>
      </button>

      {/* 4. Account Tab */}
      <button
        onClick={() => (user ? navigateTo('profile') : openLoginModal('login'))}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: isAccountActive ? 'var(--primary-orange)' : '#9CA3AF',
          cursor: 'pointer',
          padding: '4px 0',
          transition: 'var(--transition)',
        }}
      >
        <User size={21} strokeWidth={isAccountActive ? 2.5 : 2} />
        <span style={{ fontSize: '0.68rem', fontWeight: isAccountActive ? '800' : '600' }}>
          Account
        </span>
      </button>

      {/* 5. QUOTATION / WHATSAPP REQUIREMENT */}
      <div style={{ padding: '0 4px' }}>
        <button
          type="button"
          onClick={() => setIsQuotationOpen(true)}
          style={{
            background: 'var(--primary-orange)',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: '9px',
            padding: '6px 8px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 10px rgba(255, 184, 0, 0.4)',
            lineHeight: '1.15',
            minWidth: '66px',
            transition: 'transform 0.15s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          title="Send Material Requirement on WhatsApp"
        >
          <span style={{ fontSize: '0.62rem', fontWeight: '900', letterSpacing: '0.04em' }}>
            GET
          </span>
          <span style={{ fontSize: '0.64rem', fontWeight: '900', letterSpacing: '0.04em', color: '#0A0A0A' }}>
            QUOTE
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
