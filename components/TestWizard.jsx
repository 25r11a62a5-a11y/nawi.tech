'use client';
import React, { useState } from 'react';
import { validateCompliance } from '../lib/oiml-engine';
import { predictComplianceStatus, detectAnomalies, getAnomalySummary } from '../lib/anomaly-detector';

const STEPS = ['Instrument Info', 'Lab Conditions', 'Measurements', 'Results'];

export default function TestWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(0);
  const [instrumentData, setInstrumentData] = useState({
    manufacturer: '', model: '', serialNumber: '', accuracyClass: 'III', maxCapacity: '', e: '1',
  });
  const [labConditions, setLabConditions] = useState({
    inspectorName: '', temperature: '22', humidity: '50', pressure: '1013',
  });
  const [measurements, setMeasurements] = useState([
    { nominalLoad: '0', readings: ['0', '0', '0'] },
    { nominalLoad: '500', readings: ['500', '500.1', '499.9'] },
    { nominalLoad: '1000', readings: ['1000', '1000.2', '999.8'] },
  ]);
  const [validationResult, setValidationResult] = useState(null);
  const [anomalyResult, setAnomalyResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  const updateMeasurement = (idx, field, value) => {
    setMeasurements(prev => {
      const updated = [...prev];
      if (field === 'nominalLoad') {
        updated[idx] = { ...updated[idx], nominalLoad: value };
      } else {
        const readings = [...updated[idx].readings];
        readings[field] = value;
        updated[idx] = { ...updated[idx], readings };
      }
      return updated;
    });
  };

  const addMeasurementRow = () => {
    setMeasurements(prev => [...prev, { nominalLoad: '', readings: ['', '', ''] }]);
  };

  const runValidation = () => {
    setCalculating(true);
    try {
      const parsedMeasurements = measurements.map(m => ({
        nominalLoad: parseFloat(m.nominalLoad) || 0,
        e: parseFloat(instrumentData.e) || 1,
        readings: m.readings.map(r => parseFloat(r) || 0),
      }));
      const compliance = validateCompliance(parsedMeasurements, instrumentData.accuracyClass);
      const anomalyDet = detectAnomalies(parsedMeasurements);
      const summary = getAnomalySummary(anomalyDet);
      const prediction = predictComplianceStatus(parsedMeasurements, instrumentData.accuracyClass);
      setValidationResult(compliance);
      setAnomalyResult({ ...anomalyDet, summary, prediction });
      setStep(3);
    } catch (err) {
      alert('Calculation error: ' + err.message);
    } finally {
      setCalculating(false);
    }
  };

  const handleFinish = () => {
    if (onComplete && validationResult) {
      onComplete({
        id: `TR-${Date.now()}`,
        instrumentModel: `${instrumentData.manufacturer} ${instrumentData.model}`,
        accuracyClass: instrumentData.accuracyClass,
        inspectorName: labConditions.inspectorName,
        date: new Date().toISOString(),
        status: validationResult.overall_status,
        complianceScore: validationResult.complianceScore,
      });
    }
  };

  const progressWidth = `${((step + 1) / STEPS.length) * 100}%`;

  return (
    <div className="glass-panel card">
      {/* Stepper */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: i <= step ? 'var(--accent)' : 'var(--surface-hover)', fontWeight: 600, fontSize: '0.875rem',
                transition: 'var(--transition)',
              }}>{i + 1}</div>
              <span style={{ fontSize: '0.75rem', color: i === step ? 'var(--text-primary)' : 'var(--text-secondary)', marginTop: '0.25rem' }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ height: '4px', background: 'var(--border)', borderRadius: '2px' }}>
          <div style={{ width: progressWidth, height: '100%', background: 'var(--accent)', borderRadius: '2px', transition: 'width 0.4s ease' }} />
        </div>
      </div>

      {/* Step 0: Instrument Info */}
      {step === 0 && (
        <div className="animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Step 1: Instrument Information</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Manufacturer *</label>
              <input className="input-field" value={instrumentData.manufacturer} onChange={e => setInstrumentData({ ...instrumentData, manufacturer: e.target.value })} placeholder="e.g. Mettler Toledo" required />
            </div>
            <div className="input-group">
              <label className="input-label">Model *</label>
              <input className="input-field" value={instrumentData.model} onChange={e => setInstrumentData({ ...instrumentData, model: e.target.value })} placeholder="e.g. ME204" required />
            </div>
            <div className="input-group">
              <label className="input-label">Serial Number *</label>
              <input className="input-field" value={instrumentData.serialNumber} onChange={e => setInstrumentData({ ...instrumentData, serialNumber: e.target.value })} placeholder="e.g. SN-2026-001" required />
            </div>
            <div className="input-group">
              <label className="input-label">Accuracy Class *</label>
              <select className="input-field" value={instrumentData.accuracyClass} onChange={e => setInstrumentData({ ...instrumentData, accuracyClass: e.target.value })}>
                <option value="I">Class I – Special (Analytical balances)</option>
                <option value="II">Class II – High (Precision scales)</option>
                <option value="III">Class III – Medium (Commercial scales)</option>
                <option value="IIII">Class IIII – Ordinary (Rough scales)</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Max Capacity (g)</label>
              <input type="number" className="input-field" value={instrumentData.maxCapacity} onChange={e => setInstrumentData({ ...instrumentData, maxCapacity: e.target.value })} placeholder="e.g. 5000" />
            </div>
            <div className="input-group">
              <label className="input-label">Scale Interval e (g)</label>
              <input type="number" step="0.0001" className="input-field" value={instrumentData.e} onChange={e => setInstrumentData({ ...instrumentData, e: e.target.value })} placeholder="e.g. 1" />
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Lab Conditions */}
      {step === 1 && (
        <div className="animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Step 2: Environmental Conditions</h3>
          <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>Record ambient conditions as required by OIML R-76 Section 4.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Inspector Name *</label>
              <input className="input-field" value={labConditions.inspectorName} onChange={e => setLabConditions({ ...labConditions, inspectorName: e.target.value })} placeholder="e.g. Rajesh Kumar" required />
            </div>
            <div className="input-group">
              <label className="input-label">Temperature (°C)</label>
              <input type="number" className="input-field" value={labConditions.temperature} onChange={e => setLabConditions({ ...labConditions, temperature: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Relative Humidity (%)</label>
              <input type="number" className="input-field" value={labConditions.humidity} onChange={e => setLabConditions({ ...labConditions, humidity: e.target.value })} />
            </div>
            <div className="input-group">
              <label className="input-label">Barometric Pressure (hPa)</label>
              <input type="number" className="input-field" value={labConditions.pressure} onChange={e => setLabConditions({ ...labConditions, pressure: e.target.value })} />
            </div>
          </div>
          <div style={{ padding: '1rem', background: 'rgba(59,130,246,0.1)', borderRadius: '8px', border: '1px solid rgba(59,130,246,0.2)', marginTop: '1rem' }}>
            <p style={{ color: 'var(--accent)', fontWeight: 500, marginBottom: '0.5rem', fontSize: '0.875rem' }}>ℹ️ OIML R-76 Requirements</p>
            <p style={{ fontSize: '0.875rem' }}>Standard lab conditions: Temperature 18–22°C, Humidity 40–70%, Stable atmospheric pressure.</p>
          </div>
        </div>
      )}

      {/* Step 2: Measurements */}
      {step === 2 && (
        <div className="animate-fade-in">
          <h3 style={{ marginBottom: '0.5rem' }}>Step 3: Enter Test Measurements</h3>
          <p style={{ fontSize: '0.875rem', marginBottom: '1.5rem' }}>Enter 3 readings per load point (changeover point method, OIML R-76 §4.5).</p>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nominal Load (L)</th>
                  <th>Reading 1</th>
                  <th>Reading 2</th>
                  <th>Reading 3</th>
                </tr>
              </thead>
              <tbody>
                {measurements.map((m, idx) => (
                  <tr key={idx}>
                    <td><input type="number" step="0.001" className="input-field" style={{ marginBottom: 0 }} value={m.nominalLoad} onChange={e => updateMeasurement(idx, 'nominalLoad', e.target.value)} /></td>
                    {m.readings.map((r, rIdx) => (
                      <td key={rIdx}><input type="number" step="0.001" className="input-field" style={{ marginBottom: 0 }} value={r} onChange={e => updateMeasurement(idx, rIdx, e.target.value)} /></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button className="btn btn-secondary" style={{ marginTop: '1rem' }} onClick={addMeasurementRow}>+ Add Load Point</button>
        </div>
      )}

      {/* Step 3: Results */}
      {step === 3 && validationResult && (
        <div className="animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Step 4: Compliance Results</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overall Status</div>
              <span className={`badge badge-${validationResult.overall_status === 'PASS' ? 'pass' : 'fail'}`} style={{ fontSize: '1.5rem', padding: '0.75rem 2rem' }}>
                {validationResult.overall_status}
              </span>
            </div>
            <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Compliance Score</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, color: validationResult.complianceScore >= 70 ? 'var(--success)' : 'var(--danger)' }}>
                {validationResult.complianceScore}%
              </div>
            </div>
          </div>

          {anomalyResult && anomalyResult.summary.totalAnomalies > 0 && (
            <div style={{ padding: '1rem', background: 'rgba(245,158,11,0.1)', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '1.5rem' }}>
              <p style={{ color: 'var(--warning)', fontWeight: 600, marginBottom: '0.5rem' }}>⚠️ Anomaly Detection: {anomalyResult.summary.summary}</p>
              {anomalyResult.anomalies.slice(0, 3).map((a, i) => (
                <p key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {a.detail}</p>
              ))}
            </div>
          )}

          <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Test Point Results</h4>
            <table className="data-table">
              <thead>
                <tr><th>Load (L)</th><th>Mean Reading</th><th>Error</th><th>Repeatability</th><th>MPE ±</th><th>Result</th></tr>
              </thead>
              <tbody>
                {validationResult.testPoints.map((tp, i) => (
                  <tr key={i}>
                    <td>{tp.nominalLoad}</td>
                    <td style={{ fontFamily: 'monospace' }}>{tp.meanReading}</td>
                    <td style={{ fontFamily: 'monospace', color: Math.abs(tp.error) > tp.mpeAllowed ? 'var(--danger)' : 'var(--success)' }}>
                      {tp.error > 0 ? '+' : ''}{tp.error}
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{tp.repeatability}</td>
                    <td style={{ fontFamily: 'monospace' }}>±{tp.mpeAllowed}</td>
                    <td><span className={`badge badge-${tp.pass ? 'pass' : 'fail'}`}>{tp.pass ? 'PASS' : 'FAIL'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {validationResult.recommendations.length > 0 && (
            <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.1)', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>
              <p style={{ fontWeight: 600, marginBottom: '0.5rem', color: 'var(--danger)' }}>Recommendations:</p>
              {validationResult.recommendations.map((r, i) => <p key={i} style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}>• {r}</p>)}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {step > 0 && step < 3 && (
            <button className="btn btn-secondary" onClick={() => setStep(s => s - 1)}>← Back</button>
          )}
          <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
        <div>
          {step < 2 && (
            <button className="btn btn-primary" onClick={() => setStep(s => s + 1)}>Next →</button>
          )}
          {step === 2 && (
            <button className="btn btn-primary" onClick={runValidation} disabled={calculating}>
              {calculating ? 'Calculating...' : '⚡ Run OIML Validation'}
            </button>
          )}
          {step === 3 && (
            <button className="btn btn-success" onClick={handleFinish}>✓ Save & Finish</button>
          )}
        </div>
      </div>
    </div>
  );
}
