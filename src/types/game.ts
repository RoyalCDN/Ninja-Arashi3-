export type GameScreen =
  | 'WELCOME'
  | 'LOGIN'
  | 'REGISTER'
  | 'VERIFY_EMAIL'
  | 'FORGOT_PASSWORD'
  | 'MAIN_MENU'
  | 'PROFILE'
  | 'SETTINGS'
  | 'MAP_SELECT'
  | 'CHARACTER_SELECT'
  | 'INVENTORY'
  | 'MULTIPLAYER_LOBBY'
  | 'PLAYING'
  | 'PAUSED'
  | 'VICTORY'
  | 'GAME_OVER';

export type GameMode = 'STORY' | 'COOP' | 'PVP' | 'TRAINING';

export type MapId = 'shadow_forest' | 'frozen_temple' | 'lava_valley' | 'silent_cliffs';

export interface PlayerCharacter {
  id: string;
  name: string;
  title: string;
  description: string;
  silhouetteColor: string;
  scarfColor: string;
  glowColor: string;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  speed: number;
  jumpForce: number;
  attackPower: number;
  defense: number;
  hasDoubleJump: boolean;
  specialSkillName: string;
  specialSkillDesc: string;
  unlocked: boolean;
  unlockCostCoins: number;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  nextLevelXp: number;
  coins: number;
  gems: number;
  victories: number;
  missionsCompleted: number;
  achievementsUnlocked: number;
  joinedDate: string;
  isGuest: boolean;
  isEmailVerified: boolean;
  selectedCharacterId: string;
  unlockedMaps: MapId[];
  unlockedCharacters: string[];
  equippedWeapon: string;
  equippedShuriken: string;
  equippedCharm: string;
  recentActivity: {
    id: string;
    text: string;
    timeAgo: string;
    icon: 'trophy' | 'map' | 'xp' | 'sword';
  }[];
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muteAll: boolean;
  graphicsQuality: 'LOW' | 'MEDIUM' | 'HIGH';
  screenShake: boolean;
  particleEffects: boolean;
  touchControlSize: 'NORMAL' | 'LARGE';
  hapticFeedback: boolean;
  language: 'EN' | 'JA' | 'ES';
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Platform extends Rect {
  type: 'solid' | 'one_way' | 'hazard' | 'ice' | 'bouncy';
  moving?: {
    axis: 'x' | 'y';
    range: number;
    speed: number;
    startPos: number;
  };
}

export interface Collectible {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'coin' | 'gem' | 'health_gourd' | 'energy_scroll';
  value: number;
  collected: boolean;
  floatOffset: number;
}

export interface Checkpoint {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  active: boolean;
}

export interface Enemy {
  id: string;
  name: string;
  type: 'shadow_scout' | 'frost_warrior' | 'lava_brute' | 'silent_assassin' | 'boss';
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  hp: number;
  maxHp: number;
  attackPower: number;
  state: 'idle' | 'patrol' | 'alert' | 'attack' | 'hurt' | 'dead';
  facing: -1 | 1;
  patrolMinX: number;
  patrolMaxX: number;
  attackCooldown: number;
  attackRange: number;
  stateTimer: number;
  isGrounded: boolean;
  deathTimer: number;
  bossPhase?: number;
}

export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  source: 'player' | 'enemy' | 'remote_player';
  damage: number;
  life: number;
  maxLife: number;
  type: 'shuriken' | 'ice_shard' | 'fireball' | 'shadow_wave';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape: 'circle' | 'leaf' | 'spark' | 'smoke' | 'slash';
  rotation: number;
  vRot: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
}

export interface RemotePlayer {
  id: string;
  username: string;
  characterId: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: -1 | 1;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'dash' | 'hurt' | 'dead';
  hp: number;
  maxHp: number;
  ping: number;
  lastUpdate: number;
}

export interface MultiplayerRoom {
  id: string;
  name: string;
  hostId: string;
  hostName: string;
  mode: GameMode;
  mapId: MapId;
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

export interface LevelConfig {
  id: MapId;
  title: string;
  subtitle: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Nightmare';
  theme: {
    skyTop: string;
    skyBottom: string;
    moonColor: string;
    mistColor: string;
    groundColor: string;
    platformAccent: string;
    particleType: 'leaf' | 'snow' | 'ember' | 'wind';
  };
  worldWidth: number;
  worldHeight: number;
  spawnPoint: { x: number; y: number };
  goalPoint: { x: number; y: number };
  platforms: Platform[];
  collectibles: Collectible[];
  checkpoints: Checkpoint[];
  enemies: Enemy[];
  hazards: Rect[];
  boss?: {
    name: string;
    title: string;
    maxHp: number;
  };
  objectives: string[];
}
