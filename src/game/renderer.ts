import {
  Checkpoint,
  Collectible,
  Enemy,
  FloatingText,
  LevelConfig,
  Particle,
  Platform,
  PlayerCharacter,
  Projectile,
  RemotePlayer,
} from '../types/game';

export interface Camera {
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
  shakeTime: number;
  shakeMagnitude: number;
}

export interface PlayerRenderState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: -1 | 1;
  state: 'idle' | 'run' | 'jump' | 'fall' | 'attack' | 'dash' | 'hurt' | 'dead';
  animTimer: number;
  comboStep: number;
  isDashing: boolean;
  scarfTrail: { x: number; y: number }[];
  invulnerableTimer: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public render(
    camera: Camera,
    level: LevelConfig,
    player: PlayerRenderState,
    character: PlayerCharacter,
    enemies: Enemy[],
    projectiles: Projectile[],
    particles: Particle[],
    floatingTexts: FloatingText[],
    remotePlayers: RemotePlayer[] = []
  ) {
    const ctx = this.ctx;
    const vw = camera.viewportWidth;
    const vh = camera.viewportHeight;

    // Apply Screen Shake
    ctx.save();
    if (camera.shakeTime > 0) {
      const sx = (Math.random() * 2 - 1) * camera.shakeMagnitude;
      const sy = (Math.random() * 2 - 1) * camera.shakeMagnitude;
      ctx.translate(sx, sy);
    }

    // 1. Sky & Celestial Moon (Parallax Layer 0)
    this.renderSkyAndMoon(camera, level, vw, vh);

    // 2. Far Mountain Silhouettes (Parallax Layer 1: factor 0.15)
    this.renderDistantMountains(camera, level, vw, vh);

    // 3. Midground Temples, Torii Gates & Ancient Pines (Parallax Layer 2: factor 0.4)
    this.renderMidgroundShrines(camera, level, vw, vh);

    // 4. Atmospheric Mist Overlay
    this.renderMist(camera, level, vw, vh);

    // World Space rendering (offset by camera)
    ctx.save();
    ctx.translate(-camera.x, -camera.y);

    // 5. Level Terrain & Platforms
    this.renderPlatforms(level.platforms, level.theme);

    // 6. Hazards & Spikes
    this.renderHazards(level.hazards, level.theme);

    // 7. Checkpoints & Finish Torii Portal
    this.renderCheckpointsAndGoal(level.checkpoints, level.goalPoint);

    // 8. Collectibles (Coins, Gems, Scrolls, Gourds)
    this.renderCollectibles(level.collectibles);

    // 9. Remote Online Players
    for (const remote of remotePlayers) {
      this.renderRemotePlayer(remote);
    }

    // 10. Enemies & Boss
    this.renderEnemies(enemies);

    // 11. Main Player Character
    this.renderPlayer(player, character);

    // 12. Projectiles (Shurikens, Shards, Waves)
    this.renderProjectiles(projectiles);

    // 13. Visual FX Particles
    this.renderParticles(particles);

    // 14. Floating Combat Damage Numbers
    this.renderFloatingTexts(floatingTexts);

    ctx.restore(); // Exit camera space
    ctx.restore(); // Exit screen shake
  }

  private renderSkyAndMoon(camera: Camera, level: LevelConfig, vw: number, vh: number) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, vh);
    grad.addColorStop(0, level.theme.skyTop);
    grad.addColorStop(1, level.theme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vw, vh);

    // Giant Glowing Moon
    const moonParallaxX = vw * 0.75 - camera.x * 0.03;
    const moonY = vh * 0.28;
    const moonRadius = Math.min(vw, vh) * 0.16;

    // Outer Moon Glow
    const glow = ctx.createRadialGradient(
      moonParallaxX,
      moonY,
      moonRadius * 0.4,
      moonParallaxX,
      moonY,
      moonRadius * 2.4
    );
    glow.addColorStop(0, level.theme.moonColor);
    glow.addColorStop(0.35, level.theme.moonColor + '44');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(moonParallaxX, moonY, moonRadius * 2.4, 0, Math.PI * 2);
    ctx.fill();

    // Solid Moon Disc with subtle crater shading
    ctx.fillStyle = level.theme.moonColor;
    ctx.beginPath();
    ctx.arc(moonParallaxX, moonY, moonRadius, 0, Math.PI * 2);
    ctx.fill();

    // Moon dark crater spots
    ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
    ctx.beginPath();
    ctx.arc(moonParallaxX - moonRadius * 0.25, moonY - moonRadius * 0.15, moonRadius * 0.35, 0, Math.PI * 2);
    ctx.arc(moonParallaxX + moonRadius * 0.3, moonY + moonRadius * 0.2, moonRadius * 0.25, 0, Math.PI * 2);
    ctx.arc(moonParallaxX - moonRadius * 0.1, moonY + moonRadius * 0.35, moonRadius * 0.18, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderDistantMountains(camera: Camera, level: LevelConfig, vw: number, vh: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#060a12';

    // Distant mountain ridge
    const offsetX = (camera.x * 0.1) % 800;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -offsetX; x <= vw + 800; x += 160) {
      const peakY = vh * 0.48 + Math.sin(x * 0.005) * (vh * 0.12) + Math.cos(x * 0.012) * (vh * 0.08);
      ctx.lineTo(x, peakY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderMidgroundShrines(camera: Camera, level: LevelConfig, vw: number, vh: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#090e19';

    // Closer mountain & forest silhouette
    const offsetX = (camera.x * 0.3) % 600;
    ctx.beginPath();
    ctx.moveTo(0, vh);
    for (let x = -offsetX; x <= vw + 600; x += 100) {
      const treeY = vh * 0.62 + Math.sin(x * 0.009) * 45;
      ctx.lineTo(x, treeY);
    }
    ctx.lineTo(vw, vh);
    ctx.closePath();
    ctx.fill();

    // Silhouetted Japanese Pagodas & Torii Gates in midground
    const pagodaSpacing = 900;
    const startIdx = Math.floor((camera.x * 0.3) / pagodaSpacing) - 1;
    const endIdx = startIdx + Math.ceil(vw / pagodaSpacing) + 2;

    for (let i = startIdx; i <= endIdx; i++) {
      const px = i * pagodaSpacing - camera.x * 0.3;
      const py = vh * 0.62;

      // Draw Pagoda silhouette
      ctx.fillStyle = '#070b14';
      // Multi-tier curved roof
      for (let t = 0; t < 3; t++) {
        const tierY = py - 40 - t * 30;
        const tierW = 70 - t * 14;
        ctx.beginPath();
        ctx.moveTo(px - tierW, tierY);
        ctx.quadraticCurveTo(px, tierY - 14, px + tierW, tierY);
        ctx.lineTo(px + tierW - 8, tierY + 12);
        ctx.lineTo(px - tierW + 8, tierY + 12);
        ctx.closePath();
        ctx.fill();

        // Tower body
        ctx.fillRect(px - (tierW - 16), tierY + 12, (tierW - 16) * 2, 18);
      }
      // Pagoda spire
      ctx.fillRect(px - 2, py - 145, 4, 20);

      // Torii Gate silhouette
      const toriiX = px + 380;
      const toriiY = vh * 0.64;
      ctx.fillRect(toriiX - 28, toriiY - 45, 6, 45); // Left post
      ctx.fillRect(toriiX + 22, toriiY - 45, 6, 45); // Right post
      // Top curved beam
      ctx.beginPath();
      ctx.moveTo(toriiX - 40, toriiY - 48);
      ctx.quadraticCurveTo(toriiX, toriiY - 55, toriiX + 40, toriiY - 48);
      ctx.lineTo(toriiX + 38, toriiY - 42);
      ctx.quadraticCurveTo(toriiX, toriiY - 49, toriiX - 38, toriiY - 42);
      ctx.closePath();
      ctx.fill();
      // Lower crossbar
      ctx.fillRect(toriiX - 32, toriiY - 36, 64, 5);
    }

    ctx.restore();
  }

  private renderMist(camera: Camera, level: LevelConfig, vw: number, vh: number) {
    const ctx = this.ctx;
    ctx.save();
    const grad = ctx.createLinearGradient(0, vh * 0.55, 0, vh);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(0.6, level.theme.mistColor);
    grad.addColorStop(1, 'rgba(5, 10, 20, 0.45)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, vh * 0.55, vw, vh * 0.45);
    ctx.restore();
  }

  private renderPlatforms(platforms: Platform[], theme: LevelConfig['theme']) {
    const ctx = this.ctx;

    for (const p of platforms) {
      if (p.type === 'one_way') {
        // Wooden beam platform
        ctx.fillStyle = '#1c1512';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Top edge glow
        ctx.fillStyle = theme.platformAccent;
        ctx.fillRect(p.x, p.y, p.width, 3);

        // Rope ties / notches
        ctx.fillStyle = '#b45309';
        ctx.fillRect(p.x + 6, p.y + 4, 6, p.height - 8);
        ctx.fillRect(p.x + p.width - 12, p.y + 4, 6, p.height - 8);
      } else if (p.type === 'ice') {
        // Crystalline ice slab
        const iceGrad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.height);
        iceGrad.addColorStop(0, '#7dd3fc');
        iceGrad.addColorStop(0.2, '#0284c7');
        iceGrad.addColorStop(1, '#082f49');
        ctx.fillStyle = iceGrad;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Frost sheen
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(p.x + 4, p.y + 2, p.width - 8, 3);
      } else {
        // Dark Obsidian / Rock platform
        ctx.fillStyle = theme.groundColor;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Accent top edge
        ctx.fillStyle = theme.platformAccent;
        ctx.fillRect(p.x, p.y, p.width, 4);

        // Subtle rock texture crevices
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 40; i < p.width; i += 80) {
          ctx.moveTo(p.x + i, p.y + 5);
          ctx.lineTo(p.x + i + 10, p.y + 25);
          ctx.lineTo(p.x + i - 4, p.y + 45);
        }
        ctx.stroke();
      }
    }
  }

  private renderHazards(hazards: LevelConfig['hazards'], theme: LevelConfig['theme']) {
    const ctx = this.ctx;
    for (const h of hazards) {
      if (theme.particleType === 'ember') {
        // Glowing Lava Pool
        const lavaGrad = ctx.createLinearGradient(h.x, h.y, h.x, h.y + h.height);
        lavaGrad.addColorStop(0, '#f97316');
        lavaGrad.addColorStop(0.4, '#ea580c');
        lavaGrad.addColorStop(1, '#7c2d12');
        ctx.fillStyle = lavaGrad;
        ctx.fillRect(h.x, h.y, h.width, h.height);

        // Lava surface glow
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(h.x, h.y, h.width, 4);
      } else {
        // Spikes / Dark Pit
        ctx.fillStyle = '#020617';
        ctx.fillRect(h.x, h.y, h.width, h.height);

        // Spikes
        ctx.fillStyle = '#94a3b8';
        const spikeW = 14;
        const count = Math.floor(h.width / spikeW);
        for (let i = 0; i < count; i++) {
          const sx = h.x + i * spikeW;
          ctx.beginPath();
          ctx.moveTo(sx, h.y + 12);
          ctx.lineTo(sx + spikeW / 2, h.y);
          ctx.lineTo(sx + spikeW, h.y + 12);
          ctx.closePath();
          ctx.fill();
        }
      }
    }
  }

  private renderCheckpointsAndGoal(checkpoints: Checkpoint[], goal: { x: number; y: number }) {
    const ctx = this.ctx;
    const now = Date.now() * 0.003;

    // Checkpoint dragon statues
    for (const cp of checkpoints) {
      ctx.save();
      ctx.translate(cp.x + cp.width / 2, cp.y + cp.height);

      // Stone pedestal
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-16, -12, 32, 12);

      // Dragon Obelisk
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(-10, -12);
      ctx.lineTo(-6, -cp.height + 15);
      ctx.lineTo(0, -cp.height);
      ctx.lineTo(6, -cp.height + 15);
      ctx.lineTo(10, -12);
      ctx.closePath();
      ctx.fill();

      // Checkpoint Orb
      const orbColor = cp.active ? '#38bdf8' : '#64748b';
      ctx.fillStyle = orbColor;
      if (cp.active) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 15;
      }
      ctx.beginPath();
      ctx.arc(0, -cp.height + 8, 7, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    // Sacred Torii Goal Portal
    ctx.save();
    ctx.translate(goal.x, goal.y);

    // Goal Portal Swirl
    const portalGrad = ctx.createRadialGradient(0, -50, 5, 0, -50, 60);
    portalGrad.addColorStop(0, 'rgba(56, 189, 248, 0.9)');
    portalGrad.addColorStop(0.5, 'rgba(225, 29, 72, 0.5)');
    portalGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(0, -50, 60, 0, Math.PI * 2);
    ctx.fill();

    // Torii Gate Frame
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-34, -100, 10, 100);
    ctx.fillRect(24, -100, 10, 100);

    // Top Beam
    ctx.beginPath();
    ctx.moveTo(-50, -112);
    ctx.quadraticCurveTo(0, -122, 50, -112);
    ctx.lineTo(46, -102);
    ctx.quadraticCurveTo(0, -114, -46, -102);
    ctx.closePath();
    ctx.fill();

    // Torii sign plate
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-12, -96, 24, 28);
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 10px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText('門', 0, -78);

    // Swirling runes / magic particles
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -50, 35 + Math.sin(now * 3) * 5, now, now + Math.PI * 1.4);
    ctx.stroke();

    ctx.restore();
  }

  private renderCollectibles(collectibles: Collectible[]) {
    const ctx = this.ctx;
    const now = Date.now() * 0.004;

    for (const c of collectibles) {
      if (c.collected) continue;
      const floatY = Math.sin(now + c.floatOffset) * 6;
      const cx = c.x + c.width / 2;
      const cy = c.y + c.height / 2 + floatY;

      ctx.save();
      ctx.translate(cx, cy);

      if (c.type === 'coin') {
        // Spinning Golden Shinobi Mon
        const scaleX = Math.abs(Math.cos(now * 2 + c.floatOffset));
        ctx.scale(Math.max(scaleX, 0.15), 1);

        ctx.fillStyle = '#eab308';
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.fill();

        // Inner square hole
        ctx.fillStyle = '#713f12';
        ctx.fillRect(-3, -3, 6, 6);
      } else if (c.type === 'gem') {
        // Celestial Jade / Ruby Gem
        ctx.fillStyle = '#ec4899';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(9, -2);
        ctx.lineTo(0, 12);
        ctx.lineTo(-9, -2);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(4, -2);
        ctx.lineTo(0, 2);
        ctx.lineTo(-4, -2);
        ctx.closePath();
        ctx.fill();
      } else if (c.type === 'health_gourd') {
        // Shinobi Healing Gourd
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, 4, 8, 0, Math.PI * 2);
        ctx.arc(0, -4, 5, 0, Math.PI * 2);
        ctx.fill();
        // Red tie string
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-6, -1, 12, 2);
      } else if (c.type === 'energy_scroll') {
        // Ancient Ninjutsu Scroll
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-10, -6, 20, 12);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(-7, -4, 14, 8);
      }

      ctx.restore();
    }
  }

  private renderPlayer(player: PlayerRenderState, character: PlayerCharacter) {
    const ctx = this.ctx;
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 20) % 2 === 0) {
      // Flashing invulnerability frames
      return;
    }

    const cx = player.x + player.width / 2;
    const cy = player.y + player.height;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(player.facing, 1);

    // 1. Dynamic Flowing Crimson Scarf (Multi-segment cloth simulation)
    if (player.scarfTrail && player.scarfTrail.length > 1) {
      ctx.save();
      ctx.scale(player.facing, 1); // unscale to world coordinates for scarf trail
      ctx.translate(-cx, -cy);

      ctx.strokeStyle = character.scarfColor;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < player.scarfTrail.length - 1; i++) {
        const seg = player.scarfTrail[i];
        const next = player.scarfTrail[i + 1];
        const width = Math.max(8 - i * 1.2, 2);
        ctx.lineWidth = width;
        ctx.beginPath();
        ctx.moveTo(seg.x, seg.y);
        ctx.lineTo(next.x, next.y);
        ctx.stroke();
      }
      ctx.restore();
    }

    // 2. Dash Phantom Trail / Glow
    if (player.isDashing) {
      ctx.shadowColor = character.glowColor;
      ctx.shadowBlur = 20;
    }

    // 3. Ninja Body Silhouette
    // Legs
    const animPhase = player.animTimer * 12;
    let legOffset1 = 0;
    let legOffset2 = 0;
    if (player.state === 'run') {
      legOffset1 = Math.sin(animPhase) * 12;
      legOffset2 = -Math.sin(animPhase) * 12;
    } else if (player.state === 'jump' || player.state === 'fall') {
      legOffset1 = -8;
      legOffset2 = 6;
    }

    ctx.fillStyle = character.silhouetteColor;

    // Back leg
    ctx.beginPath();
    ctx.moveTo(4, -24);
    ctx.lineTo(4 + legOffset2, 0);
    ctx.lineTo(8 + legOffset2, 0);
    ctx.lineTo(8, -24);
    ctx.closePath();
    ctx.fill();

    // Front leg
    ctx.beginPath();
    ctx.moveTo(-6, -24);
    ctx.lineTo(-6 + legOffset1, 0);
    ctx.lineTo(-2 + legOffset1, 0);
    ctx.lineTo(-2, -24);
    ctx.closePath();
    ctx.fill();

    // Torso & Dark Armor plates
    ctx.beginPath();
    ctx.moveTo(-10, -42);
    ctx.lineTo(10, -42);
    ctx.lineTo(8, -24);
    ctx.lineTo(-8, -24);
    ctx.closePath();
    ctx.fill();

    // Armor sash / belt
    ctx.fillStyle = character.scarfColor;
    ctx.fillRect(-8, -27, 16, 4);

    // Ninja Masked Head & Sugegasa Hat / Hood
    ctx.fillStyle = character.silhouetteColor;
    ctx.beginPath();
    ctx.arc(0, -48, 10, 0, Math.PI * 2);
    ctx.fill();

    // Ninja Glowing Eye Slit
    ctx.fillStyle = character.glowColor;
    ctx.shadowColor = character.glowColor;
    ctx.shadowBlur = 8;
    ctx.fillRect(2, -50, 6, 2.5);
    ctx.shadowBlur = 0;

    // Headband knot
    ctx.fillStyle = character.scarfColor;
    ctx.fillRect(-6, -52, 12, 3);

    // 4. Arms & Katana Blade
    if (player.state === 'attack') {
      // Katana Slash Arc Animation
      const swingProg = Math.min(player.animTimer / 0.18, 1);
      const angle = -Math.PI * 0.4 + swingProg * Math.PI * 1.1;

      // Arm
      ctx.fillStyle = character.silhouetteColor;
      ctx.beginPath();
      ctx.arc(4, -36, 4, 0, Math.PI * 2);
      ctx.fill();

      // Blade Hilt & Katana
      ctx.save();
      ctx.translate(4, -36);
      ctx.rotate(angle);

      // Katana Blade
      ctx.fillStyle = '#e2e8f0';
      ctx.shadowColor = character.glowColor;
      ctx.shadowBlur = 14;
      ctx.fillRect(0, -3, 38, 4);

      // Blade Edge Glow
      ctx.fillStyle = character.glowColor;
      ctx.fillRect(0, -4, 38, 1.5);

      ctx.restore();

      // Curved slashing wave arc
      ctx.save();
      ctx.strokeStyle = character.glowColor;
      ctx.lineWidth = 4;
      ctx.shadowColor = character.glowColor;
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(0, -32, 42, -Math.PI * 0.3, Math.PI * 0.4);
      ctx.stroke();
      ctx.restore();
    } else {
      // Sheathed / Held Katana at hip
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-14, -34, 4, 28);
      // Sword handle
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(-15, -42, 6, 8);
    }

    ctx.restore();
  }

  private renderRemotePlayer(player: RemotePlayer) {
    const ctx = this.ctx;
    const cx = player.x;
    const cy = player.y;

    ctx.save();
    ctx.translate(cx, cy);

    // Remote Player Nametag above head
    ctx.fillStyle = '#38bdf8';
    ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 4;
    ctx.fillText(player.username, 0, -65);

    // Small remote health bar
    ctx.fillStyle = '#334155';
    ctx.fillRect(-18, -60, 36, 4);
    ctx.fillStyle = '#22c55e';
    const hpPct = Math.max(0, player.hp / player.maxHp);
    ctx.fillRect(-18, -60, 36 * hpPct, 4);

    // Silhouette body
    ctx.scale(player.facing, 1);
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, -46, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-6, -38, 12, 20);
    ctx.fillRect(-6, -18, 5, 18);
    ctx.fillRect(1, -18, 5, 18);

    // Glowing cyan visor
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(1, -48, 5, 2);

    ctx.restore();
  }

  private renderEnemies(enemies: Enemy[]) {
    const ctx = this.ctx;

    for (const e of enemies) {
      if (e.state === 'dead' && e.deathTimer <= 0) continue;

      ctx.save();
      const cx = e.x + e.width / 2;
      const cy = e.y + e.height;
      ctx.translate(cx, cy);
      ctx.scale(e.facing, 1);

      // Death Dissolve effect
      if (e.state === 'dead') {
        ctx.globalAlpha = Math.max(0, e.deathTimer / 0.5);
      }

      if (e.type === 'boss') {
        // AKUMA BOSS — Giant Demonic Shadow Core Sovereign
        ctx.fillStyle = '#0b0410';
        ctx.shadowColor = '#dc2626';
        ctx.shadowBlur = 24;

        // Giant horned silhouette
        ctx.beginPath();
        ctx.arc(0, -75, 18, 0, Math.PI * 2);
        ctx.fill();

        // Demonic Horns
        ctx.beginPath();
        ctx.moveTo(-12, -85);
        ctx.lineTo(-24, -105);
        ctx.lineTo(-8, -88);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(12, -85);
        ctx.lineTo(24, -105);
        ctx.lineTo(8, -88);
        ctx.fill();

        // Fiery Red Eyes
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-8, -78, 5, 3);
        ctx.fillRect(4, -78, 5, 3);

        // Armored Torso
        ctx.fillStyle = '#170624';
        ctx.fillRect(-22, -60, 44, 40);

        // Dark Cape / Energy Wings
        ctx.fillStyle = '#2e0847';
        ctx.beginPath();
        ctx.moveTo(-22, -60);
        ctx.lineTo(-44, -15);
        ctx.lineTo(-12, -20);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(22, -60);
        ctx.lineTo(44, -15);
        ctx.lineTo(12, -20);
        ctx.closePath();
        ctx.fill();

        // Massive Broadsword
        if (e.state === 'attack') {
          ctx.fillStyle = '#ef4444';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 20;
          ctx.fillRect(18, -90, 8, 90);
        }
      } else if (e.type === 'lava_brute') {
        // Volcanic Golem
        ctx.fillStyle = '#1c0a0a';
        ctx.fillRect(-20, -55, 40, 55);
        // Glowing magma cracks
        ctx.fillStyle = '#f97316';
        ctx.shadowColor = '#ea580c';
        ctx.shadowBlur = 8;
        ctx.fillRect(-12, -45, 24, 4);
        ctx.fillRect(-15, -30, 30, 4);
        ctx.fillRect(-8, -15, 16, 4);
        // Molten eyes
        ctx.fillRect(-10, -50, 6, 4);
        ctx.fillRect(4, -50, 6, 4);
      } else if (e.type === 'frost_warrior') {
        // Frost Armor Warrior with Ice Spear
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(0, -48, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-14, -38, 28, 26);
        ctx.fillRect(-12, -12, 10, 12);
        ctx.fillRect(2, -12, 10, 12);

        // Icy blue helmet visor
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-4, -50, 10, 3);

        // Ice Spear
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(16, -65, 3, 65);
      } else {
        // Shadow Scout
        ctx.fillStyle = '#090d16';
        ctx.beginPath();
        ctx.arc(0, -44, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(-10, -36, 20, 22);
        ctx.fillRect(-8, -14, 6, 14);
        ctx.fillRect(2, -14, 6, 14);

        // Red menacing visor
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(2, -46, 5, 2.5);

        // Dual daggers
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(10, -28, 12, 3);
        ctx.fillRect(-18, -28, 12, 3);
      }

      // Overhead Enemy HP Bar (Except Boss, which has full HUD bar)
      if (e.type !== 'boss' && e.hp < e.maxHp && e.state !== 'dead') {
        ctx.scale(e.facing, 1); // Unflip for HP bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(-16, -e.height - 14, 32, 4);
        ctx.fillStyle = '#ef4444';
        const pct = Math.max(0, e.hp / e.maxHp);
        ctx.fillRect(-16, -e.height - 14, 32 * pct, 4);
      }

      ctx.restore();
    }
  }

  private renderProjectiles(projectiles: Projectile[]) {
    const ctx = this.ctx;
    const now = Date.now() * 0.015;

    for (const p of projectiles) {
      ctx.save();
      ctx.translate(p.x + p.width / 2, p.y + p.height / 2);

      if (p.type === 'shuriken') {
        // Fast Spinning 4-pointed Shuriken
        ctx.rotate(now * 3);
        ctx.fillStyle = '#e2e8f0';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;

        // 4 points
        for (let i = 0; i < 4; i++) {
          ctx.rotate(Math.PI / 2);
          ctx.beginPath();
          ctx.moveTo(0, -10);
          ctx.lineTo(4, -2);
          ctx.lineTo(0, 0);
          ctx.lineTo(-4, -2);
          ctx.closePath();
          ctx.fill();
        }
      } else if (p.type === 'ice_shard') {
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#bae6fd';
        ctx.shadowBlur = 8;
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
      } else if (p.type === 'fireball') {
        ctx.fillStyle = '#ea580c';
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, p.width / 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'shadow_wave') {
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 5;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(0, 0, 24, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;

    for (const p of particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;

      if (p.shape === 'leaf') {
        // Japanese Autumn Maple Leaf
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'spark') {
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'smoke') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  private renderFloatingTexts(texts: FloatingText[]) {
    const ctx = this.ctx;

    for (const t of texts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
      ctx.fillStyle = t.color;
      ctx.font = 'bold 15px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}
