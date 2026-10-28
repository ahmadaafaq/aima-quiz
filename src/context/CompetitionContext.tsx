import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Team,
  TeamMember,
  RegionalHub,
  QuizProgram,
  QuizQuestion,
  QuizAttempt,
  CaseSubmission,
  RubricCriterion,
  Evaluation,
  InstitutionalProfile,
  CorporateSponsor,
  CertificateRecord,
  SupportTicket,
  AuditLog,
  PaymentRecord,
  Announcement,
  CompetitionConfig,
  RegionHubId,
  DeadlineExtensionRequest,
  OfflineRoundResult,
  CSRBootcampRegistration,
  CSREmailLog,
} from '../types';
import {
  supabase,
  saveRegistrationToSupabase,
  fetchRegistrationsFromSupabase,
  updateRegistrationPaymentInSupabase,
  SupabaseParticipantRow,
  fetchRegistrationByNumber,
  fetchParticipantsByRegistration,
  getLocalRegistrationsCache,
  saveParticipantTrackSelection,
  fetchParticipantTrackSelection,
  saveJuryScorecardToDb,
  fetchJuryEvaluationsFromDb,
  addMemberToRegistrationInSupabase,
  getLocalConfigCache,
  saveLocalConfigCache,
  fetchCompetitionConfigFromSupabase,
  updateCompetitionConfigViaServer,
  mapSupabaseRowToAppConfig,
  fetchQuizPrograms,
  upsertQuizProgram,
  deleteQuizProgramFromDb,
  getLocalQuizProgramsCache,
  saveLocalQuizProgramsCache,
  fetchQuizQuestionsPublic,
  fetchQuizQuestionsAdmin,
  upsertQuizQuestion,
  upsertQuizQuestionsBulk,
  deleteQuizQuestionFromDb,
  fetchLeaderboard,
  fetchAllProgramQuestionMappings,
  fetchProgramQuestions,
  saveProgramQuestions,
  createAndAssignQuestion,
  getLocalProgramQuestionsCache,
  generateDefaultPassword,
  DB_SCHEMA,
} from '../lib/supabase';
import {
  sendRegistrationConfirmation,
  sendTeamMemberAddedEmail,
  sendR1ResultsEmail,
  sendFinalResultsEmail,
  broadcastR1Results,
  broadcastFinalResults,
} from '../lib/emailService';
import {
  INITIAL_CONFIG,
  ROUND_2_RUBRIC,
  ROUND_3_RUBRIC,
  ROUND_4_RUBRIC,
  REGIONAL_HUBS,
  MOCK_USERS,
  MOCK_TEAMS,
  MOCK_INSTITUTIONS,
  MOCK_SPONSORS,
  MOCK_EVALUATIONS,
  MOCK_CERTIFICATES,
  MOCK_PAYMENTS,
  MOCK_ANNOUNCEMENTS,
  MOCK_SUPPORT_TICKETS,
  MOCK_AUDIT_LOGS,
  MOCK_OFFLINE_ROUND_RESULTS,
  MOCK_CSR_EMAIL_LOGS,
} from '../data/mockData';
import { OFFICIAL_CASE_TRACKS } from '../data/caseTracks';

