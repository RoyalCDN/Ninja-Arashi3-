import React, { useState } from 'react';
import { ArrowLeft, Swords, Disc, Shield, Sparkles, Check } from 'lucide-react';
import { UserProfile } from '../../types/game';
import { soundManager } from '../../services/audio';

interface InventoryModalProps {
  profile: UserProfile;
  onBack: () => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ profile, onBack }) => {
  const [activeTab, setActiveTab] = useState<'weapons' | 'shurikens' | 'charms'>('weapons');

  const weapons = [
    {
      id: 'w1',
      name: 'Katana of Akarai',
      power: '+25 ATK',
      desc: 'Forged from meteorite iron in the shadow temple. Sharp edge with azure luminescent blade trail.',
      equipped: true,
    },
    {
      id: 'w2',
      name: 'Glacial Edge',
      power: '+32 ATK',
      desc: 'Infused with permafrost from the Frozen Temple. Freezes enemies briefly on critical slashes.',
      equipped: false,
    },
    {
      id: 'w3',
      name: 'Crimson Dragon Cleaver',
      power: '+45 ATK',
      desc: 'Heavy volcanic broadsword quenching in magma. Emits burning fire trails with each swing.',
      equipped: false,
    },
  ];

  const shurikens = [
    {
      id: 's1',
      name: '4-Point Steel Shuriken',
      power: '20 DMG',
      desc: 'Balanced balanced throwing star with high rotational velocity.',
      equipped: true,
    },
    {
      id: 's2',
      name: 'Shadow Fuma Shuriken',
      power: '35 DMG',
      desc: 'Heavy four-bladed pinwheel shuriken that pierces through multiple enemies.',
      equipped: false,
    },
  ];

  const charms = [
    {
      id: 'c1',
      name: 'Talisman of Swift Wind',
      buff: '+15% Move Speed',
      desc: 'Blessed talisman made of sacred silk. Enhances dash distance and aerial maneuverability.',
      equipped: true,
    },
    {
      id: 'c2',
      name: 'Phoenix Feather of Akarai',
      buff: 'Revive with 50% HP once per run',
      desc: 'Mystical fiery feather from an ancient bird that grants a miraculous second wind.',
      equipped: false,
    },
  ];

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
          Arsenal & Inventory
        </h2>

        <div className="w-16" />
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-2 z-10 my-2">
        <button
          onClick={() => {
            soundManager.playSfx('button');
            setActiveTab('weapons');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'weapons'
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Swords size={14} />
          <span>Katanas</span>
        </button>
        <button
          onClick={() => {
            soundManager.playSfx('button');
            setActiveTab('shurikens');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'shurikens'
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Disc size={14} />
          <span>Shurikens</span>
        </button>
        <button
          onClick={() => {
            soundManager.playSfx('button');
            setActiveTab('charms');
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'charms'
              ? 'bg-red-950 text-red-400 border border-red-800'
              : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles size={14} />
          <span>Charms</span>
        </button>
      </div>

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-auto max-w-4xl mx-auto w-full z-10">
        {activeTab === 'weapons' &&
          weapons.map((w) => (
            <div
              key={w.id}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-3 bg-slate-900/90 shadow-xl ${
                w.equipped ? 'border-red-500 shadow-red-950/40' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-red-400">{w.power}</span>
                  {w.equipped && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Equipped
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">{w.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{w.desc}</p>
              </div>
            </div>
          ))}

        {activeTab === 'shurikens' &&
          shurikens.map((s) => (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-3 bg-slate-900/90 shadow-xl ${
                s.equipped ? 'border-red-500 shadow-red-950/40' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-sky-400">{s.power}</span>
                  {s.equipped && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Equipped
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">{s.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}

        {activeTab === 'charms' &&
          charms.map((c) => (
            <div
              key={c.id}
              className={`p-5 rounded-2xl border-2 flex flex-col justify-between gap-3 bg-slate-900/90 shadow-xl ${
                c.equipped ? 'border-red-500 shadow-red-950/40' : 'border-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-amber-400">{c.buff}</span>
                  {c.equipped && (
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Check size={10} /> Equipped
                    </span>
                  )}
                </div>
                <h4 className="text-base font-bold text-white">{c.name}</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
      </div>

      <div className="w-full h-2" />
    </div>
  );
};
