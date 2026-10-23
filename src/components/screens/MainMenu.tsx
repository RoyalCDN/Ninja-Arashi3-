import React from 'react';
import {
  Swords,
  Users,
  User,
  Map as MapIcon,
  Briefcase,
  ShoppingBag,
  Settings as SettingsIcon,
  Plus,
  Flame,
} from 'lucide-react';
import { UserProfile } from '../../types/game';
import { soundManager } from '../../services/audio';

interface MainMenuProps {
  profile: UserProfile;
  onPlay: () => void;
  onMultiplayer: () => void;
  onCharacter: () => void;
  onMap: () => void;
  onInventory: () => void;
  onShop: () => void;
  onSettings: () => void;
  onOpenProfile: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  profile,
  onPlay,
  onMultiplayer,
  onCharacter,
  onMap,
  onInventory,
  onShop,
  onSettings,
  onOpenProfile,
}) => {
  const xpPercent = Math.max(0, Math.min(100, (profile.xp / profile.nextLevelXp) * 100));

  return (
    <div className="relative w-full h-full flex flex-col justify-between bg-slate-950 overflow-hidden select-none">
      {/* Background Japanese Fantasy Art matching Mockup #8 */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Sky Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050a14] via-[#09152b] to-[#04060c]" />

        {/* Giant Moon */}
        <div className="absolute top-10 right-1/4 w-72 h-72 rounded-full bg-radial from-slate-100 via-sky-200/40 to-transparent blur-[2px] opacity-80" />
        <div className="absolute top-14 right-1/4 w-64 h-64 rounded-full bg-slate-100/90 shadow-[0_0_90px_rgba(56,189,248,0.3)]" />

        {/* Pagodas & Torii Gates in Silhouette */}
        <svg
          className="absolute bottom-0 inset-x-0 w-full h-80 text-[#070c18] opacity-90"
          preserveAspectRatio="none"
          viewBox="0 0 1200 350"
        >
          <path d="M0 350 L0 220 Q 300 120 600 240 T 1200 190 L1200 350 Z" fill="#040711" />
          <rect x="660" y="160" width="10" height="150" fill="#060a14" />
          <rect x="740" y="160" width="10" height="150" fill="#060a14" />
          <path d="M640 165 Q 705 150 770 165 L 765 178 Q 705 163 645 178 Z" fill="#dc2626" />
        </svg>

        {/* Center Hero Ninja Silhouette under Moonlit Torii Gate */}
        <div className="absolute bottom-16 sm:bottom-20 right-1/4 translate-x-12 flex flex-col items-center">
          <div className="relative w-48 h-72 sm:w-56 sm:h-80">
            {/* Glowing Blade */}
            <div className="absolute top-12 -left-10 w-32 h-2.5 bg-gradient-to-r from-cyan-400 to-transparent rotate-45 blur-xs shadow-[0_0_15px_#38bdf8]" />
            {/* Crimson Scarf */}
            <div className="absolute top-14 left-14 w-28 h-20 bg-gradient-to-r from-red-600 to-transparent -rotate-12 rounded-full blur-[1px] opacity-90 animate-pulse" />
            <svg viewBox="0 0 120 180" className="w-full h-full text-[#03060f] drop-shadow-2xl">
              <path d="M60 20 L25 50 Q 60 42 95 50 Z" fill="#03060f" />
              <circle cx="60" cy="55" r="14" fill="#03060f" />
              <rect x="62" y="52" width="8" height="3" fill="#38bdf8" />
              <path d="M48 70 L72 70 L68 115 L52 115 Z" fill="#060b17" />
              <rect x="50" y="85" width="20" height="4" fill="#dc2626" />
              <path d="M52 115 L45 160 L54 160 L59 125 Z" fill="#03060f" />
              <path d="M68 115 L75 160 L66 160 L61 125 Z" fill="#03060f" />
              <line x1="42" y1="75" x2="15" y2="150" stroke="#e2e8f0" strokeWidth="2.5" />
            </svg>
          </div>
        </div>
      </div>

      {/* Top Header Bar matching Mockup #8 */}
      <div className="relative z-10 flex items-center justify-between p-3 sm:p-5 bg-slate-950/60 border-b border-slate-800/80 backdrop-blur-xs">
        {/* Left: Player Profile Snippet */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onOpenProfile();
          }}
          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-900/60 transition-colors cursor-pointer text-left"
        >
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full border-2 border-red-600 bg-slate-950 flex items-center justify-center shadow-lg shadow-red-950/50 overflow-hidden shrink-0">
            <div className="w-full h-full bg-[#090d16] flex items-center justify-center">
              <span className="text-red-500 font-serif font-black text-sm">影</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                {profile.username}
              </span>
              <span className="text-[10px] bg-red-950 text-red-400 border border-red-800 px-1.5 py-0.2 rounded font-semibold">
                Lv. {profile.level}
              </span>
            </div>
            {/* XP Bar */}
            <div className="w-24 sm:w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </button>

        {/* Right: Currency Badges & Settings */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Gold Coins */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-mono font-bold text-yellow-400">
            <span className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm shadow-yellow-400" />
            <span className="tabular-nums">{profile.coins.toLocaleString()}</span>
          </div>

          {/* Celestial Gems */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-mono font-bold text-sky-400">
            <span className="w-2 h-2 rounded-full bg-sky-400 shadow-sm shadow-sky-400" />
            <span className="tabular-nums">{profile.gems}</span>
          </div>

          {/* Add Currency Button */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onShop();
            }}
            className="p-1.5 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 rounded-lg transition-colors cursor-pointer shadow-md"
            title="Get More Coins & Gems"
          >
            <Plus size={16} />
          </button>

          {/* Settings Button */}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onSettings();
            }}
            className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-lg transition-colors cursor-pointer"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </div>

      {/* Middle Center Logo Lockup */}
      <div className="relative z-10 flex flex-col items-center mt-2 pointer-events-none">
        <h2 className="text-2xl sm:text-4xl font-black font-cinzel tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-red-500 drop-shadow-[0_2px_12px_rgba(220,38,38,0.5)]">
          NINJA AREAHI 3
        </h2>
        <div className="text-[10px] sm:text-xs font-black tracking-[0.3em] text-red-500 uppercase">
          ONLINE
        </div>
      </div>

      {/* Left Navigation Action Menu matching Mockup #8 */}
      <div className="relative z-10 flex flex-col gap-2 p-4 sm:p-6 w-full max-w-xs sm:max-w-sm">
        {/* Play (Story Mode) */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onPlay();
          }}
          className="flex items-center gap-3.5 px-5 py-3 rounded-xl font-bold text-sm tracking-wide uppercase text-white bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-950/90 border border-red-500/50 transition-all cursor-pointer group"
        >
          <Swords size={20} className="text-red-200 group-hover:scale-110 transition-transform" />
          <span>Play Story</span>
        </button>

        {/* Online Multiplayer with NEW Badge */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onMultiplayer();
          }}
          className="relative flex items-center justify-between px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <div className="flex items-center gap-3">
            <Users size={18} className="text-sky-400" />
            <span>Online Multiplayer</span>
          </div>
          <span className="bg-red-600 text-white text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full shadow-sm shadow-red-600/60">
            NEW
          </span>
        </button>

        {/* Character Selection */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onCharacter();
          }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <User size={18} className="text-purple-400" />
          <span>Character</span>
        </button>

        {/* Map Selection */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onMap();
          }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <MapIcon size={18} className="text-emerald-400" />
          <span>Map Chapters</span>
        </button>

        {/* Inventory */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onInventory();
          }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <Briefcase size={18} className="text-amber-400" />
          <span>Inventory</span>
        </button>

        {/* Shop */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onShop();
          }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <ShoppingBag size={18} className="text-rose-400" />
          <span>Shop & Upgrades</span>
        </button>

        {/* Settings */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onSettings();
          }}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl font-semibold text-xs tracking-wide text-slate-200 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 active:scale-98 transition-all cursor-pointer shadow-lg"
        >
          <SettingsIcon size={18} className="text-slate-400" />
          <span>Settings</span>
        </button>
      </div>

      {/* Bottom Right Event Card matching Mockup #8 */}
      <div className="absolute bottom-5 right-5 z-10 hidden sm:block">
        <div className="p-3 bg-slate-900/90 border border-red-800/80 rounded-xl shadow-2xl flex items-center gap-3 max-w-xs hover:border-red-600 transition-colors cursor-pointer">
          <div className="w-12 h-12 rounded-lg bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-500 shrink-0">
            <Flame size={24} className="animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                New Event
              </span>
              <span className="text-[9px] bg-red-950 text-red-300 border border-red-800 px-1 rounded">
                Limited Time
              </span>
            </div>
            <div className="text-xs font-bold text-white tracking-wide">
              Blood Moon Eclipse
            </div>
            <div className="text-[11px] text-slate-400">
              Double XP & Demon Relics in Silent Cliffs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