interface CompetitionContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  switchRole: (role: UserRole) => void;
  activeView: string;
  setActiveView: (view: string) => void;

  config: CompetitionConfig;
  updateConfig: (newConfig: Partial<CompetitionConfig>) => void;

  // User Registry & Candidate Management
  users: UserProfile[];
  addUser: (user: Omit<UserProfile, 'id'>) => UserProfile;
  updateUser: (id: string, user: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  verifyUserStudentId: (userId: string, isVerified: boolean) => void;
  updateUserQualification: (userId: string, qualification: Partial<UserProfile['qualificationStatus']>) => void;

  teams: Team[];
  userTeam: Team | undefined;
  currentTeam: Team | undefined;
  createTeam: (name: string, preferredHub?: RegionHubId) => { success: boolean; message: string; team?: Team };
  joinTeam: (inviteCode: string) => { success: boolean; message: string };
  addTeamMember: (memberData: {
    name: string;
    email: string;
    mobile?: string;
    enrolmentNumber?: string;
    program?: string;
    semester?: string;
    gender?: string;
  }) => Promise<{ success: boolean; message: string; password?: string }>;
  leaveTeam: () => void;
  lockTeam: (teamId: string) => void;
  selectTeamTrack: (trackId: string) => { success: boolean; message: string };
  requestDeadlineExtension: (teamId: string, requestData: {
    reasonCategory: 'Academic/Exam Clash' | 'Medical Emergency' | 'Technical/Hardware Issue' | 'Faculty/Mentor Review Delay' | 'Other';
    reasonDetails: string;
    requestedExtensionDays: number;
    supportingDocName?: string;
  }) => { success: boolean; message: string };
  reviewDeadlineExtension: (teamId: string, decision: 'APPROVED' | 'REJECTED', remarks?: string, customNewDeadline?: string) => void;
  updateTeamDeadline: (teamId: string, newDeadline: string) => void;

  // Registration & Payment
  updateUserProfile: (data: Partial<UserProfile>) => void;
  processPayment: (stage: 'round_1_2' | 'round_3' | 'round_4', method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon', couponCode?: string) => Promise<{ success: boolean; message: string; receiptNumber?: string }>;
  makePayment: (stage?: string, amount?: number, method?: string) => Promise<{ success: boolean; message: string; receiptNumber?: string }>;

  // Quiz Programs & Module
  quizPrograms: QuizProgram[];
  addQuizProgram: (program: Omit<QuizProgram, 'id' | 'enrolledCount' | 'completedCount' | 'inProgressCount'>) => QuizProgram;
  updateQuizProgram: (id: string, program: Partial<QuizProgram>) => Promise<boolean>;
  deleteQuizProgram: (id: string) => void;
  refreshQuizPrograms: () => Promise<void>;
  programQuestionMappings: Record<string, string[]>;
  getProgramQuestions: (programId: string) => QuizQuestion[];
  setProgramQuestions: (programId: string, questionIds: string[]) => Promise<void>;
  createAndAssignQuestionToProgram: (programId: string, question: Omit<QuizQuestion, 'id'>) => Promise<QuizQuestion | null>;
  smartAutoFillProgramQuestions: (programId: string, count: number, category?: string) => Promise<string[]>;
  questions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  refreshQuizAttempts: () => Promise<void>;
  saveQuizProgress: (attemptId: string, answers: Record<string, number>, marked: string[], tabSwitches: number) => void;
  submitQuiz: (answers: Record<string, number>, marked: string[], timeTaken: number, tabSwitches: number) => Promise<QuizAttempt>;
  addQuestion: (q: Omit<QuizQuestion, 'id'>) => void;
  addQuestionsBulk: (newQuestions: Omit<QuizQuestion, 'id'>[]) => number;
  updateQuestion: (id: string, q: Partial<QuizQuestion>) => void;
  deleteQuestion: (id: string) => void;
  isQuizActive: boolean;
  setIsQuizActive: (active: boolean) => void;

  // Case Deck Module
  caseSubmissions: CaseSubmission[];
  activeSubmission: CaseSubmission | null;
  submitCaseDeck: (deckData: any) => Promise<CaseSubmission> | CaseSubmission;
  requestAiCaseAssessment: (submissionId: string) => Promise<any>;
  aiEvaluations: Record<string, any>;
  setAiEvaluations: React.Dispatch<React.SetStateAction<Record<string, any>>>;

  // Rubrics & Evaluations & Jury
  rubricR2: RubricCriterion[];
  rubricR3: RubricCriterion[];
  rubricR4: RubricCriterion[];
  updateRubricCriterion: (round: 'r2' | 'r3' | 'r4', criterionId: string, data: Partial<RubricCriterion>) => void;
  evaluations: Evaluation[];
  submitEvaluation: (evalData: Omit<Evaluation, 'id' | 'submittedAt'> | any) => void;
  evaluateSubmission: (evalData: any) => void;
  declareConflictOfInterest: (submissionId: string, reason: string) => void;
  moderateEvaluation: (evalId: string, moderatedScore: number, reason: string) => void;

  // Jury & Evaluator Desk
  addJuryMember: (jury: Partial<UserProfile> & { name: string; email: string; speciality: string }) => UserProfile;
  updateJuryMember: (userId: string, data: Partial<UserProfile>) => void;
  deleteJuryMember: (userId: string) => void;
  autoAllocateCasesToJury: () => { allocatedCount: number; details: Array<{ teamName: string; caseTitle: string; juryName: string; speciality: string }> };

  // Regional Hubs
  hubs: RegionalHub[];
  addRegionalHub: (hub: RegionalHub) => void;
  updateRegionalHub: (hubId: RegionHubId | string, hub: Partial<RegionalHub>) => void;
  updateHubCapacity: (hubId: RegionHubId | string, capacity: number) => void;
  assignHubCoordinator: (hubId: RegionHubId | string, coordinator: { name: string; email: string; mobile?: string; designation?: string }) => void;
  assignTeamHub: (teamId: string, hubId: RegionHubId) => void;
  verifyAttendance: (teamId: string, attended: boolean) => void;
  schedulePresentationSlot: (teamId: string, slot: { date: string; time: string; venue: string; room: string; juryPanelId: string }) => void;
  submitRegionalJuryScore: (teamId: string, score: number, juryName: string, comments: string) => void;

  // Institute & Sponsors
  institutions: InstitutionalProfile[];
  addInstitution: (inst: Omit<InstitutionalProfile, 'id'>) => void;
  updateInstitution: (id: string, inst: Partial<InstitutionalProfile>) => void;
  createInstitutionalTeam: (instId: string, teamData: {
    name: string;
    preferredHub?: RegionHubId;
    leaderStudentId: string;
    members: Array<{
      studentId: string;
      name: string;
      email: string;
      mobile?: string;
      roleInTeam?: string;
    }>;
  }) => { success: boolean; message: string; team?: Team };
  bulkRegisterStudents: (instId: string, csvData: Array<Record<string, string>>) => { added: number; errors: string[] };
  processInstitutionalPayment: (instId: string, amount: number) => void;
  sponsors: CorporateSponsor[];
  addSponsor: (sponsor: Omit<CorporateSponsor, 'id'>) => void;
  updateSponsor: (id: string, sponsor: Partial<CorporateSponsor>) => void;
  deleteSponsor: (id: string) => void;

  // Offline Rounds 2, 3 & 4 Results Management
  offlineRoundResults: OfflineRoundResult[];
  recordOfflineResultsBulk: (round: 'round_2' | 'round_3' | 'round_4', results: Array<Omit<OfflineRoundResult, 'id' | 'uploadedAt'>>) => { success: boolean; count: number };
  updateOfflineResult: (id: string, updates: Partial<OfflineRoundResult>) => void;
  deleteOfflineResult: (id: string) => void;

  // Registration Flow with Simulated Gateway
  showRegistrationModal: boolean;
  setShowRegistrationModal: (show: boolean) => void;
  registrationModalTrack: 'team' | 'institute';
  openRegistrationModal: (track?: 'team' | 'institute') => void;
  registerTeamWithPayment: (formData: any) => Promise<{ success: boolean; team: Team; leader: UserProfile; transactionId: string; invoiceNumber: string }>;
  registerInstituteWithPayment: (formData: any) => Promise<{ success: boolean; institution: InstitutionalProfile; voucherCode: string; invoiceNumber: string }>;

  // Certified CSR Leader Bootcamp Registration & Secretariat Integration
  csrRegistrations: CSRBootcampRegistration[];
  csrEmailLogs: CSREmailLog[];
  registerCSRBootcamp: (data: Omit<CSRBootcampRegistration, 'id' | 'createdAt' | 'emailDispatchedAt' | 'secretariatEmailSent' | 'registrantEmailSent'>) => {
    registration: CSRBootcampRegistration;
    emailLog: CSREmailLog;
  };
  updateCSRPayment: (registrationId: string, paymentMethod: string, transactionId: string) => void;

  // Certificates & Results
  certificates: CertificateRecord[];
  setCertificates: React.Dispatch<React.SetStateAction<CertificateRecord[]>>;
  activeCertificateModal: CertificateRecord | null;
  setActiveCertificateModal: (cert: CertificateRecord | null) => void;
  activeVerifierModal: boolean;
  setActiveVerifierModal: (show: boolean) => void;
  generateCertificate: (cert: Omit<CertificateRecord, 'id' | 'certificateNumber' | 'qrVerificationUrl'>) => CertificateRecord;
  publishOfficialCertificates: (certs: CertificateRecord[], options?: { sendEmails?: boolean }) => Promise<{ success: boolean; publishedCount: number; emailSentCount: number }>;
  verifyCertificateCode: (certCode: string) => CertificateRecord | undefined;
  declareRound1Results: () => Promise<{ success: boolean; sentCount: number; message: string }>;
  declareFinalResults: () => Promise<{ success: boolean; sentCount: number; message: string }>;

  // Support & Tickets
  supportTickets: SupportTicket[];
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>) => SupportTicket;
  updateTicketStatus: (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => void;
  activeSupportModal: boolean;
  setActiveSupportModal: (show: boolean) => void;

  // Audit Logs & Announcements & Payments
  auditLogs: AuditLog[];
  addAuditLog: (action: string, module: AuditLog['module'], details: string, extra?: { oldValue?: string; newValue?: string; reason?: string }) => void;
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  payments: PaymentRecord[];

  // Admin Active Tab & Deep-linking Navigation
  adminActiveTab: string;
  setAdminActiveTab: (tab: any) => void;
  targetRequirementSection: string | null;
  targetRequirementClause: string | null;
  setTargetRequirement: (sectionId: string | null, clauseId?: string | null) => void;
  navigateToFeature: (options: {
    view: string;
    tab?: string;
    persona?: UserRole;
    modal?: 'certificate' | 'support' | 'verifier';
    sectionId?: string;
    clauseId?: string;
  }) => void;

  // AI Assistant Chatbot
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  initialChatQuery: string | null;
  openChatWithQuery: (query?: string) => void;

  // Participant (Nominee) Auth
  participantUser: SupabaseParticipantRow | null;
  loginParticipantSession: (participant: SupabaseParticipantRow) => void;
  logoutParticipant: (targetView?: string) => void;
  logoutParticipantSession: (targetView?: string) => void;
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

const STORAGE_KEY = 'AIMA_ICL_2026_STORAGE_V1';

const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [];

export const ADMIN_TAB_TO_SLUG: Record<string, string> = {
  dynamic_registrations: 'registrations',
  quiz_programs: 'quiz-programs',
  quiz_editor: 'quiz-editor',
  quiz_results: 'quiz-results',
  offline_rounds: 'offline-rounds',
  hubs: 'regional-hubs',
  quiz_bank: 'question-bank',
  participants: 'participants',
  overview: 'overview',
  evaluations: 'jury-evaluations',
  case_decks: 'case-decks',
  case_deadlines: 'case-deadlines',
  stages: 'stages',
  institutions: 'institutions',
  sponsors: 'sponsors',
  finances: 'finances',
  announcements: 'announcements',
  audit_logs: 'audit-logs',
  system_settings: 'system-settings',
};

export const ADMIN_SLUG_TO_TAB: Record<string, string> = {
  'dynamic-registrations': 'dynamic_registrations',
  'registrations': 'dynamic_registrations',
  'quiz-programs': 'quiz_programs',
  'quizzes': 'quiz_programs',
  'quiz-editor': 'quiz_editor',
  'quiz_editor': 'quiz_editor',
  'quiz-curator': 'quiz_editor',
  'quiz-results': 'quiz_results',
  'rankings': 'quiz_results',
  'offline-rounds': 'offline_rounds',
  'offline-results': 'offline_rounds',
  'regional-hubs': 'hubs',
  'hubs': 'hubs',
  'quiz-bank': 'quiz_bank',
  'question-bank': 'quiz_bank',
  'participants': 'participants',
  'candidate-roster': 'participants',
  'overview': 'overview',
  'jury-evaluations': 'evaluations',
  'evaluations': 'evaluations',
  'case-decks': 'case_decks',
  'case-deadlines': 'case_deadlines',
  'deadlines': 'case_deadlines',
  'stages': 'stages',
  'institutions': 'institutions',
  'sponsors': 'sponsors',
  'finances': 'finances',
  'announcements': 'announcements',
  'audit-logs': 'audit_logs',
  'system-settings': 'system_settings',
};

export const getInitialAdminTab = (): string => {
  if (typeof window !== 'undefined') {
    const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    if (rawPath.startsWith('/admin/')) {
      const parts = rawPath.split('/').filter(Boolean);
      const subSlug = parts[1] || '';
      if (subSlug) {
        return ADMIN_SLUG_TO_TAB[subSlug] || subSlug.replace(/-/g, '_');
      }
    }
  }
  return 'dynamic_registrations';
};

const getInitialActiveView = (): string => {
  if (typeof window !== 'undefined') {
    const rawPath = window.location.pathname.toLowerCase();
    const path = rawPath.replace(/\/+$/, '') || '/';
    if (path === '/admin' || path.startsWith('/admin/')) {
      return 'admin';
    }
    if (path === '/registration' || path === '/register' || path.startsWith('/registration') || path.startsWith('/register')) {
      return 'registration';
    }
    if (path === '/login' || path === '/participant_login' || path === '/participant-login') {
      return 'participant_login';
    }
    if (path === '/terms' || path === '/terms-and-conditions' || path === '/terms-conditions') {
      return 'terms';
    }
    if (path === '/refund' || path === '/refund-policy' || path === '/cancellation-policy' || path === '/refunds') {
      return 'refund_policy';
    }
    if (path === '/disclaimer' || path === '/disclaimers') {
      return 'disclaimer';
    }
    if (path === '/privacy' || path === '/privacy-policy') {
      return 'privacy_policy';
    }
    if (path === '/contact' || path === '/contact-us' || path === '/contactus') {
      return 'contact_us';
    }
    if (path === '/student' || path === '/student-dashboard' || path === '/workspace') {
      return 'student';
    }
    if (path === '/institute' || path === '/institute-portal' || path === '/institutes') {
      return 'institute';
    }
    if (path === '/evaluator' || path === '/evaluator-dashboard' || path === '/jury') {
      return 'evaluator';
    }
    if (path === '/hub' || path === '/regional-hub' || path === '/regional_hub') {
      return 'regional_hub';
    }
    if (path === '/corporate' || path === '/corporate-partner' || path === '/sponsor') {
      return 'corporate';
    }
    if (path === '/requirements' || path === '/requirements-doc' || path === '/req_doc' || path === '/docs') {
      return 'requirements';
    }
    return 'public';
  }
  return 'public';
};

export const CompetitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState<string>(getInitialActiveView);
  const [config, setConfig] = useState<CompetitionConfig>(() => getLocalConfigCache() || INITIAL_CONFIG);

  // Participant session helpers & storage keys
  const PARTICIPANT_SESSION_KEY = 'AIMA_PARTICIPANT_SESSION_V1';

  function getSavedParticipantSession(): SupabaseParticipantRow | null {
    try {
      const raw = sessionStorage.getItem(PARTICIPANT_SESSION_KEY) || localStorage.getItem(PARTICIPANT_SESSION_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function buildUserProfileFromParticipant(participant: SupabaseParticipantRow): UserProfile {
    const userId = 'participant_' + participant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const teamId = 'team_participant_' + participant.registration_number;
    const cachedReg = getLocalRegistrationsCache().find(
      (r) => r.registrationNumber === participant.registration_number
    );
    const rawData = (cachedReg as any)?.raw_data || {};
    const nominee = (rawData.nominees || []).find(
      (n: any) => n.email && n.email.toLowerCase().trim() === participant.email.toLowerCase().trim()
    );
    const selectedTrackId =
      (participant as any).selected_track_id ||
      (participant as any).selectedTrackId ||
      (cachedReg as any)?.selectedTrackId ||
      rawData.selectedTrackId ||
      nominee?.selectedTrackId;
    const selectedTrackName =
      (participant as any).selected_track_name ||
      (participant as any).selectedTrackName ||
      (cachedReg as any)?.selectedTrackName ||
      rawData.selectedTrackName ||
      nominee?.selectedTrackName;
    const trackSelectedAt =
      (participant as any).track_locked_at ||
      (participant as any).trackSelectedAt ||
      (cachedReg as any)?.trackSelectedAt ||
      rawData.trackSelectedAt ||
      nominee?.trackSelectedAt;

    // If registration has participantCount <= 1 and no teamName, candidate is a solo candidate
    const isSolo = cachedReg
      ? (!cachedReg.teamName && (cachedReg.participantCount || cachedReg.nominees?.length || 1) <= 1)
      : false;
    const isTeamLeader = isSolo ? false : Boolean(participant.is_team_leader);
    const isCoordinator =
      (participant.coordinator_email && participant.email.toLowerCase().trim() === participant.coordinator_email.toLowerCase().trim()) ||
      (participant.program && participant.program.toLowerCase().includes('coordinator')) ||
      (participant as any).role === 'institute_coordinator';

    const userRole: UserRole = isCoordinator
      ? 'institute_coordinator'
      : (isTeamLeader ? 'team_leader' : 'student');

    return {
      id: userId,
      name: participant.name,
      email: participant.email,
      mobile: participant.mobile || '',
      role: userRole,
      isVerified: true,
      gender: 'Other',
      state: '',
      city: '',
      nationality: 'Indian',
      instituteName: participant.institute_name,
      instituteId: 'inst_participant_' + participant.registration_number,
      programme: participant.program || 'Management Programme',
      specialisation: '',
      yearSemester: participant.semester || 'Semester 1',
      expectedGraduation: '2026',
      university: participant.institute_name,
      enrolmentNumber: participant.enrolment_number || '',
      idCardUploaded: true,
      photoUploaded: true,
      hasPaidR1R2: true,
      hasPaidR3: false,
      teamId: teamId,
      registrationNumber: participant.registration_number,
      isTeamLeader: isTeamLeader,
      quizScore: 0,
      quizCompleted: false,
      selectedTrackId,
      selectedTrackName,
      trackSelectedAt,
    };
  }

  function buildSyntheticTeamFromReg(
    reg: CSRBootcampRegistration,
    participant?: SupabaseParticipantRow | null
  ): Team {
    const teamId = 'team_participant_' + reg.registrationNumber;
    const isPaid = reg.paymentStatus === 'PAID';
    const isInst =
      reg.track === 'institutional' ||
      (reg as any).registration_mode === 'institute' ||
      reg.organizationType === 'Academic Institution' ||
      reg.tierId?.startsWith('inst_') ||
      ((reg.participantCount ?? 0) > 4 && !reg.teamName);
    const participantCount = reg.participantCount || reg.nominees?.length || 1;
    const isComplimentary =
      reg.totalPayable === 0 ||
      (reg as any).total_amount === 0 ||
      reg.paymentMethod === 'EARLY_BIRD_COMPLIMENTARY' ||
      (reg as any).payment_method === 'EARLY_BIRD_COMPLIMENTARY' ||
      reg.tierId === 'early_bird_free' ||
      Boolean(reg.tierLabel && /early\s*bird/i.test(reg.tierLabel)) ||
      Boolean((reg as any).fee_tier && /early\s*bird/i.test((reg as any).fee_tier)) ||
      Boolean((reg as any).feeTier && /early\s*bird/i.test((reg as any).feeTier)) ||
      Boolean((reg as any).raw_data?.fee_tier && /early\s*bird/i.test((reg as any).raw_data.fee_tier)) ||
      Boolean((reg as any).raw_data?.tierLabel && /early\s*bird/i.test((reg as any).raw_data.tierLabel));
    const totalAmount = isComplimentary
      ? 0
      : (reg.totalPayable ?? (reg as any).total_amount ?? (reg.ratePerPersonOrPackage ? Math.round(reg.ratePerPersonOrPackage * participantCount) : participantCount * 200));
    const perStudentAmount = isComplimentary ? 0 : (participantCount > 0 ? Math.round(totalAmount / participantCount) : 0);

    const teamMembers: TeamMember[] = (reg.nominees && reg.nominees.length > 0)
      ? reg.nominees.map((n) => {
        const paymentLabel = isPaid
          ? (isComplimentary ? 'Early Bird (₹0)' : isInst ? 'Institute Paid' : `Paid ₹${perStudentAmount.toLocaleString('en-IN')}`)
          : (isInst ? 'Invoice Pending' : `Pending ₹${perStudentAmount.toLocaleString('en-IN')}`);
        return {
          studentId: 'participant_' + n.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
          name: n.name,
          email: n.email,
          mobile: n.mobile || '',
          institute: reg.organizationName,
          isLeader: !!n.isTeamLeader,
          hasPaid: isPaid,
          acceptedDeclaration: true,
          roleInTeam: n.isTeamLeader ? 'Team Leader' : 'Member',
          paymentLabel,
          paymentStatus: reg.paymentStatus,
          amount: perStudentAmount,
        };
      })
      : participant
        ? [{
          studentId: 'participant_' + participant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
          name: participant.name,
          email: participant.email,
          mobile: participant.mobile || '',
          institute: reg.organizationName || participant.institute_name,
          isLeader: participant.is_team_leader,
          hasPaid: isPaid,
          acceptedDeclaration: true,
          roleInTeam: participant.is_team_leader ? 'Team Leader' : 'Member',
          paymentLabel: isPaid
            ? (isComplimentary ? 'Early Bird (₹0)' : isInst ? 'Institute Paid' : `Paid ₹${perStudentAmount.toLocaleString('en-IN')}`)
            : (isInst ? 'Invoice Pending' : `Pending ₹${perStudentAmount.toLocaleString('en-IN')}`),
          paymentStatus: reg.paymentStatus,
          amount: perStudentAmount,
        }]
        : [];

    const leaderMember = teamMembers.find((m) => m.isLeader) || teamMembers[0];

    const rawData = (reg as any).raw_data || {};
    const participantNominee = (rawData.nominees || []).find(
      (n: any) => participant && n.email && n.email.toLowerCase().trim() === participant.email.toLowerCase().trim()
    );
    const selectedTrackId =
      (participant as any)?.selected_track_id ||
      (participant as any)?.selectedTrackId ||
      (reg as any).selectedTrackId ||
      (reg as any).selected_track_id ||
      rawData.selectedTrackId ||
      participantNominee?.selectedTrackId;
    const selectedTrackName =
      (participant as any)?.selected_track_name ||
      (participant as any)?.selectedTrackName ||
      (reg as any).selectedTrackName ||
      (reg as any).selected_track_name ||
      rawData.selectedTrackName ||
      participantNominee?.selectedTrackName;
    const trackSelectedAt =
      (participant as any)?.track_locked_at ||
      (participant as any)?.trackSelectedAt ||
      (reg as any).trackSelectedAt ||
      (reg as any).track_locked_at ||
      rawData.trackSelectedAt ||
      participantNominee?.trackSelectedAt;

    return {
      id: teamId,
      name: reg.teamName || (isInst ? `${reg.organizationName} Delegation` : (participantCount > 1 ? `${reg.organizationName} Team` : 'Individual Entry')),
      inviteCode: reg.registrationNumber,
      leaderId: leaderMember?.studentId || (participant ? 'participant_' + participant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'leader_1'),
      leaderName: leaderMember?.name || participant?.name || 'Team Leader',
      instituteName: reg.organizationName || participant?.institute_name || '',
      members: teamMembers,
      isLocked: teamMembers.length >= 4 || Boolean(rawData.isLocked || (reg as any).isLocked),
      createdAt: reg.createdAt || new Date().toISOString(),
      assignedHub: 'north' as any,
      paymentStatus: reg.paymentStatus,
      invoiceNumber: reg.invoiceNumber,
      registrationMode: isInst ? 'institute' : (reg.teamName ? 'team' : 'individual'),
      feeTier: reg.tierLabel || (isInst ? `Institutional Pack (${participantCount} participants)` : (isComplimentary ? 'Early Bird Complimentary (₹0)' : 'Team/Individual')),
      totalAmount: totalAmount,
      subtotalAmount: reg.subtotalExclGst || Math.round(totalAmount / 1.18),
      gstAmount: reg.gstAmount || Math.round(totalAmount - totalAmount / 1.18),
      participantCount: participantCount,
      maxMembers: Math.max(participantCount, 4),
      selectedTrackId,
      selectedTrackName,
      trackSelectedAt,
    };
  }

  const initialParticipant = getSavedParticipantSession();
  const [participantUser, setParticipantUser] = useState<SupabaseParticipantRow | null>(initialParticipant);

  const [users, setUsers] = useState<UserProfile[]>(() => {
    if (initialParticipant) {
      const pProfile = buildUserProfileFromParticipant(initialParticipant);
      return [pProfile, ...MOCK_USERS.filter((u) => u.email !== pProfile.email)];
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    if (initialParticipant) {
      return buildUserProfileFromParticipant(initialParticipant);
    }
    return MOCK_USERS[0];
  });

  const [teams, setTeams] = useState<Team[]>(() => {
    if (initialParticipant) {
      const cached = getLocalRegistrationsCache().find(
        (r) => r.registrationNumber === initialParticipant.registration_number
      );
      if (cached) {
        return [buildSyntheticTeamFromReg(cached, initialParticipant), ...MOCK_TEAMS];
      }
      const tempTeam: Team = {
        id: 'team_participant_' + initialParticipant.registration_number,
        name: `${initialParticipant.institute_name} Team`,
        inviteCode: initialParticipant.registration_number,
        leaderId: 'participant_' + initialParticipant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
        leaderName: initialParticipant.name,
        instituteName: initialParticipant.institute_name,
        members: [
          {
            studentId: 'participant_' + initialParticipant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
            name: initialParticipant.name,
            email: initialParticipant.email,
            mobile: initialParticipant.mobile || '',
            institute: initialParticipant.institute_name,
            isLeader: initialParticipant.is_team_leader,
            hasPaid: true,
            acceptedDeclaration: true,
            roleInTeam: initialParticipant.is_team_leader ? 'Team Leader' : 'Member',
          },
        ],
        isLocked: false,
        createdAt: initialParticipant.created_at || new Date().toISOString(),
        assignedHub: 'north' as any,
        paymentStatus: 'PAID',
        selectedTrackId: (initialParticipant as any)?.selected_track_id || (initialParticipant as any)?.selectedTrackId,
        selectedTrackName: (initialParticipant as any)?.selected_track_name || (initialParticipant as any)?.selectedTrackName,
        trackSelectedAt: (initialParticipant as any)?.track_locked_at || (initialParticipant as any)?.trackSelectedAt,
      };
      return [tempTeam, ...MOCK_TEAMS];
    }
    return MOCK_TEAMS;
  });

  const [isQuizActive, setIsQuizActive] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('subview') === 'quiz') return true;
        const saved = sessionStorage.getItem('AIMA_STUDENT_ACTIVE_SUBVIEW');
        if (saved && JSON.parse(saved)?.subView === 'quiz') return true;
      }
    } catch { }
    return false;
  });

  const [quizPrograms, setQuizPrograms] = useState<QuizProgram[]>([]);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [programQuestionMappings, setProgramQuestionMappings] = useState<Record<string, string[]>>({});
  const [aiEvaluations, setAiEvaluations] = useState<Record<string, any>>({});
  const [hubs, setHubs] = useState<RegionalHub[]>(REGIONAL_HUBS);
  const [institutions, setInstitutions] = useState<InstitutionalProfile[]>(MOCK_INSTITUTIONS);
  const [sponsors, setSponsors] = useState<CorporateSponsor[]>(MOCK_SPONSORS);
  const [rubricR2, setRubricR2] = useState<RubricCriterion[]>(ROUND_2_RUBRIC);
  const [rubricR3, setRubricR3] = useState<RubricCriterion[]>(ROUND_3_RUBRIC);
  const [rubricR4, setRubricR4] = useState<RubricCriterion[]>(ROUND_4_RUBRIC);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(MOCK_EVALUATIONS);
  const [certificates, setCertificates] = useState<CertificateRecord[]>(() => {
    try {
      const cached = localStorage.getItem('aima_published_certificates');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading aima_published_certificates from localStorage', e);
    }
    return MOCK_CERTIFICATES;
  });
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);
  const [offlineRoundResults, setOfflineRoundResults] = useState<OfflineRoundResult[]>(MOCK_OFFLINE_ROUND_RESULTS);

  // Modals & Chatbot
  const [activeCertificateModal, setActiveCertificateModal] = useState<CertificateRecord | null>(null);
  const [activeVerifierModal, setActiveVerifierModal] = useState<boolean>(false);
  const [activeSupportModal, setActiveSupportModal] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [registrationModalTrack, setRegistrationModalTrack] = useState<'team' | 'institute'>('team');
  const [csrRegistrations, setCsrRegistrations] = useState<CSRBootcampRegistration[]>([]);
  const [csrEmailLogs, setCsrEmailLogs] = useState<CSREmailLog[]>(MOCK_CSR_EMAIL_LOGS);
  const [adminActiveTab, setAdminActiveTab] = useState<string>(getInitialAdminTab);
  const [targetRequirementSection, setTargetRequirementSection] = useState<string | null>(null);
  const [targetRequirementClause, setTargetRequirementClause] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);

  // Async helper to fully sync participant registration and peers from Supabase
  const syncParticipantData = async (participant: SupabaseParticipantRow) => {
    try {
      const regNumber = participant.registration_number;
      const teamId = 'team_participant_' + regNumber;

      // Authoritative track selection from DB (jury_evaluations, participants, registrations)
      const trackData = await fetchParticipantTrackSelection(regNumber, participant.email);
      const lockedTrackId = trackData?.trackId || (participant as any).selected_track_id || (participant as any).selectedTrackId;
      const lockedTrackName = trackData?.trackName || (participant as any).selected_track_name || (participant as any).selectedTrackName;
      const lockedTrackAt = trackData?.trackSelectedAt || (participant as any).track_locked_at || (participant as any).trackSelectedAt;

      if (lockedTrackId) {
        const updatedPart = {
          ...participant,
          selected_track_id: lockedTrackId,
          selected_track_name: lockedTrackName,
          track_locked_at: lockedTrackAt,
        };
        setParticipantUser(updatedPart as any);
        try {
          const serialized = JSON.stringify(updatedPart);
          sessionStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
          localStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
        } catch { }
      }

      // 1. Fetch full registration record
      const reg = await fetchRegistrationByNumber(regNumber);
      if (reg && reg.nominees && reg.nominees.length > 0) {
        const synTeam = buildSyntheticTeamFromReg(reg, {
          ...participant,
          ...(lockedTrackId ? { selected_track_id: lockedTrackId, selected_track_name: lockedTrackName, track_locked_at: lockedTrackAt } : {}),
        } as any);
        if (lockedTrackId) {
          synTeam.selectedTrackId = lockedTrackId;
          synTeam.selectedTrackName = lockedTrackName;
          synTeam.trackSelectedAt = lockedTrackAt;
        }
        setTeams((prev) => [synTeam, ...prev.filter((t) => t.id !== teamId)]);
        setCurrentUser((prev) => ({
          ...prev,
          teamId,
          hasPaidR1R2: reg.paymentStatus === 'PAID',
          selectedTrackId: synTeam.selectedTrackId || lockedTrackId,
          selectedTrackName: synTeam.selectedTrackName || lockedTrackName,
          trackSelectedAt: synTeam.trackSelectedAt || lockedTrackAt,
        }));
        return;
      }

      // 2. Fallback: fetch participant peers from participants table
      const peers = await fetchParticipantsByRegistration(regNumber);
      if (peers && peers.length > 0) {
        const teamMembers: TeamMember[] = peers.map((p) => ({
          studentId: 'participant_' + p.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
          name: p.name,
          email: p.email,
          mobile: p.mobile || '',
          institute: p.institute_name,
          isLeader: p.is_team_leader,
          hasPaid: true,
          acceptedDeclaration: true,
          roleInTeam: p.is_team_leader ? 'Team Leader' : 'Member',
        }));
        const leader = teamMembers.find((m) => m.isLeader) || teamMembers[0];
        const synTeam: Team = {
          id: teamId,
          name: `${participant.institute_name} Team`,
          inviteCode: regNumber,
          leaderId: leader?.studentId || ('participant_' + participant.email.replace(/[^a-z0-9]/gi, '_').toLowerCase()),
          leaderName: leader?.name || participant.name,
          instituteName: participant.institute_name,
          members: teamMembers,
          isLocked: teamMembers.length >= 4,
          createdAt: participant.created_at || new Date().toISOString(),
          assignedHub: 'north' as any,
          paymentStatus: 'PAID',
          selectedTrackId: lockedTrackId,
          selectedTrackName: lockedTrackName,
          trackSelectedAt: lockedTrackAt,
        };
        setTeams((prev) => [synTeam, ...prev.filter((t) => t.id !== teamId)]);
        setCurrentUser((prev) => ({
          ...prev,
          teamId,
          selectedTrackId: lockedTrackId || prev.selectedTrackId,
          selectedTrackName: lockedTrackName || prev.selectedTrackName,
          trackSelectedAt: lockedTrackAt || prev.trackSelectedAt,
        }));
        return;
      }

      if (lockedTrackId) {
        setCurrentUser((prev) => ({
          ...prev,
          selectedTrackId: lockedTrackId,
          selectedTrackName: lockedTrackName,
          trackSelectedAt: lockedTrackAt,
        }));
        setTeams((prev) =>
          prev.map((t) =>
            t.id === teamId || t.inviteCode === regNumber
              ? {
                ...t,
                selectedTrackId: lockedTrackId,
                selectedTrackName: lockedTrackName,
                trackSelectedAt: lockedTrackAt,
              }
              : t
          )
        );
      }
    } catch (err) {
      console.warn('Sync participant data notice:', err);
    }
  };

  // On mount: if participant session exists, sync newest data from Supabase
  useEffect(() => {
    if (participantUser) {
      syncParticipantData(participantUser);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Round 1 Quiz Sub-system: Dynamic Mount Fetch Hooks with Live DB Data ──
  useEffect(() => {
    fetchQuizPrograms()
      .then((data) => {
        if (Array.isArray(data)) {
          setQuizPrograms(data);
        }
      })
      .catch((err) => {
        console.warn('Error loading quiz programs:', err);
      });

    fetchQuizQuestionsPublic()
      .then((data) => {
        if (Array.isArray(data)) {
          setQuestions(data);
        }
      })
      .catch((err) => {
        console.warn('Error loading quiz questions:', err);
      });

    refreshQuizAttempts();
  }, []);

  const refreshQuizAttempts = async () => {
    try {
      const attempts = await fetchLeaderboard();
      let merged = Array.isArray(attempts) ? [...attempts] : [];
      try {
        const cachedStr = localStorage.getItem('aima_quiz_attempts_all');
        if (cachedStr) {
          const cachedAttempts: QuizAttempt[] = JSON.parse(cachedStr);
          const existingIds = new Set(merged.map(m => m.studentId || m.userId || m.attemptId));
          cachedAttempts.forEach(c => {
            const key = c.studentId || c.userId || c.attemptId;
            if (key && !existingIds.has(key)) {
              merged.push(c);
            }
          });
        }
      } catch (e) {
        // ignore
      }
      setQuizAttempts(merged);
    } catch (err) {
      console.warn('refreshQuizAttempts error:', err);
      try {
        const cachedStr = localStorage.getItem('aima_quiz_attempts_all');
        if (cachedStr) {
          setQuizAttempts(JSON.parse(cachedStr));
          return;
        }
      } catch (e) {
        // ignore
      }
      setQuizAttempts([]);
    }
  };

  const refreshQuizPrograms = async () => {
    try {
      const progs = await fetchQuizPrograms();
      if (Array.isArray(progs)) {
        setQuizPrograms(progs);
      }
    } catch (err) {
      console.warn('refreshQuizPrograms error:', err);
    }
  };

  const loginParticipantSession = (participant: SupabaseParticipantRow) => {
    // 1. Save session to storage
    setParticipantUser(participant);
    try {
      const serialized = JSON.stringify(participant);
      sessionStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
      localStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
    } catch {
      // quota exceeded; ignore
    }

    // 2. Build profile and set currentUser immediately
    const userProfile = buildUserProfileFromParticipant(participant);
    setCurrentUser(userProfile);
    setUsers((prev) => [userProfile, ...prev.filter((u) => u.email !== userProfile.email)]);

    // 3. Immediately build team from local cache if available
    const cached = getLocalRegistrationsCache().find(
      (r) => r.registrationNumber === participant.registration_number
    );
    if (cached) {
      const synTeam = buildSyntheticTeamFromReg(cached, participant);
      setTeams((prev) => [synTeam, ...prev.filter((t) => t.id !== synTeam.id)]);
    }

    // 4. Async sync full Supabase registration and peers
    syncParticipantData(participant);

    // 5. Navigate to appropriate portal immediately
    if (userProfile.role === 'institute_coordinator') {
      setActiveView('institute');
    } else {
      setActiveView('student');
    }
  };

  const logoutParticipant = (targetView: string = 'participant_login') => {
    setParticipantUser(null);
    setCurrentUser(MOCK_USERS[0]);
    setTeams((prev) => prev.filter((t) => !t.id.startsWith('team_participant_')));
    try {
      sessionStorage.removeItem(PARTICIPANT_SESSION_KEY);
      localStorage.removeItem(PARTICIPANT_SESSION_KEY);
      sessionStorage.removeItem('AIMA_STUDENT_ACTIVE_SUBVIEW');
      sessionStorage.removeItem('AIMA_USER_PROFILE');
      localStorage.removeItem('AIMA_USER_PROFILE');
      supabase.auth.signOut().catch(() => { });
    } catch {
      // ignore
    }
    setActiveView(targetView);
    if (typeof window !== 'undefined') {
      try {
        const nextUrl = targetView === 'public' ? '/' : '/login';
        window.history.pushState({}, '', nextUrl);
      } catch {
        // ignore
      }
    }
  };


  const openRegistrationModal = (track: 'team' | 'institute' = 'team') => {
    setRegistrationModalTrack(track);
    setActiveView('registration');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const setTargetRequirement = (sectionId: string | null, clauseId?: string | null) => {
    setTargetRequirementSection(sectionId);
    setTargetRequirementClause(clauseId || null);
  };

  const openChatWithQuery = (query?: string) => {
    if (query) {
      setInitialChatQuery(query);
    }
    setIsChatOpen(true);
  };

  const navigateToFeature = (options: {
    view: string;
    tab?: string;
    persona?: UserRole;
    modal?: 'certificate' | 'support' | 'verifier';
    sectionId?: string;
    clauseId?: string;
  }) => {
    if (options.persona) {
      switchRole(options.persona);
    }
    if (options.tab) {
      setAdminActiveTab(options.tab);
    }
    if (options.sectionId || options.clauseId) {
      setTargetRequirementSection(options.sectionId || null);
      setTargetRequirementClause(options.clauseId || null);
    }
    if (options.view) {
      setActiveView(options.view);
    }
    if (options.modal === 'verifier') {
      setActiveVerifierModal(true);
    } else if (options.modal === 'support') {
      setActiveSupportModal(true);
    } else if (options.modal === 'certificate') {
      if (certificates.length > 0) {
        setActiveCertificateModal(certificates[0]);
      }
    }
    // Only scroll to top if not deep-linking to a specific requirement clause or section
    if (options.view !== 'requirements' || (!options.sectionId && !options.clauseId)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Load / Save from LocalStorage with Light Mode default
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('AIMA_THEME') as 'light' | 'dark' | null;
      // Light mode is default across the project
      const initial = savedTheme === 'dark' ? 'dark' : 'light';
      setTheme(initial);
      if (initial === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {
      document.documentElement.classList.remove('dark');
      setTheme('light');
    }
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Live Competition Configuration Fetch & Realtime Synchronizer
  useEffect(() => {
    let isMounted = true;

    async function loadLiveConfig() {
      try {
        const live = await fetchCompetitionConfigFromSupabase();
        if (live && isMounted) {
          setConfig(prev => ({ ...prev, ...live }));
        }
      } catch (err) {
        console.warn('Initial competition config fetch notice:', err);
      }
    }

    loadLiveConfig();

    // Subscribe to Supabase Realtime changes on public:competition_config
    const channel = supabase
      .channel('competition_config_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: DB_SCHEMA, table: 'competition_config' },
        (payload: any) => {
          if (payload?.new && isMounted) {
            const mapped = mapSupabaseRowToAppConfig(payload.new);
            setConfig(prev => {
              const updated = { ...prev, ...mapped };
              saveLocalConfigCache(updated);
              return updated;
            });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // Sync URL route with activeView & adminActiveTab & reset scroll to top of page
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const currentPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
    const isRegView = activeView === 'registration' || activeView === 'register' || activeView === 'bootcamp_registration';

    if (activeView === 'admin') {
      const adminSlug = ADMIN_TAB_TO_SLUG[adminActiveTab] || adminActiveTab.replace(/_/g, '-');
      const targetAdminPath = `/admin/${adminSlug}`;
      if (currentPath !== targetAdminPath) {
        window.history.pushState({ view: 'admin', tab: adminActiveTab }, '', targetAdminPath);
      }
    } else if (isRegView) {
      if (currentPath !== '/registration') {
        window.history.pushState({ view: 'registration' }, '', '/registration');
      }
    } else if (activeView === 'participant_login' || activeView === 'login') {
      if (currentPath !== '/participant-login' && currentPath !== '/login') {
        window.history.pushState({ view: 'login' }, '', '/participant-login');
      }
    } else if (activeView === 'terms' || activeView === 'terms_conditions') {
      if (currentPath !== '/terms-and-conditions' && currentPath !== '/terms') {
        window.history.pushState({ view: 'terms' }, '', '/terms-and-conditions');
      }
    } else if (activeView === 'refund_policy') {
      if (currentPath !== '/refund-policy' && currentPath !== '/refund') {
        window.history.pushState({ view: 'refund_policy' }, '', '/refund-policy');
      }
    } else if (activeView === 'disclaimer') {
      if (currentPath !== '/disclaimer' && currentPath !== '/disclaimers') {
        window.history.pushState({ view: 'disclaimer' }, '', '/disclaimer');
      }
    } else if (activeView === 'privacy_policy') {
      if (currentPath !== '/privacy-policy' && currentPath !== '/privacy') {
        window.history.pushState({ view: 'privacy_policy' }, '', '/privacy-policy');
      }
    } else if (activeView === 'contact_us' || activeView === 'contact') {
      if (currentPath !== '/contact-us' && currentPath !== '/contact') {
        window.history.pushState({ view: 'contact_us' }, '', '/contact-us');
      }
    } else if (activeView === 'student') {
      if (currentPath !== '/student-dashboard' && currentPath !== '/student') {
        window.history.pushState({ view: 'student' }, '', '/student-dashboard');
      }
    } else if (activeView === 'institute') {
      if (currentPath !== '/institute-portal' && currentPath !== '/institute') {
        window.history.pushState({ view: 'institute' }, '', '/institute-portal');
      }
    } else if (activeView === 'evaluator') {
      if (currentPath !== '/evaluator-dashboard' && currentPath !== '/evaluator') {
        window.history.pushState({ view: 'evaluator' }, '', '/evaluator-dashboard');
      }
    } else if (activeView === 'regional_hub') {
      if (currentPath !== '/regional-hub' && currentPath !== '/hub') {
        window.history.pushState({ view: 'regional_hub' }, '', '/regional-hub');
      }
    } else if (activeView === 'corporate') {
      if (currentPath !== '/corporate-partner' && currentPath !== '/corporate') {
        window.history.pushState({ view: 'corporate' }, '', '/corporate-partner');
      }
    } else if (activeView === 'requirements' || activeView === 'req_doc') {
      if (currentPath !== '/requirements-doc' && currentPath !== '/requirements') {
        window.history.pushState({ view: 'requirements' }, '', '/requirements-doc');
      }
    } else if (activeView === 'public') {
      if (currentPath !== '/' && currentPath !== '') {
        window.history.pushState({ view: 'public' }, '', '/');
      }
    }
  }, [activeView, adminActiveTab]);

  // Handle browser back / forward navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePopState = () => {
      const path = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';
      if (path === '/admin' || path.startsWith('/admin/')) {
        setActiveView('admin');
        const parts = path.split('/').filter(Boolean);
        const subSlug = parts[1] || '';
        if (subSlug) {
          const tab = ADMIN_SLUG_TO_TAB[subSlug] || subSlug.replace(/-/g, '_');
          setAdminActiveTab(tab);
        }
      } else if (path === '/registration' || path === '/register' || path.startsWith('/registration') || path.startsWith('/register')) {
        setActiveView('registration');
      } else if (path === '/login' || path === '/participant_login' || path === '/participant-login') {
        setActiveView('participant_login');
      } else if (path === '/terms' || path === '/terms-and-conditions' || path === '/terms-conditions') {
        setActiveView('terms');
      } else if (path === '/refund' || path === '/refund-policy' || path === '/cancellation-policy' || path === '/refunds') {
        setActiveView('refund_policy');
      } else if (path === '/disclaimer' || path === '/disclaimers') {
        setActiveView('disclaimer');
      } else if (path === '/privacy' || path === '/privacy-policy') {
        setActiveView('privacy_policy');
      } else if (path === '/contact' || path === '/contact-us' || path === '/contactus') {
        setActiveView('contact_us');
      } else if (path === '/student' || path === '/student-dashboard' || path === '/workspace') {
        setActiveView('student');
      } else if (path === '/institute' || path === '/institute-portal' || path === '/institutes') {
        setActiveView('institute');
      } else if (path === '/evaluator' || path === '/evaluator-dashboard' || path === '/jury') {
        setActiveView('evaluator');
      } else if (path === '/hub' || path === '/regional-hub' || path === '/regional_hub') {
        setActiveView('regional_hub');
      } else if (path === '/corporate' || path === '/corporate-partner' || path === '/sponsor') {
        setActiveView('corporate');
      } else if (path === '/requirements' || path === '/requirements-doc' || path === '/req_doc' || path === '/docs') {
        setActiveView('requirements');
      } else if (path === '/' || path === '') {
        setActiveView('public');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Hydrate registrations dynamically from Supabase & cached storage
  useEffect(() => {
    let isMounted = true;
    fetchRegistrationsFromSupabase()
      .then((res) => {
        if (!isMounted) return;
        if (res.registrations && res.registrations.length >= 0) {
          setCsrRegistrations(res.registrations);

          // Extract saved offline jury results from Supabase registrations raw_data
          const savedOfflineResults: OfflineRoundResult[] = [];
          res.registrations.forEach(r => {
            const raw = (r as any).raw_data || {};
            if (Array.isArray(raw.offlineRoundResults)) {
              savedOfflineResults.push(...raw.offlineRoundResults);
            }
          });
          if (savedOfflineResults.length > 0) {
            setOfflineRoundResults(prev => {
              const ids = new Set(savedOfflineResults.map(s => s.id));
              return [...savedOfflineResults, ...prev.filter(p => !ids.has(p.id))];
            });
          }

          // Authoritatively hydrate saved evaluations from dedicated jury_evaluations table
          fetchJuryEvaluationsFromDb('round_2')
            .then(juryRows => {
              if (isMounted && Array.isArray(juryRows) && juryRows.length > 0) {
                const mappedJuryResults: OfflineRoundResult[] = juryRows.map(d => {
                  const kpiSum =
                    (Number(d.problem_identification) || 0) +
                    (Number(d.case_question_1) || 0) +
                    (Number(d.case_question_2) || 0) +
                    (Number(d.case_question_3) || 0) +
                    (Number(d.strategic_alternatives) || 0) +
                    (Number(d.execution_plan) || 0) +
                    (Number(d.case_data_evidence) || 0);

                  const totalScore =
                    d.total_score !== undefined && d.total_score !== null && Number(d.total_score) > 0
                      ? Number(d.total_score)
                      : kpiSum;

                  return {
                    id: d.id || `jury_${d.registration_number || d.team_id}`,
                    teamId: d.team_id || '',
                    registrationNumber: d.registration_number || '',
                    teamName: d.team_name || d.candidate_name || 'Team Entry',
                    instituteName: d.institute_name || '',
                    round: d.round || 'round_2',
                    trackId: d.track_id,
                    trackName: d.track_name || 'Supply Chain & Energy Risk',
                    trackBadge: d.track_badge,
                    masterCaseTitle: d.master_case_title,
                    offlineQuizScore: 0,
                    livePresentationScore: totalScore,
                    presentationMaxMarks: 100,
                    qaDefenseScore: Number(d.case_question_3) || 0,
                    aggregateScore: totalScore,
                    rank: 1,
                    attendanceVerified: d.attendance_verified !== false,
                    qualifiedNextRound: d.is_qualified ?? totalScore >= 60,
                    notes: d.jury_feedback || '',
                    evaluatedBy: d.evaluated_by || 'AIMA National Jury Panel',
                    uploadedAt: d.evaluated_at || new Date().toISOString(),
                  };
                });

                setOfflineRoundResults(prev => {
                  const incomingKeys = new Set(
                    mappedJuryResults.map(m => m.registrationNumber || m.teamId || m.id)
                  );
                  return [
                    ...mappedJuryResults,
                    ...prev.filter(
                      p => !incomingKeys.has((p as any).registrationNumber || p.teamId || p.id)
                    ),
                  ];
                });
              }
            })
            .catch(err => console.warn('Hydrate jury evaluations notice:', err));

          // Build real teams from Supabase registrations
          if (res.registrations.length > 0) {
            const realTeams = res.registrations.map(r => buildSyntheticTeamFromReg(r));
            setTeams(prev => {
              const realIds = new Set(realTeams.map(t => t.id));
              return [...realTeams, ...prev.filter(t => !realIds.has(t.id))];
            });
          }
        }
      })
      .catch((err) => {
        console.warn('Initial Supabase sync notice:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Hydrate Quiz Programs, Questions, Attempts, and Program-to-Question Mappings
  useEffect(() => {
    let isMounted = true;

    async function hydrateQuizSubsystem() {
      try {
        const [progs, qs, attempts, mappings] = await Promise.all([
          fetchQuizPrograms(),
          fetchQuizQuestionsAdmin(),
          fetchLeaderboard(),
          fetchAllProgramQuestionMappings(),
        ]);

        if (!isMounted) return;

        if (Array.isArray(progs)) {
          setQuizPrograms(progs);
        }

        if (Array.isArray(qs)) {
          setQuestions(qs);
        }

        if (Array.isArray(attempts)) {
          setQuizAttempts(attempts);
        }

        if (mappings && Object.keys(mappings).length > 0) {
          setProgramQuestionMappings(mappings);
        }
      } catch (err: any) {
        console.warn('Quiz subsystem hydration notice:', err?.message);
      }
    }

    hydrateQuizSubsystem();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('AIMA_THEME', next);
      if (next === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const addAuditLog = (
    action: string,
    module: AuditLog['module'],
    details: string,
    extra?: { oldValue?: string; newValue?: string; reason?: string }
  ) => {
    const newLog: AuditLog = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      details,
      ipAddress: '106.51.242.' + Math.floor(Math.random() * 200 + 10),
      ...extra,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const switchRole = (role: UserRole) => {
    let foundUser = users.find(u => u.role === role);
    // If looking for a student/participant persona, find corresponding student, team leader, or member
    if (!foundUser && (role === 'student' || role === 'team_leader' || role === 'team_member')) {
      foundUser = users.find(u => u.role === 'team_leader') || users.find(u => u.role === 'student') || users.find(u => u.role === 'team_member');
    }
    if (foundUser) {
      setCurrentUser(foundUser);
    } else {
      // create synthetic user for role with complete, non-blank details
      const newUser: UserProfile = {
        id: 'usr_' + role + '_' + Date.now(),
        name: role === 'student' ? 'Rohan Verma' : role.replace('_', ' ').toUpperCase() + ' User',
        email: `${role}@aima-icrc.in`,
        mobile: '+91 98765 00000',
        role: role,
        isVerified: true,
        gender: 'Male',
        state: 'Delhi NCR',
        city: 'New Delhi',
        nationality: 'Indian',
        instituteName: 'Faculty of Management Studies (FMS), University of Delhi',
        instituteId: 'inst_fms',
        programme: 'Master of Business Administration (Full Time)',
        specialisation: 'Operations & Strategy Consulting',
        yearSemester: 'Year 2 / Semester 4',
        expectedGraduation: '2027',
        university: 'University of Delhi',
        enrolmentNumber: 'FMS-MBA-2025-044',
        idCardUploaded: true,
        photoUploaded: true,
        hasPaidR1R2: true,
        hasPaidR3: true,
        teamId: 'team_stratapex',
        assignedHub: 'north',
        quizScore: 90,
        quizCompleted: true,
        quizRank: 7,
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
    }

    // Auto set appropriate view
    if (role === 'admin') setActiveView('admin');
    else if (role === 'evaluator') setActiveView('evaluator');
    else if (role === 'institute_coordinator') setActiveView('institute');
    else if (role === 'regional_hub') setActiveView('regional_hub');
    else if (role === 'corporate_partner') setActiveView('corporate');
    else setActiveView('student');

    addAuditLog('Role Switched', 'System', `Switched active persona to ${role}`);
  };

  const updateConfig = async (newConfig: Partial<CompetitionConfig>) => {
    const prevConfig = { ...config };

    // 1. Optimistic Local Update & Cache
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      saveLocalConfigCache(updated);
      return updated;
    });

    // 2. Synchronize via Secure Server API with Bounded Retries & Rollback
    try {
      const res = await updateCompetitionConfigViaServer(newConfig, 2);
      if (res.success) {
        if (res.audit) {
          addAuditLog(
            res.audit.action,
            'System',
            res.audit.details,
            { oldValue: JSON.stringify(res.changedFields || {}) }
          );
        }
        if (res.config) {
          const mapped = mapSupabaseRowToAppConfig(res.config);
          setConfig(prev => ({ ...prev, ...mapped }));
          saveLocalConfigCache({ ...config, ...mapped });
        }
      } else {
        console.error('Server rejected stage gate override, rolling back:', res.error);
        // Rollback state & cache
        setConfig(prevConfig);
        saveLocalConfigCache(prevConfig);
        alert(`Stage Gate Update Failed: ${res.error || 'Server rejected changes. Ensure you are signed in as an administrator.'}`);
      }
    } catch (err: any) {
      console.error('Network exception updating competition config, rolling back:', err);
      setConfig(prevConfig);
      saveLocalConfigCache(prevConfig);
      alert('Network Error: Unable to synchronize phase changes with server. Reverting to previous state.');
    }
  };

  const userTeam = teams.find(t => t.id === currentUser.teamId || t.members?.some(m => m.studentId === currentUser.id));

  const updateUserProfile = (data: Partial<UserProfile>) => {
    setCurrentUser(prev => {
      const updated = { ...prev, ...data };
      setUsers(all => all.map(u => (u.id === prev.id ? updated : u)));
      addAuditLog('Profile Updated', 'Registration', `Updated user personal/academic details for ${updated.name}`);
      return updated;
    });
  };

  const createTeam = (name: string, preferredHub?: RegionHubId): { success: boolean; message: string; team?: Team } => {
    if (!currentUser.hasPaidR1R2) {
      return { success: false, message: 'Please complete registration fee payment of ₹200 before creating a team.' };
    }
    const teamId = 'team_' + Math.random().toString(36).substring(2, 9);
    const code = 'ICL-' + name.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const assignedHub = preferredHub || currentUser.assignedHub || 'south';

    const newTeam: Team = {
      id: teamId,
      name,
      inviteCode: code,
      leaderId: currentUser.id,
      leaderName: currentUser.name,
      instituteName: currentUser.instituteName || 'Autonomous Institute',
      assignedHub,
      preferredHub,
      isLocked: false,
      createdAt: new Date().toISOString(),
      members: [
        {
          studentId: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          mobile: currentUser.mobile,
          institute: currentUser.instituteName || '',
          isLeader: true,
          hasPaid: true,
          acceptedDeclaration: true,
          roleInTeam: 'Team Leader',
        },
      ],
    };

    setTeams(prev => [newTeam, ...prev]);
    updateUserProfile({ teamId, isTeamLeader: true, role: 'team_leader', assignedHub });
    addAuditLog('Team Created', 'Team', `Created team "${name}" with code ${code}`);
    return { success: true, message: `Team "${name}" created successfully with invite code ${code}!`, team: newTeam };
  };

  const joinTeam = (inviteCode: string): { success: boolean; message: string } => {
    const found = teams.find(t => t.inviteCode.trim().toUpperCase() === inviteCode.trim().toUpperCase());
    if (!found) {
      return { success: false, message: 'Invalid team invitation code. Please verify with your team leader.' };
    }
    if ((found.members?.length || 0) >= 4) {
      return { success: false, message: 'Team is already at maximum capacity (4 members).' };
    }
    if (found.isLocked && (found.members?.length || 0) >= 4) {
      return { success: false, message: 'Team roster has been locked by the leader or admin.' };
    }
    if (found.members?.some(m => m.studentId === currentUser.id || m.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim())) {
      return { success: false, message: 'You are already a member of this team.' };
    }

    const updatedMembers = [
      ...(found.members || []),
      {
        studentId: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        mobile: currentUser.mobile,
        institute: currentUser.instituteName || 'Business School',
        isLeader: false,
        hasPaid: currentUser.hasPaidR1R2 || false,
        acceptedDeclaration: true,
        roleInTeam: 'Team Member',
      },
    ];

    const isNowLocked = updatedMembers.length >= 4;
    const updatedTeam = { ...found, members: updatedMembers, isLocked: isNowLocked };
    setTeams(prev => prev.map(t => (t.id === found.id ? updatedTeam : t)));
    updateUserProfile({ teamId: found.id, isTeamLeader: false, role: 'team_member', assignedHub: found.assignedHub });
    addAuditLog('Team Joined', 'Team', `Joined team "${found.name}" via code ${inviteCode}`);

    // If joining an official AIMA registration cohort, persist to Supabase
    if (found.inviteCode && found.inviteCode.startsWith('AIMA-CL26-')) {
      addMemberToRegistrationInSupabase(found.inviteCode, {
        name: currentUser.name,
        email: currentUser.email,
        mobile: currentUser.mobile,
        enrolmentNumber: currentUser.enrolmentNumber,
        program: currentUser.programme,
        semester: currentUser.yearSemester,
      }).catch(err => console.warn('Sync joined member to Supabase notice:', err));
    }

    return { success: true, message: `Successfully joined team "${found.name}"!` };
  };

  const addTeamMember = async (
    memberData: {
      name: string;
      email: string;
      mobile?: string;
      enrolmentNumber?: string;
      program?: string;
      semester?: string;
      gender?: string;
    }
  ): Promise<{ success: boolean; message: string; password?: string }> => {
    const targetTeam = userTeam;
    if (!targetTeam) {
      return { success: false, message: 'No active team found to add member to.' };
    }
    if ((targetTeam.members?.length || 0) >= 4) {
      return { success: false, message: 'Team already has the maximum capacity of 4 members.' };
    }

    const regNum =
      participantUser?.registration_number ||
      targetTeam.inviteCode ||
      (targetTeam as any).registrationNumber ||
      '';

    const res = await addMemberToRegistrationInSupabase(regNum, memberData);
    if (!res.success || !res.member) {
      return { success: false, message: res.error || 'Failed to add team member to database.' };
    }

    const newTeamMember: TeamMember = {
      studentId: 'participant_' + memberData.email.replace(/[^a-z0-9]/gi, '_').toLowerCase(),
      name: memberData.name.trim(),
      email: memberData.email.toLowerCase().trim(),
      mobile: memberData.mobile || '',
      institute: targetTeam.instituteName,
      isLeader: false,
      hasPaid: true,
      acceptedDeclaration: true,
      roleInTeam: 'Team Member',
      paymentLabel: 'Nominated Member',
      paymentStatus: 'PAID',
    };

    const updatedMembers = [...(targetTeam.members || []), newTeamMember];
    const isNowLocked = updatedMembers.length >= 4;

    setTeams(prev =>
      prev.map(t =>
        t.id === targetTeam.id
          ? {
            ...t,
            members: updatedMembers,
            participantCount: updatedMembers.length,
            isLocked: isNowLocked,
          }
          : t
      )
    );

    addAuditLog(
      'Team Member Added',
      'Team',
      `Added 4th member ${memberData.name} (${memberData.email}) to team "${targetTeam.name}" (${regNum}).`
    );

    // Dispatch welcome email with credentials to newly added member
    if (memberData.email) {
      sendTeamMemberAddedEmail({
        toName: memberData.name.trim(),
        toEmail: memberData.email.toLowerCase().trim(),
        teamName: targetTeam.name,
        tempPassword: res.password || 'ICL2026@' + memberData.email.split('@')[0],
      }).catch(err => console.warn('[Email] Failed to send team addition email:', err));
    }

    return {
      success: true,
      message: `Teammate ${memberData.name} successfully added to Team ${targetTeam.name}!`,
      password: res.password,
    };
  };

  const leaveTeam = () => {
    if (!userTeam) return;
    const remainingMembers = (userTeam.members || []).filter(m => m.studentId !== currentUser.id);
    if (remainingMembers.length === 0) {
      setTeams(prev => prev.filter(t => t.id !== userTeam.id));
    } else {
      // if leader left, assign first remaining as leader
      if (userTeam.leaderId === currentUser.id) {
        remainingMembers[0].isLeader = true;
      }
      setTeams(prev =>
        prev.map(t =>
          t.id === userTeam.id
            ? {
              ...t,
              leaderId: remainingMembers[0].studentId,
              leaderName: remainingMembers[0].name,
              members: remainingMembers,
            }
            : t
        )
      );
    }
    updateUserProfile({ teamId: undefined, isTeamLeader: false, role: 'student' });
    addAuditLog('Team Exited', 'Team', `Left team ${userTeam.name}`);
  };

  const lockTeam = (teamId: string) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, isLocked: true } : t)));
    addAuditLog('Team Locked', 'Team', `Roster locked for team ID ${teamId}`);
  };

  const selectTeamTrack = (trackId: string): { success: boolean; message: string } => {
    const track = OFFICIAL_CASE_TRACKS.find(t => t.id === trackId);
    if (!track) {
      return { success: false, message: 'Invalid track selected. Please select one of the official tracks.' };
    }

    const now = new Date().toISOString();
    const targetTeamId = userTeam?.id || currentUser.teamId || (participantUser ? 'team_participant_' + participantUser.registration_number : undefined);

    setTeams(prev =>
      prev.map(t =>
        (targetTeamId && t.id === targetTeamId) || (participantUser && t.inviteCode === participantUser.registration_number)
          ? { ...t, selectedTrackId: track.id, selectedTrackName: track.name, trackSelectedAt: now }
          : t
      )
    );

    updateUserProfile({
      selectedTrackId: track.id,
      selectedTrackName: track.name,
      trackSelectedAt: now,
    });

    if (participantUser) {
      const updatedParticipant: SupabaseParticipantRow = {
        ...participantUser,
        selected_track_id: track.id,
        selected_track_name: track.name,
        track_locked_at: now,
      } as any;
      setParticipantUser(updatedParticipant);
      try {
        const serialized = JSON.stringify(updatedParticipant);
        sessionStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
        localStorage.setItem(PARTICIPANT_SESSION_KEY, serialized);
      } catch { }
    }

    addAuditLog(
      'Track Selected',
      'Team',
      `Participant/Team selected Track ${track.trackNumber}: "${track.name}" (${track.badge}) for Round 2 offline presentation at AIMA venue.`
    );

    // Save track selection to Supabase database (and update on change)
    const regNum =
      participantUser?.registration_number ||
      (userTeam as any)?.inviteCode ||
      (userTeam as any)?.registrationNumber ||
      currentUser.registrationNumber ||
      currentUser.institutionId?.replace('inst_participant_', '') ||
      currentUser.institution ||
      '';
    const email = participantUser?.email || currentUser.email || '';
    if (regNum || email) {
      saveParticipantTrackSelection(regNum, email, track.id, track.name, {
        trackBadge: track.badge,
        masterCaseTitle: track.masterCaseTitle,
        teamId: targetTeamId || userTeam?.id,
        teamName: userTeam?.name || (participantUser?.name ? `${participantUser.name}'s Team` : 'Individual Entry'),
        candidateName: participantUser?.name || currentUser.name || 'Candidate',
        instituteName: participantUser?.institute_name || currentUser.instituteName || userTeam?.instituteName || 'Management Institute',
      }).catch((err) => {
        console.warn('Could not persist track selection to Supabase:', err);
      });
    }

    return {
      success: true,
      message: `Track "${track.name}" (${track.badge}) locked & confirmed in database! You are now scheduled for your offline presentation at the AIMA venue.`,
    };
  };

  const requestDeadlineExtension = (
    teamId: string,
    requestData: {
      reasonCategory: 'Academic/Exam Clash' | 'Medical Emergency' | 'Technical/Hardware Issue' | 'Faculty/Mentor Review Delay' | 'Other';
      reasonDetails: string;
      requestedExtensionDays: number;
      supportingDocName?: string;
    }
  ): { success: boolean; message: string } => {
    const targetTeam = teams.find(t => t.id === teamId);
    if (!targetTeam) return { success: false, message: 'Team not found.' };

    const currentDead = targetTeam.submissionDeadline || '2026-10-28T23:59:59Z';
    const currentDateObj = new Date(currentDead);
    const newDateObj = new Date(currentDateObj.getTime() + requestData.requestedExtensionDays * 24 * 60 * 60 * 1000);
    const proposedDeadline = newDateObj.toISOString();

    const newRequest: DeadlineExtensionRequest = {
      id: 'ext_' + Date.now(),
      teamId,
      teamName: targetTeam.name,
      instituteName: targetTeam.instituteName,
      leaderId: targetTeam.leaderId,
      leaderName: targetTeam.leaderName,
      leaderEmail: currentUser.email || `${targetTeam.leaderName.toLowerCase().replace(/\s+/g, '.')}@institute.ac.in`,
      currentDeadline: currentDead,
      requestedExtensionDays: requestData.requestedExtensionDays,
      proposedDeadline,
      reasonCategory: requestData.reasonCategory,
      reasonDetails: requestData.reasonDetails,
      supportingDocName: requestData.supportingDocName,
      status: 'PENDING',
      requestedAt: new Date().toISOString(),
    };

    setTeams(prev =>
      prev.map(t =>
        t.id === teamId
          ? { ...t, extensionRequest: newRequest }
          : t
      )
    );

    addAuditLog(
      'Deadline Extension Requested',
      'Team',
      `Team "${targetTeam.name}" requested a +${requestData.requestedExtensionDays}-day extension for Round 2 Case Deck (${requestData.reasonCategory}).`
    );

    return {
      success: true,
      message: `Extension request for +${requestData.requestedExtensionDays} days submitted to AIMA Secretariat. Review status will be displayed here.`,
    };
  };

  const reviewDeadlineExtension = (
    teamId: string,
    decision: 'APPROVED' | 'REJECTED',
    remarks?: string,
    customNewDeadline?: string
  ) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id !== teamId || !t.extensionRequest) return t;

        const effectiveDeadline = decision === 'APPROVED'
          ? (customNewDeadline || t.extensionRequest.proposedDeadline)
          : (t.submissionDeadline || '2026-10-28T23:59:59Z');

        const updatedRequest: DeadlineExtensionRequest = {
          ...t.extensionRequest,
          status: decision,
          reviewedAt: new Date().toISOString(),
          reviewedBy: currentUser.name || 'AIMA Secretariat Chief Scrutineer',
          reviewerRemarks: remarks || (decision === 'APPROVED' ? 'Granted on academic merits.' : 'Declined as per uniform league rules.'),
        };

        return {
          ...t,
          submissionDeadline: effectiveDeadline,
          extensionRequest: updatedRequest,
        };
      })
    );

    addAuditLog(
      `Deadline Extension ${decision}`,
      'Team',
      `Secretariat ${decision.toLowerCase()} deadline extension for team ID ${teamId}. Remarks: ${remarks || 'None'}`
    );
  };

  const updateTeamDeadline = (teamId: string, newDeadline: string) => {
    setTeams(prev =>
      prev.map(t => (t.id === teamId ? { ...t, submissionDeadline: newDeadline } : t))
    );
    addAuditLog('Deadline Adjusted', 'Team', `Updated submission deadline for team ${teamId} to ${newDeadline}`);
  };

  const processPayment = async (
    stage: 'round_1_2' | 'round_3' | 'round_4',
    method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon',
    couponCode?: string
  ): Promise<{ success: boolean; message: string; receiptNumber?: string }> => {
    let amount = config.feeR1R2;
    if (stage === 'round_3') amount = config.feeR3;
    if (stage === 'round_4') amount = config.feeR4;

    const isWaiver = couponCode?.toUpperCase() === 'AIMA2026' || couponCode?.toUpperCase() === 'ICRCSPONSOR';
    if (isWaiver) {
      amount = 0;
    }

    const txnId = 'TXN-' + Math.floor(100000000 + Math.random() * 900000000);
    const invoiceNum = 'INV-AIMA-26-' + Math.floor(10000 + Math.random() * 90000);

    const userTeam = teams.find(t => t.id === currentUser.teamId);
    const assignedHub = currentUser.assignedHub || userTeam?.assignedHub || 'north';
    const hubNames: Record<string, string> = {
      north: 'Northern Regional Hub (New Delhi)',
      west: 'Western Regional Hub (Mumbai)',
      south: 'Southern Regional Hub (Bengaluru)',
      east: 'Eastern Regional Hub (Kolkata)',
      central: 'Central Regional Hub (Bhopal)',
    };
    const baseAmt = Math.round((amount / 1.18) * 100) / 100;
    const gstAmt = Math.round((amount - baseAmt) * 100) / 100;

    const record: PaymentRecord = {
      id: 'pay_' + Date.now(),
      transactionId: txnId,
      userId: currentUser.id,
      userName: currentUser.name,
      teamId: currentUser.teamId,
      teamName: userTeam?.name,
      instituteId: currentUser.instituteId,
      instituteName: currentUser.instituteName,
      regionHub: assignedHub,
      regionName: hubNames[assignedHub] || 'Northern Regional Hub (New Delhi)',
      amount,
      baseAmount: baseAmt,
      gstAmount: gstAmt,
      gstRate: 18,
      gstType: assignedHub === 'north' ? 'CGST+SGST' : 'IGST',
      hsnSacCode: '999293',
      itemDescription: stage === 'round_3' ? 'Round 3 Regional Final Entry Fee' : 'Round 1-2 Individual Screening Fee',
      stage,
      paymentMethod: method,
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      gstInvoiceNumber: invoiceNum,
      couponCode,
    };

    setPayments(prev => [record, ...prev]);

    if (stage === 'round_1_2') {
      updateUserProfile({ hasPaidR1R2: true });
    } else if (stage === 'round_3') {
      updateUserProfile({ hasPaidR3: true });
    } else if (stage === 'round_4') {
      updateUserProfile({ hasPaidR4: true });
    }

    addAuditLog('Payment Processed', 'Payment', `Received ₹${amount} for ${stage} via ${method} (Txn: ${txnId})`);
    return { success: true, message: `Payment of ₹${amount} successful! Receipt: ${invoiceNum}`, receiptNumber: invoiceNum };
  };

  const makePayment = async (stage?: string, amount?: number, method?: string) => {
    const stg = stage === 'round3' || stage === 'round_3' ? 'round_3' : stage === 'round4' || stage === 'round_4' ? 'round_4' : 'round_1_2';
    const mthd = method?.toLowerCase().includes('card') ? 'Credit Card' : method?.toLowerCase().includes('net') ? 'Net Banking' : 'UPI';
    return processPayment(stg as any, mthd as any);
  };

  // Quiz Module
  const saveQuizProgress = (attemptId: string, answers: Record<string, number>, marked: string[], tabSwitches: number) => {
    setQuizAttempts(prev => {
      const existing = prev.find(a => a.attemptId === attemptId || a.studentId === currentUser.id || a.userId === currentUser.id);
      if (existing) {
        return prev.map(a =>
          a.attemptId === attemptId || a.studentId === currentUser.id || a.userId === currentUser.id
            ? { ...a, answers, markedForReview: marked, tabSwitchCount: tabSwitches }
            : a
        );
      }
      return [
        ...prev,
        {
          attemptId,
          studentId: currentUser.id,
          userId: currentUser.id,
          teamId: currentUser.teamId,
          startTime: new Date().toISOString(),
          score: 0,
          analyticalScore: 0,
          timeTakenSeconds: 0,
          isCompleted: false,
          answers,
          markedForReview: marked,
          tabSwitchCount: tabSwitches,
        },
      ];
    });
  };

  const submitQuiz = async (answers: Record<string, number>, marked: string[], timeTaken: number, tabSwitches: number): Promise<QuizAttempt> => {
    let resultScore = 0;
    let resultAnalytical = 0;
    let isQualified = false;
    let attemptId = 'att_' + currentUser.id;
    let submittedAt = new Date().toISOString().replace('T', ' ').slice(0, 19);

    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-app-schema': DB_SCHEMA,
        },
        body: JSON.stringify({
          answers,
          markedForReview: marked,
          timeTaken,
          tabSwitches,
          studentId: currentUser.id,
          teamId: currentUser.teamId,
          participantEmail: currentUser.email,
          programId: quizPrograms.find(p => p.id === 'qp_case_comp_stage1_2026')?.id || quizPrograms[0]?.id || 'qp_case_comp_stage1_2026',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        resultScore = data.score ?? 0;
        resultAnalytical = data.analyticalScore ?? 0;
        isQualified = Boolean(data.isQualified);
        if (data.attemptId) attemptId = data.attemptId;
        if (data.submittedAt) submittedAt = data.submittedAt;
      } else {
        throw new Error('Server evaluation returned HTTP ' + res.status);
      }
    } catch (err: any) {
      console.warn('Server-side scoring fallback to local:', err?.message);
      let coreScore = 0;
      let tieBreakerScore = 0;
      questions.forEach((q, idx) => {
        const order = Number((q as any).orderIndex ?? (idx + 1));
        const isReserve = order > 25;
        const selected = answers[q.id];
        if (selected !== undefined && selected !== null) {
          if (Number(selected) === Number(q.correctAnswerIndex)) {
            if (isReserve) {
              tieBreakerScore += Number(q.marks || 4);
            } else {
              coreScore += Number(q.marks || 4);
            }
          }
        }
      });
      resultScore = coreScore;
      resultAnalytical = tieBreakerScore;
      isQualified = resultScore >= (quizPrograms[0]?.cutoffScore ?? 60);
    }

    const completedAttempt: QuizAttempt = {
      attemptId,
      studentId: currentUser.id,
      userId: currentUser.id,
      teamId: currentUser.teamId,
      programId: quizPrograms.find(p => p.id === 'qp_case_comp_stage1_2026')?.id || quizPrograms[0]?.id || 'qp_case_comp_stage1_2026',
      startTime: new Date(Date.now() - timeTaken * 1000).toISOString(),
      submittedAt,
      answers,
      markedForReview: marked,
      score: resultScore,
      analyticalScore: resultAnalytical,
      timeTakenSeconds: timeTaken,
      tabSwitchCount: tabSwitches,
      isCompleted: true,
    };

    setQuizAttempts(prev => [completedAttempt, ...prev.filter(q => q.studentId !== currentUser.id && q.userId !== currentUser.id)]);

    try {
      localStorage.setItem('aima_quiz_attempt_' + currentUser.id, JSON.stringify(completedAttempt));
      const existingHistoryStr = localStorage.getItem('aima_quiz_attempts_all');
      const history: QuizAttempt[] = existingHistoryStr ? JSON.parse(existingHistoryStr) : [];
      const updatedHistory = [completedAttempt, ...history.filter(a => a.studentId !== currentUser.id && a.userId !== currentUser.id && a.attemptId !== completedAttempt.attemptId)];
      localStorage.setItem('aima_quiz_attempts_all', JSON.stringify(updatedHistory));
      refreshQuizAttempts().catch(() => { });
    } catch (storageErr) {
      console.warn('localStorage attempt caching notice:', storageErr);
    }

    updateUserProfile({
      quizScore: resultScore,
      quizCompleted: true,
      qualificationStatus: {
        ...(currentUser.qualificationStatus || { r2Qualified: false, r3Qualified: false, r4Finalist: false }),
        r1Qualified: isQualified,
      },
    });

    // Update team average if present
    if (userTeam) {
      const updatedTeams = teams.map(t => {
        if (t.id === userTeam.id) {
          return {
            ...t,
            r1AvgScore: resultScore,
            r1Qualified: isQualified,
            r1CompletedMembersCount: 1,
          };
        }
        return t;
      });
      setTeams(updatedTeams);
    }

    addAuditLog('Quiz Submitted', 'Quiz', `Completed Round 1 Business Quiz with score ${resultScore}/100 (Tab switches: ${tabSwitches})`);

    // Dispatch Round 1 results email if results are currently declared/published
    if (config.isResultsPublishedR1 || config.isPublicResultsPublished) {
      if (currentUser.email) {
        sendR1ResultsEmail({
          toName: currentUser.name,
          toEmail: currentUser.email,
          teamName: userTeam?.name || 'Individual',
          score: resultScore,
          qualified: isQualified,
        }).catch(err => console.warn('[Email] R1 result email send failed:', err));
      }
    }
    return completedAttempt;
  };

  const addQuestion = (q: Omit<QuizQuestion, 'id'>) => {
    const newQ: QuizQuestion = {
      id: 'q_' + (questions.length + 1) + '_' + Date.now().toString().slice(-4),
      ...q,
    };
    setQuestions(prev => [newQ, ...prev]);
    upsertQuizQuestion(newQ).catch(console.error);
    addAuditLog('Question Added', 'Quiz', `Added new question: "${q.questionText.slice(0, 40)}..."`);
  };

  const addQuestionsBulk = (newQuestions: Omit<QuizQuestion, 'id'>[]): number => {
    if (!newQuestions || newQuestions.length === 0) return 0;
    const formatted: QuizQuestion[] = newQuestions.map((q, idx) => ({
      id: 'q_bulk_' + Date.now().toString(36) + '_' + (idx + 1),
      ...q,
    }));
    setQuestions(prev => [...formatted, ...prev]);
    upsertQuizQuestionsBulk(formatted).catch(console.error);
    addAuditLog('Bulk Questions Imported', 'Quiz', `Successfully imported ${formatted.length} questions into Question Bank via spreadsheet.`);
    return formatted.length;
  };

  const updateQuestion = (id: string, q: Partial<QuizQuestion>) => {
    setQuestions(prev => {
      const updated = prev.map(item => (item.id === id ? { ...item, ...q } : item));
      const target = updated.find(item => item.id === id);
      if (target) {
        upsertQuizQuestion(target).catch(console.error);
      }
      return updated;
    });
    addAuditLog('Question Updated', 'Quiz', `Updated question ID ${id}`);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(item => item.id !== id));
    deleteQuizQuestionFromDb(id).catch(console.error);
    addAuditLog('Question Deleted', 'Quiz', `Removed question ID ${id}`);
  };

  // Case Deck Submission
  const submitCaseDeck = (deckData: any): CaseSubmission => {
    const subId = 'sub_' + (userTeam?.id || 'individual') + '_' + Date.now();
    const confNumber = 'ICL26-R2-CONF-' + Math.floor(100000 + Math.random() * 900000);

    const submission: CaseSubmission = {
      id: subId,
      teamId: deckData.teamId || userTeam?.id || 'team_' + currentUser.id,
      teamName: deckData.teamName || userTeam?.name || currentUser.name + ' Group',
      caseTitle: deckData.caseTitle || 'GreenGrid Mobility: EV Fleet Electrification & Swapping Economics',
      submittedAt: new Date().toISOString(),
      deckFileName: deckData.deckFileName || deckData.fileName || 'AIMA_Round2_CaseDeck.pdf',
      deckFileSize: deckData.deckFileSize || (deckData.fileSizeMb ? `${deckData.fileSizeMb} MB` : '14.8 MB'),
      deckFileType: deckData.deckFileType || 'pdf',
      slideCount: deckData.slideCount || 12,
      executiveSummary: deckData.executiveSummary || '',
      supportingExcelName: deckData.supportingExcelName || deckData.financialModelFile,
      videoPitchUrl: deckData.videoPitchUrl,
      versionNumber: (userTeam?.r2Submission?.versionNumber || 0) + 1,
      confirmationNumber: confNumber,
      status: 'submitted',
    };

    if (userTeam) {
      setTeams(prev =>
        prev.map(t => (t.id === userTeam.id ? { ...t, r2Submission: submission } : t))
      );
    }

    addAuditLog('Case Deck Uploaded', 'Submission', `Uploaded Round 2 deck "${submission.deckFileName}" (Confirmation: ${confNumber})`);
    return submission;
  };

  const requestAiCaseAssessment = async (submissionId: string) => {
    try {
      const team = teams.find(t => t.r2Submission?.id === submissionId);
      const submission = team?.r2Submission;

      const res = await fetch('/api/ai-evaluate-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseTitle: submission?.caseTitle,
          submissionSummary: submission?.executiveSummary,
          slideStructure: [
            'Slide 1: Executive Summary & Context',
            'Slide 2: Diagnostic Root-Cause Matrix',
            'Slide 3: Financial Sensitivity & Unit Economics',
            'Slide 4: Strategic Alternatives Analysis',
            'Slide 5: Recommended ONDC Logistics Architecture',
            'Slide 6: 3-Year Implementation Roadmap & Capex',
            'Slide 7: Risk Mitigation & ESG Compliance',
          ],
          studentRecommendations: submission?.executiveSummary,
          fileMetadata: { name: submission?.deckFileName, size: submission?.deckFileSize },
        }),
      });

      const data = await res.json();

      if (team && team.r2Submission) {
        const updatedSubmission: CaseSubmission = {
          ...team.r2Submission,
          aiAssessment: data,
        };
        setTeams(prev =>
          prev.map(t => (t.id === team.id ? { ...t, r2Submission: updatedSubmission } : t))
        );
      }

      addAuditLog('AI Evaluation Executed', 'Evaluation', `Generated AI Advisory report for submission ${submissionId}`);
      return data;
    } catch (err) {
      console.error('AI eval request error', err);
      return null;
    }
  };

  const updateRubricCriterion = (round: 'r2' | 'r3' | 'r4', criterionId: string, data: Partial<RubricCriterion>) => {
    if (round === 'r2') {
      setRubricR2(prev => prev.map(c => (c.id === criterionId ? { ...c, ...data } : c)));
    } else if (round === 'r3') {
      setRubricR3(prev => prev.map(c => (c.id === criterionId ? { ...c, ...data } : c)));
    } else {
      setRubricR4(prev => prev.map(c => (c.id === criterionId ? { ...c, ...data } : c)));
    }
    addAuditLog('Rubric Modified', 'Evaluation', `Adjusted criterion ${criterionId} in ${round.toUpperCase()}`);
  };

  const submitEvaluation = (evalData: Omit<Evaluation, 'id' | 'submittedAt'>) => {
    const newEval: Evaluation = {
      id: 'eval_' + Date.now(),
      submittedAt: new Date().toISOString(),
      ...evalData,
    };
    setEvaluations(prev => [newEval, ...prev]);

    // Update team score & rank
    setTeams(prev =>
      prev.map(t => {
        if (t.id === evalData.teamId) {
          const currentEvals = t.r2Evaluations || [];
          const updatedEvals = [...currentEvals, newEval];
          const avg = updatedEvals.reduce((acc, curr) => acc + curr.weightedTotal, 0) / updatedEvals.length;
          return {
            ...t,
            r2Evaluations: updatedEvals,
            r2AverageScore: Math.round(avg * 10) / 10,
            r2Qualified: avg >= 80,
          };
        }
        return t;
      })
    );

    addAuditLog('Evaluation Submitted', 'Evaluation', `Jury member ${evalData.evaluatorName} submitted score of ${evalData.weightedTotal}/100 for team ${evalData.teamId}`);
  };

  const declareConflictOfInterest = (submissionId: string, reason: string) => {
    addAuditLog('Conflict of Interest Declared', 'Evaluation', `Evaluator recused from submission ${submissionId}. Reason: ${reason}`);
  };

  const updateHubCapacity = (hubId: RegionHubId, capacity: number) => {
    setHubs(prev => prev.map(h => (h.id === hubId ? { ...h, maxCapacity: capacity } : h)));
    addAuditLog('Hub Capacity Changed', 'Regional', `Set maximum capacity for ${hubId} to ${capacity}`);
  };

  const assignTeamHub = (teamId: string, hubId: RegionHubId) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, assignedHub: hubId } : t)));
    addAuditLog('Team Hub Allocated', 'Regional', `Allocated team ${teamId} to ${hubId} Hub`);
  };

  const verifyAttendance = (teamId: string, attended: boolean) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, r3AttendanceVerified: attended } : t)));
    addAuditLog('Regional Attendance Verified', 'Regional', `Team ${teamId} attendance status: ${attended ? 'Present' : 'Absent'}`);
  };

  const schedulePresentationSlot = (
    teamId: string,
    slot: { date: string; time: string; venue: string; room: string; juryPanelId: string }
  ) => {
    setTeams(prev => prev.map(t => (t.id === teamId ? { ...t, r3Slot: slot } : t)));
    addAuditLog('Presentation Slot Scheduled', 'Regional', `Scheduled team ${teamId} for ${slot.date} at ${slot.time} (${slot.room})`);
  };

  const submitRegionalJuryScore = (teamId: string, score: number, juryName: string, comments: string) => {
    setTeams(prev =>
      prev.map(t => {
        if (t.id === teamId) {
          const currentScores = t.r3Scores || [];
          const newEntry = {
            juryId: 'jury_' + Math.random().toString(36).slice(2, 6),
            juryName,
            criterionScores: {},
            totalScore: score,
            comments,
            submittedAt: new Date().toISOString(),
          };
          const updated = [...currentScores, newEntry];
          const avg = updated.reduce((a, b) => a + b.totalScore, 0) / updated.length;
          return {
            ...t,
            r3Scores: updated,
            r3TotalScore: Math.round(avg * 10) / 10,
            r3Qualified: avg >= 85,
          };
        }
        return t;
      })
    );
    addAuditLog('Regional Score Entered', 'Regional', `Jury ${juryName} awarded ${score}/100 to team ${teamId}`);
  };

  const bulkRegisterStudents = (instId: string, csvData: Array<Record<string, string>>) => {
    let addedCount = 0;
    const errors: string[] = [];

    const inst = institutions.find(i => i.id === instId);
    const newStudents: UserProfile[] = [];

    csvData.forEach((row, idx) => {
      const name = row['Full Name'] || row['Name'] || row['name'];
      const email = row['Email'] || row['email'];
      const mobile = row['Mobile'] || row['mobile'] || '+91 98000 00000';
      const prog = row['Programme'] || 'MBA';

      if (!name || !email) {
        errors.push(`Row ${idx + 1}: Missing mandatory Name or Email.`);
        return;
      }

      const newStudent: UserProfile = {
        id: 'usr_bulk_' + Date.now() + '_' + idx,
        name,
        email,
        mobile,
        role: 'student',
        instituteName: inst?.name || 'Bulk Uploaded Institute',
        instituteId: instId,
        programme: prog,
        isVerified: true,
        hasPaidR1R2: true, // bulk sponsored
      };

      newStudents.push(newStudent);
      addedCount++;
    });

    setUsers(prev => [...prev, ...newStudents]);
    setInstitutions(prev =>
      prev.map(i =>
        i.id === instId
          ? {
            ...i,
            registeredStudents: i.registeredStudents + addedCount,
            totalStudents: Math.max(i.totalStudents, i.registeredStudents + addedCount),
          }
          : i
      )
    );

    addAuditLog('Bulk Registration Uploaded', 'Registration', `Added ${addedCount} students via CSV for ${inst?.name}`);
    return { added: addedCount, errors };
  };

  const processInstitutionalPayment = (instId: string, amount: number) => {
    setInstitutions(prev =>
      prev.map(i => (i.id === instId ? { ...i, totalPaidAmount: i.totalPaidAmount + amount } : i))
    );
    addAuditLog('Institutional Bulk Payment', 'Payment', `Received ₹${amount} from Institution ${instId}`);
  };

  const createInstitutionalTeam = (
    instId: string,
    teamData: {
      name: string;
      preferredHub?: RegionHubId;
      leaderStudentId: string;
      members: Array<{
        studentId: string;
        name: string;
        email: string;
        mobile?: string;
        roleInTeam?: string;
      }>;
    }
  ): { success: boolean; message: string; team?: Team } => {
    const inst = institutions.find(i => i.id === instId);
    const instName = inst?.name || currentUser.instituteName || 'Institutional Campus';
    const teamId = 'team_inst_' + Math.random().toString(36).substring(2, 9);
    const code = 'ICL-' + teamData.name.substring(0, 3).toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const assignedHub = teamData.preferredHub || (inst?.state?.toLowerCase().includes('karnataka') ? 'south' : 'north');

    const leaderMember = teamData.members.find(m => m.studentId === teamData.leaderStudentId) || teamData.members[0];

    const teamMembers: TeamMember[] = teamData.members.map(m => ({
      studentId: m.studentId,
      name: m.name,
      email: m.email,
      mobile: m.mobile || '+91 98000 00000',
      institute: instName,
      isLeader: m.studentId === leaderMember.studentId,
      hasPaid: true,
      acceptedDeclaration: true,
      roleInTeam: m.roleInTeam || (m.studentId === leaderMember.studentId ? 'Team Leader & Strategist' : 'Team Analyst'),
    }));

    const newTeam: Team = {
      id: teamId,
      name: teamData.name,
      inviteCode: code,
      leaderId: leaderMember.studentId,
      leaderName: leaderMember.name,
      instituteName: instName,
      assignedHub,
      preferredHub: teamData.preferredHub,
      isLocked: false,
      createdAt: new Date().toISOString(),
      submissionDeadline: '2026-10-28T23:59:59Z',
      members: teamMembers,
      r1AvgScore: 85,
      r1Qualified: true,
      r1CompletedMembersCount: teamMembers.length,
    };

    setTeams(prev => [newTeam, ...prev]);

    // Update institute stats
    setInstitutions(prev =>
      prev.map(i =>
        i.id === instId
          ? { ...i, teamsCreated: (i.teamsCreated || 0) + 1 }
          : i
      )
    );

    addAuditLog(
      'Institutional Team Created',
      'Institute',
      `Coordinator created team "${teamData.name}" (${code}) with ${teamMembers.length} members for ${instName}`
    );

    return {
      success: true,
      message: `Team "${teamData.name}" created successfully with code ${code}!`,
      team: newTeam,
    };
  };

  const recordOfflineResultsBulk = (
    round: 'round_2' | 'round_3' | 'round_4',
    newResults: Array<Omit<OfflineRoundResult, 'id' | 'uploadedAt'>>
  ): { success: boolean; count: number } => {
    const timestamp = new Date().toISOString();
    const created: OfflineRoundResult[] = newResults.map((r, idx) => ({
      ...r,
      id: `off_${round}_${Date.now()}_${idx}`,
      uploadedAt: timestamp,
    }));

    setOfflineRoundResults(prev => {
      // replace entries for existing teamId in this round or append
      const existingFiltered = prev.filter(p => !(p.round === round && created.some(c => c.teamId === p.teamId)));
      return [...created, ...existingFiltered];
    });

    // Also sync scores directly back onto teams
    setTeams(prev =>
      prev.map(t => {
        const res = created.find(c => c.teamId === t.id);
        if (!res) return t;

        if (round === 'round_2') {
          return {
            ...t,
            r2AverageScore: res.aggregateScore,
            r2Rank: res.rank,
            r2Qualified: res.qualifiedNextRound,
          };
        } else if (round === 'round_3') {
          return {
            ...t,
            r3AttendanceVerified: res.attendanceVerified,
            r3OfflineQuizScore: res.offlineQuizScore,
            r3PresentationScore: res.livePresentationScore,
            r3TotalScore: res.aggregateScore,
            r3Rank: res.rank,
            r3Qualified: res.qualifiedNextRound,
          };
        } else {
          return {
            ...t,
            r4AttendanceVerified: res.attendanceVerified,
            r4OfflineQuizScore: res.offlineQuizScore,
            r4PresentationScore: res.livePresentationScore,
            r4FinalScore: res.aggregateScore,
            r4Rank: res.rank,
            r4Award: res.award,
          };
        }
      })
    );

    // Persist each jury scorecard to Supabase DB against that team/participant
    created.forEach(scorecard => {
      saveJuryScorecardToDb({
        registrationNumber: (scorecard as any).registrationNumber,
        candidateEmail: (scorecard as any).candidateEmail,
        userId: (scorecard as any).userId,
        teamId: scorecard.teamId,
        teamName: scorecard.teamName,
        instituteName: scorecard.instituteName,
        round: scorecard.round,
        trackId: scorecard.trackId,
        trackName: scorecard.trackName,
        trackBadge: (scorecard as any).trackBadge,
        masterCaseTitle: (scorecard as any).masterCaseTitle,
        offlineQuizScore: scorecard.offlineQuizScore,
        livePresentationScore: scorecard.livePresentationScore,
        presentationMaxMarks: scorecard.presentationMaxMarks,
        qaDefenseScore: scorecard.qaDefenseScore || 0,
        aggregateScore: scorecard.aggregateScore,
        rank: scorecard.rank,
        attendanceVerified: scorecard.attendanceVerified,
        qualifiedNextRound: scorecard.qualifiedNextRound,
        award: scorecard.award,
        notes: scorecard.notes,
        evaluatedBy: scorecard.evaluatedBy,
        kpiScores: scorecard.kpiScores,
      }).catch(err => console.warn('Error saving jury scorecard to DB:', err));
    });

    addAuditLog(
      'Offline Results Uploaded',
      'Results',
      `Admin recorded offline jury scores for ${created.length} teams in ${round === 'round_2' ? 'Round 2 (Offline Presentation at AIMA Venue)' : round === 'round_3' ? 'Round 3 (Regional Live)' : 'Round 4 (National Grand Finale)'}.`
    );

    return { success: true, count: created.length };
  };

  const updateOfflineResult = (id: string, updates: Partial<OfflineRoundResult>) => {
    setOfflineRoundResults(prev =>
      prev.map(r => {
        if (r.id !== id) return r;
        const updated = { ...r, ...updates };

        // sync team
        setTeams(tList =>
          tList.map(t => {
            if (t.id !== updated.teamId) return t;
            if (updated.round === 'round_2') {
              return {
                ...t,
                r2AverageScore: updated.aggregateScore,
                r2Rank: updated.rank,
                r2Qualified: updated.qualifiedNextRound,
              };
            } else if (updated.round === 'round_3') {
              return {
                ...t,
                r3AttendanceVerified: updated.attendanceVerified,
                r3OfflineQuizScore: updated.offlineQuizScore,
                r3PresentationScore: updated.livePresentationScore,
                r3TotalScore: updated.aggregateScore,
                r3Rank: updated.rank,
                r3Qualified: updated.qualifiedNextRound,
              };
            } else {
              return {
                ...t,
                r4AttendanceVerified: updated.attendanceVerified,
                r4OfflineQuizScore: updated.offlineQuizScore,
                r4PresentationScore: updated.livePresentationScore,
                r4FinalScore: updated.aggregateScore,
                r4Rank: updated.rank,
                r4Award: updated.award,
              };
            }
          })
        );

        // Persist updated jury scorecard to DB
        saveJuryScorecardToDb({
          registrationNumber: (updated as any).registrationNumber,
          candidateEmail: (updated as any).candidateEmail,
          userId: (updated as any).userId,
          teamId: updated.teamId,
          teamName: updated.teamName,
          instituteName: updated.instituteName,
          round: updated.round,
          trackId: updated.trackId,
          trackName: updated.trackName,
          trackBadge: (updated as any).trackBadge,
          masterCaseTitle: (updated as any).masterCaseTitle,
          offlineQuizScore: updated.offlineQuizScore,
          livePresentationScore: updated.livePresentationScore,
          presentationMaxMarks: updated.presentationMaxMarks,
          qaDefenseScore: updated.qaDefenseScore || 0,
          aggregateScore: updated.aggregateScore,
          rank: updated.rank,
          attendanceVerified: updated.attendanceVerified,
          qualifiedNextRound: updated.qualifiedNextRound,
          award: updated.award,
          notes: updated.notes,
          evaluatedBy: updated.evaluatedBy,
          kpiScores: updated.kpiScores,
        }).catch(err => console.warn('Error updating jury scorecard in DB:', err));

        return updated;
      })
    );
    addAuditLog('Offline Result Updated', 'Results', `Updated offline result record ${id}`);
  };

  const deleteOfflineResult = (id: string) => {
    setOfflineRoundResults(prev => prev.filter(r => r.id !== id));
    addAuditLog('Offline Result Deleted', 'Results', `Removed offline result record ${id}`);
  };

  const addSponsor = (sponsorData: Omit<CorporateSponsor, 'id'>) => {
    const newSponsor: CorporateSponsor = {
      id: 'sp_' + Date.now().toString(36),
      ...sponsorData,
    };
    setSponsors(prev => [newSponsor, ...prev]);
    addAuditLog('Sponsor Onboarded', 'Institute', `Onboarded corporate sponsor ${sponsorData.name} (${sponsorData.tier}) with commitment ₹${sponsorData.contributionAmount.toLocaleString()}`);
  };

  const updateSponsor = (id: string, sponsorData: Partial<CorporateSponsor>) => {
    setSponsors(prev => prev.map(s => (s.id === id ? { ...s, ...sponsorData } : s)));
    addAuditLog('Sponsor Updated', 'Institute', `Updated details for corporate sponsor ID ${id}`);
  };

  const deleteSponsor = (id: string) => {
    const target = sponsors.find(s => s.id === id);
    setSponsors(prev => prev.filter(s => s.id !== id));
    addAuditLog('Sponsor Removed', 'Institute', `Removed corporate sponsor ${target?.name || id}`);
  };

  const generateCertificate = (
    cert: Omit<CertificateRecord, 'id' | 'certificateNumber' | 'qrVerificationUrl'>
  ): CertificateRecord => {
    const certNumber = 'AIMA-ICL-2026-' + Math.random().toString(36).substring(2, 6).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newCert: CertificateRecord = {
      id: 'cert_' + Date.now(),
      certificateNumber: certNumber,
      qrVerificationUrl: `https://icl2026.aima.in/verify/${certNumber}`,
      ...cert,
    };
    setCertificates(prev => [newCert, ...prev]);
    addAuditLog('Certificate Generated', 'System', `Issued ${cert.achievement} certificate ${certNumber} to ${cert.recipientName}`);

    // Dispatch final results email along with certificate link & attachment to recipient
    if (newCert.recipientEmail) {
      sendFinalResultsEmail({
        toName: newCert.recipientName,
        toEmail: newCert.recipientEmail,
        teamName: newCert.teamName || newCert.recipientName,
        achievement: newCert.achievement,
        certNumber: newCert.certificateNumber,
        certVerifyUrl: newCert.qrVerificationUrl,
      }).catch(err => console.warn('[Email] Final certificate email error:', err));
    }

    return newCert;
  };

  const publishOfficialCertificates = async (
    certs: CertificateRecord[],
    options?: { sendEmails?: boolean }
  ): Promise<{ success: boolean; publishedCount: number; emailSentCount: number }> => {
    setCertificates(prev => {
      const existingMap = new Map(prev.map(c => [c.id || c.certificateNumber, c]));
      certs.forEach(c => existingMap.set(c.id || c.certificateNumber, c));
      const combined = Array.from(existingMap.values());
      try {
        localStorage.setItem('aima_published_certificates', JSON.stringify(combined));
      } catch (err) {
        console.warn('Error saving published certificates to localStorage', err);
      }
      return combined;
    });

    addAuditLog(
      'Certificates Published',
      'System',
      `Published ${certs.length} official certificates to participant workspaces.`
    );

    let emailSentCount = 0;
    if (options?.sendEmails) {
      const emailList = certs
        .filter(c => Boolean(c.recipientEmail))
        .map(c => ({
          name: c.recipientName,
          email: c.recipientEmail,
          teamName: c.teamName || c.recipientName,
          achievement: c.achievement,
          certNumber: c.certificateNumber,
          certVerifyUrl: c.qrVerificationUrl,
        }));

      await broadcastFinalResults(emailList);
      emailSentCount = emailList.length;
      addAuditLog(
        'Certificates Dispatched via Email',
        'System',
        `Dispatched ${emailSentCount} official certificates via Falconide SMTP.`
      );
    }

    return {
      success: true,
      publishedCount: certs.length,
      emailSentCount,
    };
  };

  const verifyCertificateCode = (certCode: string): CertificateRecord | undefined => {
    const cleaned = certCode.trim().toUpperCase();
    return certificates.find(c => c.certificateNumber.toUpperCase() === cleaned || c.id === certCode);
  };

  const declareRound1Results = async (): Promise<{ success: boolean; sentCount: number; message: string }> => {
    setConfig(prev => ({
      ...prev,
      isResultsPublishedR1: true,
      isPublicResultsPublished: true,
    }));

    const emailList: { name: string; email: string; teamName: string; score: number; qualified: boolean }[] = [];
    const seenEmails = new Set<string>();

    teams.forEach(t => {
      const teamScore = t.r1AvgScore || 0;
      const isQualified = Boolean(t.r1Qualified ?? (teamScore >= config.r1CutoffScore));
      t.members.forEach(m => {
        if (m.email && !seenEmails.has(m.email.toLowerCase())) {
          seenEmails.add(m.email.toLowerCase());
          emailList.push({
            name: m.name,
            email: m.email,
            teamName: t.name,
            score: teamScore,
            qualified: isQualified,
          });
        }
      });
    });

    quizAttempts.forEach(qa => {
      const u = users.find(usr => usr.id === qa.studentId || usr.id === qa.userId);
      if (u?.email && !seenEmails.has(u.email.toLowerCase())) {
        seenEmails.add(u.email.toLowerCase());
        emailList.push({
          name: u.name,
          email: u.email,
          teamName: u.teamId ? (teams.find(t => t.id === u.teamId)?.name || 'Team') : 'Individual',
          score: qa.score,
          qualified: qa.score >= config.r1CutoffScore,
        });
      }
    });

    await broadcastR1Results(emailList);

    addAuditLog(
      'Round 1 Results Declared',
      'System',
      `Round 1 results officially declared. Dispatched notification emails to ${emailList.length} candidate(s).`
    );

    return {
      success: true,
      sentCount: emailList.length,
      message: `Round 1 results successfully declared. Sent notifications to ${emailList.length} participant(s).`,
    };
  };

  const declareFinalResults = async (): Promise<{ success: boolean; sentCount: number; message: string }> => {
    const list: {
      name: string;
      email: string;
      teamName: string;
      achievement: string;
      certNumber: string;
      certVerifyUrl: string;
    }[] = [];
    const seenEmails = new Set<string>();

    certificates.forEach(c => {
      if (c.recipientEmail && !seenEmails.has(c.recipientEmail.toLowerCase())) {
        seenEmails.add(c.recipientEmail.toLowerCase());
        list.push({
          name: c.recipientName,
          email: c.recipientEmail,
          teamName: c.teamName || c.recipientName,
          achievement: c.achievement,
          certNumber: c.certificateNumber,
          certVerifyUrl: c.qrVerificationUrl,
        });
      }
    });

    await broadcastFinalResults(list);

    addAuditLog(
      'Final Results & Certificates Declared',
      'System',
      `Grand Finale results declared. Dispatched official certificates to ${list.length} recipient(s).`
    );

    return {
      success: true,
      sentCount: list.length,
      message: `Final results declared. Dispatched certificates to ${list.length} recipient(s).`,
    };
  };

  const createSupportTicket = (
    ticket: Omit<SupportTicket, 'id' | 'ticketNumber' | 'createdAt' | 'updatedAt' | 'status'>
  ): SupportTicket => {
    const ticketNum = 'ICL-' + ticket.category.substring(0, 3).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: 'tkt_' + Date.now(),
      ticketNumber: ticketNum,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'open',
      ...ticket,
    };
    setSupportTickets(prev => [newTicket, ...prev]);
    addAuditLog('Support Ticket Opened', 'System', `Created ticket ${ticketNum} - ${ticket.subject}`);
    return newTicket;
  };

  const updateTicketStatus = (ticketId: string, status: SupportTicket['status'], resolutionNotes?: string) => {
    setSupportTickets(prev =>
      prev.map(t => (t.id === ticketId ? { ...t, status, resolutionNotes, updatedAt: new Date().toISOString() } : t))
    );
    addAuditLog('Ticket Status Updated', 'System', `Ticket ${ticketId} status changed to ${status}`);
  };

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'date'>) => {
    const newAnc: Announcement = {
      id: 'anc_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      ...announcement,
    };
    setAnnouncements(prev => [newAnc, ...prev]);
    addAuditLog('Announcement Published', 'System', `Published announcement: "${announcement.title}"`);
  };

  // User Registry CRUD & Verification
  const addUser = (userData: Omit<UserProfile, 'id'>): UserProfile => {
    const newId = 'usr_' + (users.length + 1) + '_' + Date.now().toString().slice(-4);
    const newUser: UserProfile = {
      id: newId,
      ...userData,
    };
    setUsers(prev => [newUser, ...prev]);
    addAuditLog('User Registered', 'System', `Registered new candidate ${userData.name} (${userData.email})`);
    return newUser;
  };

  const updateUser = (id: string, userData: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => (u.id === id ? { ...u, ...userData } : u)));
    if (currentUser.id === id) {
      setCurrentUser(prev => ({ ...prev, ...userData }));
    }
    addAuditLog('User Profile Updated', 'System', `Updated user record for ID ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addAuditLog('User Deleted', 'System', `Removed user ID ${id}`);
  };

  const verifyUserStudentId = (userId: string, isVerified: boolean) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, isVerified } : u)));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, isVerified }));
    }
    addAuditLog('Student Verification', 'System', `Candidate ${userId} ID verification set to ${isVerified ? 'VERIFIED' : 'PENDING'}`);
  };

  const updateUserQualification = (userId: string, qualification: Partial<UserProfile['qualificationStatus']>) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === userId
          ? {
            ...u,
            qualificationStatus: {
              ...(u.qualificationStatus || { r1Qualified: false, r2Qualified: false, r3Qualified: false, r4Finalist: false }),
              ...qualification,
            },
          }
          : u
      )
    );
    addAuditLog('Stage Qualification Updated', 'System', `Updated stage qualification for candidate ${userId}`);
  };

  // Quiz Program Management
  const addQuizProgram = (program: Omit<QuizProgram, 'id' | 'enrolledCount' | 'completedCount' | 'inProgressCount'>): QuizProgram => {
    const newProgram: QuizProgram = {
      id: 'qp_' + Date.now().toString(36),
      enrolledCount: 0,
      completedCount: 0,
      inProgressCount: 0,
      createdAt: new Date().toISOString(),
      ...program,
    };
    setQuizPrograms(prev => [newProgram, ...prev]);
    upsertQuizProgram(newProgram).catch(console.error);
    addAuditLog('Quiz Program Created', 'Quiz', `Created quiz program: "${program.title}" (Code: ${program.code})`);
    return newProgram;
  };

  const updateQuizProgram = async (id: string, program: Partial<QuizProgram>): Promise<boolean> => {
    let targetToPersist: QuizProgram | undefined;

    // 1. Immediately and synchronously update React state
    setQuizPrograms(prev => {
      const updated = prev.map(p => {
        if (p.id === id) {
          const merged = { ...p, ...program };
          targetToPersist = merged;
          return merged;
        }
        return p;
      });
      return updated;
    });

    // Fallback if not found in prev state
    if (!targetToPersist) {
      const cached = getLocalQuizProgramsCache().find(p => p.id === id);
      if (cached) {
        targetToPersist = { ...cached, ...program };
      }
    }

    // 2. Immediately update local storage cache so it persists across refreshes
    if (targetToPersist) {
      try {
        const currentCache = getLocalQuizProgramsCache();
        const updatedCache = currentCache.map(p => (p.id === id ? targetToPersist! : p));
        if (!currentCache.some(p => p.id === id)) {
          updatedCache.unshift(targetToPersist);
        }
        saveLocalQuizProgramsCache(updatedCache);
      } catch (err) {
        console.warn('saveLocalQuizProgramsCache warning:', err);
      }
    }

    addAuditLog('Quiz Program Updated', 'Quiz', `Updated quiz program ID ${id}`);

    // 3. Await database persistence so subsequent calls (like refreshQuizPrograms) get the fresh DB state
    if (targetToPersist) {
      try {
        const ok = await upsertQuizProgram(targetToPersist);
        return ok;
      } catch (err) {
        console.error('upsertQuizProgram error:', err);
        return false;
      }
    }

    return true;
  };

  const deleteQuizProgram = (id: string) => {
    setQuizPrograms(prev => prev.filter(p => p.id !== id));
    deleteQuizProgramFromDb(id).catch(console.error);
    addAuditLog('Quiz Program Deleted', 'Quiz', `Deleted quiz program ID ${id}`);
  };

  // ─── Quiz Program Questions Actions ─────────────────────────────────────
  const getProgramQuestions = (programId: string): QuizQuestion[] => {
    const qIds = programQuestionMappings[programId] || getLocalProgramQuestionsCache(programId);
    if (qIds.length > 0) {
      const qMap = new Map(questions.map(q => [q.id, q]));
      const matched = qIds.map(id => qMap.get(id)).filter(Boolean) as QuizQuestion[];
      if (matched.length > 0) return matched;
    }
    const prog = quizPrograms.find(p => p.id === programId);
    if (prog && prog.category) {
      const catMatched = questions.filter(q =>
        q.category.toLowerCase().includes(prog.category.toLowerCase()) ||
        prog.category.toLowerCase().includes(q.category.toLowerCase())
      );
      if (catMatched.length > 0) return catMatched;
    }
    return questions.slice(0, prog?.totalQuestions || 10);
  };

  const setProgramQuestions = async (programId: string, questionIds: string[]) => {
    setProgramQuestionMappings(prev => ({ ...prev, [programId]: questionIds }));
    await saveProgramQuestions(programId, questionIds);
    addAuditLog('Program Questions Updated', 'Quiz', `Updated ${questionIds.length} questions for program ID ${programId}`);
  };

  const createAndAssignQuestionToProgram = async (
    programId: string,
    questionData: Omit<QuizQuestion, 'id'>
  ): Promise<QuizQuestion | null> => {
    const created = await createAndAssignQuestion(programId, questionData);
    if (created) {
      setQuestions(prev => [created, ...prev.filter(q => q.id !== created.id)]);
      setProgramQuestionMappings(prev => {
        const existing = prev[programId] || [];
        if (!existing.includes(created.id)) {
          return { ...prev, [programId]: [...existing, created.id] };
        }
        return prev;
      });
      addAuditLog('Question Created & Assigned', 'Quiz', `Created question "${created.questionText.slice(0, 30)}..." and linked to program ${programId}`);
    }
    return created;
  };

  const smartAutoFillProgramQuestions = async (
    programId: string,
    count: number,
    category?: string
  ): Promise<string[]> => {
    const current = programQuestionMappings[programId] || getLocalProgramQuestionsCache(programId);
    const currentSet = new Set(current);

    const matching = questions.filter(
      q => !currentSet.has(q.id) && (!category || q.category.toLowerCase() === category.toLowerCase())
    );
    const remaining = questions.filter(
      q => !currentSet.has(q.id) && (category ? q.category.toLowerCase() !== category.toLowerCase() : false)
    );
    const candidates = [...matching, ...remaining];

    const needed = Math.max(0, count - current.length);
    const toAdd = candidates.slice(0, needed).map(q => q.id);
    const updated = [...current, ...toAdd];

    await setProgramQuestions(programId, updated);
    return updated;
  };

  const moderateEvaluation = (evalId: string, moderatedScore: number, reason: string) => {
    setEvaluations(prev =>
      prev.map(e =>
        e.id === evalId
          ? { ...e, moderatedScore, moderationReason: reason }
          : e
      )
    );
    addAuditLog('Jury Evaluation Moderated', 'Evaluation', `Moderated evaluation ${evalId} to score ${moderatedScore}. Reason: ${reason}`);
  };

  const addJuryMember = (juryData: Partial<UserProfile> & { name: string; email: string; speciality: string }): UserProfile => {
    const newId = 'usr_evaluator_' + Date.now().toString(36);
    const newJury: UserProfile = {
      id: newId,
      name: juryData.name,
      email: juryData.email,
      mobile: juryData.mobile || '+91 98000 ' + Math.floor(10000 + Math.random() * 90000),
      role: 'evaluator',
      state: juryData.state || 'Delhi NCR',
      city: juryData.city || 'New Delhi',
      nationality: 'Indian',
      instituteName: juryData.organization || juryData.instituteName || 'AIMA-ICRC National Jury Panel',
      organization: juryData.organization || juryData.instituteName || 'National Strategy Council',
      designation: juryData.designation || 'Senior Case Evaluator & Jury Member',
      speciality: juryData.speciality,
      secondarySpeciality: juryData.secondarySpeciality || 'General Strategic Management',
      experienceYears: Number(juryData.experienceYears) || 12,
      allocatedCasesCount: 0,
      maxAllocationQuota: Number(juryData.maxAllocationQuota) || 10,
      isAvailableForEvaluation: true,
      isVerified: true,
    };
    setUsers(prev => [...prev, newJury]);
    addAuditLog('Jury Member Appointed', 'Evaluation', `Appointed jury evaluator "${newJury.name}" (${newJury.speciality})`);
    return newJury;
  };

  const updateJuryMember = (userId: string, data: Partial<UserProfile>) => {
    setUsers(prev => prev.map(u => (u.id === userId ? { ...u, ...data } : u)));
    addAuditLog('Jury Member Updated', 'Evaluation', `Updated jury evaluator profile ${userId}`);
  };

  const deleteJuryMember = (userId: string) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    addAuditLog('Jury Member Removed', 'Evaluation', `Removed jury evaluator ${userId}`);
  };

  const autoAllocateCasesToJury = () => {
    const juryMembers = users.filter(u => u.role === 'evaluator' && u.isAvailableForEvaluation !== false);
    if (juryMembers.length === 0) {
      return { allocatedCount: 0, details: [] };
    }

    const submissions = teams
      .filter(t => t.r2Submission)
      .map(t => ({ team: t, sub: t.r2Submission! }));

    const allocatedDetails: Array<{ teamName: string; caseTitle: string; juryName: string; speciality: string }> = [];

    submissions.forEach((item, index) => {
      const title = item.sub.caseTitle.toLowerCase();
      // Try to find jury with matching speciality and no conflict
      let matchedJury = juryMembers.find(j => {
        if (j.instituteName && item.team.instituteName && j.instituteName.toLowerCase().includes(item.team.instituteName.toLowerCase())) {
          return false; // Prevent conflict of interest
        }
        const spec = (j.speciality || '').toLowerCase();
        if (title.includes('ev') || title.includes('vehicle') || title.includes('electric') || title.includes('mobility')) {
          return spec.includes('strategy') || spec.includes('operations');
        }
        if (title.includes('fintech') || title.includes('bank') || title.includes('microfinance') || title.includes('finance')) {
          return spec.includes('finan') || spec.includes('valuation');
        }
        if (title.includes('supply') || title.includes('cold chain') || title.includes('logistics') || title.includes('retail')) {
          return spec.includes('supply') || spec.includes('operations');
        }
        if (title.includes('ai') || title.includes('tech') || title.includes('digital') || title.includes('platform')) {
          return spec.includes('tech') || spec.includes('ai');
        }
        return false;
      });

      if (!matchedJury) {
        // Fallback: round-robin assignment avoiding direct institution match
        matchedJury = juryMembers.find(j => !(j.instituteName && item.team.instituteName && j.instituteName.toLowerCase().includes(item.team.instituteName.toLowerCase()))) || juryMembers[index % juryMembers.length];
      }

      allocatedDetails.push({
        teamName: item.team.name,
        caseTitle: item.sub.caseTitle,
        juryName: matchedJury.name,
        speciality: matchedJury.speciality || 'Strategic Management',
      });
    });

    addAuditLog(
      'Auto-Allocation Run',
      'Evaluation',
      `Auto-allocated ${allocatedDetails.length} case decks to ${juryMembers.length} certified jury evaluators based on subject specialities.`
    );

    return {
      allocatedCount: allocatedDetails.length,
      details: allocatedDetails,
    };
  };

  const addRegionalHub = (hub: RegionalHub) => {
    setHubs(prev => [...prev.filter(h => h.id !== hub.id), hub]);
    addAuditLog('Regional Hub Added', 'Regional', `Added/Configured hub ${hub.name} (${hub.city})`);
  };

  const updateRegionalHub = (hubId: RegionHubId | string, hubData: Partial<RegionalHub>) => {
    setHubs(prev => prev.map(h => (h.id === hubId ? { ...h, ...hubData } : h)));
    addAuditLog('Regional Hub Updated', 'Regional', `Updated hub ${hubId}`);
  };

  const assignHubCoordinator = (hubId: RegionHubId | string, coordinator: { name: string; email: string; mobile?: string; designation?: string }) => {
    setHubs(prev =>
      prev.map(h =>
        h.id === hubId
          ? {
            ...h,
            coordinatorName: coordinator.name,
            coordinatorEmail: coordinator.email,
            coordinatorMobile: coordinator.mobile || h.coordinatorMobile,
            coordinatorDesignation: coordinator.designation || h.coordinatorDesignation,
          }
          : h
      )
    );

    // Also register or update user profile with role regional_hub
    const existingCoordinator = users.find(u => u.email.toLowerCase() === coordinator.email.toLowerCase());
    if (existingCoordinator) {
      setUsers(prev =>
        prev.map(u =>
          u.id === existingCoordinator.id
            ? { ...u, name: coordinator.name, mobile: coordinator.mobile || u.mobile, assignedHub: hubId as RegionHubId, role: 'regional_hub' }
            : u
        )
      );
    } else {
      const newCoordUser: UserProfile = {
        id: 'usr_hub_coord_' + Date.now().toString(36),
        name: coordinator.name,
        email: coordinator.email,
        mobile: coordinator.mobile || '+91 98100 ' + Math.floor(10000 + Math.random() * 90000),
        role: 'regional_hub',
        state: 'India',
        city: hubs.find(h => h.id === hubId)?.city || 'Regional Center',
        nationality: 'Indian',
        instituteName: hubs.find(h => h.id === hubId)?.hostInstitute || 'Regional Host Campus',
        assignedHub: hubId as RegionHubId,
        isVerified: true,
      };
      setUsers(prev => [...prev, newCoordUser]);
    }

    addAuditLog(
      'Regional Hub Coordinator Assigned',
      'Regional',
      `Assigned "${coordinator.name}" (${coordinator.email}) to manage Hub: ${hubId}`
    );
  };

  const registerTeamWithPayment = async (formData: {
    leaderName: string;
    leaderEmail: string;
    leaderMobile: string;
    instituteName: string;
    programme: string;
    specialisation?: string;
    yearSemester?: string;
    studentIdCardNumber?: string;
    teamName: string;
    preferredHub: RegionHubId;
    members: Array<{ name: string; email: string; mobile: string; collegeRollNo?: string }>;
    paymentMethod: 'upi_qr' | 'upi_vpa' | 'card' | 'netbanking' | 'voucher';
    voucherCode?: string;
    amount: number;
  }) => {
    const transactionId = 'TXN_AIMA_' + Date.now().toString(36).toUpperCase() + '_' + Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = 'INV-2026-GST-' + Math.floor(10000 + Math.random() * 90000);
    const leaderId = 'usr_stu_' + Date.now().toString(36);
    const teamId = 'team_' + Date.now().toString(36);
    const inviteCode = (formData.teamName.replace(/[^A-Za-z0-9]/g, '').slice(0, 4) + '-2026-' + Math.floor(10 + Math.random() * 90)).toUpperCase();

    const newLeader: UserProfile = {
      id: leaderId,
      name: formData.leaderName,
      email: formData.leaderEmail,
      mobile: formData.leaderMobile,
      role: 'team_leader',
      instituteName: formData.instituteName,
      programme: formData.programme || 'MBA / PGDM',
      specialisation: formData.specialisation || 'General Management',
      yearSemester: formData.yearSemester || '1st Year',
      studentIdCardNumber: formData.studentIdCardNumber || 'AIMA-STU-' + Math.floor(10000 + Math.random() * 90000),
      teamId: teamId,
      isTeamLeader: true,
      hasPaidR1R2: true,
      hasPaidR3: false,
      hasPaidR4: false,
      assignedHub: formData.preferredHub || 'north',
      isVerified: true,
      idCardUploaded: true,
      qualificationStatus: {
        r1Qualified: false,
        r2Qualified: false,
        r3Qualified: false,
        r4Finalist: false,
      },
    };

    const teamMembers: TeamMember[] = [
      {
        studentId: leaderId,
        name: formData.leaderName,
        email: formData.leaderEmail,
        mobile: formData.leaderMobile,
        institute: formData.instituteName,
        isLeader: true,
        hasPaid: true,
        acceptedDeclaration: true,
        roleInTeam: 'Team Leader & Lead Strategist',
      },
      ...formData.members.map((m, idx) => ({
        studentId: 'usr_mem_' + Date.now().toString(36) + '_' + idx,
        name: m.name,
        email: m.email,
        mobile: m.mobile,
        institute: formData.instituteName,
        isLeader: false,
        hasPaid: true,
        acceptedDeclaration: true,
        roleInTeam: idx === 0 ? 'Financial Analyst' : idx === 1 ? 'Market Researcher' : 'Operations Specialist',
      })),
    ];

    const newTeam: Team = {
      id: teamId,
      name: formData.teamName,
      inviteCode: inviteCode,
      leaderId: leaderId,
      leaderName: formData.leaderName,
      instituteName: formData.instituteName,
      members: teamMembers,
      isLocked: true,
      createdAt: new Date().toISOString().split('T')[0],
      assignedHub: formData.preferredHub || 'north',
      preferredHub: formData.preferredHub || 'north',
    };

    setUsers(prev => [newLeader, ...prev]);
    setTeams(prev => [newTeam, ...prev]);
    setCurrentUser(newLeader);

    const mapPaymentMethod = (m: string): 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon' => {
      if (m.startsWith('upi')) return 'UPI';
      if (m === 'card') return 'Credit Card';
      if (m === 'netbanking') return 'Net Banking';
      if (m === 'voucher') return 'Waiver/Coupon';
      return 'UPI';
    };

    const hubNames: Record<string, string> = {
      north: 'Northern Regional Hub (New Delhi)',
      west: 'Western Regional Hub (Mumbai)',
      south: 'Southern Regional Hub (Bengaluru)',
      east: 'Eastern Regional Hub (Kolkata)',
      central: 'Central Regional Hub (Bhopal)',
    };
    const teamBaseAmt = Math.round((formData.amount / 1.18) * 100) / 100;
    const teamGstAmt = Math.round((formData.amount - teamBaseAmt) * 100) / 100;
    const teamHub = formData.preferredHub || 'north';

    const newPayment: PaymentRecord = {
      id: 'pay_' + Date.now().toString(36),
      transactionId: transactionId,
      userId: leaderId,
      userName: formData.leaderName,
      teamId: teamId,
      teamName: formData.teamName,
      instituteName: formData.instituteName,
      regionHub: teamHub,
      regionName: hubNames[teamHub] || 'Northern Regional Hub (New Delhi)',
      amount: formData.amount,
      baseAmount: teamBaseAmt,
      gstAmount: teamGstAmt,
      gstRate: 18,
      gstType: teamHub === 'north' ? 'CGST+SGST' : 'IGST',
      hsnSacCode: '999293',
      itemDescription: `Team Screening Package (${teamMembers.length} Members)`,
      stage: 'round_1_2',
      paymentMethod: mapPaymentMethod(formData.paymentMethod),
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      gstInvoiceNumber: invoiceNumber,
      couponCode: formData.voucherCode,
    };
    setPayments(prev => [newPayment, ...prev]);

    addAuditLog(
      'Team Registered & Paid',
      'Registration',
      `Registered team "${formData.teamName}" (${teamMembers.length} members) from ${formData.instituteName}. Txn: ${transactionId}, Inv: ${invoiceNumber}`
    );

    // Dispatch registration confirmation email to leader and team members with login credentials
    if (formData.leaderEmail) {
      const leaderPassword = generateDefaultPassword(formData.leaderName, formData.leaderMobile || '');
      sendRegistrationConfirmation({
        toName: formData.leaderName,
        toEmail: formData.leaderEmail,
        registrationNumber: inviteCode,
        teamName: formData.teamName,
        instituteName: formData.instituteName,
        username: formData.leaderEmail,
        password: leaderPassword,
        isIndividual: false,
        roleInTeam: 'Team Leader',
      }).catch(e => console.warn('[Email] Leader registration email error:', e));
    }
    formData.members?.forEach(m => {
      if (m.email && m.email !== formData.leaderEmail) {
        const memPassword = generateDefaultPassword(m.name, m.mobile || '');
        sendRegistrationConfirmation({
          toName: m.name,
          toEmail: m.email,
          registrationNumber: inviteCode,
          teamName: formData.teamName,
          instituteName: formData.instituteName,
          username: m.email,
          password: memPassword,
          isIndividual: false,
          roleInTeam: (m as any).roleInTeam || 'Team Member',
        }).catch(e => console.warn('[Email] Member registration email error:', e));
      }
    });

    return {
      success: true,
      team: newTeam,
      leader: newLeader,
      transactionId,
      invoiceNumber,
    };
  };

  const registerInstituteWithPayment = async (formData: {
    instituteName: string;
    code: string;
    state: string;
    city: string;
    coordinatorName: string;
    coordinatorEmail: string;
    coordinatorMobile: string;
    studentBatchSize: number;
    amount: number;
    paymentMethod: 'upi_qr' | 'upi_vpa' | 'card' | 'netbanking' | 'voucher' | 'neft_challan';
  }) => {
    const transactionId = 'TXN_INST_' + Date.now().toString(36).toUpperCase() + '_' + Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = 'INV-2026-INST-' + Math.floor(10000 + Math.random() * 90000);
    const voucherCode = 'AIMA-INST-' + (formData.code || 'BCH').toUpperCase() + '-' + Math.floor(100 + Math.random() * 900);
    const instId = 'inst_' + Date.now().toString(36);

    const newInst: InstitutionalProfile = {
      id: instId,
      name: formData.instituteName,
      code: formData.code || 'INST-' + Math.floor(100 + Math.random() * 900),
      state: formData.state || 'India',
      city: formData.city || 'Campus',
      coordinatorName: formData.coordinatorName,
      coordinatorEmail: formData.coordinatorEmail,
      coordinatorMobile: formData.coordinatorMobile,
      authLetterUploaded: true,
      isApproved: true,
      totalStudents: Number(formData.studentBatchSize) || 25,
      registeredStudents: Number(formData.studentBatchSize) || 25,
      teamsCreated: Math.ceil((Number(formData.studentBatchSize) || 25) / 4),
      totalPaidAmount: formData.amount,
    };

    const newCoordUser: UserProfile = {
      id: 'usr_inst_' + Date.now().toString(36),
      name: formData.coordinatorName,
      email: formData.coordinatorEmail,
      mobile: formData.coordinatorMobile,
      role: 'institute_coordinator',
      state: formData.state,
      city: formData.city,
      nationality: 'Indian',
      instituteName: formData.instituteName,
      instituteId: instId,
      programme: 'Institutional Faculty SPOC / Dean of Competitions',
      isVerified: true,
    };

    setInstitutions(prev => [newInst, ...prev]);
    setUsers(prev => [newCoordUser, ...prev]);

    const mapPaymentMethod = (m: string): 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon' => {
      if (m.startsWith('upi')) return 'UPI';
      if (m === 'card') return 'Credit Card';
      if (m === 'netbanking') return 'Net Banking';
      if (m === 'voucher') return 'Waiver/Coupon';
      return 'Net Banking';
    };

    const instBaseAmt = Math.round((formData.amount / 1.18) * 100) / 100;
    const instGstAmt = Math.round((formData.amount - instBaseAmt) * 100) / 100;

    const newPayment: PaymentRecord = {
      id: 'pay_' + Date.now().toString(36),
      transactionId: transactionId,
      userId: newCoordUser.id,
      userName: formData.coordinatorName,
      instituteId: instId,
      instituteName: formData.instituteName,
      billingState: formData.state,
      regionHub: 'national',
      regionName: 'Institutional Accredited Cohort (National)',
      amount: formData.amount,
      baseAmount: instBaseAmt,
      gstAmount: instGstAmt,
      gstRate: 18,
      gstType: 'IGST',
      hsnSacCode: '999293',
      itemDescription: `Institutional Bulk Pass (${formData.studentBatchSize} Students Cohort)`,
      stage: 'bulk_institutional',
      paymentMethod: mapPaymentMethod(formData.paymentMethod),
      status: 'SUCCESS',
      timestamp: new Date().toISOString(),
      gstInvoiceNumber: invoiceNumber,
      couponCode: voucherCode,
    };
    setPayments(prev => [newPayment, ...prev]);

    addAuditLog(
      'Institutional Cohort Enrolled',
      'Institute',
      `Enrolled "${formData.instituteName}" for batch of ${formData.studentBatchSize} students. Voucher: ${voucherCode}, Inv: ${invoiceNumber}`
    );

    // Dispatch registration confirmation to institute coordinator
    if (formData.coordinatorEmail) {
      const coordPassword = generateDefaultPassword(formData.coordinatorName, formData.coordinatorMobile || '2026');
      sendRegistrationConfirmation({
        toName: formData.coordinatorName,
        toEmail: formData.coordinatorEmail,
        registrationNumber: voucherCode,
        teamName: formData.instituteName,
        instituteName: formData.instituteName,
        username: formData.coordinatorEmail,
        password: coordPassword,
        roleInTeam: 'Faculty / Institutional Coordinator',
      }).catch(e => console.warn('[Email] Institute registration email error:', e));
    }

    return {
      success: true,
      institution: newInst,
      voucherCode,
      invoiceNumber,
    };
  };

  const registerCSRBootcamp = (data: Omit<CSRBootcampRegistration, 'id' | 'createdAt' | 'emailDispatchedAt' | 'secretariatEmailSent' | 'registrantEmailSent'>) => {
    const regId = 'csr_reg_' + Date.now().toString(36);
    const now = new Date().toISOString();

    const newReg: CSRBootcampRegistration = {
      ...data,
      id: regId,
      createdAt: now,
      emailDispatchedAt: now,
      secretariatEmailSent: true,
      registrantEmailSent: true,
      quizProgramId: data.quizProgramId || 'qp_case_comp_stage1_2026',
    };

    const newEmailLog: CSREmailLog = {
      id: 'csr_mail_' + Date.now().toString(36),
      to: 'enayyar@aima.in',
      cc: data.coordinator.email,
      subject: `[AIMA Secretariat] New Registration: Certified CSR Leader Bootcamp - ${data.organizationName}`,
      timestamp: now,
      status: 'DELIVERED',
      registrationId: regId,
      registrationNumber: data.registrationNumber,
      organizationName: data.organizationName,
      participantCount: data.participantCount,
      totalAmount: data.totalPayable,
      invoiceNumber: data.invoiceNumber,
      bodySnippet: `New registration initiated by ${data.organizationName} for ${data.participantCount} participant(s). Tier: ${data.tierLabel}. Status: ${data.paymentStatus === 'PAID' ? 'PAID & CONFIRMED' : 'PENDING PROFORMA INVOICE / PO CLEARANCE'}. Invoice #${data.invoiceNumber}. Nominees: ${data.nominees.map(n => n.name).join(', ')}.`,
    };

    setCsrRegistrations(prev => [newReg, ...prev]);
    setCsrEmailLogs(prev => [newEmailLog, ...prev]);

    // Dynamically increment enrolled count for Stage 1 Quiz Program
    const addedCandidates = Number(data.participantCount || (Array.isArray(data.nominees) ? data.nominees.length : 0) || 1);
    setQuizPrograms(prev => prev.map(p => {
      if (p.id === 'qp_case_comp_stage1_2026') {
        return { ...p, enrolledCount: (p.enrolledCount || 0) + addedCandidates };
      }
      return p;
    }));

    // Financial & GST Ledger Integration
    const mapPaymentMethod = (m?: string): 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon' => {
      if (!m) return 'Net Banking';
      if (m.includes('UPI')) return 'UPI';
      if (m.includes('Credit')) return 'Credit Card';
      if (m.includes('Debit')) return 'Debit Card';
      if (m.includes('Waiver') || m.includes('Coupon')) return 'Waiver/Coupon';
      return 'Net Banking';
    };

    const newPayment: PaymentRecord = {
      id: 'pay_csr_' + Date.now().toString(36),
      transactionId: data.transactionId || ('TXN-PENDING-PO-' + Math.floor(100000 + Math.random() * 900000)),
      userId: 'usr_csr_' + Date.now().toString(36),
      userName: data.coordinator.name,
      teamName: data.organizationName,
      instituteName: data.organizationName,
      billingState: data.state,
      payerGstin: data.gstin,
      regionHub: 'north',
      regionName: 'Northern Regional Hub (New Delhi)',
      amount: data.totalPayable,
      baseAmount: data.subtotalExclGst,
      gstAmount: data.gstAmount,
      gstRate: 18,
      gstType: data.gstType,
      hsnSacCode: '999293',
      itemDescription: `Certified CSR Leader Bootcamp (27-28 Oct 2026) - ${data.tierLabel} (${data.participantCount} Nominees)`,
      stage: data.track === 'institutional' ? 'bulk_institutional' : 'round_1_2',
      paymentMethod: mapPaymentMethod(data.paymentMethod),
      status: data.paymentStatus === 'PAID' ? 'SUCCESS' : 'PENDING',
      timestamp: now,
      gstInvoiceNumber: data.invoiceNumber,
    };

    setPayments(prev => [newPayment, ...prev]);

    addAuditLog(
      'CSR Bootcamp Registration Captured',
      'Registration',
      `Registered "${data.organizationName}" (${data.participantCount} nominees). Tier: ${data.tierLabel}. Status: ${data.paymentStatus}. Details automatically dispatched to enayyar@aima.in. Ref: ${data.registrationNumber}, Inv: ${data.invoiceNumber}`
    );

    // Dynamic Supabase Persistence
    saveRegistrationToSupabase(newReg).catch(err => {
      console.warn('Supabase dynamic save error (cached locally):', err);
    });

    // Dispatch registration confirmation email with login credentials
    try {
      const isSolo = data.track === 'corporate_individual' || (Array.isArray(data.nominees) && data.nominees.length === 1);

      if (isSolo) {
        // Solo / Individual registration -> send exactly one email to this solo person with credentials
        const soloNominee = (Array.isArray(data.nominees) && data.nominees.length > 0)
          ? data.nominees[0]
          : { name: data.coordinator?.name || 'Participant', email: data.coordinator?.email, mobile: data.coordinator?.mobile };

        const soloEmail = soloNominee.email || data.coordinator?.email;
        if (soloEmail) {
          const soloPassword = (soloNominee as any).password || generateDefaultPassword(soloNominee.name, soloNominee.mobile || data.coordinator?.mobile || '');
          sendRegistrationConfirmation({
            toName: soloNominee.name,
            toEmail: soloEmail,
            registrationNumber: data.registrationNumber,
            teamName: 'Solo / Individual Track',
            instituteName: data.organizationName,
            username: soloEmail,
            password: soloPassword,
            isIndividual: true,
          }).catch(e => console.warn('[Email] Solo registration email error:', e));
        }
      } else {
        // Team registration -> send email to EVERY team member with their own credentials
        if (Array.isArray(data.nominees)) {
          data.nominees.forEach((nominee, idx) => {
            if (nominee.email) {
              const memberPassword = nominee.password || generateDefaultPassword(nominee.name, nominee.mobile || '');
              sendRegistrationConfirmation({
                toName: nominee.name,
                toEmail: nominee.email,
                registrationNumber: data.registrationNumber,
                teamName: data.organizationName,
                instituteName: data.organizationName,
                username: nominee.email,
                password: memberPassword,
                isIndividual: false,
                roleInTeam: nominee.isTeamLeader || idx === 0 ? 'Team Leader' : 'Team Member',
              }).catch(e => console.warn('[Email] Team member confirmation email error:', e));
            }
          });
        }
        // If there is a separate institutional coordinator who is not a competing team member, send them the coordinator confirmation
        if (data.coordinator?.email && !data.nominees?.some(n => n.email?.toLowerCase() === data.coordinator?.email?.toLowerCase())) {
          sendRegistrationConfirmation({
            toName: data.coordinator.name || 'Coordinator',
            toEmail: data.coordinator.email,
            registrationNumber: data.registrationNumber,
            teamName: data.organizationName,
            instituteName: data.organizationName,
            username: data.coordinator.email,
            password: generateDefaultPassword(data.coordinator.name || 'Coordinator', data.coordinator.mobile || '2026'),
            isIndividual: false,
            roleInTeam: 'Faculty / Institutional Coordinator',
          }).catch(e => console.warn('[Email] Coordinator confirmation email error:', e));
        }
      }
    } catch (e) {
      console.warn('[Email] Error dispatching registration confirmation emails:', e);
    }

    return {
      registration: newReg,
      emailLog: newEmailLog,
    };
  };

  const updateCSRPayment = (registrationId: string, paymentMethod: string, transactionId: string) => {
    const paidAt = new Date().toISOString();
    let updatedInvoice = '';
    let targetRegNumber = '';
    setCsrRegistrations(prev =>
      prev.map(r => {
        if (r.id === registrationId) {
          targetRegNumber = r.registrationNumber;
          updatedInvoice = r.invoiceNumber.startsWith('PINV-')
            ? r.invoiceNumber.replace('PINV-', 'INV-')
            : r.invoiceNumber;
          return {
            ...r,
            paymentStatus: 'PAID',
            paymentMethod: paymentMethod as any,
            transactionId,
            invoiceNumber: updatedInvoice,
            paidAt,
          };
        }
        return r;
      })
    );

    // Dynamic Supabase Payment Update
    updateRegistrationPaymentInSupabase(
      targetRegNumber || registrationId,
      'PAID',
      paymentMethod,
      transactionId
    ).catch(err => {
      console.warn('Supabase payment sync error:', err);
    });

    setPayments(prev =>
      prev.map(p => {
        if (p.gstInvoiceNumber && (p.gstInvoiceNumber === updatedInvoice || p.gstInvoiceNumber.replace('INV-', 'PINV-') === updatedInvoice)) {
          return {
            ...p,
            status: 'SUCCESS',
            transactionId,
            gstInvoiceNumber: updatedInvoice || p.gstInvoiceNumber,
            paymentMethod: (paymentMethod.includes('UPI') ? 'UPI' : paymentMethod.includes('Card') ? 'Credit Card' : 'Net Banking') as any,
          };
        }
        return p;
      })
    );

    addAuditLog(
      'CSR Payment Cleared',
      'Payment',
      `Payment cleared for CSR Registration ${registrationId}. Txn: ${transactionId}, Method: ${paymentMethod}`
    );
  };

  const addInstitution = (inst: Omit<InstitutionalProfile, 'id'>) => {
    const newInst: InstitutionalProfile = {
      id: 'inst_' + Date.now().toString(36),
      ...inst,
    };
    setInstitutions(prev => [newInst, ...prev]);
    addAuditLog('Institution Enrolled', 'Institute', `Enrolled institution "${inst.name}" (${inst.code})`);
  };

  const updateInstitution = (id: string, instData: Partial<InstitutionalProfile>) => {
    setInstitutions(prev => prev.map(i => (i.id === id ? { ...i, ...instData } : i)));
    addAuditLog('Institution Updated', 'Institute', `Updated institutional profile ${id}`);
  };

  const evaluateSubmission = (evalData: any) => {
    const strategicClarity = Number(evalData.strategicClarity) || Number(evalData.r2_c1) || 20;
    const financialFeasibility = Number(evalData.financialFeasibility) || Number(evalData.r2_c2) || 20;
    const implementationRoadmap = Number(evalData.implementationRoadmap) || Number(evalData.r2_c6) || 20;
    const deckDesignAndVisuals = Number(evalData.deckDesignAndVisuals) || Number(evalData.r2_c8) || 20;
    const totalScore = Number(evalData.weightedTotal) || Number(evalData.totalScore) || (strategicClarity + financialFeasibility + implementationRoadmap + deckDesignAndVisuals);

    submitEvaluation({
      submissionId: evalData.submissionId || 'sub_default',
      teamId: evalData.teamId || teams.find(t => t.r2Submission?.id === evalData.submissionId)?.id || userTeam?.id || 'team_stratapex',
      evaluatorId: evalData.evaluatorId || currentUser.id,
      evaluatorName: evalData.evaluatorName || currentUser.name,
      scores: {
        r2_c1: strategicClarity,
        r2_c2: financialFeasibility,
        r2_c6: implementationRoadmap,
        r2_c8: deckDesignAndVisuals,
      },
      weightedTotal: totalScore,
      comments: evalData.generalRemarks || evalData.summaryCritique || (evalData.strengths ? `Strengths: ${Array.isArray(evalData.strengths) ? evalData.strengths.join('; ') : evalData.strengths}` : 'Strong presentation and strategy.'),
      isLocked: false,
    });
  };

  const caseSubmissions: CaseSubmission[] = teams
    .map(t => t.r2Submission)
    .filter(Boolean) as CaseSubmission[];

  const activeSubmission: CaseSubmission | null = userTeam?.r2Submission || caseSubmissions[0] || null;

  return (
    <CompetitionContext.Provider
      value={{
        theme,
        toggleTheme,
        currentUser,
        setCurrentUser,
        switchRole,
        activeView,
        setActiveView,
        config,
        updateConfig,
        users,
        addUser,
        updateUser,
        deleteUser,
        verifyUserStudentId,
        updateUserQualification,
        teams,
        userTeam,
        currentTeam: userTeam,
        createTeam,
        joinTeam,
        addTeamMember,
        leaveTeam,
        lockTeam,
        selectTeamTrack,
        requestDeadlineExtension,
        reviewDeadlineExtension,
        updateTeamDeadline,
        updateUserProfile,
        processPayment,
        makePayment,
        quizPrograms,
        addQuizProgram,
        updateQuizProgram,
        deleteQuizProgram,
        refreshQuizPrograms,
        programQuestionMappings,
        getProgramQuestions,
        setProgramQuestions,
        createAndAssignQuestionToProgram,
        smartAutoFillProgramQuestions,
        questions,
        quizAttempts,
        refreshQuizAttempts,
        saveQuizProgress,
        submitQuiz,
        addQuestion,
        addQuestionsBulk,
        updateQuestion,
        deleteQuestion,
        isQuizActive,
        setIsQuizActive,
        caseSubmissions,
        activeSubmission,
        submitCaseDeck,
        requestAiCaseAssessment,
        aiEvaluations,
        setAiEvaluations,
        rubricR2,
        rubricR3,
        rubricR4,
        updateRubricCriterion,
        evaluations,
        submitEvaluation,
        evaluateSubmission,
        declareConflictOfInterest,
        moderateEvaluation,
        addJuryMember,
        updateJuryMember,
        deleteJuryMember,
        autoAllocateCasesToJury,
        hubs,
        addRegionalHub,
        updateRegionalHub,
        updateHubCapacity,
        assignHubCoordinator,
        assignTeamHub,
        verifyAttendance,
        schedulePresentationSlot,
        submitRegionalJuryScore,
        institutions,
        addInstitution,
        updateInstitution,
        createInstitutionalTeam,
        bulkRegisterStudents,
        processInstitutionalPayment,
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        offlineRoundResults,
        recordOfflineResultsBulk,
        updateOfflineResult,
        deleteOfflineResult,
        showRegistrationModal,
        setShowRegistrationModal,
        registrationModalTrack,
        openRegistrationModal,
        registerTeamWithPayment,
        registerInstituteWithPayment,
        csrRegistrations,
        csrEmailLogs,
        registerCSRBootcamp,
        updateCSRPayment,
        certificates,
        setCertificates,
        activeCertificateModal,
        setActiveCertificateModal,
        activeVerifierModal,
        setActiveVerifierModal,
        generateCertificate,
        publishOfficialCertificates,
        verifyCertificateCode,
        declareRound1Results,
        declareFinalResults,
        supportTickets,
        createSupportTicket,
        updateTicketStatus,
        activeSupportModal,
        setActiveSupportModal,
        auditLogs,
        addAuditLog,
        announcements,
        addAnnouncement,
        payments,
        adminActiveTab,
        setAdminActiveTab,
        targetRequirementSection,
        targetRequirementClause,
        setTargetRequirement,
        navigateToFeature,
        isChatOpen,
        setIsChatOpen,
        initialChatQuery,
        openChatWithQuery,
        participantUser,
        loginParticipantSession,
        logoutParticipant,
        logoutParticipantSession: logoutParticipant,
      }}
    >
      {children}
    </CompetitionContext.Provider>
  );
};

export const useCompetition = () => {
  const context = useContext(CompetitionContext);
  if (!context) {
    throw new Error('useCompetition must be used within CompetitionProvider');
  }
  return context;
};
