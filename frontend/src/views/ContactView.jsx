import React, { useState } from 'react';
import { Phone, Mail, MapPin, Send, Building, HardHat, FileText, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const ContactView = () => {
  const { addToast, addQuotation, addSupportMessage, siteSettings } = useStore();
  const [form, setForm] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    projectCity: 'Indore',
    boqDetails: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);

    if (addQuotation) {
      addQuotation({
        clientName: form.name,
        company: form.company || 'Private Construction Client',
        phone: form.phone,
        email: form.email,
        siteCity: form.projectCity,
        requiredMaterials: form.boqDetails,
        notes: `Submitted via website contact page from city: ${form.projectCity}`,
      });
    }

    if (addSupportMessage) {
      addSupportMessage({
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.boqDetails,
      });
    }

    addToast('BOQ Quotation Request received! Our material specialist will review and respond.', 'success');
  };

  return (
    <div className="page-container" style={{ maxWidth: '1020px' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 className="page-title" style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>
          Contact BuildMyDestiny & Request Project BOQ Quote
        </h1>
        <p className="page-subtitle" style={{ maxWidth: '680px', margin: '0 auto' }}>
          Connect with our structural material engineers for project estimates, bulk volume discounts, and site delivery coordination.
        </p>
      </div>

      <div className="responsive-split" style={{ gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Form: BOQ / Inquiry */}
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--light-orange)', color: 'var(--primary-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle2 size={36} />
              </div>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '0.5rem' }}>
                BOQ Request Submitted Successfully!
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', marginBottom: '1.5rem', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                Our senior material engineer has received your inquiry. We will generate a formal stamped quotation with factory-direct rates within 2 hours.
              </p>
              <button onClick={() => setSubmitted(false)} className="btn btn-secondary">
                Submit Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 style={{ fontSize: '1.3rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)' }}>
                Request Formal Project Quotation
              </h2>

              <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Anand Mehta"
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Company / Builder Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Mehta Infra"
                    className="form-control"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                  />
                </div>
              </div>

              <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 00000"
                    className="form-control"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="anand@mehtainfra.com"
                    className="form-control"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Construction Site City / Region</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Super Corridor, Indore"
                  className="form-control"
                  value={form.projectCity}
                  onChange={(e) => setForm({ ...form, projectCity: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bill of Quantities (BOQ) or Material Requirements</label>
                <textarea
                  rows={4}
                  required
                  placeholder="e.g. 500 Bags UltraTech OPC 53 Cement, 12 Tonnes Tata Tiscon 550D (12mm & 16mm), 2000 AAC Blocks (600x200x150mm)..."
                  className="form-control"
                  value={form.boqDetails}
                  onChange={(e) => setForm({ ...form, boqDetails: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-block"
                style={{ fontWeight: '800', display: 'flex', gap: '8px' }}
              >
                <Send size={18} />
                <span>Submit Quotation Request</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Info Box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Direct Hotlines */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--primary-navy)', fontWeight: '800', marginBottom: '1rem' }}>
              Contractor Support Hotlines
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--light-orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-orange)', flexShrink: 0 }}>
                  <Phone size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>Toll Free Helpline</div>
                  <div style={{ color: 'var(--text-secondary)' }}>+91 1800 200 8899</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mon - Sat, 7:00 AM - 9:00 PM</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-navy)', flexShrink: 0 }}>
                  <Mail size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>Contractor Sales Email</div>
                  <div style={{ color: 'var(--text-secondary)' }}>contractor-sales@buildmydestiny.com</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-primary)', flexShrink: 0 }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', color: 'var(--primary-navy)' }}>Central Logistics Depot</div>
                  <div style={{ color: 'var(--text-secondary)' }}>Plot 12, Super Corridor Logistics Park, Indore, MP - 452005</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Hubs Box */}
          <div style={{ backgroundColor: 'var(--dark-navy)', color: '#FFFFFF', borderRadius: 'var(--radius-md)', padding: '1.5rem', borderLeft: '4px solid var(--primary-orange)' }}>
            <div style={{ fontWeight: '800', fontSize: '1rem', marginBottom: '6px', color: '#FFFFFF' }}>
              Regional Dispatch Hubs:
            </div>
            <p style={{ fontSize: '0.825rem', color: '#CBD5E1', lineHeight: '1.5' }}>
              Indore (Main Depot) • Bhopal • Ujjain • Dewas • Pithampur SEZ • Mumbai • Pune • Delhi NCR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactView;
