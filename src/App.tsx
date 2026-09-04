import React from 'react';
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

const AppContent: React.FC = () => {
  const { activeView, activeCertificateModal, setActiveCertificateModal, showRegistrationModal, setShowRegistrationModal, registrationModalTrack } = useCompetition();

  const renderActiveView = () => {
    switch (activeView) {
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-amber-500/20 selection:text-amber-700 dark:selection:text-amber-300">
      {/* Top Sticky Header */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        {renderActiveView()}
      </main>

      {/* Global Modals & Dialogs & AI Chatbot */}
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
      <ChatAssistant />

      {/* Bottom Footer */}
      <Footer />
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
