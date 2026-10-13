import React, { useState } from 'react';
import { LegalPageLayout } from './LegalPageLayout';
import {
  Phone,
  MapPin,
  Building2,
  ExternalLink,
  Navigation,
  Compass,
  CheckCircle2,
} from 'lucide-react';

interface LocationItem {
  id: 'hq' | 'cme';
  title: string;
  organization: string;
  address: string;
  landmark?: string;
  telephones: string[];
  mapQuery: string;
  googleMapsUrl: string;
}

export const ContactUsPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<'hq' | 'cme'>('hq');

  const locations: LocationItem[] = [
    {
      id: 'hq',
      title: 'Headquarters',
      organization: 'All India Management Association',
      address: 'Management House, 14, Institutional Area, Lodhi Road, New Delhi – 110003, India',
      telephones: ['+91-011-24645100', '24617354', '43128100'],
      mapQuery: 'All+India+Management+Association,+Management+House,+14,+Institutional+Area,+Lodhi+Road,+New+Delhi,+Delhi+110003',
      googleMapsUrl: 'https://maps.google.com/?q=All+India+Management+Association,+Management+House,+14+Institutional+Area,+Lodhi+Road,+New+Delhi+110003',
    },
    {
      id: 'cme',
      title: 'AIMA - Centre For Management Education',
      organization: 'AIMA - CME Campus',
      address: '15, Link Road, Lajpat Nagar 3, New Delhi – 110024, India',
      landmark: 'Opp. Metro Pillar No. 26',
      telephones: ['+91-011-47673000', '49868399'],
      mapQuery: 'AIMA+Centre+for+Management+Education,+15+Link+Road,+Lajpat+Nagar+3,+New+Delhi+110024',
      googleMapsUrl: 'https://maps.google.com/?q=15+Link+Road,+Lajpat+Nagar+3,+New+Delhi+110024',
    },
  ];

  const active = locations.find((loc) => loc.id === selectedLocation) || locations[0];

  return (
    <LegalPageLayout
      title="Contact Us"
      subtitle="Official office locations, addresses, telephone board lines, and exact location map for All India Management Association (AIMA)."
      badge="Official AIMA Directory"
      activeTab="contact"
    >
      <div className="space-y-8 max-w-6xl mx-auto">
        
        {/* ============================================================== */}
        {/* SECTION 1: OFFICIAL AIMA LOCATIONS (EXACTLY AS ON AIMA.IN)     */}
        {/* ============================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {locations.map((loc) => {
            const isSelected = selectedLocation === loc.id;
            return (
              <div
                key={loc.id}
                onClick={() => setSelectedLocation(loc.id)}
                className={`cursor-pointer rounded-3xl p-6 sm:p-7 border transition-all duration-200 relative space-y-4 shadow-xs ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'bg-white dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {/* Header Tag */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      {loc.organization}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      {loc.title}
                    </h3>
                  </div>

                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {loc.address}
                      {loc.landmark && (
                        <span className="block text-[11px] font-semibold text-amber-600 dark:text-amber-400 pt-0.5">
                          ({loc.landmark})
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Telephones */}
                  <div className="flex items-start gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block text-xs">
                        Telephones:
                      </span>
                      <div className="flex items-center gap-2 flex-wrap font-mono text-xs pt-0.5">
                        {loc.telephones.map((tel, idx) => (
                          <React.Fragment key={idx}>
                            <a
                              href={`tel:${tel.replace(/[^0-9+]/g, '')}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                              {tel}
                            </a>
                            {idx < loc.telephones.length - 1 && (
                              <span className="text-slate-300 dark:text-slate-700">/</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Active Selection Indicator */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center gap-1.5 font-bold ${
                    isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span>{isSelected ? 'Viewing on Map Below' : 'Click to view on Map'}</span>
                  </span>

                  <a
                    href={loc.googleMapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
                  >
                    <span>Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* ============================================================== */}
        {/* SECTION 2: EXACT LOCATION GOOGLE MAP EMBED (BETTER & FASTER)   */}
        {/* ============================================================== */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
          
          {/* Map Header with Location Switcher & Direct Directions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
                <Compass className="w-4 h-4" />
                <span>Exact Geolocation Map</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>{active.title}</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  {selectedLocation === 'hq' ? 'Lodhi Road' : 'Lajpat Nagar'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {active.address}
              </p>
            </div>

            {/* Direct Navigation Action */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setSelectedLocation('hq')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedLocation === 'hq'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Headquarters
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLocation('cme')}
                  className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    selectedLocation === 'cme'
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  Centre for Management Education
                </button>
              </div>

              <a
                href={active.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="h-9 px-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20"
                title="Open Directions in Google Maps"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Maps</span>
              </a>
            </div>
          </div>

          {/* Map Viewport Container */}
          <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] min-h-[380px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner bg-slate-100 dark:bg-slate-950">
            <iframe
              title={`AIMA Exact Location Map - ${active.title}`}
              src={`https://maps.google.com/maps?q=${active.mapQuery}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
              className="absolute inset-0 w-full h-full border-0 filter saturate-105"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* Official Verification Reference */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-blue-500" />
              <span>
                Information sourced directly from <a href="https://www.aima.in/contact-us" target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">aima.in/contact-us</a>
              </span>
            </div>
            <div>
              Management House, 14, Institutional Area, Lodhi Road, New Delhi – 110003
            </div>
          </div>

        </div>

      </div>
    </LegalPageLayout>
  );
};
