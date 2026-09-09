'use client';

import React, { useState } from 'react';
import OimlCalculator from '../components/OimlCalculator';
import { generateOIMLReport } from '../lib/pdf-generator';
import { useLanguage } from '../components/LanguageProvider';

const INITIAL_TESTS = [
  {
    id: 'TR-2026-001',
    instrumentModel: 'Mettler Toledo ME204',
    manufacturer: 'Mettler Toledo',
    accuracyClass: 'I',
    inspectorName: 'Rajesh Kumar',
    date: 'Today, 10:30 AM',
    status: 'PASS',
    maxCapacity: '220 g',
    e: '0.001 g',
    testResults: [
      { L: 50, I: 50, dL: 0.0005, P: 50, E: 0, Ec: 0, mpeAllowed: 0.0005, isPass: true },
      { L: 100, I: 100.0002, dL: 0.0005, P: 100, E: 0, Ec: 0, mpeAllowed: 0.001, isPass: true },
      { L: 200, I: 200.0001, dL: 0.0005, P: 200, E: 0, Ec: 0, mpeAllowed: 0.0015, isPass: true },
    ]
  },
  {
    id: 'TR-2026-002',
    instrumentModel: 'Essae Teraoka DS-852',
    manufacturer: 'Essae Teraoka',
    accuracyClass: 'III',
    inspectorName: 'Priya Sharma',
    date: 'Today, 09:15 AM',
    status: 'FAIL',
    maxCapacity: '30000 g',
    e: '1 g',
    testResults: [
      { L: 5000, I: 5008, dL: 0.2, P: 5008.3, E: 8.3, Ec: 8.3, mpeAllowed: 2.5, isPass: false },
      { L: 15000, I: 15012, dL: 0.2, P: 15012.3, E: 12.3, Ec: 12.3, mpeAllowed: 5.0, isPass: false },
    ]
  },
  {
    id: 'TR-2026-003',
    instrumentModel: 'CAS CI-2001A',
    manufacturer: 'CAS Indicator',
    accuracyClass: 'III',
    inspectorName: 'Amit Patel',
    date: 'Yesterday',
    status: 'PASS',
    maxCapacity: '150000 g',
    e: '20 g',
    testResults: [
      { L: 10000, I: 10000, dL: 5, P: 10005, E: 5, Ec: 5, mpeAllowed: 10, isPass: true },
      { L: 50000, I: 50010, dL: 5, P: 50015, E: 15, Ec: 15, mpeAllowed: 20, isPass: true },
    ]
  }
];

