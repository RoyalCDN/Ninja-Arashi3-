import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-Memory Storage for Users and Rooms
interface StoredUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  victories: number;
  missionsCompleted: number;
  joinedDate: string;
}

const users: Map<string, StoredUser> = new Map([
  [
    'kaironinja',
    {
      id: 'usr_482910',
      username: 'KairoNinja',
      email: 'kairo@akarai.shadow',
      passwordHash: 'hashed_kairo_password',
      level: 12,
      xp: 560,
      coins: 12450,
      gems: 320,
      victories: 48,
      missionsCompleted: 32,
      joinedDate: '2025-10-20',
    },
  ],
]);

interface Room {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  mode: string;
  mapId: string;
  maxPlayers: number;
  currentPlayers: number;
  status: 'waiting' | 'in_progress';
  ping: number;
  players: {
    id: string;
    username: string;
    ready: boolean;
    characterId: string;
  }[];
}

const rooms: Map<string, Room> = new Map([
  [
    'room_1',
    {
      id: 'room_1',
      name: 'ShadowTeam',
      hostId: 'host_1',
      hostName: 'ShadowWolf',
      mode: 'COOP',
      mapId: 'shadow_forest',
      maxPlayers: 4,
      currentPlayers: 3,
      status: 'waiting',
      ping: 45,
      players: [
        { id: 'h1', username: 'ShadowWolf', ready: true, characterId: 'kairo' },
        { id: 'h2', username: 'CrimsonNinja', ready: true, characterId: 'ren' },
        { id: 'h3', username: 'LunarMist', ready: false, characterId: 'ayame' },
      ],
    },
  ],
  [
    'room_2',
    {
      id: 'room_2',
      name: 'NinjaRush',
      hostId: 'host_2',
      hostName: 'StormEdge',
      mode: 'PVP',
      mapId: 'frozen_temple',
      maxPlayers: 4,
      currentPlayers: 2,
      status: 'waiting',
      ping: 62,
      players: [
        { id: 'h4', username: 'StormEdge', ready: true, characterId: 'kairo' },
        { id: 'h5', username: 'GhostKatana', ready: false, characterId: 'ren' },
      ],
    },
  ],
  [
    'room_3',
    {
      id: 'room_3',
      name: 'DragonSlayer',
      hostId: 'host_3',
      hostName: 'ViperX',
      mode: 'COOP',
      mapId: 'lava_valley',
      maxPlayers: 4,
      currentPlayers: 4,
      status: 'in_progress',
      ping: 38,
      players: [],
    },
  ],
]);

// API Endpoints
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', name: 'Ninja Areahi 3 Online Server', time: Date.now() });
});

app.get('/api/rooms', (_req: Request, res: Response) => {
  res.json({ rooms: Array.from(rooms.values()) });
});

