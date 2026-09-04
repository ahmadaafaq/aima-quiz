import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCompetition } from '../../context/CompetitionContext';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Info,
  Shield,
  ShieldCheck,
  Sparkles,
  X,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Lock,
  Layers,
  Award
} from 'lucide-react';

export interface DocRequirementItem {
  sectionNumber: string;
  title: string;
  clauseNumber?: string;
  rationale: string;
  specification: string;
  systemProof?: string;
  pdfPages?: string;
  categoryLabel?: string;
}

/**
 * Resolves exact section anchor ID and clause anchor ID from BRD metadata
 */
export function getClauseAndSectionIds(
  sectionNumber: string,
  clauseNumber?: string,
  specKey?: string
): { sectionId: string; clauseId: string } {
  const PRESET_MAP: Record<string, { sec: number; clause?: string }> = {
    // Stage 1-4 Progression & Funnel
    student_progression: { sec: 2, clause: '2.1' },
    admin_stage_progression: { sec: 2, clause: '2.1' },
    admin_stages: { sec: 2, clause: '2.1' },
    public_roadmap: { sec: 2, clause: '2.1' },

    // Role & Entity Definitions
    institute_spoc_auth: { sec: 3, clause: '3.4' },
    corporate_talent_vault: { sec: 3, clause: '3.7' },
    corporate_case_branding: { sec: 3, clause: '3.7' },

    // Dashboards & Portals
    ai_assistant: { sec: 4, clause: '4.1' },
    institute_roster: { sec: 4, clause: '4.3' },
    institute_leaderboard: { sec: 4, clause: '4.3' },
    institute_analytics: { sec: 4, clause: '4.3' },

    // Registration & Declarations
    student_eligibility: { sec: 5, clause: '5.1' },
    student_declaration: { sec: 5, clause: '5.1' },
    public_eligibility: { sec: 5, clause: '5.1' },
    team_formation: { sec: 5, clause: '5.2' },
    student_team_formation: { sec: 5, clause: '5.2' },
    institute_bulk_upload: { sec: 5, clause: '5.3' },

    // Payment & Fee Collection
    student_fees: { sec: 6, clause: '6.1' },
    student_fee_payment: { sec: 6, clause: '6.1' },
    institute_bursar: { sec: 6, clause: '6.1' },
    institute_vouchers: { sec: 6, clause: '6.2' },
    institute_gst_invoice: { sec: 6, clause: '6.3' },
    admin_finances: { sec: 6, clause: '6.3' },

    // Round 1: Online Quiz
    admin_quiz_program_manager: { sec: 7, clause: '7.1' },
    round1_quiz: { sec: 7, clause: '7.3' },
    student_quiz_engine: { sec: 7, clause: '7.3' },
    admin_tie_breaker: { sec: 7, clause: '7.4' },

    // Round 2: Case Deck Submission
    round2_case: { sec: 8, clause: '8.2' },
    student_r2_submission: { sec: 8, clause: '8.2' },
    evaluator_pdf_deck: { sec: 8, clause: '8.2' },
    evaluator_loom_video: { sec: 8, clause: '8.2' },
    evaluator_excel_dcf: { sec: 8, clause: '8.2' },

    // Round 2: Evaluation & Jury Rubrics
    evaluator_dual_blind: { sec: 9, clause: '9.1' },
    evaluator_rubric: { sec: 9, clause: '9.2' },
    evaluator_ai_advisory: { sec: 9, clause: '9.3' },
    evaluator_queue: { sec: 9, clause: '9.4' },
    evaluator_coi_recusal: { sec: 9, clause: '9.4' },
    admin_jury_moderation: { sec: 9, clause: '9.5' },

    // Regional Hub Allocation
    student_hub_allocation: { sec: 10, clause: '10.1' },

    // Round 3: Regional Live Case Management
    round3_regional: { sec: 11, clause: '11.1' },
    hub_command: { sec: 11, clause: '11.1' },
    hub_presentation_slots: { sec: 11, clause: '11.1' },
    hub_live_scoring: { sec: 11, clause: '11.2' },
    hub_regional_advancement: { sec: 11, clause: '11.4' },

    // Round 4: National Finale & Prizes
    public_prizes: { sec: 12, clause: '12.3' },

    // Certificates & QR Verification
    certificates_qr: { sec: 14, clause: '14.1' },
    student_certificate_qr: { sec: 14, clause: '14.1' },

    // Helpdesk & SLAs
    helpdesk_sla: { sec: 21, clause: '21.1' },

    // Audit & Transparency
    admin_audit: { sec: 22, clause: '22.1' },
    admin_audit_trail: { sec: 22, clause: '22.1' },
  };

  if (specKey && PRESET_MAP[specKey]) {
    const item = PRESET_MAP[specKey];
    const secId = `sec-${item.sec}`;
    const clId = item.clause ? `clause-${item.clause.replace(/\./g, '-')}` : `clause-${item.sec}-1`;
    return { sectionId: secId, clauseId: clId };
  }

  let secNum = 1;
  let clauseNumStr = '';
  if (clauseNumber) {
    const match = clauseNumber.match(/(\d+)\.(\d+)/);
    if (match) {
      secNum = parseInt(match[1], 10);
      clauseNumStr = `${match[1]}.${match[2]}`;
    }
  }

  if (!clauseNumStr && sectionNumber) {
    const clauseMatch = sectionNumber.match(/(\d+)\.(\d+)/);
    if (clauseMatch) {
      secNum = parseInt(clauseMatch[1], 10);
      clauseNumStr = `${clauseMatch[1]}.${clauseMatch[2]}`;
    } else {
      const secMatch = sectionNumber.match(/Section\s*(\d+)/i);
      if (secMatch) {
        secNum = parseInt(secMatch[1], 10);
        clauseNumStr = `${secNum}.1`;
      }
    }
  }

  const sectionId = `sec-${secNum}`;
  const clauseId = clauseNumStr ? `clause-${clauseNumStr.replace(/\./g, '-')}` : `clause-${secNum}-1`;
  return { sectionId, clauseId };
}

