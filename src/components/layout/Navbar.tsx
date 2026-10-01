import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { RoleSwitcher } from '../common/RoleSwitcher';
import {
  Award,
  BookOpen,
  Building2,
  Calendar,
  FileCheck,
  Globe,
  ArrowUpRight,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Moon,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sun,
  Trophy,
  User,
  Users,
  X,
  Zap,
  Sparkles,
  Sliders,
  ExternalLink,
  Bot,
  GraduationCap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    activeView,
    setActiveView,
    currentUser,
    switchRole,
    setActiveVerifierModal,
    setActiveSupportModal,
    openChatWithQuery,
    openRegistrationModal,
    participantUser,
    logoutParticipant,
  } = useCompetition();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const websiteNavItems = [
    { id: 'public', label: 'Home', fullTitle: 'India Case League 2026 - Home', icon: BookOpen },
    { id: 'registration', label: 'Registration', fullTitle: 'Registration & Participant Onboarding', icon: GraduationCap },
  ];

  const visibleWebsiteNav = websiteNavItems;

  const isAdminView = activeView === 'admin';
  const isPublicOrRegistration =
    activeView === 'public' ||
    activeView === 'registration' ||
    activeView === 'register' ||
    activeView === 'bootcamp_registration';

  if (isPublicOrRegistration) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      
      {/* Top Banner Notice - Executive Slate Bar */}
      <div className="bg-[#1E293B] text-slate-200 text-[11px] py-1.5 px-3 sm:px-5 lg:px-6 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          <span className="inline-flex items-center gap-1.5 font-bold text-blue-400 uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Official
          </span>
          <span className="truncate text-slate-300 font-medium text-xs">
            AIMA–ICRC India Case League 2026 • South Zone: 29 October 2026 (Bengaluru) • Grand Finale: 18–19 December 2026 (New Delhi)
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE 1: DEDICATED ADMIN SECRETARIAT APPBAR (NO WEBSITE MENUS) */}
      {/* ========================================================================= */}
      {isAdminView ? (
        <div className="w-full px-3 sm:px-5 lg:px-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Admin Identity & Status with Subtitle strictly below logo */}
            <div
              className="flex flex-col items-start justify-center cursor-pointer shrink-0 group py-0.5"
              onClick={() => setActiveView('admin')}
              title="AIMA-ICRC Secretariat Command"
            >
              <div className="flex items-center gap-2">
                <div className="h-7 px-2 rounded-lg bg-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 group-hover:border-red-400 transition-colors">
                  <img
                    src="/aima-icrc-logo.png"
                    alt="AIMA - ICRC Logo"
                    className="h-5 w-auto object-contain"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs sm:text-sm tracking-tight text-slate-900 dark:text-white uppercase whitespace-nowrap">
                    AIMA <span className="text-red-600 dark:text-red-400">• ICRC</span>
                  </span>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 uppercase tracking-wide whitespace-nowrap">
                    Admin
                  </span>
                </div>
              </div>
              <div className="text-[9px] font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-red-600 dark:group-hover:text-red-400 uppercase truncate mt-0.5 whitespace-nowrap transition-colors">
                India Case League • National Portal
              </div>
            </div>

            {/* Center: Real-time Live Telemetry Pill (Desktop) */}
            <div className="hidden xl:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">Phase: Round 2 Active</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-slate-500 dark:text-slate-400 whitespace-nowrap">944 Teams Allocated</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">Dual Blind Rubric</span>
            </div>

            {/* Right: Exit to Website + Role Switcher CTA + Theme Toggle */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              
              {/* Secretariat AI Assistant Quick Query in Admin */}
              <button
                onClick={() => openChatWithQuery()}
                className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Ask Secretariat AI: Rankings, Quiz Participants, Revenue"
              >
                <Bot className="w-3.5 h-3.5 text-indigo-500" />
                <span>Secretariat AI</span>
              </button>

              {/* Req Doc Button in Admin */}
              <button
                onClick={() => setActiveView('requirements')}
                className="h-9 hidden sm:inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="View Requirement Specification & Traceability Matrix"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Req Doc (SRS)</span>
              </button>

              {/* Return to Public Website CTA */}
              <button
                onClick={() => setActiveView('public')}
                className="h-9 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer shadow-xs whitespace-nowrap shrink-0"
                title="Return to Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                <span className="hidden sm:inline">Exit to Website</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </button>

              {/* Polished Persona Role Switcher */}
              <RoleSwitcher />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 transition-colors cursor-pointer shadow-xs shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 flex items-center justify-center lg:hidden rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE 2: STANDARD WEBSITE APPBAR (WITH WEBSITE MENUS & ADMIN CTA) */
        /* ========================================================================= */
        <div className="w-full px-3 sm:px-5 lg:px-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-16 gap-2">
            
            {/* Logo & Brand (Text strictly below Logo) */}
            <div
              className="flex flex-col items-start justify-center cursor-pointer shrink-0 group py-0.5"
              onClick={() => setActiveView('public')}
              title="AIMA-ICRC India Case League 2026 Portal"
            >
              <div className="h-7 px-2.5 rounded-lg bg-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs shrink-0 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
                <img
                  src="/aima-icrc-logo.png"
                  alt="AIMA - ICRC Logo"
                  className="h-5 w-auto object-contain"
                />
              </div>
              <div className="text-[9px] font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase truncate mt-0.5 whitespace-nowrap transition-colors">
                India Case League • National Portal
              </div>
            </div>

            {/* Desktop Website Nav Items (Only Home & Registration) */}
            <nav className="hidden sm:flex items-center gap-2 shrink-0">
              {visibleWebsiteNav.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    title={item.fullTitle}
                    className={`h-9 inline-flex items-center gap-2 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Dark / Light Mode Toggle + Mobile Menu Button */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-900 transition-colors cursor-pointer shadow-xs shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="h-9 w-9 flex items-center justify-center sm:hidden rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown (Only Home & Registration) */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1">
            Menu
          </div>

          <div className="space-y-1">
            {visibleWebsiteNav.map(item => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="font-bold text-xs">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

    </header>
  );
};


