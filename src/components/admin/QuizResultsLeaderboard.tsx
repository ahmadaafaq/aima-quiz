import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizAttempt, UserProfile, QuizQuestion } from '../../types';
import { parseISTTimestamp, formatISTDateTime } from '../../lib/formatters';
import { fetchQuizAttemptById, fetchProgramQuestionsOrdered, toggleQuizProgramPublication } from '../../lib/supabase';
import {
  Trophy,
  Medal,
  Award,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Users,
  Eye,
  ShieldCheck,
  ShieldAlert,
  ArrowUpDown,
  FileSpreadsheet,
  TrendingUp,
  Percent,
  RefreshCw,
  X,
  XCircle,
  HelpCircle,
  Check,
  BookOpen,
  Building2,
  Mail,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Lock,
} from 'lucide-react';

interface QuizResultsLeaderboardProps {
  initialProgramId?: string;
}

export const QuizResultsLeaderboard: React.FC<QuizResultsLeaderboardProps> = ({
  initialProgramId,
}) => {
  const {
    quizPrograms,
    quizAttempts,
    refreshQuizAttempts,
    refreshQuizPrograms,
    updateQuizProgram,
    users,
    teams,
    institutions,
    questions,
    programQuestionMappings,
    config,
    updateConfig,
    addAuditLog,
  } = useCompetition();

  useEffect(() => {
    refreshQuizPrograms();
    refreshQuizAttempts();
  }, []);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialProgramId || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'qualified' | 'disqualified' | 'violations'>('all');
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<QuizAttempt | null>(null);
  const [modalQuestions, setModalQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingAttemptDetails, setIsLoadingAttemptDetails] = useState<boolean>(false);
  const [modalFilter, setModalFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cutoffInput, setCutoffInput] = useState<string>('');
  const [isSavingCutoff, setIsSavingCutoff] = useState<boolean>(false);
  const [cutoffSaveSuccess, setCutoffSaveSuccess] = useState<boolean>(false);

  // Authoritatively load full attempt row (with answers JSONB) & questions with answer keys
  const handleOpenReview = async (attempt: QuizAttempt) => {
    setSelectedAttemptForReview(attempt);
    setIsLoadingAttemptDetails(true);
    try {
      const targetProgId = attempt.programId || 'qp_case_comp_stage1_2026';
      const [fullAttempt, orderedQuestions] = await Promise.all([
        fetchQuizAttemptById(attempt.attemptId),
        fetchProgramQuestionsOrdered(targetProgId),
      ]);
      if (fullAttempt && fullAttempt.answers && Object.keys(fullAttempt.answers).length > 0) {
        setSelectedAttemptForReview(fullAttempt);
      }
      if (orderedQuestions && orderedQuestions.length > 0) {
        setModalQuestions(orderedQuestions);
      }
    } catch (err) {
      console.warn('Error loading full attempt review data:', err);
    } finally {
      setIsLoadingAttemptDetails(false);
    }
  };

  // Authoritative auto-fetch: whenever an attempt is opened, load live answers and questions
  useEffect(() => {
    if (!selectedAttemptForReview?.attemptId) return;
    const targetProgId = selectedAttemptForReview.programId || 'qp_case_comp_stage1_2026';
    setIsLoadingAttemptDetails(true);
    Promise.all([
      fetchQuizAttemptById(selectedAttemptForReview.attemptId),
      fetchProgramQuestionsOrdered(targetProgId),
    ])
      .then(([fullAttempt, orderedQuestions]) => {
        if (fullAttempt && fullAttempt.answers && Object.keys(fullAttempt.answers).length > 0) {
          setSelectedAttemptForReview(prev => (prev ? { ...prev, ...fullAttempt, answers: fullAttempt.answers } : fullAttempt));
        }
        if (orderedQuestions && orderedQuestions.length > 0) {
          setModalQuestions(orderedQuestions);
        }
      })
      .catch((err) => {
        console.warn('Auto-fetch attempt details warning:', err);
      })
      .finally(() => {
        setIsLoadingAttemptDetails(false);
      });
  }, [selectedAttemptForReview?.attemptId]);

  // Auto-refresh attempts from live database whenever selected program changes
  useEffect(() => {
    refreshQuizAttempts();
  }, [selectedProgramId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshQuizAttempts();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Helper to normalize program status strictly depending on schedule window (matching QuizProgramManager)
  const getNormalizedStatus = (progStatus: string, startDate?: string, endDate?: string): 'active' | 'upcoming' | 'completed' | 'draft' | 'paused' => {
    if (progStatus === 'draft') return 'draft';

    const now = Date.now();
    const s = parseISTTimestamp(startDate);
    const e = parseISTTimestamp(endDate);

    if (!isNaN(e) && now > e) return 'completed';
    if (!isNaN(s) && now < s) return 'upcoming';
    if (!isNaN(s) && !isNaN(e) && now >= s && now <= e) return 'active';
    if (!isNaN(s) && now >= s) return 'active';

    if (progStatus === 'live' || progStatus === 'active') return 'active';
    if (progStatus === 'completed') return 'completed';
    return 'upcoming';
  };

  const liveQuizPrograms = quizPrograms.filter(
    p => getNormalizedStatus(p.status, p.startDate || p.startTime, p.endDate || p.endTime) === 'active'
  );
  const upcomingQuizPrograms = quizPrograms.filter(
    p => getNormalizedStatus(p.status, p.startDate || p.startTime, p.endDate || p.endTime) === 'upcoming'
  );

  // Single Source of Truth: target quiz program directly from quiz_programs table
  const selectedProgram = selectedProgramId !== 'all'
    ? quizPrograms.find(p => p.id === selectedProgramId)
    : (quizPrograms[0] || null);

  const effectiveCutoff = selectedProgram
    ? Number(selectedProgram.cutoffScore ?? 60)
    : 60;

  // Synchronize cutoffInput strictly from the quiz program
  useEffect(() => {
    if (selectedProgram) {
      const val = selectedProgram.cutoffScore ?? 60;
      setCutoffInput(String(val));
    } else {
      setCutoffInput('60');
    }
  }, [selectedProgramId, selectedProgram?.cutoffScore]);

  // Handle saving cutoff to DB
  const handleSaveCutoff = async () => {
    const num = parseFloat(cutoffInput);
    if (isNaN(num) || num < 0 || num > 100) return;

    setIsSavingCutoff(true);
    try {
      if (selectedProgram) {
        const totalMarks = selectedProgram.totalMarks || 100;
        const passingMarks = Math.round(totalMarks * (num / 100));
        updateQuizProgram(selectedProgram.id, {
          cutoffScore: num,
          passingMarks: passingMarks,
        });
        addAuditLog(
          'Quiz Program Cutoff Configured',
          'Quiz',
          `Super Admin updated cutoff for "${selectedProgram.title}" to ${num}% (${passingMarks} pts)`
        );
      }
      setCutoffSaveSuccess(true);
      setTimeout(() => setCutoffSaveSuccess(false), 2000);
    } finally {
      setIsSavingCutoff(false);
    }
  };

  // Determine publication status: strictly tied to the selected quiz program's is_results_published boolean from quiz_programs table
  const isResultsPublished = selectedProgramId === 'all'
    ? false
    : Boolean(selectedProgram?.isResultsPublished ?? (selectedProgram as any)?.is_results_published ?? false);

  // Handle toggle results publication strictly for the selected quiz program
  const handleTogglePublishResults = async () => {
    if (selectedProgramId === 'all' || !selectedProgram) return;

    const nextState = !isResultsPublished;

    // 1. Context & Local Cache State
    updateQuizProgram(selectedProgram.id, {
      isResultsPublished: nextState,
      is_results_published: nextState,
    });

    // 2. Direct Supabase column update to public.quiz_programs.is_results_published
    await toggleQuizProgramPublication(selectedProgram.id, nextState);
    await refreshQuizPrograms();

    addAuditLog(
      nextState ? 'Quiz Results Published' : 'Quiz Results Unpublished',
      'Quiz',
      `Super Admin ${nextState ? 'published' : 'unpublished'} official leaderboard results for "${selectedProgram.title}" (Code: ${selectedProgram.code})`
    );
  };

  // 1. Filter attempts strictly based on the selected program with NO fallbacks
  const relevantAttempts = quizAttempts.filter(a => {
    if (!a.isCompleted) return false;
    if (selectedProgramId === 'all') {
      return true;
    }
    // Strict program matching: only match attempts specifically belonging to this program
    return a.programId === selectedProgramId;
  });

  // 2. Map relevant attempts to candidate and team data
  const enrichedLeaderboard = relevantAttempts.map(attempt => {
    const user = users.find(
      u => u.id === attempt.studentId || u.id === attempt.userId ||
        (attempt.participantEmail && u.email.toLowerCase() === attempt.participantEmail.toLowerCase())
    );
    const userTeam = teams.find(t => t.id === attempt.teamId || (user && t.members.some(m => m.studentId === user.id)));
    const institute = institutions.find(i => i.id === user?.instituteId);

    const score = attempt.score ?? 0;
    const analyticalScore = attempt.analyticalScore ?? (attempt as any).analytical_score ?? 0;
    const timeTaken = attempt.timeTakenSeconds ?? 1800;
    const tabSwitches = attempt.tabSwitchCount ?? 0;
    const isCompleted = true;
    const isQualified = score >= effectiveCutoff;

    return {
      userId: attempt.studentId || attempt.userId || attempt.attemptId,
      name: user?.name || attempt.candidateName || 'Candidate #' + (attempt.studentId || '').slice(0, 8),
      email: user?.email || attempt.participantEmail || 'N/A',
      studentIdCardNumber: user?.studentIdCardNumber,
      registrationNumber: attempt.registrationNumber || user?.studentIdCardNumber || 'AIMA-CL26-00000',
      instituteName: user?.instituteName || institute?.name || attempt.instituteName || 'Independent B-School',
      instituteCity: institute?.city || 'India',
      teamName: userTeam?.name || 'Individual Entry',
      teamId: userTeam?.id || attempt.teamId,
      score,
      analyticalScore,
      timeTaken,
      tabSwitches,
      isCompleted,
      isQualified,
      attemptData: attempt,
      userProfile: user,
    };
  });

  // Official Ranking Sorting:
  // 1. Total Score (desc)
  // 2. Reserve Tie-Breaker Score (desc - Q26 to Q30)
  // 3. Lowest Time Taken (asc)
  // 4. Lowest Tab Switches (asc)
  const sortedLeaderboard = [...enrichedLeaderboard].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    const aTie = a.analyticalScore ?? 0;
    const bTie = b.analyticalScore ?? 0;
    if (bTie !== aTie) return bTie - aTie;
    if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
    return a.tabSwitches - b.tabSwitches;
  });

  // Filtered by Search & Status
  const filteredList = sortedLeaderboard.filter((row) => {
    const matchesSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.teamName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'qualified' && row.isQualified) ||
      (filterStatus === 'disqualified' && !row.isQualified) ||
      (filterStatus === 'violations' && row.tabSwitches > 0);

    return matchesSearch && matchesStatus;
  });

  // Telemetry Aggregates
  const totalSubmissions = sortedLeaderboard.length;
  const topScore = sortedLeaderboard.length > 0 ? sortedLeaderboard[0].score : 0;
  const avgScore = totalSubmissions > 0 ? Math.round(sortedLeaderboard.reduce((a, b) => a + b.score, 0) / totalSubmissions) : 0;
  const qualifiedCount = sortedLeaderboard.filter(r => r.isQualified).length;
  const passRate = totalSubmissions > 0 ? Math.round((qualifiedCount / totalSubmissions) * 100) : 0;
  const enrolledCount = selectedProgram
    ? (selectedProgram.enrolledCount || 0)
    : (quizPrograms.reduce((acc, p) => acc + (p.enrolledCount || 0), 0) || users.length || 76);

  // Modal computations: active row, program questions, and answer stats
  const activeAttemptRow = useMemo(() => {
    if (!selectedAttemptForReview) return null;
    return (
      enrichedLeaderboard.find(r => r.attemptData.attemptId === selectedAttemptForReview.attemptId) || {
        userId: selectedAttemptForReview.studentId,
        name: selectedAttemptForReview.candidateName || 'Candidate',
        email: selectedAttemptForReview.participantEmail || 'N/A',
        studentIdCardNumber: selectedAttemptForReview.registrationNumber,
        registrationNumber: selectedAttemptForReview.registrationNumber || 'AIMA-CL26-00000',
        instituteName: selectedAttemptForReview.instituteName || 'National Management Institute',
        instituteCity: 'India',
        teamName: 'Individual Entry',
        teamId: selectedAttemptForReview.teamId,
        score: selectedAttemptForReview.score,
        analyticalScore: selectedAttemptForReview.analyticalScore,
        timeTaken: selectedAttemptForReview.timeTakenSeconds,
        tabSwitches: selectedAttemptForReview.tabSwitchCount,
        isCompleted: selectedAttemptForReview.isCompleted,
        isQualified: selectedAttemptForReview.score >= effectiveCutoff,
        attemptData: selectedAttemptForReview,
        userProfile: undefined,
      }
    );
  }, [selectedAttemptForReview, enrichedLeaderboard, effectiveCutoff]);

  // Target Quiz Program for the active attempt (SINGLE SOURCE OF TRUTH)
  const modalProgram = useMemo(() => {
    if (!selectedAttemptForReview) return null;
    const targetId = selectedAttemptForReview.programId || 'qp_case_comp_stage1_2026';
    return quizPrograms.find(p => p.id === targetId) || selectedProgram || quizPrograms[0] || null;
  }, [selectedAttemptForReview, quizPrograms, selectedProgram]);

  const isNegativeMarking = Boolean(modalProgram?.negativeMarking);
  const negativeMarks = isNegativeMarking ? Number(modalProgram?.negativeMarksPerQuestion ?? 1) : 0;
  const programCutoff = Number(modalProgram?.cutoffScore ?? 60);
  const programTotalMarks = Number(modalProgram?.totalMarks ?? 100);
  const marksPerQuestion = Number(modalProgram?.marksPerQuestion ?? 4);

  const attemptQuestions = useMemo(() => {
    if (modalQuestions.length > 0) return modalQuestions;
    if (!selectedAttemptForReview) return [];
    const progId = selectedAttemptForReview.programId;
    const mappedIds = progId && programQuestionMappings && programQuestionMappings[progId]
      ? programQuestionMappings[progId]
      : [];

    if (mappedIds.length > 0) {
      const fromMapped = mappedIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as QuizQuestion[];
      if (fromMapped.length > 0) return fromMapped;
    }

    const answeredIds = Object.keys(selectedAttemptForReview.answers || {});
    if (answeredIds.length > 0) {
      const matched = answeredIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as QuizQuestion[];
      if (matched.length > 0) return matched;
    }

    return questions;
  }, [modalQuestions, selectedAttemptForReview, programQuestionMappings, questions]);

  const modalStats = useMemo(() => {
    if (!selectedAttemptForReview || attemptQuestions.length === 0) {
      return {
        total: 0,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        earnedMarks: 0,
        penaltyMarks: 0,
        coreTotal: 25,
        coreCorrect: 0,
        coreScore: 0,
        tieTotal: 5,
        tieCorrect: 0,
        tieBreakerScore: 0,
      };
    }
    const answers = selectedAttemptForReview.answers || {};
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;

    let coreCorrect = 0;
    let coreTotal = 0;
    let tieCorrect = 0;
    let tieTotal = 0;

    attemptQuestions.forEach((q, idx) => {
      const order = Number(q.orderIndex ?? q.qNo ?? (idx + 1));
      const isReserve = order > 25;
      if (isReserve) {
        tieTotal++;
      } else {
        coreTotal++;
      }

      const chosen = answers[q.id];
      if (chosen === undefined || chosen === null) {
        unattempted++;
      } else if (Number(chosen) === Number(q.correctAnswerIndex)) {
        correct++;
        if (isReserve) {
          tieCorrect++;
        } else {
          coreCorrect++;
        }
      } else {
        incorrect++;
      }
    });

    const coreScore = coreCorrect * marksPerQuestion;
    const tieBreakerScore = tieCorrect * marksPerQuestion;
    const earnedMarks = correct * marksPerQuestion;
    const penaltyMarks = isNegativeMarking ? incorrect * negativeMarks : 0;

    return {
      total: attemptQuestions.length,
      attempted: correct + incorrect,
      correct,
      incorrect,
      unattempted,
      earnedMarks,
      penaltyMarks,
      coreTotal: coreTotal || 25,
      coreCorrect,
      coreScore,
      tieTotal: tieTotal || 5,
      tieCorrect,
      tieBreakerScore,
    };
  }, [selectedAttemptForReview, attemptQuestions, isNegativeMarking, negativeMarks, marksPerQuestion]);

  const filteredModalQuestions = useMemo(() => {
    if (!selectedAttemptForReview) return [];
    const answers = selectedAttemptForReview.answers || {};

    return attemptQuestions.filter(q => {
      const chosen = answers[q.id];
      const isChosen = chosen !== undefined && chosen !== null;
      const isCorrect = isChosen && Number(chosen) === Number(q.correctAnswerIndex);

      if (modalFilter === 'correct') return isCorrect;
      if (modalFilter === 'incorrect') return isChosen && !isCorrect;
      if (modalFilter === 'unattempted') return !isChosen;
      return true;
    });
  }, [attemptQuestions, selectedAttemptForReview, modalFilter]);

  const handleExportMeritList = () => {
    const headers = ['Rank', 'Candidate ID', 'Name', 'Email', 'Institute', 'Team', 'Main Score (100)', 'Tie-Breaker Score (20)', 'Time Taken (s)', 'Tab Switches', 'Qualification Status'];
    const rows = filteredList.map((r, idx) => [
      idx + 1,
      r.userId,
      `"${r.name}"`,
      r.email,
      `"${r.instituteName}"`,
      `"${r.teamName}"`,
      r.score,
      r.analyticalScore,
      r.timeTaken,
      r.tabSwitches,
      r.isQualified ? 'QUALIFIED FOR STAGE 2' : 'BELOW CUTOFF',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_Quiz_Leaderboard_MeritList_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('Merit List Exported', 'Quiz', `Super Admin exported official leaderboard of ${filteredList.length} rankers`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Trophy className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Quiz Leaderboard & Candidate Rankings
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated evaluation, analytical tie-breaker scoring, cutoff validation, and proctoring telemetry.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            title="Refresh live attempts from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-red-600' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Live DB'}</span>
          </button>
          <button
            onClick={handleExportMeritList}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Official Merit List CSV</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics - 3 Cards Taking Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Top Candidate Score</span>
            <Medal className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0 ? `${topScore}/100` : '--/100'}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1 truncate max-w-[280px]">
            {totalSubmissions > 0 ? `Rank 1: ${sortedLeaderboard[0]?.name || 'N/A'}` : 'No evaluated attempts yet'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Average Score</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0 ? `${avgScore}/100` : '--/100'}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Active Cutoff: {effectiveCutoff}% pass ({Math.round((selectedProgram?.totalMarks || 100) * (effectiveCutoff / 100))} pts)
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Qualification Pass Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0 ? `${passRate}%` : '0%'}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {qualifiedCount} qualified of {totalSubmissions} evaluated ({enrolledCount} enrolled in DB)
          </div>
        </div>
      </div>

      {/* Control Bar: Filter, Program Selector, Configurable Cutoff & Results Publishing */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Row 1: Program Selector, Search & Status Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full lg:flex-1 min-w-0">
            {/* Program Selector with schedule-normalized badges */}
            <select
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shrink-0 cursor-pointer shadow-xs focus:ring-2 focus:ring-red-500 max-w-[320px] truncate"
            >
              <option value="all">
                📚 All Quiz Programs ({liveQuizPrograms.length} Live • {upcomingQuizPrograms.length} Upcoming)
              </option>
              {quizPrograms.map(p => {
                const norm = getNormalizedStatus(p.status, p.startDate || p.startTime, p.endDate || p.endTime);
                const icon = norm === 'active' ? '🟢 [Live]' : norm === 'upcoming' ? '🟡 [Upcoming]' : '⚪ [Completed]';
                return (
                  <option key={p.id} value={p.id}>
                    {icon} {p.title} ({p.code})
                  </option>
                );
              })}
            </select>

            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search ranker, college, team..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden w-full lg:w-auto shrink-0 py-0.5">
            {(['all', 'qualified', 'disqualified', 'violations'] as const).map(st => {
              const count =
                st === 'all'
                  ? sortedLeaderboard.length
                  : st === 'qualified'
                    ? sortedLeaderboard.filter(r => r.isQualified).length
                    : st === 'disqualified'
                      ? sortedLeaderboard.filter(r => !r.isQualified).length
                      : sortedLeaderboard.filter(r => r.tabSwitches > 0).length;

              return (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap shrink-0 ${filterStatus === st
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

        {/* Row 2: Configurable Cutoff Field & Publish Results Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
          {/* Configurable Cutoff Field */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-red-500" />
              <span>Configurable Cutoff:</span>
            </span>
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={cutoffInput}
                  onChange={e => setCutoffInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleSaveCutoff();
                  }}
                  className="w-18 px-2.5 py-1.5 text-xs font-bold font-mono rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-center focus:ring-2 focus:ring-red-500 focus:outline-hidden"
                  placeholder="60"
                />
                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold pointer-events-none">%</span>
              </div>
              <span className="text-slate-400 font-medium">
                ({Math.round((selectedProgram?.totalMarks || 100) * (Number(cutoffInput || 60) / 100))} pts)
              </span>
              <button
                onClick={handleSaveCutoff}
                disabled={isSavingCutoff}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-xs"
                title={selectedProgramId === 'all' ? 'Save cutoff to competition_config.r1_cutoff_score' : `Save cutoff to quiz_programs for ${selectedProgram?.code}`}
              >
                {cutoffSaveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>{isSavingCutoff ? 'Saving...' : 'Apply Cutoff'}</span>
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 hidden md:inline-block">
              • Target:{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">
                {selectedProgramId === 'all' ? 'Master competition_config' : `quiz_programs (${selectedProgram?.code})`}
              </span>
            </span>
          </div>

          {/* Publish Results Button (Dependent on Selected Quiz Program) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePublishResults}
              disabled={selectedProgramId === 'all'}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs ${selectedProgramId === 'all'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-75'
                : isResultsPublished
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-900 cursor-pointer'
                }`}
              title={
                selectedProgramId === 'all'
                  ? 'Select a specific quiz program from the dropdown above to publish or unpublish official results'
                  : isResultsPublished
                    ? `Click to unpublish official results for "${selectedProgram?.title}"`
                    : `Click to publish official results for "${selectedProgram?.title}"`
              }
            >
              {selectedProgramId === 'all' ? (
                <>
                  <Lock className="w-4 h-4 text-slate-400" />
                  <span>Select a Quiz to Publish Results</span>
                </>
              ) : isResultsPublished ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>
                    ✓ Results Published ({selectedProgram?.code || 'Selected'})
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-slate-900" />
                  <span>
                    Publish Results ({selectedProgram?.code || 'Selected'})
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Candidate & B-School</th>
                <th className="py-3.5 px-4">Affiliated Team</th>
                <th className="py-3.5 px-4 text-center">Total Score (100)</th>
                <th className="py-3.5 px-4 text-center">Time Taken</th>
                <th className="py-3.5 px-4 text-center">Integrity Status</th>
                <th className="py-3.5 px-4 text-center">Stage 2 Gate</th>
                <th className="py-3.5 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    {selectedProgram
                      ? `No evaluated attempts found for "${selectedProgram.title}".`
                      : 'No evaluated quiz attempts found matching criteria.'}
                  </td>
                </tr>
              ) : (
                filteredList.map((row, idx) => {
                  const rank = idx + 1;
                  const isTop3 = rank <= 3;
                  const minutes = Math.floor(row.timeTaken / 60);
                  const seconds = row.timeTaken % 60;

                  return (
                    <tr
                      key={row.userId}
                      onClick={() => handleOpenReview(row.attemptData)}
                      className={`cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition group ${isTop3 ? 'bg-amber-500/5 dark:bg-amber-500/5' : ''
                        }`}
                      title="Click anywhere on row to view candidate's attempted quiz details"
                    >
                      {/* Rank */}
                      <td className="py-3.5 px-4 text-center">
                        {rank === 1 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black text-xs shadow-xs">
                            🥇 1
                          </span>
                        ) : rank === 2 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow-xs">
                            🥈 2
                          </span>
                        ) : rank === 3 ? (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs shadow-xs">
                            🥉 3
                          </span>
                        ) : (
                          <span className="font-mono font-bold text-slate-500 text-sm">
                            #{rank}
                          </span>
                        )}
                      </td>

                      {/* Candidate */}
                      <td className="py-3.5 px-4">
                        <div
                          className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-red-600 transition"
                        >
                          <span className="group-hover:underline">{row.name}</span>
                          {row.userProfile?.isTeamLeader && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-600 border border-amber-500/20">
                              Leader
                            </span>
                          )}
                          <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {row.instituteName} ({row.instituteCity})
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {row.email}
                        </div>
                      </td>

                      {/* Team */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {row.teamName}
                        </span>
                      </td>

                      {/* Total Score */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="font-black text-base text-slate-900 dark:text-white">
                          {row.score}
                        </div>
                        <div className="text-[10px] text-slate-400 font-semibold">
                          out of 100
                        </div>
                        {((row.analyticalScore ?? (row.attemptData as any)?.analytical_score ?? 0) > 0) && (
                          <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 text-[10px] font-bold">
                            <Sparkles className="w-2.5 h-2.5 shrink-0" />
                            ⚡ {row.analyticalScore ?? (row.attemptData as any)?.analytical_score}/20
                          </div>
                        )}
                      </td>

                      {/* Time Taken */}
                      <td className="py-3.5 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                        {minutes}m {seconds < 10 ? '0' : ''}{seconds}s
                      </td>

                      {/* Integrity */}
                      <td className="py-3.5 px-4 text-center">
                        {row.tabSwitches === 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                            <ShieldCheck className="w-3 h-3" />
                            Clean (0)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-600 border border-red-500/20">
                            <ShieldAlert className="w-3 h-3" />
                            {row.tabSwitches} Switches
                          </span>
                        )}
                      </td>

                      {/* Qualification */}
                      <td className="py-3.5 px-4 text-center">
                        {row.isQualified ? (
                          <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                            Qualified R2
                          </span>
                        ) : (
                          <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                            Below Cutoff
                          </span>
                        )}
                      </td>

                      {/* Action: View Attempt */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReview(row.attemptData);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-red-600 group-hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-2xs cursor-pointer border border-slate-200 dark:border-slate-700 group-hover:border-red-600"
                          title="Inspect attempted questions & answers"
                        >
                          <Eye className="w-3.5 h-3.5 text-red-600 group-hover:text-white transition-colors" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Attempt Review Modal */}
      {selectedAttemptForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] border border-slate-200/90 dark:border-slate-800 flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header & Cockpit Section (Light / Dark Adaptive Theme) */}
            <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white shrink-0 border-b border-slate-200 dark:border-slate-800 shadow-xs">
              {/* Row 1: Candidate Identity */}
              <div className="px-5 py-2.5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Candidate Initials Avatar */}
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 uppercase ring-1 ring-white/20">
                    {(activeAttemptRow?.name || 'C').slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        {activeAttemptRow?.name || 'Candidate Attempt Review'}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        <GraduationCap className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        {activeAttemptRow?.registrationNumber || selectedAttemptForReview.registrationNumber || 'AIMA-CL26-00000'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wider ${activeAttemptRow?.isQualified
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35'
                          }`}
                      >
                        {activeAttemptRow?.isQualified ? (
                          'Qualified R2'
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Below Cutoff ({programCutoff}%)
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {activeAttemptRow?.instituteName}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Team: <strong className="text-slate-800 dark:text-slate-200 ml-0.5">{activeAttemptRow?.teamName}</strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {activeAttemptRow?.email}
                      </span>
                      {selectedAttemptForReview.submittedAt && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Clock className="w-3 h-3 text-red-500 dark:text-red-400" />
                            Submitted: {formatISTDateTime(selectedAttemptForReview.submittedAt)} (IST)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAttemptForReview(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer shrink-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  title="Close review modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Row 2: Official Scoring & Tie-Breaker Breakdown */}
              <div className="px-5 py-2 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Main Questions (Q1-Q25) */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-800 dark:text-slate-100">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Main Questions (Q1–Q25)</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {selectedAttemptForReview.score ?? modalStats.coreScore}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">/100</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-1.5 py-0.2 rounded ml-0.5">
                      {modalStats.coreCorrect}/25 Scored
                    </span>
                  </div>

                  {/* Reserve Tie-Breaker (Q26-Q30) */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-500/35 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">⚡ Tie-Breaker (Q26–Q30)</span>
                    <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-sm">
                      {selectedAttemptForReview.analyticalScore ?? (selectedAttemptForReview as any).analytical_score ?? modalStats.tieBreakerScore}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80">/20</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-500/20 border border-amber-500/35 dark:text-amber-300 dark:bg-amber-500/20 px-1.5 py-0.2 rounded ml-0.5">
                      {modalStats.tieCorrect}/5 Scored
                    </span>
                  </div>
                </div>

                {/* Duration & Integrity */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-700 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {Math.floor((selectedAttemptForReview.timeTakenSeconds || 0) / 60)}m {(selectedAttemptForReview.timeTakenSeconds || 0) % 60}s
                    </span>
                    <span className="border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-0.5">
                      {selectedAttemptForReview.tabSwitchCount === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Clean
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                          <ShieldAlert className="w-3 h-3 text-rose-500 dark:text-rose-400" /> {selectedAttemptForReview.tabSwitchCount} Violations
                        </span>
                      )}
                    </span>
                  </div>

                  {isLoadingAttemptDetails && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 animate-pulse pl-1">
                      <RefreshCw className="w-3 h-3 animate-spin text-amber-500 dark:text-amber-400" /> Syncing...
                    </span>
                  )}
                </div>
              </div>

              {/* Row 3: Question Category Filters */}
              <div className="px-5 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-0.5">
                  Filter:
                </span>

                {/* All */}
                <button
                  type="button"
                  onClick={() => setModalFilter('all')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${modalFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:text-white'
                    }`}
                >
                  <span>All</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${modalFilter === 'all'
                    ? 'bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}>
                    {modalStats.total}
                  </span>
                </button>

                {/* Correct */}
                <button
                  type="button"
                  onClick={() => setModalFilter('correct')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${modalFilter === 'correct'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400/30 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-500/70 dark:ring-emerald-500/40 shadow-2xs'
                    : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-800 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-800/50 dark:hover:text-emerald-200'
                    }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${modalFilter === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500/80 dark:text-emerald-400/80'}`} />
                  <span>Correct</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${modalFilter === 'correct'
                    ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/30 dark:text-emerald-200 dark:border-emerald-500/40'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {modalStats.correct}
                  </span>
                  <span className={`text-[10px] font-medium ${modalFilter === 'correct' ? 'text-emerald-800 dark:text-emerald-200/80' : 'text-slate-400'}`}>
                    ({modalStats.coreCorrect} Main + {modalStats.tieCorrect} Tie)
                  </span>
                </button>

                {/* Incorrect */}
                <button
                  type="button"
                  onClick={() => setModalFilter('incorrect')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${modalFilter === 'incorrect'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-300/40 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-500/70 dark:ring-rose-500/40 shadow-2xs'
                    : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-rose-50/50 hover:border-rose-200 hover:text-rose-800 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-rose-950/30 dark:hover:border-rose-800/50 dark:hover:text-rose-200'
                    }`}
                >
                  <XCircle className={`w-3.5 h-3.5 shrink-0 ${modalFilter === 'incorrect' ? 'text-rose-500 dark:text-rose-400' : 'text-rose-400/80'}`} />
                  <span>Incorrect</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${modalFilter === 'incorrect'
                    ? 'bg-rose-200/80 text-rose-900 border border-rose-300 dark:bg-rose-500/30 dark:text-rose-200 dark:border-rose-500/40'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {modalStats.incorrect}
                  </span>
                  <span className={`text-[10px] font-medium ${modalFilter === 'incorrect' ? 'text-rose-800 dark:text-rose-200/80' : 'text-slate-400'}`}>
                    (0 Penalty)
                  </span>
                </button>

                {/* Skipped */}
                <button
                  type="button"
                  onClick={() => setModalFilter('unattempted')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${modalFilter === 'unattempted'
                    ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-600 dark:text-white dark:border-slate-500 shadow-2xs font-black'
                    : 'bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-800/90 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:text-slate-200'
                    }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Skipped</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${modalFilter === 'unattempted'
                    ? 'bg-slate-300 text-slate-800 dark:bg-white/20 dark:text-white'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {modalStats.unattempted}
                  </span>
                </button>
              </div>
            </div>

            {/* Questions List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
              {filteredModalQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No questions found matching the "{modalFilter}" filter.
                </div>
              ) : (
                filteredModalQuestions.map((q, qIdx) => {
                  const answers = selectedAttemptForReview.answers || {};
                  const studentSelectedOptIdx = answers[q.id];
                  const isAttempted = studentSelectedOptIdx !== undefined && studentSelectedOptIdx !== null;
                  const isCorrect = isAttempted && Number(studentSelectedOptIdx) === Number(q.correctAnswerIndex);
                  const isWrong = isAttempted && Number(studentSelectedOptIdx) !== Number(q.correctAnswerIndex);
                  const displayQNo = q.orderIndex || q.qNo || (qIdx + 1);
                  const isReserveQuestion = displayQNo >= 26; // Q26 to Q30 are reserve tie-breaker questions

                  return (
                    <div
                      key={q.id}
                      className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2.5 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      {/* Question Header Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-black text-xs flex items-center justify-center shadow-xs">
                            {displayQNo}
                          </span>
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {q.category}
                          </span>

                          {/* Reserve / Tie-breaker Badge (Q26-Q30) vs Core Scored Badge (Q1-Q25) */}
                          {isReserveQuestion ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Reserve Tie-Breaker (Q26–Q30)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              Core Scored (Q1–Q25)
                            </span>
                          )}

                          <span className="text-[11px] font-medium text-slate-400">
                            • +{q.marks || marksPerQuestion} Marks {isNegativeMarking ? `(-${negativeMarks} Neg)` : '(No Negative Marking)'}
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isReserveQuestion ? `Correct (+${q.marks || marksPerQuestion} Tie-Break)` : `Correct (+${q.marks || marksPerQuestion})`}
                            </span>
                          )}
                          {isWrong && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 border border-rose-500/25">
                              <XCircle className="w-3.5 h-3.5" />
                              Incorrect {isNegativeMarking ? `(-${negativeMarks})` : '(0 pts penalty)'}
                            </span>
                          )}
                          {!isAttempted && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-500/10 text-slate-500 border border-slate-500/25">
                              <HelpCircle className="w-3.5 h-3.5" />
                              Not Attempted (0 pts)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Caselet Snippet if any */}
                      {q.caseletSnippet && (
                        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-slate-400 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                          {q.caseletSnippet}
                        </div>
                      )}

                      {/* Question Text */}
                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Options List */}
                      <div className="space-y-1.5 pt-0.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionCorrect = Number(optIdx) === Number(q.correctAnswerIndex);
                          const isOptionStudentChosen = isAttempted && Number(optIdx) === Number(studentSelectedOptIdx);

                          let optionStyles = 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
                          let letterCircleStyles = 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
                          let badgeEl: React.ReactNode = null;

                          if (isOptionStudentChosen && isOptionCorrect) {
                            // Student selected correct option
                            optionStyles = 'border-2 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/50';
                            letterCircleStyles = 'bg-emerald-600 text-white font-black';
                            badgeEl = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs shrink-0">
                                <Check className="w-3 h-3" /> Candidate Selected (Correct • +4)
                              </span>
                            );
                          } else if (isOptionStudentChosen && !isOptionCorrect) {
                            // Student selected wrong option -> HIGHLIGHT IN RED / ROSE WITH CLEAR 0 PENALTY NOTE
                            optionStyles = 'border-2 border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs ring-1 ring-rose-500/50';
                            letterCircleStyles = 'bg-rose-600 text-white font-black';
                            badgeEl = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs shrink-0">
                                <X className="w-3 h-3" /> Candidate Selected (Wrong Option{isNegativeMarking ? ` • -${negativeMarks}` : ' • 0 Penalty'})
                              </span>
                            );
                          } else if (isOptionCorrect) {
                            // The right option that student did not select
                            optionStyles = 'border-2 border-emerald-500/70 bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100';
                            letterCircleStyles = 'border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold';
                            badgeEl = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500 text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Check className="w-3 h-3" /> Correct Answer
                              </span>
                            );
                          }

                          const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D

                          return (
                            <div
                              key={optIdx}
                              className={`py-2 px-3 rounded-xl border text-xs flex items-center justify-between gap-2.5 transition ${optionStyles}`}
                            >
                              <div className="flex items-start gap-2.5 min-w-0">
                                <span className={`w-5.5 h-5.5 rounded-lg flex items-center justify-center text-[11px] shrink-0 font-bold ${letterCircleStyles}`}>
                                  {optionLetter}
                                </span>
                                <span className="font-medium break-words leading-snug pt-0.5">
                                  {opt}
                                </span>
                              </div>
                              {badgeEl}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation if present */}
                      {q.explanation && (
                        <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2 leading-relaxed">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="font-bold">Correct Answer Explanation:</strong> {q.explanation}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <span>Attempt Log ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {selectedAttemptForReview.attemptId}
                </span>
              </div>
              <button
                onClick={() => setSelectedAttemptForReview(null)}
                className="px-6 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 text-xs font-bold transition shadow-xs cursor-pointer"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
