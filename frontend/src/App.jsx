import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';

// Components
import SplashScreen from './components/SplashScreen';
import Header from './components/Header';
import MobileHeader from './components/MobileHeader';
import MobileBottomNav from './components/MobileBottomNav';
import BottomCartBar from './components/BottomCartBar';
import Footer from './components/Footer';
import LocationModal from './components/LocationModal';
import ProductOptionsModal from './components/ProductOptionsModal';
import QuotationModal from './components/QuotationModal';
import LoginModal from './components/LoginModal';
import ToastContainer from './components/Toast';

// 23 Views
import HomeView from './views/HomeView';
import CategoriesView from './views/CategoriesView';
import ProductListingView from './views/ProductListingView';
import SearchResultsView from './views/SearchResultsView';
import ProductDetailsView from './views/ProductDetailsView';
import CartView from './views/CartView';
import CheckoutView from './views/CheckoutView';
import OrderConfirmationView from './views/OrderConfirmationView';
import MyOrdersView from './views/MyOrdersView';
import OrderDetailsView from './views/OrderDetailsView';
import OrderTrackingView from './views/OrderTrackingView';
import WishlistView from './views/WishlistView';
import ProfileView from './views/ProfileView';
import AddressesView from './views/AddressesView';
import NotificationsView from './views/NotificationsView';
import LoginView from './views/LoginView';
import SignupView from './views/SignupView';
import ForgotPasswordView from './views/ForgotPasswordView';
import AboutView from './views/AboutView';
import ContactView from './views/ContactView';
import HelpFaqView from './views/HelpFaqView';
import TermsView from './views/TermsView';
import PrivacyPolicyView from './views/PrivacyPolicyView';
import AdminView from './views/AdminView';
import VendorView from './views/VendorView';

function MainAppLayout() {
  const { currentView, user } = useStore();

  const isAdminView = currentView === 'admin';
  const isVendorView = currentView === 'vendor';

  if (isAdminView) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <AdminView />
        </main>
        <ToastContainer />
      </div>
    );
  }

  if (isVendorView) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <VendorView />
        </main>
        <ToastContainer />
      </div>
    );
  }

  // Force Authentication Gate for unauthenticated visitors while allowing public policy pages
  if (!user) {
    const isPublicPolicyView = ['privacy', 'terms', 'help', 'contact', 'about'].includes(currentView);

    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F8FAFC' }}>
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: isPublicPolicyView ? 'flex-start' : 'center',
            justifyContent: 'center',
            padding: '1.5rem 1rem',
          }}
        >
          {currentView === 'signup' ? (
            <SignupView />
          ) : currentView === 'forgot-password' ? (
            <ForgotPasswordView />
          ) : currentView === 'privacy' ? (
            <PrivacyPolicyView />
          ) : currentView === 'terms' ? (
            <TermsView />
          ) : currentView === 'help' ? (
            <HelpFaqView />
          ) : currentView === 'contact' ? (
            <ContactView />
          ) : currentView === 'about' ? (
            <AboutView />
          ) : (
            <LoginView />
          )}
        </main>
        <ToastContainer />
      </div>
    );
  }

  // Hide global website header (logo, search bar) on categories, orders, order-details, order-tracking, profile, admin, cart, checkout
  const isCustomHeaderView = ['categories', 'orders', 'order-details', 'order-tracking', 'profile', 'admin', 'cart', 'checkout'].includes(currentView);
  const hideMobileHeader = isCustomHeaderView || currentView === 'product-details';

  const renderActiveView = () => {
    switch (currentView) {
      case 'admin':
        return <AdminView />;
      case 'home':
        return <HomeView />;
      case 'categories':
        return <CategoriesView />;
      case 'category-products':
        return <ProductListingView />;
      case 'search':
        return <SearchResultsView />;
      case 'product-details':
        return <ProductDetailsView />;
      case 'cart':
        return <CartView />;
      case 'checkout':
        return <CheckoutView />;
      case 'order-confirmation':
        return <OrderConfirmationView />;
      case 'orders':
        return <MyOrdersView />;
      case 'order-details':
        return <OrderDetailsView />;
      case 'order-tracking':
        return <OrderTrackingView />;
      case 'wishlist':
        return <WishlistView />;
      case 'profile':
        return <ProfileView />;
      case 'addresses':
        return <AddressesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'login':
        return <LoginView />;
      case 'signup':
        return <SignupView />;
      case 'forgot-password':
        return <ForgotPasswordView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'help':
        return <HelpFaqView />;
      case 'terms':
        return <TermsView />;
      case 'privacy':
        return <PrivacyPolicyView />;
      default:
        return <HomeView />;
    }
  };

  if (isAdminView) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <main style={{ flex: 1 }}>
          <AdminView />
        </main>
        <ToastContainer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: isCustomHeaderView ? '#FFFFFF' : 'var(--bg-main)' }}>
      {/* Desktop Navigation Header */}
      {!isCustomHeaderView && <Header />}

      {/* Mobile Navigation Header */}
      {!hideMobileHeader && <MobileHeader />}

      {/* Dynamic Main View */}
      <main style={{ flex: 1 }}>
        {renderActiveView()}
      </main>

      {/* Universal Footer */}
      {!isCustomHeaderView && <Footer />}

      {/* Floating Bottom Cart Notification Bar (Quick Commerce Style) */}
      <BottomCartBar />

      {/* Mobile Sticky Bottom Bar (5 Tabs) */}
      <MobileBottomNav />

      {/* Location Deliver-to Selector Modal */}
      <LocationModal />

      {/* Product Specification / Variant Selector Modal */}
      <ProductOptionsModal />

      {/* Instant WhatsApp Quotation Request Modal */}
      <QuotationModal />

      {/* User Login & Registration Modal */}
      <LoginModal />

      {/* Global Toast Alert Notifications */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <StoreProvider>
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <MainAppLayout />
    </StoreProvider>
  );
}
