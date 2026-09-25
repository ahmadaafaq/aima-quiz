export type UserRole =
  | 'student'
  | 'team_leader'
  | 'team_member'
  | 'institute_coordinator'
  | 'regional_hub'
  | 'evaluator'
  | 'corporate_partner'
  | 'admin';

export type StageId = 'round_1' | 'round_2' | 'round_3' | 'round_4';

export type RegionHubId = 'north' | 'south' | 'east' | 'west' | 'central';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  avatar?: string;
  state?: string;
  city?: string;
  nationality?: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  
  // Academic details
  instituteName?: string;
  instituteId?: string;
  programme?: string; // e.g. MBA, PGDM, Executive MBA, BBA
  specialisation?: string; // e.g. Marketing, Finance, Strategy, Ops
  yearSemester?: string;
  expectedGraduation?: string;
  university?: string;
  enrolmentNumber?: string;
  studentIdCardNumber?: string;
  
  // Evaluator & Jury details
  speciality?: string; // e.g. Corporate Strategy & M&A, Supply Chain & Operations, Financial Modeling, Tech & AI, Marketing
  secondarySpeciality?: string;
  designation?: string;
  organization?: string;
  experienceYears?: number;
  allocatedCasesCount?: number;
  maxAllocationQuota?: number;
  isAvailableForEvaluation?: boolean;

  // Verification
  idCardUploaded?: boolean;
  photoUploaded?: boolean;
  isVerified?: boolean;
  
  // Competition State
  teamId?: string;
  isTeamLeader?: boolean;
  hasPaidR1R2?: boolean;
  hasPaidR3?: boolean;
  hasPaidR4?: boolean;
  
  assignedHub?: RegionHubId;
  quizScore?: number;
  quizCompleted?: boolean;
  quizRank?: number;
  
  qualificationStatus?: {
    r1Qualified: boolean;
    r2Qualified: boolean;
    r3Qualified: boolean;
    r4Finalist: boolean;
    r4Winner?: 'winner' | 'first_runner_up' | 'second_runner_up' | 'special_award';
  };
}

export interface TeamMember {
  studentId: string;
  name: string;
  email: string;
  mobile: string;
  institute: string;
  isLeader: boolean;
  hasPaid: boolean;
  acceptedDeclaration: boolean;
  roleInTeam?: string; // e.g. Strategist, Financial Modeler, Presenter
  paymentLabel?: string;
  paymentStatus?: 'PAID' | 'PENDING_INVOICE' | string;
  amount?: number;
}

export interface DeadlineExtensionRequest {
  id: string;
  teamId: string;
  teamName: string;
  instituteName: string;
  leaderId: string;
  leaderName: string;
  leaderEmail: string;
  currentDeadline: string;
  requestedExtensionDays: number; // e.g. 2
  proposedDeadline: string; // ISO string or human-readable
  reasonCategory: 'Academic/Exam Clash' | 'Medical Emergency' | 'Technical/Hardware Issue' | 'Faculty/Mentor Review Delay' | 'Other';
  reasonDetails: string;
  supportingDocName?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerRemarks?: string;
}

export interface OfflineRoundResult {
  id: string;
  round: 'round_3' | 'round_4';
  teamId: string;
  teamName: string;
  instituteName: string;
  hubId?: RegionHubId;
  hubName?: string;
  offlineQuizScore: number;
  offlineQuizMaxMarks?: number;
  livePresentationScore: number;
  presentationMaxMarks?: number;
  qaDefenseScore: number;
  aggregateScore: number;
  rank: number;
  attendanceVerified: boolean;
  qualifiedNextRound?: boolean;
  award?: string;
  evaluatorPanelNotes?: string;
  notes?: string;
  evaluatedBy?: string;
  uploadedBy?: string;
  uploadedAt: string;
}

export interface Team {
  id: string;
  name: string;
  inviteCode: string;
  leaderId: string;
  leaderName: string;
  instituteName: string;
  members: TeamMember[];
  isLocked: boolean;
  createdAt: string;
  assignedHub: RegionHubId;
  preferredHub?: RegionHubId;
  paymentStatus?: string;
  invoiceNumber?: string;
  registrationMode?: 'individual' | 'institute' | string;
  feeTier?: string;
  totalAmount?: number;
  subtotalAmount?: number;
  gstAmount?: number;
  participantCount?: number;
  maxMembers?: number;
  
