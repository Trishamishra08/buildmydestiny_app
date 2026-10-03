import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useServerSync } from '../services/serverSync';
import { computeTotals, couponDiscount, resolveVariantOptions, unitPrice, getCartItemKey } from '../utils/pricing';
import { getDeliverySchedule } from '../utils/deliverySchedule';
import { auth, googleProvider } from '../config/firebase';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  trackPageView,
  trackAddToCart,
  trackRemoveFromCart,
  trackPurchase,
  trackUserLogin,
  trackUserSignUp,
} from '../services/analyticsService';
import {
  registerServiceWorker,
  sendCustomerOrderNotification,
  sendAdminNewOrderNotification,
  requestNotificationPermission,
  getNotificationPermission,
} from '../services/pushNotificationService';
import {
  PRODUCTS as INITIAL_PRODUCTS,
  CATEGORIES as INITIAL_CATEGORIES,
  CATEGORY_SECTIONS as INITIAL_CATEGORY_SECTIONS,
  MOCK_ORDERS as INITIAL_ORDERS,
  MOCK_ADDRESSES,
  MOCK_NOTIFICATIONS,
  MOCK_FAQS as INITIAL_FAQS,
  TOP_BRANDS,
  CITIES as INITIAL_CITIES,
} from '../data/mockData';

const StoreContext = createContext(null);

// Clean Data Migration (Exact UI Reference Sync)
const DATA_VERSION = 'mistri_ui_exact_v8';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('mistri_app_version') !== DATA_VERSION) {
      const keysToPurge = [
        'mistri_products', 'mistri_categories', 'mistri_category_sections',
        'mistri_orders', 'mistri_services', 'mistri_mistris', 'mistri_bookings',
        'mistri_users_list', 'mistri_coupons', 'mistri_quotations', 'mistri_banners',
        'mistri_faqs', 'mistri_cart', 'mistri_wishlist', 'mistri_saved_addresses',
        'mistri_notifications', 'mistri_admin_notifications', 'mistri_support_messages',
        'mistri_applied_coupon'
      ];
      keysToPurge.forEach((k) => localStorage.removeItem(k));
      localStorage.setItem('mistri_app_version', DATA_VERSION);
    }
    // Also explicitly purge if categories contain test garbage like xyz or jalebi
    const storedCats = localStorage.getItem('mistri_categories');
    if (storedCats && (storedCats.includes('xyz') || storedCats.includes('jalebi') || storedCats.includes('unsplash.com'))) {
      localStorage.removeItem('mistri_categories');
    }
  } catch (e) {
    console.warn('Failed to purge legacy mock storage', e);
  }
}

// Sub-category ghost fix migration (v6): wipe ALL auto-generated fake subcategories from stored categories
const GHOST_SUB_VERSION = 'mistri_ghost_sub_fix_v6';
if (typeof window !== 'undefined') {
  try {
    if (localStorage.getItem('mistri_ghost_sub_version') !== GHOST_SUB_VERSION) {
      // Clear all subcategories from every category — none were legitimately created by admin.
      // Previous code auto-injected ghost subs (e.g. 'Accessories', 'Premium Grade', 'Standard Grade',
      // 'Fast Dispatch', and even the category's own name) every time a category or parent section
      // was created. This migration removes them all in one shot.
      const rawCats = localStorage.getItem('mistri_categories');
      if (rawCats) {
        const cats = JSON.parse(rawCats);
        const cleaned = cats.map((cat) => ({
          ...cat,
          subcategories: [],
          subcategoryImages: {},
        }));
        localStorage.setItem('mistri_categories', JSON.stringify(cleaned));
      }
      localStorage.setItem('mistri_ghost_sub_version', GHOST_SUB_VERSION);
    }
  } catch (e) {
    console.warn('Failed to run ghost sub migration', e);
  }
}


// Initial Service Catalogue
const INITIAL_SERVICES = [];

// Initial Technicians (Mistris)
const INITIAL_MISTRIS = [];

// Initial Technician Bookings
const INITIAL_BOOKINGS = [];

// Initial Registered Users & Contractors
const INITIAL_USERS_LIST = [];

// Initial Coupons & Promos
const INITIAL_COUPONS = [
  {
    code: 'BUILDMYDESTINY100',
    description: 'Flat ₹100 Instant Discount on your material orders',
    discountType: 'flat',
    flatAmount: 100,
    discountPercentage: 0,
    minOrderValue: 999,
    maxDiscount: 100,
    badge: 'FIRST ORDER',
    isActive: true,
    usageCount: 42,
  },
  {
    code: 'BUILDER10',
    description: '10% Contractor Discount on structural materials & tools',
    discountType: 'percentage',
    discountPercentage: 10,
    flatAmount: 0,
    minOrderValue: 2500,
    maxDiscount: 1000,
    badge: 'TRENDING',
    isActive: true,
    usageCount: 88,
  },
  {
    code: 'BULK500',
    description: 'Flat ₹500 Mega Savings on cement bags & steel rebar orders',
    discountType: 'flat',
    flatAmount: 500,
    discountPercentage: 0,
    minOrderValue: 10000,
    maxDiscount: 500,
    badge: 'BEST VALUE',
    isActive: true,
    usageCount: 29,
  },
  {
    code: 'SITE20',
    description: '20% Off on electrical cables, switches & plumbing fittings',
    discountType: 'percentage',
    discountPercentage: 20,
    flatAmount: 0,
    minOrderValue: 1500,
    maxDiscount: 600,
    badge: 'SPECIAL',
    isActive: true,
    usageCount: 54,
  },
];

// Initial Quotation Requests
const INITIAL_QUOTATIONS = [];

// Initial Marketing Banners
const INITIAL_BANNERS = [
  {
    id: 'hero-banner-main',
    title: "Build Your Dream. We'll Help You Build It Right.",
    subtitle: 'Quality Materials. Trusted Suppliers. Delivered to Your Site.',
    image: '/hero-banner.jpg',
    position: 'hero',
    isActive: true,
    target: 'products',
    showTextOverlay: false,
  },
];


// Initial Site Settings
const INITIAL_SETTINGS = {
  storeName: 'BuildMyDestiny – Construction Material & Technician Booking Platform',
  tagline: 'From Foundation to Finish',
  supportPhone: '+91 96309 38487',
  whatsappNumber: '+91 96309 38487',
  supportEmail: 'care@buildmydestiny.com',
  depotAddress: 'Central Logistics Park, Near Vavdimohala, Kod, Dist- Dhar, MP - 454001',
  depotCity: 'Dhar',
  depotPincode: '454001',
  depotState: 'Madhya Pradesh',
  maxDeliveryRadiusKm: 50,
  restrictToServiceableAreas: true,
  serviceableCities: ['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Dhar', 'Pithampur', 'Gwalior', 'Jabalpur'],
  serviceablePincodes: ['452001', '452002', '452003', '452005', '452010', '453331', '454001', '456001', '455001', '462001'],
  gstRatePercent: 18,
  isGstInclusive: false,
  deliveryType: 'free', // 'free' | 'km_based' | 'min_order_free' | 'flat'
  flatDeliveryFee: 49,
  minFreeDeliveryOrder: 500,
  deliveryBaseKm: 5,
  deliveryBaseFee: 0,
  deliveryPerKmFee: 15,
  estimatedDeliveryKm: 5,
  enableUnloadingFee: true,
  unloadingChargeStandard: 199,
  unloadingHelperText: '1 Helper',
  unloadingDescription: "Includes unloading & keeping at designated place on ground level. Doesn't include shifting to upper floors.",
  freeUnloadingThreshold: 50000,
  tickerMessage: '🚚 EXPRESS SITE DISPATCH IN 60 MINS • OFFICIAL MTC LAB TEST CERTIFICATES INCLUDED WITH EVERY STEEL & CEMENT ORDER • GST 100% ITC COMPLIANT',
  isMaintenanceMode: false,
  cancellationPolicy: [
    'Orders cannot be modified once packed.',
    'Delivery location of an Order cannot be changed. INR 249 additional charges in unavoidable cases.',
    'Orders cannot be cancelled once packed. Cancellation charges of INR 199 would apply.',
  ],
};

// Storage helper with fallback
const getStored = (key, fallback) => {
  try {
    const item = localStorage.getItem(`mistri_${key}`);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.warn(`Error reading localStorage for ${key}`, err);
    return fallback;
  }
};

const setStored = (key, value) => {
  try {
    localStorage.setItem(`mistri_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing localStorage for ${key}`, err);
  }
};

// URL Router helpers
const parseRouteFromUrl = () => {
  try {
    let rawPath = window.location.pathname || '/';
    let rawSearch = window.location.search || '';

    let rawHash = window.location.hash || '';
    if (rawHash) {
      if (rawHash.startsWith('#/')) {
        rawHash = rawHash.slice(2);
      } else if (rawHash.startsWith('#')) {
        rawHash = rawHash.slice(1);
      }
      if (rawHash) {
        const [hashPath, hashQuery] = rawHash.split('?');
        if (hashPath) {
          rawPath = '/' + hashPath.replace(/^\/+/, '');
        }
        if (hashQuery && !rawSearch) {
          rawSearch = '?' + hashQuery;
        }
      }
    }

    const cleanPath = rawPath.replace(/^\/+/, '').replace(/\/+$/, '');
    const viewName = cleanPath || 'home';

    const params = {};
    if (rawSearch) {
      const searchParams = new URLSearchParams(rawSearch);
      for (const [key, value] of searchParams.entries()) {
        params[key] = value;
      }
    }

    if (params.id && !params.orderId && (viewName === 'order-details' || viewName === 'order-tracking')) {
      params.orderId = params.id;
    }
    if (params.id && !params.productId && viewName === 'product-details') {
      params.productId = params.id;
    }
    if (params.q && !params.query) {
      params.query = params.q;
    }

    return { view: viewName, params };
  } catch (err) {
    console.error('Failed to parse route from URL', err);
    return { view: 'home', params: {} };
  }
};

const buildUrlFromRoute = (view, params = {}) => {
  if (!view || view === 'home') return '/';

  const queryParams = new URLSearchParams();

  if (view === 'order-details') {
    const id = params.order?.id || params.orderId || params.id;
    if (id) queryParams.set('id', id);
  } else if (view === 'order-tracking') {
    const id = params.orderId || params.id || params.order?.id;
    if (id) queryParams.set('id', id);
  } else if (view === 'product-details') {
    const id = params.product?.id || params.productId || params.id;
    if (id) queryParams.set('id', id);
  } else if (view === 'category-products') {
    const slug = params.slug || params.categorySlug;
    if (slug) queryParams.set('slug', slug);
  } else if (view === 'search') {
    const q = params.query || params.q || '';
    if (q) queryParams.set('query', q);
  } else if (view === 'admin') {
    if (params.tab) queryParams.set('tab', params.tab);
  } else {
    Object.keys(params).forEach((key) => {
      if (typeof params[key] === 'string' || typeof params[key] === 'number') {
        queryParams.set(key, String(params[key]));
      }
    });
  }

  const queryString = queryParams.toString();
  return queryString ? `/${view}?${queryString}` : `/${view}`;
};

