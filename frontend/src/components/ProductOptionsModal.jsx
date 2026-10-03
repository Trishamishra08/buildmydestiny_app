import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingCart, Plus, Minus, ShieldCheck, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductOptions } from '../utils/pricing';

export const ProductOptionsModal = () => {
  const { isOptionsModalOpen, optionsModalProduct, closeOptionsModal, addToCart } = useStore();
  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
  // Variants as saved by the admin panel (or an older options list), in one shape.
  const options = getProductOptions(optionsModalProduct);

  useEffect(() => {
    if (options.length > 0) {
      setSelectedOption(options[0]);
      setQuantity(1);
    }
  }, [optionsModalProduct]);

  if (!isOptionsModalOpen || !optionsModalProduct) return null;

  const currentPrice = selectedOption ? selectedOption.price : optionsModalProduct.price;
  const currentMrp = selectedOption ? selectedOption.mrp : optionsModalProduct.mrp;
  const currentDiscount = selectedOption ? selectedOption.discount : optionsModalProduct.discount;
  const currentTitle = selectedOption
    ? `${optionsModalProduct.name} - ${selectedOption.name}`
    : optionsModalProduct.name;

  const handleAdd = () => {
    // Create an item representing the selected variant
    const variantProduct = {
      ...optionsModalProduct,
      name: currentTitle,
      price: currentPrice,
      mrp: currentMrp,
      discount: currentDiscount,
      selectedVariant: selectedOption ? selectedOption.name : undefined,
      // The chosen option, so the server can price the same variant.
      variantSelection: selectedOption ? { default: selectedOption.name } : undefined,
    };
    addToCart(variantProduct, quantity);
    closeOptionsModal();
  };

  return (
    <div className="modal-overlay" onClick={closeOptionsModal}>
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '520px',
          width: '100%',
          borderRadius: 'var(--radius-xl)',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-surface)',
          }}
        >
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: '800', color: 'var(--brand-yellow)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Select Variant / Size
            </div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', marginTop: '2px' }}>
              {optionsModalProduct.name}
            </h3>
          </div>

          <button
            onClick={closeOptionsModal}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Options Content */}
        <div style={{ padding: '1.25rem 1.5rem', maxHeight: '55vh', overflowY: 'auto' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
            Available Specifications ({options.length || 1})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {options.map((opt, idx) => {
              const isSelected = selectedOption && selectedOption.name === opt.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedOption(opt)}
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--qc-green)' : '1px solid var(--border-subtle)',
                    backgroundColor: isSelected ? 'var(--qc-green-bg)' : '#FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'var(--transition)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: isSelected ? '6px solid var(--qc-green)' : '2px solid var(--border-medium)',
                        backgroundColor: '#FFFFFF',
                        flexShrink: 0,
                      }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '0.92rem', color: isSelected ? 'var(--qc-green)' : 'var(--text-primary)' }}>
                        {opt.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Direct Depot Dispatch • Tested
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', justifyContent: 'flex-end' }}>
                      <span style={{ fontWeight: '800', fontSize: '1.05rem', color: 'var(--text-primary)' }}>
                        ₹{opt.price.toLocaleString()}
                      </span>
                      {opt.mrp && (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                          ₹{opt.mrp.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {opt.discount && (
                      <span style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--qc-green)' }}>
                        {opt.discount}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Specs summary */}
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--qc-ice-blue)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.78rem',
              color: 'var(--primary-navy)',
            }}
          >
            <ShieldCheck size={16} color="var(--qc-green)" />
            <span>100% Genuine batch verified product with 60 Min Express Delivery</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Quantity Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Qty:</span>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xs)',
              }}
            >
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <Minus size={14} />
              </button>
              <span style={{ width: '28px', textAlign: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Add to Cart Button */}
          <button
            type="button"
            onClick={handleAdd}
            style={{
              backgroundColor: 'var(--qc-green)',
              color: '#FFFFFF',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: '800',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(10, 10, 10, 0.3)',
            }}
          >
            <ShoppingCart size={18} />
            <span>Add to Cart • ₹{(currentPrice * quantity).toLocaleString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
