import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { RegionalHub, RegionHubId } from '../../types';
import { DocRequirementInfo } from '../common/DocRequirementInfo';
import {
  MapPin,
  Building2,
  Users,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  Calendar,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Phone,
  Mail,
  Sliders,
  Check,
} from 'lucide-react';

interface RegionalHubsManagerProps {
  autoOpenCreateHub?: boolean;
  autoOpenOnboardCoord?: boolean;
}

export const RegionalHubsManager: React.FC<RegionalHubsManagerProps> = ({
  autoOpenCreateHub = false,
  autoOpenOnboardCoord = false,
}) => {
  const {
    hubs,
    addRegionalHub,
    updateRegionalHub,
    assignHubCoordinator,
    teams,
    users,
    setAdminActiveTab,
  } = useCompetition();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [selectedHubForTeams, setSelectedHubForTeams] = useState<RegionalHub | null>(null);

  // Hub Create/Edit Modal
  const [showHubModal, setShowHubModal] = useState(false);
  const [editingHub, setEditingHub] = useState<RegionalHub | null>(null);
  const [hubName, setHubName] = useState('');
  const [hostInstitute, setHostInstitute] = useState('');
  const [city, setCity] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [auditoriumHall, setAuditoriumHall] = useState('Main University Auditorium & Case Boardroom');
  const [maxCapacity, setMaxCapacity] = useState<number>(40);
  const [eventDate, setEventDate] = useState('2026-10-15 to 2026-10-17');
  const [coveredStates, setCoveredStates] = useState('Delhi NCR, Haryana, Punjab, Uttar Pradesh, Rajasthan');
  const [hubStatus, setHubStatus] = useState<RegionalHub['status']>('scheduled');
  const [coordName, setCoordName] = useState('');
  const [coordEmail, setCoordEmail] = useState('');
  const [coordMobile, setCoordMobile] = useState('');
  const [coordDesignation, setCoordDesignation] = useState('Regional Academic Director');

  // Coordinator Onboarding Modal
  const [showCoordModal, setShowCoordModal] = useState(false);
  const [targetHubIdForCoord, setTargetHubIdForCoord] = useState<string>(hubs[0]?.id || 'hub_north');
  const [onboardCoordName, setOnboardCoordName] = useState('');
  const [onboardCoordEmail, setOnboardCoordEmail] = useState('');
  const [onboardCoordMobile, setOnboardCoordMobile] = useState('');
  const [onboardCoordDesignation, setOnboardCoordDesignation] = useState('Professor of Operations & Regional Nodal Officer');

  // Toast feedback
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const openCreateHubModal = () => {
    setEditingHub(null);
    setHubName('Central India Regional Hub');
    setHostInstitute('IIM Indore Campus');
    setCity('Indore, Madhya Pradesh');
    setVenueAddress('Rau-Pithampur Road, Indore, Madhya Pradesh 453556');
    setAuditoriumHall('Siddhartha Auditorium & MDP Hall');
    setMaxCapacity(40);
    setEventDate('2026-10-20 to 2026-10-22');
    setCoveredStates('Madhya Pradesh, Chhattisgarh, Eastern Maharashtra');
    setHubStatus('scheduled');
    setCoordName('Prof. Vikram Sethi');
    setCoordEmail('regional.central@aima.in');
    setCoordMobile('+91 98765 43210');
    setCoordDesignation('Chairperson, Executive Management Programmes');
    setShowHubModal(true);
  };

  React.useEffect(() => {
    if (autoOpenCreateHub) {
      openCreateHubModal();
    }
  }, [autoOpenCreateHub]);

  React.useEffect(() => {
    if (autoOpenOnboardCoord) {
      setShowCoordModal(true);
    }
  }, [autoOpenOnboardCoord]);

  const openEditHubModal = (hub: RegionalHub) => {
    setEditingHub(hub);
    setHubName(hub.name);
    setHostInstitute(hub.hostInstitute);
    setCity(hub.city);
    setVenueAddress(hub.venueAddress);
    setAuditoriumHall(hub.auditoriumHall || 'Main Campus Auditorium');
    setMaxCapacity(hub.maxCapacity);
    setEventDate(hub.eventDate);
    setCoveredStates(hub.coveredStates ? hub.coveredStates.join(', ') : 'Pan-Region States');
    setHubStatus(hub.status);
    setCoordName(hub.coordinatorName || '');
    setCoordEmail(hub.coordinatorEmail || '');
    setCoordMobile(hub.coordinatorMobile || '');
    setCoordDesignation(hub.coordinatorDesignation || 'Regional Coordinator');
    setShowHubModal(true);
  };

  const handleSaveHub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hubName.trim() || !hostInstitute.trim() || !city.trim()) {
      alert('Please fill all mandatory hub details.');
      return;
    }

    const stateList = coveredStates.split(',').map(s => s.trim()).filter(Boolean);

    if (editingHub) {
      updateRegionalHub(editingHub.id, {
        name: hubName,
        hostInstitute,
        city,
        venueAddress,
        auditoriumHall,
        maxCapacity: Number(maxCapacity),
        eventDate,
        coveredStates: stateList,
        status: hubStatus,
        coordinatorName: coordName,
        coordinatorEmail: coordEmail,
        coordinatorMobile: coordMobile,
        coordinatorDesignation: coordDesignation,
      });
      showNotification(`Updated regional hub "${hubName}" successfully.`);
    } else {
      const generatedId = `hub_${city.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 15)}_${Date.now().toString(36)}`;
      const newHub: RegionalHub = {
        id: generatedId as RegionHubId,
        name: hubName,
        city,
        hostInstitute,
        coordinatorName: coordName,
        coordinatorEmail: coordEmail,
        coordinatorMobile: coordMobile,
        coordinatorDesignation: coordDesignation,
        coveredStates: stateList,
        auditoriumHall,
        maxCapacity: Number(maxCapacity),
        allocatedTeamsCount: 0,
        eventDate,
        venueAddress,
        status: hubStatus,
      };
      addRegionalHub(newHub);
      showNotification(`Created new regional hub "${hubName}" hosted at ${hostInstitute}.`);
    }

    setShowHubModal(false);
  };

  const handleOnboardCoordinator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardCoordName.trim() || !onboardCoordEmail.trim()) {
      alert('Please provide the coordinator full name and institutional email.');
      return;
    }

    assignHubCoordinator(targetHubIdForCoord, {
      name: onboardCoordName,
      email: onboardCoordEmail,
      mobile: onboardCoordMobile,
      designation: onboardCoordDesignation,
    });

    const targetHub = hubs.find(h => h.id === targetHubIdForCoord);
    showNotification(`Assigned ${onboardCoordName} as Regional Coordinator for ${targetHub?.name || 'Regional Hub'}.`);
    setShowCoordModal(false);
    setOnboardCoordName('');
    setOnboardCoordEmail('');
    setOnboardCoordMobile('');
  };

  // Filter hubs
  const filteredHubs = hubs.filter(hub => {
    const matchesSearch =
      hub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hub.hostInstitute.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (hub.coordinatorName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesZone =
      filterZone === 'all' ||
      hub.name.toLowerCase().includes(filterZone.toLowerCase()) ||
      hub.city.toLowerCase().includes(filterZone.toLowerCase());

    return matchesSearch && matchesZone;
  });

  const totalAllocatedTeams = hubs.reduce((acc, h) => acc + (h.allocatedTeamsCount || 0), 0);
  const totalMaxCapacity = hubs.reduce((acc, h) => acc + (h.maxCapacity || 0), 0);
  const nationalUtilization = totalMaxCapacity > 0 ? Math.round((totalAllocatedTeams / totalMaxCapacity) * 100) : 0;
  const activeHubsCount = hubs.filter(h => h.status === 'live' || h.status === 'scheduled').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-slate-400 hover:text-slate-600">
            ✕
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-3">
          <span className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <MapPin className="w-6 h-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                Regional Hubs Logistics & Allotment Matrix
              </h2>
              <DocRequirementInfo
                specKey="admin_hub_matrix"
                variant="badge"
                badgeLabel="BRD §10.1 Specs"
                colorTheme="rose"
              />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage Pan-India physical host institutions, allocate qualified Stage 2 teams, and onboard Regional Nodal Coordinators.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowCoordModal(true)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UserCheck className="w-4 h-4 text-blue-500" />
            <span>Onboard Regional Coordinator</span>
          </button>

          <button
            onClick={openCreateHubModal}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Regional Hub</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Configured Regional Hubs</span>
            <Building2 className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {hubs.length} Hubs
          </div>
          <div className="text-xs text-rose-600 font-medium mt-1">
            {activeHubsCount} active / confirmed venues
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Stage 3 Allocated Teams</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {totalAllocatedTeams} Teams
          </div>
          <div className="text-xs text-blue-600 font-medium mt-1">
            Out of {totalMaxCapacity} pan-India slots
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>National Hub Load</span>
            <Layers className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {nationalUtilization}% Full
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            Balanced regional quota absorption
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Regional Coordinators</span>
            <UserCheck className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {hubs.filter(h => !!h.coordinatorEmail).length} Certified
          </div>
          <div className="text-xs text-purple-600 font-medium mt-1">
            Institutional SPOCs with Portal access
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hub name, city, institute or coordinator..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Zones' },
            { id: 'north', label: 'North' },
            { id: 'west', label: 'West' },
            { id: 'south', label: 'South' },
            { id: 'east', label: 'East' },
            { id: 'central', label: 'Central' },
          ].map(z => (
            <button
              key={z.id}
              onClick={() => setFilterZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wider transition whitespace-nowrap cursor-pointer ${
                filterZone === z.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      {/* Regional Hubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredHubs.length === 0 ? (
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <MapPin className="w-10 h-10 text-slate-400 mx-auto" />
            <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
              No Regional Hubs Match Your Filter
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No regional centres found matching &quot;{searchQuery}&quot;. Click &quot;Create Regional Hub&quot; to register a new host venue.
            </p>
            <button
              onClick={openCreateHubModal}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Host Hub</span>
            </button>
          </div>
        ) : (
          filteredHubs.map(hub => {
            const allocated = hub.allocatedTeamsCount || 0;
            const cap = hub.maxCapacity || 40;
            const fillPct = Math.min(100, Math.round((allocated / Math.max(1, cap)) * 100));
            const isNearCapacity = fillPct >= 85;

            return (
              <div
                key={hub.id}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition space-y-4"
              >
                {/* Hub Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        {hub.id.toUpperCase().replace('_', ' ')}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          hub.status === 'live'
                            ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                            : hub.status === 'scoring_completed'
                            ? 'bg-purple-500/10 text-purple-600 border border-purple-500/20'
                            : 'bg-blue-500/10 text-blue-600 border border-blue-500/20'
                        }`}
                      >
                        {hub.status.replace('_', ' ')}
                      </span>
                      {isNearCapacity && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          Near Cap ({fillPct}%)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-slate-900 dark:text-white">
                      {hub.name}
                    </h3>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      🏛️ {hub.hostInstitute}
                    </p>
                    <p className="text-xs text-slate-500">
                      📍 {hub.city} • {hub.venueAddress}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditHubModal(hub)}
                      className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Edit Hub Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setTargetHubIdForCoord(hub.id);
                        setOnboardCoordName(hub.coordinatorName || '');
                        setOnboardCoordEmail(hub.coordinatorEmail || '');
                        setOnboardCoordMobile(hub.coordinatorMobile || '');
                        setOnboardCoordDesignation(hub.coordinatorDesignation || 'Regional Coordinator');
                        setShowCoordModal(true);
                      }}
                      className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 text-blue-500 hover:text-blue-700 transition cursor-pointer"
                      title="Onboard / Assign Coordinator"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">
                      Stage 3 Team Allocation: <strong className="text-slate-900 dark:text-white">{allocated}</strong> / {cap} Teams
                    </span>
                    <span className={`font-black ${isNearCapacity ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300'}`}>
                      {fillPct}% Quota Filled
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isNearCapacity ? 'bg-amber-500' : 'bg-rose-600'
                      }`}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Auditorium: {hub.auditoriumHall || 'Main Hall'}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateRegionalHub(hub.id, { maxCapacity: Math.max(10, cap - 5) })}
                        className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-mono text-[10px] cursor-pointer"
                        title="Decrease Capacity by 5"
                      >
                        -5
                      </button>
                      <button
                        onClick={() => updateRegionalHub(hub.id, { maxCapacity: cap + 5 })}
                        className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 font-mono text-[10px] cursor-pointer"
                        title="Increase Capacity by 5"
                      >
                        +5
                      </button>
                    </div>
                  </div>
                </div>

                {/* Coordinator Cardlet */}
                <div className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                      {hub.coordinatorName ? hub.coordinatorName.charAt(0) : 'C'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {hub.coordinatorName || 'No Coordinator Assigned'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-2">
                        <span>{hub.coordinatorDesignation || 'Regional Coordinator'}</span>
                        {hub.coordinatorEmail && (
                          <span className="text-blue-600 dark:text-blue-400 truncate">({hub.coordinatorEmail})</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTargetHubIdForCoord(hub.id);
                      setOnboardCoordName(hub.coordinatorName || '');
                      setOnboardCoordEmail(hub.coordinatorEmail || '');
                      setOnboardCoordMobile(hub.coordinatorMobile || '');
                      setOnboardCoordDesignation(hub.coordinatorDesignation || 'Regional Coordinator');
                      setShowCoordModal(true);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                {/* Covered States & Dates */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{hub.eventDate}</span>
                  </div>

                  {hub.coveredStates && hub.coveredStates.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-semibold">States:</span>
                      {hub.coveredStates.slice(0, 3).map((st, i) => (
                        <span key={i} className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                          {st}
                        </span>
                      ))}
                      {hub.coveredStates.length > 3 && (
                        <span className="text-[10px] text-slate-400 font-bold">
                          +{hub.coveredStates.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hub Footer Action Buttons */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      const newStatus: RegionalHub['status'] =
                        hub.status === 'scheduled' ? 'live' : hub.status === 'live' ? 'scoring_completed' : 'scheduled';
                      updateRegionalHub(hub.id, { status: newStatus });
                      showNotification(`Hub status transitioned to "${newStatus.replace('_', ' ')}".`);
                    }}
                    className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    <span>Status:</span>
                    <span className="underline capitalize">{hub.status.replace('_', ' ')}</span>
                  </button>

                  <button
                    onClick={() => setSelectedHubForTeams(hub)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 transition flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    <span>Inspect Allocated Teams</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* CREATE / EDIT REGIONAL HUB MODAL */}
      {showHubModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-rose-500/10 text-rose-600">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {editingHub ? 'Update Regional Hub Logistics' : 'Register New Regional Hub'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configure Stage 3 physical host venue, auditorium capacity, covered states, and nodal coordinator.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHubModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveHub} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Hub Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. North Zone Regional Hub"
                    value={hubName}
                    onChange={e => setHubName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Host Institution / Campus *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. IIM Lucknow Noida Campus"
                    value={hostInstitute}
                    onChange={e => setHostInstitute(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    City & State *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Noida, Uttar Pradesh"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-rose-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Max Team Allocation Capacity *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    required
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(Number(e.target.value))}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Full Venue Address & Campus Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. B-1, Sector 62, Institutional Area, Noida 201307"
                  value={venueAddress}
                  onChange={e => setVenueAddress(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Auditorium & Boardrooms
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. APJ Abdul Kalam Auditorium (Seats 400)"
                    value={auditoriumHall}
                    onChange={e => setAuditoriumHall(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Stage 3 Event Dates
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2026-10-15 to 2026-10-17"
                    value={eventDate}
                    onChange={e => setEventDate(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Covered States & Territories (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Delhi NCR, Punjab, Haryana, Himachal Pradesh, Jammu & Kashmir"
                  value={coveredStates}
                  onChange={e => setCoveredStates(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span>Host Coordinator Credentials</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">
                      Coordinator Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Prof. Rajesh Mehra"
                      value={coordName}
                      onChange={e => setCoordName(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">
                      Official Institutional Email
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. regional.north@aima.in"
                      value={coordEmail}
                      onChange={e => setCoordEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      placeholder="+91 98000 00000"
                      value={coordMobile}
                      onChange={e => setCoordMobile(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-slate-400">
                      Designation
                    </label>
                    <input
                      type="text"
                      placeholder="Dean, Management Studies"
                      value={coordDesignation}
                      onChange={e => setCoordDesignation(e.target.value)}
                      className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <label className="font-bold text-slate-600 dark:text-slate-400">Status:</label>
                  <select
                    value={hubStatus}
                    onChange={e => setHubStatus(e.target.value as any)}
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    <option value="scheduled">Scheduled / Upcoming</option>
                    <option value="live">Live / Active Today</option>
                    <option value="scoring_completed">Scoring Completed</option>
                    <option value="results_locked">Results Locked</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowHubModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    {editingHub ? 'Save Hub Updates' : 'Create Regional Hub'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ONBOARD REGIONAL COORDINATOR MODAL */}
      {showCoordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600">
                  <UserCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    Onboard Regional Coordinator
                  </h3>
                  <p className="text-xs text-slate-500">
                    Assign institutional nodal officer and grant Regional Hub Portal access credentials.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCoordModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardCoordinator} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Select Regional Hub *
                </label>
                <select
                  value={targetHubIdForCoord}
                  onChange={e => setTargetHubIdForCoord(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                >
                  {hubs.map(h => (
                    <option key={h.id} value={h.id}>
                      {h.name} — {h.hostInstitute} ({h.city})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Coordinator Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Prof. Rajesh Mehra"
                  value={onboardCoordName}
                  onChange={e => setOnboardCoordName(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  Institutional / Official Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rmehra@iiml.ac.in or regional.north@aima.in"
                  value={onboardCoordEmail}
                  onChange={e => setOnboardCoordEmail(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Mobile Contact
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={onboardCoordMobile}
                    onChange={e => setOnboardCoordMobile(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    Institutional Role / Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dean of Academics"
                    value={onboardCoordDesignation}
                    onChange={e => setOnboardCoordDesignation(e.target.value)}
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Automated Role Provisioning</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Onboarding this coordinator automatically provisions their user profile with role <code className="font-bold text-blue-600">regional_hub</code> and associates their credentials with the selected hub.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCoordModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md hover:shadow-lg transition cursor-pointer"
                >
                  Onboard Coordinator
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INSPECT ALLOCATED TEAMS MODAL */}
      {selectedHubForTeams && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Stage 3 Allocated Teams — {selectedHubForTeams.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Hosted at {selectedHubForTeams.hostInstitute}, {selectedHubForTeams.city}
                </p>
              </div>
              <button
                onClick={() => setSelectedHubForTeams(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {teams.filter(t => t.assignedHub === selectedHubForTeams.id).length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <Users className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    No teams explicitly assigned to this hub yet
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Teams qualifying from Stage 2 case deck evaluations are mapped here via algorithmic geographical grouping.
                  </p>
                </div>
              ) : (
                teams
                  .filter(t => t.assignedHub === selectedHubForTeams.id)
                  .map(team => (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white">{team.name}</span>
                        <div className="text-[11px] text-slate-500">
                          {team.instituteName} • {team.members.length} Members
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                        Assigned
                      </span>
                    </div>
                  ))
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedHubForTeams(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
