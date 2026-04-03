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

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [difficulty, setDifficulty] = useState('Normal');
  const [username, setUsername] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    const newSocket = io(URL);
    setSocket(newSocket);
    return () => newSocket.close();
  }, []);

  const navigate = (view) => {
    setCurrentView(view);
  };

  return (
    <>
      {currentView === 'login' && <Login navigate={navigate} setUsername={setUsername} />}
      {currentView === 'home' && <Home navigate={navigate} username={username} />}
      {currentView === 'difficultySelect' && <DifficultySelect navigate={navigate} setDifficulty={setDifficulty} mode="offline" />}
      {currentView === 'difficultySelectOnline' && <DifficultySelect navigate={navigate} setDifficulty={setDifficulty} mode="online" />}
      {currentView === 'offlineGame' && <OfflineGame navigate={navigate} difficulty={difficulty} username={username} />}
      {currentView === 'matchmaking' && <Matchmaking navigate={navigate} socket={socket} username={username} difficulty={difficulty} />}
      {currentView === 'onlineGame' && <OnlineGame navigate={navigate} socket={socket} username={username} difficulty={difficulty} />}
      {currentView === 'settings' && <Settings navigate={navigate} />}
      {currentView === 'metrics' && <Metrics navigate={navigate} username={username} />}
    </>
  );
}

export default App;
