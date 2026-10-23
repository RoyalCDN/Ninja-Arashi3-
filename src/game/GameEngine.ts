import { soundManager } from '../services/audio';
import {
  Enemy,
  FloatingText,
  GameMode,
  LevelConfig,
  Particle,
  PlayerCharacter,
  Projectile,
  RemotePlayer,
} from '../types/game';
import { checkAABB, resolveEntityPlatformCollisions, updateMovingPlatforms } from './physics';
import { Camera, GameRenderer, PlayerRenderState } from './renderer';

export interface GameEngineCallbacks {
  onHpChange: (hp: number, maxHp: number) => void;
  onEnergyChange: (energy: number, maxEnergy: number) => void;
  onCoinsChange: (coins: number) => void;
  onComboChange: (combo: number) => void;
  onTimerChange: (seconds: number) => void;
  onBossHpChange?: (hp: number, maxHp: number, name: string) => void;
  onVictory: (stats: { time: number; enemiesDefeated: number; coinsCollected: number; stars: number }) => void;
  onGameOver: () => void;
  onRemoteBroadcast?: (state: Partial<RemotePlayer>) => void;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private renderer: GameRenderer;
  private callbacks: GameEngineCallbacks;

  // Level & Game State
  private level: LevelConfig;
  private character: PlayerCharacter;
  public mode: GameMode;
  private running: boolean = false;
  private paused: boolean = false;
  private lastTime: number = 0;
  private animFrameId: number | null = null;
  private levelTimer: number = 0;
  private enemiesDefeated: number = 0;
  private coinsCollected: number = 0;
  private comboCount: number = 0;
  private comboResetTimer: number = 0;
  private hitstopTimer: number = 0;

