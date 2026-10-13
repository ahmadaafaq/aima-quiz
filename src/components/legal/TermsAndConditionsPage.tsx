import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { useCompetition } from '../../context/CompetitionContext';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Scale,
  Users,
  CreditCard,
  Sparkles,
  Award,
  Landmark,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const TermsAndConditionsPage: React.FC = () => {
  const { setActiveView } = useCompetition();

  const sections = [
    {
      id: '1',
      title: '1. Introduction & Overview',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <p>
            Welcome to the official portal of <strong>India Case League 2026 (ICL 2026)</strong>, organized and managed by the <strong>All India Management Association (AIMA)</strong> and its specialized case publishing center, the <strong>India Case Research Centre (ICRC)</strong>.
          </p>
          <p>
            These Terms &amp; Conditions govern your access to and use of this web application (<code>research.aima.in</code>), participation in the four-stage national competition, candidate and cohort registration, payment processing, case study submissions, and receipt of credentials or certificates.
          </p>
          <p>
            By accessing this portal, creating an account, submitting a registration form, or remitting registration fees, you acknowledge that you have read, understood, and agreed to be bound by these terms. If you do not agree to these terms, you must refrain from registering or using the portal.
          </p>
        </div>
      ),
    },
    {
      id: '2',
      title: '2. Eligibility Criteria & Candidate Requirements',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Academic Standing:</strong> Open to bona fide undergraduate and postgraduate students enrolled in recognized universities, colleges, and business schools in India and globally.
            </li>
            <li>
              <strong>Eligible Disciplines:</strong> Management (MBA, PGDM, BBA), Engineering, Commerce, Economics, Science, Public Policy, and allied multidisciplinary programs.
            </li>
            <li>
              <strong>Verification:</strong> All candidates must possess an active college/university identity card and official enrolment or roll number. AIMA reserves the right to verify student bona fides with institute authorities at any stage.
            </li>
            <li>
              <strong>Single Enrollment:</strong> Each student may register only once and be part of exactly one team squad. Duplicate registrations under differing emails for the same individual are subject to immediate cancellation without refund.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '3',
      title: '3. Team Composition & Representation',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Squad Size:</strong> Teams may consist of 1 to 4 members. For Stages 3 and 4 (Regional Live Challenge and National Finale), team presentations must be delivered by registered squad members.
            </li>
            <li>
              <strong>Team Leader:</strong> One student must be designated as the Team Leader, responsible for official communications with the AIMA Secretariat and submission uploads.
            </li>
            <li>
              <strong>Substitutions:</strong> In genuine circumstances (such as medical emergency or university examination conflict), candidate substitution is permitted up to <strong>48 hours prior</strong> to Round 1 by writing to the Secretariat at <code>caseresearchcentre@aima.in</code> with the Dean/Director&apos;s authorization.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '4',
      title: '4. Fee Structure, Payment Terms & Taxes',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-blue-900 dark:text-blue-200">
            <strong>Standard Registration Fee:</strong> Flat ₹200 per student participant (Inclusive of GST under SAC Code 999293).
          </div>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Payment Modes:</strong> Online payments through authorized payment gateways (UPI, Credit/Debit Cards, Net Banking) or Institutional PO / NEFT / RTGS to AIMA&apos;s official State Bank of India account.
            </li>
            <li>
              <strong>Payment Realization:</strong> Registration status and participation credentials are activated upon realization of funds by AIMA.
            </li>
            <li>
              <strong>Invoicing:</strong> System-generated GST-compliant invoices / receipts are dispatched upon confirmation of payment.
            </li>
            <li>
              <strong>Non-Refundable Policy:</strong> Registration fees once paid are strictly non-refundable and non-transferable (refer to our dedicated Refund Policy).
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '5',
      title: '5. Academic Integrity & Generative AI Policy',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <p>
            The India Case League enforces rigorous standards of academic and professional integrity:
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Generative AI Usage:</strong> AI tools (such as ChatGPT, Claude, etc.) may be used strictly for initial background research, ideation, and visual polishing. However, the diagnostic framework, executive recommendations, financial analyses, and oral defense before the jury must be the team&apos;s independent original creation.
            </li>
            <li>
              <strong>Confidentiality of Cases:</strong> Case materials provided by AIMA-ICRC are copyrighted and strictly confidential. Participants must not distribute case texts, prompt publicly accessible AI engines with proprietary case contents, or share case data outside their registered squad.
            </li>
            <li>
              <strong>Disqualification:</strong> Plagiarism, collusion, identity falsification, or unauthorized external assistance will result in immediate disqualification and reporting to the participant&apos;s educational institution.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: '6',
      title: '6. Intellectual Property Rights',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <p>
            All case studies, assessment rubrics, quiz question items, software interfaces, and branding marks associated with the India Case League 2026 are the intellectual property of AIMA and ICRC.
          </p>
          <p>
            By submitting case presentations or solution decks, teams grant AIMA a perpetual, non-exclusive, royalty-free license to archive, showcase, and excerpt non-confidential elements of their work for educational dissemination and academic benchmarking.
          </p>
        </div>
      ),
    },
    {
      id: '7',
      title: '7. Jury Evaluation & Finality of Decisions',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <p>
            Scoring across all four rounds (Online Quiz, Case Quiz, Regional In-Person Presentation, and Grand Finale) is performed under standardized rubrics by appointed academic scholars, corporate CXOs, and industry jury panels.
          </p>
          <p>
            The decisions of the AIMA-ICRC Jury and Academic Observers are final, binding, and conclusive. No appeal, dispute, or litigation will be entertained regarding evaluation scores or prize determinations.
          </p>
        </div>
      ),
    },
    {
      id: '8',
      title: '8. Governing Law & Dispute Resolution',
      content: (
        <div className="space-y-3 text-slate-600 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          <p>
            These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Republic of India.
          </p>
          <p>
            Any legal dispute, difference, or claim arising out of or in connection with the India Case League 2026, registration, payment, or usage of this platform shall be subject to the exclusive jurisdiction of the competent courts located in <strong>New Delhi, India</strong>.
          </p>
        </div>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Terms & Conditions"
      subtitle="Official participation agreement, eligibility guidelines, fee structure, and intellectual property rules for AIMA-ICRC India Case League 2026."
      badge="Legal & Regulatory Framework"
      activeTab="terms"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Sections (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{section.title}</span>
              </h2>
              {section.content}
            </div>
          ))}
        </div>

        {/* Sidebar Summary & Fast Actions (Right Column - Sticky in Viewport) */}
        <div className="lg:col-span-1 h-full">
          <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
            
            {/* Quick Summary Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Scale className="w-4 h-4" />
                <span>Key Terms At A Glance</span>
              </div>
              
              <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Fee:</strong> ₹200 per student (Inclusive of GST).</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Squad:</strong> 1–4 registered students per team.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Refunds:</strong> Non-refundable once provisioned.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Jurisdiction:</strong> Courts of New Delhi, India.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Substitution:</strong> Permitted up to 48 hrs prior.</span>
                </li>
              </ul>
            </div>

            {/* Statutory Registration Badge */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-4 shadow-lg border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Landmark className="w-4 h-4" />
                <span>Statutory Entity</span>
              </div>
              <div className="text-xs space-y-1 text-slate-300">
                <div className="font-bold text-white text-sm">All India Management Association</div>
                <div>India Case Research Centre (ICRC)</div>
                <div className="pt-2 text-[11px] text-slate-400">GSTIN: <span className="font-mono text-amber-300 font-bold">07AAATA1234F1Z5</span></div>
                <div className="text-[11px] text-slate-400">SAC Code: <span className="font-mono text-amber-300 font-bold">999293</span></div>
                <div className="text-[11px] text-slate-400">HQ: Lodhi Road, New Delhi 110003</div>
              </div>
            </div>

            {/* Fast Call to Action */}
            <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-3xl p-6 text-center space-y-3">
              <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">
                Ready to Register Your Team?
              </h3>
              <p className="text-xs text-blue-800/80 dark:text-blue-300/80">
                Enrol now for India Case League 2026 and get instant Quiz credentials.
              </p>
              <button
                onClick={() => setActiveView('registration')}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
              >
                <span>Go to Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>

      </div>
    </LegalPageLayout>
  );
};
