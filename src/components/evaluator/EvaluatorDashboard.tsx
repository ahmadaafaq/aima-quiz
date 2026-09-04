import React, { useState, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CaseSubmission, Evaluation } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Award,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
  Scale,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Video,
  Volume2,
  VolumeX,
  X,
  Zap,
  Info,
  Layers,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export const EvaluatorDashboard: React.FC = () => {
  const { caseSubmissions, teams, evaluations, evaluateSubmission, currentUser, users, setCurrentUser } = useCompetition();

  const allJuryEvaluators = users.filter(u => u.role === 'evaluator');

  // Combine submissions from caseSubmissions and teams
  const allSubs: CaseSubmission[] = React.useMemo(() => {
    if (caseSubmissions && caseSubmissions.length > 0) return caseSubmissions;
    return teams
      .map(t => t.r2Submission)
      .filter((s): s is NonNullable<typeof s> => Boolean(s)) as CaseSubmission[];
  }, [caseSubmissions, teams]);

  const [selectedSubId, setSelectedSubId] = useState<string>(allSubs[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded' | 'high_ai'>('all');

  // Modals state
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  // PDF Viewer Modal State
  const [currentSlide, setCurrentSlide] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Video Player Modal State
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(32); // percentage
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);

  // Excel Interactive Model State
  const [excelTab, setExcelTab] = useState<'dcf' | 'unit_econ' | 'capex' | 'esg'>('dcf');
  const [simUtilization, setSimUtilization] = useState(65);
  const [simDiscountRate, setSimDiscountRate] = useState(11.5);
  const [simDieselPrice, setSimDieselPrice] = useState(94);

  // Current Submission & Existing Evaluation
  const currentSub = allSubs.find(s => s.id === selectedSubId) || allSubs[0];
  const existingEval = evaluations.find(e => e.submissionId === currentSub?.id && e.evaluatorId === currentUser.id);

  // Rubric state
  const [strategicClarity, setStrategicClarity] = useState<number>(existingEval?.strategicClarity || 23);
  const [financialFeasibility, setFinancialFeasibility] = useState<number>(existingEval?.financialFeasibility || 22);
  const [implementationRoadmap, setImplementationRoadmap] = useState<number>(existingEval?.implementationRoadmap || 22);
  const [deckDesignAndVisuals, setDeckDesignAndVisuals] = useState<number>(existingEval?.deckDesignAndVisuals || 23);
  const [strengths, setStrengths] = useState<string>(
    existingEval?.strengths || 'Crisp strategic articulation with clear BaaS unit economics and high ESG abatement metrics.'
  );
  const [weaknesses, setWeaknesses] = useState<string>(
    existingEval?.weaknesses || 'Grid capacity load during peak industrial freight windows could benefit from deeper sensitivity analysis.'
  );
  const [generalRemarks, setGeneralRemarks] = useState<string>(
    existingEval?.generalRemarks || 'Top decile case solution. Exhibits profound strategic synthesis and grounded operational realities.'
  );
  const [recommendsAdvance, setRecommendsAdvance] = useState<boolean>(
    existingEval?.recommendsAdvance !== undefined ? existingEval.recommendsAdvance : true
  );

  const [showAiAdvisory, setShowAiAdvisory] = useState(true);
  const [submittedAlert, setSubmittedAlert] = useState(false);

  // Update rubric when selected submission changes
  useEffect(() => {
    if (currentSub) {
      const matchEval = evaluations.find(e => e.submissionId === currentSub.id && e.evaluatorId === currentUser.id);
      if (matchEval) {
        setStrategicClarity(matchEval.strategicClarity);
        setFinancialFeasibility(matchEval.financialFeasibility);
        setImplementationRoadmap(matchEval.implementationRoadmap);
        setDeckDesignAndVisuals(matchEval.deckDesignAndVisuals);
        setStrengths(matchEval.strengths || '');
        setWeaknesses(matchEval.weaknesses || '');
        setGeneralRemarks(matchEval.generalRemarks || '');
        setRecommendsAdvance(matchEval.recommendsAdvance !== undefined ? matchEval.recommendsAdvance : true);
      } else {
        // Defaults based on AI assessment if available
        const aiScore = currentSub.aiAssessment?.overallAdvisoryScore || 88;
        const baseline = Math.round(aiScore / 4);
        setStrategicClarity(baseline);
        setFinancialFeasibility(Math.max(15, baseline - 1));
        setImplementationRoadmap(Math.max(15, baseline - 1));
        setDeckDesignAndVisuals(baseline);
        setStrengths(currentSub.aiAssessment?.strengths?.join('. ') || 'Strong analytical grounding and structured problem framing.');
        setWeaknesses(currentSub.aiAssessment?.improvementAreas?.join('. ') || 'Detail risk mitigation SLAs with third-party logistics partners.');
        setGeneralRemarks(currentSub.aiAssessment?.evaluatorNote || 'High caliber case deck. Recommended for regional presentation.');
        setRecommendsAdvance(true);
      }
    }
  }, [selectedSubId, currentSub, evaluations, currentUser.id]);

  const totalScore = strategicClarity + financialFeasibility + implementationRoadmap + deckDesignAndVisuals;

  const getScoreBadge = (score: number) => {
    if (score >= 92) return { label: 'Grade A+ (National Podium Qualifier)', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
    if (score >= 85) return { label: 'Grade A (Regional Hub Contender)', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
    if (score >= 75) return { label: 'Grade B+ (Commendable Solution)', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
    return { label: 'Grade B (Below Qualifying Threshold)', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
  };

  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSub) return;

    evaluateSubmission({
      submissionId: currentSub.id,
      evaluatorId: currentUser.id,
      evaluatorName: currentUser.name,
      strategicClarity,
      financialFeasibility,
      implementationRoadmap,
      deckDesignAndVisuals,
      strengths,
      weaknesses,
      generalRemarks,
      recommendsAdvance,
    });

    setSubmittedAlert(true);
    setTimeout(() => setSubmittedAlert(false), 3500);
  };

  // Filtered submissions
  const filteredSubmissions = allSubs.filter(sub => {
    const isGraded = evaluations.some(e => e.submissionId === sub.id && e.evaluatorId === currentUser.id);
    const matchesSearch =
      sub.anonymizedCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.caseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.deckFileName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (statusFilter === 'pending') return !isGraded;
    if (statusFilter === 'graded') return isGraded;
    if (statusFilter === 'high_ai') return (sub.aiAssessment?.overallAdvisoryScore || 0) >= 90;
    return true;
  });

  // Calculate live financial simulation values
  const simulatedNpvCrores = (24.5 * (simUtilization / 60) * (simDieselPrice / 90) * (12 / simDiscountRate)).toFixed(2);
  const simulatedIrrPercent = (16.2 + (simUtilization - 60) * 0.28 + (simDieselPrice - 90) * 0.15).toFixed(1);

  // Slide definitions for the PDF Deck modal
  const deckSlides = [
    {
      num: 1,
      title: 'Executive Summary & Macro Context',
      theme: 'Indian Freight Decarbonization Mandate',
      content: 'Multi-modal rail-road network integration under National Logistics Policy (NLP 2022) to achieve 28% carbon abatement across golden quadrilateral freight corridors by 2030.',
      stat: '28% GHG Cut'
    },
    {
      num: 2,
      title: 'Root Cause & Value Chain Bottlenecks',
      theme: 'Last-Mile Congestion & Diesel Exposure',
      content: 'Granular diagnosis of 4.2M commercial freight fleet operators facing rising diesel margins and 42-hour turn-around delays at state transit borders.',
      stat: '42 Hrs Delay'
    },
    {
      num: 3,
      title: 'Target Operating Model (TOM)',
      theme: 'Hub-and-Spoke Intermodal Corridors',
      content: 'Hybrid electric freight corridor combining Dedicated Freight Corridors (DFC) rail lines with electric last-mile container tractors.',
      stat: '5 Pan-India Hubs'
    },
    {
      num: 4,
      title: 'ONDC Open Protocol Integration',
      theme: 'Unified Logistics Inter-Operability',
      content: 'Decentralized digital broker integration linking MSME cargo dispatchers directly to EV fleet operators with dynamic smart-contract escrows.',
      stat: '14.2% Margin Uplift'
    },
    {
      num: 5,
      title: 'Battery-as-a-Service (BaaS) Architecture',
      theme: 'Automated Swapping Station Grid',
      content: '90-second robotic battery swapping pods strategically colocated at NHAI toll plazas and warehousing logistics parks.',
      stat: '90s Swap Time'
    },
    {
      num: 6,
      title: 'CAPEX & Infrastructure Staging',
      theme: '5-Year Phased Rollout Capital Plan',
      content: '₹140 Cr Phase 1 CAPEX with 65:35 debt-equity structure, funded via Green Climate Bonds and concessional IREDA mezzanine lines.',
      stat: '₹140 Cr Capex'
    },
    {
      num: 7,
      title: 'Discounted Cash Flow & Valuation',
      theme: '10-Year DCF, NPV & Terminal Sensitivity',
      content: 'Base case Net Present Value of ₹84.2 Cr at 11.5% WACC with an Internal Rate of Return (IRR) of 21.4% and 3.4-year payback.',
      stat: '21.4% IRR'
    },
    {
      num: 8,
      title: 'Go-to-Market (GTM) & Pilot Contracts',
      theme: 'Anchor Fleet Operator Onboarding',
      content: 'Signed MOUs with top 3PL logistics majors covering 1,800 dedicated tractor-trailers across Western Corridor (Delhi-Mumbai).',
      stat: '1,800 Vehicles'
    },
    {
      num: 9,
      title: 'Policy & Regulatory Compliance',
      theme: 'FAME-III & Carbon Credit Markets',
      content: 'End-to-end alignment with Bureau of Energy Efficiency (BEE) carbon trading schemes and state EV subsidy mandates.',
      stat: '₹8.4 Cr Credits'
    },
    {
      num: 10,
      title: 'Risk Matrix & Driver Transition Support',
      theme: 'Change Management & Reskilling',
      content: 'Comprehensive driver welfare fund, continuous telemetry training, and zero-downtime roadside replacement SLAs.',
      stat: '99.4% Uptime SLA'
    },
    {
      num: 11,
      title: 'ESG Impact & Carbon Ledger',
      theme: 'Audited Scope 1 & Scope 3 Mitigation',
      content: 'Third-party certified avoidance of 184,000 metric tonnes of CO2e annually, equivalent to planting 8.2 million trees.',
      stat: '184k Tonnes CO2e'
    },
    {
      num: 12,
      title: '36-Month Milestone Execution Roadmap',
      theme: 'Gantt Phasing & Regional Scaling',
      content: 'Detailed quarterly governance tollgates, tech deployment sprints, and commercial breakeven milestones by Q6.',
      stat: 'Q6 Breakeven'
    }
  ];

  if (!currentSub) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">No submissions available for review.</p>
      </div>
    );
  }

  const scoreBadge = getScoreBadge(totalScore);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
            <Scale className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                Jury Evaluation Station (Section 9)
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Dual-Blind Protocol Enforced</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Evaluator: <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong> • Senior Partner, AIMA-ICRC National Jury Panel
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          <EyeOff className="w-4 h-4 text-amber-500" />
          <span>Candidate & Institution Names Blinded</span>
          <DocRequirementInfo
            specKey="evaluator_dual_blind"
            variant="badge"
            badgeLabel="BRD §9.1 & §16.2 Protocol"
            colorTheme="amber"
            align="right"
          />
        </div>
      </div>

      {/* Interactive Jury Member Switcher & Bench Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-500/20">
            {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).filter((_, idx, arr) => idx === 0 || idx === arr.length - 1).join('') : 'JM'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Active Evaluator Persona
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                {currentUser.speciality || 'Corporate Strategy'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                {currentUser.experienceYears || 15} Years Exp
              </span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
              <span>{currentUser.name}</span>
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 truncate">
                • {currentUser.organization || currentUser.instituteName || 'National Jury Panel'}
              </span>
            </div>
          </div>
        </div>

        {/* Dropdown to switch active jury member */}
        <div className="flex items-center gap-3 self-end md:self-center">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Simulate Jury Member ({allJuryEvaluators.length} on bench)
            </div>
            <div className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {evaluations.filter(e => e.evaluatorId === currentUser.id).length} evaluations submitted
            </div>
          </div>

          <div className="relative">
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = allJuryEvaluators.find(ev => ev.id === e.target.value);
                if (selected) {
                  setCurrentUser(selected);
                }
              }}
              className="text-xs font-bold py-2 px-3 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer shadow-xs"
            >
              {allJuryEvaluators.map(ev => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} — {ev.speciality ? ev.speciality.split('&')[0].trim() : 'Strategy'} ({ev.organization?.split(' ')[0] || 'Jury'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Anonymized Submission Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-sm">
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Assigned Submissions ({allSubs.length})</span>
                <DocRequirementInfo specKey="evaluator_queue" variant="icon" size="xs" colorTheme="slate" />
              </h3>
              <p className="text-[11px] text-slate-400">Round 2 Strategy Decks</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
              {evaluations.filter(e => e.evaluatorId === currentUser.id).length}/{allSubs.length} Graded
            </span>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by code or title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-[10px] font-bold">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              All ({allSubs.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setStatusFilter('graded')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'graded'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              Graded
            </button>
            <button
              onClick={() => setStatusFilter('high_ai')}
              className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                statusFilter === 'high_ai'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              AI Score ≥90
            </button>
          </div>

          {/* Submission Items List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredSubmissions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No dossiers match your search filter.
              </div>
            ) : (
              filteredSubmissions.map(sub => {
                const isSelected = sub.id === currentSub?.id;
                const matchEval = evaluations.find(e => e.submissionId === sub.id && e.evaluatorId === currentUser.id);
                const hasEvaluated = Boolean(matchEval);
                const aiScore = sub.aiAssessment?.overallAdvisoryScore;

                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubId(sub.id)}
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 shadow-xs ring-1 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                          {sub.anonymizedCode}
                        </span>
                      </div>
                      {hasEvaluated ? (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                          Graded • {matchEval?.totalScore || 90}/100
                        </span>
                      ) : (
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                          Pending Review
                        </span>
                      )}
                    </div>

                    <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {sub.caseTitle}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                      <span className="flex items-center gap-1 font-medium">
                        <span>{sub.slideCount || 12} slides</span>
                        <span>•</span>
                        <span>{sub.fileSizeMb || sub.deckFileSize || '14.8 MB'}</span>
                      </span>

                      {aiScore && (
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                          AI: {aiScore.toFixed(0)}/100
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800 flex items-start gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <span>AIMA-ICRC Integrity Policy: Evaluators cannot see student names, gender, or academic institutions to prevent bias.</span>
          </div>
        </div>

        {/* Right 2 Columns: Rubric Grading & Document Viewers */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Submission Dossier Header & Artifact CTAs */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Dossier Code: {currentSub.anonymizedCode}
                  </span>
                  <span className="text-xs text-slate-400">
                    Submitted {new Date(currentSub.submittedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {currentSub.caseTitle}
                </h3>
              </div>

              {/* Working Interactive CTAs */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* View PDF Deck Button */}
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => {
                      setCurrentSlide(1);
                      setShowPdfModal(true);
                    }}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                    <span>View PDF Deck ({currentSub.slideCount || 12} slides)</span>
                  </button>
                  <DocRequirementInfo specKey="evaluator_pdf_deck" variant="icon" size="xs" colorTheme="slate" />
                </div>

                {/* Open Loom Video Defense Modal */}
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => {
                      setIsPlaying(true);
                      setShowVideoModal(true);
                    }}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>Loom Video Pitch</span>
                  </button>
                  <DocRequirementInfo specKey="evaluator_loom_video" variant="icon" size="xs" colorTheme="indigo" />
                </div>

                {/* Open Excel Financial Model Modal */}
                <div className="inline-flex items-center gap-1">
                  <button
                    onClick={() => setShowExcelModal(true)}
                    className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Excel DCF Model</span>
                  </button>
                  <DocRequirementInfo specKey="evaluator_excel_dcf" variant="icon" size="xs" colorTheme="emerald" />
                </div>
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Candidate Executive Summary</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
                {currentSub.executiveSummary}
              </p>
            </div>

            {/* Submission Metadata Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Deck File</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                  {currentSub.deckFileName}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Deck Size & Type</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
                  {currentSub.fileSizeMb || currentSub.deckFileSize || '14.8 MB'} • PDF (16:9)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Excel Model File</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 truncate block mt-0.5">
                  {currentSub.supportingExcelName || currentSub.financialModelFile || 'DCF_Model.xlsx'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 text-[10px] block">Loom Defense Duration</span>
                <span className="font-bold text-indigo-600 dark:text-indigo-400 block mt-0.5">
                  05:24 min (1080p HD)
                </span>
              </div>
            </div>
          </div>

          {/* AI Advisory Comparison Box */}
          <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Bot className="w-4 h-4 text-indigo-400 animate-pulse" />
                <span>Gemini AI Benchmark Advisory Pre-Scan (Section 9.3)</span>
                <DocRequirementInfo specKey="evaluator_ai_advisory" variant="icon" size="xs" colorTheme="purple" />
              </div>
              <button
                onClick={() => setShowAiAdvisory(!showAiAdvisory)}
                className="text-[11px] text-indigo-300 hover:text-white underline cursor-pointer"
              >
                {showAiAdvisory ? 'Collapse AI Assist' : 'Expand AI Assist'}
              </button>
            </div>

            {showAiAdvisory && currentSub.aiAssessment && (
              <div className="space-y-3 text-xs text-slate-300 pt-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <span className="text-[11px] text-indigo-200 block font-semibold">AI Benchmark Advisory Score:</span>
                    <span className="text-lg font-black text-white">{currentSub.aiAssessment.overallAdvisoryScore.toFixed(1)} / 100</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                      {currentSub.aiAssessment.plagiarismFlag || 'VERIFIED ORIGINAL'}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                      {currentSub.aiAssessment.generativeAiUsageFlag || 'AUTHENTIC RESEARCH'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[9px]">Strategic Alignment</span>
                    <span className="font-bold text-amber-300">{currentSub.aiAssessment.alignmentScore || 94}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[9px]">Completeness</span>
                    <span className="font-bold text-amber-300">{currentSub.aiAssessment.completenessScore || 96}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[9px]">Data & Evidence</span>
                    <span className="font-bold text-amber-300">{currentSub.aiAssessment.dataEvidenceScore || 92}/100</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-slate-400 block text-[9px]">Originality</span>
                    <span className="font-bold text-amber-300">{currentSub.aiAssessment.originalityScore || 95}/100</span>
                  </div>
                </div>

                {currentSub.aiAssessment.strengths && (
                  <div className="space-y-1 text-[11px]">
                    <span className="font-bold text-emerald-400">AI Noted Strengths:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                      {currentSub.aiAssessment.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Official Rubric Grading Form */}
          <form onSubmit={handleSaveEvaluation} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-emerald-600" />
                    <span>Official 4-Pillar Scoring Rubric (100 Marks)</span>
                  </h3>
                  <DocRequirementInfo specKey="evaluator_rubric" variant="badge" badgeLabel="BRD §9.2 Rubric" colorTheme="emerald" />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Calibrate score according to official AIMA-ICRC evaluation metrics.
                </p>
              </div>

              <div className="text-right sm:border-l sm:border-slate-100 dark:sm:border-slate-800 sm:pl-4">
                <span className="text-xs text-slate-400 block font-medium">Calculated Jury Score</span>
                <div className="flex items-center gap-2 justify-end mt-0.5">
                  <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{totalScore}</span>
                  <span className="text-slate-400 text-sm font-bold">/ 100</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-block mt-1 ${scoreBadge.color}`}>
                  {scoreBadge.label}
                </span>
              </div>
            </div>

            {/* 4 Rubric Criteria Sliders */}
            <div className="space-y-6">
              
              {/* Criterion 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Strategic Clarity & Problem Framing (0–25)</span>
                    <DocRequirementInfo
                      specKey="evaluator_rubric"
                      sectionNumber="Section 9.2 (Criterion 1)"
                      title="Strategic Clarity & Problem Framing (25 Marks)"
                      rationale="Evaluates how accurately the team identified the core business bottleneck, avoided symptoms, and framed actionable strategic hypotheses."
                      specification="25 points allocated to root-cause diagnosis, stakeholder mapping, and strategic coherence under National Logistics Policy (NLP 2022)."
                      variant="icon"
                      size="xs"
                      colorTheme="slate"
                    />
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{strategicClarity} / 25 pts</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={strategicClarity}
                  onChange={e => setStrategicClarity(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Weak problem articulation (0-12)</span>
                  <span>Adequate framing (13-18)</span>
                  <span>Exceptional insight & hypothesis (19-25)</span>
                </div>
              </div>

              {/* Criterion 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Analytical Rigor & Financial Feasibility (0–25)</span>
                    <DocRequirementInfo
                      specKey="evaluator_rubric"
                      sectionNumber="Section 9.2 (Criterion 2)"
                      title="Analytical Rigor & Financial Feasibility (25 Marks)"
                      rationale="Verifies quantitative defensibility, unit economics, DCF valuation, and sensitivity across diesel benchmarks."
                      specification="25 points allocated to 5-year pro-forma financials, CAPEX staging, NPV/IRR calculations, and debt servicing coverage ratio."
                      variant="icon"
                      size="xs"
                      colorTheme="slate"
                    />
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{financialFeasibility} / 25 pts</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={financialFeasibility}
                  onChange={e => setFinancialFeasibility(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Flawed unit economics (0-12)</span>
                  <span>Sound DCF/NPV model (13-18)</span>
                  <span>Institutional grade valuation (19-25)</span>
                </div>
              </div>

              {/* Criterion 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Implementation Roadmap & Risk Mitigation (0–25)</span>
                    <DocRequirementInfo
                      specKey="evaluator_rubric"
                      sectionNumber="Section 9.2 (Criterion 3)"
                      title="Implementation Roadmap & Risk Mitigation (25 Marks)"
                      rationale="Tests real-world operational viability, partner integration SLAs, regulatory compliance, and driver transition support."
                      specification="25 points allocated to phased timeline, ONDC protocol integration, supply chain contingency, and ESG risk mitigation."
                      variant="icon"
                      size="xs"
                      colorTheme="slate"
                    />
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{implementationRoadmap} / 25 pts</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={implementationRoadmap}
                  onChange={e => setImplementationRoadmap(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Abstract roadmap (0-12)</span>
                  <span>Clear milestones & SLAs (13-18)</span>
                  <span>Turnkey operational execution (19-25)</span>
                </div>
              </div>

              {/* Criterion 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>Presentation Design & Visual Communication (0–25)</span>
                    <DocRequirementInfo
                      specKey="evaluator_rubric"
                      sectionNumber="Section 9.2 (Criterion 4)"
                      title="Presentation Design & Visual Communication (25 Marks)"
                      rationale="Assesses executive layout, slide economy, data visualization, and clarity of the 12-slide presentation structure."
                      specification="25 points allocated to visual hierarchy, typography, charting standards, and adherence to the 12-slide maximum cap."
                      variant="icon"
                      size="xs"
                      colorTheme="slate"
                    />
                  </div>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 font-mono">{deckDesignAndVisuals} / 25 pts</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={25}
                  value={deckDesignAndVisuals}
                  onChange={e => setDeckDesignAndVisuals(parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-slate-200 dark:bg-slate-700 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Cluttered/Disorganized (0-12)</span>
                  <span>Professional 12 slides (13-18)</span>
                  <span>Boardroom-ready visual story (19-25)</span>
                </div>
              </div>

            </div>

            {/* Qualitative Feedback Textareas */}
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Key Strengths & Commendations</span>
                </label>
                <textarea
                  rows={2}
                  value={strengths}
                  onChange={e => setStrengths(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  placeholder="Note distinctive frameworks, rigorous modeling, or original insights..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  <span>Areas for Enhancement & Vulnerabilities</span>
                </label>
                <textarea
                  rows={2}
                  value={weaknesses}
                  onChange={e => setWeaknesses(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  placeholder="Identify sensitive assumptions, regulatory oversights, or execution risks..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confidential Jury Synthesis & Podium Advice
                </label>
                <textarea
                  rows={2}
                  value={generalRemarks}
                  onChange={e => setGeneralRemarks(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  placeholder="Summary remarks for National Moderation Board..."
                />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                <input
                  type="checkbox"
                  id="adv-checkbox"
                  checked={recommendsAdvance}
                  onChange={e => setRecommendsAdvance(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="adv-checkbox" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Recommend this dossier for Advancement to Round 3 (Regional Live Hub Rounds)
                </label>
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                {submittedAlert && (
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Evaluation Recorded & Digitally Signed (Hash: AIMA-EV-{Date.now().toString().slice(-6)})</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <div className="inline-flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => alert(`Conflict of interest recorded for dossier ${currentSub.anonymizedCode}. Case reallocated.`)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Recuse (Conflict of Interest)
                  </button>
                  <DocRequirementInfo specKey="evaluator_coi_recusal" variant="icon" size="xs" colorTheme="slate" />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Jury Score ({totalScore}/100)</span>
                </button>
              </div>
            </div>

          </form>

        </div>

      </div>

      {/* -------------------- MODAL 1: INTERACTIVE PDF CASE DECK VIEWER -------------------- */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentSub.deckFileName}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      {currentSub.anonymizedCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    AIMA-ICRC Certified 12-Slide Deck Submission • 16:9 Widescreen PDF
                  </span>
                </div>
              </div>

              {/* Top Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-200 dark:bg-slate-800 rounded-xl p-0.5 text-xs font-bold">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(75, prev - 25))}
                    className="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    -
                  </button>
                  <span className="px-2 text-[11px]">{zoomLevel}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(150, prev + 25))}
                    className="px-2 py-1 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <a
                  href={`#download-${currentSub.anonymizedCode}`}
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Downloading verified candidate deck: ${currentSub.deckFileName} (${currentSub.fileSizeMb || 14.8} MB)...`);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  onClick={() => setShowPdfModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Slide Canvas & Navigation */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950">
              
              {/* Slide Thumbnail Sidebar */}
              <div className="w-full md:w-56 p-3 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto space-y-2 shrink-0 max-h-40 md:max-h-full">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block px-1">
                  12 Slide Index
                </span>
                {deckSlides.map(slide => (
                  <button
                    key={slide.num}
                    onClick={() => setCurrentSlide(slide.num)}
                    className={`w-full p-2 rounded-xl text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                      currentSlide === slide.num
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-mono shrink-0 ${
                      currentSlide === slide.num ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600'
                    }`}>
                      {slide.num}
                    </span>
                    <span className="truncate text-[11px]">{slide.title}</span>
                  </button>
                ))}
              </div>

              {/* Main Slide Viewer Canvas */}
              <div className="flex-1 p-4 sm:p-8 overflow-y-auto flex flex-col items-center justify-center">
                {(() => {
                  const activeSlide = deckSlides[currentSlide - 1];
                  return (
                    <div
                      style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center' }}
                      className="w-full max-w-3xl aspect-video bg-white dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl p-6 sm:p-10 flex flex-col justify-between transition-transform duration-150"
                    >
                      {/* Slide Header */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold">
                            SLIDE {activeSlide.num} / 12
                          </span>
                          <span className="text-xs font-mono text-slate-400 font-bold">
                            {currentSub.anonymizedCode}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          AIMA ICL 2026 Round 2
                        </span>
                      </div>

                      {/* Slide Body Content */}
                      <div className="space-y-4 my-auto">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                          {activeSlide.theme}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                          {activeSlide.title}
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                          {activeSlide.content}
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Key Target Metric</span>
                            <span className="text-base font-black text-slate-900 dark:text-slate-100 mt-0.5 block">
                              {activeSlide.stat}
                            </span>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Implementation Gate</span>
                            <span className="text-base font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                              Phase 1 Priority
                            </span>
                          </div>
                          <div className="hidden sm:block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 block uppercase font-bold">Compliance Status</span>
                            <span className="text-base font-black text-blue-600 dark:text-blue-400 mt-0.5 block">
                              100% Aligned
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Slide Footer */}
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3 text-[10px] text-slate-400">
                        <span>CONFIDENTIAL • AIMA-ICRC JURY REVIEW COPY</span>
                        <span>{activeSlide.num} of 12</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>

            {/* Modal Bottom Bar: Navigation */}
            <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <button
                onClick={() => setCurrentSlide(prev => Math.max(1, prev - 1))}
                disabled={currentSlide === 1}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </button>

              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Slide {currentSlide} of 12
              </span>

              <button
                onClick={() => setCurrentSlide(prev => Math.min(12, prev + 1))}
                disabled={currentSlide === 12}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
              >
                <span>Next Slide</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MODAL 2: CANDIDATE VIDEO DEFENSE / LOOM MODAL -------------------- */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-600 text-white">
                  <Video className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      Candidate Video Pitch & Defense
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">
                      {currentSub.anonymizedCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Loom HD Pitch Recording (05:24 min) • Blind Audio & Presentation Defense
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsPlaying(false);
                  setShowVideoModal(false);
                }}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player Display Area */}
            <div className="p-4 sm:p-6 bg-slate-950 text-white space-y-4">
              
              {/* Simulated Video Canvas */}
              <div className="aspect-video w-full rounded-2xl bg-linear-to-br from-slate-900 via-indigo-950 to-slate-950 border border-slate-800 relative overflow-hidden flex flex-col justify-between p-6">
                
                {/* Top Video Overlay */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-bold animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      AIMA ICL DEFENSE STREAM
                    </span>
                    <span className="text-xs text-slate-400 font-mono">1080p 60fps</span>
                  </div>
                  <span className="text-xs font-mono text-indigo-300 font-bold">
                    {currentSub.anonymizedCode}
                  </span>
                </div>

                {/* Center Visual Mockup */}
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-indigo-600/30 border border-indigo-400/40 text-indigo-300 flex items-center justify-center mx-auto shadow-lg">
                    {isPlaying ? (
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1 h-8 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    ) : (
                      <Play className="w-8 h-8 fill-current ml-1" />
                    )}
                  </div>
                  <h4 className="text-base font-bold text-white">
                    {currentSub.caseTitle}
                  </h4>
                  <p className="text-xs text-indigo-200 max-w-md mx-auto">
                    Candidate Team Spokesperson articulating inter-modal corridor unit economics and ONDC freight protocol.
                  </p>
                </div>

                {/* Bottom Video Controls */}
                <div className="space-y-2 bg-slate-900/80 backdrop-blur-xs p-3 rounded-xl border border-slate-800">
                  {/* Progress Bar */}
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickPos = (e.clientX - rect.left) / rect.width;
                      setVideoProgress(Math.round(clickPos * 100));
                    }}
                    className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden cursor-pointer"
                  >
                    <div
                      style={{ width: `${videoProgress}%` }}
                      className="bg-indigo-500 h-full rounded-full transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer"
                      >
                        {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      </button>

                      <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 cursor-pointer"
                      >
                        {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>

                      <span className="font-mono text-[11px] text-slate-300">
                        {Math.floor((videoProgress * 324) / 6000)}:{String(Math.floor(((videoProgress * 324) % 6000) / 100)).padStart(2, '0')} / 05:24
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {[1, 1.25, 1.5, 2].map(speed => (
                        <button
                          key={speed}
                          onClick={() => setPlaybackSpeed(speed)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                            playbackSpeed === speed ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

              </div>

              {/* Pitch Chapters & Transcript */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Defense Agenda Chapters
                  </span>
                  <div className="space-y-1 text-[11px]">
                    <button onClick={() => setVideoProgress(0)} className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-indigo-300 flex justify-between cursor-pointer">
                      <span>0:00 • Problem Framing & Fleet Margins</span>
                      <span className="text-slate-500">00:45</span>
                    </button>
                    <button onClick={() => setVideoProgress(25)} className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-indigo-300 flex justify-between cursor-pointer">
                      <span>0:45 • Multi-Modal Rail-Road Corridors</span>
                      <span className="text-slate-500">01:25</span>
                    </button>
                    <button onClick={() => setVideoProgress(55)} className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-indigo-300 flex justify-between cursor-pointer">
                      <span>2:10 • DCF Valuation & Battery Swapping</span>
                      <span className="text-slate-500">01:35</span>
                    </button>
                    <button onClick={() => setVideoProgress(85)} className="w-full text-left p-1.5 rounded hover:bg-slate-800 text-indigo-300 flex justify-between cursor-pointer">
                      <span>3:45 • Risk Mitigation & Q&A Synthesis</span>
                      <span className="text-slate-500">01:39</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Live Defense Transcript Snippet
                  </span>
                  <p className="text-[11px] text-slate-300 leading-relaxed italic">
                    "...We modeled unit economics across 1,800 freight tractors. By separating battery ownership from chassis finance via a BaaS subscription model at ₹4.20 per kWh, we achieve immediate parity with diesel at ₹90/L, delivering 14.2% EBIT margin accretion..."
                  </p>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Direct Link: <a href={currentSub.videoPitchUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline font-mono">{currentSub.videoPitchUrl}</a>
              </span>
              <button
                onClick={() => {
                  setIsPlaying(false);
                  setShowVideoModal(false);
                }}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Done Viewing Defense
              </button>
            </div>

          </div>
        </div>
      )}

      {/* -------------------- MODAL 3: INTERACTIVE EXCEL DCF MODEL VIEWER -------------------- */}
      {showExcelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/60 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentSub.supportingExcelName || currentSub.financialModelFile || 'Financial_DCF_Model.xlsx'}
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                      {currentSub.anonymizedCode}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Interactive Valuation Spreadsheet • Live Parameter Sensitivity & DCF Engine
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Downloaded candidate spreadsheet: ${currentSub.supportingExcelName || 'Financial_DCF_Model.xlsx'}`)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .XLSX</span>
                </button>

                <button
                  onClick={() => setShowExcelModal(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Excel Tabs */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setExcelTab('dcf')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  excelTab === 'dcf'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>1. DCF Valuation (5-Year)</span>
              </button>

              <button
                onClick={() => setExcelTab('unit_econ')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  excelTab === 'unit_econ'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>2. Unit Economics (₹ / Tonne-KM)</span>
              </button>

              <button
                onClick={() => setExcelTab('capex')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  excelTab === 'capex'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3. Capex Phasing & Debt/Equity</span>
              </button>
            </div>

            {/* Excel Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white dark:bg-slate-900">
              
              {/* Interactive Sensitivity Controllers Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Live Model Stress-Testing & Sensitivity Sliders</span>
                  </span>
                  <button
                    onClick={() => {
                      setSimUtilization(65);
                      setSimDiscountRate(11.5);
                      setSimDieselPrice(94);
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-emerald-600 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset to Base Assumptions</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Fleet Daily Utilization:</span>
                      <span className="font-mono font-bold text-emerald-600">{simUtilization}%</span>
                    </div>
                    <input
                      type="range"
                      min={40}
                      max={90}
                      value={simUtilization}
                      onChange={e => setSimUtilization(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>WACC Discount Rate:</span>
                      <span className="font-mono font-bold text-emerald-600">{simDiscountRate}%</span>
                    </div>
                    <input
                      type="range"
                      min={8}
                      max={16}
                      step={0.5}
                      value={simDiscountRate}
                      onChange={e => setSimDiscountRate(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold mb-1">
                      <span>Diesel Parity Benchmark:</span>
                      <span className="font-mono font-bold text-emerald-600">₹{simDieselPrice} / L</span>
                    </div>
                    <input
                      type="range"
                      min={80}
                      max={120}
                      value={simDieselPrice}
                      onChange={e => setSimDieselPrice(parseInt(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Recalculated Output Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Simulated 5-Yr NPV</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{simulatedNpvCrores} Cr</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Simulated IRR</span>
                    <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">{simulatedIrrPercent}%</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Payback Period</span>
                    <span className="text-base font-black text-slate-900 dark:text-slate-100 font-mono">3.2 Years</span>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <span className="text-[10px] text-slate-400 block font-semibold">Unit Breakeven Utilization</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">58.4%</span>
                  </div>
                </div>
              </div>

              {/* Spreadsheet Table View */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase text-[10px] font-bold">
                    <tr>
                      <th className="p-3">Financial Metric / Line Item</th>
                      <th className="p-3 text-right">Year 1</th>
                      <th className="p-3 text-right">Year 2</th>
                      <th className="p-3 text-right">Year 3</th>
                      <th className="p-3 text-right">Year 4</th>
                      <th className="p-3 text-right">Year 5 (Terminal)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold font-sans">Active Electric Freight Tractors</td>
                      <td className="p-3 text-right">240</td>
                      <td className="p-3 text-right">600</td>
                      <td className="p-3 text-right">1,200</td>
                      <td className="p-3 text-right">1,800</td>
                      <td className="p-3 text-right">2,400</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold font-sans">Total Freight Volume (Million Tonne-KM)</td>
                      <td className="p-3 text-right">48.2</td>
                      <td className="p-3 text-right">132.5</td>
                      <td className="p-3 text-right">284.0</td>
                      <td className="p-3 text-right">442.8</td>
                      <td className="p-3 text-right">610.4</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-emerald-50/40 dark:bg-emerald-950/20 font-bold">
                      <td className="p-3 font-sans text-emerald-800 dark:text-emerald-300">Gross Operating Revenue (₹ Cr)</td>
                      <td className="p-3 text-right text-emerald-600">₹18.4</td>
                      <td className="p-3 text-right text-emerald-600">₹52.8</td>
                      <td className="p-3 text-right text-emerald-600">₹116.2</td>
                      <td className="p-3 text-right text-emerald-600">₹188.4</td>
                      <td className="p-3 text-right text-emerald-600">₹264.0</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold font-sans">Power Grid & Battery Swapping OPEX (₹ Cr)</td>
                      <td className="p-3 text-right">(₹11.2)</td>
                      <td className="p-3 text-right">(₹29.4)</td>
                      <td className="p-3 text-right">(₹61.5)</td>
                      <td className="p-3 text-right">(₹96.8)</td>
                      <td className="p-3 text-right">(₹132.0)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold font-sans">Depreciation & Battery Amortization (₹ Cr)</td>
                      <td className="p-3 text-right">(₹4.1)</td>
                      <td className="p-3 text-right">(₹9.2)</td>
                      <td className="p-3 text-right">(₹18.6)</td>
                      <td className="p-3 text-right">(₹26.4)</td>
                      <td className="p-3 text-right">(₹34.8)</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40 bg-indigo-50/40 dark:bg-indigo-950/20 font-bold">
                      <td className="p-3 font-sans text-indigo-800 dark:text-indigo-300">EBIT / Operating Profit (₹ Cr)</td>
                      <td className="p-3 text-right text-indigo-600">₹3.1</td>
                      <td className="p-3 text-right text-indigo-600">₹14.2</td>
                      <td className="p-3 text-right text-indigo-600">₹36.1</td>
                      <td className="p-3 text-right text-indigo-600">₹65.2</td>
                      <td className="p-3 text-right text-indigo-600">₹97.2</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="p-3 font-semibold font-sans">EBIT Margin %</td>
                      <td className="p-3 text-right">16.8%</td>
                      <td className="p-3 text-right">26.8%</td>
                      <td className="p-3 text-right">31.0%</td>
                      <td className="p-3 text-right">34.6%</td>
                      <td className="p-3 text-right">36.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Formula Engine: Built-in DCF with 11.5% WACC and 3.0% Terminal Growth.
              </span>
              <button
                onClick={() => setShowExcelModal(false)}
                className="px-4 py-2 bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close Model
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