export const StoreProvider = ({ children }) => {
  // Navigation State
  const initialRoute = parseRouteFromUrl();
  const [currentView, setCurrentView] = useState(initialRoute.view);
  const [viewParams, setViewParams] = useState(initialRoute.params);
  const [searchQuery, setSearchQuery] = useState(initialRoute.params.query || '');

  // Admin Active Tab
  const [adminActiveTab, setAdminActiveTab] = useState(initialRoute.params.tab || 'dashboard');

  // Dynamic Reactive Entities (Initialized from LocalStorage with fallback)
  const [products, setProducts] = useState(() => getStored('products', INITIAL_PRODUCTS));
  const [isProductsLoaded, setIsProductsLoaded] = useState(() => {
    try {
      const stored = localStorage.getItem('mistri_products');
      return !!(stored && JSON.parse(stored)?.length > 0);
    } catch {
      return false;
    }
  });
  const [categories, setCategories] = useState(() => getStored('categories', INITIAL_CATEGORIES));
  const [categorySections, setCategorySections] = useState(() => getStored('category_sections', INITIAL_CATEGORY_SECTIONS));
  const [orders, setOrders] = useState(() => getStored('orders', INITIAL_ORDERS));
  const [services, setServices] = useState(() => getStored('services', INITIAL_SERVICES));
  const [mistris, setMistris] = useState(() => getStored('mistris', INITIAL_MISTRIS));
  const [bookings, setBookings] = useState(() => getStored('bookings', INITIAL_BOOKINGS));
  const [usersList, setUsersList] = useState(() => getStored('users_list', INITIAL_USERS_LIST));
  const [coupons, setCoupons] = useState(() => getStored('coupons', INITIAL_COUPONS));
  const [quotations, setQuotations] = useState(() => getStored('quotations', INITIAL_QUOTATIONS));
  const [banners, setBanners] = useState(() => getStored('banners', INITIAL_BANNERS));
  const [faqs, setFaqs] = useState(() => getStored('faqs', INITIAL_FAQS));
  const [supportMessages, setSupportMessages] = useState(() => getStored('support_messages', []));
  const [siteSettings, setSiteSettings] = useState(() => {
    const stored = getStored('settings', null);
    if (stored && typeof stored === 'object') {
      return { 
        ...INITIAL_SETTINGS, 
        ...stored,
        enableUnloadingFee: stored.enableUnloadingFee !== undefined ? stored.enableUnloadingFee : true,
        unloadingChargeStandard: stored.unloadingChargeStandard !== undefined ? stored.unloadingChargeStandard : 199,
        unloadingHelperText: stored.unloadingHelperText || '1 Helper',
        unloadingDescription: stored.unloadingDescription || "Includes unloading & keeping at designated place on ground level. Doesn't include shifting to upper floors.",
      };
    }
    return INITIAL_SETTINGS;
  });
  const [cities, setCities] = useState(() => getStored('cities', INITIAL_CITIES));

  // Deliver to Location (Persistent in LocalStorage)
  const [currentCity, setCurrentCity] = useState(() => getStored('current_city', cities[0] || 'Indore'));
  const [currentPincode, setCurrentPincode] = useState(() => getStored('current_pincode', '452005'));
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Wallet / Cashback Balance
  const [walletBalance, setWalletBalance] = useState(0);
  const [isWalletVisible, setIsWalletVisible] = useState(false);
  const toggleWalletVisibility = () => setIsWalletVisible((prev) => !prev);

  // Product Options Modal
  const [optionsModalProduct, setOptionsModalProduct] = useState(null);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);

  const openOptionsModal = (product) => {
    setOptionsModalProduct(product);
    setIsOptionsModalOpen(true);
  };

  const closeOptionsModal = () => {
    setIsOptionsModalOpen(false);
    setOptionsModalProduct(null);
  };

  // Quotation / WhatsApp Requirement Modal
  const [isQuotationOpen, setIsQuotationOpen] = useState(false);
  const isPriceDropOpen = isQuotationOpen;
  const setIsPriceDropOpen = setIsQuotationOpen;

  // Login & Registration Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginModalMode, setLoginModalMode] = useState('login'); // 'login' | 'register'
  const [authSuccessCallback, setAuthSuccessCallback] = useState(null);

  const openLoginModal = (mode = 'login', callback = null) => {
    setLoginModalMode(mode);
    setAuthSuccessCallback(() => (typeof callback === 'function' ? callback : null));
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setAuthSuccessCallback(null);
  };

  // Cart Drawer
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Current Logged-in User (Defaults to null for new visitors / guests)
  const [user, setUser] = useState(() => getStored('current_user', null));

  // Exclusive Admin Authentication State
  const [adminUser, setAdminUser] = useState(() => getStored('admin_user', null));

  // Exclusive Vendor Authentication State (multivendor marketplace)
  const [vendorUser, setVendorUser] = useState(() => getStored('vendor_user', null));

  // Cart State (Initialized from storage or starts empty for real shopping)
  const [cart, setCart] = useState(() => getStored('cart', []));

  const [appliedCoupon, setAppliedCoupon] = useState(() => getStored('applied_coupon', null));
  const [isUnloadingSelected, setIsUnloadingSelected] = useState(false);

  // Wishlist State
  const [wishlist, setWishlist] = useState(() => getStored('wishlist', []));

  // Addresses State
  const [addresses, setAddresses] = useState(() => getStored('saved_addresses', MOCK_ADDRESSES));
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Notifications State (Customer)
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);

  // Admin Real-time Notifications State
  const INITIAL_ADMIN_NOTIFICATIONS = [];
  const [adminNotifications, setAdminNotifications] = useState(() => getStored('admin_notifications', INITIAL_ADMIN_NOTIFICATIONS));

  // Web Audio Synthesizer for instant Order Alert Chime
  const playOrderNotificationSound = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 -> E5 -> G5 -> C6 chime
      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.11);

        gain.gain.setValueAtTime(0, ctx.currentTime + index * 0.11);
        gain.gain.linearRampToValueAtTime(0.35, ctx.currentTime + index * 0.11 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + index * 0.11 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + index * 0.11);
        osc.stop(ctx.currentTime + index * 0.11 + 0.36);
      });
    } catch (e) {
      console.log('Audio chime error:', e);
    }
  };

  const markAdminNotificationRead = (id) => {
    setAdminNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllAdminNotificationsRead = () => {
    setAdminNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const clearAdminNotifications = () => {
    setAdminNotifications([]);
  };

  // Toast System
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Persistent storage sync effects
  useEffect(() => { setStored('current_user', user); }, [user]);
  useEffect(() => { setStored('admin_user', adminUser); }, [adminUser]);
  useEffect(() => { setStored('vendor_user', vendorUser); }, [vendorUser]);
  useEffect(() => { setStored('admin_notifications', adminNotifications); }, [adminNotifications]);
  useEffect(() => { setStored('cart', cart); }, [cart]);
  useEffect(() => { setStored('applied_coupon', appliedCoupon); }, [appliedCoupon]);
  useEffect(() => { setStored('wishlist', wishlist); }, [wishlist]);
  useEffect(() => { setStored('products', products); }, [products]);
  useEffect(() => { setStored('categories', categories); }, [categories]);
  useEffect(() => { setStored('category_sections', categorySections); }, [categorySections]);
  useEffect(() => { setStored('orders', orders); }, [orders]);
  useEffect(() => { setStored('services', services); }, [services]);
  useEffect(() => { setStored('mistris', mistris); }, [mistris]);
  useEffect(() => { setStored('bookings', bookings); }, [bookings]);
  useEffect(() => { setStored('users_list', usersList); }, [usersList]);
  useEffect(() => { setStored('coupons', coupons); }, [coupons]);
  useEffect(() => { setStored('quotations', quotations); }, [quotations]);
  useEffect(() => { setStored('banners', banners); }, [banners]);
  useEffect(() => { setStored('faqs', faqs); }, [faqs]);
  useEffect(() => { setStored('support_messages', supportMessages); }, [supportMessages]);
  useEffect(() => { setStored('settings', siteSettings); }, [siteSettings]);
  useEffect(() => { setStored('cities', cities); }, [cities]);
  useEffect(() => { setStored('current_city', currentCity); }, [currentCity]);
  useEffect(() => { setStored('current_pincode', currentPincode); }, [currentPincode]);

  // MongoDB sync: load every collection from the API and save changes back to it.
  // localStorage above stays as an offline cache for the first paint.
  const hasToken = (key) => {
    try {
      return !!localStorage.getItem(key);
    } catch (e) {
      return false;
    }
  };
  const { reloadFromServer, markSynced } = useServerSync({
    collections: {
      products: [products, setProducts],
      categories: [categories, setCategories],
      categorySections: [categorySections, setCategorySections],
      services: [services, setServices],
      mistris: [mistris, setMistris],
      banners: [banners, setBanners],
      faqs: [faqs, setFaqs],
      coupons: [coupons, setCoupons],
      cities: [cities, setCities],
      orders: [orders, setOrders],
      bookings: [bookings, setBookings],
      quotations: [quotations, setQuotations],
      supportMessages: [supportMessages, setSupportMessages],
      adminNotifications: [adminNotifications, setAdminNotifications],
      usersList: [usersList, setUsersList],
    },
    settings: [siteSettings, setSiteSettings],
    account: [{ addresses, wishlist }, { setAddresses, setWishlist }],
    session: {
      isAdmin: !!adminUser && hasToken('mistri_admin_token'),
      isUser: !!user && hasToken('mistri_token'),
      userKey: user?.id || user?.email || '',
    },
    onError: (message) => addToast(message, 'error', 6000),
    onNewItems: (name) => {
      // A customer placed something while the admin panel was open.
      if (name === 'adminNotifications') playOrderNotificationSound();
    },
    onLoaded: (name, items) => {
      if (name === 'products') {
        setIsProductsLoaded(true);
        reconcileWithCatalog(items);
      }
    },
    onAuthError: (err, kind) => endExpiredSession(kind),
  });

  // Keep the cart and wishlist in step with the live catalogue: products the admin
  // deleted (or marked out of stock) leave the cart, and prices follow the latest ones.
  const latestCart = useRef(cart);
  const latestWishlist = useRef(wishlist);
  latestCart.current = cart;
  latestWishlist.current = wishlist;
  const reconcileWithCatalog = (catalog) => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    const removed = [];
    const nextCart = [];
    latestCart.current.forEach((item) => {
      const fresh = byId.get(item.product?.id);
      const selection = item.product?.variantSelection || {};
      const { options, error } = fresh ? resolveVariantOptions(fresh, selection) : { options: [], error: 'gone' };
      if (!fresh || fresh.inStock === false || error) {
        removed.push(item.product?.name || 'An item');
        return;
      }
      const price = unitPrice(fresh, item.quantity, options);
      const itemKey = item.cartItemId || getCartItemKey(item.product || fresh);
      nextCart.push({
        ...item,
        cartItemId: itemKey,
        price,
        product: {
          ...fresh,
          name: item.product?.name || fresh.name,
          price,
          variantSelection: item.product?.variantSelection,
          selectedVariant: item.product?.selectedVariant,
        },
      });
    });
    if (JSON.stringify(nextCart) !== JSON.stringify(latestCart.current)) setCart(nextCart);
    if (removed.length) {
      addToast(`Removed from your cart (no longer available): ${removed.join(', ')}`, 'warning', 8000);
    }

    const nextWishlist = latestWishlist.current.filter((p) => byId.has(p.id)).map((p) => byId.get(p.id));
    if (JSON.stringify(nextWishlist) !== JSON.stringify(latestWishlist.current)) setWishlist(nextWishlist);
  };

  // A session the server no longer accepts (expired, or issued before an update) is
  // signed out with an explanation, instead of every save failing with a cryptic error.
  const lastSessionNotice = useRef(0);
  const endExpiredSession = (kind) => {
    const notify = Date.now() - lastSessionNotice.current > 5000;
    lastSessionNotice.current = Date.now();
    try {
      localStorage.removeItem(kind === 'admin' ? 'mistri_admin_token' : kind === 'vendor' ? 'mistri_vendor_token' : 'mistri_token');
    } catch (e) {}
    if (kind === 'admin') {
      setAdminUser(null);
      if (notify) addToast('Your admin session has expired. Please sign in again - changes made since then were not saved.', 'warning', 10000);
    } else if (kind === 'vendor') {
      setVendorUser(null);
      if (notify) addToast('Your vendor session has expired. Please sign in again.', 'warning', 8000);
    } else {
      setUser(null);
      if (notify) addToast('Your session has expired. Please sign in again.', 'warning', 8000);
    }
  };

  // Check stored sessions with the server when the app opens, so an outdated admin
  // login is caught before any edits are made with it.
  useEffect(() => {
    if (!adminUser || !hasToken('mistri_admin_token')) return;
    api
      .getMe('admin')
      .then((res) => {
        if (res?.data?.role !== 'admin') endExpiredSession('admin');
      })
      .catch((err) => {
        if (err?.status === 401 || err?.status === 403) endExpiredSession('admin');
      });
  }, [adminUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!user || !hasToken('mistri_token')) return;
    api.getMe('user').catch((err) => {
      if (err?.status === 401) endExpiredSession('user');
    });
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!vendorUser || !hasToken('mistri_vendor_token')) return;
    api
      .getVendorProfile()
      .then((res) => {
        if (res?.data?.role !== 'vendor') return endExpiredSession('vendor');
        // Keep the local copy of approval status fresh (an admin may approve/reject
        // between visits) without forcing the vendor to re-authenticate.
        setVendorUser((prev) => (prev ? { ...prev, vendorStatus: res.data.vendorStatus, businessName: res.data.businessName } : prev));
      })
      .catch((err) => {
        if (err?.status === 401 || err?.status === 403) endExpiredSession('vendor');
      });
  }, [vendorUser?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // URL change listener for browser Back/Forward & popstate
  useEffect(() => {
    const handleLocationChange = () => {
      const { view, params } = parseRouteFromUrl();
      setCurrentView(view);
      setViewParams(params);
      if (params.query) setSearchQuery(params.query);
      if (params.tab) setAdminActiveTab(params.tab);
    };

    if (window.location.hash) {
      const { view, params } = parseRouteFromUrl();
      const cleanUrl = buildUrlFromRoute(view, params);
      window.history.replaceState({ view, params }, '', cleanUrl);
    }

    window.addEventListener('popstate', handleLocationChange);
    // Initialize push notification service worker
    registerServiceWorker();

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  // Navigation Helper
  const navigateTo = (view, params = {}, replace = false) => {
    const targetUrl = buildUrlFromRoute(view, params);
    const currentUrl = window.location.pathname + (window.location.search || '');

    if (currentUrl !== targetUrl || window.location.hash) {
      if (replace) {
        window.history.replaceState({ view, params }, '', targetUrl);
      } else {
        window.history.pushState({ view, params }, '', targetUrl);
      }
    }

    setCurrentView(view);
    setViewParams(params);
    if (params.query) setSearchQuery(params.query);
    if (params.tab) setAdminActiveTab(params.tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    trackPageView(view, params);
  };

  // Cart Calculations
  // Uses the same pricing rules as the server (utils/pricing.js), so the total shown at
  // checkout is the total the order is charged.
  const cartSubtotal = cart.reduce((acc, item) => acc + (item.price || 0) * item.quantity, 0);
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  // Re-check the applied coupon against the current coupon list and cart, so a coupon
  // that was deactivated or no longer meets its minimum stops discounting.
  const activeCoupon = appliedCoupon
    ? coupons.find((c) => c.code?.toUpperCase() === appliedCoupon.code?.toUpperCase()) || null
    : null;
  const {
    discount: discountAmount,
    deliveryFee,
    deliveryNote,
    unloadingCharge,
    gstAmount,
    isGstInclusive,
    grandTotal,
  } = computeTotals({ subtotal: cartSubtotal, coupon: activeCoupon, settings: siteSettings, includeUnloading: isUnloadingSelected });

  // Cart Operations
  const addToCart = (product, quantity = 1) => {
    const itemKey = product.cartItemId || getCartItemKey(product);
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => (item.cartItemId || getCartItemKey(item.product)) === itemKey
      );
      let newPrice = product.price;
      const newQty = existingIndex > -1 ? prev[existingIndex].quantity + quantity : quantity;
      if (Array.isArray(product.wholesaleTiers)) {
        const matchedTier = [...product.wholesaleTiers]
          .sort((a, b) => (b.minQty || 0) - (a.minQty || 0))
          .find((t) => newQty >= (t.minQty || 0));
        if (matchedTier && matchedTier.price) {
          newPrice = matchedTier.price;
        }
      }

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          cartItemId: itemKey,
          quantity: newQty,
          price: newPrice,
          product: {
            ...updated[existingIndex].product,
            ...product,
            price: newPrice,
          },
        };
        return updated;
      }
      return [...prev, { cartItemId: itemKey, product, quantity, price: newPrice }];
    });

    trackAddToCart(product, quantity);
    const displayName = product.selectedVariant
      ? `${product.name} (${product.selectedVariant})`
      : product.name;
    addToast(`Added ${quantity}x ${displayName} to Cart`, 'success');
  };

  const removeFromCart = (targetId) => {
    trackRemoveFromCart(targetId);
    setCart((prev) =>
      prev.filter((item) => {
        const itemKey = item.cartItemId || getCartItemKey(item.product);
        return itemKey !== targetId && item.product?.id !== targetId;
      })
    );
    addToast('Item removed from cart', 'info');
  };

  const updateCartQty = (targetId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(targetId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        const itemKey = item.cartItemId || getCartItemKey(item.product);
        if (itemKey === targetId || item.product?.id === targetId) {
          let price = item.product.price;
          if (Array.isArray(item.product.wholesaleTiers)) {
            const matchedTier = [...item.product.wholesaleTiers]
              .sort((a, b) => (b.minQty || 0) - (a.minQty || 0))
              .find((t) => newQty >= (t.minQty || 0));
            if (matchedTier && matchedTier.price) {
              price = matchedTier.price;
            }
          }
          return { ...item, cartItemId: itemKey, quantity: newQty, price };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Coupon Application
  const applyCoupon = (code) => {
    if (!code) return { success: false, message: 'Please enter promo code' };
    const upper = code.trim().toUpperCase();

    const foundCoupon = coupons.find((c) => c.code?.toUpperCase() === upper);

    if (foundCoupon) {
      const { amount: calculatedDiscount, reason } = couponDiscount(foundCoupon, cartSubtotal);
      if (reason) {
        const msg = `${upper}: ${reason}`;
        addToast(msg, 'warning');
        return { success: false, message: msg };
      }

      setAppliedCoupon({
        code: upper,
        discountType: foundCoupon.discountType || (foundCoupon.flatAmount ? 'flat' : 'percentage'),
        discountPercentage: foundCoupon.discountPercentage || 0,
        flatAmount: foundCoupon.flatAmount || 0,
        discountAmount: calculatedDiscount,
        description: foundCoupon.description || '',
      });

      addToast(`Coupon "${upper}" applied! Saved ₹${calculatedDiscount.toLocaleString('en-IN')}`, 'success');
      return { success: true };
    }

    addToast('Invalid or expired coupon code.', 'danger');
    return { success: false, message: 'Invalid or expired promo code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    addToast('Coupon removed', 'info');
  };

  // Wishlist Operations
  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        addToast(`Removed ${product.name} from Wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        addToast(`Saved ${product.name} to Wishlist`, 'success');
        return [...prev, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  // Order Operations
  // Place an order. The server prices it from its own product data (the numbers shown at
  // checkout come from the same rules) and, for online orders, confirms the Razorpay
  // payment. Only the customer's choices and delivery details are sent. Throws with a
  // readable message when the order is not accepted.
  const placeOrder = async (orderData = {}) => {
    const paymentMethod = orderData.paymentMethod || 'Cash on Delivery (Pay on Site)';
    const isOnline = /online|upi|card|net ?banking|wallet/i.test(paymentMethod) && !/cash/i.test(paymentMethod);
    const siteAddress = orderData.siteAddress || addresses[0];
    const orderItems = orderData.items && orderData.items.length > 0 ? orderData.items : [...cart];
    const now = new Date();
    const deliveryInfo = getDeliverySchedule(now);

    const request = {
      items: orderItems.map((item) => ({
        product: {
          id: item.product?.id ?? item.id,
          variantSelection: item.product?.variantSelection || undefined,
        },
        quantity: item.quantity,
      })),
      couponCode: appliedCoupon?.code || null,
      paymentMethod,
      customerName: user?.name || siteAddress?.recipientName || '',
      customerPhone: user?.phone || siteAddress?.phone || '',
      deliverySlot: orderData.deliverySlot || (deliveryInfo.isAfter8PM ? 'Next Day Priority Slot' : 'Express Morning (08:00 AM - 12:00 PM)'),
      vehicleAccess: orderData.siteVehicleAccess || 'Heavy 10-Wheeler Truck Access',
      unloadingNotes: orderData.unloadingNotes || '',
      expectedDelivery: deliveryInfo.expectedDelivery,
      deliveryDate: deliveryInfo.deliveryDate,
      deliveryMessage: deliveryInfo.deliveryMessage,
      isAfter8PMOrder: deliveryInfo.isAfter8PM,
      siteAddress,
      shippingAddress: siteAddress,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      driverName: 'Ramesh Patel',
      driverPhone: '+91 98260 99881',
      vehicleNumber: 'MP-09-TR-4421',
      ...(isOnline
        ? {
            payment: {
              razorpayOrderId: orderData.razorpayOrderId,
              razorpayPaymentId: orderData.razorpayPaymentId,
              razorpaySignature: orderData.razorpaySignature,
            },
          }
        : {}),
    };

    let newOrder;
    try {
      newOrder = (await api.createOrder(request)).data;
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server - your order was not placed. Please try again.'
          : err?.message || 'Your order could not be placed. Please try again.';
      addToast(message, 'error', 7000);
      throw new Error(message);
    }

    markSynced('orders', newOrder);
    setOrders((prev) => [newOrder, ...prev.filter((o) => o.id !== newOrder.id)]);

    // Customer notification
    const customerNotification = {
      id: `notif_${Date.now()}`,
      type: 'delivery',
      title: `Order Placed Successfully (${newOrder.id})`,
      message: `Your material order for ₹${Number(newOrder.grandTotal || 0).toLocaleString('en-IN')} is confirmed for delivery. Payment: ${newOrder.payment?.method || paymentMethod}.`,
      time: 'Just now',
      unread: true,
      orderId: newOrder.id,
    };
    setNotifications((prev) => [customerNotification, ...prev]);

    // The admin notification is created by the server (see backend notificationHooks).

    // Trigger Native Device & Browser Push Notifications (Customer & Admin)
    sendCustomerOrderNotification(newOrder).catch((err) =>
      console.debug('Customer push notification note:', err)
    );
    sendAdminNewOrderNotification(newOrder).catch((err) =>
      console.debug('Admin push notification note:', err)
    );

    clearCart();

    // Track e-commerce purchase in Firebase Analytics
    trackPurchase(newOrder);

    addToast(`Order #${newOrder.id} placed successfully! (${isOnline ? 'Online Paid' : 'Cash on Delivery'})`, 'success');
    return newOrder;
  };

  const getOrderById = (id) => {
    if (!id) return orders[0] || INITIAL_ORDERS[0];
    const target = String(id).toLowerCase();
    return orders.find((o) => o.id?.toLowerCase() === target) ||
           INITIAL_ORDERS.find((o) => o.id?.toLowerCase() === target) ||
           orders[0] ||
           INITIAL_ORDERS[0];
  };

  // Returns null for a product that does not exist (e.g. deleted by the admin) - never a
  // different product in its place.
  const getProductById = (id) => {
    if (!id) return null;
    const target = String(id).toLowerCase().trim();
    return (
      products.find((p) => {
        const pId = String(p.id || p._id || '').toLowerCase().trim();
        return (
          pId === target ||
          pId === `prod_${target}` ||
          target === `prod_${pId}` ||
          (p.slug && String(p.slug).toLowerCase().trim() === target)
        );
      }) || null
    );
  };



  // Auth Operations
  // Turn the API's account payload into the profile object the UI uses.
  const profileFromServer = (data, extra = {}) => ({
    id: String(data._id),
    name: data.name,
    email: data.email,
    phone: data.phone || '',
    avatar: data.avatar,
    role: data.role === 'customer' ? 'Customer' : data.role,
    company: data.company || '',
    gstin: data.gstin || '',
    tier: data.tier || 'Standard Builder Tier',
    status: 'Active',
    city: currentCity,
    ...extra,
  });

  // Shared tail of every successful sign-in.
  const completeSignIn = (profile, token, callback, welcome) => {
    localStorage.setItem('mistri_token', token);
    setUser(profile);
    setIsLoginModalOpen(false);
    addToast(welcome, 'success');

    const execCb = callback || authSuccessCallback;
    if (typeof execCb === 'function') {
      execCb(profile);
      setAuthSuccessCallback(null);
    }
    return { success: true, user: profile };
  };

  const loginWithGoogle = async (callback = null) => {
    let result;
    try {
      result = await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Google Sign-In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        addToast('Google Sign-In was cancelled.', 'warning');
      } else if (err.code === 'auth/popup-blocked') {
        addToast('Google popup was blocked by browser. Please allow popups.', 'error');
      } else {
        addToast(err.message || 'Google Sign-In failed', 'error');
      }
      throw err;
    }

    // The server verifies the Google identity and returns this customer's account.
    try {
      const idToken = await result.user.getIdToken();
      const res = await api.firebaseLogin(idToken);
      const profile = profileFromServer(res.data, {
        avatar: res.data.avatar || result.user.photoURL,
        authProvider: 'firebase_google',
      });
      trackUserLogin('google');
      return completeSignIn(profile, res.data.token, callback, `Welcome to BuildMyDestiny, ${profile.name}! (Signed in via Google)`);
    } catch (err) {
      signOut(auth).catch(() => {});
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err?.message || 'Google sign-in could not be completed';
      addToast(message, 'error');
      throw new Error(message);
    }
  };

  const userOtpLogin = async (phone, otp, callback = null) => {
    let res;
    try {
      res = await api.otpLogin(phone, otp, 'customer');
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err?.status === 401
            ? 'Invalid phone number or OTP.'
            : err?.message || 'OTP login failed. Please try again.';
      throw new Error(message);
    }

    const profile = profileFromServer(res.data);
    trackUserLogin('otp');
    return completeSignIn(profile, res.data.token, callback, `Welcome back, ${profile.name}!`);
  };

  const login = async (emailOrPhone, password, callback = null) => {
    const identifier = String(emailOrPhone || '').trim();

    // The server is the source of truth for accounts. Firebase is only asked as well so
    // its analytics/session stays in step; its answer does not decide the login.
    if (identifier.includes('@')) {
      signInWithEmailAndPassword(auth, identifier.toLowerCase(), password).catch(() => {});
    }

    let res;
    try {
      res = await api.login(identifier, password);
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err?.status === 401
            ? 'Incorrect email/phone or password.'
            : err?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }

    const profile = profileFromServer(res.data);
    trackUserLogin(identifier.includes('@') ? 'email' : 'phone');
    return completeSignIn(profile, res.data.token, callback, `Welcome back, ${profile.name}!`);
  };

  const signup = async (formData, callback = null) => {
    if (!formData.password) {
      throw new Error('Please choose a password.');
    }

    let res;
    try {
      res = await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'customer',
        company: formData.company || '',
        gstin: formData.gstin || '',
        city: currentCity,
      });
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err?.message || 'Registration failed. Please try again.';
      throw new Error(message);
    }

    // Also create the Firebase account for its email features; failure here is not fatal.
    if (formData.email) {
      createUserWithEmailAndPassword(auth, formData.email, formData.password).catch(() => {});
    }

    const profile = profileFromServer(res.data, { company: formData.company || '', gstin: formData.gstin || '' });
    trackUserSignUp('email_or_form');
    return completeSignIn(profile, res.data.token, callback, `Account created successfully! Welcome to BuildMyDestiny, ${profile.name}.`);
  };

  const logout = () => {
    signOut(auth).catch(() => {});
    setUser(null);
    try {
      localStorage.removeItem('mistri_current_user');
      localStorage.removeItem('mistri_token');
    } catch (e) {}
    addToast('Logged out of your BuildMyDestiny account', 'info');
  };

  // Exclusive Admin Authentication Handler
  const adminLogin = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      addToast('Please enter both Administrator Email and Password', 'warning');
      return { success: false, message: 'Please enter both email and password' };
    }

    // The server is the only judge of administrator credentials; nothing secret ships
    // in the browser bundle, and without a token the admin panel could not save.
    try {
      const res = await api.login(cleanEmail, cleanPassword);
      const data = res?.data;
      if (!data?.token || data.role !== 'admin') {
        addToast('Access Denied: this account is not an administrator', 'error');
        return { success: false, message: 'This account is not an administrator' };
      }

      localStorage.setItem('mistri_admin_token', data.token);
      const authAdmin = {
        id: String(data._id),
        name: data.name || 'Administrator',
        company: 'BuildMyDestiny Platform Admin HQ',
        email: data.email,
        phone: data.phone || '',
        role: 'Admin',
        tier: 'Root Administrator (Full Access)',
        status: 'Active',
      };
      setAdminUser(authAdmin);
      addToast('Administrator authenticated successfully! Welcome back.', 'success');
      return { success: true, user: authAdmin };
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : 'Access Denied: Invalid administrator email or password';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const adminOtpLogin = async (phone, otp) => {
    try {
      const res = await api.otpLogin(phone, otp, 'admin');
      const data = res?.data;
      if (!data?.token || data.role !== 'admin') {
        addToast('Access Denied: invalid phone number or OTP', 'error');
        return { success: false, message: 'Invalid phone number or OTP' };
      }

      localStorage.setItem('mistri_admin_token', data.token);
      const authAdmin = {
        id: String(data._id),
        name: data.name || 'Administrator',
        company: 'BuildMyDestiny Platform Admin HQ',
        email: data.email,
        phone: data.phone || '',
        role: 'Admin',
        tier: 'Root Administrator (Full Access)',
        status: 'Active',
      };
      setAdminUser(authAdmin);
      addToast('Administrator authenticated successfully! Welcome back.', 'success');
      return { success: true, user: authAdmin };
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : 'Access Denied: Invalid phone number or OTP';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const adminLogout = () => {
    setAdminUser(null);
    try {
      localStorage.removeItem('mistri_admin_token');
      localStorage.removeItem('mistri_admin_user');
    } catch (e) {}
    addToast('Administrator session ended', 'info');
  };

  // Exclusive Vendor Authentication Handlers (multivendor marketplace)
  const vendorToProfile = (data) => ({
    id: String(data._id),
    name: data.name || 'Vendor',
    email: data.email || '',
    phone: data.phone || '',
    businessName: data.businessName || '',
    vendorStatus: data.vendorStatus || 'pending',
  });

  const vendorLogin = async (emailOrPhone, password) => {
    const identifier = String(emailOrPhone || '').trim();
    try {
      const res = await api.login(identifier, password);
      const data = res?.data;
      if (!data?.token || data.role !== 'vendor') {
        addToast('Access Denied: this account is not a registered vendor', 'error');
        return { success: false, message: 'This account is not a registered vendor' };
      }

      localStorage.setItem('mistri_vendor_token', data.token);
      const profile = vendorToProfile(data);
      setVendorUser(profile);
      addToast(`Welcome back, ${profile.businessName || profile.name}!`, 'success');
      return { success: true, user: profile };
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : 'Access Denied: Invalid vendor email or password';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const vendorSignup = async (formData) => {
    if (!formData.password) {
      addToast('Please choose a password.', 'warning');
      return { success: false, message: 'Please choose a password.' };
    }
    if (!formData.businessName) {
      addToast('Please provide your business/shop name.', 'warning');
      return { success: false, message: 'Please provide your business/shop name.' };
    }

    try {
      const res = await api.register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: 'vendor',
        businessName: formData.businessName,
        city: formData.city || currentCity,
      });
      const data = res?.data;
      localStorage.setItem('mistri_vendor_token', data.token);
      const profile = vendorToProfile(data);
      setVendorUser(profile);
      addToast('Vendor account created! An admin will review and approve your account shortly.', 'success', 6000);
      return { success: true, user: profile };
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : err?.message || 'Vendor registration failed. Please try again.';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const vendorOtpLogin = async (phone, otp) => {
    try {
      const res = await api.otpLogin(phone, otp, 'vendor');
      const data = res?.data;
      if (!data?.token || data.role !== 'vendor') {
        addToast('Access Denied: invalid phone number or OTP', 'error');
        return { success: false, message: 'Invalid phone number or OTP' };
      }

      localStorage.setItem('mistri_vendor_token', data.token);
      const profile = vendorToProfile(data);
      setVendorUser(profile);
      addToast(`Welcome back, ${profile.businessName || profile.name}!`, 'success');
      return { success: true, user: profile };
    } catch (err) {
      const message =
        err?.status === 0
          ? 'Cannot reach the server. Please check your connection and try again.'
          : 'Access Denied: Invalid phone number or OTP';
      addToast(message, 'error');
      return { success: false, message };
    }
  };

  const vendorLogout = () => {
    setVendorUser(null);
    try {
      localStorage.removeItem('mistri_vendor_token');
      localStorage.removeItem('mistri_vendor_user');
    } catch (e) {}
    addToast('Vendor session ended', 'info');
  };

  // Auth Gate: Checks if user is logged in before proceeding with ordering / bookings
  const requireAuth = (actionCallback) => {
    if (user) {
      if (typeof actionCallback === 'function') actionCallback(user);
      return true;
    }

    addToast('Please sign in or create an account to proceed with your order', 'warning');
    openLoginModal('login', actionCallback);
    return false;
  };

  // =========================================================================
  // ADMIN PANEL DYNAMIC MANAGEMENT CRUD FUNCTIONS
  // =========================================================================

  // 1. PRODUCT CRUD
  const addProduct = async (newProduct) => {
    const id = newProduct.id || `prod_${Date.now()}`;
    const name = newProduct.name || 'New Construction Material';
    const slug = newProduct.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const price = Number(newProduct.price) >= 0 ? Number(newProduct.price) : 0;
    const mrp = Number(newProduct.mrp) > 0 ? Number(newProduct.mrp) : Math.round((price || 300) * 1.25);
    const stockCount = newProduct.stockCount !== undefined && newProduct.stockCount !== '' && !isNaN(newProduct.stockCount) ? Number(newProduct.stockCount) : 500;
    const inStock = newProduct.status === 'OUT_OF_STOCK' || stockCount <= 0 ? false : (newProduct.inStock !== undefined ? Boolean(newProduct.inStock) : true);
    const category = newProduct.category || categories[0]?.name || 'Cement';
    const matchedCategory = categories.find((c) => c.name?.toLowerCase() === category.toLowerCase() || c.slug === newProduct.categorySlug);
    const categorySlug = newProduct.categorySlug || matchedCategory?.slug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const image = newProduct.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=800';

    const created = {
      rating: 4.8,
      reviewsCount: 0,
      freeDelivery: true,
      freeDeliveryMin: 500,
      cashbackText: 'Assured 2% Cashback',
      cashbackMinPurchase: 50000,
      minOrderQty: 1,
      hasOptions: false,
      optionsCount: 0,
      isFeatured: true,
      isPopular: true,
      section: matchedCategory?.section || matchedCategory?.sectionName || 'Civil & Interiors',
      brand: newProduct.brand || 'UltraTech',
      unit: newProduct.unit || 'Standard Unit',
      description: newProduct.description || `${name} - High performance genuine building material supplied with manufacturer certificate.`,
      ...newProduct,
      id,
      name,
      slug,
      price,
      mrp,
      stockCount,
      inStock,
      category,
      categorySlug,
      image,
      gallery: Array.isArray(newProduct.gallery) && newProduct.gallery.length > 0 ? newProduct.gallery : [image],
    };

    setProducts((prev) => [created, ...prev.filter((p) => p.id !== id)]);

    try {
      await api.createProduct(created);
      markSynced('products', created);
      addToast(`Product "${created.name}" saved to database!`, 'success');
    } catch (err) {
      console.warn('Backend product save warning:', err);
      if (err?.status === 401 || err?.status === 403) {
        addToast(`Product added locally, but admin token is missing or expired. Please re-login as Admin to save to Database.`, 'warning', 7000);
      } else {
        addToast(`Product saved locally. Server sync will retry in the background.`, 'info');
      }
    }

    return created;
  };

  const updateProduct = async (id, updatedFields) => {
    let updatedDoc = null;
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, ...updatedFields };
          if (updatedFields.price !== undefined) updated.price = Number(updatedFields.price) || 0;
          if (updatedFields.mrp !== undefined) updated.mrp = Number(updatedFields.mrp) || 0;
          if (updatedFields.stockCount !== undefined) updated.stockCount = Number(updatedFields.stockCount) || 0;
          if (updatedFields.status === 'OUT_OF_STOCK') updated.inStock = false;
          updatedDoc = updated;
          return updated;
        }
        return p;
      })
    );

    if (updatedDoc) {
      try {
        await api.updateProduct(id, updatedFields);
        markSynced('products', updatedDoc);
        addToast('Product updated successfully in database', 'success');
      } catch (err) {
        console.warn('Backend product update warning:', err);
        addToast('Product updated locally', 'info');
      }
    }
  };

  const deleteProduct = async (id) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await api.deleteProduct(id);
      addToast('Product removed from catalog and database', 'info');
    } catch (err) {
      console.warn('Backend product delete warning:', err);
      addToast('Product removed locally', 'info');
    }
  };

  const toggleProductStock = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, inStock: !p.inStock } : p))
    );
    addToast('Product stock status toggled', 'success');
  };

  const toggleProductFeatured = (id) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFeatured: !p.isFeatured } : p))
    );
    addToast('Product featured status toggled', 'success');
  };

  // 2. CATEGORY CRUD
  const addCategory = async (newCat) => {
    const id = newCat.id || `cat_${Date.now()}`;
    const slug = newCat.slug || newCat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const sectionName = newCat.section || 'Civil & Interiors';
    const created = {
      id,
      slug,
      itemCount: '25+ Products',
      subcategories: Array.isArray(newCat.subcategories) ? newCat.subcategories : [],
      ...newCat,
      section: sectionName,
    };
    setCategories((prev) => [created, ...prev]);

    try {
      await api.createCategory(created);
      markSynced('categories', created);
      addToast(`Category "${created.name}" saved to database!`, 'success');
    } catch (err) {
      console.warn('Backend category save warning:', err);
      if (err?.status === 401 || err?.status === 403) {
        addToast(`Category created locally, but admin token is missing or expired. Please re-login as Admin.`, 'warning', 7000);
      }
    }

    // Also update or create matching category section
    setCategorySections((prev) => {
      const existing = prev.find(
        (sec) =>
          sec.id === newCat.sectionId ||
          (sec.title && sec.title.toLowerCase() === sectionName.toLowerCase()) ||
          (sec.name && sec.name.toLowerCase() === sectionName.toLowerCase())
      );
      if (existing) {
        return prev.map((sec) =>
          sec.id === existing.id
            ? { ...sec, categories: [...(sec.categories || []), created] }
            : sec
        );
      } else {
        const newSecObj = {
          id: newCat.sectionId || `sec_${Date.now()}`,
          title: sectionName,
          slug: sectionName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: `All products under ${sectionName}`,
          image: newCat.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=600',
          categories: [created],
          isActive: true,
        };
        try {
          api.collection.save('/category-sections', newSecObj.id, newSecObj, { auth: 'admin' })
            .then(() => markSynced('categorySections', newSecObj))
            .catch(() => {});
        } catch (e) {}
        return [newSecObj, ...prev];
      }
    });

    return created;
  };

  const updateCategory = async (id, updatedFields) => {
    let updatedDoc = null;
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const updated = { ...c, ...updatedFields };
          updatedDoc = updated;
          return updated;
        }
        return c;
      })
    );
    if (updatedDoc) {
      try {
        await api.updateCategory(id, updatedFields);
        markSynced('categories', updatedDoc);
        addToast('Category updated in database', 'success');
      } catch (err) {
        console.warn('Backend category update warning:', err);
      }
    }
    // Keep the copy stored inside its storefront section in step.
    setCategorySections((prev) =>
      prev.map((sec) =>
        Array.isArray(sec.categories) && sec.categories.some((c) => c?.id === id)
          ? { ...sec, categories: sec.categories.map((c) => (c?.id === id ? { ...c, ...updatedFields } : c)) }
          : sec
      )
    );
  };

  const deleteCategory = async (id) => {
    const target = categories.find((c) => c.id === id || c.slug === id);
    const isTarget = (c) => !!c && (c.id === id || c.slug === id || (target && c.id === target.id));
    setCategories((prev) => prev.filter((c) => c.id !== id && c.slug !== id));
    // Also remove the copy stored inside its storefront section, so it cannot show up there.
    setCategorySections((prev) =>
      prev.map((sec) =>
        Array.isArray(sec.categories) && sec.categories.some(isTarget)
          ? { ...sec, categories: sec.categories.filter((c) => !isTarget(c)) }
          : sec
      )
    );
    try {
      await api.deleteCategory(id);
      addToast('Category deleted from database', 'info');
    } catch (err) {
      console.warn('Backend category delete warning:', err);
    }
  };

  // Parent Categories / Sections CRUD
  const addCategorySection = async (newSec) => {
    const id = newSec.id || `sec_${Date.now()}`;
    const title = newSec.title || newSec.name;
    const slug = newSec.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = {
      id,
      title,
      slug,
      description: newSec.description || '',
      image: newSec.image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&q=80&w=600',
      categories: newSec.categories || [],
      isActive: newSec.isActive !== false,
      ...newSec,
    };
    setCategorySections((prev) => [created, ...prev]);

    try {
      await api.collection.save('/category-sections', created.id, created, { auth: 'admin' });
      markSynced('categorySections', created);
      addToast(`Parent Category "${created.title}" saved to database!`, 'success');
    } catch (err) {
      console.warn('Backend section save warning:', err);
    }

    return created;
  };

  const updateCategorySection = async (id, updatedFields) => {
    let updatedDoc = null;
    setCategorySections((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const updated = { ...s, ...updatedFields };
          updatedDoc = updated;
          return updated;
        }
        return s;
      })
    );
    if (updatedDoc) {
      try {
        await api.collection.save('/category-sections', id, updatedDoc, { auth: 'admin' });
        markSynced('categorySections', updatedDoc);
        addToast('Parent Category updated in database', 'success');
      } catch (err) {
        console.warn('Backend section update warning:', err);
      }
    }
  };

  const deleteCategorySection = async (id) => {
    setCategorySections((prev) => prev.filter((s) => s.id !== id));
    try {
      await api.collection.remove('/category-sections', id, { auth: 'admin' });
      addToast('Parent Category removed from database', 'info');
    } catch (err) {
      console.warn('Backend section delete warning:', err);
    }
  };

  // Subcategories CRUD
  const addSubCategory = (categoryIdentifier, subName, subImage = '') => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryIdentifier || cat.slug === categoryIdentifier || cat.name.toLowerCase() === categoryIdentifier.toLowerCase()) {
          const currentSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
          if (!currentSubs.includes(subName)) {
            return {
              ...cat,
              subcategories: [...currentSubs, subName],
              subcategoryImages: {
                ...(cat.subcategoryImages || {}),
                [subName]: subImage,
              },
            };
          }
        }
        return cat;
      })
    );
    addToast(`Subcategory "${subName}" added!`, 'success');
  };

  const updateSubCategory = (categoryIdentifier, oldName, newName, newImage = null) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryIdentifier || cat.slug === categoryIdentifier || cat.name.toLowerCase() === categoryIdentifier.toLowerCase()) {
          const currentSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
          const updatedSubs = currentSubs.map((s) => (s === oldName ? newName : s));
          const subImages = { ...(cat.subcategoryImages || {}) };
          if (newImage !== null) {
            delete subImages[oldName];
            subImages[newName] = newImage;
          } else if (subImages[oldName]) {
            subImages[newName] = subImages[oldName];
            delete subImages[oldName];
          }
          return {
            ...cat,
            subcategories: updatedSubs,
            subcategoryImages: subImages,
          };
        }
        return cat;
      })
    );
    addToast(`Subcategory updated!`, 'success');
  };

  const deleteSubCategory = (categoryIdentifier, subName) => {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id === categoryIdentifier || cat.slug === categoryIdentifier || cat.name.toLowerCase() === categoryIdentifier.toLowerCase()) {
          const currentSubs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
          const subImages = { ...(cat.subcategoryImages || {}) };
          delete subImages[subName];
          return {
            ...cat,
            subcategories: currentSubs.filter((s) => s !== subName),
            subcategoryImages: subImages,
          };
        }
        return cat;
      })
    );
    addToast(`Subcategory "${subName}" deleted`, 'info');
  };

  // 3. ORDERS & LIVE LOGISTICS CRUD
  // Shared tail for the order-mutation helpers below: apply the local update, wait for the
  // server PATCH to actually confirm, and report success/failure honestly (rather than the
  // instant "success" toast that only reflected local state).
  const patchOrder = async (orderId, buildPatch, { successMessage, failMessage }) => {
    let updatedDoc = null;
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        updatedDoc = buildPatch(o);
        return updatedDoc;
      })
    );
    if (!updatedDoc) return;

    try {
      await api.updateOrder(orderId, updatedDoc);
      markSynced('orders', updatedDoc);
      addToast(successMessage, 'success');
    } catch (err) {
      console.warn('Backend order update warning:', err);
      if (err?.status === 401 || err?.status === 403) {
        addToast(`${failMessage} Admin session expired - please re-login to save to the database.`, 'warning', 7000);
      } else if (err?.status === 0) {
        addToast(`${failMessage} Cannot reach the server; will retry automatically.`, 'warning', 6000);
      } else {
        addToast(`${failMessage} ${err?.message || 'Server rejected the change.'}`, 'error', 6000);
      }
    }
  };

  const updateOrderStatus = (orderId, status, statusCode) =>
    patchOrder(
      orderId,
      (o) => ({ ...o, status, statusCode: statusCode || status.toLowerCase().replace(/\s+/g, '-') }),
      { successMessage: `Order ${orderId} status set to "${status}" and saved`, failMessage: `Order ${orderId} status change was not saved.` }
    );

  const updateOrderTracking = (orderId, currentStep, customSteps = null) =>
    patchOrder(
      orderId,
      (o) => {
        const updatedSteps = customSteps || o.tracking?.steps?.map((step, idx) => ({
          ...step,
          done: idx < currentStep,
          time: idx === currentStep - 1 ? 'Updated Live' : (idx < currentStep ? 'Completed' : 'Pending'),
        })) || [];
        return { ...o, tracking: { ...(o.tracking || {}), currentStep, steps: updatedSteps } };
      },
      { successMessage: `Live tracking step for ${orderId} set to step ${currentStep} and saved`, failMessage: `Tracking update for ${orderId} was not saved.` }
    );

  const updateOrderDriver = (orderId, driverData) =>
    patchOrder(
      orderId,
      (o) => ({
        ...o,
        tracking: {
          ...(o.tracking || {}),
          driverName: driverData.driverName || o.tracking?.driverName,
          driverPhone: driverData.driverPhone || o.tracking?.driverPhone,
          vehicleNumber: driverData.vehicleNumber || o.tracking?.vehicleNumber,
          liveEtaMinutes: driverData.liveEtaMinutes || o.tracking?.liveEtaMinutes,
        },
      }),
      { successMessage: `Driver & Logistics for ${orderId} updated and saved`, failMessage: `Driver update for ${orderId} was not saved.` }
    );

  const updateOrderPayment = (orderId, paymentStatus) =>
    patchOrder(
      orderId,
      (o) => ({ ...o, payment: { ...(o.payment || {}), status: paymentStatus } }),
      { successMessage: `Payment status for ${orderId} set to "${paymentStatus}" and saved`, failMessage: `Payment status change for ${orderId} was not saved.` }
    );

  const deleteOrder = async (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    try {
      await api.deleteOrder(orderId);
      addToast(`Order ${orderId} deleted from database`, 'info');
    } catch (err) {
      console.warn('Backend order delete warning:', err);
      if (err?.status === 401 || err?.status === 403) {
        addToast(`Order removed locally, but admin session expired - please re-login to delete it from the database.`, 'warning', 7000);
      } else {
        addToast(`Order removed locally. Server delete will retry in the background.`, 'info');
      }
    }
  };

  // 4. SERVICES & MISTRIS CRUD
  const addService = (newService) => {
    const id = `srv_${Date.now()}`;
    const slug = newService.slug || newService.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const created = {
      id,
      slug,
      rating: 4.9,
      reviewCount: 0,
      isPopular: false,
      features: ['Genuine parts', '30-day warranty', 'Verified technician'],
      ...newService,
    };
    setServices((prev) => [created, ...prev]);
    addToast(`Service "${created.title}" added!`, 'success');
    return created;
  };

  const updateService = (id, updatedFields) => {
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updatedFields } : s))
    );
    addToast('Service updated successfully', 'success');
  };

  const deleteService = (id) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    addToast('Service removed', 'info');
  };

  const addMistri = (newMistri) => {
    const id = `mst_${Date.now()}`;
    const created = {
      id,
      rating: 4.9,
      reviewCount: 0,
      jobsCompleted: 0,
      isVerified: true,
      isAvailable: true,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
      serviceAreas: ['Vijay Nagar', 'Super Corridor', 'Palasia'],
      specializations: ['General Repairs', 'Installation'],
      ...newMistri,
    };
    setMistris((prev) => [created, ...prev]);
    addToast(`Mistri "${created.fullName}" registered!`, 'success');
    return created;
  };

  const updateMistri = (id, updatedFields) => {
    setMistris((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updatedFields } : m))
    );
    addToast('Technician profile updated', 'success');
  };

  const deleteMistri = (id) => {
    setMistris((prev) => prev.filter((m) => m.id !== id));
    addToast('Technician removed from directory', 'info');
  };

  const toggleMistriAvailability = (id) => {
    setMistris((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isAvailable: !m.isAvailable } : m))
    );
    addToast('Technician availability toggled', 'success');
  };

  const toggleMistriVerified = (id) => {
    setMistris((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isVerified: !m.isVerified } : m))
    );
    addToast('Technician verification status updated', 'success');
  };

  // 5. BOOKINGS CRUD
  const addBooking = (bookingData) => {
    const id = `BKG-${Math.floor(10000 + Math.random() * 90000)}`;
    const created = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      paymentStatus: 'Pending',
      mistriName: 'Unassigned',
      ...bookingData,
    };
    setBookings((prev) => [created, ...prev]);
    addToast(`Service booking ${id} scheduled!`, 'success');
    return created;
  };

  const updateBookingStatus = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    addToast(`Booking ${id} status set to "${newStatus}"`, 'success');
  };

  const assignMistriToBooking = (bookingId, mistriId, mistriName) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, mistriId, mistriName, status: 'Confirmed' } : b))
    );
    addToast(`Assigned ${mistriName} to booking ${bookingId}`, 'success');
  };

  const deleteBooking = (id) => {
    setBookings((prev) => prev.filter((b) => b.id !== id));
    addToast(`Booking ${id} removed`, 'info');
  };

  // 6. USERS & CONTRACTORS CRUD
  const addUser = (newUserData) => {
    const id = `usr_${Date.now()}`;
    const created = {
      id,
      status: 'Active',
      totalOrders: 0,
      totalSpend: 0,
      tier: newUserData.tier || 'Standard Builder Tier',
      ...newUserData,
    };
    setUsersList((prev) => [created, ...prev]);
    addToast(`User account for "${created.name}" created!`, 'success');
    return created;
  };

  const updateUser = (id, updatedFields) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...updatedFields } : u))
    );
    // If updating current active user
    if (user && user.id === id) {
      setUser((prev) => ({ ...prev, ...updatedFields }));
    }
    addToast('User details updated', 'success');
  };

  const deleteUser = (id) => {
    setUsersList((prev) => prev.filter((u) => u.id !== id));
    addToast('User account removed', 'info');
  };

  const updateUserTier = (id, newTier) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === id ? { ...u, tier: newTier } : u))
    );
    if (user && user.id === id) {
      setUser((prev) => ({ ...prev, tier: newTier }));
    }
    addToast(`Contractor tier updated to "${newTier}"`, 'success');
  };

  const toggleUserStatus = (id) => {
    let nextStatus = 'Active';
    setUsersList((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          nextStatus = u.status === 'Active' ? 'Deactivated' : 'Active';
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
    addToast(`User account status set to ${nextStatus}`, 'info');
  };

  // 7. COUPONS CRUD
  const addCoupon = async (newCoupon) => {
    const cleanCode = String(newCoupon.code || '').toUpperCase().trim();
    if (!cleanCode) {
      addToast('Please enter a valid coupon code', 'warning');
      return null;
    }

    const created = {
      isActive: newCoupon.isActive !== false,
      usageCount: Number(newCoupon.usageCount) || 0,
      discountType: newCoupon.discountType || (newCoupon.flatAmount ? 'flat' : 'percentage'),
      discountPercentage: Number(newCoupon.discountPercentage) || 0,
      flatAmount: Number(newCoupon.flatAmount || newCoupon.discountAmount) || 0,
      minOrderValue: Number(newCoupon.minOrderValue) || 0,
      maxDiscount: Number(newCoupon.maxDiscount) || 0,
      description: newCoupon.description || '',
      badge: newCoupon.badge || '',
      expiryDate: newCoupon.expiryDate || null,
      scope: newCoupon.scope || 'All Customers',
      ...newCoupon,
      code: cleanCode,
    };

    setCoupons((prev) => {
      const exists = prev.some((c) => c.code?.toUpperCase() === cleanCode);
      if (exists) {
        return prev.map((c) => (c.code?.toUpperCase() === cleanCode ? created : c));
      }
      return [created, ...prev];
    });

    try {
      await api.createCoupon(created);
      markSynced('coupons', created);
      addToast(`Coupon "${created.code}" created and saved to database!`, 'success');
    } catch (err) {
      console.warn('Backend createCoupon warning:', err);
      addToast(`Coupon "${created.code}" created!`, 'success');
    }

    return created;
  };

  const updateCoupon = async (code, updatedFields) => {
    const cleanCode = String(code || '').toUpperCase().trim();
    let updatedDoc = null;

    setCoupons((prev) =>
      prev.map((c) => {
        if (c.code?.toUpperCase() === cleanCode) {
          const updated = { ...c, ...updatedFields, code: cleanCode };
          updatedDoc = updated;
          return updated;
        }
        return c;
      })
    );

    if (updatedDoc) {
      try {
        await api.updateCoupon(cleanCode, updatedDoc);
        markSynced('coupons', updatedDoc);
        addToast(`Coupon "${cleanCode}" updated in database`, 'success');
      } catch (err) {
        console.warn('Backend updateCoupon warning:', err);
        addToast(`Coupon "${cleanCode}" updated`, 'success');
      }
    }
  };

  const deleteCoupon = async (code) => {
    const cleanCode = String(code || '').toUpperCase().trim();
    setCoupons((prev) => prev.filter((c) => c.code?.toUpperCase() !== cleanCode));

    try {
      await api.deleteCoupon(cleanCode);
      addToast(`Coupon "${cleanCode}" removed from database`, 'info');
    } catch (err) {
      console.warn('Backend deleteCoupon warning:', err);
      addToast(`Coupon "${cleanCode}" deleted`, 'info');
    }
  };

  const toggleCouponStatus = async (code) => {
    const cleanCode = String(code || '').toUpperCase().trim();
    const target = coupons.find((c) => c.code?.toUpperCase() === cleanCode);
    if (!target) return;

    const nextActive = !target.isActive;
    await updateCoupon(cleanCode, { isActive: nextActive });
  };

  // 8. QUOTATIONS CRUD
  const addQuotation = (quoteData) => {
    const id = `QUO-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Received',
      estimatedTotal: 0,
      adminNotes: 'Awaiting engineering assessment',
      ...quoteData,
    };
    setQuotations((prev) => [created, ...prev]);
    addToast(`Quotation inquiry ${id} submitted! Specialist will call shortly.`, 'success');
    return created;
  };

  const updateQuotationStatus = (id, status, adminNotes = '', estimatedTotal = null) => {
    setQuotations((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            status,
            adminNotes: adminNotes || q.adminNotes,
            estimatedTotal: estimatedTotal !== null ? estimatedTotal : q.estimatedTotal,
          };
        }
        return q;
      })
    );
    addToast(`Quotation ${id} updated to "${status}"`, 'success');
  };

  const deleteQuotation = (id) => {
    setQuotations((prev) => prev.filter((q) => q.id !== id));
    addToast(`Quotation ${id} removed`, 'info');
  };

  // 9. BANNERS CRUD
  const reportBannerError = (err, fallback) => {
    console.warn('Backend banner sync warning:', err);
    if (err?.status === 401 || err?.status === 403) {
      addToast(`${fallback} Admin session expired - please re-login to save to the database.`, 'warning', 7000);
    } else if (err?.status === 0) {
      addToast(`${fallback} Cannot reach the server; will retry automatically.`, 'warning', 6000);
    } else {
      addToast(`${fallback} ${err?.message || 'Server rejected the change.'}`, 'error', 6000);
    }
  };

  const addBanner = async (newBanner) => {
    const id = `bnr_${Date.now()}`;
    const created = { id, isActive: true, ...newBanner };
    setBanners((prev) => [created, ...prev]);
    try {
      await api.collection.create('/banners', created, { auth: 'admin' });
      markSynced('banners', created);
      addToast('Hero banner added to homepage slider and saved', 'success');
    } catch (err) {
      reportBannerError(err, 'Banner added locally, but it was not saved.');
    }
    return created;
  };

  const updateBanner = async (id, updatedFields) => {
    let updatedDoc = null;
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        updatedDoc = { ...b, ...updatedFields };
        return updatedDoc;
      })
    );
    if (!updatedDoc) return;
    try {
      await api.collection.save('/banners', id, updatedDoc, { auth: 'admin' });
      markSynced('banners', updatedDoc);
      addToast('Banner updated and saved', 'success');
    } catch (err) {
      reportBannerError(err, 'Banner updated locally, but it was not saved.');
    }
  };

  const toggleBannerStatus = async (id) => {
    let updatedDoc = null;
    setBanners((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        updatedDoc = { ...b, isActive: !b.isActive };
        return updatedDoc;
      })
    );
    if (!updatedDoc) return;
    try {
      await api.collection.save('/banners', id, updatedDoc, { auth: 'admin' });
      markSynced('banners', updatedDoc);
      addToast('Banner status updated and saved', 'success');
    } catch (err) {
      reportBannerError(err, 'Banner status changed locally, but it was not saved.');
    }
  };

  const deleteBanner = async (id) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    try {
      await api.collection.remove('/banners', id, { auth: 'admin' });
      addToast('Banner removed from database', 'info');
    } catch (err) {
      reportBannerError(err, 'Banner removed locally, but it was not deleted from the database.');
    }
  };

  // 10. FAQS CRUD
  const addFaq = (categoryName, newQuestion) => {
    setFaqs((prev) => {
      const catIndex = prev.findIndex((c) => c.category === categoryName);
      if (catIndex > -1) {
        const updated = [...prev];
        updated[catIndex] = {
          ...updated[catIndex],
          questions: [...updated[catIndex].questions, newQuestion],
        };
        return updated;
      } else {
        return [...prev, { category: categoryName, questions: [newQuestion] }];
      }
    });
    addToast('FAQ item added', 'success');
  };

  const updateFaq = (categoryName, qIndex, updatedFaq) => {
    setFaqs((prev) =>
      prev.map((cat) => {
        if (cat.category === categoryName) {
          const updatedQs = [...cat.questions];
          updatedQs[qIndex] = updatedFaq;
          return { ...cat, questions: updatedQs };
        }
        return cat;
      })
    );
    addToast('FAQ updated', 'success');
  };

  const deleteFaq = (categoryName, qIndex) => {
    setFaqs((prev) =>
      prev.map((cat) => {
        if (cat.category === categoryName) {
          return {
            ...cat,
            questions: cat.questions.filter((_, idx) => idx !== qIndex),
          };
        }
        return cat;
      })
    );
    addToast('FAQ deleted', 'info');
  };

  // 11. SUPPORT MESSAGES CRUD
  const addSupportMessage = (msgData) => {
    const id = `msg_${Date.now()}`;
    const created = {
      id,
      createdAt: new Date().toISOString(),
      status: 'Open',
      ...msgData,
    };
    setSupportMessages((prev) => [created, ...prev]);
    addToast('Your message has been sent to our customer care team!', 'success');
    return created;
  };

  const updateSupportMessageStatus = (id, status) => {
    setSupportMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    addToast('Support inquiry status updated', 'success');
  };

  // 12. STORE SETTINGS & RESET TO FACTORY DEFAULTS
  const updateSiteSettings = (newSettings) => {
    setSiteSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Platform settings saved successfully!', 'success');
  };

  const addCity = (newCity) => {
    if (!newCity || cities.includes(newCity)) return;
    setCities((prev) => [...prev, newCity]);
    addToast(`City "${newCity}" added to delivery network`, 'success');
  };

  const removeCity = (cityToRemove) => {
    setCities((prev) => prev.filter((c) => c !== cityToRemove));
    addToast(`City "${cityToRemove}" removed`, 'info');
  };

  // Site Address Management
  const addAddress = (addr) => {
    const newAddrObj = {
      id: addr.id || `addr_${Date.now()}`,
      title: addr.title || 'Site Location',
      recipientName: addr.recipientName || user?.name || 'Site In-Charge',
      phone: addr.phone || user?.phone || '+91 98260 11223',
      addressLine: addr.addressLine || '',
      locality: addr.locality || '',
      city: addr.city || currentCity || 'Indore',
      state: addr.state || 'Madhya Pradesh',
      pincode: addr.pincode || currentPincode || '452001',
      unloadingNotes: addr.unloadingNotes || '',
      isDefault: addr.isDefault || false,
      ...addr,
    };
    if (newAddrObj.isDefault) {
      if (newAddrObj.pincode) setCurrentPincode(newAddrObj.pincode);
      if (newAddrObj.city) setCurrentCity(newAddrObj.city);
    }
    setAddresses((prev) => {
      const updated = newAddrObj.isDefault
        ? [newAddrObj, ...prev.map((a) => ({ ...a, isDefault: false }))]
        : [newAddrObj, ...prev];
      setStored('saved_addresses', updated);
      return updated;
    });
    addToast('Site address saved successfully!', 'success');
    return newAddrObj;
  };

  const deleteAddress = (id) => {
    setAddresses((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      setStored('saved_addresses', updated);
      return updated;
    });
    addToast('Address removed', 'info');
  };

  const setDefaultAddress = (id) => {
    setAddresses((prev) => {
      const target = prev.find((a) => a.id === id);
      if (target) {
        if (target.pincode) setCurrentPincode(target.pincode);
        if (target.city) setCurrentCity(target.city);
      }
      const updated = prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }));
      setStored('saved_addresses', updated);
      return updated;
    });
    addToast('Default delivery site address updated', 'success');
  };

  // Real-time GPS Geolocation Fetcher with high accuracy reverse geocoding
  const fetchCurrentGpsLocation = async () => {
    setIsDetectingLocation(true);
    addToast('📍 Requesting GPS satellite coordinates...', 'info');

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setIsDetectingLocation(false);
        addToast('Geolocation is not supported by your browser', 'error');
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            let detectedCity = currentCity || 'Indore';
            let detectedPincode = currentPincode || '452001';
            let detectedState = 'Madhya Pradesh';
            let detectedRoad = '';
            let detectedArea = '';
            let formattedAddress = `Lat: ${latitude.toFixed(4)}, Lon: ${longitude.toFixed(4)}`;

            // 1. Try reverse geocoding via OpenStreetMap Nominatim
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
              );
              if (res.ok) {
                const data = await res.json();
                if (data && data.address) {
                  const addr = data.address;
                  detectedCity = addr.city || addr.town || addr.county || addr.state_district || addr.village || detectedCity;
                  detectedPincode = addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : detectedPincode;
                  detectedState = addr.state || detectedState;
                  detectedRoad = addr.road || addr.suburb || addr.neighbourhood || addr.residential || '';
                  detectedArea = addr.suburb || addr.neighbourhood || addr.commercial || addr.industrial || '';
                  formattedAddress = data.display_name || `${detectedRoad}, ${detectedArea}, ${detectedCity}`;
                }
              }
            } catch (geoErr) {
              console.warn('Nominatim reverse geocode fallback:', geoErr);
              try {
                const bdcRes = await fetch(
                  `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                if (bdcRes.ok) {
                  const bdcData = await bdcRes.json();
                  detectedCity = bdcData.city || bdcData.locality || detectedCity;
                  detectedPincode = (bdcData.postcode || detectedPincode).replace(/\D/g, '').slice(0, 6);
                  detectedState = bdcData.principalSubdivision || detectedState;
                  formattedAddress = `${bdcData.locality || ''}, ${detectedCity}, ${detectedState}`;
                }
              } catch (bdcErr) {
                console.warn('BDC reverse geocode error:', bdcErr);
              }
            }

            // Create GPS Address Object
            const addressLineText = detectedRoad
              ? `${detectedRoad}${detectedArea ? ', ' + detectedArea : ''}`
              : formattedAddress.split(',').slice(0, 3).join(',');

            const gpsAddress = {
              id: `addr_gps_${Date.now()}`,
              title: 'Current Location (GPS)',
              recipientName: user?.name || 'Site In-Charge',
              phone: user?.phone || '+91 98260 11223',
              addressLine: addressLineText || 'Current Site Location',
              city: detectedCity,
              state: detectedState,
              pincode: detectedPincode,
              isDefault: true,
              isGps: true,
              coordinates: { latitude, longitude },
            };

            // Update state
            setCurrentCity(detectedCity);
            if (detectedPincode && detectedPincode.length === 6) {
              setCurrentPincode(detectedPincode);
            }
            setAddresses((prev) => {
              const updated = [gpsAddress, ...prev.filter((a) => !a.isGps)];
              setStored('saved_addresses', updated);
              return updated;
            });

            setIsDetectingLocation(false);
            addToast(`📍 Location fetched: ${detectedCity} (${detectedPincode})`, 'success');
            resolve(gpsAddress);
          } catch (err) {
            console.error('Error processing GPS coordinates:', err);
            setIsDetectingLocation(false);
            addToast('Could not convert GPS to address. Location fallback applied.', 'warning');
            resolve(null);
          }
        },
        (error) => {
          console.warn('Geolocation error:', error);
          setIsDetectingLocation(false);
          let errMsg = 'Failed to get location';
          if (error.code === 1) {
            errMsg = 'Location permission denied. Please allow GPS access in browser settings.';
          } else if (error.code === 2) {
            errMsg = 'Position unavailable. Checking network location...';
          } else if (error.code === 3) {
            errMsg = 'Location request timed out.';
          }
          addToast(errMsg, 'error');

          // Fallback to IP-based location
          fetch('https://ipapi.co/json/')
            .then((r) => r.json())
            .then((ipData) => {
              if (ipData && ipData.city) {
                const ipCity = ipData.city;
                const ipPin = (ipData.postal || '452001').replace(/\D/g, '').slice(0, 6) || '452001';
                const ipAddress = {
                  id: `addr_ip_${Date.now()}`,
                  title: 'Network Location',
                  recipientName: user?.name || 'Site In-Charge',
                  phone: user?.phone || '+91 98260 11223',
                  addressLine: `${ipData.region || ipCity} Area`,
                  city: ipCity,
                  state: ipData.region || 'Madhya Pradesh',
                  pincode: ipPin,
                  isDefault: true,
                };
                setCurrentCity(ipCity);
                setCurrentPincode(ipPin);
                setAddresses((prev) => [ipAddress, ...prev]);
                addToast(`📍 Network location applied: ${ipCity} (${ipPin})`, 'success');
                resolve(ipAddress);
              }
            })
            .catch(() => {
              reject(error);
            });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  // Discard this browser's cached copy and reload everything from the server.
  // Deliberately deletes nothing: with MongoDB behind the store, clearing the
  // collections here would delete them for every user.
  const resetToDefaultData = async () => {
    await reloadFromServer();
    addToast('Data reloaded from the server', 'success');
  };

  // Restore the platform settings (only) to their built-in defaults.
  const resetSiteSettings = () => {
    setSiteSettings(INITIAL_SETTINGS);
    addToast('Settings reset to system defaults', 'info');
  };

  return (
    <StoreContext.Provider
      value={{
        // Navigation & Admin Tab
        currentView,
        viewParams,
        navigateTo,
        searchQuery,
        setSearchQuery,
        adminActiveTab,
        setAdminActiveTab,

        // Location & Cities
        currentCity,
        setCurrentCity,
        currentPincode,
        setCurrentPincode,
        cities,
        addCity,
        removeCity,
        isLocationModalOpen,
        setIsLocationModalOpen,

        // Wallet
        walletBalance,
        setWalletBalance,
        isWalletVisible,
        toggleWalletVisibility,

        // Modals
        optionsModalProduct,
        isOptionsModalOpen,
        openOptionsModal,
        closeOptionsModal,
        isQuotationOpen,
        setIsQuotationOpen,
        isPriceDropOpen,
        setIsPriceDropOpen,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isLoginModalOpen,
        setIsLoginModalOpen,
        loginModalMode,
        setLoginModalMode,
        openLoginModal,
        closeLoginModal,
        requireAuth,

        // Current Auth
        user,
        setUser,
        login,
        userOtpLogin,
        loginWithGoogle,
        signup,
        logout,

        // Admin Auth
        adminUser,
        setAdminUser,
        adminLogin,
        adminOtpLogin,
        adminLogout,

        // Vendor Auth
        vendorUser,
        setVendorUser,
        vendorLogin,
        vendorOtpLogin,
        vendorSignup,
        vendorLogout,

        // Cart State & Calculations
        cart,
        addToCart,
        removeFromCart,
        updateCartQty,
        clearCart,
        cartSubtotal,
        cartItemCount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
        deliveryFee,
        deliveryNote,
        unloadingCharge,
        isUnloadingSelected,
        setIsUnloadingSelected,
        gstAmount,
        isGstInclusive,
        grandTotal,

        // Wishlist
        wishlist,
        toggleWishlist,
        isInWishlist,

        // Addresses & Notifications
        addresses,
        addAddress,
        deleteAddress,
        setDefaultAddress,
        fetchCurrentGpsLocation,
        isDetectingLocation,
        notifications,
        setNotifications,
        adminNotifications,
        setAdminNotifications,
        markAdminNotificationRead,
        markAllAdminNotificationsRead,
        clearAdminNotifications,
        playOrderNotificationSound,
        requestNotificationPermission,
        getNotificationPermission,

        // Toast
        toasts,
        addToast,
        removeToast,

        // DYNAMIC PLATFORM DATA & ADMIN CRUD OPERATIONS
        products,
        isProductsLoaded,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        toggleProductFeatured,
        getProductById,

        categories,
        categorySections,
        addCategory,
        updateCategory,
        deleteCategory,
        addCategorySection,
        updateCategorySection,
        deleteCategorySection,
        addSubCategory,
        updateSubCategory,
        deleteSubCategory,

        orders,
        placeOrder,
        getOrderById,
        updateOrderStatus,
        updateOrderTracking,
        updateOrderDriver,
        updateOrderPayment,
        deleteOrder,

        services,
        addService,
        updateService,
        deleteService,

        mistris,
        addMistri,
        updateMistri,
        deleteMistri,
        toggleMistriAvailability,
        toggleMistriVerified,

        bookings,
        addBooking,
        updateBookingStatus,
        assignMistriToBooking,
        deleteBooking,

        usersList,
        addUser,
        updateUser,
        deleteUser,
        updateUserTier,
        toggleUserStatus,

        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        toggleCouponStatus,

        quotations,
        addQuotation,
        updateQuotationStatus,
        deleteQuotation,

        banners,
        addBanner,
        updateBanner,
        toggleBannerStatus,
        deleteBanner,

        faqs,
        addFaq,
        updateFaq,
        deleteFaq,

        supportMessages,
        addSupportMessage,
        updateSupportMessageStatus,

        siteSettings,
        updateSiteSettings,
        resetToDefaultData,
        resetSiteSettings,

        topBrands: TOP_BRANDS,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export default StoreContext;
