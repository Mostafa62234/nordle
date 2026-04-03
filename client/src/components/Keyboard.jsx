import React from 'react';

export default function Keyboard({ onKeyPress, keyStatus }) {
  const rows = [
    ['1', '2', '3', '4', '5'],
    ['6', '7', '8', '9', '0'],
    ['Enter', 'Backspace']
  ];

  return (
    <div className="keyboard">
      {rows.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map(key => {
            const isLarge = key === 'Enter' || key === 'Backspace';
            const statusClass = ''; // Disabled per user request
            return (
              <button 
                key={key} 
                className={`key ${isLarge ? 'large' : ''} ${statusClass}`}
                onClick={() => onKeyPress(key)}
              >
                {key === 'Backspace' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
