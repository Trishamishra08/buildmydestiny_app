import React, { useState } from 'react';
import {
  ChevronLeft,
  CheckCircle2,
  MapPin,
  Trash2,
  Plus,
  Minus,
  Receipt,
  Tag,
  CreditCard,
  Banknote,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Navigation,
  X,
  Truck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import SlideToOrder from '../components/SlideToOrder';
import OnlinePaymentModal from '../components/OnlinePaymentModal';
import BillDetailsCard from '../components/BillDetailsCard';
import CancellationPolicyCard from '../components/CancellationPolicyCard';
import UnloadingServiceCard from '../components/UnloadingServiceCard';
import { getCartItemKey, couponDiscount } from '../utils/pricing';
import { getDeliverySchedule } from '../utils/deliverySchedule';
import { checkDeliveryServiceability } from '../utils/deliveryValidation';
import { resolveProductImage } from '../utils/productImages';

export const CheckoutView = () => {
  const {
    cart,
    removeFromCart,
    updateCartQty,
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
    gstAmount,
    isGstInclusive,
    grandTotal,
    siteSettings,
    addresses,
    placeOrder,
    addToast,
    navigateTo,
    user,
    currentCity,
    currentPincode,
    requireAuth,
    setIsLocationModalOpen,
    fetchCurrentGpsLocation,
    isDetectingLocation,
  } = useStore();

  const [selectedAddressId, setSelectedAddressId] = useState(addresses[0]?.id || 'addr_1');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'cash'
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isPaymentSelectorOpen, setIsPaymentSelectorOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isOrderProcessing, setIsOrderProcessing] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const handleGpsLocationClick = async () => {
    try {
      const gpsAddr = await fetchCurrentGpsLocation();
      if (gpsAddr && gpsAddr.id) {
        setSelectedAddressId(gpsAddr.id);
      }
    } catch (err) {
      console.error('GPS fetch failed in checkout:', err);
    }
  };

  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    addresses[0] || {
      id: 'addr_default',
      title: 'Select Address',
      recipientName: user?.name || 'Site In-Charge',
      phone: user?.phone || '+91 98260 11223',
      addressLine: 'Corporate House, South Tukoganj',
      city: currentCity || 'Indore',
      pincode: currentPincode || '452001',
    };

  const isOnline = paymentMethod === 'online';
  const deliveryInfo = getDeliverySchedule(new Date());

  // Check if current selected delivery location is serviceable based on Admin settings
  const serviceability = checkDeliveryServiceability({
    city: selectedAddress?.city || currentCity,
    pincode: selectedAddress?.pincode || currentPincode,
    siteSettings,
  });

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponInput.trim()) {
      const res = applyCoupon(couponInput.trim());
      if (!res) {
        setCouponError('Invalid coupon code');
      } else {
        setCouponError('');
        setCouponInput('');
        setIsCouponsOpen(false);
      }
    }
  };

  // Handle Cash Order Placement
  const handleCashOrderSlide = () => {
    if (!serviceability.isServiceable) {
      addToast(
        serviceability.reason || 'We do not deliver to this location. Please update your delivery address or pincode.',
        'error',
        6000
      );
      return;
    }

    requireAuth(async () => {
      setIsOrderProcessing(true);
      try {
        const newOrder = await placeOrder({
          paymentMethod: 'Cash on Delivery (Pay on Site)',
          siteAddress: selectedAddress,
          unloadingNotes: 'Direct site delivery',
        });
        setIsOrderProcessing(false);
        setIsOrderSuccess(true);
        setTimeout(() => {
          navigateTo('order-confirmation', { order: newOrder });
        }, 600);
      } catch (err) {
        // placeOrder already told the customer why; let them try again.
        setIsOrderProcessing(false);
      }
    });
  };

  // Handle Online Slide to Pay
  const handleOnlineOrderSlide = () => {
    if (!serviceability.isServiceable) {
      addToast(
        serviceability.reason || 'We do not deliver to this location. Please update your delivery address or pincode.',
        'error',
        6000
      );
      return;
    }

    requireAuth(() => {
      setIsPaymentModalOpen(true);
    });
  };

  // Callback when Online Payment Gateway authorizes transaction
  // Called once Razorpay reports the payment. The server confirms the payment with
  // Razorpay before it accepts the order.
  const handleOnlinePaymentSuccess = async (paymentDetails) => {
    setIsPaymentModalOpen(false);
    setIsOrderProcessing(true);
    try {
      const newOrder = await placeOrder({
        paymentMethod: paymentDetails.paymentMethod || 'Online Payment (UPI/Card)',
        razorpayOrderId: paymentDetails.razorpayOrderId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
        siteAddress: selectedAddress,
        unloadingNotes: 'Direct site delivery',
      });
      setIsOrderProcessing(false);
      setIsOrderSuccess(true);
      navigateTo('order-confirmation', { order: newOrder });
    } catch (err) {
      setIsOrderProcessing(false);
      // Money may have left the customer's account, so give them the reference.
      if (paymentDetails.razorpayPaymentId) {
        addToast(
          `If you were charged, contact support with payment ID ${paymentDetails.razorpayPaymentId}.`,
          'warning',
          12000
        );
      }
    }
  };

  if (cart.length === 0) {
    return (
      <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '2rem 16px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.2rem', color: '#0F172A', fontWeight: '800', marginBottom: '1rem' }}>
          Your cart is empty
        </h2>
        <button
          onClick={() => navigateTo('home')}
          style={{
            backgroundColor: '#0A0A0A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '10px 20px',
            fontSize: '0.9rem',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          Return to Store
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', paddingBottom: '110px' }}>
      {/* 1. Clean Top Header: Back Button + Title + Subtitle + Secure Badge */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '12px 16px',
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={() => navigateTo('cart')}
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
                Your cart
              </h1>
              <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'} · ₹{(grandTotal || 0).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#0A0A0A', fontSize: '0.75rem', fontWeight: '700' }}>
            <ShieldCheck size={18} />
            <span>100% Secure</span>
          </div>
        </div>
      </div>

      {/* Dynamic Delivery Schedule Top Header Notice Banner */}
      <div
        style={{
          backgroundColor: deliveryInfo.isAfter8PM ? '#FFF8E1' : '#F2F2F2',
          borderBottom: deliveryInfo.isAfter8PM ? '1.5px solid #FFE08A' : '1px solid #E2E8F0',
          padding: '10px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          fontSize: '0.84rem',
          fontWeight: '700',
          color: '#0A0A0A',
          textAlign: 'center',
        }}
      >
        <Truck size={17} style={{ flexShrink: 0 }} />
        <span>
          {deliveryInfo.isAfter8PM ? (
            <>
              🌙 <strong>Night Order:</strong> Your order will be delivered on{' '}
              <strong style={{ textDecoration: 'underline', color: '#0A0A0A' }}>{deliveryInfo.deliveryDate}</strong> (Orders placed after 8:00 PM are delivered next day)
            </>
          ) : (
            <>
              ⚡ <strong>Express Daytime Delivery:</strong> Your order will be delivered today ({deliveryInfo.deliveryDate})
            </>
          )}
        </span>
      </div>

      {/* Main Checkout Container */}
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
        {/* Delivery Schedule Highlight Box */}
        <div
          style={{
            backgroundColor: deliveryInfo.isAfter8PM ? '#FFF8E1' : '#F8FAFC',
            border: deliveryInfo.isAfter8PM ? '1.5px solid #FFE08A' : '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '12px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FFF8E1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0A0A0A',
                flexShrink: 0,
              }}
            >
              <Truck size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.86rem', fontWeight: '800', color: '#0F172A' }}>
                {deliveryInfo.isAfter8PM ? `Scheduled for Tomorrow: ${deliveryInfo.deliveryDate}` : `Same Day Delivery: ${deliveryInfo.deliveryDate}`}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                {deliveryInfo.isAfter8PM
                  ? 'Order placed after 8:00 PM cutoff · First slot dispatch tomorrow morning'
                  : 'Fast dispatch within 60-90 minutes'}
              </div>
            </div>
          </div>
          <span
            style={{
              backgroundColor: '#FFB800',
              color: '#0A0A0A',
              fontSize: '0.7rem',
              fontWeight: '800',
              padding: '3px 8px',
              borderRadius: '6px',
              whiteSpace: 'nowrap',
            }}
          >
            {deliveryInfo.isAfter8PM ? 'NEXT DAY' : 'SAME DAY'}
          </span>
        </div>
        {/* 2. Delivery Address Card (Exact Reference Image Match) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          {/* Top Header Action */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.78rem',
              color: '#64748B',
              marginBottom: '12px',
            }}
          >
            <span>Ordering for someone else?</span>
            <span
              onClick={() => setIsLocationModalOpen(true)}
              style={{ color: '#0A0A0A', fontWeight: '700', cursor: 'pointer' }}
            >
              Add details
            </span>
          </div>

          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: '800',
              color: '#0F172A',
              marginBottom: '12px',
            }}
          >
            Delivery address
          </div>

          {/* Selected Address Box (Red/Rose Pill Border Matching Reference Image 3) */}
          <div
            style={{
              border: '1.5px solid #E2E8F0',
              backgroundColor: '#F2F2F2',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <div style={{ color: '#0A0A0A', marginTop: '2px', flexShrink: 0 }}>
              <CheckCircle2 size={18} fill="#F2F2F2" color="#0A0A0A" />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0F172A' }}>
                  {selectedAddress.title || 'Select Address'}
                </span>
                <div style={{ display: 'flex', gap: '8px', fontSize: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', padding: 0 }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#0A0A0A', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                  >
                    Change
                  </button>
                </div>
              </div>

              <div style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.4 }}>
                {selectedAddress.recipientName && <span>{selectedAddress.recipientName}, </span>}
                {selectedAddress.addressLine}, {selectedAddress.city} - {selectedAddress.pincode}
              </div>

              {/* Serviceability Status Badge */}
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {serviceability.isServiceable ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#0A0A0A',
                      backgroundColor: '#FFF8E1',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    ✓ Serviceable Delivery Area
                  </span>
                ) : (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      fontWeight: '700',
                      color: '#0A0A0A',
                      backgroundColor: '#F2F2F2',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    ✕ Out of Delivery Range / Unserviceable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Unserviceable Warning Alert Box */}
          {!serviceability.isServiceable && (
            <div
              style={{
                marginTop: '10px',
                backgroundColor: '#F2F2F2',
                border: '1.5px solid #E2E8F0',
                borderRadius: '10px',
                padding: '10px 12px',
                fontSize: '0.78rem',
                color: '#0A0A0A',
              }}
            >
              <div style={{ fontWeight: '800', marginBottom: '3px' }}>⚠️ Location Not Serviceable</div>
              <div style={{ lineHeight: 1.4 }}>
                {serviceability.reason || 'We currently do not accept orders for this pincode / city.'}
              </div>
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                style={{
                  marginTop: '8px',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                }}
              >
                Change Delivery Pincode / City
              </button>
            </div>
          )}

          {/* Use Current Location Button with Automatic GPS Fetching */}
          <button
            type="button"
            onClick={handleGpsLocationClick}
            disabled={isDetectingLocation}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '10px 14px',
              backgroundColor: isDetectingLocation ? '#F2F2F2' : '#FFFFFF',
              border: `1.5px dashed ${isDetectingLocation ? '#0A0A0A' : '#CBD5E1'}`,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              fontWeight: '700',
              color: isDetectingLocation ? '#0A0A0A' : '#334155',
              cursor: isDetectingLocation ? 'wait' : 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            {isDetectingLocation ? (
              <>
                <span
                  style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid #0A0A0A',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <span>Detecting GPS satellite location...</span>
              </>
            ) : (
              <>
                <Navigation size={15} color="#0A0A0A" />
                <span>Use current location (from GPS)</span>
              </>
            )}
          </button>
        </div>

        {/* 3. Your Items Summary Card (Exact Reference Image 3 Match) */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
          }}
        >
          <div
            style={{
              fontSize: '0.95rem',
              fontWeight: '800',
              color: '#0F172A',
              marginBottom: '16px',
            }}
          >
            Your items
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {cart.map((item, idx) => {
              const itemKey = item.cartItemId || getCartItemKey(item.product);
              const itemPrice = item.price || item.product?.price || 0;
              const itemTotal = itemPrice * item.quantity;
              const isLast = idx === cart.length - 1;

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

              const cleanName = item.product?.name ? item.product.name.replace(/\s*\([^)]*\)$/, '') : 'Product';

              return (
                <div
                  key={itemKey}
                  style={{
                    paddingBottom: isLast ? 0 : '16px',
                    borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '8px',
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
                        src={resolveProductImage(item.product)}
                        alt={cleanName}
                        style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: '0.86rem', fontWeight: '700', color: '#0F172A', margin: '0 0 4px 0', lineHeight: 1.3 }}>
                        {cleanName}
                      </h4>

                      <div style={{ marginBottom: '4px' }}>
                        <span
                          style={{
                            display: 'inline-flex',
                            backgroundColor: '#F1F5F9',
                            color: '#475569',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {variantSubtitle}
                        </span>
                      </div>

                      <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: '500' }}>
                        ₹{itemPrice.toLocaleString('en-IN')} each
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        border: '1.5px solid #0A0A0A',
                        borderRadius: '8px',
                        height: '30px',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => updateCartQty(itemKey, item.quantity - 1)}
                        style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}
                      >
                        {item.quantity === 1 ? <Trash2 size={13} color="#0A0A0A" /> : <Minus size={13} color="#0A0A0A" strokeWidth={2.5} />}
                      </button>
                      <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: '800', fontSize: '0.84rem', color: '#0A0A0A' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(itemKey, item.quantity + 1)}
                        style={{ width: '28px', height: '28px', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0A0A0A' }}
                      >
                        <Plus size={13} color="#0A0A0A" strokeWidth={2.5} />
                      </button>
                    </div>

                    <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A' }}>
                      ₹{itemTotal.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Coupons & Offers Card */}
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
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF8E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}
              >
                <Tag size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0F172A' }}>
                  Coupons & Offers
                </div>
                <div style={{ fontSize: '0.75rem', color: appliedCoupon ? '#0A0A0A' : '#64748B', fontWeight: appliedCoupon ? '600' : '400' }}>
                  {appliedCoupon ? `Applied: ${appliedCoupon.code} (${appliedCoupon.discountPercentage}% OFF)` : 'Have a coupon code?'}
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
                        Saved ₹{(discountAmount || appliedCoupon.discountAmount || 0).toLocaleString('en-IN')} on this order
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

        {/* 5. Payment Mode Selection Card */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            padding: '16px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF8E1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0A0A0A',
                }}
              >
                <CreditCard size={16} />
              </div>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0F172A' }}>
                  Select Payment Mode
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748B' }}>
                  Choose online payment or cash on delivery
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.72rem', color: '#0A0A0A', fontWeight: '600', backgroundColor: '#FFF8E1', padding: '3px 8px', borderRadius: '6px' }}>
              <ShieldCheck size={13} />
              100% Safe
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Option A: Pay Online */}
            <div
              onClick={() => setPaymentMethod('online')}
              style={{
                border: isOnline ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
                backgroundColor: isOnline ? '#FFF8E1' : '#FAFAFA',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                <input
                  type="radio"
                  name="paymentOption"
                  checked={isOnline}
                  onChange={() => setPaymentMethod('online')}
                  style={{
                    accentColor: '#0A0A0A',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: isOnline ? '700' : '600', fontSize: '0.88rem', color: '#0F172A' }}>
                    💳 Pay Online (UPI / Cards / NetBanking)
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      backgroundColor: '#FFF8E1',
                      color: '#0A0A0A',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    RECOMMENDED
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', lineHeight: '1.4' }}>
                  Instant digital payment via Google Pay, PhonePe, Paytm, UPI, Debit/Credit Card or NetBanking.
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
                    ⚡ Instant Confirmation
                  </span>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
                    🔒 Fast & Secure
                  </span>
                </div>
              </div>
            </div>

            {/* Option B: Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod('cash')}
              style={{
                border: !isOnline ? '2px solid #0A0A0A' : '1px solid #E2E8F0',
                backgroundColor: !isOnline ? '#FFF8E1' : '#FAFAFA',
                borderRadius: '12px',
                padding: '14px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
              }}
            >
              <div style={{ marginTop: '2px' }}>
                <input
                  type="radio"
                  name="paymentOption"
                  checked={!isOnline}
                  onChange={() => setPaymentMethod('cash')}
                  style={{
                    accentColor: '#0A0A0A',
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                  }}
                />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: !isOnline ? '700' : '600', fontSize: '0.88rem', color: '#0F172A' }}>
                    💵 Cash on Delivery (Pay on Site)
                  </span>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      backgroundColor: '#FFF8E1',
                      color: '#0A0A0A',
                      fontWeight: '700',
                      padding: '2px 8px',
                      borderRadius: '4px',
                    }}
                  >
                    PAY AT SITE
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '3px', lineHeight: '1.4' }}>
                  Pay via Cash or UPI directly to the delivery partner upon arrival at the delivery address.
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.68rem', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', padding: '2px 8px', borderRadius: '4px', fontWeight: '600', color: '#334155' }}>
                    📦 Pay After Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Unloading Service Selection Card (Exact Reference Match) */}
        <UnloadingServiceCard />

        {/* 6. Bill Details Card (Exact Reference Image Match) */}
        <BillDetailsCard
          subtotal={cartSubtotal}
          discount={discountAmount}
          walletDiscount={0}
          deliveryFee={deliveryFee}
          handlingFee={isUnloadingSelected ? unloadingCharge : 0}
          total={grandTotal}
        />

        {/* 7. Dynamic Cancellation Policy Card (Exact Reference Image Match) */}
        <CancellationPolicyCard />

        {/* Guest OTP notice */}
        {!user && (
          <div
            style={{
              backgroundColor: '#F2F2F2',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '10px 12px',
              textAlign: 'center',
              fontSize: '0.78rem',
              color: '#0A0A0A',
              fontWeight: '600',
            }}
          >
            OTP login when you slide to pay — browse as guest until then.
          </div>
        )}
      </div>

      {/* 5. Sticky Bottom Action Bar: SLIDE TO PAY (Compact Mobile-Responsive) */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          padding: '8px 14px max(8px, env(safe-area-inset-bottom, 8px)) 14px',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
          zIndex: 1000,
        }}
      >
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <SlideToOrder
            paymentMethod={paymentMethod}
            amount={grandTotal}
            isLoading={isOrderProcessing}
            isSuccess={isOrderSuccess}
            disabled={!serviceability.isServiceable}
            disabledMessage={!serviceability.isServiceable ? 'Out of Delivery Range' : ''}
            onSlideComplete={isOnline ? handleOnlineOrderSlide : handleCashOrderSlide}
          />
        </div>
      </div>

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setIsAddressModalOpen(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              width: '100%',
              maxWidth: '540px',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              padding: '20px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                Select Delivery Address
              </h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setIsAddressModalOpen(false);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    border: `1.5px solid ${selectedAddressId === addr.id ? '#0A0A0A' : '#E2E8F0'}`,
                    backgroundColor: selectedAddressId === addr.id ? '#FFF8E1' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontWeight: '800', fontSize: '0.88rem', color: '#0F172A' }}>
                      {addr.title}
                    </span>
                    {selectedAddressId === addr.id && (
                      <span style={{ color: '#0A0A0A', fontSize: '0.75rem', fontWeight: '800' }}>Active</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                    {addr.recipientName && <span>{addr.recipientName} • {addr.phone}<br /></span>}
                    {addr.addressLine}, {addr.city} - {addr.pincode}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => {
                setIsAddressModalOpen(false);
                setIsLocationModalOpen(true);
              }}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#0A0A0A',
                color: '#FFFFFF',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
            >
              + Add / Change City or Location
            </button>
          </div>
        </div>
      )}

      {/* Online Payment Modal */}
      <OnlinePaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={grandTotal}
        customer={user}
        orderItems={cart}
        couponCode={appliedCoupon?.code || null}
        summary={{
          subtotal: cartSubtotal,
          gstAmount: gstAmount,
          discountAmount: discountAmount,
          grandTotal: grandTotal,
          isUnloadingSelected: isUnloadingSelected,
        }}
        onPaymentSuccess={handleOnlinePaymentSuccess}
      />
    </div>
  );
};

export default CheckoutView;
