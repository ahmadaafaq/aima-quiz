import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { RegionHubId } from '../../types';
import {
  X,
  GraduationCap,
  Building2,
  Users,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  QrCode,
  Smartphone,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Sparkles,
  MapPin,
  Lock,
  Building,
  Receipt,
  FileCheck2,
  Clock
} from 'lucide-react';

interface UnifiedRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTrack?: 'team' | 'institute';
}

export const UnifiedRegistrationModal: React.FC<UnifiedRegistrationModalProps> = ({
  isOpen,
  onClose,
  initialTrack = 'team',
}) => {
  const {
    showRegistrationModal,
    setShowRegistrationModal,
    registrationModalTrack,
    registerTeamWithPayment,
    registerInstituteWithPayment,
    hubs,
    switchRole,
    setActiveView,
  } = useCompetition();

  const activeIsOpen = isOpen || showRegistrationModal;
  const handleClose = () => {
    onClose();
    setShowRegistrationModal(false);
  };

  const [track, setTrack] = useState<'team' | 'institute'>(initialTrack || registrationModalTrack || 'team');
  const [step, setStep] = useState<number>(1);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedInvoice, setCopiedInvoice] = useState(false);

  // Team Registration Form State
  const [leaderName, setLeaderName] = useState('Aarav Singhania');
  const [leaderEmail, setLeaderEmail] = useState('aarav.singhania@iimb.ac.in');
  const [leaderMobile, setLeaderMobile] = useState('+91 98765 43210');
  const [instituteName, setInstituteName] = useState('Indian Institute of Management Bangalore (IIMB)');
  const [programme, setProgramme] = useState('Post Graduate Programme in Management (MBA)');
  const [specialisation, setSpecialisation] = useState('Strategy & Operations');
  const [yearSemester, setYearSemester] = useState('2nd Year / Term 4');
  const [studentIdCardNumber, setStudentIdCardNumber] = useState('IIMB-2025-MBA-1044');

  const [teamName, setTeamName] = useState('StratApex Consulting');
  const [preferredHub, setPreferredHub] = useState<RegionHubId>('south');
  const [selectedDomain, setSelectedDomain] = useState('EV Ecosystem & Clean Energy Mobility');

  const [members, setMembers] = useState([
    { name: 'Diya Mehra', email: 'diya.mehra@iimb.ac.in', mobile: '+91 98765 43211', collegeRollNo: 'IIMB-2025-MBA-1082' },
    { name: 'Rohan Verma', email: 'rohan.verma@iimb.ac.in', mobile: '+91 98765 43212', collegeRollNo: 'IIMB-2025-MBA-1120' },
    { name: 'Ananya Roy', email: 'ananya.roy@iimb.ac.in', mobile: '+91 98765 43213', collegeRollNo: 'IIMB-2025-MBA-1155' },
  ]);

  // Payment Gateway State
  const [couponCode, setCouponCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_vpa' | 'card' | 'netbanking' | 'voucher'>('upi_qr');
  const [upiId, setUpiId] = useState('aarav.singhania@okaxis');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [cardNumber, setCardNumber] = useState('4532 8900 1234 5678');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('889');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [processingStage, setProcessingStage] = useState('');

  // Result state
  const [registrationResult, setRegistrationResult] = useState<any>(null);

  // Institute Bulk State
  const [instName, setInstName] = useState('Faculty of Management Studies (FMS), Delhi');
  const [instCode, setInstCode] = useState('FMS-DELHI-01');
  const [instState, setInstState] = useState('Delhi NCR');
  const [instCity, setInstCity] = useState('New Delhi');
  const [coordName, setCoordName] = useState('Prof. Sanjeev Kaushik');
  const [coordEmail, setCoordEmail] = useState('sanjeev.kaushik@fms.edu');
  const [coordMobile, setCoordMobile] = useState('+91 98110 44556');
  const [batchSize, setBatchSize] = useState<number>(50);

  if (!activeIsOpen) return null;

  // Pricing Calculations
  const totalTeamMembers = 1 + members.length;
  const baseRatePerStudent = 200;
  const rawSubtotal = totalTeamMembers * baseRatePerStudent;
  const discountAmount = discountApplied ? rawSubtotal : 0;
  const subtotal = rawSubtotal - discountAmount;
  const gstAmount = Math.round(subtotal * 0.18);
  const totalPayable = subtotal + gstAmount;

  // Institute Pricing
  const instRatePerStudent = 150;
  const instSubtotal = batchSize * instRatePerStudent;
  const instGst = Math.round(instSubtotal * 0.18);
  const instTotal = instSubtotal + instGst;

  const handleApplyCoupon = () => {
    setCouponError('');
    const code = couponCode.trim().toUpperCase();
    if (code === 'AIMA-100' || code === 'TATA-EV-SPONSOR' || code === 'IIMB-SPECIAL' || code === 'FMS-100') {
      setDiscountApplied(true);
      setPaymentMethod('voucher');
    } else {
      setCouponError('Invalid coupon code. Try "AIMA-100" or "TATA-EV-SPONSOR"');
    }
  };

  const handleSimulatePayment = async () => {
    setIsProcessingPayment(true);
    setProcessingStage('Connecting to AIMA-ICRC Encrypted Payment Gateway...');

    await new Promise(r => setTimeout(r, 800));
    setProcessingStage('Authenticating with NPCI / Banking Network...');

    await new Promise(r => setTimeout(r, 900));
    setProcessingStage('Generating GST Tax Escrow Token & AIMA Registration Key...');

    await new Promise(r => setTimeout(r, 700));

    if (track === 'team') {
      const res = await registerTeamWithPayment({
        leaderName,
        leaderEmail,
        leaderMobile,
        instituteName,
        programme,
        specialisation,
        yearSemester,
        studentIdCardNumber,
        teamName,
        preferredHub,
        members,
        paymentMethod: discountApplied ? 'voucher' : paymentMethod,
        voucherCode: couponCode,
        amount: totalPayable,
      });
      setRegistrationResult(res);
      setStep(4);
    } else {
      const res = await registerInstituteWithPayment({
        instituteName: instName,
        code: instCode,
        state: instState,
        city: instCity,
        coordinatorName: coordName,
        coordinatorEmail: coordEmail,
        coordinatorMobile: coordMobile,
        studentBatchSize: batchSize,
        amount: instTotal,
        paymentMethod: paymentMethod === 'voucher' ? 'voucher' : paymentMethod,
      });
      setRegistrationResult(res);
      setStep(4);
    }

    setIsProcessingPayment(false);
  };

  const handleLaunchDashboard = () => {
    if (track === 'team') {
      switchRole('team_leader');
      setActiveView('student');
    } else {
      switchRole('institute_coordinator');
      setActiveView('institute');
    }
    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-black text-slate-900 dark:text-slate-100">
                  AIMA–ICRC National Case League 2026
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 uppercase tracking-widest">
                  Official Portal
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Direct Registration & Secured Escrow Payment Gateway
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Track Selector Tabs (Only on Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/40 dark:bg-slate-900/40 flex items-center justify-between gap-4">
            <div className="flex rounded-2xl bg-slate-200/70 dark:bg-slate-800 p-1">
              <button
                onClick={() => {
                  setTrack('team');
                  setStep(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  track === 'team'
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Student / Team Registration</span>
              </button>

              <button
                onClick={() => {
                  setTrack('institute');
                  setStep(1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  track === 'institute'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Institutional Cohort (SPOC / Dean)</span>
              </button>
            </div>

            {/* Stepper Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-bold">
              <span className={`px-2.5 py-1 rounded-lg ${step === 1 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                1. Details
              </span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 2 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                2. Team & Hub
              </span>
              <span className="text-slate-300">→</span>
              <span className={`px-2.5 py-1 rounded-lg ${step === 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                3. Gateway & Fee
              </span>
            </div>
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* ======================================================== */}
          {/* STEP 1: CANDIDATE / SPOC DETAILS                         */}
          {/* ======================================================== */}
          {step === 1 && track === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Step 1: Team Leader Academic Credentials</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 font-medium">
                    Primary Point of Contact
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  The team leader will have administrative ownership over Round 1 Quiz scheduling and Round 2 Case submission.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name (as per Student ID) *
                  </label>
                  <input
                    type="text"
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Aarav Singhania"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Institutional / Personal Email *
                  </label>
                  <input
                    type="email"
                    value={leaderEmail}
                    onChange={e => setLeaderEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. aarav@iimb.ac.in"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (+91) *
                  </label>
                  <input
                    type="tel"
                    value={leaderMobile}
                    onChange={e => setLeaderMobile(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student ID / Enrollment Roll Number *
                  </label>
                  <input
                    type="text"
                    value={studentIdCardNumber}
                    onChange={e => setStudentIdCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. IIMB-2025-MBA-1044"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institute / University Name *
                  </label>
                  <input
                    type="text"
                    value={instituteName}
                    onChange={e => setInstituteName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Indian Institute of Management Bangalore (IIMB)"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Degree Programme *
                  </label>
                  <select
                    value={programme}
                    onChange={e => setProgramme(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Post Graduate Programme in Management (MBA)">MBA / PGDM</option>
                    <option value="Executive MBA / PGDM (Ex)">Executive MBA</option>
                    <option value="Bachelor of Business Administration (BBA)">BBA / BMS / BBM</option>
                    <option value="Integrated Programme in Management (IPM)">Integrated MBA / IPM</option>
                    <option value="Other Postgraduate Management Stream">Other Management Postgrad</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Year & Semester *
                  </label>
                  <select
                    value={yearSemester}
                    onChange={e => setYearSemester(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1st Year / Term 1-2">1st Year / Term 1-2</option>
                    <option value="2nd Year / Term 4">2nd Year / Term 4-6</option>
                    <option value="Final Year / Graduating Batch">Final Year / Graduating 2026</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 2: TEAM MEMBERS & REGIONAL HUB                      */}
          {/* ======================================================== */}
          {step === 2 && track === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span>Step 2: Team Identity & Member Roster</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                    3–4 Members Allowed
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Teams require a minimum of 3 and up to 4 verified management students. Cross-institutional teams are permitted.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Team Name *
                  </label>
                  <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. StratApex Consulting"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Round 3 Regional Hub *
                  </label>
                  <select
                    value={preferredHub}
                    onChange={e => setPreferredHub(e.target.value as RegionHubId)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {hubs.map(h => (
                      <option key={h.id} value={h.id}>
                        {h.name} — {h.city} ({h.hostInstitute})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Member Roster List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Additional Team Members (Members 2 to 4)
                  </h4>
                  <span className="text-xs text-slate-500 font-medium">
                    Leader is auto-included as Member #1
                  </span>
                </div>

                {members.map((member, idx) => (
                  <div key={idx} className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                      <span className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[10px]">
                          {idx + 2}
                        </span>
                        <span>Team Member #{idx + 2}</span>
                      </span>
                      {members.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setMembers(members.filter((_, i) => i !== idx))}
                          className="text-rose-500 hover:text-rose-600 text-xs font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Full Name</label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={e => {
                            const updated = [...members];
                            updated[idx].name = e.target.value;
                            setMembers(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100"
                          placeholder="Name"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Email</label>
                        <input
                          type="email"
                          value={member.email}
                          onChange={e => {
                            const updated = [...members];
                            updated[idx].email = e.target.value;
                            setMembers(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100"
                          placeholder="Email"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Mobile / Roll Number</label>
                        <input
                          type="text"
                          value={member.mobile}
                          onChange={e => {
                            const updated = [...members];
                            updated[idx].mobile = e.target.value;
                            setMembers(updated);
                          }}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-900 dark:text-slate-100"
                          placeholder="+91 98..."
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {members.length < 3 && (
                  <button
                    type="button"
                    onClick={() =>
                      setMembers([
                        ...members,
                        { name: '', email: '', mobile: '', collegeRollNo: '' },
                      ])
                    }
                    className="w-full py-2.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                  >
                    + Add 4th Team Member (Optional)
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 1 & 2: INSTITUTIONAL COHORT (SPOC / DEAN)           */}
          {/* ======================================================== */}
          {step === 1 && track === 'institute' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Institutional Bulk Cohort Enrollment</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  For Deans, Directors, and Faculty SPOCs registering student batches with institutional bulk subsidy rates.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Accredited B-School / Institute Name *
                  </label>
                  <input
                    type="text"
                    value={instName}
                    onChange={e => setInstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    placeholder="e.g. Faculty of Management Studies (FMS), Delhi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Code / AISHE ID *
                  </label>
                  <input
                    type="text"
                    value={instCode}
                    onChange={e => setInstCode(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    placeholder="e.g. FMS-DELHI-01"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    State & City *
                  </label>
                  <input
                    type="text"
                    value={`${instState}, ${instCity}`}
                    onChange={e => {
                      const [s, c] = e.target.value.split(',');
                      setInstState(s?.trim() || 'Delhi NCR');
                      setInstCity(c?.trim() || 'New Delhi');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    placeholder="Delhi NCR, New Delhi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty SPOC / Coordinator Name *
                  </label>
                  <input
                    type="text"
                    value={coordName}
                    onChange={e => setCoordName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    placeholder="Prof. Sanjeev Kaushik"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Official Institutional Email *
                  </label>
                  <input
                    type="email"
                    value={coordEmail}
                    onChange={e => setCoordEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    placeholder="sanjeev.kaushik@fms.edu"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsored Student Batch Quota *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[25, 50, 100].map(size => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setBatchSize(size)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          batchSize === size
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 font-black'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold'
                        }`}
                      >
                        <div className="text-lg">{size} Students</div>
                        <div className="text-[10px] text-slate-500">
                          {size === 25 ? '₹175/student' : size === 50 ? '₹150/student' : '₹120/student'}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 3: FEE BREAKDOWN & PAYMENT GATEWAY CHECKOUT         */}
          {/* ======================================================== */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>AIMA-ICRC Official Payment Gateway & Tax Escrow</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure 256-bit encrypted checkout with instant GST tax invoice issuance.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Payment Method Selection */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Select Payment Mode
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold">
                      Zero Surcharge
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_qr')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'upi_qr'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <QrCode className="w-5 h-5 text-blue-600" />
                      <span className="text-xs">UPI Dynamic QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_vpa')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'upi_vpa'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-indigo-600" />
                      <span className="text-xs">UPI App / VPA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'card'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <span className="text-xs">Card (Debit/Credit)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('netbanking')}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        paymentMethod === 'netbanking'
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400'
                      }`}
                    >
                      <Building className="w-5 h-5 text-emerald-600" />
                      <span className="text-xs">Net Banking</span>
                    </button>
                  </div>

                  {/* Payment Sub-Panel */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    {paymentMethod === 'upi_qr' && (
                      <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm shrink-0">
                          {/* Simulated QR Code */}
                          <div className="w-28 h-28 bg-slate-900 rounded-xl p-2 flex flex-col items-center justify-between">
                            <div className="w-full flex justify-between">
                              <div className="w-5 h-5 bg-white rounded-xs" />
                              <div className="w-5 h-5 bg-white rounded-xs" />
                            </div>
                            <div className="text-[9px] font-black text-white tracking-widest uppercase">
                              AIMA•UPI
                            </div>
                            <div className="w-full flex justify-between">
                              <div className="w-5 h-5 bg-white rounded-xs" />
                              <div className="w-5 h-5 bg-blue-500 rounded-xs animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-center sm:justify-start gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              Scan with any UPI App
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold">
                              Live QR
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            Supports Google Pay, PhonePe, Paytm, BHIM, Cred & Banking Apps.
                          </p>
                          <div className="pt-2">
                            <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-300">
                              VPA: aima.icrc.caseleague@icici
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'upi_vpa' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Enter your UPI Virtual Payment Address (VPA)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={upiId}
                            onChange={e => setUpiId(e.target.value)}
                            className="flex-1 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                            placeholder="username@okhdfcbank"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500">
                          A payment request notification of ₹{track === 'team' ? totalPayable : instTotal} will be sent to your UPI App.
                        </p>
                      </div>
                    )}

                    {paymentMethod === 'card' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-500 mb-1">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={e => setCardNumber(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">Expiry (MM/YY)</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={e => setCardExpiry(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-500 mb-1">CVV / CVC</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={e => setCardCvv(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {paymentMethod === 'netbanking' && (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Select Banking Gateway
                        </label>
                        <select
                          value={selectedBank}
                          onChange={e => setSelectedBank(e.target.value)}
                          className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-slate-100"
                        >
                          <option value="HDFC Bank">HDFC Bank NetBanking</option>
                          <option value="State Bank of India">State Bank of India (SBI)</option>
                          <option value="ICICI Bank">ICICI Bank Corporate & Retail</option>
                          <option value="Axis Bank">Axis Bank</option>
                          <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Coupon / Voucher Box */}
                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-2">
                    <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>Have an Institutional Voucher or Sponsor Waiver Code?</span>
                    </span>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value)}
                        placeholder="e.g. AIMA-100, TATA-EV-SPONSOR"
                        className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-500/30 text-xs font-mono uppercase font-bold text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Apply Code
                      </button>
                    </div>
                    {couponError && <p className="text-[11px] font-semibold text-rose-500">{couponError}</p>}
                    {discountApplied && (
                      <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>100% Sponsor Waiver Applied! Net Payable: ₹0</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: GST Ledger & Escrow Summary */}
                <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900 text-white space-y-4 shadow-xl border border-slate-800">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                      Fee Invoice Summary
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 font-bold">
                      AIMA-ICRC-GST-IN
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {track === 'team' ? (
                      <>
                        <div className="flex justify-between text-slate-300">
                          <span>Team Entry Fee ({totalTeamMembers} students @ ₹{baseRatePerStudent})</span>
                          <span className="font-mono font-bold">₹{rawSubtotal}</span>
                        </div>
                        {discountApplied && (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>Sponsor / Institutional Waiver</span>
                            <span className="font-mono">-₹{discountAmount}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-slate-400">
                          <span>Taxable Value (Subtotal)</span>
                          <span className="font-mono font-semibold">₹{subtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>CGST (9%)</span>
                          <span className="font-mono">₹{Math.round(gstAmount / 2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>SGST (9%)</span>
                          <span className="font-mono">₹{Math.round(gstAmount / 2)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between text-slate-300">
                          <span>Cohort Capacity ({batchSize} students @ ₹{instRatePerStudent})</span>
                          <span className="font-mono font-bold">₹{instSubtotal}</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>Institutional Bulk Discount (25% off)</span>
                          <span className="font-mono text-emerald-400">Applied</span>
                        </div>
                        <div className="flex justify-between text-slate-400">
                          <span>GST (18% Total)</span>
                          <span className="font-mono">₹{instGst}</span>
                        </div>
                      </>
                    )}

                    <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-black text-white">Total Amount</span>
                      <span className="text-2xl font-black text-sky-400 font-mono">
                        ₹{track === 'team' ? totalPayable : instTotal}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-400 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
                      <Lock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>SBI ePay / AIMA Central Escrow</span>
                    </div>
                    <p>
                      Round 1 Online Quiz Access Token and Round 2 Case Portal are unlocked instantly upon payment confirmation.
                    </p>
                  </div>

                  {/* Processing Status Banner */}
                  {isProcessingPayment && (
                    <div className="p-3.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-center space-y-2 animate-pulse">
                      <div className="text-xs font-bold text-blue-300">{processingStage}</div>
                      <div className="w-full bg-blue-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full w-2/3 animate-[pulse_1s_infinite]" />
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STEP 4: SUCCESS CONFIRMATION & ONBOARDING LAUNCHER       */}
          {/* ======================================================== */}
          {step === 4 && registrationResult && (
            <div className="space-y-6 text-center py-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 mx-auto flex items-center justify-center border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                  Payment & Registration Confirmed
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  Welcome to AIMA–ICRC India Case League 2026!
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto mt-1">
                  {track === 'team'
                    ? `Team "${registrationResult.team?.name}" is officially enrolled from ${registrationResult.leader?.instituteName}.`
                    : `Institutional cohort for "${registrationResult.institution?.name}" is successfully activated.`}
                </p>
              </div>

              {/* Transaction & Invite Credentials Card */}
              <div className="max-w-xl mx-auto p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-left space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Transaction ID:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {registrationResult.transactionId}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-medium">GST Tax Invoice:</span>
                    <div className="font-mono font-bold text-blue-600 dark:text-blue-400">
                      {registrationResult.invoiceNumber}
                    </div>
                  </div>

                  {track === 'team' ? (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 font-medium">Team Member Invite Code:</span>
                        <div className="font-mono font-black text-lg text-slate-900 dark:text-slate-100">
                          {registrationResult.team?.inviteCode}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(registrationResult.team?.inviteCode || '');
                          setCopiedInvite(true);
                          setTimeout(() => setCopiedInvite(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100"
                      >
                        {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedInvite ? 'Copied!' : 'Copy Code'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="sm:col-span-2 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                      <div>
                        <span className="text-slate-400 font-medium">Student Cohort Voucher:</span>
                        <div className="font-mono font-black text-lg text-indigo-600 dark:text-indigo-400">
                          {registrationResult.voucherCode}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(registrationResult.voucherCode || '');
                          setCopiedInvite(true);
                          setTimeout(() => setCopiedInvite(false), 2000);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:bg-slate-100"
                      >
                        {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedInvite ? 'Copied!' : 'Copy Voucher'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleLaunchDashboard}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Enter {track === 'team' ? 'Student Workspace' : 'Institute Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-sm cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer Navigation Bar (Steps 1 to 3) */}
        {step < 4 && (
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
            {step > 1 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div />
            )}

            {step === 1 && (
              <button
                onClick={() => setStep(track === 'team' ? 2 : 3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Continue to {track === 'team' ? 'Team Details' : 'Payment'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 2 && (
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <span>Proceed to Payment Gateway (₹{totalPayable})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleSimulatePayment}
                disabled={isProcessingPayment}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>
                  {discountApplied ? 'Complete Zero-Fee Registration' : `Authorize & Pay ₹${track === 'team' ? totalPayable : instTotal}`}
                </span>
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
