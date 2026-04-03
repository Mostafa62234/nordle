import React from 'react';
import { DIFFICULTIES } from '../gameLogic';
import { useLanguage } from '../LanguageContext';

export default function DifficultySelect({ navigate, setDifficulty, mode }) {
  const { t, lang } = useLanguage();

  const handleSelect = (diffName) => {
    setDifficulty(diffName);
    if (mode === 'online') {
       navigate('matchmaking');
    } else {
       navigate('offlineGame');
    }
  };

  const stylesMap = {
    Easy: { color: '#2ecc71', bgOpacity: '1a' },
    Normal: { color: '#f1c40f', bgOpacity: '1a' },
    Hard: { color: '#e67e22', bgOpacity: '1a' },
    Extreme: { color: '#e74c3c', bgOpacity: '1a' }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', backgroundColor: '#121213' }}>
      
      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '500px', marginBottom: '40px', marginTop: '20px' }}>
        <button 
          onClick={() => navigate('home')} 
          style={{ 
            backgroundColor: '#1f1f1f', 
            border: '1px solid #333', 
            borderRadius: '8px', 
            padding: '8px 12px', 
            color: '#fff', 
            cursor: 'pointer', 
            [lang === 'ar' ? 'marginLeft' : 'marginRight']: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
        </button>
        <div style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
           {t('choose_diff')} ({mode === 'online' ? t('pvp') : t('solo')})
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '500px' }}>
        {Object.entries(DIFFICULTIES).map(([name, data]) => {
          const color = stylesMap[name]?.color || '#fff';
          const bgOpacity = stylesMap[name]?.bgOpacity || '22';
          
          return (
            <button 
              key={name}
              onClick={() => handleSelect(name)}
              style={{ 
                width: '100%',
                backgroundColor: '#1f1f1f',
                border: `1px solid ${color}`,
                borderRadius: '8px',
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                cursor: 'pointer',
                textAlign: 'left',
                outline: 'none',
                transition: 'transform 0.1s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: color, fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '4px' }}>
                  {name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#999', marginBottom: '2px' }}>
                  {data.digits} {t('digits')} · {data.tries} {t('tries')}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#666' }}>
                  {data.multiplier}{t('score_mult')}
                </div>
              </div>
              
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: `${color}${bgOpacity}`, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center' 
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: lang === 'ar' ? 'scaleX(-1)' : 'none' }}>
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </button>
          );
        })}
      </div>

    </div>
  );
}
