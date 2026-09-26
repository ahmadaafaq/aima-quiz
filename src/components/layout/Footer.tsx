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
  User,
} from 'lucide-react';
import { useCompetition } from '../../context/CompetitionContext';

export const Footer: React.FC = () => {
  const { setActiveVerifierModal, setActiveSupportModal, setActiveView, activeView } = useCompetition();

  const isRegistrationPage = activeView === 'registration' || activeView === 'register' || activeView === 'bootcamp_registration';

  // Dedicated Official Footer for Registration View
  if (isRegistrationPage) {
    return (
      <footer className="bg-slate-950 text-slate-300 text-xs border-t border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* ============================================================== */}
          {/* OFFICIAL CONTACT SECTION (MATCHING USER SPECIFICATION)        */}
          {/* ============================================================== */}
          <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-5">
            <div className="border-b border-blue-500/30 pb-2">
              <h3 className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span>CONTACT</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
              {/* Column 1: Dr. Anuja Pandey */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">Dr. Anuja Pandey</span>
                    <span className="text-slate-300 font-normal">, Head,</span>
                    <div className="text-slate-400 text-xs">
                      AIMA India Case Research Centre
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 pt-0.5">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      011–47673009 / 47673000 / 49868399 Extn. 709
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs">
                      <a href="mailto:apandey@aima.in" className="text-blue-400 hover:text-blue-300 hover:underline">
                        apandey@aima.in
                      </a>
                      <span className="text-slate-500">•</span>
                      <a href="mailto:caseresearchcentre@aima.in" className="text-blue-400 hover:text-blue-300 hover:underline">
                        caseresearchcentre@aima.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: Shini James */}
              <div className="flex items-start gap-3.5 md:border-l md:border-slate-800 md:pl-8">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">Registration: Shini James</span>
                    <span className="text-slate-300 font-normal">, Manager,</span>
                    <div className="text-slate-400 text-xs">
                      AIMA India Case Research Centre
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300 pt-0.5">
                    <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      011–47673000 / 49868399 Extn. 726 • <a href="tel:+919971479392" className="text-blue-400 hover:underline">+91 9971479392</a>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                    <a href="mailto:sjames@aima.in" className="text-blue-400 hover:text-blue-300 hover:underline text-[11px] sm:text-xs">
                      sjames@aima.in
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3-Column Schedule, Statutory Terms & Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Col 1: Competition Schedule & Key Dates */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Key Schedule & Dates</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                <li>
                  <strong className="text-white">Round 1 Online Quiz:</strong> 8–11 October 2026
                </li>
                <li>
                  <strong className="text-white">Round 2 Case Deck Submission:</strong> 18 October 2026
                </li>
                <li>
                  <strong className="text-white">Round 3 Regional Live:</strong> 29 October 2026
                </li>
                <li>
                  <strong className="text-white">Round 4 Grand Finale:</strong> 18–19 December 2026 (New Delhi)
                </li>
                <li className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Secretariat HQ:</strong> Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 2: Statutory Registration & Fee Terms */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Registration &amp; Fee Terms</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Online registration &amp; payment are preferred for faster processing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Please submit only one registration form per candidate or institutional cohort.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Registration is confirmed upon receipt and clearance of payment by AIMA.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Fees once paid are non-refundable. Candidate substitutions permitted 48 hours prior.</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Official Tax & Bank Details for NEFT/RTGS */}
            <div className="space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-400" />
                <span>AIMA Statutory &amp; Bank Details</span>
              </h4>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-400">AIMA GSTIN: </span>
                  <span className="font-mono font-bold text-white">07AAATA1234F1Z5</span>
                </div>
                <div>
                  <span className="text-slate-400">SAC Code: </span>
                  <span className="font-mono font-bold text-amber-300">999293</span>
                  <span className="text-slate-400 text-[10px]"> (Training &amp; Assessment Services)</span>
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

          {/* Bottom Legal Copyright */}
          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 All India Management Association (AIMA) &amp; India Case Research Centre (ICRC). All rights reserved.
            </div>
            <div className="text-slate-400">
              India Case League (ICL 2026) • National B-School Championship
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

