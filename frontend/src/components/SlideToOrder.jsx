import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Check, ShieldCheck, CreditCard, Banknote } from 'lucide-react';

export const SlideToOrder = ({
  onSlideComplete,
  isLoading = false,
  isSuccess = false,
  disabled = false,
  paymentMethod = 'cash', // 'cash' | 'online'
  amount = 0,
  disabledMessage = '',
}) => {
  const [sliderPosition, setSliderPosition] = useState(0); // 0 to 1
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const maxDragRef = useRef(0);

  const isOnline = paymentMethod === 'online' || (typeof paymentMethod === 'string' && paymentMethod.toLowerCase().includes('online'));

  // Calculate max drag distance on render / resize
  const updateMaxDrag = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const thumbWidth = 40; // width of handle button
      maxDragRef.current = Math.max(0, containerWidth - thumbWidth - 8);
    }
  };

  useEffect(() => {
    updateMaxDrag();
    window.addEventListener('resize', updateMaxDrag);
    return () => window.removeEventListener('resize', updateMaxDrag);
  }, []);

  // Reset slider if isSuccess resets or loading ends without success
  useEffect(() => {
    if (!isLoading && !isSuccess) {
      setSliderPosition(0);
    }
  }, [isLoading, isSuccess]);

  // Handle Drag Start
  const handleStart = (clientX) => {
    if (disabled || isLoading || isSuccess) return;
    updateMaxDrag();
    setIsDragging(true);
    startXRef.current = clientX - sliderPosition * maxDragRef.current;
  };

  const handleMouseDown = (e) => handleStart(e.clientX);
  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);

  // Handle Dragging
  useEffect(() => {
    const handleMove = (clientX) => {
      if (!isDragging || disabled || isLoading || isSuccess) return;
      const maxDrag = maxDragRef.current;
      if (maxDrag <= 0) return;

      const currentX = clientX - startXRef.current;
      const progress = Math.min(Math.max(currentX / maxDrag, 0), 1);
      setSliderPosition(progress);

      // If dragged to >= 0.90, trigger completion
      if (progress >= 0.90) {
        setIsDragging(false);
        setSliderPosition(1);
        if (typeof onSlideComplete === 'function') {
          onSlideComplete();
        }
      }
    };

    const handleEnd = () => {
      if (!isDragging) return;
      setIsDragging(false);
      // If not fully completed, snap back with spring animation
      if (sliderPosition < 0.90) {
        setSliderPosition(0);
      }
    };

    const onMouseMove = (e) => handleMove(e.clientX);
    const onMouseUp = () => handleEnd();
    const onTouchMove = (e) => handleMove(e.touches[0].clientX);
    const onTouchEnd = () => handleEnd();

    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDragging, sliderPosition, disabled, isLoading, isSuccess, onSlideComplete]);

  // Thumb offset in pixels
  const thumbOffset = sliderPosition * (maxDragRef.current || 200);

  // Colors & Themes (Brand Yellow Capsule)
  const baseBg = isOnline
    ? 'linear-gradient(90deg, #FFB800 0%, #E6A600 100%)'
    : 'linear-gradient(90deg, #FFB800 0%, #E6A600 100%)';

  const progressBg = 'linear-gradient(90deg, #E6A600 0%, #CC9200 100%)';

  const thumbBg = isSuccess ? '#0A0A0A' : '#FFFFFF';

  return (
    <div style={{ width: '100%', userSelect: 'none' }}>
      {/* Slider Outer Container */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          height: '48px',
          borderRadius: '24px',
          background: disabled ? '#E2E8F0' : baseBg,
          padding: '4px',
          display: 'flex',
          alignItems: 'center',
          boxShadow: disabled
            ? 'none'
            : isDragging
            ? '0 6px 20px -3px rgba(255, 184, 0, 0.45), inset 0 2px 4px rgba(0,0,0,0.1)'
            : '0 3px 12px rgba(255, 184, 0, 0.28)',
          overflow: 'hidden',
          cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
          transition: isDragging ? 'none' : 'box-shadow 0.3s ease',
          border: disabled ? '1px solid #CBD5E1' : '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Dynamic Progress Fill */}
        {!disabled && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${Math.min(100, Math.max(0, sliderPosition * 100 + 10))}%`,
              background: progressBg,
              opacity: isDragging || sliderPosition > 0 ? 0.95 : 0,
              transition: isDragging ? 'none' : 'width 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
              borderRadius: '24px',
              zIndex: 1,
            }}
          />
        )}

        {/* Center Prompt Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: disabled ? '#94A3B8' : '#0A0A0A',
            fontWeight: '800',
            fontSize: '0.82rem',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            pointerEvents: 'none',
            zIndex: 2,
            paddingLeft: '42px',
            paddingRight: '14px',
            opacity: isDragging ? Math.max(0, 1 - sliderPosition * 1.5) : 1,
            transition: 'opacity 0.2s ease',
          }}
        >
          {disabled ? (
            <span>{disabledMessage || 'Select Address to Order'}</span>
          ) : isLoading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '14px', height: '14px', border: '2px solid #0A0A0A', borderRightColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
              {isOnline ? 'Connecting Payment...' : 'Placing Order...'}
            </span>
          ) : isSuccess ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0A0A0A' }}>
              <Check size={16} strokeWidth={3} />
              Order Confirmed!
            </span>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ margin: '0 auto', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span>{isOnline ? 'SLIDE TO PAY' : 'SLIDE TO ORDER'}</span>
                <span>|</span>
                <span>₹{(amount || 0).toLocaleString('en-IN')}</span>
              </span>
              <span style={{ fontSize: '0.9rem', opacity: 0.85, fontWeight: '900', letterSpacing: '-2px' }}>❯❯</span>
            </div>
          )}
        </div>

        {/* Draggable Thumb Handle */}
        <div
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          style={{
            position: 'relative',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: disabled ? '#CBD5E1' : thumbBg,
            transform: `translateX(${thumbOffset}px)`,
            transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: isSuccess ? '#FFFFFF' : '#0A0A0A',
            boxShadow: disabled ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.18)',
            zIndex: 3,
            cursor: disabled ? 'not-allowed' : isDragging ? 'grabbing' : 'grab',
            flexShrink: 0,
          }}
        >
          {isSuccess ? (
            <Check size={20} strokeWidth={3} />
          ) : isLoading ? (
            <div
              style={{
                width: '16px',
                height: '16px',
                border: '2px solid #0A0A0A',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={19} color="#0A0A0A" strokeWidth={3} />
            </div>
          )}
        </div>
      </div>

      {/* Helper text under slider */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '8px',
          padding: '0 6px',
          fontSize: '0.75rem',
          color: 'var(--text-secondary, #64748B)',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <ShieldCheck size={13} style={{ color: '#0A0A0A' }} />
          <span>{isOnline ? '100% Secure Payment' : 'Pay on Site Unloading'}</span>
        </span>
        <span style={{ fontWeight: '600', color: isOnline ? '#0A0A0A' : '#0A0A0A' }}>
          {isOnline ? 'Instant Digital Invoice' : 'No Pre-Payment'}
        </span>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes slidePulse {
          0%, 100% { transform: translateX(0); opacity: 0.7; }
          50% { transform: translateX(4px); opacity: 1; }
        }
        .slide-chevron-anim {
          animation: slidePulse 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

export default SlideToOrder;
