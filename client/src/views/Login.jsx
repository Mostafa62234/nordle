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
      }
    } catch (err) {
      alert("Error logging in: " + err.message);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="app-title" style={{ fontSize: '3rem', color: 'var(--color-green)' }}>{t('login_title')}</h1>
      <p style={{marginBottom: 20}}>{t('login_subtitle')}</p>
      <input 
        type="text" 
        value={val} 
        onChange={e => setVal(e.target.value)} 
        placeholder={t('username_placeholder')}
        style={{ padding: '10px', fontSize: '1.2rem', marginBottom: '20px', borderRadius: '5px', border: '1px solid #555', background: '#333', color: 'white' }}
      />
      <button className="btn-primary" onClick={handleLogin}>{t('login_btn')}</button>
    </div>
  );
}