  // Player Entity
  private player = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    width: 34,
    height: 52,
    facing: 1 as -1 | 1,
    isGrounded: false,
    isOnIce: false,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    state: 'idle' as PlayerRenderState['state'],
    animTimer: 0,
    comboStep: 0,
    isDashing: false,
    dashTimer: 0,
    attackTimer: 0,
    shurikenCooldown: 0,
    specialCooldown: 0,
    invulnerableTimer: 0,
    jumpCount: 0,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    lastCheckpoint: { x: 0, y: 0 },
    scarfTrail: [] as { x: number; y: number }[],
  };

  // World collections
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private particles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];
  private remotePlayers: Map<string, RemotePlayer> = new Map();

  // Camera
  private camera: Camera = {
    x: 0,
    y: 0,
    viewportWidth: 800,
    viewportHeight: 450,
    shakeTime: 0,
    shakeMagnitude: 0,
  };

  // Inputs
  private input = {
    left: false,
    right: false,
    jump: false,
    attack: false,
    shuriken: false,
    special: false,
    down: false,
  };

  constructor(
    canvas: HTMLCanvasElement,
    level: LevelConfig,
    character: PlayerCharacter,
    mode: GameMode,
    callbacks: GameEngineCallbacks
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.renderer = new GameRenderer(this.ctx);
    this.level = JSON.parse(JSON.stringify(level)); // Deep clone level data
    this.character = { ...character };
    this.mode = mode;
    this.callbacks = callbacks;

    this.resetPlayer();
    this.initScarf();
    this.resizeCanvas();
  }

  private resetPlayer() {
    this.player.x = this.level.spawnPoint.x;
    this.player.y = this.level.spawnPoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.hp = this.character.hp;
    this.player.maxHp = this.character.maxHp;
    this.player.energy = this.character.energy;
    this.player.maxEnergy = this.character.maxEnergy;
    this.player.facing = 1;
    this.player.lastCheckpoint = { ...this.level.spawnPoint };
    this.player.state = 'idle';

    this.enemies = JSON.parse(JSON.stringify(this.level.enemies));
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.levelTimer = 0;
    this.enemiesDefeated = 0;
    this.coinsCollected = 0;

    this.callbacks.onHpChange(this.player.hp, this.player.maxHp);
    this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
    this.callbacks.onCoinsChange(0);
    this.callbacks.onComboChange(0);
  }

  private initScarf() {
    this.player.scarfTrail = [];
    for (let i = 0; i < 7; i++) {
      this.player.scarfTrail.push({
        x: this.player.x + 12 - i * 4,
        y: this.player.y + 14,
      });
    }
  }

  public resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.camera.viewportWidth = rect.width;
    this.camera.viewportHeight = rect.height;
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.paused = false;
    this.lastTime = performance.now();
    soundManager.playMusic(this.level.id === 'silent_cliffs' ? 'boss' : this.level.id);
    this.loop(this.lastTime);
  }

  public pause() {
    this.paused = true;
  }

  public resume() {
    if (!this.running) return;
    this.paused = false;
    this.lastTime = performance.now();
  }

  public stop() {
    this.running = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    soundManager.stopMusic();
  }

  // --- Input Handlers ---

  public setInput(key: keyof typeof this.input, value: boolean) {
    if (key === 'jump' && value && !this.input.jump) {
      this.player.jumpBufferTimer = 0.14; // Input buffering
    }
    if (key === 'attack' && value && !this.input.attack) {
      this.triggerAttack();
    }
    if (key === 'shuriken' && value && !this.input.shuriken) {
      this.triggerShuriken();
    }
    if (key === 'special' && value && !this.input.special) {
      this.triggerSpecial();
    }
    this.input[key] = value;
  }

  private triggerAttack() {
    if (this.player.attackTimer > 0 || this.player.state === 'dead') return;
    this.player.attackTimer = 0.22;
    this.player.state = 'attack';
    this.player.animTimer = 0;
    this.player.comboStep = (this.player.comboStep % 3) + 1;
    soundManager.playSfx('sword_swing');

    // Katana Slash Hitbox check in front of player
    const slashRange = 75;
    const slashRect = {
      x: this.player.facing === 1 ? this.player.x + this.player.width : this.player.x - slashRange,
      y: this.player.y - 10,
      width: slashRange,
      height: this.player.height + 20,
    };

    let hitAny = false;

    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      if (checkAABB(slashRect, enemy)) {
        hitAny = true;
        const damage = Math.round(this.character.attackPower * (1 + this.player.comboStep * 0.15));
        enemy.hp -= damage;
        enemy.vx = this.player.facing * 180; // Knockback
        enemy.state = enemy.hp <= 0 ? 'dead' : 'hurt';
        enemy.stateTimer = 0.2;

        soundManager.playSfx('sword_impact');
        this.triggerHitstop(0.04);
        this.triggerScreenShake(0.18, 5);

        // Spawn Bloodless Dark Spark & Hit Particles
        this.spawnSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8, this.character.glowColor);

        // Floating Damage Number
        this.spawnFloatingText(enemy.x + enemy.width / 2, enemy.y, `-${damage}`, '#f87171');

        if (enemy.hp <= 0) {
          enemy.deathTimer = 0.5;
          this.enemiesDefeated++;
          soundManager.playSfx('enemy_defeat');
          this.spawnSparks(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 16, '#c084fc');

          // Drop reward coins
          this.coinsCollected += enemy.type === 'boss' ? 500 : 40;
          this.callbacks.onCoinsChange(this.coinsCollected);

          if (enemy.type === 'boss') {
            soundManager.playSfx('victory');
            setTimeout(() => this.completeLevel(), 1200);
          }
        }
      }
    }

    if (hitAny) {
      this.comboCount++;
      this.comboResetTimer = 2.5;
      this.callbacks.onComboChange(this.comboCount);
    }
  }

  private triggerShuriken() {
    if (this.player.shurikenCooldown > 0 || this.player.energy < 15 || this.player.state === 'dead') return;
    this.player.shurikenCooldown = 0.35;
    this.player.energy = Math.max(0, this.player.energy - 15);
    this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
    soundManager.playSfx('shuriken_throw');

    const px = this.player.facing === 1 ? this.player.x + this.player.width + 5 : this.player.x - 20;
    const py = this.player.y + 18;

    this.projectiles.push({
      id: `p_${Date.now()}_${Math.random()}`,
      x: px,
      y: py,
      vx: this.player.facing * 600,
      vy: 0,
      width: 14,
      height: 14,
      source: 'player',
      damage: Math.round(this.character.attackPower * 0.8),
      life: 1.2,
      maxLife: 1.2,
      type: 'shuriken',
    });
  }

  private triggerSpecial() {
    if (this.player.specialCooldown > 0 || this.player.energy < 35 || this.player.state === 'dead') return;
    this.player.specialCooldown = 1.2;
    this.player.energy = Math.max(0, this.player.energy - 35);
    this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
    soundManager.playSfx('dash');

    if (this.character.id === 'ayame') {
      // Moon Priestess Eclipse Burst: heal + wave
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 30);
      this.callbacks.onHpChange(this.player.hp, this.player.maxHp);
      this.spawnFloatingText(this.player.x + 10, this.player.y - 15, '+30 HP', '#4ade80');
      this.triggerScreenShake(0.3, 7);

      // Radial damage wave
      for (const e of this.enemies) {
        if (e.state === 'dead') continue;
        const dist = Math.abs(e.x - this.player.x);
        if (dist < 320) {
          e.hp -= 40;
          this.spawnFloatingText(e.x, e.y, '-40', '#c084fc');
          if (e.hp <= 0) e.state = 'dead';
        }
      }
    } else {
      // Kairo / Ren: Shadow Phantom Dash
      this.player.isDashing = true;
      this.player.dashTimer = 0.24;
      this.player.invulnerableTimer = 0.35;
      this.player.vx = this.player.facing * 850;
      this.player.vy = 0;
      this.spawnSparks(this.player.x, this.player.y + 20, 14, this.character.glowColor);
    }
  }

  // --- Main Loop ---

  private loop = (currentTime: number) => {
    if (!this.running) return;

    let dt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    dt = Math.min(dt, 0.05); // Clamp dt to prevent tunneling

    if (!this.paused) {
      if (this.hitstopTimer > 0) {
        this.hitstopTimer -= dt;
      } else {
        this.update(dt);
      }
    }

    this.render();
    this.animFrameId = requestAnimationFrame(this.loop);
  };

  private update(dt: number) {
    this.levelTimer += dt;
    this.callbacks.onTimerChange(Math.floor(this.levelTimer));

    // Passive energy regeneration
    if (this.player.energy < this.player.maxEnergy) {
      this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + 14 * dt);
      this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
    }

    // Cooldown timers
    if (this.player.shurikenCooldown > 0) this.player.shurikenCooldown -= dt;
    if (this.player.specialCooldown > 0) this.player.specialCooldown -= dt;
    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer -= dt;
    if (this.player.jumpBufferTimer > 0) this.player.jumpBufferTimer -= dt;
    if (this.player.coyoteTimer > 0) this.player.coyoteTimer -= dt;

    // Combo timer
    if (this.comboResetTimer > 0) {
      this.comboResetTimer -= dt;
      if (this.comboResetTimer <= 0) {
        this.comboCount = 0;
        this.callbacks.onComboChange(0);
      }
    }

    // Camera shake
    if (this.camera.shakeTime > 0) {
      this.camera.shakeTime -= dt;
    }

    // Update moving platforms
    updateMovingPlatforms(this.level.platforms, dt);

    // Update Player Movement & State
    this.updatePlayer(dt);

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Enemies & Boss
    this.updateEnemies(dt);

    // Update Checkpoints & Goal
    this.updateCheckpointsAndGoal();

    // Update Collectibles
    this.updateCollectibles();

    // Update Particles & Floating Texts
    this.updateFX(dt);

    // Update Scarf Cloth Simulation
    this.updateScarf();

    // Update Camera Position
    this.updateCamera(dt);

    // Broadcast state for multiplayer
    if (this.callbacks.onRemoteBroadcast) {
      this.callbacks.onRemoteBroadcast({
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        facing: this.player.facing,
        state: this.player.state,
        hp: this.player.hp,
        maxHp: this.player.maxHp,
      });
    }
  }

  private updatePlayer(dt: number) {
    const p = this.player;
    if (p.state === 'dead') return;

    // Dash logic
    if (p.isDashing) {
      p.dashTimer -= dt;
      p.vx = p.facing * 800;
      p.vy = 0;
      if (p.dashTimer <= 0) {
        p.isDashing = false;
        p.state = p.isGrounded ? 'idle' : 'fall';
      }
    } else {
      // Horizontal Run Input
      const moveSpeed = this.character.speed;
      const accel = p.isOnIce ? 900 : 2400;
      const decel = p.isOnIce ? 400 : 2600;

      if (this.input.left) {
        p.vx = Math.max(p.vx - accel * dt, -moveSpeed);
        p.facing = -1;
      } else if (this.input.right) {
        p.vx = Math.min(p.vx + accel * dt, moveSpeed);
        p.facing = 1;
      } else {
        if (p.vx > 0) {
          p.vx = Math.max(0, p.vx - decel * dt);
        } else if (p.vx < 0) {
          p.vx = Math.min(0, p.vx + decel * dt);
        }
      }

      // Gravity
      const gravity = 1400;
      p.vy += gravity * dt;

      // Jump Handling (Coyote time & Jump buffer)
      if (p.isGrounded) {
        p.coyoteTimer = 0.12;
        p.jumpCount = 0;
      }

      const wantsJump = this.input.jump || p.jumpBufferTimer > 0;

      if (wantsJump) {
        if (p.coyoteTimer > 0 || (this.character.hasDoubleJump && p.jumpCount < 2)) {
          p.vy = -this.character.jumpForce;
          p.jumpCount++;
          p.coyoteTimer = 0;
          p.jumpBufferTimer = 0;
          p.isGrounded = false;
          soundManager.playSfx(p.jumpCount > 1 ? 'double_jump' : 'jump');
          this.spawnSparks(p.x + p.width / 2, p.y + p.height, 6, '#e2e8f0');
        }
      }

      // Variable jump height: cut jump short if button released early
      if (!this.input.jump && p.vy < -180) {
        p.vy *= 0.65;
      }
    }

    // Attack timer handling
    if (p.attackTimer > 0) {
      p.attackTimer -= dt;
      p.animTimer += dt;
      if (p.attackTimer <= 0 && p.state === 'attack') {
        p.state = p.isGrounded ? (Math.abs(p.vx) > 20 ? 'run' : 'idle') : 'fall';
      }
    }

    // Collisions with platforms
    const wasGrounded = p.isGrounded;
    resolveEntityPlatformCollisions(p, this.level.platforms, dt, this.input.down);

    if (!wasGrounded && p.isGrounded) {
      soundManager.playSfx('land');
      this.spawnSparks(p.x + p.width / 2, p.y + p.height, 4, '#cbd5e1');
    }

    // Set animation state
    if (p.attackTimer <= 0 && !p.isDashing) {
      if (!p.isGrounded) {
        p.state = p.vy < 0 ? 'jump' : 'fall';
      } else if (Math.abs(p.vx) > 20) {
        p.state = 'run';
        p.animTimer += dt;
      } else {
        p.state = 'idle';
        p.animTimer += dt;
      }
    }

    // Hazard Collisions (Spikes / Falling into Abyss)
    for (const haz of this.level.hazards) {
      if (checkAABB(p, haz)) {
        this.playerHit(35, true);
        break;
      }
    }

    // Bottom of the world check
    if (p.y > this.level.worldHeight + 50) {
      this.playerHit(35, true);
    }
  }

  private playerHit(damage: number, forceRespawn: boolean = false) {
    if (this.player.invulnerableTimer > 0 || this.player.state === 'dead') return;
    this.player.hp = Math.max(0, this.player.hp - damage);
    this.callbacks.onHpChange(this.player.hp, this.player.maxHp);
    this.player.invulnerableTimer = 1.0;
    soundManager.playSfx('hurt');
    this.triggerScreenShake(0.25, 8);
    this.spawnFloatingText(this.player.x + 10, this.player.y - 10, `-${damage}`, '#ef4444');

    if (this.player.hp <= 0) {
      this.player.state = 'dead';
      soundManager.playSfx('game_over');
      setTimeout(() => this.callbacks.onGameOver(), 1000);
      return;
    }

    if (forceRespawn) {
      this.player.x = this.player.lastCheckpoint.x;
      this.player.y = this.player.lastCheckpoint.y;
      this.player.vx = 0;
      this.player.vy = 0;
    }
  }

  public respawnAtCheckpoint() {
    this.player.hp = Math.round(this.player.maxHp * 0.7);
    this.player.energy = this.player.maxEnergy;
    this.player.state = 'idle';
    this.player.x = this.player.lastCheckpoint.x;
    this.player.y = this.player.lastCheckpoint.y;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invulnerableTimer = 1.5;
    this.callbacks.onHpChange(this.player.hp, this.player.maxHp);
    this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
  }

  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Projectile collision with solid platforms
      let hitSolid = false;
      for (const plat of this.level.platforms) {
        if (plat.type === 'solid' && checkAABB(p, plat)) {
          hitSolid = true;
          soundManager.playSfx('shuriken_hit');
          this.spawnSparks(p.x, p.y, 4, '#94a3b8');
          break;
        }
      }

      if (hitSolid || p.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with enemies (if player projectile)
      if (p.source === 'player') {
        for (const enemy of this.enemies) {
          if (enemy.state === 'dead') continue;
          if (checkAABB(p, enemy)) {
            enemy.hp -= p.damage;
            enemy.state = enemy.hp <= 0 ? 'dead' : 'hurt';
            enemy.stateTimer = 0.2;
            soundManager.playSfx('shuriken_hit');
            this.spawnSparks(p.x, p.y, 6, '#38bdf8');
            this.spawnFloatingText(enemy.x + 10, enemy.y, `-${p.damage}`, '#38bdf8');

            if (enemy.hp <= 0) {
              enemy.deathTimer = 0.5;
              this.enemiesDefeated++;
              soundManager.playSfx('enemy_defeat');
              this.coinsCollected += 40;
              this.callbacks.onCoinsChange(this.coinsCollected);
            }

            this.projectiles.splice(i, 1);
            break;
          }
        }
      }
    }
  }

  private updateEnemies(dt: number) {
    for (const e of this.enemies) {
      if (e.state === 'dead') {
        if (e.deathTimer > 0) e.deathTimer -= dt;
        continue;
      }

      // Boss special health bar callback
      if (e.type === 'boss' && this.callbacks.onBossHpChange) {
        this.callbacks.onBossHpChange(e.hp, e.maxHp, e.name);
      }

      // Patrol & Aggro AI
      const distToPlayer = Math.hypot(
        e.x + e.width / 2 - (this.player.x + this.player.width / 2),
        e.y + e.height / 2 - (this.player.y + this.player.height / 2)
      );

      if (e.attackCooldown > 0) e.attackCooldown -= dt;

      if (distToPlayer < 260 && Math.abs(e.y - this.player.y) < 100) {
        // Aggro on player
        e.facing = this.player.x > e.x ? 1 : -1;

        if (distToPlayer < e.attackRange) {
          if (e.attackCooldown <= 0) {
            e.state = 'attack';
            e.attackCooldown = e.type === 'boss' ? 1.4 : 1.8;
            e.stateTimer = 0.35;

            // Deal damage if player is within range
            if (this.player.invulnerableTimer <= 0) {
              this.playerHit(e.attackPower);
            }
          }
        } else {
          // Chase player
          e.state = 'patrol';
          const speed = e.type === 'silent_assassin' ? 160 : e.type === 'boss' ? 90 : 80;
          e.vx = e.facing * speed;
        }
      } else {
        // Standard patrol
        e.state = 'patrol';
        const patrolSpeed = 70;
        e.vx = e.facing * patrolSpeed;
        if (e.x > e.patrolMaxX) {
          e.x = e.patrolMaxX;
          e.facing = -1;
        } else if (e.x < e.patrolMinX) {
          e.x = e.patrolMinX;
          e.facing = 1;
        }
      }

      // Gravity & collisions for enemy
      e.vy += 1200 * dt;
      resolveEntityPlatformCollisions(e, this.level.platforms, dt);
    }
  }

  private updateCheckpointsAndGoal() {
    // Checkpoints
    for (const cp of this.level.checkpoints) {
      if (!cp.active && checkAABB(this.player, cp)) {
        cp.active = true;
        this.player.lastCheckpoint = { x: cp.x, y: cp.y - 10 };
        soundManager.playSfx('checkpoint');
        this.spawnFloatingText(cp.x + 15, cp.y - 20, 'Checkpoint Activated!', '#38bdf8');
        this.spawnSparks(cp.x + 20, cp.y + 20, 16, '#38bdf8');
      }
    }

    // Sacred Torii Goal
    const goalRect = {
      x: this.level.goalPoint.x - 20,
      y: this.level.goalPoint.y - 80,
      width: 40,
      height: 90,
    };
    if (checkAABB(this.player, goalRect)) {
      this.completeLevel();
    }
  }

  private updateCollectibles() {
    for (const c of this.level.collectibles) {
      if (c.collected) continue;
      if (checkAABB(this.player, c)) {
        c.collected = true;

        if (c.type === 'coin') {
          soundManager.playSfx('coin');
          this.coinsCollected += c.value;
          this.callbacks.onCoinsChange(this.coinsCollected);
          this.spawnFloatingText(c.x, c.y - 10, `+${c.value} Mon`, '#facc15');
        } else if (c.type === 'gem') {
          soundManager.playSfx('gem');
          this.spawnFloatingText(c.x, c.y - 10, `+${c.value} Gem`, '#ec4899');
        } else if (c.type === 'health_gourd') {
          soundManager.playSfx('coin');
          this.player.hp = Math.min(this.player.maxHp, this.player.hp + c.value);
          this.callbacks.onHpChange(this.player.hp, this.player.maxHp);
          this.spawnFloatingText(c.x, c.y - 10, `+${c.value} HP`, '#4ade80');
        } else if (c.type === 'energy_scroll') {
          soundManager.playSfx('gem');
          this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + c.value);
          this.callbacks.onEnergyChange(this.player.energy, this.player.maxEnergy);
          this.spawnFloatingText(c.x, c.y - 10, `+${c.value} Ninjutsu`, '#38bdf8');
        }
      }
    }
  }

  private updateFX(dt: number) {
    // Atmospheric ambient particles (falling leaves/snow/embers)
    if (Math.random() < 0.4) {
      const pType = this.level.theme.particleType;
      this.particles.push({
        x: this.camera.x + Math.random() * this.camera.viewportWidth,
        y: this.camera.y - 10,
        vx: (Math.random() - 0.5) * 60 + (pType === 'wind' ? 120 : 0),
        vy: pType === 'ember' ? -40 - Math.random() * 40 : 50 + Math.random() * 70,
        size: Math.random() * 4 + 2,
        color:
          pType === 'leaf'
            ? '#ef4444'
            : pType === 'snow'
            ? '#bae6fd'
            : pType === 'ember'
            ? '#f97316'
            : '#c084fc',
        alpha: 0.8,
        life: 5,
        maxLife: 5,
        shape: pType === 'leaf' ? 'leaf' : pType === 'ember' ? 'spark' : 'circle',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 4,
      });
    }

    // Update particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vRot * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update floating texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  private updateScarf() {
    const headX = this.player.x + (this.player.facing === 1 ? 10 : 24);
    const headY = this.player.y + 16;
    if (this.player.scarfTrail.length > 0) {
      this.player.scarfTrail[0].x = headX;
      this.player.scarfTrail[0].y = headY;

      for (let i = 1; i < this.player.scarfTrail.length; i++) {
        const prev = this.player.scarfTrail[i - 1];
        const cur = this.player.scarfTrail[i];
        const dx = prev.x - cur.x;
        const dy = prev.y - cur.y;
        cur.x += dx * 0.45 - this.player.vx * 0.015;
        cur.y += dy * 0.45 + 1.2; // slight gravity sag
      }
    }
  }

  private updateCamera(dt: number) {
    const targetX = this.player.x + this.player.width / 2 - this.camera.viewportWidth * 0.38;
    const targetY = this.player.y + this.player.height / 2 - this.camera.viewportHeight * 0.55;

    // Smooth Lerp
    this.camera.x += (targetX - this.camera.x) * 6 * dt;
    this.camera.y += (targetY - this.camera.y) * 4 * dt;

    // Clamp camera within world bounds
    this.camera.x = Math.max(0, Math.min(this.camera.x, this.level.worldWidth - this.camera.viewportWidth));
    this.camera.y = Math.max(0, Math.min(this.camera.y, this.level.worldHeight - this.camera.viewportHeight));
  }

  private render() {
    this.renderer.render(
      this.camera,
      this.level,
      {
        x: this.player.x,
        y: this.player.y,
        vx: this.player.vx,
        vy: this.player.vy,
        width: this.player.width,
        height: this.player.height,
        facing: this.player.facing,
        state: this.player.state,
        animTimer: this.player.animTimer,
        comboStep: this.player.comboStep,
        isDashing: this.player.isDashing,
        scarfTrail: this.player.scarfTrail,
        invulnerableTimer: this.player.invulnerableTimer,
      },
      this.character,
      this.enemies,
      this.projectiles,
      this.particles,
      this.floatingTexts,
      Array.from(this.remotePlayers.values())
    );
  }

  private triggerScreenShake(duration: number, magnitude: number) {
    this.camera.shakeTime = duration;
    this.camera.shakeMagnitude = magnitude;
  }

  private triggerHitstop(duration: number) {
    this.hitstopTimer = duration;
  }

  private spawnSparks(x: number, y: number, count: number, color: string) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 180 + 60;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 2,
        color,
        alpha: 1,
        life: 0.35 + Math.random() * 0.25,
        maxLife: 0.5,
        shape: 'spark',
        rotation: 0,
        vRot: 0,
      });
    }
  }

  private spawnFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      id: `ft_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 0.8,
      maxLife: 0.8,
      vy: -60,
    });
  }

  private completeLevel() {
    this.running = false;
    soundManager.playSfx('victory');

    // Calculate stars: 1 star for clear, 2 stars if <= 90s, 3 stars if all enemies defeated
    let stars = 1;
    if (this.levelTimer <= 120) stars++;
    if (this.enemiesDefeated >= 3) stars++;

    this.callbacks.onVictory({
      time: Math.floor(this.levelTimer),
      enemiesDefeated: this.enemiesDefeated,
      coinsCollected: this.coinsCollected,
      stars,
    });
  }

  // --- Multiplayer Remote Player Management ---

  public updateRemotePlayer(remote: RemotePlayer) {
    this.remotePlayers.set(remote.id, remote);
  }

  public removeRemotePlayer(id: string) {
    this.remotePlayers.delete(id);
  }
}
