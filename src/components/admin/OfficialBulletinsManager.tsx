import React, { useState } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { Announcement, UserRole } from '../../types';
import {
  Radio,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Pin,
  Send,
  Users,
  Building2,
  Trophy,
  Mail,
  Smartphone,
  ExternalLink,
  Trash2,
  X,
  Target,
  Sparkles,
  MapPin,
  Bell
} from 'lucide-react';

export const OfficialBulletinsManager: React.FC = () => {
  const { announcements, addAnnouncement, institutions, hubs, teams, users } = useCompetition();

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [roundFilter, setRoundFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [instFilter, setInstFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Modal
  const [showPublishModal, setShowPublishModal] = useState(false);

  // New Announcement Form State
  const [formData, setFormData] = useState<{
    title: string;
    content: string;
    category: Announcement['category'];
    targetRound: 'all' | 'round_1' | 'round_2' | 'round_3' | 'round_4';
    targetRoles: UserRole[] | 'all';
    targetInstitution: string;
    targetHub: string;
    channels: ('in_app' | 'email' | 'sms' | 'whatsapp')[];
    isPinned: boolean;
    linkText: string;
    linkUrl: string;
  }>({
    title: '',
    content: '',
    category: 'Round Deadline',
    targetRound: 'round_2',
    targetRoles: ['student', 'team_leader'],
    targetInstitution: 'all',
    targetHub: 'all',
    channels: ['in_app', 'email'],
    isPinned: false,
    linkText: '',
    linkUrl: '',
  });

  // Calculate Dynamic Audience Reach Estimate
  const calculateEstimatedReach = () => {
    let baseUsers = [...users];

    // Filter by Role
    if (formData.targetRoles !== 'all') {
      const allowedRoles = new Set(formData.targetRoles);
      baseUsers = baseUsers.filter(u => allowedRoles.has(u.role));
    }

    // Filter by Institution
    if (formData.targetInstitution !== 'all') {
      const targetInst = institutions.find(i => i.id === formData.targetInstitution);
      if (targetInst) {
        baseUsers = baseUsers.filter(u => u.institution?.toLowerCase().includes(targetInst.name.toLowerCase()) || (u as any).instituteId === formData.targetInstitution);
      }
    }

    // Estimate based on Round stage qualification
    let estimatedCount = baseUsers.length;
    let teamsCount = teams.length;

    if (formData.targetRound === 'round_2') {
      teamsCount = Math.round(teams.length * 0.4) || 28;
      estimatedCount = teamsCount * 3 + 12;
    } else if (formData.targetRound === 'round_3') {
      teamsCount = 16;
      estimatedCount = 48;
    } else if (formData.targetRound === 'round_4') {
      teamsCount = 8;
      estimatedCount = 24;
    } else if (formData.targetRound === 'round_1') {
      estimatedCount = baseUsers.length || 380;
      teamsCount = teams.length || 95;
    }

    if (formData.targetInstitution !== 'all') {
      const inst = institutions.find(i => i.id === formData.targetInstitution);
      estimatedCount = inst?.registeredStudents || 24;
      teamsCount = inst?.teamsCreated || 8;
    }

    return { users: estimatedCount, teams: teamsCount };
  };

  const estimatedReach = calculateEstimatedReach();

  // Filter Announcements
  const filteredAnnouncements = announcements.filter(anc => {
    const matchesSearch =
      anc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      anc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (anc.targetAudienceLabel && anc.targetAudienceLabel.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRound = roundFilter === 'all' || anc.targetRound === roundFilter || !anc.targetRound;
    const matchesCategory = categoryFilter === 'all' || anc.category === categoryFilter;
    const matchesInst =
      instFilter === 'all' ||
      anc.targetInstitution === instFilter ||
      anc.targetInstitution === 'all' ||
      !anc.targetInstitution;

    let matchesRole = true;
    if (roleFilter !== 'all') {
      if (anc.targetRoles === 'all') matchesRole = true;
      else if (Array.isArray(anc.targetRoles)) matchesRole = anc.targetRoles.includes(roleFilter as any);
    }

    return matchesSearch && matchesRound && matchesCategory && matchesInst && matchesRole;
  });

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) return;

    // Generate readable audience label
    let audienceLabel = 'All Competition Stakeholders';
    const roundLabels: Record<string, string> = {
      round_1: 'Round 1 Quiz Candidates',
      round_2: 'Round 2 Qualified Teams',
      round_3: 'Round 3 Regional Finalists',
      round_4: 'Round 4 National Boardroom Finalists',
    };

    if (formData.targetRound !== 'all' && roundLabels[formData.targetRound]) {
      audienceLabel = roundLabels[formData.targetRound];
    }

    if (formData.targetInstitution !== 'all') {
      const inst = institutions.find(i => i.id === formData.targetInstitution);
      if (inst) {
        audienceLabel += ` • ${inst.name}`;
      }
    }

    const targetInstObj = institutions.find(i => i.id === formData.targetInstitution);

    addAnnouncement({
      title: formData.title,
      content: formData.content,
      category: formData.category,
      targetRoles: formData.targetRoles,
      targetRound: formData.targetRound,
      targetInstitution: formData.targetInstitution,
      targetInstitutionName: targetInstObj?.name,
      targetHub: formData.targetHub,
      targetAudienceLabel: audienceLabel,
      channels: formData.channels,
      isPinned: formData.isPinned,
      linkText: formData.linkText.trim() || undefined,
      linkUrl: formData.linkUrl.trim() || undefined,
    });

    setShowPublishModal(false);

    // Reset Form
    setFormData({
      title: '',
      content: '',
      category: 'Round Deadline',
      targetRound: 'round_2',
      targetRoles: ['student', 'team_leader'],
      targetInstitution: 'all',
      targetHub: 'all',
      channels: ['in_app', 'email'],
      isPinned: false,
      linkText: '',
      linkUrl: '',
    });
  };

  const getCategoryBadge = (category: Announcement['category']) => {
    switch (category) {
      case 'Critical Alert':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30';
      case 'Round Deadline':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30';
      case 'Results':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30';
      case 'Webinar & Briefing':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      default:
        return 'bg-slate-500/10 text-slate-600 border border-slate-500/30';
    }
  };

  return (
    <div id="official-bulletins-manager" className="space-y-6">
      {/* Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                Direct Broadcast & Targeting Dispatch
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Official Bulletins & Notices Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Official Bulletins & Targeted Broadcasts
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Publish executive notifications targeted precisely by competition round, qualified teams, accredited institutions, or specific stakeholder roles.
            </p>
          </div>

          <button
            id="open-publish-bulletin-modal-btn"
            onClick={() => setShowPublishModal(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-sm whitespace-nowrap"
          >
            <Send className="w-4 h-4" />
            <span>Publish Official Bulletin</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Active Bulletins</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {announcements.length} Published
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Pan-India distribution</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Pinned High-Priority</span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            {announcements.filter(a => a.isPinned).length} Urgent
          </p>
          <span className="text-[11px] text-slate-500">Pinned to student banners</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Round-Targeted</span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {announcements.filter(a => a.targetRound && a.targetRound !== 'all').length} Targeted
          </p>
          <span className="text-[11px] text-slate-500">Filtered by qualifier gates</span>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
          <span className="text-xs text-slate-500 uppercase font-semibold">Multi-Channel Push</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            3 Channels
          </p>
          <span className="text-[11px] text-slate-500">In-App • Email • SMS Alert</span>
        </div>
      </div>

      {/* Targeting Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <Target className="w-4 h-4 text-indigo-500" />
          <span>Filter Bulletins by Target Audience:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search bulletins..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Round Filter */}
          <select
            value={roundFilter}
            onChange={e => setRoundFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Competition Rounds</option>
            <option value="round_1">Round 1: Screening Quiz</option>
            <option value="round_2">Round 2: Case Deck Qualifiers</option>
            <option value="round_3">Round 3: Regional Live Finalists</option>
            <option value="round_4">Round 4: National Grand Finale</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Stakeholder Roles</option>
            <option value="student">Candidates & Team Members</option>
            <option value="evaluator">Jury Members & Evaluators</option>
            <option value="institute_coordinator">Institutional SPOCs</option>
            <option value="hub_director">Regional Hub Directors</option>
          </select>

          {/* Institution Filter */}
          <select
            value={instFilter}
            onChange={e => setInstFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Campuses & Institutes</option>
            {institutions.map(inst => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Bulletin Categories</option>
            <option value="Critical Alert">Critical Alert</option>
            <option value="Round Deadline">Round Deadline</option>
            <option value="Results">Results & Shortlists</option>
            <option value="Webinar & Briefing">Webinar & Briefing</option>
            <option value="General">General Notice</option>
          </select>
        </div>
      </div>

      {/* Bulletins List */}
      <div className="space-y-4">
        {filteredAnnouncements.map(anc => (
          <div
            key={anc.id}
            id={`bulletin-card-${anc.id}`}
            className={`bg-white dark:bg-slate-900 rounded-xl border p-5 shadow-sm transition-all ${
              anc.isPinned
                ? 'border-indigo-300 dark:border-indigo-800 bg-indigo-50/10 dark:bg-indigo-950/10'
                : 'border-slate-200 dark:border-slate-800'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="space-y-3 flex-1">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  {anc.isPinned && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <Pin className="w-3 h-3" /> Pinned
                    </span>
                  )}
                  <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${getCategoryBadge(anc.category)}`}>
                    {anc.category}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Published: {anc.date}
                  </span>

                  {/* Channels Dispatched */}
                  {anc.channels && anc.channels.length > 0 && (
                    <div className="flex items-center gap-1 ml-auto">
                      {anc.channels.includes('in_app') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
                          <Bell className="w-3 h-3 text-indigo-500" /> In-App
                        </span>
                      )}
                      {anc.channels.includes('email') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
                          <Mail className="w-3 h-3 text-blue-500" /> Email
                        </span>
                      )}
                      {anc.channels.includes('sms') && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center gap-1 font-semibold">
                          <Smartphone className="w-3 h-3 text-emerald-500" /> SMS
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                  {anc.title}
                </h3>

                {/* Target Audience Pill Box */}
                <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-semibold text-slate-500 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-indigo-500" /> Target Audience:
                  </span>

                  {/* Target Round Badge */}
                  {anc.targetRound && anc.targetRound !== 'all' ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {anc.targetRound.replace('round_', 'Round ')} Qualifiers
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      All Rounds
                    </span>
                  )}

                  {/* Target Institution Badge */}
                  {anc.targetInstitution && anc.targetInstitution !== 'all' ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {anc.targetInstitutionName || anc.targetInstitution}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      All Campuses (Pan-India)
                    </span>
                  )}

                  {/* Target Roles Badge */}
                  {anc.targetRoles && anc.targetRoles !== 'all' && Array.isArray(anc.targetRoles) ? (
                    <span className="px-2 py-0.5 rounded font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {anc.targetRoles.join(', ')}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                      All Stakeholders
                    </span>
                  )}

                  {/* Audience Label if present */}
                  {anc.targetAudienceLabel && (
                    <span className="text-slate-500 italic ml-1">
                      ({anc.targetAudienceLabel})
                    </span>
                  )}
                </div>

                {/* Content */}
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {anc.content}
                </p>

                {/* Action Link if provided */}
                {anc.linkText && (
                  <div className="pt-1">
                    <a
                      href={anc.linkUrl || '#'}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      <span>{anc.linkText}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: PUBLISH TARGETED BULLETIN */}
      {/* ========================================================================= */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
                  <Send className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Publish Official Targeted Bulletin
                  </h3>
                  <p className="text-xs text-slate-500">
                    Broadcast direct notifications filtered by Round, Institution, and Role
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowPublishModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4 pt-4">
              {/* Title & Category */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Bulletin Headline / Subject *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Round 2 Case Deck Defense Schedule Published"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Round Deadline">Round Deadline</option>
                    <option value="Critical Alert">Critical Alert</option>
                    <option value="Results">Results & Shortlist</option>
                    <option value="Webinar & Briefing">Webinar & Briefing</option>
                    <option value="General">General Notice</option>
                  </select>
                </div>
              </div>

              {/* TARGETING SECTION (Crucial user requirement) */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-indigo-600" />
                    Target Audience Specifications
                  </h4>
                  {/* Estimated Reach Display */}
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-800">
                    🎯 Est. Reach: ~{estimatedReach.users} Candidates ({estimatedReach.teams} Teams)
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Target Round */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Competition Round / Phase *
                    </label>
                    <select
                      value={formData.targetRound}
                      onChange={e => setFormData(prev => ({ ...prev, targetRound: e.target.value as any }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="all">All Competition Rounds (Pan-India)</option>
                      <option value="round_1">Round 1: Screening Quiz Candidates</option>
                      <option value="round_2">Round 2: Selected / Qualified Case Deck Teams</option>
                      <option value="round_3">Round 3: Regional Live Challenge Finalists</option>
                      <option value="round_4">Round 4: National Boardroom Grand Finalists</option>
                    </select>
                  </div>

                  {/* Target Institution */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Specific Institution / B-School
                    </label>
                    <select
                      value={formData.targetInstitution}
                      onChange={e => setFormData(prev => ({ ...prev, targetInstitution: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="all">All Accredited Campuses (Pan-India)</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.name} ({inst.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Target Persona / Role */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Stakeholder Persona
                    </label>
                    <select
                      value={formData.targetRoles === 'all' ? 'all' : (formData.targetRoles as string[])[0]}
                      onChange={e => {
                        const val = e.target.value;
                        if (val === 'all') setFormData(prev => ({ ...prev, targetRoles: 'all' }));
                        else if (val === 'candidates') setFormData(prev => ({ ...prev, targetRoles: ['student', 'team_leader'] }));
                        else if (val === 'evaluators') setFormData(prev => ({ ...prev, targetRoles: ['evaluator'] }));
                        else if (val === 'coordinators') setFormData(prev => ({ ...prev, targetRoles: ['institute_coordinator'] }));
                        else if (val === 'hub_directors') setFormData(prev => ({ ...prev, targetRoles: ['hub_director'] }));
                      }}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="all">All Stakeholders (Students, Faculty, Jury, Admins)</option>
                      <option value="candidates">Only Candidates & Team Leaders</option>
                      <option value="evaluators">Certified National Jury & Evaluators</option>
                      <option value="coordinators">Institutional B-School Coordinators (SPOCs)</option>
                      <option value="hub_directors">Regional Hub Directors</option>
                    </select>
                  </div>

                  {/* Target Regional Hub */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Target Regional Hub Zone
                    </label>
                    <select
                      value={formData.targetHub}
                      onChange={e => setFormData(prev => ({ ...prev, targetHub: e.target.value }))}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 font-medium"
                    >
                      <option value="all">All Regional Zones (Pan-India)</option>
                      {hubs.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.name} Hub ({h.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dispatch Channels */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Multi-Channel Push Broadcasts:
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes('in_app')}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            channels: checked
                              ? [...prev.channels, 'in_app']
                              : prev.channels.filter(c => c !== 'in_app'),
                          }));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>📲 In-App Dashboard Banner</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes('email')}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            channels: checked
                              ? [...prev.channels, 'email']
                              : prev.channels.filter(c => c !== 'email'),
                          }));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>📧 High-Priority Email Push</span>
                    </label>

                    <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.channels.includes('sms')}
                        onChange={e => {
                          const checked = e.target.checked;
                          setFormData(prev => ({
                            ...prev,
                            channels: checked
                              ? [...prev.channels, 'sms']
                              : prev.channels.filter(c => c !== 'sms'),
                          }));
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>💬 Critical SMS / WhatsApp Alert</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Bulletin Content */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bulletin Message Body *
                </label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={e => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Draft the official communication, instructions, timing, and requirements..."
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Optional Call to Action */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Action Button Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.linkText}
                    onChange={e => setFormData(prev => ({ ...prev, linkText: e.target.value }))}
                    placeholder="e.g., Download Case Brief"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Action URL / Target Anchor
                  </label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={e => setFormData(prev => ({ ...prev, linkUrl: e.target.value }))}
                    placeholder="e.g., #case-deck-module"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pin Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pin-announcement-checkbox"
                  checked={formData.isPinned}
                  onChange={e => setFormData(prev => ({ ...prev, isPinned: e.target.checked }))}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="pin-announcement-checkbox" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Pin to top of Candidate Dashboards as Urgent Flash Alert
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Broadcast Bulletin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
