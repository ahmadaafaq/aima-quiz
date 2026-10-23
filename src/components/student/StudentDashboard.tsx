import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizTaker } from './QuizTaker';
import { CaseDeckSubmitter } from './CaseDeckSubmitter';
import { fetchRegistrationByNumber, fetchProgramQuestionsOrdered } from '../../lib/supabase';
import { CSRBootcampRegistration, QuizQuestion } from '../../types';
import { formatQuizScheduleDate, parseISTTimestamp, formatISTDateTime } from '../../lib/formatters';
import {
  AlertCircle,
  Award,
  BookOpen,
  Building,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  Lock,
  MapPin,
  Pause,
  Plus,
  QrCode,
  Scale,
  Send,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  Trophy,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  XCircle,
  Zap
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    currentUser,
    currentTeam,
    createTeam,
    joinTeam,
    makePayment,
    quizAttempts,
    caseSubmissions,
    hubs,
    certificates,
    quizPrograms,
    refreshQuizPrograms,
    config,
    setActiveCertificateModal,
    setActiveSupportModal,
    setActiveVerifierModal,
    questions,
    isQuizActive,
    setIsQuizActive,
  } = useCompetition();

  const [activeSubView, setActiveSubView] = useState<'overview' | 'quiz' | 'case_deck'>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const sub = params.get('subview');
        if (sub === 'quiz' || sub === 'case_deck') return sub;

        const saved = sessionStorage.getItem('AIMA_STUDENT_ACTIVE_SUBVIEW');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.subView === 'quiz') return 'quiz';
          if (parsed?.subView === 'case_deck') return 'case_deck';
        }
      }
    } catch { }
    return 'overview';
  });

  const [selectedQuizProgramId, setSelectedQuizProgramId] = useState<string | undefined>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const pid = params.get('programId');
        if (pid) return pid;

        const saved = sessionStorage.getItem('AIMA_STUDENT_ACTIVE_SUBVIEW');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed?.programId) return parsed.programId;
        }
      }
    } catch { }
    return undefined;
  });
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showStudentReviewModal, setShowStudentReviewModal] = useState(false);
  const [studentModalQuestions, setStudentModalQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingStudentQuestions, setIsLoadingStudentQuestions] = useState(false);
  const [studentModalFilter, setStudentModalFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [downloadedAdmitCard, setDownloadedAdmitCard] = useState(false);
  const [downloadedBrief, setDownloadedBrief] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Live Registration Data from Supabase
  const [liveRegistration, setLiveRegistration] = useState<CSRBootcampRegistration | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadLiveRegistration = async () => {
      const regNum =
        currentUser.registrationNumber ||
        currentTeam?.inviteCode ||
        (currentUser.teamId ? currentUser.teamId.replace('team_participant_', '') : null);

      if (regNum) {
        try {
          const reg = await fetchRegistrationByNumber(regNum);
          if (isMounted && reg) {
            setLiveRegistration(reg);
          }
        } catch (err) {
          console.warn('Could not load live student registration:', err);
        }
      }
    };
    loadLiveRegistration();
    return () => {
      isMounted = false;
    };
  }, [currentUser.registrationNumber, currentTeam?.inviteCode, currentUser.teamId]);

  // Payment simulated methods
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');

  const myAttempt = Array.isArray(quizAttempts)
    ? quizAttempts.find(q => q.userId === currentUser.id || q.studentId === currentUser.id || (currentUser.email && q.participantEmail?.toLowerCase() === currentUser.email.toLowerCase()))
    : Object.values(quizAttempts || {}).find((q: any) => q.userId === currentUser.id || q.studentId === currentUser.id || (currentUser.email && q.participantEmail?.toLowerCase() === currentUser.email.toLowerCase()));

  const myCaseSubmission = Array.isArray(caseSubmissions)
    ? caseSubmissions.find(s => s.teamId === currentTeam?.id) || currentTeam?.r2Submission
    : currentTeam?.r2Submission;

  const myCert = Array.isArray(certificates)
    ? certificates.find(c => c.recipientId === currentUser.id || c.teamName === currentTeam?.name)
    : undefined;

  const assignedHubId = currentTeam?.assignedHub || currentUser.assignedHub || 'north';
  const hubInfo = hubs.find(h => h.id === assignedHubId) || hubs[0];

  // Authoritative Stage 1 Quiz Program from DB
  const stage1Program = (quizPrograms || []).find(p => p.id === 'qp_case_comp_stage1_2026')
    || (quizPrograms || []).find(p => p.stage === 'round_1' || p.round === 1)
    || (quizPrograms || [])[0];

  const getQuizAvailability = () => {
    if (!stage1Program) {
      return { isOpen: true, label: 'Start Round 1 Quiz', reason: null };
    }

    const { status, startDate, startTime, endDate, endTime } = stage1Program;
    const sDate = startDate || startTime || (stage1Program as any).start_time || config?.r1QuizStartTime;
    const eDate = endDate || endTime || (stage1Program as any).end_time || config?.r1QuizEndTime;

    if (status === 'draft') {
      return {
        isOpen: false,
        label: 'Quiz Not Available',
        reason: 'This assessment is currently in draft mode.',
      };
    }

    const now = Date.now();
    const startMs = parseISTTimestamp(sDate);
    const endMs = parseISTTimestamp(eDate);

    const openDateStr = formatQuizScheduleDate(sDate);
    const closedDateStr = formatQuizScheduleDate(eDate);

    // Starting of quiz strictly depends on start time & end time:
    if (!isNaN(startMs) && now < startMs) {
      return {
        isOpen: false,
        label: `Opens ${openDateStr}`,
        reason: `Quiz scheduled to start on ${openDateStr}. Assessment questions are strictly locked until this scheduled time.`,
      };
    }

    if (!isNaN(endMs) && now > endMs) {
      return {
        isOpen: false,
        label: 'Assessment Window Closed',
        reason: `Examination window closed on ${closedDateStr}.`,
      };
    }

    return {
      isOpen: true,
      label: 'Start Round 1 Quiz',
      reason: null,
    };
  };

  const quizAvailability = getQuizAvailability();

  // Dynamic candidate & squad role determination
  const candidateCount =
    liveRegistration?.participantCount ||
    liveRegistration?.nominees?.length ||
    currentTeam?.members?.length ||
    1;
  const isSoloCandidate = candidateCount <= 1 && !liveRegistration?.teamName;
  const isTeamLeader = !isSoloCandidate && (currentUser.isTeamLeader || currentUser.role === 'team_leader' || currentTeam?.leaderId === currentUser.id);

  // Dynamic financial calculation from live registration & DB
  const isInstituteReg =
    liveRegistration?.track === 'institutional' ||
    (liveRegistration as any)?.registration_mode === 'institute' ||
    currentTeam?.registrationMode === 'institute' ||
    ((liveRegistration?.participantCount ?? 0) > 4 && !liveRegistration?.teamName);

  const isPaymentPaid =
    liveRegistration?.paymentStatus === 'PAID' ||
    (liveRegistration as any)?.payment_status === 'PAID' ||
    currentTeam?.paymentStatus === 'PAID' ||
    currentUser.hasPaidR1R2;

  const totalAmountVal =
    liveRegistration?.totalPayable ??
    (liveRegistration as any)?.total_amount ??
    currentTeam?.totalAmount ??
    (candidateCount * (config?.feeR1R2 || 200));

  const isComplimentary =
    totalAmountVal === 0 ||
    liveRegistration?.paymentMethod === 'EARLY_BIRD_COMPLIMENTARY' ||
    (liveRegistration as any)?.payment_method === 'EARLY_BIRD_COMPLIMENTARY' ||
    liveRegistration?.tierId === 'early_bird_free' ||
    (liveRegistration?.feeTier && liveRegistration.feeTier.includes('Early Bird'));

  const formattedTotalAmount = isComplimentary ? '₹0' : `₹${Number(totalAmountVal || 0).toLocaleString('en-IN')}`;
  const perStudentAmount = isComplimentary ? 0 : (candidateCount > 0 ? Math.round(totalAmountVal / candidateCount) : 0);
  const formattedPerStudentAmount = `₹${perStudentAmount.toLocaleString('en-IN')}`;

  // Dynamic Schedule from competition_config
  const formattedR3Date = config?.r3RegionalStartDate
    ? new Date(config.r3RegionalStartDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : 'Nov 14';

  const formattedR4Date = config?.r4NationalFinaleDate
    ? new Date(config.r4NationalFinaleDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
    : 'Nov 5';

  useEffect(() => {
    refreshQuizPrograms();
  }, []);

  // Dynamic Results Published determination strictly from quiz_programs table
  const isResultsPublished = Boolean(
    stage1Program?.isResultsPublished ??
    (stage1Program as any)?.is_results_published ??
    false
  );
  const isPassedCutoff = myAttempt ? myAttempt.score >= (stage1Program?.cutoffScore ?? 60) : false;
  const isQualifiedForRound2 = Boolean(isResultsPublished && isPassedCutoff);

  // Load questions for student review modal when opened
  useEffect(() => {
    if (showStudentReviewModal && stage1Program) {
      setIsLoadingStudentQuestions(true);
      fetchProgramQuestionsOrdered(stage1Program.id)
        .then(qs => {
          if (qs && qs.length > 0) {
            setStudentModalQuestions(qs);
          }
        })
        .catch(err => console.warn('Could not load program questions for student review:', err))
        .finally(() => setIsLoadingStudentQuestions(false));
    }
  }, [showStudentReviewModal, stage1Program?.id]);

  const studentAttemptQuestions = useMemo(() => {
    if (studentModalQuestions.length > 0) return studentModalQuestions;
    if (!myAttempt) return [];
    const answeredIds = Object.keys(myAttempt.answers || {});
    if (answeredIds.length > 0) {
      const matched = answeredIds.map(id => questions.find(q => q.id === id)).filter(Boolean) as QuizQuestion[];
      if (matched.length > 0) return matched;
    }
    return questions.filter(q => q.category === (stage1Program?.category || 'Management Concepts') || !stage1Program);
  }, [studentModalQuestions, myAttempt, questions, stage1Program]);

  const studentModalStats = useMemo(() => {
    if (!myAttempt || studentAttemptQuestions.length === 0) {
      return {
        total: 30,
        attempted: 0,
        correct: 0,
        incorrect: 0,
        unattempted: 0,
        coreCorrect: 0,
        coreScore: myAttempt?.score ?? 0,
        tieCorrect: 0,
        tieBreakerScore: myAttempt?.analyticalScore ?? (myAttempt as any)?.analytical_score ?? 0,
      };
    }
    const answers = myAttempt.answers || {};
    let correct = 0;
    let incorrect = 0;
    let unattempted = 0;
    let coreCorrect = 0;
    let tieCorrect = 0;

    studentAttemptQuestions.forEach((q, idx) => {
      const order = q.orderIndex || q.qNo || (idx + 1);
      const isReserve = order >= 26;
      const ans = answers[q.id];
      if (ans === undefined || ans === null) {
        unattempted++;
      } else if (Number(ans) === Number(q.correctAnswerIndex)) {
        correct++;
        if (isReserve) tieCorrect++;
        else coreCorrect++;
      } else {
        incorrect++;
      }
    });

    return {
      total: studentAttemptQuestions.length,
      attempted: correct + incorrect,
      correct,
      incorrect,
      unattempted,
      coreCorrect,
      coreScore: myAttempt.score ?? (coreCorrect * 4),
      tieCorrect,
      tieBreakerScore: myAttempt.analyticalScore ?? (myAttempt as any)?.analytical_score ?? (tieCorrect * 4),
    };
  }, [myAttempt, studentAttemptQuestions]);

  const filteredStudentQuestions = useMemo(() => {
    if (!myAttempt) return [];
    const answers = myAttempt.answers || {};
    return studentAttemptQuestions.filter(q => {
      const ans = answers[q.id];
      const isAtt = ans !== undefined && ans !== null;
      const isCorr = isAtt && Number(ans) === Number(q.correctAnswerIndex);
      const isInc = isAtt && Number(ans) !== Number(q.correctAnswerIndex);

      if (studentModalFilter === 'correct') return isCorr;
      if (studentModalFilter === 'incorrect') return isInc;
      if (studentModalFilter === 'unattempted') return !isAtt;
      return true;
    });
  }, [studentAttemptQuestions, myAttempt, studentModalFilter]);
  const getDynamicStageStatus = () => {
    if (myAttempt) {
      if (!isResultsPublished) {
        return 'Round 1 Completed • Results Under Official Review';
      }
      if (isPassedCutoff) {
        if (config?.activeStage === 'round_2') return 'Round 2 Active • Qualified for Offline Case Round';
        if (config?.activeStage === 'round_3') return 'Round 3 Active • Qualified for Regional Hub Finals';
        if (config?.activeStage === 'round_4') return 'Round 4 Active • Grand Finale Qualifier';
        return `Round 1 Passed (${myAttempt.score}%) • Qualified for Offline Round 2`;
      }
      return `Round 1 Attempt Recorded (${myAttempt.score}%) • Below Cutoff`;
    }
    if (config?.activeStage === 'round_1' || !config?.activeStage) {
      return 'Round 1 Active • Assessment Pending';
    }
    return `${config.activeStage.replace('_', ' ').toUpperCase()} Active • Stage Progression Underway`;
  };

  const handleCopyInvite = () => {
    const code = currentTeam?.inviteCode || currentUser.registrationNumber || liveRegistration?.registrationNumber;
    if (!code) return;
    navigator.clipboard?.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHallTicket = () => {
    setDownloadedAdmitCard(true);
    setTimeout(() => setDownloadedAdmitCard(false), 3500);
  };

  const handleDownloadCaseBrief = () => {
    const link = document.createElement('a');
    link.href = '/India Case League — Common Instructions for All Participants.docx';
    link.download = 'India Case League — Common Instructions for All Participants.docx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedBrief(true);
    setTimeout(() => setDownloadedBrief(false), 3000);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    makePayment('round1', totalAmountVal, payMethod === 'upi' ? 'UPI_TRANSACTION' : 'CARD_TRANSACTION');
    setShowPaymentModal(false);
  };

  const handleStartQuiz = (programId?: string) => {
    const targetId = programId || stage1Program?.id;
    setSelectedQuizProgramId(targetId);
    setActiveSubView('quiz');
    setIsQuizActive(true);
    try {
      localStorage.setItem('AIMA_QUIZ_AUTO_FULLSCREEN', 'true');
      sessionStorage.setItem('AIMA_STUDENT_ACTIVE_SUBVIEW', JSON.stringify({ subView: 'quiz', programId: targetId }));
      const url = new URL(window.location.href);
      url.searchParams.set('subview', 'quiz');
      if (targetId) url.searchParams.set('programId', targetId);
      url.searchParams.set('fullscreen', 'true');
      window.history.replaceState({}, '', url.toString());
    } catch { }
  };

  const handleExitQuiz = () => {
    setActiveSubView('overview');
    setSelectedQuizProgramId(undefined);
    setIsQuizActive(false);
    try {
      localStorage.removeItem('AIMA_QUIZ_AUTO_FULLSCREEN');
      sessionStorage.removeItem('AIMA_STUDENT_ACTIVE_SUBVIEW');
      const url = new URL(window.location.href);
      url.searchParams.delete('subview');
      url.searchParams.delete('programId');
      url.searchParams.delete('fullscreen');
      window.history.replaceState({}, '', url.toString());
    } catch { }
  };

  // Sync isQuizActive on mount or subView change
  useEffect(() => {
    if (activeSubView === 'quiz') {
      setIsQuizActive(true);
    } else {
      setIsQuizActive(false);
    }
  }, [activeSubView, setIsQuizActive]);

  // If active sub-view is quiz
  if (activeSubView === 'quiz') {
    return <QuizTaker onBack={handleExitQuiz} programId={selectedQuizProgramId || stage1Program?.id} />;
  }

  // If active sub-view is case deck
  if (activeSubView === 'case_deck') {
    return <CaseDeckSubmitter onBack={() => setActiveSubView('overview')} />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">

      {/* Candidate Profile Summary Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

          <div className="flex items-start sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentUser.name || 'Participant'}
                </h1>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isSoloCandidate
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20'
                  : isTeamLeader
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                  {isSoloCandidate
                    ? '👤 Solo Candidate'
                    : isTeamLeader
                      ? '👑 Team Leader'
                      : '👤 Team Member'}
                </span>
                {(currentUser.isVerified || currentUser.idCardUploaded || !!currentUser.enrolmentNumber) && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Student ID Verified
                  </span>
                )}
              </div>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.instituteName || liveRegistration?.organizationName || 'Registered Institution'}
                </span>
                {(currentUser.programme || liveRegistration?.program) && (
                  <>
                    <span>•</span>
                    <span>
                      {currentUser.programme || liveRegistration?.program}
                      {currentUser.specialisation ? ` (${currentUser.specialisation})` : ''}
                      {currentUser.yearSemester ? ` • ${currentUser.yearSemester}` : (liveRegistration?.semester ? ` • ${liveRegistration.semester}` : '')}
                    </span>
                  </>
                )}
                {(currentUser.enrolmentNumber || liveRegistration?.enrolmentNumber) && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      Roll: {currentUser.enrolmentNumber || liveRegistration?.enrolmentNumber}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            {myCert && (
              <div className="inline-flex items-center gap-1">
                <button
                  onClick={() => setActiveCertificateModal(myCert)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Official Certificate</span>
                </button>
              </div>
            )}

            {isPaymentPaid ? (
              <div className="inline-flex items-center gap-1.5">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isComplimentary
                    ? 'Early Bird Complimentary • Registered (₹0)'
                    : isInstituteReg
                      ? `Institution Grant • Paid (${formattedTotalAmount})`
                      : `Registration Fee • Paid (${formattedTotalAmount})`}
                </span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 border border-amber-300 dark:border-amber-700">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  {isInstituteReg
                    ? `Institution Proforma Invoice Pending (${formattedTotalAmount})`
                    : `Registration Fee • Pending (${formattedTotalAmount})`}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Milestone Progression Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span>Stage Progression</span>
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {getDynamicStageStatus()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-bold">
            {myAttempt ? (
              <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 shadow-xs ${isResultsPublished
                ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30'
                }`}>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className={`w-3.5 h-3.5 ${isResultsPublished ? 'text-emerald-500' : 'text-amber-500'}`} />
                  <span>Round 1: Online Quiz</span>
                </span>
                <span className={`text-[10px] font-semibold ${isResultsPublished ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {isResultsPublished
                    ? `Score: ${myAttempt.score}% (${isPassedCutoff ? 'Passed' : 'Cutoff Not Met'})`
                    : 'Results not published'}
                </span>
              </div>
            ) : !quizAvailability.isOpen ? (
              <div
                title={quizAvailability.reason || undefined}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 cursor-not-allowed opacity-80"
              >
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Round 1: Online Quiz</span>
                </span>
                <span className="text-[10px] font-medium opacity-80 truncate max-w-[140px]">
                  {quizAvailability.label}
                </span>
              </div>
            ) : (
              <button
                onClick={() => handleStartQuiz(stage1Program?.id)}
                className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-xs"
              >
                <span className="flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Round 1: Online Quiz</span>
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  Take Quiz ({stage1Program?.durationMinutes || 45}m)
                </span>
              </button>
            )}

            {/* Round 2: Offline Assessment (Decision 2) */}
            {isQualifiedForRound2 ? (
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/30 flex flex-col items-center justify-center gap-1 shadow-xs">
                <span className="flex items-center gap-1">
                  <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                  <span>Round 2: Case Round</span>
                </span>
                <span className="text-[10px] font-medium opacity-80">
                  Qualified • Download Brief
                </span>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 opacity-80">
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Round 2: Case Round</span>
                </span>
                <span className="text-[10px] font-medium opacity-80 truncate max-w-[140px]">
                  {!myAttempt
                    ? 'Locked • Round 1 Pending'
                    : !isResultsPublished
                      ? 'Locked • Results Under Review'
                      : `Locked • Cutoff Not Met (${myAttempt.score}%)`}
                </span>
              </div>
            )}

            {/* Round 3: Regional Hub (Dynamic Date from competition_config) */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${isQualifiedForRound2
              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
              }`}>
              <span className="flex items-center gap-1 font-semibold">
                {!isQualifiedForRound2 && <Lock className="w-3 h-3 text-slate-400" />}
                <span>Round 3: Regional Hub</span>
              </span>
              <span className="text-[10px] opacity-75">
                {isQualifiedForRound2
                  ? `${hubInfo?.city || 'Regional Center'} (${formattedR3Date})`
                  : 'Locked • Requires Qualification'}
              </span>
            </div>

            {/* Round 4: Grand Finale (Dynamic Date from competition_config) */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${isQualifiedForRound2
              ? 'bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              : 'bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-50'
              }`}>
              <span className="flex items-center gap-1 font-semibold">
                {!isQualifiedForRound2 && <Lock className="w-3 h-3 text-slate-400" />}
                <span>Round 4: Grand Finale</span>
              </span>
              <span className="text-[10px] opacity-75">AIMA HQ New Delhi ({formattedR4Date})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Team Formation / Candidate Credentials & Stage Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Team Formation Panel (if Real Team Leader) OR Candidate Status & Credentials (if Solo/Member) */}
        {!isSoloCandidate && isTeamLeader && currentTeam && (currentTeam.members?.length > 1 || liveRegistration?.teamName) ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  Team Roster (Section 5.2)
                </h3>
              </div>
              {currentTeam && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300">
                  {currentTeam.isLocked ? 'Roster Locked' : 'Open for Roster'}
                </span>
              )}
            </div>

            {currentTeam ? (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 space-y-2">
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                    {isInstituteReg ? 'Institutional Cohort Team' : 'Team Delegation'}
                  </div>
                  <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {currentTeam.name || liveRegistration?.teamName || 'Team Delegation'}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                    <span>Invite Code: <strong className="font-mono text-amber-600 select-all">{currentTeam.inviteCode}</strong></span>
                    <button
                      onClick={handleCopyInvite}
                      className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      title="Copy Invite Code"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {copiedCode && (
                    <span className="text-[10px] text-emerald-600 font-semibold block">✓ Code copied to clipboard</span>
                  )}

                  {/* Dynamic Financial Overview */}
                  <div className="pt-2 mt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Registration Mode:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {isInstituteReg ? 'Institutional Nomination' : 'Team Delegation'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Total Package Fee:</span>
                      <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                        {formattedTotalAmount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Payment Status:</span>
                      <span className={`font-semibold ${isPaymentPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                        {isPaymentPaid ? 'Paid & Cleared' : 'Proforma Invoice Pending'}
                      </span>
                    </div>
                    {(currentTeam.invoiceNumber || liveRegistration?.invoiceNumber) && (
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>Invoice Ref:</span>
                        <span className="font-mono">{currentTeam.invoiceNumber || liveRegistration?.invoiceNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Members List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>
                      {isInstituteReg
                        ? `Nominated Members (${currentTeam.members.length} Participants)`
                        : `Registered Members (${currentTeam.members.length}/${currentTeam.maxMembers || 4})`}
                    </span>
                    {currentTeam.feeTier && (
                      <span className="text-[9px] font-normal text-slate-400 truncate max-w-[130px]" title={currentTeam.feeTier}>
                        {currentTeam.feeTier}
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentTeam.members.map((member: any, idx: number) => {
                      const memberIsPaid = member.hasPaid || isPaymentPaid;
                      const memberBadgeText = isComplimentary
                        ? 'Early Bird (₹0)'
                        : isInstituteReg
                          ? (memberIsPaid ? 'Institute Paid' : 'Invoice Pending')
                          : (memberIsPaid ? `Paid ${formattedPerStudentAmount}` : `Pending ${formattedPerStudentAmount}`);

                      return (
                        <div key={member.id || member.studentId || idx} className="py-2.5 flex items-center justify-between text-xs">
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                              <span>{member.name}</span>
                              {(member.role === 'team_leader' || member.isLeader) && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">Leader</span>
                              )}
                              {currentUser.email && member.email?.toLowerCase() === currentUser.email?.toLowerCase() && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold">You</span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500">{member.email}</div>
                          </div>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${memberIsPaid
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                            }`}>
                            {memberBadgeText}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                  {isInstituteReg
                    ? `Institutional Cohort: ${currentTeam.members.length} student nominees registered by ${currentTeam.instituteName || 'Institution'}. Fees settled at institutional level.`
                    : 'Rules: Teams must consist of 3-4 members. Roster locks automatically upon Round 2 Case Deck deadline.'}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Team Formed Yet</h4>
                  <p className="text-xs text-slate-500 mt-1">Create a new team as leader or join your peers via invite code.</p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Create New Team (As Leader)
                  </button>
                  <button
                    onClick={() => setShowJoinTeamModal(true)}
                    className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Join via Invite Code
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Decision 1: Dedicated Candidate Status & Credentials Panel for Solo Candidates & Non-Team Leaders */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                  {isSoloCandidate ? 'Candidate Credentials & Registration' : 'Candidate Status & Credentials'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300">
                Verified Candidate
              </span>
            </div>

            <div className="space-y-4">
              {/* Credentials Highlight Card */}
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 space-y-2">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                  {isSoloCandidate ? 'Solo Candidate Registration' : 'Official Candidate Entry'}
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentUser.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">
                  ID / Username: <strong className="font-mono text-slate-800 dark:text-slate-200">{currentUser.email}</strong>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-amber-200/50 dark:border-amber-900/40">
                  <span>Registration Ref: <strong className="font-mono text-amber-600 select-all">{currentUser.registrationNumber || liveRegistration?.registrationNumber || currentTeam?.inviteCode || 'AIMA-CL26'}</strong></span>
                  <button
                    onClick={handleCopyInvite}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    title="Copy Registration Number"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copiedCode && (
                  <span className="text-[10px] text-emerald-600 font-semibold block">✓ Registration code copied</span>
                )}
              </div>

              {/* Details Breakdown */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Institution:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-right max-w-[180px] truncate" title={currentUser.instituteName}>
                    {currentUser.instituteName || liveRegistration?.organizationName || 'AIMA Registered Institution'}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Academic Stream:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {currentUser.programme || liveRegistration?.program || 'Management'}
                    {currentUser.yearSemester ? ` • ${currentUser.yearSemester}` : (liveRegistration?.semester ? ` • ${liveRegistration.semester}` : '')}
                  </span>
                </div>
                {(currentUser.enrolmentNumber || liveRegistration?.enrolmentNumber) && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Roll / Enrolment No:</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {currentUser.enrolmentNumber || liveRegistration?.enrolmentNumber}
                    </span>
                  </div>
                )}
                {isSoloCandidate ? (
                  <>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">Candidate Mode:</span>
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        Solo Candidate (Individual)
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">Affiliation:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        Individual Participant
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">Affiliated Team:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {currentTeam?.name || (liveRegistration?.teamName || `${currentUser.instituteName || 'Institutional'} Cohort`)}
                      </span>
                    </div>
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-slate-500">Team Leader:</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-400">
                        {currentTeam?.leaderName || (liveRegistration?.coordinator?.name || 'Designated Cohort Leader')}
                      </span>
                    </div>
                  </>
                )}
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Stage 1 Allocation:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {stage1Program?.code || 'AIMA-CL26-S1-QZ'}
                  </span>
                </div>
                <div className="py-2.5 flex items-center justify-between">
                  <span className="text-slate-500">Payment Status:</span>
                  <span className={`font-semibold ${isPaymentPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                    {isPaymentPaid ? (isComplimentary ? 'Complimentary (₹0)' : 'Paid & Verified') : 'Proforma Invoice Pending'}
                  </span>
                </div>
                {(liveRegistration?.invoiceNumber || (liveRegistration as any)?.raw_data?.invoiceNumber || currentTeam?.invoiceNumber) && (
                  <div className="py-2.5 flex items-center justify-between">
                    <span className="text-slate-500">Invoice Ref:</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      {liveRegistration?.invoiceNumber || (liveRegistration as any)?.raw_data?.invoiceNumber || currentTeam?.invoiceNumber}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                Your candidate registration is verified in the live competition database. All assessment schedule notifications and ranking communications will be sent to your registered email.
              </div>
            </div>
          </div>
        )}

        {/* Right 2 Columns: Competition Action Stage Cards */}
        <div className="lg:col-span-2 space-y-4">

          {/* Round 1 Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  ROUND 1
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {stage1Program?.title || 'Case Competition – Stage 1 Business Quiz'}
              </h3>
              <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 font-mono">
                {stage1Program?.durationMinutes || 30}-Min Timed Assessment Engine
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myAttempt
                  ? (!isResultsPublished
                    ? `Completed on ${formatISTDateTime(myAttempt.submittedAt)} • Results Under Official Review (Pending Jury Publication) • Official Attempt Recorded`
                    : `Completed on ${formatISTDateTime(myAttempt.submittedAt)} • Final Score: ${myAttempt.score}% (${isPassedCutoff ? 'Qualified for Offline Round 2' : 'Cutoff Not Met'}) • Official Attempt Recorded`
                  )
                  : !quizAvailability.isOpen
                    ? (quizAvailability.reason || 'Assessment window is currently restricted.')
                    : `Live Assessment Window (${stage1Program?.totalQuestions || 30} questions total). No negative marking applies.`}
              </p>

              {/* Dedicated Question Distribution Stat Pills (Main Scored vs Reserve Tie-Breakers) */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Main Questions (Q1-Q25) */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-800 dark:text-slate-100">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Main Questions (Q1–Q25)
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                    25 MCQs • 100 Marks
                  </span>
                </div>

                {/* Reserve Tie-Breaker (Q26-Q30) */}
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-500/35 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                    ⚡ Tie-Breakers (Q26–Q30)
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-500/20 border border-amber-500/35 dark:text-amber-300 dark:bg-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                    5 MCQs • Reserve
                  </span>
                </div>
              </div>
            </div>

            {myAttempt ? (
              !isResultsPublished ? (
                <div className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 shadow-xs select-none cursor-default">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Attempt Recorded • Under Review</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowStudentReviewModal(true)}
                  className="shrink-0 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-emerald-600/20"
                >
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>Review Attempt & Answers</span>
                </button>
              )
            ) : !quizAvailability.isOpen ? (
              <button
                disabled
                title={quizAvailability.reason || undefined}
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-not-allowed opacity-80 shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{quizAvailability.label}</span>
              </button>
            ) : (
              <button
                onClick={() => handleStartQuiz(stage1Program?.id)}
                className="shrink-0 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Start Round 1 Quiz</span>
              </button>
            )}
          </div>

          {/* Round 2 Card (Decision 2: Conducted Offline with Download Offline Case Brief) */}
          <div className={`p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${isQualifiedForRound2
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-85'
            }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${isQualifiedForRound2
                  ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
                  ROUND 2
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Offline Assessment & Regional Evaluation
                </span>
                {!isQualifiedForRound2 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Offline Campus & Regional Case Round
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isQualifiedForRound2
                  ? 'Congratulations on qualifying! Round 2 case presentations are conducted offline directly at designated regional centres / participating campuses. Official case briefs, evaluation guidelines, and problem statements can be downloaded below.'
                  : !myAttempt
                    ? 'Locked. You must take and complete the Round 1 Screening Quiz to qualify for this round.'
                    : !isResultsPublished
                      ? 'Locked. Your Round 1 attempt has been recorded and is currently under official review. Round 2 offline brief will unlock once results are published.'
                      : `Locked. Your Round 1 score (${myAttempt.score}%) did not meet the required cutoff (${stage1Program?.cutoffScore ?? 60}%) to advance to Round 2.`}
              </p>
            </div>

            {isQualifiedForRound2 ? (
              <button
                type="button"
                onClick={handleDownloadCaseBrief}
                className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloadedBrief ? 'Brief Downloaded ✓' : 'Download Offline Case Brief'}</span>
              </button>
            ) : (
              <button
                disabled
                type="button"
                className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-not-allowed opacity-80 shadow-xs"
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {!myAttempt
                    ? 'Locked • Round 1 Pending'
                    : !isResultsPublished
                      ? 'Locked • Awaiting Results Publication'
                      : `Locked • Cutoff Not Met (${myAttempt.score}%)`}
                </span>
              </button>
            )}
          </div>

          {/* Round 3 Regional Hub Card (Dynamic dates from competition_config) */}
          <div className={`p-5 rounded-3xl border shadow-sm space-y-3 transition-all ${isQualifiedForRound2
            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            : 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/50 opacity-70'
            }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded border ${isQualifiedForRound2
                  ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                  }`}>
                  ROUND 3
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Regional Live Round (Face-to-Face)
                </span>
                {!isQualifiedForRound2 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked</span>
                  </span>
                )}
              </div>
              <span className={`text-xs font-bold ${isQualifiedForRound2 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                {hubInfo?.name || 'Regional Hub'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Host Campus</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{hubInfo?.hostInstitute || 'Regional Host Campus'}</span>
                <span className="text-[10px] text-slate-500 block">{hubInfo?.city || 'Regional Center'}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Date</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{formattedR3Date}</span>
                <span className="text-[10px] text-slate-500 block">Jury Live Defense</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admit Card (QR-Secured)</span>
                {isQualifiedForRound2 ? (
                  <>
                    <button
                      onClick={handleDownloadHallTicket}
                      className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                    >
                      <Download className="w-3 h-3" /> Download Hall Ticket
                    </button>
                    {downloadedAdmitCard && (
                      <span className="text-[10px] text-emerald-600 font-semibold block mt-1 animate-in fade-in">
                        ✓ Hall ticket generated ({currentUser.name} - Hub Room B-204)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1 text-[11px] font-medium">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Locked (Requires Qualification)</span>
                  </span>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Qualification Gate</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Top 3 Teams Advance</span>
                <span className="text-[10px] text-slate-500 block">To Grand Finale</span>
              </div>
            </div>
          </div>

          {/* Round 4 Grand Finale Card (Dynamic dates from competition_config) */}
          {/* <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  ROUND 4
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  National Policy & Boardroom Grand Finale ({formattedR4Date})
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                National Winner • Cash Prize ₹5,00,000
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Presented before AIMA President & Union Ministry delegations at AIMA HQ New Delhi.
              </p>
            </div>

            {myCert && (
              <button
                onClick={() => setActiveCertificateModal(myCert)}
                className="shrink-0 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>View National Trophy Credential</span>
              </button>
            )}
          </div> */}

        </div>

      </div>

      {/* Modals */}
      {/* Create Team Modal */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Create New Student Team</h3>
            <p className="text-xs text-slate-500">You will be designated as the Team Leader with administrative submission authority.</p>
            <div>
              <label className="block text-xs font-semibold mb-1">Team Name</label>
              <input
                type="text"
                value={newTeamName}
                onChange={e => setNewTeamName(e.target.value)}
                placeholder="e.g. Apex Strategic Solvers"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowCreateTeamModal(false)} className="px-4 py-2 text-xs">Cancel</button>
              <button
                onClick={() => {
                  if (!newTeamName.trim()) return;
                  createTeam(newTeamName);
                  setShowCreateTeamModal(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
              >
                Create Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Join Team via Invite Code</h3>
            <p className="text-xs text-slate-500">Enter the unique alphanumeric invite code shared by your Team Leader.</p>
            <div>
              <label className="block text-xs font-semibold mb-1">Invite Code</label>
              <input
                type="text"
                value={joinInviteCode}
                onChange={e => setJoinInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ICL-APEX-890"
                className="w-full text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 uppercase font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowJoinTeamModal(false)} className="px-4 py-2 text-xs">Cancel</button>
              <button
                onClick={() => {
                  if (!joinInviteCode.trim()) return;
                  joinTeam(joinInviteCode);
                  setShowJoinTeamModal(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold"
              >
                Join Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-600" />
                AIMA Payment Gateway (Section 6)
              </h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">
                  {isInstituteReg ? 'Institutional Package Amount' : 'Registration Amount'}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">
                  {formattedTotalAmount}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Rate: ₹200 / student</span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">
                  {candidateCount} × ₹200 = ₹{candidateCount * 200}
                </span>
              </div>
            </div>

            <form onSubmit={handlePayment} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPayMethod('upi')}
                  className={`p-2.5 rounded-lg border font-semibold ${payMethod === 'upi' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  UPI Instant
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('card')}
                  className={`p-2.5 rounded-lg border font-semibold ${payMethod === 'card' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  Credit/Debit
                </button>
                <button
                  type="button"
                  onClick={() => setPayMethod('netbanking')}
                  className={`p-2.5 rounded-lg border font-semibold ${payMethod === 'netbanking' ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700'}`}
                >
                  NetBanking
                </button>
              </div>

              {payMethod === 'upi' && (
                <div>
                  <label className="block font-semibold mb-1">Enter UPI VPA ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md transition-colors cursor-pointer"
              >
                Authorize & Pay {formattedTotalAmount}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Student Attempt Review Modal */}
      {showStudentReviewModal && myAttempt && (
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
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0 uppercase ring-1 ring-white/20">
                    {(currentUser.name || liveRegistration?.fullName || 'S').slice(0, 2)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        {currentUser.name || liveRegistration?.fullName || 'Your Quiz Attempt Review'}
                      </h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                        <GraduationCap className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                        {currentUser.registrationNumber || liveRegistration?.registrationNumber || myAttempt.registrationNumber || 'AIMA-CL26-00000'}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wider ${isPassedCutoff
                          ? 'bg-emerald-500 text-white'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/35'
                          }`}
                      >
                        {isPassedCutoff ? (
                          'Qualified R2'
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Below Cutoff ({stage1Program?.cutoffScore || 60}%)
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {currentUser.instituteName || liveRegistration?.instituteName || 'Management Institute'}
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        Team: <strong className="text-slate-800 dark:text-slate-200 ml-0.5">{currentTeam?.name || liveRegistration?.teamName || 'Individual Entry'}</strong>
                      </span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {currentUser.email || liveRegistration?.email}
                      </span>
                      {myAttempt.submittedAt && (
                        <>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Clock className="w-3 h-3 text-red-500 dark:text-red-400" />
                            Submitted: {formatISTDateTime(myAttempt.submittedAt)} (IST)
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowStudentReviewModal(false)}
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
                      {myAttempt.score ?? studentModalStats.coreScore}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">/100</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-1.5 py-0.2 rounded ml-0.5">
                      {studentModalStats.coreCorrect}/25 Scored
                    </span>
                  </div>

                  {/* Reserve Tie-Breaker (Q26-Q30) */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-300/70 dark:border-amber-500/35 text-amber-900 dark:text-amber-200 text-xs shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">⚡ Tie-Breaker (Q26–Q30)</span>
                    <span className="font-mono font-black text-amber-900 dark:text-amber-200 text-sm">
                      {myAttempt.analyticalScore ?? (myAttempt as any).analytical_score ?? studentModalStats.tieBreakerScore}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700/80 dark:text-amber-400/80">/20</span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-500/20 border border-amber-500/35 dark:text-amber-300 dark:bg-amber-500/20 px-1.5 py-0.2 rounded ml-0.5">
                      {studentModalStats.tieCorrect}/5 Scored
                    </span>
                  </div>
                </div>

                {/* Duration & Integrity */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-700 dark:text-slate-200">
                    <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {Math.floor((myAttempt.timeTakenSeconds || 0) / 60)}m {(myAttempt.timeTakenSeconds || 0) % 60}s
                    </span>
                    <span className="border-l border-slate-200 dark:border-slate-700 pl-1.5 ml-0.5">
                      {myAttempt.tabSwitchCount === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" /> Clean
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-0.5">
                          <ShieldAlert className="w-3 h-3 text-rose-500 dark:text-rose-400" /> {myAttempt.tabSwitchCount} Violations
                        </span>
                      )}
                    </span>
                  </div>

                  {isLoadingStudentQuestions && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 animate-pulse pl-1">
                      Loading answers...
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
                  onClick={() => setStudentModalFilter('all')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${studentModalFilter === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-2xs font-black'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800/90 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:text-white'
                    }`}
                >
                  <span>All</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${studentModalFilter === 'all'
                    ? 'bg-white/20 text-white dark:bg-slate-900/15 dark:text-slate-900'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                    }`}>
                    {studentModalStats.total}
                  </span>
                </button>

                {/* Correct */}
                <button
                  type="button"
                  onClick={() => setStudentModalFilter('correct')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${studentModalFilter === 'correct'
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-400 ring-1 ring-emerald-400/30 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-500/70 dark:ring-emerald-500/40 shadow-2xs'
                    : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-200 hover:text-emerald-800 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-emerald-950/30 dark:hover:border-emerald-800/50 dark:hover:text-emerald-200'
                    }`}
                >
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${studentModalFilter === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : 'text-emerald-500/80 dark:text-emerald-400/80'}`} />
                  <span>Correct</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${studentModalFilter === 'correct'
                    ? 'bg-emerald-200/80 text-emerald-900 border border-emerald-300 dark:bg-emerald-500/30 dark:text-emerald-200 dark:border-emerald-500/40'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {studentModalStats.correct}
                  </span>
                  <span className={`text-[10px] font-medium ${studentModalFilter === 'correct' ? 'text-emerald-800 dark:text-emerald-200/80' : 'text-slate-400'}`}>
                    ({studentModalStats.coreCorrect} Main + {studentModalStats.tieCorrect} Tie)
                  </span>
                </button>

                {/* Incorrect */}
                <button
                  type="button"
                  onClick={() => setStudentModalFilter('incorrect')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${studentModalFilter === 'incorrect'
                    ? 'bg-rose-50 text-rose-900 border-rose-300 ring-1 ring-rose-300/40 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-500/70 dark:ring-rose-500/40 shadow-2xs'
                    : 'bg-slate-50/80 text-slate-600 border-slate-200 hover:bg-rose-50/50 hover:border-rose-200 hover:text-rose-800 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/80 dark:hover:bg-rose-950/30 dark:hover:border-rose-800/50 dark:hover:text-rose-200'
                    }`}
                >
                  <XCircle className={`w-3.5 h-3.5 shrink-0 ${studentModalFilter === 'incorrect' ? 'text-rose-500 dark:text-rose-400' : 'text-rose-400/80'}`} />
                  <span>Incorrect</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${studentModalFilter === 'incorrect'
                    ? 'bg-rose-200/80 text-rose-900 border border-rose-300 dark:bg-rose-500/30 dark:text-rose-200 dark:border-rose-500/40'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {studentModalStats.incorrect}
                  </span>
                  <span className={`text-[10px] font-medium ${studentModalFilter === 'incorrect' ? 'text-rose-800 dark:text-rose-200/80' : 'text-slate-400'}`}>
                    (0 Penalty)
                  </span>
                </button>

                {/* Skipped */}
                <button
                  type="button"
                  onClick={() => setStudentModalFilter('unattempted')}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer border ${studentModalFilter === 'unattempted'
                    ? 'bg-slate-200 text-slate-800 border-slate-300 dark:bg-slate-600 dark:text-white dark:border-slate-500 shadow-2xs font-black'
                    : 'bg-slate-50/80 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-800 dark:bg-slate-800/90 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-750 dark:hover:text-slate-200'
                    }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>Skipped</span>
                  <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${studentModalFilter === 'unattempted'
                    ? 'bg-slate-300 text-slate-800 dark:bg-white/20 dark:text-white'
                    : 'bg-slate-200/80 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                    {studentModalStats.unattempted}
                  </span>
                </button>
              </div>
            </div>

            {/* Questions List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
              {filteredStudentQuestions.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-sm">
                  No questions found matching the "{studentModalFilter}" filter.
                </div>
              ) : (
                filteredStudentQuestions.map((q, qIdx) => {
                  const answers = myAttempt.answers || {};
                  const studentSelectedOptIdx = answers[q.id];
                  const isAttempted = studentSelectedOptIdx !== undefined && studentSelectedOptIdx !== null;
                  const isCorrect = isAttempted && Number(studentSelectedOptIdx) === Number(q.correctAnswerIndex);
                  const isWrong = isAttempted && Number(studentSelectedOptIdx) !== Number(q.correctAnswerIndex);
                  const displayQNo = q.orderIndex || q.qNo || (qIdx + 1);
                  const isReserveQuestion = displayQNo >= 26;

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

                          {/* Reserve / Tie-breaker Badge vs Core Scored Badge */}
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
                            • +{q.marks || 4} Marks (No Negative Marking)
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {isReserveQuestion ? `Correct (+${q.marks || 4} Tie-Break)` : `Correct (+${q.marks || 4})`}
                            </span>
                          )}
                          {isWrong && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-500/10 text-rose-600 border border-rose-500/25">
                              <XCircle className="w-3.5 h-3.5" />
                              Incorrect (0 pts penalty)
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

                          let borderStyle = 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/80';
                          let badgeBg = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
                          let textColor = 'text-slate-700 dark:text-slate-300';

                          if (isOptionCorrect && isOptionStudentChosen) {
                            borderStyle = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-1 ring-emerald-500/50 shadow-2xs';
                            badgeBg = 'bg-emerald-600 text-white font-black';
                            textColor = 'text-emerald-900 dark:text-emerald-100 font-bold';
                          } else if (isOptionCorrect && !isOptionStudentChosen) {
                            borderStyle = 'border-emerald-500/80 bg-emerald-50/50 dark:bg-emerald-950/30';
                            badgeBg = 'bg-emerald-500 text-white font-bold';
                            textColor = 'text-emerald-800 dark:text-emerald-200 font-semibold';
                          } else if (isOptionStudentChosen && !isOptionCorrect) {
                            borderStyle = 'border-rose-400 bg-rose-50/80 dark:bg-rose-950/40 ring-1 ring-rose-400/50 shadow-2xs';
                            badgeBg = 'bg-rose-600 text-white font-black';
                            textColor = 'text-rose-900 dark:text-rose-100 font-bold';
                          }

                          return (
                            <div
                              key={optIdx}
                              className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-xs transition ${borderStyle}`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] shrink-0 uppercase shadow-2xs ${badgeBg}`}>
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className={`leading-snug break-words ${textColor}`}>
                                  {opt}
                                </span>
                              </div>

                              <div className="shrink-0 flex items-center gap-1.5">
                                {isOptionCorrect && isOptionStudentChosen && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-500 text-white shadow-xs">
                                    <CheckCircle2 className="w-3 h-3" />
                                    Your Answer • Correct
                                  </span>
                                )}
                                {isOptionCorrect && !isOptionStudentChosen && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    Official Correct Answer
                                  </span>
                                )}
                                {isOptionStudentChosen && !isOptionCorrect && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-rose-500 text-white shadow-xs">
                                    <XCircle className="w-3 h-3" />
                                    Your Choice • Incorrect
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Official Explanation Section */}
                      {q.explanation && (
                        <div className="mt-2 p-2.5 sm:p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300/60 dark:border-amber-800/50 border-l-4 border-l-amber-500 text-xs space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 uppercase text-[10px] tracking-wider">
                            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            Official Evaluation Explanation
                          </div>
                          <p className="text-amber-950 dark:text-amber-100 text-[11px] leading-relaxed">
                            {q.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Official Review for <strong>{stage1Program?.title || 'Stage 1 Business Quiz'}</strong>
              </span>
              <button
                type="button"
                onClick={() => setShowStudentReviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition cursor-pointer shadow-xs"
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
