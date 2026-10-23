import React, { useEffect } from 'react';
import { CompetitionProvider, useCompetition } from './context/CompetitionContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { PublicHome } from './components/public/PublicHome';
import { StudentDashboard } from './components/student/StudentDashboard';
import { InstitutePortal } from './components/institute/InstitutePortal';
import { EvaluatorDashboard } from './components/evaluator/EvaluatorDashboard';
import { RegionalHubPortal } from './components/hub/RegionalHubPortal';
import { CorporatePartnerPortal } from './components/corporate/CorporatePartnerPortal';
import { AdminControlCenter } from './components/admin/AdminControlCenter';
import { RequirementsDoc } from './components/requirements/RequirementsDoc';
import { CertificateModal } from './components/common/CertificateModal';
import { CertificateVerifier } from './components/common/CertificateVerifier';
import { SupportModal } from './components/support/SupportModal';
import { ChatAssistant } from './components/chat/ChatAssistant';
import { UnifiedRegistrationModal } from './components/public/UnifiedRegistrationModal';
import { RegistrationPage } from './components/registration/RegistrationPage';
import { ParticipantLoginPage } from './components/auth/ParticipantLoginPage';
import { TermsAndConditionsPage } from './components/legal/TermsAndConditionsPage';
import { RefundPolicyPage } from './components/legal/RefundPolicyPage';
import { DisclaimerPage } from './components/legal/DisclaimerPage';
import { PrivacyPolicyPage } from './components/legal/PrivacyPolicyPage';
import { ContactUsPage } from './components/legal/ContactUsPage';
import { PolicyConsentModal } from './components/legal/PolicyConsentModal';
import { PaymentReturnListener } from './components/payment/PaymentReturnListener';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const AppContent: React.FC = () => {
  const { activeView, isQuizActive, activeCertificateModal, setActiveCertificateModal, showRegistrationModal, setShowRegistrationModal, registrationModalTrack } = useCompetition();

  useEffect(() => {
    document.title = 'AIMA-ICRC India Case League 2026';
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  }, [activeView]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'registration':
      case 'register':
      case 'bootcamp_registration':
        return <RegistrationPage />;
      case 'participant_login':
      case 'login':
        return <ParticipantLoginPage />;
      case 'terms':
      case 'terms_conditions':
        return <TermsAndConditionsPage />;
      case 'refund_policy':
      case 'refund':
        return <RefundPolicyPage />;
      case 'disclaimer':
      case 'disclaimers':
        return <DisclaimerPage />;
      case 'privacy_policy':
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'contact_us':
      case 'contact':
        return <ContactUsPage />;
      case 'student':
        return <StudentDashboard />;
      case 'institute':
        return <InstitutePortal />;
      case 'evaluator':
        return <EvaluatorDashboard />;
      case 'regional_hub':
        return <RegionalHubPortal />;
      case 'corporate':
        return <CorporatePartnerPortal />;
      case 'admin':
        return <AdminControlCenter />;
      case 'requirements':
      case 'req_doc':
        return <RequirementsDoc />;
      case 'public':
      default:
        return <PublicHome />;
    }
  };

  const isLiveSite =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'research.aima.in' ||
      window.location.hostname.endsWith('.research.aima.in')) &&
    !new URLSearchParams(window.location.search).get('demo');

  const isRegistrationPage =
    activeView === 'registration' ||
    activeView === 'register' ||
    activeView === 'bootcamp_registration';

  const isLegalPage =
    activeView === 'terms' ||
    activeView === 'terms_conditions' ||
    activeView === 'refund_policy' ||
    activeView === 'refund' ||
    activeView === 'disclaimer' ||
    activeView === 'disclaimers' ||
    activeView === 'privacy_policy' ||
    activeView === 'privacy' ||
    activeView === 'contact_us' ||
    activeView === 'contact';

  const isPublicOrRegistration =
    activeView === 'public' ||
    isRegistrationPage;

  // On live production (research.aima.in), hide navbar on public / registration / legal pages.
  // When taking quiz (isQuizActive), hide navbar and footer completely for zero-distraction fullscreen lockdown.
  const hideNavbar = isQuizActive || isLegalPage || (isLiveSite && isPublicOrRegistration);
  const hideFooter = isQuizActive;

  const isExcludedFromPolicyModal =
    isQuizActive ||
    activeView === 'admin' ||
    activeView === 'participant_login' ||
    activeView === 'login' ||
    activeView === 'student' ||
    activeView === 'institute' ||
    activeView === 'evaluator' ||
    activeView === 'regional_hub' ||
    activeView === 'corporate';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-700 dark:selection:text-amber-300">
      {/* Top Sticky Header: Hidden during quiz lockdown or on research.aima.in live site */}
      {!hideNavbar && <Navbar />}

      {/* Main Routed Content */}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Page View">
          {renderActiveView()}
        </ErrorBoundary>
      </main>

      {/* Global Modals & Dialogs (suppressed during quiz session) */}
      {!isQuizActive && (
        <>
          <UnifiedRegistrationModal
            isOpen={showRegistrationModal}
            onClose={() => setShowRegistrationModal(false)}
            initialTrack={registrationModalTrack}
          />
          <CertificateModal
            certificate={activeCertificateModal}
            onClose={() => setActiveCertificateModal(null)}
          />
          <CertificateVerifier />
          <SupportModal />
          {!isExcludedFromPolicyModal && <PolicyConsentModal />}
          <PaymentReturnListener />
        </>
      )}

      {/* Bottom Footer (suppressed during quiz session) */}
      {!hideFooter && <Footer />}
    </div>
  );
};

export default function App() {
  return (
    <CompetitionProvider>
      <AppContent />
    </CompetitionProvider>
  );
}
