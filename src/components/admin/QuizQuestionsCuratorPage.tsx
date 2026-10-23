import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizQuestion, QuizProgram } from '../../types';
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  BookOpen,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Save,
  RotateCcw,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet,
  Award,
  Layers,
  Clock,
  Target,
  ExternalLink,
  Info,
  Check,
  X
} from 'lucide-react';
import { upsertQuizQuestion } from '../../lib/supabase';

interface QuizQuestionsCuratorPageProps {
  onBack: () => void;
  programId?: string;
}

export const QuizQuestionsCuratorPage: React.FC<QuizQuestionsCuratorPageProps> = ({
  onBack,
  programId,
}) => {
  const {
    quizPrograms,
    questions: allBankQuestions = [],
    programQuestionMappings,
    setProgramQuestions,
    addAuditLog,
    createAndAssignQuestionToProgram,
  } = useCompetition();

  // Find target quiz program
  const targetProgram: QuizProgram | undefined = useMemo(() => {
    if (programId) {
      return quizPrograms.find(p => p.id === programId);
    }
    return (
      quizPrograms.find(p => p.status === 'live' || (p.status as any) === 'active') ||
      quizPrograms[0]
    );
  }, [quizPrograms, programId]);

  // Local state for assigned questions
  const [assignedQuestions, setAssignedQuestions] = useState<QuizQuestion[]>([]);
  const [initialQuestionsSnapshot, setInitialQuestionsSnapshot] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSectionFilter, setSelectedSectionFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<'all' | 'Main' | 'Reserve'>('all');

  // Toggle for all explanations
  const [allExplanationsExpanded, setAllExplanationsExpanded] = useState<boolean>(true);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // New Question Composer
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [composerForm, setComposerForm] = useState<{
    questionText: string;
    section: string;
    topic: string;
    questionType: 'Main' | 'Reserve';
    difficulty: 'Easy' | 'Medium' | 'Hard';
    category: any;
    marks: number;
    negativeMarks: number;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
    benchmarkStyle: string;
    source: string;
    caseletSnippet: string;
  }>({
    questionText: '',
    section: 'A. Management Theory (Conceptual)',
    topic: '',
    questionType: 'Main',
    difficulty: 'Medium',
    category: 'Management Concepts',
    marks: 4,
    negativeMarks: 0,
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    explanation: '',
    benchmarkStyle: 'Concept caselet',
    source: '–',
    caseletSnippet: '',
  });

  // Sync assigned questions when program or question bank updates
  useEffect(() => {
    if (targetProgram) {
      const qIds = programQuestionMappings[targetProgram.id] || [];
      const qMap = new Map(allBankQuestions.map(q => [q.id, q]));
      let matched = qIds.map(id => qMap.get(id)).filter(Boolean) as QuizQuestion[];

      // Fallback: if no mapping exists yet, use active bank questions sorted by qNo
      if (matched.length === 0 && allBankQuestions.length > 0) {
        matched = [...allBankQuestions].sort((a, b) => (a.qNo ?? 999) - (b.qNo ?? 999));
      }

      setAssignedQuestions(matched);
      setInitialQuestionsSnapshot(JSON.stringify(matched.map(q => ({ id: q.id, marks: q.marks }))));
    }
  }, [targetProgram?.id, programQuestionMappings, allBankQuestions]);

  // Track if changes have been made
  const hasUnsavedChanges = useMemo(() => {
    const current = JSON.stringify(assignedQuestions.map(q => ({ id: q.id, marks: q.marks })));
    return current !== initialQuestionsSnapshot && initialQuestionsSnapshot !== '';
  }, [assignedQuestions, initialQuestionsSnapshot]);

  // Metric computations
  const mainQuestions = useMemo(
    () => assignedQuestions.filter(q => (q.questionType || '').toLowerCase() !== 'reserve' && (q.qNo == null || q.qNo <= 25)),
    [assignedQuestions]
  );

  const reserveQuestions = useMemo(
    () => assignedQuestions.filter(q => (q.questionType || '').toLowerCase() === 'reserve' || (q.qNo != null && q.qNo > 25)),
    [assignedQuestions]
  );

  const totalMainMarks = useMemo(
    () => mainQuestions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0),
    [mainQuestions]
  );

  const totalReserveMarks = useMemo(
    () => reserveQuestions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0),
    [reserveQuestions]
  );

  // Group questions by section
  const sectionsList = useMemo(() => {
    const set = new Set<string>();
    assignedQuestions.forEach(q => {
      if (q.section) set.add(q.section);
    });
    return Array.from(set).sort();
  }, [assignedQuestions]);

  // Filtered questions
  const filteredQuestions = useMemo(() => {
    return assignedQuestions.filter(q => {
      if (selectedSectionFilter !== 'all' && q.section !== selectedSectionFilter) {
        return false;
      }
      if (selectedDifficultyFilter !== 'all' && q.difficulty !== selectedDifficultyFilter) {
        return false;
      }
      if (selectedTypeFilter !== 'all') {
        const isReserve = (q.questionType || '').toLowerCase() === 'reserve' || (q.qNo != null && q.qNo > 25);
        if (selectedTypeFilter === 'Reserve' && !isReserve) return false;
        if (selectedTypeFilter === 'Main' && isReserve) return false;
      }
      if (searchQuery.trim()) {
        const qText = (q.questionText || '').toLowerCase();
        const topic = (q.topic || '').toLowerCase();
        const section = (q.section || '').toLowerCase();
        const source = (q.source || '').toLowerCase();
        const benchmark = (q.benchmarkStyle || '').toLowerCase();
        const optionsText = (q.options || []).join(' ').toLowerCase();
        const s = searchQuery.toLowerCase();
        return (
          qText.includes(s) ||
          topic.includes(s) ||
          section.includes(s) ||
          source.includes(s) ||
          benchmark.includes(s) ||
          optionsText.includes(s)
        );
      }
      return true;
    });
  }, [assignedQuestions, selectedSectionFilter, selectedDifficultyFilter, selectedTypeFilter, searchQuery]);

  // Group filtered questions into sections for display
  const groupedDisplaySections = useMemo<Record<string, QuizQuestion[]>>(() => {
    const groups: Record<string, QuizQuestion[]> = {};
    filteredQuestions.forEach(q => {
      const secName = q.section || 'General Section';
      if (!groups[secName]) groups[secName] = [];
      groups[secName].push(q);
    });
    return groups;
  }, [filteredQuestions]);

  // Handle reorder
  const handleMoveUp = (globalIdx: number) => {
    if (globalIdx === 0) return;
    setAssignedQuestions(prev => {
      const copy = [...prev];
      const temp = copy[globalIdx - 1];
      copy[globalIdx - 1] = copy[globalIdx];
      copy[globalIdx] = temp;
      return copy;
    });
  };

  const handleMoveDown = (globalIdx: number) => {
    if (globalIdx === assignedQuestions.length - 1) return;
    setAssignedQuestions(prev => {
      const copy = [...prev];
      const temp = copy[globalIdx + 1];
      copy[globalIdx + 1] = copy[globalIdx];
      copy[globalIdx] = temp;
      return copy;
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setAssignedQuestions(prev => prev.filter(q => q.id !== id));
  };

  const handleMarksChange = (id: string, newMarks: number) => {
    setAssignedQuestions(prev =>
      prev.map(q => (q.id === id ? { ...q, marks: newMarks } : q))
    );
  };

  // Revert changes
  const handleRevert = () => {
    if (targetProgram) {
      const qIds = programQuestionMappings[targetProgram.id] || [];
      const qMap = new Map(allBankQuestions.map(q => [q.id, q]));
      let matched = qIds.map(id => qMap.get(id)).filter(Boolean) as QuizQuestion[];
      if (matched.length === 0 && allBankQuestions.length > 0) {
        matched = [...allBankQuestions].sort((a, b) => (a.qNo ?? 999) - (b.qNo ?? 999));
      }
      setAssignedQuestions(matched);
      setFeedback({ msg: 'Changes reverted to last saved state.', type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  // Save & Synchronize to Supabase
  const handleSaveAndSync = async () => {
    if (!targetProgram) return;
    setSaving(true);
    setFeedback(null);

    try {
      const questionIds = assignedQuestions.map(q => q.id);

      // 1. Update program question mappings in context & Supabase
      const success = await setProgramQuestions(targetProgram.id, questionIds);

      // 2. Persist any marks changes to Supabase quiz_questions
      for (const q of assignedQuestions) {
        await upsertQuizQuestion(q);
      }

      if (success) {
        setInitialQuestionsSnapshot(JSON.stringify(assignedQuestions.map(q => ({ id: q.id, marks: q.marks }))));
        addAuditLog(
          'Quiz Curriculum Synchronized',
          'Quiz Programs',
          `Curated and synchronized ${assignedQuestions.length} questions for program "${targetProgram.title}". Total Scored Marks: ${totalMainMarks} pts.`
        );
        setFeedback({
          msg: `Successfully synchronized all ${assignedQuestions.length} questions with live Supabase database!`,
          type: 'success',
        });
      } else {
        throw new Error('Could not persist question mapping to Supabase.');
      }
    } catch (err: any) {
      console.error('Save failed:', err);
      setFeedback({
        msg: err?.message || 'Error occurred while saving questions. Please try again.',
        type: 'error',
      });
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  // Toggle card expansion
  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : !allExplanationsExpanded,
    }));
  };

  const isCardExpanded = (id: string) => {
    if (expandedCards[id] !== undefined) return expandedCards[id];
    return allExplanationsExpanded;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors">
      {/* ==================== TOP NAVIGATION & BREADCRUMB ==================== */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 -ml-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 font-bold text-xs cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title="Return to Quiz Programs Roster"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quiz Programs</span>
            </button>

            <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50">
                  {targetProgram?.code || 'AIMA-CL26-S1-QZ'}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live in Supabase
                </span>
                <span className="text-[10px] text-slate-400 font-medium hidden sm:inline">
                  • 0 Negative Marking • 45m Duration
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {targetProgram?.title || 'Case Competition – Stage 1 Business Quiz'}
              </h1>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Expand / Collapse Toggle with Sleek Hover Tooltip */}
            <div className="relative group inline-block">
              <button
                onClick={() => {
                  const nextState = !allExplanationsExpanded;
                  setAllExplanationsExpanded(nextState);
                  const reset: Record<string, boolean> = {};
                  assignedQuestions.forEach(q => (reset[q.id] = nextState));
                  setExpandedCards(reset);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
                title="Toggle pedagogical explanations, discussion points, benchmark styles, and source citations for all questions across all sections"
              >
                {allExplanationsExpanded ? (
                  <>
                    <ChevronUp className="w-3.5 h-3.5" />
                    <span>Collapse Explanations</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Expand All Explanations</span>
                  </>
                )}
              </button>

              {/* Floating Sleek Dark Tooltip */}
              <div className="pointer-events-none absolute right-0 top-full mt-2 hidden group-hover:flex flex-col items-start w-64 p-2.5 bg-slate-900 text-white text-[11px] font-medium rounded-xl shadow-2xl border border-slate-700/80 z-50 animate-in fade-in duration-150">
                <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-0.5">
                  <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Explanations & Citations Toggle</span>
                </div>
                <span className="text-slate-300 leading-snug">
                  Toggle pedagogical explanations, discussion points, benchmark styles, and source citations for all questions across all sections.
                </span>
                {/* Arrow pointer */}
                <div className="absolute -top-1 right-6 w-2 h-2 bg-slate-900 border-t border-l border-slate-700/80 rotate-45" />
              </div>
            </div>

            <button
              onClick={() => setIsComposerOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm hover:shadow-md"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Question</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================== HERO KPI METRICS BANNER (3 DYNAMIC CARDS FROM DB) ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Card 1: Main Scored Questions */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Main Scored Questions</span>
                <BookOpen className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {mainQuestions.length}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / {targetProgram?.totalQuestions ?? 25} target
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                Sections A–E (Conceptual to Case)
              </span>
              <span className={`font-bold ${mainQuestions.length >= (targetProgram?.totalQuestions ?? 25) ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {mainQuestions.length >= (targetProgram?.totalQuestions ?? 25) ? '✓ Full Quota Met' : `${(targetProgram?.totalQuestions ?? 25) - mainQuestions.length} Needed`}
              </span>
            </div>
          </div>

          {/* Card 2: Reserve / Tie-Breakers */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-amber-200/80 dark:border-amber-900/40 shadow-xs bg-amber-500/5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-amber-800 dark:text-amber-300">Tie-Breaker Reserve</span>
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                  {reserveQuestions.length}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  questions (+{totalReserveMarks} pts pool)
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-[11px] text-amber-700 dark:text-amber-300 font-medium">
              <span>Section F (Q26–Q30)</span>
              <span className="font-bold">Score Tie-Breakers Only</span>
            </div>
          </div>

          {/* Card 3: Total Scored Marks & Passing Rule */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Main Scored Marks</span>
                <Target className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black ${totalMainMarks === (targetProgram?.totalMarks ?? 100) ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                  {totalMainMarks}
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  / {targetProgram?.totalMarks ?? 100} pts
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">
                +{targetProgram?.marksPerQuestion ?? 4}m / q • {targetProgram?.negativeMarking ? `-${targetProgram.negativeMarksPerQuestion} negative` : '0 negative'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {targetProgram?.cutoffScore ?? 60}% Pass ({targetProgram?.passingMarks ?? 60} pts)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== SECTION JUMP PILLS & SEARCH BAR ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          {/* Search & Quick Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across questions, topics, citations, theories (e.g. Porter, Herzberg, IPO, RBI)..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30 text-slate-900 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
              {/* Type Filter */}
              <select
                value={selectedTypeFilter}
                onChange={e => setSelectedTypeFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Types (Main + Reserve)</option>
                <option value="Main">Main Scored Only (Q1–Q25)</option>
                <option value="Reserve">Reserve Tie-Breakers Only (Q26–Q30)</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficultyFilter}
                onChange={e => setSelectedDifficultyFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Section Jump Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Sections:
            </span>

            <button
              onClick={() => setSelectedSectionFilter('all')}
              className={`px-3 py-1 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                selectedSectionFilter === 'all'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              All Sections ({assignedQuestions.length})
            </button>

            {sectionsList.map(sec => {
              const count = assignedQuestions.filter(q => q.section === sec).length;
              const isReserveSec = sec.toLowerCase().includes('reserve') || sec.toLowerCase().includes('tie-breaker') || sec.startsWith('F.');
              return (
                <button
                  key={sec}
                  onClick={() => setSelectedSectionFilter(sec)}
                  className={`px-3 py-1 rounded-xl font-bold transition shrink-0 flex items-center gap-1 cursor-pointer border ${
                    selectedSectionFilter === sec
                      ? isReserveSec
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-red-600 text-white border-red-700'
                      : isReserveSec
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 hover:bg-amber-100'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{sec}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10 dark:bg-white/10 font-black">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================== QUESTIONS LIST GROUPED BY SECTION ==================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-8">
        {Object.keys(groupedDisplaySections).length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No questions match your current filters</h3>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting a different section filter.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedSectionFilter('all');
                setSelectedDifficultyFilter('all');
                setSelectedTypeFilter('all');
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          Object.entries(groupedDisplaySections).map(([sectionName, sectionQuestions]: [string, QuizQuestion[]]) => {
            const isReserveSection =
              sectionName.toLowerCase().includes('reserve') ||
              sectionName.toLowerCase().includes('tie-breaker') ||
              sectionName.startsWith('F.');

            return (
              <section key={sectionName} className="space-y-4">
                {/* SECTION HEADER BANNER */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
                    isReserveSection
                      ? 'bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-900/60'
                      : 'bg-gradient-to-r from-slate-900/5 via-slate-900/0 to-transparent dark:from-slate-100/5 dark:via-slate-100/0 dark:to-transparent border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl font-black text-sm flex items-center justify-center shrink-0 shadow-xs ${
                        isReserveSection
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                      }`}
                    >
                      {sectionName.charAt(0) === 'S' && sectionName.charAt(8) ? sectionName.charAt(8) : sectionName.charAt(0)}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                          {sectionName}
                        </h2>
                        {isReserveSection && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                            Reserve Tie-Breakers
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {isReserveSection
                          ? 'These 5 questions are used exclusively when total main scores are tied. Unscored during standard evaluation.'
                          : 'Standard screening question block testing conceptual rigor and business judgment.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {sectionQuestions.length} Questions
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      {sectionQuestions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0)} Marks
                    </span>
                  </div>
                </div>

                {/* QUESTIONS IN THIS SECTION */}
                <div className="space-y-4">
                  {sectionQuestions.map((q) => {
                    const globalIdx = assignedQuestions.findIndex(item => item.id === q.id);
                    const isExpanded = isCardExpanded(q.id);
                    const isReserve = (q.questionType || '').toLowerCase() === 'reserve' || (q.qNo != null && q.qNo > 25);

                    return (
                      <article
                        key={q.id}
                        className={`rounded-2xl border transition shadow-xs hover:shadow-md ${
                          isReserve
                            ? 'bg-amber-500/5 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/50'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800'
                        }`}
                      >
                        {/* CARD TOP META BAR */}
                        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Sequence Badge */}
                            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono font-black text-xs">
                              Q{q.qNo || globalIdx + 1}
                            </span>

                            {/* Question Type */}
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                                isReserve
                                  ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                  : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                              }`}
                            >
                              {isReserve ? 'Reserve Tie-Breaker' : 'Main Scored Question'}
                            </span>

                            {/* Topic Tag */}
                            {q.topic && (
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60">
                                Topic: {q.topic}
                              </span>
                            )}

                            {/* Difficulty */}
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                q.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : q.difficulty === 'Hard'
                                  ? 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300'
                                  : 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                              }`}
                            >
                              {q.difficulty}
                            </span>

                            {/* Category */}
                            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              • {q.category}
                            </span>
                          </div>

                          {/* Marks & Reorder Actions */}
                          <div className="flex items-center gap-2">
                            {/* Marks Input */}
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
                              <span className="text-[10px] uppercase font-bold text-slate-400">Marks:</span>
                              <input
                                type="number"
                                min="0"
                                step="1"
                                value={q.marks || 4}
                                onChange={e => handleMarksChange(q.id, Number(e.target.value))}
                                className="w-10 text-center font-black text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0"
                                title="Edit marks for this question"
                              />
                              <span className="text-[10px] text-slate-400 font-semibold">(0 neg)</span>
                            </div>

                            {/* Move Up */}
                            <button
                              onClick={() => handleMoveUp(globalIdx)}
                              disabled={globalIdx === 0}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Question Up in Exam Order"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>

                            {/* Move Down */}
                            <button
                              onClick={() => handleMoveDown(globalIdx)}
                              disabled={globalIdx === assignedQuestions.length - 1}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-20 cursor-pointer"
                              title="Move Question Down in Exam Order"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>

                            {/* Remove Question */}
                            <button
                              onClick={() => {
                                if (confirm(`Remove question Q${q.qNo || globalIdx + 1} from this quiz?`)) {
                                  handleRemoveQuestion(q.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                              title="Remove Question"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* CARD BODY */}
                        <div className="p-4 sm:p-5 space-y-4">
                          {/* EXHIBIT / CASELET SNIPPET */}
                          {q.caseletSnippet && (
                            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200 text-xs leading-relaxed font-mono">
                              <strong className="font-bold text-amber-800 dark:text-amber-300 block mb-1">
                                CASELET EXHIBIT:
                              </strong>
                              {q.caseletSnippet}
                            </div>
                          )}

                          {/* QUESTION PROMPT */}
                          <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                            {q.questionText}
                          </div>

                          {/* 4 OPTIONS (A, B, C, D) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                            {q.options.map((opt, oIdx) => {
                              const isCorrect = q.correctAnswerIndex === oIdx;
                              const optionLetter = String.fromCharCode(65 + oIdx);

                              return (
                                <div
                                  key={oIdx}
                                  className={`p-3 rounded-xl border flex items-start gap-3 transition ${
                                    isCorrect
                                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-600/60 shadow-xs ring-1 ring-emerald-500/30'
                                      : 'bg-slate-50/80 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center shrink-0 mt-0.5 ${
                                      isCorrect
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {optionLetter}
                                  </span>

                                  <div className="flex-1 text-xs leading-relaxed">
                                    <div className="flex items-center gap-2">
                                      <span
                                        className={`${
                                          isCorrect
                                            ? 'text-emerald-950 dark:text-emerald-100 font-bold'
                                            : 'text-slate-700 dark:text-slate-300'
                                        }`}
                                      >
                                        {opt}
                                      </span>
                                      {isCorrect && (
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-0.5">
                                          <Check className="w-3 h-3 stroke-[3]" />
                                          Correct Key
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* TOGGLE EXPLANATION & CITATION ACCORDION */}
                          <div className="pt-2">
                            <button
                              onClick={() => toggleCard(q.id)}
                              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1.5 cursor-pointer py-1"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  <span>Hide Pedagogical Explanation & Citations</span>
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  <span>View Pedagogical Explanation & Citations</span>
                                </>
                              )}
                            </button>

                            {/* EXPANDED EXPLANATION & METADATA SECTION */}
                            {isExpanded && (
                              <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 space-y-3 animate-in fade-in duration-150">
                                {/* EXPLANATION & DISCUSSION POINTS */}
                                <div>
                                  <div className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1.5">
                                    <Info className="w-3.5 h-3.5 text-blue-500" />
                                    Explanation & Discussion Points:
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-serif">
                                    {q.explanation || 'No explanation provided in question bank.'}
                                  </p>
                                </div>

                                {/* BENCHMARK STYLE & CURRENT AFFAIRS CITATION */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                                  {q.benchmarkStyle && (
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                                        Benchmark Style:
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                        {q.benchmarkStyle}
                                      </span>
                                    </div>
                                  )}

                                  {q.source && (
                                    <div className="flex items-start gap-1.5">
                                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mt-0.5">
                                        Source & Citation:
                                      </span>
                                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                                        {q.source}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}
      </div>

      {/* ==================== STICKY FLOATING ACTION BAR ==================== */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-3.5 px-4 sm:px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Status Indicators */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-black text-slate-900 dark:text-white">
                {assignedQuestions.length} Total Questions
              </span>
              <span className="text-slate-400">
                ({mainQuestions.length} Main Scored • {reserveQuestions.length} Reserve)
              </span>
            </div>

            <div className="h-3 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />

            <div className="text-slate-600 dark:text-slate-300 font-semibold hidden md:block">
              Total Points: <strong className="text-slate-900 dark:text-white">{totalMainMarks}</strong> / 100 Main Marks
            </div>

            {hasUnsavedChanges && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-800">
                Unsaved Changes Staged
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {hasUnsavedChanges && (
              <button
                onClick={handleRevert}
                disabled={saving}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revert</span>
              </button>
            )}

            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleSaveAndSync}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synchronizing to Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save & Synchronize Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* FEEDBACK TOAST BANNER */}
        {feedback && (
          <div
            className={`mt-2 p-2.5 rounded-xl text-center text-xs font-bold transition animate-in fade-in ${
              feedback.type === 'success'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800'
            }`}
          >
            {feedback.msg}
          </div>
        )}
      </div>

      {/* ==================== CREATE QUESTION MODAL ==================== */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Add New Question to Quiz
                </h3>
                <p className="text-xs text-slate-500">
                  Fill in all forensic fields to preserve complete data parity with the Excel rubric.
                </p>
              </div>
              <button
                onClick={() => setIsComposerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[70vh] overflow-y-auto pr-1">
              <div>
                <label className="font-bold block mb-1">Question Prompt *</label>
                <textarea
                  rows={3}
                  value={composerForm.questionText}
                  onChange={e => setComposerForm({ ...composerForm, questionText: e.target.value })}
                  placeholder="Enter the full scenario or question prompt..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Section *</label>
                  <input
                    type="text"
                    value={composerForm.section}
                    onChange={e => setComposerForm({ ...composerForm, section: e.target.value })}
                    placeholder="e.g. A. Management Theory (Conceptual)"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Topic *</label>
                  <input
                    type="text"
                    value={composerForm.topic}
                    onChange={e => setComposerForm({ ...composerForm, topic: e.target.value })}
                    placeholder="e.g. Strategy – Porter's Generic Strategies"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Type</label>
                  <select
                    value={composerForm.questionType}
                    onChange={e => setComposerForm({ ...composerForm, questionType: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Main">Main Scored</option>
                    <option value="Reserve">Reserve Tie-Breaker</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Difficulty</label>
                  <select
                    value={composerForm.difficulty}
                    onChange={e => setComposerForm({ ...composerForm, difficulty: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Marks</label>
                  <input
                    type="number"
                    value={composerForm.marks}
                    onChange={e => setComposerForm({ ...composerForm, marks: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1.5">Options (Select radio for Correct Key) *</label>
                <div className="space-y-2">
                  {composerForm.options.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctKey"
                        checked={composerForm.correctAnswerIndex === i}
                        onChange={() => setComposerForm({ ...composerForm, correctAnswerIndex: i })}
                        className="cursor-pointer text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="font-bold text-xs w-6 text-slate-500">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={e => {
                          const opts = [...composerForm.options];
                          opts[i] = e.target.value;
                          setComposerForm({ ...composerForm, options: opts });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Explanation & Discussion Point</label>
                <textarea
                  rows={2}
                  value={composerForm.explanation}
                  onChange={e => setComposerForm({ ...composerForm, explanation: e.target.value })}
                  placeholder="Pedagogical rationale explaining why the correct key is right..."
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Benchmark Style</label>
                  <input
                    type="text"
                    value={composerForm.benchmarkStyle}
                    onChange={e => setComposerForm({ ...composerForm, benchmarkStyle: e.target.value })}
                    placeholder="e.g. Concept caselet"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Source Citation</label>
                  <input
                    type="text"
                    value={composerForm.source}
                    onChange={e => setComposerForm({ ...composerForm, source: e.target.value })}
                    placeholder="e.g. RBI press release / –"
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsComposerOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!composerForm.questionText.trim()) {
                    alert('Please enter question prompt text');
                    return;
                  }
                  if (composerForm.options.some(o => !o.trim())) {
                    alert('Please fill out all 4 options');
                    return;
                  }
                  if (!targetProgram) return;

                  const newQ: QuizQuestion = {
                    id: 'q_cc_custom_' + Date.now().toString(36),
                    qNo: assignedQuestions.length + 1,
                    section: composerForm.section,
                    topic: composerForm.topic,
                    questionType: composerForm.questionType,
                    benchmarkStyle: composerForm.benchmarkStyle,
                    source: composerForm.source,
                    questionText: composerForm.questionText,
                    options: composerForm.options,
                    correctAnswerIndex: composerForm.correctAnswerIndex,
                    marks: composerForm.marks,
                    negativeMarks: 0,
                    difficulty: composerForm.difficulty,
                    category: composerForm.category,
                    explanation: composerForm.explanation,
                    isActive: true,
                  };

                  setAssignedQuestions(prev => [...prev, newQ]);
                  setIsComposerOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Stage Question to Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
