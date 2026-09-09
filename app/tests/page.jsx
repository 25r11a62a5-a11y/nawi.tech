'use client';

import React, { useState } from 'react';
import TestWizard from '../../components/TestWizard';
import { generateOIMLReport } from '../../lib/pdf-generator';
import { useLanguage } from '../../components/LanguageProvider';

const SAMPLE_TESTS = [
  { 
    id: 'TR-2026-001', 
    instrumentModel: 'Mettler Toledo ME204', 
    manufacturer: 'Mettler Toledo',
    accuracyClass: 'I', 
    inspectorName: 'Rajesh Kumar', 
    date: '2026-09-07T10:30:00Z', 
    status: 'PASS', 
    complianceScore: 94,
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
    instrumentModel: 'Essae DS-852', 
    manufacturer: 'Essae Teraoka',
    accuracyClass: 'III', 
    inspectorName: 'Priya Sharma', 
    date: '2026-09-07T09:15:00Z', 
    status: 'FAIL', 
    complianceScore: 42,
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
    date: '2026-09-06T14:00:00Z', 
    status: 'PASS', 
    complianceScore: 89,
    maxCapacity: '150000 g',
    e: '20 g',
    testResults: [
      { L: 10000, I: 10000, dL: 5, P: 10005, E: 5, Ec: 5, mpeAllowed: 10, isPass: true },
      { L: 50000, I: 50010, dL: 5, P: 50015, E: 15, Ec: 15, mpeAllowed: 20, isPass: true },
    ]
  },
  { 
    id: 'TR-2026-004', 
    instrumentModel: 'Avery Berkel FX120i', 
    manufacturer: 'Avery Berkel',
    accuracyClass: 'II', 
    inspectorName: 'Sanjay Gupta', 
    date: '2026-09-05T11:00:00Z', 
    status: 'FAIL', 
    complianceScore: 55,
    maxCapacity: '120000 g',
    e: '10 g',
    testResults: [
      { L: 20000, I: 20025, dL: 2, P: 20028, E: 28, Ec: 28, mpeAllowed: 15, isPass: false }
    ]
  },
  { 
    id: 'TR-2026-005', 
    instrumentModel: 'Sartorius Quintix 224-1S', 
    manufacturer: 'Sartorius',
    accuracyClass: 'I', 
    inspectorName: 'Neha Joshi', 
    date: '2026-09-04T08:45:00Z', 
    status: 'PASS', 
    complianceScore: 97,
    maxCapacity: '220 g',
    e: '0.0001 g',
    testResults: [
      { L: 100, I: 100.0000, dL: 0.00005, P: 100, E: 0, Ec: 0, mpeAllowed: 0.0005, isPass: true }
    ]
  },
];

