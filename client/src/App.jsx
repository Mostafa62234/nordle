import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Home from './views/Home';
import DifficultySelect from './views/DifficultySelect';
import OfflineGame from './views/OfflineGame';
import Metrics from './views/Metrics';
import Login from './views/Login';
import Matchmaking from './views/Matchmaking';
import OnlineGame from './views/OnlineGame';
import Settings from './views/Settings';
import './index.css';

import { playButtonSound } from './sounds';
import onlineSfxFile from '../sfx/online-sfx.mp3';

function App() {
  const savedUser = localStorage.getItem('nordle_user');
  
  const [currentView, setCurrentView] = useState(savedUser ? 'home' : 'login');
  const [difficulty, setDifficulty] = useState('Normal');
  const [roundsCount, setRoundsCount] = useState(3);
  const [username, setUsername] = useState(savedUser || '');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(URL);
    setSocket(newSocket);
    
    return () => newSocket.close();
  }, []);

  // Identify user on connect
  useEffect(() => {
    if (socket && username) {
      socket.emit('identify', username);
    }
  }, [socket, username]);

  const [inviteData, setInviteData] = useState(null);
  const [inviteDeclinedMessage, setInviteDeclinedMessage] = useState('');

  // Global Invite Listener
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveInvite = ({ from, difficulty, roundsCount }) => {
      // Auto-decline if mid-match or already has an invite shown
      if (currentView === 'offlineGame' || currentView === 'onlineGame' || currentView === 'matchmaking' || inviteData) {
        socket.emit('respondToInvite', { from, accepted: false });
        return;
      }
      
      setInviteData({ from, difficulty, roundsCount });
    };

    const handleInviteDeclined = ({ by }) => {
       setInviteDeclinedMessage(`${by} declined your challenge or is busy.`);
       if (currentView === 'matchmaking') {
          // Additional logic if needed
       }
    };

    const handleMatchFound = () => {
       if (currentView !== 'onlineGame') {
          setCurrentView('onlineGame');
       }
    };

    socket.on('receiveInvite', handleReceiveInvite);
    socket.on('inviteDeclined', handleInviteDeclined);
    socket.on('matchFound', handleMatchFound);
    
    return () => {
      socket.off('receiveInvite', handleReceiveInvite);
      socket.off('inviteDeclined', handleInviteDeclined);
      socket.off('matchFound', handleMatchFound);
    };
  }, [socket, currentView]);

  const respondToInvite = (accepted) => {
    if (!inviteData) return;
    const { from, difficulty, roundsCount } = inviteData;
    setInviteData(null);
    
    if (accepted) {
      setDifficulty(difficulty);
      setRoundsCount(roundsCount);
      setCurrentView('onlineGame');
      setTimeout(() => {
         socket.emit('respondToInvite', { from, accepted: true, difficulty, roundsCount });
      }, 100);
    } else {
      socket.emit('respondToInvite', { from, accepted: false });
    }
  };

  // Global Button click sound effect
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.closest('button')) {
        playButtonSound();
      }
    };
    document.addEventListener('click', handleGlobalClick);
    return () => document.removeEventListener('click', handleGlobalClick);
  }, []);

  // Background music for matches
  useEffect(() => {
    let bgMusic = null;
    if (currentView === 'offlineGame' || currentView === 'onlineGame') {
      bgMusic = new Audio(onlineSfxFile);
      bgMusic.loop = true;
      bgMusic.volume = 0.8;
      bgMusic.play().catch(err => console.log('BG music play failed:', err));
    }
    
    return () => {
      if (bgMusic) {
        bgMusic.pause();
        bgMusic.currentTime = 0;
      }
    };
  }, [currentView]);

  // Handle Capacitor native features (Splash, Keyboard, Back Button)
  useEffect(() => {
    const setupNative = async () => {
      try {
        const { SplashScreen } = await import('@capacitor/splash-screen');
        await SplashScreen.hide();
      } catch (e) {
        console.log('SplashScreen plugin not available', e);
      }
    };
    setupNative();
  }, []);

  useEffect(() => {
    let backButtonListener = null;

    const setupBackButton = async () => {
      try {
        const { App: CapacitorApp } = await import('@capacitor/app');
        
        backButtonListener = await CapacitorApp.addListener('backButton', ({ canGoBack }) => {
          setCurrentView(prevView => {
            switch (prevView) {
              case 'login':
              case 'home':
                CapacitorApp.exitApp();
                return prevView;
              case 'difficultySelect':
              case 'difficultySelectOnline':
              case 'settings':
              case 'metrics':
                return 'home';
              case 'offlineGame':
                return 'difficultySelect';
              case 'matchmaking':
                // Note: user might still be in matchmaking pool on server,
                // but component unmount should fire something if handled, or they just go back.
                return 'difficultySelectOnline';
              case 'onlineGame':
                // Custom event for OnlineGame.jsx to handle quit request
                window.dispatchEvent(new Event('triggerQuitRequest'));
                return prevView; // Don't change view here
              default:
                if (canGoBack) {
                  window.history.back();
                } else {
                  CapacitorApp.exitApp();
                }
                return prevView;
            }
          });
        });
      } catch (err) {
        console.log('App plugin not available', err);
      }
    };
    
    setupBackButton();
    
    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
  };

  return (
    <>
      {currentView === 'login' && <Login navigate={navigate} setUsername={setUsername} />}
      {currentView === 'home' && <Home navigate={navigate} username={username} socket={socket} />}
      {currentView === 'difficultySelect' && <DifficultySelect navigate={navigate} setDifficulty={setDifficulty} mode="offline" />}
      {currentView === 'difficultySelectOnline' && <DifficultySelect navigate={navigate} setDifficulty={setDifficulty} mode="online" setRoundsCount={setRoundsCount} roundsCount={roundsCount} />}
      {currentView === 'offlineGame' && <OfflineGame navigate={navigate} difficulty={difficulty} username={username} />}
      {currentView === 'matchmaking' && <Matchmaking navigate={navigate} socket={socket} username={username} difficulty={difficulty} roundsCount={roundsCount} />}
      {currentView === 'onlineGame' && <OnlineGame navigate={navigate} socket={socket} username={username} difficulty={difficulty} />}
      {currentView === 'settings' && <Settings navigate={navigate} />}
      {currentView === 'metrics' && <Metrics navigate={navigate} username={username} />}

      {inviteData && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: '2px solid var(--color-green)' }}>
            <h2 style={{ color: 'var(--color-green)' }}>Custom Match Request</h2>
            <p style={{ margin: '15px 0' }}><strong>{inviteData.from}</strong> has challenged you!</p>
            <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '20px' }}>
              Mode: {inviteData.difficulty} | Best of {inviteData.roundsCount}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn-primary" style={{ flex: 1 }} onClick={() => respondToInvite(true)}>Accept</button>
              <button className="btn-secondary" style={{ flex: 1 }} onClick={() => respondToInvite(false)}>Decline</button>
            </div>
          </div>
        </div>
      )}

      {inviteDeclinedMessage && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: '2px solid var(--color-yellow)' }}>
            <h2 style={{ color: 'var(--color-yellow)' }}>Match Declined</h2>
            <p style={{ margin: '20px 0' }}>{inviteDeclinedMessage}</p>
            <button className="btn-primary" onClick={() => setInviteDeclinedMessage('')}>Acknowledge</button>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
