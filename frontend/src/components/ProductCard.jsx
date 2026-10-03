import React from 'react';
import { Truck, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductOptions } from '../utils/pricing';

import { resolveProductImage } from '../utils/productImages';

/**
 * Quick Commerce Product Card (Compact & Mobile Responsive)
 * - Yellow Discount Badge
 * - Clean Contain Product Image
 * - Free Delivery Badge
 * - Product Title & Price / MRP
 * - Assured 2% Cashback Strip
 * - Crisp Yellow Add / Stepper Button (No default 1 when not in cart)
 */
export const ProductCard = ({ product }) => {
  const { navigateTo, addToCart, cart, updateCartQty, openOptionsModal } = useStore();

  const cartItem = cart.find(
    (item) => item.product?.id === product.id || item.product?.slug === product.slug || item.id === product.id || (item.cartItemId && item.cartItemId.startsWith(product.id))
  );
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  // Calculate discount percentage from price & MRP
  const priceNum = Number(product.price) || 0;
  const mrpNum = Number(product.mrp) || 0;
  let discountPercentage = 0;
  if (mrpNum > priceNum && priceNum > 0) {
    discountPercentage = Math.round(((mrpNum - priceNum) / mrpNum) * 100);
  } else if (product.discountPercent) {
    discountPercentage = Number(product.discountPercent);
  } else if (typeof product.discount === 'string') {
    const match = product.discount.match(/(\d+)/);
    if (match) discountPercentage = parseInt(match[1], 10);
  }

  const handleCardClick = () => {
    navigateTo('product-details', { product, id: product.id, productId: product.id });
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    const options = getProductOptions(product);
    if (options.length > 1) {
      // Several variants: let the customer choose one.
      openOptionsModal(product);
    } else if (options.length === 1) {
      const [opt] = options;
      addToCart(
        {
          ...product,
          name: `${product.name} - ${opt.name}`,
          price: opt.price ?? product.price,
          mrp: opt.mrp ?? product.mrp,
          variantSelection: { default: opt.name },
        },
        1
      );
    } else {
      addToCart(product, 1);
    }
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    const targetKey = cartItem?.cartItemId || product.id;
    updateCartQty(targetKey, qtyInCart + 1);
  };

  const handleDecrement = (e) => {
    e.stopPropagation();
    const targetKey = cartItem?.cartItemId || product.id;
    updateCartQty(targetKey, qtyInCart - 1);
  };

  const getDisplaySpec = () => {
    if (product.subtitle && product.subtitle.trim() && product.subtitle !== '(1)') {
      return product.subtitle;
    }
    const name = product.name || '';
    const match = name.match(/(\d+(\.\d+)?\s*(sq\s*mm|mm|kg|g|l|ml|m|cm|inch|ft|bag|roll|bucket|ltr|litre))/i);
    if (match) return `(${match[0].trim()})`;

    const u = (product.unit || '').trim();
    if (u && u !== '1' && u !== '(1)') {
      return u.startsWith('(') && u.endsWith(')') ? u : `(${u})`;
    }
    return '';
  };

  const displaySpec = getDisplaySpec();

  return (
    <div
      onClick={handleCardClick}
      className="qc-product-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '14px',
        border: '1px solid #E5E7EB',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        userSelect: 'none',
      }}
    >
      <div>
        {/* Top Image Section */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '8px',
          }}
        >
          {/* Top-Right Black Discount Badge */}
          {discountPercentage > 0 && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                fontSize: '0.62rem',
                fontWeight: '700',
                padding: '2.5px 6px',
                borderRadius: '6px',
                letterSpacing: '0.02em',
                lineHeight: 1.1,
                zIndex: 2,
              }}
            >
              {discountPercentage}% OFF
            </div>
          )}

          {/* Product Image */}
          <img
            src={resolveProductImage(product)}
            alt={product.name || 'Product'}
            style={{
              maxHeight: '100%',
              maxWidth: '100%',
              objectFit: 'contain',
              display: 'block',
            }}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/images/products/prod_ultratech.png';
            }}
          />
        </div>

        {/* Content Body */}
        <div>
          {/* Product Name */}
          <h3
            style={{
              fontSize: '0.82rem',
              fontWeight: '600',
              color: '#0F172A',
              lineHeight: 1.3,
              marginBottom: '2px',
              letterSpacing: '-0.015em',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={product.name}
          >
            {product.name}
          </h3>

          {displaySpec && (
            <div
              style={{
                fontSize: '0.70rem',
                color: '#64748B',
                marginBottom: '5px',
                fontWeight: '500',
                letterSpacing: '-0.005em',
                lineHeight: 1.2,
              }}
            >
              {displaySpec}
            </div>
          )}

          {/* Price & MRP Row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.90rem', fontWeight: '700', color: '#0F172A', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
              ₹{(Number(product.price) || 0).toLocaleString('en-IN')}
            </span>
            {product.mrp && Number(product.mrp) > (Number(product.price) || 0) && (
              <span style={{ fontSize: '0.72rem', color: '#94A3AF', textDecoration: 'line-through', fontWeight: '400', fontVariantNumeric: 'tabular-nums' }}>
                ₹{Number(product.mrp).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Action Area: Crisp ADD Button by default, Stepper only when added to cart */}
      <div style={{ width: '100%', marginTop: '4px' }}>
        {qtyInCart === 0 ? (
          <button
            type="button"
            onClick={handleAddClick}
            style={{
              width: '100%',
              height: '32px',
              backgroundColor: '#FFB800',
              color: '#0A0A0A',
              fontWeight: '800',
              fontSize: '0.80rem',
              borderRadius: '7px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(255, 184, 0, 0.25)',
              transition: 'transform 0.1s ease',
            }}
            aria-label="Add to cart"
          >
            <span>ADD</span>
            <Plus size={13} strokeWidth={2.5} />
          </button>
        ) : (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#FFB800',
              border: '1px solid #E6A600',
              borderRadius: '7px',
              padding: '0 6px',
              height: '32px',
              width: '100%',
              boxShadow: '0 1px 3px rgba(255, 184, 0, 0.25)',
            }}
          >
            <button
              type="button"
              onClick={handleDecrement}
              style={{
                background: 'none',
                border: 'none',
                color: '#0A0A0A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
              aria-label="Decrease quantity"
            >
              <Minus size={13} strokeWidth={2.5} />
            </button>
            <span
              style={{
                fontSize: '0.84rem',
                fontWeight: '800',
                color: '#0A0A0A',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {qtyInCart}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              style={{
                background: 'none',
                border: 'none',
                color: '#0A0A0A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px',
              }}
              aria-label="Increase quantity"
            >
              <Plus size={13} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
