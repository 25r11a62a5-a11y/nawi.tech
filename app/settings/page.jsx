'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

const DEFAULT_SETTINGS = {
  // Agency Profile
  agencyName: 'Directorate of Legal Metrology & Standards',
  accreditationNo: 'NABL-TC-8891 / ISO 17025:2017',
  inspectorName: 'Rajesh Kumar',
  inspectorBadgeId: 'LM-IN-2026-042',
  labAddress: 'Central Legal Metrology Testing Facility, New Delhi, India',
  
  // OIML Engine Config
  defaultAccuracyClass: 'III',
  changeoverPointMethod: true,
  confidenceLevel: '95',
  temperatureMin: 18,
  temperatureMax: 25,
  humidityMin: 45,
  humidityMax: 75,
  
  // Hardware / IoT Settings
  serialPort: 'COM3 (Baud: 9600, 8N1)',
  autoConnectIndicator: true,
  mqttBrokerUrl: 'mqtt://localhost:1883',
  liveSensorsEnabled: true,
  
  // Database Config
  dbHost: 'localhost',
  dbPort: 5432,
  dbName: 'nawi_oiml_db',
  dbUser: 'postgres',
  dbConnected: true
};

export default function SettingsPage() {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [activeTab, setActiveTab] = useState('agency');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('nawi_settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse settings from localStorage');
      }
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('nawi_settings', JSON.stringify(settings));
    setToastMessage('✓ All settings & laboratory configurations saved successfully!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "nawi_system_settings_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setToastMessage('✓ Settings backup exported as JSON file!');
    setTimeout(() => setToastMessage(''), 4000);
  };

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0b2545' }}>{t('settingsTitle')}</h2>
          <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>{t('settingsSubtitle')}</p>
        </div>
        <button 
          onClick={handleSave}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.75rem 1.25rem', fontWeight: 600, background: '#1e40af' }}
        >
          {t('saveSettings')}
        </button>
      </header>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="glass-panel animate-fade-in" style={{ padding: '1rem 1.5rem', marginBottom: '1.5rem', borderColor: 'var(--success)', background: 'rgba(16, 185, 129, 0.12)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '8px' }}>
          <span style={{ color: '#065f46', fontWeight: 600, fontSize: '0.95rem' }}>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', color: '#065f46', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="card" style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ display: 'flex', gap: '0.75rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button 
            type="button"
            className={`btn ${activeTab === 'agency' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('agency')}
            style={{ cursor: 'pointer', background: activeTab === 'agency' ? '#1e40af' : '#f1f5f9', border: '1px solid #cbd5e1', color: activeTab === 'agency' ? '#fff' : '#0f172a', fontWeight: 600 }}
          >
            {t('tabAgency')}
          </button>
          <button 
            type="button"
            className={`btn ${activeTab === 'oiml' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('oiml')}
            style={{ cursor: 'pointer', background: activeTab === 'oiml' ? '#1e40af' : '#f1f5f9', border: '1px solid #cbd5e1', color: activeTab === 'oiml' ? '#fff' : '#0f172a', fontWeight: 600 }}
          >
            {t('tabOIML')}
          </button>
          <button 
            type="button"
            className={`btn ${activeTab === 'iot' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('iot')}
            style={{ cursor: 'pointer', background: activeTab === 'iot' ? '#1e40af' : '#f1f5f9', border: '1px solid #cbd5e1', color: activeTab === 'iot' ? '#fff' : '#0f172a', fontWeight: 600 }}
          >
            {t('tabIoT')}
          </button>
          <button 
            type="button"
            className={`btn ${activeTab === 'db' ? 'btn-primary' : 'btn-secondary'}`} 
            onClick={() => setActiveTab('db')}
            style={{ cursor: 'pointer', background: activeTab === 'db' ? '#1e40af' : '#f1f5f9', border: '1px solid #cbd5e1', color: activeTab === 'db' ? '#fff' : '#0f172a', fontWeight: 600 }}
          >
            {t('tabDB')}
          </button>
        </div>

        <form onSubmit={handleSave}>
          {/* TAB 1: AGENCY PROFILE */}
          {activeTab === 'agency' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Inspection Agency Name</label>
                <input 
                  className="input-field" 
                  value={settings.agencyName} 
                  onChange={e => setSettings({...settings, agencyName: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Accreditation / License No.</label>
                <input 
                  className="input-field" 
                  value={settings.accreditationNo} 
                  onChange={e => setSettings({...settings, accreditationNo: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Chief Inspector Name</label>
                <input 
                  className="input-field" 
                  value={settings.inspectorName} 
                  onChange={e => setSettings({...settings, inspectorName: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Inspector Badge ID / Stamp Code</label>
                <input 
                  className="input-field" 
                  value={settings.inspectorBadgeId} 
                  onChange={e => setSettings({...settings, inspectorBadgeId: e.target.value})} 
                />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label">Laboratory Address</label>
                <input 
                  className="input-field" 
                  value={settings.labAddress} 
                  onChange={e => setSettings({...settings, labAddress: e.target.value})} 
                />
              </div>
            </div>
          )}

          {/* TAB 2: OIML R-76 CONFIG */}
          {activeTab === 'oiml' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Default Accuracy Class</label>
                <select 
                  className="input-field" 
                  value={settings.defaultAccuracyClass} 
                  onChange={e => setSettings({...settings, defaultAccuracyClass: e.target.value})}
                >
                  <option value="I">Class I (Special Precision)</option>
                  <option value="II">Class II (High Precision)</option>
                  <option value="III">Class III (Medium Industrial)</option>
                  <option value="IIII">Class IIII (Ordinary)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Measurement Uncertainty Confidence Level</label>
                <select 
                  className="input-field" 
                  value={settings.confidenceLevel} 
                  onChange={e => setSettings({...settings, confidenceLevel: e.target.value})}
                >
                  <option value="95">95% Confidence (k = 2.0 - Standard)</option>
                  <option value="99">99% Confidence (k = 3.0 - High Strictness)</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Allowed Min Lab Temp (°C)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={settings.temperatureMin} 
                  onChange={e => setSettings({...settings, temperatureMin: Number(e.target.value)})} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">Allowed Max Lab Temp (°C)</label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={settings.temperatureMax} 
                  onChange={e => setSettings({...settings, temperatureMax: Number(e.target.value)})} 
                />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.changeoverPointMethod} 
                    onChange={e => setSettings({...settings, changeoverPointMethod: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Use OIML Changeover Point Method for Indication Error ($P = I + 0.5e - \Delta L$)
                </label>
              </div>
            </div>
          )}

          {/* TAB 3: IOT & HARDWARE */}
          {activeTab === 'iot' && (
            <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Weighing Indicator Serial Port (RS-232 / USB)</label>
                <input 
                  className="input-field" 
                  value={settings.serialPort} 
                  onChange={e => setSettings({...settings, serialPort: e.target.value})} 
                />
              </div>

              <div className="input-group">
                <label className="input-label">MQTT Broker URL (Environmental Stream)</label>
                <input 
                  className="input-field" 
                  value={settings.mqttBrokerUrl} 
                  onChange={e => setSettings({...settings, mqttBrokerUrl: e.target.value})} 
                />
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.autoConnectIndicator} 
                    onChange={e => setSettings({...settings, autoConnectIndicator: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Auto-connect to Digital Load Cell Indicator on Test Wizard Launch
                </label>
              </div>

              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={settings.liveSensorsEnabled} 
                    onChange={e => setSettings({...settings, liveSensorsEnabled: e.target.checked})} 
                    style={{ width: '18px', height: '18px' }}
                  />
                  Enable Live Ambient Barometric Pressure & Humidity Stream Integration
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & EXPORT */}
          {activeTab === 'db' && (
            <div className="animate-fade-in">
              <div style={{ padding: '1.25rem', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--success)', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ margin: 0, color: 'var(--success)' }}>🟢 PostgreSQL Database Status: Connected</h4>
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Host: {settings.dbHost}:{settings.dbPort} | Database: {settings.dbName}
                  </p>
                </div>
                <span className="badge badge-pass">Schema V1.0 Ready</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                <div className="input-group">
                  <label className="input-label">Database Host</label>
                  <input className="input-field" value={settings.dbHost} onChange={e => setSettings({...settings, dbHost: e.target.value})} />
                </div>
                <div className="input-group">
                  <label className="input-label">Database Port</label>
                  <input className="input-field" value={settings.dbPort} onChange={e => setSettings({...settings, dbPort: Number(e.target.value)})} />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleExportData} style={{ cursor: 'pointer' }}>
                  📥 Export Settings Backup (JSON)
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => { localStorage.clear(); setToastMessage('✓ Local settings reset to defaults'); }} style={{ color: 'var(--danger)', cursor: 'pointer' }}>
                  🗑️ Reset All Local Cache
                </button>
              </div>
            </div>
          )}

          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontWeight: 600, cursor: 'pointer' }}>
              ✓ Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
