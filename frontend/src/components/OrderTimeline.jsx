import React from 'react';
import { CheckCircle2, Clock, Truck, Package, MapPin, ShieldCheck } from 'lucide-react';

export const OrderTimeline = ({ steps = [], currentStep = 1 }) => {
  return (
    <div style={{ padding: '1rem 0' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0', position: 'relative' }}>
        {steps.map((step, idx) => {
          const isDone = step.done || idx + 1 < currentStep;
          const isCurrent = idx + 1 === currentStep;
          const isLast = idx === steps.length - 1;

          return (
            <div key={idx} style={{ display: 'flex', gap: '16px', position: 'relative', minHeight: '64px' }}>
              {/* Vertical Connecting Line */}
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    top: '28px',
                    left: '13px',
                    width: '2px',
                    bottom: '0',
                    backgroundColor: isDone ? 'var(--primary-orange)' : 'var(--border-medium)',
                    zIndex: 1,
                  }}
                />
              )}

              {/* Circle Icon Indicator */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? 'var(--primary-orange)' : isCurrent ? '#FFFFFF' : '#FFFFFF',
                  border: `2px solid ${isDone ? 'var(--primary-orange)' : isCurrent ? 'var(--primary-orange)' : 'var(--border-medium)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDone ? '#0A0A0A' : isCurrent ? 'var(--primary-orange)' : 'var(--text-muted)',
                  zIndex: 2,
                  flexShrink: 0,
                  boxShadow: isCurrent ? '0 0 0 4px var(--orange-subtle)' : 'none',
                }}
              >
                {isDone ? (
                  <CheckCircle2 size={16} />
                ) : isCurrent ? (
                  <Clock size={16} />
                ) : (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--border-medium)' }} />
                )}
              </div>

              {/* Step Details */}
              <div style={{ flex: 1, paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      fontSize: '0.925rem',
                      fontWeight: isCurrent || isDone ? '700' : '500',
                      color: isCurrent ? 'var(--primary-navy)' : isDone ? 'var(--text-primary)' : 'var(--text-muted)',
                    }}
                  >
                    {step.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: isCurrent ? 'var(--primary-orange)' : 'var(--text-muted)' }}>
                    {step.time}
                  </span>
                </div>
                {step.desc && (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {step.desc}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
