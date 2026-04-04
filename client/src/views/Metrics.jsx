import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { loadLocalMetrics } from '../metrics';

export default function Metrics({ navigate, username }) {
  const { t, lang } = useLanguage();
  const [localMetrics, setLocalMetrics] = useState(null);
  const [serverStats, setServerStats] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    setLocalMetrics(loadLocalMetrics());
    const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    
    // Always fetch leaderboard
    fetch(`${URL}/api/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaderboardData(data.leaderboard || []))
      .catch(err => console.error("Could not fetch leaderboard", err));

    if (username) {
      fetch(`${URL}/api/metrics/${username}`)
        .then(res => res.json())
        .then(data => setServerStats(data))
        .catch(err => console.error("Could not fetch server stats", err));
    }
  }, [username]);

  if (!localMetrics) return null;

  const user = serverStats?.user || {};
  const rank = serverStats?.rank || '-';

  const gamesPlayed = user.games_played || localMetrics.gamesPlayed;
  const gamesWon = user.games_won || localMetrics.gamesWon;
  const gamesLost = user.games_lost || localMetrics.gamesLost;

  const winRate = gamesPlayed > 0 ? ((gamesWon / gamesPlayed) * 100).toFixed(1) : 0;
  const avgTries = gamesWon > 0 ? ((user.total_guesses || localMetrics.totalGuessesWhenWon) / gamesWon).toFixed(2) : '-';

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', overflowY: 'auto' }}>
      <header className="app-header" style={{ width: '100%', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <button className={`header-btn ${lang === 'ar' ? 'right' : 'left'}`} onClick={() => navigate('home')}>←</button>
        <h2 className="app-title" style={{ fontSize: '1.5rem' }}>{t('metrics_title')}</h2>
      </header>

      {/* Global Performance */}
      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#212121', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--color-green)' }}>{t('global_stats')} ({username})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>{t('played')}: {gamesPlayed}</div>
          <div>{t('won')}: {gamesWon}</div>
          <div>{t('lost')}: {gamesLost}</div>
          <div>{t('win_rate')}: {winRate}%</div>
          <div>{t('avg_tries')}: {avgTries}</div>
        </div>
      </div>

      {serverStats && (
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#1e3a8a', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: '#60a5fa' }}>{t('online_record')}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>{t('matches')}: {user.online_matches_played || 0}</div>
            <div>{t('won')}: {user.online_wins || 0}</div>
            <div>{t('lost')}: {user.online_losses || 0}</div>
            <div>{t('rounds_won')}: {user.online_rounds_won || 0}</div>
          </div>
        </div>
      )}

      {leaderboardData && leaderboardData.length > 0 && (
        <div style={{ width: '100%', maxWidth: '400px', backgroundColor: '#3f3f46', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '15px', color: 'var(--color-yellow)' }}>{t('global_leaderbd')}</h3>
          {username && <p style={{ marginBottom: '10px' }}>{t('rank')}: <strong>#{rank || '-'}</strong> ({t('total_score')}: {user.total_score || 0})</p>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
             {leaderboardData.map((lbUser, idx) => (
               <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', backgroundColor: lbUser.username === username ? '#52525b' : '#27272a', borderRadius: '5px' }}>
                 <span>{idx + 1}. {lbUser.username}</span>
                 <span>{lbUser.total_score} pts</span>
               </div>
             ))}
          </div>
        </div>
      )}
      
      <div className="ad-banner" style={{ marginTop: 'auto' }}>Banner Ad Placeholder</div>
    </div>
  );
}
