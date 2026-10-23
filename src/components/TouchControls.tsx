import React, { useCallback } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap, Sparkles, Swords, Disc } from 'lucide-react';
import { GameEngine } from '../game/GameEngine';

interface TouchControlsProps {
  engine: GameEngine | null;
  controlSize?: 'NORMAL' | 'LARGE';
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine, controlSize = 'NORMAL' }) => {
  const isLarge = controlSize === 'LARGE';
  const btnSize = isLarge ? 'w-16 h-16 text-lg' : 'w-13 h-13 text-base';
  const mainBtnSize = isLarge ? 'w-20 h-20' : 'w-16 h-16';

  const handleTouch = useCallback(
    (key: 'left' | 'right' | 'jump' | 'attack' | 'shuriken' | 'special', pressed: boolean) => {
      if (!engine) return;
      engine.setInput(key, pressed);
    },
    [engine]
  );

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-10 flex flex-col justify-end p-4 md:p-8">
      <div className="flex items-end justify-between w-full">
        {/* Left Directional Controls (D-Pad Left & Right) */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {/* Left Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouch('left', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouch('left', false);
            }}
            onPointerLeave={() => handleTouch('left', false)}
            onContextMenu={(e) => e.preventDefault()}
            className={`${btnSize} rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-red-950/80 border-2 border-slate-700/80 active:border-red-500 text-slate-200 flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-xs`}
            aria-label="Move Left"
          >
            <ArrowLeft size={isLarge ? 26 : 22} />
          </button>

          {/* Right Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouch('right', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouch('right', false);
            }}
            onPointerLeave={() => handleTouch('right', false)}
            onContextMenu={(e) => e.preventDefault()}
            className={`${btnSize} rounded-full bg-slate-900/80 hover:bg-slate-800/90 active:bg-red-950/80 border-2 border-slate-700/80 active:border-red-500 text-slate-200 flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-xs`}
            aria-label="Move Right"
          >
            <ArrowRight size={isLarge ? 26 : 22} />
          </button>
        </div>

        {/* Right Action Buttons Cluster */}
        <div className="flex items-end gap-3 pointer-events-auto">
          {/* Sub actions column: Shuriken and Dash */}
          <div className="flex flex-col gap-3">
            {/* Shuriken Throw */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleTouch('shuriken', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleTouch('shuriken', false);
              }}
              onPointerLeave={() => handleTouch('shuriken', false)}
              onContextMenu={(e) => e.preventDefault()}
              className={`${btnSize} rounded-full bg-slate-900/85 hover:bg-slate-800 active:bg-sky-950 border-2 border-sky-600/60 active:border-sky-400 text-sky-400 flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-xs`}
              title="Shuriken (K)"
            >
              <Disc size={isLarge ? 22 : 18} />
            </button>

            {/* Shadow Dash / Special */}
            <button
              onPointerDown={(e) => {
                e.preventDefault();
                handleTouch('special', true);
              }}
              onPointerUp={(e) => {
                e.preventDefault();
                handleTouch('special', false);
              }}
              onPointerLeave={() => handleTouch('special', false)}
              onContextMenu={(e) => e.preventDefault()}
              className={`${btnSize} rounded-full bg-slate-900/85 hover:bg-slate-800 active:bg-purple-950 border-2 border-purple-600/60 active:border-purple-400 text-purple-400 flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-xs`}
              title="Special Ninjutsu (L)"
            >
              <Sparkles size={isLarge ? 22 : 18} />
            </button>
          </div>

          {/* Jump Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouch('jump', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouch('jump', false);
            }}
            onPointerLeave={() => handleTouch('jump', false)}
            onContextMenu={(e) => e.preventDefault()}
            className={`${btnSize} rounded-full bg-slate-900/85 hover:bg-slate-800 active:bg-emerald-950 border-2 border-emerald-600/60 active:border-emerald-400 text-emerald-400 flex items-center justify-center shadow-xl active:scale-95 transition-all cursor-pointer backdrop-blur-xs`}
            title="Jump (Space / W)"
          >
            <ArrowUp size={isLarge ? 26 : 22} />
          </button>

          {/* Primary Katana Slash Attack Button (Prominent & Large) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              handleTouch('attack', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              handleTouch('attack', false);
            }}
            onPointerLeave={() => handleTouch('attack', false)}
            onContextMenu={(e) => e.preventDefault()}
            className={`${mainBtnSize} rounded-full bg-gradient-to-tr from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:from-red-800 active:to-rose-700 border-2 border-red-400/80 text-white flex items-center justify-center shadow-2xl shadow-red-900/80 active:scale-90 transition-all cursor-pointer`}
            title="Katana Strike (J)"
          >
            <Swords size={isLarge ? 32 : 26} className="text-white drop-shadow" />
          </button>
        </div>
      </div>
    </div>
  );
};
