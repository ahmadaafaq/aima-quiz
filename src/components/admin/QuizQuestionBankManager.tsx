import React, { useState, useRef, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizQuestion, QuizProgram } from '../../types';
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
  Eye,
  Check,
  RotateCcw,
  Archive,
  Layers
} from 'lucide-react';

export const MASTER_QUIZ_CATEGORIES = [
  'Corporate Strategy & Management',
  'Corporate Strategy & Business Awareness',
  'Management Concepts & Case Analysis',
  'Sustainability & AI',
  'Economics & Policy',
  'Finance & Marketing',
  'Data Interpretation',
] as const;

export function normalizeQuestionCategory(cat?: string): string {
  if (!cat) return 'Corporate Strategy & Management';
  const trimmed = cat.trim();
  const lower = trimmed.toLowerCase();

  if (lower === 'corporate strategy & management') return 'Corporate Strategy & Management';
  if (lower === 'corporate strategy & business awareness') return 'Corporate Strategy & Business Awareness';
  if (lower === 'management concepts & case analysis') return 'Management Concepts & Case Analysis';
  if (lower === 'sustainability & ai') return 'Sustainability & AI';
  if (lower === 'economics & policy') return 'Economics & Policy';
  if (lower === 'finance & marketing') return 'Finance & Marketing';
  if (lower === 'data interpretation') return 'Data Interpretation';

  // Legacy & seed mappings
  if (lower === 'corporate strategy' || lower === 'business strategy' || lower === 'strategy') {
    return 'Corporate Strategy & Management';
  }
  if (lower === 'business awareness') {
    return 'Corporate Strategy & Business Awareness';
  }
  if (
    lower === 'management concepts' ||
    lower.includes('case analysis') ||
    lower.includes('operations') ||
    lower.includes('supply chain') ||
    lower === 'general management'
  ) {
    return 'Management Concepts & Case Analysis';
  }
  if (lower === 'financial acumen' || lower.includes('finance') || lower.includes('marketing')) {
    return 'Finance & Marketing';
  }
  if (lower.includes('technology') || lower.includes('analytics') || lower.includes('sustainability') || lower.includes('ai')) {
    return 'Sustainability & AI';
  }
  if (lower.includes('economics') || lower.includes('policy')) {
    return 'Economics & Policy';
  }
  if (lower.includes('data') || lower.includes('interpretation')) {
    return 'Data Interpretation';
  }

  return trimmed;
}

