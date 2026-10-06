import React from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CardContainer, CardItem } from '../ui/AceternityCard3D';
import {
  Trophy,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Brain,
  FileCheck,
  Lightbulb,
  Receipt,
  Sun,
  Moon,
  Award
} from 'lucide-react';

interface PosterHero3DProps {
  onScrollToForm: () => void;
  onOpenFeeModal?: () => void;
}

export const PosterHero3D: React.FC<PosterHero3DProps> = ({ onScrollToForm, onOpenFeeModal }) => {
  const { theme, toggleTheme, setActiveView } = useCompetition();
  const stages = [
    {
      step: '01-02',
      title: 'NATIONAL ONLINE QUIZ | CASE STUDY QUIZ',
      date: '29 October 2026',
      desc: 'Test your business awareness, analytical thinking, management knowledge and understanding of contemporary business and policy case.',
      icon: Brain,
      gradient: 'from-blue-600 to-cyan-500',
      borderAccent: 'border-blue-500/20 dark:border-blue-500/30',
      badgeBg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/20',
      stageLabel: 'Stage 01-02',
      roundBadge: 'Official Round',
    },
    {
      step: '03',
      title: 'REGIONAL LIVE BUSINESS CASE CHALLENGE',
      date: '29 October 2026 • South Zone (Bengaluru)',
      desc: 'Face-to-Face at AIMA-ICRC Regional Hubs. Solve a Live Corporate Case Challenge and present before corporate leaders & academicians.',
      icon: MapPin,
      gradient: 'from-amber-500 to-amber-600',
      borderAccent: 'border-amber-500/40 dark:border-amber-500/50 ring-2 ring-amber-400/30',
      badgeBg: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-black',
      stageLabel: 'Stage 03',
      roundBadge: 'Official Round',
    },
    {
      step: '04',
      title: 'NATIONAL GRAND FINALE',
      date: '18–19 December 2026 • New Delhi',
      desc: 'Regional winners compete in a National Policy & Governance Case Challenge and present their strategy before a distinguished national jury.',
      icon: Trophy,
      gradient: 'from-indigo-600 to-purple-600',
      borderAccent: 'border-purple-500/20 dark:border-purple-500/30',
      badgeBg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/20',
      stageLabel: 'Stage 04',
      roundBadge: 'Official Round',
    },
    {
      step: '70°',
      title: 'AIMA PLATINUM JUBILEE 2027',
      date: '70 Years of Excellence • 1957–2027',
      desc: "India Case League 2026 is proudly presented under AIMA's 70th Platinum Jubilee - celebrating 70 years of shaping India's management thought and leadership.",
      icon: Sparkles,
      logoUrl: '/aima-70-platinum-jubilee.jpg',
      gradient: 'from-amber-500 via-yellow-400 to-orange-400',
      borderAccent: 'border-amber-400/50 dark:border-amber-400/60 ring-2 ring-amber-400/40',
      badgeBg: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-black',
      stageLabel: 'Platinum Jubilee',
      roundBadge: '1957 – 2027',
      isJubilee: true,
    },
  ];

  const whyPoints = [
    'Solve Real Business Problems',
    'Compete Nationally',
    'Interact with CXOs',
    'Demonstrate Leadership',
    'Gain Industry Exposure',
    'Build Professional Profile',
    'Win National Recognition',
  ];

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-slate-100 via-white to-slate-100/90 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800/80 pt-8 pb-12 sm:pt-12 sm:pb-16 shadow-lg dark:shadow-2xl mb-8 transition-colors duration-200">
      {/* Background Lighting & Grid (Edge-to-Edge like Home Page) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e135_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e135_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container - Full Width Max-7XL (Matches Home Page Hero) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ============================================================== */}
        {/* TOP LANDSCAPE BAR: BRAND IDENTITY + STATUS BADGES + SECRETARIAT */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80">
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveView('public')}
            title="AIMA-ICRC India Case League 2026 Home"
          >
            <div className="h-10 px-3.5 rounded-xl bg-white border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-xs shrink-0 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-colors">
              <img
                src="/aima-icrc-logo.png"
                alt="AIMA - ICRC Logo"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400 group-hover:text-amber-500 transition-colors">
                ALL INDIA MANAGEMENT ASSOCIATION (AIMA)
              </div>
              <div className="text-xs text-slate-700 dark:text-slate-300 font-semibold flex items-center gap-1.5 flex-wrap">
                <span>India Case Research Centre (ICRC)</span>
                <span className="text-slate-400 dark:text-slate-500 hidden sm:inline">•</span>
                <span className="text-blue-600 dark:text-blue-400 font-bold">National Competition</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setActiveView('public')}
              className="h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs text-xs font-bold shrink-0"
              title="Return to Home"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Registrations Open
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              National Level
            </span>

            {/* Dark / Light Mode Toggle: Right Top Corner */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 px-3.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-500 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-200">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MAIN LANDSCAPE GRID (SIDE-BY-SIDE PANORAMIC LAYOUT)             */}
        {/* Left: Headline, Value Prop, Highlights & CTA                    */}
        {/* Right: 3D Aceternity 4-Stage Roadmap Matrix                     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

          {/* LEFT COLUMN: HERO INFORMATION & ACTION (5 Cols on Large) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-400/30 text-blue-700 dark:text-blue-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                <span>India&apos;s National Student Case Competition</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                INDIA CASE LEAGUE{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 dark:from-blue-400 dark:via-teal-300 dark:to-amber-300">
                  2026
                </span>
              </h1>

              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                FROM CLASSROOMS TO BOARDROOMS: FROM IDEAS TO NATIONAL IMPACT.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 dark:bg-white/5 border border-amber-500/20 dark:border-white/10 text-amber-800 dark:text-amber-300 font-bold text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>Think. Analyse. Solve. Compete. Lead.</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                AIMA–India Case Research Centre (ICRC) invites students from institutions across India to participate in the <strong>India Case League 2026</strong>, a premier national platform testing strategic problem-solving on live business and policy challenges.
              </p>
            </div>

            {/* Participation Quick Summary & CTA */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-xs">
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Who Can Participate?</span>
                  <span className="font-bold text-slate-900 dark:text-white text-xs block truncate">Institutions Across India</span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-300 font-semibold block">Team: 3–4 Students or Solo</span>
                </div>

                <div
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-0.5 shadow-xs"
                >
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Participation Fee</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400 text-xs block">₹200 / person</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Flat fee, all students</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onScrollToForm}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-700 hover:to-indigo-600 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/25 hover:scale-[1.01] border border-blue-400/30"
              >
                <span>Register Now • Access Quiz</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="text-[10px] text-center font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
                REGISTER. COMPETE. SOLVE FOR INDIA.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D ACETERNITY 4-STAGE ROADMAP MATRIX (7 Cols on Large) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <CardContainer
              containerClassName="w-full h-full py-0"
              className="w-full h-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-3"
            >
              {/* Card Container Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
                  <h3 className="font-black text-slate-900 dark:text-white text-xs sm:text-sm uppercase tracking-wider">
                    COMPETITION JOURNEY &amp; NATIONAL HONOURS
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  Online Quiz ➔ Case Challenge ➔ Regional Hubs ➔ Grand Finale &amp; Awards
                </span>
              </div>

              {/* 2x2 Landscape Stage Quadrants with 3D Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {stages.map((st) => {
                  const IconComponent = st.icon;

                  // Special rendering for the Jubilee card
                  if ((st as any).isJubilee) {
                    return (
                      <CardItem
                        key={st.step}
                        translateZ={30}
                        className={`p-0 rounded-2xl border-2 ${st.borderAccent} shadow-lg overflow-hidden flex flex-col justify-between group relative`}
                      >
                        {/* Jubilee shimmer background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-orange-950/40 pointer-events-none" />
                        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(251,191,36,0.18),transparent_60%)] pointer-events-none" />

                        {/* Jubilee badge */}
                        <div className="absolute -top-0.5 -right-0.5 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-amber-500 to-orange-400 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
                            <Sparkles className="w-2.5 h-2.5" />
                            Platinum Jubilee
                          </span>
                        </div>

                        <div className="relative z-[1] p-3.5 flex flex-col justify-between h-full space-y-2">
                          {/* Logo prominently shown */}
                          <div className="flex items-center justify-center bg-white dark:bg-slate-900/80 rounded-xl border border-amber-200 dark:border-amber-700/50 shadow-sm overflow-hidden">
                            <img
                              src={st.logoUrl}
                              alt="AIMA 70th Platinum Jubilee Logo"
                              className="w-full h-auto max-h-[64px] object-contain p-1.5"
                            />
                          </div>

                          <div>
                            <h4 className="font-black text-xs text-amber-700 dark:text-amber-300 group-hover:text-amber-600 dark:group-hover:text-amber-200 transition-colors uppercase tracking-wide">
                              {st.title}
                            </h4>
                            <div className="text-[10px] font-bold text-orange-600 dark:text-orange-300 mt-0.5">
                              {st.date}
                            </div>
                          </div>

                          <p className="text-[10.5px] text-slate-600 dark:text-slate-300 leading-snug">
                            {st.desc}
                          </p>

                          <div className="pt-1.5 border-t border-amber-200 dark:border-amber-700/40 flex items-center justify-between text-[10px]">
                            <span className="text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
                              <Trophy className="w-3 h-3" />
                              {st.stageLabel}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full font-black ${st.badgeBg}`}>
                              {st.roundBadge}
                            </span>
                          </div>
                        </div>
                      </CardItem>
                    );
                  }

                  return (
                    <CardItem
                      key={st.step}
                      translateZ={25}
                      className={`p-3.5 rounded-2xl bg-slate-50/90 dark:bg-white/5 border ${st.borderAccent} hover:border-blue-500 dark:hover:border-blue-400/60 shadow-xs transition-all flex flex-col justify-between space-y-2 group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div
                            className={`min-w-[28px] h-7 px-2 rounded-lg bg-gradient-to-br ${st.gradient} text-white font-black text-[11px] sm:text-xs flex items-center justify-center shadow-md whitespace-nowrap tracking-tight shrink-0`}
                          >
                            {st.step}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {st.logoUrl && (
                              <img
                                src={st.logoUrl}
                                alt="AIMA ICRC Logo"
                                className="h-5 w-auto object-contain bg-white dark:bg-slate-900 p-0.5 rounded-md border border-slate-200 dark:border-slate-700 shadow-xs"
                              />
                            )}
                            <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors" />
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                            {st.title}
                          </h4>
                          <div className="text-[10px] font-bold text-amber-600 dark:text-amber-300">
                            {st.date}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                          {st.desc}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500 dark:text-slate-400 font-medium">
                          {st.stageLabel || `Stage ${st.step}`}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${st.badgeBg}`}>
                          {st.roundBadge || 'Official Round'}
                        </span>
                      </div>
                    </CardItem>
                  );
                })}
              </div>

              {/* Landscape Bottom Badges inside the Card */}
              <div className="pt-2 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 flex-wrap gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  National Dual-Blind Evaluation Standards
                </span>
                <span className="text-amber-600 dark:text-amber-300 font-bold">
                  Distinguished National Jury &amp; CXO Interaction
                </span>
              </div>
            </CardContainer>
          </div>

        </div>

        {/* ============================================================== */}
        {/* BOTTOM LANDSCAPE RIBBON: WHY PARTICIPATE + SECRETARIAT CONTACTS */}
        {/* ============================================================== */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          {/* Why Participate Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 block">
              Why Participate in India Case League 2026:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {whyPoints.map((pt) => (
                <span
                  key={pt}
                  className="px-2.5 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-400/20 text-slate-700 dark:text-slate-300 text-[11px] font-medium flex items-center gap-1 shadow-2xs"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>{pt}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Helpdesk & Secretariat Links */}
          <div className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 md:text-right shrink-0">
            <div>
              <strong className="text-slate-900 dark:text-white">National: </strong>
              <span className="text-blue-600 dark:text-blue-300 font-semibold">Dr. Anuja Pandey (011-47673009 Extn 709)</span> •{' '}
              <strong className="text-slate-900 dark:text-white">South Zone: </strong>
              <span className="text-amber-600 dark:text-amber-300 font-semibold">Dr. Shwetha Kumari (7795075348)</span> •{' '}
              <strong className="text-slate-900 dark:text-white">Registration: </strong>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Shini James (+91 9971479392)</span>
            </div>
            <div className="flex items-center md:justify-end gap-3 text-blue-600 dark:text-blue-400 font-medium flex-wrap">
              <a href="mailto:caseresearchcentre@aima.in" className="hover:underline">
                caseresearchcentre@aima.in
              </a>
              <span>•</span>
              <a href="https://www.aima.in" target="_blank" rel="noreferrer" className="hover:underline">
                www.aima.in
              </a>
              <span>•</span>
              <a href="https://www.caseresearchaima.in" target="_blank" rel="noreferrer" className="hover:underline">
                www.caseresearchaima.in
              </a>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
