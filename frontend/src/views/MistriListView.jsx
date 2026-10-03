import React from 'react';
import { Search, MapPin, Briefcase } from 'lucide-react';
import MistriCard from '../components/MistriCard';

export const MistriListView = ({
  mistris,
  loading,
  city,
  setCity,
  profession,
  setProfession,
  search,
  setSearch,
  onHireMistri,
}) => {
  const cities = ['All Cities', 'Mumbai', 'Delhi', 'Bengaluru', 'Pune'];
  const professions = [
    'All Professions',
    'Senior Electrician',
    'Master Plumber',
    'HVAC & AC Technician',
    'Expert Carpenter',
  ];

  return (
    <div className="container" style={{ padding: '3rem 1.5rem 5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>
          Certified Technicians & Mistris
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Hire background-verified, high-rated local specialists for direct hourly consultations & repair jobs.
        </p>
      </div>

      {/* Filter Row */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        background: 'var(--bg-card)',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-subtle)',
        marginBottom: '2.5rem',
      }}>
        {/* City Filter */}
        <div style={{ flex: '1 1 200px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <MapPin size={14} /> City
          </label>
          <select
            className="form-control"
            value={city}
            onChange={(e) => setCity(e.target.value === 'All Cities' ? '' : e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c} style={{ background: '#1A1A1A' }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Profession Filter */}
        <div style={{ flex: '1 1 220px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Briefcase size={14} /> Profession
          </label>
          <select
            className="form-control"
            value={profession}
            onChange={(e) => setProfession(e.target.value === 'All Professions' ? '' : e.target.value)}
          >
            {professions.map((p) => (
              <option key={p} value={p} style={{ background: '#1A1A1A' }}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div style={{ flex: '2 1 280px' }}>
          <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
            <Search size={14} /> Search by Name or Skill
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. Rajesh, Inverter AC, Leakage, Wood Polishing..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Mistri Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
          Loading technicians...
        </div>
      ) : mistris.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 2rem',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No technicians matched your filters</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Try selecting "All Cities" or "All Professions".
          </p>
          <button onClick={() => { setCity(''); setProfession(''); setSearch(''); }} className="btn btn-secondary btn-sm">
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-6">
          {mistris.map((mistri) => (
            <MistriCard key={mistri._id} mistri={mistri} onHireDirectly={onHireMistri} />
          ))}
        </div>
      )}
    </div>
  );
};

export default MistriListView;
