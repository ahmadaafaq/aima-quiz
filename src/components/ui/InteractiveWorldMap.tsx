import React, { useState } from 'react';
import { MapPin, Navigation, Shield, Award, Users, ChevronRight, Sparkles, Building, Globe } from 'lucide-react';
import { RegionalHub } from '../../types';

interface InteractiveWorldMapProps {
  hubs: RegionalHub[];
  selectedHub: RegionalHub;
  onSelectHub: (hub: RegionalHub) => void;
  className?: string;
}

interface MapNode {
  id: string;
  name: string;
  type: 'hub' | 'global';
  region: string;
  x: number; // percentage
  y: number; // percentage
  city: string;
  host: string;
  capacity?: string;
  stats?: string;
  hubData?: RegionalHub;
}

export const InteractiveWorldMap: React.FC<InteractiveWorldMapProps> = ({
  hubs,
  selectedHub,
  onSelectHub,
  className = '',
}) => {
  const [hoveredNode, setHoveredNode] = useState<MapNode | null>(null);

  const nodes: MapNode[] = [
    {
      id: 'hub_north',
      name: 'North Regional Hub',
      type: 'hub',
      region: 'North India',
      x: 62.5,
      y: 41.0,
      city: 'New Delhi (AIMA HQ)',
      host: 'Management House & FMS / MDI Network',
      capacity: '48 Teams Allocated',
      stats: '1,240 Aspirants',
      hubData: hubs.find(h => h.id === 'hub_north') || hubs[0],
    },
    {
      id: 'hub_west',
      name: 'West Regional Hub',
      type: 'hub',
      region: 'West India',
      x: 58.5,
      y: 53.0,
      city: 'Mumbai',
      host: 'SPJIMR / Jamnalal Bajaj Partner Campus',
      capacity: '44 Teams Allocated',
      stats: '1,120 Aspirants',
      hubData: hubs.find(h => h.id === 'hub_west') || hubs[1],
    },
    {
      id: 'hub_south',
      name: 'South Regional Hub',
      type: 'hub',
      region: 'South India',
      x: 61.8,
      y: 64.5,
      city: 'Bengaluru',
      host: 'IIM Bangalore Innovation Park',
      capacity: '50 Teams Allocated',
      stats: '1,450 Aspirants',
      hubData: hubs.find(h => h.id === 'hub_south') || hubs[2],
    },
    {
      id: 'hub_east',
      name: 'East Regional Hub',
      type: 'hub',
      region: 'East India',
      x: 70.2,
      y: 48.2,
      city: 'Kolkata',
      host: 'IIM Calcutta & XLRI Regional Center',
      capacity: '36 Teams Allocated',
      stats: '890 Aspirants',
      hubData: hubs.find(h => h.id === 'hub_east') || hubs[3],
    },
    {
      id: 'hub_northeast',
      name: 'North-East Regional Hub',
      type: 'hub',
      region: 'North East India',
      x: 76.5,
      y: 42.8,
      city: 'Guwahati',
      host: 'IIT Guwahati & IIM Shillong Hub',
      capacity: '24 Teams Allocated',
      stats: '560 Aspirants',
      hubData: hubs.find(h => h.id === 'hub_northeast') || hubs[4],
    },
    // Global Case Partner Nodes
    {
      id: 'global_singapore',
      name: 'Singapore Case Desk',
      type: 'global',
      region: 'Southeast Asia',
      x: 82.0,
      y: 65.0,
      city: 'Singapore',
      host: 'AIMA Asia-Pacific Case Observatory',
      stats: 'Cross-Border Benchmark',
    },
    {
      id: 'global_dubai',
      name: 'Dubai MENA Center',
      type: 'global',
      region: 'Middle East',
      x: 48.0,
      y: 43.5,
      city: 'Dubai',
      host: 'Gulf Management Guild Liaison',
      stats: 'International Case Partner',
    },
    {
      id: 'global_london',
      name: 'London Academic Desk',
      type: 'global',
      region: 'Europe',
      x: 32.0,
      y: 28.0,
      city: 'London',
      host: 'UK-India Strategic Management Link',
      stats: 'Global Jury Observer',
    },
  ];

  return (
    <div className={`relative rounded-3xl bg-slate-900/95 dark:bg-slate-950 border border-slate-800 p-6 lg:p-8 text-white overflow-hidden shadow-2xl ${className}`}>
      
      {/* Background Neon Grid & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,rgba(56,189,248,0.12),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b50_1px,transparent_1px),linear-gradient(to_bottom,#1e293b50_1px,transparent_1px)] bg-[size:2rem_2rem] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-widest text-blue-400 uppercase">
              Pan-India & Global Research Infrastructure
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
            5 Regional Hubs & International Case Desks
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Round 3 Regional Live Finals are hosted simultaneously across physical high-tech amphitheaters with synchronized live jury telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>5 Hubs • 100% Hybrid Ready</span>
          </span>
        </div>
      </div>

      {/* Map Projection Canvas */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-6">
        
        {/* Visual Map Area */}
        <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-2xl bg-slate-950/80 border border-slate-800/90 overflow-hidden shadow-inner flex items-center justify-center">
          
          {/* Subtle World/India Vector Topography */}
          <svg
            className="w-full h-full object-cover opacity-65"
            viewBox="0 0 1000 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* World Landmass Silhouettes (Stylized Dot Grid) */}
            <g opacity="0.35" fill="#38bdf8">
              {/* Eurasia / India continent dots */}
              <circle cx="620" cy="245" r="3" fill="#38bdf8" />
              <circle cx="600" cy="280" r="3.5" fill="#38bdf8" />
              <circle cx="615" cy="310" r="4" fill="#38bdf8" />
              <circle cx="620" cy="385" r="4" fill="#38bdf8" />
              <circle cx="585" cy="320" r="3.5" fill="#38bdf8" />
              <circle cx="700" cy="290" r="3.5" fill="#38bdf8" />
              <circle cx="760" cy="255" r="3" fill="#38bdf8" />
              <circle cx="820" cy="390" r="3" fill="#38bdf8" />
              <circle cx="480" cy="260" r="3" fill="#38bdf8" />
              <circle cx="320" cy="170" r="3" fill="#38bdf8" />
            </g>

            {/* India Territory Outline Map Boundary (Stylized High-Tech) */}
            <path
              d="M 580 180 Q 625 150 640 180 T 660 210 T 700 240 T 780 230 T 790 260 T 740 280 T 710 320 T 670 370 T 630 460 T 615 420 T 575 350 T 550 300 T 565 240 Z"
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              fill="rgba(56, 189, 248, 0.04)"
            />

            {/* Animated Flight Beams from New Delhi (625, 245) to other Hubs */}
            {/* Delhi to Mumbai */}
            <path
              d="M 625 245 Q 590 280 585 320"
              stroke="#38bdf8"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
              opacity="0.8"
            />
            {/* Delhi to Bengaluru */}
            <path
              d="M 625 245 Q 630 310 618 387"
              stroke="#6366f1"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
              opacity="0.8"
            />
            {/* Delhi to Kolkata */}
            <path
              d="M 625 245 Q 670 260 702 290"
              stroke="#10b981"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
              opacity="0.8"
            />
            {/* Delhi to Guwahati */}
            <path
              d="M 625 245 Q 700 220 765 257"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="6 6"
              className="animate-pulse"
              opacity="0.8"
            />
            {/* Delhi to Dubai */}
            <path
              d="M 625 245 Q 540 220 480 260"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            {/* Delhi to Singapore */}
            <path
              d="M 625 245 Q 730 330 820 390"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.4"
            />
            {/* Delhi to London */}
            <path
              d="M 625 245 Q 460 160 320 170"
              stroke="#94a3b8"
              strokeWidth="1.2"
              strokeDasharray="4 4"
              opacity="0.4"
            />
          </svg>

          {/* Interactive HTML Node Markers */}
          {nodes.map(node => {
            const isSelected = selectedHub?.id === node.id;
            const isHub = node.type === 'hub';

            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 group cursor-pointer"
                onClick={() => {
                  if (node.hubData) {
                    onSelectHub(node.hubData);
                  }
                }}
                onMouseEnter={() => setHoveredNode(node)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {/* Pulsing Ripple Rings */}
                <div
                  className={`absolute inset-0 rounded-full animate-ping opacity-60 ${
                    isSelected
                      ? 'bg-blue-400 w-7 h-7 -left-1.5 -top-1.5'
                      : isHub
                      ? 'bg-sky-400 w-5 h-5 -left-1 -top-1'
                      : 'bg-slate-400 w-4 h-4 -left-0.5 -top-0.5'
                  }`}
                />

                {/* Core Pin Icon / Dot */}
                <div
                  className={`relative flex items-center justify-center rounded-full transition-all duration-200 ${
                    isSelected
                      ? 'w-7 h-7 bg-blue-600 text-white ring-4 ring-blue-500/40 shadow-lg shadow-blue-500/50 scale-110'
                      : isHub
                      ? 'w-5 h-5 bg-gradient-to-br from-sky-400 to-blue-600 text-white ring-2 ring-sky-300/40 shadow-md hover:scale-125'
                      : 'w-3.5 h-3.5 bg-slate-600 border border-slate-400 hover:bg-slate-400 hover:scale-125'
                  }`}
                >
                  {isHub ? (
                    <MapPin className={`${isSelected ? 'w-4 h-4' : 'w-3 h-3'}`} />
                  ) : (
                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                  )}
                </div>

                {/* City Label Badge */}
                <div
                  className={`absolute top-full mt-1.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold whitespace-nowrap backdrop-blur-md transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md border border-blue-400/50'
                      : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 group-hover:bg-slate-800'
                  }`}
                >
                  {node.city}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Hub Details Panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
                {selectedHub?.regionName}
              </span>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" />
                Live Hub Active
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-400" />
                {selectedHub?.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Host Center: {selectedHub?.city} • {selectedHub?.venue}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-700/60">
              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Slot Quota</div>
                <div className="text-base font-black text-white mt-0.5">
                  {selectedHub?.maxTeams} Teams
                </div>
                <div className="text-[10px] text-blue-400">10 Finalists Advance</div>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase font-bold">Jury Panel</div>
                <div className="text-base font-black text-white mt-0.5">
                  5 Members
                </div>
                <div className="text-[10px] text-emerald-400">CXOs & IIM Faculty</div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-300">
              <div className="font-semibold text-slate-200">States Covered:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedHub?.statesCovered?.slice(0, 5).map((st, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 text-[11px] border border-slate-700/60"
                  >
                    {st}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  const hubList = hubs;
                  const currentIdx = hubList.findIndex(h => h.id === selectedHub?.id);
                  const nextIdx = (currentIdx + 1) % hubList.length;
                  onSelectHub(hubList[nextIdx]);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
              >
                <span>Cycle Next Regional Hub</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Hub Navigation Pills */}
          <div className="flex flex-wrap gap-1.5">
            {hubs.map(hub => {
              const active = selectedHub?.id === hub.id;
              return (
                <button
                  key={hub.id}
                  onClick={() => onSelectHub(hub)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
                  }`}
                >
                  {hub.city}
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
