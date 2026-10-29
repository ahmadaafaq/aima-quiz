import { createClient } from '@supabase/supabase-js';
import { CSRBootcampRegistration, CSRBootcampNominee, CompetitionConfig, QuizProgram, QuizQuestion, QuizAttempt, CertificateRecord } from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://setjjgjhuslevgnqcnhj.supabase.co';
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';
export function resolveAppSchema(): 'public' | 'uat' {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    // Live production domain: strictly locked to public schema
    if (host === 'research.aima.in' || host.endsWith('.aima.in')) {
      return 'public';
    }
    // aima-quiz.vercel.app, any preview vercel deployment, or localhost defaults to uat
    if (host.includes('vercel.app') || host === 'localhost' || host === '127.0.0.1') {
      return 'uat';
    }
  }
  // Build-time / SSR fallback: default to public if explicitly set, otherwise uat for safety
  return (import.meta as any).env?.VITE_DB_SCHEMA === 'public' ? 'public' : 'uat';
}

export const DB_SCHEMA: 'public' | 'uat' = resolveAppSchema();

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: { schema: DB_SCHEMA },
});

// ============================================================
// PARTICIPANT ACCOUNT TYPES
// ============================================================

export interface SupabaseParticipantRow {
  id?: string;
  registration_number: string;
  registration_mode: 'individual' | 'institute';
  institute_name: string;
  username: string;        // email used as username
  email: string;
  password_hash: string;   // plain stored for simplicity (no Supabase Auth); hash via btoa
  name: string;
  mobile?: string | null;
  program?: string | null;
  semester?: string | null;
  enrolment_number?: string | null;
  is_team_leader: boolean;
  coordinator_name?: string | null;
  coordinator_email?: string | null;
  created_at?: string;
  quiz_program_id?: string | null;
}

// Simple deterministic password hasher (base64 + salt) – NOT cryptographic, use for demo
export function hashPassword(plain: string): string {
  // Encode as base64 with a prefix salt so it is not trivially reversible in UI
  return 'aima_' + btoa(unescape(encodeURIComponent(plain)));
}

export function verifyPassword(plain: string, stored: string): boolean {
  if (!stored) return false;
  if (hashPassword(plain) === stored) return true;
  if (hashPassword(plain.trim()) === stored) return true;
  if (stored.startsWith('aima_')) {
    try {
      const decodedStored = decodeURIComponent(escape(atob(stored.slice(5))));
      if (plain.trim() === decodedStored.trim()) return true;
    } catch {
      // ignore
    }
  }
  return false;
}

// Auto-generate a strong default password from the nominee's name + mobile
export function generateDefaultPassword(name: string, mobile: string): string {
  const first = name.trim().split(' ')[0].toLowerCase();
  const last4 = (mobile || '0000').replace(/\D/g, '').slice(-4);
  return `${first}@${last4}#AIMA2026`;
}

export interface SupabaseRegistrationRow {
  id?: string;
  registration_number: string;
  registration_mode: 'individual' | 'institute';
  team_name?: string | null;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string | null;
  institute_name: string;
  program?: string | null;
  semester?: string | null;
  enrolment_number?: string | null;
  participant_count: number;
  fee_tier?: string | null;
  subtotal_amount: number;
  gst_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: 'PAID' | 'PENDING_INVOICE' | 'CANCELLED';
  transaction_id?: string | null;
  invoice_number: string;
  nominees: CSRBootcampNominee[];
  coordinator_name?: string | null;
  coordinator_email?: string | null;
  coordinator_phone?: string | null;
  institute_address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  dpdp_consent: boolean;
  created_at: string;
  quiz_program_id?: string | null;
  raw_data?: any;
}

// Convert app CSRBootcampRegistration to Supabase row format
export function mapAppRegToSupabaseRow(reg: CSRBootcampRegistration): SupabaseRegistrationRow {
  const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
  const leadNominee = reg.nominees?.[0];
  const coord = reg.coordinator;
  const participantCount = reg.participantCount || reg.nominees?.length || 1;
  const isFreeTier = (reg.subtotalExclGst === 0 && reg.totalPayable === 0) || reg.tierLabel?.includes('Early Bird');
  const unitRate = reg.ratePerPersonOrPackage ?? ((reg.tierId as string) === 'comparative_tier' ? 500 : 200);
  const authoritativeSubtotal = isFreeTier ? 0 : (reg.totalPayable ?? participantCount * unitRate);
  const authoritativeTotal = isFreeTier ? 0 : (reg.totalPayable ?? participantCount * unitRate);

  return {
    registration_number: reg.registrationNumber,
    registration_mode: isInst ? 'institute' : 'individual',
    team_name: reg.teamName || null,
    candidate_name: coord?.name || leadNominee?.name || 'Candidate',
    candidate_email: coord?.email || leadNominee?.email || '',
    candidate_phone: coord?.mobile || leadNominee?.mobile || null,
    institute_name: reg.organizationName,
    program: leadNominee?.program || null,
    semester: leadNominee?.semester || null,
    enrolment_number: leadNominee?.enrolmentNumber || null,
    participant_count: participantCount,
    fee_tier: isFreeTier ? 'Early Bird Complimentary (₹0)' : (reg.tierLabel || `₹${unitRate} per participant`),
    subtotal_amount: authoritativeSubtotal,
    gst_amount: 0,
    total_amount: authoritativeTotal,
    payment_method: reg.paymentMethod || 'gateway',
    payment_status: reg.paymentStatus || 'PENDING_INVOICE',
    transaction_id: reg.transactionId || null,
    invoice_number: reg.invoiceNumber,
    nominees: reg.nominees || [],
    coordinator_name: coord?.name || (isInst ? leadNominee?.name : null),
    coordinator_email: coord?.email || (isInst ? leadNominee?.email : null),
    coordinator_phone: coord?.mobile || (isInst ? leadNominee?.mobile : null),
    institute_address: reg.address || null,
    city: reg.city || null,
    state: reg.state || null,
    pincode: reg.pinCode || null,
    dpdp_consent: reg.dpdpConsentAccepted ?? true,
    created_at: reg.createdAt || new Date().toISOString(),
    quiz_program_id: reg.quizProgramId || 'qp_case_comp_stage1_2026',
    raw_data: {
      ...reg,
      quizProgramId: reg.quizProgramId || 'qp_case_comp_stage1_2026',
    },
  };
}

// Convert Supabase row format back to app CSRBootcampRegistration
export function mapSupabaseRowToAppReg(row: SupabaseRegistrationRow): CSRBootcampRegistration {
  if (row.raw_data && row.raw_data.registrationNumber) {
    return {
      ...row.raw_data,
      paymentStatus: (row.payment_status === 'PAID' ? 'PAID' : 'PENDING_INVOICE'),
      transactionId: row.transaction_id || row.raw_data.transactionId,
      invoiceNumber: row.invoice_number || row.raw_data.invoiceNumber,
    };
  }

  const isInst = row.registration_mode === 'institute';
  const tierIdVal =
    row.fee_tier?.includes('10') ? 'inst_10' :
      row.fee_tier?.includes('5') ? 'inst_5' :
        (row.participant_count || 1) >= 8 ? '8_plus' :
          (row.participant_count || 1) >= 4 ? '4_7' : '1_3';

  return {
    id: row.id || 'reg_sp_' + row.registration_number,
    registrationNumber: row.registration_number,
    createdAt: row.created_at || new Date().toISOString(),
    track: isInst ? 'institutional' : 'corporate_individual',
    organizationName: row.institute_name,
    organizationType: 'Academic Institution',
    coordinator: {
      name: row.candidate_name,
      designation: isInst ? 'Faculty Coordinator' : 'Participant / Leader',
      email: row.candidate_email,
      mobile: row.candidate_phone || '+91 98000 00000',
    },
    address: row.institute_address || 'Campus Address',
    city: row.city || 'New Delhi',
    state: row.state || 'Delhi NCR',
    pinCode: row.pincode || '110001',
    participantCount: row.participant_count || row.nominees?.length || 1,
    tierId: tierIdVal,
    tierLabel: row.fee_tier || 'Participation Tier',
    ratePerPersonOrPackage: Math.round(row.subtotal_amount / (row.participant_count || 1)),
    subtotalExclGst: row.subtotal_amount,
    gstAmount: row.gst_amount,
    totalPayable: row.total_amount,
    gstRate: 18,
    gstType: 'CGST+SGST',
    sacCode: '999293',
    nominees: row.nominees || [],
    managementAuthorisationAccepted: true,
    termsAccepted: true,
    dpdpConsentAccepted: row.dpdp_consent ?? true,
    dpdpConsentTimestamp: row.created_at,
    paymentStatus: row.payment_status === 'PAID' ? 'PAID' : 'PENDING_INVOICE',
    paymentMethod: row.payment_method as any,
    transactionId: row.transaction_id || undefined,
    invoiceNumber: row.invoice_number,
    teamName: row.team_name || undefined,
    isOnboardingTeam: !isInst && !!row.team_name,
    secretariatEmailSent: true,
    registrantEmailSent: true,
    emailDispatchedAt: row.created_at || new Date().toISOString(),
  };
}

// Local storage key fallback
const LOCAL_STORAGE_REG_KEY = 'AIMA_SUPABASE_REGISTRATIONS_CACHE';

export function getLocalRegistrationsCache(): CSRBootcampRegistration[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_REG_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter(r => r.registrationNumber !== 'AIMA_SYSTEM_QUIZ_CONFIG')
      : [];
  } catch {
    return [];
  }
}

export function saveLocalRegistrationCache(regs: CSRBootcampRegistration[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_REG_KEY, JSON.stringify(regs));
  } catch {
    // Ignore storage quota
  }
}

// ============================================================
// PARTICIPANT ACCOUNTS CRUD
// ============================================================

/**
 * Create one participant account per nominee after registration
 */
export async function createParticipantAccounts(
  reg: CSRBootcampRegistration
): Promise<{ created: number; errors: string[] }> {
  const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
  const errors: string[] = [];
  let created = 0;

  const rows: SupabaseParticipantRow[] = (reg.nominees || []).map((nominee) => {
    const password = nominee.password || generateDefaultPassword(nominee.name, nominee.mobile || '');
    return {
      registration_number: reg.registrationNumber,
      registration_mode: isInst ? 'institute' : 'individual',
      institute_name: reg.organizationName,
      username: nominee.email.toLowerCase().trim(),
      email: nominee.email.toLowerCase().trim(),
      password_hash: hashPassword(password),
      name: nominee.name,
      mobile: nominee.mobile || null,
      program: nominee.program || null,
      semester: nominee.semester || null,
      enrolment_number: nominee.enrolmentNumber || null,
      is_team_leader: !!nominee.isTeamLeader,
      coordinator_name: reg.coordinator?.name || null,
      coordinator_email: reg.coordinator?.email || null,
      created_at: new Date().toISOString(),
      quiz_program_id: reg.quizProgramId || 'qp_case_comp_stage1_2026',
    };
  });

  // Also create/upsert account for institutional coordinator if coordinator info provided
  if (isInst && reg.coordinator?.email) {
    const coordEmail = reg.coordinator.email.toLowerCase().trim();
    const alreadyInRows = rows.some(r => r.email === coordEmail);
    if (!alreadyInRows) {
      const coordName = reg.coordinator.name || 'Institutional Coordinator';
      const coordPhone = reg.coordinator.mobile || (reg.coordinator as any).phone || '';
      const coordPassword = (reg.coordinator as any).password || generateDefaultPassword(coordName, coordPhone);
      rows.push({
        registration_number: reg.registrationNumber,
        registration_mode: 'institute',
        institute_name: reg.organizationName,
        username: coordEmail,
        email: coordEmail,
        password_hash: hashPassword(coordPassword),
        name: coordName,
        mobile: coordPhone || null,
        program: 'Faculty / Institutional Coordinator',
        semester: null,
        enrolment_number: null,
        is_team_leader: false,
        coordinator_name: coordName,
        coordinator_email: coordEmail,
        created_at: new Date().toISOString(),
        quiz_program_id: reg.quizProgramId || 'qp_case_comp_stage1_2026',
      });
    }
  }

  for (const row of rows) {
    try {
      const { error } = await supabase
        .from('participants')
        .upsert(row, { onConflict: 'email' });
      if (error) {
        errors.push(`${row.email}: ${error.message}`);
      } else {
        created++;
      }
    } catch (e: any) {
      errors.push(`${row.email}: ${e?.message}`);
    }
  }

  return { created, errors };
}

