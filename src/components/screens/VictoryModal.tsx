import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, Trophy, Clock, Swords, ArrowRight, RotateCcw, Home } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface VictoryModalProps {
  stats: {
    time: number;
    enemiesDefeated: number;
    coinsCollected: number;
    stars: number;
  };
  onNextLevel: () => void;
  onReplay: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  onNextLevel,
  onReplay,
  onMainMenu,
}) => {
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#dc2626', '#38bdf8', '#facc15', '#ffffff'],
      });
    } catch {
      // Ignore
    }
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const xpEarned = 250 + stats.stars * 100;
  const coinsEarned = stats.coinsCollected + 150;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md z-40 select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 border-2 border-red-500/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Victory Ribbon & Header */}
        <div className="flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-500 flex items-center justify-center text-yellow-400 shadow-xl shadow-red-950/60">
            <Trophy size={32} />
          </div>
          <h2 className="text-2xl font-black font-cinzel text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-red-400 tracking-widest mt-1">
            MISSION COMPLETE
          </h2>
          <div className="text-xs font-semibold text-slate-400">
            The balance of Akarai is restored
          </div>
        </div>

        {/* 3 Stars */}
        <div className="flex items-center gap-2 my-1">
          {[1, 2, 3].map((starNum) => (
            <Star
              key={starNum}
              size={28}
              className={`${
                starNum <= stats.stars
                  ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_10px_#facc15]'
                  : 'text-slate-700'
              } transition-transform hover:scale-110`}
            />
          ))}
        </div>

        {/* Mission Stats Breakdown */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Clock size={14} className="text-sky-400" /> Clear Time
            </span>
            <span className="font-mono text-white font-bold">{formatTime(stats.time)}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Swords size={14} className="text-red-400" /> Enemies Defeated
            </span>
            <span className="font-mono text-white font-bold">{stats.enemiesDefeated}</span>
          </div>

          <div className="w-full h-px bg-slate-800 my-0.5" />

          <div className="flex items-center justify-between text-yellow-400 font-bold">
            <span>Coins Earned</span>
            <span className="font-mono tabular-nums">+{coinsEarned} Mon</span>
          </div>

          <div className="flex items-center justify-between text-sky-400 font-bold">
            <span>Experience Points</span>
            <span className="font-mono tabular-nums">+{xpEarned} XP</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 w-full mt-1">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onNextLevel();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-950 border border-red-500/40 transition-all cursor-pointer"
          >
            <span>Next Chapter</span>
            <ArrowRight size={14} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onReplay();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-98 transition-all cursor-pointer"
            >
              <RotateCcw size={13} />
              <span>Replay</span>
            </button>

            <button
              onClick={() => {
                soundManager.playSfx('button');
                onMainMenu();
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl font-semibold text-xs tracking-wide text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-98 transition-all cursor-pointer"
            >
              <Home size={13} />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
