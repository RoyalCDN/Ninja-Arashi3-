import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/GameEngine';
import { GameMode, LevelConfig, PlayerCharacter, RemotePlayer } from '../types/game';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { multiplayerService } from '../services/multiplayer';

interface GameCanvasProps {
  level: LevelConfig;
  character: PlayerCharacter;
  mode: GameMode;
  controlSize?: 'NORMAL' | 'LARGE';
  onPause: () => void;
  onVictory: (stats: { time: number; enemiesDefeated: number; coinsCollected: number; stars: number }) => void;
  onGameOver: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  character,
  mode,
  controlSize = 'NORMAL',
  onPause,
  onVictory,
  onGameOver,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // HUD local states to prevent canvas re-renders
  const [hp, setHp] = useState(character.hp);
  const [maxHp, setMaxHp] = useState(character.maxHp);
  const [energy, setEnergy] = useState(character.energy);
  const [maxEnergy, setMaxEnergy] = useState(character.maxEnergy);
  const [coins, setCoins] = useState(0);
  const [timer, setTimer] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bossHp, setBossHp] = useState<{ hp: number; maxHp: number; name: string } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas, level, character, mode, {
      onHpChange: (newHp, newMaxHp) => {
        setHp(newHp);
        setMaxHp(newMaxHp);
      },
      onEnergyChange: (newEnergy, newMaxEnergy) => {
        setEnergy(newEnergy);
        setMaxEnergy(newMaxEnergy);
      },
      onCoinsChange: (newCoins) => setCoins(newCoins),
      onComboChange: (newCombo) => setCombo(newCombo),
      onTimerChange: (newTimer) => setTimer(newTimer),
      onBossHpChange: (bossCurrentHp, bossMax, bossName) => {
        setBossHp({ hp: bossCurrentHp, maxHp: bossMax, name: bossName });
      },
      onVictory: (stats) => onVictory(stats),
      onGameOver: () => onGameOver(),
      onRemoteBroadcast: (state) => {
        multiplayerService.broadcastPlayerState(state);
      },
    });

    engineRef.current = engine;
    engine.start();

    // Listen to remote players in multiplayer
    const unsubMultiplayer = multiplayerService.subscribe(({ event, payload }) => {
      if (event === 'remote_player_update') {
        engine.updateRemotePlayer(payload as RemotePlayer);
      } else if (event === 'player_left') {
        const { id } = payload as { id: string };
        engine.removeRemotePlayer(id);
      }
    });

    // Handle window resize
    const handleResize = () => {
      engine.resizeCanvas();
    };
    window.addEventListener('resize', handleResize);

    // Keyboard controls for desktop testing
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') engine.setInput('left', true);
      if (key === 'd' || key === 'arrowright') engine.setInput('right', true);
      if (key === 'w' || key === 'arrowup' || key === ' ') engine.setInput('jump', true);
      if (key === 's' || key === 'arrowdown') engine.setInput('down', true);
      if (key === 'j' || key === 'z') engine.setInput('attack', true);
      if (key === 'k' || key === 'x') engine.setInput('shuriken', true);
      if (key === 'l' || key === 'c' || e.shiftKey) engine.setInput('special', true);
      if (e.key === 'Escape') onPause();
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') engine.setInput('left', false);
      if (key === 'd' || key === 'arrowright') engine.setInput('right', false);
      if (key === 'w' || key === 'arrowup' || key === ' ') engine.setInput('jump', false);
      if (key === 's' || key === 'arrowdown') engine.setInput('down', false);
      if (key === 'j' || key === 'z') engine.setInput('attack', false);
      if (key === 'k' || key === 'x') engine.setInput('shuriken', false);
      if (key === 'l' || key === 'c') engine.setInput('special', false);
    };

    const handleBlur = () => {
      engine.setInput('left', false);
      engine.setInput('right', false);
      engine.setInput('jump', false);
      engine.setInput('attack', false);
      engine.setInput('shuriken', false);
      engine.setInput('special', false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      unsubMultiplayer();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      engine.stop();
      engineRef.current = null;
    };
  }, [level, character, mode, onGameOver, onPause, onVictory]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Low-occlusion HUD */}
      <HUD
        character={character}
        hp={hp}
        maxHp={maxHp}
        energy={energy}
        maxEnergy={maxEnergy}
        coins={coins}
        timer={timer}
        combo={combo}
        bossHp={bossHp}
        onPause={onPause}
      />

      {/* Mobile Touch Controls */}
      <TouchControls engine={engineRef.current} controlSize={controlSize} />
    </div>
  );
};