export default function TestsPage() {
  const { t } = useLanguage();
  const [tests, setTests] = useState(SAMPLE_TESTS);
  const [showWizard, setShowWizard] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const filtered = filter === 'ALL' ? tests : tests.filter(t => t.status === filter);

  const handleTestComplete = (newTest) => {
    setTests(prev => [newTest, ...prev]);
    setShowWizard(false);
    setToastMessage(`✓ New test session ${newTest.id || 'created'} saved successfully!`);
    setTimeout(() => setToastMessage(''), 5000);
  };

  const handleDownloadPDF = (test) => {
    try {
      const instrumentData = {
        manufacturer: test.manufacturer || 'Certified Vendor',
        model: test.instrumentModel,
        accuracyClass: `Class ${test.accuracyClass}`,
        maxCapacity: test.maxCapacity || '3000 g',
        e: test.e || '1 g',
      };
      
      const testResults = test.testResults || [
        { L: 1000, I: 1000, dL: 0.2, P: 1000.3, E: 0.3, Ec: 0.3, mpeAllowed: 1.0, isPass: test.status === 'PASS' }
      ];

      generateOIMLReport(instrumentData, testResults);

      setToastMessage(`✓ PDF Test Report downloaded for ${test.id}`);
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err) {
      alert('Error generating PDF report: ' + err.message);
    }
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0b2545' }}>{t('reportsTitle')}</h2>
          <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>{t('reportsSubtitle')}</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => setShowWizard(!showWizard)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.75rem 1.25rem', fontWeight: 600, background: '#1e40af' }}
        >
          {showWizard ? '✕ ' + t('cancel') : t('newTestSession')}
        </button>
      </header>

      {/* Banner */}
      {toastMessage && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px' }}>
          <span style={{ color: '#065f46', fontWeight: 600, fontSize: '0.95rem' }}>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>
      )}

      {showWizard && (
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <TestWizard onComplete={handleTestComplete} onCancel={() => setShowWizard(false)} />
        </div>
      )}

      <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { key: 'ALL', label: t('filterAll') },
            { key: 'PASS', label: t('filterPass') },
            { key: 'FAIL', label: t('filterFail') },
          ].map(({ key, label }) => (
            <button key={key} className={`btn ${filter === key ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.5rem 1.25rem', cursor: 'pointer', background: filter === key ? '#1e40af' : '#f1f5f9', border: '1px solid #cbd5e1', color: filter === key ? '#fff' : '#0f172a', fontWeight: 600 }}
              onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', color: '#64748b', fontSize: '0.875rem' }}>
            {t('showing')} {filtered.length} {t('of')} {tests.length} {t('records')}
          </span>
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
                <th>{t('compliance')}</th>
                <th>{t('status')}</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(test => (
                <tr key={test.id}>
                  <td style={{ fontFamily: 'monospace', color: '#1e40af', fontWeight: 700 }}>{test.id}</td>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>{test.instrumentModel}</td>
                  <td><span className="badge" style={{ background: '#eff6ff', color: '#1e40af', border: '1px solid #bfdbfe' }}>Class {test.accuracyClass}</span></td>
                  <td>{test.inspectorName}</td>
                  <td>{new Date(test.date).toLocaleDateString('en-IN')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                        <div style={{ width: `${test.complianceScore}%`, height: '100%', borderRadius: '3px', background: test.complianceScore >= 70 ? '#16a34a' : '#dc2626' }} />
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{test.complianceScore}%</span>
                    </div>
                  </td>
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
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        onClick={() => setSelectedDetail(test)}
                        className="btn btn-secondary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', cursor: 'pointer', background: '#f8fafc', border: '1px solid #cbd5e1' }}
                      >
                        {t('viewDetails')}
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(test)}
                        className="btn btn-primary" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', background: '#1e40af' }}
                      >
                        {t('downloadPDF')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDetail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="card animate-fade-in" style={{ maxWidth: '700px', width: '100%', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '2rem', boxShadow: '0 20px 50px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0b2545', fontSize: '1.25rem', fontWeight: 700 }}>{t('reportDetails')} {selectedDetail.id}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>{selectedDetail.instrumentModel} (Class {selectedDetail.accuracyClass})</p>
              </div>
              <button onClick={() => setSelectedDetail(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1.25rem', fontWeight: 'bold' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div><strong>{t('inspector')}:</strong> {selectedDetail.inspectorName}</div>
              <div><strong>{t('date')}:</strong> {new Date(selectedDetail.date).toLocaleString()}</div>
              <div><strong>{t('maxCap')}</strong> {selectedDetail.maxCapacity || 'N/A'}</div>
              <div><strong>{t('scaleIntervalLabel')}</strong> {selectedDetail.e || 'N/A'}</div>
              <div>
                <strong>{t('overallStatus')}</strong>{' '}
                <span className="badge" style={{
                  background: selectedDetail.status === 'PASS' ? '#dcfce7' : '#fee2e2',
                  color: selectedDetail.status === 'PASS' ? '#166534' : '#991b1b',
                  border: selectedDetail.status === 'PASS' ? '1px solid #bbf7d0' : '1px solid #fecaca',
                  fontWeight: 700
                }}>
                  {selectedDetail.status === 'PASS' ? t('pass') : t('fail')}
                </span>
              </div>
              <div><strong>{t('complianceScore')}</strong> {selectedDetail.complianceScore}%</div>
            </div>

            <h4 style={{ marginBottom: '0.75rem', color: '#0b2545', fontWeight: 700 }}>{t('loadPoints')}</h4>
            <div style={{ overflowX: 'auto', marginBottom: '1.5rem' }}>
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr><th>Load (L)</th><th>Ind. (I)</th><th>dL</th><th>Ind. bf round (P)</th><th>Error (Ec)</th><th>MPE</th><th>Result</th></tr>
                </thead>
                <tbody>
                  {(selectedDetail.testResults || []).map((pt, i) => (
                    <tr key={i}>
                      <td>{pt.L}</td>
                      <td>{pt.I}</td>
                      <td>{pt.dL}</td>
                      <td>{pt.P}</td>
                      <td style={{ color: pt.isPass ? '#16a34a' : '#dc2626', fontWeight: 700 }}>{pt.Ec}</td>
                      <td>±{pt.mpeAllowed}</td>
                      <td>
                        <span className="badge" style={{
                          background: pt.isPass ? '#dcfce7' : '#fee2e2',
                          color: pt.isPass ? '#166534' : '#991b1b',
                          border: pt.isPass ? '1px solid #bbf7d0' : '1px solid #fecaca',
                          fontWeight: 700
                        }}>
                          {pt.isPass ? t('pass') : t('fail')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setSelectedDetail(null)} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1' }}>{t('close')}</button>
              <button className="btn btn-primary" onClick={() => { handleDownloadPDF(selectedDetail); setSelectedDetail(null); }} style={{ background: '#1e40af' }}>
                {t('downloadISO')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
