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

import buttonSfxFile from '../sfx/button-sfx.wav';
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

  // Global Invite Listener
  useEffect(() => {
    if (!socket) return;
    
    const handleReceiveInvite = ({ from, difficulty, roundsCount }) => {
      // Auto-decline if mid-match
      if (currentView === 'offlineGame' || currentView === 'onlineGame' || currentView === 'matchmaking') {
        socket.emit('respondToInvite', { from, accepted: false });
        return;
      }
      
      const res = window.confirm(`Match Request from ${from} (${difficulty}, ${roundsCount} Rounds). Accept?`);
      if (res) {
        setDifficulty(difficulty);
        setRoundsCount(roundsCount);
        setCurrentView('onlineGame');
        // Let it render slightly before responding so events aren't missed, though requestRoundState handles it
        setTimeout(() => {
           socket.emit('respondToInvite', { from, accepted: true, difficulty, roundsCount });
        }, 100);
      } else {
        socket.emit('respondToInvite', { from, accepted: false });
      }
    };

    const handleInviteDeclined = ({ by }) => {
       alert(`${by} declined your challenge or is busy.`);
       if (currentView === 'matchmaking') {
          // If we added a specific "Waiting for friend" state we might transition back, but simple alert is fine
       }
    };

    socket.on('receiveInvite', handleReceiveInvite);
    socket.on('inviteDeclined', handleInviteDeclined);
    
    return () => {
      socket.off('receiveInvite', handleReceiveInvite);
      socket.off('inviteDeclined', handleInviteDeclined);
    };
  }, [socket, currentView]);

  // Global Button click sound effect
  useEffect(() => {
    const handleGlobalClick = (e) => {
      if (e.target.closest('button')) {
        const audio = new Audio(buttonSfxFile);
        audio.volume = 0.5;
        audio.play().catch(err => console.log('Button audio play failed:', err));
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
    </>
  );
}

export default App;
