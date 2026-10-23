import React from 'react';
import { soundManager } from '../../services/audio';

interface WelcomeScreenProps {
  onCreateAccount: () => void;
  onLogin: () => void;
  onPlayAsGuest: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onCreateAccount,
  onLogin,
  onPlayAsGuest,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-slate-950 overflow-hidden select-none">
      {/* Background Japanese Dark Fantasy Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sky gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#09152b] to-[#04060c]" />

        {/* Full Moon with Glow */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-52 h-52 sm:w-64 sm:h-64 rounded-full bg-radial from-slate-100 via-sky-200/40 to-transparent blur-[2px] opacity-80" />
        <div className="absolute top-16 left-1/2 -translate-x-1/2 w-44 h-44 sm:w-56 sm:h-56 rounded-full bg-slate-100/90 shadow-[0_0_80px_rgba(56,189,248,0.35)]" />

        {/* Silhouetted Ancient Pagoda & Torii Gate in Mist */}
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent" />
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-72 text-[#080d19] opacity-85"
          preserveAspectRatio="none"
          viewBox="0 0 1000 300"
        >
          {/* Distant Mountains */}
          <path d="M0 300 L0 180 Q 250 80 500 200 T 1000 160 L1000 300 Z" fill="#040812" />
          {/* Temple & Torii Gates */}
          <rect x="460" y="140" width="8" height="120" fill="#060b17" />
          <rect x="532" y="140" width="8" height="120" fill="#060b17" />
          <path d="M440 145 Q 500 130 560 145 L 555 155 Q 500 142 445 155 Z" fill="#dc2626" />
          <rect x="450" y="165" width="100" height="6" fill="#dc2626" />
        </svg>

        {/* Hero Silhouette Centerpiece */}
        <div className="absolute bottom-28 sm:bottom-32 left-1/2 -translate-x-1/2 flex flex-col items-center">
          <div className="relative w-36 h-56 sm:w-44 sm:h-64">
            {/* Glowing Katana Energy Arc */}
            <div className="absolute top-10 -left-12 w-28 h-2 bg-gradient-to-r from-cyan-400 via-sky-300 to-transparent rotate-45 blur-xs shadow-[0_0_15px_#38bdf8]" />
            {/* Flowing Crimson Scarf */}
            <div className="absolute top-12 left-12 w-24 h-16 bg-gradient-to-r from-red-600 to-transparent -rotate-12 rounded-full blur-[1px] opacity-90 animate-pulse" />
            {/* Masked Ninja Silhouette with Sugegasa hat */}
            <svg viewBox="0 0 120 180" className="w-full h-full text-[#03060f] drop-shadow-2xl">
              <path
                d="M60 20 L25 50 Q 60 42 95 50 Z"
                fill="#03060f"
              />
              <circle cx="60" cy="55" r="14" fill="#03060f" />
              {/* Glowing cyan ninja eye */}
              <rect x="62" y="52" width="8" height="3" fill="#38bdf8" />
              {/* Torso & Armor */}
              <path d="M48 70 L72 70 L68 115 L52 115 Z" fill="#060b17" />
              <rect x="50" y="85" width="20" height="4" fill="#dc2626" />
              {/* Legs */}
              <path d="M52 115 L45 160 L54 160 L59 125 Z" fill="#03060f" />
              <path d="M68 115 L75 160 L66 160 L61 125 Z" fill="#03060f" />
              {/* Katana blade held downward */}
              <line x1="42" y1="75" x2="15" y2="150" stroke="#e2e8f0" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top Title Lockup matching Mockup #1 */}
      <div className="relative z-10 flex flex-col items-center mt-6 sm:mt-10 text-center">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-cinzel tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-red-500 drop-shadow-[0_4px_16px_rgba(220,38,38,0.6)]">
          NINJA AREAHI 3
        </h1>
        <div className="text-xs sm:text-sm font-black tracking-[0.35em] text-red-500 mt-1 uppercase">
          ONLINE
        </div>
        <p className="text-slate-400 text-xs sm:text-sm font-medium tracking-wide mt-2">
          Fight · Explore · Be the Legend
        </p>
      </div>

      {/* Bottom Action CTAs matching Mockup #1 */}
      <div className="relative z-10 flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm mb-4">
        {/* Create Account Button */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onCreateAccount();
          }}
          className="w-full py-3.5 px-6 rounded-lg font-bold text-sm tracking-wider uppercase text-white bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-950/80 border border-red-500/50 transition-all cursor-pointer"
        >
          Create Account
        </button>

        {/* Login Button */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onLogin();
          }}
          className="w-full py-3 px-6 rounded-lg font-semibold text-sm tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800/90 hover:text-white border border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          Login
        </button>

        {/* Play as Guest Button */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onPlayAsGuest();
          }}
          className="text-xs tracking-wider uppercase text-slate-400 hover:text-red-400 transition-colors py-2 cursor-pointer font-medium"
        >
          — Play as Guest —
        </button>

        {/* Control Hints */}
        <div className="text-[11px] text-slate-400 font-mono tracking-tight text-center mt-1">
          WASD Move · Space Jump · J Katana Strike · K Shuriken · L Dash
        </div>
      </div>
    </div>
  );
};
