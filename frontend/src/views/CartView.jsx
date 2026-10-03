import React, { useState } from 'react';
import {
  ChevronLeft,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  FileText,
  ShoppingCart,
  Receipt,
  Sparkles,
  Truck,
  Clock,
  MapPin,
  XCircle,
  ShieldCheck,
  Tag,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getCartItemKey, couponDiscount } from '../utils/pricing';
import BillDetailsCard from '../components/BillDetailsCard';
import CancellationPolicyCard from '../components/CancellationPolicyCard';
import UnloadingServiceCard from '../components/UnloadingServiceCard';

export const CartView = () => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
    clearCart,
    cartSubtotal,
    cartItemCount,
    coupons = [],
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
    siteSettings,
    navigateTo,
    addresses,
  } = useStore();

  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const res = applyCoupon(couponInput.trim());
      if (!res || !res.success) {
        setCouponError(res?.message || 'Invalid coupon code');
      } else {
        setCouponError('');
        setCouponInput('');
        setIsCouponsOpen(false);
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '40px' }}>
        {/* Clean Top Header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              }}
            >
              <ChevronLeft size={20} color="#0F172A" />
            </button>
            <div>
              <h1 style={{ fontSize: '1.15rem', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
                Your Cart
              </h1>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                0 items
              </span>
            </div>
          </div>
        </div>

        {/* Empty State */}
        <div style={{ maxWidth: '520px', margin: '3rem auto', padding: '0 16px', textAlign: 'center' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '3rem 1.5rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#FFF8E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: '#0A0A0A',
              }}
            >
              <ShoppingCart size={32} />
            </div>
            <h2 style={{ fontSize: '1.3rem', color: '#0F172A', marginBottom: '0.5rem', fontWeight: '800' }}>
              Your cart is empty
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              You haven't added any building materials or electrical supplies to your cart yet.
            </p>
            <button
              onClick={() => navigateTo('home')}
              style={{
                display: 'inline-flex',
                gap: '8px',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#FFB800',
                color: '#0A0A0A',
                border: 'none',
                borderRadius: '10px',
                padding: '12px 24px',
                fontSize: '0.92rem',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              }}
            >
              <span>Explore Materials & Products</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }



  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* 1. Header: Back Button + Your Cart Title + Clear Cart */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => navigateTo('home')}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <ChevronLeft size={20} color="#0F172A" />
          </button>
          <h1 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0F172A', margin: 0, lineHeight: 1.2 }}>
            Your Cart
          </h1>
        </div>

        <button
          type="button"
          onClick={clearCart}
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            color: '#0F172A',
            fontSize: '0.82rem',
            fontWeight: '700',
            padding: '6px 12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          }}
        >
          <ShoppingCart size={15} color="#0F172A" />
          <span>Clear</span>
        </button>
      </div>

      {/* Main Cart Content Container */}
      <div
        style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '14px 14px 20px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >

        {/* 3. Items List Container */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {cart.map((item, index) => {
              const itemKey = item.cartItemId || getCartItemKey(item.product);
              const itemPrice = item.price || item.product?.price || 0;
              const itemTotal = itemPrice * item.quantity;
              const isLast = index === cart.length - 1;

              // Format variant subtitle (e.g. "1 sqmm / Red")
              const variantSubtitle =
                item.product?.selectedVariant ||
                (item.product?.variantSelection
                  ? Object.values(item.product.variantSelection)
                      .map((v) => (typeof v === 'object' ? v.name || v.label || v.value : v))
                      .filter(Boolean)
                      .join(' / ')
                  : '') ||
                item.variant ||
                item.product?.unit ||
                'Standard';


              // Product clean base name
              const cleanName = item.product?.name ? item.product.name.replace(/\s*\([^)]*\)$/, '') : 'Product';

              return (
                <div
                  key={itemKey}
                  style={{
                    paddingBottom: isLast ? '0' : '16px',
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '72px',
                        height: '72px',
                        borderRadius: '10px',
                        border: '1px solid #F1F5F9',
                        backgroundColor: '#F8FAFC',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={item.product?.image || 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&q=80&w=400'}
                        alt={cleanName}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          borderRadius: '6px',
                        }}
                      />
                    </div>

                    {/* Middle Info: Title + Variant Subtitle */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: '0.9rem',
                          fontWeight: '700',
                          color: '#0F172A',
                          margin: '0 0 3px 0',
                          lineHeight: 1.3,
                        }}
                      >
                        {cleanName}
                      </h3>

                      {/* Variant details (e.g. "1 sqmm / Red") */}
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: '#64748B',
                          fontWeight: '500',
                          marginBottom: '4px',
                        }}
                      >
                        {variantSubtitle}
                      </div>

                      {/* Remove item button for convenience */}
                      <button
                        type="button"
                        onClick={() => removeFromCart(itemKey)}
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: 0,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                          fontSize: '0.72rem',
                          color: '#94A3B8',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        <Trash2 size={11} />
                        <span>Remove</span>
                      </button>
                    </div>

                    {/* Right Side: Green Stepper Pill + Cashback Tag + Price */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        gap: '6px',
                        flexShrink: 0,
                      }}
                    >
                      {/* Green Rounded Stepper Pill « - QTY + » */}
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          backgroundColor: '#0A0A0A',
                          borderRadius: '8px',
                          height: '32px',
                          padding: '0 4px',
                          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateCartQty(itemKey, item.quantity - 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                          }}
                          aria-label="Decrease quantity"
                        >
                          {item.quantity === 1 ? '« -' : '« -'}
                        </button>

                        <span
                          style={{
                            minWidth: '22px',
                            textAlign: 'center',
                            fontWeight: '800',
                            fontSize: '0.9rem',
                            color: '#FFFFFF',
                          }}
                        >
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() => updateCartQty(itemKey, item.quantity + 1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            fontSize: '0.85rem',
                            fontWeight: '800',
                          }}
                          aria-label="Increase quantity"
                        >
                          {'+ »'}
                        </button>
                      </div>

                      {/* Item Price */}
                      <div>
                        <span
                          style={{
                            fontSize: '0.98rem',
                            fontWeight: '800',
                            color: '#0F172A',
                          }}
                        >
                          ₹ {itemTotal.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Unloading Service Card */}
        <UnloadingServiceCard />

        {/* Coupons & Offers Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '14px 16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div
            onClick={() => setIsCouponsOpen(!isCouponsOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: appliedCoupon ? '#FFF8E1' : '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: appliedCoupon ? '#0A0A0A' : '#0F172A',
                }}
              >
                <Tag size={18} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0F172A' }}>
                  Coupons & Offers
                </div>
                <div style={{ fontSize: '0.75rem', color: appliedCoupon ? '#0A0A0A' : '#64748B', fontWeight: appliedCoupon ? '600' : '400' }}>
                  {appliedCoupon ? `Applied: ${appliedCoupon.code} (Saved ₹${(discountAmount || 0).toLocaleString('en-IN')})` : 'Have a coupon or promo code?'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748B' }}>
              {appliedCoupon && (
                <span style={{ fontSize: '0.72rem', backgroundColor: '#FFF8E1', color: '#0A0A0A', fontWeight: '700', padding: '2px 8px', borderRadius: '4px' }}>
                  APPLIED
                </span>
              )}
              {isCouponsOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
          </div>

          {isCouponsOpen && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F1F5F9' }} onClick={(e) => e.stopPropagation()}>
              {appliedCoupon ? (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF8E1', border: '1.5px dashed #FFE08A', padding: '10px 14px', borderRadius: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color="#0A0A0A" />
                    <div>
                      <div style={{ fontSize: '0.86rem', color: '#0A0A0A', fontWeight: '800' }}>
                        '{appliedCoupon.code}' Applied!
                      </div>
                      <div style={{ fontSize: '0.74rem', color: '#4B5563' }}>
                        Saved ₹{(discountAmount || appliedCoupon.discountAmount || 0).toLocaleString('en-IN')} on your cart
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    style={{ background: 'none', border: 'none', color: '#0A0A0A', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="ENTER COUPON CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        flex: 1,
                        height: '38px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        padding: '0 12px',
                        fontSize: '0.82rem',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        letterSpacing: '0.5px',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: '#0A0A0A',
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0 16px',
                        fontSize: '0.82rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                      }}
                    >
                      Apply
                    </button>
                  </form>

                  {couponError && (
                    <div style={{ color: '#0A0A0A', fontSize: '0.74rem', fontWeight: '600' }}>
                      {couponError}
                    </div>
                  )}

                  {/* Active Admin Coupons List */}
                  {coupons.filter((c) => c.isActive !== false).length > 0 && (
                    <div style={{ marginTop: '4px' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: '800', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        Available Offers & Promo Codes
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {coupons
                          .filter((c) => c.isActive !== false)
                          .map((coupon) => {
                            const { amount: potentialSavings, reason } = couponDiscount(coupon, cartSubtotal);
                            const isEligible = !reason;
                            const isFlat = coupon.discountType === 'flat' || (Number(coupon.flatAmount) > 0 && !Number(coupon.discountPercentage));
                            const discountBadge = isFlat
                              ? `₹${(coupon.flatAmount || coupon.discountAmount || 0).toLocaleString('en-IN')} FLAT OFF`
                              : `${coupon.discountPercentage || 0}% OFF`;

                            return (
                              <div
                                key={coupon.code}
                                style={{
                                  border: `1.5px dashed ${isEligible ? '#FFE08A' : '#CBD5E1'}`,
                                  backgroundColor: isEligible ? '#FFF8E1' : '#F8FAFC',
                                  borderRadius: '10px',
                                  padding: '10px 12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  gap: '10px',
                                }}
                              >
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                                    <span
                                      style={{
                                        fontWeight: '800',
                                        fontSize: '0.84rem',
                                        color: isEligible ? '#0A0A0A' : '#334155',
                                        backgroundColor: isEligible ? '#FFF8E1' : '#E2E8F0',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        letterSpacing: '0.5px',
                                      }}
                                    >
                                      {coupon.code}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0A0A0A' }}>
                                      {discountBadge}
                                    </span>
                                    {coupon.badge && (
                                      <span style={{ fontSize: '0.65rem', fontWeight: '800', color: '#0A0A0A', backgroundColor: '#FFF8E1', padding: '1px 5px', borderRadius: '4px' }}>
                                        {coupon.badge}
                                      </span>
                                    )}
                                  </div>

                                  <div style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.3 }}>
                                    {coupon.description || `Save ${discountBadge} on orders above ₹${(coupon.minOrderValue || 0).toLocaleString('en-IN')}`}
                                  </div>

                                  {!isEligible && reason && (
                                    <div style={{ fontSize: '0.7rem', color: '#4B5563', fontWeight: '600', marginTop: '2px' }}>
                                      • {reason}
                                    </div>
                                  )}
                                </div>

                                <button
                                  type="button"
                                  disabled={!isEligible}
                                  onClick={() => applyCoupon(coupon.code)}
                                  style={{
                                    backgroundColor: isEligible ? '#FFB800' : '#E2E8F0',
                                    color: isEligible ? '#0A0A0A' : '#94A3B8',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '6px 12px',
                                    fontSize: '0.75rem',
                                    fontWeight: '800',
                                    cursor: isEligible ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap',
                                    boxShadow: isEligible ? '0 2px 4px rgba(0, 0, 0, 0.2)' : 'none',
                                  }}
                                >
                                  {isEligible ? `APPLY (Save ₹${potentialSavings})` : 'APPLY'}
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 5. Bill Details Card */}
        <BillDetailsCard
          subtotal={cartSubtotal}
          discount={discountAmount}
          walletDiscount={0}
          deliveryFee={deliveryFee}
          handlingFee={isUnloadingSelected ? unloadingCharge : 0}
          total={grandTotal}
        />

        {/* 6. Cancellation Policy Card */}
        <CancellationPolicyCard />
      </div>

      {/* 7. Sticky Bottom Action Bar (Exact Reference Match) */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '10px 16px max(10px, env(safe-area-inset-bottom, 10px)) 16px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.06)',
          zIndex: 1000,
        }}
      >
        <div style={{ maxWidth: '540px', margin: '0 auto' }}>
          <button
            type="button"
            onClick={() => navigateTo('checkout')}
            style={{
              width: '100%',
              height: '46px',
              backgroundColor: '#FFB800',
              color: '#0A0A0A',
              borderRadius: '10px',
              border: 'none',
              fontWeight: '800',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 3px 10px rgba(0, 0, 0, 0.25)',
              transition: 'transform 0.15s ease, opacity 0.15s ease',
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <span>Proceed to Checkout</span>
            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>›</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartView;
