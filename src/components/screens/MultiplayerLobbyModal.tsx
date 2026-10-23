import React, { useEffect, useState } from 'react';
import { ArrowLeft, Users, RefreshCw, Plus, Play, Swords, Shield, Wifi, AlertCircle } from 'lucide-react';
import { GameMode, MapId, MultiplayerRoom, UserProfile } from '../../types/game';
import { multiplayerService } from '../../services/multiplayer';
import { soundManager } from '../../services/audio';

interface MultiplayerLobbyModalProps {
  profile: UserProfile;
  onJoinRoomMatch: (room: MultiplayerRoom) => void;
  onBack: () => void;
}

export const MultiplayerLobbyModal: React.FC<MultiplayerLobbyModalProps> = ({
  profile,
  onJoinRoomMatch,
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'join'>('create');
  const [roomName, setRoomName] = useState(`${profile.username}Room`);
  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [mode, setMode] = useState<GameMode>('COOP');
  const [mapId, setMapId] = useState<MapId>('shadow_forest');
  const [rooms, setRooms] = useState<MultiplayerRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(multiplayerService.connectionStatus);
  const [directCode, setDirectCode] = useState('');

  useEffect(() => {
    // Attempt real WebSocket connection to backend
    multiplayerService.connect().then(() => {
      setConnectionStatus(multiplayerService.connectionStatus);
    });

    const unsub = multiplayerService.subscribe(({ event, payload }) => {
      if (event === 'status_change') {
        setConnectionStatus((payload as { status: typeof connectionStatus }).status);
      }
    });

    loadRooms();
    return () => unsub();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const list = await multiplayerService.fetchRooms();
    setRooms(list);
    setLoading(false);
  };

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSfx('button');
    const room = multiplayerService.createRoom(
      roomName,
      maxPlayers,
      mode,
      mapId,
      profile.username,
      profile.selectedCharacterId
    );
    soundManager.playSfx('join');
    onJoinRoomMatch(room);
  };

  const handleJoinRoom = (room: MultiplayerRoom) => {
    soundManager.playSfx('button');
    multiplayerService.joinRoom(room, profile.username, profile.selectedCharacterId);
    soundManager.playSfx('join');
    onJoinRoomMatch(room);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-slate-950 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Main Menu</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
            Online Multiplayer
          </h2>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {connectionStatus === 'connected'
                ? `Connected (${multiplayerService.ping}ms Ping)`
                : 'Local / Offline Peer Protocol Active'}
            </span>
          </div>
        </div>

        <div className="w-16" />
      </div>

      {/* Main Grid: Create Room (Left) vs Available Rooms (Right) matching Mockup #12 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 my-auto max-w-5xl mx-auto w-full z-10">
        {/* Left Side: Create Room Form */}
        <div className="md:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4">
          <div className="flex border-b border-slate-800 pb-3 gap-2">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Room
            </button>
            <button
              onClick={() => setActiveTab('join')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'join'
                  ? 'bg-red-950 text-red-400 border border-red-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Room Code
            </button>
          </div>

          {activeTab === 'create' ? (
            <form onSubmit={handleCreateRoom} className="flex flex-col gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Room Name</label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none"
                  maxLength={20}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Mode</label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as GameMode)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value="COOP">Co-Op Quest</option>
                    <option value="PVP">PvP Shinobi Duel</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-slate-300">Max Players</label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                  >
                    <option value={2}>2 Shinobi</option>
                    <option value={4}>4 Shinobi</option>
                    <option value={8}>8 Shinobi</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">Battle Map</label>
                <select
                  value={mapId}
                  onChange={(e) => setMapId(e.target.value as MapId)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="shadow_forest">Shadow Forest</option>
                  <option value="frozen_temple">Frozen Temple</option>
                  <option value="lava_valley">Lava Valley</option>
                  <option value="silent_cliffs">Silent Cliffs (Boss Arena)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm tracking-wide uppercase text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-950 border border-red-500/50 transition-all cursor-pointer"
              >
                Create Room
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-3 py-2">
              <label className="text-xs font-semibold text-slate-300">Enter Direct Room Code</label>
              <input
                type="text"
                placeholder="e.g. room_1234"
                value={directCode}
                onChange={(e) => setDirectCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none uppercase font-mono"
              />
              <button
                onClick={() => {
                  soundManager.playSfx('button');
                  const target = rooms.find((r) => r.id === directCode || r.name === directCode);
                  if (target) {
                    handleJoinRoom(target);
                  } else {
                    // Create direct room with code
                    const r = multiplayerService.createRoom(
                      directCode || 'CustomRoom',
                      4,
                      'COOP',
                      'shadow_forest',
                      profile.username,
                      profile.selectedCharacterId
                    );
                    onJoinRoomMatch(r);
                  }
                }}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs uppercase text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Join Direct Code
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Available Rooms Table matching Mockup #12 */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white tracking-wide">Available Rooms</h3>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  ({rooms.length})
                </span>
              </div>
              <button
                onClick={() => {
                  soundManager.playSfx('button');
                  loadRooms();
                }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
            </div>

            {/* Room List */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-72">
              {rooms.map((room) => {
                const isFull = room.currentPlayers >= room.maxPlayers;
                return (
                  <div
                    key={room.id}
                    className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
                  >
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white tracking-wide">
                          {room.name}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                            room.mode === 'PVP'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          }`}
                        >
                          {room.mode}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400">Host: {room.hostName}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Player Count */}
                      <span className="text-xs font-mono text-slate-300 tabular-nums">
                        {room.currentPlayers}/{room.maxPlayers}
                      </span>

                      {/* Ping */}
                      <span className="text-[11px] font-mono text-emerald-400 tabular-nums">
                        {room.ping}ms
                      </span>

                      {/* Join Button */}
                      <button
                        onClick={() => handleJoinRoom(room)}
                        disabled={isFull}
                        className={`py-1.5 px-3.5 rounded-lg font-bold text-xs uppercase tracking-wide transition-all cursor-pointer ${
                          isFull
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-red-700 hover:bg-red-600 text-white shadow-md shadow-red-950'
                        }`}
                      >
                        {isFull ? 'Full' : 'Join'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-slate-400 text-center mt-3 pt-3 border-t border-slate-800">
            Real-time peer synchronization active. Connect multiple browser windows to test multiplayer!
          </div>
        </div>
      </div>

      <div className="w-full h-2" />
    </div>
  );
};
