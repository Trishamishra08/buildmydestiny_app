import React, { useState, useEffect } from 'react';
import { MapPin, X, Check, Search, Building, Navigation, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { checkDeliveryServiceability } from '../utils/deliveryValidation';

export const LocationModal = () => {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    currentCity,
    setCurrentCity,
    currentPincode,
    setCurrentPincode,
    addToast,
    siteSettings,
    fetchCurrentGpsLocation,
    isDetectingLocation,
  } = useStore();
  const [tempPincode, setTempPincode] = useState(currentPincode || '452005');

  // Keep tempPincode in sync with currentPincode when modal opens
  useEffect(() => {
    if (isLocationModalOpen) {
      setTempPincode(currentPincode || '');
    }
  }, [isLocationModalOpen, currentPincode]);

  if (!isLocationModalOpen) return null;

  const handleApplyPincode = (e) => {
    if (e) e.preventDefault();
    const cleanPin = (tempPincode || '').replace(/\D/g, '').trim();
    if (cleanPin.length === 6) {
      const check = checkDeliveryServiceability({ pincode: cleanPin, siteSettings });
      if (!check.isServiceable) {
        addToast(check.reason, 'warning', 7000);
      } else {
        addToast(`Delivery pincode ${cleanPin} applied! (Serviceable Area)`, 'success');
      }
      setCurrentPincode(cleanPin);
      setIsLocationModalOpen(false);
    } else {
      addToast('Please enter a valid 6-digit site pincode', 'warning');
    }
  };

  const handleGpsClick = async () => {
    try {
      const res = await fetchCurrentGpsLocation();
      if (res) {
        setIsLocationModalOpen(false);
      }
    } catch (err) {
      console.error('GPS fetch error in LocationModal:', err);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setIsLocationModalOpen(false)}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--light-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)' }}>
              <MapPin size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--primary-navy)' }}>Select Construction Site Location</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Delivery trucks & material hubs are routed by location</p>
            </div>
          </div>
          <button onClick={() => setIsLocationModalOpen(false)} style={{ background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem' }}>
          {/* Automatic GPS Location Detection Button */}
          <button
            type="button"
            onClick={handleGpsClick}
            disabled={isDetectingLocation}
            style={{
              width: '100%',
              padding: '11px 16px',
              backgroundColor: isDetectingLocation ? '#F2F2F2' : '#F2F2F2',
              border: '1.5px solid #CBD5E1',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              color: '#0A0A0A',
              fontWeight: '700',
              fontSize: '0.88rem',
              cursor: isDetectingLocation ? 'wait' : 'pointer',
              marginBottom: '1.25rem',
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
                <Navigation size={16} color="#0A0A0A" />
                <span>Use Current Location (Automatic GPS)</span>
              </>
            )}
          </button>
          {/* Pincode Input Form */}
          <form onSubmit={handleApplyPincode} style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontSize: '0.85rem' }}>Enter 6-Digit Site Pincode</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 452005"
                className="form-control"
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value.replace(/\D/g, ''))}
                style={{ flex: 1, letterSpacing: '2px', fontWeight: '700' }}
              />
              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                Apply
              </button>
            </div>
          </form>

          {/* Serviceable Zones Info */}
          {Array.isArray(siteSettings?.serviceableCities) && siteSettings.serviceableCities.length > 0 && (
            <div
              style={{
                marginTop: '1.25rem',
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                padding: '10px 14px',
                border: '1px solid #E2E8F0',
                fontSize: '0.78rem',
                color: '#64748B',
              }}
            >
              <div style={{ fontWeight: '700', color: '#334155', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <ShieldCheck size={14} color="#0A0A0A" />
                <span>Serviceable Cities & Dispatch Hubs</span>
              </div>
              <div>
                Accepting orders in: <strong style={{ color: '#0F172A' }}>{siteSettings.serviceableCities.slice(0, 8).join(', ')}</strong>
                {siteSettings.maxDeliveryRadiusKm ? ` (within ${siteSettings.maxDeliveryRadiusKm} km range)` : ''}.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