export const PRESET_REQUIREMENTS: Record<string, DocRequirementItem> = {
  // Evaluator / Jury Section
  evaluator_dual_blind: {
    sectionNumber: 'Section 9.1',
    clauseNumber: 'Clause 9.1',
    title: 'Dual-Blind Evaluation & Anti-Bias Masking Protocol',
    rationale: 'To ensure complete fairness, candidate names, gender, contact details, and institutional affiliations are blinded during evaluation. This prevents pedigree bias (e.g. favoring top IIMs over emerging business schools) and unconscious demographic favoritism.',
    specification: 'All case decks are assigned cryptographic hash IDs (e.g. AIMA-R2-DK-891). Evaluator workstations strictly render sanitized metadata, masking identity until scores are sealed by the National Moderation Board.',
    systemProof: 'Automated HMAC-SHA256 token anonymizer active. Candidate & institution properties are stripped from jury payloads.',
    pdfPages: 'Pages 13–14'
  },
  evaluator_queue: {
    sectionNumber: 'Section 9.4',
    clauseNumber: 'Clause 9.4',
    title: 'Evaluator Allocation & Impartial Workload Queue',
    rationale: 'Submissions are dynamically distributed across accredited evaluators to balance evaluation workload and ensure each case receives independent evaluations before regional shortlisting.',
    specification: 'Submissions are tagged with slide counts, file sizes, and submission timestamps. Evaluators can filter by pending, graded, or high-AI benchmark scores with strict conflict-of-interest quarantine.',
    systemProof: 'Dynamic assignment queue with real-time graded counters and conflict-of-interest checks.',
    pdfPages: 'Pages 14–15'
  },
  evaluator_rubric: {
    sectionNumber: 'Section 9.2',
    clauseNumber: 'Clause 9.2',
    title: 'Official 8-Criterion 100-Point Evaluation Rubric',
    rationale: 'Ensures structured, objective evaluation across pan-India evaluators by dividing performance into calibrated criteria covering strategy, financial modeling, operational feasibility, and visual presentation.',
    specification: 'Rubric Criteria: 1) Strategic Clarity & Problem Framing (0-25), 2) Analytical Rigor & Financial Feasibility (0-25), 3) Implementation Roadmap & Risk Mitigation (0-25), 4) Presentation Design & Visual Communication (0-25).',
    systemProof: 'Interactive calibrated range sliders with instant score aggregation, automatic grade band badge assignment, and validation safeguards.',
    pdfPages: 'Page 14'
  },
  evaluator_ai_advisory: {
    sectionNumber: 'Section 9.3',
    clauseNumber: 'Clause 9.3',
    title: 'AI-Assisted Evaluation / Gemini AI Advisory Pre-Scan',
    rationale: 'Provides evaluators with an objective pre-grading baseline (completeness, originality, alignment, plagiarism risk) without replacing human judgment.',
    specification: 'Submissions undergo automated AI pre-analysis scoring (0-100) highlighting missing sections, strengths, and similarity indices. The advisory score serves as guidance only; jury marks remain authoritative.',
    systemProof: 'Pre-computed advisory scores, plagiarism verification flags, and structural gap checklists rendered in evaluator workstations.',
    pdfPages: 'Pages 14–15'
  },
  evaluator_pdf_deck: {
    sectionNumber: 'Section 8.2',
    clauseNumber: 'Clause 8.2',
    title: '12-Slide Deck Cap & Executive Presentation Standard',
    rationale: 'Limits case presentations to 12 slides in 16:9 format to encourage concise executive communication and prevent information dumping.',
    specification: 'Maximum 12 content slides (excluding title/annexures), maximum file size 20MB in PDF/PPTX format.',
    systemProof: 'In-app 12-slide PDF canvas viewer with zoom controls, slide thumbnail index, and verification metadata.',
    pdfPages: 'Pages 12–13'
  },
  evaluator_loom_video: {
    sectionNumber: 'Section 8.2',
    clauseNumber: 'Clause 8.2',
    title: 'Asynchronous Video Pitch Defense (Loom / Video)',
    rationale: 'Allows teams to articulate their rationale verbally, demonstrating executive presence and communication skills before on-ground regional rounds.',
    specification: 'Teams submit a 3-5 minute video pitch link (Loom/YouTube Unlisted/Drive) presenting core strategy highlights and answering key case tensions.',
    systemProof: 'Integrated video modal with chapter navigation, playback speed controls, and candidate defense transcripts.',
    pdfPages: 'Page 13'
  },
  evaluator_excel_dcf: {
    sectionNumber: 'Section 8.2',
    clauseNumber: 'Clause 8.2',
    title: 'Financial DCF Model & Sensitivity Analysis',
    rationale: 'Requires quantitative backing for all strategic recommendations, testing financial feasibility, CAPEX phasing, and unit economics.',
    specification: 'Excel financial model (.xlsx) detailing 5-year revenue projections, CAPEX/OPEX, discount rate assumptions, and terminal value sensitivity.',
    systemProof: 'Interactive spreadsheet viewer with dynamic parameter sensitivity sliders recalculating NPV and IRR in real-time.',
    pdfPages: 'Page 13'
  },
  evaluator_coi_recusal: {
    sectionNumber: 'Section 9.4 & Section 3.6',
    clauseNumber: 'Clause 9.4 / 3.6',
    title: 'Mandatory Evaluator Recusal (Conflict of Interest)',
    rationale: 'Guarantees ethical integrity. Evaluators must immediately recuse themselves if they recognize a team from their own alma mater, employer, or consulting client.',
    specification: 'When an evaluator clicks "Recuse", the submission is instantly unassigned, logged in the audit ledger, and reallocated to an independent evaluator panel.',
    systemProof: 'Single-click conflict of interest recusal action with automated re-routing logic.',
    pdfPages: 'Pages 4, 15'
  },

  // Student / Participant Section
  student_team_formation: {
    sectionNumber: 'Section 5.2',
    clauseNumber: 'Clause 5.2',
    title: 'Team Formation 3–4 Members & Roster Locking Mechanism',
    rationale: 'Encourages multidisciplinary collaboration while keeping group sizes optimal (3 to 4 members) for equal accountability and active participation.',
    specification: 'Teams comprise 3 to 4 students from the same or different institutions/programs. Team leaders generate unique invite codes (e.g. ICL-STR-842) to enroll members before atomic roster locking.',
    systemProof: 'Unique alphanumeric invite code generation, role assignment (Leader vs Member), and atomic team locking engine.',
    pdfPages: 'Pages 7–8'
  },
  student_declaration: {
    sectionNumber: 'Section 5.1',
    clauseNumber: 'Clause 5.1',
    title: 'Mandatory Academic & Anti-Plagiarism Declarations',
    rationale: 'Protects intellectual property and competition integrity by securing legal commitment to original work, student eligibility, and ethical AI usage.',
    specification: 'Candidates must accept 8 specific declarations: Academic Eligibility, Code of Conduct, Anti-Plagiarism Policy, Fair Generative AI Usage, Confidentiality, and Photo/Video Consent.',
    systemProof: 'Explicit checkbox gating with audit timestamp and student ID attachment.',
    pdfPages: 'Pages 7–8'
  },
  student_fee_payment: {
    sectionNumber: 'Section 6.1 & Section 6.3',
    clauseNumber: 'Clause 6.1 / 6.3',
    title: 'Registration Fee & Instant GST Tax Invoicing',
    rationale: 'Ensures transparent commercial transactions compliant with Indian Goods & Services Tax (GST) regulations with staged fee collection.',
    specification: 'Staged fee structure of ₹200 per student candidate covering Stage 1 Online Quiz and Stage 2 Strategy Case Deck (+ 18% GST = ₹236 total). Generates an instant downloadable GST-compliant tax invoice with SAC code 999293.',
    systemProof: 'Integrated checkout simulator, GSTIN validation, and instant PDF invoice generation with digital signing stamp.',
    pdfPages: 'Pages 9–10'
  },
  student_quiz_engine: {
    sectionNumber: 'Section 7.3 & Section 7.4',
    clauseNumber: 'Clause 7.3 / 7.4',
    title: 'Round 1 Online Quiz Engine & Anti-Cheat Proctoring',
    rationale: 'Provides a standardized, objective knowledge gate testing business acumen, analytical reasoning, ESG economics, and strategy fundamentals.',
    specification: '50 randomized MCQs across 11 subject categories, 45-minute strict countdown timer, negative marking for incorrect responses, automatic submission upon timer expiry, and browser tab-switch detection.',
    systemProof: 'Proctored client-side timer, question randomization, violation log capture, and instant scoring engine.',
    pdfPages: 'Pages 10–12'
  },
  student_r2_submission: {
    sectionNumber: 'Section 8.1 & Section 8.2',
    clauseNumber: 'Clause 8.1 / 8.2',
    title: 'Round 2 Strategy Submission & Strict Slide Constraints',
    rationale: 'Gives Round 1 qualifiers a platform to submit comprehensive corporate case solutions with verified tamper-proof submission timestamps and strict 12-slide formatting limits.',
    specification: 'Upload 12-slide PDF presentation (16:9), optional Excel DCF model, and Loom video link. Platform stamps submissions with an immutable confirmation number and SHA-256 hash.',
    systemProof: 'Multi-artifact upload pipeline with drag-and-drop validation, version control history, and receipt generation.',
    pdfPages: 'Pages 12–13'
  },
  student_hub_allocation: {
    sectionNumber: 'Section 10.1',
    clauseNumber: 'Clause 10.1',
    title: 'Multi-Factor Regional Allocation Engine (5 Zonal Hubs)',
    rationale: 'Distributes Round 2 qualifiers geographically to premier host campuses across India for in-person regional face-to-face defense.',
    specification: 'Teams are routed to 1 of 5 Zonal Hubs: North (Delhi/NCR), South (Bangalore/Chennai), West (Mumbai/Pune), East (Kolkata), and North-East (Guwahati) based on institutional pin-codes.',
    systemProof: 'Automatic zone routing engine with manual preference overrides and campus logistics pack.',
    pdfPages: 'Pages 15–16'
  },
  student_certificate_qr: {
    sectionNumber: 'Section 14.1 & Section 14.2',
    clauseNumber: 'Clause 14.1 / 14.2',
    title: '13 Verifiable Certificate Categories & Cryptographic QR Verification',
    rationale: 'Eliminates credential fraud by issuing digitally signed achievement certificates verifiable by employers, universities, and LinkedIn recruiters.',
    specification: 'Generates high-resolution PDF certificates across 13 distinct categories with unique Certificate UUID, AIMA-ICRC watermark, and public cryptographic QR code linking to the live verification registry.',
    systemProof: 'Client-side PDF certificate generator and public verifier engine accessible without user login.',
    pdfPages: 'Pages 18–19'
  },

  // Institute Portal Section
  institute_spoc_auth: {
    sectionNumber: 'Section 3.4',
    clauseNumber: 'Clause 3.4',
    title: 'Designated Faculty Coordinator (SPOC) Authority & Authorization',
    rationale: 'Establishes a single verified institutional point of contact to manage campus contingents, bulk sponsorships, and official communication.',
    specification: 'Institutional coordinators upload official Dean/Director authorization letters and verify AICTE/UGC accreditation credentials.',
    systemProof: 'SPOC verification badge, authorization document repository, and institutional delegation controls.',
    pdfPages: 'Pages 4–5'
  },
  institute_bulk_upload: {
    sectionNumber: 'Section 5.3',
    clauseNumber: 'Clause 5.3',
    title: 'Institute Bulk Registration & CSV Roster Parsing',
    rationale: 'Enables institutes to enroll dozens or hundreds of students simultaneously without tedious individual manual entries.',
    specification: 'Upload Excel/CSV spreadsheets containing student names, emails, roll numbers, and specialization. The system auto-validates data, creates student accounts, and dispatches magic login links.',
    systemProof: 'Excel/CSV parser with error correction highlights, duplicate detection, and batch activation triggers.',
    pdfPages: 'Pages 8–9'
  },
  institute_vouchers: {
    sectionNumber: 'Section 6.2',
    clauseNumber: 'Clause 6.2',
    title: 'Institutional Bulk Sponsorship Vouchers & Omni-Channel Rails',
    rationale: 'Incentivizes large institutional participation by providing centralized invoicing and reusable promo vouchers for campus departments.',
    specification: 'Institutions can sponsor student cohorts in bulk via NEFT/RTGS, Corporate Cards, or Netbanking, generating reusable institutional promo vouchers (e.g. IIMB-CORP-100) for student fee waivers.',
    systemProof: 'Dynamic voucher code generator, seat quota tracker, and consolidated GST purchase order invoice.',
    pdfPages: 'Pages 9–10'
  },
  institute_analytics: {
    sectionNumber: 'Section 4.3 & Section 16.1',
    clauseNumber: 'Clause 4.3 / 16.1',
    title: 'Institutional Dashboard & Cohort Demographic Telemetry',
    rationale: 'Gives Deans, HODs, and Placement Cells real-time visibility into their student cohort performance, qualifier rates, and national benchmarks.',
    specification: 'Real-time dashboard displaying total registered students, completed payments, Round 1 pass rates, Round 2 case submissions, and regional qualifier counts.',
    systemProof: 'Interactive demographic charts, department leaderboards, and 1-click CSV performance exports.',
    pdfPages: 'Pages 6, 20'
  },
  institute_leaderboard: {
    sectionNumber: 'Section 4.3 & Section 16.1',
    clauseNumber: 'Clause 4.3 / 16.1',
    title: 'Accredited Institution Rankings & Contingent Leaderboard',
    rationale: 'Recognizes top-performing business schools based on student contingent scores and qualification rates.',
    specification: 'National ranking of institutions calculated from aggregate student performance across screening tests and strategy submissions.',
    systemProof: 'Dynamic institutional leaderboard with contingent size, qualification rates, and NIRF tier tags.',
    pdfPages: 'Pages 6, 20'
  },
  institute_gst_invoice: {
    sectionNumber: 'Section 6.3',
    clauseNumber: 'Clause 6.3',
    title: 'Automated 18% GST Invoicing & Reconciliation (B2B/B2C)',
    rationale: 'Supports formal institutional procurement and statutory tax compliance with compliant GST tax invoices.',
    specification: 'Consolidated B2B tax invoices with institutional GSTIN, SAC code 999293, and purchase order references generated instantaneously.',
    systemProof: 'Automated B2B invoice generation with downloadable PDF receipts and payment status tracking.',
    pdfPages: 'Pages 9–10'
  },
  institute_bursar: {
    sectionNumber: 'Section 6.1 & Section 6.3',
    clauseNumber: 'Clause 6.1 / 6.3',
    title: 'Institutional Bursar Settlement & Staged Fee Collection',
    rationale: 'Enables institutes to sponsor student contingents directly via institutional bursar settlement at ₹200/student.',
    specification: 'Bulk seat purchases generate reusable promo voucher codes or direct bursar settlement for students to enroll with 100% fee waiver.',
    systemProof: 'Voucher generation console, quota redemption tracking, and subsidy ledger.',
    pdfPages: 'Pages 9–10'
  },
  institute_roster: {
    sectionNumber: 'Section 4.3 & Section 5.3',
    clauseNumber: 'Clause 4.3 / 5.3',
    title: 'Institutional Student Registry & Cohort Management',
    rationale: 'Gives faculty coordinators visibility into their campus contingent progress and registration status.',
    specification: 'Comprehensive dashboard showing student registration status, team affiliations, quiz scores, and round qualifications.',
    systemProof: 'Sortable student roster with batch activation, CSV export, and stage filters.',
    pdfPages: 'Pages 6, 8'
  },

  // Regional Hub Portal Section
  hub_command: {
    sectionNumber: 'Section 11.1',
    clauseNumber: 'Clause 11.1',
    title: 'Round 3: Pre-Event Hub Operations & Regional Command Desk',
    rationale: 'Empowers Zonal Coordinators at host institutions to manage on-ground presentation venues, jury coordination, and team attendance seamlessly.',
    specification: 'Dedicated dashboards for 5 host campuses providing check-in desks, room assignments, time-slot scheduling, and offline score consolidation.',
    systemProof: 'Hub-specific data partition, attendance check-in toggles, and live scorecards.',
    pdfPages: 'Pages 16–17'
  },
  hub_presentation_slots: {
    sectionNumber: 'Section 11.1',
    clauseNumber: 'Clause 11.1',
    title: '20-Minute Live Presentation Scheduling Protocol',
    rationale: 'Standardizes presentation timing during regional rounds: 12 minutes uninterrupted pitch + 8 minutes live jury Q&A defense.',
    specification: 'Automated presentation room allocation across multiple simultaneous boardrooms with strictly enforced 20-minute time slots.',
    systemProof: 'Room scheduling grid with live timer, presentation status toggles, and jury slot assignment.',
    pdfPages: 'Pages 16–17'
  },
  hub_live_scoring: {
    sectionNumber: 'Section 11.2 & Section 11.3',
    clauseNumber: 'Clause 11.2 / 11.3',
    title: 'Proposed 9-Criterion Regional Rubric & Independent Jury Scoring',
    rationale: 'Eliminates paper tally errors by providing offline/online tablet scorecards for regional judges with instant ranking computation and 3-tier signoff.',
    specification: 'Judges score live presentations on 9 calibrated criteria across strategic depth, defense response, and practical execution.',
    systemProof: 'Real-time score submission with cryptographic jury signoff and instant regional leaderboard updates.',
    pdfPages: 'Pages 17–18'
  },
  hub_regional_advancement: {
    sectionNumber: 'Section 11.4',
    clauseNumber: 'Clause 11.4',
    title: 'Regional Result Tabulation & Top 2 Advancement to National Finale',
    rationale: 'Selects the top 2 teams from each of the 5 regional hubs (total 10 national finalist teams) to compete at the National Grand Finale in New Delhi.',
    specification: 'Automatic qualification threshold advancing top 2 ranked teams per hub. Generates official National Finalist Letters and travel grants.',
    systemProof: 'Automated stage promotion trigger, qualification badges, and official national finalist roster publication.',
    pdfPages: 'Page 18'
  },

  // Corporate Partner Section
  corporate_talent_vault: {
    sectionNumber: 'Section 3.7 & Section 27.1',
    clauseNumber: 'Clause 3.7 / 27.1',
    title: 'Corporate Case Partner & Pre-Vetted Talent Vault',
    rationale: 'Enables corporate sponsors to discover high-aptitude talent through verified performance in actual case problem solving, bypassing generic resumes.',
    specification: 'Sponsors can filter participants by Round qualification, quiz percentile, specialization, and regional hub, with 1-click access to candidate profiles and defense videos.',
    systemProof: 'Searchable candidate directory with skill tags, video pitch links, and direct interview invitation triggers.',
    pdfPages: 'Pages 5, 27'
  },
  corporate_case_branding: {
    sectionNumber: 'Section 3.7',
    clauseNumber: 'Clause 3.7',
    title: 'Live Case Challenge Sponsorship & Co-Branding',
    rationale: 'Allows enterprise partners to author real-world business challenges (e.g. decarbonization, supply chain AI, financial inclusion) solved by 1,000+ top minds.',
    specification: 'Partner dashboard to review student solutions, provide corporate problem context, and present custom enterprise awards.',
    systemProof: 'Case challenge authoring console with branding placement and submission telemetry.',
    pdfPages: 'Page 5'
  },

  // Admin Control Center Section
  admin_stage_progression: {
    sectionNumber: 'Section 2.1 & Section 2.2',
    clauseNumber: 'Clause 2.1 / 2.2',
    title: 'Four-Stage Hierarchical Funnel & No-Code Stage Reconfiguration',
    rationale: 'Controls the phased progression of the entire national competition, preventing premature access to rounds while allowing emergency manual adjustments.',
    specification: 'Super Admins can open/close stages (Round 1 Quiz, Round 2 Case Submission, Round 3 Regional Hubs, Round 4 National Finale) dynamically with atomic state transitions.',
    systemProof: 'Central state machine with lock toggles, cutoff score calibrators, and automatic student notification broadcasts.',
    pdfPages: 'Pages 2–3'
  },
  admin_quiz_program_manager: {
    sectionNumber: 'Section 7.1 & Section 20.1',
    clauseNumber: 'Clause 7.1 / 20.1',
    title: 'Admin Question Bank Creation & Quiz Program Management',
    rationale: 'Provides central administration for creating and managing multiple specialized quiz programs, eligibility parameters, duration, and question repositories.',
    specification: 'Admins create quiz programs with custom codes, fees, syllabus topics, negative marking rules, proctoring strictness, and live candidate rosters.',
    systemProof: 'Full CRUD quiz program editor, real-time participant monitor, question bank builder, and result tabulation console.',
    pdfPages: 'Pages 10–11, 23'
  },
  admin_jury_moderation: {
    sectionNumber: 'Section 9.5 & Section 11.3',
    clauseNumber: 'Clause 9.5 / 11.3',
    title: 'Round 2 Result Generation & Jury Score Moderation',
    rationale: 'Eliminates evaluator bias or harshness variance (e.g. lenient vs strict judges) through statistical normalization and jury divergence flagging.',
    specification: 'Flags evaluations where two judges differ by >15 points for mandatory review by the National Chief Moderation Board.',
    systemProof: 'Z-Score statistical normalizer, outlier highlight indicators, and manual score moderation overrides with required audit justification.',
    pdfPages: 'Pages 15, 17'
  },
  admin_tie_breaker: {
    sectionNumber: 'Section 7.4 & Section 20.1',
    clauseNumber: 'Clause 7.4 / 20.1',
    title: 'Automatic Evaluation & Algorithmic Tie-Breaker Engine',
    rationale: 'Provides an objective, mathematically deterministic tie-breaker resolution when two or more candidates/teams achieve identical scores.',
    specification: 'Tie-Breaker Hierarchy: 1) Round 1 Online Quiz Combined Score & Accuracy, 2) Time-to-Answer Speed Metric, 3) Higher Section-Wise Weights, 4) AI Benchmark Originality Index, 5) Earliest Submission Timestamp.',
    systemProof: 'Automated tie-breaker computation engine displaying clear breakdown steps and audit resolution logs.',
    pdfPages: 'Pages 11–12, 23'
  },
  admin_audit_trail: {
    sectionNumber: 'Section 22.1 & Section 18.2',
    clauseNumber: 'Clause 22.1 / 18.2',
    title: '12 Immutable Action Audit Streams & DPDP Act 2023 Compliance',
    rationale: 'Guarantees total transparency and regulatory compliance with India’s Digital Personal Data Protection Act 2023 through non-repudiable audit logging.',
    specification: 'Every administrative action, score change, stage transition, and payment event is cryptographically signed and logged with user ID, IP, and timestamp across 12 discrete audit streams.',
    systemProof: 'Real-time filterable audit log stream with JSON export, cryptographic hash verification, and data retention policies.',
    pdfPages: 'Pages 21–22, 24'
  },

  // Public Gateway Section
  public_roadmap: {
    sectionNumber: 'Section 2.1',
    clauseNumber: 'Clause 2.1',
    title: 'Four-Stage Hierarchical Competition Funnel',
    rationale: 'Structures the national talent search into 4 progressively rigorous stages testing theoretical acumen, strategic formulation, regional pitch defense, and national policy leadership.',
    specification: 'Round 1 (Online Quiz) → Round 2 (Strategy Case Deck & Video) → Round 3 (Regional Face-to-Face Hubs) → Round 4 (National Grand Finale).',
    systemProof: 'Visual interactive stage roadmap with dates, qualifying ratios, format details, and rules.',
    pdfPages: 'Pages 2–3'
  },
  public_prizes: {
    sectionNumber: 'Section 1.1 & Section 12.3',
    clauseNumber: 'Clause 1.1 / 12.3',
    title: 'National Prize Pool & Academic Recognition (₹15,00,000+)',
    rationale: 'Recognizes exceptional managerial talent with substantial cash rewards, prestigious AIMA trophies, and corporate executive fast-tracks.',
    specification: 'National Champions: ₹5,00,000 + Rolling Trophy; 1st Runner-Up: ₹3,00,000; 2nd Runner-Up: ₹2,00,000; Regional Hub Winners: ₹50,000 each + Special Category Awards.',
    systemProof: 'Transparent prize distribution matrix with tax compliance notes and corporate scholarship details.',
    pdfPages: 'Pages 1–2, 19'
  },
  public_eligibility: {
    sectionNumber: 'Section 5.1',
    clauseNumber: 'Clause 5.1',
    title: 'Candidate Eligibility & Academic Ingestion Criteria',
    rationale: 'Ensures a level playing field while welcoming full-time and executive students across AICTE/UGC accredited management and professional institutions.',
    specification: 'Eligible candidates include enrolled students of MBA, PGDM, Executive MBA, BBA, B.Com, and allied undergraduate/postgraduate business programs across India.',
    systemProof: 'Institutional directory lookup with AICTE/UGC accreditation tags and roll number validation.',
    pdfPages: 'Pages 7–8'
  },
  helpdesk_sla: {
    sectionNumber: 'Section 21.1 & Section 21.2',
    clauseNumber: 'Clause 21.1 / 21.2',
    title: 'Support Ticket Creation & War-Room 4-Hour Response SLA',
    rationale: 'Guarantees round-the-clock technical and academic support during live quiz and submission windows to prevent student distress.',
    specification: 'Multi-channel support ticketing engine with priority classification (Urgent, High, Normal) and guaranteed 4-hour resolution SLA during active competition rounds.',
    systemProof: 'Live ticketing modal with automated ticket ID generation, status tracker, and AIMA Helpdesk escalation.',
    pdfPages: 'Pages 23–24'
  },
  ai_assistant: {
    sectionNumber: 'Section 4.1 & Section 21.1',
    clauseNumber: 'Clause 4.1 / 21.1',
    title: '24/7 AI-Powered Competition Rules & Syllabus Assistant',
    rationale: 'Empowers participants with instant, conversational answers on competition rules, formatting guidelines, deadlines, and syllabus topics.',
    specification: 'GenAI chat assistant grounded in the official 27-section AIMA-ICRC India Case League 2026 specification document.',
    systemProof: 'Context-aware AI chat drawer with quick prompt pills, live response streaming, and document citations.',
    pdfPages: 'Pages 5–6, 23'
  },
  admin_finances: {
    sectionNumber: 'Section 6.3 & Section 16.3',
    clauseNumber: 'Clause 6.3 / 16.3',
    title: 'Automated 18% GST Invoicing & Financial Reports Ledger',
    rationale: 'Maintains an unalterable financial ledger of all participant fees, institutional sponsorships, and GST tax collections.',
    specification: 'Automated 18% GST calculation (SAC 999293), B2B tax invoice generation, and revenue reconciliation for national reporting.',
    systemProof: 'Live gross revenue ledger, GST breakdown counters, and downloadable tax invoice archive.',
    pdfPages: 'Pages 9–10, 20'
  },
  admin_audit: {
    sectionNumber: 'Section 22.1 & Section 18.2',
    clauseNumber: 'Clause 22.1 / 18.2',
    title: '12 Immutable Action Audit Streams & DPDP Act 2023',
    rationale: 'Guarantees complete non-repudiation and forensic auditability of all administrative, scoring, and proctoring actions.',
    specification: 'Cryptographically signed audit logs with IP addresses, timestamps, actor roles, before/after values, and automated anomaly flagging.',
    systemProof: 'Immutable audit log feed with multi-module filtering and export capability.',
    pdfPages: 'Pages 21–22, 24'
  },
  admin_stages: {
    sectionNumber: 'Section 2.1 & Section 2.2',
    clauseNumber: 'Clause 2.1 / 2.2',
    title: 'National Stage Funnel & No-Code Stage Reconfiguration',
    rationale: 'Provides central control to open, lock, and transition stages across all participants simultaneously.',
    specification: 'Atomic state transitions for Round 1 Quiz, Round 2 Case Submission, Round 3 Regional Hubs, and Round 4 Grand Finale.',
    systemProof: 'Interactive stage gate toggles, cutoff score configurators, and automated broadcast triggers.',
    pdfPages: 'Pages 2–3'
  },
  student_eligibility: {
    sectionNumber: 'Section 5.1',
    clauseNumber: 'Clause 5.1',
    title: 'Individual Student Registration & 8 Mandatory Declarations',
    rationale: 'Ensures equal participation across accredited institutions while validating bona fide student status.',
    specification: 'Eligible candidates include regular undergraduate and postgraduate students from recognized management and higher education institutions.',
    systemProof: 'Institutional directory lookup, student ID verification, and Dean authorization letter validation.',
    pdfPages: 'Pages 7–8'
  },
  student_fees: {
    sectionNumber: 'Section 6.1 & Section 6.3',
    clauseNumber: 'Clause 6.1 / 6.3',
    title: 'Staged Registration Fee (₹200/student) & Instant GST Invoicing',
    rationale: 'Provides transparent pricing and statutory tax compliance with staged fee structure (₹200 per student covering Round 1 & Round 2).',
    specification: 'Stage 1 registration fee of ₹200 per student + 18% GST (₹36) = ₹236 total with instant downloadable GST tax invoices.',
    systemProof: 'Payment gateway integration with UPI, cards, net banking, and institutional promo vouchers.',
    pdfPages: 'Pages 9–10'
  },
  student_progression: {
    sectionNumber: 'Section 2.1',
    clauseNumber: 'Clause 2.1',
    title: 'Four-Stage Hierarchical Funnel & Progression Gates',
    rationale: 'Governs advancement through the 4-stage national competition based on objective performance benchmarks.',
    specification: 'Top scoring teams meeting stage cutoffs automatically unlock subsequent submission and regional hub briefing workspaces.',
    systemProof: 'Dynamic stage lock/unlock states based on qualifying scores and jury approvals.',
    pdfPages: 'Pages 2–3'
  },
  team_formation: {
    sectionNumber: 'Section 5.2',
    clauseNumber: 'Clause 5.2',
    title: 'Team Registration 3–4 Members & Roster Locking',
    rationale: 'Fosters multidisciplinary collaboration with teams of 3 to 4 members.',
    specification: 'Teams of 3-4 students can collaborate across departments or campuses. Team leaders manage invites and finalize rosters.',
    systemProof: 'Unique team invite codes, member role assignments, and lock mechanism.',
    pdfPages: 'Pages 7–8'
  },
  round1_quiz: {
    sectionNumber: 'Section 7.3 & Section 7.4',
    clauseNumber: 'Clause 7.3 / 7.4',
    title: 'Round 1 Online Quiz Administration & Anti-Cheat Proctoring',
    rationale: 'Standardized knowledge screening with strict anti-cheating mechanisms.',
    specification: '45-minute timed assessment with negative marking across 11 subject categories and automated tab-switch detection.',
    systemProof: 'Proctored browser lockdown, randomized question sequence, and live countdown timer.',
    pdfPages: 'Pages 10–12'
  },
  round2_case: {
    sectionNumber: 'Section 8.1 & Section 8.2',
    clauseNumber: 'Clause 8.1 / 8.2',
    title: 'Round 2 Case Deck Submission & 12-Slide Constraint',
    rationale: 'Encourages concise executive communication and structured problem solving.',
    specification: 'Maximum 12 content slides (16:9 PDF), optional Excel DCF model, and 3-minute Loom video pitch defense.',
    systemProof: 'Multi-artifact uploader, file size validators, and tamper-proof submission receipt.',
    pdfPages: 'Pages 12–13'
  },
  round3_regional: {
    sectionNumber: 'Section 11.1 & Section 11.2',
    clauseNumber: 'Clause 11.1 / 11.2',
    title: 'Round 3 Regional Live Case Management & Host Campus Hubs',
    rationale: 'Provides in-person jury evaluation and networking across 5 premier host campuses.',
    specification: 'Teams present live to corporate jury panels at designated zonal hubs across North, South, West, East, and North-East zones.',
    systemProof: 'Campus mapping, presentation slot scheduler, and on-ground attendance QR verification.',
    pdfPages: 'Pages 16–18'
  },
  certificates_qr: {
    sectionNumber: 'Section 14.1 & Section 14.2',
    clauseNumber: 'Clause 14.1 / 14.2',
    title: '13 Verifiable Certificate Categories & Public QR Registry',
    rationale: 'Prevents credential falsification with verifiable digital badges.',
    specification: 'Issued certificates feature unique UUIDs and QR codes linking to the public verification registry.',
    systemProof: 'Client-side PDF generation, cryptographic signature hashing, and instant QR verification lookup.',
    pdfPages: 'Pages 18–19'
  }
};

