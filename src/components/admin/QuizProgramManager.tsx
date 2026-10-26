import React, { useState, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizProgram } from '../../types';
import { toTitleCase, formatQuizDateRange, parseISTTimestamp } from '../../lib/formatters';
import {
  BookOpen,
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  Clock,
  IndianRupee,
  ShieldAlert,
  Award,
  Filter,
  Search,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Calendar,
  AlertCircle,
  Zap,
  HelpCircle,
  ShieldCheck,
  Check,
  ListOrdered,
  Loader2,
} from 'lucide-react';
import { ProgramQuestionsEditorModal } from './ProgramQuestionsEditorModal';

interface QuizProgramManagerProps {
  onNavigateToResults?: (programId?: string) => void;
  onNavigateToQuestions?: () => void;
  onNavigateToCurator?: (programId?: string) => void;
  autoOpenCreate?: boolean;
}

export const QuizProgramManager: React.FC<QuizProgramManagerProps> = ({
  onNavigateToResults,
  onNavigateToQuestions,
  onNavigateToCurator,
  autoOpenCreate = false,
}) => {
  const {
    quizPrograms,
    addQuizProgram,
    updateQuizProgram,
    deleteQuizProgram,
    refreshQuizPrograms,
    questions,
    quizAttempts,
    setAdminActiveTab,
    programQuestionMappings,
    csrRegistrations,
    config,
  } = useCompetition();

  const [isRefreshing, setIsRefreshing] = useState(false);

  React.useEffect(() => {
    refreshQuizPrograms?.();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshQuizPrograms?.();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'draft' | 'paused'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<QuizProgram | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<'round_1' | 'round_2' | 'mock' | 'regional'>('round_1');
  const [fee, setFee] = useState<number>(1000);
  const [intakeCapacity, setIntakeCapacity] = useState<number>(5000);
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [totalQuestions, setTotalQuestions] = useState<number>(30);
  const [totalMarks, setTotalMarks] = useState<number>(100);
  const [cutoffScore, setCutoffScore] = useState<number>(75);
  const [negativeMarkingPerWrong, setNegativeMarkingPerWrong] = useState<number>(0.5);
  const [startDate, setStartDate] = useState<string>('2026-09-01 09:00');
  const [endDate, setEndDate] = useState<string>('2026-09-15 23:59');
  const [status, setStatus] = useState<QuizProgram['status']>('live');
  const [proctoringMode, setProctoringMode] = useState<string>('strict_lockdown');
  const [instructions, setInstructions] = useState<string>('Full-screen mode enforced. Tab switches will trigger disqualification warnings.');
  const [category, setCategory] = useState<string>('Corporate Strategy & Management');
  const [isCustomCategory, setIsCustomCategory] = useState<boolean>(false);
  const [customCategory, setCustomCategory] = useState<string>('');
  const [eligibility, setEligibility] = useState<string>('All registered management students');

  // Manual override states for marks breakdown
  const [useManualMarksOverride, setUseManualMarksOverride] = useState<boolean>(false);
  const [manualMarksPerQuestion, setManualMarksPerQuestion] = useState<number>(4);
  const [manualPassingMarks, setManualPassingMarks] = useState<number>(75);

  // Program Questions Editor Modal state
  const [activeProgramForQuestions, setActiveProgramForQuestions] = useState<QuizProgram | null>(null);
  const [showQuestionsEditorModal, setShowQuestionsEditorModal] = useState<boolean>(false);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(false);
  const [allowReview, setAllowReview] = useState<boolean>(true);
  const [isSavingProgram, setIsSavingProgram] = useState<boolean>(false);

  // Helper to normalize program status: explicit admin status takes precedence over date checks
  const getNormalizedStatus = (progStatus: string, startDate?: string, endDate?: string): 'active' | 'upcoming' | 'completed' | 'draft' | 'paused' => {
    if (progStatus === 'draft') return 'draft';
    if (progStatus === 'live' || progStatus === 'active') return 'active';
    if (progStatus === 'completed') return 'completed';
    if (progStatus === 'upcoming') return 'upcoming';
    if (progStatus === 'paused') return 'paused';

    const now = Date.now();
    const s = parseISTTimestamp(startDate);
    const e = parseISTTimestamp(endDate);

    if (!isNaN(e) && now > e) return 'completed';
    if (!isNaN(s) && now < s) return 'upcoming';
    if (!isNaN(s) && !isNaN(e) && now >= s && now <= e) return 'active';
    if (!isNaN(s) && now >= s) return 'active';

    return 'upcoming';
  };

  const [statusChangeFeedback, setStatusChangeFeedback] = useState<{ id: string; status: string } | null>(null);

  const handleDirectStatusChange = async (prog: QuizProgram, newStatus: 'upcoming' | 'live' | 'completed') => {
    setStatusChangeFeedback({ id: prog.id, status: newStatus });
    setTimeout(() => setStatusChangeFeedback(null), 3500);

    const isPub = prog.isResultsPublished !== undefined ? prog.isResultsPublished : (prog as any).is_results_published;
    updateQuizProgram(prog.id, {
      status: newStatus,
      isResultsPublished: isPub,
      is_results_published: isPub,
    });

    addAuditLog(
      'Quiz Status Updated',
      'Quiz',
      `Super Admin changed status of "${prog.title}" to ${newStatus.toUpperCase()}`
    );

    try {
      await refreshQuizPrograms();
    } catch {}
  };

  const openCreateModal = () => {
    setEditingProgram(null);
    setIsSavingProgram(false);
    setTitle('');
    setCode(`AIMA-Q-${Math.floor(100 + Math.random() * 900)}`);
    setDescription('');
    setStage('round_1');
    setFee(1000);
    setIntakeCapacity(5000);
    setDurationMinutes(45);
    setTotalQuestions(questions.length || 30);
    setTotalMarks(100);
    setCutoffScore(75);
    setNegativeMarkingPerWrong(0.5);
    setStartDate('2026-09-01 09:00');
    setEndDate('2026-09-15 23:59');
    setStatus('live');
    setProctoringMode('strict_lockdown');
    setInstructions('Full-screen mode enforced. Tab switches will trigger disqualification warnings.');
    setCategory('');
    setIsCustomCategory(false);
    setCustomCategory('');
    setEligibility('');
    setUseManualMarksOverride(false);
    setManualMarksPerQuestion(Math.round(100 / Math.max(1, questions.length || 30)));
    setManualPassingMarks(Math.round(100 * (75 / 100)));
    setShuffleQuestions(false);
    setAllowReview(true);
    setShowCreateModal(true);
  };

  React.useEffect(() => {
    if (autoOpenCreate) {
      openCreateModal();
    }
  }, [autoOpenCreate]);

  const openEditModal = (prog: QuizProgram) => {
    setEditingProgram(prog);
    setIsSavingProgram(false);
    setTitle(prog.title || '');
    setCode(prog.code || '');
    setDescription(prog.description || '');
    setStage((prog.stage as any) || 'round_1');
    setFee(prog.fee ?? 0);
    setIntakeCapacity(prog.intakeCapacity || prog.maxIntake || 5000);
    setDurationMinutes(prog.durationMinutes || 45);
    setTotalQuestions(prog.totalQuestions || 30);
    setTotalMarks(prog.totalMarks || 100);
    setCutoffScore(prog.cutoffScore ?? 65);
    setNegativeMarkingPerWrong(prog.negativeMarkingPerWrong ?? prog.negativeMarksPerQuestion ?? 0.5);
    setStartDate(prog.startDate || prog.startTime || '2026-09-10 10:00');
    setEndDate(prog.endDate || prog.endTime || '2026-09-15 22:00');
    setStatus(prog.status || 'live');
    setProctoringMode(prog.proctoringMode || prog.proctoringStrictness || 'strict_lockdown');
    setInstructions(
      Array.isArray(prog.instructions)
        ? prog.instructions.join('\n')
        : (prog.instructions || 'Full-screen mode enforced. Tab switches will trigger disqualification warnings.')
    );
    const standardCategories = [
      'Corporate Strategy & Management',
      'Corporate Strategy & Business Awareness',
      'Management Concepts & Case Analysis',
      'Sustainability & AI',
      'Economics & Policy',
      'Finance & Marketing',
      'Data Interpretation',
    ];
    setCategory(prog.category || '');
    setIsCustomCategory(false);
    setCustomCategory('');
    setEligibility(prog.eligibility || '');

    const derivedMarks = Math.round(Number(prog.totalMarks || 100) / Math.max(1, Number(prog.totalQuestions || 30)));
    const derivedPassing = Math.round(Number(prog.totalMarks || 100) * (Number(prog.cutoffScore ?? 65) / 100));
    const hasCustomMarks = (prog.marksPerQuestion !== undefined && prog.marksPerQuestion !== derivedMarks) ||
      (prog.passingMarks !== undefined && prog.passingMarks !== derivedPassing);
    setUseManualMarksOverride(hasCustomMarks);
    setManualMarksPerQuestion(prog.marksPerQuestion ?? derivedMarks);
    setManualPassingMarks(prog.passingMarks ?? derivedPassing);
    setShuffleQuestions(Boolean(prog.shuffleQuestions));
    setAllowReview(prog.allowReview !== false);

    setShowCreateModal(true);
  };

  const handleSaveProgram = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      alert('Please enter a valid title and code.');
      return;
    }

    setIsSavingProgram(true);
    try {
      const finalCategory = editingProgram ? (editingProgram.category || '') : (category || '');
      const finalEligibility = editingProgram ? (editingProgram.eligibility || '') : (eligibility || '');
      const autoPassingMarks = Math.round(Number(totalMarks) * (Number(cutoffScore) / 100));
      const autoMarksPerQuestion = Math.round(Number(totalMarks) / Math.max(1, Number(totalQuestions)));

      const computedPassingMarks = useManualMarksOverride ? Number(manualPassingMarks) : autoPassingMarks;
      const computedMarksPerQuestion = useManualMarksOverride ? Number(manualMarksPerQuestion) : autoMarksPerQuestion;

      const payload: Partial<QuizProgram> = {
        title,
        code,
        description,
        stage: stage as any,
        category: finalCategory,
        eligibility: finalEligibility,
        fee: Number(fee),
        intakeCapacity: Number(intakeCapacity),
        maxIntake: Number(intakeCapacity),
        durationMinutes: Number(durationMinutes),
        totalQuestions: Number(totalQuestions),
        totalMarks: Number(totalMarks),
        cutoffScore: Number(cutoffScore),
        passingMarks: computedPassingMarks,
        marksPerQuestion: computedMarksPerQuestion,
        negativeMarking: Number(negativeMarkingPerWrong) > 0,
        negativeMarkingPerWrong: Number(negativeMarkingPerWrong),
        negativeMarksPerQuestion: Number(negativeMarkingPerWrong),
        startDate,
        endDate,
        startTime: startDate,
        endTime: endDate,
        status: status as any,
        isResultsPublished: editingProgram ? Boolean(editingProgram.isResultsPublished ?? (editingProgram as any).is_results_published) : false,
        is_results_published: editingProgram ? Boolean(editingProgram.isResultsPublished ?? (editingProgram as any).is_results_published) : false,
        proctoringMode,
        proctoringStrictness: proctoringMode === 'strict_lockdown' ? 'High (Webcam + Fullscreen + Tab Lock)' : 'Standard',
        instructions: instructions.split('\n').filter(Boolean),
        shuffleQuestions,
        allowReview,
      };

      // Brief animation buffer for clear user feedback
      await new Promise(resolve => setTimeout(resolve, 400));

      if (editingProgram) {
        updateQuizProgram(editingProgram.id, payload);
        setShowCreateModal(false);
      } else {
        const created = addQuizProgram({
          ...payload,
          tagline: description || title,
          tags: ['Online Assessment', 'Proctored'],
        } as any);
        setShowCreateModal(false);
        if (created) {
          setActiveProgramForQuestions(created);
          setShowQuestionsEditorModal(true);
        }
      }
    } finally {
      setIsSavingProgram(false);
    }
  };

  const toDateTimeLocal = (val: string) => {
    if (!val) return '';
    return val.replace(' ', 'T').slice(0, 16);
  };

  const fromDateTimeLocal = (val: string) => {
    if (!val) return '';
    return val.replace('T', ' ');
  };

  const setStartDatePreset = (mode: 'now' | 'tomorrow_morning') => {
    const pad = (n: number) => String(n).padStart(2, '0');
    if (mode === 'now') {
      const now = new Date();
      setStartDate(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`);
    } else {
      const tmrw = new Date();
      tmrw.setDate(tmrw.getDate() + 1);
      setStartDate(`${tmrw.getFullYear()}-${pad(tmrw.getMonth() + 1)}-${pad(tmrw.getDate())} 09:00`);
    }
  };

  const setEndDatePreset = (days: number) => {
    const pad = (n: number) => String(n).padStart(2, '0');
    let base = new Date();
    if (startDate) {
      const parsed = new Date(startDate.replace(' ', 'T'));
      if (!isNaN(parsed.getTime())) base = parsed;
    }
    const target = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
    setEndDate(`${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())} 23:59`);
  };

  const safeQuizPrograms = quizPrograms || [];

  const filteredPrograms = safeQuizPrograms.filter(prog => {
    const norm = getNormalizedStatus(prog.status, prog.startDate || prog.startTime, prog.endDate || prog.endTime);
    const matchesStatus = filterStatus === 'all' || norm === filterStatus;
    const matchesSearch =
      (prog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activePrograms = safeQuizPrograms.filter(p => getNormalizedStatus(p.status, p.startDate || p.startTime, p.endDate || p.endTime) === 'active');

  const totalEnrolledCandidates = useMemo(() => {
    const fromRegistrations = (csrRegistrations || []).reduce((acc, reg) => {
      const nomineeCount = Array.isArray(reg.nominees) ? reg.nominees.length : 0;
      return acc + (nomineeCount > 0 ? nomineeCount : (reg.teamCount ? reg.teamCount * 4 : 1));
    }, 0);
    if (fromRegistrations > 0) return fromRegistrations;
    return safeQuizPrograms.reduce((acc, p) => acc + (p.enrolledCount || 0), 0);
  }, [csrRegistrations, safeQuizPrograms]);

  const distinctInstitutesCount = useMemo(() => {
    const institutes = new Set(
      (csrRegistrations || [])
        .map(r => r.institutionName || r.organization || (r as any).instituteName)
        .filter(Boolean)
    );
    return institutes.size;
  }, [csrRegistrations]);

  const completedAttempts = useMemo(() => {
    return (quizAttempts || []).filter(a => a.isCompleted);
  }, [quizAttempts]);

  const completedCount = completedAttempts.length;
  const passedCount = completedAttempts.filter(a => (a.score || 0) >= (config?.r1CutoffScore || 65)).length;
  const passRate = completedCount > 0 ? Math.round((passedCount / completedCount) * 100) : 0;

  const liveTakingCount = useMemo(() => {
    return (quizAttempts || []).filter(a => !a.isCompleted).length;
  }, [quizAttempts]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
              <BookOpen className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  Quiz Programs & Live Test Operations
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, configure, and monitor pan-India online screening tests, intake limits, fee gates, and proctoring parameters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Refresh quiz programs & intake capacities from Supabase"
          >
            <Loader2 className={`w-3.5 h-3.5 text-blue-500 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Live DB'}</span>
          </button>

          <button
            onClick={() => onNavigateToResults?.() || setAdminActiveTab('quiz_results')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <BarChart3 className="w-4 h-4 text-emerald-500" />
            <span>Live Results & Leaderboard</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Quiz Program</span>
          </button>
        </div>
      </div>

      {/* Live Operations Telemetry */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Live Quizzes</span>
            <span className={`w-2 h-2 rounded-full ${activePrograms.length > 0 ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {activePrograms.length} Live
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {safeQuizPrograms.length} total registered {safeQuizPrograms.length === 1 ? 'program' : 'programs'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Enrolled Intake</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalEnrolledCandidates.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Across {distinctInstitutesCount > 0 ? `${distinctInstitutesCount} registered ${distinctInstitutesCount === 1 ? 'candidate' : 'candidates'}` : 'registered candidates'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {completedCount.toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            {completedCount} evaluated • {passRate}% qualified
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Live Taking Now</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {liveTakingCount.toLocaleString()}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Active test sessions across {activePrograms.length} live {activePrograms.length === 1 ? 'quiz' : 'quizzes'}
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quiz title, code or stage..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {(['all', 'active', 'upcoming', 'completed', 'draft', 'paused'] as const).map(st => {
            const count = st === 'all'
              ? safeQuizPrograms.length
              : safeQuizPrograms.filter(p => getNormalizedStatus(p.status, p.startDate || p.startTime, p.endDate || p.endTime) === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${filterStatus === st
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {st} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Programs List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredPrograms.length === 0 ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No Quiz Programs Found
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No quiz programs match the current filter or search criteria. Click &quot;Create Quiz Program&quot; to define a new screening assessment.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Quiz Program</span>
            </button>
          </div>
        ) : (
          filteredPrograms.map(prog => {
            const normStatus = getNormalizedStatus(prog.status, prog.startDate || prog.startTime, prog.endDate || prog.endTime);
            const isLive = normStatus === 'active';
            const capacity = prog.intakeCapacity || prog.maxIntake || 5000;
            const liveCandidatesCount = (prog.id === 'qp_case_comp_stage1_2026' && csrRegistrations && csrRegistrations.length > 0)
              ? csrRegistrations.reduce((acc, r) => acc + (r.participantCount || r.nominees?.length || 1), 0)
              : 0;
            const enrolled = Math.max(prog.enrolledCount || 0, liveCandidatesCount);

            // Format precise decimal percentage
            const rawPercent = Math.min(100, (enrolled / Math.max(1, capacity)) * 100);
            const fillPercentage = rawPercent === 0
              ? '0'
              : rawPercent < 1
                ? rawPercent.toFixed(2)
                : (rawPercent % 1 === 0 ? rawPercent.toFixed(0) : rawPercent.toFixed(1));

            const cutoff = prog.cutoffScore ?? 65;
            const negMark = prog.negativeMarkingPerWrong ?? prog.negativeMarksPerQuestion ?? 0.5;
            const { startFormatted, endFormatted } = formatQuizDateRange(
              prog.startDate || prog.startTime || '2026-09-10 10:00',
              prog.endDate || prog.endTime || '2026-09-15 22:00'
            );

            return (
              <div
                key={prog.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                        {prog.code || 'AIMA-QZ'}
                      </span>
                      {/* Direct One-Click Status Controls */}
                      <div className="inline-flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(prog, 'upcoming')}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            normStatus === 'upcoming'
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-blue-600 dark:hover:text-blue-400'
                          }`}
                          title="Set status to UPCOMING"
                        >
                          Upcoming
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(prog, 'live')}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1 ${
                            normStatus === 'active' || prog.status === 'live'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
                          }`}
                          title="Set status to LIVE (Accessible immediately to candidates)"
                        >
                          {(normStatus === 'active' || prog.status === 'live') && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                          )}
                          <span>Live</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectStatusChange(prog, 'completed')}
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                            normStatus === 'completed' || prog.status === 'completed'
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'text-slate-500 hover:text-purple-600 dark:hover:text-purple-400'
                          }`}
                          title="Set status to COMPLETED"
                        >
                          Completed
                        </button>
                      </div>

                      {statusChangeFeedback?.id === prog.id && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-in fade-in duration-200">
                          ✓ Set to {statusChangeFeedback.status.toUpperCase()}
                        </span>
                      )}
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {(prog.stage || 'round_1').replace('_', ' ')}
                      </span>
                      {Boolean(prog.category && prog.category.trim()) && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {prog.category}
                        </span>
                      )}

                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {toTitleCase(prog.title)}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {prog.description || 'Mandatory screening assessment testing core strategy, business concepts, and financial fundamentals.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditModal(prog)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Quiz Program"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete quiz program "${toTitleCase(prog.title)}"?`)) {
                          deleteQuizProgram(prog.id);
                        }
                      }}
                      className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-400 hover:text-red-600 transition cursor-pointer"
                      title="Delete Program"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Registration Fee</span>
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-0.5 mt-0.5">
                      {prog.fee === 0 ? 'FREE / Included' : `₹${(prog.fee || 0).toLocaleString()}`}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Duration & Marks</span>
                    <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">
                      {prog.durationMinutes || 45}m • {prog.totalMarks || 100} pts
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        ({prog.marksPerQuestion ?? Math.round(Number(prog.totalMarks || 100) / Math.max(1, Number(prog.totalQuestions || 25)))}m/q)
                      </span>
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Negative Marking</span>
                    <span className="font-bold text-red-600 dark:text-red-400 mt-0.5 block">
                      -{negMark} / wrong
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[10px] text-slate-400 font-semibold block">Cutoff Score</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                      {cutoff}% pass
                      <span className="text-[10px] text-slate-500 font-normal ml-1">
                        ({prog.passingMarks ?? Math.round(Number(prog.totalMarks || 100) * (cutoff / 100))} pts)
                      </span>
                    </span>
                  </div>
                </div>

                {/* Intake & Enrolment Progress */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Intake Capacity: <strong className="text-slate-900 dark:text-white">{enrolled.toLocaleString()}</strong> / {capacity.toLocaleString()}
                    </span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {fillPercentage}% filled
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-red-600 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(rawPercent > 0 ? 0.8 : 0, rawPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Schedule Window Row */}
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-slate-900 dark:text-white">{startFormatted}</span>
                    <span className="text-slate-400 font-bold">→</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{endFormatted}</span>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <button
                    onClick={() => {
                      if (onNavigateToCurator) {
                        onNavigateToCurator(prog.id);
                      } else {
                        setAdminActiveTab('quiz_editor');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-300 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border border-blue-200/60 dark:border-blue-800/60"
                    title="Open Dedicated Questions Curator Page"
                  >
                    <ListOrdered className="w-3.5 h-3.5" />
                    <span>Questions ({programQuestionMappings[prog.id] !== undefined ? programQuestionMappings[prog.id].length : (prog.assignedQuestionsCount || 0)}/{prog.totalQuestions})</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onNavigateToResults?.(prog.id) || setAdminActiveTab('quiz_results')}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold hover:opacity-90 flex items-center gap-1 transition cursor-pointer shadow-xs"
                    >
                      <span>View Results</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT QUIZ PROGRAM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  {editingProgram ? 'Update Quiz Program' : 'Create New Quiz Program'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure competition quiz parameters, intake gates, proctoring, timing, and evaluation criteria.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProgram} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Quiz Program Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Business Simulation & Strategy Screening Test"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Program Identifier Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AIMA-R1-2026"
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Description & Context
                </label>
                <textarea
                  rows={2}
                  placeholder="Summarize the quiz scope, topics covered, and stage eligibility..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500"
                />
              </div>



              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Target Stage
                  </label>
                  <select
                    value={stage}
                    onChange={e => setStage(e.target.value as any)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="round_1">Stage 1: Online Quiz</option>
                    <option value="round_2">Stage 2: Case Deck Prep</option>
                    <option value="regional">Stage 3: Regional Hub</option>
                    <option value="mock">Mock / Practice Test</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Registration Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={fee}
                    onChange={e => setFee(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Intake Limit (Seats)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={intakeCapacity}
                    onChange={e => setIntakeCapacity(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={durationMinutes}
                    onChange={e => setDurationMinutes(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={totalQuestions}
                    onChange={e => setTotalQuestions(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    min="10"
                    value={totalMarks}
                    onChange={e => setTotalMarks(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Cutoff Score (%)
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 px-1.5 py-0.2 rounded font-mono">
                      = {Math.round(Number(totalMarks) * (Number(cutoffScore) / 100))} / {totalMarks} Marks
                    </span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cutoffScore}
                    onChange={e => setCutoffScore(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="text-[10px] text-slate-500 flex items-center justify-between pt-0.5">
                    <span>Percentage threshold</span>
                    <span>Required passing marks</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Negative Marks / Wrong
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={negativeMarkingPerWrong}
                    onChange={e => setNegativeMarkingPerWrong(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      Start Window
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(startDate)}
                      onChange={e => setStartDate(fromDateTimeLocal(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white scheme-light dark:scheme-dark cursor-pointer font-mono font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      End Window
                    </label>
                  </div>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={toDateTimeLocal(endDate)}
                      onChange={e => setEndDate(fromDateTimeLocal(e.target.value))}
                      className="w-full text-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white scheme-light dark:scheme-dark cursor-pointer font-mono font-medium focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Proctoring & Integrity
                  </label>
                  <select
                    value={proctoringMode}
                    onChange={e => setProctoringMode(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="strict_lockdown">Strict AI & Tab Lockdown</option>
                    <option value="tab_switch_warning">Tab Switch Warning Only</option>
                    <option value="unmonitored">Open Practice Mode</option>
                  </select>
                </div>
              </div>

              {/* Anti-cheat Toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={shuffleQuestions}
                    onChange={e => setShuffleQuestions(e.target.checked)}
                    className="mt-0.5 text-red-600 rounded focus:ring-red-500"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 dark:text-white block">Shuffle Question Order</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Randomize question order for each candidate (anti-cheat)</span>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Publish Status:
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as any)}
                    className="text-xs font-bold p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="live">Active / Live Now</option>
                    <option value="scheduled">Upcoming / Scheduled</option>
                    <option value="draft">Draft (Hidden)</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={isSavingProgram}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingProgram}
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-500/75 text-white text-xs font-bold shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-80 transition flex items-center gap-2 cursor-pointer"
                  >
                    {isSavingProgram && <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />}
                    <span>
                      {isSavingProgram
                        ? editingProgram
                          ? 'Saving Changes...'
                          : 'Creating Quiz Program...'
                        : editingProgram
                          ? 'Save Changes'
                          : 'Create Quiz Program'}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROGRAM QUESTIONS EDITOR MODAL */}
      <ProgramQuestionsEditorModal
        isOpen={showQuestionsEditorModal}
        onClose={() => setShowQuestionsEditorModal(false)}
        program={activeProgramForQuestions}
      />
    </div>
  );
};
