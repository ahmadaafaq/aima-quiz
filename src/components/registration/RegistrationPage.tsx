import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import confetti from 'canvas-confetti';
import { useCompetition } from '../../context/CompetitionContext';
import { PosterHero3D } from './PosterHero3D';
import { RulesAndTermsCard } from './RulesAndTermsCard';
import { AimaGatewayModal } from './AimaGatewayModal';
import { AimaInvoiceModal } from './AimaInvoiceModal';

import { CSRBootcampNominee, CSRBootcampRegistration } from '../../types';
import {
  saveRegistrationToSupabase,
  updateRegistrationPaymentInSupabase,
  createParticipantAccounts,
} from '../../lib/supabase';
import {
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  FileText,
  Mail,
  Phone,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  Sparkles,
  Receipt,
  Download,
  Upload,
  FileSpreadsheet,
  Eye,
  EyeOff,
  UserCheck,
  Calendar,
  Lock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  GraduationCap,
  Hash,
  MapPin,
  ExternalLink,
  Copy,
  PartyPopper,
  BookOpen,
  Award,
  Layers,
  Send,
  Zap,
  CheckCheck,
  Database
} from 'lucide-react';

// Flat participation fee as per brochure: ₹200 per participant
export const PARTICIPATION_FEE_PER_PERSON = 200;

export const FEE_TIERS = [
  {
    id: 'per_student',
    label: 'Standard Registration',
    rateExclGst: 200,
    rateInclGst: 200,
    isPackage: false,
    minCount: 1,
    maxCount: 4,
    subLabel: '₹200 per student participant',
  },
];

interface TeamMemberInput {
  id: string;
  name: string;
  dob: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  mobile: string;
  program: string;
  semester: string;
  enrolmentNumber: string;
  password: string;
}

interface InstituteParticipantInput {
  id: string;
  name: string;
  dob: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  mobile: string;
  program: string;
  semester: string;
  enrolmentNumber: string;
  password: string;
}

interface InstituteTeam {
  id: string;
  teamName: string;
  members: InstituteParticipantInput[];
}

