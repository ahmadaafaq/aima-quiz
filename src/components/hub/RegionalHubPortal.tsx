import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import {
  Award,
  Building,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  QrCode,
  Search,
  Shield,
  ShieldCheck,
  Trophy,
  Users,
  Video,
  XCircle
} from 'lucide-react';

export const RegionalHubPortal: React.FC = () => {
  const { hubs, teams, currentUser } = useCompetition();
  const [selectedHubId, setSelectedHubId] = useState('north');
  const [checkInState, setCheckInState] = useState<Record<string, boolean>>({
    't-001': true,
    't-002': true,
    't-003': false,
  });

  const activeHub = hubs.find(h => h.id === selectedHubId) || hubs[0];

  const toggleCheckIn = (teamId: string) => {
    setCheckInState(prev => ({
      ...prev,
      [teamId]: !prev[teamId],
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold text-2xl border border-rose-500/30 shrink-0">
            <MapPin className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100">
                {activeHub.name} ({activeHub.city})
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                Round 3 Regional Live Host
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Host Campus: <strong className="text-slate-800 dark:text-slate-200">{activeHub.hostInstitute}</strong> • {activeHub.venueAddress}
            </p>
          </div>
        </div>

        {/* Hub Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          {hubs.map(h => (
            <button
              key={h.id}
              onClick={() => setSelectedHubId(h.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedHubId === h.id
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {h.city}
            </button>
          ))}
        </div>
      </div>

      {/* Hub Operational Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Scheduled Teams</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">{activeHub.allocatedTeamsCount}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Capacity: {activeHub.maxCapacity} Teams</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Checked-In On Ground</span>
          <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
            {Object.values(checkInState).filter(Boolean).length} Teams
          </span>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-0.5">Biometric & QR Verified</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Presentation Rooms</span>
          <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">3 Halls</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Auditorium 1, 2 & Senate</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[10px] text-slate-400 uppercase font-semibold block">National Qualifiers</span>
          <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">Top 3 Teams</span>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold block mt-0.5">Direct to Grand Finale</span>
        </div>
      </div>

      {/* Presentation Schedule & On-Ground Attendance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-rose-600" />
              Regional Live Presentation Schedule & Attendance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Event Date: {activeHub.eventDate} • 15 Mins Presentation + 10 Mins Jury Q&A
            </p>
          </div>

          <button
            onClick={() => alert(`Printing official schedule roster for ${activeHub.name}...`)}
            className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold hover:bg-slate-200 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Day Schedule (PDF)</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="p-3">Slot & Venue</th>
                <th className="p-3">Team Name & Code</th>
                <th className="p-3">Institution</th>
                <th className="p-3">Jury Panel</th>
                <th className="p-3">On-Ground Status</th>
                <th className="p-3 text-right">Advancement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-3 font-semibold">
                  <div className="text-slate-900 dark:text-slate-100 font-bold">10:00 AM – 10:25 AM</div>
                  <div className="text-[10px] text-slate-500">Auditorium 1 (Main Hall)</div>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">StratApex Consultants</div>
                  <div className="text-[10px] font-mono text-amber-600">ICL-APEX-890</div>
                </td>
                <td className="p-3">IIM Bangalore</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">Dr. Arvind Swaminathan (McKinsey)</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCheckIn('t-001')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      checkInState['t-001']
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {checkInState['t-001'] ? '✓ Checked In' : 'Mark Present'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                    🥇 #1 Advancing to Grand Finale
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-3 font-semibold">
                  <div className="text-slate-900 dark:text-slate-100 font-bold">10:30 AM – 10:55 AM</div>
                  <div className="text-[10px] text-slate-500">Auditorium 1 (Main Hall)</div>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Vanguard Strategists</div>
                  <div className="text-[10px] font-mono text-amber-600">ICL-VANG-102</div>
                </td>
                <td className="p-3">FMS Delhi</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">Pooja Venkatesh (BCG)</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCheckIn('t-002')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      checkInState['t-002']
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {checkInState['t-002'] ? '✓ Checked In' : 'Mark Present'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-400 font-bold border border-blue-500/30">
                    🥈 #2 Advancing to Grand Finale
                  </span>
                </td>
              </tr>

              <tr className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                <td className="p-3 font-semibold">
                  <div className="text-slate-900 dark:text-slate-100 font-bold">11:00 AM – 11:25 AM</div>
                  <div className="text-[10px] text-slate-500">Boardroom B</div>
                </td>
                <td className="p-3">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Matrix Analytics Group</div>
                  <div className="text-[10px] font-mono text-amber-600">ICL-MATR-441</div>
                </td>
                <td className="p-3">XLRI Jamshedpur</td>
                <td className="p-3 text-slate-600 dark:text-slate-400">Dr. Arvind Swaminathan</td>
                <td className="p-3">
                  <button
                    onClick={() => toggleCheckIn('t-003')}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                      checkInState['t-003']
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 border border-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-300'
                    }`}
                  >
                    {checkInState['t-003'] ? '✓ Checked In' : 'Mark Present'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-400 font-bold border border-purple-500/30">
                    🥉 #3 Advancing to Grand Finale
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
