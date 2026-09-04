import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizProgram } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
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
} from 'lucide-react';

interface QuizProgramManagerProps {
  onNavigateToResults?: (programId?: string) => void;
  onNavigateToQuestions?: () => void;
  autoOpenCreate?: boolean;
}

export const QuizProgramManager: React.FC<QuizProgramManagerProps> = ({
  onNavigateToResults,
  onNavigateToQuestions,
  autoOpenCreate = false,
}) => {
  const {
    quizPrograms,
    addQuizProgram,
    updateQuizProgram,
    deleteQuizProgram,
    questions,
    quizAttempts,
    setAdminActiveTab,
  } = useCompetition();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'upcoming' | 'completed' | 'draft'>('all');
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

  // Helper to normalize program status for filtering
  const getNormalizedStatus = (progStatus: string): 'active' | 'upcoming' | 'completed' | 'draft' => {
    if (progStatus === 'live' || progStatus === 'active') return 'active';
    if (progStatus === 'scheduled' || progStatus === 'upcoming') return 'upcoming';
    if (progStatus === 'completed') return 'completed';
    return 'draft';
  };

  const openCreateModal = () => {
    setEditingProgram(null);
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
    setShowCreateModal(true);
  };

  React.useEffect(() => {
    if (autoOpenCreate) {
      openCreateModal();
    }
  }, [autoOpenCreate]);

  const openEditModal = (prog: QuizProgram) => {
    setEditingProgram(prog);
    setTitle(prog.title || '');
    setCode(prog.code || '');
    setDescription(prog.description || '');
    setStage((prog.stage as any) || 'round_1');
    setFee(prog.fee ?? 0);
    setIntakeCapacity(prog.intakeCapacity || prog.maxIntake || 5000);
    setDurationMinutes(prog.durationMinutes || 45);
    setTotalQuestions(prog.totalQuestions || 30);
    setTotalMarks(prog.totalMarks || 100);
    setCutoffScore(prog.cutoffScore ?? prog.passingPercentage ?? 65);
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
    setShowCreateModal(true);
  };

  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) {
      alert('Please enter a valid title and code.');
      return;
    }

    const payload: Partial<QuizProgram> = {
      title,
      code,
      description,
      stage: stage as any,
      fee: Number(fee),
      intakeCapacity: Number(intakeCapacity),
      maxIntake: Number(intakeCapacity),
      durationMinutes: Number(durationMinutes),
      totalQuestions: Number(totalQuestions),
      totalMarks: Number(totalMarks),
      cutoffScore: Number(cutoffScore),
      passingPercentage: Number(cutoffScore),
      negativeMarking: Number(negativeMarkingPerWrong) > 0,
      negativeMarkingPerWrong: Number(negativeMarkingPerWrong),
      negativeMarksPerQuestion: Number(negativeMarkingPerWrong),
      startDate,
      endDate,
      startTime: startDate,
      endTime: endDate,
      status: status as any,
      proctoringMode,
      proctoringStrictness: proctoringMode === 'strict_lockdown' ? 'High (Webcam + Fullscreen + Tab Lock)' : 'Standard',
      instructions: instructions.split('\n').filter(Boolean),
    };

    if (editingProgram) {
      updateQuizProgram(editingProgram.id, payload);
    } else {
      addQuizProgram({
        ...payload,
        tagline: description || title,
        category: 'Corporate Strategy & Management',
        passingMarks: Math.round(Number(totalMarks) * (Number(cutoffScore) / 100)),
        marksPerQuestion: Math.round(Number(totalMarks) / Math.max(1, Number(totalQuestions))),
        eligibility: 'All registered management students',
        tags: ['Online Assessment', 'Proctored'],
      } as any);
    }

    setShowCreateModal(false);
  };

  const safeQuizPrograms = quizPrograms || [];

  const filteredPrograms = safeQuizPrograms.filter(prog => {
    const norm = getNormalizedStatus(prog.status);
    const matchesStatus = filterStatus === 'all' || norm === filterStatus;
    const matchesSearch =
      (prog.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const activePrograms = safeQuizPrograms.filter(p => getNormalizedStatus(p.status) === 'active');
  const totalEnrolled = safeQuizPrograms.reduce((acc, p) => acc + (p.enrolledCount || 0), 0);
  const totalCompleted = safeQuizPrograms.reduce((acc, p) => acc + (p.completedCount || 0), 0);
  const totalLiveTaking = safeQuizPrograms.reduce((acc, p) => acc + (p.inProgressCount || 0), 0);

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
                <DocRequirementInfo
                  specKey="admin_quiz_program_manager"
                  variant="badge"
                  badgeLabel="BRD §7.1 Specs"
                  colorTheme="red"
                />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, configure, and monitor pan-India online screening tests, intake limits, fee gates, and proctoring parameters.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigateToQuestions?.() || setAdminActiveTab('quiz_bank')}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <HelpCircle className="w-4 h-4 text-slate-500" />
            <span>Question Bank ({questions?.length || 0})</span>
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
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {activePrograms.length} Live
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {safeQuizPrograms.length} total registered programs
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Enrolled Intake</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalEnrolled.toLocaleString()}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Across registered institutions
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Completed Submissions</span>
            <CheckCircle2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalCompleted.toLocaleString()}
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            {quizAttempts?.length || 0} evaluated attempts
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Live Taking Now</span>
            <Zap className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalLiveTaking.toLocaleString()}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1">
            Real-time active test sessions
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
          {(['all', 'active', 'upcoming', 'completed', 'draft'] as const).map(st => {
            const count = st === 'all'
              ? safeQuizPrograms.length
              : safeQuizPrograms.filter(p => getNormalizedStatus(p.status) === st).length;

            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  filterStatus === st
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
            const normStatus = getNormalizedStatus(prog.status);
            const isLive = normStatus === 'active';
            const capacity = prog.intakeCapacity || prog.maxIntake || 5000;
            const enrolled = prog.enrolledCount || 0;
            const fillPercentage = Math.min(100, Math.round((enrolled / Math.max(1, capacity)) * 100));
            const cutoff = prog.cutoffScore ?? prog.passingPercentage ?? 65;
            const negMark = prog.negativeMarkingPerWrong ?? prog.negativeMarksPerQuestion ?? 0.5;
            const dateDisplay = (prog.startDate || prog.startTime || '2026-09-10 10:00') + ' — ' + (prog.endDate || prog.endTime || '2026-09-15 22:00');

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
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          normStatus === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : normStatus === 'upcoming'
                            ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                            : normStatus === 'completed'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
                        }`}
                      >
                        {normStatus.toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">
                        {(prog.stage || 'round_1').replace('_', ' ')}
                      </span>
                      <DocRequirementInfo
                        specKey="student_quiz_engine"
                        variant="icon"
                        size="xs"
                        colorTheme="red"
                      />
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {prog.title}
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
                        if (confirm(`Are you sure you want to delete quiz program "${prog.title}"?`)) {
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
                      style={{ width: `${fillPercentage}%` }}
                    />
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] truncate max-w-[220px]">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{dateDisplay}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const newStatus = isLive ? 'draft' : 'live';
                        updateQuizProgram(prog.id, { status: newStatus as any });
                      }}
                      className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                        isLive
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20'
                      }`}
                    >
                      {isLive ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause Test</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Activate Live</span>
                        </>
                      )}
                    </button>

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
                    step="50"
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
                    min="10"
                    step="100"
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
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Cutoff Score (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={cutoffScore}
                    onChange={e => setCutoffScore(Number(e.target.value))}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
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
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Start Window
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    End Window
                  </label>
                  <input
                    type="text"
                    placeholder="YYYY-MM-DD HH:mm"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Candidate Instructions
                </label>
                <textarea
                  rows={2}
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
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
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    {editingProgram ? 'Save Changes' : 'Create Quiz Program'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
