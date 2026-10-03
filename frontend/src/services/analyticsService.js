import { logEvent } from 'firebase/analytics';
import { analytics } from '../config/firebase';

/**
 * Safely log a custom event to Firebase Analytics
 * @param {string} eventName
 * @param {object} eventParams
 */
export const logAnalyticsEvent = (eventName, eventParams = {}) => {
  try {
    if (analytics) {
      logEvent(analytics, eventName, {
        ...eventParams,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (err) {
    // Fail silently in development/offline modes
    console.debug(`[Firebase Analytics] Error logging ${eventName}:`, err.message);
  }
};

/**
 * Log page/view transition
 */
export const trackPageView = (viewName, params = {}) => {
  logAnalyticsEvent('page_view', {
    page_title: `Build My Destiny - ${viewName}`,
    page_location: window.location.href,
    page_path: window.location.pathname,
    view_name: viewName,
    ...params,
  });
};

/**
 * Log product view
 */
export const trackViewItem = (product) => {
  if (!product) return;
  logAnalyticsEvent('view_item', {
    currency: 'INR',
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        unit: product.unit,
      },
    ],
  });
};

/**
 * Log Add to Cart
 */
export const trackAddToCart = (product, quantity = 1) => {
  if (!product) return;
  logAnalyticsEvent('add_to_cart', {
    currency: 'INR',
    value: product.price * quantity,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
        quantity: quantity,
      },
    ],
  });
};

/**
 * Log Remove from Cart
 */
export const trackRemoveFromCart = (productId) => {
  logAnalyticsEvent('remove_from_cart', {
    item_id: productId,
  });
};

/**
 * Log Checkout Start
 */
export const trackBeginCheckout = (cartItems = [], grandTotal = 0) => {
  logAnalyticsEvent('begin_checkout', {
    currency: 'INR',
    value: grandTotal,
    item_count: cartItems.length,
    items: cartItems.map((item) => ({
      item_id: item.product?.id,
      item_name: item.product?.name,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

/**
 * Log Purchase / Order Completion
 */
export const trackPurchase = (order) => {
  if (!order) return;
  logAnalyticsEvent('purchase', {
    transaction_id: order.id || order.orderNumber,
    value: order.grandTotal || order.total || order.summary?.totalAmount,
    currency: 'INR',
    tax: order.summary?.gstAmount || 0,
    shipping: order.summary?.deliveryCharge || 0,
    coupon: order.summary?.couponCode || '',
    items: (order.items || []).map((item) => ({
      item_id: item.product?.id || item.id,
      item_name: item.product?.name || item.name,
      price: item.price,
      quantity: item.quantity || 1,
    })),
  });
};

/**
 * Log User Login
 */
export const trackUserLogin = (method = 'email') => {
  logAnalyticsEvent('login', { method });
};

/**
 * Log User Sign Up
 */
export const trackUserSignUp = (method = 'email') => {
  logAnalyticsEvent('sign_up', { method });
};

/**
 * Log Quotation Request
 */
export const trackQuotationRequest = (quotation) => {
  logAnalyticsEvent('generate_lead', {
    lead_type: 'bulk_material_quotation',
    city: quotation.siteCity,
    project_type: quotation.projectType,
    client_name: quotation.clientName,
  });
};

export default {
  logAnalyticsEvent,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackUserLogin,
  trackUserSignUp,
  trackQuotationRequest,
};
