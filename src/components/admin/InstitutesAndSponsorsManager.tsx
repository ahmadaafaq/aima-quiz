import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { CorporateSponsor, InstitutionalProfile } from '../../types';
import {
  Building2,
  Briefcase,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Award,
  Users,
  DollarSign,
  Handshake,
  Trash2,
  X,
  FileCheck,
  TrendingUp,
  GraduationCap
} from 'lucide-react';

interface InstitutesAndSponsorsManagerProps {
  onNavigateToHubs?: () => void;
}

export const InstitutesAndSponsorsManager: React.FC<InstitutesAndSponsorsManagerProps> = () => {
  const {
    institutions,
    addInstitution,
    sponsors,
    addSponsor,
    deleteSponsor,
    addAuditLog
  } = useCompetition();

  // Active view: 'institutions' | 'sponsors'
  const [activeSubTab, setActiveSubTab] = useState<'institutions' | 'sponsors'>('sponsors');

  // Search & Filters for Institutions
  const [instSearch, setInstSearch] = useState('');
  const [instStateFilter, setInstStateFilter] = useState('all');

  // Search & Filters for Sponsors
  const [sponsorSearch, setSponsorSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals
  const [showAddSponsorModal, setShowAddSponsorModal] = useState(false);
  const [showAddInstModal, setShowAddInstModal] = useState(false);
  const [viewSponsorDetails, setViewSponsorDetails] = useState<CorporateSponsor | null>(null);

  // New Sponsor Form State
  const [newSponsorForm, setNewSponsorForm] = useState<Omit<CorporateSponsor, 'id'>>({
    name: '',
    logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80',
    tier: 'Strategic Case Partner',
    category: 'Consulting & Strategy',
    contributionAmount: 2000000,
    representativeName: '',
    representativeEmail: '',
    representativeMobile: '',
    designation: 'Director - University Relations',
    sponsoredRounds: ['round_2', 'round_3'],
    caseProblemTrack: 'Digital Supply Chain Innovation',
    talentRadarAccess: true,
    ppiPpoOffersCommitted: 8,
    boothAllocated: 'Hall B - Corporate Pavilion',
    status: 'active',
    deliverablesSummary: 'Problem statement formulation, regional jury representation, fast-track interview invitations.',
    contractSignDate: new Date().toISOString().split('T')[0],
  });

  // New Institution Form State
  const [newInstForm, setNewInstForm] = useState<Omit<InstitutionalProfile, 'id'>>({
    name: '',
    code: '',
    state: '',
    city: '',
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorMobile: '',
    authLetterUploaded: true,
    isApproved: true,
    totalStudents: 100,
    registeredStudents: 0,
    teamsCreated: 0,
    totalPaidAmount: 0,
    ranking: institutions.length + 1,
    facultyMentor: '',
  });

  // Calculate Metrics
  const totalSponsorship = sponsors.reduce((acc, s) => acc + (s.contributionAmount || 0), 0);
  const totalPpiSlots = sponsors.reduce((acc, s) => acc + (s.ppiPpoOffersCommitted || 0), 0);
  const activeCaseTracks = sponsors.filter(s => s.caseProblemTrack).length;
  const totalInstitutions = institutions.length;
  const totalStudentsEnrolled = institutions.reduce((acc, i) => acc + (i.registeredStudents || 0), 0);
  const totalInstitutionalFees = institutions.reduce((acc, i) => acc + (i.totalPaidAmount || 0), 0);

  // Filtered Sponsors
  const filteredSponsors = sponsors.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.category.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      s.representativeName.toLowerCase().includes(sponsorSearch.toLowerCase()) ||
      (s.caseProblemTrack && s.caseProblemTrack.toLowerCase().includes(sponsorSearch.toLowerCase()));
    const matchesTier = tierFilter === 'all' || s.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  // Filtered Institutions
  const filteredInstitutions = institutions.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(instSearch.toLowerCase()) ||
      inst.code.toLowerCase().includes(instSearch.toLowerCase()) ||
      inst.city.toLowerCase().includes(instSearch.toLowerCase()) ||
      inst.coordinatorName.toLowerCase().includes(instSearch.toLowerCase());
    const matchesState = instStateFilter === 'all' || inst.state === instStateFilter;
    return matchesSearch && matchesState;
  });

  // Unique States for filter
  const uniqueStates = Array.from(new Set(institutions.map(i => i.state))).filter(Boolean);

  const handleCreateSponsor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSponsorForm.name.trim() || !newSponsorForm.representativeName.trim()) return;

    addSponsor(newSponsorForm);
    setShowAddSponsorModal(false);
    // Reset form
    setNewSponsorForm({
      name: '',
      logo: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80',
      tier: 'Strategic Case Partner',
      category: 'Consulting & Strategy',
      contributionAmount: 2000000,
      representativeName: '',
      representativeEmail: '',
      representativeMobile: '',
      designation: 'Director - University Relations',
      sponsoredRounds: ['round_2', 'round_3'],
      caseProblemTrack: '',
      talentRadarAccess: true,
      ppiPpoOffersCommitted: 6,
      boothAllocated: '',
      status: 'active',
      deliverablesSummary: '',
      contractSignDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleCreateInstitution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstForm.name.trim() || !newInstForm.code.trim()) return;

    addInstitution(newInstForm);
    addAuditLog('Institution Accredited', 'Institute', `Accredited new campus ${newInstForm.name} (${newInstForm.code})`);
    setShowAddInstModal(false);
  };

  const getTierBadgeStyle = (tier: CorporateSponsor['tier']) => {
    switch (tier) {
      case 'Title Partner':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'Grand Prize Sponsor':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30';
      case 'Strategic Case Partner':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      case 'Knowledge Partner':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30';
      case 'Regional Hub Sponsor':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/30';
    }
  };

  return (
    <div id="institutes-and-sponsors-manager" className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Ecosystem & External Relations
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Pan-India Academic & Corporate Coalition
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Institutes & Corporate Sponsors
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage accredited B-School academic contingents alongside industry title sponsors, cash prize underwriters, and corporate case tracks.
            </p>
          </div>

          {/* Sub-Tab Navigation Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 self-start lg:self-center">
            <button
              id="subtab-sponsors-btn"
              onClick={() => setActiveSubTab('sponsors')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSubTab === 'sponsors'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Corporate Partners & Sponsors</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold">
                {sponsors.length}
              </span>
            </button>

            <button
              id="subtab-institutions-btn"
              onClick={() => setActiveSubTab('institutions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeSubTab === 'institutions'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/80 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Accredited B-Schools</span>
              <span className="ml-1.5 px-2 py-0.5 text-xs rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
                {institutions.length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: CORPORATE PARTNERS & SPONSORS */}
      {/* ========================================================================= */}
      {activeSubTab === 'sponsors' && (
        <div id="corporate-sponsors-section" className="space-y-6 animate-fadeIn">
          {/* Sponsor Highlights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-200 dark:border-amber-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  Total Corporate Funding
                </span>
                <div className="p-2 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{(totalSponsorship / 10000000).toFixed(2)} Cr
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Across {sponsors.length} confirmed corporate partners
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border border-purple-200 dark:border-purple-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                  Cash Prize Escrow
                </span>
                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-700 dark:text-purple-400">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹15,00,000
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Underwritten by HDFC Bank & AIMA
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  PPI / PPO Fast-Tracks
                </span>
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalPpiSlots} Interview Slots
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Direct corporate interview guarantees for finalists
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Live Case Problem Tracks
                </span>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {activeCaseTracks} Case Tracks
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Decarbonization, FinTech & EV Strategy
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={sponsorSearch}
                    onChange={e => setSponsorSearch(e.target.value)}
                    placeholder="Search partner name, track, or executive SPOC..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={e => setTierFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Sponsorship Tiers</option>
                  <option value="Title Partner">Title Partner</option>
                  <option value="Strategic Case Partner">Strategic Case Partner</option>
                  <option value="Grand Prize Sponsor">Grand Prize Sponsor</option>
                  <option value="Regional Hub Sponsor">Regional Hub Sponsor</option>
                  <option value="Knowledge Partner">Knowledge Partner</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active & Disbursed</option>
                  <option value="confirmed">MOU Confirmed</option>
                  <option value="mou_pending">In Discussion</option>
                </select>
              </div>

              {/* Onboard Button */}
              <button
                id="onboard-corporate-sponsor-btn"
                onClick={() => setShowAddSponsorModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Corporate Sponsor</span>
              </button>
            </div>
          </div>

          {/* Sponsors Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSponsors.map(sponsor => (
              <div
                key={sponsor.id}
                id={`sponsor-card-${sponsor.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar with Logo & Tier */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={sponsor.logo}
                        alt={sponsor.name}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 shadow-sm"
                        onError={(e: any) => {
                          e.target.src = 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                          {sponsor.name}
                        </h3>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {sponsor.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tier & Status Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${getTierBadgeStyle(sponsor.tier)}`}>
                      {sponsor.tier}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                      sponsor.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}>
                      <CheckCircle2 className="w-3 h-3" />
                      {sponsor.status === 'active' ? 'Active & Funded' : 'MOU Confirmed'}
                    </span>
                  </div>

                  {/* Financial & Hiring Metric */}
                  <div className="bg-slate-50 dark:bg-slate-800/60 rounded-lg p-3 border border-slate-100 dark:border-slate-800 space-y-2 mb-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Committed Support:</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        ₹{sponsor.contributionAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Fast-Track PPI Slots:</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">
                        {sponsor.ppiPpoOffersCommitted} Candidates
                      </span>
                    </div>
                    {sponsor.caseProblemTrack && (
                      <div className="text-xs border-t border-slate-200/60 dark:border-slate-700/60 pt-1.5 mt-1.5">
                        <span className="text-slate-500 dark:text-slate-400 block font-medium mb-0.5">Problem Track:</span>
                        <span className="text-slate-800 dark:text-slate-200 line-clamp-2 font-normal">
                          {sponsor.caseProblemTrack}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SPOC Details */}
                  <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1 font-medium text-slate-800 dark:text-slate-200">
                      <Handshake className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{sponsor.representativeName}</span>
                      <span className="text-slate-400">• {sponsor.designation}</span>
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate pl-4">
                      {sponsor.representativeEmail} {sponsor.representativeMobile && `• ${sponsor.representativeMobile}`}
                    </p>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {sponsor.sponsoredRounds.map(r => (
                      <span key={r} className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                        {r.replace('round_', 'R')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewSponsorDetails(sponsor)}
                      className="px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded transition-colors"
                    >
                      View Scope
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to remove ${sponsor.name}?`)) {
                          deleteSponsor(sponsor.id);
                        }
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Remove Partner"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSponsors.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Corporate Partners Found</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                No corporate sponsors match your current search and tier filters. Try clearing your filters or onboard a new sponsor.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: ACCREDITED INSTITUTIONS & B-SCHOOLS */}
      {/* ========================================================================= */}
      {activeSubTab === 'institutions' && (
        <div id="accredited-institutions-section" className="space-y-6 animate-fadeIn">
          {/* Institutional Highlights Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-200 dark:border-indigo-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">
                  Accredited Campuses
                </span>
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-700 dark:text-indigo-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalInstitutions} B-Schools
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Top tier management institutes pan-India
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent border border-blue-200 dark:border-blue-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                  Student Contingent
                </span>
                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-700 dark:text-blue-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {totalStudentsEnrolled} Enrolled
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Active students registered through campus SPOCs
              </p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                  Institutional Bulk Fees
                </span>
                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                ₹{totalInstitutionalFees.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Settled through institutional GST billing
              </p>
            </div>
          </div>

          {/* Toolbar */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={instSearch}
                    onChange={e => setInstSearch(e.target.value)}
                    placeholder="Search institution name, city, code, or coordinator..."
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={instStateFilter}
                  onChange={e => setInstStateFilter(e.target.value)}
                  className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All States & Territories</option>
                  {uniqueStates.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <button
                id="accredit-new-institution-btn"
                onClick={() => setShowAddInstModal(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>Accredit New B-School</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Rank / Campus</th>
                    <th className="px-4 py-3">Code & Location</th>
                    <th className="px-4 py-3">Campus SPOC</th>
                    <th className="px-4 py-3 text-center">Contingent</th>
                    <th className="px-4 py-3 text-center">Teams</th>
                    <th className="px-4 py-3 text-right">Fee Settled</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {filteredInstitutions.map((inst, index) => (
                    <tr key={inst.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300">
                            #{inst.ranking || index + 1}
                          </span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">
                              {inst.name}
                            </p>
                            {inst.facultyMentor && (
                              <p className="text-xs text-slate-500">
                                Mentor: {inst.facultyMentor}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                          {inst.code}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {inst.city}, {inst.state}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-900 dark:text-white">
                          {inst.coordinatorName}
                        </p>
                        <p className="text-xs text-slate-500 truncate max-w-[180px]">
                          {inst.coordinatorEmail}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {inst.registeredStudents}
                        </span>
                        <span className="text-xs text-slate-400"> / {inst.totalStudents}</span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          {inst.teamsCreated} Teams
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-900 dark:text-white">
                        ₹{inst.totalPaidAmount.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3" />
                          Accredited
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ONBOARD CORPORATE SPONSOR */}
      {/* ========================================================================= */}
      {showAddSponsorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Onboard Corporate Partner / Sponsor
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register corporate underwriting, sponsored challenge track, and PPI slots
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddSponsorModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSponsor} className="space-y-4 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Corporate Partner Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSponsorForm.name}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Tata Sons, McKinsey & Co, Infosys"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sponsorship Tier *
                  </label>
                  <select
                    value={newSponsorForm.tier}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, tier: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Title Partner">Title Partner</option>
                    <option value="Strategic Case Partner">Strategic Case Partner</option>
                    <option value="Grand Prize Sponsor">Grand Prize Sponsor</option>
                    <option value="Regional Hub Sponsor">Regional Hub Sponsor</option>
                    <option value="Knowledge Partner">Knowledge Partner</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Domain / Category *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSponsorForm.category}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Clean Mobility, BFSI, Tech Consulting"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Committed Contribution (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="50000"
                    required
                    value={newSponsorForm.contributionAmount}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, contributionAmount: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Executive SPOC Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSponsorForm.representativeName}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, representativeName: e.target.value }))}
                    placeholder="Full name of representative"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Executive SPOC Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={newSponsorForm.designation}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, designation: e.target.value }))}
                    placeholder="e.g., VP Strategy, Head Campus Hiring"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SPOC Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newSponsorForm.representativeEmail}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, representativeEmail: e.target.value }))}
                    placeholder="corporate.email@partner.com"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fast-Track PPI / PPO Slots Committed
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={newSponsorForm.ppiPpoOffersCommitted}
                    onChange={e => setNewSponsorForm(prev => ({ ...prev, ppiPpoOffersCommitted: Number(e.target.value) }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Live Case Track Problem Title (Optional)
                </label>
                <input
                  type="text"
                  value={newSponsorForm.caseProblemTrack}
                  onChange={e => setNewSponsorForm(prev => ({ ...prev, caseProblemTrack: e.target.value }))}
                  placeholder="e.g., BharatLogistics 2030: Supply Chain Decarbonization"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverables & Branding Summary
                </label>
                <textarea
                  rows={2}
                  value={newSponsorForm.deliverablesSummary}
                  onChange={e => setNewSponsorForm(prev => ({ ...prev, deliverablesSummary: e.target.value }))}
                  placeholder="Key entitlements: keynote address, jury representation, branded stage, certificate logo placement..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSponsorModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Confirm & Onboard Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ACCREDIT NEW INSTITUTION */}
      {/* ========================================================================= */}
      {showAddInstModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Accredit New B-School / Institute
                  </h3>
                  <p className="text-xs text-slate-500">
                    Register campus accreditation and designate faculty coordinator
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddInstModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInstitution} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Institute Name *
                </label>
                <input
                  type="text"
                  required
                  value={newInstForm.name}
                  onChange={e => setNewInstForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Indian Institute of Management Kozhikode"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Institutional Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstForm.code}
                    onChange={e => setNewInstForm(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    placeholder="IIMK-KOZ-06"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstForm.state}
                    onChange={e => setNewInstForm(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Kerala"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Faculty SPOC / Coordinator *
                  </label>
                  <input
                    type="text"
                    required
                    value={newInstForm.coordinatorName}
                    onChange={e => setNewInstForm(prev => ({ ...prev, coordinatorName: e.target.value }))}
                    placeholder="Dr. S. Nair"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Coordinator Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newInstForm.coordinatorEmail}
                    onChange={e => setNewInstForm(prev => ({ ...prev, coordinatorEmail: e.target.value }))}
                    placeholder="coordinator@iimk.ac.in"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddInstModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
                >
                  Confirm Accreditation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW SPONSOR SCOPE / MOU */}
      {/* ========================================================================= */}
      {viewSponsorDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={viewSponsorDetails.logo}
                  alt={viewSponsorDetails.name}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">
                    {viewSponsorDetails.name}
                  </h3>
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${getTierBadgeStyle(viewSponsorDetails.tier)}`}>
                    {viewSponsorDetails.tier}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewSponsorDetails(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Committed Grant:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    ₹{viewSponsorDetails.contributionAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fast-Track PPI Slots:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {viewSponsorDetails.ppiPpoOffersCommitted} Candidates
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Talent Radar Access:</span>
                  <span className="font-semibold text-emerald-600">Granted</span>
                </div>
              </div>

              {viewSponsorDetails.caseProblemTrack && (
                <div>
                  <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Official Case Problem Track
                  </h4>
                  <p className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg text-slate-800 dark:text-slate-200">
                    {viewSponsorDetails.caseProblemTrack}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Deliverables & Branding Entitlements
                </h4>
                <p className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                  {viewSponsorDetails.deliverablesSummary}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Corporate SPOC & Signing Authority
                </h4>
                <p className="font-medium text-slate-900 dark:text-white">
                  {viewSponsorDetails.representativeName} ({viewSponsorDetails.designation})
                </p>
                <p className="text-slate-500">
                  {viewSponsorDetails.representativeEmail} • {viewSponsorDetails.representativeMobile}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setViewSponsorDetails(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
              >
                Close Summary
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
