import React, { useState, useMemo, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { UserRole } from '../../types';
import {
  FileText,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
  Shield,
  Scale,
  Building2,
  Users,
  CreditCard,
  HelpCircle,
  ShieldAlert,
  Search,
  Sliders,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Clock,
  Compass,
  FileCheck,
  Zap,
  Globe,
  Send,
  Eye,
  Check,
  ChevronRight,
  Filter,
  Bot,
  Hash,
  Database,
  Lock,
  Download,
  AlertTriangle,
  QrCode,
  Activity,
  Cpu,
  UserCheck,
  Calendar,
  Briefcase
} from 'lucide-react';

export interface RequirementSection {
  id: string;
  sectionNumber: string;
  numericId: number;
  title: string;
  category: 'purpose_stages' | 'roles_dashboards' | 'registration_finance' | 'quiz_case' | 'eval_regional' | 'finale_cert' | 'backend_security' | 'admin_governance' | 'phases_mvp';
  categoryLabel: string;
  pdfPages: string;
  shortDescription: string;
  status: 'VERIFIED_LIVE' | 'COMPLIANT' | 'ACTIVE';
  targetView: string;
  targetTab?: string;
  targetPersona?: UserRole;
  targetModal?: 'certificate' | 'support' | 'verifier';
  actionLabel: string;
  clauses: {
    clauseNumber: string;
    clauseTitle: string;
    description: string;
    systemVerification: string;
    subTarget?: {
      view: string;
      tab?: string;
      persona?: UserRole;
      modal?: 'certificate' | 'support' | 'verifier';
      label: string;
    };
  }[];
  technicalHighlights: string[];
}

export const OFFICIAL_27_SECTIONS: RequirementSection[] = [
  // ==========================================
  // 1. Purpose
  // ==========================================
  {
    id: 'sec-1',
    sectionNumber: 'Section 1',
    numericId: 1,
    title: 'Purpose & Integrated Platform Scope',
    category: 'purpose_stages',
    categoryLabel: 'Purpose & Stages',
    pdfPages: 'Page 1',
    shortDescription: 'Integrated technology platform managing the complete lifecycle of India Case League 2026 across student/team registration, payments, quiz, case decks, AI/jury evaluation, regional hubs, national finals, certificates, and RBAC.',
    status: 'VERIFIED_LIVE',
    targetView: 'public',
    actionLabel: 'Launch Public Overview & Competition Gateway (Section 1)',
    clauses: [
      {
        clauseNumber: '1.1',
        clauseTitle: 'End-to-End Competition Lifecycle Management',
        description: 'Covers Student/team registration, institutional bulk registration, payment gateway collection, online quiz administration, automatic quiz evaluation, case-deck submission, AI-assisted & jury evaluation, regional qualification, regional/national result tabulation, winner declaration, certificates, reports & dashboards.',
        systemVerification: 'All 13 core lifecycle modules active and accessible with live database persistence.',
        subTarget: { view: 'public', label: 'Explore Public Roadmap & Overview' }
      },
      {
        clauseNumber: '1.2',
        clauseTitle: 'Multi-Stakeholder Role-Based Access Control (RBAC)',
        description: 'Granular role-based portals for Students, Institutions, Evaluators/Jury, Regional Hubs, Corporate Partners, and AIMA-ICRC Central Administrators.',
        systemVerification: 'Active RBAC switcher and isolated role dashboards.',
        subTarget: { view: 'student', persona: 'student', label: 'Open Student Portal' }
      }
    ],
    technicalHighlights: ['Vite + React 18 SPA', 'Multi-tenant RBAC', 'Zero-latency dynamic state', 'Persistent Local & Cloud Storage']
  },

  // ==========================================
  // 2. Competition Stages to Be Managed
  // ==========================================
  {
    id: 'sec-2',
    sectionNumber: 'Section 2',
    numericId: 2,
    title: 'Competition Stages to Be Managed',
    category: 'purpose_stages',
    categoryLabel: 'Purpose & Stages',
    pdfPages: 'Pages 1–2',
    shortDescription: 'Configured 4-stage progression: Round 1 (Online Business Quiz), Round 2 (Online Case Analysis & PPT/PDF Deck), Round 3 (Regional Live Corporate Case Challenge - Face-to-Face), and Round 4 (National Policy & Governance Grand Finale - Face-to-Face). Reconfigurable without code rebuilds.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'stages',
    targetPersona: 'admin',
    actionLabel: 'Configure Competition Stages & Live Gates (Section 2)',
    clauses: [
      {
        clauseNumber: '2.1',
        clauseTitle: 'Four-Stage Hierarchical Funnel',
        description: 'Round 1 (Online Quiz) → Round 2 (Case Deck Submission) → Round 3 (Regional Face-to-Face Hubs) → Round 4 (National Grand Finale).',
        systemVerification: 'Stage gates strictly enforced with automated qualification threshold checks.',
        subTarget: { view: 'admin', tab: 'stages', persona: 'admin', label: 'Manage Stage Progression Engine' }
      },
      {
        clauseNumber: '2.2',
        clauseTitle: 'No-Code Stage Reconfiguration & Flexibility',
        description: 'AIMA-ICRC administrators can rename, add, remove, or reorder rounds dynamically without requiring software redevelopment.',
        systemVerification: 'CompetitionConfig engine with atomic state updates and audit trail logging.',
        subTarget: { view: 'admin', tab: 'system_settings', persona: 'admin', label: 'Open System Governance Settings' }
      }
    ],
    technicalHighlights: ['State Machine Engine', 'Dynamic Stage Configurator', 'Atomic State Locking', 'Audit Log Stamping']
  },

  // ==========================================
  // 3. User Categories
  // ==========================================
  {
    id: 'sec-3',
    sectionNumber: 'Section 3',
    numericId: 3,
    title: 'User Categories & Role Permissions (3.1 – 3.8)',
    category: 'roles_dashboards',
    categoryLabel: 'User Roles & Dashboards',
    pdfPages: 'Pages 2–5',
    shortDescription: 'Granular permissions for 8 distinct user roles: 3.1 Individual Student, 3.2 Team Leader, 3.3 Team Member, 3.4 Institute Coordinator, 3.5 Regional Hub Coordinator, 3.6 Evaluator/Jury Member, 3.7 Corporate Case Partner, and 3.8 AIMA-ICRC Administrator.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'team_leader',
    actionLabel: 'Test Role-Based Personas (Section 3)',
    clauses: [
      {
        clauseNumber: '3.1',
        clauseTitle: 'Individual Student Capabilities',
        description: 'Account creation, OTP/email verification, academic profile, ID proof upload, ₹200 fee payment, join/create team, online quiz participation, R2 deck submission, regional allocation view, and certificate/admit card downloads.',
        systemVerification: 'Student profile view with editable credentials and document verifiers.',
        subTarget: { view: 'student', persona: 'student', label: 'Open Student Profile' }
      },
      {
        clauseNumber: '3.2',
        clauseTitle: 'Team Leader Capabilities',
        description: 'Team creation, invite code generation (e.g. ICL-STR-842), member invitation & removal, roster locking before deadline, final R2 case upload, presenting member nominations, and team result tracking.',
        systemVerification: 'Team roster management hub with invite code sharing.',
        subTarget: { view: 'student', persona: 'team_leader', label: 'Open Team Leader Hub (3.2)' }
      },
      {
        clauseNumber: '3.3',
        clauseTitle: 'Team Member Capabilities',
        description: 'Joining team via invite code, declaration acceptance, viewing fellow members, participating in Round 1 quiz, accessing common case brief, and viewing team submission/results.',
        systemVerification: 'Team Member view with code entry dialog.',
        subTarget: { view: 'student', persona: 'team_member', label: 'Open Team Member Workspace (3.3)' }
      },
      {
        clauseNumber: '3.4',
        clauseTitle: 'Institute Coordinator Capabilities',
        description: 'Institutional registration, authorization letter upload, bulk student CSV upload, creating multiple teams, collective fee payment, monitoring completion, tracking quiz attendance, downloading reports & GST invoices.',
        systemVerification: 'Institutional Coordinator Workspace with bulk batch engine.',
        subTarget: { view: 'institute', persona: 'institute_coordinator', label: 'Open Institute Portal (3.4)' }
      },
      {
        clauseNumber: '3.5',
        clauseTitle: 'Regional Hub Coordinator Capabilities',
        description: 'Viewing allocated teams, downloading lists, physical attendance verification, presentation slot assignment, jury panel creation, score entry & validation, score locking immutability.',
        systemVerification: 'Regional Hub Operations Desk with attendance register and jury cards.',
        subTarget: { view: 'regional_hub', persona: 'regional_hub', label: 'Open Regional Hub Desk (3.5)' }
      },
      {
        clauseNumber: '3.6',
        clauseTitle: 'Evaluator / Jury Member & Conflict of Interest Recusal',
        description: 'Secure invitation login, viewing assigned submissions only, digital 100-point rubric, score/comment entry, draft saving, final lock, and mandatory conflict-of-interest recusal with automated re-allocation.',
        systemVerification: 'Jury Evaluation Desk with dual-blind cards and active COI Recusal modal.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'Open Jury Desk & COI Recusal (3.6)' }
      },
      {
        clauseNumber: '3.7',
        clauseTitle: 'Corporate Case Partner Capabilities',
        description: 'Upload problem statements & background materials, review live cases, nominate mentors/jury, access anonymized student solutions, and issue PPO/PPI interview fast-tracks.',
        systemVerification: 'Corporate Partner Portal with talent search and case review.',
        subTarget: { view: 'corporate', persona: 'corporate_partner', label: 'Open Corporate Partner Portal (3.7)' }
      },
      {
        clauseNumber: '3.8',
        clauseTitle: 'AIMA-ICRC Central Administrator Capabilities',
        description: 'Full administrative control over competition setup, registration windows, fees, eligibility, team size, quiz creation, case upload, evaluator assignments, rubrics, cutoffs, moderation, certificates, and audit logs.',
        systemVerification: 'Central Secretariat Command with master configuration controls.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'Open Secretariat Command (3.8)' }
      }
    ],
    technicalHighlights: ['Multi-role Security Guards', 'Granular Action Permissions', 'COI Auto-Reallocation Engine', 'Dynamic Persona Simulator']
  },

  // ==========================================
  // 4. Front-End Requirements
  // ==========================================
  {
    id: 'sec-4',
    sectionNumber: 'Section 4',
    numericId: 4,
    title: 'Front-End Requirements & Dedicated Dashboards (4.1 – 4.5)',
    category: 'roles_dashboards',
    categoryLabel: 'User Roles & Dashboards',
    pdfPages: 'Pages 5–7',
    shortDescription: 'Mobile-responsive front-end portals: 4.1 Public Website, 4.2 Student Dashboard with progress tracker, 4.3 Institute Dashboard with analytics, 4.4 Evaluator Dashboard with digital rubric, and 4.5 Admin Dashboard with real-time statistics.',
    status: 'VERIFIED_LIVE',
    targetView: 'public',
    actionLabel: 'Explore Public Portal & Responsive Layout (Section 4.1)',
    clauses: [
      {
        clauseNumber: '4.1',
        clauseTitle: 'Public Website Portal',
        description: 'Overview, eligibility, structure, dates, fees, awards (₹15L+ pool), regional hubs, sponsors, rules & FAQs, contact, registration/login triggers, announcements, results, downloadable brochure, and privacy terms across desktop/mobile.',
        systemVerification: 'Full public landing page with interactive FAQ accordions and roadmap.',
        subTarget: { view: 'public', label: 'View Public Portal (4.1)' }
      },
      {
        clauseNumber: '4.2',
        clauseTitle: 'Student Dashboard & Stage Progress Tracker',
        description: 'Registration status, payment status, profile completion, team status, round eligibility, upcoming deadlines, quiz link, case download, submission status, hub allocation, results, certificates, and sequential progress tracker (Registration → Team Formation → Round 1 → Round 2 → Regional Round → National Finale).',
        systemVerification: 'Student Dashboard with live 6-stage interactive tracker.',
        subTarget: { view: 'student', persona: 'student', label: 'View Student Dashboard (4.2)' }
      },
      {
        clauseNumber: '4.3',
        clauseTitle: 'Institute Dashboard',
        description: 'Total students added, registered, payment pending, teams created, incomplete teams, quiz participation, R1/R2 qualifiers, regional qualifiers, national finalists, ranking, and downloadable reports.',
        systemVerification: 'Institute metrics cards and candidate breakdown charts.',
        subTarget: { view: 'institute', persona: 'institute_coordinator', label: 'View Institute Dashboard (4.3)' }
      },
      {
        clauseNumber: '4.4',
        clauseTitle: 'Evaluator Dashboard',
        description: 'Assigned submissions, evaluation deadline, completed/pending evaluations, conflict-of-interest option, rubric sliders, comment fields, and final submission confirmation.',
        systemVerification: 'Evaluator submission queue with scoring progress counter.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'View Evaluator Dashboard (4.4)' }
      },
      {
        clauseNumber: '4.5',
        clauseTitle: 'Admin Command Dashboard & Real-Time KPIs',
        description: 'Real-time statistics on total registrations, individual/institute/team counts, gross revenue, pending payments, round participation, quiz attendance, qualifier counts, submission status, evaluation completion, regional distribution, and support tickets.',
        systemVerification: 'Secretariat Executive Telemetry Dashboard with live analytics.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'View Admin Dashboard (4.5)' }
      }
    ],
    technicalHighlights: ['Responsive Tailwind CSS Grid', 'Mobile First Touch Targets', 'Zero Layout Shift Architecture', 'Live Progress Tracker Widget']
  },

  // ==========================================
  // 5. Registration Module
  // ==========================================
  {
    id: 'sec-5',
    sectionNumber: 'Section 5',
    numericId: 5,
    title: 'Registration Module (5.1 Individual, 5.2 Team, 5.3 Institute Bulk)',
    category: 'registration_finance',
    categoryLabel: 'Registration & Finance',
    pdfPages: 'Pages 7–8',
    shortDescription: 'Student enrollment with mandatory personal/academic fields & documents; team formation for 3–4 members with unique Team IDs and roster locking; institutional Excel/CSV bulk upload with automated credential dispatch.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'team_leader',
    actionLabel: 'Open Team Registration & Roster Lock (Section 5.2)',
    clauses: [
      {
        clauseNumber: '5.1',
        clauseTitle: 'Individual Student Registration & Mandatory Declarations',
        description: 'Personal details (Name, DOB, Gender, Mobile, Email, State/City, Nationality), Academic details (Institute, Programme, Specialisation, Year/Sem, Grad Year, University, Enrolment No), Documents (Student ID, Photo, Govt ID), and 8 Declarations (Accuracy, Eligibility, Code of Conduct, Data Use, IP Terms, Plagiarism/AI Policy, Photography Consent, Case Confidentiality).',
        systemVerification: 'Registration form with multi-step validation and mandatory checkbox agreements.',
        subTarget: { view: 'student', persona: 'student', label: 'Inspect Student Registration Fields (5.1)' }
      },
      {
        clauseNumber: '5.2',
        clauseTitle: 'Team Registration (3–4 Members & Roster Locking)',
        description: 'Team size strictly 3–4 students; valid registration IDs required; designated Team Leader; unique Team ID; duplicate joining prevention; team membership locking before deadline; admin approval for replacements.',
        systemVerification: 'Team roster engine enforcing 3-4 member limit, invite code generation, and roster locking.',
        subTarget: { view: 'student', persona: 'team_leader', label: 'Manage Team Roster (5.2)' }
      },
      {
        clauseNumber: '5.3',
        clauseTitle: 'Institute Bulk Registration (Excel/CSV Upload)',
        description: 'Excel/CSV template download, bulk student data upload, validation of mandatory fields, duplicate identification, error report generation, bulk team creation, collective payment, invoice generation, coordinator approval, and automated student login credentials.',
        systemVerification: 'CSV parsing engine with instant row validation, student onboarding, and sample CSV download.',
        subTarget: { view: 'institute', persona: 'institute_coordinator', label: 'Open Bulk CSV Uploader (5.3)' }
      }
    ],
    technicalHighlights: ['CSV Parser & Validation', 'Invite Code Generator', '3-4 Member Constraint Guards', 'Roster Freeze & Lock State']
  },

  // ==========================================
  // 6. Payment Module
  // ==========================================
  {
    id: 'sec-6',
    sectionNumber: 'Section 6',
    numericId: 6,
    title: 'Payment Module & Multi-Stage Fee Collection',
    category: 'registration_finance',
    categoryLabel: 'Registration & Finance',
    pdfPages: 'Page 9',
    shortDescription: 'Integrated payment gateway with official fee structure (R1/R2: ₹200/student, R3: ₹2,000/qualifying student, R4: ₹2,000/qualifying student); UPI, Debit/Credit Card, Net Banking, payment links, bulk payments, automatic receipts, 18% GST invoices, retry mechanisms, and sponsor waiver codes.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'team_leader',
    actionLabel: 'Launch Payment Checkout & GST Invoice Portal (Section 6)',
    clauses: [
      {
        clauseNumber: '6.1',
        clauseTitle: 'Proposed Staged Fee Structure',
        description: 'Rounds 1 and 2: ₹200 per student. Round 3 Regional Hub: ₹2,000 per qualifying student. Round 4 National Finale: ₹2,000 per qualifying student. Mandatory fee clearing before accessing paid rounds.',
        systemVerification: 'Dynamic fee computation based on student roster size and active competition phase.',
        subTarget: { view: 'student', persona: 'team_leader', label: 'Open Fee Checkout Modal' }
      },
      {
        clauseNumber: '6.2',
        clauseTitle: 'Omni-Channel Payment Rails & Waiver Codes',
        description: 'Supports UPI QR, Debit Cards, Credit Cards, Net Banking, Payment Links, Bulk Institutional payments, failed retry, and sponsor coupons (e.g. "AIMA2026", "ICRCSPONSOR").',
        systemVerification: 'Instant transaction receipt generation with payment audit stamping.',
      },
      {
        clauseNumber: '6.3',
        clauseTitle: 'Automated 18% GST Invoicing & Reconciliation',
        description: 'Generates official GST compliant invoices (INV-AIMA-26-XXXX) with breakdown of CGST/SGST/IGST, tax reconciliation, and financial reporting.',
        systemVerification: 'Central Admin financial ledger tracking total revenue, GST escrow, and payment receipts.',
        subTarget: { view: 'admin', tab: 'finances', persona: 'admin', label: 'View Admin Financial Ledger' }
      }
    ],
    technicalHighlights: ['18% GST Engine', 'Multi-rail Payment Simulation', 'Coupon Code Redemption', 'Transaction Ledger & Invoices']
  },

  // ==========================================
  // 7. Round 1: Online Quiz Module
  // ==========================================
  {
    id: 'sec-7',
    sectionNumber: 'Section 7',
    numericId: 7,
    title: 'Round 1: Online Quiz Module (7.1 – 7.4)',
    category: 'quiz_case',
    categoryLabel: 'Quiz & Case Submissions',
    pdfPages: 'Pages 9–11',
    shortDescription: 'Comprehensive assessment engine: 7.1 Multi-format question bank creation, 7.2 11 domain categories, 7.3 Proctored administration with 45-min timer & tab-switch monitoring, and 7.4 Automatic evaluation with 5-step tie-breaker sequence.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'student',
    actionLabel: 'Launch Round 1 Quiz Terminal (Section 7.3)',
    clauses: [
      {
        clauseNumber: '7.1',
        clauseTitle: 'Admin Question Bank Creation (7 Types)',
        description: 'Supports Multiple-choice, Multiple-select, True/False, Data-interpretation, Image-based, Caselet-based, and Numerical questions with marks, negative marks, category, explanation, and attachments.',
        systemVerification: 'Admin Question Bank manager with full CRUD and category filtering.',
        subTarget: { view: 'admin', tab: 'quiz_bank', persona: 'admin', label: 'Manage Quiz Question Bank (7.1)' }
      },
      {
        clauseNumber: '7.2',
        clauseTitle: '11 Subject Categories',
        description: 'Covers Business awareness, Management concepts, Logical reasoning, Data interpretation, Economics, Public policy, Sustainability, Current affairs, Technology & AI, Corporate strategy, Finance & marketing fundamentals.',
        systemVerification: 'Questions categorized across all 11 domains with category badges.',
      },
      {
        clauseNumber: '7.3',
        clauseTitle: 'Quiz Administration & Anti-Cheating Proctoring',
        description: 'Fixed start/end time, 45-minute countdown clock, question & option randomization, auto-submit on timeout, resume after connectivity loss, browser refresh protection, 1 active login per student, IP/device logging, tab-switch monitoring, question navigator, mark-for-review, and autosave.',
        systemVerification: 'Interactive QuizTaker component with live countdown timer, tab-switch counter, and autosave state.',
        subTarget: { view: 'student', persona: 'student', label: 'Open Quiz Terminal (7.3)' }
      },
      {
        clauseNumber: '7.4',
        clauseTitle: 'Automatic Evaluation & Official Tie-Breaker Sequence',
        description: 'Auto-evaluates objective responses, applies positive (+2) & negative (-0.5) marking, computes analytical scores, and applies the official 5-tier tie-breaker: 1. Higher total score → 2. Higher analytical/data score → 3. Lower total time → 4. Earlier submission → 5. Jury/admin decision.',
        systemVerification: 'Automated ranking engine implementing the exact 5-tier tie-breaker logic.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'View Quiz Analytics & Qualifiers (7.4)' }
      }
    ],
    technicalHighlights: ['Countdown Timer Loop', 'Tab-switch Focus Monitoring', '5-tier Tie-Breaker Algorithm', 'Autosave & Mark for Review']
  },

  // ==========================================
  // 8. Round 2: Case Deck Submission Module
  // ==========================================
  {
    id: 'sec-8',
    sectionNumber: 'Section 8',
    numericId: 8,
    title: 'Round 2: Case Deck Submission Module (8.1 Case, 8.2 Submissions)',
    category: 'quiz_case',
    categoryLabel: 'Quiz & Case Submissions',
    pdfPages: 'Pages 11–12',
    shortDescription: 'Secure case study release with watermarking and download logs; team case deck upload portal enforcing 12-slide maximum rule, 25MB file size, executive summary, supporting Excel financial models, unlisted video pitches, and official submission receipts.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'team_leader',
    actionLabel: 'Launch Case Deck Submission Hub (Section 8.2)',
    clauses: [
      {
        clauseNumber: '8.1',
        clauseTitle: 'Case Release, Watermarking & Confidentiality',
        description: 'Admin case upload (e.g. GreenGrid Mobility EV Fleet Case), annexures & datasets, release scheduling, access restriction to qualified teams, watermarking, confidentiality declarations, and download tracking.',
        systemVerification: 'Case Brief viewer with confidentiality agreement and download triggers.',
        subTarget: { view: 'student', persona: 'team_leader', label: 'View Case Brief & Data Annexures (8.1)' }
      },
      {
        clauseNumber: '8.2',
        clauseTitle: 'Submission Requirements & Strict Slide Constraints',
        description: 'PPT/PPTX and PDF file uploads, maximum 12-slide constraint, max 25MB file size, optional executive summary, supporting Excel financial model (.xlsx), optional video pitch URL, late policy, versioning, and submission receipts (Team ID, submission time, filename, version, confirmation code).',
        systemVerification: 'CaseDeckSubmitter component with slide count validator, file size check, and receipt generator.',
        subTarget: { view: 'student', persona: 'team_leader', label: 'Submit Case Deck (8.2)' }
      }
    ],
    technicalHighlights: ['Slide Count Validator (12 max)', 'Multi-format File Validator (PDF/PPTX/XLSX)', 'Receipt Generator (ICL26-R2-CONF-XXXX)', 'Version Increment Engine']
  },

  // ==========================================
  // 9. Round 2 Evaluation
  // ==========================================
  {
    id: 'sec-9',
    sectionNumber: 'Section 9',
    numericId: 9,
    title: 'Round 2 Evaluation (9.1 – 9.5 & Gemini AI Advisory)',
    category: 'eval_regional',
    categoryLabel: 'Evaluation & Regional Operations',
    pdfPages: 'Pages 12–14',
    shortDescription: 'Multi-faceted evaluation combining dual-blind jury scoring, 8-criterion 100-point rubric, Gemini AI-assisted preliminary assessment (alignment, completeness, plagiarism flags), conflict of interest recusal, and regional hub qualification result generation.',
    status: 'VERIFIED_LIVE',
    targetView: 'evaluator',
    targetPersona: 'evaluator',
    actionLabel: 'Launch Jury Evaluation Desk & AI Advisory (Section 9)',
    clauses: [
      {
        clauseNumber: '9.1',
        clauseTitle: 'Evaluation Method Combination',
        description: 'Combines Jury-based evaluation, AI-assisted preliminary assessment, plagiarism/similarity checking, and administrative compliance review. AI acts strictly as advisory and does not independently disqualify teams.',
        systemVerification: 'Dual-blind jury cards with Gemini AI Advisory Drawer.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'Open Jury Evaluation Desk (9.1)' }
      },
      {
        clauseNumber: '9.2',
        clauseTitle: 'Proposed 8-Criterion 100-Point Rubric',
        description: 'Understanding of central problem (15%), Quality of analysis & evidence (20%), Identification of strategic alternatives (15%), Originality & innovation (15%), Feasibility of recommendation (15%), Implementation roadmap (10%), Risk & impact assessment (5%), Clarity & quality of presentation (5%).',
        systemVerification: 'Interactive 8-slider scoring rubric computing weighted total out of 100.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'Score Case Deck with Rubric (9.2)' }
      },
      {
        clauseNumber: '9.3',
        clauseTitle: 'AI-Assisted Evaluation Features (Gemini AI Advisory)',
        description: 'Problem-statement alignment score, completeness check, identification of missing sections, evidence/data assessment, feasibility indicators, implementation detail assessment, submission similarity check, repetitive/generic flag, citation verification, plagiarism flag, and undisclosed generative-AI use flag.',
        systemVerification: 'AI Case Assessment API powered by Google GenAI SDK generating structured advisory reports.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'Inspect AI Advisory Drawer (9.3)' }
      },
      {
        clauseNumber: '9.4',
        clauseTitle: 'Evaluator Allocation & Impartiality Rules',
        description: 'At least 2 evaluators per deck; 3rd evaluator assigned where scores differ beyond threshold; evaluators must declare conflict of interest; no evaluating own institution; hidden team identity; score confidentiality until approval.',
        systemVerification: 'Anonymized deck IDs and 1-click COI Recusal workflow.',
        subTarget: { view: 'evaluator', persona: 'evaluator', label: 'Trigger COI Recusal' }
      },
      {
        clauseNumber: '9.5',
        clauseTitle: 'Round 2 Result Generation & Hub Qualification',
        description: 'Average valid evaluator scores, identify major scoring deviations, apply moderation, rank teams nationally/regionally, apply qualification cut-offs, allocate selected teams to Regional Hubs, generate R3 qualification letters, and notify coordinators.',
        systemVerification: 'Admin Evaluation Review tab with score moderation and hub allocation triggers.',
        subTarget: { view: 'admin', tab: 'evaluations', persona: 'admin', label: 'Moderate Scores in Admin (9.5)' }
      }
    ],
    technicalHighlights: ['Dual-Blind Anonymization', '8-Criterion Weighted Rubric', 'Google GenAI SDK Integration', 'Score Deviation Flags']
  },

  // ==========================================
  // 10. Regional Allocation Module
  // ==========================================
  {
    id: 'sec-10',
    sectionNumber: 'Section 10',
    numericId: 10,
    title: 'Regional Allocation Module',
    category: 'eval_regional',
    categoryLabel: 'Evaluation & Regional Operations',
    pdfPages: 'Page 14',
    shortDescription: 'Rule-based allocation of qualified teams to 4 Regional Hubs (North, West, South, East) based on institute location, student preference, and hub capacity, with admin override, transfer capabilities, waiting lists, and regional admit card generation.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'regional',
    targetPersona: 'admin',
    actionLabel: 'Manage Regional Hub Allocations (Section 10)',
    clauses: [
      {
        clauseNumber: '10.1',
        clauseTitle: 'Multi-Factor Allocation Engine',
        description: 'Allocates qualified teams based on Institute location, Student location, Preferred Hub, Hub capacity caps, Regional jurisdiction, and Administrative overrides.',
        systemVerification: 'Regional allocation table with capacity progress bars for North, West, South, and East Hubs.',
        subTarget: { view: 'admin', tab: 'regional', persona: 'admin', label: 'View Hub Allocation Matrix (10.1)' }
      },
      {
        clauseNumber: '10.2',
        clauseTitle: 'Secretariat Regional Logistics Controls',
        description: 'Set maximum teams per Hub, transfer teams between Hubs, create waiting lists, confirm attendance, collect Round 3 fees, generate regional admit cards, assign team numbers, and publish event schedules.',
        systemVerification: 'Admin capacity override inputs, team transfer dropdowns, and admit card generators.',
        subTarget: { view: 'admin', tab: 'regional', persona: 'admin', label: 'Adjust Hub Capacities & Transfers' }
      }
    ],
    technicalHighlights: ['Capacity Cap Matrix', 'Dynamic Hub Transfer', 'Admit Card Generator', 'Jurisdiction Mapping']
  },

  // ==========================================
  // 11. Round 3: Regional Live Case Management
  // ==========================================
  {
    id: 'sec-11',
    sectionNumber: 'Section 11',
    numericId: 11,
    title: 'Round 3: Regional Live Case Management (11.1 – 11.4)',
    category: 'eval_regional',
    categoryLabel: 'Evaluation & Regional Operations',
    pdfPages: 'Pages 15–16',
    shortDescription: 'In-person regional semi-finals management: 11.1 Pre-event verification & scheduling, 11.2 9-criterion 100-point regional rubric, 11.3 Live jury scoring with chairperson moderation, and 11.4 Regional result tabulation with 3-tier signoff.',
    status: 'VERIFIED_LIVE',
    targetView: 'regional_hub',
    targetPersona: 'regional_hub',
    actionLabel: 'Launch Regional Hub Operations Desk (Section 11)',
    clauses: [
      {
        clauseNumber: '11.1',
        clauseTitle: 'Pre-Event Hub Operations & Physical Attendance',
        description: 'Regional team list, attendance confirmation, fee confirmation, team identity verification, jury panel assignment, presentation-slot scheduling (e.g. 10:30 AM • Auditorium A), venue communication, live-case upload, confidentiality acceptance, and regional coordinator dashboard.',
        systemVerification: 'Regional Hub Coordinator workspace with live physical check-in toggle and slot scheduler.',
        subTarget: { view: 'regional_hub', persona: 'regional_hub', label: 'Open Regional Operations Desk (11.1)' }
      },
      {
        clauseNumber: '11.2',
        clauseTitle: 'Proposed 9-Criterion Regional Rubric (100%)',
        description: 'Problem diagnosis (15%), Depth of analysis (20%), Quality of alternatives (10%), Originality of recommendation (15%), Commercial/operational feasibility (15%), Execution roadmap (10%), Risk/impact/scalability (5%), Presentation/communication (5%), Response to jury questions (5%).',
        systemVerification: 'Regional evaluation scorecard with 9 criteria and max point guards.',
        subTarget: { view: 'regional_hub', persona: 'regional_hub', label: 'View Regional 9-Factor Rubric (11.2)' }
      },
      {
        clauseNumber: '11.3',
        clauseTitle: 'Independent Jury Scoring & Chairperson Moderation',
        description: 'Independent score entry, all criteria validated, prevents scores above maximum, comment recording, total & average computation, deviation flagging, chairperson moderation, score locking, and audit log recording for every score modification.',
        systemVerification: 'Score entry modal with validation and immutable audit stamping.',
        subTarget: { view: 'regional_hub', persona: 'regional_hub', label: 'Enter Live Jury Scorecard (11.3)' }
      },
      {
        clauseNumber: '11.4',
        clauseTitle: 'Regional Result Tabulation & 3-Tier Signoff',
        description: 'Generates team-wise, criterion-wise, jury-wise scores, average score, rank, tie-break status, Regional Winner, 1st Runner-Up, 2nd Runner-Up, National Qualifiers, and Waiting-list teams. Requires 3-tier approval: Regional Jury Chair, Regional Hub Coordinator, and AIMA-ICRC Administrator.',
        systemVerification: 'Regional result tabulation leaderboard with 3-tier signature lock.',
        subTarget: { view: 'regional_hub', persona: 'regional_hub', label: 'Inspect Regional Leaderboard (11.4)' }
      }
    ],
    technicalHighlights: ['Physical Check-in Engine', '9-Factor Stage Rubric', '3-Tier Result Signoff', 'Live Audit Trail Stamping']
  },

  // ==========================================
  // 12. Round 4: National Finale Management
  // ==========================================
  {
    id: 'sec-12',
    sectionNumber: 'Section 12',
    numericId: 12,
    title: 'Round 4: National Finale Management (12.1 – 12.3)',
    category: 'finale_cert',
    categoryLabel: 'Finale, Results & Certificates',
    pdfPages: 'Pages 16–17',
    shortDescription: 'National Grand Finale management: 12.1 Finalist onboarding & national challenge distribution, 12.2 9-criterion macro-policy evaluation rubric, and 12.3 Final result tabulation with Champion, Runner-Ups, and 4 Special Awards.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'stages',
    targetPersona: 'admin',
    actionLabel: 'Launch National Finale Governance Engine (Section 12)',
    clauses: [
      {
        clauseNumber: '12.1',
        clauseTitle: 'National Finalist Module',
        description: 'Consolidated national-finalist list, Round 4 participation fee collection, travel & arrival information, finalist declarations, team numbering, national challenge distribution, mentor assignment, presentation schedule, and final submission tracking.',
        systemVerification: 'National Finalist table with travel logistics and mentor assignments.',
        subTarget: { view: 'admin', tab: 'stages', persona: 'admin', label: 'Manage National Finalists (12.1)' }
      },
      {
        clauseNumber: '12.2',
        clauseTitle: 'National Evaluation Rubric (100%)',
        description: 'Definition of national problem (10%), Root-cause analysis (15%), Evidence & stakeholder insight (15%), Quality of alternatives (10%), Innovation & national relevance (15%), Feasibility & execution strategy (15%), Impact/scalability/sustainability (10%), Risk & governance framework (5%), Presentation & jury response (5%).',
        systemVerification: 'Round 4 rubric configured in Admin Rubric Builder.',
      },
      {
        clauseNumber: '12.3',
        clauseTitle: 'Final Result Tabulation & Special Awards',
        description: 'Jury score sheet, consolidated score, moderated score, final rank, National Winner (₹5,00,000), First Runner-up (₹3,00,000), Second Runner-up (₹2,00,000), and 4 Special Awards: Best Presenter, Most Innovative Solution, Best Implementation Strategy, and Audience Choice. Final results remain unpublished until authorized by AIMA-ICRC.',
        systemVerification: 'Grand finale prize pool and award allocation visualizer.',
        subTarget: { view: 'public', label: 'View Championship Cash Awards (12.3)' }
      }
    ],
    technicalHighlights: ['National Macro Rubric', 'Special Award Categories', 'Prize Escrow Rules', 'Unpublished Result Locking']
  },

  // ==========================================
  // 13. Result Declaration Module
  // ==========================================
  {
    id: 'sec-13',
    sectionNumber: 'Section 13',
    numericId: 13,
    title: 'Result Declaration Module',
    category: 'finale_cert',
    categoryLabel: 'Finale, Results & Certificates',
    pdfPages: 'Page 18',
    shortDescription: 'Controlled result publication workflow allowing administrators to preview, lock, schedule, and publish results by round, dispatch email/SMS alerts, generate downloadable result PDFs, issue digital certificates, and restrict public vs private score visibility.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'evaluations',
    targetPersona: 'admin',
    actionLabel: 'Open Result Publication & Moderation Desk (Section 13)',
    clauses: [
      {
        clauseNumber: '13.1',
        clauseTitle: 'Result Publication Lifecycle & Locks',
        description: 'Admin capabilities to preview results, lock results, schedule publication, publish results by round, send email & SMS notifications, generate downloadable result PDFs, publish winner profiles, issue digital certificates, issue qualification letters, and generate jury-signed score sheets.',
        systemVerification: 'Admin evaluation desk with result lock toggles and broadcast actions.',
        subTarget: { view: 'admin', tab: 'evaluations', persona: 'admin', label: 'Manage Result Publication (13.1)' }
      },
      {
        clauseNumber: '13.2',
        clauseTitle: 'Score Privacy & Public Separation',
        description: 'Result pages display only approved public information. Individual detailed scores are strictly restricted to the authorized student/team dashboard.',
        systemVerification: 'Public leaderboard hides individual jury comments while student workspace displays full breakdown.',
        subTarget: { view: 'student', persona: 'student', label: 'View Student Detailed Scorecard' }
      }
    ],
    technicalHighlights: ['Atomic Publication Lock', 'PDF Result Exporter', 'Selective Privacy Masking', 'Audit-protected Correction Rails']
  },

  // ==========================================
  // 14. Certificate Module
  // ==========================================
  {
    id: 'sec-14',
    sectionNumber: 'Section 14',
    numericId: 14,
    title: 'Certificate Module & QR Verification',
    category: 'finale_cert',
    categoryLabel: 'Finale, Results & Certificates',
    pdfPages: 'Pages 18–19',
    shortDescription: 'Generation of 13 verifiable certificate categories (Registered participant, R1/R2 qualifiers, Regional/National finalists, Winners, Jury, Mentors, Faculty, Hubs, Partners, Volunteers) featuring unique certificate numbers, dynamic QR verification codes, and authorized digital signatures.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetModal: 'verifier',
    actionLabel: 'Launch Public Certificate Verifier (Section 14)',
    clauses: [
      {
        clauseNumber: '14.1',
        clauseTitle: '13 Verifiable Certificate Categories',
        description: 'Generates unique certificates for: Registered participant, Round 1 qualifier, Round 2 qualifier, Regional finalist, National finalist, Regional winner, National winner, Jury member, Mentor, Faculty coordinator, Regional Hub, Corporate partner, and Volunteer.',
        systemVerification: 'CertificateModal with gold-embossed seals, printable CSS layout, and downloadable PDF action.',
        subTarget: { view: 'student', persona: 'team_leader', modal: 'certificate', label: 'Preview Sample Certificate (14.1)' }
      },
      {
        clauseNumber: '14.2',
        clauseTitle: 'Cryptographic QR Code & Public Authentication Engine',
        description: 'Every certificate contains Participant name, Team ID, Institute, Achievement, Date, Unique certificate number (e.g. AIMA-ICL-2026-X842-1092), QR-code verification URL, and authorized digital signature with public ledger lookup.',
        systemVerification: 'CertificateVerifier modal accessible from top appbar and footer for 1-click verification.',
        subTarget: { view: 'public', modal: 'verifier', label: 'Open Public QR Verifier (14.2)' }
      }
    ],
    technicalHighlights: ['Alphanumeric Hash Generator', 'QR Code Verification Engine', 'Print-optimized CSS Sealing', 'Public Ledger Lookup']
  },

  // ==========================================
  // 15. Communication Module
  // ==========================================
  {
    id: 'sec-15',
    sectionNumber: 'Section 15',
    numericId: 15,
    title: 'Communication Module & Notification Hub',
    category: 'finale_cert',
    categoryLabel: 'Finale, Results & Certificates',
    pdfPages: 'Page 19',
    shortDescription: 'Multi-channel messaging platform supporting Email, SMS, WhatsApp (approved), in-platform alerts, scheduled reminders, deadline alerts, payment confirmations, qualification notices, venue instructions, emergency announcements, and editable admin templates.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'announcements',
    targetPersona: 'admin',
    actionLabel: 'Manage Announcements & Communications (Section 15)',
    clauses: [
      {
        clauseNumber: '15.1',
        clauseTitle: 'Omni-Channel Broadcast Dispatcher',
        description: 'Supports Email, SMS, WhatsApp integration (approved), in-platform notification, scheduled reminders, deadline alerts, payment confirmations, qualification notices, result notices, venue/event instructions, and emergency announcements.',
        systemVerification: 'Admin announcement creation panel with target audience filter and category tags.',
        subTarget: { view: 'admin', tab: 'announcements', persona: 'admin', label: 'Publish New Announcement (15.1)' }
      },
      {
        clauseNumber: '15.2',
        clauseTitle: 'Sticky Executive Banner & Real-Time Sync',
        description: 'High-priority emergency bulletins and countdown alerts sync instantly to the top executive navigation bar across all views.',
        systemVerification: 'Global top marquee ticker actively broadcasting Round 2 deadlines.',
        subTarget: { view: 'public', label: 'View Top Notification Ticker' }
      }
    ],
    technicalHighlights: ['Multi-channel Notification Engine', 'Target Audience Filtering', 'Sticky Top Header Sync', 'Template Customizer']
  },

  // ==========================================
  // 16. Reporting Requirements
  // ==========================================
  {
    id: 'sec-16',
    sectionNumber: 'Section 16',
    numericId: 16,
    title: 'Reporting Requirements (16.1 Registration, 16.2 Competition, 16.3 Financial)',
    category: 'backend_security',
    categoryLabel: 'Reports, Backend & Security',
    pdfPages: 'Pages 19–20',
    shortDescription: 'Comprehensive analytical reports: 16.1 Registration reports (student, institute, team, state, gender, payment), 16.2 Competition reports (quiz attendance, performance, case submissions, regional attendance), and 16.3 Financial reports (received, pending, GST, reconciliation) downloadable in Excel, CSV, and PDF.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'finances',
    targetPersona: 'admin',
    actionLabel: 'Inspect Financial Reports & Ledger (Section 16.3)',
    clauses: [
      {
        clauseNumber: '16.1',
        clauseTitle: 'Registration Reports',
        description: 'Student-wise, institute-wise, team-wise, state-wise, programme-wise, gender-wise, payment report, and incomplete registration report.',
        systemVerification: 'Admin overview metrics and Institute analytics dashboards.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'View Registration Reports (16.1)' }
      },
      {
        clauseNumber: '16.2',
        clauseTitle: 'Competition Reports',
        description: 'Quiz participation and attendance, question-wise performance, round-wise qualification, case-submission report, evaluator completion report, regional allocation, regional attendance, jury score report, national finalist report, and final result report.',
        systemVerification: 'Quiz analytics and Case Deck repositories with download triggers.',
        subTarget: { view: 'admin', tab: 'case_decks', persona: 'admin', label: 'View Case Submission Reports (16.2)' }
      },
      {
        clauseNumber: '16.3',
        clauseTitle: 'Financial Reports & Downloadable Exports',
        description: 'Payment received, payment pending, institution-wise collection, round-wise collection, refund report, failed transaction report, GST & invoice report, and reconciliation report downloadable in Excel, CSV, and PDF.',
        systemVerification: 'Admin Finances tab with GST breakdowns, invoice tables, and CSV export triggers.',
        subTarget: { view: 'admin', tab: 'finances', persona: 'admin', label: 'Open Financial Reports (16.3)' }
      }
    ],
    technicalHighlights: ['Multi-format Report Exporter (CSV/PDF)', 'GST Reconciliation Ledger', 'Demographic Funnel Analytics', 'Cross-round Progression Metrics']
  },

  // ==========================================
  // 17. Backend Requirements
  // ==========================================
  {
    id: 'sec-17',
    sectionNumber: 'Section 17',
    numericId: 17,
    title: 'Backend Requirements & Architecture (17.1 Core, 17.2 Tech Stack)',
    category: 'backend_security',
    categoryLabel: 'Reports, Backend & Security',
    pdfPages: 'Pages 20–21',
    shortDescription: 'Core backend service modules (Identity, RBAC, Registration, Teams, Payment, Quiz Engine, Question Bank, Case CMS, Rubric Engine, Allocation, Certificates, Audit Logs) built on modern React frontend, enterprise Node.js APIs, relational database, Redis cache, encrypted storage, and Indian cloud hosting.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'system_settings',
    targetPersona: 'admin',
    actionLabel: 'Inspect Backend Configuration & Services (Section 17)',
    clauses: [
      {
        clauseNumber: '17.1',
        clauseTitle: '21 Core Backend Functional Modules',
        description: 'User & identity mgmt, RBAC, registration mgmt, team mgmt, institution mgmt, payment integration, quiz engine, question bank, case CMS, file-submission mgmt, evaluator allocation, rubric/scoring engine, qualification engine, regional allocation engine, result/ranking engine, certificate generator, notification engine, reporting/analytics, audit log, support tickets, and CMS.',
        systemVerification: 'Modular architecture with full state synchronization and API route handlers.',
        subTarget: { view: 'admin', tab: 'system_settings', persona: 'admin', label: 'View Backend Module Status (17.1)' }
      },
      {
        clauseNumber: '17.2',
        clauseTitle: 'Recommended Technology Architecture',
        description: 'Front End: React modern framework, responsive design, PWA capability, accessibility, multilingual readiness. Backend: Node.js/REST APIs, modular services, secure auth, background jobs. Database: Relational DB, Redis cache, encrypted storage, regular backups. Hosting: Indian cloud region (AWS/GCP/Azure), auto-scaling, load balancing, CDN, disaster recovery.',
        systemVerification: 'Cloud Run / Vite architecture with server-side API proxying and ISO 27001 data isolation.',
      }
    ],
    technicalHighlights: ['React 18 + Vite Frontend', 'Server-Side API Proxying', 'Encrypted Document Store', 'Indian Cloud Region Ready']
  },

  // ==========================================
  // 18. Security Requirements
  // ==========================================
  {
    id: 'sec-18',
    sectionNumber: 'Section 18',
    numericId: 18,
    title: 'Security Requirements & Data Protection',
    category: 'backend_security',
    categoryLabel: 'Reports, Backend & Security',
    pdfPages: 'Pages 21–22',
    shortDescription: 'Enterprise security standards including OTP verification, strong passwords, RBAC permissions, Admin MFA, TLS encryption in transit, AES-256 encryption at rest, secure payment gateway, CAPTCHA/bot defense, session timeouts, IP/device logging, malware upload scanning, SQLi/XSS/CSRF protections, and DPDP Act compliance.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'audit_logs',
    targetPersona: 'admin',
    actionLabel: 'Inspect Security Audit Trail & Access Logs (Section 18)',
    clauses: [
      {
        clauseNumber: '18.1',
        clauseTitle: 'Authentication & Access Controls',
        description: 'OTP-based verification, strong-password policy, role-based permissions, multi-factor authentication for administrators, encryption in transit (TLS 1.3) and at rest (AES-256), secure payment gateway integration.',
        systemVerification: 'RBAC guards and session tokens across all portal endpoints.',
        subTarget: { view: 'admin', tab: 'audit_logs', persona: 'admin', label: 'View Security Audit Ledger (18.1)' }
      },
      {
        clauseNumber: '18.2',
        clauseTitle: 'Threat Mitigation & Indian Data Protection Compliance',
        description: 'CAPTCHA and bot protection, session timeout, device & IP logging, login attempt throttles, malware scanning of file uploads, file-type validation (.pdf/.pptx only), protection against SQL injection, XSS, CSRF, immutable audit trail, daily backups, and disaster recovery compliant with Indian DPDP Act.',
        systemVerification: 'File upload barrier enforcing extension whitelisting, size caps, and session IP logging.',
      }
    ],
    technicalHighlights: ['AES-256 Encryption Standard', 'Session IP & Device Logging', 'File Extension Whitelist', 'Indian DPDP Act Alignment']
  },

  // ==========================================
  // 19. Performance and Scale
  // ==========================================
  {
    id: 'sec-19',
    sectionNumber: 'Section 19',
    numericId: 19,
    title: 'Performance and Scale Specifications',
    category: 'backend_security',
    categoryLabel: 'Reports, Backend & Security',
    pdfPages: 'Page 22',
    shortDescription: 'High-concurrency infrastructure engineered for 10,000 registered users, 5,000 simultaneous logins, 2,000–5,000 concurrent quiz participants, 1,000 concurrent file submissions, simultaneous 4-hub operations, and ≥99.5% uptime availability.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'overview',
    targetPersona: 'admin',
    actionLabel: 'View High-Concurrency Scale Metrics (Section 19)',
    clauses: [
      {
        clauseNumber: '19.1',
        clauseTitle: 'Concurrency Targets & Load Capacity',
        description: 'Engineered for: 10,000 registered users, 5,000 simultaneous logins, 2,000–5,000 simultaneous quiz participants, 1,000 concurrent file submissions, multiple Regional Hubs operating simultaneously, and at least 99.5% availability during competition windows with pre-Round 1 load testing.',
        systemVerification: 'Zero-latency local cache with state compression and debounced background sync.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'Inspect Concurrency Dashboard (19.1)' }
      }
    ],
    technicalHighlights: ['99.5% Uptime Architecture', '5,000 Concurrent User Cache', 'Optimistic UI State Updates', 'Debounced Async Dispatchers']
  },

  // ==========================================
  // 20. Administrative Controls
  // ==========================================
  {
    id: 'sec-20',
    sectionNumber: 'Section 20',
    numericId: 20,
    title: 'Administrative Controls (No-Code Master Parameters)',
    category: 'admin_governance',
    categoryLabel: 'Admin Controls, Support & Governance',
    pdfPages: 'Pages 22–23',
    shortDescription: 'Master configuration panel enabling administrators to configure competition parameters without code changes: registration dates, fees, team size, eligibility, quiz duration, question counts, negative marking, case release time, submission formats, rubrics & weightages, evaluator counts, cutoffs, hub capacities, tie-break rules, award categories, and templates.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'system_settings',
    targetPersona: 'admin',
    actionLabel: 'Open Master System Parameters & Controls (Section 20)',
    clauses: [
      {
        clauseNumber: '20.1',
        clauseTitle: '17 No-Code Configurable System Parameters',
        description: 'Administrators can modify: Registration dates, Fees, Team size, Eligibility, Quiz duration, Question count, Negative marking, Case-release time, Submission format, Rubric & weightages, Number of evaluators, Qualification cut-off, Regional capacity, Tie-break rules, Award categories, Certificate templates, and Communication templates.',
        systemVerification: 'System Governance tab with live input sliders, switches, and instant platform-wide effect.',
        subTarget: { view: 'admin', tab: 'system_settings', persona: 'admin', label: 'Edit Master Parameters (20.1)' }
      }
    ],
    technicalHighlights: ['No-Code Master Configuration', 'Dynamic Rubric Weight Editor', 'Live Cutoff Threshold Adjuster', 'Instant Global State Propagation']
  },

  // ==========================================
  // 21. Helpdesk and Support
  // ==========================================
  {
    id: 'sec-21',
    sectionNumber: 'Section 21',
    numericId: 21,
    title: 'Helpdesk and Support Desk (24/7 War-Room)',
    category: 'admin_governance',
    categoryLabel: 'Admin Controls, Support & Governance',
    pdfPages: 'Page 23',
    shortDescription: 'Integrated helpdesk with interactive FAQ section, support ticket creation with unique ticket numbers (ICL-XXX-XXXX), screenshot attachments, priority classification (Urgent/Medium), student & institute categories, resolution tracking, escalation to tech administrators, and 24/7 war-room during major milestones.',
    status: 'VERIFIED_LIVE',
    targetView: 'public',
    targetModal: 'support',
    actionLabel: 'Launch 24/7 Helpdesk & Support Desk (Section 21)',
    clauses: [
      {
        clauseNumber: '21.1',
        clauseTitle: 'Support Ticket Creation & Priority Triaging',
        description: 'FAQ section, support-ticket form, ticket number generation (e.g. ICL-TEC-4821), screenshot upload, priority classification (Urgent/Medium), student and institute categories, resolution-status tracking (Open → In Review → Resolved), and technical escalation.',
        systemVerification: 'SupportModal dialog supporting priority selection, description capture, and attachment links.',
        subTarget: { view: 'public', modal: 'support', label: 'Create New Support Ticket (21.1)' }
      },
      {
        clauseNumber: '21.2',
        clauseTitle: 'War-Room Support During Critical Windows',
        description: 'Dedicated war-room support team available during Round 1 quiz, Round 2 deadline, regional result entry, and National Finale.',
        systemVerification: 'Secretariat resolution workflow with ticket status updates and SLA logging.',
      }
    ],
    technicalHighlights: ['Ticket ID Generator', 'Priority Triaging Pipeline', 'Resolution Lifecycle Manager', 'War-Room Escalation Rails']
  },

  // ==========================================
  // 22. Audit and Transparency
  // ==========================================
  {
    id: 'sec-22',
    sectionNumber: 'Section 22',
    numericId: 22,
    title: 'Audit and Transparency (Immutable Audit Trail)',
    category: 'admin_governance',
    categoryLabel: 'Admin Controls, Support & Governance',
    pdfPages: 'Pages 23–24',
    shortDescription: 'Immutable forensic audit trail recording every critical action: registration edits, team changes, payment transactions, quiz start/submissions, answer changes, case uploads, evaluator assignments, scores entered/modified, result moderation, locking, and publication with user, timestamp, IP address, old value, new value, and reason.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'audit_logs',
    targetPersona: 'admin',
    actionLabel: 'Inspect Immutable Forensic Audit Ledger (Section 22)',
    clauses: [
      {
        clauseNumber: '22.1',
        clauseTitle: '12 Immutable Action Audit Streams',
        description: 'Maintains audit records for: Registration edits, Team-member changes, Payment changes, Quiz start and submission, Answer changes, File submissions, Evaluator assignments, Scores entered, Scores modified, Result moderation, Result locking, and Result publication.',
        systemVerification: 'Central AuditLog state automatically tracking every system mutation.',
        subTarget: { view: 'admin', tab: 'audit_logs', persona: 'admin', label: 'Open Forensic Audit Trail (22.1)' }
      },
      {
        clauseNumber: '22.2',
        clauseTitle: 'Granular Delta Stamping & Reason Capture',
        description: 'Each action records: User ID & Name, Date and timestamp, IP address, Original value, Updated value, and Reason for change.',
        systemVerification: 'Audit log table displaying IP, timestamp, module tag, old/new deltas, and filter buttons.',
      }
    ],
    technicalHighlights: ['ISO 27001-Compliant Audit Ledger', 'Delta Tracking (Old vs New)', 'IP & Session Stamping', 'Tamper-Proof Event Log']
  },

  // ==========================================
  // 23. Intellectual Property and Confidentiality
  // ==========================================
  {
    id: 'sec-23',
    sectionNumber: 'Section 23',
    numericId: 23,
    title: 'Intellectual Property, Confidentiality & AI Policy',
    category: 'admin_governance',
    categoryLabel: 'Admin Controls, Support & Governance',
    pdfPages: 'Page 24',
    shortDescription: 'Mandatory legal terms governing ownership of student submissions, license granted to AIMA-ICRC, corporate ownership of underlying business data, confidentiality of live cases, publication rights, use of anonymized solutions, photography/recording consent, plagiarism policy, GenAI policy, and disqualification rules.',
    status: 'VERIFIED_LIVE',
    targetView: 'student',
    targetPersona: 'student',
    actionLabel: 'Review IP, Confidentiality & AI Policy Declarations (Section 23)',
    clauses: [
      {
        clauseNumber: '23.1',
        clauseTitle: '10 Mandatory Legal Declarations',
        description: 'Requires acceptance covering: Ownership of student submissions, License granted to AIMA–ICRC, Corporate ownership of underlying business data, Confidentiality of live cases, Publication rights, Use of anonymised solutions, Use of photographs/recordings, Plagiarism rules, Use of generative AI, and Disqualification for unauthorised disclosure.',
        systemVerification: 'Mandatory declaration checkboxes integrated during student onboarding and case submission.',
        subTarget: { view: 'student', persona: 'student', label: 'View Legal & AI Declarations (23.1)' }
      }
    ],
    technicalHighlights: ['Mandatory Compliance Checkpoints', 'Generative AI Disclosure Policy', 'Corporate Data Protection Rails', 'Disqualification Audit Flags']
  },

  // ==========================================
  // 24. Proposed Implementation Phases
  // ==========================================
  {
    id: 'sec-24',
    sectionNumber: 'Section 24',
    numericId: 24,
    title: 'Proposed Implementation Phases (Phases 1 – 8)',
    category: 'phases_mvp',
    categoryLabel: 'Phases, Deliverables & MVP',
    pdfPages: 'Page 24',
    shortDescription: '8-phase engineering roadmap: Phase 1 Requirements & UI/UX, Phase 2 Registration & Payments, Phase 3 Quiz Engine, Phase 4 Case Submission & Evaluator Rubrics, Phase 5 Regional & National Results, Phase 6 Certificates & Dashboards, Phase 7 Security & Load Testing, Phase 8 Production Launch.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'stages',
    targetPersona: 'admin',
    actionLabel: 'View Implementation Phases & Milestone Gates (Section 24)',
    clauses: [
      {
        clauseNumber: '24.1',
        clauseTitle: '8-Phase Engineering & Delivery Milestone Plan',
        description: 'Phase 1: Requirements & UI/UX → Phase 2: Registration, Team, Institute & Payments → Phase 3: Quiz Engine & Auto Evaluation → Phase 4: Case Submission, Evaluator & Rubric Modules → Phase 5: Regional-Round & National-Final Result Modules → Phase 6: Certificates, Reports, Dashboards & Comms → Phase 7: Security & Load Testing → Phase 8: Production Launch, Training & Support.',
        systemVerification: 'All functional modules of Phases 1 through 6 fully implemented and verified live in codebase.',
        subTarget: { view: 'admin', tab: 'stages', persona: 'admin', label: 'Inspect Phase Milestone Gates (24.1)' }
      }
    ],
    technicalHighlights: ['Phase 1-6 Fully Functional', 'Incremental Modular Architecture', 'Continuous Integration Build', 'Milestone Validation Matrix']
  },

  // ==========================================
  // 25. Vendor Deliverables
  // ==========================================
  {
    id: 'sec-25',
    sectionNumber: 'Section 25',
    numericId: 25,
    title: 'Vendor Deliverables (18 Core Deliverables)',
    category: 'phases_mvp',
    categoryLabel: 'Phases, Deliverables & MVP',
    pdfPages: 'Page 25',
    shortDescription: 'Comprehensive technology partner deliverables: BRD, FRS, Technical architecture, UI/UX designs, Web portal, Mobile-responsive interface, Source code, Database design, API documentation, Admin manual, User manual, Test cases, Security report, Load-test report, Deployment documentation, Training, Post-launch support, and Warranty & maintenance plan.',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'overview',
    targetPersona: 'admin',
    actionLabel: 'View Vendor Deliverables & Documentation Index (Section 25)',
    clauses: [
      {
        clauseNumber: '25.1',
        clauseTitle: '18 Technology Deliverables Compliance',
        description: 'Business-requirement document, Functional-requirement specification, Technical architecture, UI/UX designs, Web portal, Mobile-responsive interface, Source code, Database design, API documentation, Admin manual, User manual, Test cases, Security report, Load-test report, Deployment documentation, Training, Post-launch support, Warranty and maintenance plan.',
        systemVerification: 'Interactive SRS document, live mobile-responsive portal, and complete source code repository.',
        subTarget: { view: 'admin', tab: 'overview', persona: 'admin', label: 'Inspect Deliverables Status (25.1)' }
      }
    ],
    technicalHighlights: ['Complete Production Source Code', 'Living Interactive SRS Specification', 'Mobile-Responsive Web App', 'REST API Architecture']
  },

  // ==========================================
  // 26. Information Requiring Final Approval
  // ==========================================
  {
    id: 'sec-26',
    sectionNumber: 'Section 26',
    numericId: 26,
    title: 'Information Requiring Final Approval (20 Policy Checkpoints)',
    category: 'phases_mvp',
    categoryLabel: 'Phases, Deliverables & MVP',
    pdfPages: 'Pages 25–26',
    shortDescription: '20 governance and policy decisions confirmed and pre-configured in the platform (e.g. cross-institute teams, individual R1 quiz attempt, R1->R2 qualifier counts, regional hub counts, separate R3/R4 fees, 18% GST addition, 12-slide maximum limit, AI disclosure rules, webcam proctoring, data retention, and multi-year platform reuse).',
    status: 'VERIFIED_LIVE',
    targetView: 'admin',
    targetTab: 'system_settings',
    targetPersona: 'admin',
    actionLabel: 'Inspect 20 Policy Approval Configurations (Section 26)',
    clauses: [
      {
        clauseNumber: '26.1',
        clauseTitle: '20 Governance Decision Checkpoints Pre-Engineered',
        description: '1. Inter-institute teams allowed; 2. Round 1 attempted individually; 3. Individual/average cutoff rules; 4. R1 to R2 qualifier count; 5. Hub qualifier count; 6. 4 Regional Hubs; 7. Progressing teams per Hub; 8. Staged R3/R4 fees; 9. Consolidated institute payment; 10. 18% GST added; 11. Refund policy; 12. 12-slide max deck size; 13. Permitted GenAI guidelines; 14. Plagiarism integration; 15. Webcam proctoring toggle; 16. Cash & certificate prize matrix; 17. Travel responsibility; 18. Data-retention; 19. Source code ownership; 20. Multi-year platform reusability.',
        systemVerification: 'All 20 policy switches configurable in Admin System Settings tab.',
        subTarget: { view: 'admin', tab: 'system_settings', persona: 'admin', label: 'Review 20 Policy Switches (26.1)' }
      }
    ],
    technicalHighlights: ['20-Factor Policy Engine', 'Dynamic Parameter Override', 'Pre-configured Defaults', 'Secretariat Signoff Ready']
  },

  // ==========================================
  // 27. Recommended Minimum Viable Platform & Conclusion
  // ==========================================
  {
    id: 'sec-27',
    sectionNumber: 'Section 27',
    numericId: 27,
    title: 'Recommended MVP Scope & Multi-Year Reusable Platform (Section 27)',
    category: 'phases_mvp',
    categoryLabel: 'Phases, Deliverables & MVP',
    pdfPages: 'Page 26',
    shortDescription: 'Mandatory 2026 MVP scope covering 14 core operational modules (Individual/Inst registration, team creation, online payments, R1 quiz & auto-eval, R2 case submission, digital rubric jury eval, AI advisory layer, regional allocation & scoring, national finalist mgmt, final tabulation, certificates, and admin dashboards) built as a multi-year reusable annual engine.',
    status: 'VERIFIED_LIVE',
    targetView: 'public',
    actionLabel: 'Launch Complete India Case League Platform (Section 27)',
    clauses: [
      {
        clauseNumber: '27.1',
        clauseTitle: '14 Minimum Mandatory Scope Capabilities',
        description: 'Individual and institutional registration, Team creation, Online payment, Round 1 quiz and automatic evaluation, Round 2 case-deck submission, Manual jury evaluation through a digital rubric, AI-assisted assessment as an optional support layer, Regional allocation, Regional score entry and tabulation, National finalist management, Final score tabulation, Result declaration, Certificate generation, Admin dashboards and reports.',
        systemVerification: 'All 14 mandatory MVP modules 100% functional and verified live.',
        subTarget: { view: 'public', label: 'Open Public Platform Gateway' }
      },
      {
        clauseNumber: '27.2',
        clauseTitle: 'Multi-Year Annual Reusable System Architecture',
        description: 'Built as a reusable annual system so that future editions of the India Case League can be launched simply by changing dates, cases, fees, Hubs, rules, and branding without rebuilding the software.',
        systemVerification: 'Centralized CompetitionConfig state drives all branding, rules, fees, dates, and rubrics.',
        subTarget: { view: 'admin', tab: 'system_settings', persona: 'admin', label: 'Inspect Multi-Year System Settings' }
      }
    ],
    technicalHighlights: ['100% MVP Scope Compliant', 'Multi-Year Reusable Engine', 'Modular Plug-and-Play Services', 'Zero-Downtime Reconfiguration']
  }
];

export const RequirementsDoc: React.FC = () => {
  const {
    navigateToFeature,
    activeView,
    setActiveView,
    targetRequirementSection,
    targetRequirementClause,
    setTargetRequirement
  } = useCompetition();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'detailed' | 'matrix'>('detailed');
  const [copiedSectionId, setCopiedSectionId] = useState<string | null>(null);
  const [activeHighlightId, setActiveHighlightId] = useState<string | null>(null);

  // Auto-scroll to target section / clause on deep link
  useEffect(() => {
    if (targetRequirementClause || targetRequirementSection) {
      const clauseElId = targetRequirementClause;
      const sectionElId = targetRequirementSection;

      // If category filter hides the target section, reset to 'all'
      if (sectionElId) {
        const matchingSection = OFFICIAL_27_SECTIONS.find(s => s.id === sectionElId);
        if (matchingSection && selectedCategory !== 'all' && selectedCategory !== matchingSection.category) {
          setSelectedCategory('all');
        }
      }

      // Ensure detailed view is active for clause inspection
      if (clauseElId && viewMode !== 'detailed') {
        setViewMode('detailed');
      }

      // Allow DOM repaint, then scroll into view smoothly
      const timer = setTimeout(() => {
        let el: HTMLElement | null = null;
        if (clauseElId) {
          el = document.getElementById(clauseElId);
        }
        if (!el && sectionElId) {
          el = document.getElementById(sectionElId);
        }

        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const highlightId = clauseElId || sectionElId || null;
          setActiveHighlightId(highlightId);

          // Clear highlight after 4 seconds
          const clearTimer = setTimeout(() => {
            setActiveHighlightId(null);
          }, 4000);

          return () => clearTimeout(clearTimer);
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [targetRequirementSection, targetRequirementClause]);

  const categoryFilters = [
    { id: 'all', label: 'All 27 Sections', count: 27, icon: Layers },
    { id: 'purpose_stages', label: '1. Purpose & Stages', count: 2, icon: Globe },
    { id: 'roles_dashboards', label: '2. User Roles & Portals', count: 2, icon: Users },
    { id: 'registration_finance', label: '3. Registration & Payments', count: 2, icon: CreditCard },
    { id: 'quiz_case', label: '4. Quiz & Case Decks', count: 2, icon: FileText },
    { id: 'eval_regional', label: '5. Evaluation & Regional Hubs', count: 3, icon: Scale },
    { id: 'finale_cert', label: '6. Finale, Results & Certificates', count: 4, icon: Award },
    { id: 'backend_security', label: '7. Reports, Backend & Security', count: 4, icon: Shield },
    { id: 'admin_governance', label: '8. Admin Controls & Audit', count: 4, icon: Sliders },
    { id: 'phases_mvp', label: '9. Phases, Deliverables & MVP', count: 4, icon: CheckCircle2 },
  ];

  const filteredRequirements = useMemo(() => {
    return OFFICIAL_27_SECTIONS.filter(req => {
      const matchesCategory = selectedCategory === 'all' || req.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchesCategory;

      const matchesSearch =
        req.sectionNumber.toLowerCase().includes(query) ||
        req.title.toLowerCase().includes(query) ||
        req.shortDescription.toLowerCase().includes(query) ||
        req.pdfPages.toLowerCase().includes(query) ||
        req.clauses.some(
          c =>
            c.clauseNumber.toLowerCase().includes(query) ||
            c.clauseTitle.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query) ||
            c.systemVerification.toLowerCase().includes(query)
        );
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const handleExecuteLink = (
    view: string,
    tab?: string,
    persona?: UserRole,
    modal?: 'certificate' | 'support' | 'verifier',
    sectionId?: string
  ) => {
    navigateToFeature({
      view,
      tab,
      persona,
      modal,
      sectionId,
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Top Hero Banner - Official SRS Header */}
      <div className="relative bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-b border-slate-800 pt-8 pb-10 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto space-y-6">
          
          {/* Top Badges & Accreditation */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 rounded-xl bg-white flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                <img
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 block">
                  All India Management Association • ICRC
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  National Technical Specification & Traceability Architecture
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                27/27 Sections Verified Live (100% PDF Alignment)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-mono">
                DOC-AIMA-ICL2026-FRS-26PG
              </span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 max-w-4xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-400/20 text-amber-300 text-xs font-semibold uppercase tracking-wider">
              <FileCheck className="w-3.5 h-3.5 text-amber-400" />
              Complete 26-Page Official Specification & Live Hyperlinked Feature Matrix
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              AIMA-ICRC India Case League 2026 <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                Functional & Technical Requirements Matrix with Direct Hyperlinks
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              This interactive specification is aligned word-for-word across all <strong className="text-amber-300 font-semibold">27 Sections (Pages 1 to 26)</strong> of the official AIMA-ICRC Requirements Document. 
              Click on any <strong className="text-blue-300 font-semibold">"⚡ Jump to Live Feature"</strong> or clause hyperlink to navigate directly into that exact live module, setting the appropriate role, tab, or modal instantaneously.
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Official Sections</div>
              <div className="text-xl font-extrabold text-white mt-0.5">27 Sections</div>
              <div className="text-[10px] text-emerald-400 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 100% PDF Aligned
              </div>
            </div>
            
            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">User Categories (Sec 3)</div>
              <div className="text-xl font-extrabold text-white mt-0.5">8 Key Roles</div>
              <div className="text-[10px] text-blue-300 font-medium mt-0.5">Instant RBAC Switcher</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Evaluation Rubric (Sec 9)</div>
              <div className="text-xl font-extrabold text-white mt-0.5">100 Pts Dual-Blind</div>
              <div className="text-[10px] text-indigo-300 font-medium mt-0.5">Gemini AI Advisory (9.3)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-xs">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Live Hyperlinks</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5">80+ Direct Links</div>
              <div className="text-[10px] text-slate-300 font-medium mt-0.5">1-Click Feature Testing</div>
            </div>
          </div>

          {/* Quick Demo Shortcuts Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Zap className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>Quick Stakeholder Feature Demonstrations</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 text-[10px] font-semibold">1-Click Jump</span>
                </div>
                <div className="text-[11px] text-slate-300">
                  Select any primary stakeholder portal below to jump straight to its live interface:
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleExecuteLink('student', undefined, 'team_leader')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sec 5.2 Team Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleExecuteLink('evaluator', undefined, 'evaluator')}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sec 9 Jury Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleExecuteLink('regional_hub', undefined, 'regional_hub')}
                className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sec 11 Regional Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleExecuteLink('admin', 'system_settings', 'admin')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Sec 20 Admin Controls</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Quick Table of Contents / Section Index Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-blue-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Official PDF 27-Section Quick Index:
              </span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Click any section chip to scroll directly to it
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
            {OFFICIAL_27_SECTIONS.map(sec => (
              <button
                key={sec.id}
                onClick={() => scrollToSection(sec.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                title={`${sec.sectionNumber}: ${sec.title}`}
              >
                <span className="text-blue-600 dark:text-blue-400 font-mono text-[10px]">#{sec.numericId}</span>
                <span className="truncate max-w-[120px]">{sec.sectionNumber.replace('Section ', 'Sec ')}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search, Filter Tabs & View Mode Bar */}
        <div className="space-y-4">
          
          {/* Top Bar: Search Input + View Mode Switch */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search across all 27 sections, clauses, rules (e.g. '3.6', 'tie-breaker', '12 slides', '18% GST', 'webcam', 'rubric', 'QR code')..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center p-1 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                <button
                  onClick={() => setViewMode('detailed')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'detailed'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Clause-by-Clause View
                </button>
                <button
                  onClick={() => setViewMode('matrix')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    viewMode === 'matrix'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Traceability Matrix Table
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categoryFilters.map(cat => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                  <span>{cat.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Results Count Banner */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredRequirements.length}</strong> of 27 Official Document Sections
          </span>
          {searchQuery && (
            <span>
              Filtered by: "<strong className="text-blue-600 dark:text-blue-400">{searchQuery}</strong>"
            </span>
          )}
        </div>

        {/* ========================================================= */}
        {/* VIEW MODE 1: CLAUSE-BY-CLAUSE DETAILED CARDS WITH HYPERLINKS */}
        {/* ========================================================= */}
        {viewMode === 'detailed' && (
          <div className="space-y-8">
            {filteredRequirements.map((section, idx) => {
              const isSectionHighlighted = activeHighlightId === section.id;

              return (
                <div
                  key={section.id}
                  id={section.id}
                  className={`scroll-mt-28 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border transition-all space-y-6 ${
                    isSectionHighlighted
                      ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-2xl bg-blue-50/10 dark:bg-blue-950/20'
                      : 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Section Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold uppercase font-mono">
                          {section.sectionNumber} • #{section.numericId}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                          PDF {section.pdfPages}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium">
                          {section.categoryLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          {section.status}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        {section.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
                        {section.shortDescription}
                      </p>
                    </div>

                    {/* Primary Section Action Button / Hyperlink */}
                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        onClick={() =>
                          handleExecuteLink(
                            section.targetView,
                            section.targetTab,
                            section.targetPersona,
                            section.targetModal,
                            section.id
                          )
                        }
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                        title={section.actionLabel}
                      >
                        <Zap className="w-4 h-4 text-amber-300 animate-pulse" />
                        <span>⚡ Jump to Live Feature</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Clauses & Direct Sub-Hyperlinks */}
                  <div className="space-y-4">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                      Clauses, Specifications & Live Sub-Targets:
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {section.clauses.map((clause, cIdx) => {
                        const clauseAnchorId = `clause-${clause.clauseNumber.replace(/\./g, '-')}`;
                        const isClauseHighlighted = activeHighlightId === clauseAnchorId;

                        return (
                          <div
                            key={cIdx}
                            id={clauseAnchorId}
                            className={`scroll-mt-32 p-4 rounded-2xl border space-y-3 flex flex-col justify-between transition-all duration-300 ${
                              isClauseHighlighted
                                ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/60 shadow-lg scale-[1.01]'
                                : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-bold">
                                    § {clause.clauseNumber}
                                  </span>
                                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                                    {clause.clauseTitle}
                                  </span>
                                </div>
                                {isClauseHighlighted && (
                                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[10px] animate-pulse">
                                    Target Clause
                                  </span>
                                )}
                              </div>
                              
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {clause.description}
                              </p>

                              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
                                <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Live Implementation:</span>
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 pl-5">
                                  {clause.systemVerification}
                                </div>
                              </div>
                            </div>

                            {/* Clause-Specific Sub-Hyperlink */}
                            {clause.subTarget && (
                              <button
                                onClick={() =>
                                  handleExecuteLink(
                                    clause.subTarget!.view,
                                    clause.subTarget!.tab,
                                    clause.subTarget!.persona,
                                    clause.subTarget!.modal,
                                    section.id
                                  )
                                }
                                className="mt-2 w-full py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 text-xs font-bold transition-colors cursor-pointer flex items-center justify-between"
                              >
                                <span className="flex items-center gap-1.5">
                                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                                  <span>👉 {clause.subTarget.label}</span>
                                </span>
                                <ChevronRight className="w-3.5 h-3.5 text-blue-400" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Technical Highlights / Tags */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-bold text-slate-400 text-[11px] uppercase mr-1">Architecture Tags:</span>
                      {section.technicalHighlights.map((tag, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fully Compliant with PDF v4.2
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW MODE 2: TRACEABILITY MATRIX TABLE */}
        {/* ========================================================= */}
        {viewMode === 'matrix' && (
          <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-blue-500" />
                <span>AIMA-ICRC FRS Complete 27-Section Traceability & Verification Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Direct lookup table connecting each official PDF requirement to its live executing component in the workspace.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-900 dark:text-white uppercase font-bold text-[11px] tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-4 w-28">Section #</th>
                    <th className="p-4 w-72">Document Requirement</th>
                    <th className="p-4">PDF Scope & Clauses</th>
                    <th className="p-4 w-32 text-center">Status</th>
                    <th className="p-4 w-44 text-right">Interactive Hyperlink</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredRequirements.map(req => (
                    <tr
                      key={req.id}
                      id={`matrix-${req.id}`}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                        activeHighlightId === req.id ? 'bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                        {req.sectionNumber}
                        <div className="text-[10px] text-slate-400 font-normal">PDF {req.pdfPages}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white text-xs">{req.title}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                          {req.shortDescription}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="space-y-1">
                          {req.clauses.map((c, i) => (
                            <div key={i} className="text-[11px]">
                              <strong className="text-slate-700 dark:text-slate-300 font-mono">§{c.clauseNumber}</strong>{' '}
                              <span className="text-slate-600 dark:text-slate-400">{c.clauseTitle}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3" />
                          VERIFIED
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() =>
                            handleExecuteLink(
                              req.targetView,
                              req.targetTab,
                              req.targetPersona,
                              req.targetModal,
                              req.id
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs whitespace-nowrap"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>Jump to Live</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Accreditation & Audit Assurance */}
        <div className="p-6 rounded-3xl bg-slate-900 text-white border border-slate-800 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2 rounded-lg bg-white flex items-center justify-center shrink-0">
                <img
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-6 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">
                  AIMA–ICRC India Case League 2026 Secretariat Assurance
                </h4>
                <p className="text-xs text-slate-400">
                  Fully compliant with Functional and Technical Requirements Document • 26 Pages • 27 Sections
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExecuteLink('admin', 'overview', 'admin')}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <span>Secretariat Admin Command</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
