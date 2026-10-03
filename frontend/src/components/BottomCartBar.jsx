import React, { useState, useEffect, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';

/**
 * Floating Capsule "View Cart" Pill (Exact Screenshot Match - Centered)
 * - Horizontally centered above the bottom navigation
 * - Red pill with rounded-full pill styling
 * - Left: White circular badge with product thumbnail image
 * - Center: "View cart" header + "X Item(s)" subtitle
 * - Right: Circular translucent button with ChevronRight (>)
 * - STRICT VIEW RULE: ONLY visible on 'home', 'categories', and 'category-products'.
 *   Automatically removed when navigating to any other screen.
 */
export const BottomCartBar = () => {
  const { cart, cartItemCount, navigateTo, currentView } = useStore();

  const [isBouncing, setIsBouncing] = useState(false);
  const prevCountRef = useRef(cartItemCount);

  // Trigger subtle micro-bounce when an item is added
  useEffect(() => {
    if (cartItemCount > prevCountRef.current) {
      setIsBouncing(true);
      const timer = setTimeout(() => setIsBouncing(false), 350);
      prevCountRef.current = cartItemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = cartItemCount;
  }, [cartItemCount]);

  // STRICT VIEW RESTRICTION: Only visible on Home and Category views
  const allowedViews = ['home', 'categories', 'category-products'];
  if (!allowedViews.includes(currentView)) {
    return null;
  }

  // Must have at least 1 item in cart
  if (!cartItemCount || cartItemCount <= 0 || !cart || cart.length === 0) {
    return null;
  }

  // Get latest product image for thumbnail
  const latestItem = cart[cart.length - 1];
  const thumbImage =
    latestItem?.product?.image ||
    latestItem?.image ||
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=200';

  return (
    <>
      <style>{`
        @keyframes floatPillSlideUp {
          0% {
            transform: translateY(24px) scale(0.92);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }
        @keyframes pillBounce {
          0% { transform: scale(1); }
          50% { transform: scale(1.07); }
          100% { transform: scale(1); }
        }
        .view-cart-pill-container {
          animation: floatPillSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .view-cart-pill-bounce {
          animation: pillBounce 0.35s ease-in-out;
        }
      `}</style>

      {/* Centering Wrapper Container (pointer-events: none so outside clicks pass through) */}
      <div
        style={{
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 'calc(74px + env(safe-area-inset-bottom, 0px))',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9005,
          pointerEvents: 'none',
        }}
      >
        {/* Interactive Centered Red Pill */}
        <div
          className={`view-cart-pill-container ${isBouncing ? 'view-cart-pill-bounce' : ''}`}
          onClick={() => navigateTo('cart')}
          style={{
            pointerEvents: 'auto',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            background: 'linear-gradient(135deg, #FFB800 0%, #E6A600 100%)',
            color: '#0A0A0A',
            borderRadius: '9999px',
            padding: '5px 9px 5px 5px',
            boxShadow: '0 6px 20px rgba(255, 184, 0, 0.52), 0 2px 6px rgba(0, 0, 0, 0.16)',
            userSelect: 'none',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.04)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 184, 0, 0.65)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 184, 0, 0.52), 0 2px 6px rgba(0, 0, 0, 0.16)';
          }}
          title="View Cart"
        >
          {/* Left: Product Thumbnail in White Circle */}
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
              padding: '2px',
            }}
          >
            <img
              src={thumbImage}
              alt="Cart item"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                borderRadius: '50%',
              }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&q=80&w=200';
              }}
            />
          </div>

          {/* Center: "View cart" + "X Items" */}
          <div style={{ display: 'flex', flexDirection: 'column', paddingRight: '4px' }}>
            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: '800',
                color: '#0A0A0A',
                lineHeight: '1.15',
                letterSpacing: '-0.01em',
              }}
            >
              View cart
            </span>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: '600',
                color: 'rgba(10, 10, 10, 0.75)',
                lineHeight: '1.1',
              }}
            >
              {cartItemCount} {cartItemCount === 1 ? 'Item' : 'Items'}
            </span>
          </div>

          {/* Right: Circular translucent arrow button */}
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              backgroundColor: 'rgba(10, 10, 10, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: '#0A0A0A',
            }}
          >
            <ChevronRight size={15} strokeWidth={3} />
          </div>
        </div>
      </div>
    </>
  );
};

export default BottomCartBar;
