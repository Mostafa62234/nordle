import React from 'react';
import Tile from './Tile';

export default function GameBoard({ guesses, currentGuess, maxTries, digits, animatingRow }) {
  const empties = Array.from({ length: Math.max(0, maxTries - (guesses?.length || 0) - 1) });
  
  return (
    <div className="game-board">
      <div className="grid-container" style={{ gridTemplateColumns: `repeat(${digits}, 1fr)` }}>
        {guesses.map((guessObj, rIndex) => (
          guessObj.letters.map((val, cIndex) => (
            <Tile 
              key={`guess-${rIndex}-${cIndex}`} 
              letter={val} 
              status={guessObj.status[cIndex]}
              animating={animatingRow === rIndex} 
            />
          ))
        ))}
        {guesses.length < maxTries && (
          Array.from({ length: digits }).map((_, cIndex) => (
            <Tile 
              key={`current-${cIndex}`} 
              letter={currentGuess ? currentGuess[cIndex] : ''} 
            />
          ))
        )}
        {empties.map((_, rIndex) => (
          Array.from({ length: digits }).map((_, cIndex) => (
            <Tile 
              key={`empty-${rIndex}-${cIndex}`} 
            />
          ))
        ))}
      </div>
    </div>
  );
}
