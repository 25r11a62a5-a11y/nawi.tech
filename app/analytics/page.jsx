'use client';
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../components/LanguageProvider';

export default function AnalyticsPage() {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(res => { setData(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid #cbd5e1', borderTop: '3px solid #1e40af', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
        <p style={{ color: '#475569', fontWeight: 600 }}>Loading analytics data...</p>
      </div>
    </div>
  );

  if (!data) return <div><p>Failed to load analytics. Make sure API is reachable.</p></div>;

  const { stats, rankings, topPerformer, atRisk, failures, maintenance, trends } = data;

  const TABS = ['overview', 'rankings', 'failures', 'maintenance'];

  return (
    <div className="animate-fade-in">
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, color: '#0b2545' }}>{t('analyticsTitle')}</h2>
        <p style={{ color: '#475569', marginTop: '0.25rem', fontSize: '0.9rem' }}>{t('analyticsSubtitle')}</p>
      </header>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Tests', value: stats.total, color: 'var(--accent)' },
          { label: 'Passed', value: stats.passed, color: 'var(--success)' },
          { label: 'Failed', value: stats.failed, color: 'var(--danger)' },
          { label: 'Pass Rate', value: `${stats.passRate}%`, color: stats.passRate >= 70 ? 'var(--success)' : 'var(--danger)' },
        ].map(card => (
          <div key={card.label} className="glass-panel card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: card.color }}>{card.value}</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tab Nav */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1px' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="btn"
            style={{
              padding: '0.625rem 1.25rem', background: 'none', border: 'none',
              borderBottom: activeTab === tab ? '2px solid var(--accent)' : '2px solid transparent',
              borderRadius: 0, color: activeTab === tab ? 'var(--accent)' : 'var(--text-secondary)',
              fontWeight: activeTab === tab ? 600 : 400, cursor: 'pointer', textTransform: 'capitalize',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {topPerformer && (
            <div className="glass-panel card" style={{ borderColor: 'rgba(16,185,129,0.3)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--success)' }}>🏆 Top Performer</h4>
              <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{topPerformer.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>by {topPerformer.manufacturer}</div>
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{topPerformer.passRate}%</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Pass Rate</div></div>
                <div><div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{topPerformer.score}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div></div>
              </div>
            </div>
          )}
          {atRisk && atRisk.length > 0 && (
            <div className="glass-panel card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--danger)' }}>⚠️ At-Risk Instruments</h4>
              {atRisk.map(inst => (
                <div key={inst.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.875rem' }}>{inst.name}</span>
                  <span className="badge badge-fail">{inst.passRate}% pass</span>
                </div>
              ))}
            </div>
          )}
          <div className="glass-panel card" style={{ gridColumn: '1 / -1' }}>
            <h4 style={{ marginBottom: '1rem' }}>📈 Monthly Compliance Trend</h4>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '120px' }}>
              {trends.monthlyData.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                  <div style={{
                    width: '100%', background: m.passRate >= 70 ? 'var(--success)' : 'var(--danger)',
                    height: `${m.passRate}%`, borderRadius: '4px 4px 0 0',
                    transition: 'height 0.5s ease', minHeight: '4px', opacity: 0.8,
                  }} title={`${m.passRate}%`} />
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{m.month.slice(5)}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
              <span>Trend: <strong style={{ color: trends.overallTrend === 'IMPROVING' ? 'var(--success)' : trends.overallTrend === 'DECLINING' ? 'var(--danger)' : 'var(--warning)' }}>{trends.overallTrend}</strong></span>
              <span>3-Month Projection: <strong>{trends.projectedPassRate}%</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Rankings Tab */}
      {activeTab === 'rankings' && (
        <div className="glass-panel card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Instrument Performance Rankings</h3>
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Instrument</th><th>Manufacturer</th><th>Tests</th><th>Pass Rate</th><th>Trend</th><th>Score</th></tr>
            </thead>
            <tbody>
              {rankings.map((r, i) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: i === 0 ? '#fbbf24' : 'var(--text-secondary)' }}>{i + 1}</td>
                  <td>{r.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{r.manufacturer}</td>
                  <td>{r.totalTests}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--border)', borderRadius: '3px' }}>
                        <div style={{ width: `${r.passRate}%`, height: '100%', borderRadius: '3px', background: r.passRate >= 70 ? 'var(--success)' : 'var(--danger)' }} />
                      </div>
                      <span>{r.passRate}%</span>
                    </div>
                  </td>
                  <td style={{ color: r.trend === 'IMPROVING' ? 'var(--success)' : r.trend === 'DECLINING' ? 'var(--danger)' : 'var(--text-secondary)' }}>
                    {r.trend === 'IMPROVING' ? '↑' : r.trend === 'DECLINING' ? '↓' : '→'} {r.trend}
                  </td>
                  <td><strong>{r.score}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Failures Tab */}
      {activeTab === 'failures' && (
        <div className="animate-fade-in" style={{ display: 'grid', gap: '1.5rem' }}>
          <div className="glass-panel card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Root Cause Analysis</h3>
              <div>
                <span style={{ color: 'var(--danger)', fontWeight: 700, fontSize: '1.5rem' }}>{failures.totalFailures}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}> failures ({failures.failureRate}% rate)</span>
              </div>
            </div>
            {failures.causes.map((c, i) => (
              <div key={i} style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 500 }}>{c.cause}</span>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span className={`badge ${c.priority === 'CRITICAL' ? 'badge-fail' : c.priority === 'HIGH' ? 'badge-fail' : 'badge-pass'}`}>{c.priority}</span>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{c.count} cases ({c.percentage}%)</span>
                  </div>
                </div>
                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', marginBottom: '0.5rem' }}>
                  <div style={{ width: `${c.percentage}%`, height: '100%', background: 'var(--danger)', borderRadius: '3px', opacity: 0.7 }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>→ {c.action}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Tab */}
      {activeTab === 'maintenance' && (
        <div className="glass-panel card animate-fade-in">
          <h3 style={{ marginBottom: '1.5rem' }}>Predictive Maintenance Schedule</h3>
          {maintenance.map((m, i) => (
            <div key={i} style={{
              padding: '1rem', marginBottom: '1rem', borderRadius: '8px',
              background: m.urgency === 'URGENT' ? 'rgba(239,68,68,0.1)' : m.urgency === 'SOON' ? 'rgba(245,158,11,0.1)' : 'rgba(0,0,0,0.2)',
              border: `1px solid ${m.urgency === 'URGENT' ? 'rgba(239,68,68,0.3)' : m.urgency === 'SOON' ? 'rgba(245,158,11,0.3)' : 'var(--border)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600 }}>{m.instrumentName}</span>
                <span className={`badge ${m.urgency === 'URGENT' ? 'badge-fail' : m.urgency === 'SOON' ? '' : 'badge-pass'}`}
                  style={m.urgency === 'SOON' ? { background: 'rgba(245,158,11,0.2)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' } : {}}>
                  {m.urgency}
                </span>
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Uncertainty Trend: <strong style={{ color: m.uncertaintyTrend === 'INCREASING' ? 'var(--danger)' : 'var(--success)' }}>{m.uncertaintyTrend}</strong> |
                Days to Action: <strong>{m.estimatedDaysToMaintenance}</strong>
              </div>
              <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>{m.recommendation}</div>
              {m.estimatedCostSavings && (
                <div style={{ fontSize: '0.8rem', color: 'var(--success)', marginTop: '0.25rem' }}>💰 Potential savings: {m.estimatedCostSavings}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
