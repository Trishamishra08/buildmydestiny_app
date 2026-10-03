import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Truck,
  ShieldCheck,
  Award,
  ArrowRight,
  Sparkles,
  Layers,
  Phone,
  FileCheck,
  CheckCircle2,
  HardHat,
  Clock,
  TrendingDown,
  Building,
  RotateCcw,
  QrCode,
  Check,
  Zap,
  Flame,
  ChevronRight,
  ChevronLeft,
  ShoppingCart,
  Tag,
  Copy,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';

const MISTRI_PROMO_SLIDES = [
  {
    icon: Truck,
    badge: '60-MIN EXPRESS',
    title: 'Site Delivery in 60 Mins',
    desc: 'Cement, TMT steel, sand & bricks direct to your plot',
    cta: 'Order Now',
    target: 'products',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)',
    accent: '#FFB800',
  },
  {
    icon: HardHat,
    badge: 'VERIFIED EXPERTS',
    title: 'Book Verified Mistri & Masons',
    desc: 'Expert masons, plumbers, electricians & carpenters near you',
    cta: 'Book Mistri',
    target: 'mistris',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)',
    accent: '#FFB800',
  },
  {
    icon: ShieldCheck,
    badge: 'DEPOT DIRECT',
    title: '100% Genuine Materials',
    desc: 'Factory certified (MTC) with automated GST input tax credit',
    cta: 'View Brands',
    target: 'products',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)',
    accent: '#FFB800',
  },
  {
    icon: Zap,
    badge: 'BULK WHOLESALE',
    title: 'Contractor Bulk Discounts',
    desc: 'Special depot rates for 500+ cement bags & bulk steel orders',
    cta: 'Get Quote',
    target: 'contact',
    gradient: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)',
    accent: '#FFB800',
  },
];

