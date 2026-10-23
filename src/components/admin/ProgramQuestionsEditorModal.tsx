import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizProgram, QuizQuestion } from '../../types';
import { toTitleCase } from '../../lib/formatters';
import { MASTER_QUIZ_CATEGORIES } from './QuizQuestionBankManager';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  Sparkles,
  Search,
  Database,
  Save,
  HelpCircle,
  FileText,
  AlertCircle,
  Check,
  Edit2,
  ListOrdered,
  BookOpen,
  Filter,
  Layers,
  Zap,
} from 'lucide-react';

interface ProgramQuestionsEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  program: QuizProgram | null;
}

export const ProgramQuestionsEditorModal: React.FC<ProgramQuestionsEditorModalProps> = ({
  isOpen,
  onClose,
  program,
}) => {
  const {
    questions: allBankQuestions = [],
    programQuestionMappings,
    setProgramQuestions,
    createAndAssignQuestionToProgram,
    updateQuizProgram,
  } = useCompetition();

  // Local assigned questions state
  const [assignedQuestions, setAssignedQuestions] = useState<QuizQuestion[]>([]);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [showAutoFillConfirm, setShowAutoFillConfirm] = useState(false);

  // Bank Picker Drawer / Modal state
  const [isBankPickerOpen, setIsBankPickerOpen] = useState(false);
  const [bankSearch, setBankSearch] = useState('');
  const [bankCategoryFilter, setBankCategoryFilter] = useState('all');
  const [bankDifficultyFilter, setBankDifficultyFilter] = useState('all');
  const [selectedBankIds, setSelectedBankIds] = useState<string[]>([]);

  // Inline New Question Composer state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newCaseletSnippet, setNewCaseletSnippet] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState(0);
  const [newMarks, setNewMarks] = useState(4);
  const [newNegativeMarks, setNewNegativeMarks] = useState(1);
  const [newCategory, setNewCategory] = useState<string>('Corporate Strategy & Management');
  const [newDifficulty, setNewDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [newExplanation, setNewExplanation] = useState('');
  const [composerError, setComposerError] = useState('');

  // Sync assigned questions when modal opens or program changes
  useEffect(() => {
    if (isOpen && program) {
      const qIds = programQuestionMappings[program.id] || [];
      const qMap = new Map(allBankQuestions.map(q => [q.id, q]));
      const matched = qIds.map(id => qMap.get(id)).filter(Boolean) as QuizQuestion[];

      // Strictly load assigned questions without silent auto-fill fallback
      setAssignedQuestions(matched);

      setNewMarks(program.marksPerQuestion || 4);
      setNewNegativeMarks(program.negativeMarksPerQuestion ?? 1);
      setNewCategory(program.category || 'Corporate Strategy & Management');
      setIsAddingNew(false);
      setNewCaseletSnippet('');
      setIsBankPickerOpen(false);
      setShowAutoFillConfirm(false);
      setFeedback(null);
    }
  }, [isOpen, program?.id]);

  const targetQuestions = program?.totalQuestions || 25;
  const targetMarks = program?.totalMarks || 100;
  const isTargetQuestionsMet = assignedQuestions.length >= targetQuestions;

  // Accurate calculation of unassigned questions in bank
  const assignedIdSet = useMemo(() => new Set(assignedQuestions.map(q => q.id)), [assignedQuestions]);
  const availableUnassignedBank = useMemo(
    () => allBankQuestions.filter(q => !assignedIdSet.has(q.id)),
    [allBankQuestions, assignedIdSet]
  );
  const neededSlots = Math.max(0, targetQuestions - assignedQuestions.length);
  const autoFillCount = Math.min(neededSlots, availableUnassignedBank.length);

  const totalCalculatedMarks = assignedQuestions.reduce(
    (sum, q) => sum + (Number(q.marks) || program?.marksPerQuestion || 4),
    0
  );
  const isTargetMarksMet = totalCalculatedMarks === targetMarks;

  // Question reordering
  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    setAssignedQuestions(prev => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === assignedQuestions.length - 1) return;
    setAssignedQuestions(prev => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated;
    });
  };

  const handleRemoveQuestion = (id: string) => {
    setAssignedQuestions(prev => prev.filter(q => q.id !== id));
  };

  // Smart Auto-Fill from Bank (Staged locally, only saved on "Save & Synchronize Quiz")
  const handleSmartAutoFill = () => {
    if (!program) return;
    const assignedIds = new Set(assignedQuestions.map(q => q.id));
    const unassigned = allBankQuestions.filter(q => !assignedIds.has(q.id));

    if (unassigned.length === 0) {
      setFeedback({ msg: 'All questions in the question bank are already assigned.', type: 'error' });
      return;
    }

    const cat = (program.category || '').toLowerCase();
    const matchingCat = unassigned.filter(
      q => q.category.toLowerCase().includes(cat) || cat.includes(q.category.toLowerCase())
    );
    const otherCat = unassigned.filter(
      q => !q.category.toLowerCase().includes(cat) && !cat.includes(q.category.toLowerCase())
    );
    const pool = [...matchingCat, ...otherCat];

    const needed = Math.max(0, targetQuestions - assignedQuestions.length);
    const toAdd = pool.slice(0, needed);

    if (toAdd.length === 0) {
      setFeedback({ msg: 'Target question limit has already been reached.', type: 'error' });
      return;
    }

    setAssignedQuestions(prev => [...prev, ...toAdd]);
    setShowAutoFillConfirm(false);
    setFeedback({
      msg: `Smart auto-fill staged ${toAdd.length} question(s) from the bank. Click "Save & Synchronize Quiz" to apply changes.`,
      type: 'success',
    });
  };

  // Import Selected Bank Questions
  const handleImportSelectedFromBank = () => {
    const selected = allBankQuestions.filter(q => selectedBankIds.includes(q.id));
    const existingIds = new Set(assignedQuestions.map(q => q.id));
    const fresh = selected.filter(q => !existingIds.has(q.id));

    setAssignedQuestions(prev => [...prev, ...fresh]);
    setSelectedBankIds([]);
    setIsBankPickerOpen(false);
    setFeedback({ msg: `Imported ${fresh.length} questions from Question Bank.`, type: 'success' });
  };

  // Create New Question Inline
  const handleCreateNewQuestion = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setComposerError('');

    if (!newQuestionText.trim()) {
      setComposerError('Question text cannot be empty.');
      return;
    }
    if (!optionA.trim() || !optionB.trim() || !optionC.trim() || !optionD.trim()) {
      setComposerError('All 4 options (A, B, C, D) are required.');
      return;
    }

    setSaving(true);
    try {
      const newQ: Omit<QuizQuestion, 'id'> = {
        questionText: newQuestionText.trim(),
        caseletSnippet: newCaseletSnippet.trim() || undefined,
        options: [optionA.trim(), optionB.trim(), optionC.trim(), optionD.trim()],
        correctAnswerIndex,
        marks: Number(newMarks) || 4,
        negativeMarks: Number(newNegativeMarks) || 1,
        difficulty: newDifficulty,
        category: newCategory as any,
        explanation: newExplanation.trim() || undefined,
        isActive: true,
      };

      const created = await createAndAssignQuestionToProgram(program.id, newQ);
      if (created) {
        setAssignedQuestions(prev => [...prev, created]);
        setIsAddingNew(false);
        setNewQuestionText('');
        setNewCaseletSnippet('');
        setOptionA('');
        setOptionB('');
        setOptionC('');
        setOptionD('');
        setNewExplanation('');
        setFeedback({ msg: 'New question created, automatically saved to the Question Bank, and linked to this quiz!', type: 'success' });
      }
    } catch (err: any) {
      setComposerError('Failed to save question: ' + err?.message);
    } finally {
      setSaving(false);
    }
  };

  // Save all questions and sync to Supabase
  const handleSaveAndSync = async () => {
    setSaving(true);
    try {
      const qIds = assignedQuestions.map(q => q.id);
      await setProgramQuestions(program.id, qIds);

      // Sync actual total marks and passing marks from questions sum
      const finalSum = assignedQuestions.reduce((sum, q) => sum + (Number(q.marks) || 4), 0);
      const cutoffPct = program.cutoffScore ?? 65;
      const derivedPassing = Math.round(finalSum * (cutoffPct / 100));
      updateQuizProgram(program.id, {
        totalMarks: finalSum > 0 ? finalSum : program.totalMarks,
        passingMarks: derivedPassing,
      });

      setFeedback({ msg: 'Quiz questions saved and synchronized successfully!', type: 'success' });
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setFeedback({ msg: 'Failed to save questions: ' + err?.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Filter bank questions for Bank Picker
  const existingAssignedIds = new Set(assignedQuestions.map(q => q.id));
  const availableBankQuestions = allBankQuestions.filter(q => {
    const matchesSearch =
      !bankSearch.trim() ||
      q.questionText.toLowerCase().includes(bankSearch.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(bankSearch.toLowerCase()));

    const matchesCategory =
      bankCategoryFilter === 'all' ||
      q.category.toLowerCase() === bankCategoryFilter.toLowerCase();

    const matchesDifficulty =
      bankDifficultyFilter === 'all' ||
      q.difficulty.toLowerCase() === bankDifficultyFilter.toLowerCase();

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  if (!isOpen || !program) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div
        className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[94vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* SLIDING 2-PANEL CONTAINER (500ms EASE-IN-OUT TRANSITION) */}
        <div
          className={`flex w-[200%] h-full max-h-[94vh] transition-transform duration-500 ease-in-out ${
            isAddingNew ? '-translate-x-1/2' : 'translate-x-0'
          }`}
        >
          {/* ========================================================================= */}
          {/* PANEL 1: PROGRAM QUESTIONS MANAGER (ASSIGNED QUESTIONS)                  */}
          {/* ========================================================================= */}
          <div
            className="w-1/2 h-full flex flex-col max-h-[94vh] overflow-hidden shrink-0"
            aria-hidden={isAddingNew}
          >
            {/* HEADER BAR */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                  <ListOrdered className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      {program.code}
                    </span>
                    <h2 className="text-base font-black text-slate-900 dark:text-white truncate max-w-md">
                      {toTitleCase(program.title)}
                    </h2>
                    {program.category && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300">
                        {program.category}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Curate, reorder, or import questions specific to this screening program.
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* METRICS & ACTION TOOLBAR */}
            <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
              {/* Live Capacity Indicators */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Questions:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-lg border text-xs ${
                      isTargetQuestionsMet
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {assignedQuestions.length} / {targetQuestions}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 font-medium">Total Marks:</span>
                  <span
                    className={`font-black px-2 py-0.5 rounded-lg border text-xs ${
                      isTargetMarksMet
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {totalCalculatedMarks} / {targetMarks} pts
                  </span>
                </div>
              </div>

              {/* Action Buttons with Rich Tooltips */}
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <button
                    onClick={() => setIsBankPickerOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Browse Question Bank to pick individual questions"
                  >
                    <Database className="w-3.5 h-3.5 text-blue-500" />
                    <span>Import from Bank ({allBankQuestions.length})</span>
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl pointer-events-none z-50 text-center border border-slate-700">
                    Browse the Question Bank to filter, search, and select specific questions to import into this quiz.
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => {
                      if (autoFillCount > 0) {
                        setShowAutoFillConfirm(true);
                      }
                    }}
                    disabled={saving || isTargetQuestionsMet || autoFillCount === 0}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      isTargetQuestionsMet || autoFillCount === 0
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-700'
                        : 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 border border-purple-200 dark:border-purple-800'
                    }`}
                    title="Automatically fill remaining slots with matching questions from the bank"
                  >
                    <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Smart Auto-Fill ({autoFillCount})</span>
                  </button>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl pointer-events-none z-50 text-center border border-slate-700">
                    {availableUnassignedBank.length === 0
                      ? `All ${allBankQuestions.length} questions in the bank are already assigned.`
                      : `Selects ${autoFillCount} question(s) from bank (${availableUnassignedBank.length} available, ${neededSlots} needed to reach ${targetQuestions}).`}
                  </div>
                </div>

                <div className="relative group">
                  <button
                    onClick={() => setIsAddingNew(true)}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
                    title="Compose a brand new question directly for this quiz"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New</span>
                  </button>
                  <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[10px] rounded-lg shadow-xl pointer-events-none z-50 text-center border border-slate-700">
                    Compose a new question. It will be automatically saved into the Question Bank and assigned to this quiz.
                  </div>
                </div>
              </div>
            </div>

            {/* ACCIDENTAL CLICK CONFIRMATION BANNER FOR SMART AUTO-FILL */}
            {showAutoFillConfirm && (
              <div className="p-3.5 bg-purple-50/90 dark:bg-purple-950/50 border-b border-purple-200 dark:border-purple-800 flex flex-wrap items-center justify-between gap-3 text-xs animate-in fade-in duration-150">
                <div className="flex items-center gap-2 text-purple-900 dark:text-purple-200 font-medium">
                  <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <span>
                    Smart Auto-Fill will stage <strong>{autoFillCount} available question(s)</strong> from the bank (preferring &quot;{program.category || 'General'}&quot;). Changes will be staged locally until you click &quot;Save & Synchronize Quiz&quot;. Proceed?
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAutoFillConfirm(false)}
                    className="px-3 py-1 rounded-lg border border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setShowAutoFillConfirm(false);
                      handleSmartAutoFill();
                    }}
                    className="px-3.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer shadow-sm"
                  >
                    Yes, Auto-Fill ({autoFillCount})
                  </button>
                </div>
              </div>
            )}

            {/* FEEDBACK BANNER */}
            {feedback && (
              <div
                className={`p-3 text-xs flex items-center justify-between border-b ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800'
                }`}
              >
                <span>{feedback.msg}</span>
                <button onClick={() => setFeedback(null)} className="cursor-pointer font-bold">×</button>
              </div>
            )}

            {/* MAIN BODY: ASSIGNED QUESTIONS LIST */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {assignedQuestions.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    No Questions Assigned to This Quiz Program
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Import existing questions from the Question Bank, click &quot;Smart Auto-Fill&quot;, or create new questions using the buttons above.
                  </p>
                  <div className="flex justify-center gap-2 pt-2">
                    <button
                      onClick={() => setIsBankPickerOpen(true)}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 cursor-pointer"
                    >
                      Import from Bank
                    </button>
                    <button
                      onClick={handleSmartAutoFill}
                      className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 cursor-pointer"
                    >
                      ⚡ Smart Auto-Fill
                    </button>
                  </div>
                </div>
              ) : (
                assignedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        {q.caseletSnippet && (
                          <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-800 dark:text-amber-200 text-[11px] font-mono leading-relaxed">
                            <strong className="font-bold text-amber-700 dark:text-amber-300">EXHIBIT:</strong> {q.caseletSnippet}
                          </div>
                        )}
                        <p className="text-xs font-bold text-slate-900 dark:text-white">
                          {q.questionText}
                        </p>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex items-center gap-1.5 truncate">
                              <span
                                className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center shrink-0 ${
                                  q.correctAnswerIndex === oIdx
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span className={`truncate ${q.correctAnswerIndex === oIdx ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : ''}`}>
                                {opt}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-1 flex-wrap text-[10px]">
                          <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                            {q.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold ${
                              q.difficulty === 'Easy'
                                ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                : q.difficulty === 'Hard'
                                ? 'bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400'
                                : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                            }`}
                          >
                            {q.difficulty}
                          </span>
                          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            <span className="text-[10px] text-slate-400 font-semibold">Marks:</span>
                            <input
                              type="number"
                              min="0.5"
                              step="0.5"
                              value={q.marks || 4}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setAssignedQuestions(prev => prev.map((item, i) => i === idx ? { ...item, marks: val } : item));
                              }}
                              className="w-12 text-xs font-bold text-slate-900 dark:text-white bg-transparent border-none p-0 focus:ring-0 text-center"
                              title="Click to adjust marks for this individual question"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Question Actions with Tooltips */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleMoveUp(idx)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Question Up in test sequence"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(idx)}
                        disabled={idx === assignedQuestions.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                        title="Move Question Down in test sequence"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleRemoveQuestion(q.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        title="Remove question from this quiz program"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* FOOTER BAR */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Assigned: <strong className="text-slate-900 dark:text-white">{assignedQuestions.length}</strong> questions • <strong className="text-slate-900 dark:text-white">{totalCalculatedMarks}</strong> marks
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAndSync}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Synchronizing...' : 'Save & Synchronize Quiz'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* PANEL 2: DEDICATED QUESTION COMPOSER VIEW                                 */}
          {/* ========================================================================= */}
          <div
            className="w-1/2 h-full flex flex-col max-h-[94vh] overflow-hidden shrink-0"
            aria-hidden={!isAddingNew}
          >
            {/* COMPOSER HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                  title="Return to questions list"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Questions</span>
                </button>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block" />
                <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      Create New Quiz Question
                    </h2>
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                      Target: {program.code}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Saved permanently into Question Bank and linked to <strong className="text-slate-700 dark:text-slate-300 font-semibold">{toTitleCase(program.title)}</strong>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                title="Cancel and return"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* COMPOSER FORM BODY */}
            <form
              id="composer-question-form"
              onSubmit={handleCreateNewQuestion}
              className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4"
            >
              {composerError && (
                <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{composerError}</span>
                </div>
              )}

              {/* Caselet Snippet */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Caselet Snippet / Business Exhibit (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Scenario, balance sheet, or financial data excerpt
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={newCaseletSnippet}
                  onChange={e => setNewCaseletSnippet(e.target.value)}
                  placeholder="e.g. Portfolio: ₹450 Cr | Vulnerability: Crop-loss dependent rural borrowers | Current Gross NPA: 3.4%"
                  className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newQuestionText}
                  onChange={e => setNewQuestionText(e.target.value)}
                  placeholder="e.g. Which strategic framework assesses competitive intensity through five industry forces?"
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { label: 'Option A', val: optionA, set: setOptionA, idx: 0 },
                  { label: 'Option B', val: optionB, set: setOptionB, idx: 1 },
                  { label: 'Option C', val: optionC, set: setOptionC, idx: 2 },
                  { label: 'Option D', val: optionD, set: setOptionD, idx: 3 },
                ].map(opt => (
                  <div key={opt.idx} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {opt.label}
                      </label>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer hover:text-red-600 dark:hover:text-red-400">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={correctAnswerIndex === opt.idx}
                          onChange={() => setCorrectAnswerIndex(opt.idx)}
                          className="text-red-600 focus:ring-red-500 cursor-pointer"
                        />
                        <span className={correctAnswerIndex === opt.idx ? 'text-red-600 dark:text-red-400 font-bold' : ''}>
                          Correct Answer
                        </span>
                      </label>
                    </div>
                    <input
                      type="text"
                      required
                      value={opt.val}
                      onChange={e => opt.set(e.target.value)}
                      placeholder={`Enter ${opt.label}...`}
                      className={`w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 ${
                        correctAnswerIndex === opt.idx
                          ? 'border-red-400 dark:border-red-600 ring-1 ring-red-400/30'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Marks</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={newMarks}
                    onChange={e => setNewMarks(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Negative Penalty</label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={newNegativeMarks}
                    onChange={e => setNewNegativeMarks(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Difficulty</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer truncate"
                  >
                    {MASTER_QUIZ_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Answer Explanation & Rationale */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Answer Explanation & Rationale
                </label>
                <textarea
                  rows={2}
                  value={newExplanation}
                  onChange={e => setNewExplanation(e.target.value)}
                  placeholder="Provide reference or theoretical explanation for why this answer is correct..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </form>

            {/* COMPOSER FOOTER */}
            <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="text-xs text-slate-500">
                Question will be created in Question Bank and automatically linked to this quiz.
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => handleCreateNewQuestion()}
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50 transition"
                >
                  <Check className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save to Bank & Link'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QUESTION BANK PICKER MODAL (OVERLAY) */}
        {isBankPickerOpen && (
          <div className="absolute inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-5 flex flex-col animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-500" />
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Import Questions from Question Bank
                </h3>
              </div>
              <button
                onClick={() => setIsBankPickerOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 py-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search question bank..."
                  value={bankSearch}
                  onChange={e => setBankSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={bankCategoryFilter}
                onChange={e => setBankCategoryFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="Corporate Strategy">Corporate Strategy</option>
                <option value="Management Concepts">Management Concepts</option>
                <option value="Economics & Policy">Economics & Policy</option>
                <option value="Sustainability & AI">Sustainability & AI</option>
                <option value="Finance & Marketing">Finance & Marketing</option>
                <option value="Business Awareness">Business Awareness</option>
                <option value="Data Interpretation">Data Interpretation</option>
              </select>

              <select
                value={bankDifficultyFilter}
                onChange={e => setBankDifficultyFilter(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                <option value="all">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Questions Selection List */}
            <div className="flex-1 overflow-y-auto space-y-2 py-2">
              {availableBankQuestions.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No matching questions found in question bank.
                </div>
              ) : (
                availableBankQuestions.map(q => {
                  const isAlreadyInQuiz = existingAssignedIds.has(q.id);
                  const isChecked = selectedBankIds.includes(q.id);

                  return (
                    <label
                      key={q.id}
                      className={`p-3 rounded-xl border flex items-start gap-3 transition cursor-pointer ${
                        isAlreadyInQuiz
                          ? 'opacity-40 bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isAlreadyInQuiz}
                        checked={isChecked}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedBankIds(prev => [...prev, q.id]);
                          } else {
                            setSelectedBankIds(prev => prev.filter(id => id !== q.id));
                          }
                        }}
                        className="mt-1 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {q.questionText}
                          </p>
                          {isAlreadyInQuiz && (
                            <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full shrink-0">
                              Already in Quiz
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-500">
                          <span>{q.category}</span>
                          <span>•</span>
                          <span>{q.difficulty}</span>
                          <span>•</span>
                          <span>{q.marks} pts</span>
                        </div>
                      </div>
                    </label>
                  );
                })
              )}
            </div>

            {/* Picker Footer */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                Selected: <strong className="text-slate-900 dark:text-white">{selectedBankIds.length}</strong> questions
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsBankPickerOpen(false)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportSelectedFromBank}
                  disabled={selectedBankIds.length === 0}
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Import ({selectedBankIds.length}) Questions</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
