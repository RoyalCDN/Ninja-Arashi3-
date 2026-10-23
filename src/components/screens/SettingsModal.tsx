import React, { useState } from 'react';
import { Volume2, VolumeX, Monitor, Gamepad2, ArrowLeft, LogOut, Check } from 'lucide-react';
import { GameSettings } from '../../types/game';
import { soundManager } from '../../services/audio';

interface SettingsModalProps {
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, onLogout }) => {
  const [settings, setSettings] = useState<GameSettings>(soundManager.getSettings());
  const [activeCategory, setActiveCategory] = useState<'audio' | 'graphics' | 'controls' | 'account'>('audio');

  const update = (partial: Partial<GameSettings>) => {
    soundManager.updateSettings(partial);
    setSettings(soundManager.getSettings());
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header matching Mockup #7 */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onClose();
            }}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Settings</span>
          </button>
          <div className="w-12" />
        </div>

        {/* Categories Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-4 py-2 gap-2 overflow-x-auto">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setActiveCategory('audio');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'audio'
                ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Audio
          </button>
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setActiveCategory('graphics');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'graphics'
                ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Graphics
          </button>
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setActiveCategory('controls');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'controls'
                ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Controls
          </button>
          <button
            onClick={() => {
              soundManager.playSfx('button');
              setActiveCategory('account');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === 'account'
                ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Account
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Audio Settings */}
          {activeCategory === 'audio' && (
            <div className="flex flex-col gap-4">
              {/* Mute All */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center gap-2.5">
                  {settings.muteAll ? (
                    <VolumeX size={18} className="text-red-400" />
                  ) : (
                    <Volume2 size={18} className="text-emerald-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-white">Mute All Sounds</div>
                    <div className="text-[11px] text-slate-400">Silences all music and effects</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.muteAll}
                  onChange={(e) => update({ muteAll: e.target.checked })}
                  className="accent-red-600 rounded cursor-pointer w-4 h-4"
                />
              </div>

              {/* Music Volume */}
              <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Music Volume</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {Math.round(settings.musicVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.musicVolume}
                  onChange={(e) => update({ musicVolume: parseFloat(e.target.value) })}
                  className="accent-red-500 w-full cursor-pointer"
                  disabled={settings.muteAll}
                />
              </div>

              {/* SFX Volume */}
              <div className="flex flex-col gap-1.5 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">Sound Effects (SFX)</span>
                  <span className="font-mono text-slate-400 tabular-nums">
                    {Math.round(settings.sfxVolume * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.sfxVolume}
                  onChange={(e) => update({ sfxVolume: parseFloat(e.target.value) })}
                  className="accent-red-500 w-full cursor-pointer"
                  disabled={settings.muteAll}
                />
              </div>
            </div>
          )}

          {/* Graphics Settings */}
          {activeCategory === 'graphics' && (
            <div className="flex flex-col gap-4">
              {/* Quality Preset */}
              <div className="flex flex-col gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-semibold text-white">Graphics Quality Preset</div>
                <div className="grid grid-cols-3 gap-2">
                  {(['LOW', 'MEDIUM', 'HIGH'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => update({ graphicsQuality: q })}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settings.graphicsQuality === q
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Screen Shake */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-semibold text-white">Impact Screen Shake</div>
                  <div className="text-[11px] text-slate-400">Cinematic camera shake on heavy strikes</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.screenShake}
                  onChange={(e) => update({ screenShake: e.target.checked })}
                  className="accent-red-600 rounded cursor-pointer w-4 h-4"
                />
              </div>

              {/* Particle Effects */}
              <div className="flex items-center justify-between p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-semibold text-white">Particle Effects</div>
                  <div className="text-[11px] text-slate-400">Atmospheric leaves, snow, sparks, and embers</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.particleEffects}
                  onChange={(e) => update({ particleEffects: e.target.checked })}
                  className="accent-red-600 rounded cursor-pointer w-4 h-4"
                />
              </div>
            </div>
          )}

          {/* Controls Settings */}
          {activeCategory === 'controls' && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <div className="text-xs font-semibold text-white">Touch Control Button Size</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['NORMAL', 'LARGE'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ touchControlSize: s })}
                      className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        settings.touchControlSize === s
                          ? 'bg-red-700 text-white shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex flex-col gap-1 text-xs">
                <div className="font-semibold text-slate-300">Desktop Key Bindings:</div>
                <div className="text-slate-400 space-y-1 mt-1 font-mono text-[11px]">
                  <div>A / D or Left / Right: Run</div>
                  <div>W / Space / Up: Jump & Double Jump</div>
                  <div>J or Z: Katana Strike</div>
                  <div>K or X: Throw Shuriken</div>
                  <div>L or Shift: Shadow Phantom Dash</div>
                  <div>Esc / P: Pause Game</div>
                </div>
              </div>
            </div>
          )}

          {/* Account Category */}
          {activeCategory === 'account' && (
            <div className="flex flex-col gap-4">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">Logout from Game</div>
                  <div className="text-[11px] text-slate-400">Ends your current session</div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playSfx('button');
                    onLogout();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 bg-red-950 hover:bg-red-900 border border-red-700 text-red-200 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
