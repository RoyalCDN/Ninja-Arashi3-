import React, { useState } from 'react';
import { User, Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth';
import { soundManager } from '../../services/audio';

interface CreateAccountModalProps {
  onSuccess: (email: string) => void;
  onGoToLogin: () => void;
  onBack: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({
  onSuccess,
  onGoToLogin,
  onBack,
}) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSfx('button');
    setError(null);

    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Service');
      return;
    }

    setLoading(true);
    const result = await authService.register(username, email, password);
    setLoading(false);

    if (result.success) {
      soundManager.playSfx('gem');
      onSuccess(email);
    } else {
      setError(result.error || 'Failed to create account');
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      {/* Background card modal matching Mockup #2 */}
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onBack();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
              Create Account
            </h2>
          </div>
          <div className="w-6" />
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-950/80 border border-red-800/80 rounded-lg text-red-200 text-xs">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Username */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Username</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="3-16 characters, letters and numbers"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
                maxLength={16}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Email address</label>
            <div className="relative flex items-center">
              <Mail size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Confirm password</label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Terms checkbox */}
          <label className="flex items-center gap-2 mt-1 cursor-pointer text-[11px] text-slate-400">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="accent-red-600 rounded cursor-pointer"
            />
            <span>I agree to the Terms of Service and Privacy Policy</span>
          </label>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Already have an account?{' '}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onGoToLogin();
            }}
            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer underline underline-offset-2"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
