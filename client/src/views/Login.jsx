import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Login({ navigate, setUsername }) {
  const [val, setVal] = useState('');
  const [pass, setPass] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    const savedUser = localStorage.getItem('nordle_user');
    const savedPass = localStorage.getItem('nordle_pass');
    if (savedUser) {
      setVal(savedUser);
      if (savedPass) setPass(savedPass);
    }
  }, []);

  const [loginError, setLoginError] = useState('');

  const handleLogin = async () => {
    if (!val) return;
    try {
      const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      const res = await fetch(`${URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: val, password: pass })
      });
      if (res.ok) {
        localStorage.setItem('nordle_user', val);
        if (pass) localStorage.setItem('nordle_pass', pass);
        
        setUsername(val);
        navigate('home');
      } else {
        const errorData = await res.json().catch(() => null);
        if (errorData && errorData.error === 'Invalid password') {
          setLoginError('Incorrect Password! Please try again.');
          return;
        }
        setLoginError("Server logic issue (" + res.status + "). Let's try to enter Offline Mode.");
        setTimeout(() => {
          setUsername('');
          navigate('home');
        }, 3000);
      }
    } catch (err) {
      setLoginError("No internet connection or server is unreachable. Please verify the server is running!");
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
        style={{ padding: '10px', fontSize: '1.2rem', marginBottom: '10px', borderRadius: '5px', border: '1px solid #555', background: '#333', color: 'white' }}
      />
      <input 
        type="password" 
        value={pass} 
        onChange={e => setPass(e.target.value)} 
        placeholder="Password (Optional)"
        style={{ padding: '10px', fontSize: '1.2rem', marginBottom: '20px', borderRadius: '5px', border: '1px solid #555', background: '#333', color: 'white' }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', maxWidth: '300px' }}>
        <button className="btn-primary" onClick={handleLogin}>{t('login_btn')}</button>
        <button className="btn-secondary" onClick={handleGuest} style={{ backgroundColor: '#444' }}>
          Play Offline (Guest)
        </button>
      </div>

      {loginError && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: '2px solid var(--color-red)' }}>
            <h2 style={{ color: 'var(--color-red)' }}>Login Failed</h2>
            <p style={{ margin: '20px 0', color: '#ccc' }}>{loginError}</p>
            <button className="btn-primary" onClick={() => setLoginError('')}>Acknowledge</button>
          </div>
        </div>
      )}
    </div>
  );
}
