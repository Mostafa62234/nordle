import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Login({ navigate, setUsername }) {
  const [val, setVal] = useState('');
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!val) return;
    try {
      const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      const res = await fetch(`${URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: val })
      });
      if (res.ok) {
        setUsername(val);
        navigate('home');
      } else {
        alert("Server issue (" + res.status + "). Entering Offline Mode as Guest.");
        setUsername('');
        navigate('home');
      }
    } catch (err) {
      alert("No internet connection or server is unreachable.");
    }
  };

  const handleGuest = () => {
    setUsername('');
    navigate('home');
  };

  return (
    <div className="fade-slide-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <h1 className="app-title" style={{ fontSize: '3rem', color: 'var(--color-green)' }}>{t('login_title')}</h1>
      <p style={{marginBottom: 20}}>{t('login_subtitle')}</p>
      <input 
        type="text" 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        placeholder={t('username_placeholder')}
        style={{ padding: '10px', fontSize: '1.2rem', marginBottom: '20px', borderRadius: '5px', border: '1px solid #555', background: '#333', color: 'white' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
        <button className="btn-primary" onClick={handleLogin}>{t('login_btn')}</button>
        <button className="btn-secondary" onClick={handleGuest} style={{ backgroundColor: '#444' }}>
          Play Offline (Guest)
        </button>
      </div>
    </div>
  );
}
