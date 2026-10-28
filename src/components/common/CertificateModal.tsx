import React, { useRef, useState } from 'react';
import { CertificateRecord } from '../../types';
import { Award, CheckCircle2, Download, Printer, Shield, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CertificateModalProps {
  certificate: CertificateRecord | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ certificate, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const certContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (certificate) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#0B4E94', '#C59B27', '#1E3A8A', '#D97706', '#10B981']
      });
    }
  }, [certificate]);

  if (!certificate) return null;

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

  const handlePrint = () => {
    window.print();
  };

  // High-Resolution 1754x1241 Canvas PNG Generator matching the exact PDF template
  const handleDownloadPng = async () => {
    try {
      setIsDownloading(true);
      const canvas = document.createElement('canvas');
      canvas.width = 1754;
      canvas.height = 1241;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. Draw base blank template containing authentic border, logos, and 5 signatories
      const baseImg = new Image();
      baseImg.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        baseImg.onload = () => resolve();
        baseImg.onerror = () => reject(new Error('Failed to load certificate template asset'));
        baseImg.src = '/certificates/cert_blank_template.png';
      });

      ctx.drawImage(baseImg, 0, 0, 1754, 1241);

      // 2. Main Title: INDIA CASE LEAGUE 2026 (y ≈ 325)
      ctx.textAlign = 'center';
      ctx.fillStyle = '#0B4E94';
      ctx.font = '900 48px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif';
      ctx.fillText('INDIA CASE LEAGUE 2026', 1754 / 2, 325);

      // 3. Subtitle (y ≈ 435)
      ctx.fillStyle = '#C59B27';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif';
      ctx.fillText(certificateTypeTitle, 1754 / 2, 435);

      // Helper function to wrap text with bolding support
      const drawWrappedText = (
        textSegments: { text: string; bold: boolean }[],
        startX: number,
        startY: number,
        maxWidth: number,
        lineHeight: number
      ) => {
        // Flatten into words
        const words: { word: string; bold: boolean }[] = [];
        textSegments.forEach(seg => {
          const splitWords = seg.text.split(' ');
          splitWords.forEach((w, idx) => {
            if (w.length > 0 || idx < splitWords.length - 1) {
              words.push({ word: w, bold: seg.bold });
            }
          });
        });

        const lines: { word: string; bold: boolean }[][] = [];
        let currentLine: { word: string; bold: boolean }[] = [];
        let currentLineWidth = 0;

        for (const item of words) {
          ctx.font = item.bold
            ? 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            : 'normal 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          const wordWidth = ctx.measureText(item.word + ' ').width;

          if (currentLineWidth + wordWidth > maxWidth && currentLine.length > 0) {
            lines.push(currentLine);
            currentLine = [item];
            currentLineWidth = wordWidth;
          } else {
            currentLine.push(item);
            currentLineWidth += wordWidth;
          }
        }
        if (currentLine.length > 0) lines.push(currentLine);

        let curY = startY;
        for (const line of lines) {
          // Calculate total line width for center alignment
          let totalLineWidth = 0;
          for (const item of line) {
            ctx.font = item.bold
              ? 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              : 'normal 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            totalLineWidth += ctx.measureText(item.word + ' ').width;
          }

          let curX = startX - totalLineWidth / 2;
          for (const item of line) {
            ctx.font = item.bold
              ? 'bold 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              : 'normal 26px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
            ctx.fillStyle = '#1E293B';
            ctx.textAlign = 'left';
            ctx.fillText(item.word + ' ', curX, curY);
            curX += ctx.measureText(item.word + ' ').width;
          }
          curY += lineHeight;
        }
        return curY;
      };

      // 4. Render exact dynamic body paragraphs
      if (isAchievementTop1) {
        // Achievement Top 1
        const segments = [
          { text: 'This is to certify that the team ', bold: false },
          { text: teamDisplay, bold: true },
          { text: ' from ', bold: false },
          { text: instituteDisplay, bold: true },
          {
            text: ' has secured Top 1 position in the India Case League 2026, organised by the All India Management Association (AIMA)- India Case Research Centre, held on 29 October 2026 at ICFAI Foundation for Higher Education (IFHE), Karnataka.',
            bold: false,
          },
        ];
        drawWrappedText(segments, 1754 / 2, 570, 1340, 48);
      } else if (isSelectionFinale) {
        // Selection Grand Finale
        const para1 = [
          { text: 'This is to certify that ', bold: false },
          { text: teamDisplay, bold: true },
          { text: ' from ', bold: false },
          { text: instituteDisplay, bold: true },
          {
            text: ' has been selected for the Grand Finale of India Case League 2026, organised by the All India Management Association (AIMA), following their successful performance in the Regional Round.',
            bold: false,
          },
        ];
        const nextY = drawWrappedText(para1, 1754 / 2, 545, 1340, 44);

        const para2 = [
          { text: `The team is among the top ${topPercent}% of participating teams selected to advance to the Grand Finale, in recognition of their analytical skills, problem-solving abilities, and application of management concepts to real-world business challenges.`, bold: false },
        ];
        drawWrappedText(para2, 1754 / 2, nextY + 36, 1340, 44);
      } else {
        // Participation
        const segments = [
          { text: 'This is to certify that ', bold: false },
          { text: recipientDisplay, bold: true },
          { text: ' of ', bold: false },
          { text: instituteDisplay, bold: true },
          {
            text: ' has participated in the India Case League 2026, organised by the All India Management Association (AIMA) - India Case Research Centre, held on 29 October 2026 in ICFAI Foundation for Higher Education (IFHE), Karnataka.',
            bold: false,
          },
        ];
        drawWrappedText(segments, 1754 / 2, 570, 1340, 48);
      }

      // 5. Discreet Digital Credential ID at bottom corner
      ctx.textAlign = 'right';
      ctx.font = '600 13px monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`Official Credential ID: ${certificate.certificateNumber}`, 1680, 1195);

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
            className="relative w-full max-w-4xl aspect-[1754/1241] bg-white rounded-lg shadow-2xl overflow-hidden select-text text-center flex flex-col justify-between"
            style={{
              backgroundImage: 'url(/certificates/cert_blank_template.png)',
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {/* Top Spacing to preserve authentic header logos (AIMA, ICRC, ICFAI IFHE, IBS Bangalore) */}
            <div className="w-full" style={{ height: '22%' }} />

            {/* Central Dynamic Content Area */}
            <div className="w-full px-6 sm:px-12 md:px-16 flex flex-col items-center justify-center flex-1 my-auto">
              {/* Main Heading */}
              <h1
                className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-black uppercase tracking-wider text-[#0B4E94] leading-tight"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif' }}
              >
                INDIA CASE LEAGUE 2026
              </h1>

              {/* Subtitle */}
              <h2
                className="text-xs sm:text-base md:text-xl lg:text-[23px] font-bold uppercase tracking-wide text-[#C59B27] mt-2 sm:mt-3 mb-3 sm:mb-5"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Montserrat, sans-serif' }}
              >
                {certificateTypeTitle}
              </h2>

              {/* Exact Dynamic Body Copy */}
              <div className="text-[10px] sm:text-xs md:text-sm lg:text-[15.5px] leading-relaxed text-slate-800 max-w-3xl font-normal mx-auto">
                {isAchievementTop1 ? (
                  <p>
                    This is to certify that the team{' '}
                    <strong className="font-bold text-slate-950 underline decoration-[#C59B27]/40 decoration-2 underline-offset-4">
                      {teamDisplay}
                    </strong>{' '}
                    from{' '}
                    <strong className="font-bold text-slate-950">
                      {instituteDisplay}
                    </strong>{' '}
                    has secured Top 1 position in the India Case League 2026, organised by the All India Management
                    Association (AIMA)- India Case Research Centre, held on 29 October 2026 at ICFAI Foundation for
                    Higher Education (IFHE), Karnataka.
                  </p>
                ) : isSelectionFinale ? (
                  <div className="space-y-2 sm:space-y-3">
                    <p>
                      This is to certify that{' '}
                      <strong className="font-bold text-slate-950 underline decoration-[#C59B27]/40 decoration-2 underline-offset-4">
                        {teamDisplay}
                      </strong>{' '}
                      from{' '}
                      <strong className="font-bold text-slate-950">
                        {instituteDisplay}
                      </strong>{' '}
                      has been selected for the Grand Finale of India Case League 2026, organised by the All India
                      Management Association (AIMA), following their successful performance in the Regional Round.
                    </p>
                    <p className="text-[9.5px] sm:text-[11.5px] md:text-[13px] lg:text-[14.5px] text-slate-700">
                      The team is among the top <strong className="font-bold text-[#0B4E94]">{topPercent}%</strong> of participating
                      teams selected to advance to the Grand Finale, in recognition of their analytical skills, problem-solving
                      abilities, and application of management concepts to real-world business challenges.
                    </p>
                  </div>
                ) : (
                  <p>
                    This is to certify that{' '}
                    <strong className="font-bold text-slate-950 underline decoration-[#C59B27]/40 decoration-2 underline-offset-4">
                      {recipientDisplay}
                    </strong>{' '}
                    of{' '}
                    <strong className="font-bold text-slate-950">
                      {instituteDisplay}
                    </strong>{' '}
                    has participated in the India Case League 2026, organised by the All India Management
                    Association (AIMA) - India Case Research Centre, held on 29 October 2026 in ICFAI Foundation for
                    Higher Education (IFHE), Karnataka.
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Spacing to preserve authentic 5 Signatories in footer template */}
            <div className="w-full relative" style={{ height: '22%' }}>
              {/* Discreet Credential ID */}
              <div className="absolute bottom-2 right-4 text-[7px] sm:text-[9px] md:text-[10px] font-mono text-slate-400 select-all">
                ID: {certificate.certificateNumber}
              </div>
            </div>

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
