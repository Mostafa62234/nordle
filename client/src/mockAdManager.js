export function incrementAdCounter() {
  const games = parseInt(localStorage.getItem('nordle_games_played_for_ad') || '0', 10);
  const newCount = games + 1;
  localStorage.setItem('nordle_games_played_for_ad', newCount.toString());
  return newCount;
}

export function resetAdCounter() {
  localStorage.setItem('nordle_games_played_for_ad', '0');
}

export function shouldShowInterstitial() {
  const games = parseInt(localStorage.getItem('nordle_games_played_for_ad') || '0', 10);
  return games >= 3;
}
