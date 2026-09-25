import React from 'react';
import {
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  CreditCard,
  FileCheck,
  FileText,
  Landmark,
  Mail,
  MapPin,
  Phone,
  Receipt,
  Shield,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useCompetition } from '../../context/CompetitionContext';

export const Footer: React.FC = () => {
  const { setActiveVerifierModal, setActiveSupportModal, setActiveView, activeView } = useCompetition();

  const isRegistrationPage = activeView === 'registration' || activeView === 'register' || activeView === 'bootcamp_registration';

  // Dedicated Official Footer for Certified CSR Leader Bootcamp (Direct Registration View)
  if (isRegistrationPage) {
    return (
      <footer className="bg-slate-950 text-slate-300 text-xs border-t border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
          
          {/* Top Brand & Event Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="h-11 px-3 rounded-xl bg-white flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                <img
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white uppercase tracking-wider block">
                  ALL INDIA MANAGEMENT ASSOCIATION (AIMA)
                </span>
                <span className="text-[11px] text-amber-400 font-semibold tracking-wide block">
                  Certified CSR Leader Bootcamp • 27–28 October 2026 • Official Secretariat
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                16 CME Contact Hours
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Section 135 Companies Act Mandate
              </span>
            </div>
          </div>

          {/* 4-Column Official Details Grid strictly from requirement docs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            {/* Col 1: Event Schedule & Venue */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Bootcamp Schedule & Venue</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <strong className="text-white">Dates:</strong> 27–28 October 2026
                </li>
                <li>
                  <strong className="text-white">Timing:</strong> 09:30 AM – 05:30 PM IST (2 Days)
                </li>
                <li className="flex items-start gap-1.5 pt-1">
                  <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Event Venue:</strong> AIMA, Lajpat Nagar, New Delhi
                  </span>
                </li>
                <li className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Secretariat HQ:</strong> Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 2: Official Contact & Coordinator */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>ICRC Secretariats &amp; Helpdesk</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <strong className="text-white">Dr. Anuja Pandey</strong>, Head, ICRC
                  <div className="text-[11px] text-slate-400">
                    <a href="mailto:apandey@aima.in" className="text-amber-300 hover:underline">
                      apandey@aima.in
                    </a>{' '}
                    • Extn: 709
                  </div>
                </li>
                <li>
                  <strong className="text-white">Shini James</strong>, Manager, ICRC
                  <div className="text-[11px] text-slate-400">
                    <a href="mailto:sjames@aima.in" className="text-amber-300 hover:underline">
                      sjames@aima.in
                    </a>{' '}
                    • <a href="tel:+919971479392" className="text-blue-300 hover:underline">+91 9971479392</a>
                  </div>
                </li>
                <li className="pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>General Support: </span>
                  <a href="mailto:caseresearchcentre@aima.in" className="text-blue-300 hover:underline font-semibold">
                    caseresearchcentre@aima.in
                  </a>
                  <div className="text-[10px] text-slate-500">011-47673000 / 49868399 Extn: 726, 709</div>
                </li>
              </ul>
            </div>

            {/* Col 3: Statutory Registration & Fee Terms */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Registration & Fee Terms</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Online registration & payment are preferred for faster processing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Please submit only one registration form, online or offline.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Registration is confirmed upon receipt and clearance of payment by AIMA.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Fees once paid are non-refundable. Nominee substitution permitted with prior intimation (48 hrs prior).</span>
                </li>
              </ul>
            </div>

            {/* Col 4: Official Tax & Bank Details for NEFT/RTGS */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>AIMA Statutory & Bank Details</span>
              </h4>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400">AIMA GSTIN: </span>
                  <span className="font-mono font-bold text-white">07AAATA1234F1Z5</span>
                </div>
                <div>
                  <span className="text-slate-400">SAC Code: </span>
                  <span className="font-mono font-bold text-amber-300">999293</span>
                  <span className="text-slate-400 text-[10px]"> (Training Services)</span>
                </div>
                <div className="pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Beneficiary: </span>
                  <span className="font-semibold text-white">All India Management Association</span>
                </div>
                <div>
                  <span className="text-slate-400">Bank: </span>
                  <span className="text-white">State Bank of India</span>
                </div>
                <div>
                  <span className="text-slate-400">Branch: </span>
                  <span className="text-white">Lodhi Road Branch, New Delhi</span>
                </div>
                <div>
                  <span className="text-slate-400">A/c No: </span>
                  <span className="font-mono font-bold text-white">100293847291</span>
                </div>
                <div>
                  <span className="text-slate-400">IFSC: </span>
                  <span className="font-mono font-bold text-amber-300">SBIN0000691</span>
                </div>
              </div>
            </div>

          </div>

          {/* Management Authorisation Undertaking Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-[11px] text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white uppercase tracking-wider">Management Authorisation & Data Dispatch: </strong>
              By submitting this form, you confirm that you are authorised to submit nominations on behalf of the sponsoring organisation and that the information provided is correct. All registration details and tax computations are securely captured and dispatched to Ms Ekta Nayyar (<span className="text-amber-300 font-semibold">enayyar@aima.in</span>) irrespective of payment status.
            </div>
          </div>

          {/* Bottom Legal Copyright */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 All India Management Association (AIMA). All rights reserved.
            </div>
            <div className="text-slate-400">
              Centre for Management Development • Certified CSR Leader Executive Credential
            </div>
          </div>

        </div>
      </footer>
    );
  }

  // Standard Website Footer for Competition Overview & Portals
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 transition-colors">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Accreditation */}
          <div className="lg:col-span-2 space-y-4">
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
                <span className="font-extrabold text-sm text-white uppercase tracking-wider block">
                  ALL INDIA MANAGEMENT ASSOCIATION
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block">
                  India Case Research Centre (ICRC)
                </span>
              </div>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The India Case League (ICL 2026) is India’s premier multi-stage business case simulation and leadership championship. Fostering data-driven decision-making, strategic problem-solving, and national economic impact across top B-schools and corporate hubs.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Viksit Bharat 2047 Alignment
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                AICTE / AACSB Benchmarked
              </span>
            </div>
          </div>

          {/* Col 2: Competition Stages */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Competition Stages
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 1: Online Business Quiz
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 2: PPT/PDF Case Deck
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 3: Regional Live Case
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 4: National Grand Finale
              </li>
            </ul>
          </div>

          {/* Col 3: Regional Hubs */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Regional Hubs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><strong className="text-slate-300">North:</strong> New Delhi (AIMA / FMS)</li>
              <li><strong className="text-slate-300">West:</strong> Mumbai (JBIMS / SPJIMR)</li>
              <li><strong className="text-slate-300">South:</strong> Bengaluru (IIMB)</li>
              <li><strong className="text-slate-300">East:</strong> Kolkata (IIMC / XLRI)</li>
              <li><strong className="text-slate-300">Central:</strong> Bhopal (IIFM / MANIT)</li>
            </ul>
          </div>

          {/* Col 4: Secretarial Contacts & Resources */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Secretariat Desk
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>caseleague@aima.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 11 24645100 / 43128100</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveView('requirements')}
                className="text-left text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Full SRS Requirements Spec & Traceability
              </button>
              <button
                onClick={() => setActiveVerifierModal(true)}
                className="text-left text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Digital Certificate Verifier
              </button>
              <button
                onClick={() => setActiveSupportModal(true)}
                className="text-left text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Helpdesk & War-Room Ticket
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 All India Management Association (AIMA) & India Case Research Centre (ICRC). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Plagiarism & Generative AI Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Confidentiality Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

