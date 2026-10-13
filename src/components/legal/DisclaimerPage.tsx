import React from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import { useCompetition } from '../../context/CompetitionContext';
import {
  AlertTriangle,
  Globe,
  ExternalLink,
  MessageSquareQuote,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Building2,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const DisclaimerPage: React.FC = () => {
  const { setActiveView } = useCompetition();

  const sections = [
    {
      id: 'general',
      icon: Globe,
      color: 'text-blue-500',
      title: '1. General Website Information & Good Faith Publication',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            All the information on this website is published in good faith and for general information purpose only. <strong>www.aima.in</strong> does not make any warranties about the completeness, reliability and accuracy of this information.
          </p>
          <p>
            The information provided is for general information or educational purposes and is not a substitute for professional advice. Any action you take upon the information you find on this website is strictly at your own risk. <strong>All India Management Association (AIMA)</strong> will not be liable for any losses and/or damages in connection with the use of our website.
          </p>
        </div>
      ),
    },
    {
      id: 'external-links',
      icon: ExternalLink,
      color: 'text-amber-500',
      title: '2. Hyperlinks & External Websites Disclaimer',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            From our website, you can visit other websites by following hyperlinks to such external sites. While we strive to provide only quality links to useful and ethical websites, we have no control over the content and nature of these sites.
          </p>
          <p>
            These links to other websites do not imply a recommendation for all the content found on these sites. We don&apos;t warrant, endorse, guarantee or assume responsibility for the accuracy or reliability of any information or product offered on such third party websites, banners, or advertising.
          </p>
          <p>
            Site owners and content may change without notice and may occur before we have the opportunity to remove a link which may have gone &apos;bad&apos;.
          </p>
        </div>
      ),
    },
    {
      id: 'testimonials',
      icon: MessageSquareQuote,
      color: 'text-purple-500',
      title: '3. Testimonials & Individual User Experiences',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            The site may contain testimonials by users. These testimonials reflect the real-life experiences and opinions of such users. However, the experiences are personal and may not necessarily be representative of all users nor indicative of standards on the touchstone of best standards prevalent in the industry.
          </p>
          <p>
            Individual user experiences may vary, and we don&apos;t represent that all users shall have the same experiences.
          </p>
        </div>
      ),
    },
    {
      id: 'third-party-policies',
      icon: ShieldCheck,
      color: 'text-emerald-500',
      title: '4. External Privacy Policies & Terms of Service',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            Please be also aware that when you leave our website, other sites may have different privacy policies and terms which are beyond our control.
          </p>
          <p>
            Please be sure to check the Privacy Policies of these sites as well as their &quot;Terms of Service&quot; before engaging in any business or uploading any information.
          </p>
        </div>
      ),
    },
    {
      id: 'case-studies',
      icon: BookOpen,
      color: 'text-indigo-500',
      title: '5. Academic Simulation & Case Challenge Pedagogical Disclaimer',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <p>
            All case studies, managerial scenarios, datasets, and organizational dilemmas utilized throughout the <strong>India Case League 2026</strong> are authored strictly for educational simulation and pedagogical evaluation.
          </p>
          <p>
            References to actual corporations, brands, or executive personalities illustrate business concepts and do not constitute corporate endorsements, employment commitments, or audit assessments of the companies mentioned.
          </p>
        </div>
      ),
    },
    {
      id: 'consent',
      icon: CheckCircle2,
      color: 'text-emerald-600',
      title: '6. User Consent & Updates',
      content: (
        <div className="space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200">
            <strong>Consent Clause:</strong> By using our website, you hereby consent to our disclaimer and agree to its terms.
          </div>
          <p>
            <strong>Updates &amp; Amendments:</strong> Should we update, amend or make any changes to this document, those changes will be prominently posted on this page.
          </p>
        </div>
      ),
    },
  ];

  return (
    <LegalPageLayout
      title="Disclaimer"
      subtitle="Official website disclaimer for All India Management Association (AIMA) and the AIMA-ICRC India Case League 2026."
      badge="Official AIMA Disclaimer"
      activeTab="disclaimer"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Disclaimers (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          {sections.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
              >
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                  <Icon className={`w-5 h-5 ${item.color} shrink-0`} />
                  <span>{item.title}</span>
                </h2>
                {item.content}
              </div>
            );
          })}
        </div>

        {/* Sidebar Context & Verification (Right Column - Sticky in Viewport) */}
        <div className="lg:col-span-1 h-full">
          <div className="lg:sticky lg:top-24 space-y-6 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto pr-1">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Important User Notice</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                By accessing <strong>www.aima.in</strong> and participating in the competition, you agree that AIMA shall not be liable for any external third-party links or user actions taken on general educational content.
              </p>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 space-y-3 shadow-lg border border-slate-800 text-xs">
              <div className="font-bold text-amber-400 text-xs uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span>All India Management Association</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Management House, 14, Institutional Area, Lodhi Road, New Delhi – 110003, India.
              </p>
              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800">
                Source: <a href="https://www.aima.in/content/about-aima/disclaimer/disclaimer" target="_blank" rel="noreferrer" className="text-blue-400 underline">aima.in/disclaimer</a>
              </div>
            </div>

            <button
              onClick={() => setActiveView('registration')}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
            >
              <span>Candidate Registration</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>
    </LegalPageLayout>
  );
};
