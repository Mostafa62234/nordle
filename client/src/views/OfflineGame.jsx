import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import Keyboard from '../components/Keyboard';
import { DIFFICULTIES, generateSecret, evaluateGuess } from '../gameLogic';
import { saveGameResult } from '../metrics';
import { useLanguage } from '../LanguageContext';
import { playWinSound, playLoseSound } from '../sounds';
import AdSenseBanner from '../components/AdSenseBanner';

export default function OfflineGame({ navigate, difficulty, username }) {
  const { t } = useLanguage();
  const [secret, setSecret] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [animatingRow, setAnimatingRow] = useState(-1);
  const [keyStatus, setKeyStatus] = useState({});
  const [hintGiven, setHintGiven] = useState(false);

  const conf = DIFFICULTIES[difficulty] || DIFFICULTIES['Normal'];

  useEffect(() => {
    initGame();
  }, [difficulty]);

  const initGame = () => {
    setSecret(generateSecret(conf.digits));
    setGuesses([]);
    setCurrentGuess('');
    setGameOver(false);
    setGameWon(false);
    setKeyStatus({});
    setHintGiven(false);
  };

  const handleGameOver = (won, finalGuessesLength) => {
    setGameWon(won);
    setGameOver(true);
    saveGameResult(username, won, difficulty, finalGuessesLength);
    
    if (won) playWinSound();
    else playLoseSound();
  };

  const onKeyPress = (key) => {
    if (gameOver || animatingRow !== -1) return;

    if (key === 'Enter') {
      if (currentGuess.length !== conf.digits) return;
      
      const statusArr = evaluateGuess(currentGuess, secret);
      const newGuessObj = {
        letters: currentGuess.split(''),
        status: statusArr
      };

      const newGuesses = [...guesses, newGuessObj];
      setGuesses(newGuesses);
      setCurrentGuess('');
      setAnimatingRow(guesses.length);

      // Update Key Statuses
      const newKeyStatus = { ...keyStatus };
      newGuessObj.letters.forEach((l, i) => {
        const s = statusArr[i];
        if (newKeyStatus[l] === 'green') return;
        if (newKeyStatus[l] === 'yellow' && s === 'gray') return;
        newKeyStatus[l] = s;
      });
      setKeyStatus(newKeyStatus);

      // Check win/loss
      const won = statusArr.every(s => s === 'green');
      setTimeout(() => {
        setAnimatingRow(-1);
        if (won) {
          handleGameOver(true, newGuesses.length);
        } else if (newGuesses.length >= conf.tries) {
          handleGameOver(false, conf.tries);
        }
      }, 300); // Must be slightly longer than css animation
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else {
      if (currentGuess.length < conf.digits && /^[0-9]$/.test(key)) {
        setCurrentGuess(prev => prev + key);
      }
    }
  };

  const giveHint = () => {
    setHintGiven(true);
    alert(`Hint: The first digit is ${secret[0]}`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <button className="header-btn left" onClick={() => navigate('difficultySelect')}>←</button>
        <span className="app-title">{difficulty}</span>
        {!gameOver && !hintGiven && (
            <button className="header-btn right" style={{fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'white'}} onClick={giveHint}>💡</button>
        )}
      </header>

      <GameBoard 
        guesses={guesses}
        currentGuess={currentGuess}
        maxTries={conf.tries}
        digits={conf.digits}
        animatingRow={animatingRow}
      />
      
      <Keyboard onKeyPress={onKeyPress} keyStatus={keyStatus}/>

      {/* AdSense Banner ad placed below the keyboard */}
      <AdSenseBanner />

      {gameOver && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '10px' }}>{gameWon ? t('victory') : t('game_over')}</h2>
            <p style={{ marginBottom: '20px' }}>{t('secret_was')}<strong>{secret}</strong></p>
            <button className="btn-primary" onClick={initGame}>{t('play_again_btn')}</button>
            <button className="btn-secondary" onClick={() => navigate('home')}>{t('home_btn')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
