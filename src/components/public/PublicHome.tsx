import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { ThreeHeroCanvas } from '../ui/ThreeHeroCanvas';
import { AceternitySpotlight } from '../ui/AceternitySpotlight';
import { MovingBorderButton } from '../ui/MovingBorderButton';
import { CardContainer, CardItem } from '../ui/Aceternity3DCard';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Download,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  Mail,
  MapPin,
  Phone,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  X,
  Zap,
  Sun,
  Moon,
} from 'lucide-react';

export const PublicHome: React.FC = () => {
  const { setActiveView, theme, toggleTheme } = useCompetition();

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  // 7 Official Why Participate Points directly from India_Case_League_2026.pdf
  const whyParticipatePoints = [
    { title: 'Solve Real Business Problems', desc: 'Tackle genuine operational and strategic dilemmas sourced from corporate and public sector contexts.' },
    { title: 'Compete Nationally', desc: 'Challenge your peers from approved undergraduate and postgraduate institutions across India.' },
    { title: 'Interact with CXOs', desc: 'Present and defend your strategic recommendations directly before corporate leaders and jury panels.' },
    { title: 'Demonstrate Leadership', desc: 'Lead high-performing teams under strict competitive deadlines and dynamic case constraints.' },
    { title: 'Gain Industry Exposure', desc: 'Engage with practical industry challenges, root-cause analyses, and executive evaluations.' },
    { title: 'Build Your Professional Profile', desc: 'Distinguish yourself with demonstrable decision-making, policy analysis, and strategic credentials.' },
    { title: 'Get National Recognition', desc: 'Elevate your institution and personal standing on a premier national academic platform.' },
  ];

  // Leadership & Convenors directly from India_Case_League_2026.pdf
  const leadershipMembers = [
    { name: 'Dr. A. Vinay Kumar', title: 'Vice Chancellor, IFHE Hyderabad' },
    { name: 'Dr. Muddu Vinay', title: 'Pro-Vice-Chancellor & Campus Head, IFHE Bengaluru' },
    { name: 'Prof. (Dr.) Rohit Singh', title: 'Director, Centre for Management Education, AIMA' },
    { name: 'Sanjib Dutta', title: 'Vice President, IBS Case Research Center, IFHE Hyderabad' },
    { name: 'Dr. Anuja Pandey', title: 'Head, India Case Research Centre; Professor of Marketing, AIMA' },
    { name: 'Prof. (Dr.) Vinay Joshi', title: 'Academic Dean, IFHE Bengaluru' },
    { name: 'Dr. Shwetha Kumari', title: 'Head, Case Research Centre, IFHE Bengaluru' },
  ];

  return (
    <div className="space-y-16 pb-24 animate-in fade-in duration-300">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION WITH 3D CANVAS & SPOTLIGHT                    */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-14 pb-20 border-b border-slate-800/80">
        
        {/* Aceternity Spotlight Beams */}
        <AceternitySpotlight
          className="-top-40 left-0 md:left-40 md:-top-20"
          fill="#38bdf8"
        />
        <AceternitySpotlight
          className="top-10 right-0 md:right-40"
          fill="#a855f7"
        />

        {/* Ambient Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.16),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b30_1px,transparent_1px),linear-gradient(to_bottom,#1e293b30_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Top Integrated Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-10 px-3.5 rounded-xl bg-white border border-slate-800 flex items-center justify-center shadow-xs shrink-0">
                <img
                  src="/aima-icrc-logo.png"
                  alt="AIMA - ICRC Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  ALL INDIA MANAGEMENT ASSOCIATION (AIMA)
                </div>
                <div className="text-xs text-slate-300 font-semibold flex items-center gap-1.5 flex-wrap">
                  <span>India Case Research Centre (ICRC)</span>
                  <span className="text-slate-500 hidden sm:inline">•</span>
                  <span className="text-blue-400 font-bold">National Student Case Competition</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setActiveView('registration')}
                className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-blue-500/20 cursor-pointer transition-all shrink-0"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Registration</span>
              </button>

              <button
                type="button"
                onClick={toggleTheme}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-xs shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">

              {/* Main Headline */}
              <div className="space-y-2">
                <div className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-amber-400">
                  COMPETITION JOURNEY: SOUTH ZONE
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
                  INDIA CASE LEAGUE{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
                    2026
                  </span>
                </h1>
                <p className="text-blue-300 text-sm sm:text-base font-semibold">
                  Your journey to the national stage • Think. Analyse. Solve. Compete. Lead.
                </p>
              </div>

              {/* Verbatim Description from Documents */}
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto lg:mx-0">
                AIMA–India Case Research Centre (ICRC) invites students from institutions across India to participate in the India Case League 2026, a national platform to test their ability to solve real business and policy challenges.
              </p>

              {/* South Zone Regional Highlight Callout */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-400/40 backdrop-blur-md text-left flex items-start gap-3 shadow-lg">
                <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider mb-1">
                    Featured Regional Hub
                  </span>
                  <div className="font-extrabold text-amber-300 text-sm">
                    SOUTH ZONE • 29 OCTOBER 2026 • BENGALURU
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    Host: IFHE Bengaluru • Regional Live Business Case Challenge
                  </div>
                </div>
              </div>

              {/* Verified Key Highlights Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Round 01–02</p>
                  <div className="text-sm font-extrabold text-white">29 Oct 2026</div>
                  <div className="text-sky-400 text-[10px]">Online Quiz</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-center">
                  <p className="text-amber-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Round 03 (Regional)</p>
                  <div className="text-sm font-extrabold text-amber-300">29 Oct 2026</div>
                  <div className="text-amber-200 text-[10px]">South Zone • Bengaluru</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Round 04 (Finale)</p>
                  <div className="text-sm font-extrabold text-white">18–19 Dec 2026</div>
                  <div className="text-purple-400 text-[10px]">New Delhi</div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Registration Fee</p>
                  <div className="text-sm font-extrabold text-emerald-400">₹200</div>
                  <div className="text-slate-400 text-[10px]">Per Student</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <MovingBorderButton
                  borderRadius="0.875rem"
                  onClick={() => setActiveView('registration')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-blue-500/30"
                >
                  <GraduationCap className="w-4 h-4 text-sky-200" />
                  <span>Register for Competition</span>
                  <ChevronRight className="w-4 h-4 text-sky-200" />
                </MovingBorderButton>

                <button
                  onClick={() => setShowRulesModal(true)}
                  className="px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <FileText className="w-4 h-4 text-blue-400" />
                  <span>Competition Rules</span>
                </button>

                <button
                  onClick={() => setShowBrochureModal(true)}
                  className="px-4 py-3.5 bg-slate-950/80 hover:bg-slate-900 text-slate-300 text-xs sm:text-sm font-semibold rounded-2xl border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Brochure (PDF)</span>
                </button>
              </div>

            </div>

            {/* Right Column: 3D Interactive Canvas */}
            <div className="lg:col-span-5 relative w-full h-[360px] sm:h-[440px] flex items-center justify-center">
              <div className="absolute inset-0 bg-radial from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none scale-125" />
              <ThreeHeroCanvas className="w-full h-full" />

              {/* Floating Verified Callouts */}
              <div className="absolute top-3 right-3 p-3 rounded-2xl bg-slate-900/90 border border-amber-500/50 backdrop-blur-md shadow-lg hidden sm:block pointer-events-none z-10 text-left">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-300 uppercase">South Zone Hub</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">29 October 2026 • Bengaluru</div>
              </div>

              <div className="absolute bottom-3 left-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur-md shadow-lg hidden sm:block pointer-events-none z-10 text-left">
                <div className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-300 uppercase">National Grand Finale</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">18–19 December 2026 • New Delhi</div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. WHY PARTICIPATE? (VERBATIM FROM BROCHURE)                  */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Participant Value Proposition
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Why Participate?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Official benefits codified in the AIMA–ICRC India Case League 2026 Charter.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {whyParticipatePoints.map((item, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-blue-500/40 hover:shadow-md transition-all space-y-2 text-left"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs">
                0{idx + 1}
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}

          {/* Quick Registration CTA Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md flex flex-col justify-between space-y-3 text-left">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-sky-200">Get Started</span>
              <h3 className="font-extrabold text-base text-white mt-1">Ready to Compete?</h3>
              <p className="text-xs text-blue-100 leading-relaxed mt-1">
                Individual registration at ₹200 or institutional bulk nominations for 3–4 member student teams.
              </p>
            </div>
            <button
              onClick={() => setActiveView('registration')}
              className="w-full py-2.5 px-4 rounded-xl bg-white text-blue-700 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              <span>Go to Registration</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. THE PROGRESSIVE COMPETITION ARCHITECTURE (4 ROUNDS)        */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Competition Framework
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            The Progressive 4-Round Architecture
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Move progressively from analytical knowledge assessment to live corporate strategy and national policy governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Round 01-02 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all space-y-4">
              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="min-w-[52px] h-9 px-3 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-xs sm:text-sm flex items-center justify-center whitespace-nowrap tracking-tight shrink-0">
                  01-02
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  29th October 2026
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Round 01–02: National Online Quiz | Case Study Quiz
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Test your business awareness, analytical thinking, management knowledge and understanding of contemporary business and policy case.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Curriculum:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Management &amp; Policy</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Format:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Online Timed Assessment</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Evaluation:</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">Automated System Scoring</span>
                </div>
              </CardItem>
            </div>
          </CardContainer>

          {/* Round 03 Card - HIGHLIGHTED SOUTH ZONE */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-400/80 shadow-lg shadow-amber-500/10 hover:shadow-2xl transition-all space-y-4 relative">
              <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Featured South Zone</span>
              </div>

              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                  03
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  29th October 2026
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Round 03: Regional Live Business Case Challenge
                </h3>
                <div className="mt-1.5 inline-block text-[11px] font-extrabold text-amber-600 dark:text-amber-400">
                  📍 South Zone • Bengaluru (IFHE Bengaluru)
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Face-to-Face at AIMA–ICRC Regional Hubs. Take on a Live Corporate Business Case Challenge and present your solution before corporate leaders, industry experts and academicians.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Mode:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">In-Person at Regional Hub</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Focus:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Live Corporate Challenge</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Jury:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Corporate &amp; Academic Panel</span>
                </div>
              </CardItem>
            </div>
          </CardContainer>

          {/* Round 04 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all space-y-4">
              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center">
                  04
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  18th–19th Dec 2026
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Round 04: National Grand Finale
                </h3>
                <div className="mt-1.5 inline-block text-[11px] font-semibold text-purple-600 dark:text-purple-400">
                  🏛️ New Delhi • National Stage
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  Regional winners compete in a National Policy &amp; Governance Case Challenge and present their strategy before a distinguished national jury.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-2 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span className="font-medium">Theme:</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">Solve for India</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Domain:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">National Policy &amp; Governance</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Jury:</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-200">Distinguished National Jury</span>
                </div>
              </CardItem>
            </div>
          </CardContainer>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. GENERAL RULES & PARTICIPANT GUIDELINES                    */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-10 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                General Rules for Participants
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                Eligibility &amp; Competition Regulations
              </h2>
            </div>
            <button
              onClick={() => setShowRulesModal(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer self-start sm:self-auto transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Read Full Framework</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-amber-400 text-xs uppercase flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                <span>Eligibility</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Open to eligible undergraduate and postgraduate students across management, engineering and other approved disciplines.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-sky-400 text-xs uppercase flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                <span>Team Composition</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Teams shall consist of 3–4 registered students. Each participant may be in only one team. One member must be nominated as Team Leader.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-emerald-400 text-xs uppercase flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Registration Fee</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                ₹200 initial registration structure for individual participant or bulk payment by institute on bulk upload roster.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
              <div className="font-bold text-purple-400 text-xs uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Generative AI Policy</span>
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                AI may support research or language. The team&apos;s diagnosis, judgment, recommendation and defence before the jury must remain its own.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. PEOPLE & LEADERSHIP CONVENORS                             */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Academic &amp; Institutional Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            People &amp; Contacts: Leadership and Convenors
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Distinguished academic leaders steering the India Case League 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {leadershipMembers.map((member, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-2 text-left"
            >
              <div>
                <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center mb-2">
                  {member.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. OFFICIAL SECRETARIAT CONTACT DETAILS                       */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Direct Communication Lines
            </span>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Official Contact &amp; Registration Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            {/* National Coordinator */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                National Coordinator
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Dr. Anuja Pandey</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">Head, AIMA India Case Research Centre</div>
              <div className="text-slate-500 dark:text-slate-400 text-[11px]">All India Management Association</div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1">
                <div>Tel: 011-47673009, 47673000, 49868399 Extn.: 709</div>
                <div>Email: apandey@aima.in, caseresearchcentre@aima.in</div>
              </div>
            </div>

            {/* South Zone Coordinator */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 block">
                South Zone Coordinator
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Dr. Shwetha Kumari</div>
              <div className="text-slate-700 dark:text-slate-300 text-xs">Head, Case Research Centre, IFHE Bengaluru</div>
              <div className="pt-2 border-t border-amber-200 dark:border-amber-800/40 text-slate-700 dark:text-slate-300 space-y-1">
                <div>Email: shwethakumari@ibsindia.org</div>
                <div>Mobile: 7795075348</div>
              </div>
            </div>

            {/* Registration Inquiries */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                Registration Details
              </span>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Shini James</div>
              <div className="text-slate-600 dark:text-slate-400 text-xs">Manager, AIMA India Case Research Centre</div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 space-y-1">
                <div>Tel: 011-47673000, 49868399 Extn.: 726</div>
                <div>Mobile: +91 9971479392 • Email: sjames@aima.in</div>
                <div className="pt-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                  www.aima.in • www.caseresearchaima.in
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. FULL COMPETITION RULES MODAL                               */}
      {/* ------------------------------------------------------------- */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Official Document Reference
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  Competition Rules, Participant Guidelines &amp; Jury Framework
                </h3>
              </div>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900">
                <strong className="text-blue-950 dark:text-blue-200 block text-sm font-bold mb-1">
                  A. General Rules for Participants
                </strong>
                <ul className="list-disc pl-5 space-y-1 text-[11px]">
                  <li>The competition is open to eligible undergraduate and postgraduate students across management, engineering and other approved disciplines.</li>
                  <li>Every participant must register individually on the ICL portal.</li>
                  <li>Teams shall consist of 3–4 registered students.</li>
                  <li>Each participant may be a member of only one team.</li>
                  <li>One member must be nominated as the Team Leader.</li>
                  <li>Team composition will be locked after the notified deadline.</li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <strong className="text-slate-900 dark:text-white block text-sm font-bold mb-1">
                  B. Originality and Use of Generative AI
                </strong>
                <p className="text-[11px]">
                  AI may support research, brainstorming, language improvement, data analysis or visualisation unless a particular round expressly restricts it. The team&apos;s diagnosis, judgment, recommendation and defence before the jury must remain its own. Any material use of generative AI must be disclosed in the submission form.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-400/40">
                <strong className="text-amber-950 dark:text-amber-200 block text-sm font-bold mb-1">
                  C. Confidentiality &amp; Disqualification
                </strong>
                <p className="text-[11px]">
                  Live corporate and national cases may contain confidential information. Participants shall not circulate the case outside their team, upload it to public AI tools, or publicly release their solution. Automatic disqualification applies for impersonation, multi-team registration, deliberate plagiarism, or external assistance during closed live-analysis periods.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setShowRulesModal(false)}
                className="py-2 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-xs transition-colors"
              >
                Close Rulebook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 8. OFFICIAL BROCHURE DOWNLOAD MODAL                           */}
      {/* ------------------------------------------------------------- */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Official Competition Brochure
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                AIMA–ICRC India Case League 2026 South Zone Brochure
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400 text-left">
              <div className="flex justify-between">
                <span>File:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">India_Case_League_2026.pdf</span>
              </div>
              <div className="flex justify-between">
                <span>Location:</span>
                <span>South Zone • Bengaluru</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowBrochureModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <a
                href="/India_Case_League_2026.pdf"
                download="India_Case_League_2026.pdf"
                onClick={() => setShowBrochureModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
