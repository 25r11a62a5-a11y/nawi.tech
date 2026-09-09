'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from './LanguageProvider';

export default function AppShell({ children }) {
  const pathname = usePathname();
  const isLoginRoute = pathname === '/login';
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { t, lang, setLang, languages } = useLanguage();

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('nawi_user');
    if (!saved) {
      if (!isLoginRoute) {
        window.location.href = '/login';
        return;
      }
      setCheckingAuth(false);
    } else {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        if (isLoginRoute) {
          window.location.href = '/';
          return;
        }
      } catch (e) {
        localStorage.removeItem('nawi_user');
        if (!isLoginRoute) {
          window.location.href = '/login';
          return;
        }
      }
      setCheckingAuth(false);
    }
  }, [isLoginRoute]);

  const handleLogout = () => {
    localStorage.removeItem('nawi_user');
    setUser(null);
    window.location.href = '/login';
  };

  // Authentication barrier: If verifying or unauthenticated on protected routes, block display
  if (!isLoginRoute && (!mounted || checkingAuth)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: '4px solid #cbd5e1', borderTopColor: '#1e40af', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '1rem', color: '#475569', fontWeight: 600, fontSize: '0.9rem' }}>
          Verifying Official Metrological Credentials...
        </p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>

      {/* Official Government Top Bar */}
      <div className="gov-top-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>
            🇮🇳 भारत सरकार | {t('govBar')}
          </span>
          <span style={{ color: '#94a3b8' }}>|</span>
          <span style={{ color: '#cbd5e1' }}>{t('govDept')}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.8rem' }}>
          <label htmlFor="top-lang-select" style={{ color: '#e2e8f0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <span>🌐</span> Language / भाषा:
          </label>
          <select
            id="top-lang-select"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            style={{
              background: '#0b2545',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.45)',
              borderRadius: '4px',
              padding: '3px 8px',
              fontSize: '0.775rem',
              fontWeight: 700,
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            {languages.map((language) => (
              <option key={language.code} value={language.code} style={{ background: '#0b2545', color: '#ffffff' }}>
                {language.nativeLabel} ({language.label})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Official Banner Header */}
      <div className="gov-header-banner">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#0b2545', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #ff9933', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
            <span style={{ fontSize: '1.4rem' }}>🏛️</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontSize: '1.35rem', color: '#0b2545', margin: 0, fontWeight: 800 }}>
                {t('portalName')}
              </h1>
              <span style={{ background: '#1e40af', color: '#fff', fontSize: '0.65rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, textTransform: 'uppercase' }}>
                {t('portalBadge')}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#475569', margin: '2px 0 0 0', fontWeight: 500 }}>
              {t('portalSubtitle')}
            </p>
          </div>
        </div>

        {/* User Session Info */}
        <div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: '#f1f5f9', padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{user.name}</div>
                <div style={{ fontSize: '0.725rem', color: '#475569' }}>{user.title || user.badgeId}</div>
              </div>
              <span className="badge" style={{ fontSize: '0.65rem', padding: '3px 8px', background: user.role === 'MANAGER' ? '#fef3c7' : '#dbeafe', color: user.role === 'MANAGER' ? '#b45309' : '#1e40af', border: user.role === 'MANAGER' ? '1px solid #fde68a' : '1px solid #93c5fd' }}>
                {user.role === 'MANAGER' ? '👔 MANAGER' : '👨‍🔬 INSPECTOR'}
              </span>
              <button type="button" onClick={handleLogout} style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#b91c1c', padding: '4px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>
                {t('signOut')}
              </button>
            </div>
          ) : (
            <a href="/login" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}>
              {t('officialLogin')}
            </a>
          )}
        </div>
      </div>

      {/* Main Grid or Login-Only View */}
      {isLoginRoute ? (
        <main style={{ padding: '2rem 1rem' }}>
          {children}
        </main>
      ) : (
        <div className="grid-dashboard">
          <aside className="sidebar">
            <div style={{ padding: '0 1.25rem', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {t('navMain')}
              </span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0 0.75rem' }}>
              {[
                { href: '/', label: t('navDashboard') },
                { href: '/instruments', label: t('navInstruments') },
                { href: '/tests', label: t('navReports') },
                { href: '/analytics', label: t('navAnalytics') },
                { href: '/settings', label: t('navSettings') },
              ].map(link => (
                <a key={link.href} href={link.href} className="btn btn-secondary"
                  style={{ justifyContent: 'flex-start', border: 'none', background: 'transparent', color: '#0f172a', fontWeight: 600, padding: '0.65rem 1rem' }}>
                  {link.label}
                </a>
              ))}
            </nav>

            {/* OIML Standard Notice */}
            <div style={{ margin: '2rem 0.75rem 0 0.75rem', padding: '1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.75rem', color: '#475569' }}>
              <strong style={{ color: '#0b2545', display: 'block', marginBottom: '0.25rem' }}>{t('oimlStandard')}</strong>
              <p style={{ margin: 0, fontSize: '0.72rem', lineHeight: '1.4' }}>{t('oimlComplies')}</p>
            </div>
          </aside>

          <main className="main-content">
            <div className="container">{children}</div>
          </main>
        </div>
      )}

      {/* Official Government Footer */}
      <footer style={{ background: '#0b2545', color: '#cbd5e1', padding: '1.5rem 2rem', fontSize: '0.8rem', borderTop: '4px solid #ff9933' }}>
        <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <p style={{ color: '#fff', fontWeight: 600, margin: 0 }}>{t('footerManaged')}</p>
            <p style={{ color: '#94a3b8', fontSize: '0.75rem', margin: '4px 0 0 0' }}>{t('footerDeveloped')}</p>
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.75rem' }}>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>{t('footerTerms')}</a>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>{t('footerPrivacy')}</a>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>{t('footerCopyright')}</a>
            <a href="#" style={{ color: '#e2e8f0', textDecoration: 'none' }}>{t('footerAccessibility')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
