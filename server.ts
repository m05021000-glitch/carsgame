import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const PORT = Number(process.env.PORT) || 3000;

interface PlayerState {
  id: string;
  name: string;
  avatar: string;
  truckId: string;
  equippedParts: {
    engine: string;
    nitro: string;
    gear: string;
    tires: string;
  };
  isReady: boolean;
  distance: number;
  speed: number;
  cps: number;
  alertness: number;
  nitroActive: boolean;
  finished: boolean;
  finishTime: number | null;
  roundRank: number | null;
  roundScore: number;
  totalScore: number;
  roundsWon: number;
}

interface RoomState {
  code: string;
  currentRound: number;
  status: 'CONFIGURING' | 'COUNTDOWN' | 'RACING' | 'ROUND_PODIUM';
  configTimerRemaining: number; // in seconds
  countdownSeconds: number; // 3, 2, 1
  raceTargetDistance: number; // meters (e.g. 1000m)
  players: Record<string, PlayerState>;
  roundWinners: Array<{
    round: number;
    championId: string;
    championName: string;
    championSpeed: number;
    time: number;
  }>;
}

const rooms: Record<string, RoomState> = {};
const socketRoomMap = new Map<WebSocket, { roomCode: string; playerId: string; isHost: boolean }>();

// Generate 4-digit numeric room code
function generateRoomCode(): string {
  let code = '';
  do {
    code = Math.floor(1000 + Math.random() * 9000).toString();
  } while (rooms[code]);
  return code;
}

