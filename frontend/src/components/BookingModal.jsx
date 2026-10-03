import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Phone, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../controllers/useAuth';

export const BookingModal = ({ service, mistri, onClose, onBookingSuccess, onOpenAuth }) => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    bookingDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    timeSlot: '09:00 AM - 11:00 AM',
    fullName: user?.name || '',
    phone: user?.phone || '+91 98765 43210',
    street: user?.address?.street || '',
    city: user?.address?.city || 'Mumbai',
    pincode: user?.address?.pincode || '400001',
    problemDescription: '',
    paymentMethod: 'Cash on Service',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
    '06:00 PM - 08:00 PM',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.street || !formData.pincode) {
      setErrorMsg('Please fill in all address and contact fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const bookingPayload = {
      serviceId: service?._id || 'srv_1',
      mistriId: mistri?._id || null,
      bookingDate: formData.bookingDate,
      timeSlot: formData.timeSlot,
      serviceAddress: {
        fullName: formData.fullName,
        phone: formData.phone,
        street: formData.street,
        city: formData.city,
        pincode: formData.pincode,
      },
      problemDescription: formData.problemDescription,
      amount: service?.basePrice || mistri?.hourlyRate || 299,
      paymentMethod: formData.paymentMethod,
    };

    try {
      const res = await onBookingSuccess(bookingPayload);
      if (res && res.success) {
        setSuccess(true);
      } else {
        setErrorMsg(res?.message || 'Booking submission failed');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>
              {success ? 'Booking Confirmed!' : 'Schedule Service Booking'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {service ? service.title : `Dedicated Hire: ${mistri?.fullName}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem' }}>
          {success ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#FFF8E1', color: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto' }}>
                <CheckCircle size={36} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: '700', marginBottom: '0.5rem' }}>
                Your Booking is Confirmed!
              </h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '380px', margin: '0 auto 1.5rem auto' }}>
                Our technician will reach your location on <strong>{formData.bookingDate}</strong> during <strong>{formData.timeSlot}</strong>.
              </p>
              <button onClick={onClose} className="btn btn-primary" style={{ width: '100%' }}>
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {errorMsg && (
                <div style={{
                  background: '#F2F2F2',
                  border: '1px solid #D4D4D4',
                  color: '#0A0A0A',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  marginBottom: '1rem',
                }}>
                  {errorMsg}
                </div>
              )}

              {/* Date & Time Slot */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={14} /> Service Date
                  </label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.bookingDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> Time Slot
                  </label>
                  <select
                    className="form-control"
                    value={formData.timeSlot}
                    onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  >
                    {timeSlots.map((slot) => (
                      <option key={slot} value={slot} style={{ background: '#1A1A1A' }}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={14} /> Your Full Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Rahul Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={14} /> Mobile Phone
                  </label>
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Service Address */}
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={14} /> Flat / House / Street Address
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Flat 302, Green Valley Apartments, MG Road"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Problem notes */}
              <div className="form-group">
                <label className="form-label">Describe Issue / Additional Notes (Optional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="e.g. AC cooling fan is making vibration noise..."
                  value={formData.problemDescription}
                  onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                />
              </div>

              {/* Total & Submit */}
              <div style={{
                background: 'var(--bg-surface)',
                padding: '1rem',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1rem',
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Estimated Cost</div>
                  <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
                    ₹{service?.basePrice || mistri?.hourlyRate || 299}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                  style={{ minWidth: '160px' }}
                >
                  {loading ? 'Confirming...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
