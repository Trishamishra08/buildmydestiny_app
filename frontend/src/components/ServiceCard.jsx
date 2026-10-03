import React from 'react';
import { Star, Clock, CheckCircle2, ArrowRight } from 'lucide-react';

export const ServiceCard = ({ service, onBookNow }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Top Image & Badge */}
        <div style={{ position: 'relative', height: '180px', borderRadius: '10px', overflow: 'hidden', marginBottom: '1.2rem' }}>
          <img
            src={service.image}
            alt={service.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '6px' }}>
            <span className="badge badge-primary">{service.category}</span>
            {service.isPopular && <span className="badge badge-success">Popular</span>}
          </div>
          <div style={{
            position: 'absolute',
            bottom: '10px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            padding: '4px 8px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            color: '#FFB800',
            fontWeight: '600',
          }}>
            <Star size={14} fill="#FFB800" strokeWidth={0} />
            <span>{service.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({service.reviewCount})</span>
          </div>
        </div>

        {/* Title & Description */}
        <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '0.5rem', lineHeight: '1.3' }}>
          {service.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {service.description}
        </p>

        {/* Features Checklist */}
        {service.features && service.features.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
            {service.features.slice(0, 3).map((feat, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={14} color="#0A0A0A" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pricing & CTA */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Starts From</div>
          <div style={{ fontSize: '1.3rem', fontWeight: '800', color: 'var(--primary)' }}>
            ₹{service.basePrice}
          </div>
        </div>

        <button
          onClick={() => onBookNow(service)}
          className="btn btn-primary btn-sm"
          style={{ padding: '0.55rem 1.1rem' }}
        >
          <span>Book Now</span>
          <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
