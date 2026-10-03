import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  Package,
  PackageX,
  RotateCcw,
  Award,
  CheckCircle2,
  FileText,
  Clock,
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Zap,
  Gift,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PRODUCTS } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import { getProductOptions, getCartItemKey } from '../utils/pricing';
import { resolveProductImage } from '../utils/productImages';

export const ProductDetailsView = () => {
  const {
    viewParams,
    navigateTo,
    addToCart,
    updateCartQty,
    cart,
    cartItemCount,
    toggleWishlist,
    isInWishlist,
    addToast,
    getProductById,
    products,
    isProductsLoaded,
  } = useStore();

  const productList = products && products.length > 0 ? products : PRODUCTS;
  const productId = viewParams?.id || viewParams?.productId || viewParams?.product?.id || viewParams?.product?._id;
  // Always show the live catalogue entry, so edits appear and a deleted product is not
  // shown from the copy passed in when the customer tapped it.
  const product = productId ? getProductById(productId) : null;

  // Active Gallery Image Index
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  // Variant Groups Management
  const [selectedVariants, setSelectedVariants] = useState({});
  const [isProductInfoOpen, setIsProductInfoOpen] = useState(true);

  useEffect(() => {
    if (product?.variantGroups && product.variantGroups.length > 0) {
      const initial = {};
      product.variantGroups.forEach((group) => {
        const gid = group.id || group.name;
        // Pick default option (popular if marked, else first)
        const defOpt = (group.options || []).find((o) => o?.isPopular) || (group.options || [])[0];
        if (defOpt) initial[gid] = defOpt;
      });
      setSelectedVariants(initial);
    } else if (getProductOptions(product).length > 0) {
      // Variants as saved by the admin panel (or an older options list).
      setSelectedVariants({ default: getProductOptions(product)[0] });
    } else {
      setSelectedVariants({});
    }
  }, [product]);

  // Handle Pill Click
  const handleSelectOption = (groupId, option) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupId]: option,
    }));
  };

  // Derived Pricing from Variant Selections
  const currentPrice = useMemo(() => {
    let price = Number(product?.price) || 0;
    const explicitPrices = Object.values(selectedVariants)
      .map((opt) => (typeof opt === 'object' ? opt?.price : null))
      .filter((p) => p !== undefined && p !== null && p !== '' && Number(p) > 0);

    if (explicitPrices.length > 0) {
      price = Number(explicitPrices[explicitPrices.length - 1]);
    } else {
      let delta = 0;
      Object.values(selectedVariants).forEach((opt) => {
        if (opt && typeof opt === 'object' && opt.priceDelta) {
          delta += Number(opt.priceDelta) || 0;
        }
      });
      price += delta;
    }
    return price;
  }, [product, selectedVariants]);

  const currentMrp = useMemo(() => {
    let mrp = product?.mrp ? Number(product.mrp) : null;
    const explicitMrps = Object.values(selectedVariants)
      .map((opt) => (typeof opt === 'object' ? opt?.mrp : null))
      .filter((m) => m !== undefined && m !== null && m !== '' && Number(m) > 0);

    if (explicitMrps.length > 0) {
      mrp = Number(explicitMrps[explicitMrps.length - 1]);
    } else if (mrp) {
      let delta = 0;
      Object.values(selectedVariants).forEach((opt) => {
        if (opt && typeof opt === 'object' && opt.priceDelta) {
          delta += Number(opt.priceDelta) || 0;
        }
      });
      mrp += delta;
    }
    return mrp;
  }, [product, selectedVariants]);

  const currentDiscount = useMemo(() => {
    if (currentMrp && currentPrice < currentMrp) {
      const pct = Math.round(((currentMrp - currentPrice) / currentMrp) * 100);
      return `${pct}% OFF`;
    }
    return product?.discount || null;
  }, [product, currentPrice, currentMrp]);

  const currentSelection = useMemo(() => {
    return Object.fromEntries(
      Object.entries(selectedVariants)
        .filter(([, opt]) => opt)
        .map(([groupId, opt]) => [
          groupId,
          typeof opt === 'object' ? (opt.name ?? opt.label ?? opt.value ?? opt) : opt,
        ])
    );
  }, [selectedVariants]);

  const selectedVariantSummary = useMemo(() => {
    const parts = Object.values(selectedVariants)
      .filter(Boolean)
      .map((opt) => {
        if (typeof opt === 'object') return opt.name || opt.label || opt.value;
        return opt;
      })
      .filter(Boolean);
    return parts.join(' / ');
  }, [selectedVariants]);

  const currentCartItemKey = useMemo(() => {
    if (!product) return '';
    return getCartItemKey({
      ...product,
      variantSelection: currentSelection,
      selectedVariant: selectedVariantSummary,
    });
  }, [product, currentSelection, selectedVariantSummary]);

  const cartItem = useMemo(() => {
    if (!currentCartItemKey) return null;
    return cart.find((item) => {
      const itemKey = item.cartItemId || getCartItemKey(item.product);
      return itemKey === currentCartItemKey;
    });
  }, [cart, currentCartItemKey]);

  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const [activeTab, setActiveTab] = useState('specs'); // 'specs' | 'features' | 'description' | 'reviews'

  if (!product) {
    if (!isProductsLoaded || !products || products.length === 0) {
      return (
        <div
          className="page-container"
          style={{
            textAlign: 'center',
            padding: '5rem 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              border: '3.5px solid #E2E8F0',
              borderTopColor: '#0A0A0A',
              borderRadius: '50%',
              animation: 'spinProductDetails 0.8s linear infinite',
              marginBottom: '1.25rem',
            }}
          />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0F172A', marginBottom: '0.35rem' }}>
            Loading Product Details...
          </h3>
          <p style={{ color: 'var(--text-secondary, #64748B)', fontSize: '0.875rem' }}>
            Please wait while we retrieve the latest specifications & pricing.
          </p>
          <style>{`
            @keyframes spinProductDetails {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 16px' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.5rem' }}>
          This product is no longer available
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          It may have been removed from the catalogue.
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigateTo('categories')}>
          Browse categories
        </button>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const resolvedImg = resolveProductImage(product);
  const rawGallery = product.gallery && product.gallery.length > 0 ? product.gallery : [resolvedImg];
  const galleryImages = rawGallery.map((img) => (img && !img.includes('unsplash') ? img : resolvedImg));
  const activeImage = galleryImages[activeImgIdx] || resolvedImg;

  const handleAdd = () => {
    const itemToAdd = {
      ...product,
      cartItemId: currentCartItemKey,
      price: currentPrice,
      mrp: currentMrp,
      discount: currentDiscount,
      selectedVariant: selectedVariantSummary,
      variantSelection: currentSelection,
      image: activeImage,
    };
    addToCart(itemToAdd, 1);
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateCartQty(cartItem.cartItemId || currentCartItemKey, qtyInCart + 1);
    } else {
      handleAdd();
    }
  };

  const handleDecrement = () => {
    if (cartItem) {
      updateCartQty(cartItem.cartItemId || currentCartItemKey, qtyInCart - 1);
    }
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Product link copied to clipboard!', 'info');
  };

  // Related materials in same category
  const relatedProducts = productList.filter((p) => p.categorySlug === product.categorySlug && p.id !== product.id).slice(0, 4);

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* 1. DEDICATED TOP APP BAR (MOBILE MATCH TO REFERENCE SCREENSHOT) */}
      <div className="qc-product-topbar hide-on-desktop">
        <button
          type="button"
          onClick={() => navigateTo('categories')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
          aria-label="Back"
        >
          <ChevronLeft size={24} color="var(--primary-navy)" />
        </button>

        <div className="qc-product-topbar-title" title={product.name}>
          {product.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => navigateTo('search')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', display: 'flex', alignItems: 'center', color: 'var(--primary-navy)' }}
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          <button
            type="button"
            onClick={() => navigateTo('cart')}
            style={{
              position: 'relative',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#0A0A0A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 5px rgba(0,0,0,0.12)',
            }}
            aria-label="Cart"
          >
            <ShoppingCart size={16} />
            {cartItemCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: 'var(--qc-green)',
                  color: '#FFFFFF',
                  fontSize: '0.58rem',
                  fontWeight: '900',
                  minWidth: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1.5px solid #FFFFFF',
                  lineHeight: 1,
                  padding: '1px',
                }}
              >
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="container" style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 12px' }}>
        {/* Desktop Breadcrumb */}
        <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.825rem', color: 'var(--text-secondary)', padding: '1rem 0', flexWrap: 'wrap' }}>
          <button onClick={() => navigateTo('home')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Home</button>
          <span>/</span>
          <button onClick={() => navigateTo('categories')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>Categories</button>
          <span>/</span>
          <button onClick={() => navigateTo('category-products', { slug: product.categorySlug })} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>{product.category}</button>
          <span>/</span>
          <span style={{ color: 'var(--primary-navy)', fontWeight: '700' }}>{product.name}</span>
        </div>

        {/* Main Grid: Left Gallery + Right Info */}
        <div className="responsive-split-product" style={{ marginTop: '0.75rem', gap: '1.5rem' }}>
          {/* LEFT: PRODUCT IMAGE & PAGINATION DOTS */}
          <div>
            <div
              style={{
                position: 'relative',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '280px',
                height: 'clamp(300px, 72vw, 420px)',
                padding: '1.5rem',
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
              }}
            >
              {/* Product Image */}
              <img
                src={activeImage}
                alt={product.name}
                style={{
                  width: '100%',
                  height: '100%',
                  maxWidth: '360px',
                  maxHeight: '340px',
                  objectFit: 'contain',
                  display: 'block',
                  margin: '0 auto',
                  transition: 'transform 0.3s ease',
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = resolvedImg;
                }}
              />

              {/* Warranty / Quality Badge Overlay */}
              {product.warrantyBadge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: '#0A0A0A',
                    color: '#FFFFFF',
                    fontSize: '0.7rem',
                    fontWeight: '900',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.warrantyBadge}
                </div>
              )}

              {/* Wishlist Button Overlay */}
              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isFavorite ? 'var(--primary-orange)' : 'var(--text-secondary)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                }}
                title="Save to Wishlist"
              >
                <Heart size={18} fill={isFavorite ? 'var(--primary-orange)' : 'none'} />
              </button>
            </div>

            {/* Carousel Paging Dots (Exact Match) */}
            {galleryImages.length > 1 && (
              <div className="qc-image-dots">
                {galleryImages.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImgIdx(idx)}
                    className={`qc-image-dot ${activeImgIdx === idx ? 'active' : ''}`}
                    aria-label={`Slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT: PRODUCT INFO, SELECTORS, STOCK & DETAILS */}
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', padding: '1.25rem', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)' }}>
            
            {/* Free Delivery Banner Pill */}
            <div className="qc-free-delivery-pill">
              <span className="qc-free-delivery-tag">
                <Truck size={13} strokeWidth={2.5} /> Free Delivery
              </span>
              <span className="qc-free-delivery-text">
                on orders above ₹{product.minFreeDelivery || 500}
              </span>
            </div>

            {/* Product Title */}
            <h1 style={{ fontSize: 'clamp(1.25rem, 4vw, 1.55rem)', fontWeight: '800', color: 'var(--primary-navy)', lineHeight: '1.3', marginBottom: '0.65rem' }}>
              {product.name}
            </h1>

            {/* Price & MRP Row */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: 'clamp(1.5rem, 5vw, 1.85rem)', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                ₹ {currentPrice.toLocaleString()}
              </span>
              {currentMrp && (
                <span style={{ fontSize: '0.95rem', color: '#94A3B8', textDecoration: 'line-through' }}>
                  ₹ {currentMrp.toLocaleString()}
                </span>
              )}
              {currentDiscount && (
                <span style={{ backgroundColor: '#FFF8E1', color: '#0A0A0A', border: '1px solid #FFE08A', fontSize: '0.78rem', fontWeight: '800', padding: '2px 8px', borderRadius: '4px' }}>
                  {currentDiscount}
                </span>
              )}
            </div>

            {/* Assured 2% Cashback Banner Strip */}
            <div className="qc-cashback-box">
              <div className="qc-cashback-icon-circle">
                <Gift size={16} />
              </div>
              <div>
                <div className="qc-cashback-title">
                  {product.cashbackTitle || 'Assured 2% Cashback'}
                </div>
                <div className="qc-cashback-subtitle">
                  {product.cashbackSubtitle || 'On purchases above ₹50,000'}
                </div>
              </div>
            </div>

            {/* INTERACTIVE MULTI-ATTRIBUTE VARIANT SELECTOR GROUPS (Coil Size, Thickness, Colour, etc.) */}
            {product.variantGroups && product.variantGroups.length > 0 ? (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {product.variantGroups.map((group) => {
                  const gid = group.id || group.name;
                  const selectedOpt = selectedVariants[gid];
                  const selectedVal = selectedOpt
                    ? (typeof selectedOpt === 'object' ? (selectedOpt.label || selectedOpt.name || selectedOpt.value) : selectedOpt)
                    : null;
                  
                  return (
                    <div key={gid} className="qc-variant-group">
                      <div className="qc-variant-label">
                        <span>{group.name}</span>
                        {selectedVal && (
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--primary-orange)' }}>
                            {selectedVal}
                          </span>
                        )}
                      </div>
                      <div className="qc-variant-pills-row">
                        {(group.options || []).map((opt) => {
                          const optLabel = typeof opt === 'object' ? (opt.label || opt.name || opt.value) : opt;
                          const isSelected = selectedVal === optLabel;
                          return (
                            <button
                              key={optLabel}
                              type="button"
                              onClick={() => handleSelectOption(gid, opt)}
                              className={`qc-variant-pill-btn ${isSelected ? 'selected' : ''}`}
                            >
                              <span>{optLabel}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : getProductOptions(product).length > 0 ? (
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                <div className="qc-variant-group">
                  <div className="qc-variant-label">
                    <span>Select Option / Pack</span>
                  </div>
                  <div className="qc-variant-pills-row">
                    {getProductOptions(product).map((opt) => {
                      const isSelected = selectedVariants.default?.name === opt.name;
                      return (
                        <button
                          key={opt.name}
                          type="button"
                          onClick={() => handleSelectOption('default', opt)}
                          className={`qc-variant-pill-btn ${isSelected ? 'selected' : ''}`}
                        >
                          <span>{opt.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* TRUST & POLICY BADGES (3-COLUMN GRID) */}
            <div className="qc-trust-badges-grid">
              <div className="qc-trust-badge-card">
                <div className="qc-trust-badge-icon-wrap" style={{ backgroundColor: '#FFF8E1', color: '#0A0A0A' }}>
                  <ShieldCheck size={20} />
                </div>
                <div className="qc-trust-badge-title">{product.trustBadge1Title || '100%'}</div>
                <div className="qc-trust-badge-sub">{product.trustBadge1Sub || 'Genuine'}</div>
              </div>

              <div className="qc-trust-badge-card">
                <div className="qc-trust-badge-icon-wrap" style={{ backgroundColor: '#F2F2F2', color: '#0A0A0A' }}>
                  <PackageX size={20} />
                </div>
                <div className="qc-trust-badge-title">{product.returnPolicyTitle || (product.isReturnable ? '7 Days' : 'Non')}</div>
                <div className="qc-trust-badge-sub">{product.returnPolicySub || (product.isReturnable ? 'Returnable' : 'Returnable')}</div>
              </div>

              <div className="qc-trust-badge-card">
                <div className="qc-trust-badge-icon-wrap" style={{ backgroundColor: '#FFF8E1', color: '#0A0A0A' }}>
                  <RotateCcw size={20} />
                </div>
                <div className="qc-trust-badge-title">{product.replacementPolicyTitle || '7 Day'}</div>
                <div className="qc-trust-badge-sub">{product.replacementPolicySub || 'Replacement'}</div>
              </div>
            </div>

          </div>
        </div>

        {/* COLLAPSIBLE PRODUCT INFO ACCORDION */}
        <div className="qc-product-info-box">
          <div
            className={`qc-product-info-header ${isProductInfoOpen ? 'open' : ''}`}
            onClick={() => setIsProductInfoOpen(!isProductInfoOpen)}
          >
            <span className="qc-product-info-title">Product Info</span>
            {isProductInfoOpen ? <ChevronUp size={20} color="#64748B" /> : <ChevronDown size={20} color="#64748B" />}
          </div>

          {isProductInfoOpen && (
            <div className="qc-product-info-body">
              <div className="qc-highlight-qa-box">
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--primary-navy)', marginBottom: '8px' }}>
                  Product Highlights
                </div>
                <div className="qc-highlight-qa-title">
                  Quick Answer: What is {product.name} used for?
                </div>
                <p className="qc-highlight-qa-text">
                  {product.quickAnswer || product.highlights || (
                    `${product.name} is a high-grade building and construction material designed for residential and commercial applications with certified safety standards, durability, and reliable performance from authorized distributors.`
                  )}
                </p>
              </div>

              {/* Tab Navigation inside or below Product Info */}
              <div className="tab-scroll-container" style={{ borderBottom: '2px solid var(--border-subtle)', marginBottom: '1.25rem', paddingBottom: '2px' }}>
                {[
                  { id: 'specs', label: 'Specifications' },
                  { id: 'features', label: 'Key Features' },
                  { id: 'description', label: 'Description' },
                  { id: 'reviews', label: `Reviews (${product.reviewsCount || 390})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '0.65rem 0.65rem',
                      fontSize: '0.9rem',
                      fontWeight: activeTab === tab.id ? '800' : '600',
                      color: activeTab === tab.id ? 'var(--primary-orange)' : 'var(--text-secondary)',
                      borderBottom: activeTab === tab.id ? '3px solid var(--primary-orange)' : '3px solid transparent',
                      marginBottom: '-2px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Specifications Tab */}
              {activeTab === 'specs' && (
                <div>
                  {product.specifications ? (
                    <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <table className="product-specs-table">
                        <tbody>
                          {Object.entries(product.specifications).map(([key, val], idx) => (
                            <tr
                              key={key}
                              style={{
                                backgroundColor: idx % 2 === 0 ? 'var(--bg-surface)' : '#FFFFFF',
                                borderBottom: '1px solid var(--border-subtle)',
                              }}
                            >
                              <td style={{ fontWeight: '700', color: 'var(--text-primary)', width: '42%' }}>{key}</td>
                              <td style={{ color: 'var(--text-secondary)' }}>{val}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: 'var(--text-secondary)' }}>Standard manufacturer specifications apply.</p>
                  )}
                </div>
              )}

              {/* Features Tab */}
              {activeTab === 'features' && (
                <div className="responsive-split-equal" style={{ gap: '0.85rem' }}>
                  {(product.features || [
                    'Complies with latest Bureau of Indian Standards (BIS) norms',
                    'Supplied with original batch test certificate',
                    'Packed in tamper-evident sealed packaging',
                    'Suitable for high-load residential & commercial structures',
                  ]).map((feat, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <CheckCircle2 size={18} color="#0A0A0A" style={{ flexShrink: 0, marginTop: '2px' }} />
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.4 }}>{feat}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Description Tab */}
              {activeTab === 'description' && (
                <div>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.7', maxWidth: '820px' }}>
                    {product.description}
                  </p>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                    <Star size={16} fill="#FFB800" color="#FFB800" />
                    <strong style={{ fontSize: '1rem' }}>{product.rating || 4.8} / 5.0</strong>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>based on {product.reviewsCount || 390} customer reviews</span>
                  </div>
                  <div style={{ padding: '0.9rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '0.88rem', color: 'var(--primary-navy)' }}>Rajesh Verma (Contractor)</strong>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>2 days ago</span>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', color: '#FFB800', marginBottom: '6px' }}>
                      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill="#FFB800" />)}
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      Authentic batch material delivered promptly at project site. Excellent quality and smooth invoicing!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* RELATED MATERIALS */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)' }}>Related Materials in {product.category}</h2>
              <button
                type="button"
                onClick={() => navigateTo('category-products', { slug: product.categorySlug })}
                className="btn btn-secondary btn-sm"
              >
                View More
              </button>
            </div>

            <div className="product-grid">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. FIXED BOTTOM STICKY PURCHASE BAR (EXACT MATCH TO REFERENCE SCREENSHOT) */}
      <div className="qc-bottom-sticky-bar">
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div>
            {selectedVariantSummary && (
              <div className="qc-bottom-variant-text" title={selectedVariantSummary}>
                {selectedVariantSummary}
              </div>
            )}
            <div className="qc-bottom-price-row">
              <span className="qc-bottom-price-val">₹ {currentPrice.toLocaleString()}</span>
              {currentMrp && <span className="qc-bottom-mrp-val">₹ {currentMrp.toLocaleString()}</span>}
              {currentDiscount && (
                <span className="qc-bottom-discount-badge">{currentDiscount}</span>
              )}
            </div>
            <div className="qc-bottom-gst-sub">Including GST</div>
          </div>

          <div>
            {qtyInCart > 0 ? (
              <div className="qc-bottom-qty-counter">
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="qc-bottom-qty-btn"
                  aria-label="Decrease quantity"
                >
                  <Minus size={14} strokeWidth={2.5} />
                </button>
                <span className="qc-bottom-qty-num">{qtyInCart}</span>
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="qc-bottom-qty-btn"
                  aria-label="Increase quantity"
                >
                  <Plus size={14} strokeWidth={2.5} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAdd}
                className="qc-bottom-add-btn"
              >
                <span>Add</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsView;

