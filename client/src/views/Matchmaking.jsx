import React, { useEffect } from 'react';

export default function Matchmaking({ navigate, socket, username, difficulty }) {
  useEffect(() => {
    if (!socket) return;
    socket.emit('joinQueue', { username, difficulty });

    const handleStart = () => {
      navigate('onlineGame');
    };

    socket.on('roundStart', handleStart);

    return () => {
      socket.off('roundStart', handleStart);
      socket.emit('leaveQueue');
    };
  }, [socket, username, difficulty, navigate]);

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 className="app-title" style={{ fontSize: '2.5rem', color: 'var(--color-yellow)' }}>MATCHMAKING</h1>
      <p style={{ marginTop: '20px', fontSize: '1.2rem' }}>Queuing for {difficulty} Mode...</p>
      <p style={{ marginTop: '10px', color: '#999' }}>Waiting for opponent...</p>
      
      <div className="spinner" style={{ margin: '30px auto', width: '50px', height: '50px', border: '5px solid #444', borderTop: '5px solid var(--color-green)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>

      <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={() => navigate('difficultySelectOnline')}>Cancel</button>
    </div>
  );
}
