import React from 'react';
import buildMyDestinyLogoDarkImg from '../assets/build-my-destiny-logo.png';
import buildMyDestinyLogoLightImg from '../assets/build-my-destiny-logo-light.png';

/**
 * Build My Destiny Brand Logo
 * Official Brand Logo Image:
 * - Direct asset: build-my-destiny-logo-light.png (for light backgrounds)
 * - Tagline: "Construction Made Easy"
 */
export const Logo = ({
  size = 'medium',
  showTagline = true,
  onClick,
  inverted = false,
  badgeText = null,
  className = '',
  width,
  height,
}) => {
  // Preset dimensions based on size
  const sizeMap = {
    xs: { w: 90, h: 26 },
    small: { w: 120, h: 36 },
    medium: { w: 155, h: 46 },
    large: { w: 210, h: 62 },
    xlarge: { w: 270, h: 80 },
  };

  const currentSize = sizeMap[size] || sizeMap.medium;
  const calculatedWidth = width || currentSize.w;
  const calculatedHeight = height || currentSize.h;
  const logoSrc = inverted ? buildMyDestinyLogoDarkImg : buildMyDestinyLogoLightImg;

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: onClick ? 'pointer' : 'default',
        userSelect: 'none',
        lineHeight: 1,
        transition: 'opacity 0.15s ease, transform 0.15s ease',
      }}
      title="Build My Destiny - Construction Made Easy"
    >
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            padding: 0,
            borderRadius: 0,
          }}
        >
          <img
            src={logoSrc}
            alt="Build My Destiny – Construction Made Easy"
            style={{
              width: calculatedWidth,
              height: calculatedHeight,
              objectFit: 'contain',
              display: 'block',
            }}
            loading="eager"
          />
        </div>

        {/* Optional quick commerce badge */}
        {badgeText && (
          <span
            style={{
              fontSize: size === 'xs' || size === 'small' ? '0.58rem' : '0.68rem',
              fontWeight: '800',
              backgroundColor: '#FFF8E1',
              color: '#0A0A0A',
              border: '1px solid #FFE08A',
              padding: '1.5px 5px',
              borderRadius: '5px',
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
            }}
          >
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default Logo;
