import React, { useEffect, useState } from 'react';
import { Truck, Phone, Clock, MapPin, Store, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const STEPS = ['Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered'];
const STEP_LABEL = { Processing: 'Preparing', 'Ready to Ship': 'Packed', Shipped: 'Shipped', 'Out for Delivery': 'Out for delivery', Delivered: 'Delivered' };

const left = (minutes) => {
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const text = h ? `${h} hr ${abs % 60} min` : `${abs} min`;
  return minutes < 0 ? `${text} late` : `${text} left`;
};

const when = (value) => {
  const d = value ? new Date(value) : null;
  return d && !Number.isNaN(d.getTime()) ? d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
};

/**
 * Delivery is handled by each vendor: shows, per vendor, the status they have reported,
 * who is delivering and how long is left against the zone's delivery promise.
 */
export default function VendorDeliveryCard({ orderId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!orderId) return undefined;
    let alive = true;
    const load = () =>
      api
        .trackOrder(orderId)
        .then((res) => alive && setData(res.data))
        .catch(() => {});
    load();
    const timer = setInterval(load, 30000);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [orderId]);

  if (!data?.shipments?.length) return null;

  return (
    <div style={{ background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.25rem', marginBottom: '1rem', boxShadow: 'var(--shadow-xs)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: '0.9rem' }}>
        <div style={{ fontWeight: 800, color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Truck size={18} /> Delivered by the seller{data.shipments.length > 1 ? 's' : ''}
        </div>
        {data.zone?.name && (
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <MapPin size={14} /> {data.zone.name}
            {data.promisedBy && <> · by <b>{when(data.promisedBy)}</b></>}
          </span>
        )}
      </div>

      {data.shipments.map((s) => {
        const stepIndex = STEPS.indexOf(s.status);
        const delivered = s.status === 'Delivered';
        return (
          <div key={s.vendorId} style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '0.9rem 1rem', marginBottom: '0.7rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Store size={15} /> {s.vendorName}
              </div>
              {delivered ? (
                <span style={{ color: '#166534', fontWeight: 800, fontSize: '0.8rem', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                  <CheckCircle2 size={15} /> Delivered {when(s.deliveredAt)}
                </span>
              ) : s.minutesLeft !== null ? (
                <span style={{ color: s.isDelayed ? '#B91C1C' : '#0369A1', fontWeight: 800, fontSize: '0.8rem', display: 'inline-flex', gap: 5, alignItems: 'center' }}>
                  {s.isDelayed ? <AlertCircle size={15} /> : <Clock size={15} />} {left(s.minutesLeft)}
                </span>
              ) : null}
            </div>

            <div style={{ display: 'flex', gap: 4, margin: '0.8rem 0 0.4rem' }}>
              {STEPS.map((step, i) => (
                <div key={step} style={{ flex: 1 }}>
                  <div style={{ height: 6, borderRadius: 99, background: i <= stepIndex ? '#FFB800' : '#E5E7EB' }} />
                  <div style={{ fontSize: '0.64rem', marginTop: 4, textAlign: 'center', fontWeight: i === stepIndex ? 800 : 500, color: i <= stepIndex ? '#0A0A0A' : '#9CA3AF' }}>{STEP_LABEL[step]}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{s.message}</div>

            {s.rider?.name && !delivered && (
              <div style={{ marginTop: '0.6rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: '0.82rem' }}>
                <span>
                  <b>{s.rider.name}</b>
                  {s.rider.vehicleNumber ? ` · ${s.rider.vehicleNumber}` : ''}
                </span>
                {s.rider.phone && (
                  <a href={`tel:${s.rider.phone}`} className="btn btn-primary btn-sm" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 700 }}>
                    <Phone size={13} /> Call
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