export const QuizQuestionBankManager: React.FC = () => {
  const { questions, addQuestion, addQuestionsBulk, updateQuestion, deleteQuestion, programQuestionMappings, quizPrograms } = useCompetition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived' | 'all'>('active');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [hoveredAssignedQuestionId, setHoveredAssignedQuestionId] = useState<string | null>(null);

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
  const [singleForm, setSingleForm] = useState({
    category: 'Corporate Strategy & Management',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    questionText: '',
    caseletSnippet: '',
    options: ['', '', '', ''],
    correctAnswerIndex: 0,
    marks: 4,
    negativeMarks: 1,
    explanation: '',
  });

  // Normalize questions to strictly match the 7 Master Categories
  const normalizedQuestions = useMemo(() => {
    return (questions || []).map(q => ({
      ...q,
      category: normalizeQuestionCategory(q.category),
    }));
  }, [questions]);

  // Categories dropdown strictly displays the 7 Master Categories matching Create Quiz Program 1:1
  const categories = useMemo(() => {
    return [...MASTER_QUIZ_CATEGORIES];
  }, []);

  // Telemetry Calculations for Stat Cards
  const distinctCategories = useMemo(
    () => Array.from(new Set(normalizedQuestions.map(q => q.category).filter(Boolean))),
    [normalizedQuestions]
  );

  const topCategoriesSummary = useMemo(() => {
    if (distinctCategories.length === 0) return 'None assigned';
    const cleanNames = distinctCategories.map(c => c.split('&')[0].replace('Corporate', '').trim());
    const top3 = cleanNames.slice(0, 3).join(', ');
    return distinctCategories.length > 3 ? `${top3}, +${distinctCategories.length - 3} more` : top3;
  }, [distinctCategories]);

  // Assigned vs Unassigned questions breakdown
  const assignedQuestionIds = useMemo(() => {
    const set = new Set<string>();
    if (programQuestionMappings) {
      Object.values(programQuestionMappings).forEach(ids => {
        if (Array.isArray(ids)) {
          ids.forEach(id => set.add(id));
        }
      });
    }
    return set;
  }, [programQuestionMappings]);

  // Program count per question mapping
  const questionProgramMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (programQuestionMappings) {
      Object.values(programQuestionMappings).forEach(ids => {
        if (Array.isArray(ids)) {
          ids.forEach(id => {
            map[id] = (map[id] || 0) + 1;
          });
        }
      });
    }
    return map;
  }, [programQuestionMappings]);

  // Full assigned quiz programs detail map for hover popover
  const questionAssignedProgramsMap = useMemo(() => {
    const map: Record<string, { program: QuizProgram; order: number }[]> = {};
    if (programQuestionMappings && Array.isArray(quizPrograms)) {
      const progMap = new Map(quizPrograms.map(p => [p.id, p]));
      Object.entries(programQuestionMappings).forEach(([progId, qIds]) => {
        const p = progMap.get(progId);
        if (p && Array.isArray(qIds)) {
          qIds.forEach((id, idx) => {
            if (!map[id]) map[id] = [];
            map[id].push({ program: p, order: idx + 1 });
          });
        }
      });
    }
    return map;
  }, [programQuestionMappings, quizPrograms]);

  const assignedCount = useMemo(() => {
    return normalizedQuestions.filter(q => assignedQuestionIds.has(q.id)).length;
  }, [normalizedQuestions, assignedQuestionIds]);

  const unassignedCount = Math.max(0, normalizedQuestions.length - assignedCount);

  const activeQuestions = useMemo(
    () => normalizedQuestions.filter(q => q.isActive !== false),
    [normalizedQuestions]
  );
  const activeCount = activeQuestions.length;

  const archivedQuestions = useMemo(
    () => normalizedQuestions.filter(q => q.isActive === false),
    [normalizedQuestions]
  );
  const archivedCount = archivedQuestions.length;

  const weightageStats = useMemo(() => {
    if (normalizedQuestions.length === 0) return { modeMarks: 4, modeNegMarks: 1, avgMarks: 4 };
    const marksFreq: Record<number, number> = {};
    const negFreq: Record<number, number> = {};
    let sumMarks = 0;
    normalizedQuestions.forEach(q => {
      const m = Number(q.marks) || 4;
      const nm = Number(q.negativeMarks) || 1;
      marksFreq[m] = (marksFreq[m] || 0) + 1;
      negFreq[nm] = (negFreq[nm] || 0) + 1;
      sumMarks += m;
    });
    const modeMarks = Number(
      Object.keys(marksFreq).reduce((a, b) => (marksFreq[Number(a)] >= marksFreq[Number(b)] ? a : b), '4')
    );
    const modeNegMarks = Number(
      Object.keys(negFreq).reduce((a, b) => (negFreq[Number(a)] >= negFreq[Number(b)] ? a : b), '1')
    );
    const avgMarks = Math.round((sumMarks / normalizedQuestions.length) * 10) / 10;
    return { modeMarks, modeNegMarks, avgMarks };
  }, [normalizedQuestions]);

  // Filtered Questions
  const filteredQuestions = normalizedQuestions.filter(q => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.options.some(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'all' || q.difficulty === difficultyFilter;
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'archived'
          ? q.isActive === false
          : q.isActive !== false;
    return matchesSearch && matchesCat && matchesDiff && matchesStatus;
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
        'Corporate Strategy & Management',
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
        'Finance & Marketing',
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
        'Corporate Strategy & Business Awareness',
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
        'Management Concepts & Case Analysis',
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
        'Sustainability & AI',
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
      caseletSnippet: rawHeaders.findIndex(h => h.includes('caselet') || h.includes('snippet') || h.includes('exhibit')),
      questionText: rawHeaders.findIndex(h => h.includes('question') || h.includes('text') || h.includes('prompt')),
      optionA: rawHeaders.findIndex(h => h === 'optiona' || h === 'a' || h === 'choice1'),
      optionB: rawHeaders.findIndex(h => h === 'optionb' || h === 'b' || h === 'choice2'),
      optionC: rawHeaders.findIndex(h => h === 'optionc' || h === 'c' || h === 'choice3'),
      optionD: rawHeaders.findIndex(h => h === 'optiond' || h === 'd' || h === 'choice4'),
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
      const caseletSnippet = colIndex.caseletSnippet !== -1 ? (cells[colIndex.caseletSnippet] || '').trim() : '';
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
          caseletSnippet: caseletSnippet || undefined,
          options: [optA, optB, optC, optD],
          correctAnswerIndex: correctIdx,
          marks,
          negativeMarks,
          explanation: explanation || 'Refer to standard management case principles and industry benchmarks.',
          isActive: true,
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

    addQuestion({
      ...singleForm,
      caseletSnippet: singleForm.caseletSnippet.trim() || undefined,
      explanation: singleForm.explanation.trim() || undefined,
      isActive: true,
    });
    setShowCreateModal(false);
    setSingleForm({
      category: 'Corporate Strategy & Management',
      difficulty: 'Medium',
      questionText: '',
      caseletSnippet: '',
      options: ['', '', '', ''],
      correctAnswerIndex: 0,
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
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors border border-slate-200 dark:border-slate-700 shadow-sm cursor-pointer"
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
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Import Questions via Spreadsheet</span>
            </button>

            {/* Create Single Question */}
            <button
              id="create-single-question-btn"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Total Bank Size</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {questions.length} {questions.length === 1 ? 'Item' : 'Items'}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            {activeCount} active in test pool
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Domain Categories</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {distinctCategories.length} {distinctCategories.length === 1 ? 'Track' : 'Tracks'}
          </p>
          <span className="text-[11px] text-slate-500 truncate block" title={topCategoriesSummary}>
            {topCategoriesSummary}
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Standard Weightage</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            +{weightageStats.modeMarks} / -{weightageStats.modeNegMarks}
          </p>
          <span className="text-[11px] text-slate-500">
            Avg {weightageStats.avgMarks} pts per item
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold">Assigned To Quizzes</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {assignedCount} / {normalizedQuestions.length}
          </p>
          <span className="text-[11px] text-slate-500">
            {unassignedCount} available in reserve
          </span>
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
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Domain Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={difficultyFilter}
              onChange={e => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="all">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer font-medium"
            >
              <option value="active">Active Bank ({activeCount})</option>
              <option value="archived">Archived ({archivedCount})</option>
              <option value="all">All Questions ({normalizedQuestions.length})</option>
            </select>
          </div>
        </div>
      </div>

      {/* Questions Listing */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No questions found matching your filter criteria
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Try switching filters, changing search terms, or checking the Archived status.
            </p>
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const correctIdx = q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : (q as any).correctOptionIndex;
            const assignedProgramsCount = questionProgramMap[q.id] || 0;
            const shortId = q.id.startsWith('q_') ? `#${q.id.split('_').pop() || q.id.slice(-4)}` : `#${q.id}`;

            return (
              <div
                key={q.id}
                id={`question-card-${q.id}`}
                className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition-all ${q.isActive === false
                  ? 'border-slate-200 dark:border-slate-800 opacity-75 bg-slate-50/50 dark:bg-slate-900/50'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    {/* Meta Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Clean ID with click-to-copy */}
                      <span
                        onClick={() => {
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(q.id);
                            setCopiedId(q.id);
                            setTimeout(() => setCopiedId(null), 1500);
                          }
                        }}
                        className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                        title={`Database ID: ${q.id} (Click to copy)`}
                      >
                        <span>Q{idx + 1} • {shortId}</span>
                        {copiedId === q.id ? (
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-60 hover:opacity-100" />
                        )}
                      </span>

                      {/* Informative Deployment Status Chip */}
                      {q.isActive === false ? (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                          <Archive className="w-3 h-3" />
                          Archived
                        </span>
                      ) : assignedProgramsCount > 0 ? (
                        <div className="relative inline-block">
                          <span
                            onMouseEnter={() => setHoveredAssignedQuestionId(q.id)}
                            onMouseLeave={() => setHoveredAssignedQuestionId(null)}
                            className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 flex items-center gap-1 cursor-pointer hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors shadow-2xs"
                          >
                            <Layers className="w-3 h-3" />
                            <span>Assigned ({assignedProgramsCount})</span>
                          </span>

                          {/* Hover Popover Portal Card */}
                          {hoveredAssignedQuestionId === q.id && (questionAssignedProgramsMap[q.id]?.length || 0) > 0 && (
                            <div
                              onMouseEnter={() => setHoveredAssignedQuestionId(q.id)}
                              onMouseLeave={() => setHoveredAssignedQuestionId(null)}
                              className="absolute left-0 top-full mt-1.5 z-50 w-72 sm:w-80 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[11px]">
                                <span className="font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                  <Layers className="w-3.5 h-3.5" />
                                  <span>Assigned to {assignedProgramsCount} Quiz(zes)</span>
                                </span>
                              </div>

                              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                {questionAssignedProgramsMap[q.id]?.map(({ program, order }) => (
                                  <div
                                    key={program.id}
                                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 text-xs space-y-1 hover:border-indigo-300 dark:hover:border-indigo-700 transition"
                                  >
                                    <div className="flex items-start justify-between gap-1.5">
                                      <span className="font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                                        {program.title}
                                      </span>
                                      <span className="shrink-0 px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/70 text-indigo-700 dark:text-indigo-300">
                                        #{order} of {program.totalQuestions || 25}
                                      </span>
                                    </div>
                                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                                      <span className="truncate">{program.category || 'General'}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          In Reserve
                        </span>
                      )}

                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {q.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${q.difficulty === 'Easy'
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

                    {/* Exhibit / Caselet Snippet if present */}
                    {q.caseletSnippet && (
                      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-800 dark:text-amber-200 text-xs font-mono leading-relaxed">
                        <strong className="font-bold text-amber-700 dark:text-amber-300">EXHIBIT / CASELET:</strong> {q.caseletSnippet}
                      </div>
                    )}

                    {/* Question Text */}
                    <h3 className="text-base font-semibold text-slate-900 dark:text-white leading-snug">
                      {q.questionText}
                    </h3>

                    {/* 4 Options Grid with Correct Answer Clearly Highlighted */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = optIdx === correctIdx;
                        const letter = String.fromCharCode(65 + optIdx);
                        return (
                          <div
                            key={optIdx}
                            className={`flex items-start gap-2.5 p-2.5 rounded-lg text-xs font-medium border transition-colors ${isCorrect
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-400/30'
                              : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${isCorrect
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                              {letter}
                            </span>
                            <span className="flex-1 leading-relaxed">{opt}</span>
                            {isCorrect && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="pt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons: Soft Delete (Archive) / Restore */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {q.isActive === false ? (
                      <button
                        onClick={() => {
                          updateQuestion(q.id, { isActive: true });
                        }}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Restore Question to Active Bank"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const count = assignedProgramsCount;
                          const msg = count > 0
                            ? `Archive this question? It is currently assigned to ${count} quiz program(s). Archiving will soft-delete it from the active question bank while keeping existing quizzes working. You can restore it anytime.`
                            : 'Archive this question? It will be soft-deleted from the active bank and can be restored anytime from the Archived filter.';
                          if (confirm(msg)) {
                            updateQuestion(q.id, { isActive: false });
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        title="Archive Question (Soft Delete)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${importMode === 'upload'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                    }`}
                >
                  📁 Upload File (.csv, .tsv, .txt)
                </button>
                <button
                  type="button"
                  onClick={() => setImportMode('paste')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${importMode === 'paste'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Add New Quiz Question
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define prompt, 4 choices, correct answer, and evaluation parameters
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSingle} className="space-y-4">
              {/* Optional Caselet Snippet / Business Exhibit */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Caselet Snippet / Business Exhibit (Optional)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Scenario, balance sheet, or financial data excerpt
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={singleForm.caseletSnippet}
                  onChange={e => setSingleForm(prev => ({ ...prev, caseletSnippet: e.target.value }))}
                  placeholder="e.g. Portfolio: ₹450 Cr | Vulnerability: Crop-loss dependent rural borrowers | Current Gross NPA: 3.4%"
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Question Text *
                </label>
                <textarea
                  rows={2}
                  required
                  value={singleForm.questionText}
                  onChange={e => setSingleForm(prev => ({ ...prev, questionText: e.target.value }))}
                  placeholder="e.g. Which strategic framework assesses competitive intensity through five industry forces?"
                  className="w-full text-xs p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* 4 Options in 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map(idx => {
                  const letter = String.fromCharCode(65 + idx);
                  const isChecked = singleForm.correctAnswerIndex === idx;
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                          Option {letter}
                        </label>
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400">
                          <input
                            type="radio"
                            name="correctOption"
                            checked={isChecked}
                            onChange={() => setSingleForm(prev => ({ ...prev, correctAnswerIndex: idx }))}
                            className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          />
                          <span className={isChecked ? 'text-indigo-600 dark:text-indigo-400 font-bold' : ''}>
                            Correct Answer
                          </span>
                        </label>
                      </div>
                      <input
                        type="text"
                        required
                        value={singleForm.options[idx] || ''}
                        onChange={e => {
                          const val = e.target.value;
                          setSingleForm(prev => {
                            const newOpts = [...prev.options];
                            newOpts[idx] = val;
                            return { ...prev, options: newOpts };
                          });
                        }}
                        placeholder={`Enter Option ${letter}...`}
                        className={`w-full text-xs p-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 ${isChecked
                          ? 'border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400/30'
                          : 'border-slate-200 dark:border-slate-700'
                          }`}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Metadata 4-Column Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Marks
                  </label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    value={singleForm.marks}
                    onChange={e => setSingleForm(prev => ({ ...prev, marks: Number(e.target.value) }))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Negative Penalty
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.25"
                    value={singleForm.negativeMarks}
                    onChange={e => setSingleForm(prev => ({ ...prev, negativeMarks: Number(e.target.value) }))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Difficulty
                  </label>
                  <select
                    value={singleForm.difficulty}
                    onChange={e => setSingleForm(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Category
                  </label>
                  <select
                    value={singleForm.category}
                    onChange={e => setSingleForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 cursor-pointer truncate"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Explanation Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Answer Explanation & Rationale
                </label>
                <textarea
                  rows={2}
                  value={singleForm.explanation}
                  onChange={e => setSingleForm(prev => ({ ...prev, explanation: e.target.value }))}
                  placeholder="Provide reference or mathematical steps explaining why this option is correct..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save Question</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
