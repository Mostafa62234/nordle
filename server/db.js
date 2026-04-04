const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        password_hash TEXT,
        total_score INTEGER DEFAULT 0,
        games_played INTEGER DEFAULT 0,
        games_won INTEGER DEFAULT 0,
        games_lost INTEGER DEFAULT 0,
        total_guesses INTEGER DEFAULT 0,
        online_matches_played INTEGER DEFAULT 0,
        online_wins INTEGER DEFAULT 0,
        online_losses INTEGER DEFAULT 0,
        online_rounds_won INTEGER DEFAULT 0,
        banned_until TIMESTAMP
      )
    `);

    // Ensure existing tables are updated
    await client.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS banned_until TIMESTAMP,
      ADD COLUMN IF NOT EXISTS password_hash TEXT;
    `);
  } finally {
    client.release();
  }
}

initDB().catch(console.error);

async function getUser(username, passwordHash) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT * FROM users WHERE username = $1', [username]);
    if (res.rows.length > 0) {
      const user = res.rows[0];
      
      if (passwordHash) {
        if (!user.password_hash) {
          await client.query('UPDATE users SET password_hash = $1 WHERE username = $2', [passwordHash, username]);
          user.password_hash = passwordHash;
        } else if (user.password_hash !== passwordHash) {
          throw new Error('Invalid password');
        }
      }
      
      return user;
    } else {
      const insertRes = await client.query('INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *', [username, passwordHash]);
      return insertRes.rows[0];
    }
  } finally {
    client.release();
  }
}

async function updateOfflineStats(username, won, difficulty, tries) {
  const client = await pool.connect();
  try {
    let multiplier = 1.0;
    if (difficulty === 'Normal') multiplier = 1.5;
    if (difficulty === 'Hard') multiplier = 2.5;
    if (difficulty === 'Extreme') multiplier = 4.0;

    let scoreToAdd = 0;
    if (won) {
        let maxTries = 5;
        if (difficulty === 'Normal') maxTries = 4;
        if (difficulty === 'Hard' || difficulty === 'Extreme') maxTries = 3;
        const speedBonus = Math.max(0, maxTries - tries) * 5;
        scoreToAdd = Math.floor(10 * multiplier) + speedBonus;
    }

    if (won) {
      await client.query(`
        UPDATE users 
        SET games_played = games_played + 1,
            games_won = games_won + 1, 
            total_score = total_score + $1, 
            total_guesses = total_guesses + $2
        WHERE username = $3
      `, [scoreToAdd, tries, username]);
    } else {
      await client.query(`
        UPDATE users 
        SET games_played = games_played + 1,
            games_lost = games_lost + 1
        WHERE username = $1
      `, [username]);
    }
  } finally {
    client.release();
  }
}

async function updateOnlineStats(username, matchWon, roundsWon) {
  const client = await pool.connect();
  try {
    const scoreToAdd = (matchWon ? 50 : 0) + (roundsWon * 10);
    await client.query(`
      UPDATE users
      SET online_matches_played = online_matches_played + 1,
          online_wins = online_wins + $1,
          online_losses = online_losses + $2,
          online_rounds_won = online_rounds_won + $3,
          total_score = total_score + $4
      WHERE username = $5
    `, [matchWon ? 1 : 0, matchWon ? 0 : 1, roundsWon, scoreToAdd, username]);
  } finally {
    client.release();
  }
}

async function getLeaderboard() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT username, total_score, games_won, online_wins, games_played FROM users ORDER BY total_score DESC LIMIT 100');
    return res.rows;
  } finally {
    client.release();
  }
}

async function getUserRank(username) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT total_score FROM users WHERE username = $1', [username]);
    if (res.rows.length === 0) return 0;
    const score = res.rows[0].total_score;
    const rankRes = await client.query('SELECT COUNT(*) as rank FROM users WHERE total_score > $1', [score]);
    return parseInt(rankRes.rows[0].rank) + 1;
  } finally {
    client.release();
  }
}

async function getAllUsersAdmin() {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT username, total_score, games_played, games_won, online_matches_played, banned_until FROM users ORDER BY id DESC');
    return res.rows;
  } finally {
    client.release();
  }
}

async function setBanStatus(username, untilTimestamp) {
  const client = await pool.connect();
  try {
    const res = await client.query(
      'UPDATE users SET banned_until = $1 WHERE username = $2 RETURNING *',
      [untilTimestamp, username]
    );
    return res.rows[0];
  } finally {
    client.release();
  }
}
async function deductPoints(username, amount) {
  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET total_score = total_score - $1 WHERE username = $2',
      [amount, username]
    );
  } finally {
    client.release();
  }
}

module.exports = { getUser, updateOfflineStats, updateOnlineStats, getLeaderboard, getUserRank, getAllUsersAdmin, setBanStatus, deductPoints };
