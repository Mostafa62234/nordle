import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';

export default function Settings({ navigate }) {
  const { lang, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [showCredits, setShowCredits] = useState(false);

  const activeStyle = {
    backgroundColor: '#1dd05d',
    color: '#121213',
    border: '1px solid #1dd05d',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center'
  };

  const inactiveStyle = {
    backgroundColor: 'var(--color-keyboard-bg)',
    color: 'var(--text-color)',
    border: '1px solid var(--color-border)',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center'
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: 'var(--bg-color)', color: 'var(--text-color)' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px', marginBottom: '40px', marginTop: '20px' }}>
        <button 
          onClick={() => navigate('home')} 
          style={{ 
            backgroundColor: 'var(--color-keyboard-bg)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '8px 12px', 
            color: 'var(--text-color)', cursor: 'pointer', [lang === 'ar' ? 'marginLeft' : 'marginRight']: '16px', display: 'flex'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{t('settings')}</div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'transparent', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)' }}>
        <div style={{ marginBottom: '16px', fontSize: '1.1rem', color: 'var(--text-color)', fontWeight: 'bold' }}>Color Theme</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            style={theme === 'dark' ? activeStyle : inactiveStyle}
            onClick={() => { if (theme !== 'dark') toggleTheme() }}
          >
            Dark Mode
          </button>
          <button 
            style={theme === 'light' ? activeStyle : inactiveStyle}
            onClick={() => { if (theme !== 'light') toggleTheme() }}
          >
            Light Mode
          </button>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'transparent', padding: '24px', borderRadius: '16px', border: '1px solid var(--color-border)', marginTop: '20px' }}>
        <button 
          onClick={() => setShowCredits(!showCredits)}
          style={{ width: '100%', padding: '12px', borderRadius: '8px', backgroundColor: 'var(--color-keyboard-bg)', border: '1px solid var(--color-border)', color: 'var(--color-yellow)', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
        >
          {t('credits_btn')}
        </button>

        {showCredits && (
          <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#facb3d1a', border: '1px solid var(--color-yellow)', borderRadius: '8px', color: 'var(--text-color)', lineHeight: '1.5', textAlign: 'center', animation: 'popIn 0.3s' }}>
            <span style={{ fontSize: '0.95rem' }}>{t('credits_text')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
