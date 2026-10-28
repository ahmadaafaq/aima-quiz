import React, { useState, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizQuestion, QuizAttempt } from '../../types';
import {
  AlertTriangle,
  Award,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  HelpCircle,
  Lock,
  Maximize,
  Pause,
  RotateCcw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { parseISTTimestamp, formatQuizScheduleDate, formatISTDateTime } from '../../lib/formatters';

interface QuizTakerProps {
  onBack: () => void;
  programId?: string;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ onBack, programId }) => {
  const {
    questions: globalQuestions,
    quizPrograms,
    quizAttempts,
    getProgramQuestions,
    submitQuiz,
    currentUser,
    config,
  } = useCompetition();

  const activeProgram = programId
    ? quizPrograms.find(p => p.id === programId)
    : quizPrograms.find(p => p.status === 'live' || (p.status as any) === 'active') || quizPrograms[0];

  const quizTitle = activeProgram?.title || 'Case Competition – Stage 1 Business Quiz';

  const now = Date.now();
  const rawStartTime = activeProgram?.startDate || activeProgram?.startTime || (activeProgram as any)?.start_time;
  const rawEndTime = activeProgram?.endDate || activeProgram?.endTime || (activeProgram as any)?.end_time;
  const startMs = parseISTTimestamp(rawStartTime);
  const endMs = parseISTTimestamp(rawEndTime);

  const isBeforeStart = !isNaN(startMs) && now < startMs;
  const isAfterEnd = !isNaN(endMs) && now > endMs;

  const resolvedProgramId =
    programId ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('programId') : null) ||
    activeProgram?.id ||
    'qp_case_comp_stage1_2026';

  const sessionKey = `aima_quiz_session_${currentUser.id}_${resolvedProgramId}`;

  // Robust retrieval of in-progress session across reloads
  const initialSessionInfo = (() => {
    if (typeof window === 'undefined') return null;
    try {
      // 1. Direct key match: currentUser.id + resolvedProgramId
      const primaryKey = `aima_quiz_session_${currentUser.id}_${resolvedProgramId}`;
      const raw = localStorage.getItem(primaryKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.startTime) return { data: parsed, key: primaryKey };
      }

      // 2. Fallback key with email
      if (currentUser?.email) {
        const emailKey = `aima_quiz_session_${currentUser.email}_${resolvedProgramId}`;
        const rawEmail = localStorage.getItem(emailKey);
        if (rawEmail) {
          const parsed = JSON.parse(rawEmail);
          if (parsed?.startTime) return { data: parsed, key: emailKey };
        }
      }

      // 3. Scan localStorage for any aima_quiz_session matching resolvedProgramId
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aima_quiz_session_') && (k.endsWith(resolvedProgramId) || k.includes(resolvedProgramId))) {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed?.startTime) return { data: parsed, key: k };
          }
        }
      }

      // 4. Fallback scan for any active quiz session with a valid startTime
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aima_quiz_session_')) {
          const val = localStorage.getItem(k);
          if (val) {
            const parsed = JSON.parse(val);
            if (parsed?.startTime) return { data: parsed, key: k };
          }
        }
      }
    } catch (e) {
      console.error('Failed to parse quiz session', e);
    }
    return null;
  })();

  const [savedSession, setSavedSession] = useState<{
    startTime: number;
    answers: Record<string, number>;
    marked: string[];
    currentIndex?: number;
    questionIds?: string[];
  } | null>(() => initialSessionInfo?.data || null);

  const questions = React.useMemo(() => {
    if (isBeforeStart || isAfterEnd) {
      return [];
    }
    let list: QuizQuestion[] = [];
    if (activeProgram) {
      list = getProgramQuestions(activeProgram.id);
    }
    if (!list || list.length === 0) {
      list = globalQuestions;
    }

    const currentSession = savedSession || initialSessionInfo?.data;
    if (currentSession?.questionIds && currentSession.questionIds.length > 0 && list.length > 0) {
      const map = new Map(list.map(q => [q.id, q]));
      const ordered = currentSession.questionIds.map(id => map.get(id)).filter(Boolean) as QuizQuestion[];
      if (ordered.length === list.length) {
        return ordered;
      }
    }

    if (activeProgram?.shuffleQuestions) {
      return [...list].sort(() => 0.5 - Math.random());
    }
    return list;
  }, [activeProgram?.id, activeProgram?.shuffleQuestions, globalQuestions, isBeforeStart, isAfterEnd, savedSession?.questionIds]);

  const hasSavedSession = Boolean(savedSession?.startTime);
  const [hasStartedQuiz, setHasStartedQuiz] = useState<boolean>(hasSavedSession);
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(hasSavedSession);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(savedSession?.currentIndex || 0);
  const [answers, setAnswers] = useState<Record<string, number>>(savedSession?.answers || {});
  const [markedForReview, setMarkedForReview] = useState<string[]>(savedSession?.marked || []);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);

  const existingAttempt = Array.isArray(quizAttempts)
    ? quizAttempts.find(q => (q.userId === currentUser.id || q.studentId === currentUser.id) && (!programId || q.programId === programId || (q as any).quizProgramId === programId || activeProgram?.id === q.programId))
    : Object.values(quizAttempts || {}).find((q: any) => (q.userId === currentUser.id || q.studentId === currentUser.id) && (!programId || q.programId === programId || (q as any).quizProgramId === programId || activeProgram?.id === q.programId));

  const isProgramPaused = activeProgram?.status === 'paused';
  const totalDurationSeconds = (activeProgram?.durationMinutes || config.r1DurationMinutes || 30) * 60;

  // Fullscreen Entry with URL & localStorage persistence
  const enterFullscreen = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('AIMA_QUIZ_AUTO_FULLSCREEN', 'true');
        try {
          const url = new URL(window.location.href);
          if (url.searchParams.get('fullscreen') !== 'true') {
            url.searchParams.set('fullscreen', 'true');
            window.history.replaceState({}, '', url.toString());
          }
        } catch {}
      }

      const elem = document.documentElement;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          elem.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else if ((elem as any).webkitRequestFullscreen) {
          (elem as any).webkitRequestFullscreen();
          setIsFullscreen(true);
        }
      } else {
        setIsFullscreen(true);
      }
    } catch (e) {
      console.log('Fullscreen error:', e);
    }
  };

  const exitFullscreen = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('AIMA_QUIZ_AUTO_FULLSCREEN');
        try {
          const url = new URL(window.location.href);
          url.searchParams.delete('fullscreen');
          window.history.replaceState({}, '', url.toString());
        } catch {}
      }

      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      } else {
        setIsFullscreen(false);
      }
    } catch (e) {
      console.log('Fullscreen exit error:', e);
    }
  };

  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' ? Boolean(document.fullscreenElement) : false;
  });

  const initialSecondsRemaining = React.useMemo(() => {
    if (existingAttempt || isBeforeStart || isAfterEnd) return 0;
    const session = savedSession || initialSessionInfo?.data;
    if (session?.startTime) {
      const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
      return Math.max(0, totalDurationSeconds - elapsed);
    }
    return totalDurationSeconds;
  }, [existingAttempt, savedSession?.startTime, totalDurationSeconds, isBeforeStart, isAfterEnd]);

  const [secondsRemaining, setSecondsRemaining] = useState(initialSecondsRemaining);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAttempt, setFinalAttempt] = useState<QuizAttempt | null>(null);

  // Track if user explicitly clicked 'Escape' key to exit fullscreen
  const [showEscapeLockdownOverlay, setShowEscapeLockdownOverlay] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const inFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(inFullscreen);
      if (inFullscreen) {
        setShowEscapeLockdownOverlay(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Show lockdown overlay ONLY when candidate explicitly clicks/presses 'Escape' key
  useEffect(() => {
    if (!hasStartedQuiz || isCompleted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Escape') {
        setShowEscapeLockdownOverlay(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasStartedQuiz, isCompleted]);

  const resumeFullscreenFromOverlay = () => {
    setShowEscapeLockdownOverlay(false);
    enterFullscreen();
  };

  // Resume immediately if an active session exists (prevents any modal/instruction screen on reload)
  useEffect(() => {
    if (!hasStartedQuiz && !existingAttempt && !isCompleted) {
      const sessionInfo = initialSessionInfo;
      if (sessionInfo && sessionInfo.data?.startTime) {
        setSavedSession(sessionInfo.data);
        setHasStartedQuiz(true);
        setAgreedToTerms(true);
        if (sessionInfo.data.answers) setAnswers(sessionInfo.data.answers);
        if (sessionInfo.data.marked) setMarkedForReview(sessionInfo.data.marked);
        if (typeof sessionInfo.data.currentIndex === 'number') setCurrentIndex(sessionInfo.data.currentIndex);
        const elapsed = Math.floor((Date.now() - sessionInfo.data.startTime) / 1000);
        const rem = Math.max(0, totalDurationSeconds - elapsed);
        setSecondsRemaining(rem);
      }
    }
  }, [hasStartedQuiz, existingAttempt, isCompleted, totalDurationSeconds]);

  // Auto-fullscreen on refresh / navigation / interaction
  useEffect(() => {
    if (!hasStartedQuiz || isCompleted) return;

    const shouldAutoFullscreen =
      localStorage.getItem('AIMA_QUIZ_AUTO_FULLSCREEN') === 'true' ||
      (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('fullscreen') === 'true') ||
      hasStartedQuiz;

    if (!shouldAutoFullscreen) return;

    // 1. Immediate attempt on mount / navigation
    enterFullscreen();
    const timer = setTimeout(() => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    }, 150);

    // 2. Browser user-gesture fallback: on ANY user interaction (click, tap, keypress) anywhere on screen,
    // seamlessly re-engage fullscreen automatically without requiring the user to click any specific button.
    const handleAutoInteraction = () => {
      if (!document.fullscreenElement) {
        enterFullscreen();
      }
    };

    window.addEventListener('click', handleAutoInteraction, { capture: true });
    window.addEventListener('pointerdown', handleAutoInteraction, { capture: true });
    window.addEventListener('keydown', handleAutoInteraction, { capture: true });
    window.addEventListener('focus', handleAutoInteraction);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleAutoInteraction, { capture: true });
      window.removeEventListener('pointerdown', handleAutoInteraction, { capture: true });
      window.removeEventListener('keydown', handleAutoInteraction, { capture: true });
      window.removeEventListener('focus', handleAutoInteraction);
    };
  }, [hasStartedQuiz, isCompleted]);

  // Start quiz session & begin countdown timer in fullscreen
  const handleBeginQuiz = () => {
    const qIds = questions.map(q => q.id);
    const sessionData = {
      startTime: Date.now(),
      answers: {},
      marked: [],
      currentIndex: 0,
      questionIds: qIds,
      programId: resolvedProgramId,
      userId: currentUser.id,
    };
    try {
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    } catch (e) {
      console.error(e);
    }
    setSavedSession(sessionData);
    enterFullscreen();
    setHasStartedQuiz(true);
  };

  // Sync answers & position to localStorage continuously
  useEffect(() => {
    if (!hasStartedQuiz || isCompleted || existingAttempt || isProgramPaused || isBeforeStart || isAfterEnd) return;
    try {
      const activeKey = initialSessionInfo?.key || sessionKey;
      const raw = localStorage.getItem(activeKey);
      const current = raw ? JSON.parse(raw) : { startTime: Date.now() };
      current.answers = answers;
      current.marked = markedForReview;
      current.currentIndex = currentIndex;
      if (questions.length > 0 && (!current.questionIds || current.questionIds.length === 0)) {
        current.questionIds = questions.map(q => q.id);
      }
      localStorage.setItem(activeKey, JSON.stringify(current));
    } catch (e) {
      console.error(e);
    }
  }, [hasStartedQuiz, answers, markedForReview, currentIndex, isCompleted, existingAttempt, isProgramPaused, isBeforeStart, isAfterEnd, sessionKey, questions]);

  // Tab switch anti-cheat monitoring (with initial load buffer to prevent false alarms on refresh)
  useEffect(() => {
    if (!hasStartedQuiz || existingAttempt || isProgramPaused || isBeforeStart || isAfterEnd) return;
    let isReady = false;
    const readyTimer = setTimeout(() => { isReady = true; }, 1200);

    const handleVisibilityChange = () => {
      if (isReady && document.hidden && !isCompleted) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          setTabWarning(true);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      clearTimeout(readyTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [hasStartedQuiz, isCompleted, existingAttempt, isProgramPaused, isBeforeStart, isAfterEnd]);

  // Countdown timer
  useEffect(() => {
    if (!hasStartedQuiz || isCompleted || existingAttempt || isProgramPaused || isBeforeStart || isAfterEnd) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [hasStartedQuiz, isCompleted, answers, markedForReview, existingAttempt, isProgramPaused, isBeforeStart, isAfterEnd]);

  // If time had expired while away, auto submit immediately
  useEffect(() => {
    if (initialSecondsRemaining === 0 && savedSession?.startTime && !existingAttempt && !isCompleted && !isBeforeStart) {
      handleAutoSubmit();
    }
  }, [isBeforeStart]);

  const cleanStoredSessions = () => {
    try {
      localStorage.removeItem('AIMA_QUIZ_AUTO_FULLSCREEN');
      try {
        const url = new URL(window.location.href);
        url.searchParams.delete('fullscreen');
        window.history.replaceState({}, '', url.toString());
      } catch {}

      const activeKey = initialSessionInfo?.key || sessionKey;
      localStorage.removeItem(activeKey);
      localStorage.removeItem(`aima_quiz_session_${currentUser.id}_${resolvedProgramId}`);
      if (currentUser?.email) {
        localStorage.removeItem(`aima_quiz_session_${currentUser.email}_${resolvedProgramId}`);
      }
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith('aima_quiz_session_') && (k.includes(resolvedProgramId) || k.includes(currentUser.id))) {
          localStorage.removeItem(k);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAutoSubmit = async () => {
    cleanStoredSessions();
    exitFullscreen();
    const attempt = await submitQuiz(answers, markedForReview, totalDurationSeconds - secondsRemaining, tabSwitchCount);
    setFinalAttempt(attempt);
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const confirmFinalSubmit = async () => {
    setShowSubmitModal(false);
    cleanStoredSessions();
    exitFullscreen();
    const attempt = await submitQuiz(answers, markedForReview, totalDurationSeconds - secondsRemaining, tabSwitchCount);
    setFinalAttempt(attempt);
    setIsCompleted(true);
    confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  };

  const currentQ = questions[currentIndex] || questions[0];

  const handleSelectOption = (optIdx: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQ.id]: optIdx,
    }));
  };

  const toggleMarkForReview = () => {
    setMarkedForReview(prev =>
      prev.includes(currentQ.id) ? prev.filter(id => id !== currentQ.id) : [...prev, currentQ.id]
    );
  };

  const clearCurrentAnswer = () => {
    setAnswers(prev => {
      const updated = { ...prev };
      delete updated[currentQ.id];
      return updated;
    });
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.keys(answers).length;
  const markedCount = markedForReview.length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Result Screen (Shown on submission OR when returning to completed quiz)
  // ─────────────────────────────────────────────────────────────────────────────
  const displayAttempt = finalAttempt || existingAttempt;

  if (displayAttempt && (isCompleted || existingAttempt)) {
    const isPassed = (displayAttempt.score ?? 0) >= (activeProgram?.cutoffScore || config.r1CutoffScore || 60);
    const attemptAnswersCount = displayAttempt.answers ? Object.keys(displayAttempt.answers).length : answeredCount;
    const timeTakenSecs = displayAttempt.timeTakenSeconds || 0;
    const timeMins = Math.floor(timeTakenSecs / 60);
    const timeSecs = timeTakenSecs % 60;

    // Strict publication rule:
    // When candidate has just submitted (isCompleted), scores are strictly hidden.
    // When returning candidate visits, score is revealed ONLY if activeProgram in DB is published.
    const showScore = !isCompleted && Boolean(
      (activeProgram as any)?.is_results_published === true ||
      (activeProgram as any)?.isResultsPublished === true
    );

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200/50 dark:border-amber-800/50">
            {showScore ? (isPassed ? <Award className="w-9 h-9 text-emerald-600" /> : <Clock className="w-9 h-9 text-amber-600" />) : <Clock className="w-9 h-9 text-amber-600" />}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 font-mono">
              ROUND 1: {quizTitle.toUpperCase()} COMPLETED
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1" style={{ fontFamily: 'Cinzel, serif' }}>
              {showScore
                ? (isPassed ? 'Congratulations! You Have Qualified' : 'Quiz Submission Recorded')
                : 'Quiz Submission Recorded'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-lg mx-auto leading-relaxed">
              {showScore
                ? (isPassed
                    ? 'Your score meets the AIMA-ICRC Round 2 qualification threshold. Your team is officially cleared for Case Deck Submission.'
                    : 'Thank you for participating. Your attempt timestamp and analytical scores have been logged in the national ranking register.')
                : <>Thank you for participating in <strong className="text-slate-800 dark:text-slate-200">{quizTitle}</strong>. Your attempt timestamp, questions answered, and integrity metrics have been securely logged in the national ranking register.</>}
            </p>
          </div>

          {/* Stats Matrix: Scores strictly hidden until admin publication */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 text-left sm:text-center">
            {!showScore ? (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Questions Attempted</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {attemptAnswersCount} <span className="text-sm font-normal text-slate-400">/ {questions.length || 30}</span>
                  </span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                    Official Responses Logged
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Evaluation Status</span>
                  <span className="text-lg font-black text-amber-600 dark:text-amber-400 block pt-1">
                    Under Review
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    Awaiting Admin Publication
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Score</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{displayAttempt.score}%</span>
                  <span className={`text-[10px] font-semibold block mt-0.5 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Analytical Performance</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{displayAttempt.analyticalScore ?? 0} pts</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Sectional Score</span>
                </div>
              </>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Time Taken</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {timeMins}m {timeSecs}s
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">
                Of {activeProgram?.durationMinutes || config.r1DurationMinutes || 30} mins
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Integrity Flags</span>
              <span className={`text-2xl font-black ${displayAttempt.tabSwitchCount === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {displayAttempt.tabSwitchCount || 0}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tab Switches</span>
            </div>
          </div>

          {/* Official Evaluation Callout */}
          {!showScore && (
            <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-800/50 text-left text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold">National Evaluation & Score Publication Notice</div>
                <div className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  Candidate scores, question-wise accuracy, and Round 2 qualification announcements are moderated by the AIMA examination cell. Final results and merit lists will be published via the official admin portal.
                </div>
              </div>
            </div>
          )}

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                exitFullscreen();
                onBack();
              }}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Exam Guard Screens (Window Not Yet Open / Window Closed / Paused)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isBeforeStart && !isCompleted) {
    const openDateStr = formatQuizScheduleDate(rawStartTime);
    return (
      <div className="max-w-xl mx-auto p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-800">
            <Clock className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
              Examination Scheduled
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Quiz Window Not Yet Open
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              This online assessment officially opens on <strong className="text-slate-900 dark:text-white">{openDateStr}</strong>. Questions and test materials will remain strictly locked until the scheduled start time.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAfterEnd && !isCompleted && !existingAttempt) {
    const closedDateStr = formatQuizScheduleDate(rawEndTime);
    return (
      <div className="max-w-xl mx-auto p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            <Lock className="w-8 h-8 text-slate-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-500/20">
              Window Closed
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Assessment Window Officially Closed
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              The official examination window for this quiz concluded on <strong className="text-slate-900 dark:text-white">{closedDateStr}</strong>. Submissions are no longer accepted.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isProgramPaused && !isCompleted) {
    return (
      <div className="max-w-xl mx-auto p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner bg-amber-50 dark:bg-amber-950/40 text-amber-600 border border-amber-200 dark:border-amber-800">
            <Pause className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
              Exam Suspended
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
              Quiz Temporarily Paused
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              This examination has been temporarily paused by the examination administrator. Please check back shortly or return to your dashboard.
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={onBack}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Pre-Quiz Instructions Screen (Shown before starting assessment)
  // ─────────────────────────────────────────────────────────────────────────────
  if (!hasStartedQuiz) {
    const totalQCount = questions.length || 30;
    const durationMin = activeProgram?.durationMinutes || config.r1DurationMinutes || 30;

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 animate-in fade-in zoom-in-95 duration-200 space-y-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono">
                  AIMA-ICRC CASE LEAGUE 2026
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                  STAGE 1 SCREENING
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100" style={{ fontFamily: 'Cinzel, serif' }}>
                {quizTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Official Screening Round | 30 Multiple-Choice Questions (MCQs)
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="p-2.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Quick Specs Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Questions</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 block">
                {totalQCount} MCQs
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">30 Questions Total</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Marking Scheme</span>
              <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 block">
                +4 / 0
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">No Negative Marking</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Maximum Score</span>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 block">
                100 Marks
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Full Assessment Scale</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Suggested Time</span>
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 block">
                {durationMin} Mins
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">~1 Min Per Question</span>
            </div>
          </div>

          {/* Section Blueprint Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Assessment Section Blueprint</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Section A: Management Theory (Q1–Q5)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">5 Questions</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Conceptual foundations, strategic frameworks, organizational behavior, and management thought.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Section B: Companies in the News (Q6–Q10)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">5 Questions</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Recent mergers, acquisitions, regulatory actions, and major Indian & global corporate developments (Oct 2026).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Section C: Management Applications (Q11–Q20)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">10 Questions</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Operations, Marketing, HRD, MIS, and Finance application caselets (2 questions per domain).
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Section D: Brands, Valuation & Startup/VC (Q21–Q30)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-mono">10 Questions</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  Brand trivia, unicorn valuations, venture capital concepts, and strategic corporate scenarios.
                </p>
              </div>
            </div>
          </div>

          {/* Academic Integrity & Proctoring Rules */}
          <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/40 space-y-2 text-xs">
            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Academic Integrity & Proctoring Protocol</span>
            </div>
            <ul className="text-slate-600 dark:text-slate-300 space-y-1.5 list-disc pl-5 text-[11px] leading-relaxed">
              <li>
                <strong>Full-Screen Mandatory:</strong> The examination runs in full-screen mode for the entire duration to ensure a secure testing environment.
              </li>
              <li>
                <strong>Tab-Switch & Blur Detection:</strong> Navigating away from the exam tab or window loss is tracked and logged in the national security audit.
              </li>
              <li>
                <strong>Single Attempt Enforced:</strong> Each candidate receives strictly one official attempt. Answers cannot be revised after submission.
              </li>
              <li>
                <strong>Timer Auto-Submission:</strong> The examination timer runs continuously once started and auto-submits upon expiry.
              </li>
            </ul>
          </div>

          {/* Candidate Acknowledgment */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
            <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 dark:bg-slate-900 border-slate-300 dark:border-slate-700 cursor-pointer"
              />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                I have read and agree to all assessment instructions, marking schemes, and examination integrity rules. I am ready to begin my {durationMin}-minute timed assessment in full-screen mode.
              </span>
            </label>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Return to Student Dashboard
              </button>

              <button
                type="button"
                disabled={!agreedToTerms}
                onClick={handleBeginQuiz}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Begin Assessment (Enter Fullscreen)</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Active Quiz Examination Workspace (Full-Screen Viewport Lockdown)
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto w-screen h-screen">
      {/* Resumed / Escape Lockdown Overlay (Shown ONLY when candidate hits Escape key) */}
      {showEscapeLockdownOverlay && !isCompleted && (
        <div
          onClick={resumeFullscreenFromOverlay}
          className="fixed inset-0 z-[100] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer select-none animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              resumeFullscreenFromOverlay();
            }}
            className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-200"
          >
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center shadow-inner">
              <Maximize className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-mono">
                Active Timed Assessment
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100">
                Fullscreen Exam Lockdown
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your timed assessment is in progress. Examination security protocol requires full-screen mode at all times until final submission.
              </p>
            </div>

            <button
              type="button"
              onClick={resumeFullscreenFromOverlay}
              className="w-full py-3 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <Maximize className="w-4 h-4" />
              <span>Click Anywhere to Resume Fullscreen</span>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4">

      {/* Top Exam Header: Only Title and Timer */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm('Exiting now will abandon current quiz progress. Are you sure you wish to return to dashboard?')) {
                  cleanStoredSessions();
                  exitFullscreen();
                  onBack();
                }
              }}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
              title="Return to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{quizTitle}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  LIVE SECURE SESSION
                </span>
              </h2>
              <div className="text-[11px] text-slate-500">
                Candidate: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span> ({currentUser.instituteName})
              </div>
            </div>
          </div>

          {/* Top Controls: Single authoritative timer display (no confusing finish button, no manual fullscreen toggle) */}
          <div className="flex items-center gap-2.5">
            {tabSwitchCount > 0 && (
              <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{tabSwitchCount} Tab Flags</span>
              </div>
            )}

            {/* Live Countdown Timer */}
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-sm border shadow-xs ${
                secondsRemaining <= 120
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-600 dark:text-rose-400 animate-pulse'
                  : 'bg-slate-900 dark:bg-slate-800 border-slate-700 text-amber-400'
              }`}
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Question Stats */}
        <div className="pt-1 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{answeredCount} of {questions.length} Answered ({progressPercent}%)</span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tab Switch Warning Modal Banner */}
      {tabWarning && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Security Protocol Warning:</strong> You navigated away from the quiz window. All focus losses and window switches are logged for jury audit.
            </span>
          </div>
          <button
            onClick={() => setTabWarning(false)}
            className="text-[11px] font-bold underline shrink-0 cursor-pointer ml-3"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        {/* Left: Active Question Card */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
          
          {/* Question Metadata Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                Question {currentIndex + 1} of {questions.length}
              </span>

              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold border border-amber-300/40">
                {currentQ?.category || 'General Business'}
              </span>
              <span className="text-[11px] text-slate-400">
                Difficulty: {currentQ?.difficulty || 'Standard'}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">+{currentQ?.marks || 4} marks</span>
              {config.r1NegativeMarking && (
                <span className="text-rose-600 dark:text-rose-400">-{currentQ?.negativeMarks || 0} penalty</span>
              )}
            </div>
          </div>

          {/* Caselet Box if applicable */}
          {currentQ?.caseletSnippet && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
              <strong>EXHIBIT / CASELET:</strong> {currentQ.caseletSnippet}
            </div>
          )}

          {/* Question Text */}
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            {currentQ?.questionText}
          </div>

          {/* Options List */}
          <div className="space-y-2.5 pt-2">
            {(currentQ?.options || []).map((opt, optIdx) => {
              const isSelected = answers[currentQ.id] === optIdx;
              const optionLetters = ['A', 'B', 'C', 'D', 'E'];

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm font-medium transition-all flex items-start gap-3 cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/80 dark:bg-amber-950/40 text-slate-900 dark:text-slate-100 shadow-xs ring-1 ring-amber-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600'
                  }`}>
                    {optionLetters[optIdx] || optIdx + 1}
                  </span>
                  <span className="leading-relaxed flex-1">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Nav Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMarkForReview}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-colors cursor-pointer ${
                  markedForReview.includes(currentQ?.id)
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedForReview.includes(currentQ?.id) ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {answers[currentQ?.id] !== undefined && (
                <button
                  onClick={clearCurrentAnswer}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Previous
              </button>
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition cursor-pointer"
                >
                  Next Question
                </button>
              ) : (
                <button
                  disabled
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 cursor-default"
                >
                  End of Questions
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Right: Question Navigation Palette */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Question Palette
            </h3>
            <span className="text-[11px] text-slate-400 font-mono font-semibold">
              {answeredCount}/{questions.length} Solved
            </span>
          </div>

          {/* Palette Legend */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 pt-1 pb-2 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-500" />
              <span>Review</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-200 dark:bg-slate-700" />
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded border border-amber-500" />
              <span>Current</span>
            </div>
          </div>

          {/* Buttons Grid - pt-2 pb-2 px-1 ensures top borders and focus rings are never cut off */}
          <div className="grid grid-cols-5 gap-2 pt-2 pb-2 px-1">
            {/* Header for Core Scored questions */}
            {questions.length > 25 && (
              <div className="col-span-5 pb-0.5">
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-0.5">
                  Core Scored (Q1–Q25)
                </div>
              </div>
            )}

            {questions.map((q, idx) => {
              const displayNum = q.orderIndex || q.qNo || (idx + 1);
              const isReserve = displayNum >= 26;
              const isAnswered = answers[q.id] !== undefined;
              const isMarked = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              if (isAnswered && isMarked) {
                btnClass = 'bg-amber-500 text-white font-bold border-amber-600';
              } else if (isAnswered) {
                btnClass = isReserve
                  ? 'bg-amber-600 text-white font-bold border-amber-700'
                  : 'bg-emerald-600 text-white font-bold border-emerald-700';
              } else if (isMarked) {
                btnClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-400';
              } else if (isReserve) {
                btnClass = 'bg-amber-50/60 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40';
              }

              return (
                <React.Fragment key={q.id}>

                  <button
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer ${btnClass} ${
                      isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* Single Authoritative Submit Action Button */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Final Test</span>
            </button>
          </div>

        </div>

      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          5. Submit Confirmation Modal (With Live Countdown Timer)
      ───────────────────────────────────────────────────────────────────────────── */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Submit Round 1 Assessment?
                </h3>
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Live Timer In Modal (Photo 4) */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              secondsRemaining <= 120
                ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span className="text-xs font-bold">Remaining Exam Time:</span>
              </div>
              <span className="font-mono font-black text-sm px-2.5 py-0.5 rounded-lg bg-white/90 dark:bg-slate-800/90 border border-amber-200/50 dark:border-amber-800/50">
                {formatTime(secondsRemaining)}
              </span>
            </div>

            {/* Assessment Response Summary */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-semibold block">Answered</span>
                <span className="text-xl font-black text-emerald-700 dark:text-emerald-300">{answeredCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40">
                <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-semibold block">Review</span>
                <span className="text-xl font-black text-amber-700 dark:text-amber-300">{markedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Unanswered</span>
                <span className="text-xl font-black text-slate-700 dark:text-slate-300">{unansweredCount}</span>
              </div>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed space-y-1">
              {secondsRemaining > 180 ? (
                <p className="text-amber-700 dark:text-amber-400 font-medium">
                  💡 You still have ample time left ({Math.floor(secondsRemaining / 60)}m {secondsRemaining % 60}s). You can return to the quiz to review or revise your answers before concluding.
                </p>
              ) : null}
              <p>
                Once you confirm final submission, your answers will be locked in the national ranking register. Retakes are strictly prohibited.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Back to Quiz (Review)
              </button>
              <button
                type="button"
                onClick={confirmFinalSubmit}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      </div>
    </div>
  );
};