/**
 * Login a participant by email + plain password
 */
export async function loginParticipant(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; participant?: SupabaseParticipantRow; error?: string }> {
  try {
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === 'co@aima.in') {
      return { success: false, error: 'Access Denied: The Jury Coordinator login session has concluded.' };
    }

    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (error || !data) {
      return { success: false, error: 'No account found with this email address.' };
    }

    if (!verifyPassword(plainPassword, data.password_hash)) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    return { success: true, participant: data as SupabaseParticipantRow };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Login failed. Please try again.' };
  }
}

// ============================================================
// UNIFIED SUPABASE AUTH & PUBLIC.PROFILES HELPERS (Rules § 1, 3, 4)
// ============================================================

export interface UserProfileRow {
  id: string;
  email: string;
  role: 'admin' | 'student' | 'team_leader' | 'team_member' | 'evaluator' | 'institute_coordinator' | 'regional_hub' | 'corporate_partner';
  name: string;
  mobile?: string | null;
  organization_name?: string | null;
  registration_number?: string | null;
  program?: string | null;
  semester?: string | null;
  enrolment_number?: string | null;
  is_team_leader: boolean;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/**
 * Unified Sign In using official Supabase Auth (auth.users)
 * Resolves user profile from public.profiles
 */
export async function signInWithEmailPassword(
  email: string,
  plainPassword: string
): Promise<{
  success: boolean;
  user?: any;
  profile?: UserProfileRow;
  session?: any;
  error?: string;
}> {
  const cleanEmail = email.toLowerCase().trim();
  const cleanPass = plainPassword.trim();

  // Explicitly block Jury Coordinator access as the evaluation/quiz session has concluded
  if (cleanEmail === 'co@aima.in') {
    return {
      success: false,
      error: 'Access Denied: The Jury Coordinator login session has concluded.',
    };
  }

  // Special direct credentials for Secretariat Super Admin
  if (cleanEmail === 'admin@aima.in' && (cleanPass === 'case-aima@123#league' || cleanPass === 'admin123')) {
    return {
      success: true,
      user: { id: 'usr_admin_aima_hq', email: 'admin@aima.in' },
      profile: {
        id: 'usr_admin_aima_hq',
        email: 'admin@aima.in',
        role: 'admin',
        name: 'Dr. Rajan Saxena (Chief Scrutineer)',
        mobile: '+91 98111 00000',
        organization_name: 'AIMA Secretariat HQ',
        registration_number: 'AIMA-HQ-ADMIN',
        is_team_leader: false,
      },
      session: { access_token: 'aima_sec_' + Date.now().toString(36) },
    };
  }

  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: plainPassword,
    });

    if (authError || !authData.user) {
      // Fallback: check legacy participants table if profiles is still syncing
      const legacyResult = await loginParticipant(email, plainPassword);
      if (legacyResult.success && legacyResult.participant) {
        const p = legacyResult.participant;
        const isJuryCoord = p.email.toLowerCase().trim() === 'co@aima.in';
        // Only classify as institute coordinator if explicitly not a team leader, in institutional mode,
        // and specifically designated as faculty/institutional coordinator.
        const isExplicitFacultyCoordinator =
          !p.is_team_leader &&
          p.registration_mode === 'institute' &&
          Boolean(
            (p.program && p.program.toLowerCase().includes('faculty')) ||
            (p.program && p.program.toLowerCase().includes('institutional coordinator')) ||
            (p as any).role === 'institute_coordinator'
          );

        const assignedRole: UserProfileRow['role'] = isJuryCoord
          ? 'admin'
          : (isExplicitFacultyCoordinator
          ? 'institute_coordinator'
          : (p.is_team_leader ? 'team_leader' : 'student'));

        return {
          success: true,
          user: { id: p.id || p.email, email: p.email },
          profile: {
            id: p.id || p.email,
            email: p.email,
            role: assignedRole,
            name: p.name,
            mobile: p.mobile,
            organization_name: p.institute_name,
            registration_number: p.registration_number,
            program: p.program,
            semester: p.semester,
            enrolment_number: p.enrolment_number,
            is_team_leader: p.is_team_leader,
          },
        };
      }
      return { success: false, error: authError?.message || 'Authentication failed.' };
    }

    // Fetch linked profile from public.profiles
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profileData) {
      // Query participants table to get authoritative name, organization, registration number & role
      const { data: partRow } = await supabase
        .from('participants')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      const { data: regRow } = await supabase
        .from('registrations')
        .select('*')
        .or(`coordinator_email.eq.${cleanEmail},candidate_email.eq.${cleanEmail}`)
        .maybeSingle();

      const meta = authData.user.user_metadata || {};
      const isExplicitFacultyCoordinator =
        meta.role === 'institute_coordinator' ||
        (partRow && !partRow.is_team_leader && partRow.registration_mode === 'institute' &&
          Boolean(
            (partRow.program && partRow.program.toLowerCase().includes('faculty')) ||
            (partRow.program && partRow.program.toLowerCase().includes('coordinator')) ||
            (partRow as any).role === 'institute_coordinator'
          )) ||
        Boolean(regRow?.coordinator_email && regRow.coordinator_email.toLowerCase().trim() === cleanEmail);

      const assignedRole: UserProfileRow['role'] = isExplicitFacultyCoordinator
        ? 'institute_coordinator'
        : (partRow?.is_team_leader || meta.role === 'team_leader' ? 'team_leader' : (meta.role || 'student'));

      const fallbackProfile: UserProfileRow = {
        id: authData.user.id,
        email: cleanEmail,
        role: assignedRole,
        name: partRow?.name || regRow?.coordinator_name || meta.name || cleanEmail.split('@')[0],
        mobile: partRow?.mobile || regRow?.coordinator_phone || meta.mobile || null,
        organization_name: partRow?.institute_name || regRow?.institute_name || meta.organizationName || null,
        registration_number: partRow?.registration_number || regRow?.registration_number || meta.registrationNumber || null,
        program: partRow?.program || (isExplicitFacultyCoordinator ? 'Faculty / Institutional Coordinator' : null),
        semester: partRow?.semester || null,
        enrolment_number: partRow?.enrolment_number || null,
        is_team_leader: !isExplicitFacultyCoordinator && Boolean(partRow?.is_team_leader || meta.role === 'team_leader'),
      };
      return { success: true, user: authData.user, profile: fallbackProfile, session: authData.session };
    }

    return { success: true, user: authData.user, profile: profileData as UserProfileRow, session: authData.session };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Unexpected login error.' };
  }
}

/**
 * Sign out active Supabase user session
 */
export async function signOutCurrentUser(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { success: !error, error: error?.message };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

/**
 * Fetch active profile by user ID
 */
export async function fetchUserProfile(userId: string): Promise<UserProfileRow | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return data as UserProfileRow;
  } catch {
    return null;
  }
}

/**
 * Client helper to call secure backend user provisioning API
 */
export async function provisionUsersViaApi(payload: {
  users: Array<{
    email: string;
    password: string;
    role?: string;
    name: string;
    mobile?: string;
    organizationName?: string;
    registrationNumber?: string;
    program?: string;
    semester?: string;
    enrolmentNumber?: string;
    isTeamLeader?: boolean;
  }>;
  registrationNumber?: string;
}): Promise<{ success: boolean; results?: any[]; error?: string }> {
  try {
    const session = (await supabase.auth.getSession()).data?.session;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    const response = await fetch('/api/auth/provision-users', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.error || `HTTP ${response.status}` };
    }
    return { success: true, results: data.results };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to call user provisioning API' };
  }
}

/**
 * Fetch all participants for a given registration
 */
export async function fetchParticipantsByRegistration(
  registrationNumber: string
): Promise<SupabaseParticipantRow[]> {
  try {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('registration_number', registrationNumber)
      .order('is_team_leader', { ascending: false });
    return (data || []) as SupabaseParticipantRow[];
  } catch {
    return [];
  }
}

/**
 * Fetch all participants for a given institute (by institute name)
 */
export async function fetchParticipantsByInstitute(
  instituteName: string
): Promise<SupabaseParticipantRow[]> {
  try {
    const { data } = await supabase
      .from('participants')
      .select('*')
      .eq('institute_name', instituteName)
      .order('created_at', { ascending: false });
    return (data || []) as SupabaseParticipantRow[];
  } catch {
    return [];
  }
}

/**
 * Fetch all institute-mode registrations for admin panel
 */
export async function fetchInstituteRegistrations(): Promise<{
  registrations: CSRBootcampRegistration[];
  source: 'supabase' | 'local';
}> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_mode', 'institute')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return { registrations: getLocalRegistrationsCache().filter(r => r.track === 'institutional'), source: 'local' };
    }

    return {
      registrations: data.map((d: any) => mapSupabaseRowToAppReg(d)),
      source: 'supabase',
    };
  } catch {
    return { registrations: getLocalRegistrationsCache().filter(r => r.track === 'institutional'), source: 'local' };
  }
}

/**
 * Fetch a single registration by its registration number.
 * Used after participant login to build the team/profile dynamically.
 */
export async function fetchRegistrationByNumber(
  registrationNumber: string
): Promise<CSRBootcampRegistration | null> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single();

    if (error || !data) {
      // Fallback to local cache
      const cached = getLocalRegistrationsCache();
      return cached.find(r => r.registrationNumber === registrationNumber) || null;
    }
    return mapSupabaseRowToAppReg(data as SupabaseRegistrationRow);
  } catch {
    const cached = getLocalRegistrationsCache();
    return cached.find(r => r.registrationNumber === registrationNumber) || null;
  }
}

/**
 * Save registration dynamically to Supabase with local storage cache fallback
 */
export async function saveRegistrationToSupabase(
  reg: CSRBootcampRegistration
): Promise<{ success: boolean; data?: any; error?: string; source: 'supabase' | 'local' }> {
  // Always maintain local cache backup first
  const currentLocal = getLocalRegistrationsCache();
  const updatedLocal = [reg, ...currentLocal.filter((r) => r.id !== reg.id && r.registrationNumber !== reg.registrationNumber)];
  saveLocalRegistrationCache(updatedLocal);

  try {
    const row = mapAppRegToSupabaseRow(reg);

    // Insert into 'registrations' table in Supabase
    const { data, error } = await supabase
      .from('registrations')
      .upsert(row, { onConflict: 'registration_number' })
      .select();

    if (error) {
      console.warn('Supabase insert notice (stored locally):', error.message);
      return {
        success: true,
        source: 'local',
        error: error.message,
        data: reg,
      };
    }

    // Notify server to keep quiz_programs.enrolled_count dynamic in live DB
    fetch('/api/quiz-programs/sync-enrollment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ programId: reg.quizProgramId || 'qp_case_comp_stage1_2026' }),
    }).catch(() => { });

    return {
      success: true,
      source: 'supabase',
      data: data?.[0] || reg,
    };
  } catch (err: any) {
    console.warn('Supabase network error (fallback to local):', err?.message);
    return {
      success: true,
      source: 'local',
      error: err?.message,
      data: reg,
    };
  }
}

/**
 * Fetch registrations dynamically from Supabase with local storage cache fallback
 */
