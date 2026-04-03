import React from 'react';
import { useLanguage } from '../LanguageContext';

export default function Settings({ navigate }) {
  const { lang, setLang, t } = useLanguage();

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
    backgroundColor: '#1f1f1f',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 24px',
    fontWeight: 'bold',
    cursor: 'pointer',
    flex: 1,
    textAlign: 'center'
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#121213' }}>
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px', marginBottom: '40px', marginTop: '20px' }}>
        <button 
          onClick={() => navigate('home')} 
          style={{ 
            backgroundColor: '#1f1f1f', border: '1px solid #333', borderRadius: '8px', padding: '8px 12px', 
            color: '#fff', cursor: 'pointer', [lang === 'ar' ? 'marginLeft' : 'marginRight']: '16px', display: 'flex'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{t('settings_title')}</div>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#181818', padding: '24px', borderRadius: '16px', border: '1px solid #333' }}>
        <div style={{ marginBottom: '16px', fontSize: '1.1rem', color: '#ccc', fontWeight: 'bold' }}>{t('select_lang')}</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button 
            style={lang === 'en' ? activeStyle : inactiveStyle}
            onClick={() => setLang('en')}
          >
            English
          </button>
          <button 
            style={lang === 'ar' ? activeStyle : inactiveStyle}
            onClick={() => setLang('ar')}
          >
            العربية
          </button>
        </div>
      </div>
    </div>
  );
}
