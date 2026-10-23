import React from 'react';
import { Pause, Swords, Shield, Flame, Sparkles } from 'lucide-react';
import { PlayerCharacter } from '../types/game';

interface HUDProps {
  character: PlayerCharacter;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  timer: number;
  combo: number;
  bossHp?: {
    hp: number;
    maxHp: number;
    name: string;
  } | null;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  character,
  hp,
  maxHp,
  energy,
  maxEnergy,
  coins,
  timer,
  combo,
  bossHp,
  onPause,
}) => {
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100));
  const energyPercent = Math.max(0, Math.min(100, (energy / maxEnergy) * 100));

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-3 md:p-6 flex flex-col justify-between select-none">
      {/* Top Status Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Player Profile & Health/Energy Bars */}
        <div className="flex items-center gap-3">
          {/* Avatar frame */}
          <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-red-600/80 bg-slate-950 flex items-center justify-center shadow-lg shadow-red-950/40 overflow-hidden shrink-0">
            <div
              className="w-full h-full flex items-center justify-center font-bold text-xs"
              style={{ backgroundColor: character.silhouetteColor }}
            >
              <span className="text-red-400 font-serif tracking-wider">影</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[10px] font-bold text-white px-1.5 py-0.2 rounded-full border border-slate-900">
              Lv.12
            </div>
          </div>

          {/* Name & Meters */}
          <div className="flex flex-col gap-1 w-36 sm:w-48 md:w-56">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="tracking-wide flex items-center gap-1">
                {character.name}
                <span className="text-[10px] text-slate-400 font-normal">({character.title})</span>
              </span>
              <span className="text-[10px] tabular-nums font-mono text-slate-400">
                {Math.round(hp)}/{maxHp}
              </span>
            </div>

            {/* HP Bar */}
            <div className="h-3 md:h-3.5 bg-slate-950/80 border border-slate-800 rounded-sm overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-700 via-red-500 to-rose-400 rounded-sm transition-all duration-150 ease-out shadow-sm shadow-red-500/50"
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Energy Bar */}
            <div className="h-2 md:h-2.5 bg-slate-950/80 border border-slate-800 rounded-sm overflow-hidden p-0.5 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 via-sky-400 to-blue-300 rounded-sm transition-all duration-150 ease-out shadow-sm shadow-cyan-400/50"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Mission Timer & Coins */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 px-4 py-1.5 rounded-lg shadow-md backdrop-blur-xs">
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono tabular-nums text-slate-300">
            <span className="text-slate-400">TIME</span>
            <span className="font-bold text-white">{formatTime(timer)}</span>
          </div>
          <div className="w-px h-4 bg-slate-800" />
          <div className="flex items-center gap-1.5 text-xs md:text-sm font-mono tabular-nums text-yellow-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400/80" />
            <span>{coins.toLocaleString()}</span>
            <span className="text-[10px] text-yellow-500 font-normal">MON</span>
          </div>
        </div>

        {/* Right: Pause Button */}
        <button
          onClick={onPause}
          className="pointer-events-auto p-2.5 md:p-3 bg-slate-950/80 hover:bg-red-950/60 border border-slate-800 hover:border-red-600/60 text-slate-300 hover:text-white rounded-lg transition-all duration-150 cursor-pointer active:scale-95 shadow-lg"
          title="Pause Game (Esc)"
        >
          <Pause size={18} />
        </button>
      </div>

      {/* Center: Combo Counter notification */}
      {combo > 1 && (
        <div className="self-center flex flex-col items-center animate-bounce">
          <div className="text-xl md:text-2xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-500 drop-shadow-md">
            {combo} HITS COMBO!
          </div>
        </div>
      )}

      {/* Boss Health Bar (if active) */}
      {bossHp && bossHp.hp > 0 && (
        <div className="self-center w-full max-w-xl flex flex-col items-center gap-1 bg-slate-950/85 border border-red-900/60 p-3 rounded-xl shadow-2xl backdrop-blur-xs mb-16">
          <div className="flex items-center justify-between w-full text-xs font-bold text-red-400 tracking-wide">
            <span className="flex items-center gap-1.5">
              <Flame size={14} className="text-red-500 animate-pulse" />
              {bossHp.name}
            </span>
            <span className="font-mono tabular-nums text-slate-300">
              {Math.max(0, Math.round(bossHp.hp))} / {bossHp.maxHp}
            </span>
          </div>
          <div className="w-full h-3.5 bg-slate-900 border border-slate-800 rounded-sm overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-red-900 via-red-600 to-rose-500 rounded-sm transition-all duration-100 ease-out shadow-md shadow-red-600/50"
              style={{ width: `${Math.max(0, (bossHp.hp / bossHp.maxHp) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
