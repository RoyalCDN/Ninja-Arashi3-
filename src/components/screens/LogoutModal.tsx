import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface LogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-sm bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-950/60 border-2 border-red-600/80 flex items-center justify-center text-red-500 shadow-xl shadow-red-950/50">
          <AlertTriangle size={30} />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-bold font-cinzel text-white tracking-wide">Logout</h2>
          <p className="text-xs text-slate-300">
            Are you sure you want to logout? You&apos;ll need to login again to continue.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full mt-2">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onConfirm();
            }}
            className="flex-1 py-3 px-4 rounded-lg font-bold text-xs uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer"
          >
            Logout
          </button>
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onCancel();
            }}
            className="flex-1 py-3 px-4 rounded-lg font-semibold text-xs tracking-wide text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 active:scale-98 transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
