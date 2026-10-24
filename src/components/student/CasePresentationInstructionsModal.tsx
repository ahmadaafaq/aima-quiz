import React, { useState } from 'react';
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  Award,
  Users,
  CheckCircle2,
  Clock,
  Layers,
  Scale,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Building2,
  FileCheck2
} from 'lucide-react';
import {
  OFFICIAL_CASE_TRACKS,
  OFFICIAL_INSTRUCTION_DOCS,
  OFFICIAL_EVALUATION_RUBRIC,
  CaseTrack
} from '../../data/caseTracks';

interface CasePresentationInstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTrack?: CaseTrack;
}

export const CasePresentationInstructionsModal: React.FC<CasePresentationInstructionsModalProps> = ({
  isOpen,
  onClose,
  selectedTrack,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'questions' | 'slide_rules' | 'rubric' | 'offline_flow'>('overview');
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  const currentTrack = selectedTrack || OFFICIAL_CASE_TRACKS[1]; // default to Operations

  const handleDownloadTrigger = () => {
    const textContent = `================================================================================
AIMA-ICRC INDIA CASE LEAGUE 2026
OFFICIAL PARTICIPANT INSTRUCTIONS FOR CASE PRESENTATION
================================================================================

TRACK: ${currentTrack.name} (${currentTrack.badge})
TAGLINE: ${currentTrack.tagline}
COMPETENCIES TESTED: ${currentTrack.competenciesTested}

1. EXECUTIVE ROLES & SCENARIO
- Role 1: Head of Operations (Operations strategy, FDTL compliance, network resilience)
- Role 2: Chief Executive Officer (CEO) (Culture, governance, stakeholder trust)
- Structure: 10 Minutes presentation strictly timed + 5 Minutes Jury Q&A.

2. THE 3 FOCUS QUESTIONS
${currentTrack.focusQuestions.map(q => `[${q.code} - Weight: ${q.weight}%] ${q.title}\n${q.description}`).join('\n\n')}

3. SLIDE LIMITS & INTEGRITY RULES
- Maximum 8 Slides (Title + Executive Summary + Q1 + Q2 + Q3 + Financials + Governance & Roadmap + Appendix).
- Plagiarism & LLM/AI Hallucinations will lead to immediate disqualification.
- All operational numbers and calculations must be justifiable.

4. JURY BENCH EVALUATION RUBRIC (100 TOTAL POINTS)
${OFFICIAL_EVALUATION_RUBRIC.map(r => `- ${r.criterion} [${r.focusQuestion} - ${r.weight} pts]: ${r.description}`).join('\n')}

5. OFFLINE PROTOCOL AT AIMA VENUE
- Report 45 minutes prior to scheduled session time.
- Carry 3 printed hard copies for the Jury Bench and a USB drive with PPTX & PDF backup.
================================================================================`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AIMA_Case_Presentation_Instructions_${currentTrack.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-amber-500/10 via-blue-500/5 to-purple-500/10 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-600 text-white">
                OFFLINE CASE PRESENTATION
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                AIMA VENUE HALL
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                Official Secretariat Guidelines
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              Participant Instructions for Case Presentation
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Playing executive leadership roles before the Jury Bench at the AIMA offline venue.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Banner with Download Button */}
        <div className="px-6 py-3.5 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Document Reference:</strong> <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded text-[11px] font-mono font-bold">Participnat Instruction for Case presentation.docx</code>
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadTrigger}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Instructions Guide</span>
            </button>
          </div>
        </div>

        {downloadSuccess && (
          <div className="px-6 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Document download started! File: {OFFICIAL_INSTRUCTION_DOCS.participantInstructions.fileName}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 dark:border-slate-800 overflow-x-auto bg-slate-50 dark:bg-slate-900/40 py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            1. Role & Scenario
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'questions'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            2. The 3 Focus Questions
          </button>
          <button
            onClick={() => setActiveTab('slide_rules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'slide_rules'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            3. 12-Slide Constraints
          </button>
          <button
            onClick={() => setActiveTab('rubric')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'rubric'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            4. Official Jury Rubric
          </button>
          <button
            onClick={() => setActiveTab('offline_flow')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'offline_flow'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            5. Offline Venue & Scorecards
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-2">
                <span className="font-extrabold text-blue-800 dark:text-blue-300 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Baseline Context & Master Case
                </span>
                <p>
                  You or your team will submit and present one PowerPoint deck answering three focus questions for your chosen track. For Track 02 (Operations), teams analyze <strong>IndiGo: Restoring the On-Time Promise — Growth, Reliability and the Cost of Resilience</strong>. Read the case document and its annexures before you start; they are your factual baseline.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Your Executive Role Dual Mandate
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        CEO
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">
                        Chief Executive Officer (Willie Walsh)
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Owns the overall turnaround vision, brand positioning, organizational culture, the Board of Directors, and relations with the DGCA regulator and crew unions.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-xs">
                        OPS
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">
                        Head of Operations
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-400">
                      Owns crew planning and buffers, pilot rostering, network flight schedules, disruption recovery protocols, and operational KPIs (OTP, cancellation rate).
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-600 dark:text-slate-400 italic">
                  💡 <strong>Key Requirement:</strong> Your presentation deck must make clear which recommendations each role owns and how they collaborate cohesively.
                </div>
              </div>

              {/* Downloads Strip */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Official Secretariat Document Downloads
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <a
                    href={OFFICIAL_INSTRUCTION_DOCS.participantInstructions.fileUrl}
                    download={OFFICIAL_INSTRUCTION_DOCS.participantInstructions.fileName}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 flex items-center justify-between group transition-all"
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-[11px]">Participant Instructions</span>
                      <span className="text-[10px] text-slate-400">.docx • 17 KB</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href={OFFICIAL_INSTRUCTION_DOCS.commonInstructions.fileUrl}
                    download={OFFICIAL_INSTRUCTION_DOCS.commonInstructions.fileName}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 flex items-center justify-between group transition-all"
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-[11px]">Common Instructions</span>
                      <span className="text-[10px] text-slate-400">.docx • 18 KB</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  </a>

                  <a
                    href={OFFICIAL_INSTRUCTION_DOCS.masterCaseStudy.fileUrl}
                    download={OFFICIAL_INSTRUCTION_DOCS.masterCaseStudy.fileName}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-white dark:bg-slate-900 flex items-center justify-between group transition-all"
                  >
                    <div className="truncate mr-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block truncate text-[11px]">IndiGo Master Case</span>
                      <span className="text-[10px] text-slate-400">.docx • 53 KB</span>
                    </div>
                    <Download className="w-3.5 h-3.5 text-blue-600 shrink-0 group-hover:translate-y-0.5 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: THE 3 FOCUS QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs">
                <strong>Mandatory Labeling:</strong> Label each question clearly (<code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">Q1</code>, <code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">Q2</code>, <code className="font-mono font-bold bg-amber-200/60 dark:bg-amber-900/60 px-1 py-0.5 rounded">Q3</code>) on your slides so Jury members can easily locate your answers during evaluation.
              </div>

              <div className="space-y-4">
                {currentTrack.focusQuestions.map((q, idx) => (
                  <div
                    key={q.code}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-black text-xs">
                          {q.code}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {q.title}
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                        Weight: {q.weight}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      {q.description}
                    </p>

                    {idx === 0 && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Required Analytical Proofs:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Deconstruct failure across: People, Network, Systems, Leadership, and Governance.</li>
                          <li>Distinguish seasonal weather triggers from long-accumulating structural deficits.</li>
                          <li>Calculate the crew gap numerically based on the case annexure data.</li>
                        </ul>
                      </div>
                    )}

                    {idx === 1 && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Required Operational Blueprints:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>24-month resilient, FDTL-compliant operating model with pilot reserve sizing.</li>
                          <li>Disruption recovery protocols, schedule buffer design & fatigue risk management.</li>
                          <li>Cost of resilience quantification without forfeiting low-cost carrier (LCC) unit economics.</li>
                        </ul>
                      </div>
                    )}

                    {idx === 2 && (
                      <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 space-y-1">
                        <span className="font-semibold text-slate-700 dark:text-slate-300 block">Required Executive Roadmaps:</span>
                        <ul className="list-disc list-inside space-y-0.5">
                          <li>Culture, internal accountability, and transparent crisis-communication protocol.</li>
                          <li>Regulator and crew union alignment strategy.</li>
                          <li>Managing the 65% market share perception without triggering "monopoly fatigue".</li>
                          <li>Phased Board milestone roadmap with concrete review dates.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SLIDE CONSTRAINTS & RULES */}
          {activeTab === 'slide_rules' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 space-y-2">
                <span className="font-bold text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Strict Length & Appendix Constraints
                </span>
                <ul className="space-y-1 text-xs text-rose-900 dark:text-rose-200 list-disc list-inside">
                  <li><strong>Length:</strong> Exactly <strong>12 content slides</strong> answering the three focus questions.</li>
                  <li><strong>Cover Slide:</strong> Allowed (Team Name, Track, Member Names, Institute, Emails). Does not count toward the 12 slides.</li>
                  <li><strong>No Appendix Allowed:</strong> Submissions with appendices or exceeding 12 slides will receive mandatory point deductions by the Jury.</li>
                  <li><strong>Slide 2 Mandatory Rule:</strong> <strong>Slide 2 must be an Executive Summary</strong> of your diagnosis, plan, and top three KPI targets.</li>
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Data & Analysis Rules
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>• <strong>Use only case and annexures:</strong> Restrict strictly to the data shared; do not use outside data or news reports.</li>
                    <li>• <strong>State every assumption:</strong> Explicitly state estimates (e.g., "Assumed gross margin: 60%") with justification.</li>
                    <li>• <strong>FDTL Compliance:</strong> Plans depending on breaching or relaxing pilot rest rules will be disqualified.</li>
                    <li>• <strong>Show concrete numbers:</strong> Quantified targets, costs, and timelines score significantly higher.</li>
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-blue-600" />
                    Deliverable Format & Naming
                  </h4>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li>• <strong>File Format:</strong> PowerPoint (.pptx) or PDF (.pdf).</li>
                    <li>• <strong>Presentation:</strong> Readable without voice-over.</li>
                    <li>• <strong>File Naming Convention:</strong> <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-[10px]">TeamName_IndiGoCase.pptx</code> or <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded font-mono font-bold text-[10px]">TeamName_Track_IndiaCaseLeague.pptx</code>.</li>
                    <li>• <strong>Team Size:</strong> Solo (1) or team of up to 4 participants from the same institute.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: RUBRIC */}
          {activeTab === 'rubric' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-slate-500">
                Official weighting table from <code className="font-mono text-slate-700 dark:text-slate-300">Participnat Instruction for Case presentation.docx</code>. The Jury rewards clear, quantified, and consistent thinking.
              </p>

              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-extrabold uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="p-3">Evaluation Criterion</th>
                      <th className="p-3 text-center">Focus Q</th>
                      <th className="p-3 text-right">Official Weight</th>
                      <th className="p-3">Scoring Expectation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {OFFICIAL_EVALUATION_RUBRIC.map((item) => (
                      <tr key={item.criterion} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-900 dark:text-slate-100">{item.criterion}</td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                            {item.focusQuestion}
                          </span>
                        </td>
                        <td className="p-3 text-right font-black text-blue-600 dark:text-blue-400 text-sm">
                          {item.weight}%
                        </td>
                        <td className="p-3 text-[11px] text-slate-500 dark:text-slate-400">
                          {item.description}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-100/60 dark:bg-slate-800/40 font-bold">
                      <td className="p-3 text-slate-900 dark:text-slate-100 uppercase">Total Weighted Score</td>
                      <td className="p-3 text-center text-slate-400">—</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-black text-sm">100%</td>
                      <td className="p-3 text-[11px] text-slate-500">Evaluated on physical scorecards by Jury Bench</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                ⚠️ <strong>Deductions:</strong> Points are deducted for unanswered questions, factual errors against the case, missing sources, unstated assumptions, and decks exceeding 12 content slides.
              </div>
            </div>
          )}

          {/* TAB 5: OFFLINE VENUE & SCORECARD FLOW */}
          {activeTab === 'offline_flow' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-blue-500/10 border border-amber-500/30 space-y-2">
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  Round 2 Happens Offline at AIMA Venue Hall
                </span>
                <p className="text-xs text-slate-700 dark:text-slate-300">
                  Round 2 is not an online upload test. Qualified participants and teams select their functional track, prepare their 12-slide strategy presentation, and deliver their case defense in person inside the <strong>AIMA Hall / Regional Venue</strong> directly before certified Jury members.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Step-by-Step Offline Evaluation Procedure
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Track Selection
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Participant confirms 1 of 6 tracks in the portal to unlock presentation slot and Jury assignment.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-600 text-white font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Live Offline Defense
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Teams present 12 slides and face cross-examination from the industry Jury Bench in the AIMA hall.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs">
                      Admin Scorecard Entry
                    </h5>
                    <p className="text-[11px] text-slate-500">
                      Admin collects physical scorecards from the Jury, feeds them in the Admin Panel, and finalizes winners.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <strong>Integrity & Audit:</strong> Physical Jury scorecards are verified against attendance logs and signed by the panel convener before entry into the administrative ledger.
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500">
            AIMA India Case League 2026 • All India Management Association
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTrigger}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Instructions Guide</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