export interface DocRequirementInfoProps {
  /** Key from preset requirements (e.g., 'evaluator_dual_blind') */
  specKey?: keyof typeof PRESET_REQUIREMENTS | string;
  /** Custom section number override (e.g. 'Section 9.1') */
  sectionNumber?: string;
  /** Custom title */
  title?: string;
  /** Custom clause reference (e.g. 'Clause 9.1') */
  clauseNumber?: string;
  /** Why this feature exists / business objective */
  rationale?: string;
  /** Official requirement specification excerpt */
  specification?: string;
  /** How the system implements/verifies this */
  systemProof?: string;
  /** PDF Page reference in requirement doc */
  pdfPages?: string;
  /** UI presentation variant */
  variant?: 'icon' | 'badge' | 'button' | 'pill' | 'tag' | 'banner';
  /** Display label for button or badge */
  badgeLabel?: string;
  /** Size */
  size?: 'xs' | 'sm' | 'md' | 'lg';
  /** Color theme */
  colorTheme?: 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'slate' | 'rose' | 'red';
  /** Tooltip position alignment */
  align?: 'left' | 'right' | 'center';
  /** Additional custom class */
  className?: string;
}

export const DocRequirementInfo: React.FC<DocRequirementInfoProps> = ({
  specKey,
  sectionNumber: propSectionNumber,
  title: propTitle,
  clauseNumber: propClauseNumber,
  rationale: propRationale,
  specification: propSpecification,
  systemProof: propSystemProof,
  pdfPages: propPdfPages,
  variant = 'icon',
  badgeLabel,
  size = 'sm',
  colorTheme = 'blue',
  align = 'center',
  className = ''
}) => {
  const { navigateToFeature } = useCompetition();
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  // Resolve data from preset or props
  const preset = specKey ? PRESET_REQUIREMENTS[specKey] : undefined;

  const sectionNumber = propSectionNumber || preset?.sectionNumber || 'Requirement Specification';
  const clauseNumber = propClauseNumber || preset?.clauseNumber || '';
  const title = propTitle || preset?.title || 'System Requirement Specification';
  const rationale = propRationale || preset?.rationale || 'This feature is required under the official AIMA-ICRC India Case League 2026 governance framework to maintain audit compliance and competition integrity.';
  const specification = propSpecification || preset?.specification || 'Full functional requirement specified in the AIMA-ICRC National Competition Guidelines.';
  const systemProof = propSystemProof || preset?.systemProof || 'Enforced via automated platform logic, validation checks, and immutable state persistence.';
  const pdfPages = propPdfPages || preset?.pdfPages || 'Official Spec Doc';

  // Calculate coordinates for portal rendering
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const popoverWidth = Math.min(window.innerWidth - 24, 400);
    const estimatedHeight = 440;

    let top = rect.bottom + 8;

    // Flip above if too close to bottom of screen
    if (top + estimatedHeight > window.innerHeight && rect.top - estimatedHeight > 8) {
      top = Math.max(8, rect.top - estimatedHeight - 8);
    }

    let left: number;
    if (align === 'left') {
      left = rect.left;
    } else if (align === 'right') {
      left = rect.right - popoverWidth;
    } else {
      left = rect.left + rect.width / 2 - popoverWidth / 2;
    }

    // Clamp inside viewport
    if (left + popoverWidth > window.innerWidth - 12) {
      left = window.innerWidth - popoverWidth - 12;
    }
    if (left < 12) {
      left = 12;
    }

    setPopoverCoords({ top, left, width: popoverWidth });
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      const handleScrollOrResize = () => {
        updatePosition();
      };
      window.addEventListener('resize', handleScrollOrResize);
      window.addEventListener('scroll', handleScrollOrResize, true);
      return () => {
        window.removeEventListener('resize', handleScrollOrResize);
        window.removeEventListener('scroll', handleScrollOrResize, true);
      };
    }
  }, [isOpen]);

  const handleCopyCitation = (e: React.MouseEvent) => {
    e.stopPropagation();
    const citation = `[AIMA-ICRC ICL 2026 BRD] ${sectionNumber} - ${title}\nRationale: ${rationale}\nSpecification: ${specification}`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
    setShowModal(false);

    // Deep link directly to the target clause & section
    const target = getClauseAndSectionIds(sectionNumber, clauseNumber, specKey);
    navigateToFeature({
      view: 'requirements',
      sectionId: target.sectionId,
      clauseId: target.clauseId
    });
  };

  // Color mappings
  const themeColorsMap = {
    blue: {
      btn: 'text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30',
      badge: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30',
      highlight: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-500/30'
    },
    emerald: {
      btn: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      highlight: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-500/30'
    },
    indigo: {
      btn: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30',
      badge: 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
      highlight: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-500/30'
    },
    amber: {
      btn: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
      highlight: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-500/30'
    },
    purple: {
      btn: 'text-purple-600 dark:text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border-purple-500/30',
      badge: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30',
      highlight: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-500/30'
    },
    slate: {
      btn: 'text-slate-600 dark:text-slate-300 bg-slate-500/10 hover:bg-slate-500/20 border-slate-500/30',
      badge: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30',
      highlight: 'text-slate-700 dark:text-slate-200',
      border: 'border-slate-500/30'
    },
    rose: {
      btn: 'text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30',
      badge: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
      highlight: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/30'
    },
    red: {
      btn: 'text-red-600 dark:text-red-400 bg-red-500/10 hover:bg-red-500/20 border-red-500/30',
      badge: 'bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30',
      highlight: 'text-red-600 dark:text-red-400',
      border: 'border-red-500/30'
    }
  };

  const themeColors = (colorTheme && themeColorsMap[colorTheme]) || themeColorsMap.blue;

  // Size mappings
  const sizeClasses = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 text-xs',
    lg: 'w-7 h-7 text-sm'
  }[size];

  return (
    <div ref={triggerRef} className={`relative inline-flex items-center align-middle ${className}`}>
      {/* ---------------- TRIGGER VARIANTS ---------------- */}
      
      {/* Variant 1: Pure Icon */}
      {variant === 'icon' && (
        <button
          type="button"
          onClick={() => {
            updatePosition();
            setIsOpen(!isOpen);
          }}
          className={`rounded-full border flex items-center justify-center cursor-pointer transition-all duration-150 ${themeColors.btn} ${sizeClasses}`}
          title={`View Requirement Details (${sectionNumber})`}
          aria-label={`Requirement Info: ${title}`}
        >
          <Info className="w-3 h-3 shrink-0" />
        </button>
      )}

      {/* Variant 2: Badge / Pill */}
      {variant === 'badge' && (
        <button
          type="button"
          onClick={() => {
            updatePosition();
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold cursor-pointer transition-all duration-150 ${themeColors.badge}`}
          title={`Click to inspect requirement rationale for ${title}`}
        >
          <Info className="w-3 h-3 shrink-0" />
          <span>{badgeLabel || sectionNumber}</span>
        </button>
      )}

      {/* Variant 3: Interactive Button */}
      {variant === 'button' && (
        <button
          type="button"
          onClick={() => {
            updatePosition();
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold cursor-pointer transition-all shadow-xs ${themeColors.btn}`}
        >
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>{badgeLabel || `Requirement Note (${sectionNumber})`}</span>
        </button>
      )}

      {/* Variant 4: Tag */}
      {variant === 'tag' && (
        <button
          type="button"
          onClick={() => {
            updatePosition();
            setIsOpen(!isOpen);
          }}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold cursor-pointer transition-all ${themeColors.badge}`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
          <span>{badgeLabel || sectionNumber}</span>
          <Info className="w-2.5 h-2.5 ml-0.5 opacity-80" />
        </button>
      )}

      {/* Variant 5: Full Embedded Banner */}
      {variant === 'banner' && (
        <div className={`w-full p-4 rounded-2xl border ${themeColors.border} bg-white dark:bg-slate-900 shadow-sm space-y-3`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${themeColors.btn}`}>
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Official BRD Requirement • {sectionNumber} {clauseNumber ? `(${clauseNumber})` : ''}
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {title}
                </h4>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              Ref: {pdfPages}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <strong className="text-slate-900 dark:text-slate-100 block text-[11px] mb-0.5">
                Why this feature exists (Business Rationale):
              </strong>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {rationale}
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
              <strong className="text-blue-900 dark:text-blue-200 block text-[11px] mb-0.5">
                Official Specification Mandate:
              </strong>
              <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed">
                {specification}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Compliant & Active in Platform</span>
            </span>
            <button
              onClick={handleOpenDoc}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Read Full Specification</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ---------------- FLOATING PORTAL POPOVER CARD ---------------- */}
      {/* Rendered to document.body to prevent clipping by overflow:hidden or parent stacking context */}
      {isOpen && variant !== 'banner' && popoverCoords && createPortal(
        <div className="fixed inset-0 z-[99999] pointer-events-auto">
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0 z-[99998] bg-slate-950/20 dark:bg-slate-950/40 backdrop-blur-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />

          <div
            style={{
              position: 'fixed',
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
              width: `${popoverCoords.width}px`,
              maxHeight: 'calc(100vh - 32px)',
            }}
            onClick={(e) => e.stopPropagation()}
            className="z-[99999] p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-3.5 text-left animate-in fade-in zoom-in-95 duration-150 overflow-y-auto"
          >
            {/* Popover Header */}
            <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg shrink-0 ${themeColors.btn}`}>
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      {sectionNumber} {clauseNumber ? `• ${clauseNumber}` : ''}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                      {pdfPages}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mt-0.5">
                    {title}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rationale Body (Why this matters) */}
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 text-[11px] mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>Why This Feature Exists (Business Rationale)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rationale}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 text-[11px] mb-1">
                  <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <span>Official Requirement Specification</span>
                </div>
                <p className="text-[11px] text-blue-800 dark:text-blue-300/90 leading-relaxed">
                  {specification}
                </p>
              </div>

              {systemProof && (
                <div className="flex items-start gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 px-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>System Proof:</strong> {systemProof}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 gap-2">
              <button
                type="button"
                onClick={handleCopyCitation}
                className="px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Copy BRD specification citation"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 text-slate-400" />
                    <span>Copy Citation</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleOpenDoc}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                <span>Open Full Spec</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ---------------- FULL DETAIL MODAL ---------------- */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-2xl ${themeColors.btn}`}>
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    AIMA-ICRC Specification • {sectionNumber} {clauseNumber ? `(${clauseNumber})` : ''}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">
                  Why this feature exists (Business & Operational Rationale):
                </span>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rationale}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-1">
                <span className="text-xs font-bold text-blue-900 dark:text-blue-200 block">
                  Official BRD Requirement Specification:
                </span>
                <p className="text-blue-800 dark:text-blue-300/90 leading-relaxed">
                  {specification}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
                  System Proof & Implementation Verification:
                </span>
                <p className="text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                  {systemProof}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400 font-mono">
                Document Page Reference: {pdfPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={handleOpenDoc}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <span>Go to Full Specification Page</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
