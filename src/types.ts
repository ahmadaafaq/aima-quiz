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
  r3TotalScore?: number;
  r3Rank?: number;
  r3Qualified?: boolean;
  
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
  instituteId?: string;
  amount: number;
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
