'use client';

import React, { useState } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

const SAMPLE_INSTRUMENTS = [
  { id: 'inst-001', manufacturer: 'Mettler Toledo', model: 'ME204', serialNumber: 'SN-001', accuracyClass: 'I', maxCapacity: 220, e: 0.001 },
  { id: 'inst-002', manufacturer: 'Essae Teraoka', model: 'DS-852', serialNumber: 'SN-002', accuracyClass: 'III', maxCapacity: 30000, e: 1 },
  { id: 'inst-003', manufacturer: 'CAS', model: 'CI-2001A', serialNumber: 'SN-003', accuracyClass: 'III', maxCapacity: 150000, e: 20 },
  { id: 'inst-004', manufacturer: 'Avery Berkel', model: 'FX120i', serialNumber: 'SN-004', accuracyClass: 'II', maxCapacity: 120000, e: 10 },
  { id: 'inst-005', manufacturer: 'Sartorius', model: 'Quintix 224-1S', serialNumber: 'SN-005', accuracyClass: 'I', maxCapacity: 220, e: 0.0001 },
];

export default function InstrumentsPage() {
  const { t } = useLanguage();
  const [instruments, setInstruments] = useState(SAMPLE_INSTRUMENTS);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ manufacturer: '', model: '', serialNumber: '', accuracyClass: 'III', maxCapacity: '', minCapacity: '', e: '' });
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInst = { ...form, id: `inst-${Date.now()}` };
    setInstruments(prev => [newInst, ...prev]);
    setShowForm(false);
    setForm({ manufacturer: '', model: '', serialNumber: '', accuracyClass: 'III', maxCapacity: '', minCapacity: '', e: '' });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0b2545' }}>{t('navInstruments')}</h2>
          <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>Manage Non-Automatic Weighing Instruments (NAWI)</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowForm(!showForm)}
          style={{ background: '#1e40af', padding: '0.75rem 1.25rem', fontWeight: 600, cursor: 'pointer' }}
        >
          {showForm ? '✕ ' + t('cancel') : t('registerInstrument')}
        </button>
      </header>

      {saved && (
        <div className="card" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', background: '#ecfdf5', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px' }}>
          <span style={{ color: '#065f46', fontWeight: 700 }}>✓ Instrument registered successfully!</span>
        </div>
      )}

      {showForm && (
        <div className="card animate-fade-in" style={{ marginBottom: '2rem', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <h3 style={{ marginBottom: '1.5rem', color: '#0b2545', fontWeight: 700 }}>{t('registerTitle')}</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('manufacturer')} *</label>
              <input className="input-field" value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} required placeholder="e.g. Mettler Toledo" />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('modelName')} *</label>
              <input className="input-field" value={form.model} onChange={e => setForm({...form, model: e.target.value})} required placeholder="e.g. ME204" />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('serialNumber')} *</label>
              <input className="input-field" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} required placeholder="e.g. SN-2026-001" />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('accuracyClass')} *</label>
              <select className="input-field" value={form.accuracyClass} onChange={e => setForm({...form, accuracyClass: e.target.value})}>
                <option value="I">Class I – Special</option>
                <option value="II">Class II – High</option>
                <option value="III">Class III – Medium</option>
                <option value="IIII">Class IIII – Ordinary</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('maxCapacity')} (g)</label>
              <input type="number" className="input-field" value={form.maxCapacity} onChange={e => setForm({...form, maxCapacity: e.target.value})} placeholder="e.g. 220" />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ fontWeight: 600 }}>{t('scaleInterval')} (g)</label>
              <input type="number" step="0.0001" className="input-field" value={form.e} onChange={e => setForm({...form, e: e.target.value})} placeholder="e.g. 0.001" />
            </div>
            <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" style={{ background: '#1e40af', padding: '0.75rem 1.5rem', fontWeight: 700 }}>
                {t('registerSave')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('serialNumber')}</th>
                <th>{t('manufacturer')}</th>
                <th>{t('modelName')}</th>
                <th>{t('class')}</th>
                <th>{t('maxCapacity')}</th>
                <th>{t('scaleInterval')}</th>
              </tr>
            </thead>
            <tbody>
              {instruments.map(inst => (
                <tr key={inst.id}>
                  <td style={{ fontFamily: 'monospace', color: '#1e40af', fontWeight: 700 }}>{inst.serialNumber}</td>
                  <td style={{ fontWeight: 600 }}>{inst.manufacturer}</td>
                  <td>{inst.model}</td>
                  <td><span className="badge" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>Class {inst.accuracyClass}</span></td>
                  <td>{inst.maxCapacity} g</td>
                  <td style={{ fontFamily: 'monospace' }}>{inst.e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
