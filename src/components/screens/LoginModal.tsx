import React, { useState } from 'react';
import { User, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';
import { authService } from '../../services/auth';
import { soundManager } from '../../services/audio';

interface LoginModalProps {
  onSuccess: () => void;
  onGoToRegister: () => void;
  onGoToForgotPassword: () => void;
  onBack: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  onSuccess,
  onGoToRegister,
  onGoToForgotPassword,
  onBack,
}) => {
  const [identifier, setIdentifier] = useState('KairoNinja');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundManager.playSfx('button');
    setError(null);

    if (!identifier.trim()) {
      setError('Please enter your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    const result = await authService.login(identifier, password);
    setLoading(false);

    if (result.success) {
      soundManager.playSfx('gem');
      onSuccess();
    } else {
      setError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md z-30 select-none">
      <div className="relative w-full max-w-md bg-slate-900/95 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5">
        {/* Back and Brand Header */}
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
            <div className="text-xs font-black tracking-widest text-red-500 uppercase font-cinzel">
              Ninja Areahi 3 Online
            </div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel text-white tracking-wide">
              Login
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Username or Email */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-slate-300">Username or Email</label>
            <div className="relative flex items-center">
              <User size={16} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Username or Email"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
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
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-lg pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-400 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="accent-red-600 rounded cursor-pointer"
              />
              <span>Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => {
                soundManager.playSfx('button');
                onGoToForgotPassword();
              }}
              className="text-red-400 hover:text-red-300 cursor-pointer font-medium hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-lg font-bold text-sm uppercase tracking-wider text-white bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 shadow-lg shadow-red-950 border border-red-500/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          Don&apos;t have an account?{' '}
          <button
            onClick={() => {
              soundManager.playSfx('button');
              onGoToRegister();
            }}
            className="text-red-400 hover:text-red-300 font-semibold cursor-pointer underline underline-offset-2"
          >
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};
