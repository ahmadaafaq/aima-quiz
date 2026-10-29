import React, { useState, useEffect, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizAttempt, UserProfile, QuizQuestion, CertificateRecord } from '../../types';
import { parseISTTimestamp, formatISTDateTime } from '../../lib/formatters';
import {
  fetchQuizAttemptById,
  fetchProgramQuestionsOrdered,
  toggleQuizProgramPublication,
  saveJuryScorecardToDb,
  fetchJuryEvaluationsFromDb,
  supabase,
} from '../../lib/supabase';
import { OFFICIAL_CASE_TRACKS } from '../../data/caseTracks';
import { sendFinalResultsEmail } from '../../lib/emailService';
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
  User,
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
  Send,
  Sparkles,
  AlertCircle,
  GraduationCap,
  Lock,
  ChevronDown,
  ChevronUp,
  Sliders,
  Save,
  FileText,
} from 'lucide-react';

export const CASE_STUDY_KPIS = [
  {
    id: 'problemIdentification',
    label: 'Problem identification and root-cause analysis',
    max: 15,
    desc: 'Clarity of core strategic challenges, business drivers, and contextual diagnosing.',
  },
  {
    id: 'caseQuestion1',
    label: 'Answer to Case Question 1',
    max: 15,
    desc: 'Direct analytical response, depth of reasoning, and addressing prompt question 1.',
  },
  {
    id: 'caseQuestion2',
    label: 'Answer to Case Question 2',
    max: 15,
    desc: 'Structured logical frameworks, financial/operational implications for prompt question 2.',
  },
  {
    id: 'caseQuestion3',
    label: 'Answer to Case Question 3',
    max: 15,
    desc: 'Strategic recommendations, scenario considerations, and response to prompt question 3.',
  },
  {
    id: 'strategicAlternatives',
    label: 'Strategic alternatives and recommended strategy',
    max: 20,
    desc: 'Evaluation of competitive trade-offs, positioning, risk analysis, and cohesive strategy.',
  },
  {
    id: 'executionPlan',
    label: 'Execution plan and feasibility',
    max: 15,
    desc: 'Actionable timeline, milestones, resource allocation, change governance, and ROI viability.',
  },
  {
    id: 'caseDataEvidence',
    label: 'Use of case data, evidence and assumptions',
    max: 5,
    desc: 'Grounded in exhibit facts, data justification, and realistic business assumptions.',
  },
] as const;

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
    offlineRoundResults,
    recordOfflineResultsBulk,
    certificates,
    publishOfficialCertificates,
    setActiveCertificateModal,
  } = useCompetition();

  useEffect(() => {
    refreshQuizPrograms();
    refreshQuizAttempts();
  }, []);

  const [selectedProgramId, setSelectedProgramId] = useState<string>(initialProgramId || 'all');

  // Keep 'Case Competition – Stage 1' by default selected
  useEffect(() => {
    if ((!selectedProgramId || selectedProgramId === 'all') && quizPrograms && quizPrograms.length > 0) {
      const stage1Prog = quizPrograms.find(
        p =>
          p.code === 'AIMA-CL26-S1-QZ' ||
          p.id === 'prog_stage1_screening' ||
          p.title?.toLowerCase().includes('stage 1') ||
          p.title?.toLowerCase().includes('case competition')
      );
      if (stage1Prog) {
        setSelectedProgramId(stage1Prog.id);
      }
    }
  }, [quizPrograms, selectedProgramId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'qualified' | 'disqualified'>('all');
  const [rankingMode, setRankingMode] = useState<'round_1' | 'combined'>('combined');
  const [selectedAttemptForReview, setSelectedAttemptForReview] = useState<QuizAttempt | null>(null);
  const [modalQuestions, setModalQuestions] = useState<QuizQuestion[]>([]);
  const [isLoadingAttemptDetails, setIsLoadingAttemptDetails] = useState<boolean>(false);
  const [modalFilter, setModalFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [cutoffInput, setCutoffInput] = useState<string>('');
  const [isSavingCutoff, setIsSavingCutoff] = useState<boolean>(false);
  const [cutoffSaveSuccess, setCutoffSaveSuccess] = useState<boolean>(false);

  // Expandable Team Accordion State
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());
  const [activeSquadMembersModal, setActiveSquadMembersModal] = useState<any | null>(null);

  const toggleTeamAccordion = (teamId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    setExpandedTeamIds(prev => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  };

  // Case Study Presentation Jury Evaluation States
  const [expandedJuryUserId, setExpandedJuryUserId] = useState<string | null>(null);
  const [activeJuryRow, setActiveJuryRow] = useState<any | null>(null);
  const [juryFormData, setJuryFormData] = useState<{
    track: string;
    evaluatorName: string;
    problemIdentification: number | string;
    caseQuestion1: number | string;
    caseQuestion2: number | string;
    caseQuestion3: number | string;
    strategicAlternatives: number | string;
    executionPlan: number | string;
    caseDataEvidence: number | string;
    notes: string;
    attendanceVerified: boolean;
  }>({
    track: '',
    evaluatorName: 'AIMA National Jury Panel',
    problemIdentification: 0,
    caseQuestion1: 0,
    caseQuestion2: 0,
    caseQuestion3: 0,
    strategicAlternatives: 0,
    executionPlan: 0,
    caseDataEvidence: 0,
    notes: '',
    attendanceVerified: true,
  });

  const currentJuryFormTotal = useMemo(() => {
    return (
      (Number(juryFormData.problemIdentification) || 0) +
      (Number(juryFormData.caseQuestion1) || 0) +
      (Number(juryFormData.caseQuestion2) || 0) +
      (Number(juryFormData.caseQuestion3) || 0) +
      (Number(juryFormData.strategicAlternatives) || 0) +
      (Number(juryFormData.executionPlan) || 0) +
      (Number(juryFormData.caseDataEvidence) || 0)
    );
  }, [juryFormData]);
  const [isSavingJury, setIsSavingJury] = useState<boolean>(false);
  const [jurySaveFeedback, setJurySaveFeedback] = useState<{ userId: string; msg: string; isError?: boolean } | null>(null);
  const [dbJuryEvaluations, setDbJuryEvaluations] = useState<any[]>([]);

  // Fetch live jury evaluations from dedicated DB table
  useEffect(() => {
    fetchJuryEvaluationsFromDb('round_2').then(data => {
      if (data && data.length > 0) {
        setDbJuryEvaluations(data);
      }
    }).catch(err => console.warn('Could not load jury evaluations from DB:', err));
  }, []);

  // Review Modal Compact View Toggle
  const [isCompactReview, setIsCompactReview] = useState<boolean>(true);
  const [expandedExplanationQId, setExpandedExplanationQId] = useState<string | null>(null);

  // Helper to fetch jury evaluation for a specific candidate/team
  const getRowJuryScorecard = (row: {
    userId: string;
    teamId?: string;
    registrationNumber?: string;
    teamName?: string;
    email?: string;
    members?: any[];
  }) => {
    // 1. Direct check against live Supabase DB evaluations
    const dbEval = dbJuryEvaluations.find(
      d =>
        (row.registrationNumber && d.registration_number === row.registrationNumber) ||
        (row.teamId && d.team_id === row.teamId) ||
        (row.email && d.candidate_email && d.candidate_email.toLowerCase() === row.email.toLowerCase().trim()) ||
        (row.members && row.members.some((m: any) =>
          (m.registrationNumber && d.registration_number === m.registrationNumber) ||
          (m.email && d.candidate_email && d.candidate_email.toLowerCase() === m.email.toLowerCase().trim())
        ))
    );

    const contextScorecard = offlineRoundResults.find(
      r =>
        (row.teamId && r.teamId === row.teamId) ||
        (row.registrationNumber && (r as any).registrationNumber === row.registrationNumber) ||
        (row.teamName && row.teamName !== 'Individual Entry' && r.teamName === row.teamName) ||
        r.teamId === row.userId
    );

    if (dbEval) {
      const kpiSum =
        (Number(dbEval.problem_identification) || 0) +
        (Number(dbEval.case_question_1) || 0) +
        (Number(dbEval.case_question_2) || 0) +
        (Number(dbEval.case_question_3) || 0) +
        (Number(dbEval.strategic_alternatives) || 0) +
        (Number(dbEval.execution_plan) || 0) +
        (Number(dbEval.case_data_evidence) || 0);

      const dbScore =
        dbEval.total_score !== undefined && dbEval.total_score !== null && Number(dbEval.total_score) > 0
          ? Number(dbEval.total_score)
          : (kpiSum > 0 ? kpiSum : undefined);

      if (dbScore !== undefined || dbEval.evaluated_at) {
        return {
          ...contextScorecard,
          livePresentationScore: dbScore ?? contextScorecard?.livePresentationScore ?? 0,
          presentationMaxMarks: 100,
          trackName: dbEval.track_name || contextScorecard?.trackName || 'Track Assigned',
          trackBadge: dbEval.track_badge || contextScorecard?.trackBadge,
          trackId: dbEval.track_id || contextScorecard?.trackId,
          masterCaseTitle: dbEval.master_case_title || contextScorecard?.masterCaseTitle,
          attendanceVerified: dbEval.attendance_verified ?? contextScorecard?.attendanceVerified ?? true,
          notes: dbEval.jury_feedback || contextScorecard?.notes || '',
          qualifiedNextRound: dbEval.is_qualified ?? (dbScore ? dbScore >= 60 : false),
          evaluatedBy: dbEval.evaluated_by || 'AIMA National Jury Panel',
        };
      }
    }

    return contextScorecard;
  };

  // Toggle the jury presentation accordion for a candidate/team (only enabled when round 1 results published)
  const handleToggleJuryAccordion = (row: {
    userId: string;
    email?: string;
    teamId?: string;
    registrationNumber?: string;
    teamName?: string;
    instituteName?: string;
    userProfile?: UserProfile;
    score: number;
  }) => {
    if (!isResultsPublished) {
      return;
    }

    const targetRowKey = (row as any).id || row.userId;
    if (expandedJuryUserId === targetRowKey || expandedJuryUserId === row.userId) {
      setExpandedJuryUserId(null);
      setActiveJuryRow(null);
      return;
    }

    // 1. Check live jury_evaluations table record from DB
    const dbEval = dbJuryEvaluations.find(
      d =>
        (row.registrationNumber && d.registration_number === row.registrationNumber) ||
        (row.teamId && d.team_id === row.teamId) ||
        (row.email && d.candidate_email && d.candidate_email.toLowerCase() === row.email.toLowerCase().trim())
    );

    const existing = getRowJuryScorecard(row);

    const rowContextTeam = teams.find(
      t => (row.teamId && t.id === row.teamId) || (row.teamName && t.name === row.teamName)
    );

    const rawTrackId =
      dbEval?.track_id ||
      row.userProfile?.selectedTrackId ||
      (row.userProfile as any)?.trackName ||
      rowContextTeam?.selectedTrackId ||
      rowContextTeam?.selectedTrackName ||
      (row as any).attemptData?.selectedTrackId ||
      existing?.trackId;

    const matchedOfficial = OFFICIAL_CASE_TRACKS.find(
      t => t.id === rawTrackId || t.name.toLowerCase() === (dbEval?.track_name || rawTrackId || '').toLowerCase()
    );

    const hasChosenTrack = Boolean(
      rawTrackId ||
      matchedOfficial ||
      dbEval?.track_name ||
      row.userProfile?.selectedTrackName ||
      rowContextTeam?.selectedTrackName ||
      existing?.trackName
    );

    const isRowQualified = (row as any).isQualified ?? (row.score >= effectiveCutoff);

    // Safeguard: Do not allow opening Jury evaluation if below cutoff or no track chosen
    if (!isResultsPublished || !isRowQualified || !hasChosenTrack) {
      return;
    }

    const resolvedTrackDisplayName = matchedOfficial
      ? `${matchedOfficial.badge} • ${matchedOfficial.name}`
      : (dbEval?.track_name || row.userProfile?.selectedTrackName || existing?.trackName || 'General Management & Corporate Strategy');

    if (dbEval && (dbEval.total_score > 0 || dbEval.evaluated_at || dbEval.attendance_verified)) {
      const rawPId = Number(dbEval.problem_identification) || 0;
      const rawQ1 = Number(dbEval.case_question_1) || 0;
      const rawQ2 = Number(dbEval.case_question_2) || 0;
      const rawQ3 = Number(dbEval.case_question_3) || 0;
      const rawStrat = Number(dbEval.strategic_alternatives) || 0;
      const rawExec = Number(dbEval.execution_plan) || 0;
      const rawDataEv = Number(dbEval.case_data_evidence) || 0;
      const kpiSum = rawPId + rawQ1 + rawQ2 + rawQ3 + rawStrat + rawExec + rawDataEv;

      const totalVal = Number(dbEval.total_score) || 0;

      // If KPI fields are explicitly present, use them. If only total_score is known but KPI columns are 0, proportion them.
      const pId = kpiSum > 0 ? rawPId : (totalVal > 0 ? Math.round(totalVal * 0.15) : 0);
      const q1 = kpiSum > 0 ? rawQ1 : (totalVal > 0 ? Math.round(totalVal * 0.15) : 0);
      const q2 = kpiSum > 0 ? rawQ2 : (totalVal > 0 ? Math.round(totalVal * 0.15) : 0);
      const q3 = kpiSum > 0 ? rawQ3 : (totalVal > 0 ? Math.round(totalVal * 0.15) : 0);
      const strat = kpiSum > 0 ? rawStrat : (totalVal > 0 ? Math.round(totalVal * 0.20) : 0);
      const exec = kpiSum > 0 ? rawExec : (totalVal > 0 ? Math.round(totalVal * 0.15) : 0);
      const dataEv = kpiSum > 0 ? rawDataEv : (totalVal > 0 ? Math.max(0, totalVal - (pId + q1 + q2 + q3 + strat + exec)) : 0);

      setJuryFormData({
        track: resolvedTrackDisplayName,
        evaluatorName: dbEval.evaluated_by || 'AIMA National Jury Panel',
        problemIdentification: pId,
        caseQuestion1: q1,
        caseQuestion2: q2,
        caseQuestion3: q3,
        strategicAlternatives: strat,
        executionPlan: exec,
        caseDataEvidence: dataEv,
        notes: dbEval.jury_feedback || '',
        attendanceVerified: dbEval.attendance_verified !== false,
      });
    } else if (existing) {
      const kpis = (existing as any).kpiScores || (existing as any).kpi_scores || {};
      setJuryFormData({
        track: resolvedTrackDisplayName,
        evaluatorName: existing.evaluatedBy || 'AIMA National Jury Panel',
        problemIdentification: kpis.problemIdentification ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.15) : 0),
        caseQuestion1: kpis.caseQuestion1 ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.15) : 0),
        caseQuestion2: kpis.caseQuestion2 ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.15) : 0),
        caseQuestion3: kpis.caseQuestion3 ?? (existing.qaDefenseScore ?? 0),
        strategicAlternatives: kpis.strategicAlternatives ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.20) : 0),
        executionPlan: kpis.executionPlan ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.15) : 0),
        caseDataEvidence: kpis.caseDataEvidence ?? (existing.livePresentationScore ? Math.round(existing.livePresentationScore * 0.05) : 0),
        notes: existing.notes || (existing as any).evaluatorPanelNotes || '',
        attendanceVerified: existing.attendanceVerified !== false,
      });
    } else {
      setJuryFormData({
        track: resolvedTrackDisplayName,
        evaluatorName: 'AIMA National Jury Panel',
        problemIdentification: 0,
        caseQuestion1: 0,
        caseQuestion2: 0,
        caseQuestion3: 0,
        strategicAlternatives: 0,
        executionPlan: 0,
        caseDataEvidence: 0,
        notes: '',
        attendanceVerified: true,
      });
    }
    setExpandedJuryUserId(targetRowKey);
    setActiveJuryRow(row);

    // On desktop screens, smoothly scroll table container and scroll accordion into view
    setTimeout(() => {
      if (window.innerWidth >= 768) {
        const accordionEl = document.getElementById(`${targetRowKey}_jury_accordion`);
        if (accordionEl) {
          accordionEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }, 100);
  };

  // Save the entered KPI scores for case study presentation to Database
  const handleSaveJuryEvaluation = async (row: {
    userId: string;
    email?: string;
    teamId?: string;
    registrationNumber?: string;
    teamName?: string;
    instituteName?: string;
    userProfile?: UserProfile;
    score: number;
  }) => {
    setIsSavingJury(true);
    try {
      const pId = Math.min(15, Math.max(0, Number(juryFormData.problemIdentification) || 0));
      const q1 = Math.min(15, Math.max(0, Number(juryFormData.caseQuestion1) || 0));
      const q2 = Math.min(15, Math.max(0, Number(juryFormData.caseQuestion2) || 0));
      const q3 = Math.min(15, Math.max(0, Number(juryFormData.caseQuestion3) || 0));
      const strat = Math.min(20, Math.max(0, Number(juryFormData.strategicAlternatives) || 0));
      const exec = Math.min(15, Math.max(0, Number(juryFormData.executionPlan) || 0));
      const dataEv = Math.min(5, Math.max(0, Number(juryFormData.caseDataEvidence) || 0));

      const total = pId + q1 + q2 + q3 + strat + exec + dataEv;

      const kpiPayload = {
        problemIdentification: pId,
        caseQuestion1: q1,
        caseQuestion2: q2,
        caseQuestion3: q3,
        strategicAlternatives: strat,
        executionPlan: exec,
        caseDataEvidence: dataEv,
        totalScore: total,
      };

      const dbEval = dbJuryEvaluations.find(
        d =>
          (row.registrationNumber && d.registration_number === row.registrationNumber) ||
          (row.teamId && d.team_id === row.teamId) ||
          (row.email && d.candidate_email && d.candidate_email.toLowerCase() === row.email.toLowerCase().trim())
      );

      const rawTrackId =
        dbEval?.track_id ||
        row.userProfile?.selectedTrackId ||
        (row.userProfile as any)?.trackName ||
        (row as any).attemptData?.selectedTrackId;

      const matchedOfficial = OFFICIAL_CASE_TRACKS.find(
        t => t.id === rawTrackId || t.name.toLowerCase() === (dbEval?.track_name || juryFormData.track || '').toLowerCase()
      );

      const resolvedTrack = matchedOfficial
        ? `${matchedOfficial.badge} • ${matchedOfficial.name}`
        : (juryFormData.track || 'General Management & Corporate Strategy');

      const scorecardPayload = {
        registrationNumber: row.registrationNumber || '',
        candidateEmail: row.email,
        userId: row.userId,
        teamId: row.teamId || row.userId,
        teamName: row.teamName || 'Team Entry',
        instituteName: row.instituteName || 'Management Institute',
        round: 'round_2' as const,
        trackId: matchedOfficial?.id || dbEval?.track_id || 'operations',
        trackName: matchedOfficial?.name || dbEval?.track_name || resolvedTrack,
        trackBadge: matchedOfficial?.badge || dbEval?.track_badge,
        masterCaseTitle: matchedOfficial?.masterCaseTitle || dbEval?.master_case_title,
        offlineQuizScore: row.score,
        livePresentationScore: total,
        presentationMaxMarks: 100,
        qaDefenseScore: q3,
        aggregateScore: Math.round(row.score * 0.4 + total * 0.6),
        rank: 1,
        attendanceVerified: juryFormData.attendanceVerified,
        qualifiedNextRound: total >= 60,
        notes: juryFormData.notes,
        evaluatedBy: 'AIMA National Jury Panel',
        kpiScores: kpiPayload,
      };

      // 1. Persist directly to Supabase Database (jury_evaluations table & registrations)
      const dbRes = await saveJuryScorecardToDb(scorecardPayload);
      if (!dbRes.success) {
        throw new Error(dbRes.error || 'Failed to update database record');
      }

      // Update local dbJuryEvaluations state
      setDbJuryEvaluations(prev => {
        const item = {
          registration_number: scorecardPayload.registrationNumber,
          team_id: scorecardPayload.teamId,
          candidate_email: scorecardPayload.candidateEmail,
          track_id: scorecardPayload.trackId,
          track_name: scorecardPayload.trackName,
          track_badge: scorecardPayload.trackBadge,
          master_case_title: scorecardPayload.masterCaseTitle,
          problem_identification: pId,
          case_question_1: q1,
          case_question_2: q2,
          case_question_3: q3,
          strategic_alternatives: strat,
          execution_plan: exec,
          case_data_evidence: dataEv,
          total_score: total,
          attendance_verified: juryFormData.attendanceVerified,
          jury_feedback: juryFormData.notes,
          is_qualified: total >= 60,
          evaluated_by: scorecardPayload.evaluatedBy,
          evaluated_at: new Date().toISOString(),
        };
        const idx = prev.findIndex(
          p =>
            (item.registration_number && p.registration_number === item.registration_number) ||
            (item.candidate_email && p.candidate_email && p.candidate_email.toLowerCase() === item.candidate_email.toLowerCase()) ||
            (item.team_id && p.team_id === item.team_id)
        );
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...item };
          return next;
        }
        return [...prev, item];
      });

      // 2. Persist to Context state so UI updates in real-time
      recordOfflineResultsBulk('round_2', [scorecardPayload]);

      addAuditLog(
        'Case Presentation Evaluated',
        'Evaluation',
        `AIMA Coordinator recorded jury marks for "${row.teamName}" (${row.instituteName}): Total ${total}/100 pts [Track: ${resolvedTrack}]`
      );

      setJurySaveFeedback({
        userId: row.userId,
        msg: `✓ Evaluation for "${row.teamName}" saved to database (${total}/100 marks)!`,
      });
      setTimeout(() => {
        setJurySaveFeedback(null);
      }, 5000);

      // Automatically close accordion/modal & smoothly scroll up with transition to show listing table
      setExpandedJuryUserId(null);
      setActiveJuryRow(null);
      const targetRowId = (row as any).id || row.userId;
      setTimeout(() => {
        const rowElem = document.getElementById(`row-${targetRowId}`) || document.getElementById(`row-${row.userId}`);
        if (rowElem) {
          rowElem.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          const tableElem = document.getElementById('leaderboard-table-container');
          if (tableElem) {
            tableElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }
      }, 120);
    } catch (err: any) {
      console.error('Error saving jury scorecard:', err);
      setJurySaveFeedback({
        userId: row.userId,
        msg: `Failed to save evaluation to database: ${err.message}`,
        isError: true,
      });
    } finally {
      setIsSavingJury(false);
    }
  };

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
      await refreshQuizPrograms();
      await refreshQuizAttempts();
      const freshEvals = await fetchJuryEvaluationsFromDb('round_2');
      if (freshEvals && freshEvals.length > 0) {
        setDbJuryEvaluations(freshEvals);
      }
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Helper to normalize program status strictly depending on schedule window (matching QuizProgramManager)
  const getNormalizedStatus = (progStatus: string, startDate?: string, endDate?: string): 'active' | 'upcoming' | 'completed' | 'draft' | 'paused' => {
    if (progStatus === 'draft') return 'draft';
    if (progStatus === 'paused') return 'paused';

    const s = parseISTTimestamp(startDate);
    const e = parseISTTimestamp(endDate);
    const now = Date.now();

    if (!isNaN(e) && now > e) return 'completed';
    if (!isNaN(s) && now < s) return 'upcoming';
    if (!isNaN(s) && (!isNaN(e) ? now <= e : true) && now >= s) return 'active';

    if (progStatus === 'completed') return 'completed';
    if (progStatus === 'live' || progStatus === 'active') return 'active';
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

        // 1. Immediately lock local cutoff input to the target value
        setCutoffInput(String(num));

        // 2. Persist to context and AWAIT the database update
        await updateQuizProgram(selectedProgram.id, {
          cutoffScore: num,
          passingMarks: passingMarks,
        });

        // 3. Keep master competition config aligned
        updateConfig({ r1CutoffScore: num });

        addAuditLog(
          'Quiz Program Cutoff Configured',
          'Quiz',
          `Super Admin updated cutoff for "${selectedProgram.title}" to ${num}% (${passingMarks} pts)`
        );

        // 4. Now safe to re-fetch freshly committed values from DB
        await refreshQuizPrograms();
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
    await updateQuizProgram(selectedProgram.id, {
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

  // Determine final combined results publication status (Master flag across both rounds)
  const isFinalResultsPublished = Boolean(
    config?.isFinalResultsPublished ||
    (config as any)?.is_final_results_published ||
    (selectedProgram as any)?.isFinalResultsPublished ||
    (typeof localStorage !== 'undefined' && localStorage.getItem('AIMA_FINAL_RESULTS_PUBLISHED') === 'true')
  );

  const [isTogglingFinalResults, setIsTogglingFinalResults] = useState(false);

  const handleTogglePublishFinalResults = async () => {
    setIsTogglingFinalResults(true);
    const nextState = !isFinalResultsPublished;
    try {
      // 1. LocalStorage immediate persistence
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('AIMA_FINAL_RESULTS_PUBLISHED', String(nextState));
      }

      // 2. Update Competition Context config
      await updateConfig({
        isFinalResultsPublished: nextState,
        isPublicResultsPublished: true,
      });

      // 3. Persist system-level override in Supabase registrations table
      try {
        const { data: existingSys } = await supabase
          .from('registrations')
          .select('*')
          .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
          .maybeSingle();

        const raw = existingSys?.raw_data || {};
        const now = new Date().toISOString();
        if (existingSys) {
          await supabase
            .from('registrations')
            .update({
              raw_data: { ...raw, isFinalResultsPublished: nextState, updatedAt: now },
            })
            .eq('id', existingSys.id);
        } else {
          await supabase.from('registrations').insert([
            {
              registration_number: 'AIMA_SYSTEM_QUIZ_CONFIG',
              contact_email: 'system@aima.in',
              team_name: 'AIMA System Settings',
              raw_data: { isFinalResultsPublished: nextState, updatedAt: now },
              created_at: now,
              updated_at: now,
            },
          ]);
        }
      } catch (sysErr) {
        console.warn('Could not persist final results flag in registrations:', sysErr);
      }

      // 4. Update competition_config table if possible
      try {
        await supabase
          .from('competition_config')
          .update({
            is_public_results_published: true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', 'default');
      } catch (cfgErr) {
        console.warn('competition_config update notice:', cfgErr);
      }

      // 5. If selected program exists, also update quiz_programs table
      if (selectedProgram && selectedProgram.id) {
        await updateQuizProgram(selectedProgram.id, {
          isResultsPublished: true,
          is_results_published: true,
        });
        await toggleQuizProgramPublication(selectedProgram.id, true);
        await refreshQuizPrograms();
      }

      addAuditLog(
        nextState ? 'Final Combined Results Published' : 'Final Combined Results Unpublished',
        'Results',
        `Super Administrator ${nextState ? 'published' : 'unpublished'} official final combined results (Round 1 Quiz + Round 2 Jury Defense). Visible to candidates and institutions.`
      );
    } finally {
      setIsTogglingFinalResults(false);
    }
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

  // 2. Map relevant attempts to candidate and team data (individual attempt level)
  const enrichedLeaderboard = useMemo(() => {
    return relevantAttempts.map(attempt => {
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

      const teamId = userTeam?.id || attempt.teamId;
      const isTeam = !!teamId && userTeam?.name !== 'Individual Entry';

      return {
        userId: attempt.studentId || attempt.userId || attempt.attemptId,
        name: user?.name || attempt.candidateName || 'Candidate #' + (attempt.studentId || '').slice(0, 8),
        email: user?.email || attempt.participantEmail || 'N/A',
        studentIdCardNumber: user?.studentIdCardNumber,
        registrationNumber: attempt.registrationNumber || user?.studentIdCardNumber || 'AIMA-CL26-00000',
        instituteName: user?.instituteName || institute?.name || attempt.instituteName || 'Independent B-School',
        instituteCity: institute?.city || 'India',
        teamName: userTeam?.name || 'Individual Entry',
        teamId,
        isTeam,
        isTeamLeader: Boolean(user?.isTeamLeader || (userTeam && userTeam.leaderId === user?.id)),
        score,
        analyticalScore,
        timeTaken,
        tabSwitches,
        isCompleted: true,
        isQualified: score >= effectiveCutoff,
        submittedAt: attempt.submittedAt || (attempt as any).submitted_at || (attempt as any).completedAt || (attempt as any).createdAt,
        attemptData: attempt,
        userProfile: user,
      };
    });
  }, [relevantAttempts, users, teams, institutions, effectiveCutoff]);

  // 3. Group Leaderboard into Team Entries and Solo Entries
  const groupedLeaderboard = useMemo(() => {
    const teamMap = new Map<string, {
      id: string;
      entryType: 'team';
      isTeam: true;
      teamId: string;
      teamName: string;
      instituteName: string;
      instituteCity: string;
      registrationNumber?: string;
      userProfile?: UserProfile;
      members: Array<{
        userId: string;
        name: string;
        email: string;
        studentIdCardNumber?: string;
        registrationNumber?: string;
        isTeamLeader: boolean;
        score: number;
        analyticalScore: number;
        timeTaken: number;
        tabSwitches: number;
        submittedAt?: string;
        attemptData: QuizAttempt;
        userProfile?: UserProfile;
      }>;
      submittedAt?: string;
    }>();

    const soloList: Array<any> = [];

    enrichedLeaderboard.forEach(item => {
      if (item.isTeam && item.teamId) {
        let teamEntry = teamMap.get(item.teamId);
        if (!teamEntry) {
          teamEntry = {
            id: item.teamId,
            entryType: 'team',
            isTeam: true,
            teamId: item.teamId,
            teamName: item.teamName,
            instituteName: item.instituteName,
            instituteCity: item.instituteCity,
            registrationNumber: item.registrationNumber,
            userProfile: item.userProfile,
            members: [],
            submittedAt: item.submittedAt,
          };
          teamMap.set(item.teamId, teamEntry);
        }

        teamEntry.members.push({
          userId: item.userId,
          name: item.name,
          email: item.email,
          studentIdCardNumber: item.studentIdCardNumber,
          registrationNumber: item.registrationNumber,
          isTeamLeader: item.isTeamLeader,
          score: item.score,
          analyticalScore: item.analyticalScore,
          timeTaken: item.timeTaken,
          tabSwitches: item.tabSwitches,
          submittedAt: item.submittedAt,
          attemptData: item.attemptData,
          userProfile: item.userProfile,
        });

        if (item.submittedAt && (!teamEntry.submittedAt || new Date(item.submittedAt) > new Date(teamEntry.submittedAt))) {
          teamEntry.submittedAt = item.submittedAt;
        }
      } else {
        soloList.push({
          id: item.userId,
          entryType: 'solo',
          isTeam: false,
          teamId: undefined,
          teamName: 'Individual Entry',
          instituteName: item.instituteName,
          instituteCity: item.instituteCity,
          userId: item.userId,
          name: item.name,
          email: item.email,
          registrationNumber: item.registrationNumber,
          userProfile: item.userProfile,
          attemptData: item.attemptData,
          score: item.score,
          analyticalScore: item.analyticalScore,
          timeTaken: item.timeTaken,
          tabSwitches: item.tabSwitches,
          isQualified: item.score >= effectiveCutoff,
          submittedAt: item.submittedAt,
          members: [],
        });
      }
    });

    // Format teams with aggregated scores
    const teamEntries = Array.from(teamMap.values()).map(t => {
      const count = t.members.length;
      const totalScore = t.members.reduce((acc, m) => acc + m.score, 0);
      const avgScore = count > 0 ? Math.round(totalScore / count) : 0;
      const totalAnalytical = t.members.reduce((acc, m) => acc + m.analyticalScore, 0);
      const avgAnalytical = count > 0 ? Math.round(totalAnalytical / count) : 0;
      const totalTime = t.members.reduce((acc, m) => acc + m.timeTaken, 0);
      const avgTime = count > 0 ? Math.round(totalTime / count) : 0;
      const totalTabSwitches = t.members.reduce((acc, m) => acc + m.tabSwitches, 0);

      // Leader member if any
      const leader = t.members.find(m => m.isTeamLeader) || t.members[0];

      return {
        id: t.id,
        entryType: 'team' as const,
        isTeam: true as const,
        teamId: t.teamId,
        teamName: t.teamName,
        instituteName: t.instituteName,
        instituteCity: t.instituteCity,
        userId: t.teamId, // Use teamId for Jury mapping
        name: t.teamName,
        email: leader?.email || '',
        registrationNumber: leader?.registrationNumber || t.registrationNumber,
        userProfile: leader?.userProfile || t.userProfile,
        attemptData: leader?.attemptData,
        score: avgScore, // Cumulative average score
        analyticalScore: avgAnalytical,
        timeTaken: avgTime,
        tabSwitches: totalTabSwitches,
        isQualified: avgScore >= effectiveCutoff,
        submittedAt: t.submittedAt,
        members: t.members,
      };
    });

    return [...teamEntries, ...soloList];
  }, [enrichedLeaderboard, effectiveCutoff]);

  // Enrich leaderboard entries with Presentation Score & Combined Grand Totals
  const leaderboardWithCombinedScores = useMemo(() => {
    return groupedLeaderboard.map((row) => {
      const jury = getRowJuryScorecard(row);
      const dbEval = dbJuryEvaluations.find(
        d =>
          (row.registrationNumber && d.registration_number === row.registrationNumber) ||
          (row.teamId && d.team_id === row.teamId) ||
          (row.email && d.candidate_email && d.candidate_email.toLowerCase() === row.email.toLowerCase().trim()) ||
          (row.members && row.members.some((m: any) =>
            (m.registrationNumber && d.registration_number === m.registrationNumber) ||
            (m.email && d.candidate_email && d.candidate_email.toLowerCase() === m.email.toLowerCase().trim())
          ))
      );
      const dbScore =
        dbEval?.total_score !== undefined && dbEval?.total_score !== null && Number(dbEval.total_score) > 0
          ? Number(dbEval.total_score)
          : undefined;
      const presentationScore = jury?.livePresentationScore ?? dbScore;
      const hasPresentation = presentationScore !== undefined;
      const validPresentationScore = hasPresentation ? Number(presentationScore) : 0;
      const quizScore = Number(row.score) || 0;
      const tieBreakerScore = Number(row.analyticalScore) || 0;
      const combinedScore = quizScore + validPresentationScore;
      const presentationTrackName = jury?.trackName || dbEval?.track_name;

      return {
        ...row,
        presentationScore,
        hasPresentation,
        validPresentationScore,
        presentationTrackName,
        quizScore,
        tieBreakerScore,
        combinedScore,
      };
    });
  }, [groupedLeaderboard, dbJuryEvaluations, offlineRoundResults]);

  // Count candidates / teams who have both Round 1 quiz score and Round 2 jury marks
  const countWithBothRounds = useMemo(() => {
    return (leaderboardWithCombinedScores || []).filter(
      r => (Number(r.score) > 0 || r.isCompleted) && r.hasPresentation
    ).length;
  }, [leaderboardWithCombinedScores]);

  // Official Ranking Sorting:
  // When rankingMode === 'combined':
  // 1. Grand Combined Total Score (desc - Screening Quiz 100 + Case Presentation 100 = 200 pts)
  // 2. Offline Case Presentation Score evaluated by Jury (desc - 100 pts)
  // 3. 5 Reserve Analytical Tie-Breaker Questions Score (desc - Q26 to Q30, 20 pts)
  // 4. Screening Quiz Score (desc - 100 pts)
  // 5. Lowest Time Taken in Quiz (asc)
  // 6. Lowest Tab Switches (asc)
  //
  // When rankingMode === 'round_1':
  // 1. Screening Quiz Score (desc - 100 pts)
  // 2. 5 Reserve Analytical Tie-Breaker Questions Score (desc - Q26 to Q30, 20 pts)
  // 3. Lowest Time Taken (asc)
  // 4. Lowest Tab Switches (asc)
  const sortedLeaderboard = useMemo(() => {
    return [...leaderboardWithCombinedScores].sort((a, b) => {
      if (rankingMode === 'combined') {
        if (b.combinedScore !== a.combinedScore) return b.combinedScore - a.combinedScore;
        if (b.validPresentationScore !== a.validPresentationScore) {
          return b.validPresentationScore - a.validPresentationScore;
        }
        if (b.tieBreakerScore !== a.tieBreakerScore) return b.tieBreakerScore - a.tieBreakerScore;
        if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
        if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
        return a.tabSwitches - b.tabSwitches;
      } else {
        if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
        if (b.tieBreakerScore !== a.tieBreakerScore) return b.tieBreakerScore - a.tieBreakerScore;
        if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
        return a.tabSwitches - b.tabSwitches;
      }
    });
  }, [leaderboardWithCombinedScores, rankingMode]);

  // Certificate Publishing & Dispatch Cockpit States
  const [showCertificateCockpit, setShowCertificateCockpit] = useState<boolean>(false);
  const [selectionTopPercentage, setSelectionTopPercentage] = useState<number>(25);
  const [isPublishingCerts, setIsPublishingCerts] = useState<boolean>(false);
  const [isEmailingCerts, setIsEmailingCerts] = useState<boolean>(false);
  const [emailingCertId, setEmailingCertId] = useState<string | null>(null);
  const [certPublishStatus, setCertPublishStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [certSearchQuery, setCertSearchQuery] = useState<string>('');
  const [certFilterCategory, setCertFilterCategory] = useState<'all' | 'achievement' | 'selection' | 'participation'>('all');

  // Compute official certificates based on calculated rankings
  const selectionCutoffRank = Math.max(2, Math.ceil(sortedLeaderboard.length * (selectionTopPercentage / 100)));

  const computedCertificates = useMemo(() => {
    return sortedLeaderboard.map((item, idx) => {
      const rank = idx + 1;
      let achievement: string = 'CERTIFICATE OF PARTICIPATION';
      let category: 'achievement' | 'selection' | 'participation' = 'participation';

      if (rank === 1) {
        achievement = 'CERTIFICATE OF ACHIEVEMENT - TOP 1 POSITION';
        category = 'achievement';
      } else if (rank <= selectionCutoffRank) {
        achievement = 'CERTIFICATE OF SELECTION - GRAND FINALE';
        category = 'selection';
      } else {
        achievement = 'CERTIFICATE OF PARTICIPATION';
        category = 'participation';
      }

      // If team entry, determine leader details for candidate-level certificate
      const leaderMember = item.members?.find((m: any) => m.isTeamLeader) || item.members?.[0];
      const recipientName = item.isTeam ? (leaderMember?.name || item.name) : item.name;
      const recipientEmail = (item.email || leaderMember?.email || item.members?.[0]?.email || '').trim();
      const teamName = item.isTeam ? item.name : (item.userProfile?.teamName || item.name);
      const institute = item.instituteName || item.userProfile?.instituteName || 'ICFAI Business School (IBS) Bengaluru';
      const certNum = `AIMA-ICL-2026-${category.toUpperCase().slice(0, 3)}-${String(rank).padStart(3, '0')}-${Math.floor(1000 + (rank * 137) % 9000)}`;

      const cert: CertificateRecord = {
        id: `cert_${item.id || idx}_${category}`,
        certificateNumber: certNum,
        recipientName,
        recipientEmail,
        recipientRole: item.isTeam ? 'Team Leader' : 'Participant',
        recipientId: item.isTeam ? leaderMember?.userId || leaderMember?.id || item.id : item.id,
        teamId: item.id,
        teamName,
        registrationNumber: item.registrationNumber,
        institute,
        achievement,
        certificateCategory: category,
        selectionTopPercentage,
        issueDate: '29 October 2026',
        qrVerificationUrl: `https://research.aima.in/verify/${certNum}`,
        authorizedSignatory: 'DR. ANUJA PANDEY',
        signatoryTitle: 'HEAD AIMA ICRC',
      };

      return {
        ...item,
        rank,
        category,
        certificate: cert,
      };
    });
  }, [sortedLeaderboard, selectionTopPercentage, selectionCutoffRank]);

  // Assemble certificates for both individual squad members and team entries
  const assembleAllCertificates = (): CertificateRecord[] => {
    const allCerts: CertificateRecord[] = [];
    computedCertificates.forEach(c => {
      if (c.isTeam && c.members && c.members.length > 0) {
        // First push personalized certificates for each squad member (including leader)
        c.members.forEach((m: any, mIdx: number) => {
          const memberCertNum = `${c.certificate.certificateNumber}-M${mIdx + 1}`;
          allCerts.push({
            ...c.certificate,
            id: `cert_${m.userId || m.id || m.email || mIdx}_${c.category}`,
            certificateNumber: memberCertNum,
            recipientName: m.name,
            recipientEmail: (m.email || '').trim(),
            recipientId: m.userId || m.id,
            recipientRole: m.isTeamLeader ? 'Team Leader' : 'Squad Member',
            registrationNumber: m.registrationNumber || c.certificate.registrationNumber,
            qrVerificationUrl: `https://research.aima.in/verify/${memberCertNum}`,
          });
        });
        // Also push the team certificate for team-level querying
        allCerts.push(c.certificate);
      } else {
        allCerts.push(c.certificate);
      }
    });
    return allCerts;
  };

  // Handlers for certificate publication
  const handlePublishAndEmailDispatch = async () => {
    try {
      setIsEmailingCerts(true);
      setCertPublishStatus(null);
      const allCerts = assembleAllCertificates();
      const res = await publishOfficialCertificates(allCerts, { sendEmails: true });
      setCertPublishStatus({
        type: 'success',
        message: `Successfully published ${res.publishedCount} certificates to workspaces and dispatched ${res.emailSentCount} emails over Falconide SMTP relay!`,
      });
    } catch (err: any) {
      setCertPublishStatus({
        type: 'error',
        message: err?.message || 'Failed to publish and dispatch certificates.',
      });
    } finally {
      setIsEmailingCerts(false);
    }
  };

  const handlePublishToWorkspacesOnly = async () => {
    try {
      setIsPublishingCerts(true);
      setCertPublishStatus(null);
      const allCerts = assembleAllCertificates();
      const res = await publishOfficialCertificates(allCerts, { sendEmails: false });
      setCertPublishStatus({
        type: 'success',
        message: `Successfully published ${res.publishedCount} official certificates directly to participant workspaces (emails bypassed).`,
      });
    } catch (err: any) {
      setCertPublishStatus({
        type: 'error',
        message: err?.message || 'Failed to publish certificates to student workspaces.',
      });
    } finally {
      setIsPublishingCerts(false);
    }
  };

  // Single candidate certificate email dispatcher
  const handleSendSingleCertificateEmail = async (item: any) => {
    try {
      setEmailingCertId(item.id);
      setCertPublishStatus(null);
      const targetEmail = (item.email || item.certificate?.recipientEmail || item.members?.[0]?.email || '').trim();
      const targetName = item.certificate?.recipientName || item.name;

      if (!targetEmail || !targetEmail.includes('@')) {
        setCertPublishStatus({
          type: 'error',
          message: `Cannot dispatch email: No valid email address found for ${targetName}.`,
        });
        return;
      }

      const res = await sendFinalResultsEmail({
        toName: targetName,
        toEmail: targetEmail,
        teamName: item.teamName || item.name,
        achievement: item.certificate.achievement,
        certNumber: item.certificate.certificateNumber,
        certVerifyUrl: item.certificate.qrVerificationUrl,
      });

      if (res?.success) {
        setCertPublishStatus({
          type: 'success',
          message: `Official certificate email successfully delivered to ${targetName} (${targetEmail})!`,
        });
      } else {
        setCertPublishStatus({
          type: 'error',
          message: `Failed to deliver certificate email to ${targetEmail}: ${res?.error || 'Unknown error'}`,
        });
      }
    } catch (err: any) {
      setCertPublishStatus({
        type: 'error',
        message: `Error sending certificate email: ${err?.message || 'Failed to dispatch'}`,
      });
    } finally {
      setEmailingCertId(null);
    }
  };

  const handleOpenRowCertificate = (row: any, rank: number) => {
    const match = computedCertificates.find(c => c.id === row.id) || computedCertificates[rank - 1];
    if (match) {
      setActiveCertificateModal(match.certificate);
    }
  };

  // Filtered by Search & Status
  const filteredList = useMemo(() => {
    return sortedLeaderboard.filter((row) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q ||
        row.teamName.toLowerCase().includes(q) ||
        row.instituteName.toLowerCase().includes(q) ||
        (row.name && row.name.toLowerCase().includes(q)) ||
        (row.email && row.email.toLowerCase().includes(q)) ||
        (row.userProfile?.selectedTrackName && row.userProfile.selectedTrackName.toLowerCase().includes(q)) ||
        row.members.some((m: any) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          (m.registrationNumber && m.registrationNumber.toLowerCase().includes(q))
        );

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'qualified' && row.isQualified) ||
        (filterStatus === 'disqualified' && !row.isQualified);

      return matchesSearch && matchesStatus;
    });
  }, [sortedLeaderboard, searchQuery, filterStatus]);

  // Telemetry Aggregates
  const totalSubmissions = sortedLeaderboard.length;
  const topScore = sortedLeaderboard.length > 0 ? sortedLeaderboard[0].quizScore : 0;
  const avgScore = totalSubmissions > 0 ? Math.round(sortedLeaderboard.reduce((a, b) => a + b.quizScore, 0) / totalSubmissions) : 0;
  const topCombinedScore = sortedLeaderboard.length > 0 ? sortedLeaderboard[0].combinedScore : 0;
  const avgCombinedScore = totalSubmissions > 0 ? Math.round(sortedLeaderboard.reduce((a, b) => a + b.combinedScore, 0) / totalSubmissions) : 0;
  const evaluatedPresentationCount = sortedLeaderboard.filter(r => r.hasPresentation).length;
  const qualifiedCount = sortedLeaderboard.filter(r => r.isQualified).length;
  const passRate = totalSubmissions > 0 ? Math.round((qualifiedCount / totalSubmissions) * 100) : 0;
  const totalTeamEntries = sortedLeaderboard.filter(r => r.isTeam).length;
  const totalSoloEntries = sortedLeaderboard.filter(r => !r.isTeam).length;
  const totalCandidateAttempts = enrichedLeaderboard.length;
  const enrolledCount = selectedProgram
    ? (selectedProgram.enrolledCount || 0)
    : (quizPrograms.reduce((acc, p) => acc + (p.enrolledCount || 0), 0) || users.length || 76);

  // Target Quiz Program for the active attempt (SINGLE SOURCE OF TRUTH)
  const modalProgram = useMemo(() => {
    if (!selectedAttemptForReview) return null;
    const targetId = selectedAttemptForReview.programId || 'qp_case_comp_stage1_2026';
    return quizPrograms.find(p => p.id === targetId) || selectedProgram || quizPrograms[0] || null;
  }, [selectedAttemptForReview, quizPrograms, selectedProgram]);

  const isNegativeMarking = Boolean(modalProgram?.negativeMarking);
  const negativeMarks = isNegativeMarking ? Number(modalProgram?.negativeMarksPerQuestion ?? 1) : 0;
  const programCutoff = Number(modalProgram?.cutoffScore ?? effectiveCutoff ?? 60);
  const programTotalMarks = Number(modalProgram?.totalMarks ?? 100);
  const marksPerQuestion = Number(modalProgram?.marksPerQuestion ?? 4);

  // Modal computations: active row, program questions, and answer stats
  const activeAttemptRow = useMemo(() => {
    if (!selectedAttemptForReview) return null;
    const found = enrichedLeaderboard.find(r => r.attemptData.attemptId === selectedAttemptForReview.attemptId);

    // Check if entry exists in groupedLeaderboard (handles both team and solo qualifications)
    const matchingGrouped = groupedLeaderboard.find(g =>
      g.isTeam
        ? g.members?.some(m => m.attemptData.attemptId === selectedAttemptForReview.attemptId)
        : (g.userId === (found?.userId || selectedAttemptForReview.studentId || selectedAttemptForReview.userId))
    );

    const score = Number(found?.score ?? selectedAttemptForReview.score ?? 0);
    // Candidate qualifies if their score meets program cutoff, effective cutoff, or their team qualified
    const isQualified = Boolean(
      score >= programCutoff ||
      score >= effectiveCutoff ||
      (matchingGrouped && matchingGrouped.isQualified)
    );

    if (found) {
      return {
        ...found,
        isQualified,
      };
    }

    return {
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
      isQualified,
      attemptData: selectedAttemptForReview,
      userProfile: undefined,
    };
  }, [selectedAttemptForReview, enrichedLeaderboard, groupedLeaderboard, programCutoff, effectiveCutoff]);

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
    // Helper to calculate auto-fit column widths for SheetJS
    const fitColWidths = (rows: Record<string, any>[]) => {
      if (!rows || rows.length === 0) return [];
      const keys = Object.keys(rows[0]);
      return keys.map(k => {
        let maxLen = k.length;
        rows.forEach(r => {
          const val = r[k] !== undefined && r[k] !== null ? String(r[k]) : '';
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(65, Math.max(12, maxLen + 3)) };
      });
    };

    // ─────────────────────────────────────────────────────────────────────────
    // SHEET 1: Combined Final Results (Sorted by Grand Finale Combined Rank)
    // ─────────────────────────────────────────────────────────────────────────
    const combinedSorted = [...leaderboardWithCombinedScores].sort((a, b) => {
      if (b.combinedScore !== a.combinedScore) return b.combinedScore - a.combinedScore;
      if (b.validPresentationScore !== a.validPresentationScore) {
        return b.validPresentationScore - a.validPresentationScore;
      }
      if (b.tieBreakerScore !== a.tieBreakerScore) return b.tieBreakerScore - a.tieBreakerScore;
      if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return a.tabSwitches - b.tabSwitches;
    });

    const sheet1Rows = combinedSorted.map((r, idx) => {
      const rank = idx + 1;
      const awardStatus =
        rank === 1
          ? '🥇 1st Winner (Gold Prize)'
          : rank === 2
            ? '🥈 1st Runner-Up (Silver Prize)'
            : rank === 3
              ? '🥉 2nd Runner-Up (Bronze Prize)'
              : r.hasPresentation
                ? '🎖️ Grand Finalist'
                : r.isQualified
                  ? 'Qualified Round 2 (Pending Presentation)'
                  : 'Below Cutoff';

      const memberNames =
        r.members && r.members.length > 0
          ? r.members.map((m: any) => `${m.name} (${m.email || 'N/A'})`).join('; ')
          : r.name;

      return {
        'Final Combined Rank': rank,
        'Award / Final Standing': awardStatus,
        'Entry Type': r.isTeam ? 'Team Entry' : 'Solo Entry',
        'Candidate / Team Name': r.name,
        'Contact Email': r.email,
        'Institution': r.instituteName,
        'Grand Combined Total (200)': r.combinedScore,
        'Round 1 Screening Quiz Score (100)': r.quizScore,
        '5 Analytical Tie-Breakers Score (20)': r.tieBreakerScore,
        'Round 2 Case Presentation Score (100)': r.hasPresentation ? r.presentationScore : 'Pending Jury Score',
        'Case Track Assigned': r.presentationTrackName || 'General / Corporate Strategy',
        'Round 1 Gate Status': r.isQualified ? 'QUALIFIED FOR STAGE 2' : 'BELOW CUTOFF',
        'Time Taken (s)': r.timeTaken,
        'Proctoring Tab Switches': r.tabSwitches,
        'Affiliated Team Name': r.teamName,
        'Team Roster Size': r.isTeam ? (r.members?.length || 1) : 1,
        'Squad Members Roster': memberNames,
      };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SHEET 2: Round 1 Results (Sorted strictly by Round 1 Screening Quiz Rank)
    // ─────────────────────────────────────────────────────────────────────────
    const round1Sorted = [...leaderboardWithCombinedScores].sort((a, b) => {
      if (b.quizScore !== a.quizScore) return b.quizScore - a.quizScore;
      if (b.tieBreakerScore !== a.tieBreakerScore) return b.tieBreakerScore - a.tieBreakerScore;
      if (a.timeTaken !== b.timeTaken) return a.timeTaken - b.timeTaken;
      return a.tabSwitches - b.tabSwitches;
    });

    const sheet2Rows = round1Sorted.map((r, idx) => {
      const rank = idx + 1;
      const memberNames =
        r.members && r.members.length > 0
          ? r.members.map((m: any) => `${m.name} (${m.registrationNumber || m.email || 'N/A'})`).join('; ')
          : r.name;

      return {
        'Round 1 Rank': rank,
        'Round 1 Gate Status': r.isQualified ? 'QUALIFIED FOR ROUND 2' : 'BELOW CUTOFF',
        'Entry Type': r.isTeam ? 'Team Entry' : 'Solo Entry',
        'Candidate / Team Name': r.name,
        'Candidate Email': r.email,
        'Institution': r.instituteName,
        'Screening Quiz Score (100)': r.quizScore,
        '5 Analytical Tie-Breakers Score (20)': r.tieBreakerScore,
        'Passing Cutoff (%)': `${effectiveCutoff}%`,
        'Time Taken (seconds)': r.timeTaken,
        'Proctoring Tab Switches': r.tabSwitches,
        'Registration / Attempt ID': r.registrationNumber || r.id,
        'Squad Members Roster': memberNames,
      };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // SHEET 3: Round 2 Results (Sorted strictly by Round 2 Case Presentation Rank)
    // ─────────────────────────────────────────────────────────────────────────
    const round2Sorted = [...leaderboardWithCombinedScores].sort((a, b) => {
      const bScore = b.hasPresentation ? Number(b.presentationScore) : -1;
      const aScore = a.hasPresentation ? Number(a.presentationScore) : -1;
      if (bScore !== aScore) return bScore - aScore;
      if (b.combinedScore !== a.combinedScore) return b.combinedScore - a.combinedScore;
      if (b.tieBreakerScore !== a.tieBreakerScore) return b.tieBreakerScore - a.tieBreakerScore;
      return b.quizScore - a.quizScore;
    });

    const sheet3Rows = round2Sorted.map((r, idx) => {
      const rank = idx + 1;
      const jury = getRowJuryScorecard(r);
      const dbEval = dbJuryEvaluations.find(
        d =>
          (r.registrationNumber && d.registration_number === r.registrationNumber) ||
          (r.teamId && d.team_id === r.teamId) ||
          (r.email && d.candidate_email && d.candidate_email.toLowerCase() === r.email.toLowerCase().trim()) ||
          (r.members && r.members.some((m: any) =>
            (m.registrationNumber && d.registration_number === m.registrationNumber) ||
            (m.email && d.candidate_email && d.candidate_email.toLowerCase() === m.email.toLowerCase().trim())
          ))
      );

      const matchedTrack = OFFICIAL_CASE_TRACKS.find(
        t => t.name.toLowerCase() === (r.presentationTrackName || dbEval?.track_name || '').toLowerCase()
      );

      return {
        'Round 2 Rank': rank,
        'Jury Evaluation Status': r.hasPresentation ? 'EVALUATED' : 'PENDING EVALUATION',
        'Candidate / Team Name': r.name,
        'Institution': r.instituteName,
        'Selected Case Track': r.presentationTrackName || dbEval?.track_name || 'General / Corporate Strategy',
        'Master Case Problem Title': matchedTrack?.masterCaseTitle || dbEval?.master_case_title || 'National Case Study Scenario',
        'Total Presentation Score (100)': r.hasPresentation ? r.presentationScore : 0,
        'KPI 1: Problem Identification & Root Cause (15)': dbEval?.problem_identification ?? (jury?.scores?.['problemIdentification'] ?? 0),
        'KPI 2: Answer to Case Question 1 (15)': dbEval?.case_question_1 ?? (jury?.scores?.['caseQuestion1'] ?? 0),
        'KPI 3: Answer to Case Question 2 (15)': dbEval?.case_question_2 ?? (jury?.scores?.['caseQuestion2'] ?? 0),
        'KPI 4: Answer to Case Question 3 (15)': dbEval?.case_question_3 ?? (jury?.scores?.['caseQuestion3'] ?? 0),
        'KPI 5: Strategic Alternatives & Recommended Strategy (20)': dbEval?.strategic_alternatives ?? (jury?.scores?.['strategicAlternatives'] ?? 0),
        'KPI 6: Execution Plan & Feasibility (15)': dbEval?.execution_plan ?? (jury?.scores?.['executionPlan'] ?? 0),
        'KPI 7: Case Data Evidence & Assumptions (5)': dbEval?.case_data_evidence ?? (jury?.scores?.['caseDataEvidence'] ?? 0),
        'Jury Evaluator Name': dbEval?.evaluator_name || jury?.evaluatorName || 'AIMA-ICRC Panel Evaluator',
        'Jury Remarks / Observations': dbEval?.observations || jury?.generalRemarks || 'Offline Presentation Evaluation Completed',
        'Candidate Email': r.email,
        'Squad Members': r.members && r.members.length > 0 ? r.members.map((m: any) => m.name).join(', ') : r.name,
      };
    });

    // ─────────────────────────────────────────────────────────────────────────
    // Assemble Multi-Sheet Excel Workbook
    // ─────────────────────────────────────────────────────────────────────────
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(sheet1Rows);
    ws1['!cols'] = fitColWidths(sheet1Rows);
    XLSX.utils.book_append_sheet(wb, ws1, 'Combined Final Results');

    const ws2 = XLSX.utils.json_to_sheet(sheet2Rows);
    ws2['!cols'] = fitColWidths(sheet2Rows);
    XLSX.utils.book_append_sheet(wb, ws2, 'Round 1 Results');

    const ws3 = XLSX.utils.json_to_sheet(sheet3Rows);
    ws3['!cols'] = fitColWidths(sheet3Rows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Round 2 Results');

    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `AIMA_ICL_2026_Official_Merit_List_3_Sheets_${timestamp}.xlsx`);

    addAuditLog(
      'Merit List Exported',
      'Quiz',
      `Super Admin exported official 3-sheet Excel spreadsheet (Combined Final Results, Round 1 Results, Round 2 Results) with ${combinedSorted.length} entries.`
    );
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
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer border border-slate-700"
            title="Download multi-sheet Excel spreadsheet containing: 1. Combined Final Results (sorted by rank), 2. Round 1 Results (sorted by rank), 3. Round 2 Results (sorted by rank)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Official Merit List (Excel - 3 Sheets)</span>
          </button>
          <button
            onClick={() => setShowCertificateCockpit(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
            title="Configure selection percentage, preview, publish to student workspaces, and dispatch emails"
          >
            <Award className="w-4 h-4 text-slate-950" />
            <span>Publish &amp; Dispatch Certificates</span>
          </button>
        </div>
      </div>

      {/* Telemetry Metrics - 3 Cards Taking Full Width */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{rankingMode === 'combined' ? 'Top Grand Total (Quiz + Presentation)' : 'Top Score (Team / Solo)'}</span>
            <Medal className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0
              ? (rankingMode === 'combined' ? `${topCombinedScore}/200` : `${topScore}/100`)
              : '--'}
          </div>
          <div className="text-xs text-amber-600 font-medium mt-1 truncate max-w-[280px]">
            {totalSubmissions > 0 ? `Rank 1: ${sortedLeaderboard[0]?.name || 'N/A'}` : 'No evaluated attempts yet'}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{rankingMode === 'combined' ? 'Average Combined Score' : 'Average Score'}</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0
              ? (rankingMode === 'combined' ? `${avgCombinedScore}/200` : `${avgScore}/100`)
              : '--'}
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            {rankingMode === 'combined'
              ? 'Quiz (100) + Case Deck (100) + 5 Tie-Breakers'
              : `Active Cutoff: ${effectiveCutoff}% pass (${Math.round((selectedProgram?.totalMarks || 100) * (effectiveCutoff / 100))} pts)`}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{rankingMode === 'combined' ? 'Jury Evaluated Presentations' : 'Qualification Pass Rate'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalSubmissions > 0
              ? (rankingMode === 'combined' ? `${evaluatedPresentationCount}/${totalSubmissions}` : `${passRate}%`)
              : '0'}
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {rankingMode === 'combined'
              ? `${totalSubmissions > 0 ? Math.round((evaluatedPresentationCount / totalSubmissions) * 100) : 0}% offline presentations scored by jury`
              : `${qualifiedCount} qualified of ${totalSubmissions} entries`}
          </div>
        </div>
      </div>

      {/* Control Bar: Ranking Mode Switcher, Filter, Program Selector & Configurable Cutoff */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        {/* Official Ranking Mode Switcher */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 pl-1">
            <Sliders className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                Leaderboard Tabulation Mode:
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {rankingMode === 'combined'
                  ? 'Grand Finale Mode: Combines Screening Quiz (100) + Case Presentation (100) = 200 pts, broken by 5 Analytical Tie-Breakers.'
                  : 'Stage 1 Qualifier Mode: Ranks strictly by Screening Quiz (100 pts) with 5 Analytical Tie-Breakers to gate R2 candidates.'}
              </span>
            </div>
          </div>
          <div className="inline-flex p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs self-start md:self-auto shrink-0 max-w-full overflow-x-auto">
            <button
              type="button"
              onClick={() => setRankingMode('combined')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                rankingMode === 'combined'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Grand Finale Combined Rank</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-black/20 text-white font-black uppercase">
                Final Merit
              </span>
            </button>
            <button
              type="button"
              onClick={() => setRankingMode('round_1')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                rankingMode === 'round_1'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Round 1 Quiz Rank (Qualifiers)</span>
            </button>
          </div>
        </div>

        {/* Row 1: Program Selector, Search & Status Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full lg:flex-1 min-w-0">
            {/* Program Selector with schedule-normalized badges */}
            <select
              value={selectedProgramId}
              onChange={e => setSelectedProgramId(e.target.value)}
              className="text-xs font-bold p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white shrink-0 cursor-pointer shadow-xs focus:ring-2 focus:ring-red-500 w-full sm:w-auto sm:max-w-[280px] md:max-w-[320px] truncate"
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

            <div className="relative flex-1 min-w-0 w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search ranker, college, team..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full text-base sm:text-xs pl-9 pr-8 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-red-500 touch-manipulation"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto overflow-y-hidden w-full lg:w-auto shrink-0 py-0.5">
            {(['all', 'qualified', 'disqualified'] as const).map(st => {
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
                  className={`flex-1 sm:flex-initial text-center px-3 py-2 sm:py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer whitespace-nowrap shrink-0 ${filterStatus === st
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

          {/* Action Buttons: Publish R1 Quiz Results & Publish Final Results (R1 + R2) */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            {/* Publish R1 Quiz Program Results */}
            <button
              onClick={handleTogglePublishResults}
              disabled={selectedProgramId === 'all'}
              className={`w-full sm:w-auto px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs ${selectedProgramId === 'all'
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
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Select Quiz to Publish</span>
                </>
              ) : isResultsPublished ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>✓ R1 Published ({selectedProgram?.code || 'Selected'})</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-900" />
                  <span>Publish R1 Results ({selectedProgram?.code || 'Selected'})</span>
                </>
              )}
            </button>

            {/* Master Final Results (R1 + R2) Publication Button */}
            <button
              onClick={handleTogglePublishFinalResults}
              disabled={isTogglingFinalResults}
              className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                isFinalResultsPublished
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-purple-600/20'
                  : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-black shadow-amber-500/20 ring-2 ring-amber-400/40'
              }`}
              title={
                isFinalResultsPublished
                  ? 'Final Results are LIVE for candidates and institutions. Click to unpublish.'
                  : `Click to publish official final combined results (Round 1 Quiz + Round 2 Jury Defense). Students and institutes will immediately see their final marks and rankings.`
              }
            >
              {isTogglingFinalResults ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : isFinalResultsPublished ? (
                <>
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>✓ Final Results Published (R1 + R2)</span>
                </>
              ) : (
                <>
                  <Trophy className="w-4 h-4 text-slate-950" />
                  <span>
                    Publish Final Results (R1 + R2)
                    {countWithBothRounds > 0 && (
                      <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-md bg-black/20 text-slate-950 font-mono font-bold">
                        {countWithBothRounds} Ready
                      </span>
                    )}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Jury Evaluation Save Feedback Banner */}
      {jurySaveFeedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 text-xs font-bold shadow-sm animate-in fade-in transition-all ${jurySaveFeedback.isError
          ? 'bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30'
          : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
          }`}>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{jurySaveFeedback.msg}</span>
          </div>
          <button
            onClick={() => setJurySaveFeedback(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Leaderboard Table */}
      <div id="leaderboard-table-container" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden scroll-mt-6">
        <div id="leaderboard-table-scroll-container" className="overflow-x-auto">
          <table id="leaderboard-table" className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 text-center w-16">Rank</th>
                <th className="py-3.5 px-4">Candidate / Team & B-School</th>
                <th className="py-3.5 px-4 text-center">Screening Quiz (100)</th>
                <th className="py-3.5 px-4 text-center">Chosen Case / Track</th>
                <th className="py-3.5 px-4 text-center">Case Presentation (100)</th>
                <th className="py-3.5 px-4 text-center">Combined Grand Total (200)</th>
                <th className="py-3.5 px-4 text-center">
                  {rankingMode === 'combined' ? 'Award / Final Merit' : 'Stage 2 Gate'}
                </th>
                <th className="py-3.5 px-4 text-center w-48">Action</th>
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
                  const rowJuryResult = getRowJuryScorecard(row);
                  const isExpanded = expandedJuryUserId === row.id || expandedJuryUserId === row.userId;
                  const isTeamExpanded = expandedTeamIds.has(row.id);

                  // Resolve Chosen / Selected Case for this candidate or team
                  const rowDbEval = dbJuryEvaluations.find(
                    d =>
                      (row.registrationNumber && d.registration_number === row.registrationNumber) ||
                      (row.teamId && d.team_id === row.teamId) ||
                      (row.email && d.candidate_email && d.candidate_email.toLowerCase() === row.email.toLowerCase().trim()) ||
                      (row.members && row.members.some((m: any) =>
                        (m.registrationNumber && d.registration_number === m.registrationNumber) ||
                        (m.email && d.candidate_email && d.candidate_email.toLowerCase() === m.email.toLowerCase().trim())
                      ))
                  );

                  const rowContextTeam = teams.find(
                    t => (row.teamId && t.id === row.teamId) || (row.teamName && t.name === row.teamName)
                  );

                  const rawTrackId =
                    rowDbEval?.track_id ||
                    rowContextTeam?.selectedTrackId ||
                    row.userProfile?.selectedTrackId ||
                    (row as any).attemptData?.selectedTrackId ||
                    row.members?.find((m: any) => m.userProfile?.selectedTrackId)?.userProfile?.selectedTrackId;

                  const matchedTrack = OFFICIAL_CASE_TRACKS.find(
                    t => t.id === rawTrackId || t.name.toLowerCase() === (rowDbEval?.track_name || '').toLowerCase()
                  );

                  const trackDisplayBadge = matchedTrack?.badge || rowDbEval?.track_badge || (rawTrackId ? 'TRACK' : null);
                  const trackDisplayName = matchedTrack?.name || rowDbEval?.track_name || rowContextTeam?.selectedTrackName || row.userProfile?.selectedTrackName;
                  const masterCaseTitle = matchedTrack?.masterCaseTitle || rowDbEval?.master_case_title;

                  const hasChosenTrack = Boolean(
                    rawTrackId ||
                    matchedTrack ||
                    (trackDisplayName && trackDisplayName.trim() !== '')
                  );

                  const isBelowCutoff = !row.isQualified;
                  const isJuryDisabled = !isResultsPublished || isBelowCutoff || !hasChosenTrack;

                  const juryDisabledReason = !isResultsPublished
                    ? 'Publish Round 1 Online Quiz Results first to enable Stage 2 Case Study Presentation Jury evaluation'
                    : isBelowCutoff
                      ? 'Jury evaluation disabled: Round 1 score is below cutoff (Did not qualify for Stage 2)'
                      : !hasChosenTrack
                        ? 'Jury evaluation disabled: Participant / Team has not chosen an official case track for Round 2 yet'
                        : 'Enter / Edit Offline Jury Case Study Presentation Scorecard';

                  const liveFormTotal =
                    (Number(juryFormData.problemIdentification) || 0) +
                    (Number(juryFormData.caseQuestion1) || 0) +
                    (Number(juryFormData.caseQuestion2) || 0) +
                    (Number(juryFormData.caseQuestion3) || 0) +
                    (Number(juryFormData.strategicAlternatives) || 0) +
                    (Number(juryFormData.executionPlan) || 0) +
                    (Number(juryFormData.caseDataEvidence) || 0);

                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        id={`row-${row.id}`}
                        onClick={() => {
                          const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
                          if (isMobile) {
                            if (!isJuryDisabled) {
                              handleToggleJuryAccordion(row);
                              return;
                            }
                          }

                          if (row.isTeam) {
                            setActiveSquadMembersModal(row);
                          } else if (row.attemptData) {
                            handleOpenReview(row.attemptData);
                          }
                        }}
                        className={`cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800/60 transition group ${isTop3 ? 'bg-amber-500/5 dark:bg-amber-500/5' : ''
                          } ${isExpanded ? 'bg-red-50/40 dark:bg-red-950/20' : ''}`}
                        title={
                          row.isTeam
                            ? 'Click anywhere on row to enter jury marks or view squad members'
                            : "Click anywhere on row to enter jury marks or view candidate's attempt"
                        }
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

                        {/* Candidate / Team & B-School */}
                        <td className="py-3.5 px-4">
                          {row.isTeam ? (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-red-600 transition">
                                <span className="group-hover:underline">{row.teamName}</span>
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveSquadMembersModal(row);
                                  }}
                                  className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0 flex items-center gap-1 cursor-pointer hover:bg-blue-500/20 transition"
                                  title="Click to view squad members"
                                >
                                  <Users className="w-2.5 h-2.5" />
                                  Team ({row.members.length} {row.members.length === 1 ? 'member' : 'members'})
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {row.instituteName} ({row.instituteCity})
                              </div>
                              {row.submittedAt && (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3 text-red-500/80 dark:text-red-400/80 shrink-0" />
                                  <span>Latest: {formatISTDateTime(row.submittedAt)}</span>
                                </div>
                              )}

                              {/* Mobile Quick Jury Button directly under team name */}
                              <div className="mt-2 md:hidden">
                                <button
                                  type="button"
                                  disabled={isJuryDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isJuryDisabled) {
                                      handleToggleJuryAccordion(row);
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs border ${
                                    isJuryDisabled
                                      ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                      : (rowJuryResult?.livePresentationScore !== undefined || (rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0))
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 active:scale-95'
                                        : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 active:scale-95'
                                  }`}
                                  title={juryDisabledReason}
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                  <span>
                                    {(rowJuryResult?.livePresentationScore !== undefined || (rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0))
                                      ? `Edit Jury Score (${rowJuryResult?.livePresentationScore ?? rowDbEval?.total_score}/100)`
                                      : 'Enter Jury Marks (100)'}
                                  </span>
                                  {isJuryDisabled ? (
                                    <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-red-600 transition">
                                <span className="group-hover:underline">{row.name}</span>
                                <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 shrink-0">
                                  Solo Entry
                                </span>
                                <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {row.instituteName} ({row.instituteCity})
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                                {row.email}
                              </div>
                              {row.submittedAt && (
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                                  <Clock className="w-3 h-3 text-red-500/80 dark:text-red-400/80 shrink-0" />
                                  <span>Submitted: {formatISTDateTime(row.submittedAt)}</span>
                                </div>
                              )}

                              {/* Mobile Quick Jury Button directly under candidate name */}
                              <div className="mt-2 md:hidden">
                                <button
                                  type="button"
                                  disabled={isJuryDisabled}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isJuryDisabled) {
                                      handleToggleJuryAccordion(row);
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs border ${
                                    isJuryDisabled
                                      ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
                                      : (rowJuryResult?.livePresentationScore !== undefined || (rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0))
                                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 active:scale-95'
                                        : 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800 hover:bg-red-100 active:scale-95'
                                  }`}
                                  title={juryDisabledReason}
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                  <span>
                                    {(rowJuryResult?.livePresentationScore !== undefined || (rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0))
                                      ? `Edit Jury Score (${rowJuryResult?.livePresentationScore ?? rowDbEval?.total_score}/100)`
                                      : 'Enter Jury Marks (100)'}
                                  </span>
                                  {isJuryDisabled ? (
                                    <Lock className="w-3 h-3 text-slate-400 ml-0.5" />
                                  ) : (
                                    <ChevronDown className="w-3.5 h-3.5 ml-0.5" />
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Screening Quiz Score */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-black text-base text-slate-900 dark:text-white">
                            {row.score}
                          </div>
                          <div className={`text-[10px] font-bold uppercase tracking-wider ${row.isTeam ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                            {row.isTeam ? 'Team Avg / 100' : 'out of 100'}
                          </div>
                          {row.analyticalScore > 0 && (
                            <div className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/25 text-[10px] font-bold">
                              <Sparkles className="w-2.5 h-2.5 shrink-0" />
                              ⚡ {row.analyticalScore}/20 {row.isTeam ? 'Avg' : ''}
                            </div>
                          )}
                        </td>

                        {/* Chosen / Selected Case */}
                        <td className="py-3.5 px-4 text-center">
                          {!row.isQualified ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                              Below Cutoff
                            </span>
                          ) : trackDisplayName ? (
                            <div className="inline-flex flex-col items-center max-w-[210px] mx-auto text-left">
                              <div className="flex items-center gap-1.5 flex-wrap justify-center">
                                {trackDisplayBadge && (
                                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 shrink-0">
                                    {trackDisplayBadge}
                                  </span>
                                )}
                                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {trackDisplayName}
                                </span>
                              </div>
                              {masterCaseTitle && (
                                <span
                                  className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[200px] mt-0.5"
                                  title={masterCaseTitle}
                                >
                                  📌 {masterCaseTitle}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>Pending Selection</span>
                            </span>
                          )}
                        </td>

                        {/* Case Presentation (100) */}
                        <td className="py-3.5 px-4 text-center">
                          {(() => {
                            const dbScore =
                              rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0
                                ? Number(rowDbEval.total_score)
                                : undefined;
                            const presentationScore = rowJuryResult?.livePresentationScore ?? dbScore;
                            const presentationTrackName = rowJuryResult?.trackName || rowDbEval?.track_name || matchedTrack?.name;

                            if (presentationScore !== undefined) {
                              return (
                                <div>
                                  <div className="font-black text-base text-emerald-600 dark:text-emerald-400">
                                    {presentationScore}
                                    <span className="text-[10px] text-slate-400 font-semibold ml-0.5">/100</span>
                                  </div>
                                  <div
                                    className="text-[10px] text-slate-500 font-medium truncate max-w-[130px] mx-auto"
                                    title={presentationTrackName}
                                  >
                                    {presentationTrackName?.split('&')[0]?.trim() || 'Track Assigned'}
                                  </div>
                                </div>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                                Pending Jury
                              </span>
                            );
                          })()}
                        </td>

                        {/* Combined Grand Total (200) */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="font-black text-base text-slate-900 dark:text-white">
                            {row.combinedScore}
                            <span className="text-[10px] text-slate-400 font-semibold ml-0.5">/200</span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {row.hasPresentation ? (
                              <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                Q: {row.quizScore} + P: {row.presentationScore}
                              </span>
                            ) : (
                              <span className="text-amber-500 font-semibold">
                                Q: {row.quizScore} (Jury Pending)
                              </span>
                            )}
                          </div>
                          {row.tieBreakerScore > 0 && (
                            <div
                              className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/25 text-[10px] font-bold"
                              title="Score from 5 Reserve Tie-Breaker Analytical Questions (Q26-Q30)"
                            >
                              <Sparkles className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400 shrink-0" />
                              <span>⚡ {row.tieBreakerScore}/20 Tie-Breaker</span>
                            </div>
                          )}
                        </td>

                        {/* Award / Stage 2 Gate */}
                        <td className="py-3.5 px-4 text-center">
                          {rankingMode === 'combined' ? (
                            <div className="flex flex-col items-center gap-1">
                              {rank === 1 ? (
                                <>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-xs">
                                    <Trophy className="w-3.5 h-3.5 text-amber-200" />
                                    <span>1st Winner</span>
                                  </span>
                                  <span className="text-[9px] text-amber-600 dark:text-amber-400 font-bold">
                                    🏆 Gold Award
                                  </span>
                                </>
                              ) : rank === 2 ? (
                                <>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-xs">
                                    <Medal className="w-3.5 h-3.5 text-slate-200" />
                                    <span>1st Runner-Up</span>
                                  </span>
                                  <span className="text-[9px] text-slate-500 font-bold">
                                    🥈 Silver Award
                                  </span>
                                </>
                              ) : rank === 3 ? (
                                <>
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-700 to-amber-800 text-white shadow-xs">
                                    <Award className="w-3.5 h-3.5 text-amber-300" />
                                    <span>2nd Runner-Up</span>
                                  </span>
                                  <span className="text-[9px] text-amber-700 dark:text-amber-400 font-bold">
                                    🥉 Bronze Award
                                  </span>
                                </>
                              ) : row.hasPresentation ? (
                                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                                  🎖️ Grand Finalist
                                </span>
                              ) : row.isQualified ? (
                                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                                  Qualified R2
                                </span>
                              ) : (
                                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  Below Cutoff
                                </span>
                              )}
                            </div>
                          ) : (
                            row.isQualified ? (
                              <div>
                                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shadow-xs">
                                  Qualified R2
                                </span>
                                {row.isTeam && (
                                  <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                                    Team Avg: {row.score}% (≥{effectiveCutoff}%)
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <span className="inline-block px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  Below Cutoff
                                </span>
                                {row.isTeam && (
                                  <div className="text-[9px] text-red-500 font-semibold mt-0.5">
                                    Team Avg: {row.score}% (&lt;{effectiveCutoff}%)
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </td>

                        {/* Actions: View / Members Accordion + Jury Score Accordion Toggle */}
                        <td className="py-3.5 px-4 text-center">
                          <div
                            className="flex items-center justify-center gap-1.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {row.isTeam ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveSquadMembersModal(row);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs border border-blue-200/80 dark:border-blue-800/80 transition shadow-2xs cursor-pointer"
                                title="Click to view all squad members & attempt details in modal"
                              >
                                <Users className="w-3.5 h-3.5" />
                                <span>{row.members.length}</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (row.attemptData) handleOpenReview(row.attemptData);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition shadow-2xs cursor-pointer border border-slate-200 dark:border-slate-700"
                                title="Inspect attempted questions & answers"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>View</span>
                              </button>
                            )}

                            {/* View Row Certificate Preview */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenRowCertificate(row, rank);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-bold text-xs border border-amber-300/80 dark:border-amber-700/80 transition shadow-2xs cursor-pointer"
                              title="Preview or print official certificate for this candidate / team"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                              <span className="hidden xl:inline">Cert</span>
                            </button>

                            <button
                              disabled={isJuryDisabled}
                              onClick={() => {
                                if (isJuryDisabled) return;
                                handleToggleJuryAccordion(row);
                              }}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition shadow-2xs border ${
                                isJuryDisabled
                                  ? 'opacity-45 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700'
                                  : isExpanded
                                    ? 'bg-red-600 text-white border-red-600 ring-2 ring-red-400/30 cursor-pointer'
                                    : (rowJuryResult?.livePresentationScore !== undefined || (rowDbEval?.total_score !== undefined && rowDbEval?.total_score !== null && Number(rowDbEval.total_score) > 0))
                                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 cursor-pointer'
                                      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 cursor-pointer'
                              }`}
                              title={juryDisabledReason}
                            >
                              <Sliders className="w-3.5 h-3.5" />
                              <span>Jury</span>
                              {isJuryDisabled ? (
                                <Lock className="w-3 h-3 text-slate-400" />
                              ) : isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expandable Jury Presentation Evaluation Accordion (Desktop View: hidden on mobile) */}
                      {isExpanded && (
                        <tr
                          key={`${row.id}_jury_accordion`}
                          id={`${row.id}_jury_accordion`}
                          className="hidden md:table-row bg-slate-50/95 dark:bg-slate-900/95 border-b-2 border-red-500/40"
                        >
                          <td colSpan={8} className="p-2 sm:p-5 max-w-full">
                            <div className="sticky left-2 sm:static w-[calc(100vw-2rem)] sm:w-full max-w-[calc(100vw-2rem)] sm:max-w-full mx-auto sm:mx-0 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-3.5 sm:p-5 shadow-lg space-y-4 box-border">
                              {/* Accordion Header Banner */}
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 mb-3 sm:mb-4 border-b border-slate-200 dark:border-slate-700 gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                                      <Sliders className="w-4 h-4" />
                                    </span>
                                    <div>
                                      <h4 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white leading-tight">
                                        Jury Scorecard: Case Study Presentation
                                      </h4>
                                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center flex-wrap gap-1.5">
                                        <span className="font-bold text-slate-700 dark:text-slate-300">
                                          {row.isTeam ? row.teamName : row.name}
                                        </span>
                                        {row.instituteName && (
                                          <>
                                            <span>•</span>
                                            <span className="truncate max-w-[180px] sm:max-w-[280px]">{row.instituteName}</span>
                                          </>
                                        )}
                                        {trackDisplayName && (
                                          <span className="px-1.5 py-0.2 rounded bg-red-500/10 text-red-600 dark:text-red-400 font-bold text-[9px] uppercase">
                                            {trackDisplayName}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Live Auto-calculated Total */}
                                <div className="flex items-center justify-between sm:justify-end gap-3 bg-red-50 dark:bg-red-950/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border border-red-200 dark:border-red-900/40 sm:border-0">
                                  <div className="text-left sm:text-right">
                                    <div className="text-[9px] sm:text-[10px] uppercase font-bold text-red-600 dark:text-red-400 sm:text-slate-400">Calculated Total</div>
                                    <div className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                                      <span>{liveFormTotal}</span>
                                      <span className="text-xs text-slate-400 font-semibold ml-0.5">/ 100</span>
                                    </div>
                                  </div>
                                  <div className="sm:hidden text-right">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                                      liveFormTotal >= 50
                                        ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                        : 'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                                    }`}>
                                      {liveFormTotal >= 50 ? 'Passing' : 'Below 50'}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Form Fields */}
                              <div className="space-y-4">
                                {/* 7 Official KPIs Grid */}
                                <div className="bg-slate-50 dark:bg-slate-900/60 rounded-xl p-2.5 sm:p-4 border border-slate-200 dark:border-slate-700/80">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2.5 sm:mb-3">
                                    <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                      Evaluation of Case Study Presentation (7 KPIs — Max 100 Marks)
                                    </span>
                                    <span className="text-[11px] font-mono font-bold text-slate-500">
                                      Sum: {liveFormTotal} / 100
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3.5">
                                    {CASE_STUDY_KPIS.map(kpi => {
                                      const val = (juryFormData as any)[kpi.id] ?? 0;
                                      return (
                                        <div
                                          key={kpi.id}
                                          className="bg-white dark:bg-slate-800 p-2.5 sm:p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                                        >
                                          <div className="flex items-center justify-between gap-2 mb-1">
                                            <span
                                              className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate"
                                              title={kpi.label}
                                            >
                                              {kpi.label}
                                            </span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 shrink-0">
                                              Max {kpi.max}
                                            </span>
                                          </div>
                                          <p className="text-[10px] text-slate-400 mb-2 line-clamp-1" title={kpi.desc}>
                                            {kpi.desc}
                                          </p>
                                          <div className="flex items-center gap-2">
                                            <input
                                              type="number"
                                              inputMode="numeric"
                                              pattern="[0-9]*"
                                              min="0"
                                              max={kpi.max}
                                              value={val === 0 ? '' : val}
                                              onChange={(e) => {
                                                const parsed = e.target.value === ''
                                                  ? 0
                                                  : Math.min(kpi.max, Math.max(0, Number(e.target.value)));
                                                setJuryFormData(prev => ({ ...prev, [kpi.id]: parsed }));
                                              }}
                                              placeholder="0"
                                              className="w-full text-base sm:text-xs font-bold py-2 sm:py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation"
                                            />
                                            <span className="text-xs font-bold text-slate-400 shrink-0">
                                              / {kpi.max}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>

                                {/* Qualitative Feedback & Attendance */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-1">
                                  <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                                      Jury Qualitative Feedback & Defense Observations
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={juryFormData.notes}
                                      onChange={(e) => setJuryFormData(prev => ({ ...prev, notes: e.target.value }))}
                                      placeholder="Enter jury observations, execution feasibility notes, or Q&A defense remarks..."
                                      className="w-full text-base sm:text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation"
                                    />
                                  </div>

                                  <div className="flex flex-col justify-between">
                                    <div>
                                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                                        Offline Presentation Attendance
                                      </label>
                                      <p className="text-[10px] text-slate-400 mb-1.5">
                                        Confirms team was physically present at the venue to present before the jury
                                      </p>
                                      <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[44px]">
                                        <input
                                          type="checkbox"
                                          checked={juryFormData.attendanceVerified}
                                          onChange={(e) => setJuryFormData(prev => ({ ...prev, attendanceVerified: e.target.checked }))}
                                          className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 shrink-0"
                                        />
                                        <span className="font-semibold">Team Present in Presentation Hall</span>
                                      </label>
                                    </div>

                                    {/* Feedback Message */}
                                    {jurySaveFeedback && (jurySaveFeedback.userId === row.userId || jurySaveFeedback.userId === row.id) && (
                                      <div className={`text-xs font-bold mt-2 p-2.5 rounded-xl ${jurySaveFeedback.isError
                                        ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                                        : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                                        }`}>
                                        {jurySaveFeedback.msg}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Form Action Buttons */}
                                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setExpandedJuryUserId(null);
                                      setActiveJuryRow(null);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 sm:border-transparent dark:border-slate-700 text-center transition cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    disabled={isSavingJury}
                                    onClick={() => handleSaveJuryEvaluation(row)}
                                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50 cursor-pointer min-h-[42px]"
                                  >
                                    {isSavingJury ? (
                                      <>
                                        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span>Saving Scorecard...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Save className="w-4 h-4" />
                                        <span>Save Evaluation ({liveFormTotal}/100)</span>
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Jury Evaluation Modal (Dedicated bottom sheet modal on mobile screens) */}
      {activeJuryRow && (
        <div
          className="md:hidden fixed inset-0 z-50 flex flex-col justify-end items-center bg-slate-950/80 backdrop-blur-sm p-0 animate-in fade-in duration-200"
          onClick={() => {
            setExpandedJuryUserId(null);
            setActiveJuryRow(null);
          }}
        >
          <div
            className="w-full bg-white dark:bg-slate-900 rounded-t-3xl border-t border-x border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300"
            role="dialog"
            aria-modal="true"
            onClick={e => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div className="pt-3 pb-1 flex justify-center shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
            </div>

            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-slate-800/40">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                <span className="p-2 rounded-xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 shrink-0">
                  <Sliders className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    Jury Scorecard
                  </h3>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate flex items-center gap-1.5">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activeJuryRow.isTeam ? activeJuryRow.teamName : activeJuryRow.name}
                    </span>
                    {activeJuryRow.instituteName && (
                      <>
                        <span>•</span>
                        <span className="truncate">{activeJuryRow.instituteName}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Live Score Badge & Close Button */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/40">
                  <div className="text-[8px] uppercase font-bold text-red-600 dark:text-red-400">Total</div>
                  <div className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                    {currentJuryFormTotal}
                    <span className="text-[10px] text-slate-400 font-normal">/100</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExpandedJuryUserId(null);
                    setActiveJuryRow(null);
                  }}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 overflow-y-auto space-y-4">
              {/* Selected Track Pill */}
              {juryFormData.track && (
                <div className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-200/60 dark:border-slate-700/60">
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-red-600 text-white shrink-0">Track</span>
                  <span className="truncate text-slate-900 dark:text-slate-100">{juryFormData.track}</span>
                </div>
              )}

              {/* 7 Official KPIs */}
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    7 Evaluation KPIs
                  </span>
                  <span className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    Sum: {currentJuryFormTotal} / 100
                  </span>
                </div>

                <div className="space-y-2.5">
                  {CASE_STUDY_KPIS.map(kpi => {
                    const val = (juryFormData as any)[kpi.id] ?? 0;
                    return (
                      <div
                        key={kpi.id}
                        className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {kpi.label}
                          </span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 shrink-0">
                            Max {kpi.max}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
                          {kpi.desc}
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0"
                            max={kpi.max}
                            value={val === 0 ? '' : val}
                            onChange={(e) => {
                              const parsed = e.target.value === ''
                                ? 0
                                : Math.min(kpi.max, Math.max(0, Number(e.target.value)));
                              setJuryFormData(prev => ({ ...prev, [kpi.id]: parsed }));
                            }}
                            placeholder="0"
                            className="w-full text-base font-bold py-2 px-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation"
                          />
                          <span className="text-xs font-bold text-slate-400 shrink-0">
                            / {kpi.max}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Qualitative Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jury Qualitative Feedback & Defense Observations
                </label>
                <textarea
                  rows={2}
                  value={juryFormData.notes}
                  onChange={(e) => setJuryFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Enter jury observations, execution feasibility notes, or Q&A defense remarks..."
                  className="w-full text-base sm:text-xs py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500 touch-manipulation"
                />
              </div>

              {/* Offline Presentation Attendance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-0.5">
                  Offline Presentation Attendance
                </label>
                <p className="text-[10px] text-slate-400 mb-1.5">
                  Confirms team was physically present at the venue to present before the jury
                </p>
                <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer font-medium bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 min-h-[44px]">
                  <input
                    type="checkbox"
                    checked={juryFormData.attendanceVerified}
                    onChange={(e) => setJuryFormData(prev => ({ ...prev, attendanceVerified: e.target.checked }))}
                    className="w-4 h-4 rounded text-red-600 focus:ring-red-500 border-slate-300 shrink-0"
                  />
                  <span className="font-semibold">Team Present in Presentation Hall</span>
                </label>
              </div>

              {/* Feedback Message */}
              {jurySaveFeedback && (jurySaveFeedback.userId === activeJuryRow.userId || jurySaveFeedback.userId === activeJuryRow.id) && (
                <div className={`text-xs font-bold p-3 rounded-xl ${jurySaveFeedback.isError
                  ? 'bg-red-500/10 text-red-600 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                  }`}>
                  {jurySaveFeedback.msg}
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="p-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setExpandedJuryUserId(null);
                  setActiveJuryRow(null);
                }}
                className="w-1/3 px-4 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSavingJury}
                onClick={async () => {
                  await handleSaveJuryEvaluation(activeJuryRow);
                }}
                className="w-2/3 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition disabled:opacity-50 cursor-pointer min-h-[44px]"
              >
                {isSavingJury ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Evaluation ({currentJuryFormTotal}/100)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Squad Members Modal (Triggered from Headcount / Members Button in ACTION Column) */}
      {activeSquadMembersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[88vh] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.55)] border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in zoom-in-95"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center justify-center text-blue-300 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {activeSquadMembersModal.registrationNumber || activeSquadMembersModal.teamId || 'TEAM ENTRY'}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30">
                      {activeSquadMembersModal.members?.length || 1} {activeSquadMembersModal.members?.length === 1 ? 'Member' : 'Members'}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                    <span>{activeSquadMembersModal.teamName}</span>
                    <span className="text-xs text-slate-300 font-normal">
                      • {activeSquadMembersModal.instituteName}
                    </span>
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveSquadMembersModal(null)}
                className="w-8 h-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors"
                title="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Subheader / Summary Cockpit */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Team Score Avg</span>
                  <div className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <span>{activeSquadMembersModal.score}%</span>
                    <span className="text-[10px] text-slate-400 font-normal">({activeSquadMembersModal.score}/100)</span>
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Stage 2 Cutoff</span>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    ≥ {effectiveCutoff}%
                  </div>
                </div>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Qualification</span>
                  <div className="mt-0.5">
                    {activeSquadMembersModal.isQualified ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Qualified R2
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                        Below Cutoff
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body: Squad Member Cards */}
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              {activeSquadMembersModal.members?.map((member: any, mIdx: number) => (
                <div
                  key={member.userId || mIdx}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-amber-500 text-white font-black text-sm flex items-center justify-center shrink-0 uppercase shadow-xs">
                      {(member.name || 'MB').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {member.name}
                        </span>
                        {member.isTeamLeader && (
                          <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Leader
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                        {member.email}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        {member.tabSwitches === 0 ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                            <ShieldCheck className="w-3 h-3" /> Clean
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-500 font-semibold">
                            <ShieldAlert className="w-3 h-3" /> {member.tabSwitches} tab switches
                          </span>
                        )}
                        {member.submittedAt && (
                          <span>Submitted: {formatISTDateTime(member.submittedAt)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {/* Scores Box */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-center">
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Score</div>
                        <div className="text-xs font-black text-slate-900 dark:text-white">
                          {member.score}<span className="text-[9px] text-slate-400 font-normal">/100</span>
                        </div>
                      </div>
                      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Tie-Breaker</div>
                        <div className="text-xs font-bold text-amber-600 dark:text-amber-400">
                          ⚡ {member.analyticalScore}<span className="text-[9px] text-slate-400 font-normal">/20</span>
                        </div>
                      </div>
                      <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
                      <div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Time</div>
                        <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          {Math.floor((member.timeTaken || 0) / 60)}m {(member.timeTaken || 0) % 60}s
                        </div>
                      </div>
                    </div>

                    {/* View Attempt Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (member.attemptData) {
                          handleOpenReview(member.attemptData);
                        }
                      }}
                      className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
                      title="Inspect full attempted questions and answers"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span>Showing {activeSquadMembersModal.members?.length || 1} member submissions for {activeSquadMembersModal.teamName}</span>
              <button
                type="button"
                onClick={() => setActiveSquadMembersModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activeAttemptRow?.isQualified
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/25'
                          }`}
                      >
                        {activeAttemptRow?.isQualified ? (
                          <span>✓ Passed</span>
                        ) : (
                          <span>✕ Failed</span>
                        )}
                      </span>
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

              {/* Row 3: Question Category Filters & View Density Mode */}
              <div className="px-5 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0">
                    Filter:
                  </span>
                  <div className="relative">
                    <select
                      value={modalFilter}
                      onChange={(e) => setModalFilter(e.target.value as any)}
                      className="px-3 py-1.5 pr-8 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 text-xs font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 transition shadow-2xs appearance-none"
                    >
                      <option value="all">All Questions ({modalStats.total})</option>
                      <option value="correct">✓ Correct ({modalStats.correct})</option>
                      <option value="incorrect">✕ Incorrect ({modalStats.incorrect})</option>
                      <option value="unattempted">○ Skipped ({modalStats.unattempted})</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* View Density Switch: Compact vs Detailed */}
                <div className="flex items-center shrink-0 border border-slate-200 dark:border-slate-700 rounded-xl p-0.5 bg-slate-100 dark:bg-slate-800 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIsCompactReview(true)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${isCompactReview
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                      }`}
                  >
                    <span>Compact Mode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCompactReview(false)}
                    className={`px-3 py-1 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${!isCompactReview
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
                      }`}
                  >
                    <span>Full 4-Option View</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Questions List (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
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

                  const correctLetter = String.fromCharCode(65 + Number(q.correctAnswerIndex));
                  const correctText = q.options[Number(q.correctAnswerIndex)];
                  const studentLetter = isAttempted ? String.fromCharCode(65 + Number(studentSelectedOptIdx)) : '';
                  const studentText = isAttempted ? q.options[Number(studentSelectedOptIdx)] : '';
                  const isExplanationOpen = expandedExplanationQId === q.id;

                  return (
                    <div
                      key={q.id}
                      className="p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-2xs space-y-2 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      {/* Question Header Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-1.5">
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
                        <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border-l-4 border-slate-400 text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                          {q.caseletSnippet}
                        </div>
                      )}

                      {/* Question Text */}
                      <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* --- COMPACT MODE (Streamlined & Decluttered) --- */}
                      {isCompactReview ? (
                        <div className="space-y-1.5 pt-1">
                          {isCorrect ? (
                            <div className="py-2 px-3 rounded-xl border border-emerald-400/50 bg-emerald-500/10 dark:bg-emerald-950/25 text-xs text-emerald-950 dark:text-emerald-100 flex items-center justify-between gap-2.5">
                              <div className="flex items-start gap-2 min-w-0">
                                <span className="w-5 h-5 rounded-md bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                                  {studentLetter}
                                </span>
                                <span className="font-semibold break-words leading-tight pt-0.5">
                                  {studentText}
                                </span>
                              </div>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shrink-0">
                                <Check className="w-3 h-3" /> Selected • Correct (+4)
                              </span>
                            </div>
                          ) : isWrong ? (
                            <div className="space-y-1.5">
                              {/* Candidate Choice */}
                              <div className="py-1.5 px-3 rounded-xl border border-rose-300 dark:border-rose-900/60 bg-rose-500/10 dark:bg-rose-950/25 text-xs text-rose-950 dark:text-rose-100 flex items-center justify-between gap-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded-md bg-rose-600 text-white font-black text-[11px] flex items-center justify-center shrink-0">
                                    {studentLetter}
                                  </span>
                                  <span className="font-semibold break-words leading-tight pt-0.5">
                                    {studentText}
                                  </span>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shrink-0">
                                  <X className="w-3 h-3" /> Candidate Choice (0 penalty)
                                </span>
                              </div>

                              {/* Correct Choice */}
                              <div className="py-1.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/15 text-xs text-emerald-950 dark:text-emerald-100 flex items-center justify-between gap-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded-md border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0">
                                    {correctLetter}
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 break-words leading-tight pt-0.5">
                                    {correctText}
                                  </span>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              {/* Skipped */}
                              <div className="py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs text-slate-500 flex items-center justify-between gap-2">
                                <span className="font-medium italic">
                                  Candidate skipped this question without submitting an option
                                </span>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                  0 Marks
                                </span>
                              </div>

                              {/* Correct Answer */}
                              <div className="py-1.5 px-3 rounded-xl border border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-950/15 text-xs text-emerald-950 dark:text-emerald-100 flex items-center justify-between gap-2.5">
                                <div className="flex items-start gap-2 min-w-0">
                                  <span className="w-5 h-5 rounded-md border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-black text-[11px] flex items-center justify-center shrink-0">
                                    {correctLetter}
                                  </span>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 break-words leading-tight pt-0.5">
                                    {correctText}
                                  </span>
                                </div>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Toggleable Explanation in Compact Mode */}
                          {q.explanation && (
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => setExpandedExplanationQId(isExplanationOpen ? null : q.id)}
                                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
                              >
                                <BookOpen className="w-3 h-3" />
                                <span>{isExplanationOpen ? 'Hide Explanation' : 'View Explanation'}</span>
                                {isExplanationOpen ? (
                                  <ChevronUp className="w-3 h-3" />
                                ) : (
                                  <ChevronDown className="w-3 h-3" />
                                )}
                              </button>

                              {isExplanationOpen && (
                                <div className="mt-1.5 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2 leading-relaxed">
                                  <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                  <div>
                                    <strong className="font-bold">Correct Answer Explanation:</strong> {q.explanation}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        /* --- FULL 4-OPTION DETAILED VIEW --- */
                        <div className="space-y-1.5 pt-0.5">
                          {q.options.map((opt, optIdx) => {
                            const isOptionCorrect = Number(optIdx) === Number(q.correctAnswerIndex);
                            const isOptionStudentChosen = isAttempted && Number(optIdx) === Number(studentSelectedOptIdx);

                            let optionStyles = 'border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300';
                            let letterCircleStyles = 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300';
                            let badgeEl: React.ReactNode = null;

                            if (isOptionStudentChosen && isOptionCorrect) {
                              optionStyles = 'border-2 border-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-xs ring-1 ring-emerald-500/50';
                              letterCircleStyles = 'bg-emerald-600 text-white font-black';
                              badgeEl = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white shadow-2xs shrink-0">
                                  <Check className="w-3 h-3" /> Candidate Selected (Correct • +4)
                                </span>
                              );
                            } else if (isOptionStudentChosen && !isOptionCorrect) {
                              optionStyles = 'border-2 border-rose-500 bg-rose-500/10 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 shadow-xs ring-1 ring-rose-500/50';
                              letterCircleStyles = 'bg-rose-600 text-white font-black';
                              badgeEl = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-2xs shrink-0">
                                  <X className="w-3 h-3" /> Candidate Selected (Wrong Option{isNegativeMarking ? ` • -${negativeMarks}` : ' • 0 Penalty'})
                                </span>
                              );
                            } else if (isOptionCorrect) {
                              optionStyles = 'border-2 border-emerald-500/70 bg-emerald-500/5 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100';
                              letterCircleStyles = 'border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 font-bold';
                              badgeEl = (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-emerald-500 text-emerald-600 dark:text-emerald-400 shrink-0">
                                  <Check className="w-3 h-3" /> Correct Answer
                                </span>
                              );
                            }

                            const optionLetter = String.fromCharCode(65 + optIdx);

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

                          {/* Always-visible Explanation in Detailed Mode */}
                          {q.explanation && (
                            <div className="mt-2 p-2.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-900/40 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2 leading-relaxed">
                              <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <div>
                                <strong className="font-bold">Correct Answer Explanation:</strong> {q.explanation}
                              </div>
                            </div>
                          )}
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

      {/* ─────────────────────────────────────────────────────────────────────────────
          CERTIFICATE PUBLICATION & EMAIL DISPATCH COCKPIT MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      {showCertificateCockpit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                    <span>Certificate Publication &amp; Email Dispatch Cockpit</span>
                    <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Official AIMA–ICRC
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Generate and publish official certificates to participant workspaces and dispatch via Falconide SMTP relay.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCertificateCockpit(false);
                  setCertPublishStatus(null);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50 dark:bg-slate-950/50">

              {/* Status Alert */}
              {certPublishStatus && (
                <div
                  className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold ${
                    certPublishStatus.type === 'success'
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{certPublishStatus.message}</span>
                  </div>
                  <button
                    onClick={() => setCertPublishStatus(null)}
                    className="text-slate-500 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Configuration Section: Grand Finale Selection Top % */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-amber-500" />
                      <span>Grand Finale Selection Threshold (Top Percentage)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Configures the percentage cutoff for teams advancing to the Grand Finale to receive the official Selection Certificate.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Cutoff:</span>
                    <div className="relative">
                      <input
                        type="number"
                        min={5}
                        max={100}
                        step={1}
                        value={selectionTopPercentage}
                        onChange={e => setSelectionTopPercentage(Math.max(1, Math.min(100, Number(e.target.value) || 25)))}
                        className="w-20 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xs text-center focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold pointer-events-none">%</span>
                    </div>
                  </div>
                </div>

                {/* Preset Chips */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-[11px] font-semibold text-slate-500">Quick Presets:</span>
                  {[15, 20, 25, 30, 40, 50].map(pct => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSelectionTopPercentage(pct)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                        selectionTopPercentage === pct
                          ? 'bg-amber-500 text-slate-950 font-extrabold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      Top {pct}% {pct === 25 ? '★ Recommended' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Summary Telemetry Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-bold">
                    <span>🥇 Achievement (Top 1)</span>
                    <Trophy className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    1 Team
                  </div>
                  <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 truncate">
                    Rank 1: {computedCertificates[0]?.name || 'N/A'}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 text-xs font-bold">
                    <span>🏆 Selection (Grand Finale)</span>
                    <Medal className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {Math.max(0, selectionCutoffRank - 1)} Teams
                  </div>
                  <div className="text-[10px] text-blue-700 dark:text-blue-400 mt-0.5">
                    Ranks 2 to {selectionCutoffRank} (Top {selectionTopPercentage}%)
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 text-xs font-bold">
                    <span>📜 Participation</span>
                    <FileText className="w-4 h-4 text-slate-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {Math.max(0, computedCertificates.length - selectionCutoffRank)} Teams
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Ranks {selectionCutoffRank + 1} to {computedCertificates.length}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                    <span>📨 Total Active Roster</span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                    {computedCertificates.length} Teams
                  </div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 mt-0.5">
                    {rankingMode === 'combined' ? 'Grand Combined Ranks' : 'Quiz Screening Ranks'}
                  </div>
                </div>
              </div>

              {/* Recipient Preview Table with Filters */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter By Type:</span>
                    {[
                      { id: 'all', label: `All (${computedCertificates.length})` },
                      { id: 'achievement', label: 'Achievement (1)' },
                      { id: 'selection', label: `Selection (${Math.max(0, selectionCutoffRank - 1)})` },
                      { id: 'participation', label: `Participation (${Math.max(0, computedCertificates.length - selectionCutoffRank)})` },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setCertFilterCategory(tab.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                          certFilterCategory === tab.id
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search recipient, team, institute..."
                      value={certSearchQuery}
                      onChange={e => setCertSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400 w-full sm:w-64 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 border-b border-slate-200 dark:border-slate-700 text-slate-500 uppercase tracking-wider text-[10px] font-bold">
                      <tr>
                        <th className="py-2.5 px-3 text-center">Rank</th>
                        <th className="py-2.5 px-3">Recipient / Team</th>
                        <th className="py-2.5 px-3">Institution</th>
                        <th className="py-2.5 px-3 text-center">Score</th>
                        <th className="py-2.5 px-3">Assigned Certificate Type</th>
                        <th className="py-2.5 px-3 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {computedCertificates
                        .filter(item => {
                          if (certFilterCategory !== 'all' && item.category !== certFilterCategory) return false;
                          if (!certSearchQuery) return true;
                          const q = certSearchQuery.toLowerCase();
                          return (
                            item.name.toLowerCase().includes(q) ||
                            item.instituteName.toLowerCase().includes(q) ||
                            (item.email && item.email.toLowerCase().includes(q))
                          );
                        })
                        .map(item => (
                          <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                            <td className="py-2.5 px-3 text-center font-bold">
                              {item.rank === 1 ? '🥇 1' : item.rank === 2 ? '🥈 2' : item.rank === 3 ? '🥉 3' : item.rank}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-900 dark:text-slate-100">
                              <div className="truncate max-w-[200px]">{item.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{item.email || 'team-member@email.com'}</div>
                            </td>
                            <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300 truncate max-w-[200px]">
                              {item.instituteName}
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-200">
                              {rankingMode === 'combined' ? `${item.combinedScore}/200` : `${item.quizScore}/100`}
                            </td>
                            <td className="py-2.5 px-3">
                              {item.category === 'achievement' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950 shadow-2xs">
                                  <Trophy className="w-3 h-3" /> Top 1 Achievement
                                </span>
                              ) : item.category === 'selection' ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-300/80 dark:border-blue-700/80">
                                  <Medal className="w-3 h-3" /> Selection - Grand Finale
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                  📜 Participation
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setActiveCertificateModal(item.certificate)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer shadow-2xs"
                                  title="Preview replica of certificate"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={emailingCertId === item.id}
                                  onClick={() => handleSendSingleCertificateEmail(item)}
                                  className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-bold transition cursor-pointer shadow-2xs border border-amber-200/60 dark:border-amber-800/60 disabled:opacity-50"
                                  title={`Send / Resend certificate email to ${item.email || item.certificate?.recipientEmail || 'candidate'}`}
                                >
                                  {emailingCertId === item.id ? (
                                    <span className="w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin inline-block" />
                                  ) : (
                                    <Mail className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Action Footer */}
            <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>
                  Exact official certificates matching <strong>INDIA CASE LEAGUE 2026 Certificate.pdf</strong> with authentic 5 signatories.
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handlePublishToWorkspacesOnly}
                  disabled={isPublishingCerts || isEmailingCerts}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs border border-slate-200 dark:border-slate-700"
                  title="Make certificates immediately available in Student Dashboards without triggering email alerts"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{isPublishingCerts ? 'Publishing...' : 'Publish Workspaces Only (No Email)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePublishAndEmailDispatch}
                  disabled={isPublishingCerts || isEmailingCerts}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  title="Publish official certificates to student workspaces AND dispatch email notifications with verified certificate IDs"
                >
                  <Mail className={`w-4 h-4 text-slate-950 ${isEmailingCerts ? 'animate-bounce' : ''}`} />
                  <span>{isEmailingCerts ? 'Publishing & Dispatching...' : 'Publish & Dispatch Certificate Emails'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