  // Round 2 Deadlines & Extension Requests
  submissionDeadline?: string;
  extensionRequest?: DeadlineExtensionRequest;
  
  // Progress & Scores
  r1AvgScore?: number;
  r1Qualified?: boolean;
  r1CompletedMembersCount?: number;
  
  r2Submission?: CaseSubmission;
  r2Evaluations?: Evaluation[];
  r2AverageScore?: number;
  r2Rank?: number;
  r2Qualified?: boolean;
  
  r3Slot?: {
    date: string;
    time: string;
    venue: string;
    room: string;
    juryPanelId: string;
  };
  r3AttendanceVerified?: boolean;
  r3Scores?: RegionalScoreEntry[];
  r3OfflineQuizScore?: number;
  r3PresentationScore?: number;
  r3TotalScore?: number;
  r3Rank?: number;
  r3Qualified?: boolean;
  
  r4AttendanceVerified?: boolean;
  r4OfflineQuizScore?: number;
  r4PresentationScore?: number;
  r4FinalScore?: number;
  r4Rank?: number;
  r4Award?: string;
}

export interface QuizProgram {
  id: string;
  code: string;
  title: string;
  tagline: string;
  description: string;
  stage: StageId;
  category: string;
  status: 'live' | 'scheduled' | 'completed' | 'draft' | 'paused';
  startTime: string;
  endTime: string;
  startDate?: string;
  endDate?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  passingPercentage: number;
  cutoffScore?: number;
  negativeMarking: boolean;
  negativeMarksPerQuestion: number;
  negativeMarkingPerWrong?: number;
  marksPerQuestion: number;
  fee: number;
  maxIntake: number;
  intakeCapacity?: number;
  enrolledCount: number;
  completedCount: number;
  inProgressCount: number;
  instructions: string[];
  eligibility: string;
  proctoringStrictness: 'High (Webcam + Fullscreen + Tab Lock)' | 'Standard' | 'Relaxed';
  proctoringMode?: string;
  tags: string[];
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  negativeMarks: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category:
    | 'Business Awareness'
    | 'Management Concepts'
    | 'Logical Reasoning'
    | 'Data Interpretation'
    | 'Economics & Policy'
    | 'Corporate Strategy'
    | 'Finance & Marketing'
    | 'Sustainability & AI';
  explanation?: string;
  caseletSnippet?: string;
  isActive: boolean;
}

export interface QuizAttempt {
  attemptId: string;
  studentId: string;
  userId?: string;
  teamId?: string;
  startTime: string;
  endTime?: string;
  answers: Record<string, number>; // questionId -> optionIndex
  markedForReview: string[];
  score: number;
  analyticalScore: number;
  timeTakenSeconds: number;
  tabSwitchCount: number;
  submittedAt?: string;
  isCompleted: boolean;
}

export interface CaseSubmission {
  id: string;
  teamId: string;
  teamName: string;
  anonymizedCode?: string;
  caseTitle: string;
  submittedAt: string;
  deckFileName: string;
  deckFileSize: string;
  fileSizeMb?: number;
  deckFileUrl?: string;
  deckFileType: 'pdf' | 'pptx';
  slideCount?: number;
  executiveSummary: string;
  supportingExcelName?: string;
  financialModelFile?: string;
  videoPitchUrl?: string;
  versionNumber: number;
  confirmationNumber: string;
  status: 'submitted' | 'under_review' | 'evaluated' | 'flagged';
  
  // Advisory AI Assessment
  aiAssessment?: {
    alignmentScore: number;
    completenessScore: number;
    dataEvidenceScore: number;
    feasibilityScore: number;
    originalityScore: number;
    overallAdvisoryScore: number;
    missingSections: string[];
    strengths: string[];
    improvementAreas: string[];
    similarityIndex: number;
    plagiarismFlag: string;
    generativeAiUsageFlag: string;
    evaluatorNote: string;
  };
}

export interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  weight: number; // percentage, e.g. 20
  maxScore: number; // usually 10 or 20
}

