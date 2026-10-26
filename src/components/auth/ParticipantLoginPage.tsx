import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Scale,
  RefreshCw,
  Volume2,
  ShieldAlert,
} from 'lucide-react';
import {
  signInWithEmailPassword,
  UserProfileRow,
  SupabaseParticipantRow,
} from '../../lib/supabase';
import { useCompetition } from '../../context/CompetitionContext';

interface ParticipantLoginPageProps {
  onLoginSuccess?: (participant: SupabaseParticipantRow) => void;
}

const CAPTCHA_CHARS = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';

export const ParticipantLoginPage: React.FC<ParticipantLoginPageProps> = ({ onLoginSuccess }) => {
  const { setActiveView, loginParticipantSession } = useCompetition();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loggedInProfile, setLoggedInProfile] = useState<UserProfileRow | null>(null);

  // Bot Protection & CAPTCHA states
  const [captchaCode, setCaptchaCode] = useState<string>('');
  const [userCaptcha, setUserCaptcha] = useState<string>('');
  const [captchaError, setCaptchaError] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [honeypot, setHoneypot] = useState<string>('');
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);
  const formLoadTimestamp = useRef<number>(Date.now());
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate a random 6-character alphanumeric CAPTCHA
  const generateCaptcha = useCallback(() => {
    setIsRefreshing(true);
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += CAPTCHA_CHARS.charAt(Math.floor(Math.random() * CAPTCHA_CHARS.length));
    }
    setCaptchaCode(code);
    setUserCaptcha('');
    setCaptchaError('');
    formLoadTimestamp.current = Date.now();
    setTimeout(() => setIsRefreshing(false), 300);
  }, []);

  // Draw the CAPTCHA canvas with noise lines, speckles, and rotated characters
  const drawCaptchaCanvas = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const width = 170;
    const height = 44;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f1f5f9');
    grad.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Random background dots / speckles
    for (let i = 0; i < 35; i++) {
      ctx.fillStyle = `rgba(${Math.floor(Math.random() * 140)}, ${Math.floor(Math.random() * 140)}, ${Math.floor(Math.random() * 200)}, 0.3)`;
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, Math.random() * 2 + 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Random noise lines
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.floor(Math.random() * 160)}, ${Math.floor(Math.random() * 160)}, ${Math.floor(Math.random() * 220)}, 0.5)`;
      ctx.lineWidth = Math.random() * 1.5 + 1;
      ctx.beginPath();
      ctx.moveTo(Math.random() * 20, Math.random() * height);
      ctx.bezierCurveTo(
        Math.random() * width,
        Math.random() * height,
        Math.random() * width,
        Math.random() * height,
        width - Math.random() * 20,
        Math.random() * height
      );
      ctx.stroke();
    }

    // High-contrast character palette
    const colors = ['#1e3a8a', '#1e40af', '#0f766e', '#b91c1c', '#6d28d9', '#4338ca', '#0369a1'];
    const charSpacing = width / (code.length + 0.6);

    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      ctx.save();
      const x = charSpacing * (i + 0.8);
      const y = height / 2 + (Math.random() * 6 - 3);
      ctx.translate(x, y);

      // Random rotation
      const angle = (Math.random() - 0.5) * 0.35;
      ctx.rotate(angle);

      ctx.font = `bold ${Math.floor(Math.random() * 3 + 21)}px monospace`;
      ctx.fillStyle = colors[i % colors.length];
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 2;
      ctx.fillText(char, 0, 0);
      ctx.restore();
    }
  }, []);

  // Initial generation
  useEffect(() => {
    generateCaptcha();
  }, [generateCaptcha]);

  // Redraw when code changes
  useEffect(() => {
    if (captchaCode) {
      drawCaptchaCanvas(captchaCode);
    }
  }, [captchaCode, drawCaptchaCanvas]);

  // Rate-limiting cooldown countdown
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setInterval(() => {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldownRemaining]);

  // Audio challenge accessibility
  const handleSpeakCaptcha = () => {
    if (!('speechSynthesis' in window) || !captchaCode) return;
    window.speechSynthesis.cancel();
    const spelled = captchaCode.split('').join(', ');
    const utterance = new SpeechSynthesisUtterance(`Security verification code is: ${spelled}`);
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCaptchaError('');

    // 1. Honeypot Bot Trap: Reject if hidden bot input was filled
    if (honeypot.trim()) {
      setError('Automated submission detected. Bot logins are prohibited.');
      return;
    }

    // 2. Cooldown Rate-Limit check
    if (cooldownRemaining > 0) {
      setError(`Too many failed attempts. Please wait ${cooldownRemaining}s before retrying.`);
      return;
    }

    // 3. Automated Sub-Second Bot Timing Trap
    const timeTaken = Date.now() - formLoadTimestamp.current;
    if (timeTaken < 600) {
      setError('Suspicious fast automated input detected. Please retry in a moment.');
      generateCaptcha();
      return;
    }

    // 4. CAPTCHA Validation
    const cleanUserCaptcha = userCaptcha.trim().toUpperCase();
    if (!cleanUserCaptcha) {
      setCaptchaError('Please enter the security verification code.');
      return;
    }

    if (cleanUserCaptcha !== captchaCode.toUpperCase()) {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      setCaptchaError('Incorrect security code. Please enter the new code shown.');
      generateCaptcha();

      if (newFails >= 5) {
        setCooldownRemaining(45);
      } else if (newFails >= 3) {
        setCooldownRemaining(15);
      }
      return;
    }

    // 5. Credentials Verification with Supabase
    setIsLoading(true);
    const result = await signInWithEmailPassword(email.trim(), password);
    setIsLoading(false);

    if (result.success && result.profile) {
      setFailedAttempts(0);
      const prof = result.profile;
      setLoggedInProfile(prof);

      if (prof.role === 'admin') {
        const authData = {
          user: prof.email,
          role: 'super_admin',
          token: 'aima_sec_' + Date.now().toString(36),
          loginTime: new Date().toISOString(),
        };
        sessionStorage.setItem('AIMA_ADMIN_AUTH_TOKEN_V1', JSON.stringify(authData));
        localStorage.setItem('AIMA_ADMIN_AUTH_TOKEN_V1', JSON.stringify(authData));
      } else if (prof.role === 'student' || prof.role === 'team_leader' || prof.role === 'team_member') {
        const participantRow: SupabaseParticipantRow = {
          registration_number: prof.registration_number || '',
          registration_mode: 'individual',
          institute_name: prof.organization_name || 'Academic Institution',
          username: prof.email,
          email: prof.email,
          password_hash: '',
          name: prof.name,
          mobile: prof.mobile || null,
          program: prof.program || null,
          semester: prof.semester || null,
          enrolment_number: prof.enrolment_number || null,
          is_team_leader: prof.is_team_leader,
        };
        loginParticipantSession(participantRow);
        onLoginSuccess?.(participantRow);
      }
    } else {
      const newFails = failedAttempts + 1;
      setFailedAttempts(newFails);
      generateCaptcha();
      setError(result.error || 'Authentication failed. Please check your credentials and try again.');

      if (newFails >= 5) {
        setCooldownRemaining(45);
      } else if (newFails >= 3) {
        setCooldownRemaining(15);
      }
    }
  };

  const handleNavigateToPortal = () => {
    if (!loggedInProfile) return;
    switch (loggedInProfile.role) {
      case 'admin':
        setActiveView('admin');
        break;
      case 'evaluator':
        setActiveView('evaluator');
        break;
      case 'institute_coordinator':
        setActiveView('institute');
        break;
      case 'student':
      case 'team_leader':
      case 'team_member':
      default:
        setActiveView('student');
        break;
    }
  };

  const getPortalLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Go to Executive Admin Control Center';
      case 'evaluator':
        return 'Go to Jury Evaluation Station';
      case 'institute_coordinator':
        return 'Go to Institute Coordinator Portal';
      case 'student':
      case 'team_leader':
      default:
        return 'Go to My Student Workspace';
    }
  };

  if (loggedInProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-md w-full space-y-6">
          {/* Success Card */}
          <div className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 shadow-xl space-y-5 text-center">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Welcome back!</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{loggedInProfile.name}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-2 text-left text-xs">
              {loggedInProfile.organization_name && (
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                  <span className="font-semibold">{loggedInProfile.organization_name}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-4 h-4 text-blue-500 shrink-0" />
                <span>{loggedInProfile.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4 text-blue-500 shrink-0" />
                <span className="capitalize font-semibold text-blue-600 dark:text-blue-400">
                  {loggedInProfile.role.replace('_', ' ')}
                </span>
                {loggedInProfile.is_team_leader && (
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-bold text-[10px]">
                    Team Leader
                  </span>
                )}
              </div>
              {loggedInProfile.registration_number && (
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span className="font-mono text-[10px]">Ref: {loggedInProfile.registration_number}</span>
                </div>
              )}
            </div>
            <button
              onClick={handleNavigateToPortal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>{getPortalLabel(loggedInProfile.role)}</span>
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
              src="/aima-icrc-logo.png"
              alt="AIMA - ICRC Logo"
              className="h-10 w-auto object-contain"
            />
          </div>
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-700/50">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>AIMA-ICRC Unified Portal • India Case League 2026</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Sign In to Your Workspace
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Enter your email and password to access your Student, Jury, Institution, or Secretariat Portal.
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

            {/* Hidden honeypot field for bot trapping */}
            <div
              style={{
                position: 'absolute',
                opacity: 0,
                zIndex: -1,
                pointerEvents: 'none',
                height: 0,
                width: 0,
                overflow: 'hidden',
              }}
              aria-hidden="true"
            >
              <input
                type="text"
                name="bot_trap_honey"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Anti-Bot Security CAPTCHA */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700 dark:text-slate-300">
                  Security Verification (CAPTCHA)
                </label>
                <span className="text-[10px] text-slate-400 font-medium">Case-insensitive</span>
              </div>

              {/* Captcha Canvas & Control Actions */}
              <div className="flex items-center gap-2">
                <div
                  onClick={generateCaptcha}
                  className="relative rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center select-none shadow-inner shrink-0 cursor-pointer group"
                  title="Click image to refresh verification code"
                >
                  <canvas
                    ref={canvasRef}
                    style={{ width: '170px', height: '44px' }}
                    className="block"
                  />
                  <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-300">
                    Click to refresh
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={generateCaptcha}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                    title="Generate new verification code"
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>

                  {'speechSynthesis' in window && (
                    <button
                      type="button"
                      onClick={handleSpeakCaptcha}
                      className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
                      title="Audio challenge: read out code aloud"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Captcha Text Input */}
              <div className="relative">
                <input
                  id="participant-login-captcha"
                  type="text"
                  value={userCaptcha}
                  onChange={(e) => {
                    setUserCaptcha(e.target.value.toUpperCase());
                    if (captchaError) setCaptchaError('');
                  }}
                  placeholder="Enter the 6-character code shown above"
                  maxLength={6}
                  required
                  autoComplete="off"
                  spellCheck="false"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border font-mono tracking-widest uppercase font-bold text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden ${
                    captchaError
                      ? 'border-red-400 bg-red-50/50 dark:bg-red-950/20 text-red-900 dark:text-red-200'
                      : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white'
                  }`}
                />
                <ShieldAlert className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>

              {captchaError && (
                <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{captchaError}</span>
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              id="participant-login-submit"
              disabled={isLoading || cooldownRemaining > 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : cooldownRemaining > 0 ? (
                <>
                  <AlertCircle className="w-4 h-4" />
                  <span>Rate Limited ({cooldownRemaining}s)</span>
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
            Register for National Online Quiz 2026
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
