import React, { useState, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizQuestion, QuizAttempt } from '../../types';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  HelpCircle,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizTakerProps {
  onBack: () => void;
}

export const QuizTaker: React.FC<QuizTakerProps> = ({ onBack }) => {
  const { questions, submitQuiz, currentUser, config } = useCompetition();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [tabWarning, setTabWarning] = useState(false);
  
  const totalDurationSeconds = (config.r1DurationMinutes || 45) * 60;
  const [secondsRemaining, setSecondsRemaining] = useState(totalDurationSeconds);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalAttempt, setFinalAttempt] = useState<QuizAttempt | null>(null);

  // Tab switch anti-cheat monitoring
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !isCompleted) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          setTabWarning(true);
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isCompleted]);

  // Countdown timer
  useEffect(() => {
    if (isCompleted) return;
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
  }, [isCompleted, answers, markedForReview]);

  const handleAutoSubmit = () => {
    const attempt = submitQuiz(answers, markedForReview, totalDurationSeconds - secondsRemaining, tabSwitchCount);
    setFinalAttempt(attempt);
    setIsCompleted(true);
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
  };

  const handleManualSubmit = () => {
    const answeredCount = Object.keys(answers).length;
    const confirmMsg = `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit your Round 1 Quiz?`;
    if (window.confirm(confirmMsg)) {
      const attempt = submitQuiz(answers, markedForReview, totalDurationSeconds - secondsRemaining, tabSwitchCount);
      setFinalAttempt(attempt);
      setIsCompleted(true);
      if (attempt.score >= config.r1CutoffScore) {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }
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

  // Result Screen after Quiz completion
  if (isCompleted && finalAttempt) {
    const isPassed = finalAttempt.score >= config.r1CutoffScore;

    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-10 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-inner ${
            isPassed
              ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600'
              : 'bg-amber-100 dark:bg-amber-950/50 text-amber-600'
          }`}>
            {isPassed ? <Award className="w-9 h-9" /> : <Clock className="w-9 h-9" />}
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Round 1: Online Business & Management Quiz Completed
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1" style={{ fontFamily: 'Cinzel, serif' }}>
              {isPassed ? 'Congratulations! You Have Qualified' : 'Quiz Submission Recorded'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-md mx-auto">
              {isPassed
                ? 'Your score meets the AIMA-ICRC Round 2 qualification threshold. Your team is officially cleared for Case Deck Submission.'
                : 'Thank you for participating. Your attempt timestamp and analytical scores have been logged in the national ranking register.'}
            </p>
          </div>

          {/* Score Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Score</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">{finalAttempt.score}%</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">
                Cutoff: {config.r1CutoffScore}%
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Analytical / DI Score</span>
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{finalAttempt.analyticalScore} pts</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tie-Breaker Primary</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Time Taken</span>
              <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                {Math.floor(finalAttempt.timeTakenSeconds / 60)}m {finalAttempt.timeTakenSeconds % 60}s
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Of {config.r1DurationMinutes} mins</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Integrity Flags</span>
              <span className={`text-2xl font-black ${finalAttempt.tabSwitchCount === 0 ? 'text-emerald-600' : 'text-amber-500'}`}>
                {finalAttempt.tabSwitchCount}
              </span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Tab Switches</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
            >
              Return to Student Dashboard
            </button>
          </div>

        </div>
      </div>
    );
  }

  // Active Quiz Interface
  return (
    <div className="max-w-6xl mx-auto p-3 sm:p-6 space-y-4">
      
      {/* Top Exam Header */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (window.confirm('Exiting now will abandon current quiz progress. Are you sure?')) {
                onBack();
              }
            }}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>AIMA-ICRC Round 1 Assessment</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                LIVE SECURE SESSION
              </span>
            </h2>
            <div className="text-[11px] text-slate-500">
              Candidate: <span className="font-semibold text-slate-700 dark:text-slate-300">{currentUser.name}</span> ({currentUser.instituteName})
            </div>
          </div>
        </div>

        {/* Timer & Integrity Alerts */}
        <div className="flex items-center gap-3">
          {tabSwitchCount > 0 && (
            <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{tabSwitchCount} Tab Switch Alerts</span>
            </div>
          )}

          <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono font-bold text-sm border shadow-xs ${
            secondsRemaining < 300
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-400 text-rose-600 dark:text-rose-400 animate-pulse'
              : 'bg-slate-900 dark:bg-slate-800 border-slate-700 text-amber-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleManualSubmit}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish Quiz</span>
          </button>
        </div>
      </div>

      {/* Tab Switch Warning Modal Banner */}
      {tabWarning && (
        <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600" />
            <span>
              <strong>Security Protocol Warning:</strong> You navigated away from the quiz window. All focus losses and window switches are immutably logged for jury audit.
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
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 font-semibold border border-amber-300/40">
                {currentQ.category}
              </span>
              <span className="text-[11px] text-slate-400">
                Difficulty: {currentQ.difficulty}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400">+{currentQ.marks} marks</span>
              {config.r1NegativeMarking && (
                <span className="text-rose-600 dark:text-rose-400">-{currentQ.negativeMarks} penalty</span>
              )}
            </div>
          </div>

          {/* Caselet Box if applicable */}
          {currentQ.caseletSnippet && (
            <div className="p-3.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-xs text-slate-800 dark:text-slate-200 font-mono leading-relaxed">
              <strong>EXHIBIT / CASELET:</strong> {currentQ.caseletSnippet}
            </div>
          )}

          {/* Question Text */}
          <div className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
            {currentQ.questionText}
          </div>

          {/* Options List */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, optIdx) => {
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
                  markedForReview.includes(currentQ.id)
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{markedForReview.includes(currentQ.id) ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              {answers[currentQ.id] !== undefined && (
                <button
                  onClick={clearCurrentAnswer}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 cursor-pointer"
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
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-800 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={currentIndex === questions.length - 1}
                onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 hover:opacity-90 cursor-pointer"
              >
                Next Question
              </button>
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
              {Object.keys(answers).length}/{questions.length} Solved
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

          {/* Buttons Grid */}
          <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isMarked = markedForReview.includes(q.id);
              const isCurrent = currentIndex === idx;

              let btnClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              if (isAnswered && isMarked) {
                btnClass = 'bg-amber-500 text-white font-bold border-amber-600';
              } else if (isAnswered) {
                btnClass = 'bg-emerald-600 text-white font-bold border-emerald-700';
              } else if (isMarked) {
                btnClass = 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-400';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-8 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer ${btnClass} ${
                    isCurrent ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900 scale-105' : ''
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleManualSubmit}
              className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Final Test</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
