import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import Keyboard from '../components/Keyboard';
import { DIFFICULTIES, generateSecret, evaluateGuess } from '../gameLogic';
import { saveGameResult } from '../metrics';
import { incrementAdCounter, resetAdCounter } from '../mockAdManager';

export default function OfflineGame({ navigate, difficulty, username }) {
  const [secret, setSecret] = useState('');
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [animatingRow, setAnimatingRow] = useState(-1);
  const [keyStatus, setKeyStatus] = useState({});
  const [showAd, setShowAd] = useState(false);
  const [showRewardedAd, setShowRewardedAd] = useState(false);
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
    setShowAd(false);
    setShowRewardedAd(false);
    setHintGiven(false);
  };

  const handleGameOver = (won, finalGuessesLength) => {
    setGameWon(won);
    setGameOver(true);
    saveGameResult(username, won, difficulty, finalGuessesLength);
    
    // Process Interstitial Ad Check
    const adCount = incrementAdCounter();
    if (adCount >= 3) {
      setTimeout(() => {
        setShowAd(true);
        resetAdCounter();
      }, 1500); // give them a moment to see the win/lose screen before ad popup
    }
  };

  const onKeyPress = (key) => {
    if (gameOver || animatingRow !== -1 || showAd || showRewardedAd) return;

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
    setShowRewardedAd(false);
    setHintGiven(true);
    alert(`Hint: The first digit is ${secret[0]}`);
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <button className="header-btn left" onClick={() => navigate('difficultySelect')}>←</button>
        <span className="app-title">{difficulty}</span>
        {!gameOver && !hintGiven && (
            <button className="header-btn right" style={{fontSize: '1rem', border: 'none', background: 'none', cursor: 'pointer', color: 'white'}} onClick={() => setShowRewardedAd(true)}>💡</button>
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

      {gameOver && !showAd && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ marginBottom: '10px' }}>{gameWon ? 'You Win!' : 'Game Over'}</h2>
            <p style={{ marginBottom: '20px' }}>The secret was: <strong>{secret}</strong></p>
            <button className="btn-primary" onClick={initGame}>Play Again</button>
            <button className="btn-secondary" onClick={() => navigate('home')}>Main Menu</button>
          </div>
        </div>
      )}

      {showAd && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ backgroundColor: '#2a2a2a', border: '2px solid var(--color-yellow)' }}>
            <h2 style={{ marginBottom: '10px', color: 'var(--color-yellow)' }}>ADVERTISEMENT</h2>
            <p style={{ marginBottom: '20px' }}>Please enjoy this 5 second break from Nordle!</p>
            <button className="btn-secondary" onClick={() => setShowAd(false)}>Close Ad</button>
          </div>
        </div>
      )}

      {showRewardedAd && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ backgroundColor: '#1e3a8a', border: '2px solid #3b82f6' }}>
            <h2 style={{ marginBottom: '10px', color: 'white' }}>REWARDED AD</h2>
            <p style={{ marginBottom: '20px', color: 'white' }}>Watch a short video to receive a free hint!</p>
            <button className="btn-primary" onClick={giveHint}>Watch Ad</button>
            <button className="btn-secondary" onClick={() => setShowRewardedAd(false)}>No Thanks</button>
          </div>
        </div>
      )}
    </div>
  );
}
