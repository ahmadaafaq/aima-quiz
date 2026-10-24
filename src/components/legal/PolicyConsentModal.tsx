import React, { useState, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import {
  ShieldCheck,
  Check,
  X,
  AlertCircle,
  FileText,
  Lock,
  AlertTriangle,
} from 'lucide-react';

interface PolicyConsentModalProps {
  forceOpen?: boolean;
  onConsentChange?: (consent: boolean) => void;
}

export const PolicyConsentModal: React.FC<PolicyConsentModalProps> = ({
  forceOpen,
  onConsentChange,
}) => {
  const { activeView, setActiveView } = useCompetition();
  const [isOpen, setIsOpen] = useState(false);
  const [showDeclinedNotice, setShowDeclinedNotice] = useState(false);

  // Suppress modal on Admin portal, login screens, and authenticated candidate/partner dashboards
  const isExcludedView = () => {
    const excludedViews = [
      'admin',
      'participant_login',
      'login',
      'student',
      'institute',
      'evaluator',
      'regional_hub',
      'corporate',
    ];
    if (excludedViews.includes(activeView)) return true;

    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (
        path.startsWith('/admin') ||
        path.startsWith('/login') ||
        path.startsWith('/participant_login') ||
        path.startsWith('/participant-login') ||
        path.startsWith('/student') ||
        path.startsWith('/institute') ||
        path.startsWith('/jury') ||
        path.startsWith('/evaluator') ||
        path.startsWith('/hub') ||
        path.startsWith('/regional_hub') ||
        path.startsWith('/regional-hub') ||
        path.startsWith('/corporate')
      ) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    if (isExcludedView()) {
      setIsOpen(false);
      return;
    }

    const saved = sessionStorage.getItem('aima_legal_consent');
    if (saved === 'yes') {
      setIsOpen(false);
    } else {
      // First time visiting or undecided in this session: show notifier popup
      setIsOpen(true);
    }
  }, [activeView]);

  useEffect(() => {
    const handleOpen = () => {
      if (isExcludedView()) return;
      setShowDeclinedNotice(false);
      setIsOpen(true);
    };
    window.addEventListener('open_policy_consent', handleOpen);
    return () => window.removeEventListener('open_policy_consent', handleOpen);
  }, [activeView]);

  useEffect(() => {
    if (forceOpen && !isExcludedView()) {
      setIsOpen(true);
    }
  }, [forceOpen, activeView]);

  const handleAccept = () => {
    sessionStorage.setItem('aima_legal_consent', 'yes');
    sessionStorage.setItem('aima_legal_consent_timestamp', new Date().toISOString());
    setShowDeclinedNotice(false);
    onConsentChange?.(true);
    setIsOpen(false);
  };

  const handleDecline = () => {
    sessionStorage.setItem('aima_legal_consent', 'no');
    setShowDeclinedNotice(true);
    onConsentChange?.(false);
  };

  if (!isOpen || isExcludedView()) {
    return null;
  }

  return (
    <aside
      aria-label="Policy Consent Notification"
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] max-w-[420px] w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-5 duration-300 fade-in"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 space-y-3.5 ring-1 ring-black/5 dark:ring-white/10 text-slate-900 dark:text-slate-100 font-sans">
        
        {/* Notifier Header: Small Brand Badge + Dismiss */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Policy Consent
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer transition-colors"
            title="Dismiss notifier"
            aria-label="Close notifier"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Notifier Body Text */}
        <p className="text-xs sm:text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          I have read and understood the Disclaimer and Privacy Policy and agreed to the terms &amp; conditions of the same?
        </p>

        {/* Inline Quick Links */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap pt-0.5">
          <button
            type="button"
            onClick={() => setActiveView('disclaimer')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Disclaimer</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setActiveView('privacy_policy')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <Lock className="w-3 h-3" />
            <span>Privacy Policy</span>
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setActiveView('terms')}
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            <span>Terms</span>
          </button>
        </div>

        {/* Declined Warning if 'No' clicked */}
        {showDeclinedNotice && (
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <span>Consent is required to participate in official AIMA competitions and registrations.</span>
          </div>
        )}

        {/* Action Buttons: Yes / No */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            id="policy-consent-no"
            onClick={handleDecline}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            No
          </button>

          <button
            type="button"
            id="policy-consent-yes"
            onClick={handleAccept}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-sm shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Yes</span>
          </button>
        </div>

      </div>
    </aside>
  );
};
