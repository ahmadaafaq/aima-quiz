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
  } = useCompetition();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const websiteNavItems = [
    { id: 'public', label: 'Overview', fullTitle: 'Competition Overview & Eligibility Rules', icon: BookOpen },
    { id: 'student', label: 'Workspace', fullTitle: 'Student Participant Workspace & Submissions', icon: LayoutDashboard },
    { id: 'institute', label: 'Institutes', fullTitle: 'Institute Coordinator Portal & Roster', icon: Building2 },
    { id: 'evaluator', label: 'Jury', fullTitle: 'Jury Evaluation & Dual-Blind Scoring Station', icon: Scale },
    { id: 'regional_hub', label: 'Hubs', fullTitle: 'Regional Semi-Final Hubs & Slot Schedule', icon: MapPin },
    { id: 'corporate', label: 'Partners', fullTitle: 'Corporate Partner Desk & Talent Fast-Track', icon: ShieldCheck },
  ];

  const visibleWebsiteNav = websiteNavItems;

  const isAdminView = activeView === 'admin';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      
      {/* Top Banner Notice - Executive Slate Bar */}
      <div className="bg-[#1E293B] text-slate-200 text-[11px] py-1.5 px-3 sm:px-5 lg:px-6 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden truncate">
          <span className="inline-flex items-center gap-1.5 font-bold text-blue-400 uppercase tracking-widest text-[10px] px-2 py-0.5 rounded-md bg-blue-500/10 border border-blue-500/20 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live
          </span>
          <span className="truncate text-slate-300 font-medium text-xs">
            AIMA-ICRC India Case League 2026 • Round 2 Case Decks Open • Cash Pool ₹15,00,000+
          </span>
        </div>
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 text-slate-400 text-xs">
          <button
            onClick={() => openChatWithQuery()}
            className="hover:text-blue-300 text-blue-400 transition-colors font-semibold flex items-center gap-1.5 cursor-pointer whitespace-nowrap bg-blue-500/15 hover:bg-blue-500/25 px-2.5 py-0.5 rounded-md border border-blue-400/30 shadow-xs"
            title="Open AI Competition Assistant"
          >
            <Bot className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-bold">AI Assistant</span>
          </button>
          <button
            onClick={() => setActiveVerifierModal(true)}
            className="hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Verify Certificate</span>
          </button>
          <button
            onClick={() => setActiveSupportModal(true)}
            className="hover:text-blue-400 transition-colors font-medium flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">War-Room Support</span>
          </button>
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
                    src="https://www.aima.in/img/logo.png"
                    alt="AIMA Logo"
                    className="h-5 w-auto object-contain"
                    referrerPolicy="no-referrer"
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
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-5 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="text-[9px] font-bold tracking-wider text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 uppercase truncate mt-0.5 whitespace-nowrap transition-colors">
                India Case League • National Portal
              </div>
            </div>

            {/* Desktop Website Nav Items */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {visibleWebsiteNav.map(item => {
                const Icon = item.icon;
                const isActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    title={item.fullTitle}
                    className={`h-9 inline-flex items-center gap-1.5 px-2.5 xl:px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isActive
                        ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-xs font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Admin Panel Direct Button */}
              <button
                onClick={() => {
                  if (currentUser.role !== 'admin') {
                    switchRole('admin');
                  }
                  setActiveView('admin');
                }}
                title="AIMA-ICRC Secretariat Command & Control Center"
                className="h-9 inline-flex items-center gap-1.5 px-2.5 xl:px-3 ml-0.5 rounded-xl text-xs font-bold whitespace-nowrap bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 transition-all cursor-pointer shrink-0"
              >
                <Shield className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                <span>Admin</span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
              </button>
            </nav>

            {/* Right Controls: Register CTA + Req Doc CTA Button + Role Switcher + Dark Mode + Mobile Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              
              {/* Register Now CTA Button */}
              <button
                onClick={() => openRegistrationModal('team')}
                className="h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all cursor-pointer shrink-0 hover:scale-102"
                title="Register Student Team or Institutional Cohort"
              >
                <GraduationCap className="w-3.5 h-3.5 text-white" />
                <span>Register</span>
              </button>

              {/* Requirements Document (SRS) CTA Button in Appbar */}
              <button
                onClick={() => setActiveView('requirements')}
                className={`h-9 hidden md:inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-xs shrink-0 hover:scale-102 ${
                  activeView === 'requirements'
                    ? 'bg-amber-500 text-white border border-amber-600 shadow-sm'
                    : 'text-amber-800 dark:text-amber-300 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800'
                }`}
                title="View Interactive Requirements Specification & Live Traceability Matrix"
              >
                <FileCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Req Doc</span>
              </button>

              {/* Quick RBAC Role Switcher */}
              <RoleSwitcher />

              {/* Dark / Light Mode Toggle */}
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
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-1 animate-in slide-in-from-top-2 duration-150 shadow-xl">
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-3 py-1">
            {isAdminView ? 'Admin Quick Actions' : 'Website Navigation'}
          </div>

          {isAdminView ? (
            <div className="space-y-1">
              <button
                onClick={() => {
                  setActiveView('public');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Exit to Public Website</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
              </button>
            </div>
          ) : (
            <>
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
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div className="text-left">
                        <div className="font-bold text-xs">{item.label}</div>
                        <div className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                          {item.fullTitle}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}

              <button
                onClick={() => {
                  if (currentUser.role !== 'admin') {
                    switchRole('admin');
                  }
                  setActiveView('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4" />
                  <span>Admin Control Center</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-600 text-white font-bold">
                  Secretariat
                </span>
              </button>
            </>
          )}

          <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                setActiveView('requirements');
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
            >
              <FileCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              Req Doc
            </button>
            <button
              onClick={() => {
                setActiveVerifierModal(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              Verify Cert
            </button>
            <button
              onClick={() => {
                setActiveSupportModal(true);
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300"
            >
              <HelpCircle className="w-4 h-4 text-blue-500" />
              Helpdesk
            </button>
          </div>
        </div>
      )}

    </header>
  );
};


