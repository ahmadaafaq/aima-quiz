import React from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import {
  FileText,
  RefreshCw,
  AlertTriangle,
  Lock,
  Phone,
  LogIn,
  LogOut,
  Home,
  GraduationCap,
  ArrowLeft,
  Sun,
  Moon,
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  badge: string;
  lastUpdated?: string;
  activeTab: 'terms' | 'refund' | 'disclaimer' | 'privacy' | 'contact';
  children: React.ReactNode;
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  title,
  subtitle,
  badge,
  lastUpdated = 'October 2026',
  activeTab,
  children,
}) => {
  const {
    theme,
    toggleTheme,
    setActiveView,
    participantUser,
    logoutParticipant,
  } = useCompetition();
  const loggedInParticipant = participantUser;

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [activeTab]);

  const navigateToLegal = (view: string) => {
    setActiveView(view);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const navTabs = [
    { id: 'terms', label: 'Terms & Conditions', icon: FileText, view: 'terms' },
    { id: 'refund', label: 'Refund Policy', icon: RefreshCw, view: 'refund_policy' },
    { id: 'disclaimer', label: 'Disclaimers', icon: AlertTriangle, view: 'disclaimer' },
    { id: 'privacy', label: 'Privacy Policy', icon: Lock, view: 'privacy_policy' },
    { id: 'contact', label: 'Contact Us', icon: Phone, view: 'contact_us' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ============================================================== */}
      {/* TOP HEADER: BRAND IDENTITY & GLOBAL NAVIGATION                */}
      {/* ============================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Logo and Branding */}
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => setActiveView('public')}
              title="Return to Home"
            >
              <div className="h-10 px-3 rounded-xl bg-white border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs shrink-0 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                <img
                  src="/aima-icrc-logo.png"
                  alt="AIMA - ICRC Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="hidden sm:block">
                <div className="text-[11px] font-black uppercase tracking-wider text-slate-900 dark:text-white">
                  ALL INDIA MANAGEMENT ASSOCIATION
                </div>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold tracking-wide flex items-center gap-1.5">
                  <span>India Case Research Centre (ICRC)</span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  <span className="text-slate-500 dark:text-slate-400 font-normal">India Case League 2026</span>
                </div>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setActiveView('public')}
                className="h-9 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="Return to Home"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Home</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveView('registration')}
                className="h-9 px-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                title="Register for National Online Quiz"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Register</span>
              </button>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Profile Avatar / Login + Logout at Top Right Corner */}
              {loggedInParticipant ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setActiveView('student')}
                    className="h-9 px-2.5 sm:px-3 rounded-xl bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer shadow-xs text-xs font-bold shrink-0"
                    title="Go to Student Dashboard"
                  >
                    <div className="w-5 h-5 rounded-lg bg-blue-600 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                      {loggedInParticipant.name ? loggedInParticipant.name.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <span className="max-w-[95px] sm:max-w-[130px] truncate">{loggedInParticipant.name || 'Dashboard'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      logoutParticipant('public');
                    }}
                    className="h-9 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs text-xs font-bold shrink-0"
                    title="Logout session"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('participant_login')}
                  className="h-9 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Participant Login"
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-500" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* HERO BANNER & BREADCRUMB                                       */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-b from-slate-100 via-white to-slate-100/60 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => setActiveView('public')}
              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer flex items-center gap-1"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Compliance &amp; Legal Policies</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-blue-600 dark:text-blue-400 font-bold">{title}</span>
          </div>

          {/* Title & Badge */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>{badge}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
                {subtitle}
              </p>
            </div>
          </div>

          {/* Compliance & Policy Nav Tabs */}
          <div className="pt-4 overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-2 min-w-max pb-1">
              {navTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => navigateToLegal(tab.view)}
                    className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-blue-500/25 ring-2 ring-blue-500/30'
                        : 'bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-blue-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ============================================================== */}
      {/* MAIN DOCUMENT BODY                                             */}
      {/* ============================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {children}
      </main>

      {/* ============================================================== */}
      {/* STATUTORY SECRETARIAT BANNER & FAST LINKS                      */}
      {/* ============================================================== */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-900/40 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2 text-center md:text-left">
              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>
                <strong>All India Management Association (AIMA)</strong> • Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003
              </span>
            </div>
            <div className="flex items-center gap-4 flex-wrap justify-center font-medium">
              <button onClick={() => navigateToLegal('terms')} className="hover:text-blue-600 hover:underline cursor-pointer">
                Terms &amp; Conditions
              </button>
              <button onClick={() => navigateToLegal('refund_policy')} className="hover:text-blue-600 hover:underline cursor-pointer">
                Refund Policy
              </button>
              <button onClick={() => navigateToLegal('disclaimer')} className="hover:text-blue-600 hover:underline cursor-pointer">
                Disclaimers
              </button>
              <button onClick={() => navigateToLegal('privacy_policy')} className="hover:text-blue-600 hover:underline cursor-pointer">
                Privacy Policy
              </button>
              <button onClick={() => navigateToLegal('contact_us')} className="hover:text-blue-600 hover:underline cursor-pointer">
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
