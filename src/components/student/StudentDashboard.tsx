import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizTaker } from './QuizTaker';
import { CaseDeckSubmitter } from './CaseDeckSubmitter';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import { CasePresentationInstructionsModal } from './CasePresentationInstructionsModal';
import { ParticipantLoginPage } from '../auth/ParticipantLoginPage';
import { OFFICIAL_CASE_TRACKS, OFFICIAL_INSTRUCTION_DOCS, CaseTrack } from '../../data/caseTracks';
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
  FileCheck,
  FileText,
  GraduationCap,
  HelpCircle,
  IndianRupee,
  Layers,
  MapPin,
  Plus,
  QrCode,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Trophy,
  Upload,
  User,
  UserPlus,
  Users,
  X,
  Zap
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
    setActiveCertificateModal,
    setActiveSupportModal,
    setActiveVerifierModal,
    participantUser,
    loginParticipantSession,
  } = useCompetition();

  // Enforce real participant authentication - no mock data in production
  if (!participantUser) {
    return <ParticipantLoginPage onLoginSuccess={(part) => loginParticipantSession(part)} />;
  }

  const [activeSubView, setActiveSubView] = useState<'overview' | 'quiz' | 'case_deck'>('overview');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
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

  // Round 2 Track Selection & Offline Presentation Instructions
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedTrackForModal, setSelectedTrackForModal] = useState<CaseTrack | undefined>(undefined);
  const [candidateTrackId, setCandidateTrackId] = useState<string>(
    currentTeam?.selectedTrackId || currentUser.selectedTrackId || 'operations'
  );
  const [isChangingTrack, setIsChangingTrack] = useState(false);
  const [trackLockSuccessMsg, setTrackLockSuccessMsg] = useState<string | null>(null);

  // Payment simulated methods
  const [payMethod, setPayMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('aarav@okaxis');

  const myAttempt = Array.isArray(quizAttempts)
    ? quizAttempts.find(q => q.userId === currentUser.id || q.studentId === currentUser.id)
    : Object.values(quizAttempts || {}).find((q: any) => q.userId === currentUser.id || q.studentId === currentUser.id);

  const myCaseSubmission = Array.isArray(caseSubmissions)
    ? caseSubmissions.find(s => s.teamId === currentTeam?.id) || currentTeam?.r2Submission
    : currentTeam?.r2Submission;

  const myCert = Array.isArray(certificates)
    ? certificates.find(c => c.recipientId === currentUser.id || c.teamName === currentTeam?.name)
    : undefined;

  const assignedHubId = currentTeam?.assignedHub || currentUser.assignedHub || 'north';
  const hubInfo = hubs.find(h => h.id === assignedHubId) || hubs[0];

  // Dynamic financial calculation from registration (flat ₹200 per student)
  const isInstituteReg = currentTeam?.registrationMode === 'institute' || currentUser.instituteId?.includes('participant');
  const isPaymentPaid = currentTeam?.paymentStatus === 'PAID';
  const memberCount = currentTeam?.members?.length || 1;
  const totalAmountVal = currentTeam?.totalAmount || (memberCount * 200);
  const formattedTotalAmount = `₹${totalAmountVal.toLocaleString('en-IN')}`;
  const perParticipantAmount = 200;
  const formattedPerParticipantAmount = `₹${perParticipantAmount.toLocaleString('en-IN')}`;

  const handleCopyInvite = () => {
    if (!currentTeam) return;
    navigator.clipboard?.writeText(currentTeam.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
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

  const isResultsPublishedR1 = Boolean(config?.isResultsPublishedR1 ?? config?.isPublicResultsPublished ?? true);
  const hasPassedR1 = Boolean(
    currentUser.qualificationStatus?.r1Qualified ||
    currentTeam?.r1Qualified ||
    (myAttempt && (myAttempt.score || 0) >= (config?.r1CutoffScore || 60)) ||
    myAttempt?.passed
  );
  const activeConfirmedTrackId = currentTeam?.selectedTrackId || currentUser.selectedTrackId;
  const activeConfirmedTrack = OFFICIAL_CASE_TRACKS.find(t => t.id === activeConfirmedTrackId);

  const handleConfirmTrack = () => {
    const res = selectTeamTrack(candidateTrackId);
    if (res.success) {
      setTrackLockSuccessMsg(res.message);
      setIsChangingTrack(false);
      setTimeout(() => setTrackLockSuccessMsg(null), 6000);
    }
  };

  const handleOpenInstructions = (track?: CaseTrack) => {
    setSelectedTrackForModal(
      track || activeConfirmedTrack || OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId) || OFFICIAL_CASE_TRACKS[1]
    );
    setShowInstructionsModal(true);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    makePayment('round1', totalAmountVal, payMethod === 'upi' ? 'UPI_TRANSACTION' : 'CARD_TRANSACTION');
    setShowPaymentModal(false);
  };

  // If active sub-view is quiz
  if (activeSubView === 'quiz') {
    return <QuizTaker onBack={() => setActiveSubView('overview')} />;
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
              {currentUser.name ? currentUser.name.charAt(0) : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {currentUser.name || 'Participant'}
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  {currentUser.isTeamLeader || currentUser.role === 'team_leader' ? '👑 Team Leader' : '👤 Team Member'}
                </span>
                {(currentUser.isVerified || currentUser.idCardUploaded) && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3 h-3" /> Student ID Verified
                  </span>
                )}
                <DocRequirementInfo specKey="student_eligibility" variant="icon" size="xs" colorTheme="slate" />
              </div>

              <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {currentUser.instituteName || 'Registered Institution'}
                </span>
                {currentUser.programme && (
                  <>
                    <span>•</span>
                    <span>
                      {currentUser.programme}
                      {currentUser.specialisation ? ` (${currentUser.specialisation})` : ''}
                      {currentUser.yearSemester ? ` • ${currentUser.yearSemester}` : ''}
                      {currentUser.expectedGraduation ? ` (Batch of ${currentUser.expectedGraduation})` : ''}
                    </span>
                  </>
                )}
                {currentUser.enrolmentNumber && (
                  <>
                    <span>•</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                      Roll: {currentUser.enrolmentNumber}
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
                <DocRequirementInfo specKey="certificates_qr" variant="icon" size="xs" colorTheme="amber" />
              </div>
            )}

            {isInstituteReg ? (
              isPaymentPaid ? (
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Institution Grant • Paid ({formattedTotalAmount})
                  </span>
                  <DocRequirementInfo specKey="student_fees" variant="icon" size="xs" colorTheme="emerald" />
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 flex items-center gap-1.5 border border-amber-300 dark:border-amber-700">
                    <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Institution Proforma Invoice Pending ({formattedTotalAmount})
                  </span>
                  <DocRequirementInfo specKey="student_fees" variant="icon" size="xs" colorTheme="amber" />
                </div>
              )
            ) : currentUser.hasPaidR1R2 || isPaymentPaid ? (
              <div className="inline-flex items-center gap-1.5">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Registration Fee Paid ({formattedPerParticipantAmount})
                </span>
                <DocRequirementInfo specKey="student_fees" variant="icon" size="xs" colorTheme="emerald" />
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5">
                <button
                  onClick={() => setShowPaymentModal(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Pay Fee ({formattedPerParticipantAmount})</span>
                </button>
                <DocRequirementInfo specKey="student_fees" variant="icon" size="xs" colorTheme="emerald" />
              </div>
            )}
          </div>

        </div>

        {/* Milestone Progression Bar */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2">
            <div className="flex items-center gap-1.5">
              <span>Stage Progression</span>
              <DocRequirementInfo specKey="student_progression" variant="icon" size="xs" colorTheme="slate" />
            </div>
            <span className="text-amber-600 dark:text-amber-400 font-bold">
              {myAttempt
                ? (myCaseSubmission ? 'Round 2 Submitted • Awaiting Evaluation' : 'Round 2 Active • Advancing to Regionals')
                : 'Round 1 Active • Assessment Pending'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] sm:text-xs font-bold">
            <button
              onClick={() => setActiveSubView('quiz')}
              className="p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-xs"
            >
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Round 1: Online Quiz</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {myAttempt ? `Score: ${myAttempt.score}% (Passed)` : 'Take Quiz (45m)'}
              </span>
            </button>

            <button
              onClick={() => setActiveSubView('case_deck')}
              className="p-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 border border-blue-500/30 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 shadow-xs"
            >
              <span className="flex items-center gap-1">
                <FileCheck className="w-3.5 h-3.5 text-blue-500" />
                <span>Round 2: Case Deck</span>
              </span>
              <span className="text-[10px] font-medium opacity-80">
                {myCaseSubmission ? `${myCaseSubmission.slideCount || 12} Slides Submitted` : 'Upload Case Deck'}
              </span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1">
              <span className="font-semibold">Round 3: Regional Hub</span>
              <span className="text-[10px] opacity-75">{hubInfo ? `${hubInfo.city} (Nov 14)` : 'Regional Hub'}</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1">
              <span className="font-semibold">Round 4: Grand Finale</span>
              <span className="text-[10px] opacity-75">AIMA HQ New Delhi</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Section: Team Formation & Stage Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Team Formation Panel */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100">
                Team Roster (Section 5.2)
              </h3>
              <DocRequirementInfo specKey="team_formation" variant="icon" size="xs" colorTheme="slate" />
            </div>
            {currentTeam && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                currentTeam.members.length >= (currentTeam.maxMembers || 4)
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  : currentTeam.isLocked
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
              }`}>
                {currentTeam.members.length >= (currentTeam.maxMembers || 4)
                  ? `Roster Complete (${currentTeam.members.length}/${currentTeam.maxMembers || 4})`
                  : currentTeam.isLocked
                    ? 'Roster Locked'
                    : `Open for Member (${currentTeam.members.length}/${currentTeam.maxMembers || 4})`}
              </span>
            )}
          </div>

          {currentTeam ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 space-y-2">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                  {isInstituteReg ? 'Institutional Cohort Team' : 'Assigned Team Name'}
                </div>
                <div className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {currentTeam.name}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <span>Invite Code: <strong className="font-mono text-amber-600 select-all">{currentTeam.inviteCode}</strong></span>
                  <button
                    onClick={handleCopyInvite}
                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    title="Copy Invite Code"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                {copiedCode && (
                  <span className="text-[10px] text-emerald-600 font-semibold block">✓ Code copied to clipboard</span>
                )}

                {/* Dynamic Financial Overview */}
                <div className="pt-2 mt-2 border-t border-amber-200/50 dark:border-amber-900/40 text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                    <span>Registration Mode:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {isInstituteReg ? 'Institutional Nomination' : 'Team Registration'}
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
                  {currentTeam.invoiceNumber && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Invoice Ref:</span>
                      <span className="font-mono">{currentTeam.invoiceNumber}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>
                    {isInstituteReg
                      ? `Nominated Members (${currentTeam.members.length} Participants)`
                      : `Registered Members (${currentTeam.members.length}/${currentTeam.maxMembers || 4})`}
                  </span>
                  {currentTeam.feeTier && (
                    <span className="text-[9px] font-normal text-slate-400 truncate max-w-[130px]" title={currentTeam.feeTier}>
                      {currentTeam.feeTier}
                    </span>
                  )}
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentTeam.members.map((member: any, idx: number) => {
                    const memberIsPaid = member.hasPaid || isPaymentPaid;
                    const memberBadgeText = member.paymentLabel || (
                      isInstituteReg
                        ? (memberIsPaid ? 'Institute Paid' : 'Invoice Pending')
                        : (memberIsPaid ? `Paid ${formattedPerParticipantAmount}` : `Pending ${formattedPerParticipantAmount}`)
                    );

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
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          memberIsPaid
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

              {/* Add 4th Member Action if Roster < 4 */}
              {currentTeam.members.length < (currentTeam.maxMembers || 4) && (
                <div className="p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                      <UserPlus className="w-4 h-4 text-amber-600" />
                      <span>Roster Open ({currentTeam.members.length}/4 Members)</span>
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
                    <span>Add {currentTeam.members.length === 3 ? '4th' : 'Additional'} Member</span>
                  </button>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                {isInstituteReg
                  ? `Institutional Cohort: ${currentTeam.members.length} student nominees registered by ${currentTeam.instituteName || 'Institution'}. Fees settled at institutional level.`
                  : 'Rules: Teams must consist of 3-4 members. Roster locks automatically upon Round 2 Case Deck deadline.'}
              </div>
            </div>
          ) : (
            <div className="text-center py-6 space-y-4">
              <Users className="w-10 h-10 text-slate-400 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Team Formed Yet</h4>
                <p className="text-xs text-slate-500 mt-1">Create a new team as leader or join your peers via invite code.</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setShowCreateTeamModal(true)}
                  className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Create New Team (As Leader)
                </button>
                <button
                  onClick={() => setShowJoinTeamModal(true)}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Join via Invite Code
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Competition Action Stage Cards */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Round 1 Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                  ROUND 1
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Online Business & Strategy Quiz
                </span>
                <DocRequirementInfo specKey="round1_quiz" variant="icon" size="xs" colorTheme="amber" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                45-Min Timed Assessment Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myAttempt
                  ? `Completed on ${myAttempt.submittedAt} • Final Score: ${myAttempt.score}% (Qualified for Round 2)`
                  : 'Test your business acumen, macroeconomic analysis, and AI application framework.'}
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('quiz')}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                myAttempt
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                  : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-500/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{myAttempt ? 'Retake / Practice Quiz' : 'Start Round 1 Quiz'}</span>
            </button>
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

          {isResultsPublishedR1 && hasPassedR1 ? (
            !activeConfirmedTrackId || isChangingTrack ? (
              /* State A: Must Step to Proceed - Select 1 of 6 Tracks */
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-amber-500 ring-4 ring-amber-500/20 shadow-xl shadow-amber-500/10 space-y-6 animate-in fade-in transition-all">
                {/* Highlighted Header Banner */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex h-3 w-3 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                    </span>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500 text-slate-950 uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      MANDATORY ACTION REQUIRED • SELECT TRACK TO PROCEED
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      ✓ Round 1 Quiz Passed ({currentUser.quizScore || myAttempt?.score || 92}%)
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                      ROUND 2 OFFLINE PRESENTATION
                    </span>
                  </div>

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                        Choose Your Official Functional Track for Round 2
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-3xl leading-relaxed mt-1">
                        Round 1 results are published! Round 2 will happen <strong>OFFLINE</strong> inside the <strong>AIMA Venue Hall</strong> directly in front of certified Jury members. You <strong>MUST</strong> choose exactly 1 of the 6 functional tracks below to proceed with your presentation slot.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                      <button
                        onClick={() => handleOpenInstructions()}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                      >
                        <FileText className="w-4 h-4" />
                        <span>View Instructions & Rubric</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 6 Tracks Interactive Grid */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Select 1 of 6 Functional Tracks (Click card to select)
                    </span>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                      {OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.badge} Selected
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {OFFICIAL_CASE_TRACKS.map(track => {
                      const isSelected = candidateTrackId === track.id;
                      return (
                        <div
                          key={track.id}
                          onClick={() => setCandidateTrackId(track.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left relative ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 ring-2 ring-blue-500/30 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${track.accentColor.badgeBg} ${track.accentColor.badgeText}`}>
                                {track.badge}
                              </span>
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  isSelected
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
                              <div className="p-2 rounded-lg bg-blue-100/60 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 text-[10px] text-blue-800 dark:text-blue-300 font-semibold">
                                📌 <strong>Case:</strong> {track.masterCaseTitle}
                              </div>
                            )}
                          </div>

                          <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">
                              3 Focus Questions (12 Slides)
                            </span>
                            <span className={`font-bold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                              {isSelected ? '✓ Selected' : 'Click to Pick'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Highlighted Confirmation Action Bar */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Chosen Track: {OFFICIAL_CASE_TRACKS.find(t => t.id === candidateTrackId)?.name}
                    </span>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Click below to lock your selection and unlock the offline jury case presentation schedule at AIMA venue.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isChangingTrack && activeConfirmedTrackId && (
                      <button
                        onClick={() => setIsChangingTrack(false)}
                        className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      onClick={handleConfirmTrack}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>Confirm & Lock Selected Track</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex items-start gap-2">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Offline Jury Workflow:</strong> Round 2 presentation happens in person at the AIMA Hall in front of Jury members. The Jury evaluates your presentation on official physical scorecards, which the Admin enters into the admin panel against each team to determine the winners.
                  </span>
                </div>
              </div>
            ) : (
              /* State B: Track Confirmed - Display Confirmed State, Venue Details, Scorecard Workflow */
              <div className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/40 shadow-sm space-y-6 animate-in fade-in">
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
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setIsChangingTrack(true)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Change Track
                    </button>

                    <button
                      onClick={() => handleOpenInstructions(activeConfirmedTrack)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Instructions & Rubric</span>
                    </button>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Instructions file: <code className="font-mono text-slate-700 dark:text-slate-300">Participnat Instruction for Case presentation.docx</code></span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleOpenInstructions(activeConfirmedTrack)}
                      className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                    >
                      View Instructions & Rubric Modal
                    </button>
                  </div>
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
                    Offline Case Presentation (6 Tracks)
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                  AIMA Hall Offline Case Defense
                </h3>
                <p className="text-xs text-slate-500">
                  Requires completing Round 1 Quiz with a passing score (≥65%) and publication of Round 1 results to unlock track selection.
                </p>
              </div>

              <button
                onClick={() => setActiveSubView('quiz')}
                className="shrink-0 px-4 py-2.5 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Complete Round 1 Quiz First</span>
              </button>
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
                  {memberCount} × ₹200 = ₹{memberCount * 200}
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

      {/* Official Case Presentation Instructions Modal (.docx content) */}
      <CasePresentationInstructionsModal
        isOpen={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        selectedTrack={selectedTrackForModal}
      />

    </div>
  );
};
