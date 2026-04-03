import React from 'react';

export default function Tile({ letter, status, animating }) {
  const cssClass = `tile ${status || ''} ${animating ? 'flip-in' : ''} ${letter && !status ? 'filled' : ''}`;
  return (
    <div className={cssClass}>
      {letter || ''}
    </div>
  );
}
