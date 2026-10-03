import React from 'react';
import { Bell, Truck, TrendingDown, FileText, CheckCircle2, ArrowLeft, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const NotificationsView = () => {
  const { notifications, setNotifications, navigateTo, addToast } = useStore();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    addToast('All notifications marked as read', 'info');
  };

  const handleClear = () => {
    setNotifications([]);
    addToast('Notifications cleared', 'info');
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigateTo('profile')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary-navy)', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Account</span>
      </button>

      {/* Header */}
      <div className="page-header-row" style={{ marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.8rem', marginBottom: '0.2rem' }}>
            Project & Material Alerts
          </h1>
          <p className="page-subtitle">
            Live dispatch notices, regional price movements & GST tax invoices.
          </p>
        </div>

        {notifications.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleMarkAllRead}
              className="btn btn-secondary btn-sm"
            >
              Mark all read
            </button>
            <button
              onClick={handleClear}
              className="btn btn-outline-orange btn-sm"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                backgroundColor: notif.unread ? '#FFFFFF' : 'var(--bg-surface)',
                border: `1.5px solid ${notif.unread ? 'var(--primary-orange)' : 'var(--border-subtle)'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                boxShadow: notif.unread ? 'var(--shadow-sm)' : 'none',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              {/* Icon indicator */}
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  backgroundColor: notif.type === 'delivery' ? 'var(--light-orange)' : notif.type === 'price_drop' ? '#F2F2F2' : 'var(--navy-subtle)',
                  color: notif.type === 'delivery' ? 'var(--primary-orange)' : notif.type === 'price_drop' ? '#0A0A0A' : 'var(--primary-navy)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {notif.type === 'delivery' ? (
                  <Truck size={18} />
                ) : notif.type === 'price_drop' ? (
                  <TrendingDown size={18} />
                ) : (
                  <FileText size={18} />
                )}
              </div>

              {/* Message */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <div style={{ fontWeight: '800', fontSize: '0.95rem', color: 'var(--primary-navy)' }}>
                    {notif.title}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {notif.time}
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {notif.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ backgroundColor: '#FFFFFF', padding: '3rem', textAlign: 'center', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <Bell size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', marginBottom: '0.4rem' }}>No new notifications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>You're all caught up with your project dispatches.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsView;
