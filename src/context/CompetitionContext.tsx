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
} from '../types';
import {
  INITIAL_CONFIG,
  ROUND_2_RUBRIC,
  ROUND_3_RUBRIC,
  ROUND_4_RUBRIC,
  REGIONAL_HUBS,
  QUIZ_QUESTIONS,
  MOCK_QUIZ_PROGRAMS,
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
} from '../data/mockData';

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
  leaveTeam: () => void;
  lockTeam: (teamId: string) => void;
  
  // Registration & Payment
  updateUserProfile: (data: Partial<UserProfile>) => void;
  processPayment: (stage: 'round_1_2' | 'round_3' | 'round_4', method: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon', couponCode?: string) => Promise<{ success: boolean; message: string; receiptNumber?: string }>;
  makePayment: (stage?: string, amount?: number, method?: string) => Promise<{ success: boolean; message: string; receiptNumber?: string }>;
  
  // Quiz Programs & Module
  quizPrograms: QuizProgram[];
  addQuizProgram: (program: Omit<QuizProgram, 'id' | 'enrolledCount' | 'completedCount' | 'inProgressCount'>) => QuizProgram;
  updateQuizProgram: (id: string, program: Partial<QuizProgram>) => void;
  deleteQuizProgram: (id: string) => void;
  questions: QuizQuestion[];
  quizAttempts: QuizAttempt[];
  saveQuizProgress: (attemptId: string, answers: Record<string, number>, marked: string[], tabSwitches: number) => void;
  submitQuiz: (answers: Record<string, number>, marked: string[], timeTaken: number, tabSwitches: number) => QuizAttempt;
  addQuestion: (q: Omit<QuizQuestion, 'id'>) => void;
  addQuestionsBulk: (newQuestions: Omit<QuizQuestion, 'id'>[]) => number;
  updateQuestion: (id: string, q: Partial<QuizQuestion>) => void;
  deleteQuestion: (id: string) => void;
  
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
  bulkRegisterStudents: (instId: string, csvData: Array<Record<string, string>>) => { added: number; errors: string[] };
  processInstitutionalPayment: (instId: string, amount: number) => void;
  sponsors: CorporateSponsor[];
  addSponsor: (sponsor: Omit<CorporateSponsor, 'id'>) => void;
  updateSponsor: (id: string, sponsor: Partial<CorporateSponsor>) => void;
  deleteSponsor: (id: string) => void;
  
  // Registration Flow with Simulated Gateway
  showRegistrationModal: boolean;
  setShowRegistrationModal: (show: boolean) => void;
  registrationModalTrack: 'team' | 'institute';
  openRegistrationModal: (track?: 'team' | 'institute') => void;
  registerTeamWithPayment: (formData: any) => Promise<{ success: boolean; team: Team; leader: UserProfile; transactionId: string; invoiceNumber: string }>;
  registerInstituteWithPayment: (formData: any) => Promise<{ success: boolean; institution: InstitutionalProfile; voucherCode: string; invoiceNumber: string }>;

  // Certificates & Results
  certificates: CertificateRecord[];
  activeCertificateModal: CertificateRecord | null;
  setActiveCertificateModal: (cert: CertificateRecord | null) => void;
  activeVerifierModal: boolean;
  setActiveVerifierModal: (show: boolean) => void;
  generateCertificate: (cert: Omit<CertificateRecord, 'id' | 'certificateNumber' | 'qrVerificationUrl'>) => CertificateRecord;
  verifyCertificateCode: (certCode: string) => CertificateRecord | undefined;
  
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
}

const CompetitionContext = createContext<CompetitionContextType | null>(null);

const STORAGE_KEY = 'AIMA_ICL_2026_STORAGE_V1';

const INITIAL_QUIZ_ATTEMPTS: QuizAttempt[] = [
  {
    attemptId: 'att_usr_student_leader_1',
    studentId: 'usr_student_leader_1',
    userId: 'usr_student_leader_1',
    teamId: 'team_stratapex',
    startTime: '2026-09-10T10:00:00Z',
    submittedAt: '2026-09-10 14:32:00',
    answers: { q1: 1, q2: 1, q3: 1 },
    markedForReview: [],
    score: 92,
    analyticalScore: 36,
    timeTakenSeconds: 1840,
    tabSwitchCount: 0,
    isCompleted: true,
  },
  {
    attemptId: 'att_usr_student_member_1',
    studentId: 'usr_student_member_1',
    userId: 'usr_student_member_1',
    teamId: 'team_stratapex',
    startTime: '2026-09-10T10:15:00Z',
    submittedAt: '2026-09-10 14:45:00',
    answers: { q1: 1, q2: 1, q3: 1 },
    markedForReview: [],
    score: 89,
    analyticalScore: 34,
    timeTakenSeconds: 1920,
    tabSwitchCount: 0,
    isCompleted: true,
  },
];

