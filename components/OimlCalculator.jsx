'use client';

import React, { useState } from 'react';
import { validateTestPoint } from '../lib/oiml-engine';
import { useLanguage } from './LanguageProvider';

export default function OimlCalculator() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    L: '1000',
    I: '1000',
    dL: '0.2',
    e: '1',
    E0: '0',
    instrumentClass: 'III'
  });
  
  const [result, setResult] = useState(null);

  const handleCalculate = (e) => {
    e.preventDefault();
    const res = validateTestPoint(
      parseFloat(formData.L),
      parseFloat(formData.I),
      parseFloat(formData.dL),
      parseFloat(formData.e),
      formData.instrumentClass,
      parseFloat(formData.E0)
    );
    setResult(res);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
      <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0b2545', fontSize: '1.25rem', fontWeight: 700 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#1e40af' }}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
        {t('calcTitle')}
      </h3>
      
      <form onSubmit={handleCalculate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcClass')}</label>
          <select name="instrumentClass" className="input-field" value={formData.instrumentClass} onChange={handleChange}>
            <option value="I">Class I (Special)</option>
            <option value="II">Class II (High)</option>
            <option value="III">Class III (Medium)</option>
            <option value="IIII">Class IIII (Ordinary)</option>
          </select>
        </div>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcE')}</label>
          <input type="number" step="0.001" name="e" className="input-field" value={formData.e} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcE0')}</label>
          <input type="number" step="0.001" name="E0" className="input-field" value={formData.E0} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcL')}</label>
          <input type="number" step="0.001" name="L" className="input-field" value={formData.L} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcI')}</label>
          <input type="number" step="0.001" name="I" className="input-field" value={formData.I} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label" style={{ fontWeight: 600 }}>{t('calcDL')}</label>
          <input type="number" step="0.001" name="dL" className="input-field" value={formData.dL} onChange={handleChange} required />
        </div>
        
        <div style={{ gridColumn: '1 / -1', marginTop: '0.25rem' }}>
          <button type="submit" id="btn-calculate-oiml" onClick={handleCalculate} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700, background: '#1e40af' }}>
            {t('calcButton')}
          </button>
        </div>
      </form>

      {result && (
        <div id="oiml-calc-results" className="animate-fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, color: '#0b2545', fontWeight: 700 }}>{t('calcResultsTitle')}</h4>
            {result.isPass ? (
              <span className="badge badge-pass" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', fontWeight: 700 }}>
                {t('compliant')} ({t('pass')})
              </span>
            ) : (
              <span className="badge badge-fail" style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', fontWeight: 700 }}>
                {t('nonCompliant')} ({t('fail')})
              </span>
            )}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#475569', fontWeight: 600 }}>{t('calcP')}</p>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>P = {result.P}</div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>Formula: I + 0.5e - dL</p>
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#475569', fontWeight: 600 }}>{t('calcEc')}</p>
              <div style={{ fontSize: '1.25rem', fontFamily: 'monospace', fontWeight: 700, color: result.isPass ? '#166534' : '#991b1b' }}>
                Ec = {result.Ec > 0 ? '+' : ''}{result.Ec}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0' }}>Formula: (P - L) - E0</p>
            </div>
            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #e2e8f0', paddingTop: '0.85rem', marginTop: '0.25rem' }}>
              <p style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: '#475569', fontWeight: 600 }}>{t('calcMPE')}</p>
              <div style={{ fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700, color: '#0f172a' }}>±{result.mpeAllowed}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
