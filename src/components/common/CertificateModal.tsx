import React from 'react';
import { CertificateRecord } from '../../types';
import { Award, CheckCircle2, Download, Printer, QrCode, Shield, X } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  React.useEffect(() => {
    if (certificate) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D97706', '#F59E0B', '#B45309', '#1E3A8A', '#10B981']
      });
    }
  }, [certificate]);

  if (!certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-500/30 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Action Header */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-amber-400">
            <Award className="w-4 h-4" />
            OFFICIAL AIMA-ICRC DIGITAL CREDENTIAL CERTIFICATE
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-md border border-slate-700 transition-colors cursor-pointer"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card Printable Canvas */}
        <div className="p-4 sm:p-8 bg-amber-50/20 dark:bg-slate-950 flex justify-center">
          <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border-8 border-double border-amber-700/60 dark:border-amber-500/50 p-6 sm:p-10 text-center shadow-xl rounded-lg overflow-hidden">
            
            {/* Corner Decorative Ornaments */}
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-amber-600 dark:border-amber-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-amber-600 dark:border-amber-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-amber-600 dark:border-amber-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-amber-600 dark:border-amber-400 pointer-events-none" />

            {/* Background Seal Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
              <Shield className="w-96 h-96 text-amber-900 dark:text-amber-300" />
            </div>

            {/* Top Brand Header */}
            <div className="flex items-center justify-between mb-4 border-b border-amber-200 dark:border-slate-800 pb-3">
              <div className="text-left">
                <div className="text-sm sm:text-base font-extrabold tracking-wider text-slate-900 dark:text-slate-100 uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                  ALL INDIA MANAGEMENT ASSOCIATION
                </div>
                <div className="text-[10px] sm:text-xs text-amber-700 dark:text-amber-400 font-semibold tracking-widest uppercase">
                  India Case Research Centre (ICRC)
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-700/60 rounded text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                VERIFIED CREDENTIAL
              </div>
            </div>

            {/* Title */}
            <div className="my-5">
              <div className="text-xs sm:text-sm font-semibold tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                Certificate of Excellence & Recognition
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-800 dark:text-amber-400 mt-1 uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                {certificate.achievement}
              </h2>
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
                INDIA CASE LEAGUE 2026 • NATIONAL BUSINESS CASE COMPETITION
              </div>
            </div>

            {/* Recipient Details */}
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 italic">
              This prestigious certificate is proudly conferred upon
            </p>
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 my-2 tracking-wide underline decoration-amber-500/40 decoration-2 underline-offset-8">
              {certificate.recipientName}
            </div>
            
            {certificate.teamName && (
              <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">
                Representing Team: <span className="text-amber-700 dark:text-amber-400 font-bold">{certificate.teamName}</span>
              </p>
            )}

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 max-w-lg mx-auto">
              From <span className="font-semibold text-slate-800 dark:text-slate-200">{certificate.institute}</span> for demonstrated strategic brilliance, analytical rigor, and exemplary case formulation.
            </p>

            {/* Bottom Verification & Signatures */}
            <div className="grid grid-cols-3 items-end mt-8 pt-6 border-t border-amber-200 dark:border-slate-800 gap-2">
              
              {/* QR Code & ID */}
              <div className="text-left flex flex-col items-start">
                <div className="p-1.5 bg-white border border-slate-300 rounded shadow-sm inline-block">
                  {/* SVG QR Code Simulation */}
                  <svg className="w-14 h-14 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h2v4h-2v-4zm2 2h2v2h-2v-2zm-6-2h2v2h-2v-2zm4-4h2v2h-2v-2z"/>
                  </svg>
                </div>
                <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400 mt-1">
                  ID: {certificate.certificateNumber}
                </div>
                <div className="text-[8px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Immutable Hash
                </div>
              </div>

              {/* Gold Medal Crest */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-amber-600 bg-amber-500/20 dark:bg-amber-400/20 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-inner">
                  <Award className="w-7 h-7" />
                </div>
                <div className="text-[9px] uppercase tracking-wider font-bold text-amber-800 dark:text-amber-400 mt-1">
                  OFFICIAL SEAL
                </div>
                <div className="text-[8px] text-slate-500">Date: {certificate.issueDate}</div>
              </div>

              {/* Authorized Signatory */}
              <div className="text-right flex flex-col items-end">
                <div className="font-serif italic text-base text-slate-800 dark:text-slate-200 border-b border-slate-400 dark:border-slate-600 pb-0.5 px-3">
                  Nikhil Sawhney
                </div>
                <div className="text-[10px] font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {certificate.authorizedSignatory}
                </div>
                <div className="text-[9px] text-slate-500 dark:text-slate-400 leading-tight">
                  {certificate.signatoryTitle}
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Verification Info Footer */}
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 dark:text-slate-400 gap-2">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-600" />
            <span>Verifiable online at: <span className="font-mono text-slate-800 dark:text-slate-200 select-all">{certificate.qrVerificationUrl}</span></span>
          </div>
          <div className="text-[11px]">
            Compliant with AIMA-ICRC National Academic Verification Standards
          </div>
        </div>

      </div>
    </div>
  );
};
