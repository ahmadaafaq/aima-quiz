import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizTaker } from './QuizTaker';
import { CaseDeckSubmitter } from './CaseDeckSubmitter';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import { ParticipantLoginPage } from '../auth/ParticipantLoginPage';
import { OFFICIAL_CASE_TRACKS, OFFICIAL_INSTRUCTION_DOCS, CaseTrack } from '../../data/caseTracks';
import { fetchRegistrationByNumber, fetchProgramQuestionsOrdered, fetchParticipantTrackSelection } from '../../lib/supabase';
import { CSRBootcampRegistration, QuizQuestion } from '../../types';
import { formatQuizScheduleDate, parseISTTimestamp, formatISTDateTime } from '../../lib/formatters';
import {
  AlertCircle,
  AlertTriangle,
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
  LayoutGrid,
  List,
  Lock,
  MapPin,
  Pause,
  Plus,
  QrCode,
  Send,
  Share2,
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
  Zap,
  LogOut,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const {
    config,
    currentUser,
    currentTeam,
    createTeam,
    joinTeam,
    addTeamMember,
    selectTeamTrack,
    makePayment,
    quizAttempts,
    caseSubmissions,
    hubs,
    certificates,
    setCertificates,
    quizPrograms,
    refreshQuizPrograms,
    setActiveCertificateModal,
    setActiveSupportModal,
    setActiveVerifierModal,
    participantUser,
    loginParticipantSession,
    logoutParticipant,
    questions,
    isQuizActive,
    setIsQuizActive,
    updateUserProfile,
  } = useCompetition();

  // Enforce real participant authentication - no mock data in production
  if (!participantUser) {
    return <ParticipantLoginPage onLoginSuccess={(part) => loginParticipantSession(part)} />;
  }

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
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Add 4th member states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [addMemberName, setAddMemberName] = useState('');
  const [addMemberEmail, setAddMemberEmail] = useState('');
  const [addMemberMobile, setAddMemberMobile] = useState('');
  const [addMemberEnrolment, setAddMemberEnrolment] = useState('');
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [addMemberFeedback, setAddMemberFeedback] = useState<{ success: boolean; message: string; password?: string } | null>(null);
  const [copiedPass, setCopiedPass] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  const activeConfirmedTrackId = currentTeam?.selectedTrackId || currentUser.selectedTrackId;
  const activeConfirmedTrack = OFFICIAL_CASE_TRACKS.find(t => t.id === activeConfirmedTrackId);

  // Round 2 Track Selection & Offline Presentation Instructions
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<CaseTrack | undefined>(undefined);
  const [candidateTrackId, setCandidateTrackId] = useState<string | null>(
    activeConfirmedTrackId || null
  );
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [trackLockSuccessMsg, setTrackLockSuccessMsg] = useState<string | null>(null);
  const [trackViewMode, setTrackViewMode] = useState<'list' | 'grid'>('list');

  // Sync candidateTrackId when activeConfirmedTrackId is discovered from context/storage/DB
  useEffect(() => {
    if (activeConfirmedTrackId && candidateTrackId !== activeConfirmedTrackId) {
      setCandidateTrackId(activeConfirmedTrackId);
    }
  }, [activeConfirmedTrackId]);

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
            if ((reg as any)?.raw_data?.certificate) {
              const c = (reg as any).raw_data.certificate;
              setCertificates(prev => [c, ...prev.filter(item => item.id !== c.id && item.certificateNumber !== c.certificateNumber)]);
            }
          }
        } catch (err) {
          console.warn('Could not load live student registration:', err);
        }
      }

      // If activeConfirmedTrackId is not yet in state, fetch authoritatively from DB
      if (!currentTeam?.selectedTrackId && !currentUser.selectedTrackId) {
        try {
          const trackData = await fetchParticipantTrackSelection(regNum || undefined, currentUser.email);
          if (isMounted && trackData?.trackId) {
            updateUserProfile({
              selectedTrackId: trackData.trackId,
              selectedTrackName: trackData.trackName,
              trackSelectedAt: trackData.trackSelectedAt,
            });
            setCandidateTrackId(trackData.trackId);
          }
        } catch (err) {
          console.warn('Could not sync candidate track selection:', err);
        }
      }
    };
    loadLiveRegistration();
    return () => {
      isMounted = false;
    };
  }, [currentUser.registrationNumber, currentTeam?.inviteCode, currentUser.teamId, currentUser.email]);

  // Payment simulated methods
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('');

  const myAttempt = Array.isArray(quizAttempts)
    ? quizAttempts.find(q => q.userId === currentUser.id || q.studentId === currentUser.id || (currentUser.email && q.participantEmail?.toLowerCase() === currentUser.email.toLowerCase()))
    : Object.values(quizAttempts || {}).find((q: any) => q.userId === currentUser.id || q.studentId === currentUser.id || (currentUser.email && q.participantEmail?.toLowerCase() === currentUser.email.toLowerCase()));

  const myCaseSubmission = Array.isArray(caseSubmissions)
    ? caseSubmissions.find(s => s.teamId === currentTeam?.id) || currentTeam?.r2Submission
    : currentTeam?.r2Submission;

  const myCert =
    (Array.isArray(certificates)
      ? certificates.find((c) => {
          if (!c) return false;
          // Match by email
          if (currentUser.email && c.recipientEmail && c.recipientEmail.toLowerCase().trim() === currentUser.email.toLowerCase().trim()) return true;
          if (liveRegistration?.email && c.recipientEmail && c.recipientEmail.toLowerCase().trim() === liveRegistration.email.toLowerCase().trim()) return true;
          if (liveRegistration?.candidate_email && c.recipientEmail && c.recipientEmail.toLowerCase().trim() === liveRegistration.candidate_email.toLowerCase().trim()) return true;
          // Match by registration number
          if (currentUser.registrationNumber && (c as any).registrationNumber && (c as any).registrationNumber === currentUser.registrationNumber) return true;
          if (liveRegistration?.registrationNumber && (c as any).registrationNumber && (c as any).registrationNumber === liveRegistration.registrationNumber) return true;
          if (currentUser.registrationNumber && c.certificateNumber && c.certificateNumber.includes(currentUser.registrationNumber)) return true;
          if (liveRegistration?.registrationNumber && c.certificateNumber && c.certificateNumber.includes(liveRegistration.registrationNumber)) return true;
          // Match by team name
          if (currentTeam?.name && c.teamName && c.teamName.toLowerCase().trim() === currentTeam.name.toLowerCase().trim()) return true;
          if (liveRegistration?.teamName && c.teamName && c.teamName.toLowerCase().trim() === liveRegistration.teamName.toLowerCase().trim()) return true;
          // Match by recipient ID / team ID
          if (c.recipientId && (c.recipientId === currentUser.id || c.recipientId === currentUser.email)) return true;
          if (currentTeam?.id && c.teamId && c.teamId === currentTeam.id) return true;
          return false;
        })
      : undefined) ||
    (liveRegistration as any)?.raw_data?.certificate ||
    (liveRegistration as any)?.certificate;

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

    if (status === 'paused') {
      return {
        isOpen: false,
        label: 'Quiz Paused',
        reason: 'This assessment has been paused by the administrator.',
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
        reason: `Quiz scheduled to start on ${openDateStr}.`,
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

  const isComplimentary =
    liveRegistration?.totalPayable === 0 ||
    (liveRegistration as any)?.total_amount === 0 ||
    currentTeam?.totalAmount === 0 ||
    liveRegistration?.paymentMethod === 'EARLY_BIRD_COMPLIMENTARY' ||
    (liveRegistration as any)?.payment_method === 'EARLY_BIRD_COMPLIMENTARY' ||
    liveRegistration?.tierId === 'early_bird_free' ||
    Boolean(liveRegistration?.feeTier && /early\s*bird/i.test(liveRegistration.feeTier)) ||
    Boolean((liveRegistration as any)?.fee_tier && /early\s*bird/i.test((liveRegistration as any).fee_tier)) ||
    Boolean(liveRegistration?.tierLabel && /early\s*bird/i.test(liveRegistration.tierLabel)) ||
    Boolean(currentTeam?.feeTier && /early\s*bird/i.test(currentTeam.feeTier)) ||
    Boolean((liveRegistration as any)?.raw_data?.fee_tier && /early\s*bird/i.test((liveRegistration as any).raw_data.fee_tier)) ||
    Boolean((liveRegistration as any)?.raw_data?.tierLabel && /early\s*bird/i.test((liveRegistration as any).raw_data.tierLabel));

  const totalAmountVal = isComplimentary
    ? 0
    : (
      liveRegistration?.totalPayable ??
      (liveRegistration as any)?.total_amount ??
      currentTeam?.totalAmount ??
      (candidateCount * (config?.feeR1R2 || 200))
    );

  const formattedTotalAmount = isComplimentary ? '₹0' : `₹${Number(totalAmountVal || 0).toLocaleString('en-IN')}`;
  const perStudentAmount = isComplimentary ? 0 : (candidateCount > 0 ? Math.round(totalAmountVal / candidateCount) : 0);
  const formattedPerStudentAmount = isComplimentary ? '₹0' : `₹${perStudentAmount.toLocaleString('en-IN')}`;

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

  // Dynamic Results Published determination strictly from quiz_programs table & competition config
  const isResultsPublished = Boolean(
    stage1Program?.isResultsPublished ??
    (stage1Program as any)?.is_results_published ??
    config?.isResultsPublishedR1 ??
    config?.isPublicResultsPublished ??
    false
  );

  // Team Cumulative Score Calculation
  const isTeam = Boolean(!isSoloCandidate && currentTeam && (currentTeam.members?.length > 1 || liveRegistration?.teamName));
  const teamMemberEmails = useMemo(() => {
    return (currentTeam?.members || []).map((m: any) => m.email?.toLowerCase().trim()).filter(Boolean);
  }, [currentTeam?.members]);
  const teamMemberStudentIds = useMemo(() => {
    return (currentTeam?.members || []).map((m: any) => m.studentId || m.id).filter(Boolean);
  }, [currentTeam?.members]);

  const teamAttempts = useMemo(() => {
    if (!isTeam || !currentTeam) return [];
    return quizAttempts.filter(a => {
      if (!a.isCompleted) return false;
      if (currentTeam.id && a.teamId === currentTeam.id) return true;
      if (a.participantEmail && teamMemberEmails.includes(a.participantEmail.toLowerCase().trim())) return true;
      if (a.studentId && teamMemberStudentIds.includes(a.studentId)) return true;
      return false;
    });
  }, [isTeam, currentTeam, quizAttempts, teamMemberEmails, teamMemberStudentIds]);

  const teamAttemptCount = teamAttempts.length;
  const teamCumulativeScore = useMemo(() => {
    return teamAttempts.reduce((acc, a) => acc + (a.score ?? 0), 0);
  }, [teamAttempts]);
  const teamAverageScore = teamAttemptCount > 0 ? Math.round(teamCumulativeScore / teamAttemptCount) : (myAttempt?.score ?? 0);

  const activeCutoffScore = stage1Program?.cutoffScore ?? 40;
  // If team, the complete team's cumulative score average must pass cutoff; if solo, individual score
  const isPassedCutoff = isTeam
    ? (teamAttemptCount > 0 ? teamAverageScore >= activeCutoffScore : false)
    : (myAttempt ? myAttempt.score >= activeCutoffScore : false);
  const isQualifiedForRound2 = Boolean(isResultsPublished && isPassedCutoff);
  const isQualifiedForRound3 = Boolean(currentTeam?.r3Qualified || (currentTeam as any)?.r4Qualified);

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
        if (config?.activeStage === 'round_3' || config?.activeStage === 'round_4') return 'Round 3 Active • Grand Finale Qualifier';
        return `Round 1 Passed (${myAttempt.score}%) • Qualified for Offline Round 2`;
      }
      return `Round 1 Attempt Recorded (${myAttempt.score}%) • ${isPassedCutoff ? 'Passed' : 'Failed'}`;
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

  // -------------------------------------------------------------
  // OFFICIAL AIMA SCORECARD HTML GENERATOR (NATIONAL ACCREDITATION FORMAT)
  // -------------------------------------------------------------
  const generateOfficialScorecardHtml = (): string => {
    if (!myAttempt) return '';

    const candidateName = (currentUser.name || liveRegistration?.fullName || 'Candidate').toUpperCase();
    const regNum = currentUser.registrationNumber || liveRegistration?.registrationNumber || myAttempt.registrationNumber || 'AIMA-CL26-00000';
    const institute = currentUser.instituteName || liveRegistration?.instituteName || 'All India Management Association Nominee Institution';
    const teamName = currentTeam?.name || liveRegistration?.teamName || (isSoloCandidate ? 'Solo Candidate Entry' : 'Individual Entry');
    const email = currentUser.email || liveRegistration?.email || 'N/A';
    const quizTitle = stage1Program?.title || 'Case Competition – Stage 1 Business Quiz';
    const quizCode = stage1Program?.code || 'AIMA-CL26-S1-QZ';
    const score = Number(myAttempt.score ?? 0);
    const cutoff = Number(activeCutoffScore ?? 40);
    const isPassed = isPassedCutoff;
    const totalQ = stage1Program?.totalQuestions || 30;
    const correctCount = studentModalStats.correct || Math.round((score / 100) * 25);
    const coreScore = studentModalStats.coreScore || score;
    const coreCorrect = studentModalStats.coreCorrect || Math.min(correctCount, 25);
    const tieScore = studentModalStats.tieBreakerScore ?? (myAttempt as any).analytical_score ?? (myAttempt as any).analyticalScore ?? 8;
    const tieCorrect = studentModalStats.tieCorrect ?? 2;
    const timeTaken = `${Math.floor((myAttempt.timeTakenSeconds || 0) / 60)}m ${(myAttempt.timeTakenSeconds || 0) % 60}s`;
    const submittedDate = formatISTDateTime(myAttempt.submittedAt);
    const tabViolations = myAttempt.tabSwitchCount || 0;
    const verificationRef = `AIMA-CL26-R1-${(myAttempt.attemptId || 'OFFICIAL').slice(0, 8).toUpperCase()}`;
    const securityHash = `SHA256:${(verificationRef + '-' + score + '-' + regNum).split('').reduce((acc, c) => ((acc << 5) - acc) + c.charCodeAt(0) | 0, 0).toString(16).toUpperCase()}-AIMA26`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AIMA Official Scorecard - ${regNum} - ${candidateName}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f1f5f9;
      margin: 0;
      padding: 16px;
    }
    .no-print-toolbar {
      max-width: 840px;
      margin: 0 auto 14px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 16px;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
    }
    .btn-action {
      background: #002147;
      color: #ffffff;
      border: none;
      padding: 8px 18px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 12px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: background 0.15s ease;
    }
    .btn-action:hover {
      background: #0f3460;
    }
    .scorecard-frame {
      position: relative;
      max-width: 840px;
      margin: 0 auto;
      background: #ffffff;
      border: 3px solid #002147;
      outline: 1px solid #c59b27;
      outline-offset: -5px;
      padding: 24px 30px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.10);
      border-radius: 4px;
      overflow: hidden;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    /* Ornate Gold Corner Accent */
    .corner-accent {
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #c59b27;
      border-style: solid;
      pointer-events: none;
      z-index: 4;
    }
    .corner-tl { top: 8px; left: 8px; border-width: 3px 0 0 3px; }
    .corner-tr { top: 8px; right: 8px; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: 8px; left: 8px; border-width: 0 0 3px 3px; }
    .corner-br { bottom: 8px; right: 8px; border-width: 0 3px 3px 0; }

    /* Security Watermark Layer */
    .watermark-layer {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: 1;
      opacity: 0.035;
      user-select: none;
    }
    .watermark-emblem {
      width: 320px;
      height: 320px;
    }
    .watermark-text {
      transform: rotate(-30deg);
      font-size: 38px;
      font-weight: 900;
      color: #002147;
      letter-spacing: 5px;
      text-transform: uppercase;
      text-align: center;
      line-height: 1.45;
    }

    .doc-content {
      position: relative;
      z-index: 2;
    }

    /* Official Apex Header */
    .official-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 2px solid #002147;
      padding-bottom: 12px;
      margin-bottom: 12px;
      gap: 12px;
    }
    .header-crest-block {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .aima-crest-svg {
      width: 58px;
      height: 58px;
      shrink-0;
    }
    .header-titles h1 {
      margin: 0;
      font-size: 17px;
      font-weight: 900;
      letter-spacing: 0.6px;
      color: #002147;
      text-transform: uppercase;
      font-family: 'Times New Roman', Georgia, serif;
    }
    .header-titles .sub-apex {
      font-size: 9.5px;
      font-weight: 600;
      color: #64748b;
      margin-top: 1px;
      letter-spacing: 0.2px;
    }
    .header-titles .icrc-title {
      font-size: 12px;
      font-weight: 800;
      color: #b45309;
      margin-top: 2px;
      letter-spacing: 0.3px;
      text-transform: uppercase;
    }
    .header-titles .comp-title {
      font-size: 10px;
      font-weight: 700;
      color: #002147;
      margin-top: 1px;
      letter-spacing: 0.2px;
    }

    /* Right Security Stamp & Barcode Block */
    .security-stamp-block {
      text-align: right;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
      min-width: 160px;
    }
    .qr-badge-container {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 5px 8px;
    }
    .verif-qr {
      width: 40px;
      height: 40px;
    }
    .verif-meta {
      text-align: left;
      font-size: 8.5px;
      line-height: 1.25;
      color: #334155;
    }
    .verif-meta strong {
      display: block;
      color: #059669;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
    .verif-meta .code {
      font-family: 'Courier New', monospace;
      font-weight: 800;
      color: #002147;
      font-size: 9px;
    }

    /* Document Title Ribbon Banner */
    .title-banner {
      background: linear-gradient(135deg, #002147 0%, #0f3460 100%);
      border-left: 4px solid #c59b27;
      border-right: 4px solid #c59b27;
      color: #ffffff;
      padding: 9px 14px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
      box-shadow: 0 3px 8px rgba(0, 33, 71, 0.12);
    }
    .title-banner-text h2 {
      margin: 0;
      font-size: 12.5px;
      font-weight: 800;
      letter-spacing: 0.6px;
      text-transform: uppercase;
    }
    .title-banner-text p {
      margin: 1px 0 0 0;
      font-size: 9.5px;
      opacity: 0.9;
      color: #e2e8f0;
    }
    .qualification-status-pill {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      background: ${isPassed ? '#059669' : '#475569'};
      color: #ffffff;
      border: 1.5px solid ${isPassed ? '#34d399' : '#94a3b8'};
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      white-space: nowrap;
    }

    /* Candidate Registry Table */
    .dossier-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 12px;
      background: #ffffff;
    }
    .dossier-cell {
      padding: 5px 12px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11px;
    }
    .dossier-cell:nth-child(odd) {
      border-right: 1px solid #e2e8f0;
    }
    .dossier-cell:nth-last-child(-n+2) {
      border-bottom: none;
    }
    .dossier-lbl {
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 1px;
    }
    .dossier-val {
      font-weight: 700;
      color: #002147;
    }
    .dossier-val.mono {
      font-family: 'Courier New', monospace;
      letter-spacing: 0.5px;
    }

    /* Sectional Marks Breakdown Table */
    .marks-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      font-size: 11px;
    }
    .marks-table th {
      background: #002147;
      color: #ffffff;
      padding: 6px 10px;
      text-align: left;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .marks-table td {
      padding: 6px 10px;
      border-bottom: 1px solid #e2e8f0;
      color: #1e293b;
    }
    .marks-table tr:last-child td {
      border-bottom: none;
    }
    .marks-table .total-row {
      background: ${isPassed ? '#f0fdf4' : '#f8fafc'};
      font-weight: 800;
      color: #002147;
      border-top: 2px solid #cbd5e1;
    }
    .marks-table .col-right {
      text-align: right;
    }
    .marks-table .col-center {
      text-align: center;
    }

    /* Score Callout & Metrics Overview Box */
    .metrics-cockpit {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 14px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 14px;
      background: #f8fafc;
      align-items: center;
    }
    .score-badge-official {
      text-align: center;
      padding: 8px 6px;
      background: #ffffff;
      border: 2px solid ${isPassed ? '#059669' : '#94a3b8'};
      border-radius: 6px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
    }
    .score-badge-official .num {
      font-size: 34px;
      font-weight: 900;
      color: ${isPassed ? '#059669' : '#002147'};
      line-height: 1;
      font-family: -apple-system, sans-serif;
    }
    .score-badge-official .denom {
      font-size: 9px;
      font-weight: 800;
      color: #64748b;
      margin-top: 2px;
      letter-spacing: 0.5px;
    }
    .score-badge-official .pct {
      font-size: 10px;
      font-weight: 900;
      color: ${isPassed ? '#047857' : '#b45309'};
      margin-top: 2px;
    }
    .metrics-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px 14px;
      font-size: 10.5px;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dashed #e2e8f0;
      padding-bottom: 2px;
    }
    .metric-lbl {
      color: #64748b;
      font-weight: 600;
    }
    .metric-val {
      font-weight: 800;
      color: #002147;
    }

    /* Signatory & Institutional Seal Footer */
    .official-footer {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      border-top: 1.5px solid #002147;
      padding-top: 10px;
      margin-top: 10px;
      gap: 16px;
    }
    .sign-col {
      text-align: center;
      width: 170px;
    }
    .sign-graphic {
      height: 30px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      margin-bottom: 2px;
    }
    .sign-line {
      border-bottom: 1px dashed #94a3b8;
      width: 100%;
      margin-bottom: 3px;
    }
    .sign-name {
      font-weight: 800;
      color: #002147;
      font-size: 10px;
    }
    .sign-dept {
      font-size: 8.5px;
      color: #64748b;
      margin-top: 1px;
    }
    .center-emboss-seal {
      width: 60px;
      height: 60px;
      flex-shrink: 0;
      opacity: 0.92;
    }

    /* Legal Security Fine-print */
    .legal-notice {
      margin-top: 8px;
      padding-top: 6px;
      border-top: 1px solid #e2e8f0;
      font-size: 8px;
      color: #64748b;
      line-height: 1.35;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    @media print {
      html, body {
        padding: 0 !important;
        margin: 0 !important;
        background: #ffffff !important;
        height: auto !important;
        overflow: hidden !important;
      }
      .no-print-toolbar {
        display: none !important;
      }
      .scorecard-frame {
        box-shadow: none !important;
        border-color: #002147 !important;
        margin: 0 auto !important;
        max-width: 100% !important;
        padding: 16px 22px !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        break-after: avoid !important;
      }
    }
  </style>
</head>
<body>

  <!-- In-Browser Action Toolbar (Hidden during print) -->
  <div class="no-print-toolbar">
    <div style="font-size: 12px; font-weight: 700; color: #002147; display: flex; align-items: center; gap: 8px;">
      <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #059669;"></span>
      AIMA-ICRC National Assessment Official Scorecard • Verified Record
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <button class="btn-action" onclick="window.print()">
        🖨️ Print / Save as PDF
      </button>
      <button class="btn-action" style="background: #475569;" onclick="window.close()">
        ✕ Close Window
      </button>
    </div>
  </div>

  <!-- Scorecard Main Frame -->
  <div class="scorecard-frame">
    <!-- Corner Decorative Accents -->
    <div class="corner-accent corner-tl"></div>
    <div class="corner-accent corner-tr"></div>
    <div class="corner-accent corner-bl"></div>
    <div class="corner-accent corner-br"></div>

    <!-- Security Watermark Layer -->
    <div class="watermark-layer">
      <svg class="watermark-emblem" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="100" cy="100" r="92" stroke="#002147" stroke-width="4" stroke-dasharray="6 4"/>
        <circle cx="100" cy="100" r="76" stroke="#002147" stroke-width="2"/>
        <path d="M100 35 L108 55 L130 55 L112 68 L119 88 L100 75 L81 88 L88 68 L70 55 L92 55 Z" fill="#002147"/>
        <text x="100" y="125" font-family="'Times New Roman', serif" font-size="28" font-weight="900" fill="#002147" text-anchor="middle">AIMA</text>
        <text x="100" y="145" font-family="sans-serif" font-size="10" font-weight="800" fill="#002147" text-anchor="middle" letter-spacing="2">ESTD. 1957</text>
      </svg>
      <div class="watermark-text">
        ALL INDIA MANAGEMENT ASSOCIATION<br>
        INDIA CASE LEAGUE 2026<br>
        OFFICIAL VERIFIED TRANSCRIPT
      </div>
    </div>

    <div class="doc-content">
      <!-- 1. APEX HEADER -->
      <div class="official-header">
        <div class="header-crest-block">
          <!-- AIMA Vector Seal Emblem -->
          <svg class="aima-crest-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="48" fill="#002147" stroke="#c59b27" stroke-width="3"/>
            <circle cx="50" cy="50" r="42" stroke="#c59b27" stroke-width="1" stroke-dasharray="3 2"/>
            <path d="M50 18 L53 26 L62 26 L55 31 L58 39 L50 34 L42 39 L45 31 L38 26 L47 26 Z" fill="#c59b27"/>
            <text x="50" y="58" font-family="'Times New Roman', Georgia, serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="1.5">AIMA</text>
            <text x="50" y="70" font-family="sans-serif" font-size="7.5" font-weight="800" fill="#c59b27" text-anchor="middle" letter-spacing="1">ESTD. 1957</text>
            <path d="M26 62 Q50 82 74 62" stroke="#c59b27" stroke-width="2" fill="none"/>
          </svg>

          <div class="header-titles">
            <h1>All India Management Association</h1>
            <div class="sub-apex">Apex Body of Management in India • Established 1957 under the Patronage of Govt. of India</div>
            <div class="icrc-title">India Case Research Centre (ICRC)</div>
            <div class="comp-title">India Case League 2026 • National Inter-College Case Competition</div>
          </div>
        </div>

        <!-- Security Block with QR representation -->
        <div class="security-stamp-block">
          <div class="qr-badge-container">
            <svg class="verif-qr" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="44" height="44" rx="4" fill="#ffffff"/>
              <!-- Authentic QR Finder Patterns -->
              <rect x="3" y="3" width="13" height="13" fill="#002147" rx="2"/>
              <rect x="5" y="5" width="9" height="9" fill="#ffffff"/>
              <rect x="7" y="7" width="5" height="5" fill="#002147"/>
              <rect x="28" y="3" width="13" height="13" fill="#002147" rx="2"/>
              <rect x="30" y="5" width="9" height="9" fill="#ffffff"/>
              <rect x="32" y="7" width="5" height="5" fill="#002147"/>
              <rect x="3" y="28" width="13" height="13" fill="#002147" rx="2"/>
              <rect x="5" y="30" width="9" height="9" fill="#ffffff"/>
              <rect x="7" y="32" width="5" height="5" fill="#002147"/>
              <!-- Data Dots -->
              <rect x="19" y="4" width="3" height="3" fill="#002147"/>
              <rect x="23" y="7" width="3" height="3" fill="#002147"/>
              <rect x="19" y="11" width="3" height="3" fill="#002147"/>
              <rect x="19" y="19" width="6" height="6" fill="#c59b27"/>
              <rect x="28" y="19" width="3" height="3" fill="#002147"/>
              <rect x="34" y="23" width="3" height="3" fill="#002147"/>
              <rect x="19" y="30" width="4" height="4" fill="#002147"/>
              <rect x="26" y="28" width="3" height="5" fill="#002147"/>
              <rect x="32" y="31" width="6" height="3" fill="#002147"/>
              <rect x="28" y="37" width="4" height="4" fill="#002147"/>
            </svg>
            <div class="verif-meta">
              <strong>✓ Authenticated</strong>
              <div class="code">${verificationRef}</div>
              <div style="font-size: 8px; color: #64748b; margin-top: 2px;">ISO 9001:2015 AUDITED</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 2. DOCUMENT BANNER -->
      <div class="title-banner">
        <div class="title-banner-text">
          <h2>Official Statement of Marks & Stage 1 Qualification Transcript</h2>
          <p>National Screening Examination Module: ${quizTitle} (Code: ${quizCode})</p>
        </div>
        <div class="qualification-status-pill">
          ${isPassed ? '★ PASSED (QUALIFIED FOR STAGE 2)' : 'FAILED'}
        </div>
      </div>

      <!-- 3. CANDIDATE EXAMINATION DOSSIER -->
      <div class="dossier-grid">
        <div class="dossier-cell">
          <div class="dossier-lbl">Candidate Full Name</div>
          <div class="dossier-val" style="font-size: 13px;">${candidateName}</div>
        </div>
        <div class="dossier-cell">
          <div class="dossier-lbl">Official Roll / Registration Number</div>
          <div class="dossier-val mono" style="font-size: 13px; color: #b45309;">${regNum}</div>
        </div>
        <div class="dossier-cell">
          <div class="dossier-lbl">Affiliated Institution / B-School</div>
          <div class="dossier-val">${institute}</div>
        </div>
        <div class="dossier-cell">
          <div class="dossier-lbl">Registered Entry Format</div>
          <div class="dossier-val">${teamName}</div>
        </div>
        <div class="dossier-cell">
          <div class="dossier-lbl">Registered Candidate Email</div>
          <div class="dossier-val mono">${email}</div>
        </div>
        <div class="dossier-cell">
          <div class="dossier-lbl">Examination Timestamp (IST)</div>
          <div class="dossier-val">${submittedDate} (IST)</div>
        </div>
      </div>

      <!-- 4. OFFICIAL SECTIONAL MARKS TRANSCRIPT TABLE -->
      <table class="marks-table">
        <thead>
          <tr>
            <th>Assessment Component / Section</th>
            <th class="col-center">Questions</th>
            <th class="col-center">Max Marks</th>
            <th class="col-center">Passing Standard</th>
            <th class="col-right">Marks Obtained</th>
            <th class="col-right">Section Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>Section I: Core Management Concepts & Strategy</strong><br>
              <span style="font-size: 10px; color: #64748b;">Business Awareness, Marketing, Finance, AI & Strategy (Q1–Q25)</span>
            </td>
            <td class="col-center">25</td>
            <td class="col-center">100</td>
            <td class="col-center">${cutoff}% (${cutoff} pts)</td>
            <td class="col-right"><strong>${score}.00</strong></td>
            <td class="col-right" style="color: ${score >= cutoff ? '#059669' : '#dc2626'}; font-weight: 700;">
              ${score >= cutoff ? '✓ Passed' : 'Failed'}
            </td>
          </tr>
          <tr>
            <td>
              <strong>Section II: Analytical Reserve & Tie-Breaker Module</strong><br>
              <span style="font-size: 10px; color: #64748b;">Data Interpretation, Logical Reasoning & Caselets (Q26–Q30)</span>
            </td>
            <td class="col-center">5</td>
            <td class="col-center">20</td>
            <td class="col-center">Rank Merit</td>
            <td class="col-right"><strong>${tieScore}.00</strong></td>
            <td class="col-right" style="color: #002147; font-weight: 700;">
              ✓ Priority Logged
            </td>
          </tr>
          <tr class="total-row">
            <td>
              <strong>COMPOSITE STAGE 1 AGGREGATE EVALUATION</strong>
            </td>
            <td class="col-center"><strong>${totalQ}</strong></td>
            <td class="col-center"><strong>100</strong></td>
            <td class="col-center"><strong>${cutoff}%</strong></td>
            <td class="col-right" style="font-size: 13px; color: ${isPassed ? '#059669' : '#002147'};">
              <strong>${score}.00 / 100</strong>
            </td>
            <td class="col-right" style="color: ${isPassed ? '#059669' : '#b45309'}; font-weight: 900;">
              ${isPassed ? '★ PASSED' : 'FAILED'}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 5. SCORE COCKPIT & PERFORMANCE AUDIT -->
      <div class="metrics-cockpit">
        <div class="score-badge-official">
          <div class="num">${score}</div>
          <div class="denom">OUT OF 100 PTS</div>
          <div class="pct">${score}% Aggregate Score</div>
        </div>
        <div class="metrics-list">
          <div class="metric-row">
            <span class="metric-lbl">Total Questions Attempted:</span>
            <span class="metric-val">${correctCount} of ${totalQ} Correct (${Math.round((correctCount / totalQ) * 100)}%)</span>
          </div>
          <div class="metric-row">
            <span class="metric-lbl">Core Scored Module:</span>
            <span class="metric-val">${coreCorrect} of 25 Correct (${coreScore}/100 Pts)</span>
          </div>
          <div class="metric-row">
            <span class="metric-lbl">Assessment Duration Taken:</span>
            <span class="metric-val">${timeTaken}</span>
          </div>
          <div class="metric-row">
            <span class="metric-lbl">Prescribed Cutoff Standard:</span>
            <span class="metric-val">${cutoff}% (${cutoff} pts minimum)</span>
          </div>
          <div class="metric-row">
            <span class="metric-lbl">Proctoring & System Audit:</span>
            <span class="metric-val" style="color: ${tabViolations === 0 ? '#059669' : '#dc2626'};">
              ${tabViolations === 0 ? '✓ Clean Session (0 Tab Switches)' : '⚠️ Flagged (' + tabViolations + ' Tab Violations)'}
            </span>
          </div>
          <div class="metric-row">
            <span class="metric-lbl">Security Digital Digest:</span>
            <span class="metric-val mono" style="font-size: 9.5px;">${securityHash.slice(0, 16)}...</span>
          </div>
        </div>
      </div>

      <!-- 6. INSTITUTIONAL SIGNATORIES & SEAL -->
      <div class="official-footer">
        <div class="sign-col">
          <div class="sign-graphic">
            <svg width="140" height="34" viewBox="0 0 140 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 22 C30 8, 45 30, 65 14 C75 6, 85 28, 105 16 C115 10, 125 24, 135 12" stroke="#1d4ed8" stroke-width="2" stroke-linecap="round" fill="none"/>
              <path d="M40 25 C55 20, 75 22, 90 18" stroke="#1d4ed8" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
          <div class="sign-line"></div>
          <div class="sign-name">Controller of Examinations</div>
          <div class="sign-dept">National Assessment Directorate, AIMA</div>
        </div>

        <!-- Official Central Embossed AIMA Seal -->
        <svg class="center-emboss-seal" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#ffffff" stroke="#c59b27" stroke-width="2.5"/>
          <circle cx="50" cy="50" r="44" stroke="#002147" stroke-width="1.5" stroke-dasharray="2 2"/>
          <circle cx="50" cy="50" r="36" fill="#002147"/>
          <text x="50" y="47" font-family="'Times New Roman', serif" font-size="13" font-weight="900" fill="#c59b27" text-anchor="middle">AIMA</text>
          <text x="50" y="58" font-family="sans-serif" font-size="6" font-weight="800" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">ICRC SEAL</text>
          <text x="50" y="66" font-family="sans-serif" font-size="5" font-weight="700" fill="#c59b27" text-anchor="middle">NEW DELHI</text>
        </svg>

        <div class="sign-col">
          <div class="sign-graphic">
            <svg width="140" height="34" viewBox="0 0 140 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 16 C25 28, 40 8, 60 24 C80 34, 95 10, 115 20 C125 26, 130 14, 138 18" stroke="#1e40af" stroke-width="2" stroke-linecap="round" fill="none"/>
              <path d="M50 14 C65 10, 85 12, 105 8" stroke="#1e40af" stroke-width="1.5" stroke-linecap="round" fill="none"/>
            </svg>
          </div>
          <div class="sign-line"></div>
          <div class="sign-name">Dean & Director</div>
          <div class="sign-dept">India Case Research Centre (AIMA-ICRC)</div>
        </div>
      </div>

      <!-- 8. STATUTORY VERIFICATION & LEGAL FOOTNOTE -->
      <div class="legal-notice">
        <div>
          <strong>All India Management Association (AIMA-ICRC)</strong> • Management House, 14, Institutional Area, Lodhi Road, New Delhi – 110003<br>
          Verification Portal: <span style="color: #002147; font-weight: 700;">https://aima.in/caseleague/verify</span> • Ref: <code>${verificationRef}</code>
        </div>
        <div style="text-align: right; font-family: 'Courier New', monospace; font-size: 8px;">
          DOCUMENT INTEGRITY: SECURE DIGITAL ATTESTATION • AIMA-ICL26
        </div>
      </div>
    </div>
  </div>

  <script>
    window.addEventListener('load', function() {
      setTimeout(function() {
        window.print();
      }, 400);
    });
  </script>
</body>
</html>`;
  };

  const handleDownloadScorecard = () => {
    if (!myAttempt) return;
    const printHtml = generateOfficialScorecardHtml();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(printHtml);
      printWindow.document.close();
    }
  };

  const handleShareAttempt = async () => {
    if (!myAttempt) return;

    const candidateName = currentUser.name || liveRegistration?.fullName || 'Candidate';
    const regNum = currentUser.registrationNumber || liveRegistration?.registrationNumber || myAttempt.registrationNumber || 'AIMA-CL26-00000';
    const institute = currentUser.instituteName || liveRegistration?.instituteName || 'Management Institute';
    const teamName = currentTeam?.name || liveRegistration?.teamName || 'Individual Entry';
    const isPassed = isPassedCutoff;
    const verificationRef = `AIMA-CL26-R1-${(myAttempt.attemptId || 'OFFICIAL').slice(0, 8).toUpperCase()}`;

    // 1. Generate the exact same official report card HTML document
    const scorecardHtml = generateOfficialScorecardHtml();
    const scorecardBlob = new Blob([scorecardHtml], { type: 'text/html' });
    const scorecardFilename = `AIMA_Official_Scorecard_${regNum}.html`;
    const scorecardFile = new File([scorecardBlob], scorecardFilename, { type: 'text/html' });

    // 2. Official Attestation Text (Clean & authoritative, completely omitting localhost:3000 URL)
    const officialShareSummary = `🏆 ALL INDIA MANAGEMENT ASSOCIATION (AIMA-ICRC)
OFFICIAL STAGE 1 ASSESSMENT SCORECARD — INDIA CASE LEAGUE 2026

Candidate: ${candidateName}
Registration No: ${regNum}
Institution: ${institute}
Registered Entry: ${teamName}
Score: ${myAttempt.score}/100 Marks (${myAttempt.score}%)
Passing Cutoff Standard: ${activeCutoffScore}%
Result: ${isPassed ? '★ QUALIFIED FOR STAGE 2' : 'Official Attempt Recorded'}
Verification ID: ${verificationRef}

Issued under the official seal of All India Management Association (AIMA-ICRC), Lodhi Road, New Delhi.
#AIMA #IndiaCaseLeague2026 #ICRC #CaseCompetition`;

    // 3. First priority: Native Web Share API with FILE (shares the actual official scorecard document)
    if (navigator.canShare && navigator.canShare({ files: [scorecardFile] })) {
      try {
        await navigator.share({
          files: [scorecardFile],
          title: `AIMA Official Scorecard - ${candidateName}`,
          text: officialShareSummary,
          // CRITICAL: NEVER pass 'url' so localhost:3000 is NEVER displayed in share modal!
        });
        setShareToast('✓ Official Scorecard document shared successfully!');
        setTimeout(() => setShareToast(null), 3000);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return; // User closed the share sheet
        console.warn('Native file share failed or canceled, proceeding with direct document download:', err);
      }
    }

    // 4. Fallback: Automatically download the standalone official scorecard document to device
    try {
      const downloadUrl = URL.createObjectURL(scorecardBlob);
      const downloadLink = document.createElement('a');
      downloadLink.href = downloadUrl;
      downloadLink.download = scorecardFilename;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      setTimeout(() => URL.revokeObjectURL(downloadUrl), 4000);
    } catch (e) {
      console.warn('Direct file download error:', e);
    }

    // 5. If Web Share API supports text-only sharing (WITHOUT any URL parameter)
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AIMA Official Scorecard - ${candidateName}`,
          text: officialShareSummary,
          // NO url field!
        });
        setShareToast('✓ Scorecard downloaded & shared!');
        setTimeout(() => setShareToast(null), 3500);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    // 6. Final clipboard fallback for web environments
    try {
      await navigator.clipboard.writeText(officialShareSummary);
      setShareToast('✓ Official Scorecard downloaded & verified summary copied to clipboard!');
      setTimeout(() => setShareToast(null), 4000);
    } catch {
      setShareToast('✓ Official Scorecard file downloaded!');
      setTimeout(() => setShareToast(null), 3000);
    }
  };

  const handleAddMemberSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addMemberName.trim() || !addMemberEmail.trim()) {
      setAddMemberFeedback({ success: false, message: 'Please provide both full name and email address.' });
      return;
    }
    setIsAddingMember(true);
    setAddMemberFeedback(null);
    try {
      const res = await addTeamMember({
        name: addMemberName.trim(),
        email: addMemberEmail.trim(),
        mobile: addMemberMobile.trim() || undefined,
        enrolmentNumber: addMemberEnrolment.trim() || undefined,
      });
      setAddMemberFeedback(res);
      if (res.success) {
        setAddMemberName('');
        setAddMemberEmail('');
        setAddMemberMobile('');
        setAddMemberEnrolment('');
      }
    } catch (err: any) {
      setAddMemberFeedback({ success: false, message: err?.message || 'Failed to add member to team.' });
    } finally {
      setIsAddingMember(false);
    }
  };

  const isResultsPublishedR1 = isResultsPublished;
  const hasPassedR1 = isPassedCutoff;

  const handleConfirmTrack = () => {
    if (!candidateTrackId) return;
    const res = selectTeamTrack(candidateTrackId);
    if (res.success) {
      setTrackLockSuccessMsg(res.message);
      setIsChangingTrack(false);
      setTimeout(() => setTrackLockSuccessMsg(null), 6000);
    }
  };

  const handleDownloadInstructions = () => {
    const filename = 'AIMA_ICRC_South_Zone_Student_Instructions.pdf';
    const link = document.createElement('a');
    link.href = `/${encodeURIComponent(filename)}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareToast('✓ Downloaded: AIMA ICRC South Zone Student Instructions (PDF)');
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleDownloadCaseStudy = (track: CaseTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!track.caseDocFileName) return;
    const fileUrl = track.caseDocUrl || `/${encodeURIComponent(track.caseDocFileName)}`;
    // Open PDF in a new tab for instant reading (built-in browser PDF viewer enables reading & direct download)
    window.open(fileUrl, '_blank');
    setShareToast(`✓ Opening Case Study (PDF): ${track.name}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleDownloadDirectCaseStudy = (track: CaseTrack, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!track.caseDocFileName) return;
    const filename = track.caseDocFileName;
    const fileUrl = track.caseDocUrl || `/${encodeURIComponent(filename)}`;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShareToast(`✓ Downloaded Case Study (PDF): ${track.masterCaseTitle || track.name}`);
    setTimeout(() => setShareToast(null), 3500);
  };

  const handleOpenInstructions = handleDownloadInstructions;

  const handleDownloadCaseBrief = handleDownloadInstructions;

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

            {/* Candidate Logout Button */}
            <button
              onClick={logoutParticipant}
              className="px-3.5 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Sign out of student workspace"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center text-[10px] sm:text-xs font-bold">
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
                    ? `Score: ${myAttempt.score}% (${isPassedCutoff ? 'Passed' : 'Failed'})`
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
                      : isTeam
                        ? `Locked • Team Failed (${teamAverageScore}%)`
                        : `Locked • Failed (${myAttempt.score}%)`}
                </span>
              </div>
            )}

            {/* Round 3: Grand Finale (Locked until Stage 2 Jury Evaluation) */}
            <div className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 ${isQualifiedForRound3
              ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800/70 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-80'
              }`}>
              <span className="flex items-center gap-1 font-semibold">
                {!isQualifiedForRound3 && <Lock className="w-3.5 h-3.5 text-slate-400" />}
                <span>Round 3: Grand Finale</span>
              </span>
              <span className="text-[10px] font-medium opacity-80 truncate max-w-[140px]">
                {isQualifiedForRound3
                  ? `AIMA HQ New Delhi (${formattedR4Date || '5 Nov'})`
                  : 'Locked • Stage 2 Jury Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Certificate Announcement Banner */}
      {myCert && (
        <div className="rounded-3xl p-5 sm:p-6 bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-emerald-500/15 border-2 border-amber-500/40 dark:border-amber-400/30 shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                  {myCert.achievement}
                </span>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  ID: {myCert.certificateNumber}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1">
                Official Credential Issued: {myCert.achievement}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Conferred to <strong>{myCert.recipientName || myCert.teamName}</strong> ({myCert.institute}) for India Case League 2026.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveCertificateModal(myCert)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4" />
              <span>View &amp; Print Official Certificate</span>
            </button>
          </div>
        </div>
      )}

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
              <div className="flex items-center gap-2">
                {currentTeam && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${(currentTeam.members?.length || 0) >= (currentTeam.maxMembers || 4)
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                    : currentTeam.isLocked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                    }`}>
                    {(currentTeam.members?.length || 0) >= (currentTeam.maxMembers || 4)
                      ? `Roster Complete (${currentTeam.members?.length || 0}/${currentTeam.maxMembers || 4})`
                      : currentTeam.isLocked
                        ? 'Roster Locked'
                        : `Open for Member (${currentTeam.members?.length || 0}/${currentTeam.maxMembers || 4})`}
                  </span>
                )}
                {isTeamLeader && currentTeam && (currentTeam.members?.length || 0) < (currentTeam.maxMembers || 4) && (
                  <button
                    type="button"
                    onClick={() => {
                      setAddMemberFeedback(null);
                      setShowAddMemberModal(true);
                    }}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Add teammate to roster"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Member</span>
                  </button>
                )}
              </div>
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
                        ? `Nominated Members (${currentTeam.members?.length || 0} Participants)`
                        : `Registered Members (${currentTeam.members?.length || 0}/${currentTeam.maxMembers || 4})`}
                    </span>
                    {currentTeam.feeTier && (
                      <span className="text-[9px] font-normal text-slate-400 truncate max-w-[130px]" title={currentTeam.feeTier}>
                        {currentTeam.feeTier}
                      </span>
                    )}
                  </div>
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(currentTeam.members || []).map((member: any, idx: number) => {
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

                {/* Team Leader Add Member Button when roster < 4 */}
                {isTeamLeader && currentTeam && (currentTeam.members?.length || 0) < (currentTeam.maxMembers || 4) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setAddMemberFeedback(null);
                        setShowAddMemberModal(true);
                      }}
                      className="w-full py-2.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Member to Team ({currentTeam.members?.length || 0}/4 Members)</span>
                    </button>
                  </div>
                )}

                <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                  {isInstituteReg
                    ? `Institutional Cohort: ${currentTeam?.members?.length || candidateCount || 1} student nominees registered by ${currentTeam?.instituteName || 'Institution'}. Fees settled at institutional level.`
                    : 'Rules: Teams must consist of 3-4 members. Roster locks automatically upon Round 2 Case Deck deadline.'}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-4">
                <Users className="w-10 h-10 text-slate-400 mx-auto" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Team Formed Yet</h4>
                  <p className="text-xs text-slate-500 mt-1">Create a new team as Team Leader to onboard your teammates.</p>
                </div>
                <div>
                  <button
                    onClick={() => setShowCreateTeamModal(true)}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Create New Team (As Team Leader)
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
                  <span>Registration Ref: <strong className="font-mono text-amber-600 select-all">{currentUser.registrationNumber || liveRegistration?.registrationNumber || 'AIMA-CL26'}</strong></span>
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

              {/* Add 4th Member Action if Roster < 4 */}
              {!isSoloCandidate && currentTeam && (currentTeam.members?.length || 0) < (currentTeam.maxMembers || 4) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span>Roster Open ({currentTeam.members?.length || 0}/4 Members)</span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-400/90 mt-0.5 leading-snug">
                      Competition rules permit up to 4 members per team. You can add another teammate now.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setAddMemberFeedback(null);
                      setShowAddMemberModal(true);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add {(currentTeam.members?.length || 0) === 3 ? '4th' : 'Additional'} Member</span>
                  </button>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed border-t border-slate-100 dark:border-slate-800">
                {isInstituteReg
                  ? `Institutional Cohort: ${currentTeam?.members?.length || candidateCount || 1} student nominees registered by ${currentTeam?.instituteName || currentUser.instituteName || 'Institution'}. Fees settled at institutional level.`
                  : isSoloCandidate
                    ? 'Individual Candidate entry for AIMA India Case League 2026. Round 1 Quiz access is active.'
                    : 'Rules: Teams must consist of 3-4 members. Roster locks automatically upon Round 2 Case Deck deadline.'}
              </div>
            </div>
          </div>
        )}

        {/* Right 2 Columns: Competition Action Stage Cards */}
        <div className="lg:col-span-2 space-y-4">

          {/* Round 1 Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  ROUND 1
                </span>
                {isResultsPublished && (myAttempt || teamAverageScore !== null) && (
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${isPassedCutoff
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'
                    }`}>
                    {isPassedCutoff
                      ? `Quiz Score: ${myAttempt?.score ?? teamAverageScore}% (Passed)`
                      : `Quiz Score: ${myAttempt?.score ?? teamAverageScore}% (Failed)`}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {stage1Program?.title || 'Case Competition – Stage 1 Business Quiz'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myAttempt
                  ? (!isResultsPublished
                    ? `Completed on ${formatISTDateTime(myAttempt.submittedAt)} • Results Under Official Review`
                    : `Completed on ${formatISTDateTime(myAttempt.submittedAt)}`
                  )
                  : !quizAvailability.isOpen
                    ? (quizAvailability.reason || 'Assessment window is currently restricted.')
                    : `Live Assessment Window (${stage1Program?.totalQuestions || 30} questions total). No negative marking applies.`}
              </p>

              {/* Question Distribution Stat Pill */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-800 dark:text-slate-100">
                  <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Assessment Questions
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-1.5 py-0.2 rounded font-mono">
                    30 MCQs • 100 Marks
                  </span>
                </div>

                {isTeam && teamAttemptCount > 0 && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs shadow-2xs">
                    <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Team Cumulative Avg:
                    </span>
                    <span className="text-[10px] font-mono font-black text-blue-900 dark:text-blue-100">
                      {teamAverageScore}/100 ({teamAttemptCount}/{currentTeam?.members?.length || 2} Attempted)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {myAttempt ? (
              !isResultsPublished ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedQuizProgramId(stage1Program?.id || 'qp_case_comp_stage1_2026');
                    setActiveSubView('quiz');
                  }}
                  className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1.5 shadow-xs cursor-pointer transition-all hover:scale-[1.02]"
                  title="Click to view Quiz Submission Recorded summary and attempt metrics"
                >
                  <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Attempt Recorded • Under Review</span>
                  <ChevronRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </button>
              ) : (
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowStudentReviewModal(true)}
                    className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shadow-emerald-600/20"
                    title="View complete question-by-question attempt results and answers"
                  >
                    <Eye className="w-3.5 h-3.5 text-white" />
                    <span>View Result</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadScorecard}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Download official AIMA verified attempt scorecard (Print / Save as PDF)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Download</span>
                  </button>

                  {/* <button
                    type="button"
                    onClick={handleShareAttempt}
                    className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                    title="Share your quiz attempt results"
                  >
                    <Share2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span>Share</span>
                  </button> */}
                </div>
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

          {/* Round 2 Card: Track Selection & Offline Jury Presentation Workflow */}
          {trackLockSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{trackLockSuccessMsg}</span>
              </div>
              <button
                onClick={() => setTrackLockSuccessMsg(null)}
                className="text-xs text-emerald-600 hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {isQualifiedForRound2 ? (
            !activeConfirmedTrackId || isChangingTrack ? (
              /* State A: Must Step to Proceed - Select 1 of 5 Tracks */
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in transition-all">
                {/* Header Banner */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                      ROUND 2 OFFLINE PRESENTATION
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                        Choose Case Track for Round 2
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={handleDownloadInstructions}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                        title="Download AIMA ICRC South Zone Student Instructions (PDF)"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Instructions</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 Tracks Interactive List / Grid */}
                <div className="space-y-3">

                  <div className="flex items-center justify-between flex-wrap gap-2 pt-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                        Select 1 of 5 Functional Tracks (Click to select)
                      </span>
                    </div>

                    {/* View Mode Switcher */}
                    <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        type="button"
                        onClick={() => setTrackViewMode('list')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${trackViewMode === 'list'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        title="Compact List View (Recommended)"
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Compact List</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTrackViewMode('grid')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${trackViewMode === 'grid'
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        title="Expanded Grid Cards"
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Grid Cards</span>
                      </button>
                    </div>
                  </div>

                  {trackViewMode === 'list' ? (
                    /* Compact List Mode - Full-width clean list without truncation */
                    <div className="flex flex-col gap-2.5 pt-1">
                      {OFFICIAL_CASE_TRACKS.map(track => {
                        const isSelected = candidateTrackId === track.id;
                        const tooltipMsg = isSelected
                          ? `✓ ${track.badge} (${track.name}) is selected! Next step: click "Confirm & Lock Selected Track" below to finalize.`
                          : `👉 Step 1: Click to choose ${track.badge} (${track.name}) → Then click "Confirm & Lock Selected Track" below to lock your case.`;

                        return (
                          <div
                            key={track.id}
                            onClick={() => setCandidateTrackId(track.id)}
                            title={tooltipMsg}
                            className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-left relative group ${isSelected
                              ? 'border-blue-600 bg-blue-50/90 dark:bg-blue-950/50 shadow-sm ring-1 ring-blue-500/30'
                              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-slate-50/90 dark:hover:bg-slate-800/50 hover:shadow-xs'
                              }`}
                          >
                            {/* Hover Micro Tooltip Pill */}
                            <div className="absolute -top-3 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-20">
                              <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md shadow-md border flex items-center gap-1 ${isSelected
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700 dark:border-slate-300'
                                }`}>
                                {isSelected ? '✓ Selected • Click Lock Below' : 'Click to Pick → Lock Below'}
                              </span>
                            </div>

                            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                              {/* Selection Indicator */}
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-colors ${isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                                  }`}
                              >
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9.5px] font-black px-2 py-0.5 rounded-md shrink-0 ${track.accentColor.badgeBg} ${track.accentColor.badgeText}`}>
                                    {track.badge}
                                  </span>
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                    {track.name}
                                  </h4>
                                </div>

                                <p
                                  className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-relaxed"
                                  title={track.masterCaseTitle ? `Case Details: ${track.masterCaseTitle}` : track.tagline}
                                >
                                  {track.masterCaseTitle ? (
                                    <span>
                                      <strong className="text-slate-900 dark:text-slate-100 font-bold">Case:</strong>{' '}
                                      {track.masterCaseTitle}
                                    </span>
                                  ) : (
                                    track.tagline
                                  )}
                                </p>
                              </div>
                            </div>

                            <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                              {track.caseDocFileName && (
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadCaseStudy(track, e)}
                                  title={`📥 Read / Download Case Study (PDF): "${track.masterCaseTitle || track.name}" before picking this track`}
                                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95"
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>Read Case (PDF)</span>
                                </button>
                              )}
                              <span
                                className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors ${isSelected
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40 group-hover:text-blue-700 dark:group-hover:text-blue-300'
                                  }`}
                              >
                                {isSelected ? '✓ Selected' : 'Select'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Slot 6: Action Confirmation Card directly following 5th Track */}
                      <div
                        className={`p-3.5 sm:p-4 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left ${candidateTrackId
                          ? 'border-blue-600 bg-gradient-to-r from-blue-50/90 via-indigo-50/80 to-blue-50/90 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-blue-950/50 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40'
                          }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${candidateTrackId
                              ? 'bg-blue-600 text-white shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              }`}
                          >
                            <Lock className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`text-[9.5px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${candidateTrackId
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                  }`}
                              >
                                {candidateTrackId ? 'Step 2: Ready to Lock' : 'Step 2: Finalize Track'}
                              </span>
                              <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                                {candidateTrackId ? 'Lock Your Selected Track' : 'Choose 1 Track to Finalize'}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {candidateTrackId
                                ? `Locking in "${OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.badge} - ${OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.name}" for jury evaluation.`
                                : 'Select any 1 of the 5 case study tracks above, then confirm to permanently lock your choice.'}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleConfirmTrack}
                          disabled={!candidateTrackId}
                          title={
                            candidateTrackId
                              ? `Click to permanently lock ${OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.badge} as your official track`
                              : 'Please select 1 of the 5 tracks above first'
                          }
                          className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0 ${candidateTrackId
                            ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/30 cursor-pointer ring-2 ring-blue-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-75'
                            }`}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm & Lock Selected Track</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Expanded Grid Cards Mode */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
                      {OFFICIAL_CASE_TRACKS.map(track => {
                        const isSelected = candidateTrackId === track.id;
                        const tooltipMsg = isSelected
                          ? `✓ ${track.badge} (${track.name}) is selected! Next step: click "Confirm & Lock Selected Track" below to finalize.`
                          : `👉 Step 1: Click to choose ${track.badge} (${track.name}) → Then click "Confirm & Lock Selected Track" below to lock your case.`;

                        return (
                          <div
                            key={track.id}
                            onClick={() => setCandidateTrackId(track.id)}
                            title={tooltipMsg}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative group ${isSelected
                              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-700'
                              }`}
                          >
                            {/* Hover Micro Tooltip Pill */}
                            <div className="absolute -top-3 right-4 pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-150 z-20">
                              <span className={`text-[9.5px] font-extrabold px-2 py-0.5 rounded-md shadow-md border flex items-center gap-1 ${isSelected
                                ? 'bg-blue-600 text-white border-blue-500'
                                : 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-700 dark:border-slate-300'
                                }`}>
                                {isSelected ? '✓ Selected • Click Lock Below' : 'Click to Pick → Lock Below'}
                              </span>
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${track.accentColor.badgeBg} ${track.accentColor.badgeText}`}>
                                  {track.badge}
                                </span>
                                <div
                                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600'
                                    }`}
                                >
                                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </div>
                              </div>

                              <div>
                                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                                  {track.name}
                                </h4>
                                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                                  {track.tagline}
                                </p>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                                {track.competenciesTested}
                              </p>

                              {track.masterCaseTitle && (
                                <div
                                  className="p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 text-[10px] text-blue-800 dark:text-blue-300 font-semibold"
                                  title={`Full Case Title: ${track.masterCaseTitle}`}
                                >
                                  📌 <strong>Case:</strong> {track.masterCaseTitle}
                                </div>
                              )}
                            </div>

                            <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                              {track.caseDocFileName ? (
                                <button
                                  type="button"
                                  onClick={(e) => handleDownloadCaseStudy(track, e)}
                                  title={`📥 Read / Download Case Study (PDF): "${track.masterCaseTitle || track.name}" before picking this track`}
                                  className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                                  <span>Read Case (PDF)</span>
                                </button>
                              ) : (
                                <span className="text-slate-400">
                                  3 Focus Questions (12 Slides)
                                </span>
                              )}
                              <span className={`font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                                {isSelected ? '✓ Selected' : 'Click to Pick'}
                              </span>
                            </div>
                          </div>
                        );
                      })}

                      {/* Slot 6: Action Confirmation Card right after 5th Track */}
                      <div
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between text-left relative ${candidateTrackId
                          ? 'border-blue-600 bg-gradient-to-br from-blue-50/90 to-indigo-50/70 dark:from-blue-950/50 dark:to-indigo-950/40 ring-2 ring-blue-500/30 shadow-md'
                          : 'border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
                          }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${candidateTrackId
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                }`}
                            >
                              {candidateTrackId ? 'Step 2: Ready to Lock' : 'Step 2: Finalize Track'}
                            </span>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center ${candidateTrackId
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                                }`}
                            >
                              {candidateTrackId ? (
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                              {candidateTrackId
                                ? `${OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.badge} Selected`
                                : 'Lock Your Case Track'}
                            </h4>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                              {candidateTrackId
                                ? OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.name
                                : 'Choose 1 of the 5 case tracks to submit for jury evaluation.'}
                            </p>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-snug">
                            {candidateTrackId
                              ? 'Your selection will be officially recorded in the league ledger for jury scorecard evaluation.'
                              : 'Review each case brief or download the case study before confirming.'}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                          {isChangingTrack && activeConfirmedTrackId ? (
                            <button
                              type="button"
                              onClick={() => setIsChangingTrack(false)}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">
                              {candidateTrackId ? 'Ready to submit' : '👈 Pick above'}
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={handleConfirmTrack}
                            disabled={!candidateTrackId}
                            title={
                              candidateTrackId
                                ? `Click to lock ${OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.badge}`
                                : 'Please select 1 track above first'
                            }
                            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${candidateTrackId
                              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-md shadow-blue-600/20 cursor-pointer ring-2 ring-blue-500/20'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-70'
                              }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm & Lock</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* State B: Track Confirmed - Display Confirmed State, Venue Details, Scorecard Workflow */
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border border-emerald-500/30 shadow-sm space-y-6 animate-in fade-in">
                {/* Header with Confirmed Track */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        ROUND 2 TRACK CONFIRMED
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                        {activeConfirmedTrack?.badge || 'TRACK CONFIRMED'}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        Offline Case Presentation at AIMA Venue
                      </span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                      {activeConfirmedTrack?.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {activeConfirmedTrack?.description}
                    </p>
                    {activeConfirmedTrack?.masterCaseTitle && (
                      <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 pt-1">
                        <FileText className="w-3.5 h-3.5 shrink-0" />
                        <span>Case Study: {activeConfirmedTrack.masterCaseTitle}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                      onClick={() => setIsChangingTrack(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Change Track
                    </button>

                    {activeConfirmedTrack?.caseDocFileName && (
                      <button
                        onClick={(e) => handleDownloadDirectCaseStudy(activeConfirmedTrack, e)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-600/25 transition-all flex items-center gap-1.5 cursor-pointer ring-2 ring-emerald-500/20"
                        title={`Download Case Study (PDF): ${activeConfirmedTrack.masterCaseTitle || activeConfirmedTrack.name}`}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Case Study (PDF)</span>
                      </button>
                    )}

                    <button
                      onClick={handleDownloadInstructions}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      title="Download AIMA ICRC South Zone Student Instructions (PDF)"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Instructions</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Guidelines Reference */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Official League Guidelines: <code className="font-mono text-slate-700 dark:text-slate-300">AIMA_ICRC_South_Zone_Student_Instructions.pdf</code></span>
                  </div>
                  {activeConfirmedTrack?.caseDocFileName && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Case Document: <code className="font-mono text-slate-700 dark:text-slate-300">{activeConfirmedTrack.caseDocFileName}</code></span>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            /* State C: Pending Qualification / Round 1 Results */
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 opacity-75">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                    ROUND 2 LOCKED
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    Offline Case Presentation
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  AIMA Hall Offline Case Defense
                </h3>
                <p className="text-xs text-slate-500">
                  {!myAttempt
                    ? `Requires completing Round 1 Quiz with a qualifying score (≥${activeCutoffScore}%).`
                    : !isResultsPublished
                      ? 'Track selection for Round 2 will automatically unlock once results are published.'
                      : `Official results published. Score (${myAttempt.score}%) does not meet the qualifying criteria.`}
                </p>
              </div>

              <div
                className="shrink-0 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs select-none cursor-default"
                title={
                  !myAttempt
                    ? 'Complete Round 1 Quiz First'
                    : !isResultsPublished
                      ? 'Round 1 results are awaiting official publication from the admin panel'
                      : 'Stage 1 Failed'
                }
              >
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {!myAttempt
                    ? 'Complete Round 1 Quiz First'
                    : !isResultsPublished
                      ? 'Results Under Official Review'
                      : 'Stage 1 Failed'}
                </span>
              </div>
            </div>
          )}

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

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Add Team Member
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Team: <strong className="text-amber-600">{currentTeam?.name}</strong> (Allowed 3-4 Members)
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddMemberModal(false);
                  setAddMemberFeedback(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addMemberFeedback?.success ? (
              <div className="space-y-4 py-2">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span>Teammate Successfully Added!</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {addMemberFeedback.message}
                  </p>
                </div>

                {addMemberFeedback.password && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Teammate Login Credentials
                    </div>
                    <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                      <div>
                        <span className="text-slate-400 text-[10px] block">Default Temporary Password:</span>
                        <code className="font-mono font-bold text-amber-600 dark:text-amber-400 text-sm">
                          {addMemberFeedback.password}
                        </code>
                      </div>
                      <button
                        onClick={() => {
                          if (addMemberFeedback.password) {
                            navigator.clipboard.writeText(addMemberFeedback.password);
                            setCopiedPass(true);
                            setTimeout(() => setCopiedPass(false), 2000);
                          }
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs rounded-lg font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>{copiedPass ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Share this credential with your new teammate so they can log in using their email and this password.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setAddMemberFeedback(null);
                  }}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleAddMemberSubmit} className="space-y-4">
                {addMemberFeedback && !addMemberFeedback.success && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{addMemberFeedback.message}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addMemberName}
                    onChange={e => setAddMemberName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={addMemberEmail}
                    onChange={e => setAddMemberEmail(e.target.value)}
                    placeholder="e.g. rahul.sharma@institution.edu.in"
                    className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">This email will be used for quiz login & official certificates.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile / WhatsApp
                    </label>
                    <input
                      type="tel"
                      value={addMemberMobile}
                      onChange={e => setAddMemberMobile(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll / Enrolment No
                    </label>
                    <input
                      type="text"
                      value={addMemberEnrolment}
                      onChange={e => setAddMemberEnrolment(e.target.value)}
                      placeholder="e.g. MBA2026-042"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddMemberModal(false)}
                    className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingMember}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {isAddingMember ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Registering Member...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Confirm & Add Teammate</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
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
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/35'
                          }`}
                      >
                        {isPassedCutoff ? (
                          'Passed'
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3 shrink-0" />
                            Failed
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

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadScorecard}
                    className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="Download Official AIMA Scorecard (Print / PDF)"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                    <span className="hidden sm:inline">Scorecard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowStudentReviewModal(false)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800 transition cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    title="Close review modal"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Row 2: Official Scoring Breakdown */}
              <div className="px-5 py-2 bg-slate-50/90 dark:bg-slate-950/70 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-2xs text-xs text-slate-800 dark:text-slate-100">
                    <Trophy className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Total Score</span>
                    <span className="font-mono font-black text-slate-900 dark:text-white text-sm">
                      {myAttempt.score}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">/100</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-500/15 border border-emerald-500/25 dark:text-emerald-300 dark:bg-emerald-500/20 dark:border-emerald-500/30 px-1.5 py-0.2 rounded ml-0.5">
                      {studentModalStats.correct}/{studentModalStats.total} Correct
                    </span>
                  </div>

                  {isTeam && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs shadow-2xs">
                      <Users className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">Team Cumulative Avg:</span>
                      <span className="font-mono font-black text-blue-900 dark:text-blue-100 text-sm">
                        {teamAverageScore}/100
                      </span>
                    </div>
                  )}
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

                          <span className="text-[11px] font-medium text-slate-400">
                            • +{q.marks || 4} Marks (No Negative Marking)
                          </span>
                        </div>

                        {/* Status Pill */}
                        <div>
                          {isCorrect && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 border border-emerald-500/25">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Correct (+{q.marks || 4})
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadScorecard}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-slate-200 dark:border-slate-700"
                  title="Download Official AIMA Scorecard (Print / PDF)"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  <span>Download Scorecard</span>
                </button>
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
        </div>
      )}

      {/* Share / Action Feedback Toast */}
      {shareToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xl border border-slate-700 dark:border-slate-200 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

    </div>
  );
};
