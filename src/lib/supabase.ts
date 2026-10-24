import { createClient } from '@supabase/supabase-js';
import { CSRBootcampRegistration, CSRBootcampNominee } from '../types';

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
  const participantCount = reg.participantCount || reg.nominees?.length || 1;
  const isFreeTier = (reg.subtotalExclGst === 0 && reg.totalPayable === 0) || reg.tierLabel?.includes('Early Bird');
  const authoritativeSubtotal = isFreeTier ? 0 : participantCount * 200;
  const authoritativeTotal = isFreeTier ? 0 : participantCount * 200;

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
      fee_tier: isFreeTier ? 'Early Bird Complimentary (₹0)' : `₹200 per participant`,
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

/**
 * Save / Update Participant Selected Track in Supabase database
 */
export async function saveParticipantTrackSelection(
  registrationNumber: string,
  email: string,
  trackId: string,
  trackName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    let existingQuery = supabase.from('registrations').select('*');
    if (registrationNumber) {
      existingQuery = existingQuery.eq('registration_number', registrationNumber);
    } else if (email) {
      existingQuery = existingQuery.eq('coordinator_email', email.toLowerCase().trim());
    }

    const { data: existingRows, error: fetchErr } = await existingQuery;

    if (fetchErr) {
      console.warn('Error fetching registration for track update:', fetchErr.message);
    }

    const existing = existingRows?.[0];
    const now = new Date().toISOString();
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
      trackSelectedAt: now,
      nominees: updatedNominees,
    };

    if (existing) {
      const { error: updErr } = await supabase
        .from('registrations')
        .update({ raw_data: updatedRaw })
        .eq('id', existing.id);

      if (updErr) {
        console.warn('Supabase track update error:', updErr.message);
      }
    }

    // Update local cache
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (r.registrationNumber === registrationNumber) {
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
 * Save / Update Jury Scorecard in Supabase database against team / participant
 */
export async function saveJuryScorecardToDb(scorecard: {
  teamId: string;
  registrationNumber?: string;
  teamName: string;
  instituteName: string;
  round: 'round_2' | 'round_3' | 'round_4';
  trackId?: string;
  trackName?: string;
  offlineQuizScore: number;
  livePresentationScore: number;
  qaDefenseScore: number;
  aggregateScore: number;
  rank: number;
  attendanceVerified: boolean;
  qualifiedNextRound?: boolean;
  award?: string;
  notes?: string;
  evaluatedBy?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const regNum = scorecard.registrationNumber || scorecard.teamId.replace('team_participant_', '').replace('team_', '');
    const { data: existingRows } = await supabase
      .from('registrations')
      .select('*')
      .or(`registration_number.eq.${regNum},team_name.eq.${scorecard.teamName}`);

    const existing = existingRows?.[0];
    const now = new Date().toISOString();
    const rawData = existing?.raw_data || {};
    const prevOfflineResults = rawData.offlineRoundResults || [];

    const updatedItem = {
      ...scorecard,
      id: `off_${scorecard.round}_${Date.now()}`,
      registrationNumber: regNum,
      uploadedAt: now,
    };

    const existingIdx = prevOfflineResults.findIndex(
      (r: any) => r.round === scorecard.round && (r.teamId === scorecard.teamId || r.registrationNumber === regNum)
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
    };

    if (existing) {
      const { error: updErr } = await supabase
        .from('registrations')
        .update({ raw_data: updatedRaw })
        .eq('id', existing.id);

      if (updErr) {
        console.warn('Supabase jury scorecard update notice:', updErr.message);
      }
    }

    // Update local cache
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (r.registrationNumber === regNum || r.teamName === scorecard.teamName) {
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

-- Grant permissions to Supabase roles
GRANT ALL ON public.registrations TO anon, authenticated, service_role;

-- Allow public submission & read via publishable/anon key
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
`;

