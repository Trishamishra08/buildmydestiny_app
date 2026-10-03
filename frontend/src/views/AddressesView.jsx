import React, { useState } from 'react';
import { MapPin, Plus, Trash2, CheckCircle2, Building, ArrowLeft, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const AddressesView = () => {
  const { addresses, addAddress, deleteAddress, setDefaultAddress, navigateTo, user, openLoginModal } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);

  if (!user) {
    return (
      <div className="container page-container" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            backgroundColor: '#FFFFFF',
            borderRadius: 'var(--radius-md)',
            padding: '2.5rem 1.5rem',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--navy-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: 'var(--primary-navy)' }}>
            <MapPin size={32} />
          </div>
          <h2 style={{ fontSize: '1.4rem', color: 'var(--primary-navy)', marginBottom: '0.5rem', fontWeight: '800' }}>
            Sign In to Manage Site Addresses
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.75rem' }}>
            Save multiple active project site delivery locations, crane unloading guidelines & site supervisor contact details.
          </p>
          <button
            onClick={() => openLoginModal('login', () => navigateTo('addresses'))}
            className="btn btn-primary btn-lg mobile-w-full"
            style={{ fontWeight: '800' }}
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }
  const [newAddr, setNewAddr] = useState({
    title: '',
    type: 'Construction Site',
    recipientName: '',
    phone: '',
    addressLine: '',
    locality: '',
    city: 'Indore',
    state: 'Madhya Pradesh',
    pincode: '',
    unloadingNotes: '',
    isDefault: false,
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!newAddr.title || !newAddr.addressLine || !newAddr.pincode) return;
    addAddress(newAddr);
    setShowAddModal(false);
    setNewAddr({
      title: '',
      type: 'Construction Site',
      recipientName: '',
      phone: '',
      addressLine: '',
      locality: '',
      city: 'Indore',
      state: 'Madhya Pradesh',
      pincode: '',
      unloadingNotes: '',
      isDefault: false,
    });
  };

  return (
    <div className="page-container" style={{ maxWidth: '1080px' }}>
      {/* Back Button */}
      <button
        onClick={() => navigateTo('profile')}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--primary-navy)', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', marginBottom: '1.25rem' }}
      >
        <ArrowLeft size={16} />
        <span>Back to Account Dashboard</span>
      </button>

      {/* Header */}
      <div className="page-header-row" style={{ marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">
            Site Delivery Locations
          </h1>
          <p className="page-subtitle">
            Manage active construction site destinations, crane unloading coordinates & supervisor contact numbers.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary btn-sm"
          style={{ display: 'flex', gap: '6px' }}
        >
          <Plus size={16} />
          <span>Add New Construction Site</span>
        </button>
      </div>

      {/* Addresses Grid */}
      <div className="responsive-split-equal">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className="card"
            style={{
              padding: '1.5rem',
              backgroundColor: '#FFFFFF',
              border: `1.5px solid ${addr.isDefault ? 'var(--primary-orange)' : 'var(--border-subtle)'}`,
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--primary-navy)' }}>
                    {addr.title}
                  </span>
                  <span className="badge badge-navy">{addr.type}</span>
                </div>
                {addr.isDefault && (
                  <span className="badge badge-orange">
                    Primary Site
                  </span>
                )}
              </div>

              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: '1.5' }}>
                {addr.addressLine}, {addr.locality ? `${addr.locality}, ` : ''}{addr.city} - {addr.pincode}
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <strong>Site In-charge:</strong> {addr.recipientName} • <strong>Phone:</strong> {addr.phone}
              </div>

              {addr.unloadingNotes && (
                <div style={{ backgroundColor: 'var(--bg-surface)', padding: '8px 10px', borderRadius: '4px', fontSize: '0.78rem', color: 'var(--primary-navy)', marginTop: '8px' }}>
                  <strong>Heavy Vehicle Unload Note:</strong> {addr.unloadingNotes}
                </div>
              )}
            </div>

            {/* Actions Bottom */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', marginTop: '1rem' }}>
              {!addr.isDefault ? (
                <button
                  type="button"
                  onClick={() => setDefaultAddress(addr.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary-orange)', fontWeight: '700', fontSize: '0.825rem', cursor: 'pointer' }}
                >
                  Set as Default Site
                </button>
              ) : (
                <span style={{ fontSize: '0.825rem', color: '#0A0A0A', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <CheckCircle2 size={14} /> Default Delivery Site
                </span>
              )}

              {addresses.length > 1 && (
                <button
                  type="button"
                  onClick={() => deleteAddress(addr.id)}
                  style={{ background: 'none', border: 'none', color: '#0A0A0A', cursor: 'pointer', padding: '4px' }}
                  title="Delete Address"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', color: 'var(--primary-navy)', fontWeight: '800' }}>Add New Project Site Destination</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ padding: '1.5rem' }}>
              <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Project / Site Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Line 3 Pillar 82"
                    className="form-control"
                    value={newAddr.title}
                    onChange={(e) => setNewAddr({ ...newAddr, title: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Location Type</label>
                  <select
                    className="form-control"
                    value={newAddr.type}
                    onChange={(e) => setNewAddr({ ...newAddr, type: e.target.value })}
                  >
                    <option value="Construction Site">Construction Site</option>
                    <option value="Commercial Office">Commercial Office</option>
                    <option value="Warehouse / Depot">Warehouse / Depot</option>
                    <option value="Residential Home">Residential Home</option>
                  </select>
                </div>
              </div>

              <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Site In-charge / Supervisor Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Er. Rajesh Sharma"
                    className="form-control"
                    value={newAddr.recipientName}
                    onChange={(e) => setNewAddr({ ...newAddr, recipientName: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Site Supervisor Mobile</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98260 11223"
                    className="form-control"
                    value={newAddr.phone}
                    onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Detailed Site Address & Street</label>
                <input
                  type="text"
                  required
                  placeholder="Plot 44-B, Near Ring Road Bypass..."
                  className="form-control"
                  value={newAddr.addressLine}
                  onChange={(e) => setNewAddr({ ...newAddr, addressLine: e.target.value })}
                />
              </div>

              <div className="responsive-split-equal" style={{ gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    required
                    className="form-control"
                    value={newAddr.city}
                    onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="452005"
                    className="form-control"
                    value={newAddr.pincode}
                    onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Heavy Vehicle / Crane Unloading Access Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Heavy 10-wheeler access via Gate 2. Crane unloading available."
                  className="form-control"
                  value={newAddr.unloadingNotes}
                  onChange={(e) => setNewAddr({ ...newAddr, unloadingNotes: e.target.value })}
                />
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ fontWeight: '800', marginTop: '0.5rem' }}>
                Save Site Destination
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressesView;
