import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { ThreeHeroCanvas } from '../ui/ThreeHeroCanvas';
import { AceternitySpotlight } from '../ui/AceternitySpotlight';
import { MovingBorderButton } from '../ui/MovingBorderButton';
import { CardContainer, CardItem } from '../ui/Aceternity3DCard';
import { InfiniteMarquee } from '../ui/InfiniteMarquee';
import { InteractiveWorldMap } from '../ui/InteractiveWorldMap';
import {
  Award,
  BookOpen,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Cpu,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  Flame,
  Globe,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  MapPin,
  Scale,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap
} from 'lucide-react';

export const PublicHome: React.FC = () => {
  const {
    setActiveView,
    switchRole,
    announcements,
    hubs,
    config,
    setActiveVerifierModal,
    setActiveCertificateModal,
    certificates,
    setActiveSupportModal,
    openRegistrationModal,
  } = useCompetition();

  const [selectedHub, setSelectedHub] = useState(hubs[0]);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  // Participating Premier B-Schools
  const premierInstitutes = [
    { name: 'IIM Ahmedabad', sub: 'Centre for Management in Agriculture', badge: 'Tier 1' },
    { name: 'IIM Bangalore', sub: 'Management Innovation Park', badge: 'Host Hub' },
    { name: 'IIM Calcutta', sub: 'Finance & Strategy Lab', badge: 'Tier 1' },
    { name: 'FMS Delhi', sub: 'Faculty of Management Studies', badge: 'North Hub' },
    { name: 'XLRI Jamshedpur', sub: 'School of Business & HRM', badge: 'Tier 1' },
    { name: 'SPJIMR Mumbai', sub: 'Centre for Global Management', badge: 'West Hub' },
    { name: 'IIT Bombay (SJMSOM)', sub: 'Tech-Strategy Research', badge: 'Tier 1' },
    { name: 'MDI Gurgaon', sub: 'National Case Faculty', badge: 'Partner' },
    { name: 'ISB Hyderabad', sub: 'Executive Research Observatory', badge: 'Tier 1' },
    { name: 'IIT Guwahati (DoMS)', sub: 'North-East Regional Center', badge: 'Host Hub' },
  ];

  // Corporate & Jury Partners
  const corporatePartners = [
    { name: 'Tata Motors EV', sub: 'Strategic Case Partner 2026', badge: 'Case Sponsor' },
    { name: 'Reliance Industries', sub: 'Supply Chain Jury Panel', badge: 'PPO Partner' },
    { name: 'Mahindra & Mahindra', sub: 'Clean Mobility Strategy Desk', badge: 'Sponsor' },
    { name: 'Infosys Consulting', sub: 'Enterprise Digital Transformation', badge: 'Jury Partner' },
    { name: 'HDFC Bank', sub: 'Fintech & Capital Allocation Lead', badge: 'Banking Partner' },
    { name: 'Larsen & Toubro', sub: 'Infrastructure Rollout Expert', badge: 'Industry Desk' },
  ];

  const faqs = [
    {
      q: 'Who is eligible to participate in the AIMA-ICRC India Case League 2026?',
      a: 'All undergraduate and postgraduate management students enrolled in recognized universities, autonomous institutions, IITs, IIMs, and approved business schools across India. Teams consist of 3–4 students.',
    },
    {
      q: 'Can students from different institutions form a joint cross-institutional team?',
      a: 'Yes, as per AIMA-ICRC Section 5.2 regulations, cross-institutional collaborations are allowed provided each individual member is verified with a valid student ID and pays the individual Round 1/2 registration fee.',
    },
    {
      q: 'What is the fee structure for each stage?',
      a: 'Rounds 1 & 2 require an initial registration fee of ₹200 per student. Qualifying teams advancing to Round 3 (Regional Live Round) pay ₹2,000 per student. Finalists advancing to Round 4 (National Finale) pay ₹2,000 per student. Institutional bulk payments and sponsor waivers are supported.',
    },
    {
      q: 'How are Round 1 Online Quiz ties resolved?',
      a: 'Automatic evaluation applies strict tie-breaker sequences: (1) Higher total score, (2) Higher score in Analytical/Data Interpretation questions, (3) Lower total completion time, (4) Earlier submission timestamp.',
    },
    {
      q: 'What are the rules regarding Generative AI usage in Round 2 Case Decks?',
      a: 'AI may be used for preliminary research and proofreading; however, all core strategic frameworks, financial modeling, and original recommendations must be authored by students. Submissions undergo dual AI-similarity analysis and jury audit.',
    },
    {
      q: 'What are the prizes and placement benefits for winners?',
      a: 'National Champions receive ₹5,00,000 Cash + National Trophy. First Runner-Up receives ₹3,00,000. Second Runner-Up receives ₹2,00,000. All 10 Grand Finalist teams receive fast-track Pre-Placement Interviews (PPIs) & PPOs from sponsoring corporate conglomerates.',
    },
  ];

  return (
    <div className="space-y-20 pb-24 animate-in fade-in duration-300">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. HERO SECTION WITH 3D THREE.JS CANVAS & ACETERNITY SPOTLIGHT */}
      {/* ------------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-slate-950 text-white pt-16 pb-24 border-b border-slate-800/80">
        
        {/* Aceternity Spotlight Beams */}
        <AceternitySpotlight
          className="-top-40 left-0 md:left-40 md:-top-20"
          fill="#38bdf8"
        />
        <AceternitySpotlight
          className="top-10 right-0 md:right-40"
          fill="#a855f7"
        />

        {/* Ambient Neon Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.18),rgba(255,255,255,0))] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b30_1px,transparent_1px),linear-gradient(to_bottom,#1e293b30_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              
              {/* Accreditation Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-blue-400/30 text-blue-200 text-xs font-semibold tracking-wide backdrop-blur-md shadow-sm">
                <img
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-4.5 w-auto object-contain bg-white rounded px-1 py-0.5 shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="uppercase tracking-widest text-[11px] font-bold">All India Management Association • ICRC Case League</span>
              </div>

              {/* Main Headline with Neon Gradient Text */}
              <h1 className="text-4xl sm:text-6xl lg:text-6xl font-black tracking-tight leading-tight uppercase">
                INDIA CASE LEAGUE{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-400">
                  2026
                </span>
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal max-w-2xl mx-auto lg:mx-0">
                India’s premier 4-stage management case championship. Solve high-stakes corporate and national policy challenges, evaluated by distinguished industry CXOs and IIM faculty across 5 Regional Live Hubs.
              </p>

              {/* Key Quick Stat Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-center shadow-lg hover:border-sky-500/40 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Prize Pool</p>
                  <div className="text-lg sm:text-xl font-black text-white">₹15,00,000+</div>
                  <div className="text-emerald-400 text-[10px] font-medium mt-0.5">+ Fast-Track PPOs</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-center shadow-lg hover:border-sky-500/40 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Stages</p>
                  <div className="text-lg sm:text-xl font-black text-white">4 Stages</div>
                  <div className="text-sky-400 text-[10px] font-medium mt-0.5">Quiz to Grand Finale</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-center shadow-lg hover:border-sky-500/40 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Regional Hubs</p>
                  <div className="text-lg sm:text-xl font-black text-white">5 Hubs</div>
                  <div className="text-purple-400 text-[10px] font-medium mt-0.5">Pan-India Centers</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-center shadow-lg hover:border-sky-500/40 transition-colors">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Aspirants</p>
                  <div className="text-lg sm:text-xl font-black text-white">10,000+</div>
                  <div className="text-emerald-400 text-[10px] font-medium mt-0.5">Top B-Schools</div>
                </div>
              </div>

              {/* Hero Action CTAs */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4">
                
                {/* Moving Border Register Team Button */}
                <MovingBorderButton
                  borderRadius="0.875rem"
                  onClick={() => openRegistrationModal('team')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-6 py-3.5 shadow-lg shadow-blue-500/30"
                >
                  <GraduationCap className="w-4 h-4 text-sky-200" />
                  <span>Register Student Team</span>
                  <ChevronRight className="w-4 h-4 text-sky-200" />
                </MovingBorderButton>

                {/* Institutional Bulk Registration CTA */}
                <button
                  onClick={() => openRegistrationModal('institute')}
                  className="w-full sm:w-auto px-5 py-3.5 bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-bold text-xs sm:text-sm rounded-2xl border border-indigo-700/80 hover:border-indigo-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-indigo-950/40"
                >
                  <Building2 className="w-4 h-4 text-indigo-400" />
                  <span>Institutional Cohort (SPOC)</span>
                </button>

                {/* Direct Workspace Launcher Button */}
                <button
                  onClick={() => {
                    switchRole('team_leader');
                    setActiveView('student');
                  }}
                  className="w-full sm:w-auto px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <span>Student Workspace</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Admin Command Desk Button */}
                <button
                  onClick={() => {
                    switchRole('admin');
                    setActiveView('admin');
                  }}
                  className="w-full sm:w-auto px-4 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs sm:text-sm rounded-2xl border border-slate-700 hover:border-slate-500 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-red-500/10"
                >
                  <ShieldCheck className="w-4 h-4 text-red-400" />
                  <span>Admin</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                </button>

                {/* SRS Requirements Traceability Document Button */}
                <button
                  onClick={() => setActiveView('requirements')}
                  className="w-full sm:w-auto px-4 py-3.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 text-xs sm:text-sm font-bold rounded-2xl border border-amber-500/30 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md shadow-amber-500/10"
                >
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>SRS Req Doc</span>
                </button>

                {/* Brochure Download Button */}
                <button
                  onClick={() => setShowBrochureModal(true)}
                  className="w-full sm:w-auto px-4 py-3.5 bg-slate-950/80 hover:bg-slate-900 text-slate-300 text-xs font-semibold rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-blue-400" />
                  <span>Rules (PDF)</span>
                </button>
              </div>

            </div>

            {/* Right 3D Interactive Three.js Canvas (Free-floating & unconstrained) */}
            <div className="lg:col-span-5 relative w-full h-[400px] sm:h-[480px] lg:h-[540px] flex items-center justify-center overflow-visible">
              
              {/* Soft atmospheric ambient glow */}
              <div className="absolute inset-0 bg-radial from-sky-500/15 via-indigo-500/10 to-transparent blur-3xl pointer-events-none scale-125" />

              {/* Three.js Canvas Instance */}
              <ThreeHeroCanvas className="w-full h-full" />

              {/* Floating Floating Neon Metric Badges outside the globe radius */}
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-slate-800/60 backdrop-blur-md shadow-lg hidden sm:block pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Live AI Proctoring</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">ISO 27001 Certified</div>
              </div>

              <div className="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 p-2.5 sm:p-3 rounded-2xl bg-slate-900/80 border border-slate-800/60 backdrop-blur-md shadow-lg hidden sm:block pointer-events-none z-10">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] font-bold text-slate-300 uppercase">Grand Finale Trophy</span>
                </div>
                <div className="text-xs font-bold text-amber-300 mt-0.5">₹5,00,000 Champion Purse</div>
              </div>
            </div>

          </div>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 2. INFINITE MARQUEE CAROUSEL OF PREMIER B-SCHOOLS & SPONSORS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="text-center space-y-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Institutional Accreditation & Corporate Jury Network
          </p>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            Participating Premier Business Schools & Industry Partners
          </h2>
        </div>

        <div className="space-y-3 pt-2">
          {/* Institutes Marquee - Left Direction */}
          <InfiniteMarquee
            items={premierInstitutes}
            direction="left"
            speed="normal"
          />

          {/* Corporate Sponsors Marquee - Right Direction */}
          <InfiniteMarquee
            items={corporatePartners}
            direction="right"
            speed="normal"
          />
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. 4-STAGE ARCHITECTURE WITH ACETERNITY 3D CARDS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Competition Framework
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            The 4-Stage National Case Odyssey
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Rigorous evaluation stages designed to test managerial instinct, business arithmetic, strategy formulation, and boardroom presentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Stage 1 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 transition-all space-y-4">
              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 font-black text-sm flex items-center justify-center">
                  01
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Completed
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 1: Online Business Screening Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Individual 45-min proctored exam covering business concepts, arithmetic, and current affairs.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Questions:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">50 MCQs (+2 / -0.5)</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualifying Cutoff:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Top 35% Advance</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">₹200 / student</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      switchRole('team_leader');
                      setActiveView('student');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-500" />
                    <span>Take Online Quiz</span>
                  </button>
                </div>
              </CardItem>
            </div>
          </CardContainer>

          {/* Stage 2 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-blue-500 dark:border-blue-500/80 shadow-lg shadow-blue-500/10 hover:shadow-2xl transition-all space-y-4 relative">
              <div className="absolute -top-3 right-6 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Active Round
              </div>

              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/30">
                  02
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                  Live Submissions
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 2: 12-Slide Strategy Case Deck
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Team solves live corporate case study on Indian EV ecosystem transformation.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">12 Slides PDF + Excel</span>
                </div>
                <div className="flex justify-between">
                  <span>Evaluation:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Dual AI + Blind Jury</span>
                </div>
                <div className="flex justify-between">
                  <span>Advancement:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">Top 200 Teams</span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      switchRole('team_leader');
                      setActiveView('student');
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Upload Case Deck</span>
                  </button>
                </div>
              </CardItem>
            </div>
          </CardContainer>

          {/* Stage 3 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500/40 transition-all space-y-4">
              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-black text-sm flex items-center justify-center">
                  03
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  5 Pan-India Hubs
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 3: Regional Live Presentations
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  15-min in-person live boardroom pitch + 10-min grilling by jury panel across 5 regional centers.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Hubs:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">Delhi, Mum, Blr, Kol, Guw</span>
                </div>
                <div className="flex justify-between">
                  <span>Finalists:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400">Top 10 Teams Advance</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">₹2,000 / student</span>
                </div>
              </CardItem>
            </div>
          </CardContainer>

          {/* Stage 4 Card */}
          <CardContainer className="w-full">
            <div className="w-full p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-500/40 transition-all space-y-4">
              <CardItem translateZ={30} className="w-full flex items-center justify-between">
                <span className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 font-black text-sm flex items-center justify-center">
                  04
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  National Gala
                </span>
              </CardItem>

              <CardItem translateZ={40}>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Stage 4: Grand National Finale
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Surprise twist case study presented before AIMA Council, CEOs & Ministry Dignitaries in New Delhi.
                </p>
              </CardItem>

              <CardItem translateZ={25} className="w-full pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Purse:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">₹15,00,000 Total</span>
                </div>
                <div className="flex justify-between">
                  <span>Recognition:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">PPOs + Gold Trophy</span>
                </div>
                <div className="flex justify-between">
                  <span>Venue:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">AIMA Headquarters</span>
                </div>
              </CardItem>
            </div>
          </CardContainer>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. INTERACTIVE PAN-INDIA & GLOBAL REGIONAL HUB MAP */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <InteractiveWorldMap
          hubs={hubs}
          selectedHub={selectedHub}
          onSelectHub={hub => setSelectedHub(hub)}
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. AWARDS & PRIZE PURSE HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white border border-slate-800 shadow-2xl relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-bold tracking-widest px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Prize Distribution & Accreditations
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
                ₹15,00,000 Total Cash Bounty + Fast-Track PPO Offers
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                Beyond the substantial cash rewards, qualifying finalists gain privileged executive placement interviews with our leading corporate partners and full publication in AIMA’s Indian Management Journal.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-amber-400 font-bold text-xs uppercase">🥇 1st Place National</div>
                  <div className="text-2xl font-black text-white mt-1">₹5,00,000</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+ Gold Case Trophy</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-slate-300 font-bold text-xs uppercase">🥈 1st Runner-Up</div>
                  <div className="text-2xl font-black text-white mt-1">₹3,00,000</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+ Silver Trophy</div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <div className="text-amber-600 font-bold text-xs uppercase">🥉 2nd Runner-Up</div>
                  <div className="text-2xl font-black text-white mt-1">₹2,00,000</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">+ Bronze Trophy</div>
                </div>
              </div>
            </div>

            {/* Right Pillar Badges */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Pre-Placement Interview (PPI) Fast-Tracks</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Direct access to CXO interviews at partner conglomerates for all 10 Grand Finalist teams.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">National ICRC Case Publishing</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Winning case strategies are edited and cataloged in the official ICRC Academic Case Repository.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 backdrop-blur-md">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-white">Cryptographically Verified Credentials</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Tamper-proof verifiable digital certificates issued with individual verification hashes.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. FREQUENTLY ASKED QUESTIONS (FAQ) ACCORDION */}
      {/* ------------------------------------------------------------- */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Rules & Regulations
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Official guidelines codified under AIMA-ICRC Competition Charter 2026.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 text-slate-400 transition-transform duration-200 ${
                      isOpen ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Helpdesk Callout */}
        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-300 font-medium">
              Have inquiries regarding institutional bulk waivers or proctoring specs?
            </span>
          </div>
          <button
            onClick={() => setActiveSupportModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 cursor-pointer shadow-xs transition-colors"
          >
            Contact Secretariat
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* BROCHURE DOWNLOAD MODAL */}
      {/* ------------------------------------------------------------- */}
      {showBrochureModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
              <Download className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Download Official Rulebook 2026
              </h3>
              <p className="text-xs text-slate-500">
                Contains complete stage timelines, rubric weightages, eligibility rules, and proctoring guidelines.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1 text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Document:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">AIMA_ICL_2026_Charter.pdf</span>
              </div>
              <div className="flex justify-between">
                <span>File Size:</span>
                <span>4.8 MB (Verified PDF)</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowBrochureModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Initiating download of AIMA-ICRC India Case League 2026 Official Rulebook PDF...');
                  setShowBrochureModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
