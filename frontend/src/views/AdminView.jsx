import React, { useState, useMemo, useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Truck,
  Wrench,
  Calendar,
  Users,
  Tag,
  MessageSquareQuote,
  Image as ImageIcon,
  HelpCircle,
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  Eye,
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Award,
  Sparkles,
  Zap,
  ArrowUpRight,
  RefreshCw,
  Send,
  Sliders,
  Star,
  FileText,
  Radio,
  MoreVertical,
  Maximize2,
  Bell,
  CheckSquare,
  Square,
  FolderTree,
  Grid,
  UploadCloud,
  LogOut,
  Store,
  Menu,
  Activity,
  Bookmark,
  Gift,
  Compass,
  Headphones,
  Lock,
  EyeOff,
  Key,
  AlertCircle,
  ArrowLeft,
  CreditCard,
  Loader2,
  Building,
  Copy,
  Percent,
  Ticket,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import Logo from '../components/Logo';
import api from '../services/api';
import { uploadCloudFile } from '../services/storageService';
import { uploadBannerToCloud } from '../services/cloudinaryService';
import { printTaxInvoice } from '../utils/printInvoice';

export default function AdminView() {
  const {
    adminActiveTab,
    setAdminActiveTab,
    navigateTo,
    // Admin Authentication
    adminUser,
    adminLogin,
    adminOtpLogin,
    adminLogout,
    // Dynamic Collections & CRUD
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    toggleProductFeatured,
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
    updateSupportMessageStatus,
    siteSettings,
    updateSiteSettings,
    cities,
    addCity,
    removeCity,
    resetToDefaultData,
    resetSiteSettings,
    addToast,
    user,
    // Realtime Admin Notifications
    adminNotifications = [],
    setAdminNotifications,
    markAdminNotificationRead,
    markAllAdminNotificationsRead,
    clearAdminNotifications,
    playOrderNotificationSound,
    requestNotificationPermission,
    getNotificationPermission,
  } = useStore();

  // Sidebar & View state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isTreeView, setIsTreeView] = useState(false);
  const [categoryViewMode, setCategoryViewMode] = useState('table'); // 'table' | 'grid'

  // Order Management State & Filters
  const [orderFilterTab, setOrderFilterTab] = useState('all'); // 'all' | 'online' | 'cash' | 'confirmed' | 'in_transit' | 'delivered'
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [selectedOrderDetailsModal, setSelectedOrderDetailsModal] = useState(null);
  const [assignDriverModalOrder, setAssignDriverModalOrder] = useState(null);
  const [driverInput, setDriverInput] = useState({ name: '', phone: '', vehicle: '' });

  // Settings Delivery & Price Simulator State
  const [simCartSubtotal, setSimCartSubtotal] = useState(555);
  const [simDistanceKm, setSimDistanceKm] = useState(8);
  const [newServiceCityInput, setNewServiceCityInput] = useState('');
  const [newServicePincodeInput, setNewServicePincodeInput] = useState('');
  const [pincodeSearchQuery, setPincodeSearchQuery] = useState('');

  // Category Sidebar Accordion expansion state
  const isCategoryTab = ['categories', 'parent-categories', 'sub-categories', 'category-products'].includes(adminActiveTab);
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(true);

  // Parent Category View Filters
  const [parentCategorySearch, setParentCategorySearch] = useState('');
  const [parentCategoryStatusFilter, setParentCategoryStatusFilter] = useState('All');

  // Subcategory View Filters
  const [subCategorySearch, setSubCategorySearch] = useState('');
  const [subCategoryParentFilter, setSubCategoryParentFilter] = useState('All');
  const [subCategoryMainFilter, setSubCategoryMainFilter] = useState('All');

  // Category Hierarchy 2-Column View State (Reference Image Match)
  const [selectedHierarchyParent, setSelectedHierarchyParent] = useState(null);
  const [hierarchyParentSearch, setHierarchyParentSearch] = useState('');

  // Product Catalog Dataset Filters & State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');
  const [productSectionFilter, setProductSectionFilter] = useState('All');
  const [productStockFilter, setProductStockFilter] = useState('All'); // 'All' | 'inStock' | 'lowStock' | 'outOfStock'
  const [productCatalogTab, setProductCatalogTab] = useState('master'); // 'master' | 'seller' | 'alerts'
  const [productModalTab, setProductModalTab] = useState('general'); // 'general' | 'categories' | 'variants' | 'photos'
  const [productActionMenuId, setProductActionMenuId] = useState(null);
  const [isRefreshingProducts, setIsRefreshingProducts] = useState(false);

  // Vendor (multivendor marketplace) management state
  const [vendors, setVendors] = useState([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorStatusFilter, setVendorStatusFilter] = useState('All');

  const loadVendors = async () => {
    setIsLoadingVendors(true);
    try {
      const res = await api.getVendors();
      setVendors(res.data || []);
    } catch (err) {
      addToast(err?.message || 'Could not load vendors', 'error');
    } finally {
      setIsLoadingVendors(false);
    }
  };

  useEffect(() => {
    if (adminUser) loadVendors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminUser?.id]);

  const setVendorApprovalStatus = async (id, status) => {
    try {
      await api.setVendorStatus(id, status);
      addToast(`Vendor ${status}`, 'success');
      loadVendors();
    } catch (err) {
      addToast(err?.message || 'Could not update vendor status', 'error');
    }
  };

  // Product Create/Edit Form State
  const [productFormData, setProductFormData] = useState({
    id: '',
    name: '',
    slug: '',
    description: '',
    brand: '',
    section: 'Civil & Interiors',
    category: '',
    categorySlug: '',
    subcategory: '',
    unit: '',
    mrp: '',
    price: '',
    stockCount: '',
    minOrderQty: 1,
    gstRate: 18,
    image: '',
    gallery: [],
    variants: [],
    variantGroups: [],
    status: 'PUBLISHED',
    isFeatured: false,
  });

  // Table selection state
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal Dialogs state
  const [activeModal, setActiveModal] = useState(null); // 'add-category' | 'add-parent-category' | 'add-sub-category' | 'edit-sub-category' | 'edit-parent-category' | 'create-product' | 'edit-product'
  const [modalFormData, setModalFormData] = useState({});

  // Banner Management State
  const [bannerPosFilter, setBannerPosFilter] = useState('all'); // 'all' | 'hero' | 'bottom'
  const [bannerSearchQuery, setBannerSearchQuery] = useState('');
  const [isBannerModalOpen, setIsBannerModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [isBannerUploading, setIsBannerUploading] = useState(false);
  const [bannerFormData, setBannerFormData] = useState({
    title: '',
    subtitle: '',
    position: 'hero',
    badge: '',
    ctaText: 'ORDER NOW',
    target: '',
    image: '',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #262626 60%, #0F172A 100%)',
  });

  // User Management State & Handlers
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all'); // 'all' | 'Active' | 'Deactivated'
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'Customer' | 'Contractor' | 'Mistri' | 'Admin'
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    company: '',
    gstin: '',
    city: '',
    role: 'Customer',
    tier: 'Standard Builder Tier',
    status: 'Active',
  });

  function handleOpenAddUserModal() {
    setEditingUser(null);
    setUserFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      company: '',
      gstin: '',
      city: '',
      role: 'Customer',
      tier: 'Standard Builder Tier',
      status: 'Active',
    });
    setIsUserModalOpen(true);
  }

  function handleOpenEditUserModal(userItem) {
    setEditingUser(userItem);
    setUserFormData({
      name: userItem.name || '',
      email: userItem.email || '',
      phone: userItem.phone || '',
      password: '',
      company: userItem.company || '',
      gstin: userItem.gstin || '',
      city: userItem.city || '',
      role: userItem.role || 'Customer',
      tier: userItem.tier || 'Standard Builder Tier',
      status: userItem.status || 'Active',
    });
    setIsUserModalOpen(true);
  }

  function handleSaveUser(e) {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.phone.trim()) {
      addToast('Please enter both name and mobile number', 'error');
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id, {
        name: userFormData.name.trim(),
        email: userFormData.email.trim() || '',
        phone: userFormData.phone.trim(),
        company: userFormData.company.trim(),
        gstin: userFormData.gstin.trim().toUpperCase(),
        city: userFormData.city.trim(),
        role: userFormData.role,
        tier: userFormData.tier,
        status: userFormData.status,
        ...(userFormData.password ? { password: userFormData.password } : {}),
      });
      addToast(`User ${userFormData.name} updated successfully`, 'success');
    } else {
      addUser({
        name: userFormData.name.trim(),
        email: userFormData.email.trim() || '',
        phone: userFormData.phone.trim(),
        password: userFormData.password || 'Mistri@123',
        company: userFormData.company.trim(),
        gstin: userFormData.gstin.trim().toUpperCase(),
        city: userFormData.city.trim(),
        role: userFormData.role,
        tier: userFormData.tier,
        status: userFormData.status,
      });
      addToast(`User ${userFormData.name} registered successfully`, 'success');
    }
    setIsUserModalOpen(false);
  }

  function handleDeleteUserConfirm(userId, userName) {
    if (window.confirm(`Are you sure you want to permanently delete the user account for "${userName}"?`)) {
      deleteUser(userId);
    }
  }

  // Coupon Management State & Handlers
  const [couponSearchQuery, setCouponSearchQuery] = useState('');
  const [couponStatusFilter, setCouponStatusFilter] = useState('all'); // 'all' | 'active' | 'disabled'
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [couponFormData, setCouponFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage', // 'percentage' | 'flat'
    discountPercentage: 10,
    flatAmount: 100,
    minOrderValue: 999,
    maxDiscount: 500,
    badge: 'SPECIAL',
    expiryDate: '',
    scope: 'All Customers',
    isActive: true,
  });

  function handleOpenAddCouponModal() {
    setEditingCoupon(null);
    setCouponFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountPercentage: 10,
      flatAmount: 100,
      minOrderValue: 999,
      maxDiscount: 500,
      badge: 'SPECIAL',
      expiryDate: '',
      scope: 'All Customers',
      isActive: true,
    });
    setIsCouponModalOpen(true);
  }

  function handleOpenEditCouponModal(c) {
    setEditingCoupon(c);
    setCouponFormData({
      code: c.code || '',
      description: c.description || '',
      discountType: c.discountType || (c.flatAmount ? 'flat' : 'percentage'),
      discountPercentage: c.discountPercentage || 0,
      flatAmount: c.flatAmount || c.discountAmount || 0,
      minOrderValue: c.minOrderValue || 0,
      maxDiscount: c.maxDiscount || 0,
      badge: c.badge || '',
      expiryDate: c.expiryDate ? c.expiryDate.split('T')[0] : '',
      scope: c.scope || 'All Customers',
      isActive: c.isActive !== false,
    });
    setIsCouponModalOpen(true);
  }

  async function handleSaveCoupon(e) {
    e.preventDefault();
    const cleanCode = (couponFormData.code || '').toUpperCase().trim();
    if (!cleanCode) {
      addToast('Please enter a valid promo/coupon code', 'warning');
      return;
    }

    const payload = {
      code: cleanCode,
      description: couponFormData.description || '',
      discountType: couponFormData.discountType,
      discountPercentage: couponFormData.discountType === 'percentage' ? Number(couponFormData.discountPercentage) || 0 : 0,
      flatAmount: couponFormData.discountType === 'flat' ? Number(couponFormData.flatAmount) || 0 : 0,
      minOrderValue: Number(couponFormData.minOrderValue) || 0,
      maxDiscount: couponFormData.discountType === 'percentage' ? Number(couponFormData.maxDiscount) || 0 : Number(couponFormData.flatAmount) || 0,
      badge: couponFormData.badge || '',
      expiryDate: couponFormData.expiryDate || null,
      scope: couponFormData.scope || 'All Customers',
      isActive: couponFormData.isActive !== false,
    };

    if (editingCoupon) {
      await updateCoupon(editingCoupon.code, payload);
    } else {
      await addCoupon(payload);
    }

    setIsCouponModalOpen(false);
  }

  function handleDeleteCouponConfirm(code) {
    if (window.confirm(`Are you sure you want to delete promo coupon "${code}"?`)) {
      deleteCoupon(code);
    }
  }

  function handleOpenAddBannerModal() {
    setEditingBanner(null);
    setBannerFormData({
      title: '',
      subtitle: '',
      position: bannerPosFilter !== 'all' ? bannerPosFilter : 'hero',
      badge: '',
      ctaText: 'ORDER NOW',
      target: 'products',
      image: '',
      showTextOverlay: true,
      imageFit: 'cover',
      gradient: 'linear-gradient(135deg, #0A0A0A 0%, #262626 60%, #0F172A 100%)',
      accent: '#FFB800',
      isActive: true,
    });
    setIsBannerModalOpen(true);
  }

  function handleOpenEditBannerModal(banner) {
    setEditingBanner(banner);
    setBannerFormData({
      title: banner.title || '',
      subtitle: banner.subtitle || banner.desc || '',
      position: banner.position || 'hero',
      badge: banner.badge || '',
      ctaText: banner.ctaText || banner.cta || 'ORDER NOW',
      target: banner.target || banner.link || 'products',
      image: banner.image || '',
      showTextOverlay: banner.showTextOverlay !== false,
      imageFit: banner.imageFit || 'cover',
      gradient: banner.gradient || 'linear-gradient(135deg, #0A0A0A 0%, #262626 60%, #0F172A 100%)',
      accent: banner.accent || '#FFB800',
      isActive: banner.isActive !== false,
    });
    setIsBannerModalOpen(true);
  }

  function handleSaveBanner(e) {
    e.preventDefault();
    if (!bannerFormData.title.trim()) {
      addToast('Please enter a banner title', 'error');
      return;
    }
    if (editingBanner) {
      updateBanner(editingBanner.id, bannerFormData);
    } else {
      addBanner(bannerFormData);
    }
    setIsBannerModalOpen(false);
  }

  async function handleBannerFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setIsBannerUploading(true);
    try {
      addToast('Uploading image...', 'info');
      const res = await uploadBannerToCloud(file);
      const imageUrl = typeof res === 'string' ? res : (res?.url || res?.data?.url || '');
      if (imageUrl) {
        setBannerFormData((prev) => ({ ...prev, image: imageUrl }));
        addToast('Image uploaded successfully!', 'success');
      } else {
        throw new Error('Could not get image URL');
      }
    } catch (err) {
      console.warn('Cloud upload fallback to local FileReader:', err);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setBannerFormData((prev) => ({ ...prev, image: reader.result }));
          addToast('Image attached', 'success');
        }
      };
      reader.readAsDataURL(file);
    } finally {
      setIsBannerUploading(false);
    }
  }

  // Profile Menu Dropdown
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  // Material Library Preset HD Images for 1-Click Upload
  const PRESET_MATERIAL_IMAGES = [
    { label: 'OPC & PPC Cement Bags', url: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400', category: 'Civil' },
    { label: 'TMT Steel Rebars & Beams', url: 'https://images.unsplash.com/photo-1535813547-99c456a41d4a?auto=format&fit=crop&q=80&w=400', category: 'Structural' },
    { label: 'Vitrified Ceramic Floor Tiles', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', category: 'Tiling' },
    { label: 'Exterior Emulsion & Putty', url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=400', category: 'Painting' },
    { label: 'Integral Waterproofing & SBR', url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=400', category: 'Chemicals' },
    { label: 'BWP Marine Plywood & MDF', url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&q=80&w=400', category: 'Plywood' },
    { label: 'Heavy Duty CPVC Pipes & Fittings', url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=400', category: 'Plumbing' },
    { label: 'FR-LSH Copper Wires & MCB DB', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400', category: 'Electrical' },
    { label: 'Modular Switch Plates & Glass', url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=400', category: 'Electrical' },
    { label: 'LED Ceiling Panels & COB Lights', url: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&q=80&w=400', category: 'Lighting' },
    { label: 'Impact Drills & Power Cutters', url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400', category: 'Tools' },
    { label: 'Soft Close Hinges & Telescopic Channels', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400', category: 'Hardware' },
    { label: 'Smart Biometric Door Locks', url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&q=80&w=400', category: 'Security' },
    { label: 'Red Clay Bricks & AAC Blocks', url: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&q=80&w=400', category: 'Civil' },
  ];

  // Dynamic list of all subcategories across categories
  const allSubCategories = useMemo(() => {
    const list = [];
    categories.forEach((cat) => {
      const subs = Array.isArray(cat.subcategories) ? cat.subcategories : [];
      subs.forEach((subName) => {
        const prodCount = products.filter(
          (p) =>
            p.categorySlug === cat.slug ||
            p.category?.toLowerCase() === cat.name?.toLowerCase() ||
            p.name?.toLowerCase().includes(subName.toLowerCase())
        ).length;

        const img =
          (cat.subcategoryImages && cat.subcategoryImages[subName]) ||
          cat.image ||
          'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300';

        list.push({
          id: `${cat.id || cat.slug}_${subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          name: subName,
          categoryName: cat.name,
          categorySlug: cat.slug,
          categoryId: cat.id,
          sectionName: cat.section || cat.sectionName || 'Civil & Interiors',
          image: img,
          prodCount,
          isActive: cat.isActive !== false,
        });
      });
    });
    return list;
  }, [categories, products]);

  // Sidebar Menu Items definition (With expandable 3 tabs under Categories & Products replaced attributes)
  const sidebarNavGroups = [
    {
      group: null, // Top-level
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'CATALOG',
      items: [
        { id: 'products', label: 'Products', icon: Package, badge: products.length },
        {
          id: 'categories',
          label: 'Categories & Sections',
          icon: Layers,
          isExpandable: true,
          badge: categories.length,
          children: [
            { id: 'categories', label: 'All Categories', icon: Grid, badge: categories.length },
            { id: 'parent-categories', label: 'Parent Categories', icon: FolderTree, badge: categories.length },
            { id: 'sub-categories', label: 'Sub Categories', icon: Tag, badge: allSubCategories.length },
          ],
        },
      ],
    },
    {
      group: 'ORDERS',
      items: [
        { id: 'orders', label: 'Orders & Logistics', icon: Truck, badge: orders.filter(o => o.statusCode !== 'delivered').length },
        { id: 'live-tracking', label: 'Live Tracking', icon: Compass },
      ],
    },
    {
      group: 'USERS',
      items: [
        { id: 'customers', label: 'Customers', icon: Users, badge: usersList.length },
        { id: 'vendors', label: 'Vendors', icon: Store, badge: vendors.filter((v) => v.vendorStatus === 'pending').length || undefined },
      ],
    },
    {
      group: 'MARKETING',
      items: [
        { id: 'coupons', label: 'Coupons & Promos', icon: Tag, badge: coupons.filter(c => c.isActive).length },
        { id: 'banners', label: 'Banners & Content', icon: ImageIcon, badge: banners.length },
      ],
    },
    {
      group: 'SERVICES',
      items: [
        { id: 'bookings', label: 'Bookings', icon: Calendar, badge: bookings.length },
        { id: 'services', label: 'Mistris & Services', icon: Wrench },
      ],
    },
    {
      group: 'COMMUNICATION',
      items: [
        { id: 'quotations', label: 'Project Quotes & BOQs', icon: MessageSquareQuote, badge: quotations.filter(q => q.status !== 'Closed').length, badgeStyle: 'blue-pill' },
        { id: 'faqs', label: 'Support & FAQs', icon: HelpCircle },
      ],
    },
    {
      group: 'SETTINGS',
      items: [
        { id: 'settings', label: 'General Settings', icon: Settings },
        { id: 'admin-users', label: 'Admin Users', icon: ShieldCheck },
        { id: 'system-logs', label: 'System Logs', icon: Activity },
      ],
    },
  ];

  const handleTabChange = (tabId) => {
    setAdminActiveTab(tabId);
    navigateTo('admin', { tab: tabId }, true);
    setSearchTerm('');
    setSelectedIds([]);
    setIsMobileDrawerOpen(false);
  };

  // Reusable Image Upload Field Component with Cloudinary & Firebase Storage support
  // Reusable Image Upload Field Component (Direct File Upload with Drag & Drop & Live Preview)
  function ImageUploadField({ label = 'Product / Category Image', value, onChange }) {
    const [dragOver, setDragOver] = useState(false);
    const [showPresets, setShowPresets] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const fileInputRef = React.useRef(null);

    const handleUploadProcess = async (file) => {
      if (!file) return;
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }

      setIsUploading(true);
      setUploadProgress(10);

      // Instant local preview for immediate responsive feedback
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (!value) {
          onChange(uploadEvent.target.result);
        }
      };
      reader.readAsDataURL(file);

      try {
        const result = await uploadCloudFile(file, `mistri/admin/${file.name}`, (p) => {
          setUploadProgress(p);
        });
        if (result && result.downloadURL) {
          onChange(result.downloadURL);
        }
      } catch (uploadErr) {
        console.warn('Cloud direct upload failed, fallback to local FileReader:', uploadErr);
        reader.onload = (uploadEvent) => {
          onChange(uploadEvent.target.result);
        };
        reader.readAsDataURL(file);
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
    };

    const handleFileChange = (e) => {
      const file = e.target.files?.[0];
      if (file) handleUploadProcess(file);
      if (e.target) e.target.value = '';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleUploadProcess(file);
    };

    const isCloudHosted = value && (value.includes('cloudinary.com') || value.includes('firebasestorage.app') || value.includes('googleusercontent.com'));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {/* Header with Label and Sample Photos toggle */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textDark }}>{label}</label>
            {isCloudHosted && (
              <span style={{ fontSize: '0.62rem', backgroundColor: '#F2F2F2', color: '#0A0A0A', padding: '1px 6px', borderRadius: '4px', fontWeight: 700, border: '1px solid #E5E7EB' }}>
                ☁️ Cloud Stored
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.primaryBlue,
              fontSize: '0.72rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Sparkles size={12} /> {showPresets ? 'Close Sample Photos' : '✨ Choose Sample Photo'}
          </button>
        </div>

        {/* Preset Sample Photo Picker Dropdown */}
        {showPresets && (
          <div style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #CBD5E1',
            borderRadius: '10px',
            padding: '0.75rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(85px, 1fr))',
            gap: '8px',
            maxHeight: '160px',
            overflowY: 'auto',
            marginBottom: '4px',
          }}>
            {PRESET_MATERIAL_IMAGES.map((preset, pIdx) => (
              <div
                key={pIdx}
                onClick={() => {
                  onChange(preset.url);
                  setShowPresets(false);
                }}
                style={{
                  cursor: 'pointer',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  border: value === preset.url ? `2px solid ${theme.primaryBlue}` : '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  textAlign: 'center',
                  transition: 'transform 0.15s ease',
                }}
                title={preset.label}
              >
                <img src={preset.url} alt={preset.label} style={{ width: '100%', height: '48px', objectFit: 'cover' }} />
                <div style={{ fontSize: '0.62rem', fontWeight: 600, color: theme.textDark, padding: '2px 3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {preset.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          style={{ display: 'none' }}
        />

        {/* Main Upload / Preview Area */}
        {value ? (
          /* STATE 1: IMAGE SELECTED - PREVIEW & ACTIONS */
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              borderRadius: '12px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <div style={{ position: 'relative', width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#0F172A', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={value}
                alt="Category Preview"
                style={{ maxWidth: '100%', maxHeight: '180px', width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {isUploading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  color: '#FFFFFF',
                }}>
                  <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.78rem', fontWeight: 700 }}>Uploading {uploadProgress}%...</span>
                </div>
              )}

              {!isUploading && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  left: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.9)',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backdropFilter: 'blur(2px)',
                }}>
                  <CheckCircle size={12} /> Image Uploaded
                </div>
              )}
            </div>

            {/* Action Buttons: Replace & Remove */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  flex: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: '#FFF8E1',
                  border: '1px solid #FFE08A',
                  borderRadius: '8px',
                  color: '#0A0A0A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <UploadCloud size={14} /> Change / Replace Photo
              </button>

              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '5px',
                  padding: '0.5rem 0.85rem',
                  backgroundColor: '#F2F2F2',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  color: '#0A0A0A',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: isUploading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Trash2 size={13} /> Remove Photo
              </button>
            </div>
          </div>
        ) : (
          /* STATE 2: NO IMAGE - DIRECT CLICK & DRAG/DROP UPLOAD CARD */
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? theme.primaryBlue : isUploading ? '#FFB800' : '#CBD5E1'}`,
              borderRadius: '12px',
              padding: '1.5rem 1rem',
              backgroundColor: dragOver ? '#FFF8E1' : isUploading ? '#FFF8E1' : '#F8FAFC',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: isUploading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s ease',
              textAlign: 'center',
            }}
          >
            {isUploading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Loader2 size={28} color="#FFB800" className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A' }}>
                  Uploading to Cloud Storage ({uploadProgress}%)...
                </span>
              </div>
            ) : (
              <>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#FFF8E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}>
                  <UploadCloud size={24} />
                </div>

                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 800, color: theme.textDark, marginBottom: '2px' }}>
                    Click to Upload Image or Drag & Drop
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                    Supports PNG, JPG, JPEG, WEBP (Max 10MB)
                  </div>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0.45rem 1rem',
                    backgroundColor: '#FFFFFF',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: theme.textDark,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    marginTop: '2px',
                  }}
                >
                  <UploadCloud size={14} color="#0A0A0A" /> Choose Photo from Device
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // Categories Dataset Filtering & Pagination
  // -------------------------------------------------------------
  const filteredCategories = useMemo(() => {
    let list = categories.map((cat, idx) => {
      // Enrich with counts if not present
      const subCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
      const prodCount = cat.productCount || products.filter(
        (p) => p.categorySlug === cat.slug || p.category?.toLowerCase() === cat.name?.toLowerCase()
      ).length;
      const sectionName = cat.section || 'General';
      const isActive = cat.isActive !== false;
      const createdOn = cat.createdOn || '12 Jan 2024, 10:30 AM';
      const lastUpdated = cat.lastUpdated || '16 Sep 2024, 02:45 PM';

      return {
        ...cat,
        subCount,
        prodCount,
        sectionName,
        isActive,
        createdOn,
        lastUpdated,
      };
    });

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.slug?.toLowerCase().includes(q) ||
          c.sectionName?.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q)
      );
    }

    if (selectedSectionFilter !== 'All') {
      list = list.filter((c) => c.sectionName === selectedSectionFilter);
    }

    if (selectedStatusFilter !== 'All') {
      const wantActive = selectedStatusFilter === 'Active';
      list = list.filter((c) => c.isActive === wantActive);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'name-desc') return b.name.localeCompare(a.name);
      if (sortBy === 'products-desc') return b.prodCount - a.prodCount;
      if (sortBy === 'products-asc') return a.prodCount - b.prodCount;
      return 0;
    });

    return list;
  }, [categories, searchTerm, selectedSectionFilter, selectedStatusFilter, sortBy]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredCategories.length / rowsPerPage) || 1;
  const paginatedCategories = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredCategories.slice(start, start + rowsPerPage);
  }, [filteredCategories, currentPage, rowsPerPage]);

  // Handle selection toggles
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedCategories.map((c) => c.id || c.slug));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Handle Drawer Save Changes
  const handleSaveDrawer = () => {
    if (!editFormData) return;
    updateCategory(editFormData.id || editFormData.slug, editFormData);
    setInspectedCategory({ ...editFormData });
    addToast('Category changes saved successfully!', 'success');
  };

  // Handle Delete Category
  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
      deleteCategory(cat.id || cat.slug);
      if (inspectedCategory?.id === cat.id) {
        setInspectedCategory(categories.find((c) => c.id !== cat.id) || null);
      }
      addToast(`Category ${cat.name} removed`, 'info');
    }
  };

  // Batch actions
  const handleBatchActivate = () => {
    selectedIds.forEach((id) => {
      updateCategory(id, { isActive: true });
    });
    addToast(`Activated ${selectedIds.length} categories`, 'success');
    setSelectedIds([]);
  };

  const handleBatchDeactivate = () => {
    selectedIds.forEach((id) => {
      updateCategory(id, { isActive: false });
    });
    addToast(`Deactivated ${selectedIds.length} categories`, 'warning');
    setSelectedIds([]);
  };

  const handleBatchDelete = () => {
    if (window.confirm(`Delete ${selectedIds.length} selected categories?`)) {
      selectedIds.forEach((id) => deleteCategory(id));
      setSelectedIds([]);
      addToast('Selected categories deleted', 'info');
    }
  };

  // -------------------------------------------------------------
  // Product Catalog Dataset Filtering & Calculations
  // -------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    let list = products.map((p, idx) => {
      const mrp = Number(p.mrp) || Math.round((Number(p.price) || 350) * 1.25);
      const price = Number(p.price) || 300;
      const marginAmount = Math.max(0, mrp - price);
      const marginPercent = Math.round((marginAmount / (mrp || 1)) * 100);
      const stock = typeof p.stockCount === 'number' ? p.stockCount : (p.inStock !== false ? 350 : 0);
      const inStock = p.inStock !== false && stock > 0;
      const isLowStock = stock > 0 && stock <= 80;
      const isOutOfStock = !inStock || stock === 0;

      // Multi-hub stock indicators (HA: Hub Available, HR: Hub Reserved, SA: Site Available, SC: Site Consigned)
      const haStock = stock;
      const hrStock = Math.round(stock * 0.12);
      const saStock = Math.round(stock * 0.35);
      const scStock = isOutOfStock ? 0 : Math.round(stock * 0.04);

      return {
        ...p,
        mrp,
        price,
        marginAmount,
        marginPercent,
        stock,
        inStock,
        isLowStock,
        isOutOfStock,
        haStock,
        hrStock,
        saStock,
        scStock,
        seller: p.seller || 'Hub Catalog',
        unit: p.unit || 'Unit',
        category: p.category || 'General Material',
        subcategory: p.subcategory || 'Standard Specification',
        brand: p.brand || 'Mistri Verified',
        status: p.status || (inStock ? 'PUBLISHED' : 'OUT_OF_STOCK'),
        specText: p.specText || (p.specifications && Object.values(p.specifications)[0]) || '51 Microns | Heavy Gauge',
      };
    });

    if (productSearch.trim()) {
      const q = productSearch.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subcategory?.toLowerCase().includes(q) ||
          p.id?.toLowerCase().includes(q)
      );
    }

    if (productCategoryFilter !== 'All') {
      list = list.filter(
        (p) =>
          p.category === productCategoryFilter ||
          p.categorySlug === productCategoryFilter ||
          p.name?.toLowerCase().includes(productCategoryFilter.toLowerCase())
      );
    }

    if (productSectionFilter !== 'All') {
      list = list.filter((p) => p.section === productSectionFilter || p.sectionName === productSectionFilter);
    }

    if (productStockFilter === 'inStock') {
      list = list.filter((p) => p.inStock && !p.isOutOfStock);
    } else if (productStockFilter === 'lowStock') {
      list = list.filter((p) => p.isLowStock);
    } else if (productStockFilter === 'outOfStock') {
      list = list.filter((p) => p.isOutOfStock);
    }

    if (productCatalogTab === 'alerts') {
      list = list.filter((p) => p.isLowStock || p.isOutOfStock);
    }

    return list;
  }, [products, productSearch, productCategoryFilter, productSectionFilter, productStockFilter, productCatalogTab]);

  const productStats = useMemo(() => {
    const all = products.length;
    let active = 0;
    let low = 0;
    let out = 0;
    products.forEach((p) => {
      const s = typeof p.stockCount === 'number' ? p.stockCount : (p.inStock !== false ? 200 : 0);
      if (p.inStock !== false && s > 0) active++;
      if (s > 0 && s <= 80) low++;
      if (p.inStock === false || s === 0) out++;
    });
    return { all, active, low, out };
  }, [products]);

  // Product Actions Handlers
  const handleOpenAddProduct = () => {
    const defaultCat = categories && categories.length > 0 ? categories[0] : null;
    setProductFormData({
      id: '',
      name: '',
      slug: '',
      description: '',
      brand: 'UltraTech',
      section: defaultCat?.section || defaultCat?.sectionName || 'Civil & Interiors',
      category: defaultCat ? defaultCat.name : 'Cement',
      categorySlug: defaultCat ? defaultCat.slug : 'cement',
      subcategory: defaultCat && Array.isArray(defaultCat.subcategories) && defaultCat.subcategories.length > 0 ? defaultCat.subcategories[0] : '',
      unit: '50kg Bag',
      mrp: '',
      price: '',
      stockCount: 500,
      minOrderQty: 1,
      gstRate: 18,
      image: '',
      gallery: [],
      variants: [],
      variantGroups: [],
      cashbackTitle: 'Assured 2% Cashback',
      cashbackSubtitle: 'On purchases above ₹50,000',
      trustBadge1Title: '100%',
      trustBadge1Sub: 'Genuine',
      returnPolicyTitle: 'Non',
      returnPolicySub: 'Returnable',
      replacementPolicyTitle: '7 Day',
      replacementPolicySub: 'Replacement',
      quickAnswer: '',
      highlights: '',
      status: 'PUBLISHED',
      isFeatured: true,
    });
    setProductModalTab('general');
    setActiveModal('create-product');
  };

  const handleOpenEditProduct = (prod) => {
    setProductFormData({
      id: prod.id,
      name: prod.name || '',
      slug: prod.slug || '',
      description: prod.description || '',
      brand: prod.brand || 'UltraTech',
      section: prod.section || 'Civil & Interiors',
      category: prod.category || (categories[0]?.name || 'Cement'),
      categorySlug: prod.categorySlug || (categories[0]?.slug || 'cement'),
      subcategory: prod.subcategory || '',
      unit: prod.unit || '50kg Bag',
      mrp: prod.mrp || Math.round((prod.price || 300) * 1.25),
      price: prod.price || 300,
      stockCount: typeof prod.stockCount === 'number' ? prod.stockCount : 500,
      minOrderQty: prod.minOrderQty || 1,
      gstRate: prod.gstRate || 18,
      image: prod.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400',
      gallery: Array.isArray(prod.gallery) ? prod.gallery : [],
      variants: Array.isArray(prod.variants) ? prod.variants : [],
      variantGroups: Array.isArray(prod.variantGroups) ? prod.variantGroups : [],
      cashbackTitle: prod.cashbackTitle || 'Assured 2% Cashback',
      cashbackSubtitle: prod.cashbackSubtitle || 'On purchases above ₹50,000',
      trustBadge1Title: prod.trustBadge1Title || '100%',
      trustBadge1Sub: prod.trustBadge1Sub || 'Genuine',
      returnPolicyTitle: prod.returnPolicyTitle || (prod.isReturnable ? '7 Days' : 'Non'),
      returnPolicySub: prod.returnPolicySub || (prod.isReturnable ? 'Returnable' : 'Returnable'),
      replacementPolicyTitle: prod.replacementPolicyTitle || '7 Day',
      replacementPolicySub: prod.replacementPolicySub || 'Replacement',
      quickAnswer: prod.quickAnswer || '',
      highlights: prod.highlights || '',
      status: prod.status || (prod.inStock ? 'PUBLISHED' : 'OUT_OF_STOCK'),
      isFeatured: prod.isFeatured !== undefined ? prod.isFeatured : true,
    });
    setProductModalTab('general');
    setActiveModal('edit-product');
  };

  const handleSaveProduct = (e) => {
    if (e) e.preventDefault();
    if (!productFormData.name || !productFormData.name.trim()) {
      addToast('Please enter a product title', 'warning');
      return;
    }

    const name = productFormData.name.trim();
    const slug = productFormData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    // If admin defined variants, the first variant is what customers see by default, so
    // it also sets the product's listed price, MRP, stock and unit.
    const firstVariant = Array.isArray(productFormData.variants) && productFormData.variants.length > 0 ? productFormData.variants[0] : null;
    const priceSource = firstVariant && firstVariant.price !== '' && firstVariant.price !== undefined ? firstVariant.price : productFormData.price;
    const mrpSource = firstVariant && Number(firstVariant.mrp) > 0 ? firstVariant.mrp : productFormData.mrp;
    if (priceSource === '' || priceSource === undefined || priceSource === null || !(Number(priceSource) >= 0)) {
      addToast(firstVariant ? 'Please enter a price for the first variant' : 'Please enter a price for the product', 'warning');
      return;
    }
    const price = Number(priceSource);
    const mrp = Number(mrpSource) > 0 ? Number(mrpSource) : Math.round(price * 1.25);
    const stockCount = firstVariant
      ? (Number(firstVariant.stockCount) >= 0 ? Number(firstVariant.stockCount) : 500)
      : (productFormData.stockCount !== '' && productFormData.stockCount !== undefined && !isNaN(productFormData.stockCount) ? Number(productFormData.stockCount) : 500);
    const inStock = productFormData.status !== 'OUT_OF_STOCK' && stockCount > 0;
    const category = productFormData.category || (categories && categories[0]?.name) || 'Cement';
    const foundCat = categories.find((c) => c.name?.toLowerCase() === category.toLowerCase() || c.slug === productFormData.categorySlug);
    const categorySlug = productFormData.categorySlug || foundCat?.slug || category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const image = productFormData.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400';

    const productPayload = {
      ...productFormData,
      name,
      slug,
      price,
      mrp,
      stockCount,
      inStock,
      category,
      categorySlug,
      section: foundCat?.section || foundCat?.sectionName || productFormData.section || 'Civil & Interiors',
      brand: productFormData.brand || 'UltraTech',
      unit: firstVariant ? (firstVariant.unit || productFormData.unit || 'Standard Unit') : (productFormData.unit || 'Standard Unit'),
      image,
      gallery: Array.isArray(productFormData.gallery) ? productFormData.gallery : [],
      variants: Array.isArray(productFormData.variants) ? productFormData.variants : [],
      isFeatured: productFormData.isFeatured !== undefined ? productFormData.isFeatured : true,
      isPopular: true,
    };

    if (activeModal === 'edit-product' && productFormData.id) {
      updateProduct(productFormData.id, productPayload);
      addToast(`Product "${name}" updated successfully!`, 'success');
    } else {
      const newId = `prod_${Date.now()}`;
      addProduct({
        ...productPayload,
        id: newId,
      });
      addToast(`Product "${name}" published to catalog!`, 'success');
    }

    setActiveModal(null);
  };

  // -------------------------------------------------------------
  // Inline Styles & CSS Variables for the Light Blue SaaS Design
  // -------------------------------------------------------------
  const theme = {
    bg: '#F2F2F2',
    sidebarBg: '#FFFFFF',
    sidebarBorder: '#E5E7EB',
    headerBg: '#FFFFFF',
    headerBorder: '#E5E7EB',
    cardBg: '#FFFFFF',
    cardBorder: '#E5E7EB',
    primaryBlue: '#0A0A0A',
    primaryBlueHover: '#262626',
    primaryBlueLight: '#FFF8E1',
    textDark: '#000000',
    textMuted: '#6B7280',
    textSubtle: '#9CA3AF',
    tableBorder: '#E5E7EB',
    tableHeaderBg: '#F8FAFC',
    badgeGreen: '#0A0A0A',
    badgeGreenLight: '#F2F2F2',
    badgeOrange: '#FFB800',
    badgeOrangeLight: '#FFF8E1',
    badgePurple: '#0A0A0A',
    badgePurpleLight: '#FFF8E1',
    badgeBlue: '#0A0A0A',
    badgeBlueLight: '#FFF8E1',
    badgeRed: '#0A0A0A',
    badgeRedLight: '#F2F2F2',
  };

  // Local state for Admin Login Form
  const [adminEmailInput, setAdminEmailInput] = useState('admin@gmail.com');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);
  const [useAdminOtp, setUseAdminOtp] = useState(false);
  const [adminPhoneInput, setAdminPhoneInput] = useState('');
  const [adminOtpInput, setAdminOtpInput] = useState('');

  const handleAdminLoginSubmit = async (e) => {
    if (e) e.preventDefault();
    setAdminAuthError('');
    setIsAdminSubmitting(true);

    try {
      const res = useAdminOtp
        ? await adminOtpLogin(adminPhoneInput, adminOtpInput)
        : await adminLogin(adminEmailInput, adminPasswordInput);
      if (!res.success) {
        setAdminAuthError(res.message || 'Invalid administrator credentials');
      }
    } catch (err) {
      setAdminAuthError(err.message || 'Authentication error');
    } finally {
      setIsAdminSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Exclusive Admin Authentication Gate
  // -------------------------------------------------------------
  if (!adminUser) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        backgroundImage: 'radial-gradient(circle at 50% 20%, rgba(0, 0, 0, 0.18) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(255, 184, 0, 0.15) 0%, transparent 50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      }}>
        {/* Ambient Grid Pattern Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          pointerEvents: 'none',
        }} />

        {/* Central Auth Card Container */}
        <div style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#000000',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 0, 0, 0.15)',
          padding: '2.5rem 2.25rem',
          position: 'relative',
          zIndex: 10,
          backdropFilter: 'blur(16px)',
        }}>
          {/* Header & Security Badge */}
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '64px',
              height: '64px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, #0A0A0A 0%, #000000 100%)',
              color: '#FFFFFF',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              marginBottom: '1rem',
            }}>
              <ShieldCheck size={34} />
            </div>

            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 12px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 184, 0, 0.15)',
              border: '1px solid rgba(255, 184, 0, 0.35)',
              color: '#0A0A0A',
              fontSize: '0.7rem',
              fontWeight: 800,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: '0.75rem',
            }}>
              <Lock size={12} /> RESTRICTED ACCESS • ADMIN ONLY
            </div>

            <h1 style={{
              fontSize: '1.65rem',
              fontWeight: 900,
              color: '#FFFFFF',
              margin: '0 0 0.4rem 0',
              letterSpacing: '-0.02em',
            }}>
              BuildMyDestiny Admin Login
            </h1>
            <p style={{
              fontSize: '0.84rem',
              color: '#94A3B8',
              margin: 0,
              lineHeight: 1.45,
            }}>
              Authorized system administrator access only. Enter root credentials to manage the platform.
            </p>
          </div>


          {/* Error Alert Banner */}
          {adminAuthError && (
            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.15)',
              border: '1px solid rgba(0, 0, 0, 0.4)',
              borderRadius: '10px',
              padding: '0.75rem 1rem',
              color: '#9CA3AF',
              fontSize: '0.8rem',
              fontWeight: 600,
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <AlertCircle size={16} color="#0A0A0A" style={{ flexShrink: 0 }} />
              <span>{adminAuthError}</span>
            </div>
          )}

          {/* Admin Login Form */}
          <form onSubmit={handleAdminLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {useAdminOtp ? (
              <>
                {/* Phone Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#CBD5E1', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Phone size={17} color="#64748B" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      required
                      value={adminPhoneInput}
                      onChange={(e) => setAdminPhoneInput(e.target.value)}
                      placeholder="Enter phone number"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.65rem', borderRadius: '10px', border: '1px solid #262626', backgroundColor: '#000000', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
                    />
                  </div>
                </div>

                {/* OTP Field */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.74rem', fontWeight: 800, color: '#CBD5E1', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                    OTP
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Key size={17} color="#64748B" style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      value={adminOtpInput}
                      onChange={(e) => setAdminOtpInput(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.65rem', borderRadius: '10px', border: '1px solid #262626', backgroundColor: '#000000', color: '#FFFFFF', fontSize: '0.9rem', fontWeight: 600, outline: 'none' }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Email Field */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.74rem',
                    fontWeight: 800,
                    color: '#CBD5E1',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    marginBottom: '6px',
                  }}>
                    Administrator Email
                  </label>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Mail
                      size={17}
                      color="#64748B"
                      style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                    />
                    <input
                      type="email"
                      required
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="admin@gmail.com"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.65rem',
                        borderRadius: '10px',
                        border: '1px solid #262626',
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
                      onBlur={(e) => e.target.style.borderColor = '#262626'}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      color: '#CBD5E1',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}>
                      Admin Password
                    </label>
                  </div>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                  }}>
                    <Lock
                      size={17}
                      color="#64748B"
                      style={{ position: 'absolute', left: '14px', pointerEvents: 'none' }}
                    />
                    <input
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter admin password"
                      style={{
                        width: '100%',
                        padding: '0.75rem 2.75rem 0.75rem 2.65rem',
                        borderRadius: '10px',
                        border: '1px solid #262626',
                        backgroundColor: '#000000',
                        color: '#FFFFFF',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        outline: 'none',
                        transition: 'border-color 0.15s ease',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#0A0A0A'}
                      onBlur={(e) => e.target.style.borderColor = '#262626'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      {showAdminPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Toggle between password and OTP login */}
            <button
              type="button"
              onClick={() => { setUseAdminOtp((prev) => !prev); setAdminAuthError(''); }}
              style={{
                display: 'block',
                margin: '-0.6rem 0 0 auto',
                background: 'none',
                border: 'none',
                color: '#FFB800',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
              }}
            >
              {useAdminOtp ? 'Use email & password instead' : 'Use OTP instead'}
            </button>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAdminSubmitting}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.85rem 1.5rem',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #0A0A0A 0%, #262626 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '0.03em',
                cursor: isAdminSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isAdminSubmitting) e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (!isAdminSubmitting) e.currentTarget.style.transform = 'none';
              }}
            >
              {isAdminSubmitting ? (
                <>
                  <RefreshCw size={18} style={{ animation: 'spin 0.6s linear infinite' }} />
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <Key size={18} />
                  <span>LOG IN TO ADMIN HUB</span>
                </>
              )}
            </button>
          </form>

          {/* Return to Customer Store */}
          <div style={{ marginTop: '1.75rem', textAlign: 'center', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              style={{
                background: 'none',
                border: 'none',
                color: '#94A3B8',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
            >
              <ArrowLeft size={14} /> Return to Customer Storefront
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: theme.bg,
      color: theme.textDark,
      fontFamily: "'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif",
      fontSize: '14px',
    }}>
      {/* ========================================================= */}
      {/* 1. LEFT SIDEBAR NAVIGATION (LIGHT BLUE)                   */}
      {/* ========================================================= */}
      {/* Mobile Backdrop Overlay */}
      <div
        className={`admin-mobile-backdrop ${isMobileDrawerOpen ? 'active' : ''}`}
        onClick={() => setIsMobileDrawerOpen(false)}
      />

      <aside
        className={`admin-sidebar ${isMobileDrawerOpen ? 'mobile-open' : ''}`}
        style={{
          width: isSidebarCollapsed ? '72px' : '260px',
          backgroundColor: theme.sidebarBg,
          borderRight: `1px solid ${theme.sidebarBorder}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          zIndex: 50,
          transition: 'width 0.2s ease',
          flexShrink: 0,
        }}
      >
        {/* Brand / Logo */}
        <div
          style={{
            height: '68px',
            padding: isSidebarCollapsed ? '0 0.5rem' : '0 1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
            borderBottom: `1px solid ${theme.sidebarBorder}`,
          }}
        >
          {!isSidebarCollapsed ? (
            <div style={{ cursor: 'pointer' }} onClick={() => handleTabChange('dashboard')}>
              <Logo size="medium" showTagline={true} />
            </div>
          ) : (
            <div
              onClick={() => handleTabChange('dashboard')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: '#000000',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.1rem',
                cursor: 'pointer',
              }}
            >
              M
            </div>
          )}

          {/* Mobile Close Button */}
          <button
            type="button"
            className="admin-mobile-close-btn"
            onClick={() => setIsMobileDrawerOpen(false)}
            title="Close Menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Menus with Scrollbar */}
        <nav style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0.75rem 1.5rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
        }}>
          {sidebarNavGroups.map((grp, gIdx) => (
            <div key={gIdx} style={{ marginBottom: grp.group ? '0.6rem' : '0.2rem' }}>
              {grp.group && !isSidebarCollapsed && (
                <div style={{
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  color: '#6B7280',
                  padding: '0.6rem 0.6rem 0.3rem 0.6rem',
                  textTransform: 'uppercase',
                }}>
                  {grp.group}
                </div>
              )}
              {grp.items.map((item) => {
                const Icon = item.icon;
                const isItemParent = item.isExpandable && item.children;
                const isParentActive = ['categories', 'parent-categories', 'sub-categories', 'category-products'].includes(adminActiveTab);
                const isActive = item.id === 'categories'
                  ? isParentActive
                  : adminActiveTab === item.id;

                if (isItemParent) {
                  return (
                    <div key={item.id} style={{ marginBottom: '4px' }}>
                      <button
                        onClick={() => {
                          setIsCategoryMenuOpen(!isCategoryMenuOpen);
                        }}
                        title={isSidebarCollapsed ? item.label : undefined}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                          padding: isSidebarCollapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                          borderRadius: '9px',
                          backgroundColor: isParentActive ? '#F1F5F9' : 'transparent',
                          color: isParentActive ? theme.primaryBlue : '#1A1A1A',
                          border: 'none',
                          cursor: 'pointer',
                          fontWeight: isParentActive ? 700 : 500,
                          fontSize: '0.85rem',
                          transition: 'all 0.15s ease',
                          marginBottom: '2px',
                        }}
                        onMouseEnter={(e) => {
                          if (!isParentActive) e.currentTarget.style.backgroundColor = '#F1F5F9';
                        }}
                        onMouseLeave={(e) => {
                          if (!isParentActive) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Icon size={18} color={isParentActive ? theme.primaryBlue : '#6B7280'} />
                          {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>

                        {!isSidebarCollapsed && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {item.badge && (
                              <span style={{
                                fontSize: '0.72rem',
                                fontWeight: 700,
                                padding: '1px 7px',
                                borderRadius: '12px',
                                backgroundColor: isParentActive ? theme.primaryBlue : '#F1F5F9',
                                color: isParentActive ? '#FFFFFF' : theme.primaryBlue,
                              }}>
                                {item.badge}
                              </span>
                            )}
                            {isCategoryMenuOpen ? (
                              <ChevronDown size={15} color={isParentActive ? theme.primaryBlue : '#6B7280'} />
                            ) : (
                              <ChevronRight size={15} color={isParentActive ? theme.primaryBlue : '#6B7280'} />
                            )}
                          </div>
                        )}
                      </button>

                      {/* 3 Sub-tabs in Sidebar: All Categories, Parent Categories, Sub Categories */}
                      {isCategoryMenuOpen && !isSidebarCollapsed && (
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          marginTop: '2px',
                          marginLeft: '12px',
                          paddingLeft: '10px',
                          borderLeft: '2px solid #CBD5E1',
                        }}>
                          {item.children.map((child) => {
                            const ChildIcon = child.icon;
                            const isChildActive = adminActiveTab === child.id || (child.id === 'categories' && adminActiveTab === 'category-products');
                            return (
                              <button
                                key={child.id}
                                onClick={() => handleTabChange(child.id)}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  padding: '0.45rem 0.65rem',
                                  borderRadius: '7px',
                                  backgroundColor: isChildActive ? theme.primaryBlue : 'transparent',
                                  color: isChildActive ? '#FFFFFF' : '#334155',
                                  border: 'none',
                                  cursor: 'pointer',
                                  fontWeight: isChildActive ? 700 : 500,
                                  fontSize: '0.8rem',
                                  transition: 'all 0.15s ease',
                                }}
                                onMouseEnter={(e) => {
                                  if (!isChildActive) e.currentTarget.style.backgroundColor = '#E2E8F0';
                                }}
                                onMouseLeave={(e) => {
                                  if (!isChildActive) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <ChildIcon size={14} color={isChildActive ? '#FFFFFF' : '#64748B'} />
                                  <span>{child.label}</span>
                                </div>
                                {child.badge && (
                                  <span style={{
                                    fontSize: '0.68rem',
                                    fontWeight: 700,
                                    padding: '1px 6px',
                                    borderRadius: '10px',
                                    backgroundColor: isChildActive ? 'rgba(255,255,255,0.25)' : '#E2E8F0',
                                    color: isChildActive ? '#FFFFFF' : '#475569',
                                  }}>
                                    {child.badge}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: isSidebarCollapsed ? 'center' : 'space-between',
                      padding: isSidebarCollapsed ? '0.65rem 0' : '0.55rem 0.75rem',
                      borderRadius: '9px',
                      backgroundColor: isActive ? theme.primaryBlue : 'transparent',
                      color: isActive ? '#FFFFFF' : '#1A1A1A',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      transition: 'all 0.15s ease',
                      marginBottom: '2px',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = '#F1F5F9';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Icon size={18} color={isActive ? '#FFFFFF' : '#6B7280'} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.badge && (
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        padding: '1px 7px',
                        borderRadius: '12px',
                        backgroundColor: isActive
                          ? 'rgba(255,255,255,0.25)'
                          : item.badgeStyle === 'blue-pill'
                          ? theme.primaryBlue
                          : '#F1F5F9',
                        color: isActive ? '#FFFFFF' : item.badgeStyle === 'blue-pill' ? '#FFFFFF' : theme.primaryBlue,
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}

          {/* Admin Session & Logout Footer */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!isSidebarCollapsed ? (
              <div style={{
                padding: '0.75rem',
                borderRadius: '10px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: theme.primaryBlue,
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}>
                    {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                  </div>
                  <div style={{ minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000000', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {adminUser?.name || 'Administrator'}
                    </div>
                    <div style={{ fontSize: '0.66rem', color: '#64748B', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {adminUser?.email || 'admin@gmail.com'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={adminLogout}
                  title="Logout Admin"
                  style={{
                    background: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    padding: '5px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0A0A0A',
                    transition: 'all 0.15s ease',
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F2F2F2'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; }}
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={adminLogout}
                title="Logout Admin"
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#F2F2F2',
                  border: '1px solid #E5E7EB',
                  color: '#0A0A0A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  margin: '0 auto',
                }}
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </nav>
      </aside>

      {/* ========================================================= */}
      {/* 2. MAIN WORKSPACE AREA (WITH LIGHT BLUE HEADER)           */}
      {/* ========================================================= */}
      <div className="admin-main-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowX: 'hidden' }}>
        {/* TOP HEADER BAR (LIGHT BLUE) */}
        <header
          className="admin-top-header"
          style={{
            height: '68px',
            backgroundColor: theme.headerBg,
            borderBottom: `1px solid ${theme.headerBorder}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 1.75rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left: Sidebar Toggle & Global Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '620px' }}>
            <button
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  setIsMobileDrawerOpen(!isMobileDrawerOpen);
                } else {
                  setIsSidebarCollapsed(!isSidebarCollapsed);
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                color: '#262626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '7px',
                borderRadius: '8px',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              title="Toggle Navigation Menu"
            >
              <Menu size={20} />
            </button>

            {/* Global Search Bar */}
            <div
              className="admin-global-search-container"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '10px',
                padding: '0.45rem 0.85rem',
                gap: '8px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Search size={16} color="#9CA3AF" />
              <input
                type="text"
                placeholder="Search products, orders, users, categories..."
                value={globalSearch}
                onChange={(e) => {
                  setGlobalSearch(e.target.value);
                  setSearchTerm(e.target.value);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: '0.85rem',
                  color: theme.textDark,
                  width: '100%',
                }}
              />
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: '#6B7280',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E5E7EB',
                  padding: '2px 6px',
                  borderRadius: '5px',
                }}
              >
                Ctrl K
              </span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* View Storefront Link */}
            <button
              className="admin-storefront-btn"
              onClick={() => navigateTo('home')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.45rem 0.85rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                color: '#000000',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
            >
              <Store size={15} color="#0A0A0A" />
              <span>View User Store</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                style={{
                  background: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#262626',
                  position: 'relative',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <Bell size={18} />
                {adminNotifications.filter((n) => n.unread).length > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      minWidth: '18px',
                      height: '18px',
                      borderRadius: '9px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #FFFFFF',
                      padding: '0 4px',
                      animation: 'pulse 2s infinite',
                    }}
                  >
                    {adminNotifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {isNotificationOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '46px',
                    right: 0,
                    width: '360px',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.06)',
                    zIndex: 9999,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '480px',
                  }}
                >
                  <div
                    style={{
                      padding: '12px 14px',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Incoming Order Alerts</div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                        {adminNotifications.filter((n) => n.unread).length} Unread Notifications
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={playOrderNotificationSound}
                        title="Test Audio Chime"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: 'none',
                          borderRadius: '4px',
                          color: '#FFFFFF',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          cursor: 'pointer',
                        }}
                      >
                        🔊 Chime
                      </button>
                      <button
                        type="button"
                        onClick={markAllAdminNotificationsRead}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#FFE08A',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Read All
                      </button>
                    </div>
                  </div>

                  <div style={{ overflowY: 'auto', maxHeight: '350px', display: 'flex', flexDirection: 'column' }}>
                    {adminNotifications.length > 0 ? (
                      adminNotifications.map((notif) => {
                        const isOnline = notif.paymentMethod?.toLowerCase().includes('upi') || notif.paymentMethod?.toLowerCase().includes('online') || notif.paymentMethod?.toLowerCase().includes('card');

                        return (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markAdminNotificationRead(notif.id);
                              handleTabChange('orders');
                              setIsNotificationOpen(false);
                            }}
                            style={{
                              padding: '10px 14px',
                              borderBottom: '1px solid #F1F5F9',
                              backgroundColor: notif.unread ? '#FFF8E1' : '#FFFFFF',
                              cursor: 'pointer',
                              display: 'flex',
                              gap: '10px',
                              alignItems: 'flex-start',
                              transition: 'background 0.15s',
                            }}
                          >
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isOnline ? '#F2F2F2' : '#FFF8E1',
                                color: '#0A0A0A',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: '2px',
                              }}
                            >
                              <Truck size={16} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontWeight: 800, fontSize: '0.825rem', color: '#0A0A0A' }}>
                                  {notif.title}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{notif.time}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: '#475467', marginTop: '2px' }}>
                                {notif.message}
                              </div>
                              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                                <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '1px 6px', borderRadius: '4px', border: isOnline ? '1px solid #E5E7EB' : '1px solid #FFE08A', backgroundColor: isOnline ? '#F2F2F2' : '#FFF8E1', color: '#0A0A0A' }}>
                                  {isOnline ? '💳 Online Paid' : '💵 Cash on Site'}
                                </span>
                                {notif.amount && (
                                  <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0A0A0A' }}>
                                    ₹{notif.amount.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                        No notifications yet.
                      </div>
                    )}
                  </div>

                  {adminNotifications.length > 0 && (
                    <div style={{ padding: '8px 14px', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={clearAdminNotifications}
                        style={{ background: 'none', border: 'none', color: '#0A0A0A', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                      >
                        Clear All
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleTabChange('orders');
                          setIsNotificationOpen(false);
                        }}
                        style={{ background: 'none', border: 'none', color: '#0A0A0A', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                      >
                        View All Orders →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Expand Icon */}
            <button
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen().catch(() => {});
                } else {
                  document.exitFullscreen().catch(() => {});
                }
              }}
              style={{
                background: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#262626',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
              title="Toggle Fullscreen"
            >
              <Maximize2 size={16} />
            </button>

            {/* User Profile Chip */}
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '4px 8px 4px 4px',
                  borderRadius: '24px',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '0.9rem',
                }}>
                  {adminUser?.name ? adminUser.name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: theme.textDark }}>{adminUser?.name || 'Root Administrator'}</span>
                  <span style={{ fontSize: '0.68rem', color: theme.textMuted }}>{adminUser?.email || 'admin@gmail.com'}</span>
                </div>
                <ChevronDown size={14} color="#9CA3AF" />
              </div>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '110%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                  width: '200px',
                  padding: '0.5rem',
                  zIndex: 100,
                }}>
                  <button
                    onClick={() => { navigateTo('home'); setIsProfileMenuOpen(false); }}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#000000', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Store size={15} /> View Storefront
                  </button>
                  <button
                    onClick={() => { handleTabChange('settings'); setIsProfileMenuOpen(false); }}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#000000', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F8FAFC'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <Settings size={15} /> Platform Settings
                  </button>
                  <button
                    onClick={() => { resetToDefaultData(); setIsProfileMenuOpen(false); }}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0A0A0A', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFF8E1'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <RotateCcw size={15} /> Reload Data from Server
                  </button>
                  <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
                  <button
                    onClick={() => { adminLogout(); setIsProfileMenuOpen(false); }}
                    style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'transparent', border: 'none', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: '#0A0A0A', cursor: 'pointer', borderRadius: '6px' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F2F2F2'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <LogOut size={15} /> Logout Admin
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY: Workspace + Side Inspector Layout */}
        <div style={{ display: 'flex', flex: 1, minHeight: 'calc(100vh - 68px)' }}>
          {/* CENTER VIEW CONTENT */}
          <main className="admin-main-content" style={{ flex: 1, padding: '1.5rem 1.75rem', minWidth: 0, overflowY: 'auto' }}>
            {/* Render Tab Sub-View based on adminActiveTab */}
            {adminActiveTab === 'categories' && renderCategoriesView()}
            {adminActiveTab === 'parent-categories' && renderParentCategoriesView()}
            {adminActiveTab === 'sub-categories' && renderSubCategoriesView()}
            {adminActiveTab === 'dashboard' && renderDashboardView()}
            {adminActiveTab === 'products' && renderProductsView()}
            {adminActiveTab === 'brands' && renderBrandsView()}
            {adminActiveTab === 'attributes' && renderProductsView()}
            {adminActiveTab === 'orders' && renderOrdersView()}
            {adminActiveTab === 'live-tracking' && renderLiveTrackingView()}
            {adminActiveTab === 'customers' && renderUsersView('Customers')}
            {adminActiveTab === 'vendors' && renderVendorsView()}
            {adminActiveTab === 'coupons' && renderCouponsView()}
            {adminActiveTab === 'banners' && renderBannersView()}
            {adminActiveTab === 'bookings' && renderBookingsView()}
            {adminActiveTab === 'services' && renderServicesView()}
            {adminActiveTab === 'quotations' && renderQuotationsView()}
            {adminActiveTab === 'faqs' && renderFaqsView()}
            {adminActiveTab === 'settings' && renderSettingsView()}
            {adminActiveTab === 'admin-users' && renderAdminUsersView()}
            {adminActiveTab === 'system-logs' && renderSystemLogsView()}
          </main>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MODAL DIALOGS (Category, Parent Category, Sub Category) */}
      {/* ========================================================= */}
      {/* Modal 1: Add Category Modal */}
      {/* Modal 1: Add Category Modal */}
      {activeModal === 'add-category' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '540px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: theme.textDark }}>
                + Add New Category
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const name = modalFormData.name;
                if (!name) return;
                const sectionVal = modalFormData.section?.trim() || 'Civil & Interiors';
                const newCat = {
                  id: `cat_${Date.now()}`,
                  name,
                  slug: modalFormData.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  section: sectionVal,
                  description: modalFormData.description || '',
                  image: modalFormData.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300',
                  subcategories: modalFormData.subcategoriesText ? modalFormData.subcategoriesText.split(',').map(s => s.trim()).filter(Boolean) : [],
                  isActive: true,
                  createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  lastUpdated: 'Just now',
                };
                addCategory(newCat);
                setActiveModal(null);
                setModalFormData({});
                addToast(`Category "${name}" created under "${sectionVal}"!`, 'success');
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.textDark, marginBottom: '0.35rem' }}>
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ready Mix Concrete, Structural Steel"
                  value={modalFormData.name || ''}
                  onChange={(e) => setModalFormData({
                    ...modalFormData,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.textDark, marginBottom: '0.35rem' }}>
                  Slug
                </label>
                <input
                  type="text"
                  value={modalFormData.slug || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 700, color: theme.textDark }}>
                    Parent Category / Section
                  </label>
                  <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '2px', borderRadius: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setModalFormData({ ...modalFormData, isCustomSection: false })}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: !modalFormData.isCustomSection ? '#FFFFFF' : 'transparent',
                        color: !modalFormData.isCustomSection ? theme.primaryBlue : '#64748B',
                        boxShadow: !modalFormData.isCustomSection ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Select Existing
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalFormData({ ...modalFormData, isCustomSection: true, section: '' })}
                      style={{
                        padding: '2px 8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: modalFormData.isCustomSection ? theme.primaryBlue : 'transparent',
                        color: modalFormData.isCustomSection ? '#FFFFFF' : '#64748B',
                        boxShadow: modalFormData.isCustomSection ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + Type New Parent
                    </button>
                  </div>
                </div>

                {!modalFormData.isCustomSection ? (
                  <select
                    value={modalFormData.section || (categorySections[0]?.title || categorySections[0]?.name || 'Civil & Interiors')}
                    onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    {categorySections.map((sec) => (
                      <option key={sec.id} value={sec.title || sec.name}>
                        {sec.title || sec.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Type new parent category name (e.g. Roofing & Insulation, Sanitaryware)"
                    value={modalFormData.section || ''}
                    onChange={(e) => setModalFormData({ ...modalFormData, section: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1.5px solid #0A0A0A',
                      backgroundColor: '#F8FAFC',
                      fontSize: '0.85rem',
                      color: '#0F172A',
                      fontWeight: 600,
                    }}
                  />
                )}
                <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
                  {modalFormData.isCustomSection
                    ? '✨ Writing a new parent category will automatically register it as a new parent category section.'
                    : 'Select an existing parent category or switch to "+ Type New Parent" to enter a new one.'}
                </div>
              </div>

              {/* Product / Category Image Upload */}
              <ImageUploadField
                label="Category & Product Photo *"
                value={modalFormData.image || ''}
                onChange={(img) => setModalFormData({ ...modalFormData, image: img })}
              />

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.textDark, marginBottom: '0.35rem' }}>
                  Subcategories (comma separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. OPC 53, PPC, White Cement, Fast Setting"
                  value={modalFormData.subcategoriesText || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, subcategoriesText: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: theme.textDark, marginBottom: '0.35rem' }}>
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of materials in this category..."
                  value={modalFormData.description || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.85rem',
                    resize: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  style={{
                    padding: '0.6rem 1rem',
                    backgroundColor: '#F1F5F9',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#475569',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.25rem',
                    backgroundColor: theme.primaryBlue,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Parent Category Modal */}
      {activeModal === 'add-parent-category' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Add Category
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalFormData({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = (modalFormData.title || modalFormData.name || '').trim();
                if (!title) return;
                const newParent = {
                  id: `cat_${Date.now()}`,
                  name: title,
                  slug: modalFormData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: modalFormData.description || `Primary category for ${title}`,
                  image: modalFormData.image || '',
                  order: modalFormData.order !== undefined && modalFormData.order !== '' ? Number(modalFormData.order) : 0,
                  isActive: modalFormData.isActive !== undefined ? modalFormData.isActive : true,
                  subcategories: [],
                  createdOn: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  lastUpdated: 'Just now',
                };
                addCategory(newParent);
                addToast(`Category "${title}" created successfully`, 'success');
                setActiveModal(null);
                setModalFormData({});
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Circular Upload Area (Centered) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.25rem 0 0.5rem 0' }}>
                <label
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    border: '2px dashed #CBD5E1',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0A0A0A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Local preview
                      const reader = new FileReader();
                      reader.onload = (uploadEv) => {
                        setModalFormData((prev) => ({ ...prev, image: uploadEv.target.result }));
                      };
                      reader.readAsDataURL(file);

                      try {
                        const res = await uploadCloudFile(file, `mistri/categories/${file.name}`);
                        if (res && res.downloadURL) {
                          setModalFormData((prev) => ({ ...prev, image: res.downloadURL }));
                        }
                      } catch (err) {
                        console.warn('Cloud upload fallback to local preview:', err);
                      }
                    }}
                    style={{ display: 'none' }}
                  />

                  {modalFormData.image ? (
                    <img
                      src={modalFormData.image}
                      alt="Category icon preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={26} color="#94A3B8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                        Upload
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Laptops"
                  value={modalFormData.title || modalFormData.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setModalFormData({
                      ...modalFormData,
                      title: val,
                      name: val,
                      slug: autoSlug,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g., laptops"
                  value={modalFormData.slug || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status and Priority Order (2-Column Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={modalFormData.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setModalFormData({ ...modalFormData, isActive: e.target.value === 'active' })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '6px' }}>
                    Priority Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalFormData.order !== undefined ? modalFormData.order : 0}
                    onChange={(e) => setModalFormData({ ...modalFormData, order: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FFE08A',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setModalFormData({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
                >
                  Create Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2b: Edit Parent Category Modal */}
      {activeModal === 'edit-parent-category' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Edit Category
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalFormData({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = (modalFormData.name || modalFormData.title || '').trim();
                if (!title) return;
                const catId = modalFormData.id || modalFormData.slug;
                updateCategory(catId, {
                  name: title,
                  slug: modalFormData.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                  description: modalFormData.description || '',
                  image: modalFormData.image || '',
                  order: modalFormData.order !== undefined && modalFormData.order !== '' ? Number(modalFormData.order) : 0,
                  isActive: modalFormData.isActive !== undefined ? modalFormData.isActive : true,
                  lastUpdated: 'Just now',
                });
                addToast(`Category "${title}" updated successfully`, 'success');
                setActiveModal(null);
                setModalFormData({});
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Circular Upload Area (Centered) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.25rem 0 0.5rem 0' }}>
                <label
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    border: '2px dashed #CBD5E1',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0A0A0A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Local preview
                      const reader = new FileReader();
                      reader.onload = (uploadEv) => {
                        setModalFormData((prev) => ({ ...prev, image: uploadEv.target.result }));
                      };
                      reader.readAsDataURL(file);

                      try {
                        const res = await uploadCloudFile(file, `mistri/categories/${file.name}`);
                        if (res && res.downloadURL) {
                          setModalFormData((prev) => ({ ...prev, image: res.downloadURL }));
                        }
                      } catch (err) {
                        console.warn('Cloud upload fallback to local preview:', err);
                      }
                    }}
                    style={{ display: 'none' }}
                  />

                  {modalFormData.image ? (
                    <img
                      src={modalFormData.image}
                      alt="Category icon preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={26} color="#94A3B8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                        Upload
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Laptops"
                  value={modalFormData.name || modalFormData.title || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalFormData({
                      ...modalFormData,
                      name: val,
                      title: val,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g., laptops"
                  value={modalFormData.slug || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status and Priority Order (2-Column Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={modalFormData.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setModalFormData({ ...modalFormData, isActive: e.target.value === 'active' })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '6px' }}>
                    Priority Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalFormData.order !== undefined ? modalFormData.order : 0}
                    onChange={(e) => setModalFormData({ ...modalFormData, order: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FFE08A',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setModalFormData({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Add Sub Category Modal (Matches Reference Image) */}
      {activeModal === 'add-sub-category' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Add Subcategory
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalFormData({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const subName = (modalFormData.subName || modalFormData.name || '').trim();
                const catId = modalFormData.categoryId || (categories[0] && (categories[0].id || categories[0].slug));
                if (!subName || !catId) {
                  addToast('Please select a parent category and enter a subcategory name', 'warning');
                  return;
                }

                addSubCategory(catId, subName, modalFormData.image || '');
                setActiveModal(null);
                setModalFormData({});
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Circular Upload Area (Centered) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.25rem 0 0.5rem 0' }}>
                <label
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    border: '2px dashed #CBD5E1',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0A0A0A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Local preview
                      const reader = new FileReader();
                      reader.onload = (uploadEv) => {
                        setModalFormData((prev) => ({ ...prev, image: uploadEv.target.result }));
                      };
                      reader.readAsDataURL(file);

                      try {
                        const res = await uploadCloudFile(file, `mistri/subcategories/${file.name}`);
                        if (res && res.downloadURL) {
                          setModalFormData((prev) => ({ ...prev, image: res.downloadURL }));
                        }
                      } catch (err) {
                        console.warn('Cloud upload fallback to local preview:', err);
                      }
                    }}
                    style={{ display: 'none' }}
                  />

                  {modalFormData.image ? (
                    <img
                      src={modalFormData.image}
                      alt="Subcategory icon preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={26} color="#94A3B8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                        Upload
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Parent Category Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Parent category
                </label>
                <select
                  required
                  value={modalFormData.categoryId || (categories[0] && (categories[0].id || categories[0].slug)) || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select parent category</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Gaming Laptops"
                  value={modalFormData.subName || modalFormData.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const autoSlug = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                    setModalFormData({
                      ...modalFormData,
                      subName: val,
                      name: val,
                      slug: autoSlug,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g., gaming-laptops"
                  value={modalFormData.slug || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status and Priority Order (2-Column Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={modalFormData.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setModalFormData({ ...modalFormData, isActive: e.target.value === 'active' })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '6px' }}>
                    Priority Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalFormData.order !== undefined ? modalFormData.order : 0}
                    onChange={(e) => setModalFormData({ ...modalFormData, order: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FFE08A',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setModalFormData({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
                >
                  Create Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3b: Edit Sub Category Modal */}
      {activeModal === 'edit-sub-category' && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '460px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
            maxHeight: '90vh',
            overflowY: 'auto',
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Edit Subcategory
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  setModalFormData({});
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: '4px', display: 'flex', alignItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newName = (modalFormData.subName || modalFormData.name || '').trim();
                const catId = modalFormData.categoryId;
                const oldName = modalFormData.oldName || newName;
                if (!newName || !catId) return;

                updateSubCategory(catId, oldName, newName, modalFormData.image || null);
                addToast(`Subcategory "${newName}" updated successfully`, 'success');
                setActiveModal(null);
                setModalFormData({});
              }}
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.15rem' }}
            >
              {/* Circular Upload Area (Centered) */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0.25rem 0 0.5rem 0' }}>
                <label
                  style={{
                    width: '88px',
                    height: '88px',
                    borderRadius: '50%',
                    border: '2px dashed #CBD5E1',
                    backgroundColor: '#FAFAFA',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0A0A0A')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#CBD5E1')}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      // Local preview
                      const reader = new FileReader();
                      reader.onload = (uploadEv) => {
                        setModalFormData((prev) => ({ ...prev, image: uploadEv.target.result }));
                      };
                      reader.readAsDataURL(file);

                      try {
                        const res = await uploadCloudFile(file, `mistri/subcategories/${file.name}`);
                        if (res && res.downloadURL) {
                          setModalFormData((prev) => ({ ...prev, image: res.downloadURL }));
                        }
                      } catch (err) {
                        console.warn('Cloud upload fallback to local preview:', err);
                      }
                    }}
                    style={{ display: 'none' }}
                  />

                  {modalFormData.image ? (
                    <img
                      src={modalFormData.image}
                      alt="Subcategory icon preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                    />
                  ) : (
                    <>
                      <ImageIcon size={26} color="#94A3B8" />
                      <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                        Upload
                      </span>
                    </>
                  )}
                </label>
              </div>

              {/* Parent Category Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Parent category
                </label>
                <select
                  required
                  value={modalFormData.categoryId || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, categoryId: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    backgroundColor: '#FFFFFF',
                    outline: 'none',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  <option value="">Select parent category</option>
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Name Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Gaming Laptops"
                  value={modalFormData.subName || modalFormData.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setModalFormData({
                      ...modalFormData,
                      subName: val,
                      name: val,
                    });
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Slug Field */}
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                  Slug
                </label>
                <input
                  type="text"
                  placeholder="e.g., gaming-laptops"
                  value={modalFormData.slug || ''}
                  onChange={(e) => setModalFormData({ ...modalFormData, slug: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#111827',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Status and Priority Order (2-Column Grid) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#111827', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={modalFormData.isActive !== false ? 'active' : 'inactive'}
                    onChange={(e) => setModalFormData({ ...modalFormData, isActive: e.target.value === 'active' })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.875rem',
                      color: '#111827',
                      backgroundColor: '#FFFFFF',
                      outline: 'none',
                      cursor: 'pointer',
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#0A0A0A', marginBottom: '6px' }}>
                    Priority Order
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalFormData.order !== undefined ? modalFormData.order : 0}
                    onChange={(e) => setModalFormData({ ...modalFormData, order: Number(e.target.value) })}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1.5px solid #FFE08A',
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: '#0A0A0A',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setModalFormData({});
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4B5563',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262626')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Create / Edit Master Product Modal (Image 2 Reference) */}
      {(activeModal === 'create-product' || activeModal === 'edit-product') && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }}>
          <div className="admin-product-modal-container" style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '860px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            maxHeight: '92vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFFFFF',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(15,23,42,0.2)',
                }}>
                  <Package size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                    {activeModal === 'edit-product' ? 'Edit Master Product' : 'Create Product'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      letterSpacing: '0.04em',
                      backgroundColor: '#F1F5F9',
                      color: '#475569',
                      padding: '1px 6px',
                      borderRadius: '4px',
                    }}>
                      SYSTEM
                    </span>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>›</span>
                    <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>
                      MASTER CATALOG - {activeModal === 'edit-product' ? 'EDIT' : 'NEW'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#94A3B8',
                  padding: '4px',
                  borderRadius: '6px',
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Stats Top Strip */}
            <div className="admin-product-quick-strip" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 2fr',
              gap: '12px',
              padding: '0.65rem 1.5rem',
              backgroundColor: '#FFFFFF',
              borderBottom: '1px solid #E2E8F0',
              fontSize: '0.75rem',
            }}>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>VARIANTS</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                  {(Number(productFormData.price) > 0 || (productFormData.unit && productFormData.unit.trim())) ? '1' : '0'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SELL PRICES</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>
                  {productFormData.price !== '' && productFormData.price !== undefined && !isNaN(productFormData.price) && Number(productFormData.price) > 0
                    ? `₹${Number(productFormData.price).toLocaleString('en-IN')}`
                    : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>HUB STOCK (H)</div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: theme.primaryBlue, marginTop: '2px' }}>
                  {productFormData.stockCount !== '' && productFormData.stockCount !== undefined && !isNaN(productFormData.stockCount) && Number(productFormData.stockCount) >= 0
                    ? Number(productFormData.stockCount).toLocaleString('en-IN')
                    : '—'}
                </div>
              </div>
              <div style={{ borderLeft: '1px solid #E2E8F0', paddingLeft: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>TIP</div>
                <div style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>Set price & stock on each variant row below.</div>
              </div>
            </div>

            {/* Modal Body with 2-Column Tabs Layout */}
            <div className="admin-product-modal-body" style={{ display: 'flex', flex: 1, minHeight: '380px', maxHeight: '520px', overflow: 'hidden' }}>
              {/* Left Tabs Navigation */}
              <div className="admin-product-modal-tabs" style={{
                width: '210px',
                backgroundColor: '#F8FAFC',
                borderRight: '1px solid #E2E8F0',
                padding: '1.25rem 0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                flexShrink: 0,
              }}>
                {[
                  { id: 'general', label: 'General Info', icon: Tag },
                  { id: 'categories', label: 'Categories', icon: Layers },
                  { id: 'variants', label: 'Variants & pricing', icon: FileText },
                  { id: 'badges', label: 'Offers & Badges', icon: Gift },
                  { id: 'photos', label: 'Photos', icon: ImageIcon },
                ].map((t) => {
                  const Icon = t.icon;
                  const isTabActive = productModalTab === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setProductModalTab(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: isTabActive ? '#FFFFFF' : 'transparent',
                        color: isTabActive ? '#0A0A0A' : '#475569',
                        fontWeight: isTabActive ? 800 : 600,
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        boxShadow: isTabActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon size={16} color={isTabActive ? '#FFB800' : '#64748B'} />
                      <span>{t.label}</span>
                    </button>
                  );
                })}

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #E2E8F0' }}>
                  {/* Status Dropdown */}
                  <div>
                    <label style={{ fontSize: '0.68rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                      STATUS
                    </label>
                    <select
                      value={productFormData.status || 'PUBLISHED'}
                      onChange={(e) => setProductFormData({ ...productFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.45rem 0.65rem',
                        borderRadius: '8px',
                        backgroundColor: productFormData.status === 'PUBLISHED' ? '#FFF8E1' : '#F1F5F9',
                        border: productFormData.status === 'PUBLISHED' ? '1px solid #FFB800' : '1px solid #CBD5E1',
                        color: productFormData.status === 'PUBLISHED' ? '#0A0A0A' : '#334155',
                        fontWeight: 800,
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="PUBLISHED">PUBLISHED</option>
                      <option value="DRAFT">DRAFT</option>
                      <option value="OUT_OF_STOCK">OUT OF STOCK</option>
                    </select>
                  </div>

                  {/* Featured Checkbox */}
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#475569', letterSpacing: '0.04em' }}>FEATURED</span>
                    <input
                      type="checkbox"
                      checked={!!productFormData.isFeatured}
                      onChange={(e) => setProductFormData({ ...productFormData, isFeatured: e.target.checked })}
                      style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: theme.primaryBlue }}
                    />
                  </label>
                </div>
              </div>

              {/* Right Content Form Area */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
                {/* 1. General Info Tab */}
                {productModalTab === 'general' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                        PRODUCT TITLE *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UltraTech Super PPC Cement 50kg, Tata Tiscon TMT Rebars"
                        value={productFormData.name || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setProductFormData({
                            ...productFormData,
                            name: val,
                            slug: val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
                          });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          fontSize: '0.88rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                      <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                        Slug is auto-generated from the product name on save.
                      </div>
                    </div>

                    {/* Instruction Alert Callout */}
                    <div style={{
                      backgroundColor: '#FFF8E1',
                      border: '1px solid #FFE08A',
                      borderRadius: '8px',
                      padding: '0.75rem 1rem',
                      color: '#0A0A0A',
                      fontSize: '0.78rem',
                      lineHeight: 1.45,
                    }}>
                      Complete <strong>Categories</strong>, then add <strong>Variants & pricing</strong> (sell price + hub stock per size/unit on master catalog).
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                        ABOUT THIS ITEM
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Describe the item here..."
                        value={productFormData.description || ''}
                        onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          fontSize: '0.85rem',
                          color: '#0F172A',
                          outline: 'none',
                          resize: 'vertical',
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                        BRAND NAME
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. UltraTech, Tata Tiscon, Asian Paints, Kajaria, Astral"
                        value={productFormData.brand || ''}
                        onChange={(e) => setProductFormData({ ...productFormData, brand: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '8px',
                          border: '1px solid #E2E8F0',
                          backgroundColor: '#F8FAFC',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                          color: '#0F172A',
                          outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* 2. Categories Tab (Only Parent Category and Sub Category) */}
                {productModalTab === 'categories' && (() => {
                  const activeCatObj = categories.find(
                    (c) => c.name === productFormData.category || c.slug === productFormData.categorySlug
                  );
                  const availableSubs = activeCatObj && Array.isArray(activeCatObj.subcategories) ? activeCatObj.subcategories : [];

                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {/* 1. Parent Category */}
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '6px' }}>
                          PARENT CATEGORY *
                        </label>
                        <select
                          value={productFormData.category || ''}
                          onChange={(e) => {
                            const catName = e.target.value;
                            const found = categories.find((c) => c.name === catName);
                            const subs = found && Array.isArray(found.subcategories) ? found.subcategories : [];
                            setProductFormData({
                              ...productFormData,
                              category: catName,
                              categorySlug: found ? found.slug : catName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                              section: found?.section || found?.sectionName || 'Civil & Interiors',
                              subcategory: subs.length > 0 ? subs[0] : '',
                            });
                          }}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: '#F8FAFC',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: '#0F172A',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="">-- Select Parent Category --</option>
                          {categories.map((c) => (
                            <option key={c.id || c.slug} value={c.name}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 2. Sub Category with Dropdown & Scrollable Selector */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            SUB CATEGORY *
                          </label>
                          {availableSubs.length > 0 && (
                            <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                              {availableSubs.length} subcategories available
                            </span>
                          )}
                        </div>

                        {/* Select Dropdown */}
                        <select
                          value={productFormData.subcategory || ''}
                          disabled={!productFormData.category}
                          onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                          style={{
                            width: '100%',
                            padding: '0.65rem 0.85rem',
                            borderRadius: '8px',
                            border: '1px solid #E2E8F0',
                            backgroundColor: productFormData.category ? '#F8FAFC' : '#F1F5F9',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            color: productFormData.category ? '#0F172A' : '#94A3B8',
                            cursor: productFormData.category ? 'pointer' : 'not-allowed',
                            outline: 'none',
                            marginBottom: '8px',
                          }}
                        >
                          <option value="">{productFormData.category ? '-- Select Sub Category --' : '-- Please select a Parent Category first --'}</option>
                          {availableSubs.map((sub, sIdx) => (
                            <option key={sIdx} value={sub}>
                              {sub}
                            </option>
                          ))}
                        </select>

                        {/* Scrollable Subcategory Pill Chips */}
                        {productFormData.category && availableSubs.length > 0 && (
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '8px',
                            padding: '8px',
                            maxHeight: '130px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                          }}>
                            {availableSubs.map((sub, sIdx) => {
                              const isSelected = productFormData.subcategory === sub;
                              return (
                                <button
                                  key={sIdx}
                                  type="button"
                                  onClick={() => setProductFormData({ ...productFormData, subcategory: sub })}
                                  style={{
                                    padding: '5px 10px',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    border: isSelected ? `1.5px solid ${theme.primaryBlue}` : '1px solid #CBD5E1',
                                    backgroundColor: isSelected ? '#FFF8E1' : '#FFFFFF',
                                    color: isSelected ? theme.primaryBlue : '#334155',
                                    transition: 'all 0.15s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                  }}
                                >
                                  {isSelected && <span>✓</span>}
                                  {sub}
                                </button>
                              );
                            })}
                          </div>
                        )}

                        {/* Custom / Exact specification input */}
                        <div style={{ marginTop: '8px' }}>
                          <input
                            type="text"
                            placeholder="Or type custom specification / grade (e.g. OPC 53 Grade, Fe 550D, 600x600mm)"
                            value={productFormData.subcategory || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '0.55rem 0.75rem',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              fontSize: '0.78rem',
                              color: '#334155',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 3. Variants & Pricing Tab */}
                {productModalTab === 'variants' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* MULTI-ATTRIBUTE VARIANT GROUPS (Coil Size, Thickness, Colour, etc.) */}
                    <div style={{ backgroundColor: '#F8FAFC', border: '1.5px solid #E2E8F0', borderRadius: '12px', padding: '1.1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                        <div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>
                            Multi-Attribute Variant Groups
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                            Define multiple attribute dimensions like Coil Size, Wire Thickness, Colour, Finish
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newGroup = {
                              id: `group_${Date.now()}`,
                              name: '',
                              options: [{ label: '', price: '', mrp: '', isPopular: false }],
                            };
                            setProductFormData({
                              ...productFormData,
                              variantGroups: [...(productFormData.variantGroups || []), newGroup],
                            });
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.45rem 0.85rem',
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '7px',
                            fontSize: '0.75rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          <Plus size={13} /> Add Attribute Group
                        </button>
                      </div>

                      {(productFormData.variantGroups || []).length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem', color: '#94A3B8', fontSize: '0.78rem' }}>
                          No multi-attribute groups yet. Click <strong>+ Add Attribute Group</strong> to add Coil Size, Thickness, Colour, etc.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {(productFormData.variantGroups || []).map((group, gIdx) => {
                            const updateGroupName = (val) => {
                              const updated = [...productFormData.variantGroups];
                              updated[gIdx] = { ...updated[gIdx], name: val };
                              setProductFormData({ ...productFormData, variantGroups: updated });
                            };
                            const removeGroup = () => {
                              const updated = productFormData.variantGroups.filter((_, i) => i !== gIdx);
                              setProductFormData({ ...productFormData, variantGroups: updated });
                            };
                            const addOptionToGroup = () => {
                              const updated = [...productFormData.variantGroups];
                              const currentOptions = updated[gIdx].options || [];
                              updated[gIdx] = {
                                ...updated[gIdx],
                                options: [...currentOptions, { label: '', price: '', mrp: '', isPopular: false }],
                              };
                              setProductFormData({ ...productFormData, variantGroups: updated });
                            };
                            const updateGroupOption = (oIdx, field, val) => {
                              const updated = [...productFormData.variantGroups];
                              const currentOptions = [...(updated[gIdx].options || [])];
                              currentOptions[oIdx] = { ...currentOptions[oIdx], [field]: val };
                              updated[gIdx] = { ...updated[gIdx], options: currentOptions };
                              setProductFormData({ ...productFormData, variantGroups: updated });
                            };
                            const removeGroupOption = (oIdx) => {
                              const updated = [...productFormData.variantGroups];
                              const currentOptions = (updated[gIdx].options || []).filter((_, i) => i !== oIdx);
                              updated[gIdx] = { ...updated[gIdx], options: currentOptions };
                              setProductFormData({ ...productFormData, variantGroups: updated });
                            };

                            return (
                              <div
                                key={group.id || gIdx}
                                style={{
                                  backgroundColor: '#FFFFFF',
                                  border: '1px solid #CBD5E1',
                                  borderRadius: '10px',
                                  padding: '0.9rem',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.75rem',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                                  <input
                                    type="text"
                                    placeholder="Group Name (e.g. Coil Size, Wire Thickness, Colour)"
                                    value={group.name || ''}
                                    onChange={(e) => updateGroupName(e.target.value)}
                                    style={{
                                      flex: 1,
                                      padding: '0.5rem 0.75rem',
                                      borderRadius: '6px',
                                      border: '1.5px solid #CBD5E1',
                                      fontSize: '0.82rem',
                                      fontWeight: 800,
                                      color: '#0F172A',
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={removeGroup}
                                    style={{
                                      padding: '4px 8px',
                                      backgroundColor: '#F2F2F2',
                                      color: '#0A0A0A',
                                      border: '1px solid #E5E7EB',
                                      borderRadius: '6px',
                                      fontSize: '0.7rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <label style={{ fontSize: '0.7rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>
                                    Options in this group:
                                  </label>
                                  {(group.options || []).map((opt, oIdx) => (
                                    <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                      <input
                                        type="text"
                                        placeholder="e.g. 90 Meters, 1 Sqmm, Red"
                                        value={opt.label || ''}
                                        onChange={(e) => updateGroupOption(oIdx, 'label', e.target.value)}
                                        style={{
                                          flex: 2,
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '6px',
                                          border: '1px solid #E2E8F0',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                        }}
                                      />
                                      <input
                                        type="number"
                                        placeholder="Price (₹)"
                                        value={opt.price || ''}
                                        onChange={(e) => updateGroupOption(oIdx, 'price', e.target.value)}
                                        style={{
                                          width: '90px',
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '6px',
                                          border: '1px solid #E2E8F0',
                                          fontSize: '0.8rem',
                                          fontWeight: 700,
                                          color: '#0A0A0A',
                                        }}
                                        title="Optional override price when this option is chosen"
                                      />
                                      <input
                                        type="number"
                                        placeholder="MRP (₹)"
                                        value={opt.mrp || ''}
                                        onChange={(e) => updateGroupOption(oIdx, 'mrp', e.target.value)}
                                        style={{
                                          width: '90px',
                                          padding: '0.45rem 0.65rem',
                                          borderRadius: '6px',
                                          border: '1px solid #E2E8F0',
                                          fontSize: '0.8rem',
                                          fontWeight: 600,
                                          color: '#64748B',
                                        }}
                                        title="Optional MRP override"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeGroupOption(oIdx)}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          color: '#94A3B8',
                                          cursor: 'pointer',
                                          padding: '4px',
                                        }}
                                      >
                                        <X size={14} />
                                      </button>
                                    </div>
                                  ))}

                                  <button
                                    type="button"
                                    onClick={addOptionToGroup}
                                    style={{
                                      alignSelf: 'flex-start',
                                      marginTop: '4px',
                                      padding: '4px 10px',
                                      backgroundColor: '#F1F5F9',
                                      color: '#334155',
                                      border: '1px solid #E2E8F0',
                                      borderRadius: '6px',
                                      fontSize: '0.72rem',
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                    }}
                                  >
                                    <Plus size={11} style={{ marginRight: '4px' }} /> Add Option
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* SINGLE / PACK VARIANTS (Standard Flat Variants) */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A' }}>Single Pack / Unit Variants</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                          {(productFormData.variants || []).length === 0
                            ? 'No single variants defined'
                            : `${(productFormData.variants || []).length} flat variant(s) defined`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const newVariant = { label: '', unit: productFormData.unit || '', price: productFormData.price || '', mrp: productFormData.mrp || '', stockCount: productFormData.stockCount || 500, minOrderQty: 1 };
                          setProductFormData({ ...productFormData, variants: [...(productFormData.variants || []), newVariant] });
                        }}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '0.45rem 0.85rem',
                          backgroundColor: '#0F172A',
                          color: '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          cursor: 'pointer',
                          letterSpacing: '0.03em',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Plus size={13} /> Add Single Variant
                      </button>
                    </div>

                    {/* Variant cards */}
                    {(productFormData.variants || []).map((variant, vIdx) => {
                      const margin = Math.max(0, (Number(variant.mrp) || 0) - (Number(variant.price) || 0));
                      const discPct = variant.mrp && Number(variant.mrp) > 0 ? Math.round((margin / Number(variant.mrp)) * 100) : 0;
                      const updateVariant = (field, val) => {
                        const updated = (productFormData.variants || []).map((v, i) => i === vIdx ? { ...v, [field]: val } : v);
                        setProductFormData({ ...productFormData, variants: updated });
                      };
                      const removeVariant = () => {
                        const updated = (productFormData.variants || []).filter((_, i) => i !== vIdx);
                        setProductFormData({ ...productFormData, variants: updated });
                      };
                      return (
                        <div
                          key={vIdx}
                          style={{
                            border: '1.5px solid #E2E8F0',
                            borderRadius: '12px',
                            padding: '1rem',
                            backgroundColor: '#FFFFFF',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.85rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                            position: 'relative',
                          }}
                        >
                          {/* Card header */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Variant {vIdx + 1}</span>
                            <button
                              type="button"
                              onClick={removeVariant}
                              title="Remove variant"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                padding: '3px 8px',
                                backgroundColor: '#F2F2F2',
                                color: '#0A0A0A',
                                border: '1px solid #E5E7EB',
                                borderRadius: '6px',
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                              }}
                            >
                              <Trash2 size={11} /> Remove
                            </button>
                          </div>

                          {/* Variant label */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>
                              VARIANT LABEL
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 50kg Bag, 1 Ton Bundle, Small Pack"
                              value={variant.label || ''}
                              onChange={(e) => updateVariant('label', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                          </div>

                          {/* Unit */}
                          <div>
                            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>
                              UNIT / PACKAGING
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 50kg Bag, Pcs, Sq.Ft, Litre"
                              value={variant.unit || ''}
                              onChange={(e) => updateVariant('unit', e.target.value)}
                              style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.85rem', fontWeight: 600, color: '#0F172A', boxSizing: 'border-box' }}
                            />
                          </div>

                          {/* Price & MRP */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>PRICE (₹) *</label>
                              <input
                                type="number"
                                placeholder="e.g. 375"
                                value={variant.price || ''}
                                onChange={(e) => updateVariant('price', e.target.value)}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.9rem', fontWeight: 800, color: '#0A0A0A', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>MRP (₹)</label>
                              <input
                                type="number"
                                placeholder="e.g. 420"
                                value={variant.mrp || ''}
                                onChange={(e) => updateVariant('mrp', e.target.value)}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.9rem', fontWeight: 700, color: '#64748B', boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>

                          {/* Stock & MOQ */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>STOCK (UNITS)</label>
                              <input
                                type="number"
                                placeholder="e.g. 500"
                                value={variant.stockCount !== undefined ? variant.stockCount : ''}
                                onChange={(e) => updateVariant('stockCount', e.target.value)}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.9rem', fontWeight: 700, color: '#0A0A0A', boxSizing: 'border-box' }}
                              />
                            </div>
                            <div>
                              <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '5px' }}>MOQ</label>
                              <input
                                type="number"
                                min="1"
                                placeholder="e.g. 1"
                                value={variant.minOrderQty || 1}
                                onChange={(e) => updateVariant('minOrderQty', Number(e.target.value))}
                                style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', fontSize: '0.9rem', fontWeight: 700, boxSizing: 'border-box' }}
                              />
                            </div>
                          </div>

                          {/* Margin badge */}
                          {variant.price && Number(variant.price) > 0 && (
                            <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', backgroundColor: '#F2F2F2', border: '1px solid #E5E7EB', color: '#0A0A0A', fontWeight: 700, fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>₹{margin} margin</span>
                              <span style={{ fontSize: '0.75rem', color: '#0A0A0A' }}>{discPct}% off MRP</span>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Add another variant shortcut at bottom */}
                    {(productFormData.variants || []).length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          const newVariant = { label: '', unit: '', price: '', mrp: '', stockCount: 500, minOrderQty: 1 };
                          setProductFormData({ ...productFormData, variants: [...(productFormData.variants || []), newVariant] });
                        }}
                        style={{
                          width: '100%',
                          padding: '0.65rem',
                          border: '1.5px dashed #CBD5E1',
                          borderRadius: '10px',
                          backgroundColor: '#F8FAFC',
                          color: '#475569',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          transition: 'background 0.15s',
                        }}
                      >
                        <Plus size={14} /> Add Another Variant
                      </button>
                    )}

                  </div>
                )}

                {/* 4. Offers & Badges Tab */}
                {productModalTab === 'badges' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Assured Cashback Box */}
                    <div style={{ backgroundColor: '#FFF8E1', border: '1px solid #FFF8E1', borderLeft: '3.5px solid #FFB800', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Gift size={16} color="#FFB800" /> Assured Cashback Banner
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Cashback Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Assured 2% Cashback"
                            value={productFormData.cashbackTitle || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, cashbackTitle: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 700 }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', marginBottom: '4px' }}>
                            Cashback Subtitle / Condition
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. On purchases above ₹50,000"
                            value={productFormData.cashbackSubtitle || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, cashbackSubtitle: e.target.value })}
                            style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.82rem', fontWeight: 600 }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                        Trust & Policy Badges (3-Column Grid)
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>Badge 1 (Authenticity)</label>
                          <input
                            type="text"
                            placeholder="Title (100%)"
                            value={productFormData.trustBadge1Title || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, trustBadge1Title: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}
                          />
                          <input
                            type="text"
                            placeholder="Subtitle (Genuine)"
                            value={productFormData.trustBadge1Sub || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, trustBadge1Sub: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>Badge 2 (Return Policy)</label>
                          <input
                            type="text"
                            placeholder="Title (Non / 7 Days)"
                            value={productFormData.returnPolicyTitle || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, returnPolicyTitle: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}
                          />
                          <input
                            type="text"
                            placeholder="Subtitle (Returnable)"
                            value={productFormData.returnPolicySub || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, returnPolicySub: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 800, color: '#64748B', marginBottom: '4px' }}>Badge 3 (Replacement)</label>
                          <input
                            type="text"
                            placeholder="Title (7 Day)"
                            value={productFormData.replacementPolicyTitle || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, replacementPolicyTitle: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem', fontWeight: 700, marginBottom: '4px' }}
                          />
                          <input
                            type="text"
                            placeholder="Subtitle (Replacement)"
                            value={productFormData.replacementPolicySub || ''}
                            onChange={(e) => setProductFormData({ ...productFormData, replacementPolicySub: e.target.value })}
                            style={{ width: '100%', padding: '0.45rem 0.65rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontSize: '0.8rem' }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Product Highlights & Quick Answer */}
                    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                        Product Info Accordion: Quick Answer & Highlights
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '8px' }}>
                        Shown inside the expandable "Product Info" section on product details page.
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Quick Answer summary (e.g. Finolex Silver FR Wire is a flame retardant electrical wire, designed for residential and commercial wiring with fire safety features...)"
                        value={productFormData.quickAnswer || ''}
                        onChange={(e) => setProductFormData({ ...productFormData, quickAnswer: e.target.value })}
                        style={{ width: '100%', padding: '0.6rem 0.8rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.82rem', lineHeight: 1.5, boxSizing: 'border-box' }}
                      />
                    </div>

                  </div>
                )}

                {/* 4. Photos Tab */}
                {productModalTab === 'photos' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Primary Image */}
                    <ImageUploadField
                      label="Primary Product Photo *"
                      value={productFormData.image || ''}
                      onChange={(img) => setProductFormData({ ...productFormData, image: img })}
                    />

                    {/* Gallery Images */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', display: 'block' }}>Additional Gallery Photos</label>
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>Add multiple product images shown in a gallery ({(productFormData.gallery || []).length} added)</span>
                        </div>
                        <label
                          htmlFor="gallery-upload-input"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0.45rem 0.9rem',
                            backgroundColor: '#0F172A',
                            color: '#FFFFFF',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            letterSpacing: '0.03em',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          <UploadCloud size={14} /> Add Photos
                        </label>
                        <input
                          id="gallery-upload-input"
                          type="file"
                          accept="image/*"
                          multiple
                          style={{ display: 'none' }}
                          onChange={async (e) => {
                            const files = Array.from(e.target.files || []);
                            if (!files.length) return;
                            const newGallery = [...(productFormData.gallery || [])];
                            for (const file of files) {
                              if (file.size > 10 * 1024 * 1024) {
                                addToast(`"${file.name}" exceeds 10MB limit, skipped.`, 'warning');
                                continue;
                              }
                              try {
                                const result = await uploadCloudFile(file, `mistri/products/${Date.now()}_${file.name}`);
                                if (result && result.downloadURL) {
                                  newGallery.push(result.downloadURL);
                                } else {
                                  // fallback to base64 preview
                                  await new Promise((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => { newGallery.push(ev.target.result); resolve(); };
                                    reader.readAsDataURL(file);
                                  });
                                }
                              } catch {
                                await new Promise((resolve) => {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => { newGallery.push(ev.target.result); resolve(); };
                                  reader.readAsDataURL(file);
                                });
                              }
                            }
                            setProductFormData({ ...productFormData, gallery: newGallery });
                            addToast(`${files.length} photo(s) added to gallery`, 'success');
                            e.target.value = '';
                          }}
                        />
                      </div>

                      {/* Gallery Grid */}
                      {(productFormData.gallery || []).length === 0 ? (
                        <div style={{
                          border: '1.5px dashed #CBD5E1',
                          borderRadius: '12px',
                          padding: '2rem',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          color: '#94A3B8',
                          backgroundColor: '#F8FAFC',
                        }}>
                          <ImageIcon size={28} style={{ opacity: 0.4 }} />
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>No additional photos yet</span>
                          <span style={{ fontSize: '0.72rem' }}>Click "Add Photos" to upload multiple images</span>
                        </div>
                      ) : (
                        <div style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
                          gap: '10px',
                        }}>
                          {(productFormData.gallery || []).map((imgUrl, gIdx) => (
                            <div
                              key={gIdx}
                              style={{
                                position: 'relative',
                                borderRadius: '10px',
                                overflow: 'hidden',
                                border: '1.5px solid #E2E8F0',
                                backgroundColor: '#0F172A',
                                aspectRatio: '1 / 1',
                              }}
                            >
                              <img
                                src={imgUrl}
                                alt={`Gallery ${gIdx + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                              />
                              {/* Set as Primary button */}
                              <button
                                type="button"
                                title="Set as primary photo"
                                onClick={() => {
                                  const oldPrimary = productFormData.image;
                                  const newGallery = (productFormData.gallery || []).filter((_, i) => i !== gIdx);
                                  if (oldPrimary) newGallery.unshift(oldPrimary);
                                  setProductFormData({ ...productFormData, image: imgUrl, gallery: newGallery });
                                  addToast('Set as primary photo', 'success');
                                }}
                                style={{
                                  position: 'absolute',
                                  bottom: '4px',
                                  left: '4px',
                                  backgroundColor: 'rgba(15,23,42,0.75)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '5px',
                                  fontSize: '0.6rem',
                                  fontWeight: 700,
                                  padding: '2px 5px',
                                  cursor: 'pointer',
                                  backdropFilter: 'blur(2px)',
                                  letterSpacing: '0.02em',
                                }}
                              >
                                ★ Main
                              </button>
                              {/* Remove button */}
                              <button
                                type="button"
                                title="Remove photo"
                                onClick={() => {
                                  const newGallery = (productFormData.gallery || []).filter((_, i) => i !== gIdx);
                                  setProductFormData({ ...productFormData, gallery: newGallery });
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  backgroundColor: 'rgba(0,0,0,0.85)',
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '22px',
                                  height: '22px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: 900,
                                  lineHeight: 1,
                                  backdropFilter: 'blur(2px)',
                                }}
                              >
                                ×
                              </button>
                              {/* Index badge */}
                              <div style={{
                                position: 'absolute',
                                top: '4px',
                                left: '4px',
                                backgroundColor: 'rgba(15,23,42,0.6)',
                                color: '#CBD5E1',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                padding: '1px 5px',
                                borderRadius: '4px',
                              }}>
                                {gIdx + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '0.85rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#FFFFFF',
            }}>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                style={{
                  padding: '0.6rem 1.25rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                CLOSE
              </button>

              {productModalTab !== 'photos' ? (
                <button
                  type="button"
                  onClick={() => {
                    const order = ['general', 'categories', 'variants', 'badges', 'photos'];
                    const curIdx = order.indexOf(productModalTab);
                    if (curIdx < order.length - 1) setProductModalTab(order[curIdx + 1]);
                  }}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.25)',
                  }}
                >
                  NEXT
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSaveProduct}
                  style={{
                    padding: '0.6rem 1.5rem',
                    backgroundColor: '#0F172A',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    boxShadow: '0 2px 6px rgba(15,23,42,0.25)',
                  }}
                >
                  {activeModal === 'edit-product' ? 'SAVE CHANGES' : 'PUBLISH TO CATALOG'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick Navigation Bar (Mobile only) */}
      <nav className="admin-mobile-bottom-nav">
        <button
          type="button"
          className={`admin-mob-nav-item ${adminActiveTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </button>
        <button
          type="button"
          className={`admin-mob-nav-item ${adminActiveTab === 'orders' ? 'active' : ''}`}
          onClick={() => handleTabChange('orders')}
        >
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <Truck size={19} />
            {orders.length > 0 && (
              <span className="admin-mob-badge">
                {orders.length}
              </span>
            )}
          </div>
          <span>Orders</span>
        </button>
        <button
          type="button"
          className={`admin-mob-nav-item ${adminActiveTab === 'products' ? 'active' : ''}`}
          onClick={() => handleTabChange('products')}
        >
          <Package size={19} />
          <span>Products</span>
        </button>
        <button
          type="button"
          className={`admin-mob-nav-item ${isCategoryTab ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          <Layers size={19} />
          <span>Categories</span>
        </button>
        <button
          type="button"
          className="admin-mob-nav-item"
          onClick={() => setIsMobileDrawerOpen(true)}
        >
          <Menu size={19} />
          <span>Menu</span>
        </button>
      </nav>

      {/* Comprehensive Responsive Stylesheet (Keeps Web Desktop 100% Unaltered) */}
      <style>{`
        /* ========================================================= */
        /* BASE DESKTOP DEFAULTS (Web View Unchanged)                */
        /* ========================================================= */
        .admin-mobile-backdrop {
          display: none;
        }
        .admin-mobile-close-btn {
          display: none;
        }
        .admin-mobile-bottom-nav {
          display: none;
        }

        /* Dashboard Grid Layout (Desktop) */
        .admin-dashboard-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 1.25rem;
        }

        /* Categories Split (Desktop) */
        .admin-categories-split {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 1.25rem;
          align-items: flex-start;
        }

        /* KPI and Stat Grids (Desktop) */
        .admin-kpi-grid,
        .admin-products-stats-grid,
        .admin-orders-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
        }

        /* Modal 2-column Grid */
        .admin-modal-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        /* Quick Action Button Interactive */
        .admin-action-btn:hover {
          background-color: #F1F5F9 !important;
          border-color: #CBD5E1 !important;
          transform: translateY(-1px);
        }
        .admin-action-btn:active {
          transform: translateY(0);
        }

        /* ========================================================= */
        /* TABLET & LAPTOP RESPONSIVENESS (<= 1024px)               */
        /* ========================================================= */
        @media (max-width: 1024px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            bottom: 0 !important;
            height: 100vh !important;
            width: 280px !important;
            max-width: 85vw !important;
            z-index: 99999 !important;
            transform: translateX(-100%);
            transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1) !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.35) !important;
          }
          .admin-sidebar.mobile-open {
            transform: translateX(0) !important;
          }
          .admin-mobile-backdrop.active {
            display: block !important;
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.6) !important;
            backdrop-filter: blur(4px) !important;
            -webkit-backdrop-filter: blur(4px) !important;
            z-index: 99998 !important;
          }
          .admin-mobile-close-btn {
            display: flex !important;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 8px;
            background: #E2E8F0;
            border: none;
            color: #475467;
            cursor: pointer;
          }
          /* Categories Split stacks vertically on tablet/mobile */
          .admin-categories-split,
          div[style*="grid-template-columns: 360px 1fr"] {
            grid-template-columns: 1fr !important;
          }
          /* Dashboard stacks gracefully on medium screens */
          .admin-dashboard-grid,
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
        }

        /* ========================================================= */
        /* MOBILE PHONES RESPONSIVENESS (<= 768px)                   */
        /* ========================================================= */
        @media (max-width: 768px) {
          .admin-top-header {
            height: 58px !important;
            padding: 0 10px !important;
          }
          .admin-global-search-container {
            max-width: 140px !important;
            padding: 0.35rem 0.55rem !important;
          }
          .admin-global-search-container input {
            font-size: 0.78rem !important;
          }
          .admin-global-search-container span {
            display: none !important;
          }
          .admin-storefront-btn span {
            display: none !important;
          }
          .admin-storefront-btn {
            padding: 0.45rem !important;
          }
          .admin-main-content {
            padding: 12px 10px 84px 10px !important;
          }
          .admin-mobile-bottom-nav {
            display: flex !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 60px !important;
            background-color: #FFFFFF !important;
            border-top: 1px solid #E5E7EB !important;
            z-index: 9990 !important;
            align-items: center !important;
            justify-content: space-around !important;
            padding: 4px 6px max(4px, env(safe-area-inset-bottom, 4px)) 6px !important;
            box-shadow: 0 -3px 14px rgba(0, 0, 0, 0.08) !important;
          }
          .admin-mob-nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 3px;
            background: none;
            border: none;
            color: #64748B;
            font-size: 0.68rem;
            font-weight: 700;
            padding: 5px 8px;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s ease;
            flex: 1;
          }
          .admin-mob-nav-item.active {
            color: #0A0A0A !important;
            background-color: #FFF8E1 !important;
          }
          .admin-mob-badge {
            position: absolute;
            top: -4px;
            right: -6px;
            background-color: #0A0A0A;
            color: #FFFFFF;
            font-size: 0.6rem;
            font-weight: 800;
            padding: 1px 4px;
            border-radius: 8px;
            line-height: 1;
          }
          /* Dashboard Queue & Quick Actions Stack into 1 Clean Full-Width Column */
          .admin-dashboard-grid,
          div[style*="grid-template-columns: 2fr 1fr"] {
            grid-template-columns: 1fr !important;
            gap: 1rem !important;
          }
          /* Stat Cards grid to 2 columns on mobile */
          .admin-kpi-grid,
          .admin-products-stats-grid,
          .admin-orders-stats-grid,
          div[style*="repeat(auto-fit, minmax(220px, 1fr))"] {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
          }
          div[style*="repeat(auto-fit, minmax(240px, 1fr))"],
          div[style*="repeat(auto-fit, minmax(260px, 1fr))"],
          div[style*="repeat(auto-fit, minmax(320px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          /* Modal 2-column forms stack vertically */
          .admin-modal-grid-2 {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          /* Product Modal Responsive Styles */
          .admin-product-modal-container {
            width: 96% !important;
            max-width: 96vw !important;
            max-height: 94vh !important;
            border-radius: 14px !important;
          }
          .admin-product-modal-body {
            flex-direction: column !important;
            max-height: none !important;
            overflow-y: auto !important;
          }
          .admin-product-modal-tabs {
            width: 100% !important;
            flex-direction: row !important;
            overflow-x: auto !important;
            white-space: nowrap !important;
            border-right: none !important;
            border-bottom: 1px solid #E2E8F0 !important;
            padding: 0.5rem 0.75rem !important;
            gap: 6px !important;
          }
          .admin-product-modal-tabs button {
            flex-shrink: 0 !important;
            padding: 0.45rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
          .admin-product-quick-strip {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px !important;
            padding: 0.6rem 1rem !important;
          }
          /* All modals responsive width */
          div[style*="maxWidth: '680px'"],
          div[style*="maxWidth: '820px'"],
          div[style*="maxWidth: '860px'"],
          div[style*="maxWidth: '540px'"],
          div[style*="maxWidth: '520px'"] {
            width: 95% !important;
            max-width: 95vw !important;
            max-height: 90vh !important;
          }
          /* Notification dropdown on mobile */
          div[style*="width: '360px'"] {
            width: 92vw !important;
            max-width: 360px !important;
            right: -50px !important;
          }
          /* Products Filter Bar on Mobile */
          .admin-products-filter-bar {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .admin-products-filter-bar > div {
            min-width: 100% !important;
            max-width: 100% !important;
          }
          .admin-products-filter-bar select {
            width: 100% !important;
          }
          /* Dispatch Item Spacing on Mobile */
          .admin-dispatch-item {
            padding: 0.75rem 0.85rem !important;
          }
        }

        /* Small Phones (<= 480px) */
        @media (max-width: 480px) {
          .admin-global-search-container {
            display: none !important;
          }
          .admin-kpi-grid,
          .admin-products-stats-grid,
          .admin-orders-stats-grid,
          div[style*="repeat(auto-fit, minmax(220px, 1fr))"] {
            grid-template-columns: 1fr !important;
          }
          .admin-product-quick-strip {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );

  // =============================================================
  // SUB-VIEW RENDERERS
  // =============================================================

  // -------------------------------------------------------------
  // 1. ALL CATEGORIES VIEW (Category Hierarchy 2-Column View matching Reference Image)
  // -------------------------------------------------------------
  function renderCategoriesView() {
    // Parent categories list
    const filteredParents = categories.filter((cat) => {
      const q = hierarchyParentSearch.toLowerCase().trim();
      if (!q) return true;
      return (
        cat.name?.toLowerCase().includes(q) ||
        cat.slug?.toLowerCase().includes(q) ||
        cat.section?.toLowerCase().includes(q)
      );
    });

    const activeParent = selectedHierarchyParent || categories[0] || null;
    const subList = activeParent && Array.isArray(activeParent.subcategories)
      ? activeParent.subcategories.map((subName) => {
          const subImg =
            (activeParent.subcategoryImages && activeParent.subcategoryImages[subName]) ||
            activeParent.image ||
            'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300';
          const skuCount = products.filter(
            (p) =>
              p.categorySlug === activeParent.slug ||
              p.category?.toLowerCase() === activeParent.name?.toLowerCase() ||
              p.name?.toLowerCase().includes(subName.toLowerCase())
          ).length || 6;
          return {
            name: subName,
            image: subImg,
            skuCount,
          };
        })
      : [];

    const totalHierarchyItems = categories.length + allSubCategories.length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* 2-Column Split: Parent categories (Left) & Subcategories (Right) */}
        <div className="admin-categories-split">
          {/* LEFT CARD: Parent categories List */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}>
            {/* Left Header */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                <Grid size={16} color="#475569" /> Parent categories
              </div>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#F1F5F9',
                color: '#475569',
              }}>
                {filteredParents.length}
              </span>
            </div>

            {/* Filter parents search box */}
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #F1F5F9' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.45rem 0.75rem',
                gap: '8px',
              }}>
                <Search size={14} color="#94A3B8" />
                <input
                  type="text"
                  placeholder="Filter parents..."
                  value={hierarchyParentSearch}
                  onChange={(e) => setHierarchyParentSearch(e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.82rem',
                    color: '#0F172A',
                    width: '100%',
                  }}
                />
                {hierarchyParentSearch && (
                  <X size={14} color="#94A3B8" style={{ cursor: 'pointer' }} onClick={() => setHierarchyParentSearch('')} />
                )}
              </div>
            </div>

            {/* Scrollable Parent Items */}
            <div style={{ maxHeight: '560px', overflowY: 'auto' }}>
              {filteredParents.map((cat) => {
                const isSelected = activeParent && (activeParent.id === cat.id || activeParent.slug === cat.slug);
                const subCount = Array.isArray(cat.subcategories) ? cat.subcategories.length : 0;
                return (
                  <div
                    key={cat.id || cat.slug}
                    onClick={() => setSelectedHierarchyParent(cat)}
                    style={{
                      padding: '0.75rem 1.15rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid #F8FAFC',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#F8FAFC' : 'transparent',
                      borderLeft: isSelected ? `3px solid ${theme.primaryBlue}` : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #E2E8F0',
                        flexShrink: 0,
                      }}>
                        <img src={cat.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=200'} alt={cat.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{
                          fontWeight: isSelected ? 800 : 700,
                          color: isSelected ? theme.primaryBlue : '#0F172A',
                          fontSize: '0.84rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {cat.name}
                        </div>
                        <div style={{
                          fontSize: '0.68rem',
                          color: '#64748B',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          marginTop: '2px',
                        }}>
                          {cat.slug ? cat.slug.toUpperCase().replace(/_/g, '-') : 'GENERAL'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                        {subCount}
                      </span>
                      <ChevronRight size={16} color={isSelected ? theme.primaryBlue : '#CBD5E1'} />
                    </div>
                  </div>
                );
              })}

              {filteredParents.length === 0 && (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem' }}>
                  No parent categories match "{hierarchyParentSearch}"
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CARD: Subcategories of selected parent */}
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: '480px',
            overflow: 'hidden',
          }}>
            {/* Right Header with Green Tag Pill */}
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>
                <span style={{ width: '4px', height: '18px', borderRadius: '4px', backgroundColor: '#0A0A0A', display: 'inline-block' }} />
                <Tag size={16} color="#0A0A0A" /> Subcategories
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#F1F5F9',
                  color: '#475569',
                }}>
                  {subList.length}
                </span>

                {activeParent && (
                  <button
                    onClick={() => {
                      setModalFormData({ categoryId: activeParent.id || activeParent.slug });
                      setActiveModal('add-sub-category');
                    }}
                    style={{
                      padding: '0.35rem 0.75rem',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      borderRadius: '6px',
                      color: theme.primaryBlue,
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={13} /> Add Subcategory
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            {!activeParent ? (
              /* Empty State when no parent is selected */
              <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3rem 1.5rem',
                color: '#94A3B8',
              }}>
                <div style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}>
                  <ChevronRight size={32} color="#CBD5E1" />
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#475569' }}>
                  Select a parent category
                </div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>
                  Click on any parent category on the left to view and manage its subcategories
                </div>
              </div>
            ) : (
              /* Selected Parent Content Area */
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                {/* Parent Summary Header Banner */}
                <div style={{
                  padding: '1rem 1.25rem',
                  backgroundColor: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      border: '1px solid #CBD5E1',
                    }}>
                      <img src={activeParent.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=200'} alt={activeParent.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
                        {activeParent.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                        Department: <strong>{activeParent.section || 'Civil & Interiors'}</strong> • {subList.length} subcategories
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => {
                        const newImg = window.prompt(`Enter cover image URL for "${activeParent.name}":`, activeParent.image);
                        if (newImg) updateCategory(activeParent.id || activeParent.slug, { image: newImg });
                      }}
                      style={{
                        padding: '0.4rem 0.75rem',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '6px',
                        color: '#334155',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <UploadCloud size={13} color={theme.primaryBlue} /> Change Cover
                    </button>
                  </div>
                </div>

                {/* Subcategories List / Grid */}
                <div style={{
                  padding: '1.25rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                  gap: '12px',
                  maxHeight: '520px',
                  overflowY: 'auto',
                }}>
                  {subList.map((sub, sIdx) => (
                    <div
                      key={sIdx}
                      style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        padding: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {/* Subcategory Image */}
                      <div style={{
                        position: 'relative',
                        width: '48px',
                        height: '48px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        backgroundColor: '#F1F5F9',
                        border: '1px solid #CBD5E1',
                        flexShrink: 0,
                      }}>
                        <img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.84rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {sub.name}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#0A0A0A', fontWeight: 700, marginTop: '2px' }}>
                          {sub.skuCount} linked items
                        </div>

                        {/* Quick Action Links */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              const newImg = window.prompt(`Update product image URL for subcategory "${sub.name}":`, sub.image);
                              if (newImg !== null) {
                                updateSubCategory(activeParent.id || activeParent.slug, sub.name, sub.name, newImg);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: theme.primaryBlue,
                              fontSize: '0.72rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                          >
                            <UploadCloud size={11} /> Photo
                          </button>
                          <span style={{ color: '#CBD5E1', fontSize: '0.7rem' }}>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              const newName = window.prompt(`Rename subcategory:`, sub.name);
                              if (newName && newName.trim()) {
                                updateSubCategory(activeParent.id || activeParent.slug, sub.name, newName.trim(), sub.image);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#64748B',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Rename
                          </button>
                          <span style={{ color: '#CBD5E1', fontSize: '0.7rem' }}>•</span>
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete subcategory "${sub.name}" from ${activeParent.name}?`)) {
                                deleteSubCategory(activeParent.id || activeParent.slug, sub.name);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0A0A0A',
                              fontSize: '0.72rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                              padding: 0,
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {subList.length === 0 && (
                    <div style={{
                      gridColumn: '1 / -1',
                      padding: '2.5rem 1rem',
                      textAlign: 'center',
                      color: '#94A3B8',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px dashed #CBD5E1',
                    }}>
                      <Tag size={28} style={{ marginBottom: '6px', opacity: 0.5 }} />
                      <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.88rem' }}>No subcategories found in {activeParent.name}</div>
                      <button
                        onClick={() => {
                          setModalFormData({ categoryId: activeParent.id || activeParent.slug });
                          setActiveModal('add-sub-category');
                        }}
                        style={{
                          marginTop: '8px',
                          padding: '0.45rem 1rem',
                          backgroundColor: theme.primaryBlue,
                          color: '#FFFFFF',
                          borderRadius: '8px',
                          border: 'none',
                          fontWeight: 700,
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                        }}
                      >
                        + Add First Subcategory
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. PARENT CATEGORIES VIEW (All Primary Parent Categories - Table Layout)
  // -------------------------------------------------------------
  function renderParentCategoriesView() {
    let filteredParents = categories.filter((cat) => {
      const q = parentCategorySearch.toLowerCase().trim();
      const matchQuery =
        !q ||
        (cat.name || '').toLowerCase().includes(q) ||
        (cat.slug || '').toLowerCase().includes(q) ||
        (cat.section || cat.sectionName || '').toLowerCase().includes(q) ||
        (cat.description || '').toLowerCase().includes(q);
      const matchStatus =
        parentCategoryStatusFilter === 'All' ||
        (parentCategoryStatusFilter === 'Active' ? cat.isActive !== false : cat.isActive === false);
      return matchQuery && matchStatus;
    });

    const isAllSelected = filteredParents.length > 0 && filteredParents.every((c) => selectedIds.includes(c.id || c.slug));

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header matching reference image */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: '0 0 0.25rem 0' }}>
              Parent Categories
            </h1>
            <p style={{ color: '#6B7280', fontSize: '0.875rem', margin: 0 }}>
              Top-level categories (roots). Subcategories are managed under Sub-Categories.
            </p>
          </div>

          <button
            onClick={() => {
              setModalFormData({
                order: categories.length,
                isActive: true,
              });
              setActiveModal('add-parent-category');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.55rem 1.15rem',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#262626')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0A0A0A')}
          >
            <Plus size={16} /> Add New Category
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '0.4rem 0.5rem',
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          width: 'fit-content',
        }}>
          <button
            onClick={() => handleTabChange('categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: theme.textDark,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <Grid size={15} color="#64748B" /> All Categories ({categories.length})
          </button>
          <button
            onClick={() => handleTabChange('parent-categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <FolderTree size={15} /> Parent Categories ({categories.length})
          </button>
          <button
            onClick={() => handleTabChange('sub-categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: theme.textDark,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <Tag size={15} color="#64748B" /> Sub Categories ({allSubCategories.length})
          </button>
        </div>

        {/* Main Card Container */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          padding: '1.25rem',
        }}>
          {/* Search Bar Input */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            padding: '0.5rem 0.85rem',
            marginBottom: '1.25rem',
            gap: '10px',
          }}>
            <Search size={18} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search categories..."
              value={parentCategorySearch}
              onChange={(e) => setParentCategorySearch(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontSize: '0.88rem',
                color: '#111827',
              }}
            />
            {parentCategorySearch && (
              <button
                type="button"
                onClick={() => setParentCategorySearch('')}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Bulk Selection Bar (Shown when 1 or more items are checked) */}
          {selectedIds.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFF8E1',
              border: '1px solid #FFE08A',
              borderRadius: '8px',
              padding: '0.6rem 1rem',
              marginBottom: '1rem',
            }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0A0A0A' }}>
                {selectedIds.length} categor{selectedIds.length > 1 ? 'ies' : 'y'} selected
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={handleBatchActivate}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F2F2F2',
                    border: '1px solid #E5E7EB',
                    color: '#0A0A0A',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mark Active
                </button>
                <button
                  type="button"
                  onClick={handleBatchDeactivate}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #FFE08A',
                    color: '#0A0A0A',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Mark Inactive
                </button>
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F2F2F2',
                    border: '1px solid #E5E7EB',
                    color: '#0A0A0A',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Delete Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Table matching reference screenshot */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #F3F4F6' }}>
                  <th style={{ width: '40px', padding: '10px 12px' }}>
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedIds(filteredParents.map((c) => c.id || c.slug));
                        } else {
                          setSelectedIds([]);
                        }
                      }}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0A0A0A' }}
                    />
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    IMAGE
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    NAME
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    SLUG
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    ORDER
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    STATUS
                  </th>
                  <th style={{ padding: '10px 14px', fontSize: '0.72rem', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'right' }}>
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredParents.map((cat, idx) => {
                  const catId = cat.id || cat.slug;
                  const isChecked = selectedIds.includes(catId);
                  const catImg =
                    cat.image ||
                    'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300';
                  const orderNum = cat.order !== undefined ? cat.order : idx;
                  const isActive = cat.isActive !== false;

                  return (
                    <tr
                      key={catId}
                      style={{
                        borderBottom: '1px solid #F9FAFB',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: '14px 12px' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSelectOne(catId)}
                          style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#0A0A0A' }}
                        />
                      </td>

                      {/* Image Thumbnail */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          backgroundColor: '#F3F4F6',
                          border: '1px solid #E5E7EB',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <img
                            src={catImg}
                            alt={cat.name}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=300';
                            }}
                          />
                        </div>
                      </td>

                      {/* Name */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                          {cat.name}
                        </div>
                      </td>

                      {/* Slug */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontSize: '0.84rem', color: '#6B7280', fontWeight: 400 }}>
                          {cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                        </div>
                      </td>

                      {/* Order */}
                      <td style={{ padding: '14px 14px' }}>
                        <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#374151' }}>
                          #{orderNum}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '14px 14px' }}>
                        <span
                          onClick={() => {
                            updateCategory(catId, { isActive: !isActive });
                            addToast(`Category status changed to ${!isActive ? 'active' : 'inactive'}`, 'info');
                          }}
                          style={{
                            display: 'inline-block',
                            padding: '3px 12px',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            backgroundColor: isActive ? '#F2F2F2' : '#FFF8E1',
                            color: isActive ? '#0A0A0A' : '#FFB800',
                            border: `1px solid ${isActive ? '#E5E7EB' : '#FFE08A'}`,
                            userSelect: 'none',
                          }}
                          title="Click to toggle Active / Inactive status"
                        >
                          {isActive ? 'active' : 'inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px' }}>
                          <button
                            type="button"
                            onClick={() => {
                              setModalFormData({
                                id: cat.id || cat.slug,
                                name: cat.name,
                                title: cat.name,
                                slug: cat.slug || '',
                                image: cat.image || '',
                                order: cat.order !== undefined ? cat.order : idx,
                                isActive: cat.isActive !== false,
                                description: cat.description || '',
                              });
                              setActiveModal('edit-parent-category');
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#64748B',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                            title="Edit Category"
                          >
                            <Edit2 size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) {
                                deleteCategory(catId);
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: '#64748B',
                              padding: '2px',
                              display: 'flex',
                              alignItems: 'center',
                              transition: 'color 0.15s ease',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = '#0A0A0A')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748B')}
                            title="Delete Category"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredParents.length === 0 && (
            <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', color: '#94A3B8' }}>
              <FolderTree size={36} color="#CBD5E1" style={{ margin: '0 auto 10px auto' }} />
              <div style={{ fontWeight: 700, color: '#475569', fontSize: '0.95rem' }}>No categories found</div>
              <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginTop: '4px' }}>
                {parentCategorySearch ? `No categories match "${parentCategorySearch}"` : 'Create your first top-level category by clicking "+ Add New Category" above.'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. SUB CATEGORIES VIEW (Granular specifications & image upload)
  // -------------------------------------------------------------
  function renderSubCategoriesView() {
    let filteredSubs = allSubCategories.filter((sub) => {
      const q = subCategorySearch.toLowerCase();
      const matchQuery = !q || sub.name.toLowerCase().includes(q) || sub.categoryName.toLowerCase().includes(q) || sub.sectionName.toLowerCase().includes(q);
      const matchParent = subCategoryParentFilter === 'All' || sub.sectionName === subCategoryParentFilter;
      const matchMain = subCategoryMainFilter === 'All' || sub.categoryName === subCategoryMainFilter;
      return matchQuery && matchParent && matchMain;
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Breadcrumb & Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: theme.textMuted, marginBottom: '0.35rem' }}>
              <span onClick={() => handleTabChange('dashboard')} style={{ cursor: 'pointer' }}>Home</span>
              <span>›</span>
              <span>Catalog</span>
              <span>›</span>
              <span style={{ color: theme.primaryBlue, fontWeight: 600 }}>Sub Categories</span>
            </div>

            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: '0 0 0.2rem 0' }}>
              Sub Categories & Product Images
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0 }}>
              Specific grades, material dimensions, and uploaded product images for accurate ordering.
            </p>
          </div>

          <button
            onClick={() => {
              setModalFormData({});
              setActiveModal('add-sub-category');
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.6rem 1.25rem',
              backgroundColor: theme.primaryBlue,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Plus size={16} /> + Add Sub Category
          </button>
        </div>

        {/* TOP LEVEL CATEGORY TABS (All Categories | Parent Categories | Sub Categories) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '0.4rem 0.5rem',
          borderRadius: '10px',
          border: `1px solid ${theme.cardBorder}`,
          width: 'fit-content',
        }}>
          <button
            onClick={() => handleTabChange('categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: theme.textDark,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <Grid size={15} color="#64748B" /> All Categories ({categories.length})
          </button>
          <button
            onClick={() => handleTabChange('parent-categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: 'transparent',
              color: theme.textDark,
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <FolderTree size={15} color="#64748B" /> Parent Categories ({categories.length})
          </button>
          <button
            onClick={() => handleTabChange('sub-categories')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 0.9rem',
              borderRadius: '8px',
              backgroundColor: theme.primaryBlue,
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
            }}
          >
            <Tag size={15} /> Sub Categories ({allSubCategories.length})
          </button>
        </div>

        {/* Search & Filters */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: `1px solid ${theme.cardBorder}`,
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            padding: '0.45rem 0.75rem',
            gap: '8px',
            minWidth: '240px',
            flex: 1,
            maxWidth: '300px',
          }}>
            <Search size={15} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search sub categories..."
              value={subCategorySearch}
              onChange={(e) => setSubCategorySearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.82rem',
                color: theme.textDark,
                width: '100%',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <select
              value={subCategoryParentFilter}
              onChange={(e) => setSubCategoryParentFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8rem',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Parent Sections</option>
              {categorySections.map((s) => (
                <option key={s.id} value={s.title || s.name}>{s.title || s.name}</option>
              ))}
            </select>

            <select
              value={subCategoryMainFilter}
              onChange={(e) => setSubCategoryMainFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.8rem',
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              <option value="All">All Main Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Subcategories Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.sidebarBorder}`, color: '#64748B' }}>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Subcategory & Product Image</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Main Category</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Parent Department</th>
                <th style={{ padding: '0.75rem 0.85rem', fontWeight: 700, textAlign: 'center' }}>Matching SKUs</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubs.map((sub, idx) => (
                <tr key={sub.id || idx} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ position: 'relative', width: '42px', height: '42px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #E2E8F0', flexShrink: 0 }}>
                        <img src={sub.image} alt={sub.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: theme.textDark, fontSize: '0.85rem' }}>{sub.name}</div>
                        <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Verified specification</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ backgroundColor: '#FFF8E1', color: theme.primaryBlue, fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                      {sub.categoryName}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', color: '#475569', fontWeight: 600 }}>
                    {sub.sectionName}
                  </td>
                  <td style={{ padding: '0.75rem 0.85rem', textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                    {sub.prodCount} items
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#F2F2F2', color: '#0A0A0A', fontWeight: 700, fontSize: '0.72rem' }}>
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => {
                          setModalFormData({
                            subName: sub.name,
                            oldName: sub.name,
                            name: sub.name,
                            categoryId: sub.categoryId || sub.categorySlug,
                            slug: sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                            image: sub.image || '',
                            order: sub.order !== undefined ? sub.order : idx,
                            isActive: sub.isActive !== false,
                          });
                          setActiveModal('edit-sub-category');
                        }}
                        style={{
                          padding: '4px 10px',
                          backgroundColor: '#FFF8E1',
                          border: '1px solid #FFE08A',
                          borderRadius: '6px',
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          color: '#0A0A0A',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#0A0A0A';
                          e.currentTarget.style.color = '#FFFFFF';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#FFF8E1';
                          e.currentTarget.style.color = '#0A0A0A';
                        }}
                        title="Edit subcategory"
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete subcategory "${sub.name}" from ${sub.categoryName}?`)) {
                            deleteSubCategory(sub.categoryId || sub.categorySlug, sub.name);
                          }
                        }}
                        style={{
                          padding: '4px 6px',
                          backgroundColor: '#F2F2F2',
                          border: '1px solid #9CA3AF',
                          borderRadius: '6px',
                          color: '#0A0A0A',
                          cursor: 'pointer',
                        }}
                        title="Delete subcategory"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. DASHBOARD VIEW (Analytics & KPI Cards)
  // -------------------------------------------------------------
  function renderDashboardView() {
    const totalRev = orders.reduce((acc, o) => acc + (o.grandTotal || o.total || 0), 0);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <div style={{ fontSize: '0.78rem', color: theme.textMuted, marginBottom: '0.2rem' }}>
            <span>Home</span> › <span style={{ color: theme.primaryBlue, fontWeight: 600 }}>Dashboard & Analytics</span>
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: '2px 0' }}>
            Executive Dashboard
          </h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', margin: 0 }}>
            Real-time sales velocity, logistics fleet metrics, and technician fulfillment telemetry.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="admin-kpi-grid">
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A', flexShrink: 0 }}>
              <DollarSign size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted }}>Total Material Revenue</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.textDark, lineHeight: 1.2 }}>₹{totalRev.toLocaleString('en-IN')}</div>
              <div style={{ fontSize: '0.72rem', color: '#0A0A0A', fontWeight: 700, marginTop: '2px' }}>↑ +18.4% this week</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.primaryBlue, flexShrink: 0 }}>
              <Truck size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted }}>Total Orders</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.textDark, lineHeight: 1.2 }}>{orders.length} Orders</div>
              <div style={{ fontSize: '0.72rem', color: '#0A0A0A', fontWeight: 700, marginTop: '2px' }}>60-min express active</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800', flexShrink: 0 }}>
              <Wrench size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted }}>Active Mistris</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.textDark, lineHeight: 1.2 }}>{mistris.filter(m => m.isAvailable).length} Available</div>
              <div style={{ fontSize: '0.72rem', color: '#0A0A0A', fontWeight: 700, marginTop: '2px' }}>100% verified & insured</div>
            </div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: '46px', height: '46px', borderRadius: '12px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A', flexShrink: 0 }}>
              <Users size={22} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: theme.textMuted }}>Registered Customers</div>
              <div style={{ fontSize: '1.35rem', fontWeight: 800, color: theme.textDark, lineHeight: 1.2 }}>{usersList.length} Accounts</div>
              <div style={{ fontSize: '0.72rem', color: '#0A0A0A', fontWeight: 700, marginTop: '2px' }}>Active accounts</div>
            </div>
          </div>
        </div>

        {/* Quick Launch & Recent Orders */}
        <div className="admin-dashboard-grid">
          {/* Left Column: Recent Dispatch Queue */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.textDark, margin: 0 }}>Recent Dispatch Queue</h3>
              <button onClick={() => handleTabChange('orders')} style={{ color: theme.primaryBlue, fontWeight: 700, fontSize: '0.78rem', background: 'none', border: 'none', cursor: 'pointer' }}>View All →</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: theme.textMuted, fontSize: '0.85rem' }}>
                  No orders placed yet. Real-time dispatches will appear here.
                </div>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <div key={o.id} className="admin-dispatch-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 0.9rem', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0', gap: '12px', transition: 'all 0.15s ease' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 800, color: theme.textDark, fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.orderNumber || o.id}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.shippingAddress?.fullName || o.customerName || 'Customer'} • {o.items?.length || 1} items
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                      <div style={{ fontWeight: 800, color: '#0A0A0A', fontSize: '0.88rem' }}>₹{(o.grandTotal || o.total || 0).toLocaleString('en-IN')}</div>
                      <span style={{ fontSize: '0.68rem', fontWeight: 700, color: theme.primaryBlue, backgroundColor: '#FFF8E1', padding: '2px 8px', borderRadius: '10px', border: '1px solid #FFF8E1', whiteSpace: 'nowrap' }}>
                        {o.status || 'Confirmed'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Quick Actions */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: theme.textDark, margin: 0 }}>Quick Actions</h3>
            <button className="admin-action-btn" onClick={() => handleTabChange('products')} style={{ padding: '0.75rem 0.9rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: theme.textDark, fontWeight: 700, fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', transition: 'all 0.15s ease' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Package size={16} color={theme.primaryBlue} />
              </div>
              <span style={{ flex: 1 }}>+ Manage Products & Stock</span>
            </button>
            <button className="admin-action-btn" onClick={() => handleTabChange('categories')} style={{ padding: '0.75rem 0.9rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: theme.textDark, fontWeight: 700, fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', transition: 'all 0.15s ease' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Layers size={16} color="#0A0A0A" />
              </div>
              <span style={{ flex: 1 }}>+ Edit Categories & Sections</span>
            </button>
            <button className="admin-action-btn" onClick={() => handleTabChange('coupons')} style={{ padding: '0.75rem 0.9rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: theme.textDark, fontWeight: 700, fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', transition: 'all 0.15s ease' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Tag size={16} color="#FFB800" />
              </div>
              <span style={{ flex: 1 }}>+ Create Promo Code</span>
            </button>
            <button className="admin-action-btn" onClick={() => handleTabChange('quotations')} style={{ padding: '0.75rem 0.9rem', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '10px', color: theme.textDark, fontWeight: 700, fontSize: '0.82rem', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', width: '100%', transition: 'all 0.15s ease' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquareQuote size={16} color="#0A0A0A" />
              </div>
              <span style={{ flex: 1 }}>+ Review Project BOQ Quotes</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 3. PRODUCTS VIEW (Master Product Catalog matching Image 1)
  // -------------------------------------------------------------
  function renderProductsView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header Row with Title, Live Badge, Subtitle & Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.2rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Product List
              </h1>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                letterSpacing: '0.05em',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: '#F2F2F2',
                color: '#0A0A0A',
                border: '1px solid #E5E7EB',
              }}>
                LIVE
              </span>
            </div>
            <p style={{ color: '#64748B', fontSize: '0.85rem', margin: 0 }}>
              Track your items, prices, and how many are left in stock.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => {
                setIsRefreshingProducts(true);
                setTimeout(() => {
                  setIsRefreshingProducts(false);
                  addToast('Product catalog synchronized with live inventory', 'info');
                }, 400);
              }}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E2E8F0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                transition: 'all 0.15s ease',
              }}
              title="Refresh Catalog"
            >
              <RefreshCw size={17} style={{ animation: isRefreshingProducts ? 'spin 0.6s linear infinite' : 'none' }} />
            </button>

            {/* + ADD MASTER PRODUCT Button */}
            <button
              type="button"
              onClick={handleOpenAddProduct}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.65rem 1.25rem',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: 'none',
                fontWeight: 800,
                fontSize: '0.82rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.25)',
                transition: 'all 0.15s ease',
              }}
            >
              <Plus size={16} /> + ADD MASTER PRODUCT
            </button>
          </div>
        </div>

        {/* Switcher Navigation Tabs */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: '#FFFFFF',
          padding: '4px 6px',
          borderRadius: '12px',
          border: '1px solid #E2E8F0',
          width: 'fit-content',
          maxWidth: '100%',
          overflowX: 'auto',
        }}>
          <button
            onClick={() => setProductCatalogTab('master')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: productCatalogTab === 'master' ? '#FFF8E1' : 'transparent',
              color: productCatalogTab === 'master' ? theme.primaryBlue : '#64748B',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <CheckCircle size={14} color={productCatalogTab === 'master' ? theme.primaryBlue : '#94A3B8'} />
            <span>MASTER CATALOG</span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 800,
              padding: '1px 6px',
              borderRadius: '6px',
              backgroundColor: '#FFF8E1',
              color: theme.primaryBlue,
            }}>
              LIVE APP
            </span>
          </button>

          <button
            onClick={() => setProductCatalogTab('seller')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: productCatalogTab === 'seller' ? '#FFF8E1' : 'transparent',
              color: productCatalogTab === 'seller' ? theme.primaryBlue : '#64748B',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <Store size={14} color={productCatalogTab === 'seller' ? theme.primaryBlue : '#94A3B8'} />
            <span>SELLER INVENTORY</span>
          </button>

          <button
            onClick={() => setProductCatalogTab('alerts')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '0.45rem 1rem',
              borderRadius: '9px',
              border: 'none',
              backgroundColor: productCatalogTab === 'alerts' ? '#F2F2F2' : 'transparent',
              color: productCatalogTab === 'alerts' ? '#0A0A0A' : '#64748B',
              fontWeight: 800,
              fontSize: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={14} color={productCatalogTab === 'alerts' ? '#0A0A0A' : '#94A3B8'} />
            <span>LOW STOCK ALERTS</span>
            {(productStats.low + productStats.out) > 0 && (
              <span style={{
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '1px 6px',
                borderRadius: '6px',
                backgroundColor: '#F2F2F2',
                color: '#0A0A0A',
              }}>
                {productStats.low + productStats.out}
              </span>
            )}
          </button>
        </div>

        {/* 4 Summary / KPI Stat Cards */}
        <div className="admin-products-stats-grid">
          {/* Card 1: All Items */}
          <div
            onClick={() => setProductStockFilter('All')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: productStockFilter === 'All' ? '2px solid #6B7280' : '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: productStockFilter === 'All' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FFF8E1',
              color: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>All Items</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                {productStats.all}
              </div>
            </div>
          </div>

          {/* Card 2: Active Items */}
          <div
            onClick={() => setProductStockFilter('inStock')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: productStockFilter === 'inStock' ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: productStockFilter === 'inStock' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#F2F2F2',
              color: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <CheckCircle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Active Items</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                {productStats.active}
              </div>
            </div>
          </div>

          {/* Card 3: Low Stock */}
          <div
            onClick={() => setProductStockFilter('lowStock')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: productStockFilter === 'lowStock' ? '2px solid #FFB800' : '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: productStockFilter === 'lowStock' ? '0 4px 12px rgba(255, 184, 0, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#FFF8E1',
              color: '#FFB800',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Low Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                {productStats.low}
              </div>
            </div>
          </div>

          {/* Card 4: Out of Stock */}
          <div
            onClick={() => setProductStockFilter('outOfStock')}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: productStockFilter === 'outOfStock' ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
              padding: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: productStockFilter === 'outOfStock' ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: '#F2F2F2',
              color: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748B' }}>Out of Stock</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.15 }}>
                {productStats.out}
              </div>
            </div>
          </div>
        </div>

        {/* Search, Filter & Quick Options Strip */}
        <div className="admin-products-filter-bar" style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.85rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          {/* Search Box */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '0.55rem 0.85rem',
            gap: '10px',
            minWidth: '260px',
            flex: 1,
            maxWidth: '380px',
          }}>
            <Search size={16} color="#94A3B8" />
            <input
              type="text"
              placeholder="Search by name or brand..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                fontSize: '0.85rem',
                color: '#0F172A',
                width: '100%',
              }}
            />
            {productSearch && (
              <X
                size={15}
                color="#94A3B8"
                style={{ cursor: 'pointer' }}
                onClick={() => setProductSearch('')}
              />
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Category Dropdown */}
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Parent Section Filter */}
            <select
              value={productSectionFilter}
              onChange={(e) => setProductSectionFilter(e.target.value)}
              style={{
                padding: '0.55rem 0.85rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                fontSize: '0.82rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="All">All Parent Departments</option>
              {categorySections.map((s) => (
                <option key={s.id} value={s.title || s.name}>{s.title || s.name}</option>
              ))}
            </select>

            {/* Show All / Reset Filters */}
            <button
              type="button"
              onClick={() => {
                setProductSearch('');
                setProductCategoryFilter('All');
                setProductSectionFilter('All');
                setProductStockFilter('All');
                setProductCatalogTab('master');
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                backgroundColor: (productSearch || productCategoryFilter !== 'All' || productSectionFilter !== 'All' || productStockFilter !== 'All') ? '#FFF8E1' : '#FFFFFF',
                color: (productSearch || productCategoryFilter !== 'All' || productSectionFilter !== 'All' || productStockFilter !== 'All') ? theme.primaryBlue : '#475569',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.04em',
              }}
            >
              <Filter size={14} /> SHOW ALL
            </button>
          </div>
        </div>

        {/* Master Catalog Products Table */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B' }}>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>PRODUCT</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>SELLER</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>VARIANT</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>CATEGORY</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>CUSTOMER PRICE</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', color: '#0A0A0A' }}>HUB MARGIN</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>STOCK</th>
                  <th style={{ padding: '0.85rem 1rem', fontWeight: 800, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase', textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid #F1F5F9',
                        transition: 'background-color 0.15s ease',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* 1. PRODUCT (Thumbnail + Title + Spec) */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            position: 'relative',
                            width: '46px',
                            height: '46px',
                            borderRadius: '10px',
                            overflow: 'hidden',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid #E2E8F0',
                            flexShrink: 0,
                          }}>
                            <img
                              src={p.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=200'}
                              alt={p.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', lineHeight: 1.3, maxWidth: '240px' }}>
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                              {p.brand} • {p.unit || 'Standard Unit'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. SELLER (• Hub Catalog) */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.primaryBlue, display: 'inline-block' }} />
                          <span style={{ fontWeight: 700, color: '#334155', fontSize: '0.8rem' }}>
                            {p.seller || 'Hub Catalog'}
                          </span>
                        </div>
                      </td>

                      {/* 3. VARIANT */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ color: '#0A0A0A' }}>
                            <FileText size={15} />
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, color: '#0A0A0A', fontSize: '0.78rem' }}>
                              {p.optionsCount ? `${p.optionsCount} Options` : '1 Variant'}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 600 }}>
                              ₹{p.price?.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 4. CATEGORY */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>
                          <span style={{
                            display: 'inline-block',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            fontWeight: 700,
                            padding: '3px 9px',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                          }}>
                            {p.category}
                          </span>
                          <div style={{ fontSize: '0.7rem', color: '#94A3B8', marginTop: '3px' }}>
                            {p.subcategory || p.section || 'General'}
                          </div>
                        </div>
                      </td>

                      {/* 5. CUSTOMER PRICE */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                              ₹{p.mrp?.toLocaleString('en-IN')}
                            </span>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0A0A0A' }}>
                              ₹{p.price?.toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 6. HUB MARGIN */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{
                          display: 'inline-flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          padding: '4px 10px',
                          borderRadius: '8px',
                          backgroundColor: '#F2F2F2',
                          border: '1px solid #F2F2F2',
                        }}>
                          <span style={{ fontWeight: 800, color: '#0A0A0A', fontSize: '0.78rem' }}>
                            ₹{p.marginAmount?.toLocaleString('en-IN') || '45'}
                          </span>
                          <span style={{ fontSize: '0.65rem', color: '#0A0A0A', fontWeight: 700 }}>
                            {p.marginPercent || 10}% margin
                          </span>
                        </div>
                      </td>

                      {/* 7. STOCK (Clean Stock Number) */}
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            style={{
                              padding: '4px 10px',
                              borderRadius: '6px',
                              backgroundColor: p.isOutOfStock ? '#F2F2F2' : (p.isLowStock ? '#FFF8E1' : '#FFFFFF'),
                              border: p.isOutOfStock ? '1.5px dashed #0A0A0A' : (p.isLowStock ? '1px solid #FFE08A' : '1px solid #E5E7EB'),
                              color: '#0A0A0A',
                              fontSize: '0.82rem',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                backgroundColor: p.isOutOfStock ? '#0A0A0A' : (p.isLowStock ? '#FFB800' : '#4B5563'),
                              }}
                            />
                            <span>{typeof p.stock === 'number' ? p.stock.toLocaleString('en-IN') : (p.stockCount || 0)}</span>
                            <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>{p.unit || 'Units'}</span>
                          </span>
                        </div>
                      </td>

                      {/* 8. ACTIONS */}
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'center', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenEditProduct(p)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: '6px',
                              color: '#334155',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Edit2 size={12} color={theme.primaryBlue} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleProductStock(p.id)}
                            style={{
                              padding: '5px 8px',
                              backgroundColor: p.inStock ? '#FFFFFF' : '#F2F2F2',
                              border: p.inStock ? '1px solid #E5E7EB' : '1.5px dashed #0A0A0A',
                              borderRadius: '6px',
                              color: '#0A0A0A',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                            }}
                            title="Toggle Stock Availability"
                          >
                            {p.inStock ? 'In Stock' : 'Out'}
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Delete product "${p.name}"?`)) {
                                deleteProduct(p.id);
                                addToast(`Product "${p.name}" deleted`, 'info');
                              }
                            }}
                            style={{
                              padding: '5px 7px',
                              backgroundColor: '#F2F2F2',
                              border: '1px solid #9CA3AF',
                              borderRadius: '6px',
                              color: '#0A0A0A',
                              cursor: 'pointer',
                            }}
                            title="Delete SKU"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94A3B8' }}>
                      <Package size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>No products match the selected filters</div>
                      <div style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '4px' }}>Try resetting your search query or department filters</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 4. BRANDS & ATTRIBUTES
  // -------------------------------------------------------------
  function renderBrandsView() {
    const brandsList = [
      { name: 'UltraTech Cement', logo: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=200', count: 12, category: 'Cement' },
      { name: 'Tata Tiscon', logo: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=200', count: 8, category: 'Steel' },
      { name: 'Kajaria Ceramics', logo: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=200', count: 18, category: 'Tiling' },
      { name: 'Asian Paints', logo: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=200', count: 24, category: 'Paints' },
      { name: 'Dr. Fixit', logo: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=200', count: 9, category: 'Waterproofing' },
      { name: 'Pidilite Fevicol', logo: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200', count: 15, category: 'Adhesives' },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Partner Brands</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          {brandsList.map((b, i) => (
            <div key={i} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={b.logo} alt={b.name} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} />
              <div>
                <div style={{ fontWeight: 800, color: theme.textDark, fontSize: '0.9rem' }}>{b.name}</div>
                <div style={{ fontSize: '0.75rem', color: theme.textMuted }}>{b.category} • {b.count} Products</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderAttributesView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Material Attributes & Units</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem' }}>
          <p style={{ color: theme.textMuted }}>Configure standardized units: Bag (50kg), Metric Tonne (MT), Sq.Ft, Litre, Box, Bundle, Roll.</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 5. ORDERS & LIVE LOGISTICS
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // 5. ORDERS & LIVE LOGISTICS MANAGEMENT
  // -------------------------------------------------------------
  function renderOrdersView() {
    // Filtered orders list based on tabs and search query
    const filteredOrders = orders.filter((o) => {
      const isOnline =
        o.payment?.method?.toLowerCase().includes('online') ||
        o.payment?.method?.toLowerCase().includes('upi') ||
        o.payment?.method?.toLowerCase().includes('card') ||
        o.payment?.method?.toLowerCase().includes('net banking') ||
        o.paymentMethod?.toLowerCase().includes('online') ||
        o.paymentMethod?.toLowerCase().includes('upi') ||
        o.payment?.status === 'Paid';

      const isCOD =
        o.payment?.method?.toLowerCase().includes('cash') ||
        o.payment?.method?.toLowerCase().includes('site') ||
        o.payment?.method?.toLowerCase().includes('cod') ||
        o.paymentMethod?.toLowerCase().includes('cash');

      if (orderFilterTab === 'online' && !isOnline) return false;
      if (orderFilterTab === 'cash' && !isCOD) return false;
      if (orderFilterTab === 'confirmed' && o.status !== 'Confirmed') return false;
      if (orderFilterTab === 'in_transit' && !['In Transit', 'Warehouse Dispatch', 'Out for Delivery'].includes(o.status)) return false;
      if (orderFilterTab === 'delivered' && o.status !== 'Delivered' && o.status !== 'Delivered & Unloaded') return false;

      if (orderSearchQuery.trim()) {
        const query = orderSearchQuery.toLowerCase();
        const idMatch = (o.id || '').toLowerCase().includes(query) || (o.orderNumber || '').toLowerCase().includes(query);
        const nameMatch = (o.customerName || o.shippingAddress?.fullName || o.shippingAddress?.recipientName || o.siteAddress?.recipientName || '').toLowerCase().includes(query);
        const phoneMatch = (o.customerPhone || o.shippingAddress?.phone || o.siteAddress?.phone || '').includes(query);
        const cityMatch = (o.shippingAddress?.city || o.siteAddress?.city || '').toLowerCase().includes(query);
        return idMatch || nameMatch || phoneMatch || cityMatch;
      }

      return true;
    });

    const onlineOrdersCount = orders.filter(
      (o) =>
        o.payment?.method?.toLowerCase().includes('online') ||
        o.payment?.method?.toLowerCase().includes('upi') ||
        o.payment?.method?.toLowerCase().includes('card') ||
        o.payment?.status === 'Paid'
    ).length;

    const codOrdersCount = orders.filter(
      (o) =>
        o.payment?.method?.toLowerCase().includes('cash') ||
        o.payment?.method?.toLowerCase().includes('site') ||
        o.payment?.method?.toLowerCase().includes('cod') ||
        o.paymentMethod?.toLowerCase().includes('cash')
    ).length;

    const totalRevenue = orders.reduce((acc, o) => acc + (o.grandTotal || o.total || o.summary?.totalAmount || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Breadcrumb & Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '0.78rem', color: theme.textMuted }}>
              Home › Orders › <span style={{ color: theme.primaryBlue, fontWeight: 600 }}>Orders & Requests</span>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: '2px 0' }}>
              Customer Orders & Requests
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
              Real-time feed of material requests, payment verification (Cash vs Online), and fleet dispatch.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={playOrderNotificationSound}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                color: theme.primaryBlue,
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <span>🔊 Test Order Alert</span>
            </button>
            <button
              onClick={() => {
                const sampleOrderId = `MST-${Math.floor(100000 + Math.random() * 900000)}`;
                const dummyOrder = {
                  id: sampleOrderId,
                  orderNumber: sampleOrderId,
                  customerName: 'Shree Balaji Constructions',
                  customerPhone: '+91 98260 55443',
                  items: [
                    { product: { name: 'UltraTech Super Cement (PPC)', brand: 'UltraTech', unit: 'Bags' }, quantity: 150, price: 380 },
                    { product: { name: 'Jindal Panther 550D TMT Steel 12mm', brand: 'Jindal', unit: 'MT' }, quantity: 2, price: 54000 },
                  ],
                  grandTotal: 165000,
                  total: 165000,
                  payment: { method: 'Online UPI (GPay)', status: 'Paid', transactionId: `TXN-MST-${Date.now()}` },
                  paymentMethod: 'Online UPI (GPay)',
                  paymentStatus: 'Paid',
                  status: 'Confirmed',
                  siteAddress: { title: 'Site Plot 88', recipientName: 'Er. Sandeep Joshi', phone: '+91 98260 55443', addressLine: 'Super Corridor Commercial Hub', city: 'Indore', pincode: '452005' },
                  date: new Date().toISOString().split('T')[0],
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                };
                orders.unshift(dummyOrder);
                addToast(`Simulated new incoming order #${sampleOrderId}!`, 'success');
                playOrderNotificationSound();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#E6A600',
                border: 'none',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <Plus size={15} />
              <span>Simulate New User Order</span>
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="admin-orders-stats-grid">
          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase' }}>Total Material Orders</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: theme.textDark, marginTop: '4px' }}>{orders.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#0A0A0A', fontWeight: 700, marginTop: '4px' }}>₹{totalRevenue.toLocaleString('en-IN')} Total Value</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <CreditCard size={14} />
              <span>Online Paid Orders</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0A0A0A', marginTop: '4px' }}>{onlineOrdersCount}</div>
            <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '4px' }}>Instant Razorpay / UPI Settlement</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <DollarSign size={14} />
              <span>Cash on Site (COD)</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0A0A0A', marginTop: '4px' }}>{codOrdersCount}</div>
            <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '4px' }}>Pay upon site unloading verification</div>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '1.25rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Truck size={14} />
              <span>Active Dispatches</span>
            </div>
            <div style={{ fontSize: '1.7rem', fontWeight: 900, color: '#0A0A0A', marginTop: '4px' }}>
              {orders.filter((o) => ['Confirmed', 'In Transit', 'Warehouse Dispatch', 'Out for Delivery'].includes(o.status)).length}
            </div>
            <div style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '4px' }}>GPS tracked fleet vehicles</div>
          </div>
        </div>

        {/* Filter Tabs & Search Row */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Orders (${orders.length})` },
              { id: 'online', label: `💳 Online Paid (${onlineOrdersCount})` },
              { id: 'cash', label: `💵 Cash / COD (${codOrdersCount})` },
              { id: 'confirmed', label: 'Confirmed' },
              { id: 'in_transit', label: 'In Transit' },
              { id: 'delivered', label: 'Delivered' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrderFilterTab(tab.id)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: orderFilterTab === tab.id ? '#0A0A0A' : '#F1F5F9',
                  color: orderFilterTab === tab.id ? '#FFFFFF' : '#475467',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '260px' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by Order ID, Customer, Phone..."
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px 7px 32px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.8rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Orders Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.sidebarBorder}`, color: '#64748B' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>Order ID & Date</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Customer / Site Location</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Material Items</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Payment Mode & Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Total Amount</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Logistics Status</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Driver / Vehicle</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((o) => {
                    const isOnline =
                      o.payment?.method?.toLowerCase().includes('online') ||
                      o.payment?.method?.toLowerCase().includes('upi') ||
                      o.payment?.method?.toLowerCase().includes('card') ||
                      o.paymentMethod?.toLowerCase().includes('online') ||
                      o.payment?.status === 'Paid';

                    const customerName =
                      o.customerName ||
                      o.shippingAddress?.fullName ||
                      o.shippingAddress?.recipientName ||
                      o.siteAddress?.recipientName ||
                      'Er. Rajesh Malviya';

                    const phone =
                      o.customerPhone ||
                      o.shippingAddress?.phone ||
                      o.siteAddress?.phone ||
                      '+91 98260 11223';

                    const siteCity =
                      o.shippingAddress?.city ||
                      o.siteAddress?.city ||
                      'Indore';

                    const siteAddressLine =
                      o.shippingAddress?.addressLine ||
                      o.siteAddress?.addressLine ||
                      'Plot 42, Super Corridor';

                    const itemsCount =
                      o.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) ||
                      o.items?.length ||
                      2;

                    const grandTotal =
                      o.grandTotal ||
                      o.total ||
                      o.summary?.totalAmount ||
                      0;

                    return (
                      <tr key={o.id} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                        {/* Order ID */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div
                            onClick={() => setSelectedOrderDetailsModal(o)}
                            style={{ fontWeight: 800, color: theme.primaryBlue, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <span>{o.orderNumber || o.id}</span>
                            <ExternalLink size={12} />
                          </div>
                          <div style={{ fontSize: '0.72rem', color: theme.textMuted, marginTop: '2px' }}>
                            {o.date || 'Today'} • {o.time || '10:30 AM'}
                          </div>
                        </td>

                        {/* Customer / Site */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 800, color: theme.textDark }}>{customerName}</div>
                          <div style={{ fontSize: '0.72rem', color: theme.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Phone size={11} />
                            <span>{phone}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#475467', marginTop: '2px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            📍 {siteAddressLine}, {siteCity}
                          </div>
                        </td>

                        {/* Items */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 700, color: theme.textDark }}>
                            {itemsCount} Units / Items
                          </div>
                          <div style={{ fontSize: '0.72rem', color: theme.textMuted, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {o.items?.map((it) => it.product?.name || it.name || 'Material Item').join(', ') || 'Building Materials'}
                          </div>
                        </td>

                        {/* Payment Mode */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 8px', borderRadius: '6px', border: isOnline ? '1px solid #E5E7EB' : '1px solid #FFE08A', backgroundColor: isOnline ? '#F2F2F2' : '#FFF8E1', color: '#0A0A0A', fontWeight: 800, fontSize: '0.72rem' }}>
                            {isOnline ? <CreditCard size={12} /> : <DollarSign size={12} />}
                            <span>{isOnline ? 'Online (Paid)' : 'Cash / Pay on Site'}</span>
                          </div>
                          <div style={{ fontSize: '0.68rem', color: theme.textMuted, marginTop: '3px' }}>
                            {o.payment?.method || (isOnline ? 'Razorpay UPI' : 'Cash on Delivery')}
                          </div>
                        </td>

                        {/* Total Amount */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 900, color: '#0A0A0A', fontSize: '0.95rem' }}>
                            ₹{grandTotal.toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>GST 18% Included</div>
                        </td>

                        {/* Logistics Status */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <select
                            value={o.status || 'Confirmed'}
                            onChange={(e) => {
                              updateOrderStatus(o.id, e.target.value);
                            }}
                            style={{
                              padding: '5px 8px',
                              borderRadius: '6px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color:
                                o.status === 'Delivered' || o.status === 'Delivered & Unloaded'
                                  ? '#0A0A0A'
                                  : o.status === 'Cancelled'
                                  ? '#6B7280'
                                  : theme.primaryBlue,
                              border:
                                o.status === 'Delivered' || o.status === 'Delivered & Unloaded'
                                  ? '2px solid #0A0A0A'
                                  : o.status === 'Cancelled'
                                  ? '1.5px dashed #CBD5E1'
                                  : '1.5px solid #E2E8F0',
                              backgroundColor: '#FFFFFF',
                              cursor: 'pointer',
                            }}
                          >
                            <option value="Confirmed">Confirmed</option>
                            <option value="Warehouse Dispatch">Warehouse Dispatch</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Out for Delivery">Out for Delivery</option>
                            <option value="Delivered">Delivered & Unloaded</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                        </td>

                        {/* Driver */}
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.75rem' }}>
                          <div><strong>{o.driverName || o.tracking?.driverName || 'Ramesh Patel'}</strong></div>
                          <div style={{ color: theme.textMuted }}>{o.vehicleNumber || o.tracking?.vehicleNumber || 'MP-09-TR-4421'}</div>
                        </td>

                        {/* Actions */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                            <button
                              type="button"
                              onClick={() => setSelectedOrderDetailsModal(o)}
                              title="View Full Order Details"
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#FFF8E1',
                                border: '1px solid #FFE08A',
                                borderRadius: '6px',
                                color: theme.primaryBlue,
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                              }}
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateTo('order-tracking', { orderId: o.id })}
                              title="Live Fleet Tracking"
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#F1F5F9',
                                border: '1px solid #E2E8F0',
                                borderRadius: '6px',
                                color: '#475467',
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                              }}
                            >
                              Track
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                      <Truck size={36} style={{ margin: '0 auto 8px auto', opacity: 0.5 }} />
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', color: theme.textDark }}>No orders match this filter</div>
                      <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>Try switching tabs or resetting your search term.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Pop-up Modal */}
        {selectedOrderDetailsModal && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              backdropFilter: 'blur(4px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '14px',
                width: '100%',
                maxWidth: '680px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Modal Header */}
              <div
                style={{
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Order Details & Tax Invoice
                  </div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {selectedOrderDetailsModal.orderNumber || selectedOrderDetailsModal.id}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetailsModal(null)}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    color: '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Customer & Delivery Site info */}
                <div className="admin-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.primaryBlue, textTransform: 'uppercase' }}>
                      Customer Contact
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', marginTop: '2px' }}>
                      {selectedOrderDetailsModal.customerName || selectedOrderDetailsModal.siteAddress?.recipientName || 'Er. Rajesh Malviya'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#475467', marginTop: '2px' }}>
                      Phone: {selectedOrderDetailsModal.customerPhone || selectedOrderDetailsModal.siteAddress?.phone || '+91 98260 11223'}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: theme.primaryBlue, textTransform: 'uppercase' }}>
                      Delivery Site Destination
                    </div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
                      {selectedOrderDetailsModal.siteAddress?.title || 'Main Construction Site'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#475467' }}>
                      {selectedOrderDetailsModal.siteAddress?.addressLine || 'Super Corridor Tech Zone'}, {selectedOrderDetailsModal.siteAddress?.city || 'Indore'} - {selectedOrderDetailsModal.siteAddress?.pincode || '452005'}
                    </div>
                  </div>
                </div>

                {/* Payment & Logistics Status row */}
                <div className="admin-modal-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Payment Mode</div>
                    <div style={{ fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>
                      {selectedOrderDetailsModal.payment?.method || selectedOrderDetailsModal.paymentMethod || 'Online UPI'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: selectedOrderDetailsModal.payment?.status === 'Paid' ? '#0A0A0A' : '#6B7280', fontWeight: 700, marginTop: '2px' }}>
                      Status: {selectedOrderDetailsModal.payment?.status || 'Paid'}
                    </div>
                  </div>

                  <div style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 700 }}>Logistics Driver</div>
                    <div style={{ fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>
                      {selectedOrderDetailsModal.driverName || 'Ramesh Patel (Driver)'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
                      Truck: {selectedOrderDetailsModal.vehicleNumber || 'MP-09-TR-4421'}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: theme.textDark, marginBottom: '8px' }}>
                    Ordered Materials & Items
                  </div>
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '8px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#64748B', textAlign: 'left' }}>
                          <th style={{ padding: '8px 12px' }}>Material</th>
                          <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Price</th>
                          <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderDetailsModal.items?.map((it, idx) => {
                          const rawQty = it.quantity || 1;
                          const qty = typeof rawQty === 'number' ? rawQty : parseInt(rawQty, 10) || 1;
                          const rawUnit = it.product?.unit || it.unit || '';
                          const unit = (!rawUnit || !isNaN(rawUnit) || rawUnit === '1' || rawUnit === 'Units') ? '' : rawUnit;
                          const price = Number(it.price || it.product?.price || 0);

                          return (
                            <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                              <td style={{ padding: '8px 12px', fontWeight: 700, color: theme.textDark }}>
                                {it.product?.name || it.name || 'Building Material Item'}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'center', fontWeight: 700 }}>
                                {qty}{unit ? ` ${unit}` : ''}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right' }}>
                                ₹{price.toLocaleString('en-IN')}
                              </td>
                              <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 800, color: theme.primaryBlue }}>
                                ₹{(price * qty).toLocaleString('en-IN')}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Total Summary */}
                <div style={{ padding: '12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0A0A0A' }}>Total Invoice Amount:</span>
                  <span style={{ fontWeight: 900, fontSize: '1.35rem', color: '#0A0A0A' }}>
                    ₹{(selectedOrderDetailsModal.grandTotal || selectedOrderDetailsModal.total || 0).toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Modal Footer */}
              <div style={{ padding: '1rem 1.5rem', backgroundColor: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    printTaxInvoice(selectedOrderDetailsModal, siteSettings);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ display: 'flex', gap: '6px', alignItems: 'center' }}
                >
                  <FileText size={14} />
                  <span>Print Tax Invoice & Challan</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrderDetailsModal(null)}
                  className="btn btn-primary btn-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderLiveTrackingView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Live Fleet Logistics Telemetry</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.5rem' }}>
          <p style={{ color: theme.textMuted }}>Interactive GPS fleet dispatch map with 60-minute site arrival guarantee simulation.</p>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 6. USERS
  // -------------------------------------------------------------
  function renderVendorsView() {
    const filteredVendors = vendors.filter((v) => {
      const q = vendorSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (v.businessName && v.businessName.toLowerCase().includes(q)) ||
        (v.name && v.name.toLowerCase().includes(q)) ||
        (v.email && v.email.toLowerCase().includes(q));
      const matchesStatus = vendorStatusFilter === 'All' || v.vendorStatus === vendorStatusFilter.toLowerCase();
      return matchesQuery && matchesStatus;
    });

    const pendingCount = vendors.filter((v) => v.vendorStatus === 'pending').length;
    const approvedCount = vendors.filter((v) => v.vendorStatus === 'approved').length;
    const rejectedCount = vendors.filter((v) => v.vendorStatus === 'rejected').length;

    const statusPillStyle = (status) => ({
      display: 'inline-flex',
      padding: '3px 10px',
      borderRadius: '999px',
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'capitalize',
      backgroundColor: status === 'approved' ? '#DCFCE7' : status === 'rejected' ? '#FEE2E2' : '#FEF3C7',
      color: status === 'approved' ? '#166534' : status === 'rejected' ? '#991B1B' : '#92400E',
    });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: 0 }}>Vendors</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.84rem', margin: '4px 0 0 0' }}>
            Approve or reject marketplace sellers who register at /vendor.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
          {[
            { label: 'Total Vendors', value: vendors.length },
            { label: 'Pending Approval', value: pendingCount },
            { label: 'Approved', value: approvedCount },
            { label: 'Rejected', value: rejectedCount },
          ].map((card) => (
            <div key={card.label} style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, padding: '12px 16px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>{card.label}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textDark, marginTop: '2px' }}>{card.value}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={vendorSearch}
            onChange={(e) => setVendorSearch(e.target.value)}
            placeholder="Search vendors by name, business, or email…"
            style={{ flex: 1, minWidth: '220px', padding: '0.55rem 0.9rem', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`, fontSize: '0.85rem' }}
          />
          <select
            value={vendorStatusFilter}
            onChange={(e) => setVendorStatusFilter(e.target.value)}
            style={{ padding: '0.55rem 0.9rem', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`, fontSize: '0.85rem' }}
          >
            {['All', 'Pending', 'Approved', 'Rejected'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeaderBg, textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Business</th>
                <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: theme.textMuted }}>
                    {isLoadingVendors ? 'Loading…' : 'No vendors found.'}
                  </td>
                </tr>
              )}
              {filteredVendors.map((v) => (
                <tr key={v._id} style={{ borderTop: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{v.businessName || '—'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div>{v.name}</div>
                    <div style={{ color: theme.textMuted, fontSize: '0.78rem' }}>{v.email || v.phone}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={statusPillStyle(v.vendorStatus)}>{v.vendorStatus}</span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>
                    {v.vendorStatus !== 'approved' && (
                      <button
                        onClick={() => setVendorApprovalStatus(v._id, 'approved')}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', background: '#166534', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', marginRight: '8px' }}
                      >
                        Approve
                      </button>
                    )}
                    {v.vendorStatus !== 'rejected' && (
                      <button
                        onClick={() => setVendorApprovalStatus(v._id, 'rejected')}
                        style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: `1px solid #FCA5A5`, background: '#FEF2F2', color: '#991B1B', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}
                      >
                        Reject
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderUsersView(title) {
    const filteredUsers = (usersList || []).filter((u) => {
      const q = userSearchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone && u.phone.includes(q)) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        (u.city && u.city.toLowerCase().includes(q)) ||
        (u.gstin && u.gstin.toLowerCase().includes(q));

      const matchesStatus =
        userStatusFilter === 'all' ||
        (userStatusFilter === 'Active' && (u.status === 'Active' || !u.status)) ||
        (userStatusFilter === 'Deactivated' && (u.status === 'Deactivated' || u.status === 'Inactive'));

      const matchesRole =
        userRoleFilter === 'all' ||
        (u.role && u.role.toLowerCase() === userRoleFilter.toLowerCase());

      return matchesQuery && matchesStatus && matchesRole;
    });

    const totalAccounts = (usersList || []).length;
    const activeCount = (usersList || []).filter((u) => u.status === 'Active' || !u.status).length;
    const deactivatedCount = (usersList || []).filter((u) => u.status === 'Deactivated' || u.status === 'Inactive').length;
    const contractorCount = (usersList || []).filter((u) => (u.role || '').toLowerCase() === 'contractor' || u.tier).length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: 0 }}>
              {title} Directory & Customer Accounts
            </h1>
            <p style={{ color: theme.textMuted, fontSize: '0.84rem', margin: '4px 0 0 0' }}>
              Manage registered buyers, contractors, wholesale verification tiers, and access permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddUserModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '0.6rem 1.1rem',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Plus size={16} />
            <span>Add User / Contractor</span>
          </button>
        </div>

        {/* Stats Strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Registered</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: theme.textDark, marginTop: '2px' }}>{totalAccounts}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase' }}>Active Accounts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>{activeCount}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase' }}>Deactivated</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>{deactivatedCount}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', border: `1px solid ${theme.cardBorder}`, padding: '12px 16px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A', textTransform: 'uppercase' }}>Contractors / Tiered</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0A0A0A', marginTop: '2px' }}>{contractorCount}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          {/* Search Box */}
          <div style={{ position: 'relative', flex: '1', minWidth: '240px', maxWidth: '380px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by name, phone, email, company, city, GSTIN..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                outline: 'none',
                color: '#0F172A',
              }}
            />
          </div>

          {/* Filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <select
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Active">Active Only</option>
              <option value="Deactivated">Deactivated Only</option>
            </select>

            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #CBD5E1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#0F172A',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Contractor">Contractor</option>
              <option value="Mistri">Mistri</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.sidebarBorder}`, color: '#64748B' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>User / Company</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Contact Info</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Role & Tier</th>
                  <th style={{ padding: '0.85rem 1rem' }}>City / GSTIN</th>
                  <th style={{ padding: '0.85rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '2.5rem 1rem', textAlign: 'center', color: '#94A3B8' }}>
                      <Users size={36} style={{ opacity: 0.35, marginBottom: '8px' }} />
                      <div style={{ fontWeight: 600, fontSize: '0.92rem' }}>No registered users found matching your criteria.</div>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isActive = u.status === 'Active' || !u.status;
                    return (
                      <tr key={u.id} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                        {/* Name & Company */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                backgroundColor: '#E2E8F0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 800,
                                color: '#0F172A',
                                fontSize: '0.9rem',
                                flexShrink: 0,
                              }}
                            >
                              {(u.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 800, color: theme.textDark }}>{u.name}</div>
                              <div style={{ fontSize: '0.74rem', color: theme.textMuted }}>
                                {u.company || 'Individual Account'}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact Info (Phone & Email) */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: '#0F172A' }}>
                            <Phone size={13} color="#64748B" />
                            <span>{u.phone || 'No phone'}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.76rem', color: u.email ? '#64748B' : '#94A3B8', marginTop: '2px' }}>
                            <Mail size={13} color={u.email ? '#64748B' : '#CBD5E1'} />
                            <span>{u.email || <em style={{ color: '#94A3B8' }}>No email (Phone only)</em>}</span>
                          </div>
                        </td>

                        {/* Role & Tier */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FFF8E1', color: '#0A0A0A', fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase' }}>
                            {u.role || 'Customer'}
                          </div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginTop: '3px' }}>
                            {u.tier || 'Standard Builder Tier'}
                          </div>
                        </td>

                        {/* City / GSTIN */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontSize: '0.8rem', color: '#0F172A', fontWeight: 600 }}>
                            {u.city || 'Not specified'}
                          </div>
                          <div style={{ fontSize: '0.72rem', fontFamily: 'monospace', color: '#64748B', marginTop: '2px' }}>
                            GSTIN: {u.gstin || 'N/A'}
                          </div>
                        </td>

                        {/* Status Toggle Button */}
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <button
                            type="button"
                            onClick={() => toggleUserStatus(u.id)}
                            title={isActive ? 'Click to deactivate this user account' : 'Click to reactivate this user account'}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 10px',
                              borderRadius: '12px',
                              border: isActive ? '1px solid #E5E7EB' : '1px solid #E5E7EB',
                              backgroundColor: isActive ? '#F2F2F2' : '#F2F2F2',
                              color: isActive ? '#0A0A0A' : '#0A0A0A',
                              fontWeight: 700,
                              fontSize: '0.74rem',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            <span>{isActive ? 'Active' : 'Deactivated'}</span>
                          </button>
                        </td>

                        {/* Actions (Edit / Delete / Deactivate) */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditUserModal(u)}
                              title="Edit user details"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: '1px solid #E2E8F0',
                                backgroundColor: '#F8FAFC',
                                color: '#0F172A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Edit2 size={14} />
                            </button>

                            {/* Deactivate / Reactivate Quick Button */}
                            <button
                              type="button"
                              onClick={() => toggleUserStatus(u.id)}
                              title={isActive ? 'Deactivate User' : 'Activate User'}
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: isActive ? '1px solid #E5E7EB' : '1px solid #E5E7EB',
                                backgroundColor: isActive ? '#F2F2F2' : '#F2F2F2',
                                color: isActive ? '#0A0A0A' : '#0A0A0A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              {isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteUserConfirm(u.id, u.name)}
                              title="Permanently delete user"
                              style={{
                                padding: '6px',
                                borderRadius: '6px',
                                border: '1px solid #F2F2F2',
                                backgroundColor: '#F2F2F2',
                                color: '#0A0A0A',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add or Edit User */}
        {isUserModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
            onClick={() => setIsUserModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
                border: '1px solid #E2E8F0',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div
                style={{
                  padding: '1.25rem 1.5rem',
                  borderBottom: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: '#F8FAFC',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    {editingUser ? `Edit User: ${editingUser.name}` : 'Register New User / Contractor'}
                  </h3>
                  <div style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '2px' }}>
                    {editingUser ? 'Update account details, role permissions, and access status.' : 'Create a registered account with custom verification tier.'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveUser} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Patel"
                      value={userFormData.name}
                      onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98260 00000"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@email.com (optional)"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      {editingUser ? 'Reset Password (Leave blank to keep)' : 'Initial Password'}
                    </label>
                    <input
                      type="password"
                      placeholder={editingUser ? '••••••••' : 'Default: Mistri@123'}
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Company / Business Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Patel Construction Co."
                      value={userFormData.company}
                      onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      GSTIN (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="23AAAAA0000A1Z5"
                      value={userFormData.gstin}
                      onChange={(e) => setUserFormData({ ...userFormData, gstin: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        textTransform: 'uppercase',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      City / Location
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Indore"
                      value={userFormData.city}
                      onChange={(e) => setUserFormData({ ...userFormData, city: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Role
                    </label>
                    <select
                      value={userFormData.role}
                      onChange={(e) => setUserFormData({ ...userFormData, role: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="Customer">Customer</option>
                      <option value="Contractor">Contractor</option>
                      <option value="Mistri">Mistri</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                      Account Status
                    </label>
                    <select
                      value={userFormData.status}
                      onChange={(e) => setUserFormData({ ...userFormData, status: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1.5px solid #CBD5E1',
                        fontSize: '0.85rem',
                        outline: 'none',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="Active">Active</option>
                      <option value="Deactivated">Deactivated</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
                    Contractor Tier
                  </label>
                  <select
                    value={userFormData.tier}
                    onChange={(e) => setUserFormData({ ...userFormData, tier: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.75rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="Standard Builder Tier">Standard Builder Tier</option>
                    <option value="Silver Contractor Tier">Silver Contractor Tier (Wholesale Pricing)</option>
                    <option value="Gold Builder VIP">Gold Builder VIP (Priority Dispatch + 3% Rebate)</option>
                    <option value="Platinum Infrastructure">Platinum Infrastructure (Dedicated Site Manager)</option>
                  </select>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '10px', marginTop: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsUserModalOpen(false)}
                    style={{
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#64748B',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '0.6rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {editingUser ? 'Save Changes' : 'Create User Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // 7. COUPONS, BANNERS, BOOKINGS, SERVICES, QUOTES, SETTINGS
  // -------------------------------------------------------------
  function renderCouponsView() {
    const q = (couponSearchQuery || '').toLowerCase().trim();
    const filteredCoupons = coupons.filter((c) => {
      const matchSearch =
        !q ||
        (c.code && c.code.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.badge && c.badge.toLowerCase().includes(q));

      const matchStatus =
        couponStatusFilter === 'all'
          ? true
          : couponStatusFilter === 'active'
          ? c.isActive !== false
          : c.isActive === false;

      return matchSearch && matchStatus;
    });

    const activeCount = coupons.filter((c) => c.isActive !== false).length;
    const disabledCount = coupons.filter((c) => c.isActive === false).length;
    const totalClaims = coupons.reduce((sum, c) => sum + (Number(c.usageCount) || 0), 0);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Top Header & Add Button */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: '0 0 4px 0' }}>
              Coupons & Promo Codes Management
            </h1>
            <p style={{ fontSize: '0.85rem', color: theme.textMuted, margin: 0 }}>
              Create discount coupons, set minimum order values, percentage or flat discounts, and make them available to customers on the storefront.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenAddCouponModal}
            style={{
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Plus size={18} />
            <span>Create New Promo / Coupon</span>
          </button>
        </div>

        {/* Quick KPI Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ fontSize: '0.78rem', color: theme.textMuted, fontWeight: 700, marginBottom: '4px' }}>Total Promos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: theme.textDark }}>{coupons.length}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ fontSize: '0.78rem', color: '#0A0A0A', fontWeight: 700, marginBottom: '4px' }}>Active on Storefront</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0A0A' }}>{activeCount}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ fontSize: '0.78rem', color: '#0A0A0A', fontWeight: 700, marginBottom: '4px' }}>Total Customer Claims</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0A0A' }}>{totalClaims}</div>
          </div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <div style={{ fontSize: '0.78rem', color: '#0A0A0A', fontWeight: 700, marginBottom: '4px' }}>Disabled / Inactive</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0A0A0A' }}>{disabledCount}</div>
          </div>
        </div>

        {/* Search Bar & Filter Tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Promos (${coupons.length})` },
              { id: 'active', label: `Active (${activeCount})` },
              { id: 'disabled', label: `Disabled (${disabledCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCouponStatusFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: couponStatusFilter === tab.id ? '#0F172A' : '#F1F5F9',
                  color: couponStatusFilter === tab.id ? '#FFFFFF' : theme.textDark,
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search coupon code or description..."
              value={couponSearchQuery}
              onChange={(e) => setCouponSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '7px',
                paddingBottom: '7px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Coupons List / Cards */}
        {filteredCoupons.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
            <Tag size={48} color="#CBD5E1" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.textDark, margin: '0 0 4px 0' }}>No Coupons Found</h3>
            <p style={{ fontSize: '0.85rem', color: theme.textMuted, margin: 0 }}>
              {couponSearchQuery ? 'No coupons matched your search criteria.' : 'Click "Create New Promo / Coupon" to add your first promotion.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '14px' }}>
            {filteredCoupons.map((c) => {
              const isFlat = c.discountType === 'flat' || (Number(c.flatAmount) > 0 && !Number(c.discountPercentage));
              const discountText = isFlat ? `₹${(c.flatAmount || c.discountAmount || 0).toLocaleString('en-IN')} FLAT OFF` : `${c.discountPercentage || 0}% OFF`;

              return (
                <div
                  key={c.code}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '14px',
                    border: `1.5px solid ${c.isActive !== false ? '#E2E8F0' : '#E5E7EB'}`,
                    padding: '16px',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '12px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Top Status & Badge */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            border: '1.5px dashed #0A0A0A',
                            backgroundColor: '#FFF8E1',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '0.95rem',
                            fontWeight: 800,
                            color: '#0A0A0A',
                            letterSpacing: '1px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <Tag size={14} />
                          <span>{c.code}</span>
                        </div>

                        {c.badge && (
                          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: '#0A0A0A', backgroundColor: '#FFF8E1', padding: '2px 6px', borderRadius: '4px' }}>
                            {c.badge}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleCouponStatus(c.code)}
                        style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          border: 'none',
                          backgroundColor: c.isActive !== false ? '#F2F2F2' : '#F2F2F2',
                          color: c.isActive !== false ? '#0A0A0A' : '#0A0A0A',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                          cursor: 'pointer',
                        }}
                      >
                        {c.isActive !== false ? '● Active on Store' : '○ Disabled'}
                      </button>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0A0A0A', marginBottom: '4px' }}>
                      {discountText}
                    </div>

                    <p style={{ fontSize: '0.82rem', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.4 }}>
                      {c.description || 'Special promo offer on construction materials and site supplies.'}
                    </p>

                    {/* Criteria Details */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.75rem', color: '#64748B' }}>
                      <span style={{ backgroundColor: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        Min Order: <strong>₹{(c.minOrderValue || 0).toLocaleString('en-IN')}</strong>
                      </span>
                      {!isFlat && c.maxDiscount > 0 && (
                        <span style={{ backgroundColor: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                          Max Discount: <strong>₹{c.maxDiscount.toLocaleString('en-IN')}</strong>
                        </span>
                      )}
                      <span style={{ backgroundColor: '#F8FAFC', padding: '3px 8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                        Usage: <strong>{c.usageCount || 0} times</strong>
                      </span>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #F1F5F9' }}>
                    <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
                      {c.expiryDate ? `Expires: ${new Date(c.expiryDate).toLocaleDateString()}` : 'Never expires'}
                    </span>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditCouponModal(c)}
                        style={{
                          backgroundColor: '#F1F5F9',
                          color: '#334155',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 10px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Edit2 size={13} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteCouponConfirm(c.code)}
                        style={{
                          backgroundColor: '#F2F2F2',
                          color: '#0A0A0A',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                        title="Delete coupon"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Create / Edit Coupon Modal */}
        {isCouponModalOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              padding: '16px',
            }}
            onClick={() => setIsCouponModalOpen(false)}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '560px',
                maxHeight: '90vh',
                overflowY: 'auto',
                padding: '24px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid #E2E8F0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
                    <Tag size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                      {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create New Promo / Coupon'}
                    </h3>
                    <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      Customers can apply this promo code on the Cart and Checkout pages
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Coupon Code Input */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Promo Code (e.g. BUILDMYDESTINY100, SITE500) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BUILDER20"
                    value={couponFormData.code}
                    onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1.5px solid #CBD5E1',
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                    }}
                  />
                </div>

                {/* Offer Description */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Offer Description / Summary
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat ₹500 Off on Cement & Steel Orders over ₹5,000"
                    value={couponFormData.description}
                    onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                {/* Discount Type Selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                    Discount Calculation Type
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setCouponFormData({ ...couponFormData, discountType: 'percentage' })}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1.5px solid ${couponFormData.discountType === 'percentage' ? '#0A0A0A' : '#E2E8F0'}`,
                        backgroundColor: couponFormData.discountType === 'percentage' ? '#F2F2F2' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: couponFormData.discountType === 'percentage' ? '#0A0A0A' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      % Percentage Discount
                    </button>

                    <button
                      type="button"
                      onClick={() => setCouponFormData({ ...couponFormData, discountType: 'flat' })}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1.5px solid ${couponFormData.discountType === 'flat' ? '#0A0A0A' : '#E2E8F0'}`,
                        backgroundColor: couponFormData.discountType === 'flat' ? '#F2F2F2' : '#FFFFFF',
                        fontWeight: 700,
                        fontSize: '0.84rem',
                        color: couponFormData.discountType === 'flat' ? '#0A0A0A' : '#475569',
                        cursor: 'pointer',
                      }}
                    >
                      ₹ Flat Rupee Amount Off
                    </button>
                  </div>
                </div>

                {/* Values row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {couponFormData.discountType === 'percentage' ? (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Discount Percentage (%) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        required
                        value={couponFormData.discountPercentage}
                        onChange={(e) => setCouponFormData({ ...couponFormData, discountPercentage: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700 }}
                      />
                    </div>
                  ) : (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Flat Discount Amount (₹) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={couponFormData.flatAmount}
                        onChange={(e) => setCouponFormData({ ...couponFormData, flatAmount: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700 }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Minimum Order Value (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={couponFormData.minOrderValue}
                      onChange={(e) => setCouponFormData({ ...couponFormData, minOrderValue: e.target.value })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700 }}
                    />
                  </div>
                </div>

                {/* Optional Max Discount Cap & Badge */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  {couponFormData.discountType === 'percentage' && (
                    <div>
                      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                        Maximum Discount Cap (₹)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0 for unlimited"
                        value={couponFormData.maxDiscount}
                        onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                      />
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                      Badge Tag (e.g. TRENDING, BEST VALUE)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EXCLUSIVE"
                      value={couponFormData.badge}
                      onChange={(e) => setCouponFormData({ ...couponFormData, badge: e.target.value.toUpperCase() })}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                    Expiry Date (Optional - Leave blank for no expiry)
                  </label>
                  <input
                    type="date"
                    value={couponFormData.expiryDate}
                    onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem' }}
                  />
                </div>

                {/* Active Toggle */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <input
                    type="checkbox"
                    checked={couponFormData.isActive}
                    onChange={(e) => setCouponFormData({ ...couponFormData, isActive: e.target.checked })}
                    style={{ width: '18px', height: '18px', accentColor: '#0A0A0A' }}
                  />
                  <div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>Active & Visible on Storefront</span>
                    <span style={{ display: 'block', fontSize: '0.74rem', color: '#64748B' }}>When active, customers can see and apply this promo code</span>
                  </div>
                </label>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(false)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      backgroundColor: '#FFFFFF',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    style={{
                      padding: '8px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    {editingCoupon ? 'Save Changes' : 'Create Promo Code'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderBannersView() {
    const filteredBanners = banners.filter((b) => {
      const matchPos =
        bannerPosFilter === 'all'
          ? true
          : bannerPosFilter === 'hero'
          ? b.position === 'hero' || !b.position
          : b.position === 'bottom';
      const q = bannerSearchQuery.toLowerCase();
      const matchSearch =
        !q ||
        (b.title && b.title.toLowerCase().includes(q)) ||
        (b.subtitle && b.subtitle.toLowerCase().includes(q)) ||
        (b.badge && b.badge.toLowerCase().includes(q));
      return matchPos && matchSearch;
    });

    const heroCount = banners.filter((b) => b.position === 'hero' || !b.position).length;
    const bottomCount = banners.filter((b) => b.position === 'bottom').length;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Header Title & Actions */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, marginBottom: '4px' }}>
              Hero & Bottom Banner Management
            </h1>
            <p style={{ fontSize: '0.85rem', color: theme.textMuted }}>
              Create, edit, upload images, and control active status for top hero carousel and bottom promo banners.
            </p>
          </div>
          <button
            onClick={handleOpenAddBannerModal}
            style={{
              backgroundColor: theme.primaryBlue,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.25rem',
              fontWeight: 700,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            }}
          >
            <Plus size={18} />
            <span>Add New Banner</span>
          </button>
        </div>

        {/* Position Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', backgroundColor: '#FFFFFF', padding: '0.75rem 1rem', borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All Banners (${banners.length})` },
              { id: 'hero', label: `Hero Carousel (Top) (${heroCount})` },
              { id: 'bottom', label: `Bottom Promo Banners (${bottomCount})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setBannerPosFilter(tab.id)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: bannerPosFilter === tab.id ? theme.primaryBlue : '#F1F5F9',
                  color: bannerPosFilter === tab.id ? '#FFFFFF' : theme.textDark,
                  transition: 'all 0.2s ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', minWidth: '240px' }}>
            <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search banners..."
              value={bannerSearchQuery}
              onChange={(e) => setBannerSearchQuery(e.target.value)}
              style={{
                width: '100%',
                paddingLeft: '36px',
                paddingRight: '12px',
                paddingTop: '6px',
                paddingBottom: '6px',
                borderRadius: '8px',
                border: `1px solid ${theme.cardBorder}`,
                fontSize: '0.82rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Banners Grid */}
        {filteredBanners.length === 0 ? (
          <div style={{ backgroundColor: '#FFFFFF', padding: '3rem 1.5rem', textAlign: 'center', borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
            <ImageIcon size={48} color="#CBD5E1" style={{ marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: theme.textDark }}>No Banners Found</h3>
            <p style={{ fontSize: '0.85rem', color: theme.textMuted, marginTop: '4px' }}>
              Click "Add New Banner" to create your first homepage banner.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {filteredBanners.map((b) => {
              const isHero = b.position === 'hero' || !b.position;
              return (
                <div
                  key={b.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '16px',
                    border: `1px solid ${theme.cardBorder}`,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                >
                  {/* Banner Image / Graphic Preview */}
                  <div style={{ position: 'relative', height: '150px', backgroundColor: '#0A0A0A', overflow: 'hidden' }}>
                    {b.image ? (
                      <img
                        src={typeof b.image === 'object' ? b.image?.url : b.image}
                        alt={b.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: b.gradient || 'linear-gradient(135deg, #0A0A0A 0%, #262626 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          padding: '1rem',
                          color: '#FFFFFF',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>{b.title}</div>
                      </div>
                    )}

                    {/* Position Badge Overlay */}
                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: isHero ? '#0A0A0A' : '#0A0A0A',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                          textTransform: 'uppercase',
                        }}
                      >
                        {isHero ? '⭐ Hero Banner (Top)' : '📢 Bottom Banner (Promo)'}
                      </span>
                    </div>

                    {/* Active Status Badge Overlay */}
                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: '20px',
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          backgroundColor: b.isActive !== false ? '#0A0A0A' : '#64748B',
                          color: '#FFFFFF',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                        }}
                      >
                        {b.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  {/* Banner Info Details */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', gap: '1rem' }}>
                    <div>
                      {b.badge && (
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: theme.primaryBlue, backgroundColor: '#FFF8E1', padding: '3px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                          {b.badge}
                        </span>
                      )}
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: theme.textDark, marginTop: b.badge ? '6px' : 0, marginBottom: '4px' }}>
                        {b.title}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: theme.textMuted, lineHeight: '1.4' }}>
                        {b.subtitle || b.desc}
                      </p>
                      {(b.ctaText || b.cta) && (
                        <div style={{ marginTop: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A' }}>
                          Button: "{b.ctaText || b.cta}" {b.target ? `→ Target: ${b.target}` : ''}
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '0.85rem' }}>
                      <button
                        onClick={() => toggleBannerStatus(b.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'none',
                          border: `1px solid ${b.isActive !== false ? '#F1F5F9' : '#E2E8F0'}`,
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: b.isActive !== false ? '#0A0A0A' : '#64748B',
                        }}
                      >
                        {b.isActive !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                        <span>{b.isActive !== false ? 'Hide' : 'Show'}</span>
                      </button>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          onClick={() => handleOpenEditBannerModal(b)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${theme.cardBorder}`,
                            backgroundColor: '#F8FAFC',
                            color: theme.primaryBlue,
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Edit2 size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this banner?')) {
                              deleteBanner(b.id);
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #F2F2F2',
                            backgroundColor: '#F2F2F2',
                            color: '#0A0A0A',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add / Edit Banner Modal */}
        {isBannerModalOpen && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(15, 23, 42, 0.65)',
              backdropFilter: 'blur(4px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '540px',
                maxHeight: '90vh',
                overflowY: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.3)',
                border: `1px solid ${theme.cardBorder}`,
                margin: 'auto',
              }}
            >
              {/* Modal Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: theme.textDark }}>
                  {editingBanner ? 'Edit Banner' : 'Create New Banner'}
                </h2>
                <button
                  onClick={() => setIsBannerModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSaveBanner} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
                {/* Position Selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                    Banner Position on Storefront *
                  </label>
                  <select
                    value={bannerFormData.position}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, position: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                    }}
                  >
                    <option value="hero">Top Hero Carousel Banner</option>
                    <option value="bottom">Bottom Promo Banner (Above Footer)</option>
                  </select>
                </div>

                {/* Banner Title */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                    Banner Headline / Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Original Plywood & MDF"
                    value={bannerFormData.title}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, title: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                {/* Banner Subtitle */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                    Subtitle / Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short description highlighting offer or feature"
                    value={bannerFormData.subtitle}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, subtitle: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: '0.85rem',
                    }}
                  />
                </div>

                {/* Badge & CTA Button text */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                      Badge Text (Tag)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WHOLESALE PRICES"
                      value={bannerFormData.badge}
                      onChange={(e) => setBannerFormData((prev) => ({ ...prev, badge: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                      Button CTA Text
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. ORDER NOW"
                      value={bannerFormData.ctaText}
                      onChange={(e) => setBannerFormData((prev) => ({ ...prev, ctaText: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.65rem 0.85rem',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>
                </div>

                {/* Target Link / Redirect Product Destination */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                    Redirect Destination on Click *
                  </label>
                  <select
                    value={bannerFormData.target}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, target: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      marginBottom: '8px',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <option value="products">All Products Catalog</option>
                    <option value="plywood-mdf-hdhmr">Plywood, MDF & HDHMR</option>
                    <option value="cement">Cement (UltraTech, Ambuja, ACC)</option>
                    <option value="tmt-steel-bars">TMT Steel Bars & Rebars</option>
                    <option value="tiles-granite">Ceramic & Vitrified Tiles</option>
                    <option value="electrical-wires">Electrical Wires & Switches</option>
                    <option value="paints-putty">Paints, Emulsions & Wall Putty</option>
                    <option value="plumbing-cpvc">Plumbing Pipes & CPVC Fittings</option>
                    <option value="mistris">Book Technician / Mistri Services</option>
                    <option value="contact">Get Bulk Wholesale Quote</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Or enter custom category slug / product link"
                    value={bannerFormData.target}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, target: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                {/* Direct Image Upload Box */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                    Banner Image *
                  </label>
                  {bannerFormData.image ? (
                    <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: `2px solid ${theme.cardBorder}`, backgroundColor: '#F8FAFC' }}>
                      <img
                        src={typeof bannerFormData.image === 'object' ? bannerFormData.image?.url : bannerFormData.image}
                        alt="Banner Preview"
                        style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '8px',
                          display: 'flex',
                          gap: '6px',
                          backgroundColor: 'rgba(15, 23, 42, 0.75)',
                          backdropFilter: 'blur(4px)',
                          padding: '4px 8px',
                          borderRadius: '8px',
                        }}
                      >
                        <label
                          style={{
                            color: '#FFFFFF',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <UploadCloud size={14} />
                          <span>Change</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBannerFileUpload}
                            style={{ display: 'none' }}
                            disabled={isBannerUploading}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setBannerFormData((prev) => ({ ...prev, image: '' }))}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#6B7280',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '1.75rem 1rem',
                        borderRadius: '12px',
                        border: `2px dashed ${theme.cardBorder}`,
                        backgroundColor: '#F8FAFC',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          backgroundColor: '#FFF8E1',
                          color: theme.primaryBlue,
                          display: 'flex',
                          alignItems: 'center',
                          justify: 'center',
                          marginBottom: '8px',
                        }}
                      >
                        <UploadCloud size={22} />
                      </div>
                      <span style={{ fontSize: '0.88rem', fontWeight: '800', color: theme.textDark }}>
                        {isBannerUploading ? 'Uploading Image...' : 'Click to Upload Banner Image'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: theme.textMuted, marginTop: '4px' }}>
                        Supports PNG, JPG, WEBP (Direct File Upload)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerFileUpload}
                        style={{ display: 'none' }}
                        disabled={isBannerUploading}
                      />
                    </label>
                  )}
                </div>

                {/* Banner Display & Fitting Adjustments */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#F8FAFC', padding: '1rem', borderRadius: '10px', border: `1px solid ${theme.cardBorder}` }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                      Text Display Mode
                    </label>
                    <select
                      value={bannerFormData.showTextOverlay !== false ? 'overlay' : 'image_only'}
                      onChange={(e) => setBannerFormData((prev) => ({ ...prev, showTextOverlay: e.target.value === 'overlay' }))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="overlay">Overlay Title, Subtitle & Button on Image</option>
                      <option value="image_only">Pure Image Only (Hide text overlay)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: theme.textDark, marginBottom: '6px' }}>
                      Image Fitting Mode
                    </label>
                    <select
                      value={bannerFormData.imageFit || 'cover'}
                      onChange={(e) => setBannerFormData((prev) => ({ ...prev, imageFit: e.target.value }))}
                      style={{
                        width: '100%',
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: `1px solid ${theme.cardBorder}`,
                        fontSize: '0.82rem',
                        fontWeight: 600,
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <option value="cover">Cover (Fill & scale banner container)</option>
                      <option value="contain">Contain (Fit full image inside container)</option>
                    </select>
                  </div>
                </div>

                {/* Dimensions Guidance Tip */}
                <div style={{ fontSize: '0.75rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span>💡 <strong>Tip:</strong> Recommended banner resolution for Hero Carousel is <strong>1200 × 400px (3:1)</strong> and Bottom Promo is <strong>1200 × 250px (5:1)</strong>.</span>
                </div>

                {/* Active Checkbox */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <input
                    type="checkbox"
                    id="bannerActiveCheckbox"
                    checked={bannerFormData.isActive}
                    onChange={(e) => setBannerFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="bannerActiveCheckbox" style={{ fontSize: '0.85rem', fontWeight: 700, color: theme.textDark, cursor: 'pointer' }}>
                    Publish Banner (Active on Storefront)
                  </label>
                </div>

                {/* Submit / Cancel Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem', borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '1rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsBannerModalOpen(false)}
                    style={{
                      padding: '0.65rem 1.25rem',
                      borderRadius: '8px',
                      border: `1px solid ${theme.cardBorder}`,
                      backgroundColor: '#FFFFFF',
                      color: theme.textDark,
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      padding: '0.65rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: theme.primaryBlue,
                      color: '#FFFFFF',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                    }}
                  >
                    {editingBanner ? 'Save Changes' : 'Publish Banner'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  function renderBookingsView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Technician Bookings Scheduler</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.sidebarBorder}`, color: '#64748B' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Booking ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                <th style={{ padding: '0.75rem 1rem' }}>Service</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assigned Mistri</th>
                <th style={{ padding: '0.75rem 1rem' }}>Time Slot</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: theme.primaryBlue }}>{b.id}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.customerName}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{b.serviceTitle}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.mistriName || 'Unassigned'}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>{b.date} ({b.timeSlot})</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFF8E1', color: theme.primaryBlue, fontWeight: 700, fontSize: '0.72rem' }}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderServicesView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Services Catalogue</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
          {services.map((s) => (
            <div key={s.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '14px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem' }}>
              <img src={s.image} alt={s.title} style={{ width: '100%', height: '120px', borderRadius: '10px', objectFit: 'cover', marginBottom: '0.75rem' }} />
              <div style={{ fontWeight: 800, color: theme.textDark, fontSize: '0.9rem' }}>{s.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#0A0A0A', fontWeight: 800, marginTop: '4px' }}>Base Rate: ₹{s.basePrice} ({s.durationHours} hrs)</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderQuotationsView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Project Quotes & BOQs</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
            <thead>
              <tr style={{ backgroundColor: theme.tableHeaderBg, borderBottom: `1px solid ${theme.sidebarBorder}`, color: '#64748B' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Quote ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Builder / Company</th>
                <th style={{ padding: '0.75rem 1rem' }}>Required Materials</th>
                <th style={{ padding: '0.75rem 1rem' }}>Estimated Value</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {quotations.map((q) => (
                <tr key={q.id} style={{ borderBottom: `1px solid ${theme.tableBorder}` }}>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: theme.primaryBlue }}>{q.id}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>{q.clientName}</div>
                    <div style={{ fontSize: '0.72rem', color: theme.textMuted }}>{q.company}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', maxWidth: '300px' }}>{q.requiredMaterials}</td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0A0A0A' }}>₹{q.estimatedTotal?.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ padding: '2px 8px', borderRadius: '10px', backgroundColor: '#FFF8E1', color: '#0A0A0A', fontWeight: 700, fontSize: '0.72rem' }}>
                      {q.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function renderFaqsView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Support Tickets & FAQs</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem' }}>
          <p style={{ color: theme.textMuted }}>Review user inquiries and manage help center articles.</p>
        </div>
      </div>
    );
  }

  function renderSettingsView() {
    // Simulator Calculations
    const simDiscount = 0;
    const simSubtotalAfterDisc = Math.max(0, simCartSubtotal - simDiscount);
    const currentDelType = siteSettings.deliveryType || 'free';

    let simDelFee = 0;
    let simDelRule = '100% Free Delivery';
    if (simCartSubtotal === 0) {
      simDelFee = 0;
      simDelRule = 'Cart is empty';
    } else if (currentDelType === 'free') {
      simDelFee = 0;
      simDelRule = '100% Free Delivery';
    } else if (currentDelType === 'flat') {
      simDelFee = Number(siteSettings.flatDeliveryFee) || 0;
      simDelRule = `Flat ₹${simDelFee}`;
    } else if (currentDelType === 'min_order_free') {
      const thresh = Number(siteSettings.minFreeDeliveryOrder) || 500;
      const flatF = Number(siteSettings.flatDeliveryFee) || 99;
      if (simCartSubtotal >= thresh) {
        simDelFee = 0;
        simDelRule = `Free (Order >= ₹${thresh.toLocaleString('en-IN')})`;
      } else {
        simDelFee = flatF;
        simDelRule = `₹${flatF} (Order < ₹${thresh.toLocaleString('en-IN')} threshold)`;
      }
    } else if (currentDelType === 'km_based') {
      const km = Number(simDistanceKm) || 5;
      const baseKm = Number(siteSettings.deliveryBaseKm) || 5;
      const baseFee = Number(siteSettings.deliveryBaseFee) || 0;
      const perKm = Number(siteSettings.deliveryPerKmFee) || 15;
      if (km <= baseKm) {
        simDelFee = baseFee;
        simDelRule = baseFee === 0 ? `Free within base ${baseKm} km` : `Base fee ₹${baseFee} (first ${baseKm} km)`;
      } else {
        simDelFee = baseFee + Math.round((km - baseKm) * perKm);
        simDelRule = `Base ₹${baseFee} + ${(km - baseKm)} km × ₹${perKm}/km = ₹${simDelFee}`;
      }
    }

    const simUnloading = (simCartSubtotal > 0 && siteSettings.enableUnloadingFee)
      ? (simCartSubtotal >= (Number(siteSettings.freeUnloadingThreshold) || 50000) ? 0 : (Number(siteSettings.unloadingChargeStandard) || 500))
      : 0;

    const simGstRate = (Number(siteSettings.gstRatePercent) || 18) / 100;
    const simGst = siteSettings.isGstInclusive
      ? Math.round(simSubtotalAfterDisc * (simGstRate / (1 + simGstRate)))
      : Math.round(simSubtotalAfterDisc * simGstRate);

    const simGrandTotal = Math.max(
      0,
      simSubtotalAfterDisc + simDelFee + simUnloading + (siteSettings.isGstInclusive ? 0 : simGst)
    );

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
        {/* Top Header & Save Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
                <Truck size={20} />
              </div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark, margin: 0 }}>
                Platform & Logistics Pricing Engine
              </h1>
            </div>
            <p style={{ color: theme.textMuted, fontSize: '0.86rem', margin: 0 }}>
              Configure delivery freight models (Distance / KM-based, Free, Threshold), site crane unloading fees, GST tax, and company profile.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all platform settings to default values?')) {
                  resetSiteSettings();
                }
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                color: '#475569',
                fontWeight: 600,
                fontSize: '0.84rem',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={15} />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={() => addToast('Platform settings & logistics pricing saved successfully!', 'success')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.65rem 1.4rem',
                backgroundColor: theme.primaryBlue || '#0A0A0A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.86rem',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
              }}
            >
              <CheckCircle size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Delivery Fee & Logistics Pricing Strategy (Core Feature) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#F2F2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
                <Truck size={16} />
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Delivery Fee Strategy
              </h2>
            </div>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: '9999px',
                backgroundColor: currentDelType === 'free' ? '#F2F2F2' : '#FFF8E1',
                color: currentDelType === 'free' ? '#0A0A0A' : '#0A0A0A',
                border: currentDelType === 'free' ? '1px solid #E5E7EB' : '1px solid #FFE08A',
              }}
            >
              Active: {currentDelType === 'free' ? '100% Free Delivery' : currentDelType === 'km_based' ? 'Distance / KM-Based' : currentDelType === 'min_order_free' ? 'Threshold Free' : 'Flat Fee'}
            </span>
          </div>

          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 700, color: '#334155', marginBottom: '10px' }}>
            Select Pricing Model:
          </label>

          {/* 4 Strategy Selection Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '12px',
              marginBottom: '1.5rem',
            }}
          >
            {/* 1. Free Delivery */}
            <div
              onClick={() => updateSiteSettings({ deliveryType: 'free' })}
              style={{
                border: currentDelType === 'free' ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
                backgroundColor: currentDelType === 'free' ? '#F2F2F2' : '#F8FAFC',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: currentDelType === 'free' ? '#0A0A0A' : '#0F172A' }}>
                  🚚 100% Free
                </span>
                <input
                  type="radio"
                  name="deliveryTypeRadio"
                  checked={currentDelType === 'free'}
                  onChange={() => updateSiteSettings({ deliveryType: 'free' })}
                  style={{ accentColor: '#0A0A0A' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                Free delivery on all material & hardware consignments regardless of cart amount.
              </p>
            </div>

            {/* 2. KM / Distance Based */}
            <div
              onClick={() => updateSiteSettings({ deliveryType: 'km_based' })}
              style={{
                border: currentDelType === 'km_based' ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
                backgroundColor: currentDelType === 'km_based' ? '#FFF8E1' : '#F8FAFC',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: currentDelType === 'km_based' ? '#0A0A0A' : '#0F172A' }}>
                  📍 Per KM Distance
                </span>
                <input
                  type="radio"
                  name="deliveryTypeRadio"
                  checked={currentDelType === 'km_based'}
                  onChange={() => updateSiteSettings({ deliveryType: 'km_based' })}
                  style={{ accentColor: '#0A0A0A' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                Dynamically charged based on radial distance from Depot to Site (e.g. ₹15/km).
              </p>
            </div>

            {/* 3. Free Above Order Threshold */}
            <div
              onClick={() => updateSiteSettings({ deliveryType: 'min_order_free' })}
              style={{
                border: currentDelType === 'min_order_free' ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
                backgroundColor: currentDelType === 'min_order_free' ? '#FFF8E1' : '#F8FAFC',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: currentDelType === 'min_order_free' ? '#0A0A0A' : '#0F172A' }}>
                  📦 Free Over Minimum
                </span>
                <input
                  type="radio"
                  name="deliveryTypeRadio"
                  checked={currentDelType === 'min_order_free'}
                  onChange={() => updateSiteSettings({ deliveryType: 'min_order_free' })}
                  style={{ accentColor: '#0A0A0A' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                Free delivery on orders equal/above threshold; flat fee for smaller orders.
              </p>
            </div>

            {/* 4. Flat Rate */}
            <div
              onClick={() => updateSiteSettings({ deliveryType: 'flat' })}
              style={{
                border: currentDelType === 'flat' ? '2px solid #FFB800' : '1px solid #E2E8F0',
                backgroundColor: currentDelType === 'flat' ? '#FFF8E1' : '#F8FAFC',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: currentDelType === 'flat' ? '#0A0A0A' : '#0F172A' }}>
                  🏷️ Flat Delivery Fee
                </span>
                <input
                  type="radio"
                  name="deliveryTypeRadio"
                  checked={currentDelType === 'flat'}
                  onChange={() => updateSiteSettings({ deliveryType: 'flat' })}
                  style={{ accentColor: '#FFB800' }}
                />
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748B', margin: 0, lineHeight: '1.35' }}>
                Standard uniform delivery freight fee applied on every checkout order.
              </p>
            </div>
          </div>

          {/* Model Specific Settings Inputs */}
          {currentDelType === 'km_based' && (
            <div
              style={{
                backgroundColor: '#FFF8E1',
                border: '1px solid #FFE08A',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0A0A0A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} /> Distance / KM-Based Rate Configuration
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Base Free/Standard Distance (KM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.deliveryBaseKm ?? 5}
                    onChange={(e) => updateSiteSettings({ deliveryBaseKm: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Deliveries within this distance incur Base Fee only.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Base Distance Charge (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.deliveryBaseFee ?? 0}
                    onChange={(e) => updateSiteSettings({ deliveryBaseFee: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Set to 0 if the first {siteSettings.deliveryBaseKm || 5} KM is free.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Per KM Fee beyond Base Distance (₹/KM)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.deliveryPerKmFee ?? 15}
                    onChange={(e) => updateSiteSettings({ deliveryPerKmFee: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Rate added per KM after {siteSettings.deliveryBaseKm || 5} KM.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Default / Estimated Site Distance (KM)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={siteSettings.estimatedDeliveryKm ?? 5}
                    onChange={(e) => updateSiteSettings({ estimatedDeliveryKm: Math.max(1, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Used for cart estimation when GPS is unavailable.</span>
                </div>
              </div>

              <div style={{ marginTop: '12px', padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #FFE08A', fontSize: '0.78rem', color: '#0A0A0A' }}>
                <strong>Formula:</strong> Total Delivery Fee = Base Charge (₹{siteSettings.deliveryBaseFee || 0}) + [Max(0, Site Distance - {siteSettings.deliveryBaseKm || 5} km) × ₹{siteSettings.deliveryPerKmFee || 15}/km]
              </div>
            </div>
          )}

          {currentDelType === 'min_order_free' && (
            <div
              style={{
                backgroundColor: '#FFF8E1',
                border: '1px solid #FFF8E1',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0A0A0A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} /> Order Value Threshold Configuration
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Free Delivery Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.minFreeDeliveryOrder ?? 500}
                    onChange={(e) => updateSiteSettings({ minFreeDeliveryOrder: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #FFE08A', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Orders equal to or above this cart value get 100% FREE delivery.</span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Standard Delivery Fee (For Orders Below Threshold) (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.flatDeliveryFee ?? 99}
                    onChange={(e) => updateSiteSettings({ flatDeliveryFee: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #FFE08A', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Charged on orders below ₹{(siteSettings.minFreeDeliveryOrder || 500).toLocaleString('en-IN')}.</span>
                </div>
              </div>
            </div>
          )}

          {currentDelType === 'flat' && (
            <div
              style={{
                backgroundColor: '#FFF8E1',
                border: '1px solid #FFE08A',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0A0A0A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sliders size={16} /> Fixed Flat Rate Configuration
              </div>

              <div style={{ maxWidth: '320px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Flat Delivery Charge per Order (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={siteSettings.flatDeliveryFee ?? 49}
                  onChange={(e) => updateSiteSettings({ flatDeliveryFee: Math.max(0, Number(e.target.value)) })}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #FFB800', fontSize: '0.88rem', fontWeight: 700 }}
                />
                <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Every checkout order will be charged exactly this amount.</span>
              </div>
            </div>
          )}

          {currentDelType === 'free' && (
            <div
              style={{
                backgroundColor: '#F2F2F2',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#0A0A0A',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <CheckCircle size={18} color="#0A0A0A" />
              <span>100% Free delivery is currently enabled for all products, customer carts, and pincodes.</span>
            </div>
          )}
        </div>

        {/* SECTION 2: Interactive Real-Time Bill Calculator Simulator */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
              <Sparkles size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live Interactive Bill & Delivery Simulator
              </h2>
              <p style={{ fontSize: '0.76rem', color: '#64748B', margin: 0 }}>
                Test sample cart amounts and site distances in real-time to verify customer bill calculations.
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', alignItems: 'start' }}>
            {/* Simulator Inputs */}
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <span style={{ fontSize: '0.84rem', fontWeight: 800, color: '#334155' }}>
                🎛️ Simulation Parameters
              </span>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Test Cart Subtotal (₹)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="number"
                    min="0"
                    value={simCartSubtotal}
                    onChange={(e) => setSimCartSubtotal(Math.max(0, Number(e.target.value)))}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.86rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setSimCartSubtotal(555)}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                    title="Set to user test case ₹555"
                  >
                    ₹555 (Case)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimCartSubtotal(55000)}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                    title="Set to bulk ₹55,000"
                  >
                    ₹55k (Bulk)
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Test Site Distance (KM)
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="number"
                    min="1"
                    value={simDistanceKm}
                    onChange={(e) => setSimDistanceKm(Math.max(1, Number(e.target.value)))}
                    style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #CBD5E1', fontWeight: 700, fontSize: '0.86rem' }}
                  />
                  <button
                    type="button"
                    onClick={() => setSimDistanceKm(5)}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    5 km
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimDistanceKm(8)}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    8 km
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimDistanceKm(15)}
                    style={{ padding: '0 8px', borderRadius: '6px', border: '1px solid #CBD5E1', background: '#FFFFFF', fontSize: '0.74rem', cursor: 'pointer', fontWeight: 600 }}
                  >
                    15 km
                  </button>
                </div>
              </div>
            </div>

            {/* Simulator Output Preview Card */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1.5px solid #0A0A0A',
                padding: '16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🧾 Customer Bill Breakdown Preview
                </span>
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FFF8E1', color: '#0A0A0A', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>
                  Live Match
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Item total:</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>₹{simCartSubtotal.toLocaleString('en-IN')}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <div>
                    <span>Delivery Freight:</span>
                    <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>({simDelRule})</span>
                  </div>
                  <span style={{ fontWeight: 700, color: simDelFee === 0 ? '#0A0A0A' : '#0F172A' }}>
                    {simDelFee === 0 ? 'FREE' : `₹${simDelFee.toLocaleString('en-IN')}`}
                  </span>
                </div>

                {siteSettings.enableUnloadingFee && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <div>
                      <span>Site Unloading / Crane:</span>
                      <span style={{ fontSize: '0.72rem', color: '#64748B', display: 'block' }}>
                        {simUnloading === 0 ? 'Free (>= ₹' + (siteSettings.freeUnloadingThreshold || 50000).toLocaleString('en-IN') + ')' : 'Standard Labor Charge'}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: simUnloading === 0 ? '#0A0A0A' : '#0F172A' }}>
                      {simUnloading === 0 ? 'FREE' : `₹${simUnloading.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                  <span>Estimated GST ({siteSettings.gstRatePercent || 18}% {siteSettings.isGstInclusive ? 'Included' : 'ITC Benefit'}):</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>
                    {siteSettings.isGstInclusive ? `(₹${simGst.toLocaleString('en-IN')})` : `₹${simGst.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div style={{ borderTop: '1.5px dashed #CBD5E1', margin: '4px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.96rem', color: '#0F172A' }}>
                    Grand Total:
                  </span>
                  <span style={{ fontWeight: 800, fontSize: '1.3rem', color: '#0F172A' }}>
                    ₹{simGrandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Material Handling & Crane Unloading Charges */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFB800' }}>
                <Package size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Material Unloading & Site Crane Handling Fee
                </h2>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  Optional surcharge for heavy material dispatch (steel, cement, aggregate).
                </span>
              </div>
            </div>

            {/* Toggle Switch */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: siteSettings.enableUnloadingFee ? '#0A0A0A' : '#64748B' }}>
                {siteSettings.enableUnloadingFee ? 'ENABLED (Active)' : 'DISABLED (Recommended for Retail)'}
              </span>
              <input
                type="checkbox"
                checked={Boolean(siteSettings.enableUnloadingFee)}
                onChange={(e) => updateSiteSettings({ enableUnloadingFee: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0A0A0A', cursor: 'pointer' }}
              />
            </label>
          </div>

          {siteSettings.enableUnloadingFee ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Standard Unloading Service Charge (₹)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => updateSiteSettings({ unloadingChargeStandard: Math.max(0, (siteSettings.unloadingChargeStandard ?? 199) - 10) })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Decrease by ₹10"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={siteSettings.unloadingChargeStandard ?? 199}
                      onChange={(e) => updateSiteSettings({ unloadingChargeStandard: Math.max(0, Number(e.target.value)) })}
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.75rem',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        textAlign: 'center',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => updateSiteSettings({ unloadingChargeStandard: (siteSettings.unloadingChargeStandard ?? 199) + 10 })}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#F8FAFC',
                        fontWeight: '800',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      title="Increase by ₹10"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Quick Preset Buttons */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                    {[49, 99, 149, 199, 249, 299, 499].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => updateSiteSettings({ unloadingChargeStandard: amt })}
                        style={{
                          padding: '2px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          borderRadius: '4px',
                          border: siteSettings.unloadingChargeStandard === amt ? '1px solid #0A0A0A' : '1px solid #CBD5E1',
                          backgroundColor: siteSettings.unloadingChargeStandard === amt ? '#FFF8E1' : '#FFFFFF',
                          color: siteSettings.unloadingChargeStandard === amt ? '#0A0A0A' : '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Reflected live in user cart as "Handling Charge" (₹{siteSettings.unloadingChargeStandard ?? 199}).
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Helper Subtitle Label
                  </label>
                  <input
                    type="text"
                    value={siteSettings.unloadingHelperText || '1 Helper'}
                    onChange={(e) => updateSiteSettings({ unloadingHelperText: e.target.value })}
                    placeholder="e.g. 1 Helper, 2 Helpers, Site Crew"
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 600 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Displayed under "Unloading Service" title in user cart.
                  </span>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                    Free Unloading Minimum Order Amount (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={siteSettings.freeUnloadingThreshold ?? 50000}
                    onChange={(e) => updateSiteSettings({ freeUnloadingThreshold: Math.max(0, Number(e.target.value)) })}
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px', display: 'block' }}>
                    Bulk orders equal/above this value get free unloading (₹0).
                  </span>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                  Unloading Notice / Policy Description
                </label>
                <textarea
                  rows={2}
                  value={
                    siteSettings.unloadingDescription ||
                    "Includes unloading & keeping at designated place on ground level. Doesn't include shifting to upper floors."
                  }
                  onChange={(e) => updateSiteSettings({ unloadingDescription: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.82rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                  }}
                />
              </div>

              {/* Customer Live Preview Box */}
              <div style={{ backgroundColor: '#F2F2F2', borderRadius: '12px', border: '1px solid #E5E7EB', padding: '12px' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0A0A0A', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                  Live Customer Preview:
                </span>
                <div style={{ fontSize: '0.74rem', color: '#374151', marginBottom: '8px' }}>
                  {siteSettings.unloadingDescription || "Includes unloading & keeping at designated place on ground level. Doesn't include shifting to upper floors."}
                </div>
                <div style={{ backgroundColor: '#FFFFFF', borderRadius: '10px', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid #E2E8F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>🚚</span>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '0.84rem', color: '#0F172A' }}>Unloading Service</div>
                      <div style={{ fontSize: '0.74rem', color: '#64748B' }}>{siteSettings.unloadingHelperText || '1 Helper'}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', border: '1.5px solid #0A0A0A', color: '#0A0A0A', borderRadius: '6px', padding: '2px 14px', fontSize: '0.78rem', fontWeight: '700' }}>
                      Add
                    </span>
                    <div style={{ fontSize: '0.84rem', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>
                      ₹{siteSettings.unloadingChargeStandard ?? 199}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '10px', padding: '12px 14px', fontSize: '0.8rem', color: '#64748B' }}>
              Unloading fee is currently <strong>disabled</strong>. Customer bills will not include any unloading surcharge.
            </div>
          )}
        </div>

        {/* SECTION 4: GST Tax & Pricing Inclusivity Rules */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
              <DollarSign size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                GST Tax & Pricing Inclusivity
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                Define GST tax rate and choose whether catalog prices are inclusive or exclusive.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Standard GST Rate (%)
              </label>
              <select
                value={siteSettings.gstRatePercent || 18}
                onChange={(e) => updateSiteSettings({ gstRatePercent: Number(e.target.value) })}
                style={{ width: '100%', padding: '0.6rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.88rem', fontWeight: 700, backgroundColor: '#FFFFFF' }}
              >
                <option value="0">0% (GST Exempt / Composite)</option>
                <option value="5">5% (Building Stone / Aggregate)</option>
                <option value="12">12% (Paints & Primers)</option>
                <option value="18">18% (Standard Cement, Steel & Hardware - Recommended)</option>
                <option value="28">28% (Luxury Fittings / White Cement)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '8px' }}>
                Tax Display Mode on Checkout
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gstMode"
                    checked={!siteSettings.isGstInclusive}
                    onChange={() => updateSiteSettings({ isGstInclusive: false })}
                    style={{ accentColor: '#0A0A0A' }}
                  />
                  <span>
                    <strong>Exclusive:</strong> Add GST on top at Checkout (B2B Standard)
                  </span>
                </label>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="gstMode"
                    checked={Boolean(siteSettings.isGstInclusive)}
                    onChange={() => updateSiteSettings({ isGstInclusive: true })}
                    style={{ accentColor: '#0A0A0A' }}
                  />
                  <span>
                    <strong>Inclusive:</strong> Catalog prices already include GST (B2C Retail)
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Serviceable Delivery Areas, Cities, Pincodes & Range Control */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
                <MapPin size={16} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  Serviceable Delivery Areas, Cities, Pincodes & Range Control
                </h2>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  Define depot hub address, maximum delivery radius (KM), and configure exact cities & pincodes where you accept orders.
                </span>
              </div>
            </div>

            {/* Strict Restriction Mode Toggle */}
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', backgroundColor: siteSettings.restrictToServiceableAreas !== false ? '#F2F2F2' : '#F8FAFC', padding: '6px 12px', borderRadius: '8px', border: siteSettings.restrictToServiceableAreas !== false ? '1px solid #E5E7EB' : '1px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: siteSettings.restrictToServiceableAreas !== false ? '#0A0A0A' : '#64748B' }}>
                {siteSettings.restrictToServiceableAreas !== false ? '✅ RESTRICTION ACTIVE (Orders checked)' : '⚪ OPEN (Accept all areas)'}
              </span>
              <input
                type="checkbox"
                checked={siteSettings.restrictToServiceableAreas !== false}
                onChange={(e) => updateSiteSettings({ restrictToServiceableAreas: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: '#0A0A0A', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* 1. Depot Address & Location Details */}
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#F8FAFC', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A1A1A', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building size={16} color="#0A0A0A" />
              <span>Central Depot Dispatch Address</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Full Depot / Warehouse Address
                </label>
                <input
                  type="text"
                  value={siteSettings.depotAddress || ''}
                  onChange={(e) => updateSiteSettings({ depotAddress: e.target.value })}
                  placeholder="e.g. Central Logistics Park, Near Vavdimohala, Kod, Dist- Dhar"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Depot City
                </label>
                <input
                  type="text"
                  value={siteSettings.depotCity || 'Dhar'}
                  onChange={(e) => updateSiteSettings({ depotCity: e.target.value })}
                  placeholder="e.g. Dhar / Indore"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  Depot Pincode
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={siteSettings.depotPincode || '454001'}
                  onChange={(e) => updateSiteSettings({ depotPincode: e.target.value.replace(/\D/g, '') })}
                  placeholder="e.g. 454001"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 700, letterSpacing: '1px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                  State
                </label>
                <input
                  type="text"
                  value={siteSettings.depotState || 'Madhya Pradesh'}
                  onChange={(e) => updateSiteSettings({ depotState: e.target.value })}
                  placeholder="e.g. Madhya Pradesh"
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem', fontWeight: 600 }}
                />
              </div>
            </div>
          </div>

          {/* 2. Maximum Delivery Radius / Range */}
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#FFF8E1', borderRadius: '12px', padding: '14px', border: '1px solid #FFE08A' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0A0A0A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Truck size={16} /> Maximum Delivery Radius / Range from Depot (KM)
                </span>
                <span style={{ fontSize: '0.74rem', color: '#0A0A0A', display: 'block', marginTop: '2px' }}>
                  Orders with calculated distance beyond this radius will be flagged or rejected.
                </span>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#0A0A0A', backgroundColor: '#FFF8E1', padding: '3px 12px', borderRadius: '9999px', border: '1px solid #FFE08A' }}>
                {Number(siteSettings.maxDeliveryRadiusKm) > 0 ? `${siteSettings.maxDeliveryRadiusKm} KM` : 'Unlimited'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input
                type="number"
                min="0"
                max="500"
                value={siteSettings.maxDeliveryRadiusKm ?? 50}
                onChange={(e) => updateSiteSettings({ maxDeliveryRadiusKm: Math.max(0, Number(e.target.value)) })}
                style={{ width: '120px', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.92rem', fontWeight: 800, textAlign: 'center', backgroundColor: '#FFFFFF' }}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[15, 25, 35, 50, 75, 100, 150, 0].map((km) => (
                  <button
                    key={km}
                    type="button"
                    onClick={() => updateSiteSettings({ maxDeliveryRadiusKm: km })}
                    style={{
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      border: siteSettings.maxDeliveryRadiusKm === km ? '1.5px solid #0A0A0A' : '1px solid #CBD5E1',
                      backgroundColor: siteSettings.maxDeliveryRadiusKm === km ? '#0A0A0A' : '#FFFFFF',
                      color: siteSettings.maxDeliveryRadiusKm === km ? '#FFFFFF' : '#334155',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {km === 0 ? 'All / Unlimited' : `${km} km`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Serviceable Cities Manager */}
          <div style={{ marginBottom: '1.5rem', backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  🏙️ Serviceable Operational Cities ({Array.isArray(siteSettings.serviceableCities) ? siteSettings.serviceableCities.length : 0})
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                  Customers from these cities can place orders.
                </span>
              </div>
            </div>

            {/* Add City Input Box */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={newServiceCityInput}
                onChange={(e) => setNewServiceCityInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const trimmed = newServiceCityInput.trim();
                    if (trimmed) {
                      const current = Array.isArray(siteSettings.serviceableCities) ? siteSettings.serviceableCities : [];
                      if (!current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                        updateSiteSettings({ serviceableCities: [...current, trimmed] });
                      }
                      setNewServiceCityInput('');
                    }
                  }
                }}
                placeholder="Enter city name (e.g. Indore, Bhopal, Dhar) and press Add"
                style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  const trimmed = newServiceCityInput.trim();
                  if (trimmed) {
                    const current = Array.isArray(siteSettings.serviceableCities) ? siteSettings.serviceableCities : [];
                    if (!current.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
                      updateSiteSettings({ serviceableCities: [...current, trimmed] });
                    }
                    setNewServiceCityInput('');
                  }
                }}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={16} />
                <span>Add City</span>
              </button>
            </div>

            {/* Quick Add City Suggestions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600 }}>Quick Add:</span>
              {['Indore', 'Bhopal', 'Ujjain', 'Dewas', 'Dhar', 'Pithampur', 'Gwalior', 'Jabalpur', 'Khandwa', 'Khargone', 'Ratlam'].map((suggestedCity) => {
                const current = Array.isArray(siteSettings.serviceableCities) ? siteSettings.serviceableCities : [];
                const alreadyAdded = current.some((c) => c.toLowerCase() === suggestedCity.toLowerCase());
                if (alreadyAdded) return null;
                return (
                  <button
                    key={suggestedCity}
                    type="button"
                    onClick={() => {
                      updateSiteSettings({ serviceableCities: [...current, suggestedCity] });
                    }}
                    style={{
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      border: '1px dashed #CBD5E1',
                      backgroundColor: '#F8FAFC',
                      color: '#475569',
                      cursor: 'pointer',
                    }}
                  >
                    + {suggestedCity}
                  </button>
                );
              })}
            </div>

            {/* Active Serviceable Cities Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {(Array.isArray(siteSettings.serviceableCities) ? siteSettings.serviceableCities : []).map((city, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#FFF8E1',
                    border: '1px solid #FFE08A',
                    color: '#0A0A0A',
                    borderRadius: '9999px',
                    padding: '4px 12px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>{city}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = (siteSettings.serviceableCities || []).filter((_, i) => i !== idx);
                      updateSiteSettings({ serviceableCities: updated });
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center',
                      color: '#0A0A0A',
                    }}
                    title={`Remove ${city}`}
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* 4. Serviceable Pincodes Manager */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '14px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  📮 Serviceable Pincodes Acceptance List ({Array.isArray(siteSettings.serviceablePincodes) ? siteSettings.serviceablePincodes.length : 0})
                </span>
                <span style={{ fontSize: '0.74rem', color: '#64748B', display: 'block', marginTop: '2px' }}>
                  Customer addresses with these 6-digit pincodes can complete checkout.
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const mpCommon = ['452001', '452002', '452003', '452005', '452010', '453331', '454001', '456001', '455001', '462001'];
                    const current = Array.isArray(siteSettings.serviceablePincodes) ? siteSettings.serviceablePincodes : [];
                    const merged = Array.from(new Set([...current, ...mpCommon]));
                    updateSiteSettings({ serviceablePincodes: merged });
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F2F2F2',
                    border: '1px solid #E5E7EB',
                    color: '#0A0A0A',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  + Add Common MP Pincodes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('Clear all serviceable pincodes? (Delivery will rely on city or radius)')) {
                      updateSiteSettings({ serviceablePincodes: [] });
                    }
                  }}
                  style={{
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: '#F2F2F2',
                    border: '1px solid #E5E7EB',
                    color: '#0A0A0A',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Add Pincode Input Box (Supports comma separated or single) */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <input
                type="text"
                value={newServicePincodeInput}
                onChange={(e) => setNewServicePincodeInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const raw = newServicePincodeInput;
                    const pins = raw.split(/[\s,]+/).map((p) => p.replace(/\D/g, '').trim()).filter((p) => p.length === 6);
                    if (pins.length > 0) {
                      const current = Array.isArray(siteSettings.serviceablePincodes) ? siteSettings.serviceablePincodes : [];
                      const updated = Array.from(new Set([...current, ...pins]));
                      updateSiteSettings({ serviceablePincodes: updated });
                      setNewServicePincodeInput('');
                    }
                  }
                }}
                placeholder="Enter 6-digit pincode or multiple comma-separated (e.g. 452001, 452005, 454001)"
                style={{ flex: 1, padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
              <button
                type="button"
                onClick={() => {
                  const raw = newServicePincodeInput;
                  const pins = raw.split(/[\s,]+/).map((p) => p.replace(/\D/g, '').trim()).filter((p) => p.length === 6);
                  if (pins.length > 0) {
                    const current = Array.isArray(siteSettings.serviceablePincodes) ? siteSettings.serviceablePincodes : [];
                    const updated = Array.from(new Set([...current, ...pins]));
                    updateSiteSettings({ serviceablePincodes: updated });
                    setNewServicePincodeInput('');
                  } else {
                    addToast('Please enter valid 6-digit pincodes', 'warning');
                  }
                }}
                style={{
                  padding: '0.55rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Plus size={16} />
                <span>Add Pincode(s)</span>
              </button>
            </div>

            {/* Pincode Search Filter */}
            {(siteSettings.serviceablePincodes || []).length > 8 && (
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                <input
                  type="text"
                  placeholder="Filter active pincodes..."
                  value={pincodeSearchQuery}
                  onChange={(e) => setPincodeSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '0.4rem 0.6rem 0.4rem 32px', borderRadius: '6px', border: '1px solid #E2E8F0', fontSize: '0.78rem' }}
                />
              </div>
            )}

            {/* Active Serviceable Pincodes List */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
              {(Array.isArray(siteSettings.serviceablePincodes) ? siteSettings.serviceablePincodes : [])
                .filter((p) => !pincodeSearchQuery || String(p).includes(pincodeSearchQuery))
                .map((pin, idx) => (
                  <span
                    key={idx}
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #CBD5E1',
                      color: '#0F172A',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      fontFamily: 'monospace',
                    }}
                  >
                    <span>{pin}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (siteSettings.serviceablePincodes || []).filter((p) => p !== pin);
                        updateSiteSettings({ serviceablePincodes: updated });
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '0',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#94A3B8',
                      }}
                      title={`Remove pincode ${pin}`}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* SECTION 6: Store Profile & Depot Details */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: `1px solid ${theme.cardBorder}`,
            padding: '1.5rem',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem', paddingBottom: '0.85rem', borderBottom: '1px solid #F1F5F9' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}>
              <Settings size={16} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Store Identity & Central Depot Hub
              </h2>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                Contact information shown in customer invoices, quotations, and live header.
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Store Brand Name
              </label>
              <input
                type="text"
                value={siteSettings.storeName || ''}
                onChange={(e) => updateSiteSettings({ storeName: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Support Hotline Phone
              </label>
              <input
                type="text"
                value={siteSettings.supportPhone || ''}
                onChange={(e) => updateSiteSettings({ supportPhone: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                WhatsApp Quotation Hotline
              </label>
              <input
                type="text"
                value={siteSettings.whatsappNumber || ''}
                onChange={(e) => updateSiteSettings({ whatsappNumber: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
                Support Email
              </label>
              <input
                type="email"
                value={siteSettings.supportEmail || ''}
                onChange={(e) => updateSiteSettings({ supportEmail: e.target.value })}
                style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              Central Depot Logistics Dispatch Address
            </label>
            <input
              type="text"
              value={siteSettings.depotAddress || ''}
              onChange={(e) => updateSiteSettings({ depotAddress: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              Header Announcement Broadcast Ticker
            </label>
            <input
              type="text"
              value={siteSettings.tickerMessage || ''}
              onChange={(e) => updateSiteSettings({ tickerMessage: e.target.value })}
              style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '0.86rem' }}
            />
          </div>

          <div style={{ marginTop: '14px' }}>
            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>
              Customer Cancellation Policy (Shown on Checkout & Orders - One bullet point per line)
            </label>
            <textarea
              rows={4}
              value={
                Array.isArray(siteSettings.cancellationPolicy)
                  ? siteSettings.cancellationPolicy.join('\n')
                  : siteSettings.cancellationPolicy || ''
              }
              onChange={(e) => updateSiteSettings({ cancellationPolicy: e.target.value })}
              placeholder={'Orders cannot be modified once packed.\nDelivery location cannot be changed.\nOrders cannot be cancelled once packed.'}
              style={{
                width: '100%',
                padding: '0.65rem 0.75rem',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '0.86rem',
                fontFamily: 'inherit',
                lineHeight: '1.5',
              }}
            />
            <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
              Enter each policy rule on a new line. These will immediately appear in the customer's Cart, Checkout, and Order Details screens.
            </p>
          </div>
        </div>
      </div>
    );
  }

  function renderAdminUsersView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Admin Access Control</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem' }}>
          <p style={{ color: theme.textMuted }}>Manage administrator roles, privileges, and API keys.</p>
        </div>
      </div>
    );
  }

  function renderSystemLogsView() {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: theme.textDark }}>Real-time System Audit Logs</h1>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, padding: '1.25rem' }}>
          <p style={{ color: theme.textMuted }}>Live audit stream of material price edits, inventory drops, and technician bookings.</p>
        </div>
      </div>
    );
  }
}
