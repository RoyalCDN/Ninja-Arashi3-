import { GameMode, MapId, MultiplayerRoom, RemotePlayer } from '../types/game';

type MultiplayerListener = (data: {
  event: string;
  payload: unknown;
}) => void;

class MultiplayerService {
  private ws: WebSocket | null = null;
  private listeners: MultiplayerListener[] = [];
  public connectionStatus: 'disconnected' | 'connecting' | 'connected' = 'disconnected';
  public currentRoom: MultiplayerRoom | null = null;
  public ping: number = 42;
  private pingInterval: number | null = null;
  private reconnectTimeout: number | null = null;

  public connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(this.ws.readyState === WebSocket.OPEN);
    }

    return new Promise((resolve) => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const url = `${protocol}//${window.location.host}/ws`;

        this.connectionStatus = 'connecting';
        this.emitLocal('status_change', { status: 'connecting' });

        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.connectionStatus = 'connected';
          this.emitLocal('status_change', { status: 'connected' });
          this.startPing();
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch {
            // Ignore non-json
          }
        };

        this.ws.onclose = () => {
          this.connectionStatus = 'disconnected';
          this.emitLocal('status_change', { status: 'disconnected' });
          this.stopPing();
          resolve(false);
        };

        this.ws.onerror = () => {
          this.connectionStatus = 'disconnected';
          this.emitLocal('status_change', { status: 'disconnected' });
          resolve(false);
        };
      } catch {
        this.connectionStatus = 'disconnected';
        resolve(false);
      }
    });
  }

  private startPing() {
    this.stopPing();
    this.pingInterval = window.setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        const start = performance.now();
        this.send('ping', { time: start });
      }
    }, 4000);
  }

  private stopPing() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private handleServerMessage(data: { type: string; payload: unknown }) {
    if (data.type === 'pong') {
      const payload = data.payload as { time: number };
      this.ping = Math.round(performance.now() - payload.time);
      this.emitLocal('ping', { ping: this.ping });
      return;
    }

    if (data.type === 'room_update') {
      this.currentRoom = data.payload as MultiplayerRoom;
    }

    this.emitLocal(data.type, data.payload);
  }

  public send(type: string, payload: unknown) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  public subscribe(cb: MultiplayerListener) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private emitLocal(event: string, payload: unknown) {
    this.listeners.forEach((l) => l({ event, payload }));
  }

  public async fetchRooms(): Promise<MultiplayerRoom[]> {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const data = await res.json();
        return data.rooms;
      }
    } catch {
      // Fallback rooms list
    }
    return [
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
      {
        id: 'room_4',
        name: 'DarkForest',
        hostId: 'host_4',
        hostName: 'BlackLotus',
        mode: 'COOP',
        mapId: 'shadow_forest',
        maxPlayers: 4,
        currentPlayers: 1,
        status: 'waiting',
        ping: 70,
        players: [
          { id: 'h6', username: 'BlackLotus', ready: true, characterId: 'ayame' },
        ],
      },
    ];
  }

  public createRoom(
    roomName: string,
    maxPlayers: number,
    mode: GameMode,
    mapId: MapId,
    username: string,
    characterId: string
  ): MultiplayerRoom {
    const newRoom: MultiplayerRoom = {
      id: 'room_' + Math.floor(1000 + Math.random() * 9000),
      name: roomName || 'NinjaRoom',
      hostId: 'me',
      hostName: username,
      mode,
      mapId,
      maxPlayers,
      currentPlayers: 1,
      status: 'waiting',
      ping: this.ping || 42,
      players: [
        {
          id: 'me',
          username,
          ready: true,
          characterId,
        },
      ],
    };
    this.currentRoom = newRoom;
    this.send('create_room', newRoom);
    return newRoom;
  }

  public joinRoom(room: MultiplayerRoom, username: string, characterId: string) {
    this.currentRoom = {
      ...room,
      currentPlayers: room.currentPlayers + 1,
      players: [
        ...room.players,
        {
          id: 'me',
          username,
          ready: false,
          characterId,
        },
      ],
    };
    this.send('join_room', { roomId: room.id, username, characterId });
  }

  public leaveRoom() {
    if (this.currentRoom) {
      this.send('leave_room', { roomId: this.currentRoom.id });
      this.currentRoom = null;
    }
  }

  public broadcastPlayerState(state: Partial<RemotePlayer>) {
    this.send('player_state', state);
  }
}

export const multiplayerService = new MultiplayerService();
