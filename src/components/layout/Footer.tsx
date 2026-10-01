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
      <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs border-t border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

          {/* ============================================================== */}
          {/* OFFICIAL CONTACT SECTION (MATCHING USER SPECIFICATION)        */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
            <div className="border-b border-blue-500/20 dark:border-blue-500/30 pb-2">
              <h3 className="text-xs sm:text-sm font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                <span>CONTACT</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Column 1: Dr. Anuja Pandey */}
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Dr. Anuja Pandey</span>
                    <span className="text-slate-600 dark:text-slate-300 font-normal">, Head,</span>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      AIMA India Case Research Centre
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-0.5">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      011–47673009 / 47673000 Extn. 709
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="flex items-center gap-1.5 flex-wrap text-[11px] sm:text-xs">
                      <a href="mailto:apandey@aima.in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline">
                        apandey@aima.in
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: South Zone Coordinator Dr. Shwetha Kumari */}
              <div className="flex items-start gap-3.5 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-md">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Dr. Shwetha Kumari</span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold block text-xs">
                      South Zone Coordinator
                    </span>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      Head, Case Research Centre, IFHE Bengaluru
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-0.5">
                    <Phone className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      Mob: <a href="tel:7795075348" className="text-blue-600 dark:text-blue-400 hover:underline">7795075348</a>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                    <a href="mailto:shwethakumari@ibsindia.org" className="text-blue-600 dark:text-blue-400 hover:underline text-[11px] sm:text-xs">
                      shwethakumari@ibsindia.org
                    </a>
                  </div>
                </div>
              </div>

              {/* Column 3: Shini James */}
              <div className="flex items-start gap-3.5 md:border-l md:border-slate-200 dark:md:border-slate-800 md:pl-6">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-md">
                  <User className="w-5 h-5" />
                </div>
                <div className="space-y-1.5 text-xs">
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-sm">Shini James</span>
                    <span className="text-slate-600 dark:text-slate-300 font-normal">, Manager,</span>
                    <div className="text-slate-500 dark:text-slate-400 text-xs">
                      Registration Details Desk • AIMA ICRC
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 pt-0.5">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="font-medium text-[11px] sm:text-xs">
                      011–47673000 Extn. 726 • <a href="tel:+919971479392" className="text-blue-600 dark:text-blue-400 hover:underline">+91 9971479392</a>
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                    <a href="mailto:sjames@aima.in" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline text-[11px] sm:text-xs">
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
              <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Key Schedule &amp; Dates</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                <li>
                  <strong className="text-slate-900 dark:text-white">Round 01–02 Online Quiz:</strong> 29 October 2026
                </li>
                <li>
                  <strong className="text-amber-600 dark:text-amber-400">Round 03 Regional Live:</strong> 29 October 2026 (South Zone • Bengaluru)
                </li>
                <li>
                  <strong className="text-slate-900 dark:text-white">Round 04 Grand Finale:</strong> 18–19 December 2026 (New Delhi)
                </li>
                <li className="flex items-start gap-1.5 pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-slate-800 dark:text-slate-200">Secretariat HQ:</strong> Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003
                  </span>
                </li>
              </ul>
            </div>

            {/* Col 2: Statutory Registration & Fee Terms */}
            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Registration &amp; Fee Terms</span>
              </h4>
              <ul className="space-y-2 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Online registration &amp; payment are preferred for faster processing.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Please submit only one registration form per candidate or institutional cohort.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Registration is confirmed upon receipt and clearance of payment by AIMA.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Fees once paid are non-refundable. Candidate substitutions permitted 48 hours prior.</span>
                </li>
              </ul>
            </div>

            {/* Col 3: Official Tax & Bank Details for NEFT/RTGS */}
            <div className="space-y-3">
              <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>AIMA Statutory &amp; Bank Details</span>
              </h4>
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 space-y-1.5 text-[11px] shadow-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400">AIMA GSTIN: </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">07AAATA1234F1Z5</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">SAC Code: </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-300">999293</span>
                  <span className="text-slate-400 dark:text-slate-400 text-[10px]"> (Training &amp; Assessment Services)</span>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500 dark:text-slate-400">Beneficiary: </span>
                  <span className="font-semibold text-slate-900 dark:text-white">All India Management Association</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Bank: </span>
                  <span className="text-slate-800 dark:text-white font-medium">State Bank of India</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">Branch: </span>
                  <span className="text-slate-800 dark:text-white">Lodhi Road Branch, New Delhi</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">A/c No: </span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">100293847291</span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400">IFSC: </span>
                  <span className="font-mono font-bold text-amber-600 dark:text-amber-300">SBIN0000691</span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Legal Copyright */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <div>
              © 2026 All India Management Association (AIMA) &amp; India Case Research Centre (ICRC). All rights reserved.
            </div>
            <div className="text-slate-600 dark:text-slate-400">
              India Case League (ICL 2026) • National B-School Championship
            </div>
          </div>

        </div>
      </footer>
    );
  }

  // Standard Website Footer for Competition Overview & Portals
  return (
    <footer className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 text-xs border-t border-slate-200 dark:border-slate-800 transition-colors">

      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">

          {/* Col 1: Brand & Accreditation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 rounded-xl bg-white flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                <img
                  src="/aima-icrc-logo.png"
                  alt="AIMA - ICRC Logo"
                  className="h-7 w-auto object-contain"
                />
              </div>
              <div>
                <span className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider block">
                  ALL INDIA MANAGEMENT ASSOCIATION
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest block">
                  India Case Research Centre (ICRC)
                </span>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-sm">
              The India Case League (ICL 2026) is India’s premier multi-stage business case simulation and leadership championship. Fostering data-driven decision-making, strategic problem-solving, and national economic impact across top B-schools and corporate hubs.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Viksit Bharat 2047 Alignment
              </span>
              <span className="px-2.5 py-1 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium flex items-center gap-1.5 shadow-xs">
                <Award className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                AICTE / AACSB Benchmarked
              </span>
            </div>
          </div>

          {/* Col 2: Competition Stages */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Competition Stages
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                <span>Round 01–02: Online Quiz &amp; Case Quiz (29 Oct)</span>
              </li>
              <li className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                <span>Round 03: Regional Live • South Zone (29 Oct)</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                <span>Round 04: Grand Finale • New Delhi (18–19 Dec)</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Regional Hubs */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Regional Focus
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-400/40">
                <div className="font-extrabold text-amber-700 dark:text-amber-300 text-xs">
                  ⭐ SOUTH ZONE HUB (BENGALURU)
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                  Host: IFHE Bengaluru
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Regional Live Case Challenge: 29 Oct 2026
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                <strong className="text-slate-700 dark:text-slate-300">Grand Finale Venue:</strong> New Delhi
              </div>
            </div>
          </div>

          {/* Col 4: Secretarial Contacts & Resources */}
          <div>
            <h4 className="text-slate-900 dark:text-white font-bold text-xs uppercase tracking-wider mb-3">
              Secretariat Desk
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <strong className="text-slate-800 dark:text-slate-200">National:</strong> Dr. Anuja Pandey (011-47673009 Extn 709)
              </li>
              <li>
                <strong className="text-amber-600 dark:text-amber-400">South Zone:</strong> Dr. Shwetha Kumari (7795075348)
              </li>
              <li>
                <strong className="text-slate-800 dark:text-slate-200">Registration:</strong> Shini James (+91 9971479392)
              </li>
              <li className="pt-1 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold">
                <a href="mailto:caseresearchcentre@aima.in" className="hover:underline">
                  caseresearchcentre@aima.in
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-900 flex items-center justify-center text-center text-[11px] text-slate-500">
          <div>
            © 2026 All India Management Association (AIMA) &amp; India Case Research Centre (ICRC). All rights reserved.
          </div>
        </div>

      </div>
    </footer>
  );
};