export const CompetitionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeView, setActiveView] = useState<string>('public');
  const [config, setConfig] = useState<CompetitionConfig>(INITIAL_CONFIG);
  
  const [users, setUsers] = useState<UserProfile[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]); // default student leader
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [quizPrograms, setQuizPrograms] = useState<QuizProgram[]>(MOCK_QUIZ_PROGRAMS);
  const [questions, setQuestions] = useState<QuizQuestion[]>(QUIZ_QUESTIONS);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>(INITIAL_QUIZ_ATTEMPTS);
  const [aiEvaluations, setAiEvaluations] = useState<Record<string, any>>({});
  const [hubs, setHubs] = useState<RegionalHub[]>(REGIONAL_HUBS);
  const [institutions, setInstitutions] = useState<InstitutionalProfile[]>(MOCK_INSTITUTIONS);
  const [sponsors, setSponsors] = useState<CorporateSponsor[]>(MOCK_SPONSORS);
  const [rubricR2, setRubricR2] = useState<RubricCriterion[]>(ROUND_2_RUBRIC);
  const [rubricR3, setRubricR3] = useState<RubricCriterion[]>(ROUND_3_RUBRIC);
  const [rubricR4, setRubricR4] = useState<RubricCriterion[]>(ROUND_4_RUBRIC);
  const [evaluations, setEvaluations] = useState<Evaluation[]>(MOCK_EVALUATIONS);
  const [certificates, setCertificates] = useState<CertificateRecord[]>(MOCK_CERTIFICATES);
  const [payments, setPayments] = useState<PaymentRecord[]>(MOCK_PAYMENTS);
  const [announcements, setAnnouncements] = useState<Announcement[]>(MOCK_ANNOUNCEMENTS);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(MOCK_SUPPORT_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT_LOGS);

  // Modals & Chatbot
  const [activeCertificateModal, setActiveCertificateModal] = useState<CertificateRecord | null>(null);
  const [activeVerifierModal, setActiveVerifierModal] = useState<boolean>(false);
  const [activeSupportModal, setActiveSupportModal] = useState<boolean>(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState<boolean>(false);
  const [registrationModalTrack, setRegistrationModalTrack] = useState<'team' | 'institute'>('team');
  const [adminActiveTab, setAdminActiveTab] = useState<string>('overview');
  const [targetRequirementSection, setTargetRequirementSection] = useState<string | null>(null);
  const [targetRequirementClause, setTargetRequirementClause] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [initialChatQuery, setInitialChatQuery] = useState<string | null>(null);

  const openRegistrationModal = (track: 'team' | 'institute' = 'team') => {
    setRegistrationModalTrack(track);
    setShowRegistrationModal(true);
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

  // Load / Save from LocalStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('AIMA_THEME') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        if (savedTheme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {
      // ignore
    }
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

  const updateConfig = (newConfig: Partial<CompetitionConfig>) => {
    setConfig(prev => {
      const updated = { ...prev, ...newConfig };
      addAuditLog('Competition Configuration Updated', 'System', `Updated keys: ${Object.keys(newConfig).join(', ')}`);
      return updated;
    });
  };

  const userTeam = teams.find(t => t.id === currentUser.teamId || t.members.some(m => m.studentId === currentUser.id));

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
    if (found.isLocked) {
      return { success: false, message: 'Team roster has been locked by the leader or admin.' };
    }
    if (found.members.length >= 4) {
      return { success: false, message: 'Team is already at maximum capacity (4 members).' };
    }
    if (found.members.some(m => m.studentId === currentUser.id)) {
      return { success: false, message: 'You are already a member of this team.' };
    }

    const updatedMembers = [
      ...found.members,
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

    const updatedTeam = { ...found, members: updatedMembers };
    setTeams(prev => prev.map(t => (t.id === found.id ? updatedTeam : t)));
    updateUserProfile({ teamId: found.id, isTeamLeader: false, role: 'team_member', assignedHub: found.assignedHub });
    addAuditLog('Team Joined', 'Team', `Joined team "${found.name}" via code ${inviteCode}`);
    return { success: true, message: `Successfully joined team "${found.name}"!` };
  };

  const leaveTeam = () => {
    if (!userTeam) return;
    const remainingMembers = userTeam.members.filter(m => m.studentId !== currentUser.id);
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

    const record: PaymentRecord = {
      id: 'pay_' + Date.now(),
      transactionId: txnId,
      userId: currentUser.id,
      userName: currentUser.name,
      teamId: currentUser.teamId,
      amount,
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

  const submitQuiz = (answers: Record<string, number>, marked: string[], timeTaken: number, tabSwitches: number): QuizAttempt => {
    let totalScore = 0;
    let analyticalScore = 0;

    questions.forEach(q => {
      const selected = answers[q.id];
      if (selected !== undefined) {
        if (selected === q.correctAnswerIndex) {
          totalScore += q.marks;
          if (q.category === 'Data Interpretation' || q.category === 'Logical Reasoning') {
            analyticalScore += q.marks;
          }
        } else if (config.r1NegativeMarking) {
          totalScore -= q.negativeMarks;
        }
      }
    });

    const scaledScore = Math.max(0, Math.round(totalScore * (100 / (questions.length * 4))));
    const isQualified = scaledScore >= config.r1CutoffScore;

    const attemptId = 'att_' + currentUser.id;
    const completedAttempt: QuizAttempt = {
      attemptId,
      studentId: currentUser.id,
      userId: currentUser.id,
      teamId: currentUser.teamId,
      startTime: new Date(Date.now() - timeTaken * 1000).toISOString(),
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      answers,
      markedForReview: marked,
      score: scaledScore,
      analyticalScore,
      timeTakenSeconds: timeTaken,
      tabSwitchCount: tabSwitches,
      isCompleted: true,
    };

    setQuizAttempts(prev => [completedAttempt, ...prev.filter(q => q.studentId !== currentUser.id && q.userId !== currentUser.id)]);

    updateUserProfile({
      quizScore: scaledScore,
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
            r1AvgScore: scaledScore,
            r1Qualified: isQualified,
            r1CompletedMembersCount: 1,
          };
        }
        return t;
      });
      setTeams(updatedTeams);
    }

    addAuditLog('Quiz Submitted', 'Quiz', `Completed Round 1 Business Quiz with score ${scaledScore}/100 (Tab switches: ${tabSwitches})`);
    return completedAttempt;
  };

  const addQuestion = (q: Omit<QuizQuestion, 'id'>) => {
    const newQ: QuizQuestion = {
      id: 'q_' + (questions.length + 1) + '_' + Date.now().toString().slice(-4),
      ...q,
    };
    setQuestions(prev => [newQ, ...prev]);
    addAuditLog('Question Added', 'Quiz', `Added new question: "${q.questionText.slice(0, 40)}..."`);
  };

  const addQuestionsBulk = (newQuestions: Omit<QuizQuestion, 'id'>[]): number => {
    if (!newQuestions || newQuestions.length === 0) return 0;
    const formatted: QuizQuestion[] = newQuestions.map((q, idx) => ({
      id: 'q_bulk_' + Date.now().toString(36) + '_' + (idx + 1),
      ...q,
    }));
    setQuestions(prev => [...formatted, ...prev]);
    addAuditLog('Bulk Questions Imported', 'Quiz', `Successfully imported ${formatted.length} questions into Question Bank via spreadsheet.`);
    return formatted.length;
  };

  const updateQuestion = (id: string, q: Partial<QuizQuestion>) => {
    setQuestions(prev => prev.map(item => (item.id === id ? { ...item, ...q } : item)));
    addAuditLog('Question Updated', 'Quiz', `Updated question ID ${id}`);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(item => item.id !== id));
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
    return newCert;
  };

  const verifyCertificateCode = (certCode: string): CertificateRecord | undefined => {
    const cleaned = certCode.trim().toUpperCase();
    return certificates.find(c => c.certificateNumber.toUpperCase() === cleaned || c.id === certCode);
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
      ...program,
    };
    setQuizPrograms(prev => [newProgram, ...prev]);
    addAuditLog('Quiz Program Created', 'Quiz', `Created quiz program: "${program.title}" (Code: ${program.code})`);
    return newProgram;
  };

  const updateQuizProgram = (id: string, program: Partial<QuizProgram>) => {
    setQuizPrograms(prev => prev.map(p => (p.id === id ? { ...p, ...program } : p)));
    addAuditLog('Quiz Program Updated', 'Quiz', `Updated quiz program ID ${id}`);
  };

  const deleteQuizProgram = (id: string) => {
    setQuizPrograms(prev => prev.filter(p => p.id !== id));
    addAuditLog('Quiz Program Deleted', 'Quiz', `Deleted quiz program ID ${id}`);
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

    const newPayment: PaymentRecord = {
      id: 'pay_' + Date.now().toString(36),
      transactionId: transactionId,
      userId: leaderId,
      userName: formData.leaderName,
      teamId: teamId,
      amount: formData.amount,
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

    const newPayment: PaymentRecord = {
      id: 'pay_' + Date.now().toString(36),
      transactionId: transactionId,
      userId: newCoordUser.id,
      userName: formData.coordinatorName,
      instituteId: instId,
      amount: formData.amount,
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

    return {
      success: true,
      institution: newInst,
      voucherCode,
      invoiceNumber,
    };
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
        leaveTeam,
        lockTeam,
        updateUserProfile,
        processPayment,
        makePayment,
        quizPrograms,
        addQuizProgram,
        updateQuizProgram,
        deleteQuizProgram,
        questions,
        quizAttempts,
        saveQuizProgress,
        submitQuiz,
        addQuestion,
        addQuestionsBulk,
        updateQuestion,
        deleteQuestion,
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
        bulkRegisterStudents,
        processInstitutionalPayment,
        sponsors,
        addSponsor,
        updateSponsor,
        deleteSponsor,
        showRegistrationModal,
        setShowRegistrationModal,
        registrationModalTrack,
        openRegistrationModal,
        registerTeamWithPayment,
        registerInstituteWithPayment,
        certificates,
        activeCertificateModal,
        setActiveCertificateModal,
        activeVerifierModal,
        setActiveVerifierModal,
        generateCertificate,
        verifyCertificateCode,
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
