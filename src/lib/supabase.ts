import { createClient } from '@supabase/supabase-js';
import { CSRBootcampRegistration, CSRBootcampNominee, CompetitionConfig, QuizProgram, QuizQuestion, QuizAttempt } from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://setjjgjhuslevgnqcnhj.supabase.co';
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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
}

// Simple deterministic password hasher (base64 + salt) – NOT cryptographic, use for demo
export function hashPassword(plain: string): string {
  // Encode as base64 with a prefix salt so it is not trivially reversible in UI
  return 'aima_' + btoa(unescape(encodeURIComponent(plain)));
}

export function verifyPassword(plain: string, stored: string): boolean {
  return hashPassword(plain) === stored;
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
  raw_data?: any;
}

// Convert app CSRBootcampRegistration to Supabase row format
export function mapAppRegToSupabaseRow(reg: CSRBootcampRegistration): SupabaseRegistrationRow {
  const isInst = reg.track === 'institutional' || reg.organizationType === 'Academic Institution';
  const leadNominee = reg.nominees?.[0];
  const coord = reg.coordinator;

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
    participant_count: reg.participantCount || reg.nominees?.length || 1,
    fee_tier: reg.tierLabel || reg.tierId || null,
    subtotal_amount: reg.subtotalExclGst || reg.ratePerPersonOrPackage * reg.participantCount,
    gst_amount: reg.gstAmount,
    total_amount: reg.totalPayable,
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
    raw_data: reg,
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
    return raw ? JSON.parse(raw) : [];
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

  const rows: SupabaseParticipantRow[] = reg.nominees.map((nominee) => {
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
    };
  });

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
    const { data, error } = await supabase
      .from('participants')
      .select('*')
      .eq('email', email.toLowerCase().trim())
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
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password: plainPassword,
    });

    if (authError || !authData.user) {
      // Fallback: check legacy participants table if profiles is still syncing
      const legacyResult = await loginParticipant(email, plainPassword);
      if (legacyResult.success && legacyResult.participant) {
        const p = legacyResult.participant;
        return {
          success: true,
          user: { id: p.id || p.email, email: p.email },
          profile: {
            id: p.id || p.email,
            email: p.email,
            role: p.is_team_leader ? 'team_leader' : 'student',
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
      // Create profile fallback from user metadata if available
      const meta = authData.user.user_metadata || {};
      const fallbackProfile: UserProfileRow = {
        id: authData.user.id,
        email: authData.user.email || email,
        role: meta.role || 'student',
        name: meta.name || email.split('@')[0],
        is_team_leader: meta.role === 'team_leader',
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
      const converted = data.map((d: any) => mapSupabaseRowToAppReg(d));
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
  };
}

/**
 * Fetch authoritative competition configuration (reads from server API, falling back to Supabase client)
 */
export async function fetchCompetitionConfigFromSupabase(): Promise<CompetitionConfig | null> {
  try {
    const res = await fetch('/api/competition/config');
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
  return '';
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
    passingMarks: Number(row.passing_marks ?? 65),
    passingPercentage: Number(row.passing_percentage ?? 65),
    cutoffScore: row.cutoff_score !== null && row.cutoff_score !== undefined ? Number(row.cutoff_score) : undefined,
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
  };
}

const QUIZ_PROGRAMS_CACHE_KEY = 'AIMA_QUIZ_PROGRAMS_CACHE_V1';

export function getLocalQuizProgramsCache(): QuizProgram[] {
  try {
    const raw = localStorage.getItem(QUIZ_PROGRAMS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalQuizProgramsCache(programs: QuizProgram[]): void {
  try {
    localStorage.setItem(QUIZ_PROGRAMS_CACHE_KEY, JSON.stringify(programs));
  } catch {}
}

export async function fetchQuizPrograms(): Promise<QuizProgram[]> {
  const localCached = getLocalQuizProgramsCache();
  try {
    const { data, error } = await supabase
      .from('quiz_programs')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.warn('Could not fetch quiz_programs from Supabase (using local):', error.message);
      return localCached;
    }

    if (data && Array.isArray(data)) {
      const dbPrograms = data.map(mapSupabaseRowToQuizProgram);
      // Merge with any freshly added local programs that might be pending backend write
      const merged = [...dbPrograms];
      localCached.forEach(lp => {
        if (!merged.some(mp => mp.id === lp.id)) {
          merged.push(lp);
        }
      });
      saveLocalQuizProgramsCache(merged);
      return merged;
    }
    return localCached;
  } catch (err: any) {
    console.warn('fetchQuizPrograms exception (using local):', err?.message);
    return localCached;
  }
}

export async function upsertQuizProgram(program: QuizProgram): Promise<boolean> {
  // 1. Maintain local offline backup immediately so user never loses created program on refresh
  const current = getLocalQuizProgramsCache();
  const updated = [program, ...current.filter(p => p.id !== program.id)];
  saveLocalQuizProgramsCache(updated);

  // 2. Call server backend
  try {
    const token = getAdminAuthToken();
    const res = await fetch('/api/admin/quiz-program', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ program }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('upsertQuizProgram server call failed (preserved in local cache):', err?.message);
  }
  return false;
}

export async function deleteQuizProgramFromDb(id: string): Promise<boolean> {
  // 1. Update local cache immediately
  const current = getLocalQuizProgramsCache();
  saveLocalQuizProgramsCache(current.filter(p => p.id !== id));

  // 2. Call server backend
  try {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/admin/quiz-program/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('deleteQuizProgramFromDb server call failed:', err?.message);
  }
  return false;
}

export function mapSupabaseRowToQuizQuestion(row: any): QuizQuestion {
  return {
    id: row.id,
    questionText: row.question_text || '',
    options: Array.isArray(row.options) ? row.options : [],
    correctAnswerIndex: row.correct_answer_index ?? 0,
    marks: Number(row.marks ?? 4),
    negativeMarks: Number(row.negative_marks ?? 1),
    difficulty: row.difficulty || 'Medium',
    category: row.category || 'Management Concepts',
    explanation: row.explanation || undefined,
    caseletSnippet: row.caselet_snippet || undefined,
    isActive: Boolean(row.is_active ?? true),
  };
}

const QUIZ_QUESTIONS_CACHE_KEY = 'AIMA_QUIZ_QUESTIONS_CACHE_V1';

export function getLocalQuizQuestionsCache(): QuizQuestion[] {
  try {
    const raw = localStorage.getItem(QUIZ_QUESTIONS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

export function saveLocalQuizQuestionsCache(questions: QuizQuestion[]): void {
  try {
    localStorage.setItem(QUIZ_QUESTIONS_CACHE_KEY, JSON.stringify(questions));
  } catch {}
}

export async function fetchQuizQuestionsPublic(): Promise<QuizQuestion[]> {
  const localCached = getLocalQuizQuestionsCache();
  try {
    // Fetch from the public view that strictly strips correct_answer_index
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
      const merged = [...dbQuestions];
      localCached.forEach(lq => {
        if (!merged.some(mq => mq.id === lq.id)) {
          merged.push(lq);
        }
      });
      saveLocalQuizQuestionsCache(merged);
      return merged;
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
    const token = getAdminAuthToken();
    const res = await fetch('/api/admin/quiz-question', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ question: q }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('upsertQuizQuestion server call failed (preserved in local cache):', err?.message);
  }
  return false;
}

export async function upsertQuizQuestionsBulk(questions: QuizQuestion[]): Promise<boolean> {
  const current = getLocalQuizQuestionsCache();
  const newIds = new Set(questions.map(q => q.id));
  const updated = [...questions, ...current.filter(item => !newIds.has(item.id))];
  saveLocalQuizQuestionsCache(updated);

  try {
    const token = getAdminAuthToken();
    const res = await fetch('/api/admin/quiz-questions-bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ questions }),
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('upsertQuizQuestionsBulk server call failed (preserved in local cache):', err?.message);
  }
  return false;
}

export async function deleteQuizQuestionFromDb(id: string): Promise<boolean> {
  const current = getLocalQuizQuestionsCache();
  saveLocalQuizQuestionsCache(current.filter(item => item.id !== id));

  try {
    const token = getAdminAuthToken();
    const res = await fetch(`/api/admin/quiz-question/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    });
    if (res.ok) {
      const data = await res.json();
      return !!data.success;
    }
  } catch (err: any) {
    console.error('deleteQuizQuestionFromDb server call failed:', err?.message);
  }
  return false;
}

export async function fetchLeaderboard(): Promise<QuizAttempt[]> {
  try {
    const { data, error } = await supabase
      .from('quiz_attempts_leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .order('time_taken_seconds', { ascending: true });

    if (error) {
      console.warn('Could not fetch quiz_attempts_leaderboard from Supabase:', error.message);
      return [];
    }

    if (data && Array.isArray(data)) {
      return data.map((row: any) => ({
        attemptId: row.attempt_id,
        studentId: row.student_id,
        userId: row.user_id || row.student_id,
        teamId: row.team_id || '',
        startTime: row.submitted_at || new Date().toISOString(),
        submittedAt: row.submitted_at,
        answers: {},
        markedForReview: [],
        score: Number(row.score ?? 0),
        analyticalScore: Number(row.analytical_score ?? 0),
        timeTakenSeconds: Number(row.time_taken_seconds ?? 0),
        tabSwitchCount: Number(row.tab_switch_count ?? 0),
        isCompleted: Boolean(row.is_completed ?? true),
      }));
    }
    return [];
  } catch (err: any) {
    console.warn('fetchLeaderboard exception:', err?.message);
    return [];
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


