import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface ForgotPasswordModalProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onBackToLogin }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSfx('button');
    if (email.trim() && email.includes('@')) {
      setSubmitted(true);
      soundManager.playSfx('gem');
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
        {/* Padlock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-800/80 flex items-center justify-center text-red-400 shadow-xl shadow-red-950/40">
          <Lock size={30} />
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
            Forgot Password
          </h2>
          <p className="text-xs text-slate-400">
            Enter your email address and we&apos;ll send you a password reset link.
          </p>
        </div>

        {submitted ? (
          <div className="flex flex-col items-center gap-3 p-4 bg-emerald-950/70 border border-emerald-800 rounded-xl text-emerald-200 text-xs">
            <CheckCircle2 size={24} className="text-emerald-400" />
            <p>
              A password reset link has been dispatched to{' '}
              <span className="font-semibold text-white">{email}</span>. Please check your inbox.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-1 text-left">
              <label className="text-xs font-semibold text-slate-300">Email address</label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-slate-400" />
                <input
                  type="email"
                  placeholder="example@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-1 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer"
            >
              Send Reset Link
            </button>
          </form>
        )}

        {/* Back to Login */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onBackToLogin();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer mt-1"
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
};
