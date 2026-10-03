import React from 'react';
import { Calendar, Clock, MapPin, CheckCircle, AlertCircle, RefreshCw, Phone, User } from 'lucide-react';

export const BookingsView = ({
  bookings,
  loading,
  onRefresh,
  onUpdateStatus,
  onBookNew,
}) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="badge badge-primary">Confirmed</span>;
      case 'In Progress':
        return <span className="badge badge-info">In Progress</span>;
      case 'Completed':
        return <span className="badge badge-success">Completed</span>;
      case 'Cancelled':
        return <span className="badge" style={{ background: '#F2F2F2', color: '#0A0A0A' }}>Cancelled</span>;
      default:
        return <span className="badge badge-warning">{status || 'Pending'}</span>;
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '0.4rem' }}>
            Bookings & Service Orders
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Track technician appointments, scheduled dates, and service progress in real-time.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={onRefresh} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button onClick={onBookNew} className="btn btn-primary btn-sm">
            + New Booking
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading your bookings...
        </div>
      ) : bookings.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <Calendar size={48} color="var(--primary)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Active Bookings</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            You have not scheduled any technician visits yet.
          </p>
          <button onClick={onBookNew} className="btn btn-primary">
            Browse Services to Book
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((booking) => (
            <div
              key={booking._id}
              className="card"
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto',
                gap: '1.5rem',
                alignItems: 'center',
                padding: '1.5rem',
              }}
            >
              {/* Service / Mistri Icon */}
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'rgba(255, 184, 0, 0.12)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)',
              }}>
                <Calendar size={28} />
              </div>

              {/* Booking Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>
                    {booking.service?.title || 'Home Maintenance Service'}
                  </h3>
                  {getStatusBadge(booking.status)}
                </div>

                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1.2rem',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '0.5rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} color="var(--primary)" />
                    <span>{booking.bookingDate}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="var(--primary)" />
                    <span>{booking.timeSlot}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span>{booking.serviceAddress?.street}, {booking.serviceAddress?.city}</span>
                  </div>

                  {booking.mistri && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <User size={14} color="#0A0A0A" />
                      <span>Technician: {booking.mistri.fullName || booking.mistri.name}</span>
                    </div>
                  )}
                </div>

                {booking.problemDescription && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                    <strong>Note:</strong> {booking.problemDescription}
                  </div>
                )}
              </div>

              {/* Price & Action Controls */}
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.6rem', alignItems: 'flex-end' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{booking.amount}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {booking.paymentMethod} • <span style={{ color: booking.paymentStatus === 'Paid' ? '#0A0A0A' : '#E6A600' }}>{booking.paymentStatus}</span>
                </div>

                {booking.status !== 'Completed' && booking.status !== 'Cancelled' && (
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem' }}>
                    <button
                      onClick={() => onUpdateStatus(booking._id, 'Completed')}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => onUpdateStatus(booking._id, 'Cancelled')}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', color: '#0A0A0A', borderColor: '#0A0A0A' }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingsView;