export const RegistrationPage: React.FC = () => {
  const { registerCSRBootcamp, updateCSRPayment, navigateToFeature } = useCompetition();
  const formSectionRef = useRef<HTMLDivElement>(null);

  // Multi-step form tracker: 1 = Details, 2 = Payment Review, 3 = Payment Gateway / Completed
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Registration Track: 'individual' vs 'institute'
  const [regMode, setRegMode] = useState<'individual' | 'institute'>('individual');



  // ==========================================
  // TRACK 1: INDIVIDUAL PARTICIPANT STATE
  // ==========================================
  const [name, setName] = useState('Aarav Sharma');
  const [dob, setDob] = useState('2002-05-14');
  const [email, setEmail] = useState('aarav.sharma@domain.edu');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [mobile, setMobile] = useState('+91 98765 43210');
  const [instituteName, setInstituteName] = useState('Faculty of Management Studies (FMS), Delhi');
  const [program, setProgram] = useState('Master of Business Administration (MBA)');
  const [semester, setSemester] = useState('2nd Year / Semester 3');
  const [enrolmentNumber, setEnrolmentNumber] = useState('FMS-2025-MBA-089');
  const [password, setPassword] = useState('AimaQuiz@2026');
  const [confirmPassword, setConfirmPassword] = useState('AimaQuiz@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Optional Checkbox: Onboard / Register Team
  const [isOnboardingTeam, setIsOnboardingTeam] = useState(false);
  const [teamName, setTeamName] = useState('Synergy Strategists');
  const [teamMembers, setTeamMembers] = useState<TeamMemberInput[]>([
    {
      id: 'tm_1',
      name: 'Priya Sundaram',
      dob: '2002-08-22',
      email: 'priya.s@domain.edu',
      gender: 'Female',
      mobile: '+91 98110 54321',
      program: 'Master of Business Administration (MBA)',
      semester: '2nd Year / Semester 3',
      enrolmentNumber: 'FMS-2025-MBA-094',
      password: 'QuizLogin#2026',
    },
    {
      id: 'tm_2',
      name: 'Rohan Deshmukh',
      dob: '2001-11-10',
      email: 'rohan.d@domain.edu',
      gender: 'Male',
      mobile: '+91 98220 87654',
      program: 'Master of Business Administration (MBA)',
      semester: '2nd Year / Semester 3',
      enrolmentNumber: 'FMS-2025-MBA-112',
      password: 'QuizLogin#2026',
    },
  ]);

  // ==========================================
  // TRACK 2: INSTITUTE REGISTRATION STATE
  // ==========================================
  const [instName, setInstName] = useState('Indian Institute of Technology & Management');
  const [instAddress, setInstAddress] = useState('Hauz Khas, Institutional Area');
  const [instCity, setInstCity] = useState('New Delhi');
  const [instState, setInstState] = useState('Delhi');
  const [instPinCode, setInstPinCode] = useState('110016');
  const [coordinatorName, setCoordinatorName] = useState('Dr. Sanjeev Kapoor');
  const [coordinatorEmail, setCoordinatorEmail] = useState('sanjeev.kapoor@iitm.ac.in');
  const [coordinatorPhone, setCoordinatorPhone] = useState('+91 98101 23456');

  // Institute teams: each team has up to 4 participants, institute can have multiple teams
  const [instituteEntryTab, setInstituteEntryTab] = useState<'form' | 'excel'>('form');
  const [instituteTeams, setInstituteTeams] = useState<InstituteTeam[]>([
    {
      id: 'inst_team_1',
      teamName: 'Team Alpha',
      members: [
        {
          id: 'inst_p1',
          name: 'Kabir Mehta',
          dob: '2002-03-15',
          email: 'kabir.m@iitm.ac.in',
          gender: 'Male',
          mobile: '+91 98111 22331',
          program: 'PGDM - Finance & CSR Strategy',
          semester: '2nd Year / Sem 3',
          enrolmentNumber: 'IITM-2025-014',
          password: 'Pass#Quiz1',
        },
        {
          id: 'inst_p2',
          name: 'Ananya Sharma',
          dob: '2002-09-18',
          email: 'ananya.s@iitm.ac.in',
          gender: 'Female',
          mobile: '+91 98111 22332',
          program: 'PGDM - Operations & ESG',
          semester: '2nd Year / Sem 3',
          enrolmentNumber: 'IITM-2025-029',
          password: 'Pass#Quiz2',
        },
        {
          id: 'inst_p3',
          name: 'Devansh Verma',
          dob: '2003-01-24',
          email: 'devansh.v@iitm.ac.in',
          gender: 'Male',
          mobile: '+91 98111 22333',
          program: 'MBA - Business Analytics',
          semester: '1st Year / Sem 1',
          enrolmentNumber: 'IITM-2026-042',
          password: 'Pass#Quiz3',
        },
        {
          id: 'inst_p4',
          name: 'Sneha Kulkarni',
          dob: '2002-07-30',
          email: 'sneha.k@iitm.ac.in',
          gender: 'Female',
          mobile: '+91 98111 22334',
          program: 'MBA - Human Capital & CSR',
          semester: '2nd Year / Sem 3',
          enrolmentNumber: 'IITM-2025-055',
          password: 'Pass#Quiz4',
        },
      ],
    },
  ]);

  const [excelUploadFeedback, setExcelUploadFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ==========================================
  // COMMON COMPLIANCE: DPDP ACT & UNDERTAKING
  // ==========================================
  const [dpdpConsentAccepted, setDpdpConsentAccepted] = useState(true);
  const [validationError, setValidationError] = useState('');

  // Modals & Completion State
  const [activeCreatedRegistration, setActiveCreatedRegistration] = useState<CSRBootcampRegistration | null>(null);
  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [copiedLogins, setCopiedLogins] = useState(false);

  // Smooth scroll helper to form
  const handleScrollToForm = () => {
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Participant counts
  const totalHeadcount = useMemo(() => {
    if (regMode === 'individual') {
      return isOnboardingTeam ? 1 + teamMembers.length : 1;
    }
    const count = instituteTeams.reduce((acc, t) => acc + t.members.length, 0);
    return count || 1;
  }, [regMode, isOnboardingTeam, teamMembers.length, instituteTeams]);

  // Simple ₹200/participant fee calculation
  const feeCalculation = useMemo(() => {
    const total = PARTICIPATION_FEE_PER_PERSON * totalHeadcount;
    return {
      participantCount: totalHeadcount,
      ratePerPerson: PARTICIPATION_FEE_PER_PERSON,
      total,
    };
  }, [totalHeadcount]);

  // Password strength check
  const passwordStrength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  }, [password]);

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // ==========================================
  // HANDLERS: TEAM MANAGEMENT
  // ==========================================
  const handleAddTeamMember = () => {
    // Max team size is 4 (leader + 3 teammates)
    if (teamMembers.length >= 3) {
      setValidationError('Maximum team size is 4 members (you + 3 teammates).');
      return;
    }
    const newMember: TeamMemberInput = {
      id: 'tm_' + Date.now().toString(36),
      name: '',
      dob: '2002-01-01',
      email: '',
      gender: 'Male',
      mobile: '+91 ',
      program: program || 'MBA',
      semester: semester || '2nd Year',
      enrolmentNumber: '',
      password: 'QuizPass#' + Math.floor(100 + Math.random() * 900),
    };
    const updated = [...teamMembers, newMember];
    setTeamMembers(updated);
    setValidationError('');
  };

  const handleRemoveTeamMember = (id: string) => {
    if (teamMembers.length <= 1) {
      setValidationError('If registering as a team, please maintain at least 1 teammate (or uncheck the team option).');
      return;
    }
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    setValidationError('');
  };

  const handleUpdateTeamMember = (id: string, field: keyof TeamMemberInput, value: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // ==========================================
  // HANDLERS: INSTITUTE TEAMS & PARTICIPANTS
  // ==========================================
  const handleAddInstituteTeam = () => {
    const newTeamNumber = instituteTeams.length + 1;
    const newTeam: InstituteTeam = {
      id: 'inst_team_' + Date.now().toString(36),
      teamName: `Team ${newTeamNumber}`,
      members: [
        {
          id: 'inst_p_' + Date.now().toString(36) + '_1',
          name: '',
          dob: '2002-01-01',
          email: '',
          gender: 'Male',
          mobile: '+91 ',
          program: 'MBA / PGDM',
          semester: '1st Year',
          enrolmentNumber: '',
          password: 'Quiz#' + Math.floor(1000 + Math.random() * 9000),
        },
      ],
    };
    setInstituteTeams((prev) => [...prev, newTeam]);
    setValidationError('');
  };

  const handleRemoveInstituteTeam = (teamId: string) => {
    if (instituteTeams.length <= 1) {
      setValidationError('Please keep at least 1 team in your institutional registration.');
      return;
    }
    setInstituteTeams((prev) => prev.filter((t) => t.id !== teamId));
    setValidationError('');
  };

  const handleUpdateInstituteTeamName = (teamId: string, name: string) => {
    setInstituteTeams((prev) =>
      prev.map((t) => (t.id === teamId ? { ...t, teamName: name } : t))
    );
  };

  const handleAddMemberToTeam = (teamId: string) => {
    const targetTeam = instituteTeams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    if (targetTeam.members.length >= 4) {
      setValidationError(`"${targetTeam.teamName}" already has 4 participants (maximum 4 participants per team).`);
      return;
    }

    const newMember: InstituteParticipantInput = {
      id: 'inst_p_' + Date.now().toString(36) + '_' + (targetTeam.members.length + 1),
      name: '',
      dob: '2002-01-01',
      email: '',
      gender: 'Male',
      mobile: '+91 ',
      program: 'MBA / PGDM',
      semester: '1st Year',
      enrolmentNumber: '',
      password: 'Quiz#' + Math.floor(1000 + Math.random() * 9000),
    };

    setInstituteTeams((prev) =>
      prev.map((t) =>
        t.id === teamId ? { ...t, members: [...t.members, newMember] } : t
      )
    );
    setValidationError('');
  };

  const handleRemoveMemberFromTeam = (teamId: string, memberId: string) => {
    const targetTeam = instituteTeams.find((t) => t.id === teamId);
    if (!targetTeam) return;

    if (targetTeam.members.length <= 1) {
      setValidationError(`"${targetTeam.teamName}" must have at least 1 participant. You can remove the entire team if not needed.`);
      return;
    }

    setInstituteTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? { ...t, members: t.members.filter((m) => m.id !== memberId) }
          : t
      )
    );
    setValidationError('');
  };

  const handleUpdateTeamMemberField = (
    teamId: string,
    memberId: string,
    field: keyof InstituteParticipantInput,
    value: string
  ) => {
    setInstituteTeams((prev) =>
      prev.map((t) =>
        t.id === teamId
          ? {
              ...t,
              members: t.members.map((m) =>
                m.id === memberId ? { ...m, [field]: value } : m
              ),
            }
          : t
      )
    );
  };

  // ==========================================
  // HANDLERS: EXCEL TEMPLATE & IMPORT
  // ==========================================
  const handleDownloadExcelTemplate = () => {
    const templateRows = [
      {
        'Team Name': 'Team Alpha',
        'Candidate Name': 'Aarav Sharma',
        'Date of Birth (YYYY-MM-DD)': '2002-05-14',
        'Email Address': 'aarav.sharma@campus.edu',
        'Gender': 'Male',
        'Mobile Number': '+91 9876543210',
        'Program / Course': 'MBA / PGDM',
        'Current Semester / Year': '2nd Year / Sem 3',
        'Enrolment Number': 'ENR-2025-001',
        'Quiz Password': 'QuizPass#2026',
      },
      {
        'Team Name': 'Team Alpha',
        'Candidate Name': 'Priya Sundaram',
        'Date of Birth (YYYY-MM-DD)': '2002-08-22',
        'Email Address': 'priya.s@campus.edu',
        'Gender': 'Female',
        'Mobile Number': '+91 9811054321',
        'Program / Course': 'MBA / PGDM',
        'Current Semester / Year': '2nd Year / Sem 3',
        'Enrolment Number': 'ENR-2025-002',
        'Quiz Password': 'QuizPass#2026',
      },
      {
        'Team Name': 'Team Beta',
        'Candidate Name': 'Rohan Deshmukh',
        'Date of Birth (YYYY-MM-DD)': '2001-11-10',
        'Email Address': 'rohan.d@campus.edu',
        'Gender': 'Male',
        'Mobile Number': '+91 9822087654',
        'Program / Course': 'MBA / PGDM',
        'Current Semester / Year': '2nd Year / Sem 3',
        'Enrolment Number': 'ENR-2025-003',
        'Quiz Password': 'QuizPass#2026',
      },
      {
        'Team Name': 'Team Beta',
        'Candidate Name': 'Sneha Kulkarni',
        'Date of Birth (YYYY-MM-DD)': '2002-07-30',
        'Email Address': 'sneha.k@campus.edu',
        'Gender': 'Female',
        'Mobile Number': '+91 9811122334',
        'Program / Course': 'MBA / PGDM',
        'Current Semester / Year': '2nd Year / Sem 3',
        'Enrolment Number': 'ENR-2025-004',
        'Quiz Password': 'QuizPass#2026',
      },
      {
        'Team Name': 'Team Gamma',
        'Candidate Name': 'Vikramaditya Roy',
        'Date of Birth (YYYY-MM-DD)': '2001-12-05',
        'Email Address': 'vikram.r@campus.edu',
        'Gender': 'Male',
        'Mobile Number': '+91 9811122335',
        'Program / Course': 'MBA / PGDM',
        'Current Semester / Year': '2nd Year / Sem 4',
        'Enrolment Number': 'ENR-2025-005',
        'Quiz Password': 'QuizPass#2026',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateRows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants_Roster');
    XLSX.writeFile(wb, 'AIMA_ICRC_CaseLeague_Roster_Template.xlsx');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet);

        if (!rows || rows.length === 0) {
          setExcelUploadFeedback({
            type: 'error',
            message: 'The uploaded file has no data rows. Please use the official Excel template.',
          });
          return;
        }

        // Group rows by Team Name (or chunk by 4 if no Team Name specified)
        const teamMap = new Map<string, InstituteParticipantInput[]>();
        let overflowCount = 0;

        rows.forEach((r, i) => {
          const rawTeam = (r['Team Name'] || r['Team'] || r['Team Title'] || '').toString().trim();
          const teamKey = rawTeam || `Team ${Math.floor(i / 4) + 1}`;

          const rawName = r['Candidate Name'] || r['Name'] || r['Participant Name'] || `Participant ${i + 1}`;
          const rawDob = r['Date of Birth (YYYY-MM-DD)'] || r['DOB'] || r['Date of Birth'] || '2002-01-01';
          const rawEmail = r['Email Address'] || r['Email'] || `candidate${i + 1}@campus.edu`;
          const rawGender = (r['Gender'] || 'Male') as any;
          const rawMobile = r['Mobile Number'] || r['Mobile'] || '+91 98000 00000';
          const rawProg = r['Program / Course'] || r['Program'] || 'MBA';
          const rawSem = r['Current Semester / Year'] || r['Semester'] || '2nd Year';
          const rawEnr = r['Enrolment Number'] || r['Roll No'] || `ROLL-${i + 101}`;
          const rawPass = r['Quiz Password'] || r['Password'] || 'Quiz#' + Math.floor(1000 + Math.random() * 9000);

          const member: InstituteParticipantInput = {
            id: 'inst_p_excel_' + Date.now().toString(36) + '_' + i,
            name: String(rawName).trim(),
            dob: String(rawDob).trim(),
            email: String(rawEmail).trim(),
            gender: rawGender,
            mobile: String(rawMobile).trim(),
            program: String(rawProg).trim(),
            semester: String(rawSem).trim(),
            enrolmentNumber: String(rawEnr).trim(),
            password: String(rawPass).trim(),
          };

          const currentList = teamMap.get(teamKey) || [];
          if (currentList.length < 4) {
            currentList.push(member);
            teamMap.set(teamKey, currentList);
          } else {
            overflowCount++;
          }
        });

        const newTeams: InstituteTeam[] = Array.from(teamMap.entries()).map(([tName, members], idx) => ({
          id: 'inst_team_excel_' + Date.now().toString(36) + '_' + idx,
          teamName: tName,
          members,
        }));

        if (newTeams.length > 0) {
          setInstituteTeams(newTeams);
          const totalImported = newTeams.reduce((s, t) => s + t.members.length, 0);
          setExcelUploadFeedback({
            type: 'success',
            message: `Successfully imported ${totalImported} participant(s) across ${newTeams.length} team(s) from "${file.name}" (max 4 per team${overflowCount > 0 ? `, ${overflowCount} excess row(s) skipped` : ''}).`,
          });
        }
      } catch (err) {
        setExcelUploadFeedback({
          type: 'error',
          message: 'Failed to parse file. Please ensure it is a valid .xlsx, .xls, or .csv document.',
        });
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ==========================================
  // VALIDATION & STEP NAVIGATION
  // ==========================================
  const validateStep1 = (): boolean => {
    setValidationError('');

    if (regMode === 'individual') {
      if (!name.trim()) {
        setValidationError('Please enter your Full Name.');
        return false;
      }
      if (!dob) {
        setValidationError('Please select your Date of Birth.');
        return false;
      }
      if (!email.trim() || !email.includes('@')) {
        setValidationError('Please enter a valid Official / Personal Email Address.');
        return false;
      }
      if (!mobile.trim() || mobile.length < 8) {
        setValidationError('Please enter a valid Mobile Number.');
        return false;
      }
      if (!instituteName.trim()) {
        setValidationError('Please enter your Institute / College Name.');
        return false;
      }
      if (!program.trim()) {
        setValidationError('Please enter your Program / Course of study.');
        return false;
      }
      if (!semester.trim()) {
        setValidationError('Please specify your current semester or year.');
        return false;
      }
      if (!enrolmentNumber.trim()) {
        setValidationError('Please enter your student Enrolment / Roll Number.');
        return false;
      }
      if (!password || password.length < 6) {
        setValidationError('Please set a secure Quiz Password (at least 6 characters).');
        return false;
      }
      if (password !== confirmPassword) {
        setValidationError('Passwords do not match. Please verify your confirm password.');
        return false;
      }

      // If team option checked:
      if (isOnboardingTeam) {
        if (!teamName.trim()) {
          setValidationError('Please provide a Team Name for your squad.');
          return false;
        }
        if (teamMembers.length === 0) {
          setValidationError('Please add at least 1 teammate to your team.');
          return false;
        }
        for (let i = 0; i < teamMembers.length; i++) {
          const tm = teamMembers[i];
          if (!tm.name.trim()) {
            setValidationError(`Please enter the Name for Teammate #${i + 1}.`);
            return false;
          }
          if (!tm.email.trim() || !tm.email.includes('@')) {
            setValidationError(`Please enter a valid Email for Teammate #${i + 1} (${tm.name || 'Member'}).`);
            return false;
          }
          if (!tm.enrolmentNumber.trim()) {
            setValidationError(`Please enter the Enrolment Number for Teammate #${i + 1}.`);
            return false;
          }
        }
      }
    } else {
      // Institute Track
      if (!instName.trim()) {
        setValidationError('Please enter the Name of the Institute.');
        return false;
      }
      if (!instAddress.trim()) {
        setValidationError('Please enter the Campus Address.');
        return false;
      }
      if (!instCity.trim()) {
        setValidationError('Please enter the City.');
        return false;
      }
      if (!coordinatorName.trim()) {
        setValidationError('Please enter the Coordinator Name.');
        return false;
      }
      if (!coordinatorEmail.trim() || !coordinatorEmail.includes('@')) {
        setValidationError('Please enter a valid Coordinator Email Address.');
        return false;
      }
      if (!coordinatorPhone.trim()) {
        setValidationError('Please enter the Coordinator Phone / Mobile Number.');
        return false;
      }
      if (instituteTeams.length === 0) {
        setValidationError('Please add at least 1 team with participants.');
        return false;
      }
      for (let t = 0; t < instituteTeams.length; t++) {
        const team = instituteTeams[t];
        if (!team.teamName.trim()) {
          setValidationError(`Please enter a name for Team #${t + 1}.`);
          return false;
        }
        if (team.members.length === 0) {
          setValidationError(`Team "${team.teamName}" must have at least 1 participant.`);
          return false;
        }
        if (team.members.length > 4) {
          setValidationError(`Team "${team.teamName}" exceeds the maximum limit of 4 participants per team.`);
          return false;
        }
        for (let m = 0; m < team.members.length; m++) {
          const mem = team.members[m];
          if (!mem.name.trim()) {
            setValidationError(`Please provide the Name for Participant #${m + 1} in "${team.teamName}".`);
            return false;
          }
          if (!mem.email.trim() || !mem.email.includes('@')) {
            setValidationError(`Please provide a valid Email for Participant #${m + 1} (${mem.name || 'Student'}) in "${team.teamName}".`);
            return false;
          }
        }
      }
    }

    // DPDP Consent
    if (!dpdpConsentAccepted) {
      setValidationError(
        'Consent under the Digital Personal Data Protection (DPDP) Act, 2023 is mandatory to process personal data.'
      );
      return false;
    }

    return true;
  };

  const handleProceedToPaymentStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Compile Nominees for Context & Secretariat Integration
  const compileNomineesList = (): CSRBootcampNominee[] => {
    if (regMode === 'individual') {
      const leaderNominee: CSRBootcampNominee = {
        id: 'nom_lead_' + Date.now().toString(36),
        name,
        dob,
        gender,
        email,
        mobile,
        instituteName,
        program,
        semester,
        enrolmentNumber,
        password,
        designation: isOnboardingTeam ? 'Team Leader / Student' : 'Student Participant',
        isTeamLeader: true,
      };

      if (!isOnboardingTeam) {
        return [leaderNominee];
      }

      const teamNominees: CSRBootcampNominee[] = teamMembers.map((tm, idx) => ({
        id: 'nom_tm_' + idx + '_' + Date.now().toString(36),
        name: tm.name,
        dob: tm.dob,
        gender: tm.gender,
        email: tm.email,
        mobile: tm.mobile,
        instituteName,
        program: tm.program,
        semester: tm.semester,
        enrolmentNumber: tm.enrolmentNumber,
        password: tm.password,
        designation: 'Team Member',
        isTeamLeader: false,
      }));

      return [leaderNominee, ...teamNominees];
    } else {
      return instituteTeams.flatMap((team, teamIdx) =>
        team.members.map((ip, memIdx) => ({
          id: `nom_inst_${teamIdx}_${memIdx}_` + Date.now().toString(36),
          name: ip.name,
          dob: ip.dob,
          gender: ip.gender,
          email: ip.email,
          mobile: ip.mobile,
          instituteName: instName,
          program: ip.program,
          semester: ip.semester,
          enrolmentNumber: ip.enrolmentNumber,
          password: ip.password,
          designation: memIdx === 0 ? `Team Leader (${team.teamName})` : `Team Member (${team.teamName})`,
          department: team.teamName,
          teamName: team.teamName,
          isTeamLeader: memIdx === 0,
        }))
      );
    }
  };

  // Trigger Submission & Redirect to Gateway or Invoice
  const handleInitiateSubmission = (method: 'gateway' | 'proforma_invoice') => {
    const regNumber = 'AIMA-CL26-' + Math.floor(10000 + Math.random() * 90000);
    const invNumber =
      method === 'gateway'
        ? 'INV-2026-CL-' + Math.floor(10000 + Math.random() * 90000)
        : 'PINV-2026-CL-' + Math.floor(10000 + Math.random() * 90000);

    const compiledNominees = compileNomineesList();
    const primaryPayer = regMode === 'individual' ? instituteName : instName;
    const coordEmail = regMode === 'individual' ? email : coordinatorEmail;
    const coordName = regMode === 'individual' ? name : coordinatorName;
    const coordPhone = regMode === 'individual' ? mobile : coordinatorPhone;

    const payload: Omit<
      CSRBootcampRegistration,
      'id' | 'createdAt' | 'emailDispatchedAt' | 'secretariatEmailSent' | 'registrantEmailSent'
    > = {
      registrationNumber: regNumber,
      track: regMode === 'individual' ? 'corporate_individual' : 'institutional',
      organizationName: primaryPayer,
      address: regMode === 'individual' ? instituteName : instAddress,
      city: regMode === 'individual' ? 'New Delhi' : instCity,
      state: regMode === 'individual' ? 'Delhi' : instState,
      pinCode: regMode === 'individual' ? '110001' : instPinCode,
      isOnboardingTeam: regMode === 'individual' ? isOnboardingTeam : true,
      teamName:
        regMode === 'individual'
          ? (isOnboardingTeam ? teamName : undefined)
          : `${instituteTeams.length} Teams (${instituteTeams.map((t) => t.teamName).join(', ')})`,
      participantPassword: password,
      coordinator: {
        name: coordName,
        email: coordEmail,
        mobile: coordPhone,
        designation: regMode === 'individual' ? 'Participant / Leader' : 'Faculty Coordinator',
      },
      tierId: '1_3',
      tierLabel: `₹${PARTICIPATION_FEE_PER_PERSON} per participant`,
      participantCount: feeCalculation.participantCount,
      ratePerPersonOrPackage: feeCalculation.ratePerPerson,
      subtotalExclGst: feeCalculation.total,
      gstAmount: 0,
      totalPayable: feeCalculation.total,
      gstRate: 0,
      gstType: 'IGST',
      sacCode: '999293',
      nominees: compiledNominees,
      managementAuthorisationAccepted: true,
      termsAccepted: true,
      dpdpConsentAccepted: dpdpConsentAccepted,
      dpdpConsentTimestamp: new Date().toISOString(),
      paymentStatus: 'PENDING_INVOICE',
      invoiceNumber: invNumber,
    };

    const result = registerCSRBootcamp(payload);
    setActiveCreatedRegistration(result.registration);

    // Dynamic Supabase Persistence (registration record)
    saveRegistrationToSupabase(result.registration).catch((err) => {
      console.warn('Supabase dynamic save error (cached locally):', err);
    });

    // Create participant login accounts for every nominee
    createParticipantAccounts(result.registration).then(({ created, errors }) => {
      if (errors.length > 0) {
        console.warn('Participant account creation partial errors:', errors);
      } else {
        console.info(`Participant accounts created: ${created}`);
      }
    }).catch((err) => {
      console.warn('Participant account creation failed (non-critical):', err);
    });

    if (method === 'gateway') {
      setShowGatewayModal(true);
    } else {
      // Proforma Invoice (Institutional Pay Later)
      setCurrentStep(4);
      setShowInvoiceModal(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleGatewayPaymentSuccess = (paymentMethod: string, transactionId: string) => {
    if (activeCreatedRegistration) {
      updateCSRPayment(activeCreatedRegistration.id, paymentMethod, transactionId);

      // Dynamic Supabase Payment Update
      updateRegistrationPaymentInSupabase(
        activeCreatedRegistration.registrationNumber,
        'PAID',
        paymentMethod,
        transactionId
      ).catch((err) => {
        console.warn('Supabase payment sync notice:', err);
      });

      setActiveCreatedRegistration((prev) =>
        prev
          ? {
              ...prev,
              paymentStatus: 'PAID',
              paymentMethod: paymentMethod as any,
              transactionId,
              invoiceNumber: prev.invoiceNumber.replace('PINV-', 'INV-'),
            }
          : null
      );
    }
    setShowGatewayModal(false);
    setCurrentStep(4);
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    formSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Copy all generated login credentials
  const handleCopyAllCredentials = () => {
    const list = compileNomineesList();
    const text = list
      .map(
        (n, i) =>
          `[${i + 1}] ${n.name}\nEmail: ${n.email}\nEnrolment: ${n.enrolmentNumber || 'N/A'}\nQuiz Password: ${n.password || 'AimaQuiz@2026'}\n`
      )
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopiedLogins(true);
    setTimeout(() => setCopiedLogins(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-16">
      {/* ============================================================== */}
      {/* 3D POSTER HERO SECTION (FULL WIDTH LIKE HOME PAGE HERO)        */}
      {/* ============================================================== */}
      <PosterHero3D
        onScrollToForm={handleScrollToForm}
        onOpenFeeModal={() => {}}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* ============================================================== */}
        {/* FORM CONTAINER ANCHOR & STEP INDICATOR                         */}
        {/* ============================================================== */}
        <div ref={formSectionRef} className="pt-2 space-y-6">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1.5 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>National Candidate Registration Portal</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Register for India Case League 2026
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xl">
                Complete student or institutional nomination below to receive immediate Quiz Login credentials.
              </p>
            </div>

            {/* Participation Fee Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700/60 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
                ₹
              </div>
              <div className="text-left">
                <span className="block text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Registration Fee
                </span>
                <span className="block text-xs font-extrabold text-slate-900 dark:text-white">
                  ₹200 per Participant
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Navigation */}
            <div className="pt-4 flex items-center justify-center max-w-lg mx-auto w-full px-2">
              <div className="flex items-center w-full justify-between relative">
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 dark:bg-slate-800 -z-1" />

                {/* Step 1 */}
                <div className="flex flex-col items-center gap-1.5 z-10 bg-slate-50 dark:bg-slate-950 px-1 sm:px-2">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      currentStep === 1
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-blue-500/30'
                        : currentStep > 1
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {currentStep > 1 ? <Check className="w-4 h-4 stroke-[3]" /> : '1'}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center">
                    Candidate Info
                  </span>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col items-center gap-1.5 z-10 bg-slate-50 dark:bg-slate-950 px-1 sm:px-2">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      currentStep === 2
                        ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-blue-500/30'
                        : currentStep > 2
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {currentStep > 2 ? <Check className="w-4 h-4 stroke-[3]" /> : '2'}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center">
                    Review &amp; Fee
                  </span>
                </div>

                {/* Step 3 & 4 */}
                <div className="flex flex-col items-center gap-1.5 z-10 bg-slate-50 dark:bg-slate-950 px-1 sm:px-2">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                      currentStep >= 3
                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {currentStep === 4 ? <Check className="w-4 h-4 stroke-[3]" /> : '3'}
                  </div>
                  <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center">
                    Payment &amp; Quiz
                  </span>
                </div>
              </div>
            </div>

          {/* ============================================================== */}
          {/* STEP 1: PARTICIPANT / INSTITUTE FORM                           */}
          {/* ============================================================== */}
          {currentStep === 1 && (
            <div className="space-y-8 animate-in fade-in duration-200">
              {/* Aceternity Style Mode Switcher */}
              <div className="flex items-center justify-center px-2">
                <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md max-w-md w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setRegMode('individual');
                      setValidationError('');
                    }}
                    className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      regMode === 'individual'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <UserCheck className="w-4 h-4 shrink-0" />
                    <span>Individual Participant</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRegMode('institute');
                      setValidationError('');
                    }}
                    className={`flex-1 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      regMode === 'institute'
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25'
                        : 'text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Building2 className="w-4 h-4 shrink-0" />
                    <span>Institute Registration</span>
                  </button>
                </div>
              </div>

              {/* TRACK A: INDIVIDUAL PARTICIPANT FORM */}
              {regMode === 'individual' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <GraduationCap className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Individual Participant Details
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Enter your personal, academic, and quiz login security details
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs">
                        1–3 Participants Tier
                      </span>
                    </div>

                    {/* Individual Fields Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                      {/* Name */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Candidate Full Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Date of Birth */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Date of Birth (DOB) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:[color-scheme:dark]"
                          required
                        />
                      </div>

                      {/* Gender */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={gender}
                          onChange={(e) => setGender(e.target.value as any)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:[color-scheme:dark]"
                        >
                          <option value="Male" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Male</option>
                          <option value="Female" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Female</option>
                          <option value="Other" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Other</option>
                          <option value="Prefer not to say" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Prefer not to say</option>
                        </select>
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Email Address (Quiz Username) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="aarav.s@college.edu"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-[11px]"
                          required
                        />
                      </div>

                      {/* Mobile */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Mobile Number (+91) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Institute Name */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Institute / College Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={instituteName}
                          onChange={(e) => setInstituteName(e.target.value)}
                          placeholder="e.g. Faculty of Management Studies, Delhi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Program / Course */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Program / Course <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          placeholder="e.g. MBA / PGDM / B.Tech / BBA"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Current Semester / Year */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Current Semester / Year <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={semester}
                          onChange={(e) => setSemester(e.target.value)}
                          placeholder="e.g. 2nd Year / Semester 3"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Enrolment Number */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Enrolment / Roll Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={enrolmentNumber}
                          onChange={(e) => setEnrolmentNumber(e.target.value)}
                          placeholder="e.g. FMS-2025-MBA-089"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Password & Confirm Password Section for Quiz Login */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-amber-500" />
                        <h4 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
                          Set Password for Online Quiz &amp; Workspace Login
                        </h4>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
                          8–11 October Quiz Access
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                        {/* Set Password */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              Set Password <span className="text-red-500">*</span>
                            </label>
                            <span className="text-[10px] text-slate-400">Min 6 characters</span>
                          </div>
                          <div className="relative">
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Create login password"
                              className="w-full pr-10 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>

                          {/* Strength Indicator */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                              <div
                                className={`h-full transition-all ${
                                  passwordStrength <= 1
                                    ? 'w-1/4 bg-red-500'
                                    : passwordStrength === 2
                                    ? 'w-2/4 bg-amber-500'
                                    : passwordStrength === 3
                                    ? 'w-3/4 bg-blue-500'
                                    : 'w-full bg-emerald-500'
                                }`}
                              />
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium">
                              {passwordStrength <= 1
                                ? 'Weak'
                                : passwordStrength === 2
                                ? 'Medium'
                                : passwordStrength === 3
                                ? 'Good'
                                : 'Strong'}
                            </span>
                          </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="font-semibold text-slate-700 dark:text-slate-300">
                              Confirm Password <span className="text-red-500">*</span>
                            </label>
                            {passwordsMatch && (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Passwords Match
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Re-enter password"
                              className={`w-full pr-10 px-3.5 py-2.5 rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono ${
                                confirmPassword.length > 0 && !passwordsMatch
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-slate-300 dark:border-slate-700'
                              }`}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {confirmPassword.length > 0 && !passwordsMatch && (
                            <p className="text-[11px] text-red-500 mt-1">Passwords do not match.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Optional Checkbox: Onboard / Register Team */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                      <label className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors">
                        <input
                          type="checkbox"
                          checked={isOnboardingTeam}
                          onChange={(e) => {
                            setIsOnboardingTeam(e.target.checked);
                            setValidationError('');
                          }}
                          className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <div>
                          <div className="text-xs font-bold text-blue-950 dark:text-blue-200 flex items-center gap-1.5">
                            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span>Onboard / Register Team (Team Leader Mode)</span>
                          </div>
                          <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                            Check this box if you are registering as a Team Leader and want to onboard multiple teammates right now. Group fee slabs apply.
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* EXPANDABLE TEAM MEMBERS ROSTER */}
                  {isOnboardingTeam && (
                    <div className="bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Team Squad Builder</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Onboard Teammates (Max. 4 per team)
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            You (<strong>{name || 'Leader'}</strong>) are Team Leader. Add up to 3 more teammates.
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold border border-blue-200 dark:border-blue-800">
                            {1 + teamMembers.length} / 4 Members
                          </span>
                          <button
                            type="button"
                            onClick={handleAddTeamMember}
                            disabled={teamMembers.length >= 3}
                            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Teammate</span>
                          </button>
                        </div>
                      </div>

                      {/* Team Name Input */}
                      <div className="max-w-md">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-xs">
                          Team Name / Squad Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Synergy Strategists"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 font-semibold"
                          required
                        />
                      </div>

                      {/* Team Member Cards */}
                      <div className="space-y-4">
                        {teamMembers.map((tm, idx) => (
                          <div
                            key={tm.id}
                            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-4 relative"
                          >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700/60">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">
                                  {idx + 2}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white text-xs">
                                  Teammate #{idx + 2} Details
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveTeamMember(tm.id)}
                                className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Remove</span>
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Name *
                                </label>
                                <input
                                  type="text"
                                  value={tm.name}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'name', e.target.value)}
                                  placeholder="Teammate full name"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  DOB *
                                </label>
                                <input
                                  type="date"
                                  value={tm.dob}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'dob', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Email (Login ID) *
                                </label>
                                <input
                                  type="email"
                                  value={tm.email}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'email', e.target.value)}
                                  placeholder="teammate@domain.edu"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-[11px]"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Mobile Number *
                                </label>
                                <input
                                  type="tel"
                                  value={tm.mobile}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'mobile', e.target.value)}
                                  placeholder="+91 98..."
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Gender
                                </label>
                                <select
                                  value={tm.gender}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'gender', e.target.value)}
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                  <option value="Other">Other</option>
                                  <option value="Prefer not to say">Prefer not to say</option>
                                </select>
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Program / Course
                                </label>
                                <input
                                  type="text"
                                  value={tm.program}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'program', e.target.value)}
                                  placeholder="e.g. MBA"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Enrolment / Roll No *
                                </label>
                                <input
                                  type="text"
                                  value={tm.enrolmentNumber}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'enrolmentNumber', e.target.value)}
                                  placeholder="Roll number"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                  Quiz Password
                                </label>
                                <input
                                  type="text"
                                  value={tm.password}
                                  onChange={(e) => handleUpdateTeamMember(tm.id, 'password', e.target.value)}
                                  placeholder="Password"
                                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TRACK B: INSTITUTE REGISTRATION FORM */}
              {regMode === 'institute' && (
                <div className="space-y-6">
                  {/* Institute Core Info */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            Institute &amp; Coordinator Profile
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Official institution details and authorized faculty coordinator
                          </p>
                        </div>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs">
                        Institutional Delegation
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                      {/* Name of Institute */}
                      <div className="sm:col-span-2 lg:col-span-2">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Name of Institute <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={instName}
                          onChange={(e) => setInstName(e.target.value)}
                          placeholder="Full University / Institute Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-semibold"
                          required
                        />
                      </div>

                      {/* Address */}
                      <div className="sm:col-span-2 lg:col-span-1">
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Campus Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={instAddress}
                          onChange={(e) => setInstAddress(e.target.value)}
                          placeholder="Street / Institutional Area"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* City */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={instCity}
                          onChange={(e) => setInstCity(e.target.value)}
                          placeholder="e.g. New Delhi"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* State */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={instState}
                          onChange={(e) => setInstState(e.target.value)}
                          placeholder="e.g. Delhi NCR / Maharashtra"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* PIN Code */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          PIN Code
                        </label>
                        <input
                          type="text"
                          value={instPinCode}
                          onChange={(e) => setInstPinCode(e.target.value)}
                          placeholder="e.g. 110016"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
                        />
                      </div>

                      {/* Coordinator Name */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Coordinator Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={coordinatorName}
                          onChange={(e) => setCoordinatorName(e.target.value)}
                          placeholder="Dr. / Prof. Full Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>

                      {/* Coordinator Email */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Coordinator Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          value={coordinatorEmail}
                          onChange={(e) => setCoordinatorEmail(e.target.value)}
                          placeholder="coordinator@univ.edu"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono text-[11px]"
                          required
                        />
                      </div>

                      {/* Coordinator Phone */}
                      <div>
                        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                          Coordinator Phone / Mobile <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="tel"
                          value={coordinatorPhone}
                          onChange={(e) => setCoordinatorPhone(e.target.value)}
                          placeholder="+91 98..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Institute Teams Section */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
                            Multi-Team Delegation
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-bold text-xs">
                            Max 4 Members / Team
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          Institute Teams &amp; Participants ({instituteTeams.length} Team{instituteTeams.length > 1 ? 's' : ''} • {totalHeadcount} Total Candidates)
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Add multiple teams from your institution. Each team can have a maximum of 4 participants.
                        </p>
                      </div>

                      {/* Right action controls: Excel / Form toggle + Add Team */}
                      <div className="flex flex-wrap items-center gap-2.5">
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => setInstituteEntryTab('form')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                              instituteEntryTab === 'form'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <Users className="w-3.5 h-3.5" />
                            <span>Form Entry</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setInstituteEntryTab('excel')}
                            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                              instituteEntryTab === 'excel'
                                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                            }`}
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Excel Import</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddInstituteTeam}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-500/20"
                        >
                          <Plus className="w-4 h-4 stroke-[2.5]" />
                          <span>Add Another Team</span>
                        </button>
                      </div>
                    </div>

                    {/* TAB 1: EXCEL IMPORT */}
                    {instituteEntryTab === 'excel' && (
                      <div className="space-y-4">
                        <div className="p-6 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-950/20 text-center space-y-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                            <Upload className="w-6 h-6" />
                          </div>
                          <div className="space-y-1">
                            <div className="text-sm font-bold text-slate-900 dark:text-white">
                              Upload Multi-Team Roster Spreadsheet
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                              Upload your Excel (.xlsx, .xls) or CSV file with columns: Team Name, Candidate Name, DOB, Email, Gender, Mobile, Program, Semester, Enrolment Number, and Password. Max 4 members per team.
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center justify-center gap-3">
                            <button
                              type="button"
                              onClick={() => fileInputRef.current?.click()}
                              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                              <FileSpreadsheet className="w-4 h-4" />
                              <span>Select Excel File to Import</span>
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept=".xlsx, .xls, .csv"
                              onChange={handleFileUpload}
                              className="hidden"
                            />

                            <button
                              type="button"
                              onClick={handleDownloadExcelTemplate}
                              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                              <Download className="w-4 h-4 text-amber-500" />
                              <span>Download Official Template</span>
                            </button>
                          </div>
                        </div>

                        {/* Excel Feedback */}
                        {excelUploadFeedback && (
                          <div
                            className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                              excelUploadFeedback.type === 'success'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
                            }`}
                          >
                            {excelUploadFeedback.type === 'success' ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                            )}
                            <span>{excelUploadFeedback.message}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: TEAMS & PARTICIPANTS FORM */}
                    <div className="space-y-6">
                      {instituteTeams.map((team, tIdx) => (
                        <div
                          key={team.id}
                          className="rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden space-y-4"
                        >
                          {/* Team Card Header */}
                          <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-slate-800/80 dark:via-blue-950/30 dark:to-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[240px]">
                              <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                                {tIdx + 1}
                              </span>
                              <div className="flex-1 min-w-[180px]">
                                <div className="text-[10px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                                  Team #{tIdx + 1}
                                </div>
                                <input
                                  type="text"
                                  value={team.teamName}
                                  onChange={(e) => handleUpdateInstituteTeamName(team.id, e.target.value)}
                                  placeholder={`e.g. Team ${tIdx + 1} or Synergy`}
                                  className="font-bold text-sm sm:text-base text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-600 focus:border-blue-500 focus:outline-hidden px-1 py-0.5 w-full max-w-xs"
                                  required
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Member count indicator */}
                              <span
                                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                                  team.members.length >= 4
                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                                    : 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                }`}
                              >
                                {team.members.length} / 4 Members {team.members.length >= 4 && '(Max)'}
                              </span>

                              {/* Add member button */}
                              <button
                                type="button"
                                onClick={() => handleAddMemberToTeam(team.id)}
                                disabled={team.members.length >= 4}
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                                title={team.members.length >= 4 ? 'Maximum 4 participants per team reached' : 'Add participant to this team'}
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Member</span>
                              </button>

                              {/* Remove team button */}
                              {instituteTeams.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveInstituteTeam(team.id)}
                                  className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors border border-transparent hover:border-red-200 dark:hover:border-red-900/50"
                                  title="Remove entire team"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Delete Team</span>
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Team Members List */}
                          <div className="p-4 sm:p-5 space-y-4">
                            {team.members.map((p, mIdx) => (
                              <div
                                key={p.id}
                                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 space-y-3"
                              >
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700/60">
                                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                                      {mIdx + 1}
                                    </span>
                                    <span>
                                      Participant #{mIdx + 1}
                                    </span>
                                    {mIdx === 0 && (
                                      <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                        Team Leader
                                      </span>
                                    )}
                                  </span>
                                  {team.members.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveMemberFromTeam(team.id, p.id)}
                                      className="text-red-500 hover:text-red-700 p-1 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Remove</span>
                                    </button>
                                  )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Full Name *
                                    </label>
                                    <input
                                      type="text"
                                      value={p.name}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'name', e.target.value)
                                      }
                                      placeholder="Student name"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      DOB (Date of Birth)
                                    </label>
                                    <input
                                      type="date"
                                      value={p.dob}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'dob', e.target.value)
                                      }
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Email (Quiz Login ID) *
                                    </label>
                                    <input
                                      type="email"
                                      value={p.email}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'email', e.target.value)
                                      }
                                      placeholder="student@univ.edu"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                                      required
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Mobile Number
                                    </label>
                                    <input
                                      type="tel"
                                      value={p.mobile}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'mobile', e.target.value)
                                      }
                                      placeholder="+91 98..."
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Gender
                                    </label>
                                    <select
                                      value={p.gender}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'gender', e.target.value as any)
                                      }
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    >
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                      <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Program / Course
                                    </label>
                                    <input
                                      type="text"
                                      value={p.program}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'program', e.target.value)
                                      }
                                      placeholder="e.g. PGDM / MBA"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Enrolment / Roll No
                                    </label>
                                    <input
                                      type="text"
                                      value={p.enrolmentNumber}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'enrolmentNumber', e.target.value)
                                      }
                                      placeholder="e.g. ROLL-101"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                                    />
                                  </div>

                                  <div>
                                    <label className="block text-slate-600 dark:text-slate-400 mb-1 font-medium">
                                      Set Quiz Password
                                    </label>
                                    <input
                                      type="text"
                                      value={p.password}
                                      onChange={(e) =>
                                        handleUpdateTeamMemberField(team.id, p.id, 'password', e.target.value)
                                      }
                                      placeholder="Quiz pass"
                                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-[11px]"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Bottom Add Team CTA */}
                      <button
                        type="button"
                        onClick={handleAddInstituteTeam}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800/80 hover:border-blue-500 bg-blue-50/40 dark:bg-blue-950/20 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>Add Another Team (Team #{instituteTeams.length + 1})</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* DPDP Act Consent – Single Line */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dpdpConsentAccepted}
                    onChange={(e) => setDpdpConsentAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2 border-indigo-300 dark:border-indigo-700 cursor-pointer shrink-0"
                  />
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    <span className="font-bold text-slate-900 dark:text-white">Consent (DPDP Act, 2023):</span>{' '}
                    I hereby give free, specific, informed, and unambiguous consent to AIMA to collect and process the personal data provided in this form solely for the administration of the India Case League 2026, as required under the Digital Personal Data Protection Act, 2023.
                  </p>
                </label>
              </div>

              {/* Validation Error Banner */}
              {validationError && (
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-3 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Proceed to Payment Step Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleProceedToPaymentStep}
                  className="relative inline-flex h-12 sm:h-14 overflow-hidden rounded-2xl p-[2px] focus:outline-hidden group shadow-xl shadow-blue-500/25 cursor-pointer hover:scale-[1.01] transition-transform w-full sm:w-auto"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#2563eb_0%,#38bdf8_50%,#2563eb_100%)] pointer-events-none" />
                  <span className="relative z-10 inline-flex h-full w-full cursor-pointer items-center justify-center rounded-2xl bg-blue-600 hover:bg-blue-500 px-6 sm:px-8 text-xs sm:text-sm font-black text-white tracking-wide transition-colors gap-2.5 shadow-inner">
                    <span>Proceed to Step 2: Review &amp; Payment</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 2: REVIEW & DEDICATED PARTICIPATION FEE TABLE             */}
          {/* ============================================================== */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Back to Edit button */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                <span>Back to Edit Registration Fields</span>
              </button>

              {/* PARTICIPATION FEE SECTION */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        PARTICIPATION FEE
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Please select the applicable fee based on the number of participants nominated.
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    Total Nominated: {totalHeadcount} Participant{totalHeadcount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Flat ₹200 per participant fee display */}
                <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border-2 border-blue-600/80 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                        Participation Fee – India Case League 2026
                      </span>
                      <h4 className="text-xl font-black text-slate-900 dark:text-white">
                        ₹200 per Participant
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {regMode === 'individual' && !isOnboardingTeam
                          ? 'Individual registration – 1 participant'
                          : `${totalHeadcount} participant${totalHeadcount > 1 ? 's' : ''} registered`}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Total Amount</span>
                      <span className="text-3xl font-black text-blue-600 dark:text-blue-400">
                        ₹{feeCalculation.total.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-200 dark:border-blue-900 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Rate per Participant:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">₹{PARTICIPATION_FEE_PER_PERSON} / person</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Number of Participants:</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">{totalHeadcount}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between font-bold text-sm text-slate-900 dark:text-white">
                      <span>Total Payable:</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black text-base">₹{feeCalculation.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Registration Summary */}
                {regMode === 'individual' && isOnboardingTeam && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs text-blue-600 dark:text-blue-400 font-semibold">
                    Team: {teamName} • {totalHeadcount} Members
                  </div>
                )}

                {regMode === 'institute' && (
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs space-y-2">
                    <span className="font-bold text-slate-700 dark:text-slate-300 block">
                      Registered Teams Breakdown ({instituteTeams.length} {instituteTeams.length === 1 ? 'Team' : 'Teams'} • Max 4 participants per team):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {instituteTeams.map((team, idx) => (
                        <div key={team.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                          <span className="font-bold text-slate-800 dark:text-slate-200 truncate pr-2">
                            {team.teamName || `Team ${idx + 1}`}
                          </span>
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 shrink-0">
                            {team.members.length} / 4 Members
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Dual Payment Options / Action Buttons */}
                <div className="pt-2 space-y-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    {/* Primary: Gateway */}
                    <button
                      type="button"
                      onClick={() => handleInitiateSubmission('gateway')}
                      className="flex-1 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-700/25 hover:scale-[1.01]"
                    >
                      <CreditCard className="w-5 h-5 stroke-[2.5]" />
                      <span>Proceed to AIMA Payment Gateway (UPI / Cards)</span>
                    </button>

                    {/* Secondary: Proforma Invoice for Institutional Approval */}
                    {regMode === 'institute' && (
                      <button
                        type="button"
                        onClick={() => handleInitiateSubmission('proforma_invoice')}
                        className="py-4 px-6 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <FileText className="w-4 h-4 text-amber-500 stroke-[2.5]" />
                        <span>Generate Proforma Tax Invoice (NEFT / PO)</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>
                      AIMA 256-bit SSL encrypted gateway • Automatic email dispatch to Secretariat and candidate logins.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* STEP 4: REGISTRATION & PAYMENT SUCCESS CELEBRATION             */}
          {/* ============================================================== */}
          {currentStep === 4 && activeCreatedRegistration && (
            <div className="space-y-6 animate-in zoom-in-95 duration-300">
              {/* Success Celebration Card */}
              <div className="bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800/80 rounded-3xl p-6 sm:p-10 shadow-xl space-y-6 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    Registration Successfully Confirmed
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                    Welcome to India Case League 2026!
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto">
                    Your registration has been securely logged in the AIMA national registry.
                    Official confirmations and quiz credentials have been dispatched.
                  </p>
                </div>

                {/* Key Reference Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Registration ID</span>
                    <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">
                      {activeCreatedRegistration.registrationNumber}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Invoice Reference</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {activeCreatedRegistration.invoiceNumber}
                    </span>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Payment Status</span>
                    <span
                      className={`font-bold text-sm ${
                        activeCreatedRegistration.paymentStatus === 'PAID'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {activeCreatedRegistration.paymentStatus === 'PAID' ? 'PAID & CLEARED' : 'PROFORMA / PENDING'}
                    </span>
                  </div>
                </div>

                {/* PARTICIPANT LOGIN CREDENTIALS VAULT */}
                <div className="text-left bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-amber-500" />
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                          Quiz Login Credentials Vault
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Use these credentials to log in to the Online Quiz (8–11 October 2026)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyAllCredentials}
                      className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copiedLogins ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLogins ? 'Copied to Clipboard' : 'Copy All Credentials'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {compileNomineesList().map((nom, idx) => (
                      <div
                        key={nom.id || idx}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-slate-900 dark:text-white truncate">
                            {nom.name}
                          </span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {nom.teamName && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                                {nom.teamName}
                              </span>
                            )}
                            {nom.isTeamLeader && (
                              <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
                                Leader
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Login ID: <strong className="font-mono text-slate-900 dark:text-white">{nom.email}</strong>
                        </div>
                        <div className="text-slate-600 dark:text-slate-400 text-[11px]">
                          Password: <strong className="font-mono text-amber-600 dark:text-amber-400">{nom.password || 'AimaQuiz@2026'}</strong>
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Enrolment: {nom.enrolmentNumber || 'N/A'} • {nom.program || 'Management'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AUTOMATED EMAIL DISPATCH CONFIRMATION CARD (NO INSPECT BUTTON) */}
                <div className="text-left p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-blue-950 dark:text-blue-200 text-xs">
                      Official Email Dispatched to AIMA Secretariat &amp; Candidates
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                    An automated registration dossier with participant roster and invoice data has been securely transmitted to <strong>Ms. Ekta Nayyar &amp; ICRC Secretariats (caseresearchcentre@aima.in)</strong>, and confirmation credentials have been emailed to <strong>{regMode === 'individual' ? email : coordinatorEmail}</strong>.
                  </p>
                </div>

                {/* SUPABASE DYNAMIC CLOUD SYNC CARD */}
                <div className="text-left p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800/80 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-emerald-950 dark:text-emerald-200 text-xs">
                        Supabase Dynamic Persistence: Synchronized
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-400/40">
                      Live Cloud Sync
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-900/80 dark:text-emerald-300/80 leading-relaxed">
                    Registration record <strong>{activeCreatedRegistration?.registrationNumber}</strong> with <strong>{activeCreatedRegistration?.participantCount || 1} participant(s)</strong> has been dynamically saved and verified with the AIMA Secretariat database.
                  </p>
                </div>

                {/* Actions: View Invoice, Start Another */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(true)}
                    className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>View Official Tax Invoice / Receipt</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setCurrentStep(1);
                      setActiveCreatedRegistration(null);
                    }}
                    className="px-5 py-3 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
                  >
                    Submit Another Registration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* MODALS: GATEWAY & INVOICE                                     */}
        {/* ============================================================== */}
        <AimaGatewayModal
          isOpen={showGatewayModal}
          onClose={() => setShowGatewayModal(false)}
          registration={activeCreatedRegistration}
          onPaymentSuccess={handleGatewayPaymentSuccess}
        />

        <AimaInvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => setShowInvoiceModal(false)}
          registration={activeCreatedRegistration}
        />


      </div>
    </div>
  );
};
