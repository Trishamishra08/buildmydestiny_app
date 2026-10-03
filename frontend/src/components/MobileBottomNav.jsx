import React from 'react';
import { Home, LayoutGrid, ClipboardList, User } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const MobileBottomNav = () => {
  const { currentView, navigateTo, orders, user, setIsQuotationOpen, openLoginModal } = useStore();

  const activeOrdersCount = orders.filter((o) => o.statusCode !== 'delivered' && o.statusCode !== 'cancelled').length;

  const isHomeActive = currentView === 'home';
  const isCategoriesActive = currentView === 'categories' || currentView === 'category-products';
  const isOrdersActive = currentView === 'orders' || currentView === 'order-details' || currentView === 'order-tracking' || currentView === 'order-confirmation';
  const isAccountActive = currentView === 'profile' || currentView === 'addresses' || currentView === 'notifications' || currentView === 'login' || currentView === 'signup' || currentView === 'forgot-password';

  // Do not show the 5-tab generic bottom bar on product details, cart, or checkout view
  if (currentView === 'product-details' || currentView === 'cart' || currentView === 'checkout') return null;

  return (
    <nav
      className="hide-on-desktop"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 9000,
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.04)',
        height: '64px',
        padding: '0 8px calc(env(safe-area-inset-bottom, 0px) + 2px) 8px',
      }}
    >
      {/* 1. Home Tab */}
      <button
        type="button"
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
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <div
          style={{
            width: isHomeActive ? '36px' : 'auto',
            height: isHomeActive ? '26px' : 'auto',
            borderRadius: '13px',
            backgroundColor: isHomeActive ? '#FFB800' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s ease',
          }}
        >
          <Home
            size={18}
            color={isHomeActive ? '#0A0A0A' : '#6B7280'}
            fill={isHomeActive ? '#0A0A0A' : 'none'}
            strokeWidth={isHomeActive ? 2.5 : 2}
          />
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: isHomeActive ? '800' : '600',
            color: isHomeActive ? '#0A0A0A' : '#6B7280',
          }}
        >
          Home
        </span>
      </button>

      {/* 2. Categories Tab */}
      <button
        type="button"
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
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <div
          style={{
            width: isCategoriesActive ? '36px' : 'auto',
            height: isCategoriesActive ? '26px' : 'auto',
            borderRadius: '13px',
            backgroundColor: isCategoriesActive ? '#FFB800' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <LayoutGrid
            size={19}
            color={isCategoriesActive ? '#0A0A0A' : '#6B7280'}
            strokeWidth={isCategoriesActive ? 2.5 : 2}
          />
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: isCategoriesActive ? '800' : '600',
            color: isCategoriesActive ? '#0A0A0A' : '#6B7280',
          }}
        >
          Categories
        </span>
      </button>

      {/* 3. Orders Tab */}
      <button
        type="button"
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
          cursor: 'pointer',
          position: 'relative',
          padding: '4px 0',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: isOrdersActive ? '36px' : 'auto',
            height: isOrdersActive ? '26px' : 'auto',
            borderRadius: '13px',
            backgroundColor: isOrdersActive ? '#FFB800' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ClipboardList
            size={19}
            color={isOrdersActive ? '#0A0A0A' : '#6B7280'}
            strokeWidth={isOrdersActive ? 2.5 : 2}
          />
          {activeOrdersCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-6px',
                backgroundColor: '#FFB800',
                color: '#0A0A0A',
                fontSize: '0.55rem',
                fontWeight: '900',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #FFFFFF',
              }}
            >
              {activeOrdersCount}
            </span>
          )}
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: isOrdersActive ? '800' : '600',
            color: isOrdersActive ? '#0A0A0A' : '#6B7280',
          }}
        >
          Orders
        </span>
      </button>

      {/* 4. Account Tab */}
      <button
        type="button"
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
          cursor: 'pointer',
          padding: '4px 0',
        }}
      >
        <div
          style={{
            width: isAccountActive ? '36px' : 'auto',
            height: isAccountActive ? '26px' : 'auto',
            borderRadius: '13px',
            backgroundColor: isAccountActive ? '#FFB800' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <User
            size={19}
            color={isAccountActive ? '#0A0A0A' : '#6B7280'}
            strokeWidth={isAccountActive ? 2.5 : 2}
          />
        </div>
        <span
          style={{
            fontSize: '0.68rem',
            fontWeight: isAccountActive ? '800' : '600',
            color: isAccountActive ? '#0A0A0A' : '#6B7280',
          }}
        >
          Account
        </span>
      </button>

      {/* 5. GET QUOTE Button */}
      <div style={{ padding: '0 6px' }}>
        <button
          type="button"
          onClick={() => setIsQuotationOpen(true)}
          style={{
            backgroundColor: '#FFB800',
            color: '#0A0A0A',
            border: 'none',
            borderRadius: '10px',
            padding: '7px 12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 184, 0, 0.35)',
            lineHeight: 1.1,
            minWidth: '70px',
            height: '42px',
          }}
          title="Get Custom Quote"
        >
          <span style={{ fontSize: '0.66rem', fontWeight: '900', letterSpacing: '0.04em' }}>
            GET
          </span>
          <span style={{ fontSize: '0.68rem', fontWeight: '900', letterSpacing: '0.04em' }}>
            QUOTE
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
