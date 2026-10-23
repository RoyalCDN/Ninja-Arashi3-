import React, { useState } from 'react';
import { User, Award, Shield, BarChart3, Settings as SettingsIcon, X, Trophy, Target, Calendar, CheckCircle } from 'lucide-react';
import { UserProfile } from '../../types/game';
import { soundManager } from '../../services/audio';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onOpenSettings: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onOpenSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'stats' | 'achievements'>('profile');

  const xpPercent = Math.max(0, Math.min(100, (profile.xp / profile.nextLevelXp) * 100));

  return (
    <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-2xl bg-slate-900/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[92vh]">
        {/* Left Navigation Sidebar matching Mockup #6 */}
        <div className="w-full md:w-44 bg-slate-950/70 border-b md:border-b-0 md:border-r border-slate-800 p-3 sm:p-4 flex md:flex-col justify-between shrink-0">
          <div className="flex md:flex-col gap-1.5 w-full">
            <button
              onClick={() => {
                soundManager.playSfx('button');
                setActiveTab('profile');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <User size={16} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => {
                soundManager.playSfx('button');
                setActiveTab('stats');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 size={16} />
              <span>Stats</span>
            </button>

            <button
              onClick={() => {
                soundManager.playSfx('button');
                setActiveTab('achievements');
              }}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-red-950/80 text-red-400 border border-red-800/80'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Award size={16} />
              <span>Achievements</span>
            </button>
          </div>

          <div className="hidden md:block pt-3 border-t border-slate-800/80">
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onOpenSettings();
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all cursor-pointer w-full"
            >
              <SettingsIcon size={16} />
              <span>Settings</span>
            </button>
          </div>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 p-5 sm:p-7 flex flex-col gap-6 overflow-y-auto">
          {/* Top header with close button */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-cinzel text-white tracking-wide">
              Player Profile
            </h2>
            <button
              onClick={() => {
                soundManager.playSfx('button');
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {activeTab === 'profile' && (
            <div className="flex flex-col gap-6">
              {/* Avatar + Identity Cluster */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-red-600 bg-slate-950 flex items-center justify-center shadow-xl shadow-red-950/60 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-[#0a0f1d] flex items-center justify-center">
                    <span className="text-red-500 font-serif font-black text-2xl">影</span>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-white tracking-wide">
                      {profile.username}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({profile.id})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                    <span>Online</span>
                    {profile.isGuest && (
                      <span className="text-amber-400 ml-2">(Guest Account)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Level & XP Progress */}
              <div className="flex flex-col gap-1.5 bg-slate-950/60 border border-slate-800 p-3.5 rounded-xl">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-red-400">Lv. {profile.level} Master Shinobi</span>
                  <span className="text-slate-400 font-mono tabular-nums">
                    {profile.xp.toLocaleString()} / {profile.nextLevelXp.toLocaleString()} XP
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-red-600 to-rose-400 rounded-full transition-all duration-300 shadow-sm shadow-red-500"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </div>

              {/* 4 Stat Cards matching Mockup #6 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Trophy size={13} className="text-yellow-400" />
                    <span>Victories</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {profile.victories}
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Target size={13} className="text-red-400" />
                    <span>Missions</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {profile.missionsCompleted}
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Award size={13} className="text-sky-400" />
                    <span>Achievements</span>
                  </div>
                  <span className="text-lg font-bold font-mono text-white tabular-nums">
                    {profile.achievementsUnlocked}
                  </span>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 p-3 rounded-xl flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Calendar size={13} className="text-slate-400" />
                    <span>Joined</span>
                  </div>
                  <span className="text-xs font-mono text-slate-300 font-semibold truncate">
                    {profile.joinedDate}
                  </span>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="flex flex-col gap-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Recent Activity
                </h3>
                <div className="flex flex-col gap-2">
                  {profile.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center justify-between p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-lg text-xs"
                    >
                      <div className="flex items-center gap-2.5 text-slate-200">
                        <CheckCircle size={14} className="text-red-400 shrink-0" />
                        <span>{act.text}</span>
                      </div>
                      <span className="text-[11px] text-slate-400 shrink-0">{act.timeAgo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="flex flex-col gap-4 text-xs">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Total Gold Coins Earned:</span>
                <span className="font-bold text-yellow-400 font-mono tabular-nums">{profile.coins.toLocaleString()} MON</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Celestial Gems:</span>
                <span className="font-bold text-pink-400 font-mono tabular-nums">{profile.gems}</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Stages Unlocked:</span>
                <span className="font-bold text-white">{profile.unlockedMaps.length} / 4</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex justify-between">
                <span className="text-slate-400">Shinobi Roster:</span>
                <span className="font-bold text-white">{profile.unlockedCharacters.length} / 3</span>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="flex flex-col gap-2 text-xs">
              <div className="p-3 bg-slate-950/60 border border-red-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">First Blood of Akarai</div>
                  <div className="text-slate-400 text-[11px]">Defeat your first shadow scout in the forest</div>
                </div>
                <span className="text-emerald-400 font-bold">UNLOCKED</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-red-900/60 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-white">Phantom Infiltrator</div>
                  <div className="text-slate-400 text-[11px]">Execute 10 successful shadow dashes</div>
                </div>
                <span className="text-emerald-400 font-bold">UNLOCKED</span>
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-300">Sovereign Vanquisher</div>
                  <div className="text-slate-500 text-[11px]">Defeat Akuma, the Ancient Shadow Core Sovereign</div>
                </div>
                <span className="text-slate-500 font-bold">LOCKED</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
