import React, { useRef, useState } from 'react';
import { CertificateRecord } from '../../types';
import { Award, CheckCircle2, Download, Printer, Shield, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCompetition } from '../../context/CompetitionContext';

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const { currentUser, quizPrograms, config } = useCompetition();
  const [isDownloading, setIsDownloading] = useState(false);
  const certContainerRef = useRef<HTMLDivElement>(null);

  const stage1Program = (quizPrograms || []).find(p => p.id === 'qp_case_comp_stage1_2026') || (quizPrograms || [])[0];
  const isResultsPublished = Boolean(
    stage1Program?.isResultsPublished ??
    (stage1Program as any)?.is_results_published ??
    config?.isResultsPublishedR1 ??
    false
  );

  React.useEffect(() => {
    if (certificate && (!currentUser || currentUser.role !== 'student' || isResultsPublished)) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0B4E94', '#C59B27', '#1E3A8A', '#D97706', '#10B981']
      });
    }
  }, [certificate, isResultsPublished, currentUser]);

  if (!certificate) return null;

  // Student safety gate: Must have results published to view
  if (currentUser?.role === 'student' && !isResultsPublished) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Results Under Official Review
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Official competition certificates will become accessible once Stage 1 Business Quiz results have been officially published by the AIMA Secretariat.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Determine certificate type & category
  const achievementUpper = (certificate.achievement || '').toUpperCase();
  const isAchievementTop1 =
    achievementUpper.includes('ACHIEVEMENT') ||
    achievementUpper.includes('TOP 1') ||
    achievementUpper.includes('WINNER');

  const isSelectionFinale =
    achievementUpper.includes('SELECTION') ||
    achievementUpper.includes('GRAND FINALE') ||
    achievementUpper.includes('FINALE');

  const certificateTypeTitle = isAchievementTop1
    ? 'CERTIFICATE OF ACHIEVEMENT - TOP 1 POSITION'
    : isSelectionFinale
      ? 'CERTIFICATE OF SELECTION - GRAND FINALE'
      : 'CERTIFICATE OF PARTICIPATION';

  const recipientDisplay = certificate.recipientName || certificate.teamName || 'Distinguished Participant';
  const teamDisplay = certificate.teamName || certificate.recipientName || 'Official Team';
  const instituteDisplay = certificate.institute || 'All India Management Association Partner Institution';
  const topPercent = certificate.selectionTopPercentage || 25;

  const memberNamesDisplay =
    certificate.memberNamesDisplay ||
    (Array.isArray(certificate.teamMembers) && certificate.teamMembers.length > 0
      ? certificate.teamMembers.join(', ')
      : '');

  const teamWithMembersDisplay = memberNamesDisplay && memberNamesDisplay !== teamDisplay
    ? `${teamDisplay} (${memberNamesDisplay})`
    : teamDisplay;

  const templatePath = isAchievementTop1
    ? '/certificates/cert_top1_signed.png'
    : isSelectionFinale
      ? '/certificates/cert_selection_signed.png'
      : '/certificates/cert_participation_signed.png';

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 1754x1241 Canvas PNG Generator using official signed certificate templates
  const handleDownloadPng = async () => {
    try {
      setIsDownloading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1754;
      canvas.height = 1241;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw authentic signed template (contains border, logos, gold titles, text, and 5 signatories)
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        baseImg.onload = () => resolve();
        baseImg.onerror = () => reject(new Error('Failed to load certificate template asset'));
        baseImg.src = templatePath;
      });

      ctx.drawImage(baseImg, 0, 0, 1754, 1241);

      // Helper to fit and draw dynamic text cleanly over the underline without truncation
      const drawField = (
        text: string,
        centerX: number,
        yBase: number,
        maxW: number,
        initialSize: number,
        color: string = '#0B4E94',
        weight: string = 'bold'
      ) => {
        let size = initialSize;
        ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif`;
        while (ctx.measureText(text).width > maxW && size > 10) {
          size -= 1;
          ctx.font = `${weight} ${size}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif`;
        }
        ctx.textAlign = 'center';
        ctx.fillStyle = color;
        ctx.fillText(text, centerX, yBase);
      };

      // 2. Render exact dynamic participant / team / institute details
      if (isAchievementTop1) {
        // Page 2: Achievement Top 1 Position
        drawField(teamWithMembersDisplay, 1092, 540, 560, 28, '#0B4E94', 'bold');
        drawField(instituteDisplay, 671, 592, 680, 24, '#1E293B', 'bold');
      } else if (isSelectionFinale) {
        // Page 3: Selection Grand Finale (Includes Team Name and Team Members)
        drawField(teamWithMembersDisplay, 1025, 540, 600, 28, '#0B4E94', 'bold');
        drawField(instituteDisplay, 727, 592, 680, 24, '#1E293B', 'bold');
      } else {
        // Page 1: Participation
        drawField(recipientDisplay, 877, 620, 770, 32, '#0B4E94', 'bold');
        drawField(instituteDisplay, 877, 674, 770, 26, '#1E293B', 'bold');
      }

      // 3. Discreet Digital Credential ID at bottom corner
      ctx.textAlign = 'right';
      ctx.font = '600 13px monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Official Credential ID: ${certificate.certificateNumber}`, 1670, 1180);

      // Trigger download
      const blob = await new Promise<Blob | null>(res => canvas.toBlob(res, 'image/png', 1.0));
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const safeName = (certificate.recipientName || certificate.teamName || 'AIMA_ICL_2026')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      link.download = `AIMA_ICL_2026_${certificateTypeTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${safeName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export certificate image:', err);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  // Helper to compute proportional font size and avoid clipping inside SVG
  const getAdaptiveSvgFontSize = (
    text: string,
    maxPixelWidth: number,
    baseSize: number,
    minSize: number = 10
  ): { fontSize: number; textLength?: number } => {
    if (!text) return { fontSize: baseSize };
    const charRatio = 0.56;
    const naturalWidth = text.length * baseSize * charRatio;
    if (naturalWidth <= maxPixelWidth) {
      return { fontSize: baseSize };
    }
    const fitted = Math.floor(maxPixelWidth / (text.length * charRatio));
    const finalSize = Math.max(minSize, fitted);
    const finalWidth = text.length * finalSize * charRatio;
    return {
      fontSize: finalSize,
      textLength: finalWidth > maxPixelWidth ? maxPixelWidth : undefined,
    };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      {/* Print Specific CSS to ensure clean A4 Landscape print without dialog headers */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            visibility: hidden !important;
            background: transparent !important;
          }
          #printable-certificate-wrapper, #printable-certificate-wrapper * {
            visibility: visible !important;
          }
          #printable-certificate-wrapper {
            position: fixed !important;
            left: 0 !important;
            top: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            margin: 0 !important;
            padding: 0 !important;
            background-color: white !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-5xl bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Action Header (Excluded in print) */}
        <div className="no-print flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-4 h-4" />
            </span>
            <div>
              <span className="text-xs sm:text-sm font-bold tracking-wide text-white block">
                Official India Case League 2026 Certificate
              </span>
              <span className="text-[10px] text-amber-400 font-medium">
                {certificateTypeTitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPng}
              disabled={isDownloading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
              title="Download high-resolution certificate image (1754x1241)"
            >
              <Download className={`w-3.5 h-3.5 ${isDownloading ? 'animate-bounce' : ''}`} />
              <span>{isDownloading ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors cursor-pointer"
              title="Print or save as high quality PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Card Canvas Area */}
        <div className="p-3 sm:p-6 bg-slate-950/60 flex justify-center overflow-x-auto">
          <div
            id="printable-certificate-wrapper"
            ref={certContainerRef}
            className="relative w-full max-w-4xl aspect-[1754/1241] bg-white rounded-lg shadow-2xl overflow-hidden select-text text-center"
            style={{
              backgroundImage: `url(${templatePath})`,
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* High-Precision SVG Dynamic Overlay with Zero-Clip Adaptive Text */}
            <svg
              viewBox="0 0 1754 1241"
              className="absolute inset-0 w-full h-full select-text"
              style={{ width: '100%', height: '100%' }}
            >
              {isAchievementTop1 ? (
                <>
                  {/* Top 1 Position: Team Name & Members (Line 1) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(teamWithMembersDisplay, 560, 28, 13);
                    return (
                      <text
                        x="1092"
                        y="540"
                        textAnchor="middle"
                        fill="#0B4E94"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {teamWithMembersDisplay}
                      </text>
                    );
                  })()}

                  {/* Top 1 Position: Institute Name (Line 2) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(instituteDisplay, 680, 24, 10);
                    return (
                      <text
                        x="671"
                        y="592"
                        textAnchor="middle"
                        fill="#1E293B"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {instituteDisplay}
                      </text>
                    );
                  })()}
                </>
              ) : isSelectionFinale ? (
                <>
                  {/* Selection Grand Finale: Team Name & Team Members (Line 1) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(teamWithMembersDisplay, 600, 28, 13);
                    return (
                      <text
                        x="1025"
                        y="540"
                        textAnchor="middle"
                        fill="#0B4E94"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {teamWithMembersDisplay}
                      </text>
                    );
                  })()}

                  {/* Selection Grand Finale: Institute Name (Line 2) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(instituteDisplay, 680, 24, 10);
                    return (
                      <text
                        x="727"
                        y="592"
                        textAnchor="middle"
                        fill="#1E293B"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {instituteDisplay}
                      </text>
                    );
                  })()}
                </>
              ) : (
                <>
                  {/* Participation: Recipient Name (Line 1) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(recipientDisplay, 770, 32, 14);
                    return (
                      <text
                        x="877"
                        y="620"
                        textAnchor="middle"
                        fill="#0B4E94"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {recipientDisplay}
                      </text>
                    );
                  })()}

                  {/* Participation: Institute Name (Line 2) */}
                  {(() => {
                    const metrics = getAdaptiveSvgFontSize(instituteDisplay, 770, 26, 11);
                    return (
                      <text
                        x="877"
                        y="674"
                        textAnchor="middle"
                        fill="#1E293B"
                        fontWeight="bold"
                        fontFamily='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif'
                        fontSize={metrics.fontSize}
                        textLength={metrics.textLength}
                        lengthAdjust={metrics.textLength ? 'spacingAndGlyphs' : undefined}
                      >
                        {instituteDisplay}
                      </text>
                    );
                  })()}
                </>
              )}

              {/* Discreet Digital Credential ID at bottom corner */}
              <text
                x="1670"
                y="1182"
                textAnchor="end"
                fill="#64748B"
                fontWeight="600"
                fontFamily="monospace"
                fontSize="13"
              >
                Official Credential ID: {certificate.certificateNumber}
              </text>
            </svg>
          </div>
        </div>

        {/* Modal Footer Verification Bar (Excluded in print) */}
        <div className="no-print px-4 sm:px-6 py-3 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>
              Verifiable Online ID:{' '}
              <span className="font-mono text-slate-200 select-all font-bold">
                {certificate.certificateNumber}
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official AIMA–ICRC & ICFAI Foundation for Higher Education Digital Credential</span>
          </div>
        </div>

      </div>
    </div>
  );
};
