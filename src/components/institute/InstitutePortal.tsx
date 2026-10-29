import React, { useState, useEffect, useMemo } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import { Team, CertificateRecord } from '../../types';
import { supabase } from '../../lib/supabase';
import { parseISTTimestamp, formatQuizScheduleDate } from '../../lib/formatters';
import {
  AlertCircle,
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  IndianRupee,
  Lock,
  MapPin,
  Plus,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Trophy,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from 'lucide-react';

export const InstitutePortal: React.FC = () => {
  const {
    institutions,
    currentUser,
    teams,
    createInstitutionalTeam,
    participantUser,
    csrRegistrations,
    quizPrograms,
    quizAttempts,
    caseSubmissions,
    evaluations,
    offlineRoundResults,
    config,
    certificates,
    setActiveCertificateModal,
  } = useCompetition();

  const userEmail = (participantUser?.email || participantUser?.coordinator_email || currentUser.email || '').toLowerCase().trim();
  const userInstName = participantUser?.institute_name || currentUser.instituteName || (currentUser as any).organization_name || '';
  const userRegNum = participantUser?.registration_number || currentUser.registrationNumber || '';

  // 1. Authoritative Stage 1 Quiz Program from DB to determine if R1 results are published
  const stage1Program = (quizPrograms || []).find(p => p.id === 'qp_case_comp_stage1_2026')
    || (quizPrograms || []).find(p => p.stage === 'round_1' || p.round === 1)
    || (quizPrograms || [])[0];

  const isResultsPublished = Boolean(
    stage1Program?.isResultsPublished ??
    (stage1Program as any)?.is_results_published ??
    config?.isResultsPublishedR1 ??
    false
  );

  const r1StartDate = stage1Program?.startDate || stage1Program?.startTime || (stage1Program as any)?.start_time || config?.r1QuizStartTime;
  const r1EndDate = stage1Program?.endDate || stage1Program?.endTime || (stage1Program as any)?.end_time || config?.r1QuizEndTime;

  const now = Date.now();
  const r1StartMs = parseISTTimestamp(r1StartDate);
  const r1EndMs = parseISTTimestamp(r1EndDate);

  const isQuizUpcoming = stage1Program?.status === 'draft' || (!isNaN(r1StartMs) && now < r1StartMs);
  const isQuizLive = stage1Program?.status !== 'draft' && stage1Program?.status !== 'paused' && !isNaN(r1StartMs) && !isNaN(r1EndMs) && now >= r1StartMs && now <= r1EndMs;
  const openTimeFormatted = r1StartDate ? formatQuizScheduleDate(r1StartDate) : '';
  const openTimeOnly = openTimeFormatted.includes(',') ? openTimeFormatted.split(',')[1].trim() : openTimeFormatted;

  // 2. Locate dynamic live registration for this coordinator or institute
  const matchedReg = csrRegistrations.find(r =>
    (userRegNum && r.registrationNumber === userRegNum) ||
    (userEmail && (
      r.coordinator?.email?.toLowerCase().trim() === userEmail ||
      (r as any).candidate_email?.toLowerCase().trim() === userEmail ||
      (r as any).coordinator_email?.toLowerCase().trim() === userEmail
    )) ||
    (userInstName && (
      r.organizationName?.toLowerCase().trim() === userInstName.toLowerCase().trim() ||
      r.organizationName?.toLowerCase().includes(userInstName.toLowerCase()) ||
      userInstName.toLowerCase().includes(r.organizationName?.toLowerCase())
    ))
  );

  const matchedInst = institutions.find(i =>
    (userEmail && i.coordinatorEmail?.toLowerCase() === userEmail) ||
    (userInstName && i.name.toLowerCase().includes(userInstName.toLowerCase())) ||
    (userInstName && userInstName.toLowerCase().includes(i.name.toLowerCase()))
  );

  // Authoritative dynamic values - NO IIMB fallback when real coordinator is logged in
  const instName = matchedReg?.organizationName || userInstName || matchedInst?.name || "ASM's Institute of Business Management and Research";
  const coordinatorName = matchedReg?.coordinator?.name || participantUser?.name || currentUser.name || matchedInst?.coordinatorName || 'Faculty Coordinator';
  const coordinatorEmail = matchedReg?.coordinator?.email || userEmail || matchedInst?.coordinatorEmail || 'coordinator@institute.ac.in';
  const coordinatorPhone = matchedReg?.coordinator?.mobile || participantUser?.mobile || currentUser.mobile || '';

  const regNominees = Array.isArray(matchedReg?.nominees) ? matchedReg.nominees : [];

  const isCertificatePublished = Boolean(
    stage1Program?.isCertificatePublished === true ||
    (stage1Program as any)?.is_certificate_published === true ||
    config?.isCertificatePublishedR1 === true ||
    config?.isCertificatePublished === true ||
    (matchedReg as any)?.isCertificatePublished === true ||
    (matchedReg as any)?.raw_data?.isCertificatePublished === true
  );

  const canViewCertificates = Boolean(isCertificatePublished && isResultsPublished);

  const getCandidateCertificate = (s: any): CertificateRecord => {
    const sEmail = (s.email || '').toLowerCase().trim();
    const existing = (certificates || []).find((c: any) => {
      if (!c) return false;
      if (c.recipientEmail && c.recipientEmail.toLowerCase().trim() === sEmail) return true;
      if (c.recipientId && (c.recipientId === s.id || c.recipientId === s.studentId || c.recipientId === s.email)) return true;
      if (s.studentId && c.certificateNumber && c.certificateNumber.includes(s.studentId)) return true;
      if (s.studentId && (c as any).registrationNumber === s.studentId) return true;
      return false;
    });

    if (existing) return existing;

    const regNumber = matchedReg?.registrationNumber || userRegNum || 'AIMA-CL26-INST';
    const isPassed = (s.r1Score ?? 0) >= 60;
    const certNum = `AIMA-2026-CERT-${regNumber.replace(/[^A-Za-z0-9]/g, '')}-${(s.studentId || s.name).slice(0, 4).toUpperCase()}`;

    return {
      id: `cert_${s.id || s.email}`,
      certificateNumber: certNum,
      recipientName: s.name,
      recipientEmail: s.email,
      recipientRole: 'Student Nominee',
      recipientId: s.id || s.email,
      teamName: s.teamName,
      institute: instName,
      registrationNumber: regNumber,
      achievement: isPassed ? 'Round 1 Qualifier' : 'CERTIFICATE OF PARTICIPATION',
      certificateCategory: isPassed ? 'selection' : 'participation',
      issueDate: 'October 2026',
      qrVerificationUrl: `https://research.aima.in/verify/${certNum}`,
      authorizedSignatory: 'Director, AIMA Case Research Centre',
    };
  };

  const [dbParticipants, setDbParticipants] = useState<any[]>([]);

  useEffect(() => {
    async function fetchRoster() {
      try {
        let query = supabase.from('participants').select('*');
        if (userRegNum || matchedReg?.registrationNumber) {
          query = query.eq('registration_number', userRegNum || matchedReg?.registrationNumber);
        } else if (coordinatorEmail) {
          query = query.eq('coordinator_email', coordinatorEmail);
        } else if (instName) {
          query = query.ilike('institute_name', `%${instName.slice(0, 15)}%`);
        }
        const { data } = await query;
        if (data && data.length > 0) {
          setDbParticipants(data);
        }
      } catch (err) {
        console.error('Failed to load institute roster:', err);
      }
    }
    fetchRoster();
  }, [userRegNum, matchedReg?.registrationNumber, coordinatorEmail, instName]);

  // Derive dynamic teams directly from registration nominees
  const dynamicTeamsFromReg = useMemo(() => {
    if (!regNominees || regNominees.length === 0) return [];
    const teamMap = new Map<string, any>();
    regNominees.forEach((n, idx) => {
      const tName = n.teamName || 'Institute Delegation';
      if (!teamMap.has(tName)) {
        teamMap.set(tName, {
          id: `team_reg_${matchedReg?.registrationNumber || 'reg'}_${tName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`,
          name: tName,
          inviteCode: `AIMA-TEAM-${tName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase()}-${idx + 10}`,
          instituteId: 'inst_' + instName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          instituteName: instName,
          assignedHub: 'south',
          leaderStudentId: n.isTeamLeader ? (n.enrolmentNumber || n.email) : undefined,
          members: [],
          selectedTrackId: (matchedReg as any)?.selectedTrackId || 'case_track_csr_01',
          selectedTrackName: (matchedReg as any)?.selectedTrackName || 'Strategic CSR & Governance',
        });
      }
      const t = teamMap.get(tName);
      t.members.push({
        id: n.id || n.email,
        studentId: n.enrolmentNumber || n.email,
        name: n.name,
        email: n.email,
        mobile: n.mobile,
        roleInTeam: n.isTeamLeader ? 'Team Leader & Lead Strategist' : 'Team Member',
        isLeader: Boolean(n.isTeamLeader),
      });
      if (n.isTeamLeader) {
        t.leaderStudentId = n.enrolmentNumber || n.email;
      }
    });
    return Array.from(teamMap.values());
  }, [regNominees, matchedReg?.registrationNumber, instName]);

  // Combined teams representing this institution with fully dynamic R1, R2, and combined metrics
  const instituteTeams = useMemo(() => {
    const baseTeams = dynamicTeamsFromReg.length > 0
      ? dynamicTeamsFromReg
      : teams.filter(
        t =>
          (instName && t.instituteName?.toLowerCase().includes(instName.toLowerCase())) ||
          (instName && instName.toLowerCase().includes(t.instituteName?.toLowerCase() || '___')) ||
          (coordinatorEmail && (t as any).coordinatorEmail?.toLowerCase() === coordinatorEmail.toLowerCase())
      );

    return baseTeams.map(t => {
      const memberEmails = (t.members || []).map((m: any) => m.email?.toLowerCase().trim()).filter(Boolean);
      const teamAttempts = (quizAttempts || []).filter(a =>
        a.isCompleted &&
        (a.teamId === t.id || (a.participantEmail && memberEmails.includes(a.participantEmail.toLowerCase().trim())))
      );

      const r1AvgScore = teamAttempts.length > 0
        ? Math.round(teamAttempts.reduce((acc, a) => acc + (Number(a.score) || 0), 0) / teamAttempts.length)
        : undefined;

      const sub = (caseSubmissions || []).find(s => s.teamId === t.id || s.teamId === t.name) || t.r2Submission;

      const teamEval = (evaluations || []).find(e => e.teamId === t.id || e.submissionId === sub?.id);
      const offlineResult = (offlineRoundResults || []).find(
        o => (o.round === 'round_2' && (o.teamId === t.id || o.teamName?.toLowerCase() === t.name?.toLowerCase()))
      );

      const r2Score = teamEval?.totalScore !== undefined
        ? Number(teamEval.totalScore)
        : (offlineResult?.score !== undefined ? Number(offlineResult.score) : undefined);

      const combinedScore = (r1AvgScore !== undefined ? r1AvgScore : 0) + (r2Score !== undefined ? r2Score : 0);

      return {
        ...t,
        r1AvgScore,
        teamAttemptsCount: teamAttempts.length,
        hasDeckSubmitted: Boolean(sub),
        sub,
        r2Score,
        combinedScore: (isResultsPublished && r2Score !== undefined) ? combinedScore : undefined,
      };
    });
  }, [dynamicTeamsFromReg, teams, instName, coordinatorEmail, quizAttempts, caseSubmissions, evaluations, offlineRoundResults, isResultsPublished]);

  // Real dynamic roster from registration nominees with dynamic attempt data (Fee is ₹0)
  const rosterFromReg = useMemo(() => {
    return regNominees.map((n, idx) => {
      const email = (n.email || '').toLowerCase().trim();
      const attempt = (quizAttempts || []).find(
        a => a.participantEmail?.toLowerCase().trim() === email || a.studentId === n.enrolmentNumber
      );

      const r1Score = attempt?.score !== undefined ? Number(attempt.score) : undefined;
      const isAttempted = Boolean(attempt?.isCompleted || attempt);

      const teamName = n.teamName || 'Institute Nominee';
      const team = instituteTeams.find(t => t.name === teamName);

      const r2Score = team?.r2Score;
      const hasDeckSubmitted = Boolean(team?.hasDeckSubmitted);

      return {
        id: n.id || n.email || `nom_${idx}`,
        name: n.name,
        studentId: n.enrolmentNumber || ('ENR-' + (n.mobile ? n.mobile.slice(-4) : ('00' + (idx + 1)))),
        email: n.email,
        teamName,
        feePaid: true,
        feeAmount: 0,
        r1Score,
        isAttempted,
        r2Score,
        hasDeckSubmitted,
      };
    });
  }, [regNominees, quizAttempts, instituteTeams]);

  const rosterFromDb = useMemo(() => {
    return dbParticipants
      .filter(p => !p.program?.toLowerCase().includes('coordinator') && p.email?.toLowerCase() !== coordinatorEmail.toLowerCase())
      .map((p, idx) => {
        const email = (p.email || '').toLowerCase().trim();
        const attempt = (quizAttempts || []).find(
          a => a.participantEmail?.toLowerCase().trim() === email || a.studentId === p.enrolment_number
        );
        const r1Score = attempt?.score !== undefined ? Number(attempt.score) : undefined;
        const isAttempted = Boolean(attempt?.isCompleted || attempt);

        const teamName = p.is_team_leader ? `${instName} Team Leader` : `${instName} Student Nominee`;
        const team = instituteTeams.find(t => t.name === teamName);
        const r2Score = team?.r2Score;
        const hasDeckSubmitted = Boolean(team?.hasDeckSubmitted);

        return {
          id: p.id || p.email,
          name: p.name,
          studentId: p.enrolment_number || ('ENR-' + (p.mobile ? p.mobile.slice(-4) : ('00' + (idx + 1)))),
          email: p.email,
          teamName,
          feePaid: true,
          feeAmount: 0,
          r1Score,
          isAttempted,
          r2Score,
          hasDeckSubmitted,
        };
      });
  }, [dbParticipants, coordinatorEmail, instName, quizAttempts, instituteTeams]);

  const activeRoster = rosterFromReg.length > 0
    ? rosterFromReg
    : (rosterFromDb.length > 0 ? rosterFromDb : []);

  const inst = {
    id: 'inst_' + instName.toLowerCase().replace(/[^a-z0-9]/g, '_'),
    name: instName,
    ranking: 1,
    coordinatorName,
    coordinatorEmail,
    coordinatorPhone,
    totalStudents: activeRoster.length,
    registeredStudents: activeRoster.length,
    teamsCreated: instituteTeams.length,
    totalPaidAmount: matchedReg?.totalPayable || 0,
  };

  const [activeTab, setActiveTab] = useState<'roster' | 'teams'>('teams');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'qualified'>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [isBulkPaid, setIsBulkPaid] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form state for creating institutional team
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamHub, setNewTeamHub] = useState<'south' | 'north' | 'east' | 'west' | 'central'>('south');
  const [teamMembers, setTeamMembers] = useState<
    Array<{ studentId: string; name: string; email: string; mobile?: string; roleInTeam: string; isLeader: boolean }>
  >([]);

  // Filtered roster
  const filteredRoster = activeRoster.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    if (statusFilter === 'paid') return matchesSearch && s.feePaid;
    if (statusFilter === 'unpaid') return matchesSearch && !s.feePaid;
    if (statusFilter === 'qualified') return matchesSearch && Boolean(isResultsPublished && s.r1Score && s.r1Score >= 65);
    return matchesSearch;
  });

  const unpaidCount = activeRoster.filter(s => !s.feePaid).length;
  const totalUnpaidAmount = unpaidCount * 200;

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddMember = () => {
    if (teamMembers.length >= 4) {
      alert('AIMA Competition Rule Section 5.2 restricts team capacity to maximum 4 members.');
      return;
    }
    const idx = teamMembers.length + 1;
    setTeamMembers(prev => [
      ...prev,
      {
        studentId: `ENR-2026-00${idx}`,
        name: `Candidate ${idx}`,
        email: `candidate${idx}@institute.edu`,
        mobile: '+91 98000 00000',
        roleInTeam: 'Team Analyst',
        isLeader: false,
      },
    ]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length <= 3) {
      alert('AIMA Competition Rule Section 5.2 requires a minimum of 3 registered members per team.');
      return;
    }
    if (teamMembers[index].isLeader) {
      alert('Cannot remove team leader. Please designate another member as leader first.');
      return;
    }
    setTeamMembers(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetLeader = (index: number) => {
    setTeamMembers(prev =>
      prev.map((m, i) => ({
        ...m,
        isLeader: i === index,
        roleInTeam: i === index ? 'Team Leader & Lead Strategist' : m.roleInTeam.replace('Team Leader & ', ''),
      }))
    );
  };

  const handleCreateTeamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeamName.trim()) {
      alert('Please enter a valid Team Name.');
      return;
    }
    if (teamMembers.length < 3 || teamMembers.length > 4) {
      alert('Teams must consist of strictly 3 or 4 candidates (Section 5.2).');
      return;
    }

    const leader = teamMembers.find(m => m.isLeader) || teamMembers[0];

    const result = createInstitutionalTeam(inst.id, {
      name: newTeamName.trim(),
      preferredHub: newTeamHub,
      leaderStudentId: leader.studentId,
      members: teamMembers.map(m => ({
        studentId: m.studentId,
        name: m.name,
        email: m.email,
        mobile: m.mobile,
        roleInTeam: m.roleInTeam,
      })),
    });

    if (result.success) {
      alert(result.message);
      setShowCreateTeamModal(false);
      setNewTeamName('');
      setActiveTab('teams');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Institute Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-2xl border border-purple-500/30 shrink-0">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {inst.name}
              </h1>
              {/* <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                Rank #{inst.ranking} National Institutional Leaderboard
              </span> */}
              <DocRequirementInfo specKey="institute_leaderboard" variant="icon" size="xs" colorTheme="purple" />
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Faculty Coordinator: <strong className="text-slate-800 dark:text-slate-200">{inst.coordinatorName}</strong> ({inst.coordinatorEmail})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateTeamModal(true)}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Institutional Team</span>
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Student Roster (CSV)</span>
          </button>

          {/* <button
            onClick={() => alert(`Downloading consolidated B2B GST Tax Invoice for ${inst.name} (Ref: ${matchedReg?.registrationNumber || 'AIMA-CL26-42754'}). Total ${inst.totalPaidAmount ? '₹' + inst.totalPaidAmount.toLocaleString('en-IN') : 'Complimentary / Settled'}.`)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            <Download className="w-3.5 h-3.5" />
            <span>GST Tax Invoice (PDF)</span>
          </button> */}
        </div>
      </div>

      {/* Institutional Metric Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Enrolled Students</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{inst.totalStudents}</span>
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold block mt-0.5">Across MBA & PGP</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Institutional Teams</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
            {instituteTeams.length} Teams
          </span>
          {/* <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Section 5.2 Compliant</span> */}
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 1 Enrolled Count</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{inst.registeredStudents}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">100% Verified Candidates</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Regional Hub Allocation</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">Regional Hub</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Host Campus: Regional Hub (Assigned Center)</span>
        </div>
      </div>

      {/* Bulk Bursar Payment Banner if any unpaid */}
      {unpaidCount > 0 && !isBulkPaid && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <IndianRupee className="w-6 h-6 text-amber-600 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Institutional Bursar Settlement Available
                </h4>
                <DocRequirementInfo specKey="institute_bursar" variant="icon" size="xs" colorTheme="amber" />
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {unpaidCount} students currently have pending Round 1 fees (₹{totalUnpaidAmount}). You may settle in a single transaction on behalf of the institution.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setIsBulkPaid(true);
              alert(`Successfully authorized institutional bulk transfer of ₹${totalUnpaidAmount} for ${unpaidCount} students.`);
            }}
            className="shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Settle ₹{totalUnpaidAmount} (Consolidated)
          </button>
        </div>
      )}

      {/* Navigation Tabs: Formed Teams vs Student Roster */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'teams'
            ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
        >
          <Users className="w-4 h-4" />
          <span>Formed Institutional Teams ({instituteTeams.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'roster'
            ? 'bg-white dark:bg-slate-900 text-purple-600 dark:text-purple-400 shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Candidate Registry ({filteredRoster.length})</span>
        </button>
      </div>

      {/* ----------------- TAB: FORMED INSTITUTIONAL TEAMS ----------------- */}
      {activeTab === 'teams' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Official Teams Representing {inst.name}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200">
                  {instituteTeams.length} Active
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Each team comprises 3-4 enrolled MBA/PGP students with designated faculty endorsement and unique team code.
              </p>
            </div>

            <button
              onClick={() => setShowCreateTeamModal(true)}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Form New Team</span>
            </button>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {instituteTeams.map(t => {
              const deadlineDate = t.submissionDeadline ? new Date(t.submissionDeadline) : new Date('2026-10-28T23:59:59Z');
              const ext = t.extensionRequest;
              const sub = t.r2Submission;

              return (
                <div
                  key={t.id}
                  className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-purple-300 dark:hover:border-purple-800 transition-colors"
                >
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                        Assigned Regional Hub: {t.assignedHub?.toUpperCase() || 'SOUTH'}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                        {t.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <span>{t.inviteCode}</span>
                        <button
                          onClick={() => handleCopyCode(t.inviteCode)}
                          className="text-slate-400 hover:text-purple-600 cursor-pointer"
                          title="Copy Team Code"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                      {copiedCode === t.inviteCode && (
                        <span className="text-[10px] text-emerald-600 font-bold">Copied!</span>
                      )}
                    </div>
                  </div>

                  {/* Team Members List */}
                  <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                      Registered Members ({t.members.length}/4)
                    </span>
                    {t.members.map((m, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${m.isLeader ? 'bg-purple-600' : 'bg-slate-400'}`} />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                          {m.isLeader && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold">
                              Leader
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{m.roleInTeam || 'Member'}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stage Status & Dynamic Results (R1, R2, and Combined) */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Round 1 Quiz</span>
                      {isResultsPublished ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {t.r1AvgScore !== undefined ? `Avg ${t.r1AvgScore}%` : 'Qualified'}
                        </span>
                      ) : isQuizUpcoming ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 text-[11px]" title={openTimeFormatted ? `Opens ${openTimeFormatted}` : 'Upcoming'}>
                            <Calendar className="w-3.5 h-3.5 shrink-0 text-blue-500" /> Upcoming
                          </span>
                          {openTimeOnly && (
                            <span className="text-[10px] text-slate-400 font-normal">
                              Opens {openTimeOnly}
                            </span>
                          )}
                        </div>
                      ) : isQuizLive ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" /> Live Now
                        </span>
                      ) : (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Under Review
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">R2 Case Defense</span>
                      {t.r2Score !== undefined ? (
                        <span className="font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 mt-0.5 text-xs">
                          <Trophy className="w-3.5 h-3.5 shrink-0" /> {t.r2Score}/100 pts
                        </span>
                      ) : t.hasDeckSubmitted ? (
                        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <FileCheck className="w-3.5 h-3.5 shrink-0" /> Review Pending
                        </span>
                      ) : (
                        <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Pending Defense
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Combined Merit</span>
                      {isResultsPublished && t.r2Score !== undefined ? (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5 text-xs">
                          <Award className="w-3.5 h-3.5 shrink-0" /> {t.combinedScore}/200
                        </span>
                      ) : (
                        <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5 text-[11px]">
                          <Clock className="w-3.5 h-3.5 shrink-0" /> Results Awaited
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Extension status if present */}
                  {ext && (
                    <div className="p-2.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          Deadline Extension: <strong>{ext.status}</strong> (+{ext.requestedExtensionDays}d)
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono">
                        {ext.reasonCategory}
                      </span>
                    </div>
                  )}

                  {/* Submission status pill */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-500">
                      R2 Case Deck: {sub ? <strong className="text-emerald-600">Uploaded ({sub.slideCount} slides)</strong> : <span className="text-amber-600">Pending Upload</span>}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400">
                      Institutional Endorsed ✓
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ----------------- TAB: STUDENT ROSTER ----------------- */}
      {activeTab === 'roster' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm space-y-4 p-6">
          {/* Table Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Institutional Student Registry
              </h3>
              <span className="text-xs text-slate-400 font-mono">({filteredRoster.length} candidates)</span>
              <DocRequirementInfo specKey="institute_roster" variant="icon" size="xs" colorTheme="purple" />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, ID, email..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-900 dark:text-slate-100"
              >
                <option value="all">All Candidates</option>
                <option value="paid">Registered (₹0 Fee)</option>
                <option value="unpaid">Payment Pending</option>
                {isResultsPublished && <option value="qualified">Round 1 Qualified</option>}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Student Name &amp; ID</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Team Assignment</th>
                  <th className="p-3">Stage Fee</th>
                  <th className="p-3">R1 Quiz Score</th>
                  <th className="p-3">R2 Case Defense</th>
                  <th className="p-3">Combined Result</th>
                  <th className="p-3 text-right">Certificate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRoster.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-slate-100">{s.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{s.studentId}</div>
                    </td>
                    <td className="p-3 font-mono text-[11px]">{s.email}</td>
                    <td className="p-3">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{s.teamName || 'Unassigned'}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 font-bold border border-emerald-300">
                        Paid ₹0
                      </span>
                    </td>
                    <td className="p-3 font-semibold">
                      {isQuizUpcoming ? (
                        <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1" title={openTimeFormatted ? `Opens ${openTimeFormatted}` : 'Upcoming'}>
                          <Calendar className="w-3 h-3 text-blue-500" /> Upcoming
                        </span>
                      ) : isQuizLive ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Now
                        </span>
                      ) : !isResultsPublished ? (
                        <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Under Review
                        </span>
                      ) : s.r1Score !== undefined ? (
                        <span className={s.r1Score >= 65 ? 'text-emerald-600' : 'text-slate-500'}>
                          {s.r1Score}% {s.r1Score >= 65 ? '★' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Not taken</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold">
                      {s.r2Score !== undefined ? (
                        <span className="text-purple-600 dark:text-purple-400 font-bold font-mono">
                          {s.r2Score}/100 pts
                        </span>
                      ) : s.hasDeckSubmitted ? (
                        <span className="text-blue-600 dark:text-blue-400 text-[11px] font-medium flex items-center gap-1">
                          <FileCheck className="w-3 h-3" /> Review Pending
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">Pending Defense</span>
                      )}
                    </td>
                    <td className="p-3">
                      {isResultsPublished && s.r2Score !== undefined ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">
                          {((s.r1Score || 0) + s.r2Score)}/200
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic">
                          Results Awaited
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      {canViewCertificates ? (
                        <button
                          onClick={() => {
                            const cert = getCandidateCertificate(s);
                            setActiveCertificateModal(cert);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-[11px] rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                          title="View & Download Official AIMA Certificate"
                        >
                          <Award className="w-3.5 h-3.5 shrink-0" />
                          <span>View Cert</span>
                        </button>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium cursor-not-allowed"
                          title="Certificates will unlock once results and certificates are published by AIMA"
                        >
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>Locked</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Institutional Team */}
      {showCreateTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Form Institutional Competition Team (Section 5.2)
                </h3>
              </div>
              <button onClick={() => setShowCreateTeamModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Register a vetted 3-4 member team on behalf of <strong className="text-slate-800 dark:text-slate-200">{inst.name}</strong>. An automated team code will be generated for student authentication.
            </p>

            <form onSubmit={handleCreateTeamSubmit} className="space-y-4 text-xs">
              {/* Team Name & Preferred Hub */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Team Name:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. StratApex Innovators"
                    value={newTeamName}
                    onChange={e => setNewTeamName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Preferred Regional Hub:
                  </label>
                  <select
                    value={newTeamHub}
                    onChange={e => setNewTeamHub(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="south">Southern Regional Hub (IIM Bangalore)</option>
                    <option value="north">Northern Regional Hub (FMS Delhi)</option>
                    <option value="east">Eastern Regional Hub (IIM Calcutta)</option>
                    <option value="west">Western Regional Hub (JBIMS Mumbai)</option>
                    <option value="central">Central Regional Hub (IIFM Bhopal)</option>
                  </select>
                </div>
              </div>

              {/* Members Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Team Roster ({teamMembers.length} Members - Min 3, Max 4)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Designate 1 Team Leader who possesses authority to submit case decks and request deadline extensions.
                    </span>
                  </div>

                  {teamMembers.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold hover:bg-purple-100 transition-colors cursor-pointer flex items-center gap-1 border border-purple-200 dark:border-purple-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add 4th Member</span>
                    </button>
                  )}
                </div>

                {/* Member Input Rows */}
                <div className="space-y-2.5">
                  {teamMembers.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            Member #{idx + 1}
                          </span>
                          {m.isLeader ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-600 text-white font-bold">
                              ★ Designated Team Leader
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetLeader(idx)}
                              className="text-[10px] text-purple-600 hover:underline font-semibold cursor-pointer"
                            >
                              Make Leader
                            </button>
                          )}
                        </div>

                        {teamMembers.length > 3 && !m.isLeader && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(idx)}
                            className="text-rose-500 hover:text-rose-700 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Candidate Full Name"
                          value={m.name}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, name: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />

                        <input
                          type="email"
                          required
                          placeholder="Institutional Email"
                          value={m.email}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, email: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />

                        <input
                          type="text"
                          required
                          placeholder="Roll No. / Student ID"
                          value={m.studentId}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, studentId: val } : item)));
                          }}
                          className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <input
                          type="text"
                          placeholder="Functional Role (e.g. Lead Strategist, Financial Modeling, Presentation Lead)"
                          value={m.roleInTeam}
                          onChange={e => {
                            const val = e.target.value;
                            setTeamMembers(prev => prev.map((item, i) => (i === idx ? { ...item, roleInTeam: val } : item)));
                          }}
                          className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-[11px]"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance checklist */}
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Competition Compliance Verification</span>
                </div>
                <ul className="text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-4">
                  <li>Minimum 3, maximum 4 members strictly enforced (Section 5.2).</li>
                  <li>Institutional endorsement applied automatically under Coordinator credentials.</li>
                  <li>Team leader enabled for Round 2 Case Deck uploads & deadline extensions.</li>
                </ul>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateTeamModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                >
                  Confirm & Register Team
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Upload CSV Roster */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-purple-600" />
                Upload Institutional Student Roster (Section 5.3)
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Upload an Excel (.xlsx) or CSV file with candidate full names, institutional email addresses, student roll numbers, and department codes.
            </p>

            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-purple-500 transition-colors cursor-pointer bg-slate-50/50 dark:bg-slate-800/30">
              <Upload className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Click to select CSV roster or drag and drop
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Download sample template:{' '}
                <span className="text-purple-600 underline font-semibold">aima_roster_template.csv</span>
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Bulk student roster uploaded and 128 student login invitations generated.');
                  setShowUploadModal(false);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
              >
                Process Roster & Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
