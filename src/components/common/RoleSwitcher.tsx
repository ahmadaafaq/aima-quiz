import React, { useState, useRef, useEffect } from 'react';
import { useCompetition } from '../../context/CompetitionContext';
import { UserRole, UserProfile } from '../../types';
import {
  GraduationCap,
  Users,
  Building2,
  Scale,
  MapPin,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  ArrowRight,
  UserCheck,
  ChevronRight
} from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchRole, users, setCurrentUser } = useCompetition();
  const [isOpen, setIsOpen] = useState(false);
  const [showJuryList, setShowJuryList] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const evaluatorList = users.filter(u => u.role === 'evaluator');

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setShowJuryList(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const roles: {
    role: UserRole;
    category: string;
    title: string;
    name: string;
    org: string;
    icon: React.ElementType;
    badge: string;
    shortBadge: string;
    color: string;
    bgLight: string;
    borderAccent: string;
  }[] = [
    {
      role: 'admin',
      category: 'Secretariat & Governance',
      title: 'AIMA-ICRC Super Administrator',
      name: 'Dr. Rajan Saxena',
      org: 'AIMA Secretariat HQ (Full Command Access)',
      icon: ShieldCheck,
      badge: 'Super Admin',
      shortBadge: 'Admin Desk',
      color: 'text-red-600 dark:text-red-400',
      bgLight: 'bg-red-50 dark:bg-red-950/60',
      borderAccent: 'border-red-200 dark:border-red-800',
    },
    {
      role: 'team_leader',
      category: 'Participants & Teams',
      title: 'Student Team Leader',
      name: 'Aarav Singhania',
      org: 'IIM Bangalore (StratApex Consultants)',
      icon: GraduationCap,
      badge: 'Team Leader',
      shortBadge: 'Team Leader',
      color: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/60',
      borderAccent: 'border-blue-200 dark:border-blue-800',
    },
    {
      role: 'team_member',
      category: 'Participants & Teams',
      title: 'Student Team Member',
      name: 'Meera Nambiar',
      org: 'IIM Bangalore (Member)',
      icon: Users,
      badge: 'Team Member',
      shortBadge: 'Student Member',
      color: 'text-sky-600 dark:text-sky-400',
      bgLight: 'bg-sky-50 dark:bg-sky-950/60',
      borderAccent: 'border-sky-200 dark:border-sky-800',
    },
    {
      role: 'institute_coordinator',
      category: 'Institutional Heads',
      title: 'Institute Coordinator',
      name: 'Dr. Ananya Ray',
      org: 'IIM Bangalore (128 Students, 34 Teams)',
      icon: Building2,
      badge: 'Rank #1 Institute',
      shortBadge: 'IIMB Coordinator',
      color: 'text-purple-600 dark:text-purple-400',
      bgLight: 'bg-purple-50 dark:bg-purple-950/60',
      borderAccent: 'border-purple-200 dark:border-purple-800',
    },
    {
      role: 'evaluator',
      category: 'Jury & Evaluation',
      title: 'Jury / Evaluator Member',
      name: currentUser.role === 'evaluator' ? currentUser.name : 'Dr. Arvind Swaminathan',
      org: currentUser.role === 'evaluator' ? (currentUser.organization || currentUser.instituteName || 'National Jury Panel') : `National Jury Bench (${evaluatorList.length} Evaluators)`,
      icon: Scale,
      badge: currentUser.role === 'evaluator' ? (currentUser.speciality ? currentUser.speciality.split('&')[0].trim() : 'Certified Jury') : `${evaluatorList.length} Jurors`,
      shortBadge: 'Jury Evaluator',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/60',
      borderAccent: 'border-emerald-200 dark:border-emerald-800',
    },
    {
      role: 'regional_hub',
      category: 'Regional Hubs',
      title: 'Regional Hub Coordinator',
      name: 'Prof. Rajesh K. Sharma',
      org: 'Northern Regional Hub (New Delhi)',
      icon: MapPin,
      badge: 'Host Campus',
      shortBadge: 'North Hub Lead',
      color: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-950/60',
      borderAccent: 'border-rose-200 dark:border-rose-800',
    },
    {
      role: 'corporate_partner',
      category: 'Industry Partners',
      title: 'Corporate Case Partner',
      name: 'Vikramaditya Bajaj',
      org: 'Tata Sons Corporate Strategy Group',
      icon: Briefcase,
      badge: 'Case Sponsor',
      shortBadge: 'Tata Sons Partner',
      color: 'text-cyan-600 dark:text-cyan-400',
      bgLight: 'bg-cyan-50 dark:bg-cyan-950/60',
      borderAccent: 'border-cyan-200 dark:border-cyan-800',
    },
  ];

  const currentRoleInfo = roles.find(r => r.role === currentUser.role) || roles[0];
  const CurrentIcon = currentRoleInfo.icon;

  const handleSelectEvaluator = (evaluator: UserProfile) => {
    setCurrentUser(evaluator);
    switchRole('evaluator');
    setIsOpen(false);
    setShowJuryList(false);
  };

  return (
    <div className="relative inline-block text-left" id="role-switcher-dropdown" ref={dropdownRef}>
      {/* Sleek CTA Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 flex items-center gap-2 pl-2 pr-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs transition-all cursor-pointer group shrink-0"
        title="Switch user perspective"
        aria-expanded={isOpen}
      >
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 border ${currentRoleInfo.bgLight} ${currentRoleInfo.color} ${currentRoleInfo.borderAccent}`}>
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <div className="text-left hidden md:block max-w-[115px] lg:max-w-[135px] overflow-hidden">
          <div className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-none truncate whitespace-nowrap">
            {currentUser.name}
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-1 flex items-center gap-1 truncate whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <span className="truncate">
              {currentUser.role === 'evaluator' ? (currentUser.speciality ? currentUser.speciality.split('&')[0].trim() : 'Jury Evaluator') : currentRoleInfo.shortBadge}
            </span>
          </div>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Role Selection Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          
          {/* Header */}
          <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>Simulate Perspective</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Select any participant or evaluator persona to test live flows
              </p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
              {roles.length} Personas
            </span>
          </div>

          {/* Role List */}
          <div className="max-h-[420px] overflow-y-auto py-1 divide-y divide-slate-100 dark:divide-slate-800/60">
            {roles.map(item => {
              const Icon = item.icon;
              const isSelected = currentUser.role === item.role;
              const isEvaluator = item.role === 'evaluator';

              return (
                <div key={item.role} className="flex flex-col">
                  <div
                    className={`w-full text-left px-3.5 py-2.5 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer group ${
                      isSelected ? 'bg-blue-50/70 dark:bg-blue-950/40' : ''
                    }`}
                    onClick={() => {
                      if (isEvaluator) {
                        setShowJuryList(!showJuryList);
                      } else {
                        switchRole(item.role);
                        setIsOpen(false);
                      }
                    }}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl mt-0.5 border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.bgLight} ${item.color} ${item.borderAccent}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {item.title}
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase border ${item.bgLight} ${item.color} ${item.borderAccent}`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 font-medium truncate mt-0.5">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-400 truncate">
                        {item.org}
                      </div>
                    </div>
                    
                    {isEvaluator ? (
                      <div className="flex items-center gap-1 mt-1.5 shrink-0">
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded">
                          {evaluatorList.length} Bench
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${showJuryList ? 'rotate-90 text-emerald-500' : ''}`} />
                      </div>
                    ) : isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1.5" />
                    )}
                  </div>

                  {/* Expandable Jury Bench Sub-List */}
                  {isEvaluator && (showJuryList || isSelected) && (
                    <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border-y border-emerald-100 dark:border-emerald-900/40 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between px-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        <span>Select Certified Jury Member:</span>
                        <span>{evaluatorList.length} Evaluators</span>
                      </div>
                      
                      <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                        {evaluatorList.map(ev => {
                          const isCurrentActive = currentUser.id === ev.id;
                          return (
                            <button
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectEvaluator(ev);
                              }}
                              className={`w-full text-left p-2 rounded-xl text-xs transition-all flex items-center justify-between gap-2 cursor-pointer border ${
                                isCurrentActive
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                  : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-emerald-50 dark:hover:bg-slate-700/80'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-bold flex items-center gap-1.5 truncate">
                                  <span className="truncate">{ev.name}</span>
                                  {isCurrentActive && <UserCheck className="w-3 h-3 shrink-0" />}
                                </div>
                                <div className={`text-[10px] truncate ${isCurrentActive ? 'text-emerald-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                  {ev.organization || ev.instituteName} • <span className="font-semibold">{ev.speciality || 'General Strategy'}</span>
                                </div>
                              </div>
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono shrink-0 font-bold ${
                                isCurrentActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                              }`}>
                                {ev.experienceYears || 15}y exp
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer Info */}
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Current: <strong>{currentUser.name}</strong></span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active Session</span>
          </div>
        </div>
      )}
    </div>
  );
};


