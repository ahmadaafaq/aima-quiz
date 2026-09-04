import React from 'react';
import { Award, Building, Download, ExternalLink, FileText, Globe, Mail, MapPin, Phone, ShieldCheck, Trophy } from 'lucide-react';
import { useCompetition } from '../../context/CompetitionContext';

export const Footer: React.FC = () => {
  const { setActiveVerifierModal, setActiveSupportModal, setActiveView } = useCompetition();

  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-800 transition-colors">
      
      {/* Main Footer Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          
          {/* Col 1: Brand & Accreditation */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 px-2.5 rounded-xl bg-white flex items-center justify-center border border-slate-700 shadow-sm shrink-0">
                <img
                  src="https://www.aima.in/img/logo.png"
                  alt="AIMA Logo"
                  className="h-7 w-auto object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white uppercase tracking-wider block">
                  ALL INDIA MANAGEMENT ASSOCIATION
                </span>
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-widest block">
                  India Case Research Centre (ICRC)
                </span>
              </div>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              The India Case League (ICL 2026) is India’s premier multi-stage business case simulation and leadership championship. Fostering data-driven decision-making, strategic problem-solving, and national economic impact across top B-schools and corporate hubs.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-300">
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Viksit Bharat 2047 Alignment
              </span>
              <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-[11px] font-medium flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                AICTE / AACSB Benchmarked
              </span>
            </div>
          </div>

          {/* Col 2: Competition Stages */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Competition Stages
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 1: Online Business Quiz
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 2: PPT/PDF Case Deck
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 3: Regional Live Case
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Round 4: National Grand Finale
              </li>
            </ul>
          </div>

          {/* Col 3: Regional Hubs */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Regional Hubs
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><strong className="text-slate-300">North:</strong> New Delhi (AIMA / FMS)</li>
              <li><strong className="text-slate-300">West:</strong> Mumbai (JBIMS / SPJIMR)</li>
              <li><strong className="text-slate-300">South:</strong> Bengaluru (IIMB)</li>
              <li><strong className="text-slate-300">East:</strong> Kolkata (IIMC / XLRI)</li>
              <li><strong className="text-slate-300">Central:</strong> Bhopal (IIFM / MANIT)</li>
            </ul>
          </div>

          {/* Col 4: Secretarial Contacts & Resources */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Secretariat Desk
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>Management House, 14 Institutional Area, Lodhi Road, New Delhi 110003</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>caseleague@aima.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>+91 11 24645100 / 43128100</span>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-1.5">
              <button
                onClick={() => setActiveView('requirements')}
                className="text-left text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Full SRS Requirements Spec & Traceability
              </button>
              <button
                onClick={() => setActiveVerifierModal(true)}
                className="text-left text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" /> Digital Certificate Verifier
              </button>
              <button
                onClick={() => setActiveSupportModal(true)}
                className="text-left text-slate-300 hover:text-white font-medium flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" /> Helpdesk & War-Room Ticket
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Legal Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            © 2026 All India Management Association (AIMA) & India Case Research Centre (ICRC). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms & Conditions</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Plagiarism & Generative AI Policy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Confidentiality Terms</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
