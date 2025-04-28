require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:3000',
    ],
    methods: ['GET', 'POST'],
    credentials: true
  }
});
const PORT = 8080;

const api_key = process.env.TREVOR_PUBLIC_API_KEY;

function checkKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === api_key) {
        next();
    } else {
        res.status(401).json({ error: 'UNAUTHORIZED. Invalid api key' });
    }
}

app.use(cors({
  origin: [
    'http://localhost:3000',           // Local development
  ],
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());
app.use('/v1', checkKey);

app.use(express.static(path.join(__dirname, 'public')));

const lobbies = {}; 

function generateLobbyCode(length = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/create-lobby', (req, res) => {
    let newLobbyId;
    do {
        newLobbyId = generateLobbyCode();
    } while (lobbies[newLobbyId]);

    lobbies[newLobbyId] = []; 
    res.json({ lobbyId: newLobbyId });
});

app.get('/lobby/:lobbyId', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'lobby.html'));
});

io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('join-lobby', (lobbyId) => {
        if (!lobbies[lobbyId]) {
            socket.emit('lobby-not-found');
            return;
        }

        if (lobbies[lobbyId].length >= 2) {
            socket.emit('lobby-full');
            return;
        }

        lobbies[lobbyId].push(socket.id);
        socket.join(lobbyId);
        socket.lobbyId = lobbyId;

        const playerNumber = lobbies[lobbyId].indexOf(socket.id) + 1;
        socket.emit('joined', { playerNumber });

        console.log(`Socket ${socket.id} joined lobby ${lobbyId} as Player ${playerNumber}`);
    });

    socket.on('square-clicked', (color) => {
        const lobbyId = socket.lobbyId;
        if (lobbyId) {
            io.to(lobbyId).emit('update-square', color);
        }
    });

    socket.on('disconnect', () => {
        const lobbyId = socket.lobbyId;
        if (lobbyId && lobbies[lobbyId]) {
            lobbies[lobbyId] = lobbies[lobbyId].filter(id => id !== socket.id);
            if (lobbies[lobbyId].length === 0) {
                delete lobbies[lobbyId];
            }
        }
        console.log(`Socket ${socket.id} disconnected`);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
