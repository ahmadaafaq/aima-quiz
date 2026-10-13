import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { useCompetition } from '../../context/CompetitionContext';
import {
  Lock,
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  UserCheck,
  FileText,
  Building2,
  ArrowRight,
  Cookie,
  Server,
  RefreshCw,
} from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  const { setActiveView } = useCompetition();

  const sections = [
    {
      id: 'scope',
      icon: ShieldCheck,
      color: 'text-blue-500',
      title: '1. Scope of Privacy Policy',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            This Privacy Policy applies to the official website of the <strong>All India Management Association (AIMA)</strong> located at <strong>www.aima.in</strong> and its authorized competitive examination portals.
          </p>
          <p>
            It governs the collection, processing, and handling of personally identifiable information obtained from users visiting or registering on the platform. This policy does not apply to external websites or services linked to or from AIMA&apos;s pages.
          </p>
        </div>
      ),
    },
    {
      id: 'collection',
      icon: UserCheck,
      color: 'text-emerald-500',
      title: '2. Information Collection & Use',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            While portions of the website can be browsed anonymously without revealing personal identities, participation in specific services—including event registrations, candidate testing, quiz championships (such as India Case League 2026), and membership programs—requires users to register and submit personal information.
          </p>
          <ul className="space-y-2 list-disc pl-5">
            <li>
              <strong>Information Submitted:</strong> Full name, institutional affiliation/college, contact phone number, valid email address, and academic identification.
            </li>
            <li>
              <strong>Purpose of Use:</strong> To issue participant authentication credentials, generate official admit cards, dispatch GST receipts/tax invoices, publish merit rankings, and issue authorized certificates.
            </li>
            <li>
              <strong>Correspondence Storage:</strong> Copies of communications, email support queries, and form submissions may be securely retained on AIMA servers for administrative records.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'minors',
      icon: Lock,
      color: 'text-amber-500',
      title: '3. Minors & Age of Consent',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Users submitting personal details must have attained the legal age of consent in their respective jurisdictions.
          </p>
          <p>
            For educational programs or e-learning modules involving minors who cannot legally grant consent independently, prior authorization from parents or designated academic institutions is required. Any information inadvertently submitted by unauthorized minors will be purged upon identification.
          </p>
        </div>
      ),
    },
    {
      id: 'cookies',
      icon: Cookie,
      color: 'text-purple-500',
      title: '4. Cookies & Usage Analytics',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            AIMA uses browser cookies to optimize site navigation, ensure session persistence during quizzes, and monitor aggregate user metrics.
          </p>
          <p>
            Information captured via cookies is anonymous and does not identify individual users unless they have explicitly logged in or voluntarily submitted information. Users may configure their browser settings to refuse cookies, though certain interactive features may experience reduced functionality.
          </p>
        </div>
      ),
    },
    {
      id: 'payments',
      icon: CreditCard,
      color: 'text-rose-500',
      title: '5. Third-Party Payment Gateways & Card Data Protection',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200">
            <strong>Zero Card Data Storage:</strong> AIMA strictly does not collect, capture, or store sensitive credit/debit card numbers, CVVs, or net banking passwords on its servers.
          </div>
          <p>
            All financial transactions for registration fees are processed through authorized, RBI-compliant third-party payment gateways. AIMA only retains transaction tracking numbers and payment realization status codes for reconciliation and issuing GST-compliant tax receipts.
          </p>
        </div>
      ),
    },
    {
      id: 'security',
      icon: Server,
      color: 'text-indigo-500',
      title: '6. Data Security Safeguards & Policy Updates',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            AIMA employs secure servers, technical encryption protocols, and administrative controls to protect against unauthorized access, alteration, or disclosure of collected data. However, as no electronic transmission over the internet can be guaranteed 100% invulnerable, users submit information at their own risk.
          </p>
          <p>
            <strong>Amendments:</strong> Due to evolving regulatory and technology standards, AIMA reserves the right to periodically update this Privacy Policy. Continued use of the platform constitutes acceptance of the latest published terms.
          </p>
        </div>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Privacy Policy"
      subtitle="Official data protection, collection practices, and user privacy framework for All India Management Association (AIMA)."
      badge="Official AIMA Privacy Policy"
      activeTab="privacy"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((sec) => {
            const Icon = sec.icon;
            return (
              <div
                key={sec.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
              >
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${sec.color} shrink-0`} />
                  <span>{sec.title}</span>
                </h2>
                {sec.content}
              </div>
            );
          })}
        </div>

        {/* Sidebar Info (Right Column - Sticky in Viewport) */}
        <div className="lg:col-span-1 h-full">
          <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>AIMA Privacy Standards</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Zero storage of credit card numbers or UPI PINs.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Encrypted communication &amp; secure servers.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Personal data used solely for educational administration.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Strict protection of minor participant information.</span>
                </li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-3 shadow-lg border border-slate-800 text-xs">
              <div className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>Secretariat Contact</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Management House, 14, Institutional Area, Lodhi Road, New Delhi – 110003, India.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                Source: <a href="https://www.aima.in/content/about-aima/privacy-policy/privacy-policy" target="_blank" rel="noreferrer" className="text-blue-400 underline">aima.in/privacy-policy</a>
              </div>
            </div>

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
