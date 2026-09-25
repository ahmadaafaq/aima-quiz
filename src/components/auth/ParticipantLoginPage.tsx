import React, { useState } from 'react';
import {
  Mail,
  KeyRound,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  GraduationCap,
  Building2,
  ArrowRight,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';
import { loginParticipant, SupabaseParticipantRow } from '../../lib/supabase';
import { useCompetition } from '../../context/CompetitionContext';

interface ParticipantLoginPageProps {
  onLoginSuccess?: (participant: SupabaseParticipantRow) => void;
}

export const ParticipantLoginPage: React.FC<ParticipantLoginPageProps> = ({ onLoginSuccess }) => {
  const { setActiveView, loginParticipantSession } = useCompetition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loggedIn, setLoggedIn] = useState<SupabaseParticipantRow | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await loginParticipant(email.trim(), password);
    setIsLoading(false);

    if (result.success && result.participant) {
      setLoggedIn(result.participant);
      loginParticipantSession(result.participant);
      onLoginSuccess?.(result.participant);
    } else {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  if (loggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full space-y-6">
          {/* Success */}
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 shadow-xl space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Welcome back!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{loggedIn.name}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2 text-left text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="font-semibold">{loggedIn.institute_name}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{loggedIn.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="capitalize">{loggedIn.registration_mode === 'institute' ? 'Institution Participant' : 'Individual Participant'}</span>
                {loggedIn.is_team_leader && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    Team Leader
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-mono text-[10px]">Ref: {loggedIn.registration_number}</span>
              </div>
            </div>
            <button
              onClick={() => setActiveView('student')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <Sparkles className="w-4 h-4" />
              Go to My Workspace
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full space-y-6">

        {/* Brand Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-md">
            <img
              src="https://www.aima.in/img/logo.png"
              alt="AIMA Logo"
              className="h-10 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700/50">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Participant Portal • CSR Bootcamp 2026</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Participant Login
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Login with the email and password from your registration confirmation.
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">

          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="participant-login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@institute.ac.in"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="participant-login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
                Default password format: <span className="font-mono">firstname@last4digits#AIMA2026</span>
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="participant-login-submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Login to My Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
              <span className="bg-white dark:bg-slate-900 px-3">New here?</span>
            </div>
          </div>

          <button
            onClick={() => setActiveView('registration')}
            className="w-full py-2.5 px-4 rounded-xl border border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            Register for CSR Bootcamp 2026
          </button>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>AIMA Secure Portal • Your data is protected</span>
        </div>
      </div>
    </div>
  );
};
