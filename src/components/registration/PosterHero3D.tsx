import React from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CardContainer, CardItem } from '../ui/AceternityCard3D';
import {
  Trophy,
  Sparkles,
  MapPin,
  CheckCircle2,
  ArrowRight,
  Brain,
  FileCheck,
  Lightbulb,
  Receipt,
  Sun,
  Moon
} from 'lucide-react';

interface PosterHero3DProps {
  onScrollToForm: () => void;
  onOpenFeeModal?: () => void;
}

export const PosterHero3D: React.FC<PosterHero3DProps> = ({ onScrollToForm, onOpenFeeModal }) => {
  const { theme, toggleTheme } = useCompetition();
  const stages = [
    {
      step: '01',
      title: 'NATIONAL ONLINE QUIZ',
      date: '8–11 October 2026',
      desc: 'Test business awareness, analytical thinking & contemporary policy understanding.',
      icon: Brain,
      gradient: 'from-blue-600 to-cyan-500',
      borderAccent: 'border-blue-500/30',
      badgeBg: 'bg-blue-500/20 text-blue-300',
    },
    {
      step: '02',
      title: 'NATIONAL CASE CHALLENGE',
      date: 'Submission: 18 Oct 2026',
      desc: '2–3 Days To Analyse. Strategise. Build solutions for real-world industry challenges.',
      icon: FileCheck,
      gradient: 'from-cyan-600 to-teal-500',
      borderAccent: 'border-cyan-500/30',
      badgeBg: 'bg-cyan-500/20 text-cyan-300',
    },
    {
      step: '03',
      title: 'REGIONAL LIVE CHALLENGE',
      date: '29 October 2026',
      desc: 'Face-to-Face presentation round at designated AIMA-ICRC Regional Hubs across India.',
      icon: MapPin,
      gradient: 'from-indigo-600 to-blue-600',
      borderAccent: 'border-indigo-500/30',
      badgeBg: 'bg-indigo-500/20 text-indigo-300',
    },
    {
      step: '04',
      title: 'NATIONAL GRAND FINALE',
      date: '18–19 December 2026',
      desc: 'New Delhi • Policy & Governance Challenge before esteemed industry jury & CXOs.',
      icon: Trophy,
      gradient: 'from-amber-500 to-yellow-400',
      borderAccent: 'border-amber-500/30',
      badgeBg: 'bg-amber-500/20 text-amber-300',
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
    <section className="relative w-full overflow-hidden bg-slate-950 text-white border-b border-slate-800/80 pt-8 pb-12 sm:pt-12 sm:pb-16 shadow-2xl mb-8">
      {/* Background Lighting & Grid (Edge-to-Edge like Home Page) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b25_1px,transparent_1px),linear-gradient(to_bottom,#1e293b25_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 -mt-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-0 -ml-20 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container - Full Width Max-7XL (Matches Home Page Hero) */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* ============================================================== */}
        {/* TOP LANDSCAPE BAR: BRAND IDENTITY + STATUS BADGES + SECRETARIAT */}
        {/* ============================================================== */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="h-10 px-3.5 rounded-xl bg-white flex items-center justify-center shadow-md shrink-0">
              <img
                src="https://www.aima.in/img/logo.png"
                alt="AIMA Logo"
                className="h-7 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                ALL INDIA MANAGEMENT ASSOCIATION (AIMA)
              </div>
              <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 flex-wrap">
                <span>India Case Research Centre (ICRC)</span>
                <span className="text-slate-500 hidden sm:inline">•</span>
                <span className="text-blue-400 font-bold">National Competition</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Registrations Open
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-300 border border-blue-500/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              National Level
            </span>

            {/* Dark / Light Mode Toggle: Right Top Corner */}
            <button
              type="button"
              onClick={toggleTheme}
              className="h-9 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-500 text-slate-200 hover:text-white transition-all flex items-center gap-2 cursor-pointer shadow-md shrink-0"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">Dark</span>
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>India&apos;s National Student Case Competition</span>
              </div>

              <h1 className="text-3xl sm:text-4xl xl:text-5xl font-black tracking-tight text-white leading-tight">
                INDIA CASE LEAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-teal-300 to-amber-300">2026</span>
              </h1>

              <p className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-blue-300">
                FROM CLASSROOMS TO BOARDROOMS: FROM IDEAS TO NATIONAL IMPACT.
              </p>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-amber-300 font-bold text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Think. Analyse. Solve. Compete. Lead.</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                AIMA–India Case Research Centre (ICRC) invites students from institutions across India to participate in the <strong>India Case League 2026</strong>, a premier national platform testing strategic problem-solving on live business and policy challenges.
              </p>
            </div>

            {/* Participation Quick Summary & CTA */}
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-medium">Who Can Participate?</span>
                  <span className="font-bold text-white text-xs block truncate">Institutions Across India</span>
                  <span className="text-[10px] text-amber-300 block">Team: 3–4 Students or Solo</span>
                </div>

                <div
                  className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-0.5"
                >
                  <span className="text-[10px] text-slate-400 block font-medium">Participation Fee</span>
                  <span className="font-black text-emerald-400 text-xs block">₹200 / person</span>
                  <span className="text-[10px] text-slate-300 block">Flat fee, all students</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onScrollToForm}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 hover:scale-[1.01] border border-blue-400/30"
              >
                <span>Register Now • Access Quiz</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <div className="text-[10px] text-slate-400 text-center font-bold tracking-wider uppercase text-slate-300">
                REGISTER. COMPETE. SOLVE FOR INDIA.
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D ACETERNITY 4-STAGE ROADMAP MATRIX (7 Cols on Large) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <CardContainer
              containerClassName="w-full h-full py-0"
              className="w-full h-full bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md flex flex-col justify-between space-y-3"
            >
              {/* Card Container Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                  <h3 className="font-black text-white text-xs sm:text-sm uppercase tracking-wider">
                    COMPETITION JOURNEY (4-STAGE ROADMAP)
                  </h3>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Online Quiz ➔ Case Challenge ➔ Regional Hubs ➔ Grand Finale
                </span>
              </div>

              {/* 2x2 Landscape Stage Quadrants with 3D Depth */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {stages.map((st) => {
                  const IconComponent = st.icon;
                  return (
                    <CardItem
                      key={st.step}
                      translateZ={25}
                      className={`p-3.5 rounded-2xl bg-white/5 border ${st.borderAccent} hover:border-blue-400/60 transition-all flex flex-col justify-between space-y-2 group`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${st.gradient} text-white font-black text-xs flex items-center justify-center shadow-md`}
                          >
                            {st.step}
                          </div>
                          <IconComponent className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-300 transition-colors" />
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-white group-hover:text-blue-300 transition-colors">
                            {st.title}
                          </h4>
                          <div className="text-[10px] font-bold text-amber-300">
                            {st.date}
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-snug">
                          {st.desc}
                        </p>
                      </div>

                      <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400 font-medium">Stage {st.step}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold ${st.badgeBg}`}>
                          Official Round
                        </span>
                      </div>
                    </CardItem>
                  );
                })}
              </div>

              {/* Landscape Bottom Badges inside the Card */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-400 flex-wrap gap-2">
                <span className="flex items-center gap-1 font-semibold text-slate-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  National Dual-Blind Evaluation Standards
                </span>
                <span className="text-amber-300 font-bold">
                  Cash Pool &amp; CXO Mentorship
                </span>
              </div>
            </CardContainer>
          </div>

        </div>

        {/* ============================================================== */}
        {/* BOTTOM LANDSCAPE RIBBON: WHY PARTICIPATE + SECRETARIAT CONTACTS */}
        {/* ============================================================== */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
          {/* Why Participate Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Why Participate in India Case League 2026:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {whyPoints.map((pt) => (
                <span
                  key={pt}
                  className="px-2.5 py-0.5 rounded-lg bg-blue-500/10 border border-blue-400/20 text-slate-300 text-[11px] font-medium flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{pt}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Helpdesk & Secretariat Links */}
          <div className="text-[11px] text-slate-400 space-y-1 md:text-right shrink-0">
            <div>
              <strong className="text-white">ICRC Secretariats: </strong>
              <span className="text-amber-300">Dr. Anuja Pandey (Extn: 709)</span> •{' '}
              <span className="text-blue-300">Shini James (+91 9971479392)</span>
            </div>
            <div className="flex items-center md:justify-end gap-3 text-blue-400 font-medium flex-wrap">
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
