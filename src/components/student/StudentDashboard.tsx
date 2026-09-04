import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { QuizTaker } from './QuizTaker';
import { CaseDeckSubmitter } from './CaseDeckSubmitter';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  AlertCircle,
  Award,
  BookOpen,
  Building,
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
  Scale,
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
    currentUser,
    currentTeam,
    createTeam,
    joinTeam,
    makePayment,
    quizAttempts,
    caseSubmissions,
    hubs,
    certificates,
    setActiveCertificateModal,
    setActiveSupportModal,
    setActiveVerifierModal,
  } = useCompetition();

  const [activeSubView, setActiveSubView] = useState<'overview' | 'quiz' | 'case_deck'>('overview');
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [downloadedAdmitCard, setDownloadedAdmitCard] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [joinInviteCode, setJoinInviteCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

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

  const handleCopyInvite = () => {
    if (!currentTeam) return;
    navigator.clipboard?.writeText(currentTeam.inviteCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadHallTicket = () => {
    setDownloadedAdmitCard(true);
    setTimeout(() => setDownloadedAdmitCard(false), 3500);
  };

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    makePayment('round1', 200, payMethod === 'upi' ? 'UPI_TRANSACTION' : 'CARD_TRANSACTION');
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
                  {currentUser.role === 'team_leader' ? '👑 Team Leader' : currentUser.role === 'team_member' ? '👤 Team Member' : '🎓 Registered Participant'}
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
                  {currentUser.instituteName || 'Indian Institute of Management Bangalore (IIMB)'}
                </span>
                <span>•</span>
                <span>
                  {currentUser.programme || 'MBA'}
                  {currentUser.specialisation ? ` (${currentUser.specialisation})` : ''} • {currentUser.yearSemester || 'Year 2'} (Batch of {currentUser.expectedGraduation || '2027'})
                </span>
                <span>•</span>
                <span className="font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                  Roll: {currentUser.enrolmentNumber || currentUser.id}
                </span>
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

            {currentUser.hasPaidR1R2 ? (
              <div className="inline-flex items-center gap-1.5">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Stage 1 Fee Paid (₹200)
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
                  <span>Pay Stage Fee (₹200)</span>
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
            <span className="text-amber-600 dark:text-amber-400 font-bold">Round 2 Active • Advancing to Regionals</span>
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
                {myCaseSubmission ? '12 Slides Submitted' : 'Upload Case Deck'}
              </span>
            </button>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1">
              <span className="font-semibold">Round 3: Regional Hub</span>
              <span className="text-[10px] opacity-75">IIM Bangalore (Nov 14)</span>
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
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300">
                {currentTeam.isLocked ? 'Roster Locked' : 'Open for Roster'}
              </span>
            )}
          </div>

          {currentTeam ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300/40 space-y-2">
                <div className="text-[10px] text-amber-700 dark:text-amber-400 font-bold uppercase tracking-wider">
                  Assigned Team Name
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
              </div>

              {/* Members List */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Registered Members ({currentTeam.members.length}/4)
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentTeam.members.map((member: any, idx: number) => (
                    <div key={member.id || member.studentId || idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{member.name}</span>
                          {(member.role === 'team_leader' || member.isLeader) && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold">Leader</span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{member.email}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold">
                        Paid ₹200
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[11px] text-slate-500 leading-relaxed">
                Rules: Teams must consist of 3-4 members. Roster locks automatically upon Round 2 Case Deck deadline.
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

          {/* Round 2 Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                  ROUND 2
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  PPT/PDF Strategy Deck Submission
                </span>
                <DocRequirementInfo specKey="round2_case" variant="icon" size="xs" colorTheme="blue" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                GreenGrid Mobility Case Study
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {myCaseSubmission
                  ? `Uploaded: ${myCaseSubmission.fileName} (${myCaseSubmission.slideCount} slides) • Status: ${myCaseSubmission.status}`
                  : 'Download official dossier, build 12-slide strategy solution & run Gemini AI pre-scan.'}
              </p>
            </div>

            <button
              onClick={() => setActiveSubView('case_deck')}
              className="shrink-0 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>{myCaseSubmission ? 'Update Case Deck' : 'Submit Case Deck'}</span>
            </button>
          </div>

          {/* Round 3 Regional Hub Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20">
                  ROUND 3
                </span>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Regional Live Round (Face-to-Face)
                </span>
                <DocRequirementInfo specKey="round3_regional" variant="icon" size="xs" colorTheme="purple" />
              </div>
              <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                Southern Regional Hub
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Host Campus</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">IIM Bangalore</span>
                <span className="text-[10px] text-slate-500 block">Bannerghatta Road</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Defense Schedule</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Nov 14, 2026</span>
                <span className="text-[10px] text-slate-500 block">Slot: 10:30 AM (Auditorium 2)</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Admit Card (QR-Secured)</span>
                <button
                  onClick={handleDownloadHallTicket}
                  className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 mt-0.5 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Download Hall Ticket
                </button>
                {downloadedAdmitCard && (
                  <span className="text-[10px] text-emerald-600 font-semibold block mt-1 animate-in fade-in">
                    ✓ Hall ticket generated ({currentUser.name} - Hub Room B-204)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Round 4 National Finale Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-600/10 to-amber-500/5 border border-amber-500/30 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-amber-500 text-slate-950 font-extrabold">
                  ROUND 4
                </span>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  National Policy & Boardroom Grand Finale
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                National Winner • Cash Prize ₹5,00,000
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Presented before AIMA President & Union Ministry of Commerce delegations.
              </p>
            </div>

            {myCert && (
              <button
                onClick={() => setActiveCertificateModal(myCert)}
                className="shrink-0 px-4 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>View National Trophy Credential</span>
              </button>
            )}
          </div>

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
                <span className="text-slate-500 block">Registration Amount</span>
                <span className="font-bold text-slate-900 dark:text-slate-100 text-base">₹200.00</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">GST (18% Included)</span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold">₹30.51</span>
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
                Authorize & Pay ₹200
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
