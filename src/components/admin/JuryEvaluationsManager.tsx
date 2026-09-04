import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { Evaluation, UserProfile } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  Scale,
  Award,
  Filter,
  Search,
  Download,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  MessageSquare,
  Shield,
  Layers,
  Building,
  Sliders,
  Check,
  GraduationCap,
  Briefcase,
  Sparkles,
  UserCheck,
  RefreshCw,
  BookOpen,
  Clock,
  X,
  ChevronRight,
  Phone,
  Mail,
} from 'lucide-react';

interface JuryEvaluationsManagerProps {
  initialSubTab?: 'evaluations' | 'jury_bench';
  autoOpenInduct?: boolean;
}

export const JuryEvaluationsManager: React.FC<JuryEvaluationsManagerProps> = ({
  initialSubTab = 'evaluations',
  autoOpenInduct = false,
}) => {
  const {
    evaluations,
    submitEvaluation,
    moderateEvaluation,
    teams,
    rubricR2,
    rubricR3,
    rubricR4,
    addAuditLog,
    currentUser,
    users,
    addJuryMember,
    updateJuryMember,
    deleteJuryMember,
    autoAllocateCasesToJury,
    caseSubmissions,
  } = useCompetition();

  const [activeSubTab, setActiveSubTab] = useState<'evaluations' | 'jury_bench'>(initialSubTab);

  React.useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  React.useEffect(() => {
    if (autoOpenInduct) {
      setActiveSubTab('jury_bench');
      setShowInductModal(true);
    }
  }, [autoOpenInduct]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRound, setFilterRound] = useState<'all' | 'r2' | 'r3' | 'r4'>('all');
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);

  // Bench Speciality Filter
  const [benchSpecialityFilter, setBenchSpecialityFilter] = useState('all');

  // Moderation Modal
  const [showModerationModal, setShowModerationModal] = useState(false);
  const [targetEvalForModeration, setTargetEvalForModeration] = useState<Evaluation | null>(null);
  const [moderatedScore, setModeratedScore] = useState<number>(85);
  const [moderationReason, setModerationReason] = useState<string>('Standardized against national outlier deviation.');

  // Create Evaluation Modal
  const [showAddEvalModal, setShowAddEvalModal] = useState(false);
  const [newTeamId, setNewTeamId] = useState<string>(teams[0]?.id || 'team_1');
  const [newEvaluatorName, setNewEvaluatorName] = useState('Dr. Arvind Sharma (Senior Jury)');
  const [newWeightedTotal, setNewWeightedTotal] = useState<number>(88);
  const [newComments, setNewComments] = useState('Exceptional market diagnosis with realistic financial unit economics.');
  const [newScoreC1, setNewScoreC1] = useState<number>(22);
  const [newScoreC2, setNewScoreC2] = useState<number>(23);
  const [newScoreC3, setNewScoreC3] = useState<number>(21);
  const [newScoreC4, setNewScoreC4] = useState<number>(22);

  // Jury Member Induction Modal
  const [showInductModal, setShowInductModal] = useState(false);
  const [inductName, setInductName] = useState('');
  const [inductEmail, setInductEmail] = useState('');
  const [inductMobile, setInductMobile] = useState('');
  const [inductDesignation, setInductDesignation] = useState('Senior Case Evaluator & Adjunct Faculty');
  const [inductOrganization, setInductOrganization] = useState('IIM Bangalore');
  const [inductSpeciality, setInductSpeciality] = useState('Corporate Strategy & Growth');
  const [inductSecondarySpeciality, setInductSecondarySpeciality] = useState('Financial Modeling & Valuation');
  const [inductExperience, setInductExperience] = useState<number>(12);
  const [inductQualification, setInductQualification] = useState('Ph.D. Management / MBA Strategy');
  const [inductQuota, setInductQuota] = useState<number>(10);
  const [inductConflictInstitutes, setInductConflictInstitutes] = useState('IIM Bangalore, FMS Delhi');

  // Allocation Toast / Banner
  const [allocationToast, setAllocationToast] = useState<{ count: number; message: string } | null>(null);

  // List of certified jury members from users
  const juryMembers = users.filter(u => u.role === 'evaluator');

  const openInductModal = () => {
    setInductName('Prof. Sunita Rao');
    setInductEmail('sunita.rao@iimb.ac.in');
    setInductMobile('+91 98223 44556');
    setInductDesignation('Chairperson, Center for Strategy & Innovation');
    setInductOrganization('IIM Bangalore');
    setInductSpeciality('Corporate Strategy & Growth');
    setInductSecondarySpeciality('Digital Transformation & AI');
    setInductExperience(15);
    setInductQualification('Ph.D. Strategic Management, Fellow IIM-C');
    setInductQuota(10);
    setInductConflictInstitutes('IIM Bangalore, ISB Hyderabad');
    setShowInductModal(true);
  };

  const handleInductJurySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inductName.trim() || !inductEmail.trim()) {
      alert('Please fill evaluator name and email.');
      return;
    }

    addJuryMember({
      name: inductName,
      email: inductEmail,
      mobile: inductMobile || '+91 98000 00000',
      organization: inductOrganization,
      instituteName: inductOrganization,
      designation: inductDesignation,
      speciality: inductSpeciality,
      secondarySpeciality: inductSecondarySpeciality,
      experienceYears: Number(inductExperience),
      maxAllocationQuota: Number(inductQuota),
      allocatedCasesCount: 0,
      isAvailableForEvaluation: true,
      isVerified: true,
    });

    setAllocationToast({
      count: 1,
      message: `Successfully inducted ${inductName} (${inductSpeciality}) into the Certified National Jury Bench.`,
    });
    setShowInductModal(false);
  };

  const handleRunAutoAllocation = () => {
    const result = autoAllocateCasesToJury();
    setAllocationToast({
      count: result.allocatedCount,
      message: `Dual-Blind Subject Matching complete: Auto-allocated ${result.allocatedCount} case submissions across ${juryMembers.length} certified jury evaluators based on domain specialities.`,
    });
  };

  const openModeration = (ev: Evaluation) => {
    setTargetEvalForModeration(ev);
    setModeratedScore(ev.moderatedScore ?? ev.weightedTotal);
    setModerationReason(ev.moderationReason ?? 'Standardized against national scoring variance.');
    setShowModerationModal(true);
  };

  const handleSaveModeration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEvalForModeration) return;

    moderateEvaluation(targetEvalForModeration.id, Number(moderatedScore), moderationReason);
    setShowModerationModal(false);
  };

  const handleAddEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    const team = teams.find(t => t.id === newTeamId);

    submitEvaluation({
      submissionId: team?.r2Submission?.id || 'sub_' + newTeamId,
      teamId: newTeamId,
      evaluatorId: 'eval_' + Date.now().toString().slice(-4),
      evaluatorName: newEvaluatorName,
      scores: {
        r2_c1: Number(newScoreC1),
        r2_c2: Number(newScoreC2),
        r2_c6: Number(newScoreC3),
        r2_c8: Number(newScoreC4),
      },
      weightedTotal: Number(newWeightedTotal),
      comments: newComments,
      isLocked: true,
    });

    setShowAddEvalModal(false);
  };

  const handleExportJuryReport = () => {
    const headers = ['Evaluation ID', 'Team ID', 'Team Name', 'Evaluator Name', 'Original Score (100)', 'Moderated Score', 'Moderation Reason', 'Comments', 'Submitted Date'];
    const rows = filteredEvaluations.map(ev => {
      const team = teams.find(t => t.id === ev.teamId);
      return [
        ev.id,
        ev.teamId,
        `"${team?.name || 'Competition Team'}"`,
        `"${ev.evaluatorName}"`,
        ev.weightedTotal,
        ev.moderatedScore ?? ev.weightedTotal,
        `"${ev.moderationReason || 'None'}"`,
        `"${(ev.comments || '').replace(/"/g, '""')}"`,
        ev.submittedAt,
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `AIMA_Jury_Scorecards_Consolidated_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addAuditLog('Jury Scorecard Exported', 'Evaluation', `Super Admin exported ${filteredEvaluations.length} evaluation records`);
  };

  const filteredEvaluations = evaluations.filter(ev => {
    const team = teams.find(t => t.id === ev.teamId);
    const matchesSearch =
      ev.evaluatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team?.name && team.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.comments && ev.comments.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSearch;
  });

  const filteredJuryMembers = juryMembers.filter(jm => {
    const matchesSearch =
      jm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jm.organization || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jm.speciality || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (jm.designation || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSpeciality =
      benchSpecialityFilter === 'all' ||
      (jm.speciality || '').toLowerCase().includes(benchSpecialityFilter.toLowerCase());

    return matchesSearch && matchesSpeciality;
  });

  const avgJuryScore =
    evaluations.length > 0
      ? Math.round((evaluations.reduce((acc, e) => acc + (e.moderatedScore ?? e.weightedTotal), 0) / evaluations.length) * 10) / 10
      : 0;

  const moderatedCount = evaluations.filter(e => e.moderatedScore !== undefined).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast / Feedback Banner */}
      {allocationToast && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>{allocationToast.message}</span>
          </div>
          <button onClick={() => setAllocationToast(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <Scale className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                National Jury Evaluation & Rubrics Engine
              </h2>
              <DocRequirementInfo
                specKey="evaluator_dual_blind"
                variant="badge"
                badgeLabel="BRD §9.1 Specs"
                colorTheme="purple"
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review certified evaluator scorecards, onboard academic & corporate jury members, and moderate dual-blind assessment decisions.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openInductModal}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Induct Jury Member</span>
          </button>

          <button
            onClick={handleRunAutoAllocation}
            className="px-3.5 py-2 rounded-xl border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold hover:bg-purple-100 transition flex items-center gap-1.5 cursor-pointer"
            title="Auto-match case decks to certified jury by domain speciality"
          >
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span>Auto-Allocate by Speciality</span>
          </button>

          <button
            onClick={handleExportJuryReport}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setShowAddEvalModal(true)}
            className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scorecard</span>
          </button>
        </div>
      </div>

      {/* Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('evaluations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'evaluations'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Jury Scorecards & Moderation ({evaluations.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jury_bench')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'jury_bench'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Certified Jury Bench & Evaluator Panel ({juryMembers.length})</span>
        </button>
      </div>

      {/* -------------------- SUB-TAB 1: EVALUATION SCORECARDS & MODERATION -------------------- */}
      {activeSubTab === 'evaluations' && (
        <div className="space-y-6">
          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Evaluations Logged</span>
                <Scale className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {evaluations.length} Scorecards
              </div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                Across National & Regional Jury Panels
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Average Jury Score</span>
                <Award className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {avgJuryScore}/100
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Standardized calibrated mean
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Moderated Decisions</span>
                <Shield className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {moderatedCount} Overrides
              </div>
              <div className="text-xs text-amber-600 font-medium mt-1">
                Super Admin audit-backed adjustments
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Teams Assessed</span>
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {new Set(evaluations.map(e => e.teamId)).size} Teams
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Multi-evaluator consensus
              </div>
            </div>
          </div>

          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search evaluator name, team, or remarks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {(['all', 'r2', 'r3', 'r4'] as const).map(rnd => (
                <button
                  key={rnd}
                  onClick={() => setFilterRound(rnd)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                    filterRound === rnd
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {rnd === 'all' ? 'All Rounds' : rnd.toUpperCase() + ' Jury'}
                </button>
              ))}
            </div>
          </div>

          {/* Evaluations Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Evaluation ID & Date</th>
                    <th className="py-3.5 px-4">Evaluated Team</th>
                    <th className="py-3.5 px-4">Jury Evaluator</th>
                    <th className="py-3.5 px-4 text-center">Score (Original)</th>
                    <th className="py-3.5 px-4 text-center">Moderated Score</th>
                    <th className="py-3.5 px-4">Critique & Qualitative Remarks</th>
                    <th className="py-3.5 px-4 text-right">Super Admin Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredEvaluations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No jury evaluations found matching criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredEvaluations.map(ev => {
                      const team = teams.find(t => t.id === ev.teamId);
                      const isModerated = ev.moderatedScore !== undefined;

                      return (
                        <tr key={ev.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4">
                            <div className="font-mono font-bold text-slate-900 dark:text-white">
                              {ev.id}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {ev.submittedAt ? ev.submittedAt.slice(0, 16).replace('T', ' ') : '2026-09-12'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                            <div>{team?.name || 'Unassigned Team'}</div>
                            <div className="text-[10px] text-slate-400">{team?.instituteName}</div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="font-bold text-slate-900 dark:text-white">
                              {ev.evaluatorName}
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 font-medium">
                              Certified Evaluator
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            <span className="text-sm font-black text-slate-900 dark:text-white">
                              {ev.weightedTotal}
                            </span>
                            <span className="text-slate-400 text-[10px]"> / 100</span>
                          </td>

                          <td className="py-3.5 px-4 text-center">
                            {isModerated ? (
                              <div className="inline-flex flex-col items-center">
                                <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black text-sm border border-amber-500/20">
                                  {ev.moderatedScore} / 100
                                </span>
                                <span className="text-[9px] text-amber-600 mt-0.5">Moderated</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 text-xs italic">Unmoderated</span>
                            )}
                          </td>

                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-600 dark:text-slate-300 truncate" title={ev.comments}>
                              {ev.comments || 'No remarks logged.'}
                            </p>
                            {isModerated && ev.moderationReason && (
                              <p className="text-[10px] text-amber-600 mt-0.5 truncate" title={ev.moderationReason}>
                                Reason: {ev.moderationReason}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => openModeration(ev)}
                              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-600 text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>{isModerated ? 'Edit Moderation' : 'Moderate'}</span>
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
        </div>
      )}

      {/* -------------------- SUB-TAB 2: CERTIFIED JURY BENCH VIEW -------------------- */}
      {activeSubTab === 'jury_bench' && (
        <div className="space-y-6">
          {/* Bench Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Total Certified Jury</span>
                <GraduationCap className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {juryMembers.length} Members
              </div>
              <div className="text-xs text-purple-600 font-medium mt-1">
                AIMA-ICRC Accredited Evaluators
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Speciality Disciplines</span>
                <BookOpen className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {new Set(juryMembers.map(j => j.speciality).filter(Boolean)).size} Domains
              </div>
              <div className="text-xs text-blue-600 font-medium mt-1">
                Strategy, Finance, Tech/AI, Ops, Mktg
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Active Available Ratio</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {juryMembers.filter(j => j.isAvailableForEvaluation !== false).length} / {juryMembers.length}
              </div>
              <div className="text-xs text-emerald-600 font-medium mt-1">
                Ready for blind case assignment
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
                <span>Case Deck Pool Allocation</span>
                <Briefcase className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {juryMembers.reduce((acc, j) => acc + (j.allocatedCasesCount || 0), 0)} Allocated
              </div>
              <div className="text-xs text-amber-600 font-medium mt-1">
                Dual-blind evaluation capacity
              </div>
            </div>
          </div>

          {/* Search and Domain Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search jury member by name, institute, or speciality..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All Domains' },
                { id: 'strategy', label: 'Strategy' },
                { id: 'finance', label: 'Finance' },
                { id: 'tech', label: 'Tech & AI' },
                { id: 'supply', label: 'Supply Chain' },
                { id: 'marketing', label: 'Marketing' },
              ].map(sp => (
                <button
                  key={sp.id}
                  onClick={() => setBenchSpecialityFilter(sp.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                    benchSpecialityFilter === sp.id
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          {/* Jury Evaluators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredJuryMembers.length === 0 ? (
              <div className="col-span-full bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
                <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  No Certified Evaluators Found
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  No jury evaluators match &quot;{searchQuery}&quot;. Click &quot;Induct Jury Member&quot; to onboard certified evaluators.
                </p>
                <button
                  onClick={openInductModal}
                  className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Induct Certified Jury Member</span>
                </button>
              </div>
            ) : (
              filteredJuryMembers.map(jm => {
                const allocated = jm.allocatedCasesCount || 0;
                const quota = jm.maxAllocationQuota || 10;
                const fillPct = Math.min(100, Math.round((allocated / Math.max(1, quota)) * 100));

                return (
                  <div
                    key={jm.id}
                    className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-purple-300 dark:hover:border-purple-800 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm shrink-0">
                          {jm.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                              {jm.name}
                            </h4>
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                              Certified
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {jm.designation || 'Case Evaluator'} • {jm.organization || jm.instituteName || 'AIMA Panel'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => deleteJuryMember(jm.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        title="Remove from Jury Bench"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Specialities Chips */}
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold border border-purple-500/20">
                        {jm.speciality || 'General Strategy'}
                      </span>
                      {jm.secondarySpeciality && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {jm.secondarySpeciality}
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 font-medium">
                        {jm.experienceYears || 10}+ Yrs Exp
                      </span>
                    </div>

                    {/* Allocation Progress Bar */}
                    <div className="space-y-1 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">
                          Assigned Decks: <strong>{allocated}</strong> / {quota} cases
                        </span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">
                          {fillPct}% Quota
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-purple-600 transition-all duration-300"
                          style={{ width: `${fillPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Email: {jm.email}</span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateJuryMember(jm.id, { maxAllocationQuota: Math.max(2, quota - 2) })}
                            className="px-1.5 py-0.2 rounded-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]"
                            title="Decrease Quota"
                          >
                            -2
                          </button>
                          <button
                            onClick={() => updateJuryMember(jm.id, { maxAllocationQuota: quota + 2 })}
                            className="px-1.5 py-0.2 rounded-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-[9px]"
                            title="Increase Quota"
                          >
                            +2
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Conflict Exclusions */}
                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                        ⚖️ Dual-Blind Blinded
                      </span>
                      <button
                        onClick={() => {
                          const currentStatus = jm.isAvailableForEvaluation !== false;
                          updateJuryMember(jm.id, { isAvailableForEvaluation: !currentStatus });
                        }}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                          jm.isAvailableForEvaluation !== false
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {jm.isAvailableForEvaluation !== false ? '● Active Available' : '○ Standby'}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* -------------------- JURY MEMBER INDUCTION MODAL -------------------- */}
      {showInductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    Certified Jury Member & Evaluator Induction
                  </h3>
                  <p className="text-xs text-slate-500">
                    Onboard accredited evaluators with comprehensive academic & corporate credentials, subject specialities, and conflict of interest declarations.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInductModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleInductJurySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Full Name & Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Raghav Singhal"
                    value={inductName}
                    onChange={e => setInductName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Official Institutional / Corporate Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rsinghal@iima.ac.in"
                    value={inductEmail}
                    onChange={e => setInductEmail(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Institutional / Corporate Affiliation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIM Ahmedabad / McKinsey & Company"
                    value={inductOrganization}
                    onChange={e => setInductOrganization(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Professional Designation *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Professor of Strategic Management"
                    value={inductDesignation}
                    onChange={e => setInductDesignation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Primary Domain Speciality *
                  </label>
                  <select
                    value={inductSpeciality}
                    onChange={e => setInductSpeciality(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  >
                    <option value="Corporate Strategy & Growth">Corporate Strategy & Growth</option>
                    <option value="Financial Modeling & Valuation">Financial Modeling & Valuation</option>
                    <option value="Supply Chain & Operations">Supply Chain & Operations</option>
                    <option value="Marketing & Digital Consumer">Marketing & Digital Consumer</option>
                    <option value="Digital Transformation & AI">Digital Transformation & AI</option>
                    <option value="Energy, EV & Sustainability">Energy, EV & Sustainability</option>
                    <option value="Healthcare & Public Policy">Healthcare & Public Policy</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Secondary Speciality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ESG & Clean Energy"
                    value={inductSecondarySpeciality}
                    onChange={e => setInductSecondarySpeciality(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={inductExperience}
                    onChange={e => setInductExperience(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Max Case Deck Quota
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="30"
                    value={inductQuota}
                    onChange={e => setInductQuota(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Contact Mobile
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98000 00000"
                    value={inductMobile}
                    onChange={e => setInductMobile(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Highest Academic / Professional Credentials
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ph.D. Strategic Management (IIM-A), Fellow Wharton"
                  value={inductQualification}
                  onChange={e => setInductQualification(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Conflict-of-Interest Institutional Exclusions (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. IIM Ahmedabad, FMS Delhi (Institutes whose teams this evaluator is barred from assessing)"
                  value={inductConflictInstitutes}
                  onChange={e => setInductConflictInstitutes(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <p className="text-[10px] text-slate-500">
                  Per BRD Clause 9.1, automated blind allocation will never match submissions from these institutes to this jury member.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-800 dark:text-purple-300 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  <span>Dual-Blind Certification & NDA Compliance</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Inducted evaluators receive cryptographic credentials and blind evaluation scorecards where team identities and collegiate branding are redacted.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInductModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Induct Certified Evaluator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- MODERATION MODAL -------------------- */}
      {showModerationModal && targetEvalForModeration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-500" />
                <span>Super Admin Score Moderation</span>
              </h3>
              <button
                onClick={() => setShowModerationModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
              <div>Evaluation: <strong className="text-slate-900 dark:text-white">{targetEvalForModeration.id}</strong></div>
              <div>Evaluator: <strong className="text-slate-900 dark:text-white">{targetEvalForModeration.evaluatorName}</strong></div>
              <div>Original Jury Score: <strong className="text-slate-900 dark:text-white">{targetEvalForModeration.weightedTotal} / 100</strong></div>
            </div>

            <form onSubmit={handleSaveModeration} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Moderated Final Score (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={moderatedScore}
                  onChange={e => setModeratedScore(Number(e.target.value))}
                  className="w-full text-base font-black p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Audited Moderation Rationale
                </label>
                <textarea
                  rows={3}
                  required
                  value={moderationReason}
                  onChange={e => setModerationReason(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModerationModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Confirm Moderation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* -------------------- CREATE EVALUATION MODAL -------------------- */}
      {showAddEvalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-red-500" />
                <span>Log Official Jury Scorecard</span>
              </h3>
              <button
                onClick={() => setShowAddEvalModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddEvaluation} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Target Assessed Team
                </label>
                <select
                  value={newTeamId}
                  onChange={e => setNewTeamId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.instituteName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Assigned Certified Evaluator
                </label>
                <select
                  value={newEvaluatorName}
                  onChange={e => setNewEvaluatorName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                >
                  {juryMembers.map(jm => (
                    <option key={jm.id} value={`${jm.name} (${jm.organization || 'Jury Panel'})`}>
                      {jm.name} — {jm.speciality} ({jm.organization})
                    </option>
                  ))}
                  <option value="Dr. Arvind Sharma (Senior Jury)">Dr. Arvind Sharma (Senior Jury)</option>
                  <option value="Prof. Meenakshi Sundaram (IIM-B)">Prof. Meenakshi Sundaram (IIM-B)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    C1: Strategic Clarity (25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={newScoreC1}
                    onChange={e => setNewScoreC1(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    C2: Financial Depth (25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={newScoreC2}
                    onChange={e => setNewScoreC2(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    C3: Operational Feasibility (25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={newScoreC3}
                    onChange={e => setNewScoreC3(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-slate-400">
                    C4: Innovation & Risk (25)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="25"
                    value={newScoreC4}
                    onChange={e => setNewScoreC4(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Weighted Total Score (0 - 100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newWeightedTotal}
                  onChange={e => setNewWeightedTotal(Number(e.target.value))}
                  className="w-full text-base font-black p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Jury Critique & Summary Remarks
                </label>
                <textarea
                  rows={2}
                  value={newComments}
                  onChange={e => setNewComments(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEvalModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md hover:shadow-lg transition"
                >
                  Submit Scorecard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