export const HomeView = () => {
  const { navigateTo, setIsQuotationOpen, products, categories, siteSettings, banners, coupons = [], applyCoupon, addToast } = useStore();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter Active Admin Banners or fallback to defaults
  const heroBanners = useMemo(() => {
    const activeHero = (banners || []).filter(
      (b) => b.isActive !== false && (b.position === 'hero' || !b.position)
    );
    return activeHero;
    return [
      {
        id: 'default_hero_1',
        title: 'Original Plywood & MDF',
        subtitle: '100% Genuine Certified Quality with Wholesale Factory Pricing Direct to Site.',
        badge: 'WHOLESALE PRICES',
        ctaText: 'ORDER NOW',
        target: 'plywood-mdf-hdhmr',
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      },
      {
        id: 'default_hero_2',
        title: 'UltraTech Cement & TMT Steel',
        subtitle: 'Direct Depot Rates • ₹410/Bag with Express 60-Minute Site Delivery.',
        badge: '60 MINUTE EXPRESS SITE DELIVERY',
        ctaText: 'ORDER CEMENT',
        target: 'cement',
        image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400',
      },
      {
        id: 'default_hero_3',
        title: 'Havells & Finolex FR Wires',
        subtitle: '100% Pure Bare Copper • 25+ Gauge & Color Options with Bulk Discounts.',
        badge: 'UP TO 43% OFF WIRES',
        ctaText: 'GET BULK QUOTE',
        target: 'contact',
        image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=400',
      },
    ];
  }, [banners]);

  const bottomBanners = useMemo(() => {
    const activeBottom = (banners || []).filter(
      (b) => b.isActive !== false && b.position === 'bottom'
    );
    if (activeBottom.length > 0) return activeBottom;
    return MISTRI_PROMO_SLIDES;
  }, [banners]);

  // Auto slide Hero Banner every 5 seconds
  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroBanners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroBanners.length]);

  // Compact Mistri Promo Banner Slider State
  const [promoIndex, setPromoIndex] = useState(0);
  const [isPromoPaused, setIsPromoPaused] = useState(false);
  const [promoTouchStart, setPromoTouchStart] = useState(null);
  const [promoTouchEnd, setPromoTouchEnd] = useState(null);

  const totalPromoSlides = bottomBanners.length;

  const nextPromo = () => {
    setPromoIndex((prev) => (prev + 1) % (totalPromoSlides || 1));
  };

  const prevPromo = () => {
    setPromoIndex((prev) => (prev - 1 + totalPromoSlides) % (totalPromoSlides || 1));
  };

  // Auto slide promo banner every 4 seconds
  useEffect(() => {
    if (isPromoPaused || totalPromoSlides <= 1) return;
    const timer = setInterval(() => {
      nextPromo();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPromoPaused, totalPromoSlides]);

  // Touch Swipe handlers
  const onPromoTouchStart = (e) => {
    setIsPromoPaused(true);
    setPromoTouchEnd(null);
    setPromoTouchStart(e.targetTouches[0].clientX);
  };

  const onPromoTouchMove = (e) => {
    setPromoTouchEnd(e.targetTouches[0].clientX);
  };

  const onPromoTouchEnd = () => {
    if (!promoTouchStart || !promoTouchEnd) return;
    const distance = promoTouchStart - promoTouchEnd;
    if (distance > 50) nextPromo();
    if (distance < -50) prevPromo();
    setIsPromoPaused(false);
  };

  const bestsellerScrollRef = useRef(null);

  const scrollBestsellers = (direction) => {
    if (bestsellerScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      bestsellerScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categoriesList = categories && categories.length > 0 ? categories : CATEGORIES;
  const currentProducts = products && products.length > 0 ? products : PRODUCTS;
  const featuredMaterials = currentProducts.filter((p) => p.isFeatured !== false);
  const shelfProducts = featuredMaterials.length > 0 ? featuredMaterials : currentProducts;
  const popularMaterials = (products || []).filter((p) => p.isPopular).length > 0 ? (products || []).filter((p) => p.isPopular) : (products || []).slice(0, 10);

  // Dynamically extract actual brands from live products
  const topBrands = useMemo(() => {
    const brandMap = new Map();
    (products || []).forEach((p) => {
      const b = p.brand?.trim();
      if (b) {
        if (!brandMap.has(b)) {
          brandMap.set(b, { name: b, logo: p.image || '', count: 1 });
        } else {
          brandMap.get(b).count += 1;
        }
      }
    });
    return Array.from(brandMap.values());
  }, [products]);

  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: '100vh', paddingBottom: '2rem' }}>
      {/* 1. HERO PROMO BANNER CAROUSEL */}
      <section style={{ padding: '0.65rem 0 0.5rem 0' }}>
        <div className="container">
          <div
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {heroBanners.map((slide, idx) => {
              if (idx !== activeSlide % heroBanners.length) return null;
              const imageUrl = typeof slide.image === 'object' ? slide.image?.url : slide.image;
              const hasFullImage = Boolean(imageUrl);

              const handleBannerClick = () => {
                const target = slide.target;
                if (!target) {
                  navigateTo('products');
                  return;
                }
                if (target === 'contact') {
                  setIsQuotationOpen(true);
                  return;
                }
                if (target === 'services' || target === 'mistris') {
                  navigateTo('services');
                  return;
                }
                if (target === 'products') {
                  navigateTo('products');
                  return;
                }
                navigateTo('category-products', { slug: target, categoryName: slide.title || 'Products' });
              };

              const showTextOverlay = slide.showTextOverlay !== false && (slide.title || slide.subtitle || slide.badge || slide.ctaText);
              const objectFitMode = slide.imageFit || 'cover';

              return (
                <div
                  key={slide.id || idx}
                  onClick={handleBannerClick}
                  style={{
                    position: 'relative',
                    width: '100%',
                    minHeight: isMobile ? '175px' : '240px',
                    height: isMobile ? '175px' : 'clamp(230px, 24vw, 320px)',
                    backgroundColor: '#0A0A0A',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-lg)',
                    userSelect: 'none',
                  }}
                >
                  {hasFullImage && (
                    <img
                      src={imageUrl}
                      alt={slide.title || 'Banner'}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: objectFitMode,
                        objectPosition: 'center',
                        display: 'block',
                      }}
                    />
                  )}

                  {(!hasFullImage || showTextOverlay) && (
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        width: '100%',
                        height: '100%',
                        background: hasFullImage
                          ? 'linear-gradient(90deg, rgba(10, 10, 10, 0.92) 0%, rgba(10, 10, 10, 0.68) 55%, rgba(10, 10, 10, 0.15) 100%)'
                          : (slide.gradient || 'linear-gradient(105deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)'),
                        padding: isMobile ? '1.1rem 1.25rem' : '1.75rem 2.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        color: '#FFFFFF',
                        maxWidth: hasFullImage ? (isMobile ? '100%' : '65%') : '100%',
                        boxSizing: 'border-box',
                      }}
                    >
                      {slide.badge && (
                        <span
                          style={{
                            backgroundColor: '#FFB800',
                            color: '#0A0A0A',
                            padding: '3px 10px',
                            borderRadius: '4px',
                            fontWeight: '800',
                            fontSize: '0.72rem',
                            marginBottom: '6px',
                            width: 'fit-content',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                          }}
                        >
                          📦 {slide.badge}
                        </span>
                      )}
                      {slide.title && (
                        <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.85rem', fontWeight: '900', marginBottom: '6px', lineHeight: 1.2, textShadow: hasFullImage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                          {slide.title}
                        </h2>
                      )}
                      {(slide.subtitle || slide.desc) && (
                        <p style={{ fontSize: isMobile ? '0.78rem' : '0.92rem', color: '#E2E8F0', marginBottom: '14px', lineHeight: 1.4, textShadow: hasFullImage ? '0 1px 3px rgba(0,0,0,0.5)' : 'none', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {slide.subtitle || slide.desc}
                        </p>
                      )}
                      <div>
                        <span
                          style={{
                            backgroundColor: '#FFB800',
                            color: '#0A0A0A',
                            padding: isMobile ? '5px 14px' : '7px 18px',
                            borderRadius: '9999px',
                            fontSize: '0.78rem',
                            fontWeight: '800',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 3px 10px rgba(0, 0, 0, 0.3)',
                          }}
                        >
                          <ShoppingCart size={14} />
                          <span>{slide.ctaText || slide.cta || 'ORDER NOW'}</span>
                          <ChevronRight size={14} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Carousel Navigation Indicators */}
            {heroBanners.length > 1 && (
              <div style={{ position: 'absolute', bottom: '5px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '5px', zIndex: 5 }}>
                {heroBanners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveSlide(idx);
                    }}
                    style={{
                      width: activeSlide % heroBanners.length === idx ? '18px' : '6px',
                      height: '6px',
                      borderRadius: '3px',
                      backgroundColor: activeSlide % heroBanners.length === idx ? '#0A0A0A' : 'rgba(0,0,0,0.25)',
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ACTIVE PROMO CODES & CONTRACTOR OFFERS STRIP */}
      {coupons.filter((c) => c.isActive !== false).length > 0 && (
        <section style={{ padding: '0.4rem 0 0.8rem 0' }}>
          <div className="container">
            <div
              style={{
                display: 'flex',
                gap: '12px',
                overflowX: 'auto',
                paddingBottom: '6px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {coupons
                .filter((c) => c.isActive !== false)
                .map((c) => {
                  const isFlat = c.discountType === 'flat' || (Number(c.flatAmount) > 0 && !Number(c.discountPercentage));
                  const discountLabel = isFlat
                    ? `FLAT ₹${(c.flatAmount || c.discountAmount || 0).toLocaleString('en-IN')} OFF`
                    : `${c.discountPercentage || 0}% OFF`;

                  const handleCopy = (e) => {
                    e.stopPropagation();
                    navigator.clipboard?.writeText(c.code);
                    addToast(`Promo code "${c.code}" copied to clipboard! Apply at cart or checkout.`, 'success');
                  };

                  return (
                    <div
                      key={c.code}
                      onClick={handleCopy}
                      style={{
                        flex: '0 0 auto',
                        minWidth: '260px',
                        maxWidth: '320px',
                        backgroundColor: '#FFFFFF',
                        border: '1.5px dashed #FFE08A',
                        borderRadius: '12px',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        cursor: 'pointer',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                        transition: 'transform 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                          <span
                            style={{
                              backgroundColor: '#FFF8E1',
                              color: '#0A0A0A',
                              fontWeight: '800',
                              fontSize: '0.82rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              letterSpacing: '0.5px',
                            }}
                          >
                            {c.code}
                          </span>
                          <span style={{ fontSize: '0.78rem', fontWeight: '800', color: '#0A0A0A' }}>
                            {discountLabel}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.description || `Min order ₹${(c.minOrderValue || 0).toLocaleString('en-IN')}`}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleCopy}
                        style={{
                          backgroundColor: '#FFB800',
                          color: '#0A0A0A',
                          border: 'none',
                          borderRadius: '6px',
                          padding: '5px 8px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        <Copy size={12} />
                        <span>COPY</span>
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </section>
      )}

      {/* 2. CATEGORY CATALOG GRID (Exact 4-Column Screenshot 1 Match) */}
      {categoriesList.length > 0 && (
        <section style={{ padding: '1rem 0 1.5rem 0' }}>
          <div className="container">
            {/* Quick Commerce 4-Column Responsive Grid */}
            <div className="qc-category-grid">
              {categoriesList.map((cat) => (
                <CategoryCard key={cat.id || cat.slug} category={cat} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. PRODUCT SHELF: Bestsellers with 60 Min Express Delivery (Compact Sliding View) */}
      {shelfProducts.length > 0 && (
        <section style={{ padding: '0.5rem 0 1rem 0' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '4px', height: '18px', backgroundColor: 'var(--brand-orange)', borderRadius: '2px' }} />
                <h2 style={{ fontSize: isMobile ? '1.05rem' : '1.25rem', fontWeight: '800', color: 'var(--primary-navy)', lineHeight: 1.2 }}>
                  Bestseller Materials • Express Delivery
                </h2>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Desktop / Tablet Slider Navigation Arrows */}
                <div className="hide-on-mobile" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <button
                    type="button"
                    onClick={() => scrollBestsellers('left')}
                    aria-label="Scroll previous"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-xs)',
                      color: 'var(--primary-navy)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => scrollBestsellers('right')}
                    aria-label="Scroll next"
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: 'var(--shadow-xs)',
                      color: 'var(--primary-navy)',
                      transition: 'var(--transition)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                      e.currentTarget.style.borderColor = 'var(--border-medium)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FFFFFF';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    }}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => navigateTo('category-products', { slug: 'all' })}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--qc-green)',
                    fontWeight: '800',
                    fontSize: isMobile ? '0.8rem' : '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: '4px 2px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>See All</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Product Sliding View */}
            <div
              ref={bestsellerScrollRef}
              className="qc-horizontal-scroll"
            >
              {shelfProducts.map((product) => (
                <div key={product.id} className="qc-shelf-item">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. BANNER 1: MISTRI GUARANTEE (Compact & Mobile-Optimized) */}
      <section style={{ padding: '0.4rem 0 0.85rem 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 50%, #262626 100%)',
              borderRadius: 'var(--radius-lg)',
              padding: isMobile ? '0.85rem 1rem' : '1.25rem 1.5rem',
              color: '#FFFFFF',
              boxShadow: 'var(--shadow-sm)',
              position: 'relative',
              overflow: 'hidden',
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr auto' : '1.4fr 1fr',
              gap: isMobile ? '0.75rem' : '1.25rem',
              alignItems: 'center',
            }}
          >
            {/* Left Column: 100% Original Seal, Title, Subtitle, Brand Badges */}
            <div style={{ zIndex: 2, minWidth: 0 }}>
              {/* 100% Original Circular Seal Badge */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  backgroundColor: '#FFB800',
                  color: '#0A0A0A',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  fontSize: '0.62rem',
                  fontWeight: '900',
                  marginBottom: '6px',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                }}
              >
                <span>🛡️ 100% ORIGINAL</span>
              </div>

              <h3 style={{ fontSize: isMobile ? '1.05rem' : '1.35rem', fontWeight: '900', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '3px' }}>
                Mistri Guarantee
              </h3>
              <div style={{ fontSize: isMobile ? '0.82rem' : '0.92rem', fontWeight: '800', color: '#FFB800', marginBottom: '4px' }}>
                100% Original Materials
              </div>
              <p style={{ fontSize: isMobile ? '0.72rem' : '0.78rem', color: '#F2F2F2', lineHeight: '1.35', marginBottom: isMobile ? '8px' : '12px', maxWidth: '360px' }}>
                Verify product authenticity using official manufacturer apps and direct mill test reports.
              </p>

              {/* Verified Brand Logos Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '4px' : '6px', flexWrap: 'wrap' }}>
                {['CenturyPly', 'Havells', 'Finolex', 'Greenply', 'UltraTech'].map((bName) => (
                  <div
                    key={bName}
                    style={{
                      backgroundColor: '#FFFFFF',
                      color: '#0A0A0A',
                      fontSize: isMobile ? '0.58rem' : '0.64rem',
                      fontWeight: '800',
                      padding: isMobile ? '2px 6px' : '3px 7px',
                      borderRadius: '4px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                    }}
                  >
                    {bName}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Smartphone QR Authenticity Scan Graphic */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative', flexShrink: 0 }}>
              {/* Mobile Device Mockup */}
              <div
                style={{
                  width: isMobile ? '88px' : '115px',
                  height: isMobile ? '114px' : '146px',
                  backgroundColor: '#0F172A',
                  borderRadius: isMobile ? '12px' : '16px',
                  padding: isMobile ? '4px' : '5px',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  border: '1.5px solid rgba(255,255,255,0.4)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ width: isMobile ? '24px' : '30px', height: '3px', backgroundColor: '#334155', borderRadius: '2px' }} />

                {/* Screen Content */}
                <div
                  style={{
                    backgroundColor: '#E0B589',
                    width: '100%',
                    height: isMobile ? '88px' : '114px',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px',
                    textAlign: 'center',
                  }}
                >
                  <span style={{ fontSize: isMobile ? '0.48rem' : '0.56rem', fontWeight: '900', color: '#5A3515' }}>CENTURYPLY</span>
                  <div style={{ margin: isMobile ? '2px 0' : '4px 0', padding: isMobile ? '2px' : '3px', backgroundColor: '#FFFFFF', borderRadius: '4px' }}>
                    <QrCode size={isMobile ? 28 : 38} color="#000000" />
                  </div>
                  <span style={{ fontSize: isMobile ? '0.42rem' : '0.48rem', fontWeight: '800', color: '#0A0A0A' }}>✓ VERIFIED GENUINE</span>
                </div>

                <div style={{ width: isMobile ? '16px' : '20px', height: '2px', backgroundColor: '#334155', borderRadius: '1px' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SIMPLE COMPACT BOTTOM PROMO BANNER (Mobile-Responsive & Slideable) */}
      <section style={{ padding: '0.65rem 0 1.25rem 0' }}>
        <div className="container">
          <div
            onMouseEnter={() => setIsPromoPaused(true)}
            onMouseLeave={() => setIsPromoPaused(false)}
            onTouchStart={onPromoTouchStart}
            onTouchMove={onPromoTouchMove}
            onTouchEnd={onPromoTouchEnd}
            style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              border: '1px solid var(--border-subtle)',
              userSelect: 'none',
              touchAction: 'pan-y',
            }}
          >
            {/* Sliding Track */}
            <div
              style={{
                display: 'flex',
                transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)',
                transform: `translateX(-${promoIndex * 100}%)`,
              }}
            >
              {bottomBanners.map((slide, idx) => {
                const imageUrl = typeof slide.image === 'object' ? slide.image?.url : slide.image;
                const hasFullImage = Boolean(imageUrl);
                const IconComp = slide.icon || Truck;
                const accentColor = slide.accent || '#FFB800';
                const bgGradient = slide.gradient || 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 60%, #000000 100%)';
                const showTextOverlay = slide.showTextOverlay !== false && (slide.title || slide.subtitle || slide.badge || slide.ctaText);
                return (
                  <div
                    key={slide.id || idx}
                    onClick={() => {
                      if (slide.target === 'contact') {
                        setIsQuotationOpen(true);
                      } else if (slide.target === 'mistris') {
                        navigateTo('services');
                      } else if (slide.target) {
                        navigateTo('category-products', { slug: slide.target });
                      } else {
                        navigateTo('products');
                      }
                    }}
                    style={{
                      flex: '0 0 100%',
                      minWidth: '100%',
                      minHeight: '125px',
                      position: 'relative',
                      background: bgGradient,
                      color: '#FFFFFF',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      borderRadius: 'var(--radius-md)',
                      boxSizing: 'border-box',
                    }}
                  >
                    {hasFullImage && (
                      <img
                        src={imageUrl}
                        alt={slide.title || 'Promo Banner'}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: slide.imageFit || 'cover',
                          objectPosition: 'center',
                          display: 'block',
                        }}
                      />
                    )}

                    {(!hasFullImage || showTextOverlay) && (
                      <div
                        style={{
                          position: 'relative',
                          zIndex: 2,
                          padding: '16px 18px 22px 18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '14px',
                          boxSizing: 'border-box',
                          height: '100%',
                          background: hasFullImage
                            ? 'linear-gradient(90deg, rgba(10, 10, 10, 0.94) 0%, rgba(10, 10, 10, 0.72) 65%, rgba(10, 10, 10, 0.25) 100%)'
                            : 'none',
                        }}
                      >
                        {/* Left: Icon / Thumbnail + Text */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: 1 }}>
                          <div
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: '12px',
                              backgroundColor: 'rgba(255, 255, 255, 0.16)',
                              border: `1.5px solid ${accentColor}60`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: accentColor,
                              flexShrink: 0,
                              boxShadow: `0 4px 12px ${accentColor}25`,
                            }}
                          >
                            <IconComp size={24} strokeWidth={2.4} />
                          </div>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                              <span
                                style={{
                                  fontSize: '1rem',
                                  fontWeight: '900',
                                  color: '#FFFFFF',
                                  letterSpacing: '-0.01em',
                                  lineHeight: '1.2',
                                }}
                              >
                                {slide.title}
                              </span>
                              {slide.badge && (
                                <span
                                  style={{
                                    fontSize: '0.65rem',
                                    fontWeight: '900',
                                    backgroundColor: `${accentColor}25`,
                                    color: accentColor,
                                    border: `1px solid ${accentColor}60`,
                                    padding: '2px 7px',
                                    borderRadius: '5px',
                                    letterSpacing: '0.04em',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {slide.badge}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: '0.8rem',
                                color: 'rgba(255, 255, 255, 0.88)',
                                lineHeight: '1.35',
                              }}
                            >
                              {slide.subtitle || slide.desc}
                            </div>
                          </div>
                        </div>

                        {/* Right: Compact Action Button */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: '0.82rem',
                              fontWeight: '800',
                              backgroundColor: accentColor,
                              color: '#0A0A0A',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              boxShadow: '0 3px 8px rgba(0,0,0,0.25)',
                              whiteSpace: 'nowrap',
                              transition: 'var(--transition)',
                            }}
                          >
                            <span>{slide.ctaText || slide.cta || 'Explore'}</span>
                            <ChevronRight size={15} strokeWidth={3} />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Subtle Slide Indicators (Mini Dots Overlay) */}
            <div
              style={{
                position: 'absolute',
                bottom: '6px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '5px',
                pointerEvents: 'none',
              }}
            >
              {MISTRI_PROMO_SLIDES.map((_, dotIdx) => (
                <div
                  key={dotIdx}
                  style={{
                    width: promoIndex === dotIdx ? '18px' : '5px',
                    height: '4px',
                    borderRadius: '2px',
                    backgroundColor: promoIndex === dotIdx ? '#FFFFFF' : 'rgba(255, 255, 255, 0.35)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. B2B / CONTRACTOR BULK PROCUREMENT PROMO */}
      <section className="hide-on-mobile" style={{ padding: '0.75rem 0 1.5rem 0' }}>
        <div className="container">
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.75rem 1.5rem',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-xs)',
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: '1.5rem',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--qc-ice-blue)', color: 'var(--primary-navy)', padding: '3px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', marginBottom: '8px' }}>
                <HardHat size={14} color="#FFB800" />
                <span>COMMERCIAL CONTRACTORS & BUILDERS</span>
              </div>
              <h3 style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--primary-navy)', marginBottom: '8px' }}>
                Need 500+ Bags or Multi-Tonne Rebars?
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.5', marginBottom: '14px' }}>
                Upload your Bill of Quantities (BOQ) or blueprint. Get instant depot-direct quote with guaranteed 60-min express crane site delivery.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigateTo('contact')}
                  className="btn btn-primary"
                  style={{ backgroundColor: '#FFB800', color: '#0A0A0A', fontWeight: '800' }}
                >
                  Request Bulk BOQ Quote
                </button>
                <button
                  onClick={() => navigateTo('help')}
                  className="btn btn-secondary"
                >
                  Contractor Credit Terms
                </button>
              </div>
            </div>

            <div
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                <CheckCircle2 size={18} color="var(--qc-green)" />
                <span>Automated GST Input Tax Credit (ITC)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                <CheckCircle2 size={18} color="var(--qc-green)" />
                <span>Mill Test Certificate (MTC) Provided</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary-navy)' }}>
                <CheckCircle2 size={18} color="var(--qc-green)" />
                <span>Direct Crane & Dumper Unloading</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CERTIFIED NATIONAL BRANDS (CenturyPly, Havells, UltraTech, Action TESA, Kajaria, etc.) */}
      {topBrands && topBrands.length > 0 && (
        <section className="hide-on-mobile" style={{ padding: '1rem 0', backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-subtle)' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Authorized Partner Depots
                </span>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', fontWeight: '800' }}>
                  Certified National Brands
                </h3>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '0.85rem',
              }}
            >
              {topBrands.map((brand) => (
                <div
                  key={brand.name}
                  onClick={() => navigateTo('search', { query: brand.name })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FFFFFF';
                    e.currentTarget.style.borderColor = 'var(--brand-yellow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#FFF8E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--brand-blue)' }}>{brand.name[0]}</span>
                    )}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: '700', fontSize: '0.82rem', color: 'var(--primary-navy)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {brand.name}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{brand.count} {brand.count === 1 ? 'Product' : 'Products'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomeView;