export interface Evaluation {
  id: string;
  submissionId: string;
  teamId: string;
  evaluatorId: string;
  evaluatorName: string;
  scores: Record<string, number>; // criterionId -> score
  weightedTotal: number;
  comments: string;
  confidentialNotes?: string;
  isLocked: boolean;
  conflictDeclared?: boolean;
  submittedAt: string;
  moderatedScore?: number;
  moderationReason?: string;
  strategicClarity?: number;
  financialFeasibility?: number;
  implementationRoadmap?: number;
  deckDesignAndVisuals?: number;
  strengths?: string;
  weaknesses?: string;
  generalRemarks?: string;
  recommendsAdvance?: boolean;
}

export interface RegionalScoreEntry {
  juryId: string;
  juryName: string;
  criterionScores: Record<string, number>;
  totalScore: number;
  comments: string;
  submittedAt: string;
}

export interface RegionalHub {
  id: RegionHubId;
  name: string;
  city: string;
  hostInstitute: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorMobile?: string;
  coordinatorDesignation?: string;
  coveredStates?: string[];
  auditoriumHall?: string;
  maxCapacity: number;
  allocatedTeamsCount: number;
  eventDate: string;
  venueAddress: string;
  status: 'scheduled' | 'live' | 'scoring_completed' | 'results_locked';
}

export interface InstitutionalProfile {
  id: string;
  name: string;
  code: string;
  state: string;
  city: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorMobile: string;
  authLetterUploaded: boolean;
  isApproved: boolean;
  totalStudents: number;
  registeredStudents: number;
  teamsCreated: number;
  totalPaidAmount: number;
  ranking?: number;
  facultyMentor?: string;
}

export interface CertificateRecord {
  id: string;
  certificateNumber: string;
  recipientName: string;
  recipientEmail: string;
  recipientRole: string;
  teamId?: string;
  teamName?: string;
  institute: string;
  achievement:
    | 'National Winner'
    | 'First Runner-Up'
    | 'Second Runner-Up'
    | 'Special Commendation - Innovation'
    | 'National Finalist'
    | 'Regional Winner'
    | 'Regional Finalist'
    | 'Round 2 Qualifier'
    | 'Round 1 Qualifier'
    | 'Registered Participant'
    | 'Distinguished Jury Member'
    | 'Institutional Faculty Coordinator';
  issueDate: string;
  qrVerificationUrl: string;
  authorizedSignatory: string;
  signatoryTitle: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  category: 'Technical' | 'Quiz' | 'Case Submission' | 'Payment' | 'Team Formation' | 'Regional Hub' | 'General';
  priority: 'Low' | 'Medium' | 'High' | 'Critical (War-Room)';
  subject: string;
  description: string;
  screenshotUrl?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  createdAt: string;
  updatedAt: string;
  resolutionNotes?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: 'Registration' | 'Team' | 'Payment' | 'Quiz' | 'Submission' | 'Evaluation' | 'Regional' | 'Results' | 'System' | 'Institute';
  details: string;
  ipAddress: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
}

export interface PaymentRecord {
  id: string;
  transactionId: string;
  userId: string;
  userName: string;
  teamId?: string;
  teamName?: string;
  instituteId?: string;
  instituteName?: string;
  regionHub?: RegionHubId | 'national';
  regionName?: string;
  amount: number;
  baseAmount?: number;
  gstAmount?: number;
  gstRate?: number;
  gstType?: 'CGST+SGST' | 'IGST';
  hsnSacCode?: string;
  billingState?: string;
  payerGstin?: string;
  itemDescription?: string;
  stage: 'round_1_2' | 'round_3' | 'round_4' | 'bulk_institutional';
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Waiver/Coupon';
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';
  timestamp: string;
  gstInvoiceNumber: string;
  receiptUrl?: string;
  couponCode?: string;
}

