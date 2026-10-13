import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { useCompetition } from '../../context/CompetitionContext';
import {
  RefreshCw,
  AlertOctagon,
  CheckCircle2,
  Clock,
  Phone,
  Mail,
  ArrowRight,
  ShieldCheck,
  FileText,
  UserCheck,
} from 'lucide-react';

export const RefundPolicyPage: React.FC = () => {
  const { setActiveView } = useCompetition();

  return (
    <LegalPageLayout
      title="Refund & Cancellation Policy"
      subtitle="Official fee remittance, non-refundable criteria, candidate substitution guidelines, and event cancellation policies for AIMA-ICRC India Case League 2026."
      badge="Financial Compliance & Whitelisting"
      activeTab="refund"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Important Notice Callout */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-3">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-extrabold text-sm uppercase tracking-wider">
              <AlertOctagon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>Core Policy Notice: Strictly Non-Refundable Fee</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              Registration fees paid for the <strong>AIMA-ICRC India Case League 2026</strong> (₹200 per student participant / institutional cohort fee) are <strong>strictly non-refundable and non-transferable</strong> once registration is successfully submitted and participant login credentials / proforma tax invoices are issued.
            </p>
          </div>

          {/* Section 1: Rationale for Non-Refundable Policy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span>1. Basis of Non-Refundable Terms</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                The India Case League is a high-volume, multi-stage national championship with fixed operational allocations. Upon completion of payment:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Individual participant quiz logins, access to proctoring infrastructure, and national server seats are automatically provisioned.
                </li>
                <li>
                  Proprietary case studies, pedagogical toolkits, and preparatory materials are released to the candidate.
                </li>
                <li>
                  Statutory GST invoices under SAC Code 999293 are filed and registered with taxation authorities.
                </li>
              </ul>
              <p>
                Therefore, voluntary withdrawal, schedule clashes, academic commitments, or change of mind by the participant or institution shall not entitle the registrant to any refund of fees paid.
              </p>
            </div>
          </div>

          {/* Section 2: Candidate Substitution Policy */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" />
              <span>2. Candidate Substitution Policy (48-Hour Window)</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Recognizing unavoidable academic scheduling conflicts or medical emergencies, AIMA permits <strong>candidate substitution without additional charge</strong>:
              </p>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="font-bold text-slate-900 dark:text-white text-xs">
                  Substitution Procedure:
                </div>
                <ul className="space-y-1.5 list-disc pl-5 text-xs">
                  <li>
                    Requests must be submitted in writing by the Team Leader or Faculty Coordinator at least <strong>48 hours prior to Round 1 (Online Quiz)</strong>.
                  </li>
                  <li>
                    Email the official request to <code>caseresearchcentre@aima.in</code> and <code>sjames@aima.in</code>.
                  </li>
                  <li>
                    Include the Registration Reference Number, departing student details, and the replacement candidate&apos;s full name, email, phone number, and college enrolment card copy.
                  </li>
                  <li>
                    The Secretariat will update the team roster and issue updated login credentials.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Event Cancellation by Organizers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-500" />
              <span>3. Exceptions & Event Cancellation by AIMA</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                In the highly improbable circumstance that the India Case League 2026 is cancelled entirely by AIMA without an alternate or rescheduled date:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  All registered participants and nominating institutions shall be entitled to a <strong>100% full refund</strong> of registration fees paid.
                </li>
                <li>
                  Refunds will be credited directly to the original payment source (credit/debit card, UPI account, or originating bank account) within <strong>7 to 10 working days</strong> from the official announcement date.
                </li>
                <li>
                  No claim for additional compensation, consequential damages, travel reimbursement, or preparation expenses will be entertained.
                </li>
              </ul>
            </div>
          </div>

          {/* Section 4: Duplicate or Erroneous Transactions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              <span>4. Duplicate or Erroneous Payment Debits</span>
            </h2>
            <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                If due to network disruption or payment gateway technical error, your bank account or card is debited more than once for a single registration:
              </p>
              <ul className="space-y-2 list-disc pl-5">
                <li>
                  Please write to our finance desk at <code>caseresearchcentre@aima.in</code> with the transaction reference numbers and bank debit SMS / receipt.
                </li>
                <li>
                  Upon reconciliation with our payment gateway partner, the excess amount will be refunded to your original payment instrument within <strong>5 to 7 business days</strong>.
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* Sidebar Helpdesk & Contact (Right Column - Sticky in Viewport) */}
        <div className="lg:col-span-1 h-full">
          <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
            
            {/* Refund & Invoicing Support Desk */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Phone className="w-4 h-4" />
                <span>Refund &amp; Payment Support</span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For any queries regarding payment status, proforma invoices, candidate substitution, or duplicate charge reconciliation:
              </p>

              <div className="space-y-3 pt-2 text-xs border-t border-slate-100 dark:border-slate-800">
                <div>
                  <strong className="block text-slate-900 dark:text-white font-bold">Shini James</strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Manager, Registration Desk</span>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 pt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <a href="tel:+919971479392" className="hover:underline font-bold">+91 9971479392</a>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <Mail className="w-3.5 h-3.5" />
                    <a href="mailto:sjames@aima.in" className="hover:underline">sjames@aima.in</a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <strong className="block text-slate-900 dark:text-white font-bold">Dr. Anuja Pandey</strong>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">Head, India Case Research Centre</span>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                    011–47673009 Extn. 709
                  </div>
                  <div className="text-[11px] text-blue-600 dark:text-blue-400">
                    <a href="mailto:apandey@aima.in" className="hover:underline">apandey@aima.in</a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
                  <strong>Hours:</strong> Mon–Fri, 9:00 AM – 5:30 PM IST
                </div>
              </div>
            </div>

            {/* Policy Checklist */}
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 text-xs">
              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Policy Summary</span>
              </div>
              <ul className="space-y-2 text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Fees: ₹200 per student (Non-refundable).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Substitution: Permitted 48 hours prior.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Duplicate charge: Refund in 5-7 days.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Event cancellation: 100% refund in 7-10 days.</span>
                </li>
              </ul>
            </div>

            {/* Link to Registration */}
            <button
              onClick={() => setActiveView('registration')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <span>Proceed to Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>
    </LegalPageLayout>
  );
};
