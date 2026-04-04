import React, { useState, useEffect } from 'react';
import GameBoard from '../components/GameBoard';
import Keyboard from '../components/Keyboard';
import { useLanguage } from '../LanguageContext';
import { playWinSound, playLoseSound } from '../sounds';

export default function OnlineGame({ navigate, socket, username, difficulty }) {
  const { t } = useLanguage();
  const [round, setRound] = useState(1);
  const [digits, setDigits] = useState(4);
  const [maxTries, setMaxTries] = useState(4);
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [animatingRow, setAnimatingRow] = useState(-1);
  const [keyStatus, setKeyStatus] = useState({});
  const [opponentName, setOpponentName] = useState('Opponent');
  
  const [roundResult, setRoundResult] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [isRoundActive, setIsRoundActive] = useState(false);
  const [outOfTries, setOutOfTries] = useState(false);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('roundStart', (data) => {
      setRound(data.round);
      setDigits(data.digitCount);
      setMaxTries(data.maxTries);
      setOpponentName(data.p1 === username ? data.p2 : data.p1);
      
      setGuesses([]);
      setCurrentGuess('');
      setAnimatingRow(-1);
      setKeyStatus({});
      setRoundResult(null);
      setOutOfTries(false);
      setIsRoundActive(true);
    });

    socket.on('guessResult', ({ result, guess }) => {
      const newGuessObj = {
        letters: guess.split(''),
        status: result
      };

      setGuesses(prev => {
        const newGuesses = [...prev, newGuessObj];
        setAnimatingRow(newGuesses.length);
        setTimeout(() => setAnimatingRow(-1), 300);
        return newGuesses;
      });

      setKeyStatus(prev => {
        const newKeyStatus = { ...prev };
        newGuessObj.letters.forEach((l, i) => {
          const s = result[i];
          if (newKeyStatus[l] === 'green') return;
          if (newKeyStatus[l] === 'yellow' && s === 'gray') return;
          newKeyStatus[l] = s;
        });
        return newKeyStatus;
      });
    });

    socket.on('opponentGuessed', () => {
      // Could show a toast or a counter later
    });

    socket.on('outOfTries', () => {
      setOutOfTries(true);
      setIsRoundActive(false);
    });

    socket.on('roundEnd', (data) => {
      setIsRoundActive(false);
      setRoundResult(data); // { winner, secret }
      if (data.winner === username) playWinSound();
      else if (data.winner !== 'Draw') playLoseSound();
    });

    socket.on('matchEnd', (data) => {
      setIsRoundActive(false);
      setMatchResult(data);
      if (data.winner === username) playWinSound();
      else if (data.winner !== 'Draw') playLoseSound();
    });

    return () => {
      socket.off('roundStart');
      socket.off('guessResult');
      socket.off('opponentGuessed');
      socket.off('outOfTries');
      socket.off('roundEnd');
      socket.off('matchEnd');
    };
  }, [socket, username]);

  const onKeyPress = (key) => {
    if (!isRoundActive || animatingRow !== -1 || outOfTries) return;

    if (key === 'Enter') {
      if (currentGuess.length !== digits) return;
      socket.emit('submitGuess', { roomId: socket.roomId, guess: currentGuess });
      // The roomId doesn't need to be tracked by the client if we just send it... wait, we need roomId? 
      // Actually Server doesn't need roomId if we look it up by socket, but we didn't save room to socket.
      // Let's modify index.js to just use socket.roomId or we can just send it. Let's fix server index.js to track socket.roomId!
      // Wait, in my server/index.js I did:
      // socket.join(roomId); ... I didn't save socket.roomId = roomId. But I can just look up the room.
      // The server expects `{ roomId, guess }`. Client doesn't have `roomId`. Let me patch client/server.
    } else if (key === 'Backspace') {
      setCurrentGuess(prev => prev.slice(0, -1));
    } else {
      if (currentGuess.length < digits && /^[0-9]$/.test(key)) {
        setCurrentGuess(prev => prev + key);
      }
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <button className="header-btn left" onClick={() => navigate('home')}>{t('quit')}</button>
        <span className="app-title">{t('pvp')} ({t('round_of')} {round}/3)</span>
        <span className="header-btn right" style={{ fontSize: '0.8rem', color: '#ccc' }}>{t('vs')} {opponentName}</span>
      </header>

      <GameBoard 
        guesses={guesses}
        currentGuess={currentGuess}
        maxTries={maxTries}
        digits={digits}
        animatingRow={animatingRow}
      />
      
      <Keyboard onKeyPress={onKeyPress} keyStatus={keyStatus}/>

      {outOfTries && !roundResult && !matchResult && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ opacity: 0.9 }}>
            <h2>{t('out_of_tries')}</h2>
            <p>{t('waiting_opp_finish')}</p>
          </div>
        </div>
      )}

      {roundResult && !matchResult && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ animation: 'popIn 0.3s' }}>
            <h2>{roundResult.winner === username ? t('you_won_round') : (roundResult.winner === 'Draw' ? t('round_draw') : t('opp_won_round'))}</h2>
            <p>{t('secret_was')}<strong>{roundResult.secret}</strong></p>
            <p style={{ marginTop: '10px', fontSize: '0.9rem', color: '#999' }}>{t('next_round')}</p>
          </div>
        </div>
      )}

      {matchResult && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ border: matchResult.winner === username ? '2px solid var(--color-green)' : '2px solid var(--color-red)' }}>
            <h2>{matchResult.winner === username ? t('match_victory') : (matchResult.winner === 'Draw' ? t('match_draw') : t('match_defeat'))}</h2>
            <p style={{ margin: '15px 0' }}>{t('score')}{username} ({matchResult.p1Wins > matchResult.p2Wins ? matchResult.p1Wins : matchResult.p2Wins}) - {opponentName} ({matchResult.p1Wins < matchResult.p2Wins ? matchResult.p1Wins : matchResult.p2Wins})</p>
            <button className="btn-primary" onClick={() => navigate('home')}>{t('return_menu')}</button>
          </div>
        </div>
      )}
    </div>
  );
}