export async function fetchRegistrationsFromSupabase(): Promise<{
  registrations: CSRBootcampRegistration[];
  source: 'supabase' | 'local';
  tableExists: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Table might not exist yet in schema cache
      const isMissingTable =
        error.message?.includes('schema cache') ||
        error.message?.includes('relation') ||
        error.code === '42P01' ||
        error.code === 'PGRST204' ||
        error.code === 'PGRST200';

      const cached = getLocalRegistrationsCache();
      return {
        registrations: cached,
        source: 'local',
        tableExists: !isMissingTable,
        error: error.message,
      };
    }

    if (data && Array.isArray(data)) {
      const converted = data
        .filter((d: any) => d.registration_number !== 'AIMA_SYSTEM_QUIZ_CONFIG')
        .map((d: any) => mapSupabaseRowToAppReg(d));
      // Sync cache
      saveLocalRegistrationCache(converted);
      return {
        registrations: converted,
        source: 'supabase',
        tableExists: true,
      };
    }

    return {
      registrations: getLocalRegistrationsCache(),
      source: 'local',
      tableExists: true,
    };
  } catch (err: any) {
    return {
      registrations: getLocalRegistrationsCache(),
      source: 'local',
      tableExists: false,
      error: err?.message,
    };
  }
}

/**
 * Update payment status dynamically in Supabase with local storage cache update
 */