function broadcastToRoom(roomCode: string, payload: unknown) {
  const message = JSON.stringify(payload);
  for (const [ws, info] of socketRoomMap.entries()) {
    if (info.roomCode === roomCode && ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  }
}

// Room timer ticker (1 second interval)
setInterval(() => {
  for (const [code, room] of Object.entries(rooms)) {
    if (room.status === 'CONFIGURING') {
      if (room.configTimerRemaining > 0) {
        room.configTimerRemaining -= 1;
        if (room.configTimerRemaining === 0) {
          // Time's up! Auto start countdown
          room.status = 'COUNTDOWN';
          room.countdownSeconds = 3;
          broadcastToRoom(code, { type: 'COUNTDOWN_START', room });
        } else {
          broadcastToRoom(code, { type: 'TIMER_TICK', timer: room.configTimerRemaining });
        }
      }
    } else if (room.status === 'COUNTDOWN') {
      if (room.countdownSeconds > 0) {
        room.countdownSeconds -= 1;
        if (room.countdownSeconds === 0) {
          room.status = 'RACING';
          // Reset race distance for all players
          for (const p of Object.values(room.players)) {
            p.distance = 0;
            p.speed = 30;
            p.cps = 0;
            p.finished = false;
            p.finishTime = null;
            p.roundRank = null;
          }
          broadcastToRoom(code, { type: 'RACE_START', room });
        } else {
          broadcastToRoom(code, { type: 'COUNTDOWN_TICK', countdown: room.countdownSeconds });
        }
      }
    }
  }
}, 1000);

// WebSocket event handling
wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      const { type, roomCode, payload } = data;

      if (type === 'CREATE_ROOM') {
        const code = generateRoomCode();
        rooms[code] = {
          code,
          currentRound: 1,
          status: 'CONFIGURING',
          configTimerRemaining: 300, // 5 minutes
          countdownSeconds: 3,
          raceTargetDistance: 1000,
          players: {},
          roundWinners: []
        };
        socketRoomMap.set(ws, { roomCode: code, playerId: 'HOST', isHost: true });
        ws.send(JSON.stringify({ type: 'ROOM_CREATED', room: rooms[code] }));
      } else if (type === 'JOIN_ROOM') {
        const code = roomCode;
        const room = rooms[code];
        if (!room) {
          ws.send(JSON.stringify({ type: 'ERROR', message: '找不到此房間代碼，請確認後重新輸入！' }));
          return;
        }

        const playerId = payload.playerId || `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        const isHost = payload.isHost === true;

        socketRoomMap.set(ws, { roomCode: code, playerId, isHost });

        if (!isHost) {
          if (!room.players[playerId]) {
            room.players[playerId] = {
              id: playerId,
              name: payload.name || `午休騎士 #${Object.keys(room.players).length + 1}`,
              avatar: payload.avatar || '🚗',
              truckId: payload.truckId || 'truck_yellow',
              equippedParts: payload.equippedParts || {
                engine: 'engine_stock',
                nitro: 'nitro_stock',
                gear: 'gear_stock',
                tires: 'tire_stock'
              },
              isReady: false,
              distance: 0,
              speed: 0,
              cps: 0,
              alertness: 30,
              nitroActive: false,
              finished: false,
              finishTime: null,
              roundRank: null,
              roundScore: 0,
              totalScore: 0,
              roundsWon: 0
            };
          }
        }

        ws.send(JSON.stringify({ type: 'JOINED_SUCCESS', room, playerId }));
        broadcastToRoom(code, { type: 'ROOM_UPDATED', room });
      } else if (type === 'UPDATE_LOADOUT') {
        const info = socketRoomMap.get(ws);
        if (!info) return;
        const room = rooms[info.roomCode];
        if (!room || !room.players[info.playerId]) return;

        const player = room.players[info.playerId];
        if (payload.name) player.name = payload.name;
        if (payload.truckId) player.truckId = payload.truckId;
        if (payload.equippedParts) player.equippedParts = payload.equippedParts;
        if (typeof payload.isReady === 'boolean') player.isReady = payload.isReady;

        broadcastToRoom(info.roomCode, {
          type: 'PLAYER_LOADOUT_CHANGED',
          room,
          player
        });
      } else if (type === 'ADD_BOT_RACER') {
        // Host adds an office colleague bot racer
        const info = socketRoomMap.get(ws);
        if (!info || !info.isHost) return;
        const room = rooms[info.roomCode];
        if (!room) return;

        const botNames = ['瞌睡企劃小陳', '哈欠工程師阿倫', '半夢半醒實習生', '美式咖啡急救員', '午休戰神主管'];
        const botId = `bot_${Date.now()}_${Math.random()}`;
        const name = botNames[Object.keys(room.players).length % botNames.length];
        
        room.players[botId] = {
          id: botId,
          name,
          avatar: '🤖',
          truckId: ['truck_yellow', 'truck_blackcat', 'truck_espresso', 'truck_scooter'][Math.floor(Math.random() * 4)],
          equippedParts: {
            engine: ['engine_turbo', 'engine_electric', 'engine_cruiser'][Math.floor(Math.random() * 3)],
            nitro: 'nitro_rapid',
            gear: 'gear_magnet',
            tires: 'tire_slick'
          },
          isReady: true,
          distance: 0,
          speed: 0,
          cps: 0,
          alertness: 50,
          nitroActive: false,
          finished: false,
          finishTime: null,
          roundRank: null,
          roundScore: 0,
          totalScore: 0,
          roundsWon: 0
        };

        broadcastToRoom(info.roomCode, { type: 'ROOM_UPDATED', room });
      } else if (type === 'START_RACE_EARLY') {
        // Host manually starts the race early
        const info = socketRoomMap.get(ws);
        if (!info || !info.isHost) return;
        const room = rooms[info.roomCode];
        if (!room) return;

        room.status = 'COUNTDOWN';
        room.countdownSeconds = 3;
        broadcastToRoom(info.roomCode, { type: 'COUNTDOWN_START', room });
      } else if (type === 'PLAYER_TELEMETRY') {
        // High frequency race telemetry
        const info = socketRoomMap.get(ws);
        if (!info) return;
        const room = rooms[info.roomCode];
        if (!room || room.status !== 'RACING') return;

        const player = room.players[info.playerId];
        if (!player || player.finished) return;

        player.distance = payload.distance;
        player.speed = payload.speed;
        player.cps = payload.cps;
        player.alertness = payload.alertness;
        player.nitroActive = payload.nitroActive;

        // Check if finished
        if (player.distance >= room.raceTargetDistance && !player.finished) {
          player.finished = true;
          player.finishTime = payload.finishTime || Date.now();

          // Calculate rank
          const finishedCount = Object.values(room.players).filter((p) => p.finished).length;
          player.roundRank = finishedCount;

          const pointsTable = [100, 80, 60, 45, 35, 25, 15];
          const roundPts = pointsTable[finishedCount - 1] || 10;
          player.roundScore = roundPts;
          player.totalScore += roundPts;

          if (finishedCount === 1) {
            player.roundsWon += 1;
            room.roundWinners.push({
              round: room.currentRound,
              championId: player.id,
              championName: player.name,
              championSpeed: player.speed,
              time: player.finishTime || Date.now()
            });
          }

          broadcastToRoom(info.roomCode, {
            type: 'PLAYER_FINISHED',
            playerId: player.id,
            rank: player.roundRank,
            name: player.name,
            room
          });

          // Check if all players finished or at least 1st finished
          const allPlayers = Object.values(room.players);
          const finishedPlayers = allPlayers.filter((p) => p.finished);

          if (finishedPlayers.length === allPlayers.length || finishedPlayers.length >= 1) {
            // Trigger podium after short delay
            setTimeout(() => {
              if (room.status === 'RACING') {
                room.status = 'ROUND_PODIUM';
                broadcastToRoom(info.roomCode, { type: 'ROUND_FINISHED', room });
              }
            }, 3500);
          }
        }

        broadcastToRoom(info.roomCode, {
          type: 'TELEMETRY_UPDATE',
          playerId: player.id,
          distance: player.distance,
          speed: player.speed,
          cps: player.cps,
          alertness: player.alertness,
          nitroActive: player.nitroActive
        });
      } else if (type === 'NEXT_ROUND') {
        const info = socketRoomMap.get(ws);
        if (!info || !info.isHost) return;
        const room = rooms[info.roomCode];
        if (!room) return;

        room.currentRound += 1;
        room.status = 'CONFIGURING';
        room.configTimerRemaining = 120; // 2 minutes quick re-tune for round 2+
        for (const p of Object.values(room.players)) {
          p.distance = 0;
          p.speed = 0;
          p.cps = 0;
          p.finished = false;
          p.finishTime = null;
          p.roundRank = null;
          p.roundScore = 0;
        }

        broadcastToRoom(info.roomCode, { type: 'NEXT_ROUND_STARTED', room });
      }
    } catch (e) {
      console.error('WS Error:', e);
    }
  });

  ws.on('close', () => {
    const info = socketRoomMap.get(ws);
    if (info) {
      const room = rooms[info.roomCode];
      if (room && !info.isHost) {
        // Player disconnected
      }
      socketRoomMap.delete(ws);
    }
  });
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
