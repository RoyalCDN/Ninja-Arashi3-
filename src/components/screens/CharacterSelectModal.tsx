import React, { useState } from 'react';
import { ArrowLeft, Check, Lock, Zap, Shield, Swords, Sparkles } from 'lucide-react';
import { CHARACTERS } from '../../game/characters';
import { PlayerCharacter, UserProfile } from '../../types/game';
import { authService } from '../../services/auth';
import { soundManager } from '../../services/audio';

interface CharacterSelectModalProps {
  profile: UserProfile;
  onSelectCharacter: (char: PlayerCharacter) => void;
  onBack: () => void;
}

export const CharacterSelectModal: React.FC<CharacterSelectModalProps> = ({
  profile,
  onSelectCharacter,
  onBack,
}) => {
  const [selectedCharId, setSelectedCharId] = useState(profile.selectedCharacterId);
  const currentChar = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const isUnlocked = profile.unlockedCharacters.includes(currentChar.id);
  const isEquipped = profile.selectedCharacterId === currentChar.id;

  const handleEquip = () => {
    soundManager.playSfx('button');
    authService.selectCharacter(currentChar.id);
    onSelectCharacter(currentChar);
  };

  const handleUnlock = () => {
    soundManager.playSfx('button');
    const ok = authService.unlockCharacter(currentChar.id, currentChar.unlockCostCoins);
    if (ok) {
      soundManager.playSfx('gem');
      onSelectCharacter(currentChar);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-4 sm:p-6 bg-slate-950 select-none overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between z-10">
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Main Menu</span>
        </button>

        <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
          Shinobi Roster
        </h2>

        {/* Currency badge */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-yellow-400">
          <span className="w-2 h-2 rounded-full bg-yellow-400" />
          <span className="tabular-nums">{profile.coins.toLocaleString()} MON</span>
        </div>
      </div>

      {/* Main Showcase Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-auto max-w-5xl mx-auto w-full z-10">
        {/* Left Side: Character Card Selectors */}
        <div className="md:col-span-5 flex md:flex-col gap-3 overflow-x-auto">
          {CHARACTERS.map((char) => {
            const unlocked = profile.unlockedCharacters.includes(char.id);
            const active = char.id === selectedCharId;

            return (
              <div
                key={char.id}
                onClick={() => {
                  soundManager.playSfx('button');
                  setSelectedCharId(char.id);
                }}
                className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                  active
                    ? 'border-red-500 bg-slate-900/90 shadow-xl shadow-red-950/40'
                    : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                } ${!unlocked ? 'opacity-70' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full border border-slate-700 flex items-center justify-center font-serif text-lg font-bold"
                    style={{ backgroundColor: char.silhouetteColor, color: char.scarfColor }}
                  >
                    忍
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white tracking-wide">
                      {char.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{char.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!unlocked ? (
                    <span className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-950/60 border border-amber-800 px-2 py-0.5 rounded-full">
                      <Lock size={12} />
                      <span>{char.unlockCostCoins}</span>
                    </span>
                  ) : active ? (
                    <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800">
                      Active
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Detailed Character Stats & Visual Spotlight */}
        <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
          <div className="flex flex-col gap-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black font-cinzel text-white tracking-wide">
                  {currentChar.name}
                </h3>
                <div className="text-xs font-semibold text-red-400">{currentChar.title}</div>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: currentChar.scarfColor, color: '#fff' }}
              >
                {currentChar.id[0].toUpperCase()}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {currentChar.description}
            </p>

            {/* Stat Bars */}
            <div className="flex flex-col gap-2.5 bg-slate-950/60 border border-slate-800 p-4 rounded-xl">
              {/* HP */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Shield size={12} className="text-red-400" /> Health (HP)
                  </span>
                  <span className="font-mono text-white">{currentChar.maxHp}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${(currentChar.maxHp / 120) * 100}%` }}
                  />
                </div>
              </div>

              {/* Speed */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap size={12} className="text-emerald-400" /> Agility / Speed
                  </span>
                  <span className="font-mono text-white">{currentChar.speed}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full"
                    style={{ width: `${(currentChar.speed / 420) * 100}%` }}
                  />
                </div>
              </div>

              {/* Attack */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-semibold">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Swords size={12} className="text-yellow-400" /> Attack Power
                  </span>
                  <span className="font-mono text-white">{currentChar.attackPower}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-500 rounded-full"
                    style={{ width: `${(currentChar.attackPower / 40) * 100}%` }}
                  />
                </div>
              </div>

              {/* Special Skill Description */}
              <div className="mt-2 pt-2 border-t border-slate-800 flex items-start gap-2 text-xs">
                <Sparkles size={14} className="text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-purple-300">
                    {currentChar.specialSkillName}:
                  </span>{' '}
                  <span className="text-slate-400 text-[11px]">
                    {currentChar.specialSkillDesc}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button: Equip vs Unlock */}
          <div className="mt-5">
            {isUnlocked ? (
              <button
                onClick={handleEquip}
                disabled={isEquipped}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all cursor-pointer ${
                  isEquipped
                    ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400 cursor-default'
                    : 'bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white shadow-lg shadow-red-950 border border-red-500/40 active:scale-98'
                }`}
              >
                {isEquipped ? 'Equipped for Battle' : 'Equip Shinobi'}
              </button>
            ) : (
              <button
                onClick={handleUnlock}
                disabled={profile.coins < currentChar.unlockCostCoins}
                className="w-full py-3 px-4 rounded-xl font-bold text-sm uppercase tracking-wide text-white bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 active:scale-98 shadow-lg shadow-amber-950 border border-amber-400/50 transition-all cursor-pointer disabled:opacity-40"
              >
                {profile.coins >= currentChar.unlockCostCoins
                  ? `Unlock for ${currentChar.unlockCostCoins.toLocaleString()} Mon`
                  : `Need ${currentChar.unlockCostCoins - profile.coins} More Mon`}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-2" />
    </div>
  );
};
