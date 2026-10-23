import React from 'react';
import { Skull, RotateCcw, Home, Sparkles } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface GameOverModalProps {
  onReviveAtCheckpoint: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onReviveAtCheckpoint,
  onRestart,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md z-40 select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-red-900/80 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        {/* Skull Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/80 border-2 border-red-700 flex items-center justify-center text-red-500 shadow-xl shadow-red-950/60 animate-pulse">
          <Skull size={32} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black font-cinzel text-red-500 tracking-widest">
            FALLEN IN BATTLE
          </h2>
          <p className="text-xs text-slate-400">
            Your shadow soul has dissipated, but the warrior spirit remains unyielding.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          {/* Revive at Checkpoint */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onReviveAtCheckpoint();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-sky-700 to-cyan-600 hover:from-sky-600 hover:to-cyan-500 active:scale-98 shadow-xl shadow-sky-950 border border-sky-500/40 transition-all cursor-pointer"
          >
            <Sparkles size={15} />
            <span>Revive at Checkpoint</span>
          </button>

          {/* Restart Mission */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onRestart();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw size={14} />
            <span>Restart Mission</span>
          </button>

          {/* Main Menu */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onMainMenu();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 active:scale-98 transition-all cursor-pointer"
          >
            <Home size={14} />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
