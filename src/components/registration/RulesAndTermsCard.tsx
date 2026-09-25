import React, { useState } from 'react';
import {
  FileText,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Building2,
  Landmark,
  Phone,
  Mail,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';

interface RulesAndTermsCardProps {
  managementConfirmed: boolean;
  onToggleManagement: (val: boolean) => void;
  termsAccepted: boolean;
  onToggleTerms: (val: boolean) => void;
  dpdpConsentAccepted: boolean;
  onToggleDpdpConsent: (val: boolean) => void;
  regMode?: 'individual' | 'institute';
}

export const RulesAndTermsCard: React.FC<RulesAndTermsCardProps> = ({
  managementConfirmed,
  onToggleManagement,
  termsAccepted,
  onToggleTerms,
  dpdpConsentAccepted,
  onToggleDpdpConsent,
  regMode = 'individual',
}) => {
  const [expanded, setExpanded] = useState<boolean>(false);
  const [showDpdpDetails, setShowDpdpDetails] = useState<boolean>(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Registration, Fee Terms &amp; DPDP Act Compliance
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Official AIMA rules &amp; statutory personal data protection disclosures for Certified CSR Leader Bootcamp
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
        >
          <span>{expanded ? 'Collapse Rules' : 'Expand Rules'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Important Highlight Box for PSUs & Govt Bodies */}
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
              <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Special Provision for PSUs, Govt Bodies &amp; Corporates</span>
            </div>
            <p className="text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
              Upon initiating this form, your registration is immediately captured and dispatched to <strong>Ms Ekta Nayyar (enayyar@aima.in)</strong>. Payment is not mandatory upfront for submission—organisations requiring invoice-first approval can generate a formal AIMA Proforma Invoice with Bank NEFT/RTGS details and PO tracking for subsequent clearance.
            </p>
          </div>

          {/* Verbatim REGISTRATION & FEE TERMS from Client Email */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Official Terms &amp; Guidelines (Verbatim)</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Online registration and payment:</strong> Online registration and payment are preferred for faster processing of application. For Offline Registration Form, contact <strong>Ms Ekta Nayyar, AIMA | enayyar@aima.in | +91 11 47673000 Extn: 732</strong>.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Single submission:</strong> Please submit only one registration form, online or offline.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Fee structure:</strong> Fee is based on the number of nominees, as per Section 3. Preferential fees apply for larger nominations.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Confirmation condition:</strong> Registration is confirmed upon receipt and clearance of payment by AIMA.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Refunds &amp; substitution:</strong> Fees once paid are non-refundable. Nominee substitution is permitted with prior intimation to AIMA, preferably 48 hours before the Bootcamp.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-500 font-bold">•</span>
                <span>
                  <strong>Support &amp; Invoicing inquiries:</strong> For invoicing, registration or any clarification: <strong>Ms Ekta Nayyar, AIMA | enayyar@aima.in | +91 11 47673000 Extn: 732</strong>.
                </span>
              </li>
            </ul>
          </div>

          {/* Statutory DPDP Act 2023 Notice Container */}
          <div className="bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl p-5 border border-indigo-200 dark:border-indigo-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200 uppercase tracking-wider flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Statutory Notice under Digital Personal Data Protection (DPDP) Act, 2023</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDpdpDetails(!showDpdpDetails)}
                className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 flex items-center gap-1 cursor-pointer"
              >
                <span>{showDpdpDetails ? 'Hide Legal Disclosures' : 'View Full DPDP Disclosures'}</span>
                {showDpdpDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <p className="text-xs text-indigo-900/90 dark:text-indigo-300 leading-relaxed">
              Pursuant to <strong>Section 5 of the Digital Personal Data Protection Act, 2023 (DPDP Act 2023)</strong>, All India Management Association (AIMA) acts as the Data Fiduciary. The personal data collected through this registration form (Name, Designation, Organisation, Official Address, Pin Code, Mobile Number, Email Address, and Tax Identifiers) is processed solely for the specific purposes of processing your nomination, cohort accreditation, issuing official Certified CSR Leader credentials, event logistics, and statutory GST taxation records.
            </p>

            {showDpdpDetails && (
              <div className="mt-3 pt-3 border-t border-indigo-200/80 dark:border-indigo-800/60 space-y-2.5 text-xs text-indigo-950 dark:text-indigo-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-white/70 dark:bg-slate-800/70 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                    <strong className="block text-indigo-900 dark:text-indigo-300 font-bold mb-1">
                      1. Specified Purposes of Processing:
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <li>Enrolment and cohort seating for the Certified CSR Leader Bootcamp (27-28 Oct 2026).</li>
                      <li>Issuance and digital verification of the official AIMA Certified CSR Leader Certificate.</li>
                      <li>Statutory tax compliance under CGST/SGST/IGST Act (SAC: 999293) and official invoice generation.</li>
                      <li>Dispatch of pre-read case studies, schedules, and venue access passes.</li>
                    </ul>
                  </div>

                  <div className="bg-white/70 dark:bg-slate-800/70 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900">
                    <strong className="block text-indigo-900 dark:text-indigo-300 font-bold mb-1">
                      2. Rights of Data Principals (Sec. 11, 12, 13):
                    </strong>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-700 dark:text-slate-300">
                      <li><strong>Right to Access:</strong> Summary of personal data processed and identities of processing entities.</li>
                      <li><strong>Right to Correction &amp; Erasure:</strong> Rectification of outdated contact information or post-training deletion as per statutory audit rules.</li>
                      <li><strong>Right to Grievance Redressal:</strong> Dedicated AIMA Grievance Officer resolution within statutory timeframes.</li>
                      <li><strong>Right to Nominate:</strong> Designation of a representative in case of incapacity.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-white/90 dark:bg-slate-800/90 p-3 rounded-xl border border-indigo-200 dark:border-indigo-800 text-[11px] text-slate-700 dark:text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-indigo-900 dark:text-indigo-300">AIMA Designated Grievance Officer: </span>
                    Ms. Ekta Nayyar, AIMA | Management House, 14 Institutional Area, Lodhi Road, New Delhi - 110003
                  </div>
                  <div className="font-semibold text-indigo-700 dark:text-indigo-400">
                    Email: enayyar@aima.in • Phone: +91 11 47673000 Extn: 732
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mandatory Checkboxes */}
      <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        {/* DPDP Act 2023 Consent (Mandatory) */}
        <label className="flex items-start gap-3 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border-2 border-indigo-200 dark:border-indigo-800/80 cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-950/60 transition-colors">
          <input
            type="checkbox"
            checked={dpdpConsentAccepted}
            onChange={(e) => onToggleDpdpConsent(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 focus:ring-2 border-indigo-300 dark:border-indigo-700 cursor-pointer"
          />
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
            <span className="font-extrabold text-indigo-950 dark:text-indigo-300">
              CONSENT UNDER DIGITAL PERSONAL DATA PROTECTION (DPDP) ACT, 2023 (Mandatory):
            </span>{' '}
            I hereby give free, specific, informed, unconditional, and unambiguous affirmative consent to All India Management Association (AIMA) to collect, process, and retain the personal data provided in this form strictly for the administration of the Certified CSR Leader Bootcamp, cohort certification, statutory GST invoicing, and official correspondence in compliance with the Digital Personal Data Protection Act, 2023. I understand that I / nominated participants have the right to access, rectify, or withdraw this consent at any time by contacting AIMA at enayyar@aima.in.
          </div>
        </label>

        {/* Management / Participant Undertaking */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors">
          <input
            type="checkbox"
            checked={managementConfirmed}
            onChange={(e) => onToggleManagement(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <div className="text-xs text-slate-800 dark:text-slate-200 leading-snug">
            <span className="font-bold text-amber-900 dark:text-amber-300">
              {regMode === 'individual' ? 'PARTICIPANT UNDERTAKING (Mandatory):' : 'MANAGEMENT & SPONSOR AUTHORISATION (Mandatory):'}
            </span>{' '}
            {regMode === 'individual'
              ? 'By submitting this registration, I confirm that all personal and academic details provided are accurate and that I am a bonafide candidate/student.'
              : 'By submitting this form, I confirm that I am authorised by the institution to register and nominate these participants on behalf of the organisation.'}
          </div>
        </label>

        {/* Fee Terms Acceptance */}
        <label className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
          <input
            type="checkbox"
            checked={termsAccepted}
            onChange={(e) => onToggleTerms(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 focus:ring-2 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <div className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
            <span className="font-semibold text-slate-900 dark:text-white">Acceptance of Registration Terms:</span>{' '}
            I agree to the AIMA fee terms, 48-hour substitution timeline, and clearance provisions.
          </div>
        </label>
      </div>
    </div>
  );
};