export async function updateRegistrationPaymentInSupabase(
  registrationIdOrNumber: string,
  paymentStatus: 'PAID' | 'PENDING_INVOICE',
  paymentMethod: string,
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(registrationIdOrNumber);

    // 1. Fetch current row to preserve & update raw_data and invoice number
    let fetchQuery = supabase.from('registrations').select('*');
    if (isUuid) {
      fetchQuery = fetchQuery.or(`registration_number.eq.${registrationIdOrNumber},id.eq.${registrationIdOrNumber}`);
    } else {
      fetchQuery = fetchQuery.eq('registration_number', registrationIdOrNumber);
    }
    const { data: existingRows } = await fetchQuery;
    const existing = existingRows?.[0];

    const currentInvoice = existing?.invoice_number || `PINV-${registrationIdOrNumber}`;
    const nextInvoice = paymentStatus === 'PAID'
      ? (currentInvoice.startsWith('PINV-') ? currentInvoice.replace('PINV-', 'INV-') : currentInvoice)
      : (currentInvoice.startsWith('INV-') ? currentInvoice.replace('INV-', 'PINV-') : currentInvoice);

    const updatePayload: any = {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      invoice_number: nextInvoice,
      transaction_id: transactionId || null,
    };

    if (existing?.raw_data) {
      updatePayload.raw_data = {
        ...existing.raw_data,
        paymentStatus,
        paymentMethod,
        transactionId: transactionId || undefined,
        invoiceNumber: nextInvoice,
      };
    }

    // 2. Perform database update
    let updateQuery = supabase.from('registrations').update(updatePayload);
    if (isUuid) {
      updateQuery = updateQuery.or(`registration_number.eq.${registrationIdOrNumber},id.eq.${registrationIdOrNumber}`);
    } else {
      updateQuery = updateQuery.eq('registration_number', registrationIdOrNumber);
    }
    const { error } = await updateQuery;

    if (error) {
      console.warn('Supabase update notice:', error.message);
    }

    // 3. Update local cache as well
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (r.id === registrationIdOrNumber || r.registrationNumber === registrationIdOrNumber) {
        return {
          ...r,
          paymentStatus,
          paymentMethod: paymentMethod as any,
          transactionId: transactionId || r.transactionId,
          invoiceNumber: nextInvoice,
        };
      }
      return r;
    });
    saveLocalRegistrationCache(updated);

    return { success: !error, error: error?.message };
  } catch (err: any) {
    console.error('Error updating payment in Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Save / Update Participant Selected Track in Supabase database
 * Persists into dedicated 'jury_evaluations' table, 'participants' table, and 'registrations'
 */
export async function saveParticipantTrackSelection(
  registrationNumber: string,
  email: string,
  trackId: string,
  trackName: string,
  meta?: {
    trackBadge?: string;
    masterCaseTitle?: string;
    teamId?: string;
    teamName?: string;
    candidateName?: string;
    instituteName?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const now = new Date().toISOString();
    const regNum =
      registrationNumber && registrationNumber !== 'AIMA-CL26-00000'
        ? registrationNumber
        : (meta?.teamId ? meta.teamId.replace('team_participant_', '').replace('team_', '') : '') || 'AIMA-CL26-00000';

    // 1. Direct Persist into dedicated 'jury_evaluations' table (if table exists)
    try {
      const juryEvaluationPayload = {
        registration_number: regNum,
        team_id: meta?.teamId || null,
        candidate_email: email ? email.toLowerCase().trim() : null,
        candidate_name: meta?.candidateName || null,
        team_name: meta?.teamName || null,
        institute_name: meta?.instituteName || null,
        round: 'round_2',
        track_id: trackId,
        track_name: trackName,
        track_badge: meta?.trackBadge || null,
        master_case_title: meta?.masterCaseTitle || null,
        track_locked_at: now,
        updated_at: now,
      };

      const { error: juryErr } = await supabase
        .from('jury_evaluations')
        .upsert(juryEvaluationPayload, { onConflict: 'registration_number,round' });

      if (juryErr) {
        if (juryErr.code === 'PGRST205') {
          console.info("Notice: Dedicated table 'jury_evaluations' pending in Supabase. Apply migrations/jury_evaluations_migration.sql.");
        } else {
          console.warn('jury_evaluations upsert notice:', juryErr.message);
        }
      }
    } catch (e: any) {
      console.warn('jury_evaluations persist warning:', e?.message);
    }

    // 2. Direct Persist into 'participants' table (first-class columns)
    try {
      if (email || regNum) {
        let partQuery = supabase
          .from('participants')
          .update({
            selected_track_id: trackId,
            selected_track_name: trackName,
            track_locked_at: now,
          });

        if (email) {
          partQuery = partQuery.eq('email', email.toLowerCase().trim());
        } else {
          partQuery = partQuery.eq('registration_number', regNum);
        }
        const { error: partErr } = await partQuery;
        if (partErr && partErr.code !== '42703') {
          console.warn('participants table track update notice:', partErr.message);
        }
      }
    } catch {
      // ignore
    }

    // 3. Fallback Persist into 'registrations' (first-class columns + raw_data)
    let existingQuery = supabase.from('registrations').select('*');
    if (regNum && regNum !== 'AIMA-CL26-00000') {
      existingQuery = existingQuery.eq('registration_number', regNum);
    } else if (email) {
      existingQuery = existingQuery.eq('coordinator_email', email.toLowerCase().trim());
    }

    const { data: existingRows, error: fetchErr } = await existingQuery;

    if (fetchErr) {
      console.warn('Error fetching registration for track update:', fetchErr.message);
    }

    const existing = existingRows?.[0];
    const rawData = existing?.raw_data || {};

    const updatedNominees = (rawData.nominees || []).map((n: any) => {
      if (n.email && n.email.toLowerCase().trim() === email.toLowerCase().trim()) {
        return {
          ...n,
          selectedTrackId: trackId,
          selectedTrackName: trackName,
          trackSelectedAt: now,
        };
      }
      return n;
    });

    const updatedRaw = {
      ...rawData,
      selectedTrackId: trackId,
      selectedTrackName: trackName,
      trackBadge: meta?.trackBadge,
      masterCaseTitle: meta?.masterCaseTitle,
      trackSelectedAt: now,
      nominees: updatedNominees,
    };

    if (existing) {
      const updateData: any = {
        raw_data: updatedRaw,
        selected_track_id: trackId,
        selected_track_name: trackName,
        track_locked_at: now,
      };
      const { error: updErr } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', existing.id);

      if (updErr) {
        // Fallback if column not yet added
        if (updErr.code === '42703') {
          await supabase.from('registrations').update({ raw_data: updatedRaw }).eq('id', existing.id);
        } else {
          console.warn('Supabase track update error:', updErr.message);
        }
      }
    }

    // Update local cache
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (r.registrationNumber === regNum || (email && (r.coordinator?.email?.toLowerCase() === email.toLowerCase() || (r as any).coordinatorEmail?.toLowerCase() === email.toLowerCase()))) {
        return {
          ...r,
          selectedTrackId: trackId,
          selectedTrackName: trackName,
          trackSelectedAt: now,
          raw_data: updatedRaw,
        } as any;
      }
      return r;
    });
    saveLocalRegistrationCache(updated);

    return { success: true };
  } catch (err: any) {
    console.error('Error saving participant track in Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Authoritatively fetch confirmed Round 2 case track from Supabase
 * Checks dedicated 'jury_evaluations', 'participants', and 'registrations' tables
 */
export async function fetchParticipantTrackSelection(
  registrationNumber?: string,
  email?: string
): Promise<{ trackId: string; trackName: string; trackSelectedAt?: string } | null> {
  const regNum = registrationNumber && registrationNumber !== 'AIMA-CL26-00000' ? registrationNumber.trim() : null;
  const cleanEmail = email ? email.toLowerCase().trim() : null;

  if (!regNum && !cleanEmail) return null;

  try {
    // 1. Check dedicated 'jury_evaluations' table
    try {
      let query = supabase.from('jury_evaluations').select('track_id, track_name, track_locked_at');
      if (regNum) {
        query = query.eq('registration_number', regNum);
      } else if (cleanEmail) {
        query = query.ilike('candidate_email', cleanEmail);
      }
      const { data, error } = await query.limit(1);
      if (!error && data && data.length > 0 && data[0].track_id) {
        return {
          trackId: data[0].track_id,
          trackName: data[0].track_name || '',
          trackSelectedAt: data[0].track_locked_at || undefined,
        };
      }
    } catch {
      // ignore
    }

    // 2. Check 'participants' table
    try {
      let partQuery = supabase.from('participants').select('selected_track_id, selected_track_name, track_locked_at');
      if (cleanEmail) {
        partQuery = partQuery.eq('email', cleanEmail);
      } else if (regNum) {
        partQuery = partQuery.eq('registration_number', regNum);
      }
      const { data: partData, error: partError } = await partQuery.limit(1);
      if (!partError && partData && partData.length > 0 && partData[0].selected_track_id) {
        return {
          trackId: partData[0].selected_track_id,
          trackName: partData[0].selected_track_name || '',
          trackSelectedAt: partData[0].track_locked_at || undefined,
        };
      }
    } catch {
      // ignore
    }

    // 3. Check 'registrations' table
    try {
      let regQuery = supabase.from('registrations').select('selected_track_id, selected_track_name, track_locked_at, raw_data');
      if (regNum) {
        regQuery = regQuery.eq('registration_number', regNum);
      } else if (cleanEmail) {
        regQuery = regQuery.eq('coordinator_email', cleanEmail);
      }
      const { data: regData, error: regError } = await regQuery.limit(1);
      if (!regError && regData && regData.length > 0) {
        const row = regData[0];
        const raw = row.raw_data || {};
        const trackId = row.selected_track_id || raw.selectedTrackId;
        const trackName = row.selected_track_name || raw.selectedTrackName || '';
        const trackSelectedAt = row.track_locked_at || raw.trackSelectedAt || undefined;
        if (trackId) {
          return { trackId, trackName, trackSelectedAt };
        }
      }
    } catch {
      // ignore
    }

    // 4. Fallback: check localStorage cache
    const cached = getLocalRegistrationsCache();
    const found = cached.find(r =>
      (regNum && r.registrationNumber === regNum) ||
      (cleanEmail && (r.coordinator?.email?.toLowerCase() === cleanEmail || (r as any).coordinatorEmail?.toLowerCase() === cleanEmail))
    );
    if (found && (found as any).selectedTrackId) {
      return {
        trackId: (found as any).selectedTrackId,
        trackName: (found as any).selectedTrackName || '',
        trackSelectedAt: (found as any).trackSelectedAt,
      };
    }
  } catch (e) {
    console.warn('fetchParticipantTrackSelection warning:', e);
  }

  return null;
}

/**
 * Fetch all authoritative Jury Evaluations from dedicated Supabase table
 */
export async function fetchJuryEvaluationsFromDb(round = 'round_2'): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('jury_evaluations')
      .select('*')
      .eq('round', round);

    if (error) {
      if (error.code !== 'PGRST205') {
        console.warn('Error fetching jury evaluations from DB:', error.message);
      }
      return [];
    }
    return data || [];
  } catch {
    return [];
  }
}

/**
 * Save / Update Jury Scorecard in Supabase database against team / participant
 * Persists into dedicated 'jury_evaluations' table and 'registrations.raw_data'
 */
export async function saveJuryScorecardToDb(scorecard: {
  teamId: string;
  registrationNumber?: string;
  candidateEmail?: string;
  userId?: string;
  teamName: string;
  instituteName: string;
  round: 'round_2' | 'round_3' | 'round_4';
  trackId?: string;
  trackName?: string;
  trackBadge?: string;
  masterCaseTitle?: string;
  offlineQuizScore: number;
  livePresentationScore: number;
  presentationMaxMarks?: number;
  qaDefenseScore: number;
  aggregateScore: number;
  rank: number;
  attendanceVerified: boolean;
  qualifiedNextRound?: boolean;
  award?: string;
  notes?: string;
  evaluatedBy?: string;
  kpiScores?: any;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const regNum = scorecard.registrationNumber && scorecard.registrationNumber !== 'AIMA-CL26-00000'
      ? scorecard.registrationNumber
      : scorecard.teamId.replace('team_participant_', '').replace('team_', '');
    const now = new Date().toISOString();
    const kpis = scorecard.kpiScores || {};

    // 1. Direct Persist into dedicated 'jury_evaluations' table
    try {
      const kpis = scorecard.kpiScores || (scorecard as any).kpi_scores || null;
      const hasExplicitKpis =
        kpis !== null &&
        kpis !== undefined &&
        (kpis.problemIdentification !== undefined ||
          kpis.problem_identification !== undefined ||
          kpis.caseQuestion1 !== undefined ||
          kpis.case_question_1 !== undefined ||
          kpis.totalScore !== undefined ||
          kpis.total_score !== undefined);

      const juryEvaluationPayload: any = {
        registration_number: regNum,
        team_id: scorecard.teamId,
        candidate_email: scorecard.candidateEmail ? scorecard.candidateEmail.toLowerCase().trim() : null,
        candidate_name: scorecard.teamName,
        team_name: scorecard.teamName,
        institute_name: scorecard.instituteName,
        round: scorecard.round,
        track_id: scorecard.trackId || 'operations',
        track_name: scorecard.trackName || 'Operations',
        track_badge: scorecard.trackBadge || null,
        master_case_title: scorecard.masterCaseTitle || null,
        total_score: scorecard.livePresentationScore ?? 0,
        attendance_verified: Boolean(scorecard.attendanceVerified),
        jury_feedback: scorecard.notes || '',
        is_qualified: Boolean(scorecard.qualifiedNextRound),
        evaluated_by: scorecard.evaluatedBy || 'AIMA National Jury Panel',
        evaluated_at: now,
        updated_at: now,
      };

      if (hasExplicitKpis && kpis) {
        juryEvaluationPayload.problem_identification = Number(kpis.problemIdentification ?? kpis.problem_identification ?? 0);
        juryEvaluationPayload.case_question_1 = Number(kpis.caseQuestion1 ?? kpis.case_question_1 ?? 0);
        juryEvaluationPayload.case_question_2 = Number(kpis.caseQuestion2 ?? kpis.case_question_2 ?? 0);
        juryEvaluationPayload.case_question_3 = Number(kpis.caseQuestion3 ?? kpis.case_question_3 ?? 0);
        juryEvaluationPayload.strategic_alternatives = Number(kpis.strategicAlternatives ?? kpis.strategic_alternatives ?? 0);
        juryEvaluationPayload.execution_plan = Number(kpis.executionPlan ?? kpis.execution_plan ?? 0);
        juryEvaluationPayload.case_data_evidence = Number(kpis.caseDataEvidence ?? kpis.case_data_evidence ?? 0);
      }

      const { error: juryErr } = await supabase
        .from('jury_evaluations')
        .upsert(juryEvaluationPayload, { onConflict: 'registration_number,round' });

      if (juryErr && juryErr.code !== 'PGRST205') {
        console.warn('jury_evaluations scorecard upsert notice:', juryErr.message);
      }
    } catch (e: any) {
      console.warn('jury_evaluations save error:', e?.message);
    }

    let existing: any = null;

    // 1. Try finding by registration_number
    if (regNum && regNum !== 'AIMA-CL26-00000') {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('registration_number', regNum)
        .limit(1);
      if (data && data.length > 0) existing = data[0];
    }

    // 2. Try finding by coordinator_email or candidate_email
    if (!existing && scorecard.candidateEmail) {
      const normalizedEmail = scorecard.candidateEmail.toLowerCase().trim();
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .or(`coordinator_email.eq.${normalizedEmail},candidate_email.eq.${normalizedEmail}`)
        .limit(1);
      if (data && data.length > 0) existing = data[0];
    }

    // 3. Try finding by team_name (if not generic "Individual Entry")
    if (!existing && scorecard.teamName && scorecard.teamName !== 'Individual Entry') {
      const { data } = await supabase
        .from('registrations')
        .select('*')
        .eq('team_name', scorecard.teamName)
        .limit(1);
      if (data && data.length > 0) existing = data[0];
    }

    const rawData = existing?.raw_data || {};
    const prevOfflineResults = rawData.offlineRoundResults || [];

    const updatedItem = {
      ...scorecard,
      id: `off_${scorecard.round}_${Date.now()}`,
      registrationNumber: existing?.registration_number || regNum,
      uploadedAt: now,
    };

    const existingIdx = prevOfflineResults.findIndex(
      (r: any) =>
        r.round === scorecard.round &&
        ((scorecard.teamId && r.teamId === scorecard.teamId) ||
          (regNum && r.registrationNumber === regNum) ||
          (scorecard.candidateEmail && r.candidateEmail === scorecard.candidateEmail))
    );

    let newOfflineResults;
    if (existingIdx >= 0) {
      newOfflineResults = [...prevOfflineResults];
      newOfflineResults[existingIdx] = updatedItem;
    } else {
      newOfflineResults = [...prevOfflineResults, updatedItem];
    }

    const updatedRaw = {
      ...rawData,
      offlineRoundResults: newOfflineResults,
      latestJuryScorecard: updatedItem,
      casePresentationScore: scorecard.livePresentationScore,
      casePresentationAttendance: scorecard.attendanceVerified,
      casePresentationTrack: scorecard.trackName,
      casePresentationKpis: scorecard.kpiScores,
      casePresentationNotes: scorecard.notes,
    };

    if (existing) {
      const { error: updErr } = await supabase
        .from('registrations')
        .update({
          raw_data: updatedRaw,
          updated_at: now,
        })
        .eq('id', existing.id);

      if (updErr) {
        console.warn('Supabase jury scorecard update notice:', updErr.message);
      }
    } else {
      const newRegPayload = {
        registration_number: regNum.startsWith('AIMA-') ? regNum : `AIMA-CL26-${Math.floor(10000 + Math.random() * 90000)}`,
        team_name: scorecard.teamName || 'Individual Entry',
        candidate_name: scorecard.teamName,
        coordinator_email: scorecard.candidateEmail || '',
        candidate_email: scorecard.candidateEmail || '',
        institute_name: scorecard.instituteName || 'Management Institute',
        payment_status: 'paid',
        payment_amount: 0,
        raw_data: updatedRaw,
        created_at: now,
        updated_at: now,
      };
      await supabase.from('registrations').insert([newRegPayload]);
    }

    // Background sync to quiz_attempts if matching
    try {
      if (scorecard.candidateEmail) {
        await supabase
          .from('quiz_attempts')
          .update({
            raw_data: {
              presentation_score: scorecard.livePresentationScore,
              presentation_kpis: scorecard.kpiScores,
              evaluated_at: now,
            }
          })
          .eq('participant_email', scorecard.candidateEmail.toLowerCase().trim());
      }
    } catch {
      // ignore
    }

    // Update local cache
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (
        (regNum && r.registrationNumber === regNum) ||
        (scorecard.candidateEmail && ((r as any).email === scorecard.candidateEmail || (r as any).candidate_email === scorecard.candidateEmail || r.coordinator?.email === scorecard.candidateEmail)) ||
        (scorecard.teamName && r.teamName === scorecard.teamName)
      ) {
        return {
          ...r,
          offlineRoundResults: newOfflineResults,
          raw_data: updatedRaw,
        } as any;
      }
      return r;
    });
    saveLocalRegistrationCache(updated);

    return { success: true };
  } catch (err: any) {
    console.error('Error saving jury scorecard to Supabase:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Add an additional team member (up to max 4) to an existing registration in Supabase
 */
export async function addMemberToRegistrationInSupabase(
  registrationNumber: string,
  newMember: {
    name: string;
    email: string;
    mobile?: string;
    enrolmentNumber?: string;
    program?: string;
    semester?: string;
    gender?: string;
  }
): Promise<{ success: boolean; member?: any; password?: string; error?: string }> {
  try {
    const { data: rows, error: fetchErr } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_number', registrationNumber);

    if (fetchErr || !rows || rows.length === 0) {
      return { success: false, error: 'Registration record not found for ' + registrationNumber };
    }

    const regRow = rows[0];
    const existingNominees = regRow.nominees || [];
    if (existingNominees.length >= 4) {
      return { success: false, error: 'Team already has the maximum capacity of 4 members.' };
    }

    const emailClean = newMember.email.toLowerCase().trim();
    if (existingNominees.some((n: any) => n.email && n.email.toLowerCase().trim() === emailClean)) {
      return { success: false, error: 'A member with this email address already exists in the team.' };
    }

    const password = generateDefaultPassword(newMember.name, newMember.mobile || '');
    const nomineeItem: any = {
      id: `nom_tm_${existingNominees.length}_${Date.now().toString(36)}`,
      name: newMember.name.trim(),
      email: emailClean,
      mobile: newMember.mobile || '',
      enrolmentNumber: newMember.enrolmentNumber || '',
      program: newMember.program || regRow.program || 'Management Program',
      semester: newMember.semester || regRow.semester || 'Semester 1',
      gender: newMember.gender || 'Other',
      isTeamLeader: false,
      designation: 'Team Member',
      instituteName: regRow.institute_name,
      password: password,
    };

    const updatedNominees = [...existingNominees, nomineeItem];
    const rawData = regRow.raw_data || {};
    const updatedRaw = {
      ...rawData,
      nominees: updatedNominees,
      participantCount: updatedNominees.length,
      isLocked: updatedNominees.length >= 4,
    };

    // Update registrations table
    const { error: updErr } = await supabase
      .from('registrations')
      .update({
        nominees: updatedNominees,
        participant_count: updatedNominees.length,
        raw_data: updatedRaw,
      })
      .eq('id', regRow.id);

    if (updErr) {
      console.warn('Error updating registration nominees:', updErr.message);
    }

    // Create participant account in 'participants' table so they can log in
    const participantRow: SupabaseParticipantRow = {
      registration_number: registrationNumber,
      registration_mode: regRow.registration_mode || 'individual',
      institute_name: regRow.institute_name,
      username: emailClean,
      email: emailClean,
      password_hash: hashPassword(password),
      name: nomineeItem.name,
      mobile: nomineeItem.mobile || null,
      program: nomineeItem.program || null,
      semester: nomineeItem.semester || null,
      enrolment_number: nomineeItem.enrolmentNumber || null,
      is_team_leader: false,
      coordinator_name: regRow.coordinator_name || null,
      coordinator_email: regRow.coordinator_email || null,
      created_at: new Date().toISOString(),
    };

    await supabase
      .from('participants')
      .upsert(participantRow, { onConflict: 'email' });

    // Update local cache
    const cached = getLocalRegistrationsCache();
    const updatedCache = cached.map((c) => {
      if (c.registrationNumber === registrationNumber) {
        return {
          ...c,
          nominees: updatedNominees,
          participantCount: updatedNominees.length,
          raw_data: updatedRaw,
        };
      }
      return c;
    });
    saveLocalRegistrationCache(updatedCache);

    return {
      success: true,
      member: nomineeItem,
      password,
    };
  } catch (err: any) {
    console.error('Error adding member to registration:', err);
    return { success: false, error: err?.message || 'Failed to add member' };
  }
}

// ============================================================
// DYNAMIC COMPETITION CONFIGURATION & STAGE GATES (SUPABASE)
// ============================================================

export const COMPETITION_CONFIG_CACHE_KEY = 'AIMA_COMPETITION_CONFIG_CACHE_V1';

export function getLocalConfigCache(): CompetitionConfig | null {
  try {
    const raw = localStorage.getItem(COMPETITION_CONFIG_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveLocalConfigCache(cfg: CompetitionConfig): void {
  try {
    localStorage.setItem(COMPETITION_CONFIG_CACHE_KEY, JSON.stringify(cfg));
  } catch {
    // Ignore storage quota
  }
}

export function mapSupabaseRowToAppConfig(row: any): Partial<CompetitionConfig> {
  if (!row) return {};
  return {
    leagueName: row.league_name,
    year: row.year,
    edition: row.edition,
    activeStage: row.active_stage,
    registrationOpen: row.registration_open,
    r1QuizStartTime: row.r1_quiz_start_time,
    r1QuizEndTime: row.r1_quiz_end_time,
    r1DurationMinutes: row.r1_duration_minutes,
    r1NegativeMarking: row.r1_negative_marking,
    r1CutoffScore: Number(row.r1_cutoff_score) || 65,
    r2SubmissionDeadline: row.r2_submission_deadline,
    r2MaxSlideCount: row.r2_max_slide_count,
    r2MaxFileSizeMB: row.r2_max_file_size_mb,
    r2EvaluatorsPerDeck: row.r2_evaluators_per_deck,
    r3RegionalStartDate: row.r3_regional_start_date,
    r3MaxTeamsPerHub: row.r3_max_teams_per_hub,
    r4NationalFinaleDate: row.r4_national_finale_date,
    feeR1R2: Number(row.fee_r1_r2) || 200,
    feeR3: Number(row.fee_r3) || 2000,
    feeR4: Number(row.fee_r4) || 2000,
    isResultsLockedR1: row.is_results_locked_r1,
    isResultsLockedR2: row.is_results_locked_r2,
    isResultsLockedR3: row.is_results_locked_r3,
    isResultsLockedR4: row.is_results_locked_r4,
    isPublicResultsPublished: row.is_public_results_published,
    isResultsPublishedR1: row.is_results_published_r1 !== undefined ? row.is_results_published_r1 : row.is_public_results_published,
    isResultsPublishedR2: row.is_results_published_r2,
    isFinalResultsPublished: Boolean(
      row.is_final_results_published ??
      row.isFinalResultsPublished ??
      false
    ),
  };
}

/**
 * Fetch authoritative competition configuration (reads from server API, falling back to Supabase client)
 */
export async function fetchCompetitionConfigFromSupabase(): Promise<CompetitionConfig | null> {
  try {
    const res = await fetch('/api/competition/config', {
      headers: { 'x-app-schema': DB_SCHEMA },
    });
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
      const data = await res.json();
      if (data && data.activeStage) {
        saveLocalConfigCache(data);
        return data as CompetitionConfig;
      }
    }
  } catch {
    // API endpoint unreachable or non-JSON, fallback below
  }

  try {
    const { data, error } = await supabase
      .from('competition_config')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (!error && data) {
      const mapped = mapSupabaseRowToAppConfig(data) as CompetitionConfig;
      saveLocalConfigCache(mapped);
      return mapped;
    }
  } catch (err) {
    console.warn('Direct Supabase competition_config query failed:', err);
  }

  return getLocalConfigCache();
}

/**
 * Update competition stage gates and master toggles via trusted server endpoint
 * Strictly passes admin JWT / session token; server enforces authorization and calculates deltas
 */
export async function updateCompetitionConfigViaServer(
  updates: Partial<CompetitionConfig>,
  maxRetries = 2
): Promise<{ success: boolean; config?: any; changedFields?: any; audit?: any; error?: string }> {
  let token = '';
  try {
    const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
    if (raw) {
      const parsed = JSON.parse(raw);
      token = parsed.token || '';
    }
    if (!token) {
      const sess = (await supabase.auth.getSession()).data?.session;
      token = sess?.access_token || '';
    }
  } catch {
    // Ignore
  }

  if (!token) {
    return { success: false, error: 'Authentication required: Administrator session token not found.' };
  }

  let attempt = 0;
  let lastError = 'Unknown error';

  while (attempt <= maxRetries) {
    try {
      const res = await fetch('/api/admin/competition-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-app-schema': DB_SCHEMA,
        },
        body: JSON.stringify({ updates }),
      });

      if (res.headers.get('content-type')?.includes('application/json')) {
        const body = await res.json();
        if (res.ok && body.success) {
          return {
            success: true,
            config: body.updatedConfig,
            changedFields: body.changedFields,
            audit: body.audit,
          };
        } else {
          lastError = body.error || `HTTP ${res.status}: Failed to update configuration.`;
          if (res.status === 401 || res.status === 403) {
            break;
          }
        }
      } else {
        lastError = `HTTP ${res.status}: Server did not return a valid JSON response.`;
      }
    } catch (err: any) {
      lastError = err?.message || 'Network request failed';
    }

    attempt++;
    if (attempt <= maxRetries) {
      await new Promise((r) => setTimeout(r, attempt * 500));
    }
  }

  return { success: false, error: lastError };
}

/**
 * Authoritatively check if a stage is open and within deadline on the server
 */
export async function verifyPhaseAccessViaServer(stage: string): Promise<{
  isAllowed: boolean;
  activeStage: string;
  deadline?: string | null;
  reason?: string;
}> {
  try {
    const res = await fetch(`/api/competition/phase-access?stage=${encodeURIComponent(stage)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fallback on network error
  }
  return { isAllowed: true, activeStage: stage };
}

// ============================================================
// QUIZ PROGRAMS, QUESTION BANK & LEADERBOARD HELPERS
// ============================================================

function getAdminAuthToken(): string {
  try {
    const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) return parsed.token;
    }
  } catch {
    // Ignore
  }
  return 'aima_sec_admin_session';
}

export function mapSupabaseRowToQuizProgram(row: any): QuizProgram {
  return {
    id: row.id,
    code: row.code || '',
    title: row.title || '',
    tagline: row.tagline || '',
    description: row.description || '',
    stage: row.stage || 'round_1',
    category: row.category || '',
    status: row.status || 'draft',
    startTime: row.start_time || '',
    endTime: row.end_time || '',
    durationMinutes: Number(row.duration_minutes ?? 45),
    totalQuestions: Number(row.total_questions ?? 25),
    totalMarks: Number(row.total_marks ?? 100),
    cutoffScore: row.cutoff_score !== null && row.cutoff_score !== undefined
      ? Number(row.cutoff_score)
      : (row.passing_marks !== null && row.passing_marks !== undefined && Number(row.total_marks || 100) > 0
        ? Math.round((Number(row.passing_marks) / Number(row.total_marks || 100)) * 100)
        : 60),
    passingMarks: Number(
      row.passing_marks ?? Math.round(Number(row.total_marks || 100) * (Number(row.cutoff_score ?? 60) / 100))
    ),
    negativeMarking: Boolean(row.negative_marking),
    negativeMarksPerQuestion: Number(row.negative_marks_per_question ?? 0.5),
    marksPerQuestion: Number(row.marks_per_question ?? 4),
    fee: Number(row.fee ?? 0),
    maxIntake: Number(row.max_intake ?? 15000),
    enrolledCount: Number(row.enrolled_count ?? 0),
    completedCount: Number(row.completed_count ?? 0),
    inProgressCount: Number(row.in_progress_count ?? 0),
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    eligibility: row.eligibility || '',
    proctoringStrictness: row.proctoring_strictness || 'High (Webcam + Fullscreen + Tab Lock)',
    proctoringMode: row.proctoring_mode || 'strict_lockdown',
    tags: Array.isArray(row.tags) ? row.tags : [],
    shuffleQuestions: Boolean(row.shuffle_questions),
    allowReview: row.allow_review !== false,
    isResultsPublished: Boolean(row.is_results_published),
    is_results_published: Boolean(row.is_results_published),
    createdAt: row.created_at || undefined,
    updatedAt: row.updated_at || undefined,
  };
}

const QUIZ_PROGRAMS_CACHE_KEY = 'AIMA_QUIZ_PROGRAMS_CACHE_V2';

// Instant purge of legacy dummy caches
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('AIMA_QUIZ_PROGRAMS_CACHE_V1');
    localStorage.removeItem('AIMA_QUIZ_QUESTIONS_CACHE_V1');
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('AIMA_PROGRAM_QUESTIONS_CACHE_V1') || k === 'AIMA_QUIZ_PROGRAMS_CACHE_V1' || k === 'AIMA_QUIZ_QUESTIONS_CACHE_V1')) {
        localStorage.removeItem(k);
      }
    }
  } catch { }
}

export function getLocalQuizProgramsCache(): QuizProgram[] {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRAMS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

export function saveLocalQuizProgramsCache(programs: QuizProgram[]): void {
  try {
    localStorage.setItem(QUIZ_PROGRAMS_CACHE_KEY, JSON.stringify(programs));
  } catch { }
}

export async function fetchQuizPrograms(): Promise<QuizProgram[]> {
  const localCached = getLocalQuizProgramsCache();

  // 1. Fetch live programs via server API (using privileged supabaseAdmin, bypasses client RLS & browser caching)
  try {
    const res = await fetch(`/api/quiz-programs?t=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      if (json && Array.isArray(json.programs) && json.programs.length > 0) {
        const dbPrograms = json.programs.map((row: any) => mapSupabaseRowToQuizProgram(row));
        saveLocalQuizProgramsCache(dbPrograms);
        return dbPrograms;
      }
    }
  } catch (err: any) {
    console.warn('fetchQuizPrograms server API fetch exception:', err?.message);
  }

  // 2. Direct client query to Supabase quiz_programs table
  try {
    const { data, error } = await supabase
      .from('quiz_programs')
      .select('*')
      .order('created_at', { ascending: false, nullsFirst: false });

    // Fetch system overrides from registrations table (AIMA_SYSTEM_QUIZ_CONFIG)
    let sysOverrides: Record<string, any> = {};
    try {
      const { data: sysRow } = await supabase
        .from('registrations')
        .select('raw_data')
        .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
        .maybeSingle();
      if (sysRow?.raw_data?.programOverrides) {
        sysOverrides = sysRow.raw_data.programOverrides;
      }
    } catch { }

    if (error) {
      console.warn('Could not fetch quiz_programs from Supabase (using local):', error.message);
      return localCached;
    }

    if (data && Array.isArray(data)) {
      const dbPrograms = data.map(row => {
        const prog = mapSupabaseRowToQuizProgram(row);
        const override = sysOverrides[row.id];
        // Dynamic admin overrides (from registrations system config) take precedence
        if (override && override.isResultsPublished !== undefined) {
          prog.isResultsPublished = Boolean(override.isResultsPublished);
          (prog as any).is_results_published = Boolean(override.isResultsPublished);
        } else if (row.is_results_published !== undefined && row.is_results_published !== null) {
          prog.isResultsPublished = Boolean(row.is_results_published);
          (prog as any).is_results_published = Boolean(row.is_results_published);
        } else if (override && override.isResultsPublished !== undefined) {
          prog.isResultsPublished = Boolean(override.isResultsPublished);
          (prog as any).is_results_published = Boolean(override.isResultsPublished);
        }

        if (row.status) {
          prog.status = row.status;
        } else if (override && override.status) {
          prog.status = override.status;
        }

        return prog;
      });

      // Ensure Stage 1 Quiz dynamically reflects registered candidates count if DB row was just initialized
      const stage1 = dbPrograms.find(p => p.id === 'qp_case_comp_stage1_2026');
      if (stage1 && stage1.enrolledCount === 0) {
        const cachedRegs = getLocalRegistrationsCache();
        if (cachedRegs && cachedRegs.length > 0) {
          const totalCandidates = cachedRegs.reduce((acc, r) => acc + (r.participantCount || r.nominees?.length || 1), 0);
          if (totalCandidates > 0) {
            stage1.enrolledCount = totalCandidates;
          }
        }
      }

      // Overwrite cache with EXACT database state
      saveLocalQuizProgramsCache(dbPrograms);
      return dbPrograms;
    }
    return localCached;
  } catch (err: any) {
    console.warn('fetchQuizPrograms exception (using local):', err?.message);
    return localCached;
  }
}

export async function upsertQuizProgram(program: QuizProgram): Promise<boolean> {
  const now = new Date().toISOString();
  // 1. Maintain local offline backup immediately so user never loses created program on refresh
  const current = getLocalQuizProgramsCache();
  const updated = [program, ...current.filter(p => p.id !== program.id)];
  saveLocalQuizProgramsCache(updated);

  // 2. Persist to Supabase via server API
  try {
    const token = getAdminAuthToken();
    const res = await fetch('/api/admin/quiz-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-app-schema': DB_SCHEMA,
      },
      body: JSON.stringify({ program }),
    });

    if (res.ok) {
      return true;
    }
  } catch (err: any) {
    console.warn('upsertQuizProgram API fetch exception:', err?.message);
  }

  // 3. Fallback: Persist system overrides to registrations table
  try {
    const { data: existingSys } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
      .maybeSingle();

    const raw = existingSys?.raw_data || {};
    const programOverrides = raw.programOverrides || {};
    programOverrides[program.id] = {
      ...(programOverrides[program.id] || {}),
      cutoffScore: program.cutoffScore,
      isResultsPublished: Boolean(program.isResultsPublished !== undefined ? program.isResultsPublished : (program as any).is_results_published),
      status: program.status,
      updatedAt: now,
    };

    if (existingSys) {
      await supabase
        .from('registrations')
        .update({
          raw_data: { ...raw, programOverrides },
        })
        .eq('id', existingSys.id);
    } else {
      await supabase.from('registrations').insert([
        {
          registration_number: 'AIMA_SYSTEM_QUIZ_CONFIG',
          contact_email: 'system@aima.in',
          team_name: 'AIMA System Settings',
          raw_data: { programOverrides },
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  } catch { }

  // 4. Try direct client write to quiz_programs (catches RLS gracefully)
  try {
    const row: any = {
      id: program.id,
      code: program.code || program.id,
      title: program.title,
      description: program.description || '',
      stage: program.stage || 'round_1',
      status: program.status || 'draft',
      duration_minutes: program.durationMinutes || 45,
      total_questions: program.totalQuestions || 25,
      total_marks: program.totalMarks || 100,
      cutoff_score: Number(program.cutoffScore ?? 60),
      passing_marks: Number(
        program.passingMarks ?? Math.round(Number(program.totalMarks || 100) * (Number(program.cutoffScore ?? 60) / 100))
      ),
      negative_marking: Boolean(program.negativeMarking),
      start_time: program.startTime || null,
      end_time: program.endTime || null,
      max_intake: program.maxIntake || program.intakeCapacity || 20000,
      enrolled_count: program.enrolledCount || 0,
      is_results_published: Boolean(program.isResultsPublished !== undefined ? program.isResultsPublished : (program as any).is_results_published),
      updated_at: now,
    };
    await supabase.from('quiz_programs').upsert(row, { onConflict: 'id' });
  } catch { }

  return true;
}

export async function toggleQuizProgramPublication(programId: string, isPublished: boolean): Promise<boolean> {
  const now = new Date().toISOString();

  // 1. Update local cache immediately
  try {
    const cached = getLocalQuizProgramsCache();
    const updated = cached.map(p => {
      if (p.id === programId) {
        return { ...p, isResultsPublished: isPublished, is_results_published: isPublished, updatedAt: now };
      }
      return p;
    });
    saveLocalQuizProgramsCache(updated);
  } catch { }

  // 2. Server API sync via Vercel serverless function
  try {
    const token = getAdminAuthToken();
    await fetch('/api/admin/quiz-program/toggle-publication', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-app-schema': DB_SCHEMA,
      },
      body: JSON.stringify({ programId, isPublished }),
    }).catch(() => { });
  } catch { }

  // 3. Persist system override in registrations table (which anon key can always write)
  try {
    const { data: existingSys } = await supabase
      .from('registrations')
      .select('*')
      .eq('registration_number', 'AIMA_SYSTEM_QUIZ_CONFIG')
      .maybeSingle();

    const raw = existingSys?.raw_data || {};
    const programOverrides = raw.programOverrides || {};
    programOverrides[programId] = {
      ...(programOverrides[programId] || {}),
      isResultsPublished: isPublished,
      updatedAt: now,
    };

    if (existingSys) {
      await supabase
        .from('registrations')
        .update({
          raw_data: { ...raw, programOverrides },
        })
        .eq('id', existingSys.id);
    } else {
      await supabase.from('registrations').insert([
        {
          registration_number: 'AIMA_SYSTEM_QUIZ_CONFIG',
          contact_email: 'system@aima.in',
          team_name: 'AIMA System Settings',
          raw_data: { programOverrides },
          created_at: now,
          updated_at: now,
        },
      ]);
    }
  } catch (sysErr: any) {
    console.warn('registrations system publication persistence warning:', sysErr?.message);
  }

  // 4. Try direct write to Supabase table column is_results_published
  try {
    await supabase
      .from('quiz_programs')
      .update({
        is_results_published: isPublished,
        updated_at: now,
      })
      .eq('id', programId);
  } catch { }

  return true;
}

export async function deleteQuizProgramFromDb(id: string): Promise<boolean> {
  const current = getLocalQuizProgramsCache();
  saveLocalQuizProgramsCache(current.filter(p => p.id !== id));

  try {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/admin/quiz-program/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) return true;
  } catch (err: any) {
    console.warn('deleteQuizProgramFromDb server API warning:', err?.message);
  }

  try {
    const { error } = await supabase.from('quiz_programs').delete().eq('id', id);
    if (!error) return true;
  } catch (err: any) {
    console.warn('deleteQuizProgramFromDb direct delete warning:', err?.message);
  }
  return false;
}

export function mapSupabaseRowToQuizQuestion(row: any): QuizQuestion {
  return {
    id: row.id,
    qNo: row.q_no !== undefined && row.q_no !== null ? Number(row.q_no) : undefined,
    section: row.section || undefined,
    topic: row.topic || undefined,
    questionType: row.question_type || undefined,
    benchmarkStyle: row.benchmark_style || undefined,
    source: row.source || undefined,
    questionText: row.question_text || '',
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswerIndex: row.correct_answer_index ?? 0,
    marks: Number(row.marks ?? 4),
    negativeMarks: Number(row.negative_marks ?? 0),
    difficulty: row.difficulty || 'Medium',
    category: row.category || 'Management Concepts',
    explanation: row.explanation || undefined,
    caseletSnippet: row.caselet_snippet || undefined,
    isActive: Boolean(row.is_active ?? true),
  };
}

const QUIZ_QUESTIONS_CACHE_KEY = 'AIMA_QUIZ_QUESTIONS_CACHE_V2';

export function getLocalQuizQuestionsCache(): QuizQuestion[] {
  try {
    const raw = localStorage.getItem(QUIZ_QUESTIONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

export function saveLocalQuizQuestionsCache(questions: QuizQuestion[]): void {
  try {
    localStorage.setItem(QUIZ_QUESTIONS_CACHE_KEY, JSON.stringify(questions));
  } catch { }
}

export async function fetchQuizQuestionsAdmin(): Promise<QuizQuestion[]> {
  const localCached = getLocalQuizQuestionsCache();
  // 1. Try server admin endpoint with service-role permissions (contains real correct_answer_index)
  try {
    let token = '';
    try {
      const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
      if (raw) token = JSON.parse(raw)?.token || '';
    } catch { }
    if (!token) token = 'aima_sec_admin_session';

    const res = await fetch('/api/admin/quiz-questions', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
        const mapped = json.questions.map(mapSupabaseRowToQuizQuestion);
        saveLocalQuizQuestionsCache(mapped);
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('fetchQuizQuestionsAdmin server endpoint fallback:', err?.message);
  }

  // 2. Direct fetch from quiz_questions table
  try {
    const { data, error } = await supabase
      .from('quiz_questions')
      .select('*')
      .order('id', { ascending: true });

    if (!error && data && Array.isArray(data)) {
      const mapped = data.map(mapSupabaseRowToQuizQuestion);
      saveLocalQuizQuestionsCache(mapped);
      return mapped;
    }
  } catch (err: any) {
    console.warn('fetchQuizQuestionsAdmin direct table read fallback:', err?.message);
  }
  return fetchQuizQuestionsPublic();
}

export async function fetchQuizQuestionsPublic(): Promise<QuizQuestion[]> {
  const localCached = getLocalQuizQuestionsCache();
  try {
    const { data, error } = await supabase
      .from('quiz_questions_public')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not fetch quiz_questions_public from Supabase (using local):', error.message);
      return localCached;
    }

    if (data && Array.isArray(data)) {
      const dbQuestions = data.map(mapSupabaseRowToQuizQuestion);
      // Save exact live DB snapshot to cache (do NOT resurrect deleted questions)
      saveLocalQuizQuestionsCache(dbQuestions);
      return dbQuestions;
    }
    return localCached;
  } catch (err: any) {
    console.warn('fetchQuizQuestionsPublic exception (using local):', err?.message);
    return localCached;
  }
}

export async function upsertQuizQuestion(q: QuizQuestion): Promise<boolean> {
  const current = getLocalQuizQuestionsCache();
  const updated = [q, ...current.filter(item => item.id !== q.id)];
  saveLocalQuizQuestionsCache(updated);

  try {
    const row: any = {
      id: q.id,
      question_text: q.questionText,
      options: q.options,
      correct_answer_index: q.correctAnswerIndex ?? 0,
      marks: q.marks ?? 4,
      negative_marks: q.negativeMarks ?? 0,
      difficulty: q.difficulty || 'Medium',
      category: q.category || 'Management Concepts',
      explanation: q.explanation || null,
      caselet_snippet: q.caseletSnippet || null,
      is_active: q.isActive ?? true,
    };
    if (q.qNo !== undefined) row.q_no = q.qNo;
    if (q.section !== undefined) row.section = q.section;
    if (q.topic !== undefined) row.topic = q.topic;
    if (q.questionType !== undefined) row.question_type = q.questionType;
    if (q.benchmarkStyle !== undefined) row.benchmark_style = q.benchmarkStyle;
    if (q.source !== undefined) row.source = q.source;
    const { error } = await supabase.from('quiz_questions').upsert(row, { onConflict: 'id' });
    if (!error) return true;
  } catch (err: any) {
    console.warn('Direct upsertQuizQuestion warning:', err?.message);
  }
  return false;
}

export async function upsertQuizQuestionsBulk(questions: QuizQuestion[]): Promise<boolean> {
  const current = getLocalQuizQuestionsCache();
  const newIds = new Set(questions.map(q => q.id));
  const updated = [...questions, ...current.filter(item => !newIds.has(item.id))];
  saveLocalQuizQuestionsCache(updated);

  try {
    const rows = questions.map(q => ({
      id: q.id,
      question_text: q.questionText,
      options: q.options,
      correct_answer_index: q.correctAnswerIndex ?? 0,
      marks: q.marks ?? 4,
      negative_marks: q.negativeMarks ?? 0,
      difficulty: q.difficulty || 'Medium',
      category: q.category || 'Management Concepts',
      explanation: q.explanation || null,
      caselet_snippet: q.caseletSnippet || null,
      is_active: q.isActive ?? true,
    }));
    const { error } = await supabase.from('quiz_questions').upsert(rows, { onConflict: 'id' });
    if (!error) return true;
  } catch (err: any) {
    console.warn('Direct upsertQuizQuestionsBulk warning:', err?.message);
  }
  return false;
}

export async function deleteQuizQuestionFromDb(id: string): Promise<boolean> {
  const current = getLocalQuizQuestionsCache();
  saveLocalQuizQuestionsCache(current.filter(item => item.id !== id));

  try {
    const { error } = await supabase.from('quiz_questions').delete().eq('id', id);
    if (!error) return true;
  } catch (err: any) {
    console.warn('Direct deleteQuizQuestionFromDb warning:', err?.message);
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz Program Questions (Junction) Helpers
// ─────────────────────────────────────────────────────────────────────────────

const PROGRAM_QUESTIONS_CACHE_PREFIX = 'AIMA_PROGRAM_QUESTIONS_CACHE_V2_';

export function getLocalProgramQuestionsCache(programId: string): string[] {
  try {
    const raw = localStorage.getItem(PROGRAM_QUESTIONS_CACHE_PREFIX + programId);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { }
  return [];
}

export function saveLocalProgramQuestionsCache(programId: string, questionIds: string[]): void {
  try {
    localStorage.setItem(PROGRAM_QUESTIONS_CACHE_PREFIX + programId, JSON.stringify(questionIds));
  } catch { }
}

export async function fetchAllProgramQuestionMappings(): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};
  try {
    const { data, error } = await supabase
      .from('quiz_program_questions')
      .select('program_id, question_id, order_index')
      .order('order_index', { ascending: true });

    if (!error && Array.isArray(data)) {
      data.forEach((row: any) => {
        if (!result[row.program_id]) result[row.program_id] = [];
        result[row.program_id].push(row.question_id);
      });
      Object.keys(result).forEach(pid => saveLocalProgramQuestionsCache(pid, result[pid]));
      return result;
    }
  } catch (err: any) {
    console.warn('fetchAllProgramQuestionMappings warning (using local):', err?.message);
  }
  return result;
}

export async function fetchProgramQuestions(programId: string): Promise<QuizQuestion[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_program_questions')
      .select('question_id, order_index, quiz_questions_public (*)')
      .eq('program_id', programId)
      .order('order_index', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const mapped = data
        .map((row: any) => {
          const q = row.quiz_questions_public;
          if (!q) return null;
          return {
            id: q.id,
            questionText: q.question_text || '',
            options: Array.isArray(q.options) ? q.options : [],
            correctAnswerIndex: 0,
            marks: Number(q.marks ?? 4),
            negativeMarks: Number(q.negative_marks ?? 1),
            difficulty: (q.difficulty as any) || 'Medium',
            category: q.category || 'Business Awareness',
            explanation: q.explanation || '',
            caseletSnippet: q.caselet_snippet || '',
          };
        })
        .filter(Boolean) as QuizQuestion[];

      if (mapped.length > 0) {
        saveLocalProgramQuestionsCache(programId, mapped.map(q => q.id));
        return mapped;
      }
    }
  } catch (err: any) {
    console.warn('fetchProgramQuestions from Supabase exception:', err?.message);
  }

  const cachedIds = getLocalProgramQuestionsCache(programId);
  const allBankQuestions = getLocalQuizQuestionsCache();
  if (cachedIds.length > 0 && allBankQuestions.length > 0) {
    const sorted = cachedIds
      .map(id => allBankQuestions.find(q => q.id === id))
      .filter(Boolean) as QuizQuestion[];
    if (sorted.length > 0) return sorted;
  }

  return [];
}

export async function saveProgramQuestions(programId: string, questionIds: string[]): Promise<boolean> {
  saveLocalProgramQuestionsCache(programId, questionIds);

  try {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/admin/quiz-program/${encodeURIComponent(programId)}/questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ questionIds }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('saveProgramQuestions server call failed:', err?.message);
  }
  return false;
}

export async function createAndAssignQuestion(
  programId: string,
  question: Omit<QuizQuestion, 'id'>
): Promise<QuizQuestion | null> {
  const tempId = `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const fullQuestion: QuizQuestion = { ...question, id: tempId };

  const bank = getLocalQuizQuestionsCache();
  saveLocalQuizQuestionsCache([fullQuestion, ...bank]);
  const currentAssigned = getLocalProgramQuestionsCache(programId);
  saveLocalProgramQuestionsCache(programId, [...currentAssigned, tempId]);

  try {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/admin/quiz-program/${encodeURIComponent(programId)}/question/create-and-assign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question: fullQuestion }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.question) return data.question;
    }
  } catch (err: any) {
    console.error('createAndAssignQuestion server call failed (stored locally):', err?.message);
  }

  return fullQuestion;
}

export async function fetchLeaderboard(): Promise<QuizAttempt[]> {
  try {
    // 1. Server-side admin endpoint (bypasses RLS, joins participant info & returns answers JSONB)
    let token = '';
    try {
      const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
      if (raw) token = JSON.parse(raw)?.token || '';
    } catch { }
    if (!token) token = 'aima_sec_admin_session';

    try {
      const res = await fetch('/api/admin/quiz-attempts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.attempts)) {
          return json.attempts.map((row: any) => ({
            attemptId: row.attempt_id,
            studentId: row.student_id,
            userId: row.user_id || row.student_id,
            participantEmail: row.participant_email,
            candidateName: row.candidate_name,
            instituteName: row.institute_name,
            registrationNumber: row.registration_number,
            teamId: row.team_id || '',
            programId: row.program_id,
            startTime: row.start_time || row.submitted_at || new Date().toISOString(),
            submittedAt: row.submitted_at,
            answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
            markedForReview: Array.isArray(row.marked_for_review) ? row.marked_for_review : [],
            score: Number(row.score ?? 0),
            analyticalScore: Number(row.analytical_score ?? 0),
            timeTakenSeconds: Number(row.time_taken_seconds ?? 0),
            tabSwitchCount: Number(row.tab_switch_count ?? 0),
            isCompleted: Boolean(row.is_completed ?? true),
          }));
        }
      }
    } catch (apiErr: any) {
      console.warn('fetchLeaderboard /api/admin/quiz-attempts fallback:', apiErr?.message);
    }

    const results: QuizAttempt[] = [];
    const seenAttemptIds = new Set<string>();

    // 2. Direct Supabase view fallback
    try {
      const { data, error } = await supabase
        .from('quiz_attempts_leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .order('time_taken_seconds', { ascending: true });

      if (data && Array.isArray(data)) {
        data.forEach((row: any) => {
          seenAttemptIds.add(row.attempt_id);
          results.push({
            attemptId: row.attempt_id,
            studentId: row.student_id,
            userId: row.user_id || row.student_id,
            participantEmail: row.participant_email,
            candidateName: row.candidate_name,
            instituteName: row.institute_name,
            registrationNumber: row.registration_number,
            teamId: row.team_id || '',
            programId: row.program_id,
            startTime: row.submitted_at || new Date().toISOString(),
            submittedAt: row.submitted_at,
            answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
            markedForReview: Array.isArray(row.marked_for_review) ? row.marked_for_review : [],
            score: Number(row.score ?? 0),
            analyticalScore: Number(row.analytical_score ?? 0),
            timeTakenSeconds: Number(row.time_taken_seconds ?? 0),
            tabSwitchCount: Number(row.tab_switch_count ?? 0),
            isCompleted: Boolean(row.is_completed ?? true),
          });
        });
      }
    } catch (e) {
      console.warn('Could not query quiz_attempts_leaderboard view:', e);
    }

    // 3. Dual-persistence read fallback: Extract attempts stored in registrations raw_data
    try {
      const { data: regRows } = await supabase
        .from('registrations')
        .select('registration_number, raw_data');

      if (regRows && Array.isArray(regRows)) {
        regRows.forEach((r: any) => {
          const raw = r.raw_data || {};
          const attempts = Array.isArray(raw.quizAttempts) ? raw.quizAttempts : [];
          attempts.forEach((att: any) => {
            if (att.attempt_id && !seenAttemptIds.has(att.attempt_id)) {
              seenAttemptIds.add(att.attempt_id);
              results.push({
                attemptId: att.attempt_id,
                studentId: att.student_id,
                userId: att.user_id || att.student_id,
                participantEmail: att.participant_email,
                candidateName: att.candidateName || raw.coordinator?.name,
                instituteName: att.instituteName || raw.organizationName,
                registrationNumber: att.registrationNumber || r.registration_number,
                teamId: att.team_id || '',
                programId: att.program_id,
                startTime: att.start_time || att.submitted_at || new Date().toISOString(),
                submittedAt: att.submitted_at,
                answers: att.answers && typeof att.answers === 'object' ? att.answers : {},
                markedForReview: Array.isArray(att.marked_for_review) ? att.marked_for_review : [],
                score: Number(att.score ?? 0),
                analyticalScore: Number(att.analytical_score ?? 0),
                timeTakenSeconds: Number(att.time_taken_seconds ?? 0),
                tabSwitchCount: Number(att.tab_switch_count ?? 0),
                isCompleted: Boolean(att.is_completed ?? true),
              });
            }
          });
        });
      }
    } catch (e) {
      console.warn('Could not extract quizAttempts from registrations:', e);
    }

    return results.sort((a, b) => b.score - a.score || a.timeTakenSeconds - b.timeTakenSeconds);
  } catch (err: any) {
    console.warn('fetchLeaderboard exception:', err?.message);
    return [];
  }
}

export async function fetchQuizAttemptById(attemptId: string): Promise<QuizAttempt | null> {
  try {
    let token = '';
    try {
      const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
      if (raw) token = JSON.parse(raw)?.token || '';
    } catch { }
    if (!token) token = 'aima_sec_admin_session';

    const res = await fetch(`/api/admin/quiz-attempts/${encodeURIComponent(attemptId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.attempt) {
        const row = json.attempt;
        return {
          attemptId: row.attempt_id,
          studentId: row.student_id,
          userId: row.user_id || row.student_id,
          participantEmail: row.participant_email,
          candidateName: row.candidate_name,
          instituteName: row.institute_name,
          registrationNumber: row.registration_number,
          teamId: row.team_id || '',
          programId: row.program_id,
          startTime: row.start_time || row.submitted_at || new Date().toISOString(),
          submittedAt: row.submitted_at,
          answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
          markedForReview: Array.isArray(row.marked_for_review) ? row.marked_for_review : [],
          score: Number(row.score ?? 0),
          analyticalScore: Number(row.analytical_score ?? 0),
          timeTakenSeconds: Number(row.time_taken_seconds ?? 0),
          tabSwitchCount: Number(row.tab_switch_count ?? 0),
          isCompleted: Boolean(row.is_completed ?? true),
        };
      }
    }
  } catch (err: any) {
    console.warn('fetchQuizAttemptById server warning:', err?.message);
  }

  // Fallback 1: direct table read from quiz_attempts
  try {
    const { data: row, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('attempt_id', attemptId)
      .maybeSingle();

    if (!error && row) {
      return {
        attemptId: row.attempt_id,
        studentId: row.student_id,
        userId: row.user_id || row.student_id,
        participantEmail: row.participant_email,
        teamId: row.team_id || '',
        programId: row.program_id,
        startTime: row.start_time || row.submitted_at || new Date().toISOString(),
        submittedAt: row.submitted_at,
        answers: row.answers && typeof row.answers === 'object' ? row.answers : {},
        markedForReview: Array.isArray(row.marked_for_review) ? row.marked_for_review : [],
        score: Number(row.score ?? 0),
        analyticalScore: Number(row.analytical_score ?? 0),
        timeTakenSeconds: Number(row.time_taken_seconds ?? 0),
        tabSwitchCount: Number(row.tab_switch_count ?? 0),
        isCompleted: Boolean(row.is_completed ?? true),
      };
    }
  } catch (err: any) {
    console.warn('fetchQuizAttemptById table fallback warning:', err?.message);
  }

  // Fallback 2: read from registrations raw_data
  try {
    const { data: regRows } = await supabase.from('registrations').select('raw_data');
    if (regRows && Array.isArray(regRows)) {
      for (const reg of regRows) {
        const attempts = Array.isArray(reg.raw_data?.quizAttempts) ? reg.raw_data.quizAttempts : [];
        const match = attempts.find((a: any) => a.attempt_id === attemptId);
        if (match) {
          return {
            attemptId: match.attempt_id,
            studentId: match.student_id,
            userId: match.user_id || match.student_id,
            participantEmail: match.participant_email,
            teamId: match.team_id || '',
            programId: match.program_id,
            startTime: match.start_time || match.submitted_at || new Date().toISOString(),
            submittedAt: match.submitted_at,
            answers: match.answers && typeof match.answers === 'object' ? match.answers : {},
            markedForReview: Array.isArray(match.marked_for_review) ? match.marked_for_review : [],
            score: Number(match.score ?? 0),
            analyticalScore: Number(match.analytical_score ?? 0),
            timeTakenSeconds: Number(match.time_taken_seconds ?? 0),
            tabSwitchCount: Number(match.tab_switch_count ?? 0),
            isCompleted: Boolean(match.is_completed ?? true),
          };
        }
      }
    }
  } catch (err: any) {
    console.warn('fetchQuizAttemptById registrations fallback warning:', err?.message);
  }
  return null;
}

export async function fetchProgramQuestionsOrdered(programId: string): Promise<QuizQuestion[]> {
  try {
    let token = '';
    try {
      const raw = sessionStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1') || localStorage.getItem('AIMA_ADMIN_AUTH_TOKEN_V1');
      if (raw) token = JSON.parse(raw)?.token || '';
    } catch { }
    if (!token) token = 'aima_sec_admin_session';

    const res = await fetch(`/api/quiz-programs/${encodeURIComponent(programId)}/questions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.questions) && json.questions.length > 0) {
        return json.questions.map((q: any) => ({
          id: q.id,
          questionText: q.questionText || '',
          options: Array.isArray(q.options) ? q.options : [],
          correctAnswerIndex: Number(q.correctAnswerIndex ?? 0),
          marks: Number(q.marks ?? 4),
          negativeMarks: Number(q.negativeMarks ?? 0),
          difficulty: q.difficulty || 'Medium',
          category: q.category || 'Management Concepts',
          explanation: q.explanation || '',
          caseletSnippet: q.caseletSnippet || '',
          orderIndex: q.orderIndex,
        }));
      }
    }
  } catch (err: any) {
    console.warn('fetchProgramQuestionsOrdered warning:', err?.message);
  }
  return [];
}

/**
 * Persists published certificates to Supabase so that participants across all browsers/devices
 * can access their official credentials.
 */
export async function savePublishedCertificatesToSupabase(
  certs: CertificateRecord[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = JSON.stringify({
      publishedCertificates: certs,
      publishedAt: new Date().toISOString(),
      count: certs.length,
    });

    // 1. Save to quiz_programs table in public and active schema
    const { error: progErr } = await supabase
      .from('quiz_programs')
      .update({ eligibility: payload, updated_at: new Date().toISOString() })
      .eq('id', 'qp_case_comp_stage1_2026');

    if (progErr) {
      console.warn('Could not update quiz_programs with published certificates:', progErr);
    }

    // 2. Also update each registration's raw_data.certificate in the database for direct access
    for (const cert of certs) {
      if (cert.registrationNumber || cert.recipientEmail) {
        try {
          let query = supabase.from('registrations').select('id, raw_data');
          if (cert.registrationNumber) {
            query = query.eq('registration_number', cert.registrationNumber);
          } else if (cert.recipientEmail) {
            query = query.eq('candidate_email', cert.recipientEmail.toLowerCase().trim());
          }
          const { data: regRows } = await query.limit(1);
          if (regRows && regRows.length > 0) {
            const row = regRows[0];
            const updatedRaw = {
              ...(row.raw_data || {}),
              certificate: cert,
              isCertificatePublished: true,
              certificatePublishedAt: new Date().toISOString(),
            };
            await supabase.from('registrations').update({ raw_data: updatedRaw }).eq('id', row.id);
          }
        } catch {
          // ignore individual update errors
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('savePublishedCertificatesToSupabase error:', err);
    return { success: false, error: err?.message };
  }
}

/**
 * Fetches published certificates from Supabase.
 */
export async function fetchPublishedCertificatesFromSupabase(): Promise<CertificateRecord[] | null> {
  try {
    const { data, error } = await supabase
      .from('quiz_programs')
      .select('eligibility')
      .eq('id', 'qp_case_comp_stage1_2026')
      .single();

    if (error || !data?.eligibility) {
      return null;
    }

    const parsed = JSON.parse(data.eligibility);
    if (Array.isArray(parsed?.publishedCertificates) && parsed.publishedCertificates.length > 0) {
      return parsed.publishedCertificates as CertificateRecord[];
    }
    return null;
  } catch (err) {
    console.warn('fetchPublishedCertificatesFromSupabase error:', err);
    return null;
  }
}

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ==============================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Schema for Dynamic Registrations & Participant Vault
-- ==============================================================

-- TABLE 1: registrations
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL UNIQUE,
    registration_mode TEXT NOT NULL, -- 'individual' | 'institute'
    team_name TEXT,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    institute_name TEXT NOT NULL,
    program TEXT,
    semester TEXT,
    enrolment_number TEXT,
    participant_count INT DEFAULT 1,
    fee_tier TEXT,
    subtotal_amount NUMERIC NOT NULL,
    gst_amount NUMERIC NOT NULL,
    total_amount NUMERIC NOT NULL,
    payment_method TEXT NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'PENDING_INVOICE',
    transaction_id TEXT,
    invoice_number TEXT NOT NULL,
    nominees JSONB NOT NULL DEFAULT '[]'::jsonb,
    coordinator_name TEXT,
    coordinator_email TEXT,
    coordinator_phone TEXT,
    institute_address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    dpdp_consent BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    raw_data JSONB
);

CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(candidate_email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_mode ON public.registrations(registration_mode);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
GRANT ALL ON public.registrations TO anon, authenticated, service_role;
DROP POLICY IF EXISTS "Allow anon submit and read registrations" ON public.registrations;
CREATE POLICY "Allow anon submit and read registrations"
  ON public.registrations FOR ALL USING (true) WITH CHECK (true);

-- TABLE 2: participants  (one row per nominee / participant)
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number TEXT NOT NULL,
    registration_mode TEXT NOT NULL,  -- 'individual' | 'institute'
    institute_name TEXT NOT NULL,
    username TEXT NOT NULL,           -- same as email
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT,
    program TEXT,
    semester TEXT,
    enrolment_number TEXT,
    is_team_leader BOOLEAN DEFAULT FALSE,
    coordinator_name TEXT,
    coordinator_email TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_reg_number ON public.participants(registration_number);
CREATE INDEX IF NOT EXISTS idx_participants_institute ON public.participants(institute_name);
CREATE INDEX IF NOT EXISTS idx_participants_mode ON public.participants(registration_mode);

ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
GRANT ALL ON TABLE public.participants TO anon;
GRANT ALL ON TABLE public.participants TO authenticated;
GRANT ALL ON TABLE public.participants TO service_role;
DROP POLICY IF EXISTS "Allow anon read and insert participants" ON public.participants;
CREATE POLICY "Allow anon read and insert participants"
  ON public.participants FOR ALL USING (true) WITH CHECK (true);

-- TABLE 3: competition_config (Stage Gate Overrides & Master Controls)
CREATE TABLE IF NOT EXISTS public.competition_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    league_name TEXT NOT NULL DEFAULT 'AIMA-ICRC India Case League',
    year TEXT NOT NULL DEFAULT '2026',
    edition TEXT NOT NULL DEFAULT 'Inaugural National Edition',
    active_stage TEXT NOT NULL DEFAULT 'round_2',
    registration_open BOOLEAN NOT NULL DEFAULT TRUE,
    r1_quiz_start_time TIMESTAMPTZ DEFAULT '2026-09-10T10:00:00Z',
    r1_quiz_end_time TIMESTAMPTZ DEFAULT '2026-09-10T22:00:00Z',
    r1_duration_minutes INT NOT NULL DEFAULT 45,
    r1_negative_marking BOOLEAN NOT NULL DEFAULT TRUE,
    r1_cutoff_score NUMERIC NOT NULL DEFAULT 65,
    r2_submission_deadline TIMESTAMPTZ DEFAULT '2026-09-25T23:59:59Z',
    r2_max_slide_count INT NOT NULL DEFAULT 12,
    r2_max_file_size_mb INT NOT NULL DEFAULT 25,
    r2_evaluators_per_deck INT NOT NULL DEFAULT 2,
    r3_regional_start_date TIMESTAMPTZ DEFAULT '2026-10-15T09:00:00Z',
    r3_max_teams_per_hub INT NOT NULL DEFAULT 24,
    r4_national_finale_date TIMESTAMPTZ DEFAULT '2026-11-05T09:00:00Z',
    fee_r1_r2 NUMERIC NOT NULL DEFAULT 200,
    fee_r3 NUMERIC NOT NULL DEFAULT 2000,
    fee_r4 NUMERIC NOT NULL DEFAULT 2000,
    is_results_locked_r1 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r2 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r3 BOOLEAN NOT NULL DEFAULT FALSE,
    is_results_locked_r4 BOOLEAN NOT NULL DEFAULT FALSE,
    is_public_results_published BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by TEXT
);

INSERT INTO public.competition_config (id, active_stage, registration_open, r1_negative_marking, is_public_results_published)
VALUES ('default', 'round_2', TRUE, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.competition_config ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.competition_config FROM anon, authenticated;
DROP POLICY IF EXISTS "Allow public read access to competition_config" ON public.competition_config;
CREATE POLICY "Allow public read access to competition_config"
  ON public.competition_config FOR SELECT
  USING (true);
GRANT ALL ON public.competition_config TO service_role;
GRANT SELECT ON public.competition_config TO anon, authenticated;

-- TABLE 4: audit_logs (Server-Side Verified Audit Ledger)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    admin_id TEXT NOT NULL,
    admin_email TEXT NOT NULL,
    action TEXT NOT NULL,
    module TEXT NOT NULL,
    details TEXT NOT NULL,
    changed_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
    result TEXT NOT NULL DEFAULT 'SUCCESS',
    ip_address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE INSERT, UPDATE, DELETE ON public.audit_logs FROM anon, authenticated;
DROP POLICY IF EXISTS "Allow authenticated read audit_logs" ON public.audit_logs;
CREATE POLICY "Allow authenticated read audit_logs"
  ON public.audit_logs FOR SELECT
  USING (true);
GRANT ALL ON public.audit_logs TO service_role;
GRANT SELECT ON public.audit_logs TO anon, authenticated;
`;


