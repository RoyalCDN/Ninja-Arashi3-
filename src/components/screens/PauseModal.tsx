import React from 'react';
import { Play, RotateCcw, Settings, Home } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onSettings: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onSettings,
  onMainMenu,
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-40 select-none">
      <div className="relative w-full max-w-xs bg-slate-900/95 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
        <h2 className="text-2xl font-black font-cinzel text-white tracking-widest uppercase">
          Game Paused
        </h2>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          {/* Resume */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onResume();
            }}
            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer"
          >
            <Play size={16} fill="white" />
            <span>Resume (Esc)</span>
          </button>

          {/* Restart */}
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

          {/* Settings */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onSettings();
            }}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 active:scale-98 transition-all cursor-pointer"
          >
            <Settings size={14} />
            <span>Audio & Controls</span>
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
