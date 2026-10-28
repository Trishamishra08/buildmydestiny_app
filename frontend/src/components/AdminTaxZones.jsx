import React, { useCallback, useEffect, useState } from 'react';
import { MapPin, Percent, Plus, Save, Trash2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import api from '../services/api';

// Standard GST slabs (mirrors backend utils/gst.js).
const GST_SLABS = [0, 0.25, 3, 5, 12, 18, 28];

const card = { background: '#fff', borderRadius: 14, border: '1px solid #E2E8F0', padding: '1.25rem', marginBottom: '1.25rem' };
const input = { width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1.5px solid #CBD5E1', fontSize: '0.84rem', boxSizing: 'border-box', fontFamily: 'inherit' };
const label = { display: 'block', fontSize: '0.74rem', fontWeight: 700, color: '#475569', marginBottom: 4 };
const btn = { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.95rem', borderRadius: 8, border: 'none', background: '#FFB800', color: '#0A0A0A', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit' };

const emptyZone = { id: '', name: '', city: '', pincodesText: '', etaMinutes: 180, active: true };

const parsePincodes = (text) => [...new Set(String(text || '').split(/[\s,;]+/).filter(Boolean))];

/**
 * Admin: tax rules per category (GST / HSN / platform commission), the platform commission
 * default, and the delivery zones vendors deliver to.
 */
export default function AdminTaxZones() {
  const { categories, updateCategory, siteSettings, updateSiteSettings, addToast } = useStore();
  const [drafts, setDrafts] = useState({});
  const [zones, setZones] = useState([]);
  const [zoneForm, setZoneForm] = useState(emptyZone);

  const loadZones = useCallback(async () => {
    try {
      const res = await api.getZones();
      setZones(res.data || []);
    } catch (err) {
      addToast(err?.message || 'Could not load delivery zones', 'error');
    }
  }, [addToast]);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  const draftOf = (c) => ({
    gstRatePercent: c.gstRatePercent ?? '',
    hsnCode: c.hsnCode ?? '',
    commissionPercent: c.commissionPercent ?? '',
    ...(drafts[c.id] || {}),
  });
  const setDraft = (c, field, value) => setDrafts((prev) => ({ ...prev, [c.id]: { ...draftOf(c), [field]: value } }));

  const saveCategory = (c) => {
    const d = draftOf(c);
    if (d.hsnCode && !/^\d{4,8}$/.test(String(d.hsnCode))) return addToast('HSN code must be 4 to 8 digits', 'warning');
    const commission = d.commissionPercent === '' ? '' : Number(d.commissionPercent);
    if (commission !== '' && (commission < 0 || commission > 50)) return addToast('Commission must be between 0 and 50%', 'warning');
    updateCategory(c.id, {
      gstRatePercent: d.gstRatePercent === '' ? '' : Number(d.gstRatePercent),
      hsnCode: String(d.hsnCode || ''),
      commissionPercent: commission,
    });
    setDrafts((prev) => {
      const { [c.id]: _gone, ...rest } = prev;
      return rest;
    });
    addToast(`${c.name}: tax settings saved`, 'success');
  };

  const saveZone = async (e) => {
    e.preventDefault();
    const pincodes = parsePincodes(zoneForm.pincodesText);
    if (!zoneForm.name.trim()) return addToast('Enter a zone name', 'warning');
    if (!pincodes.length || pincodes.some((p) => !/^\d{6}$/.test(p))) return addToast('Enter valid 6 digit pincodes, separated by commas', 'warning');
    const eta = Math.round(Number(zoneForm.etaMinutes));
    if (!(eta >= 15 && eta <= 2880)) return addToast('Delivery time must be between 15 minutes and 48 hours', 'warning');
    try {
      await api.saveZone({
        id: zoneForm.id || `zone_${Date.now()}`,
        name: zoneForm.name.trim(),
        city: zoneForm.city.trim(),
        pincodes,
        etaMinutes: eta,
        active: zoneForm.active,
      });
      addToast('Delivery zone saved', 'success');
      setZoneForm(emptyZone);
      loadZones();
    } catch (err) {
      addToast(err?.message || 'Could not save the zone', 'error');
    }
  };

  const removeZone = async (z) => {
    if (!window.confirm(`Delete zone "${z.name}"? Vendors selected for it will no longer be limited to it.`)) return;
    try {
      await api.deleteZone(z.id);
      loadZones();
    } catch (err) {
      addToast(err?.message || 'Could not delete the zone', 'error');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0 }}>Tax, Commission &amp; Delivery Zones</h1>
      <p style={{ color: '#64748B', margin: '4px 0 1.25rem', fontSize: '0.88rem' }}>
        Admin creates the categories; vendors list products inside them. Set the GST, HSN and commission each category starts with —
        a vendor can override GST/HSN per product — and the zones vendors deliver to.
      </p>

      <div style={card}>
        <h3 style={{ margin: '0 0 0.8rem', display: 'flex', alignItems: 'center', gap: 8 }}><Percent size={18} /> Platform defaults</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.9rem' }}>
          <div>
            <label style={label}>Default GST (when a category / product has none)</label>
            <select style={input} value={siteSettings.gstRatePercent ?? 18} onChange={(e) => updateSiteSettings({ gstRatePercent: Number(e.target.value) })}>
              {GST_SLABS.map((r) => <option key={r} value={r}>{r}%</option>)}
            </select>
          </div>
          <div>
            <label style={label}>Default platform commission (% of taxable value)</label>
            <input
              style={input}
              type="number"
              min="0"
              max="50"
              step="0.5"
              defaultValue={siteSettings.commissionPercent ?? 0}
              onBlur={(e) => {
                const next = Math.min(50, Math.max(0, Number(e.target.value) || 0));
                if (next !== Number(siteSettings.commissionPercent ?? 0)) updateSiteSettings({ commissionPercent: next });
              }}
            />
          </div>
        </div>
        <p style={{ margin: '0.7rem 0 0', fontSize: '0.76rem', color: '#64748B' }}>
          Whether prices include GST is set under Settings. Commission applies to vendor sales only, never to products you list yourself.
        </p>
      </div>

      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <div style={{ padding: '1rem 1.25rem', fontWeight: 800 }}>Category tax rules</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', minWidth: 720 }}>
          <thead>
            <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#64748B', fontSize: '0.72rem', textTransform: 'uppercase' }}>
              <th style={{ padding: '0.65rem 1.25rem' }}>Category</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>GST rate</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>HSN code</th>
              <th style={{ padding: '0.65rem 0.5rem' }}>Commission %</th>
              <th style={{ padding: '0.65rem 1.25rem' }} />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const d = draftOf(c);
              const dirty = Boolean(drafts[c.id]);
              return (
                <tr key={c.id || c.slug} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '0.6rem 1.25rem', fontWeight: 700 }}>{c.name}</td>
                  <td style={{ padding: '0.6rem 0.5rem', width: 150 }}>
                    <select style={input} value={d.gstRatePercent} onChange={(e) => setDraft(c, 'gstRatePercent', e.target.value)}>
                      <option value="">Site default</option>
                      {GST_SLABS.map((r) => <option key={r} value={r}>{r}%</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', width: 150 }}>
                    <input style={input} inputMode="numeric" maxLength={8} value={d.hsnCode} onChange={(e) => setDraft(c, 'hsnCode', e.target.value.replace(/\D/g, ''))} placeholder="e.g. 2523" />
                  </td>
                  <td style={{ padding: '0.6rem 0.5rem', width: 150 }}>
                    <input style={input} type="number" min="0" max="50" step="0.5" value={d.commissionPercent} onChange={(e) => setDraft(c, 'commissionPercent', e.target.value)} placeholder="Platform default" />
                  </td>
                  <td style={{ padding: '0.6rem 1.25rem', textAlign: 'right' }}>
                    <button style={{ ...btn, opacity: dirty ? 1 : 0.4 }} disabled={!dirty} onClick={() => saveCategory(c)}>
                      <Save size={14} /> Save
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 0.3rem', display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Delivery zones</h3>
        <p style={{ margin: '0 0 1rem', fontSize: '0.78rem', color: '#64748B' }}>
          Vendors deliver their own orders. A customer's pincode decides the zone and the delivery promise (default 3 hours = 180 minutes).
          Until at least one zone exists, delivery is not restricted by pincode.
        </p>

        <form onSubmit={saveZone} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.8rem', marginBottom: '1.25rem' }}>
          <div><label style={label}>Zone name *</label><input style={input} value={zoneForm.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="Indore Central" /></div>
          <div><label style={label}>City</label><input style={input} value={zoneForm.city} onChange={(e) => setZoneForm({ ...zoneForm, city: e.target.value })} placeholder="Indore" /></div>
          <div><label style={label}>Delivery time (minutes)</label><input style={input} type="number" min="15" value={zoneForm.etaMinutes} onChange={(e) => setZoneForm({ ...zoneForm, etaMinutes: e.target.value })} /></div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={label}>Pincodes * (comma separated)</label>
            <textarea style={{ ...input, minHeight: 56 }} value={zoneForm.pincodesText} onChange={(e) => setZoneForm({ ...zoneForm, pincodesText: e.target.value })} placeholder="452001, 452002, 452003" />
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: '0.84rem' }}>
            <input type="checkbox" checked={zoneForm.active} onChange={(e) => setZoneForm({ ...zoneForm, active: e.target.checked })} /> Active
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" style={btn}><Plus size={14} /> {zoneForm.id ? 'Update zone' : 'Add zone'}</button>
            {zoneForm.id && <button type="button" style={{ ...btn, background: '#E2E8F0' }} onClick={() => setZoneForm(emptyZone)}>Cancel</button>}
          </div>
        </form>

        {zones.length === 0 ? (
          <div style={{ color: '#94A3B8', fontSize: '0.86rem' }}>No delivery zones yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.8rem' }}>
            {zones.map((z) => (
              <div key={z.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '0.85rem 1rem', opacity: z.active === false ? 0.55 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>{z.name}</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748B' }}>{z.city ? `${z.city} · ` : ''}{z.etaMinutes || 180} min{z.active === false ? ' · inactive' : ''}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#0284C7', fontSize: '0.78rem' }} onClick={() => setZoneForm({ ...z, pincodesText: (z.pincodes || []).join(', ') })}>Edit</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => removeZone(z)} title="Delete"><Trash2 size={15} color="#DC2626" /></button>
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#475569', marginTop: 6, wordBreak: 'break-word' }}>{(z.pincodes || []).join(', ')}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
