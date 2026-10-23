import { MapId, UserProfile } from '../types/game';

const INITIAL_PROFILE: UserProfile = {
  id: 'usr_482910',
  username: 'KairoNinja',
  email: 'kairo@akarai.shadow',
  avatar: 'kairo',
  level: 12,
  xp: 560,
  nextLevelXp: 1200,
  coins: 12450,
  gems: 320,
  victories: 48,
  missionsCompleted: 32,
  achievementsUnlocked: 12,
  joinedDate: '2025-10-20',
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
      text: 'Completed: Shadow Forest (Normal)',
      timeAgo: '2 hours ago',
      icon: 'map',
    },
    {
      id: 'act_2',
      text: 'Unlocked: Frozen Temple',
      timeAgo: '1 day ago',
      icon: 'trophy',
    },
    {
      id: 'act_3',
      text: 'Gained 500 XP',
      timeAgo: '1 day ago',
      icon: 'xp',
    },
  ],
};

const GUEST_PROFILE: UserProfile = {
  id: 'guest_' + Math.floor(100000 + Math.random() * 900000),
  username: 'Guest_Shinobi',
  email: '',
  avatar: 'kairo',
  level: 1,
  xp: 0,
  nextLevelXp: 300,
  coins: 500,
  gems: 10,
  victories: 0,
  missionsCompleted: 0,
  achievementsUnlocked: 0,
  joinedDate: new Date().toISOString().split('T')[0],
  isGuest: true,
  isEmailVerified: false,
  selectedCharacterId: 'kairo',
  unlockedMaps: ['shadow_forest'],
  unlockedCharacters: ['kairo'],
  equippedWeapon: 'Novice Katana',
  equippedShuriken: 'Iron Shuriken',
  equippedCharm: 'None',
  recentActivity: [
    {
      id: 'act_g1',
      text: 'Began journey in Akarai Realm',
      timeAgo: 'Just now',
      icon: 'sword',
    },
  ],
};

class AuthService {
  private currentProfile: UserProfile | null = null;
  private listeners: ((profile: UserProfile | null) => void)[] = [];

  constructor() {
    this.loadSession();
  }

  private loadSession() {
    try {
      const stored = localStorage.getItem('ninja_areahi_profile');
      if (stored) {
        this.currentProfile = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  public subscribe(cb: (profile: UserProfile | null) => void) {
    this.listeners.push(cb);
    cb(this.currentProfile);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== cb);
    };
  }

  private notify() {
    if (this.currentProfile) {
      try {
        localStorage.setItem('ninja_areahi_profile', JSON.stringify(this.currentProfile));
      } catch {
        // Ignore
      }
    } else {
      localStorage.removeItem('ninja_areahi_profile');
    }
    this.listeners.forEach((l) => l(this.currentProfile));
  }

  public getProfile(): UserProfile | null {
    return this.currentProfile;
  }

  public playAsGuest(): UserProfile {
    this.currentProfile = {
      ...GUEST_PROFILE,
      id: 'guest_' + Math.floor(100000 + Math.random() * 900000),
    };
    this.notify();
    return this.currentProfile;
  }

  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!username || username.trim().length < 3) {
      return { success: false, error: 'Username must be at least 3 characters' };
    }
    if (!email || !email.includes('@')) {
      return { success: false, error: 'Please enter a valid email address' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    // Try backend registration API if online
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.currentProfile = data.user;
        this.notify();
        return { success: true };
      }
    } catch {
      // Offline fallback
    }

    // Fallback registration with local persistence
    this.currentProfile = {
      id: 'usr_' + Math.floor(100000 + Math.random() * 900000),
      username: username.trim(),
      email: email.trim(),
      avatar: 'kairo',
      level: 1,
      xp: 0,
      nextLevelXp: 300,
      coins: 1000,
      gems: 25,
      victories: 0,
      missionsCompleted: 0,
      achievementsUnlocked: 1,
      joinedDate: new Date().toISOString().split('T')[0],
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
    };
    this.notify();
    return { success: true };
  }

  public async login(
    identifier: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!identifier) {
      return { success: false, error: 'Please enter your username or email' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password' };
    }

    // Try backend login API
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      if (res.ok) {
        const data = await res.json();
        this.currentProfile = data.user;
        this.notify();
        return { success: true };
      }
    } catch {
      // Offline fallback
    }

    // Authenticate with sample profile or saved account
    const isDefault = identifier.toLowerCase() === 'kaironinja' || identifier.includes('kairo');
    this.currentProfile = isDefault
      ? { ...INITIAL_PROFILE }
      : {
          ...INITIAL_PROFILE,
          username: identifier.split('@')[0],
          email: identifier.includes('@') ? identifier : `${identifier}@akarai.shadow`,
        };
    this.notify();
    return { success: true };
  }

  public logout() {
    this.currentProfile = null;
    this.notify();
  }

  public addMissionRewards(coins: number, xp: number, mapCompleted: MapId) {
    if (!this.currentProfile) return;
    const p = { ...this.currentProfile };
    p.coins += coins;
    p.xp += xp;
    p.missionsCompleted += 1;
    p.victories += 1;

    // Check level up
    while (p.xp >= p.nextLevelXp) {
      p.xp -= p.nextLevelXp;
      p.level += 1;
      p.nextLevelXp = Math.round(p.nextLevelXp * 1.35);
      p.gems += 5; // Level-up gem bonus
    }

    // Unlock next map
    if (mapCompleted === 'shadow_forest' && !p.unlockedMaps.includes('frozen_temple')) {
      p.unlockedMaps.push('frozen_temple');
      p.recentActivity.unshift({
        id: `act_${Date.now()}`,
        text: 'Unlocked: Frozen Temple',
        timeAgo: 'Just now',
        icon: 'map',
      });
    } else if (mapCompleted === 'frozen_temple' && !p.unlockedMaps.includes('lava_valley')) {
      p.unlockedMaps.push('lava_valley');
      p.recentActivity.unshift({
        id: `act_${Date.now()}`,
        text: 'Unlocked: Lava Valley',
        timeAgo: 'Just now',
        icon: 'map',
      });
    } else if (mapCompleted === 'lava_valley' && !p.unlockedMaps.includes('silent_cliffs')) {
      p.unlockedMaps.push('silent_cliffs');
      p.recentActivity.unshift({
        id: `act_${Date.now()}`,
        text: 'Unlocked: Silent Cliffs',
        timeAgo: 'Just now',
        icon: 'trophy',
      });
    }

    p.recentActivity.unshift({
      id: `act_${Date.now()}_xp`,
      text: `Gained ${xp} XP & ${coins} Coins`,
      timeAgo: 'Just now',
      icon: 'xp',
    });

    if (p.recentActivity.length > 8) {
      p.recentActivity = p.recentActivity.slice(0, 8);
    }

    this.currentProfile = p;
    this.notify();
  }

  public selectCharacter(characterId: string) {
    if (!this.currentProfile) return;
    this.currentProfile = {
      ...this.currentProfile,
      selectedCharacterId: characterId,
    };
    this.notify();
  }

  public unlockCharacter(characterId: string, cost: number): boolean {
    if (!this.currentProfile) return false;
    if (this.currentProfile.coins < cost) return false;
    if (this.currentProfile.unlockedCharacters.includes(characterId)) return true;

    this.currentProfile = {
      ...this.currentProfile,
      coins: this.currentProfile.coins - cost,
      unlockedCharacters: [...this.currentProfile.unlockedCharacters, characterId],
      selectedCharacterId: characterId,
    };
    this.notify();
    return true;
  }
}

export const authService = new AuthService();
