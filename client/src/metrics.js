export function loadLocalMetrics() {
  const data = localStorage.getItem('nordle_metrics');
  if (data) {
    return JSON.parse(data);
  }
  return {
    gamesPlayed: 0,
    gamesWon: 0,
    gamesLost: 0,
    totalGuessesWhenWon: 0,
    difficultyStats: {
      Easy: { played: 0, won: 0 },
      Normal: { played: 0, won: 0 },
      Hard: { played: 0, won: 0 },
      Extreme: { played: 0, won: 0 }
    }
  };
}

export async function saveGameResult(username, won, difficulty, tries) {
  const metrics = loadLocalMetrics();
  
  metrics.gamesPlayed += 1;
  if (won) {
    metrics.gamesWon += 1;
    metrics.totalGuessesWhenWon += tries;
  } else {
    metrics.gamesLost += 1;
  }
  
  if (metrics.difficultyStats[difficulty]) {
    metrics.difficultyStats[difficulty].played += 1;
    if (won) {
      metrics.difficultyStats[difficulty].won += 1;
    }
  }

  localStorage.setItem('nordle_metrics', JSON.stringify(metrics));

  if (username) {
    try {
      const URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
      await fetch(`${URL}/api/offline-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, won, difficulty, tries })
      });
    } catch (err) {
      console.error(err);
    }
  }
}
