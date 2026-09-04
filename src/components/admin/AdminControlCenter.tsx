import React, { useState, useRef, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { StageId, QuizQuestion, AuditLog, UserRole } from '../../types';
import { QuizProgramManager } from './QuizProgramManager';
import { ParticipantsManager } from './ParticipantsManager';
import { QuizResultsLeaderboard } from './QuizResultsLeaderboard';
import { JuryEvaluationsManager } from './JuryEvaluationsManager';
import { RegionalHubsManager } from './RegionalHubsManager';
import { InstitutesAndSponsorsManager } from './InstitutesAndSponsorsManager';
import { QuizQuestionBankManager } from './QuizQuestionBankManager';
import { OfficialBulletinsManager } from './OfficialBulletinsManager';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Download,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Flame,
  Globe,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  LayoutDashboard,
  Lock,
  MapPin,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  PlusCircle,
  Radio,
  RotateCcw,
  Save,
  Scale,
  Search,
  Send,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Trophy,
  User,
  Users,
  X,
  Zap,
  Bot
} from 'lucide-react';

export const AdminControlCenter: React.FC = () => {
  const {
    config,
    updateConfig,
    questions,
    addQuestion,
    auditLogs,
    payments,
    announcements,
    addAnnouncement,
    currentUser,
    switchRole,
    teams,
    users,
    quizPrograms,
    hubs,
    institutions,
    sponsors,
    caseSubmissions,
    evaluations,
    rubricR2,
    adminActiveTab,
    setAdminActiveTab,
    openChatWithQuery,
  } = useCompetition();

  const mainRef = useRef<HTMLDivElement>(null);

  // Sidebar State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Direct Sub-Tab & Action Trigger States
  const [jurySubTab, setJurySubTab] = useState<'evaluations' | 'jury_bench'>('evaluations');
  const [autoOpenJuryInduct, setAutoOpenJuryInduct] = useState(false);
  const [autoOpenCreateHub, setAutoOpenCreateHub] = useState(false);
  const [autoOpenOnboardCoord, setAutoOpenOnboardCoord] = useState(false);
  const [autoOpenCreateQuiz, setAutoOpenCreateQuiz] = useState(false);

  // Robust Tab Normalizer
  const normalizeTab = (raw: string): string => {
    const t = (raw || '').toLowerCase().trim();
    if (t === 'quiz' || t === 'quiz_programs' || t === 'quizzes' || t === 'quiz_program' || t === 'programs') return 'quiz_programs';
    if (t === 'quiz_results' || t === 'results' || t === 'rankings' || t === 'standings' || t === 'leaderboard') return 'quiz_results';
    if (t === 'quiz_bank' || t === 'questions' || t === 'question_bank' || t === 'bank') return 'quiz_bank';
    if (t === 'jury' || t === 'jury_bench' || t === 'evaluations' || t === 'evaluator' || t === 'moderation') return 'evaluations';
    if (t === 'hub' || t === 'hubs' || t === 'regional_hubs' || t === 'regional') return 'hubs';
    if (t === 'participants' || t === 'students' || t === 'roster' || t === 'candidates') return 'participants';
    if (t === 'stages' || t === 'progression' || t === 'gates' || t === 'timeline') return 'stages';
    if (t === 'case_decks' || t === 'cases' || t === 'submissions' || t === 'decks') return 'case_decks';
    if (t === 'institutions' || t === 'sponsors') return 'institutions';
    if (t === 'finances' || t === 'financial' || t === 'gst' || t === 'ledger') return 'finances';
    if (t === 'announcements' || t === 'bulletins') return 'announcements';
    if (t === 'audit_logs' || t === 'audit') return 'audit_logs';
    if (t === 'system_settings' || t === 'governance') return 'system_settings';
    if (t === 'telemetry') return 'overview';
    return t || 'overview';
  };

  // Active Tab from Global Context with local fallback
  const activeTab = normalizeTab(adminActiveTab || 'overview');

  const setActiveTab = (
    tab: any,
    options?: {
      jurySubTab?: 'evaluations' | 'jury_bench';
      openInduct?: boolean;
      openCreateHub?: boolean;
      openOnboardCoord?: boolean;
      openCreateQuiz?: boolean;
    }
  ) => {
    const normalized = normalizeTab(tab);

    if (options?.jurySubTab) {
      setJurySubTab(options.jurySubTab);
    }
    if (options?.openInduct) {
      setJurySubTab('jury_bench');
      setAutoOpenJuryInduct(true);
    } else {
      setAutoOpenJuryInduct(false);
    }
    setAutoOpenCreateHub(!!options?.openCreateHub);
    setAutoOpenOnboardCoord(!!options?.openOnboardCoord);
    setAutoOpenCreateQuiz(!!options?.openCreateQuiz);

    setAdminActiveTab(normalized);

    // Guaranteed instant scroll to top of both window and inner main container
    try {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (mainRef.current) {
        mainRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    } catch {
      // Fallback
    }
  };

  // Role Perspective Simulator
  const [rolePerspective, setRolePerspective] = useState<UserRole | 'all'>('admin');

  // Stage Selector
  const [activeStageSelected, setActiveStageSelected] = useState<StageId>('round_2');

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Quiz Bank Modal State
  const [showAddQModal, setShowAddQModal] = useState(false);
  const [newCategory, setNewCategory] = useState<QuizQuestion['category']>('Business Awareness');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newOptions, setNewOptions] = useState(['', '', '', '']);
  const [newCorrectIdx, setNewCorrectIdx] = useState(0);
  const [newMarks, setNewMarks] = useState(2);
  const [newNegativeMarks, setNewNegativeMarks] = useState(0.5);

  // Announcement Modal State
  const [showAddAncModal, setShowAddAncModal] = useState(false);
  const [ancTitle, setAncTitle] = useState('');
  const [ancContent, setAncContent] = useState('');
  const [ancCategory, setAncCategory] = useState<'Critical Alert' | 'Round Deadline' | 'Results' | 'Webinar & Briefing' | 'General'>('General');

  // Audit filter
  const [auditFilter, setAuditFilter] = useState<'all' | 'Quiz' | 'Submission' | 'Payment'>('all');

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim() || newOptions.some(o => !o.trim())) {
      alert('Please fill out question text and all four options.');
      return;
    }

    addQuestion({
      category: newCategory,
      difficulty: newDifficulty,
      questionText: newQuestionText,
      options: newOptions,
      correctAnswerIndex: newCorrectIdx,
      marks: newMarks,
      negativeMarks: newNegativeMarks,
      isActive: true,
    });

    setShowAddQModal(false);
    setNewQuestionText('');
    setNewOptions(['', '', '', '']);
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ancTitle.trim() || !ancContent.trim()) return;

    addAnnouncement({
      title: ancTitle,
      content: ancContent,
      category: ancCategory,
      targetRoles: 'all',
      isPinned: ancCategory === 'Critical Alert',
    });

    setShowAddAncModal(false);
    setAncTitle('');
    setAncContent('');
  };

  const filteredLogs = auditLogs.filter(log => {
    if (auditFilter === 'all') return true;
    return log.module === auditFilter;
  });

  const grossRevenue = payments.reduce((acc, p) => (p.status === 'SUCCESS' ? acc + p.amount : acc), 0);
  const gstCollected = Math.round(grossRevenue * 0.18);

  const totalRegisteredCandidates = teams.reduce((acc, t) => acc + t.members.length, 0) + 3840; // mock aggregate count
  const allSubmissions = caseSubmissions.length > 0 ? caseSubmissions : teams.map(t => t.r2Submission).filter(Boolean);

  // Smartly Grouped Sidebar Menu Structure
  interface MenuItem {
    id: string;
    label: string;
    icon: any;
    badge?: string;
    roles: string[];
  }

  interface MenuGroup {
    id: string;
    title: string;
    items: MenuItem[];
  }

  const menuGroups: MenuGroup[] = [
    {
      id: 'command_broadcast',
      title: 'Core Command',
      items: [
        {
          id: 'overview',
          label: 'Executive Command',
          icon: LayoutDashboard,
          roles: ['admin', 'all', 'regional_hub', 'institute_coordinator', 'corporate_partner', 'evaluator'],
        },
        {
          id: 'announcements',
          label: 'Official Bulletins',
          icon: Radio,
          badge: `${announcements.length}`,
          roles: ['admin', 'all'],
        },
        {
          id: 'stages',
          label: 'Phase Progression Gates',
          icon: Sliders,
          badge: 'Live R2',
          roles: ['admin', 'all'],
        },
      ],
    },
    {
      id: 'round1_quiz',
      title: 'Round 1: Screening Quiz',
      items: [
        {
          id: 'quiz_programs',
          label: 'Quiz Programs & Events',
          icon: Trophy,
          badge: `${quizPrograms.length}`,
          roles: ['admin', 'all', 'regional_hub', 'institute_coordinator', 'corporate_partner', 'evaluator'],
        },
        {
          id: 'quiz_bank',
          label: 'Quiz Question Bank',
          icon: BookOpen,
          badge: `${questions.length}`,
          roles: ['admin', 'all', 'evaluator'],
        },
        {
          id: 'quiz_results',
          label: 'Quiz Results & Rankings',
          icon: BarChart3,
          badge: 'Live',
          roles: ['admin', 'all', 'regional_hub', 'institute_coordinator', 'corporate_partner', 'evaluator'],
        },
      ],
    },
    {
      id: 'rounds_evaluations',
      title: 'Rounds 2-4: Case & Jury',
      items: [
        {
          id: 'case_decks',
          label: 'Case Decks & AI Review',
          icon: FileCheck,
          badge: `${allSubmissions.length}`,
          roles: ['admin', 'evaluator', 'all'],
        },
        {
          id: 'evaluations',
          label: 'Jury Bench & Evaluations',
          icon: Scale,
          badge: `${evaluations.length}`,
          roles: ['admin', 'evaluator', 'all'],
        },
        {
          id: 'participants',
          label: 'Candidate Master Roster',
          icon: Users,
          badge: `${users.length}`,
          roles: ['admin', 'institute_coordinator', 'all'],
        },
      ],
    },
    {
      id: 'ecosystem_partners',
      title: 'Institutes & Partners',
      items: [
        {
          id: 'institutions',
          label: 'Institutes & Sponsors',
          icon: Building2,
          badge: `${institutions.length + (sponsors?.length || 0)}`,
          roles: ['admin', 'institute_coordinator', 'corporate_partner', 'all'],
        },
        {
          id: 'hubs',
          label: 'Regional Hubs & Zones',
          icon: MapPin,
          badge: `${hubs.length}`,
          roles: ['admin', 'regional_hub', 'all'],
        },
        {
          id: 'finances',
          label: 'Financial & GST Ledger',
          icon: Coins,
          badge: `₹${(grossRevenue / 1000).toFixed(0)}k`,
          roles: ['admin', 'all'],
        },
      ],
    },
    {
      id: 'security_governance',
      title: 'Security & Governance',
      items: [
        {
          id: 'audit_logs',
          label: 'ISO 27001 Audit Trail',
          icon: ShieldAlert,
          badge: `${auditLogs.length}`,
          roles: ['admin', 'all'],
        },
        {
          id: 'system_settings',
          label: 'System Governance',
          icon: Shield,
          roles: ['admin', 'all'],
        },
      ],
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col lg:flex-row bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Mobile Sidebar Toggle Header */}
      <div className="lg:hidden p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2">
          <div className="h-8 px-1.5 rounded-lg bg-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
            <img
              src="https://www.aima.in/img/logo.png"
              alt="AIMA Logo"
              className="h-5 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="font-bold text-xs uppercase text-slate-900 dark:text-white">Admin Command</span>
            <span className="text-[10px] text-slate-500 block">AIMA-ICRC Central Secretariat</span>
          </div>
        </div>

        <button
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Admin Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 lg:static flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 shadow-xl lg:shadow-none ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-72'
        } ${
          mobileSidebarOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className={`flex items-center gap-3 overflow-hidden ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="h-10 px-2 rounded-xl bg-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
              <img
                src="https://www.aima.in/img/logo.png"
                alt="AIMA Logo"
                className="h-6 w-auto object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs tracking-tight text-slate-900 dark:text-white uppercase">
                  Central Secretariat
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Command Online
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          </button>
        </div>

        {/* Role Perspective Switcher Pill in Sidebar */}
        <div className={`p-3 border-b border-slate-100 dark:border-slate-800/80 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5 px-1">
            View Perspective As:
          </label>
          <select
            value={rolePerspective}
            onChange={e => setRolePerspective(e.target.value as any)}
            className="w-full text-xs font-semibold rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 p-2 text-slate-900 dark:text-slate-100 cursor-pointer focus:ring-2 focus:ring-red-500"
          >
            <option value="admin">🛡️ Master Super Admin</option>
            <option value="evaluator">⚖️ National Jury Evaluator</option>
            <option value="regional_hub">🏛️ Regional Hub Coordinator</option>
            <option value="institute_coordinator">🎓 Institute Coordinator</option>
            <option value="corporate_partner">💼 Corporate Partner Desk</option>
            <option value="all">🌐 All Perspectives Combined</option>
          </select>
        </div>

        {/* Grouped Navigation Item Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {menuGroups.map(group => {
            const visibleItems = group.items.filter(item => {
              if (rolePerspective === 'admin' || rolePerspective === 'all') return true;
              return item.roles.includes(rolePerspective);
            });

            if (visibleItems.length === 0) return null;

            return (
              <div key={group.id} className="space-y-1">
                {/* Group Section Header */}
                {!sidebarCollapsed ? (
                  <div className="px-2 pt-1 pb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    <span>{group.title}</span>
                  </div>
                ) : (
                  <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
                )}

                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-red-600 text-white font-bold shadow-md shadow-red-500/20'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                      } ${sidebarCollapsed ? 'lg:justify-center' : ''}`}
                      title={item.label}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className={`truncate ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
                          {item.label}
                        </span>
                      </div>

                      {item.badge && !sidebarCollapsed && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer: Quick Status & Export */}
        <div className={`p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/50 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
          <div className="p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 dark:text-slate-300">National Quota</span>
              <span className="text-emerald-600 font-bold">100% Verified</span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full w-4/5 rounded-full" />
            </div>
            <button
              onClick={() => {
                const data = JSON.stringify({ config, teams, payments, auditLogs }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `AIMA_ICL_2026_Admin_Export_${Date.now()}.json`;
                a.click();
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Data</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Content Area */}
      <main ref={mainRef} className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        
        {/* Top Breadcrumb & Status Bar */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>Admin Portal</span>
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="text-red-600 dark:text-red-400 capitalize font-bold">
                {activeTab.replace('_', ' ')}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 capitalize">
              {activeTab === 'overview'
                ? 'Central Executive Command Desk'
                : activeTab === 'quiz_programs'
                ? 'Quiz Programs & Pan-India Live Assessments'
                : activeTab === 'quiz_results'
                ? 'National Quiz Standings, Cutoffs & Qualifiers'
                : activeTab === 'participants'
                ? 'Candidate Master Roster & ID Verification'
                : activeTab === 'stages'
                ? 'Competition Phase Progression Controller'
                : activeTab === 'quiz_bank'
                ? 'Round 1 Assessment Question Bank'
                : activeTab === 'case_decks'
                ? 'Round 2 Case Deck Repository & AI Evaluation'
                : activeTab === 'evaluations'
                ? 'National Jury Evaluation & Rubrics Engine'
                : activeTab === 'hubs'
                ? 'Regional Hub Logistics & Capacity Allocation'
                : activeTab === 'institutions'
                ? 'Accredited B-Schools & Corporate Desks'
                : activeTab === 'finances'
                ? 'B2B Financial Ledger & GST Tax Escrow'
                : activeTab === 'announcements'
                ? 'Broadcast Bulletins & Candidate Pushes'
                : activeTab === 'audit_logs'
                ? 'ISO 27001 Immutable Proctoring Audit Trail'
                : 'System Configuration & Eligibility Controls'}
            </h1>
          </div>

          {/* Perspective Indicator Pill */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              <span>Perspective: {rolePerspective.toUpperCase().replace('_', ' ')}</span>
            </span>

            <button
              onClick={() => setActiveTab('stages')}
              className="px-3 py-1.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold border border-red-500/20 hover:bg-red-500/20 transition-all cursor-pointer flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Phase: {config.activeStage.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* -------------------- TAB: OVERVIEW & TELEMETRY -------------------- */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-200">

            {/* Superadmin Direct Operations Station */}
            <div className="p-6 rounded-3xl bg-linear-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border border-slate-700 shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-base font-black tracking-tight text-white">
                      Secretariat Executive Fast-Actions Station
                    </h2>
                    <p className="text-xs text-slate-300">
                      Direct single-click administrative management for Quiz Programs, Certified Jury Induction, Regional Hubs, and Question Bank.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                  Instant Deep-Links
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* Action 1: Quiz Programs */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/50 transition-all flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                        <Trophy className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300">
                        {quizPrograms.length} Programs
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white mt-2">
                      Quiz Programs & Events
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Stage 1 screening tests, intake gates, proctoring & timers.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('quiz_programs')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-sm text-center"
                    >
                      Open Manager
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz_programs', { openCreateQuiz: true })}
                      className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10 text-center"
                      title="Create New Quiz Program"
                    >
                      + New
                    </button>
                  </div>
                </div>

                {/* Action 2: Jury Bench & Induction */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-purple-400/50 transition-all flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                        <GraduationCap className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-400/20 text-purple-300">
                        {users.filter(u => u.role === 'evaluator').length} Evaluators
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white mt-2">
                      Jury Bench & Evaluators
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Onboard certified jury members, dual-blind rubric scoring & moderation.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('evaluations', { jurySubTab: 'jury_bench', openInduct: true })}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer shadow-sm text-center"
                    >
                      + Induct Member
                    </button>
                    <button
                      onClick={() => setActiveTab('evaluations')}
                      className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10 text-center"
                    >
                      Scorecards
                    </button>
                  </div>
                </div>

                {/* Action 3: Regional Hubs & Coordinators */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-rose-400/50 transition-all flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-rose-500/20 text-rose-300">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-400/20 text-rose-300">
                        {hubs.length} Hubs
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white mt-2">
                      Regional Hubs & Logistics
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Create physical host hubs and onboard Nodal Coordinators.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('hubs', { openCreateHub: true })}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer shadow-sm text-center"
                    >
                      + Create Hub
                    </button>
                    <button
                      onClick={() => setActiveTab('hubs', { openOnboardCoord: true })}
                      className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10 text-center"
                    >
                      + Coordinator
                    </button>
                  </div>
                </div>

                {/* Action 4: Question Bank & Results */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-400/50 transition-all flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="p-2 rounded-xl bg-blue-500/20 text-blue-300">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-300">
                        {questions.length} Questions
                      </span>
                    </div>
                    <div className="font-bold text-sm text-white mt-2">
                      Question Bank & Results
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      Manage R1 MCQ repository and real-time candidate leaderboards.
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setActiveTab('quiz_bank')}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition cursor-pointer shadow-sm text-center"
                    >
                      Question Bank
                    </button>
                    <button
                      onClick={() => setActiveTab('quiz_results')}
                      className="py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition cursor-pointer border border-white/10 text-center"
                    >
                      Live Results
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Gross Settled Revenue</span>
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-emerald-500" />
                    <DocRequirementInfo specKey="admin_finances" variant="icon" size="xs" colorTheme="emerald" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  ₹{grossRevenue.toLocaleString('en-IN')}
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  Includes 18% GST (₹{gstCollected.toLocaleString('en-IN')})
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Registered Candidates</span>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-500" />
                    <DocRequirementInfo specKey="student_eligibility" variant="icon" size="xs" colorTheme="blue" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  {totalRegisteredCandidates.toLocaleString()}
                </div>
                <div className="text-xs text-blue-600 font-medium mt-1">
                  {teams.length + 940} Teams Across 5 Hubs
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Round 2 Case Decks</span>
                  <div className="flex items-center gap-1">
                    <FileCheck className="w-4 h-4 text-purple-500" />
                    <DocRequirementInfo specKey="round2_case" variant="icon" size="xs" colorTheme="purple" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  {allSubmissions.length} Decks
                </div>
                <div className="text-xs text-purple-600 font-medium mt-1">
                  AI Evaluated & Scored
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                  <span>Integrity Logs</span>
                  <div className="flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4 text-red-500" />
                    <DocRequirementInfo specKey="admin_audit" variant="icon" size="xs" colorTheme="rose" />
                  </div>
                </div>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  {auditLogs.length} Events
                </div>
                <div className="text-xs text-emerald-600 font-medium mt-1">
                  0 Unresolved Breaches
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Stage Gateway */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-red-500" />
                    <span>National Competition Stage Timeline & Gate Status</span>
                  </h3>
                  <DocRequirementInfo specKey="admin_stages" variant="icon" size="xs" colorTheme="slate" />
                </div>

                <div className="space-y-3">
                  {[
                    {
                      id: 'round_1',
                      name: 'Stage 1: Online Business Screening Quiz',
                      status: 'Completed',
                      detail: '45-minute timed test • 10,000+ candidates',
                      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
                    },
                    {
                      id: 'round_2',
                      name: 'Stage 2: 12-Slide Strategy Case Deck',
                      status: 'Live & Accepting',
                      detail: 'Electric Mobility Case • Closes in 8 days',
                      color: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
                    },
                    {
                      id: 'round_3',
                      name: 'Stage 3: 5 Pan-India Regional Live Hubs',
                      status: 'Scheduled',
                      detail: 'Delhi, Mumbai, Bengaluru, Kolkata, Guwahati',
                      color: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
                    },
                    {
                      id: 'round_4',
                      name: 'Stage 4: Grand National Finale & Boardroom Gala',
                      status: 'Final Gate',
                      detail: 'New Delhi Headquarters • ₹15 Lakhs Prize',
                      color: 'text-purple-600 bg-purple-500/10 border-purple-500/20',
                    },
                  ].map(stg => (
                    <div
                      key={stg.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100">{stg.name}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{stg.detail}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${stg.color}`}>
                        {stg.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Secretariat AI & Quick Tasks */}
              <div className="space-y-6">
                {/* AI Secretariat Intelligence Copilot */}
                <div className="p-6 rounded-3xl bg-linear-to-br from-indigo-900 via-slate-900 to-slate-950 text-white shadow-lg border border-indigo-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                        <Bot className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-white">Secretariat AI Command</h3>
                        <p className="text-[11px] text-indigo-200">Natural Language Intelligence & Queries</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Live Engine
                    </span>
                  </div>

                  <p className="text-xs text-indigo-200/90 leading-relaxed">
                    Query nationwide metrics, rankings, proctoring alerts, and quiz stats instantaneously:
                  </p>

                  <div className="space-y-1.5 text-xs">
                    <button
                      onClick={() => openChatWithQuery('Which teams are leading currently in Round 2?')}
                      className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 flex items-center justify-between transition-colors cursor-pointer text-[11px] font-semibold"
                    >
                      <span>🏆 Who are the leading teams in Round 2?</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                    <button
                      onClick={() => openChatWithQuery('What is the total quiz participation and pass rate?')}
                      className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 flex items-center justify-between transition-colors cursor-pointer text-[11px] font-semibold"
                    >
                      <span>📊 What is the total quiz participation?</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                    <button
                      onClick={() => openChatWithQuery('Show financial collection and GST breakdown')}
                      className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-slate-100 flex items-center justify-between transition-colors cursor-pointer text-[11px] font-semibold"
                    >
                      <span>💰 Financial revenue & GST status</span>
                      <ChevronRight className="w-3.5 h-3.5 text-indigo-300" />
                    </button>
                  </div>

                  <button
                    onClick={() => openChatWithQuery()}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
                  >
                    <Bot className="w-4 h-4" />
                    <span>Launch Secretariat AI Chatbot</span>
                  </button>
                </div>

                {/* Secretariat Quick Navigation Shortcuts */}
                <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span>Central Control Quick Tasks</span>
                  </h3>

                  <div className="space-y-2 text-xs">
                    <button
                      onClick={() => setActiveTab('quiz_programs')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>🏆 Manage Quiz Programs & Live Quizzes</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('evaluations', { jurySubTab: 'jury_bench', openInduct: true })}
                      className="w-full p-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-left font-bold text-purple-900 dark:text-purple-200 flex items-center justify-between transition-colors cursor-pointer border border-purple-200/50 dark:border-purple-800/50"
                    >
                      <span>⚖️ Onboard Certified Jury Member / Evaluator</span>
                      <ChevronRight className="w-4 h-4 text-purple-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('hubs', { openCreateHub: true })}
                      className="w-full p-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-left font-bold text-rose-900 dark:text-rose-200 flex items-center justify-between transition-colors cursor-pointer border border-rose-200/50 dark:border-rose-800/50"
                    >
                      <span>📍 Create Regional Hub / Onboard Coordinator</span>
                      <ChevronRight className="w-4 h-4 text-rose-500" />
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz_results')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>📊 Check National Quiz Results & Top Leaders</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('participants')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>👥 Candidate Master Registry & ID Verifications</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('evaluations')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>⚖️ Review Jury Evaluation Scorecards & Moderation</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('quiz_bank')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>❓ Manage Round 1 Quiz Questions Bank</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('case_decks')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>📁 Review Round 2 Team Submissions</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => setActiveTab('hubs')}
                      className="w-full p-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-left font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>📍 Regional Hubs Allotment & Infrastructure</span>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: QUIZ PROGRAMS -------------------- */}
        {activeTab === 'quiz_programs' && (
          <div className="animate-in fade-in duration-200">
            <QuizProgramManager
              autoOpenCreate={autoOpenCreateQuiz}
              onNavigateToResults={() => setActiveTab('quiz_results')}
              onNavigateToQuestions={() => setActiveTab('quiz_bank')}
            />
          </div>
        )}

        {/* -------------------- TAB: QUIZ RESULTS & LEADERBOARD -------------------- */}
        {activeTab === 'quiz_results' && (
          <div className="animate-in fade-in duration-200">
            <QuizResultsLeaderboard />
          </div>
        )}

        {/* -------------------- TAB: PARTICIPANTS ROSTER -------------------- */}
        {activeTab === 'participants' && (
          <div className="animate-in fade-in duration-200">
            <ParticipantsManager />
          </div>
        )}

        {/* -------------------- TAB: STAGE PROGRESSION -------------------- */}
        {activeTab === 'stages' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Competition Stage Gate Overrides
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Toggle active phase to govern access rules across all candidate, evaluator, and regional hub dashboards.
                  </p>
                </div>

                <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white self-start sm:self-auto shadow-xs">
                  Active Phase: {config.activeStage.toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { stage: 'round_1', label: 'Round 1: Screening Quiz', desc: 'Candidates take 45-min timed online test' },
                  { stage: 'round_2', label: 'Round 2: Case Deck', desc: '12-Slide PDF strategy submissions' },
                  { stage: 'round_3', label: 'Round 3: Regional Live', desc: '5 Regional hubs in-person solve' },
                  { stage: 'round_4', label: 'Round 4: Grand Finale', desc: 'National Boardroom & Awards Gala' },
                ].map(item => {
                  const isActive = config.activeStage === item.stage;
                  return (
                    <button
                      key={item.stage}
                      onClick={() => updateConfig({ activeStage: item.stage as StageId })}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                        isActive
                          ? 'border-red-500 bg-red-50/70 dark:bg-red-950/30 shadow-md ring-2 ring-red-500/50'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-red-600' : 'bg-slate-300'}`} />
                        {isActive && <span className="text-[10px] font-bold text-red-600">ACTIVE GATE</span>}
                      </div>
                      <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">{item.label}</div>
                      <div className="text-[11px] text-slate-500 mt-1">{item.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Master Control Toggles */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Round 1 Negative Marking</span>
                    <span className="text-[11px] text-slate-500">Deducts 0.5 marks per wrong answer</span>
                  </div>
                  <button
                    onClick={() => updateConfig({ r1NegativeMarking: !config.r1NegativeMarking })}
                    className={`p-1 text-2xl cursor-pointer ${config.r1NegativeMarking ? 'text-red-600' : 'text-slate-400'}`}
                  >
                    {config.r1NegativeMarking ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Public Registration Portal</span>
                    <span className="text-[11px] text-slate-500">Accepting new student and team signups</span>
                  </div>
                  <button
                    onClick={() => updateConfig({ registrationOpen: !config.registrationOpen })}
                    className={`p-1 text-2xl cursor-pointer ${config.registrationOpen ? 'text-red-600' : 'text-slate-400'}`}
                  >
                    {config.registrationOpen ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Public Results Leaderboard</span>
                    <span className="text-[11px] text-slate-500">Publish national qualifier leaderboard</span>
                  </div>
                  <button
                    onClick={() => updateConfig({ isPublicResultsPublished: !config.isPublicResultsPublished })}
                    className={`p-1 text-2xl cursor-pointer ${config.isPublicResultsPublished ? 'text-red-600' : 'text-slate-400'}`}
                  >
                    {config.isPublicResultsPublished ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: QUIZ BANK -------------------- */}
        {activeTab === 'quiz_bank' && (
          <div className="animate-in fade-in duration-200">
            <QuizQuestionBankManager />
          </div>
        )}

        {/* -------------------- TAB: CASE DECKS & SUBMISSIONS -------------------- */}
        {activeTab === 'case_decks' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Round 2 Case Deck Submissions & Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review candidate submissions, slide counts, financial models, and dual AI similarity flags.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Team Name</th>
                      <th className="p-3">Deck File</th>
                      <th className="p-3">Slides / Size</th>
                      <th className="p-3">Submitted At</th>
                      <th className="p-3">AI Similarity</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {teams.map(t => {
                      const sub = t.r2Submission;
                      return (
                        <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="p-3">
                            <div className="font-bold text-slate-900 dark:text-slate-100">{t.name}</div>
                            <div className="text-[10px] text-slate-400">{t.instituteName}</div>
                          </td>
                          <td className="p-3 font-mono font-medium text-blue-600 dark:text-blue-400">
                            {sub?.deckFileName || 'Pending Upload'}
                          </td>
                          <td className="p-3 text-slate-600 dark:text-slate-400">
                            {sub ? `${sub.slideCount || 12} slides • ${sub.deckFileSize}` : '—'}
                          </td>
                          <td className="p-3 text-slate-500 text-[11px]">
                            {sub ? new Date(sub.submittedAt).toLocaleDateString() : '—'}
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 font-bold text-[10px]">
                              {sub?.aiAssessment?.similarityIndex ? `${sub.aiAssessment.similarityIndex}% (Clear)` : '3.1% (Clear)'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold text-[10px]">
                              {sub ? 'Under Jury Review' : 'Awaiting Submission'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: EVALUATIONS & RUBRIC -------------------- */}
        {activeTab === 'evaluations' && (
          <div className="animate-in fade-in duration-200">
            <JuryEvaluationsManager
              initialSubTab={jurySubTab}
              autoOpenInduct={autoOpenJuryInduct}
            />
          </div>
        )}

        {/* -------------------- TAB: REGIONAL HUBS -------------------- */}
        {activeTab === 'hubs' && (
          <div className="animate-in fade-in duration-200">
            <RegionalHubsManager
              autoOpenCreateHub={autoOpenCreateHub}
              autoOpenOnboardCoord={autoOpenOnboardCoord}
            />
          </div>
        )}

        {/* -------------------- TAB: INSTITUTES & SPONSORS -------------------- */}
        {activeTab === 'institutions' && (
          <div className="animate-in fade-in duration-200">
            <InstitutesAndSponsorsManager />
          </div>
        )}

        {/* -------------------- TAB: SYSTEM SETTINGS & GATES -------------------- */}
        {activeTab === 'system_settings' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-red-600" />
                  <span>Competition Governance, Deadlines & Cutoffs</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Global operational rules applied across all participant workflows in real-time.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Stage 1: Business Quiz Rules</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Qualifying Cutoff Percentage:</span>
                      <span className="font-bold text-blue-600">{config.r1CutoffScore}% Cutoff</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Quiz Duration:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{config.r1DurationMinutes} Minutes</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Negative Marking (+2 / -0.5):</span>
                      <span className="font-bold text-emerald-600">{config.r1NegativeMarking ? 'Active' : 'Disabled'}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">Stage 2: Case Deck Parameters</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Slide Ceiling:</span>
                      <span className="font-bold text-blue-600">{config.r2MaxSlideCount} Slides Maximum</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Max File Size (PDF):</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{config.r2MaxFileSizeMB} MB</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Evaluators Per Submission:</span>
                      <span className="font-bold text-purple-600">{config.r2EvaluatorsPerDeck} Blind Reviewers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: FINANCIAL LEDGER -------------------- */}
        {activeTab === 'finances' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gross Revenue Settled</span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
                  ₹{grossRevenue.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">Across All 4 Stages</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">GST Collected (18%)</span>
                <span className="text-2xl font-black text-amber-600 mt-1 block">
                  ₹{gstCollected.toLocaleString()}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Central + State GST</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Registered Transactions</span>
                <span className="text-2xl font-black text-purple-600 mt-1 block">
                  {payments.length} Invoices
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">B2B Tax Invoiced</span>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Prize Purse Reserve</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block">₹15,00,000</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Escrow Allocated</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600" />
                <span>Recent Stage Transactions & B2B GST Invoices</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="p-3">Receipt Code</th>
                      <th className="p-3">Candidate / Entity</th>
                      <th className="p-3">Stage</th>
                      <th className="p-3">Method</th>
                      <th className="p-3">Total Paid</th>
                      <th className="p-3 text-right">Tax Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-mono font-bold text-amber-600">{p.transactionId}</td>
                        <td className="p-3 font-semibold">{p.userName}</td>
                        <td className="p-3 uppercase text-[10px]">{p.stage.replace('_', ' ')}</td>
                        <td className="p-3">{p.paymentMethod}</td>
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">₹{p.amount.toLocaleString()}</td>
                        <td className="p-3 text-right">
                          <span
                            onClick={() => alert(`Downloading GST Invoice #${p.gstInvoiceNumber} for ₹${p.amount}...`)}
                            className="text-emerald-600 font-semibold cursor-pointer underline"
                          >
                            {p.gstInvoiceNumber}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: AUDIT LOGS -------------------- */}
        {activeTab === 'audit_logs' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-600" />
                    <span>ISO 27001 Academic Integrity Audit Trail</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Immutable cryptographically logged records of proctoring events, submissions & jury scores.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={auditFilter}
                    onChange={e => setAuditFilter(e.target.value as any)}
                    className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold"
                  >
                    <option value="all">All Modules</option>
                    <option value="Quiz">Quiz Proctoring</option>
                    <option value="Submission">Case Submissions</option>
                    <option value="Payment">Payments & Invoicing</option>
                  </select>
                </div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map(log => (
                  <div key={log.id} className="py-3 flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {log.module}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-slate-100">{log.action}</span>
                        <span className="font-mono text-[10px] text-slate-400">{log.ipAddress}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">{log.details}</p>
                      <span className="text-[10px] text-slate-500 font-medium">User: {log.userName} ({log.userRole})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB: ANNOUNCEMENTS & TARGETED BULLETINS -------------------- */}
        {activeTab === 'announcements' && (
          <div className="animate-in fade-in duration-200">
            <OfficialBulletinsManager />
          </div>
        )}

      </main>

      {/* Add Question Modal */}
      {showAddQModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 my-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Add Question to Quiz Bank</h3>
            
            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Business Awareness">Business Awareness</option>
                    <option value="Management Concepts">Management Concepts</option>
                    <option value="Corporate Strategy">Corporate Strategy</option>
                    <option value="Finance & Marketing">Finance & Marketing</option>
                    <option value="Economics & Policy">Economics & Policy</option>
                    <option value="Data Interpretation">Data Interpretation</option>
                    <option value="Logical Reasoning">Logical Reasoning</option>
                    <option value="Sustainability & AI">Sustainability & AI</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as any)}
                    className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Question Statement</label>
                <textarea
                  rows={3}
                  required
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="Enter complete question statement..."
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-semibold">Multiple Choice Options (4)</label>
                {newOptions.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct-opt"
                      checked={newCorrectIdx === idx}
                      onChange={() => setNewCorrectIdx(idx)}
                      className="accent-red-600"
                    />
                    <input
                      type="text"
                      required
                      placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                      value={opt}
                      onChange={e => {
                        const updated = [...newOptions];
                        updated[idx] = e.target.value;
                        setNewOptions(updated);
                      }}
                      className="flex-1 p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddQModal(false)}
                  className="px-4 py-2 font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Announcement Modal */}
      {showAddAncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Publish Official Bulletin</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Bulletin Category</label>
                <select
                  value={ancCategory}
                  onChange={e => setAncCategory(e.target.value as any)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                >
                  <option value="General">General</option>
                  <option value="Critical Alert">Critical Alert</option>
                  <option value="Round Deadline">Round Deadline</option>
                  <option value="Results">Results</option>
                  <option value="Webinar & Briefing">Webinar & Briefing</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={ancTitle}
                  onChange={e => setAncTitle(e.target.value)}
                  placeholder="e.g. Round 2 Case Deck Deadline Clarification"
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Body Text</label>
                <textarea
                  rows={3}
                  required
                  value={ancContent}
                  onChange={e => setAncContent(e.target.value)}
                  placeholder="Enter announcement text..."
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddAncModal(false)}
                  className="px-4 py-2 font-semibold text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Publish Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
