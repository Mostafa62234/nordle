import React, { useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

export default function Matchmaking({ navigate, socket, username, difficulty, roundsCount }) {
  const { t } = useLanguage();

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinQueue', { username, difficulty, roundsCount });

    const handleStart = () => {
      navigate('onlineGame');
    };

    const handleBanned = (data) => {
      alert(`You are banned from online play until ${new Date(data.until).toLocaleString()}`);
      navigate('home');
    };

    socket.on('matchFound', handleStart);
    socket.on('banned', handleBanned);

    return () => {
      socket.off('matchFound', handleStart);
      socket.off('banned', handleBanned);
      socket.emit('leaveQueue');
    };
  }, [socket, username, difficulty, navigate]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="app-title" style={{ fontSize: '2.5rem', color: 'var(--color-yellow)' }}>{t('matchmaking')}</h1>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>{t('queuing_for')}{difficulty}{t('mode')}</p>
      <p style={{ marginTop: '10px', color: '#999' }}>{t('waiting_opp')}</p>
      
      <div className="spinner" style={{ margin: '30px auto', width: '50px', height: '50px', border: '5px solid #444', borderTop: '5px solid var(--color-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate('difficultySelectOnline')}>{t('cancel')}</button>
    </div>
  );
}