app.post('/api/auth/register', (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing required registration fields' });
  }

  const normalizedUser = username.trim().toLowerCase();
  if (users.has(normalizedUser)) {
    return res.status(409).json({ error: 'Username is already taken' });
  }

  const newUser: StoredUser = {
    id: 'usr_' + Math.floor(100000 + Math.random() * 900000),
    username: username.trim(),
    email: email.trim(),
    passwordHash: 'hashed_' + password,
    level: 1,
    xp: 0,
    coins: 1000,
    gems: 25,
    victories: 0,
    missionsCompleted: 0,
    joinedDate: new Date().toISOString().split('T')[0],
  };

  users.set(normalizedUser, newUser);
  res.status(201).json({
    user: {
      ...newUser,
      nextLevelXp: 300,
      isGuest: false,
      isEmailVerified: false,
      selectedCharacterId: 'kairo',
      unlockedMaps: ['shadow_forest'],
      unlockedCharacters: ['kairo'],
      equippedWeapon: 'Katana of Akarai',
      equippedShuriken: '4-Point Steel Shuriken',
      equippedCharm: 'Talisman of Swift Wind',
      recentActivity: [
        {
          id: 'act_reg',
          text: 'Joined the Akarai Shadow Guild',
          timeAgo: 'Just now',
          icon: 'sword',
        },
      ],
    },
  });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier } = req.body;
  if (!identifier) {
    return res.status(400).json({ error: 'Username or email required' });
  }

  const normalized = identifier.trim().toLowerCase();
  const user = users.get(normalized) || users.get('kaironinja');

  if (user) {
    res.json({
      user: {
        ...user,
        nextLevelXp: 1200,
        isGuest: false,
        isEmailVerified: true,
        selectedCharacterId: 'kairo',
        unlockedMaps: ['shadow_forest', 'frozen_temple'],
        unlockedCharacters: ['kairo'],
        equippedWeapon: 'Katana of Akarai',
        equippedShuriken: '4-Point Steel Shuriken',
        equippedCharm: 'Talisman of Swift Wind',
        recentActivity: [
          {
            id: 'act_1',
            text: 'Logged in successfully',
            timeAgo: 'Just now',
            icon: 'sword',
          },
        ],
      },
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// Real-Time WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

interface ClientMetadata {
  ws: WebSocket;
  id: string;
  roomId?: string;
  username: string;
}

const clients: Map<WebSocket, ClientMetadata> = new Map();

wss.on('connection', (ws: WebSocket) => {
  const clientId = 'c_' + Math.floor(1000 + Math.random() * 9000);
  clients.set(ws, { ws, id: clientId, username: 'Ninja_' + clientId.slice(2) });

  ws.on('message', (raw: string) => {
    try {
      const msg = JSON.parse(raw.toString());
      const client = clients.get(ws);
      if (!client) return;

      if (msg.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong', payload: msg.payload }));
        return;
      }

      if (msg.type === 'create_room') {
        const room = msg.payload as Room;
        rooms.set(room.id, room);
        client.roomId = room.id;
        client.username = room.hostName;
        ws.send(JSON.stringify({ type: 'room_created', payload: room }));
        return;
      }

      if (msg.type === 'join_room') {
        const { roomId, username, characterId } = msg.payload;
        const targetRoom = rooms.get(roomId);
        if (targetRoom) {
          client.roomId = roomId;
          client.username = username;
          targetRoom.currentPlayers = Math.min(targetRoom.maxPlayers, targetRoom.currentPlayers + 1);
          targetRoom.players.push({
            id: client.id,
            username,
            ready: true,
            characterId,
          });

          // Broadcast to everyone in this room
          broadcastToRoom(roomId, {
            type: 'room_update',
            payload: targetRoom,
          });
        }
        return;
      }

      if (msg.type === 'player_state') {
        if (client.roomId) {
          broadcastToRoom(
            client.roomId,
            {
              type: 'remote_player_update',
              payload: {
                id: client.id,
                username: client.username,
                ...msg.payload,
              },
            },
            ws
          );
        }
        return;
      }

      if (msg.type === 'leave_room') {
        if (client.roomId) {
          const r = rooms.get(client.roomId);
          if (r) {
            r.currentPlayers = Math.max(0, r.currentPlayers - 1);
            r.players = r.players.filter((p) => p.id !== client.id);
            broadcastToRoom(client.roomId, {
              type: 'room_update',
              payload: r,
            });
            broadcastToRoom(client.roomId, {
              type: 'player_left',
              payload: { id: client.id },
            });
          }
          client.roomId = undefined;
        }
        return;
      }
    } catch {
      // Ignore invalid json
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    if (client && client.roomId) {
      const r = rooms.get(client.roomId);
      if (r) {
        r.currentPlayers = Math.max(0, r.currentPlayers - 1);
        r.players = r.players.filter((p) => p.id !== client.id);
        broadcastToRoom(client.roomId, {
          type: 'room_update',
          payload: r,
        });
      }
    }
    clients.delete(ws);
  });
});

function broadcastToRoom(roomId: string, message: { type: string; payload: unknown }, sender?: WebSocket) {
  const payloadStr = JSON.stringify(message);
  for (const [socket, meta] of clients.entries()) {
    if (meta.roomId === roomId && socket !== sender && socket.readyState === WebSocket.OPEN) {
      socket.send(payloadStr);
    }
  }
}

// Vite middleware in dev or static files in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`[Ninja Areahi 3 Online] Game server running on port ${PORT}`);
  });
}

startServer();