export interface CorporateSponsor {
  id: string;
  name: string;
  logo: string;
  tier: 'Title Partner' | 'Strategic Case Partner' | 'Grand Prize Sponsor' | 'Regional Hub Sponsor' | 'Knowledge Partner';
  category: string;
  contributionAmount: number;
  representativeName: string;
  representativeEmail: string;
  representativeMobile?: string;
  designation: string;
  sponsoredRounds: ('round_1' | 'round_2' | 'round_3' | 'round_4')[];
  caseProblemTrack?: string;
  talentRadarAccess: boolean;
  ppiPpoOffersCommitted: number;
  boothAllocated?: string;
  status: 'active' | 'confirmed' | 'mou_pending';
  deliverablesSummary: string;
  contractSignDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  category: 'Critical Alert' | 'Round Deadline' | 'Results' | 'Webinar & Briefing' | 'General';
  targetRoles: UserRole[] | 'all';
  targetRound?: 'all' | 'round_1' | 'round_2' | 'round_3' | 'round_4';
  targetInstitution?: string;
  targetInstitutionName?: string;
  targetHub?: string;
  targetAudienceLabel?: string;
  channels?: ('in_app' | 'email' | 'sms' | 'whatsapp')[];
  isPinned: boolean;
  linkText?: string;
  linkUrl?: string;
}

export interface CompetitionConfig {
  leagueName: string;
  year: string;
  edition: string;
  activeStage?: StageId;
  registrationOpen: boolean;
  r1QuizStartTime: string;
  r1QuizEndTime: string;
  r1DurationMinutes: number;
  r1NegativeMarking: boolean;
  r1CutoffScore: number;
  r2SubmissionDeadline: string;
  r2MaxSlideCount: number;
  r2MaxFileSizeMB: number;
  r2EvaluatorsPerDeck: number;
  r3RegionalStartDate: string;
  r3MaxTeamsPerHub: number;
  r4NationalFinaleDate: string;
  feeR1R2: number;
  feeR3: number;
  feeR4: number;
  isResultsLockedR1: boolean;
  isResultsLockedR2: boolean;
  isResultsLockedR3: boolean;
  isResultsLockedR4: boolean;
  isPublicResultsPublished: boolean;
}

export interface CSRBootcampNominee {
  id: string;
  salutation?: 'Mr.' | 'Ms.' | 'Dr.' | 'Prof.' | string;
  name: string;
  dob?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say' | string;
  email: string;
  mobile: string;
  instituteName?: string;
  program?: string;
  semester?: string;
  enrolmentNumber?: string;
  password?: string;
  designation?: string;
  department?: string;
  foodPreference?: 'Vegetarian' | 'Non-Vegetarian' | 'Jain' | string;
  specialRequirements?: string;
  isTeamLeader?: boolean;
}

export interface CSRBootcampRegistration {
  id: string;
  registrationNumber: string;
  track: 'corporate_individual' | 'institutional';
  createdAt: string;
  organizationName: string;
  organizationType?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  gstin?: string;
  pan?: string;
  poNumber?: string;
  isOnboardingTeam?: boolean;
  teamName?: string;
  participantPassword?: string;
  coordinator: {
    salutation?: string;
    name: string;
    designation: string;
    department?: string;
    email: string;
    mobile: string;
    extension?: string;
  };
  tierId: '1_3' | '4_7' | '8_plus' | 'inst_5' | 'inst_10';
  tierLabel: string;
  participantCount: number;
  ratePerPersonOrPackage: number;
  subtotalExclGst: number;
  gstAmount: number;
  totalPayable: number;
  gstRate: number;
  gstType: 'CGST+SGST' | 'IGST';
  sacCode: string;
  nominees: CSRBootcampNominee[];
  managementAuthorisationAccepted: boolean;
  termsAccepted: boolean;
  dpdpConsentAccepted: boolean;
  dpdpConsentTimestamp?: string;
  paymentStatus: 'PAID' | 'PENDING_INVOICE';
  paymentMethod?: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'PO/NEFT_Pending';
  transactionId?: string;
  invoiceNumber: string;
  paidAt?: string;
  secretariatEmailSent: boolean;
  registrantEmailSent: boolean;
  emailDispatchedAt: string;
}

export interface CSREmailLog {
  id: string;
  to: string;
  cc?: string;
  subject: string;
  timestamp: string;
  status: 'DELIVERED';
  registrationId: string;
  registrationNumber: string;
  organizationName: string;
  participantCount: number;
  totalAmount: number;
  invoiceNumber: string;
  bodySnippet: string;
}
