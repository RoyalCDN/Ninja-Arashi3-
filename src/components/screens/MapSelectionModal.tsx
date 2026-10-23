import React, { useState } from 'react';
import { ArrowLeft, Lock, Play, ShieldAlert, Award } from 'lucide-react';
import { MapId, UserProfile } from '../../types/game';
import { LEVELS } from '../../game/levels';
import { soundManager } from '../../services/audio';

interface MapSelectionModalProps {
  profile: UserProfile;
  selectedMap: MapId;
  onSelectMap: (mapId: MapId) => void;
  onStartMission: (mapId: MapId) => void;
  onBack: () => void;
}

export const MapSelectionModal: React.FC<MapSelectionModalProps> = ({
  profile,
  selectedMap,
  onSelectMap,
  onStartMission,
  onBack,
}) => {
  const [currentMap, setCurrentMap] = useState<MapId>(selectedMap);

  const mapList: {
    id: MapId;
    title: string;
    difficulty: string;
    bgColor: string;
    accentColor: string;
    description: string;
  }[] = [
    {
      id: 'shadow_forest',
      title: 'Shadow Forest',
      difficulty: 'Normal',
      bgColor: 'from-emerald-950 via-slate-900 to-slate-950',
      accentColor: 'border-emerald-500/60 text-emerald-400',
      description: 'Dense moonlight pine forest with patrol scouts and ancient bamboo bridges.',
    },
    {
      id: 'frozen_temple',
      title: 'Frozen Temple',
      difficulty: 'Intermediate',
      bgColor: 'from-sky-950 via-slate-900 to-slate-950',
      accentColor: 'border-sky-500/60 text-sky-400',
      description: 'Slippery glacier platforms, falling icicles, and frost armor guardians.',
    },
    {
      id: 'lava_valley',
      title: 'Lava Valley',
      difficulty: 'Advanced',
      bgColor: 'from-orange-950 via-slate-900 to-slate-950',
      accentColor: 'border-orange-500/60 text-orange-400',
      description: 'Molten basalt caverns, moving lava lifts, and towering fire brutes.',
    },
    {
      id: 'silent_cliffs',
      title: 'Silent Cliffs',
      difficulty: 'Nightmare',
      bgColor: 'from-purple-950 via-slate-900 to-slate-950',
      accentColor: 'border-purple-500/60 text-purple-400',
      description: 'Floating celestial shrines under the blood moon, guarded by Akuma Sovereign.',
    },
  ];

  const activeLevel = LEVELS[currentMap];
  const isUnlocked = profile.unlockedMaps.includes(currentMap);

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
          Select Map
        </h2>

        <div className="w-16" />
      </div>

      {/* Map Cards Carousel matching Mockup #11 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 my-auto max-w-5xl mx-auto w-full z-10">
        {mapList.map((map) => {
          const unlocked = profile.unlockedMaps.includes(map.id);
          const isSelected = currentMap === map.id;

          return (
            <div
              key={map.id}
              onClick={() => {
                soundManager.playSfx('button');
                setCurrentMap(map.id);
                onSelectMap(map.id);
              }}
              className={`relative flex flex-col justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer h-60 sm:h-72 overflow-hidden shadow-xl ${
                isSelected
                  ? 'border-red-500 bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 scale-102 shadow-red-950/50'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              } ${!unlocked ? 'opacity-65' : ''}`}
            >
              {/* Card visual backdrop */}
              <div
                className={`absolute inset-0 bg-gradient-to-b ${map.bgColor} opacity-40 pointer-events-none`}
              />

              {/* Status Badge */}
              <div className="relative z-10 flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map.accentColor} bg-slate-950/60`}
                >
                  {map.difficulty}
                </span>

                {!unlocked && (
                  <div className="p-1 rounded-full bg-slate-950/80 text-slate-400 border border-slate-700">
                    <Lock size={14} />
                  </div>
                )}
              </div>

              {/* Center Map Icon / Silhouette */}
              <div className="relative z-10 my-auto flex flex-col items-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center text-slate-300 shadow-inner">
                  <span className="font-serif font-black text-2xl text-red-500">
                    {map.id === 'shadow_forest'
                      ? '森'
                      : map.id === 'frozen_temple'
                      ? '氷'
                      : map.id === 'lava_valley'
                      ? '炎'
                      : '崖'}
                  </span>
                </div>
              </div>

              {/* Bottom Card Title */}
              <div className="relative z-10 flex flex-col gap-1 text-center">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-wide">
                  {map.title}
                </h3>
                <span className="text-[11px] text-slate-400 font-semibold">
                  {unlocked ? (isSelected ? 'Selected' : 'Ready') : 'Locked'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Level Info & Launch CTA */}
      <div className="z-10 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl max-w-2xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1 text-left w-full sm:w-auto">
          <div className="text-xs font-bold text-red-400 tracking-wide uppercase">
            {activeLevel.subtitle}
          </div>
          <div className="text-sm font-semibold text-white">
            {activeLevel.title} — {activeLevel.difficulty} Difficulty
          </div>
          <div className="text-[11px] text-slate-400">
            Objectives: {activeLevel.objectives.join(' · ')}
          </div>
        </div>

        {isUnlocked ? (
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onStartMission(currentMap);
            }}
            className="w-full sm:w-auto py-3 px-8 rounded-xl font-bold text-sm tracking-wide uppercase text-white bg-gradient-to-r from-red-700 via-red-600 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-xl shadow-red-950 border border-red-500/50 transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <Play size={16} fill="white" />
            <span>Start Mission</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 bg-amber-950/40 border border-amber-900 px-4 py-2.5 rounded-xl shrink-0">
            <Lock size={14} />
            <span>Complete previous chapters to unlock</span>
          </div>
        )}
      </div>
    </div>
  );
};
