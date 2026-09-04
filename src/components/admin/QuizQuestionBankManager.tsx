import React, { useState, useRef } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizQuestion } from '../../types';
import {
  BookOpen,
  Plus,
  Download,
  Upload,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  X,
  Trash2,
  FileText,
  Copy,
  Sparkles,
  HelpCircle,
  Eye
} from 'lucide-react';

export const QuizQuestionBankManager: React.FC = () => {
  const { questions, addQuestion, addQuestionsBulk, deleteQuestion } = useCompetition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  // Modals
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeQuestionPreview, setActiveQuestionPreview] = useState<QuizQuestion | null>(null);

  // Import State
  const [importMode, setImportMode] = useState<'upload' | 'paste'>('upload');
  const [rawPastedContent, setRawPastedContent] = useState('');
  const [parsedRows, setParsedRows] = useState<{
    valid: boolean;
    rowNumber: number;
    errorReason?: string;
    question?: Omit<QuizQuestion, 'id'>;
  }[]>([]);
  const [importedFileName, setImportedFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create Single Question Form State
  const [singleForm, setSingleForm] = useState<Omit<QuizQuestion, 'id'>>({
    category: 'Business Strategy',
    difficulty: 'Medium',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 4,
    negativeMarks: 1,
    explanation: '',
  });

  // Calculate distinct categories
  const categories = Array.from(new Set(questions.map(q => q.category))).filter(Boolean);

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesCat && matchesDiff;
  });

  // CSV Template Generator & Downloader
  const handleDownloadTemplate = () => {
    const csvHeaders = [
      'Category',
      'Difficulty',
      'QuestionText',
      'OptionA',
      'OptionB',
      'OptionC',
      'OptionD',
      'CorrectOption',
      'Marks',
      'NegativeMarks',
      'Explanation',
    ];

    const sampleRows = [
      [
        'Business Strategy',
        'Medium',
        'Which strategic framework assesses competitive intensity through five industry forces?',
        'Ansoff Matrix',
        "Porter's Five Forces",
        'BCG Growth-Share Matrix',
        'VRIO Framework',
        'B',
        '4',
        '1',
        "Michael Porter's Five Forces analyzes supplier power, buyer power, competitive rivalry, threat of substitution, and threat of new entry.",
      ],
      [
        'Financial Acumen',
        'Hard',
        'What is the formula for calculating Return on Invested Capital (ROIC)?',
        'Net Profit / Total Equity',
        'NOPAT / Invested Capital',
        'EBITDA / Total Debt',
        'Gross Margin / Operating Cost',
        'B',
        '4',
        '1',
        'ROIC equals Net Operating Profit After Tax (NOPAT) divided by Invested Capital (Total Debt + Equity - Cash).',
      ],
      [
        'Marketing & Consumer',
        'Easy',
        'The 4 Ps of the classical marketing mix model comprise Product, Price, Promotion, and which other component?',
        'People',
        'Process',
        'Place',
        'Packaging',
        'C',
        '4',
        '1',
        'E. Jerome McCarthy defined the original 4 Ps as Product, Price, Place, and Promotion.',
      ],
      [
        'Operations & Supply Chain',
        'Medium',
        'In lean manufacturing and Six Sigma, what does the term DOWNTIME categorize?',
        'Factory machine scheduled stoppage',
        'The 8 classic types of process waste',
        'Overtime compensation metrics',
        'Preventive maintenance intervals',
        'B',
        '4',
        '1',
        'DOWNTIME stands for Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, and Extra processing.',
      ],
      [
        'Technology & Analytics',
        'Medium',
        'In machine learning, what phenomenon occurs when a model fits training noise rather than generalizable patterns?',
        'Underfitting',
        'Data Drift',
        'Overfitting',
        'Gradient Clipping',
        'C',
        '4',
        '1',
        'Overfitting happens when a model learns the training data and noise too closely, leading to poor generalization on unseen test data.',
      ],
    ];

    const csvContent =
      '\uFEFF' + // UTF-8 BOM
      [
        csvHeaders.join(','),
        ...sampleRows.map(row =>
          row
            .map(field => {
              const str = String(field);
              if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
              }
              return str;
            })
            .join(',')
        ),
      ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'AIMA_ICL_Question_Bank_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Robust CSV Line Parser
  const parseCSVLine = (text: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char === '"') {
        if (inQuotes && text[i + 1] === '"') {
          current += '"';
          i++; // Skip escaped quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if ((char === ',' || char === '\t') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };

  // Process and validate CSV text
  const processCSVText = (content: string) => {
    setIsParsing(true);
    const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

    if (lines.length < 2) {
      setParsedRows([
        {
          valid: false,
          rowNumber: 1,
          errorReason: 'Spreadsheet has no data rows. Must contain headers plus at least one question row.',
        },
      ]);
      setIsParsing(false);
      return;
    }

    // Inspect headers
    const rawHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[\s_\-]/g, ''));

    // Map column indices
    const colIndex = {
      category: rawHeaders.findIndex(h => h.includes('cat')),
      difficulty: rawHeaders.findIndex(h => h.includes('diff')),
      questionText: rawHeaders.findIndex(h => h.includes('question') || h.includes('text') || h.includes('prompt')),
      optionA: rawHeaders.findIndex(h => h === 'optiona' || h === 'optiona' || h === 'a' || h === 'choice1'),
      optionB: rawHeaders.findIndex(h => h === 'optionb' || h === 'optionb' || h === 'b' || h === 'choice2'),
      optionC: rawHeaders.findIndex(h => h === 'optionc' || h === 'optionc' || h === 'c' || h === 'choice3'),
      optionD: rawHeaders.findIndex(h => h === 'optiond' || h === 'optiond' || h === 'd' || h === 'choice4'),
      correctOption: rawHeaders.findIndex(
        h => h.includes('correct') || h.includes('answer') || h.includes('solution')
      ),
      marks: rawHeaders.findIndex(h => h.includes('mark') && !h.includes('neg')),
      negativeMarks: rawHeaders.findIndex(h => h.includes('neg')),
      explanation: rawHeaders.findIndex(h => h.includes('expl') || h.includes('rationale')),
    };

    // If standard indices didn't match header by name, fallback to standard position: 0=Cat, 1=Diff, 2=Q, 3=A, 4=B, 5=C, 6=D, 7=Correct, 8=Marks, 9=Neg, 10=Expl
    const getCol = (cells: string[], mappedIdx: number, defaultIdx: number): string => {
      if (mappedIdx !== -1 && cells[mappedIdx] !== undefined) return cells[mappedIdx];
      if (cells[defaultIdx] !== undefined) return cells[defaultIdx];
      return '';
    };

    const results: typeof parsedRows = [];

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCSVLine(lines[i]);
      if (cells.length < 5) continue; // skip blank trailing row

      const category = getCol(cells, colIndex.category, 0) || 'Business Strategy';
      const difficultyRaw = getCol(cells, colIndex.difficulty, 1) || 'Medium';
      const questionText = getCol(cells, colIndex.questionText, 2);
      const optA = getCol(cells, colIndex.optionA, 3);
      const optB = getCol(cells, colIndex.optionB, 4);
      const optC = getCol(cells, colIndex.optionC, 5);
      const optD = getCol(cells, colIndex.optionD, 6);
      const correctRaw = getCol(cells, colIndex.correctOption, 7).toUpperCase().trim();
      const marksRaw = getCol(cells, colIndex.marks, 8);
      const negMarksRaw = getCol(cells, colIndex.negativeMarks, 9);
      const explanation = getCol(cells, colIndex.explanation, 10);

      // Validation logic
      if (!questionText || questionText.trim().length < 5) {
        results.push({
          valid: false,
          rowNumber: i + 1,
          errorReason: 'Question text is empty or too short (minimum 5 characters).',
        });
        continue;
      }

      if (!optA || !optB || !optC || !optD) {
        results.push({
          valid: false,
          rowNumber: i + 1,
          errorReason: 'All 4 options (Option A, B, C, D) must be provided.',
        });
        continue;
      }

      // Convert CorrectOption to index (0, 1, 2, 3)
      let correctIdx = -1;
      if (correctRaw === 'A' || correctRaw === '1' || correctRaw === 'OPTION A') correctIdx = 0;
      else if (correctRaw === 'B' || correctRaw === '2' || correctRaw === 'OPTION B') correctIdx = 1;
      else if (correctRaw === 'C' || correctRaw === '3' || correctRaw === 'OPTION C') correctIdx = 2;
      else if (correctRaw === 'D' || correctRaw === '4' || correctRaw === 'OPTION D') correctIdx = 3;
      else {
        // Maybe exact text of one of options?
        if (optA && correctRaw === optA.toUpperCase()) correctIdx = 0;
        else if (optB && correctRaw === optB.toUpperCase()) correctIdx = 1;
        else if (optC && correctRaw === optC.toUpperCase()) correctIdx = 2;
        else if (optD && correctRaw === optD.toUpperCase()) correctIdx = 3;
      }

      if (correctIdx === -1) {
        results.push({
          valid: false,
          rowNumber: i + 1,
          errorReason: `Invalid CorrectOption: "${correctRaw}". Must be A, B, C, or D.`,
        });
        continue;
      }

      // Validate Difficulty
      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
      if (difficultyRaw.toLowerCase().includes('easy')) difficulty = 'Easy';
      else if (difficultyRaw.toLowerCase().includes('hard')) difficulty = 'Hard';

      const marks = parseInt(marksRaw, 10) || 4;
      const negativeMarks = parseInt(negMarksRaw, 10) || 1;

      results.push({
        valid: true,
        rowNumber: i + 1,
        question: {
          category,
          difficulty,
          questionText,
          options: [optA, optB, optC, optD],
          correctOptionIndex: correctIdx,
          marks,
          negativeMarks,
          explanation: explanation || 'Refer to standard management case principles and industry benchmarks.',
        },
      });
    }

    setParsedRows(results);
    setIsParsing(false);
  };

  // Handle File Pick
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportedFileName(file.name);
    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (text) {
        processCSVText(text);
      }
    };
    reader.readAsText(file);
  };

  // Handle Paste parsing
  const handleParsePasted = () => {
    if (!rawPastedContent.trim()) return;
    setImportedFileName('Clipboard Paste');
    processCSVText(rawPastedContent);
  };

  // Commit Import
  const handleConfirmImport = () => {
    const validQuestions = parsedRows.filter(r => r.valid && r.question).map(r => r.question!);
    if (validQuestions.length === 0) return;

    addQuestionsBulk(validQuestions);
    setShowImportModal(false);
    setParsedRows([]);
    setRawPastedContent('');
    setImportedFileName('');
  };

  // Single Question Submit
  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleForm.questionText.trim()) return;
    if (singleForm.options.some(opt => !opt.trim())) return;

    addQuestion(singleForm);
    setShowCreateModal(false);
    setSingleForm({
      category: 'Business Strategy',
      difficulty: 'Medium',
      questionText: '',
      options: ['', '', '', ''],
      correctOptionIndex: 0,
      marks: 4,
      negativeMarks: 1,
      explanation: '',
    });
  };

  const validCount = parsedRows.filter(r => r.valid).length;
  const invalidCount = parsedRows.filter(r => !r.valid).length;

  return (
    <div id="quiz-question-bank-manager" className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                Round 1 Online Assessment Engine
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                AIMA Certified Question Repository
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Quiz Question Bank
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage randomized questions across strategy, finance, and marketing. Download the spreadsheet template or bulk import questions via CSV.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Download Template Button */}
            <button
              id="download-question-template-btn"
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-700 shadow-sm"
              title="Download standard CSV spreadsheet format with column headers and sample questions"
            >
              <Download className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Download Spreadsheet Template</span>
            </button>

            {/* Import Questions Button */}
            <button
              id="import-spreadsheet-questions-btn"
              onClick={() => {
                setShowImportModal(true);
                setParsedRows([]);
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Upload className="w-4 h-4" />
              <span>Import Questions via Spreadsheet</span>
            </button>

            {/* Create Single Question */}
            <button
              id="create-single-question-btn"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Total Bank Size</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {questions.length} Items
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Ready for dynamic shuffling</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Domain Categories</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {categories.length} Tracks
          </p>
          <span className="text-[11px] text-slate-500">Strategy, Finance, Ops, Tech</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Standard Weightage</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            +4 / -1
          </p>
          <span className="text-[11px] text-slate-500">Marks per standard item</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Active In R1 Pool</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            100% Active
          </p>
          <span className="text-[11px] text-slate-500">Anti-cheat seeded order</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by question text, concept, or option..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Domain Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {filteredQuestions.map((q, idx) => (
          <div
            key={q.id}
            id={`question-card-${q.id}`}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:border-slate-300 dark:hover:border-slate-700 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                {/* Meta Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Q{idx + 1} • {q.id}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {q.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    q.difficulty === 'Easy'
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                      : q.difficulty === 'Hard'
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                  }`}>
                    {q.difficulty}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    +{q.marks || 4} / -{q.negativeMarks ?? 1} marks
                  </span>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                  {q.questionText}
                </h3>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctOptionIndex;
                    const letter = String.fromCharCode(65 + optIdx);
                    return (
                      <div
                        key={optIdx}
                        className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs font-medium border transition-colors ${
                          isCorrect
                            ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isCorrect
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}>
                          {letter}
                        </span>
                        <span className="flex-1 leading-relaxed">{opt}</span>
                        {isCorrect && (
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0">
                            Correct
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this question?')) {
                      deleteQuestion(q.id);
                    }
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: SPREADSHEET IMPORT WITH LIVE PREVIEW */}
      {/* ========================================================================= */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Import Questions via Spreadsheet
                  </h3>
                  <p className="text-xs text-slate-500">
                    Upload or paste your CSV/Excel spreadsheet to batch-populate the Question Bank
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {/* Instructions Callout */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Required Spreadsheet Columns Format
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                    Category, Difficulty, QuestionText, OptionA, OptionB, OptionC, OptionD, CorrectOption (A/B/C/D), Marks, NegativeMarks, Explanation
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Sample CSV
                </button>
              </div>

              {/* Mode Toggle: Upload File vs Paste Text */}
              <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  type="button"
                  onClick={() => setImportMode('upload')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    importMode === 'upload'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📁 Upload File (.csv, .tsv, .txt)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('paste')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    importMode === 'paste'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  📋 Paste CSV / Spreadsheet Content
                </button>
              </div>

              {/* Upload Mode UI */}
              {importMode === 'upload' && (
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv, .tsv, .txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/30"
                  >
                    <Upload className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Click to choose or drag and drop your spreadsheet file
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports UTF-8 CSV, Tab-Delimited TSV, and formatted Plain Text
                    </p>
                    {importedFileName && (
                      <p className="mt-3 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 py-1 px-3 rounded-full inline-block">
                        Loaded: {importedFileName}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Paste Mode UI */}
              {importMode === 'paste' && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Paste CSV or Excel Rows (Include header line):
                  </label>
                  <textarea
                    rows={6}
                    value={rawPastedContent}
                    onChange={e => setRawPastedContent(e.target.value)}
                    placeholder={`Category,Difficulty,QuestionText,OptionA,OptionB,OptionC,OptionD,CorrectOption,Marks,NegativeMarks,Explanation\nBusiness Strategy,Medium,What does SWOT stand for?,Strengths Weaknesses...,Sales Warnings...,Staff Wages...,Strategic Work...,A,4,1,SWOT stands for Strengths, Weaknesses, Opportunities, and Threats.`}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleParsePasted}
                      className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                    >
                      Parse Pasted Content
                    </button>
                  </div>
                </div>
              )}

              {/* Parsed Rows Validation Summary */}
              {parsedRows.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>Spreadsheet Validation Preview</span>
                      <span className="text-xs font-normal text-slate-500">
                        ({parsedRows.length} total rows processed)
                      </span>
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-semibold">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        ✓ {validCount} Ready to Import
                      </span>
                      {invalidCount > 0 && (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                          ✕ {invalidCount} Errors Detected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Validation Table */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-3 py-2 w-12 text-center">Row</th>
                          <th className="px-3 py-2 w-20">Status</th>
                          <th className="px-3 py-2">Category / Question</th>
                          <th className="px-3 py-2 w-24 text-center">Correct Opt</th>
                          <th className="px-3 py-2 w-16 text-center">Marks</th>
                          <th className="px-3 py-2">Validation Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {parsedRows.map((item, idx) => (
                          <tr
                            key={idx}
                            className={
                              item.valid
                                ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
                                : 'bg-rose-50/40 dark:bg-rose-950/20'
                            }
                          >
                            <td className="px-3 py-2 text-center font-mono text-slate-400 font-semibold">
                              #{item.rowNumber}
                            </td>
                            <td className="px-3 py-2">
                              {item.valid ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600">
                                  <AlertTriangle className="w-3.5 h-3.5" /> Error
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              {item.question ? (
                                <div>
                                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                                    [{item.question.category}]
                                  </span>{' '}
                                  <span className="text-slate-600 dark:text-slate-400 line-clamp-1">
                                    {item.question.questionText}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic">No question extracted</span>
                              )}
                            </td>
                            <td className="px-3 py-2 text-center font-bold">
                              {item.question ? (
                                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                                  Option {String.fromCharCode(65 + item.question.correctOptionIndex)}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                            <td className="px-3 py-2 text-center font-mono">
                              {item.question ? `+${item.question.marks}/-${item.question.negativeMarks}` : '-'}
                            </td>
                            <td className="px-3 py-2">
                              {item.valid ? (
                                <span className="text-emerald-600 font-medium">Ready</span>
                              ) : (
                                <span className="text-rose-600 font-semibold">{item.errorReason}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900">
              <span className="text-xs text-slate-500">
                {validCount > 0 ? `${validCount} valid questions ready for Question Bank` : 'No valid questions loaded'}
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={validCount === 0}
                  onClick={handleConfirmImport}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import {validCount} Questions into Bank</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE SINGLE QUESTION */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Add New Quiz Question
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define prompt, 4 choices, correct answer, and explanation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Domain Track / Category *
                  </label>
                  <select
                    value={singleForm.category}
                    onChange={e => setSingleForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Business Strategy">Business Strategy</option>
                    <option value="Financial Acumen">Financial Acumen</option>
                    <option value="Marketing & Consumer">Marketing & Consumer</option>
                    <option value="Operations & Supply Chain">Operations & Supply Chain</option>
                    <option value="Technology & Analytics">Technology & Analytics</option>
                    <option value="General Management">General Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level *
                  </label>
                  <select
                    value={singleForm.difficulty}
                    onChange={e => setSingleForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Question Prompt *
                </label>
                <textarea
                  rows={3}
                  required
                  value={singleForm.questionText}
                  onChange={e => setSingleForm(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="Enter the complete business case or theoretical problem statement..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 4 Options */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Multiple Choice Options & Select Correct Answer *
                </label>
                {singleForm.options.map((opt, idx) => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChecked = singleForm.correctOptionIndex === idx;
                  return (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSingleForm(prev => ({ ...prev, correctOptionIndex: idx }))}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                        }`}
                        title="Click to mark as correct answer"
                      >
                        {letter}
                      </button>
                      <input
                        type="text"
                        required
                        value={opt}
                        onChange={e => {
                          const val = e.target.value;
                          setSingleForm(prev => {
                            const newOpts = [...prev.options];
                            newOpts[idx] = val;
                            return { ...prev, options: newOpts };
                          });
                        }}
                        placeholder={`Option ${letter} text...`}
                        className={`flex-1 px-3 py-2 text-sm rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 ${
                          isChecked
                            ? 'border-emerald-500 bg-emerald-50/20'
                            : 'border-slate-200 dark:border-slate-700'
                        }`}
                      />
                      {isChecked && (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                          ✓ Correct
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marks Awarded
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={singleForm.marks}
                    onChange={e => setSingleForm(prev => ({ ...prev, marks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Negative Penalty
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={singleForm.negativeMarks}
                    onChange={e => setSingleForm(prev => ({ ...prev, negativeMarks: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Answer Explanation & Rationale
                </label>
                <textarea
                  rows={2}
                  value={singleForm.explanation}
                  onChange={e => setSingleForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Provide reference or mathematical steps explaining why this option is correct..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
