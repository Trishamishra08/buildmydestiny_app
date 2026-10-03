import React from 'react';
import { Star, ShieldCheck, MapPin, Briefcase, Phone, Calendar } from 'lucide-react';

export const MistriCard = ({ mistri, onHireDirectly }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        {/* Profile Header */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={mistri.avatar}
              alt={mistri.fullName}
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
            />
            {mistri.isVerified && (
              <div style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                background: '#0A0A0A',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                border: '2px solid var(--bg-card)',
              }}>
                <ShieldCheck size={11} strokeWidth={3} />
              </div>
            )}
          </div>

          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{mistri.fullName}</h3>
            <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: '600' }}>
              {mistri.profession}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <MapPin size={13} />
              <span>{mistri.city}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          background: 'var(--bg-surface)',
          padding: '0.75rem',
          borderRadius: 'var(--radius-sm)',
          gap: '0.5rem',
          textAlign: 'center',
          marginBottom: '1rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3px', color: '#E6A600', fontWeight: '700', fontSize: '0.9rem' }}>
              <Star size={13} fill="#FFB800" strokeWidth={0} />
              <span>{mistri.rating}</span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rating</div>
          </div>

          <div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              {mistri.experienceYears}+ Yrs
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Exp</div>
          </div>

          <div>
            <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0A0A0A' }}>
              {mistri.jobsCompleted}+
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Jobs Done</div>
          </div>
        </div>

        {/* Bio */}
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {mistri.bio}
        </p>

        {/* Specialization Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
          {mistri.specializations.slice(0, 3).map((spec, idx) => (
            <span key={idx} style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
            }}>
              {spec}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom Action */}
      <div style={{
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Visiting / Hr</span>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary)' }}>
            ₹{mistri.hourlyRate}<span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'normal' }}>/hr</span>
          </div>
        </div>

        <button
          onClick={() => onHireDirectly(mistri)}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Calendar size={14} />
          <span>Book Mistri</span>
        </button>
      </div>
    </div>
  );
};

export default MistriCard;
