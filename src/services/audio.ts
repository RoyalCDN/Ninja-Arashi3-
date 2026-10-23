import { GameSettings } from '../types/game';

class SoundManager {
  private ctx: AudioContext | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxGainNode: GainNode | null = null;
  private masterGainNode: GainNode | null = null;
  private currentTrack: string | null = null;
  private musicInterval: number | null = null;
  private initialized: boolean = false;
  private settings: GameSettings = {
    musicVolume: 0.7,
    sfxVolume: 0.8,
    muteAll: false,
    graphicsQuality: 'HIGH',
    screenShake: true,
    particleEffects: true,
    touchControlSize: 'NORMAL',
    hapticFeedback: true,
    language: 'EN',
  };

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const stored = localStorage.getItem('ninja_areahi_settings');
      if (stored) {
        this.settings = { ...this.settings, ...JSON.parse(stored) };
      }
    } catch {
      // Ignore
    }
  }

  public getSettings(): GameSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<GameSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem('ninja_areahi_settings', JSON.stringify(this.settings));
    } catch {
      // Ignore
    }
    this.applyVolumes();
  }

  public init() {
    if (this.initialized && this.ctx && this.ctx.state === 'running') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.masterGainNode = this.ctx.createGain();
        this.musicGainNode = this.ctx.createGain();
        this.sfxGainNode = this.ctx.createGain();

        this.musicGainNode.connect(this.masterGainNode);
        this.sfxGainNode.connect(this.masterGainNode);
        this.masterGainNode.connect(this.ctx.destination);
      }

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      this.applyVolumes();
      this.initialized = true;
    } catch {
      // Web Audio not supported or blocked
    }
  }

  private applyVolumes() {
    if (!this.masterGainNode || !this.musicGainNode || !this.sfxGainNode || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (this.settings.muteAll) {
      this.masterGainNode.gain.setValueAtTime(0, now);
    } else {
      this.masterGainNode.gain.setValueAtTime(1, now);
      this.musicGainNode.gain.setValueAtTime(this.settings.musicVolume * 0.45, now);
      this.sfxGainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.65, now);
    }
  }

  // --- Sound Effects ---

  public playSfx(type: 
    | 'button' 
    | 'sword_swing' 
    | 'sword_impact' 
    | 'shuriken_throw' 
    | 'shuriken_hit'
    | 'dash' 
    | 'jump' 
    | 'double_jump' 
    | 'land' 
    | 'coin' 
    | 'gem' 
    | 'hurt' 
    | 'enemy_defeat' 
    | 'boss_roar' 
    | 'checkpoint' 
    | 'victory' 
    | 'game_over' 
    | 'level_start'
    | 'join' 
    | 'leave'
  ) {
    if (!this.ctx || this.settings.muteAll || this.settings.sfxVolume <= 0) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    const t = this.ctx.currentTime;

    switch (type) {
      case 'button': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(780, t + 0.05);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.07);
        break;
      }
      case 'sword_swing': {
        // Filtered white noise swoosh with pitch drop
        const bufferSize = this.ctx.sampleRate * 0.15;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1400, t);
        filter.frequency.exponentialRampToValueAtTime(400, t + 0.14);
        filter.Q.value = 3;
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGainNode!);
        noise.start(t);
        break;
      }
      case 'sword_impact': {
        // Metallic clash + low thud
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc2.type = 'square';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.exponentialRampToValueAtTime(160, t + 0.12);
        osc2.frequency.setValueAtTime(1240, t);
        osc2.frequency.exponentialRampToValueAtTime(320, t + 0.1);
        gain.gain.setValueAtTime(0.6, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
        osc.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc2.start(t);
        osc.stop(t + 0.18);
        osc2.stop(t + 0.18);
        break;
      }
      case 'shuriken_throw': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1800, t);
        osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }
      case 'shuriken_hit': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1600, t);
        osc.frequency.exponentialRampToValueAtTime(400, t + 0.05);
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.07);
        break;
      }
      case 'dash': {
        const bufferSize = this.ctx.sampleRate * 0.2;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + 0.2);
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGainNode!);
        noise.start(t);
        break;
      }
      case 'jump': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.exponentialRampToValueAtTime(480, t + 0.12);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }
      case 'double_jump': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(360, t);
        osc.frequency.exponentialRampToValueAtTime(720, t + 0.12);
        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.13);
        break;
      }
      case 'land': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(120, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.08);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.09);
        break;
      }
      case 'coin': {
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(987.77, t); // B5
        osc1.frequency.setValueAtTime(1318.51, t + 0.06); // E6
        osc2.frequency.setValueAtTime(1975.53, t + 0.06); // B6
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc1.start(t);
        osc2.start(t + 0.06);
        osc1.stop(t + 0.22);
        osc2.stop(t + 0.22);
        break;
      }
      case 'gem': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1200, t);
        osc.frequency.exponentialRampToValueAtTime(2400, t + 0.15);
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.25);
        break;
      }
      case 'hurt': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, t);
        osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);
        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.2);
        break;
      }
      case 'enemy_defeat': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.25);
        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.27);
        break;
      }
      case 'boss_roar': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, t);
        osc.frequency.exponentialRampToValueAtTime(45, t + 0.6);
        gain.gain.setValueAtTime(0.7, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.7);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.75);
        break;
      }
      case 'checkpoint': {
        const freqs = [523.25, 659.25, 783.99, 1046.5];
        freqs.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, t + idx * 0.08);
          gain.gain.setValueAtTime(0.2, t + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGainNode!);
          osc.start(t + idx * 0.08);
          osc.stop(t + idx * 0.08 + 0.42);
        });
        break;
      }
      case 'victory': {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t + idx * 0.12);
          gain.gain.setValueAtTime(0.3, t + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.6);
          osc.connect(gain);
          gain.connect(this.sfxGainNode!);
          osc.start(t + idx * 0.12);
          osc.stop(t + idx * 0.12 + 0.62);
        });
        break;
      }
      case 'game_over': {
        const notes = [329.63, 311.13, 293.66, 220];
        notes.forEach((freq, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, t + idx * 0.2);
          gain.gain.setValueAtTime(0.35, t + idx * 0.2);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.2 + 0.5);
          osc.connect(gain);
          gain.connect(this.sfxGainNode!);
          osc.start(t + idx * 0.2);
          osc.stop(t + idx * 0.2 + 0.55);
        });
        break;
      }
      case 'join':
      case 'leave': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(type === 'join' ? 440 : 330, t);
        osc.frequency.exponentialRampToValueAtTime(type === 'join' ? 660 : 220, t + 0.1);
        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGainNode!);
        osc.start(t);
        osc.stop(t + 0.16);
        break;
      }
    }
  }

  // --- Background Ambient Music Synth ---

  public playMusic(track: 'menu' | 'shadow_forest' | 'frozen_temple' | 'lava_valley' | 'silent_cliffs' | 'boss') {
    if (this.currentTrack === track && this.musicInterval) return;
    this.stopMusic();
    this.init();
    this.currentTrack = track;
    if (!this.ctx || this.settings.muteAll || this.settings.musicVolume <= 0) return;

    // Japanese pentatonic / dark cinematic scales
    // Menu: Pentatonic koto & shamisen feel (A C D E G)
    // Shadow forest: D minor pentatonic (D F G A C)
    // Frozen temple: Aeolian icy glass bells (E G A B D)
    // Lava valley: Phrygian dark drive (D Eb G A Bb)
    // Boss: Fast taiko battle pulses
    let notePool: number[] = [220, 261.63, 293.66, 329.63, 392.0];
    let tempo = 120; // BPM
    let waveType: OscillatorType = 'triangle';

    if (track === 'shadow_forest') {
      notePool = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66];
      tempo = 90;
      waveType = 'sine';
    } else if (track === 'frozen_temple') {
      notePool = [164.81, 196.0, 246.94, 293.66, 329.63, 392.0];
      tempo = 85;
      waveType = 'sine';
    } else if (track === 'lava_valley') {
      notePool = [146.83, 155.56, 196.0, 220.0, 233.08, 293.66];
      tempo = 135;
      waveType = 'sawtooth';
    } else if (track === 'boss') {
      notePool = [110, 130.81, 146.83, 164.81, 174.61, 220];
      tempo = 150;
      waveType = 'sawtooth';
    }

    const intervalMs = (60 / tempo) * 1000 * 0.5; // Eighth notes
    let step = 0;

    // Background low drone oscillator
    const droneOsc = this.ctx.createOscillator();
    const droneGain = this.ctx.createGain();
    droneOsc.type = 'triangle';
    droneOsc.frequency.setValueAtTime(notePool[0] * 0.5, this.ctx.currentTime);
    droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    droneOsc.connect(droneGain);
    droneGain.connect(this.musicGainNode!);
    droneOsc.start();

    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.settings.muteAll || this.settings.musicVolume <= 0) return;
      if (this.ctx.state === 'suspended') return;
      const now = this.ctx.currentTime;

      // Melody note with probabilistic Japanese phrasing
      if (Math.random() > 0.25) {
        const noteIdx = Math.floor(Math.random() * notePool.length);
        const freq = notePool[noteIdx] * (Math.random() > 0.6 ? 2 : 1);
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = waveType;
        osc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(track === 'frozen_temple' ? 2400 : 1200, now);

        const dur = (intervalMs / 1000) * (Math.random() > 0.5 ? 2.5 : 1.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.musicGainNode!);
        osc.start(now);
        osc.stop(now + dur + 0.05);
      }

      // Rhythm / Taiko kick on beat
      if (step % 2 === 0 || track === 'boss' || track === 'lava_valley') {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(track === 'boss' ? 140 : 110, now);
        kickOsc.frequency.exponentialRampToValueAtTime(35, now + 0.15);
        kickGain.gain.setValueAtTime(track === 'boss' ? 0.25 : 0.15, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGainNode!);
        kickOsc.start(now);
        kickOsc.stop(now + 0.18);
      }

      step++;
    }, intervalMs);

    // Save drone oscillator clean-up reference
    (this as unknown as { _droneOsc?: OscillatorNode })._droneOsc = droneOsc;
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    const drone = (this as unknown as { _droneOsc?: OscillatorNode })._droneOsc;
    if (drone) {
      try {
        drone.stop();
        drone.disconnect();
      } catch {
        // Ignore
      }
      (this as unknown as { _droneOsc?: OscillatorNode })._droneOsc = undefined;
    }
    this.currentTrack = null;
  }
}

export const soundManager = new SoundManager();