export default function Dashboard() {
  const { t } = useLanguage();
  const [tests, setTests] = useState(INITIAL_TESTS);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  // New Instrument Form State
  const [form, setForm] = useState({
    manufacturer: '',
    model: '',
    serialNumber: '',
    accuracyClass: 'III',
    maxCapacity: '',
    minCapacity: '',
    e: ''
  });

  const handleDownloadPDF = (testRow) => {
    try {
      const instrumentData = {
        manufacturer: testRow.manufacturer || 'Standard Certified Vendor',
        model: testRow.instrumentModel,
        accuracyClass: `Class ${testRow.accuracyClass}`,
        maxCapacity: testRow.maxCapacity || '3000 g',
        e: testRow.e || '1 g',
      };
      
      const testResults = testRow.testResults || [
        { L: 1000, I: 1000, dL: 0.2, P: 1000.3, E: 0.3, Ec: 0.3, mpeAllowed: 1.0, isPass: testRow.status === 'PASS' }
      ];

      generateOIMLReport(instrumentData, testResults);
      
      setToastMessage(`✓ Exported official PDF report for ${testRow.id}`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert('Error generating PDF report: ' + err.message);
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!form.manufacturer || !form.model || !form.serialNumber) {
      alert('Please fill out all required fields.');
      return;
    }

    const newTestEntry = {
      id: `TR-2026-${Math.floor(100 + Math.random() * 900)}`,
      instrumentModel: `${form.manufacturer} ${form.model}`,
      manufacturer: form.manufacturer,
      accuracyClass: form.accuracyClass,
      inspectorName: 'Chief Legal Metrology Inspector',
      date: 'Just Now',
      status: 'PASS',
      maxCapacity: `${form.maxCapacity || '1000'} g`,
      e: `${form.e || '1'} g`,
      testResults: [
        { L: Number(form.maxCapacity || 1000)/2, I: Number(form.maxCapacity || 1000)/2, dL: 0.1, P: Number(form.maxCapacity || 1000)/2, E: 0, Ec: 0, mpeAllowed: Number(form.e || 1), isPass: true }
      ]
    };

    setTests([newTestEntry, ...tests]);
    setShowRegisterModal(false);
    setForm({ manufacturer: '', model: '', serialNumber: '', accuracyClass: 'III', maxCapacity: '', minCapacity: '', e: '' });
    
    setToastMessage(`✓ Instrument "${form.manufacturer} ${form.model}" registered & queued for verification!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0b2545' }}>{t('dashboardTitle')}</h2>
          <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>
            {t('dashboardSubtitle')}
          </p>
        </div>
        <button 
          id="btn-open-register-modal"
          className="btn btn-primary"
          onClick={() => setShowRegisterModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.75rem 1.25rem', fontWeight: 600, background: '#1e40af' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          {t('registerInstrument')}
        </button>
      </header>

      {/* Success Notification Banner */}
      {toastMessage && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px' }}>
          <span style={{ color: '#065f46', fontWeight: 600, fontSize: '0.95rem' }}>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>
      )}

      {/* KPI Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <h4 style={{ color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>{t('totalTests')}</h4>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#0b2545' }}>{1248 + tests.length - 3}</div>
          <div style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>↑ 12% compliant tests this month</div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <h4 style={{ color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>{t('complianceRate')}</h4>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#16a34a' }}>94.2%</div>
          <div style={{ color: '#16a34a', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Class I & Class III Instruments</div>
        </div>
        <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <h4 style={{ color: '#475569', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>{t('pendingInspections')}</h4>
          <div style={{ fontSize: '2.25rem', fontWeight: 'bold', letterSpacing: '-0.02em', color: '#d97706' }}>24</div>
          <div style={{ color: '#d97706', fontSize: '0.85rem', marginTop: '0.5rem', fontWeight: 600 }}>Scheduled for re-verification</div>
        </div>
      </div>

      {/* Main Interactive Engine */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <OimlCalculator />
        
        {/* Recent Test Sessions Table */}
        <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#0b2545', fontWeight: 700 }}>{t('recentSessions')}</h3>
            <a href="/tests" style={{ color: '#1e40af', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600 }}>{t('viewAllReports')}</a>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('reportId')}</th>
                  <th>{t('instrument')}</th>
                  <th>{t('class')}</th>
                  <th>{t('inspector')}</th>
                  <th>{t('date')}</th>
                  <th>{t('status')}</th>
                  <th>ISO 17025 PDF</th>
                </tr>
              </thead>
              <tbody>
                {tests.map(test => (
                  <tr key={test.id}>
                    <td style={{ fontFamily: 'monospace', color: '#1e40af', fontWeight: 700 }}>{test.id}</td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{test.instrumentModel}</td>
                    <td><span className="badge" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>Class {test.accuracyClass}</span></td>
                    <td>{test.inspectorName}</td>
                    <td>{test.date}</td>
                    <td>
                      <span className="badge" style={{
                        background: test.status === 'PASS' ? '#dcfce7' : '#fee2e2',
                        color: test.status === 'PASS' ? '#166534' : '#991b1b',
                        border: test.status === 'PASS' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                        fontWeight: 700
                      }}>
                        {test.status === 'PASS' ? t('pass') : t('fail')}
                      </span>
                    </td>
                    <td>
                      <button 
                        onClick={() => handleDownloadPDF(test)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', background: '#f1f5f9', border: '1px solid #cbd5e1' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        {t('downloadPDF')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal: Register New Instrument */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ maxWidth: '650px', width: '100%', background: '#fff', border: '1px solid #cbd5e1', boxShadow: '0 20px 50px rgba(0,0,0,0.25)', borderRadius: '8px', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0b2545', fontSize: '1.25rem' }}>
                {t('registerTitle')}
              </h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}>✕</button>
            </div>

            <form id="register-modal-form" onSubmit={handleRegisterSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('manufacturer')} *</label>
                <input 
                  name="manufacturer"
                  className="input-field" 
                  value={form.manufacturer} 
                  onChange={e => setForm({...form, manufacturer: e.target.value})} 
                  placeholder="e.g. Mettler Toledo" 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('modelName')} *</label>
                <input 
                  name="model"
                  className="input-field" 
                  value={form.model} 
                  onChange={e => setForm({...form, model: e.target.value})} 
                  placeholder="e.g. ME204 / DS-852" 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('serialNumber')} *</label>
                <input 
                  name="serialNumber"
                  className="input-field" 
                  value={form.serialNumber} 
                  onChange={e => setForm({...form, serialNumber: e.target.value})} 
                  placeholder="e.g. SN-2026-9901" 
                  required 
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('accuracyClass')}</label>
                <select 
                  name="accuracyClass"
                  className="input-field" 
                  value={form.accuracyClass} 
                  onChange={e => setForm({...form, accuracyClass: e.target.value})}
                >
                  <option value="I">Class I – Special (High Precision)</option>
                  <option value="II">Class II – High</option>
                  <option value="III">Class III – Medium (Industrial/Commercial)</option>
                  <option value="IIII">Class IIII – Ordinary</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('maxCapacity')} (g)</label>
                <input 
                  name="maxCapacity"
                  type="number" 
                  className="input-field" 
                  value={form.maxCapacity} 
                  onChange={e => setForm({...form, maxCapacity: e.target.value})} 
                  placeholder="e.g. 30000" 
                />
              </div>

              <div className="input-group">
                <label className="input-label" style={{ fontWeight: 600 }}>{t('scaleInterval')} (g)</label>
                <input 
                  name="e"
                  type="number" 
                  step="0.0001" 
                  className="input-field" 
                  value={form.e} 
                  onChange={e => setForm({...form, e: e.target.value})} 
                  placeholder="e.g. 1" 
                />
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRegisterModal(false)} style={{ flex: 1 }}>
                  {t('cancel')}
                </button>
                <button id="btn-submit-register" type="submit" className="btn btn-primary" style={{ flex: 2, background: '#1e40af' }}>
                  {t('registerSave')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
