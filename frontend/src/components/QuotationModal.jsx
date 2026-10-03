import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Send,
  Building,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
  FileText,
  Layers,
  Plus,
  Zap,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const QuotationModal = () => {
  const {
    isQuotationOpen,
    setIsQuotationOpen,
    user,
    currentCity,
    currentPincode,
    cart,
    cartItemCount,
    addToast,
    addQuotation,
    siteSettings,
  } = useStore();

  const [clientName, setClientName] = useState(user?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [siteLocation, setSiteLocation] = useState(
    `${currentCity || 'Indore'} (${currentPincode || '452005'})`
  );
  const [selectedCategories, setSelectedCategories] = useState([
    'Cement & Aggregates',
  ]);
  const [requirements, setRequirements] = useState('');
  const [urgency, setUrgency] = useState('Express Delivery (Within 24 Hours)');

  if (!isQuotationOpen) return null;

  const tradeCategories = [
    'Cement & Aggregates',
    'TMT Steel & Wires',
    'Plywood, MDF & HDHMR',
    'Paints & Waterproofing',
    'Electrical & MCB',
    'Hardware & Locks',
    'Plumbing & Sanitary',
    'Complete Site BOQ',
  ];

  const urgencyOptions = [
    '⚡ Express Delivery (Within 24 Hours)',
    '🚚 Standard Delivery (2-3 Days)',
    '📊 Project Estimation / Rate Inquiry',
  ];

  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      if (selectedCategories.length > 1) {
        setSelectedCategories(selectedCategories.filter((c) => c !== cat));
      }
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const handleImportCart = () => {
    if (!cart || cart.length === 0) {
      addToast('Your cart is currently empty', 'info');
      return;
    }

    const cartText = cart
      .map(
        (item) =>
          `• ${item.product?.name || 'Material'} (Qty: ${item.quantity} ${item.product?.unit || 'units'})`
      )
      .join('\n');

    setRequirements((prev) =>
      prev ? `${prev}\n\nCart Items:\n${cartText}` : `Items required:\n${cartText}`
    );
    addToast(`Added ${cart.length} cart items to quotation requirement`, 'success');
  };

  const handleSendWhatsApp = (e) => {
    e.preventDefault();

    const cleanRequirements =
      requirements.trim() ||
      'Looking for bulk contractor wholesale rates for site construction materials.';

    if (addQuotation) {
      addQuotation({
        clientName: clientName || user?.name || 'Valued Customer',
        company: user?.company || 'Site Contractor',
        phone: phoneNumber || user?.phone || 'Customer Phone',
        siteCity: siteLocation || currentCity || 'Indore',
        requiredMaterials: cleanRequirements,
        notes: `Urgency: ${urgency}. Categories: ${selectedCategories.join(', ')}`,
      });
    }

    const message = `🏗️ *BuildMyDestiny - MATERIAL QUOTATION REQUEST*
----------------------------------------
👤 *Customer:* ${clientName || 'Valued Customer'}
📞 *Contact / WhatsApp:* ${phoneNumber || user?.phone || 'Not provided'}
📍 *Site Location:* ${siteLocation || 'Indore'}
🏷️ *Trades / Categories:* ${selectedCategories.join(', ')}
⏱️ *Timeline:* ${urgency}

📋 *Material Requirements & BOQ:*
${cleanRequirements}
----------------------------------------
Please send the best discounted wholesale quotation with site delivery freight charges. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const rawAdminPhone = siteSettings?.whatsappNumber || siteSettings?.supportPhone || '+91 96309 38487';
    const digitsOnly = rawAdminPhone.replace(/[^0-9]/g, '');
    const targetWhatsAppNumber = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=${targetWhatsAppNumber}&text=${encodedMessage}`;

    // Open WhatsApp in new window/tab
    window.open(whatsappUrl, '_blank');

    setIsQuotationOpen(false);
    addToast('Requirement sent on WhatsApp and recorded in Admin Quotations!', 'success');
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => setIsQuotationOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
        backdropFilter: 'blur(3px)',
      }}
    >
      <div
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '560px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          backgroundColor: '#FFFFFF',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* 1. Header with Vibrant Emerald & Navy Theme */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
            color: '#FFFFFF',
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <MessageSquare size={22} color="#FFB800" />
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  color: '#FFB800',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: '2px',
                }}
              >
                💬 Instant WhatsApp Quotation
              </div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#FFFFFF', margin: 0, lineHeight: 1.2 }}>
                Request Wholesale Quote
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsQuotationOpen(false)}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.18)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#FFFFFF',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Form Body */}
        <form onSubmit={handleSendWhatsApp} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Info Banner */}
          <div
            style={{
              backgroundColor: '#FFF8E1',
              border: '1px solid #FFE08A',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontSize: '0.82rem',
              color: '#0A0A0A',
            }}
          >
            <Clock size={18} color="#0A0A0A" style={{ flexShrink: 0 }} />
            <div>
              <strong>Fast Response:</strong> Send your material requirements to our client sales team. You will receive customized wholesale prices and delivery schedules directly on WhatsApp within <strong>15 mins</strong>.
            </div>
          </div>

          {/* Row 1: Name & Phone Number */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                Your Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
                placeholder="e.g. Mohit Kumar"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#0F172A',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                placeholder="e.g. +91 9630938487"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Site Delivery Location */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '4px' }}>
              Project / Delivery Site Location
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <MapPin size={16} color="#0A0A0A" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
              <input
                type="text"
                value={siteLocation}
                onChange={(e) => setSiteLocation(e.target.value)}
                placeholder="e.g. Super Corridor Project Site, Indore"
                style={{
                  width: '100%',
                  height: '42px',
                  borderRadius: '10px',
                  border: '1.5px solid #CBD5E1',
                  padding: '0 12px 0 36px',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: '#0F172A',
                }}
              />
            </div>
          </div>

          {/* Category Chips Selection */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Select Trade / Categories:
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {tradeCategories.map((cat) => {
                const isSelected = selectedCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => toggleCategory(cat)}
                    style={{
                      padding: '5px 11px',
                      borderRadius: '9999px',
                      fontSize: '0.76rem',
                      fontWeight: '700',
                      border: isSelected ? '1.5px solid #FFB800' : '1px solid #E2E8F0',
                      backgroundColor: isSelected ? '#FFF8E1' : '#FFFFFF',
                      color: isSelected ? '#0A0A0A' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {isSelected && <CheckCircle2 size={12} color="#0A0A0A" />}
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Requirements Textarea */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A' }}>
                Required Materials & Quantity (BOQ List):
              </label>

              {cartItemCount > 0 && (
                <button
                  type="button"
                  onClick={handleImportCart}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#0A0A0A',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Plus size={13} />
                  <span>Include Cart ({cartItemCount} items)</span>
                </button>
              )}
            </div>

            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="e.g., 200 Bags UltraTech PPC Cement, 5 Tonnes 12mm TMT Steel Bars, 40 Sheets 19mm Marine Ply, 10 Tubs Fevicol SH required at construction site."
              style={{
                width: '100%',
                borderRadius: '10px',
                border: '1.5px solid #CBD5E1',
                padding: '10px 12px',
                fontSize: '0.88rem',
                color: '#0F172A',
                resize: 'vertical',
                fontFamily: 'inherit',
                lineHeight: '1.4',
              }}
            />
          </div>

          {/* Urgency Radio Selector */}
          <div>
            <label style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0F172A', display: 'block', marginBottom: '6px' }}>
              Delivery Timeline:
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {urgencyOptions.map((opt) => (
                <label
                  key={opt}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: urgency === opt ? '#FFF8E1' : '#F8FAFC',
                    border: urgency === opt ? '1.5px solid #FFB800' : '1px solid #E2E8F0',
                    fontSize: '0.82rem',
                    fontWeight: urgency === opt ? '700' : '500',
                    color: urgency === opt ? '#0A0A0A' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={opt}
                    checked={urgency === opt}
                    onChange={(e) => setUrgency(e.target.value)}
                    style={{ accentColor: '#FFB800' }}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Send on WhatsApp CTA Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              height: '50px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: '#0A0A0A',
              color: '#FFFFFF',
              fontSize: '1rem',
              fontWeight: '800',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.3)',
              transition: 'all 0.18s ease',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1A1A1A';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#0A0A0A';
              e.currentTarget.style.transform = 'none';
            }}
          >
            <MessageSquare size={20} fill="#FFFFFF" />
            <span>Send Requirement on WhatsApp 💬</span>
          </button>

          <div
            style={{
              textAlign: 'center',
              fontSize: '0.74rem',
              color: '#64748B',
              fontWeight: '500',
            }}
          >
            Direct sales line: <strong>{siteSettings?.whatsappNumber || siteSettings?.supportPhone || '+91 96309 38487'}</strong> • BuildMyDestiny Certified Wholesale Desk
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuotationModal;
