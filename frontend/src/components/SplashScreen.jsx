import React, { useState, useEffect } from 'react';
import splashBgImg from '../assets/splash-bg.jpg';

/**
 * Build My Destiny - Premium Animated Mobile & Web Splash Screen
 * Automatically plays cinematic entrance sequence and smoothly transitions to Login Screen.
 * Tapping anywhere on the screen also immediately fast-forwards into the app.
 */
export default function SplashScreen({ onFinish, duration = 3000 }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Trigger staggered entrance animations
    const loadTimer = setTimeout(() => setIsLoaded(true), 60);

    // Auto-transition to Login page after splash sequence finishes
    const finishTimer = setTimeout(() => {
      handleComplete();
    }, duration);

    return () => {
      clearTimeout(loadTimer);
      clearTimeout(finishTimer);
    };
  }, [duration]);

  const handleComplete = () => {
    if (isExiting) return;
    setIsExiting(true);
    setTimeout(() => {
      onFinish?.();
    }, 450);
  };

  return (
    <div
      className={`bmd-splash-root ${isExiting ? 'bmd-splash-exit' : ''}`}
      onClick={handleComplete}
      title="Tap to continue"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0a0d14',
        fontFamily: "'Outfit', 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        overflow: 'hidden',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;800;900&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        /* Animations */
        @keyframes bmd-bg-cinematic {
          0% {
            transform: scale(1.08);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes bmd-bar-grow {
          0% {
            transform: scaleY(0);
            opacity: 0;
          }
          60% {
            transform: scaleY(1.15);
            opacity: 1;
          }
          100% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes bmd-fade-slide-down {
          0% {
            opacity: 0;
            transform: translateY(-16px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0);
          }
        }

        @keyframes bmd-text-reveal {
          0% {
            opacity: 0;
            transform: translateY(28px) skewY(2deg);
            filter: blur(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) skewY(0deg);
            filter: blur(0);
          }
        }

        @keyframes bmd-highlight-pop {
          0% {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
            filter: blur(8px);
          }
          60% {
            transform: translateY(-2px) scale(1.03);
            filter: blur(0);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }

        @keyframes bmd-line-fade {
          0% {
            opacity: 0;
            transform: translateX(-14px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bmd-progress-bar {
          0% {
            width: 0%;
            opacity: 0.6;
          }
          85% {
            width: 85%;
            opacity: 1;
          }
          100% {
            width: 100%;
            opacity: 1;
          }
        }

        .bmd-splash-root {
          transition: opacity 450ms cubic-bezier(0.4, 0, 0.2, 1), transform 450ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .bmd-splash-exit {
          opacity: 0 !important;
          transform: scale(1.04) !important;
          pointer-events: none !important;
        }

        /* Screen Container */
        .bmd-screen-container {
          position: relative;
          width: 100%;
          max-width: 480px;
          height: 100%;
          max-height: 100dvh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background-color: #0b0f19;
          overflow: hidden;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
        }

        @media (min-width: 540px) {
          .bmd-screen-container {
            height: min(900px, 94vh);
            border-radius: 36px;
            border: 6px solid #1e2430;
            box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08);
          }
        }
      `}</style>

      {/* Screen Frame */}
      <div className="bmd-screen-container">
        {/* Background Image with Cinematic Zoom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${splashBgImg})`,
            backgroundPosition: 'center 40%',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            animation: 'bmd-bg-cinematic 4s cubic-bezier(0.1, 0.9, 0.2, 1) forwards',
            zIndex: 1,
          }}
        />

        {/* Cinematic Vignette / Readability Scrim Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(
              180deg,
              rgba(8, 12, 20, 0.8) 0%,
              rgba(11, 16, 26, 0.5) 26%,
              rgba(14, 18, 27, 0.35) 55%,
              rgba(10, 13, 20, 0.8) 84%,
              rgba(7, 9, 14, 0.96) 100%
            )`,
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* Radial shadow behind headline for high readability */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: '22%',
            width: '85%',
            height: '55%',
            background: 'radial-gradient(ellipse at 15% 45%, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 75%)',
            zIndex: 2,
            pointerEvents: 'none',
          }}
        />

        {/* TOP SECTION: Animated Brand Logo & Identity */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '42px 24px 0 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          {/* 3-Bar Construction Building Icon (Yellow & White) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '6px',
              height: '46px',
              marginBottom: '12px',
            }}
          >
            {/* Left Bar (Yellow) */}
            <div
              style={{
                width: '12px',
                height: '28px',
                backgroundColor: '#FFB800',
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 14px rgba(255, 184, 0, 0.5)',
                transformOrigin: 'bottom',
                animation: isLoaded ? 'bmd-bar-grow 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s both' : 'none',
              }}
            />
            {/* Center Bar (Tall Yellow) */}
            <div
              style={{
                width: '12px',
                height: '46px',
                backgroundColor: '#FFB800',
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 18px rgba(255, 184, 0, 0.6)',
                transformOrigin: 'bottom',
                animation: isLoaded ? 'bmd-bar-grow 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.28s both' : 'none',
              }}
            />
            {/* Right Bar (White) */}
            <div
              style={{
                width: '12px',
                height: '22px',
                backgroundColor: '#FFFFFF',
                borderRadius: '3px 3px 0 0',
                boxShadow: '0 0 12px rgba(255, 255, 255, 0.4)',
                transformOrigin: 'bottom',
                animation: isLoaded ? 'bmd-bar-grow 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) 0.42s both' : 'none',
              }}
            />
          </div>

          {/* Brand Title */}
          <h1
            style={{
              margin: 0,
              fontFamily: "'Montserrat', 'Outfit', sans-serif",
              fontSize: '1.45rem',
              fontWeight: 900,
              letterSpacing: '0.04em',
              lineHeight: 1.08,
              textTransform: 'uppercase',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.85)',
              animation: isLoaded ? 'bmd-fade-slide-down 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.45s both' : 'none',
            }}
          >
            <span style={{ color: '#FFFFFF', fontWeight: 800, letterSpacing: '0.05em' }}>BUILD MY</span>
            <span
              style={{
                color: '#FFB800',
                fontWeight: 900,
                fontSize: '1.75rem',
                letterSpacing: '0.07em',
                marginTop: '1px',
              }}
            >
              DESTINY
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              margin: '8px 0 0 0',
              color: '#F1F5F9',
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              fontSize: '0.92rem',
              fontWeight: 500,
              letterSpacing: '0.04em',
              textTransform: 'none',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
              animation: isLoaded ? 'bmd-fade-slide-down 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.6s both' : 'none',
            }}
          >
            Construction Made Easy
          </p>
        </div>

        {/* MIDDLE SECTION: Large Bold Animated Headline & Value Propositions */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '0 30px',
            marginBottom: 'auto',
            marginTop: '28px',
          }}
        >
          {/* Main Headline */}
          <h2
            style={{
              margin: 0,
              fontFamily: "'Montserrat', 'Outfit', sans-serif",
              fontSize: 'clamp(2.4rem, 8.8vw, 3.25rem)',
              fontWeight: 900,
              lineHeight: 1.04,
              letterSpacing: '-0.035em',
              textShadow: '0 6px 24px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div
              style={{
                color: '#FFFFFF',
                animation: isLoaded ? 'bmd-text-reveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both' : 'none',
              }}
            >
              Building
            </div>
            <div
              style={{
                color: '#FFFFFF',
                animation: isLoaded ? 'bmd-text-reveal 0.75s cubic-bezier(0.16, 1, 0.3, 1) 0.84s both' : 'none',
              }}
            >
              Material.
            </div>
            <div
              style={{
                color: '#FFB800',
                textShadow: '0 4px 22px rgba(255, 184, 0, 0.45), 0 6px 24px rgba(0,0,0,0.95)',
                animation: isLoaded ? 'bmd-highlight-pop 0.85s cubic-bezier(0.16, 1, 0.3, 1) 0.98s both' : 'none',
              }}
            >
              One Place.
            </div>
          </h2>

          {/* Value Proposition Bullet Lines */}
          <div
            style={{
              marginTop: '20px',
              color: '#F8FAFC',
              fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif",
              fontSize: 'clamp(0.98rem, 3.6vw, 1.15rem)',
              fontWeight: 500,
              lineHeight: 1.52,
              letterSpacing: '-0.01em',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
              opacity: 0.96,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: isLoaded ? 'bmd-line-fade 0.65s cubic-bezier(0.16, 1, 0.3, 1) 1.1s both' : 'none',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FFB800', display: 'inline-block' }} />
              Quality materials.
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: isLoaded ? 'bmd-line-fade 0.65s cubic-bezier(0.16, 1, 0.3, 1) 1.22s both' : 'none',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FFB800', display: 'inline-block' }} />
              Trusted suppliers.
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                animation: isLoaded ? 'bmd-line-fade 0.65s cubic-bezier(0.16, 1, 0.3, 1) 1.34s both' : 'none',
              }}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#FFB800', display: 'inline-block' }} />
              Delivered to your site.
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Loading Indicator Bar */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            padding: '0 32px 36px 32px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* Subtle Progress Bar */}
          <div
            style={{
              width: '120px',
              height: '3px',
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '999px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                backgroundColor: '#FFB800',
                borderRadius: '999px',
                animation: `bmd-progress-bar ${duration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
