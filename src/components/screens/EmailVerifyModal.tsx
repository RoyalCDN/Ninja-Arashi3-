import React, { useState } from 'react';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { soundManager } from '../../services/audio';

interface EmailVerifyModalProps {
  email: string;
  onBackToLogin: () => void;
  onContinue: () => void;
}

export const EmailVerifyModal: React.FC<EmailVerifyModalProps> = ({
  email,
  onBackToLogin,
  onContinue,
}) => {
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleResend = () => {
    soundManager.playSfx('button');
    setResendStatus('Verification link re-sent! Check your inbox.');
    setTimeout(() => setResendStatus(null), 4000);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col items-center text-center gap-5">
        {/* Mail Icon Illustration with Checkmark */}
        <div className="relative w-20 h-20 rounded-2xl bg-sky-950/60 border border-sky-800 flex items-center justify-center text-sky-400 shadow-xl shadow-sky-950/50">
          <Mail size={36} />
          <div className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full p-1 text-slate-950 border-2 border-slate-900">
            <CheckCircle2 size={16} />
          </div>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
            Verify Your Email
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            We&apos;ve sent a verification link to{' '}
            <span className="font-semibold text-sky-400">{email || 'example@gmail.com'}</span>
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Please check your email and click the link to verify your account. If you don&apos;t see it, check your spam folder.
          </p>
        </div>

        {resendStatus && (
          <div className="w-full p-2.5 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-200 text-xs">
            {resendStatus}
          </div>
        )}

        {/* Action Button */}
        <div className="flex flex-col gap-3 w-full mt-2">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onContinue();
            }}
            className="w-full py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer"
          >
            Enter Game Menu
          </button>

          <button
            onClick={handleResend}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer font-medium"
          >
            Didn&apos;t receive the email? Resend Verification Email
          </button>
        </div>

        {/* Back to Login */}
        <button
          onClick={() => {
            soundManager.playSfx('button');
            onBackToLogin();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
};
