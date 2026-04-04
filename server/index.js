require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

// REST routes
app.post('/api/login', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });
  try {
    const user = await db.getUser(username);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/metrics/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const user = await db.getUser(username);
    const rank = await db.getUserRank(username);
    const leaderboard = await db.getLeaderboard();
    res.json({ user, rank, leaderboard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/offline-result', async (req, res) => {
  const { username, won, difficulty, tries } = req.body;
  try {
    await db.updateOfflineStats(username, won, difficulty, tries);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Middleware
const adminAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_SECRET_KEY || 'nordle-secret-admin';
  if (req.headers['x-admin-key'] === adminKey) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized Admin Key' });
  }
};

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await db.getAllUsersAdmin();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/ban', adminAuth, async (req, res) => {
  const { username, untilTimestamp } = req.body;
  try {
    const updated = await db.setBanStatus(username, untilTimestamp);
    res.json({ success: true, user: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Matchmaking State
const queues = { Easy: [], Normal: [], Hard: [], Extreme: [] };

const difficultiesConf = {
  Easy: { tries: 5, digits: 3 },
  Normal: { tries: 4, digits: 4 },
  Hard: { tries: 3, digits: 4 },
  Extreme: { tries: 3, digits: 5 }
};

const rooms = {};

function generateSecret(length) {
  let secret = '';
  for (let i = 0; i < length; i++) {
    let digit = Math.floor(Math.random() * 10).toString();
    if (secret.includes(digit) && Math.random() < 0.8) {
      digit = Math.floor(Math.random() * 10).toString();
    }
    secret += digit;
  }
  return secret;
}

function evaluateGuess(guessStr, secretStr) {
  const result = Array(guessStr.length).fill('gray');
  const secretChars = secretStr.split('');
  const guessChars = guessStr.split('');

  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === secretChars[i]) {
        result[i] = 'green';
        secretChars[i] = null;
        guessChars[i] = null;
    }
  }

  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] !== null) {
      const matchIndex = secretChars.indexOf(guessChars[i]);
      if (matchIndex !== -1) {
        result[i] = 'yellow';
        secretChars[matchIndex] = null;
      }
    }
  }
  return result;
}

io.on('connection', (socket) => {
  socket.on('joinQueue', async ({ username, difficulty }) => {
    try {
      const user = await db.getUser(username);
      if (user.banned_until && new Date(user.banned_until) > new Date()) {
        socket.emit('banned', { until: user.banned_until });
        return;
      }
    } catch (err) {
      console.error(err);
    }

    socket.username = username;
    socket.difficulty = difficulty;
    try { socket.totalScore = user.total_score || 0; } catch(e) {}

    
    if (queues[difficulty].includes(socket)) return;

    const oppIndex = queues[difficulty].findIndex(s => s.username !== username);
    
    if (oppIndex !== -1) {
      const opponent = queues[difficulty].splice(oppIndex, 1)[0];
      const roomId = `room_${Date.now()}`;
      
      socket.join(roomId);
      opponent.join(roomId);
      socket.roomId = roomId;
      opponent.roomId = roomId;

      rooms[roomId] = {
        id: roomId,
        difficulty,
        players: [opponent, socket],
        p1Wins: 0,
        p2Wins: 0,
        round: 1,
        p1Tries: 0,
        p2Tries: 0
      };

      startRound(roomId);
    } else {
      queues[difficulty].push(socket);
    }
  });

  socket.on('leaveQueue', () => {
    if (socket.difficulty && queues[socket.difficulty]) {
       queues[socket.difficulty] = queues[socket.difficulty].filter(s => s !== socket);
    }
  });

  socket.on('disconnect', () => {
    for (const diff in queues) {
      queues[diff] = queues[diff].filter(s => s !== socket);
    }
  });

  socket.on('submitGuess', ({ guess }) => {
    const roomId = socket.roomId;
    const room = rooms[roomId];
    if (!room) return;
    
    const isP1 = room.players[0] === socket;
    
    const resultArr = evaluateGuess(guess, room.secret);
    const isWin = resultArr.every(s => s === 'green');

    if (isP1) room.p1Tries++;
    else room.p2Tries++;

    socket.emit('guessResult', { result: resultArr, guess });
    
    const opponent = isP1 ? room.players[1] : room.players[0];
    opponent.emit('opponentGuessed', {});

    const conf = difficultiesConf[room.difficulty];
    const userTries = isP1 ? room.p1Tries : room.p2Tries;

    if (isWin) {
      io.to(roomId).emit('roundEnd', { winner: socket.username, secret: room.secret });
      finishRound(roomId, isP1 ? 1 : 2);
    } else if (room.p1Tries >= conf.tries && room.p2Tries >= conf.tries) {
      io.to(roomId).emit('roundEnd', { winner: 'Draw', secret: room.secret });
      finishRound(roomId, 0);
    } else if (userTries >= conf.tries) {
      socket.emit('outOfTries', {});
    }
  });
});

function startRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;
  const conf = difficultiesConf[room.difficulty];
  room.secret = generateSecret(conf.digits);
  room.p1Tries = 0;
  room.p2Tries = 0;

  io.to(roomId).emit('roundStart', { 
    round: room.round, 
    digitCount: conf.digits, 
    maxTries: conf.tries,
    p1: room.players[0].username,
    p1Score: room.players[0].totalScore,
    p2: room.players[1].username,
    p2Score: room.players[1].totalScore
  });
}

function finishRound(roomId, winnerId) {
  const room = rooms[roomId];
  if (!room) return;
  if (winnerId === 1) room.p1Wins++;
  else if (winnerId === 2) room.p2Wins++;

  if (room.p1Wins === 2 || room.p2Wins === 2 || room.round === 3) {
    setTimeout(async () => {
      const p1Won = room.p1Wins > room.p2Wins;
      const p2Won = room.p2Wins > room.p1Wins;
      io.to(roomId).emit('matchEnd', {
        p1Wins: room.p1Wins,
        p2Wins: room.p2Wins,
        winner: p1Won ? room.players[0].username : (p2Won ? room.players[1].username : 'Draw')
      });
      
      try {
        await db.updateOnlineStats(room.players[0].username, p1Won, room.p1Wins);
        await db.updateOnlineStats(room.players[1].username, p2Won, room.p2Wins);
      } catch (err) {}
      
      room.players[0].leave(roomId);
      room.players[1].leave(roomId);
      delete rooms[roomId];
    }, 3000);
  } else {
    room.round++;
    setTimeout(() => startRound(roomId), 3000);
  }
}

const PORT = process.env.PORT || process.env.ALWAYSDATA_HTTPD_PORT || 3001;
const HOST = process.env.IP || process.env.ALWAYSDATA_HTTPD_IP || '::';

server.listen(PORT, HOST, () => {
  console.log(`Server listening on ${HOST}:${PORT}`);
});
