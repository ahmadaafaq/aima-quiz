import { createClient } from '@supabase/supabase-js';
import { CSRBootcampRegistration, CSRBootcampNominee } from '../types';

export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://setjjgjhuslevgnqcnhj.supabase.co';
export const SUPABASE_ANON_KEY =
  (import.meta as any).env?.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

/**
 * Save registration dynamically to Supabase
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

    // Insert into 'registrations' table
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
 * Fetch registrations dynamically from Supabase
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
 * Update payment status dynamically in Supabase
 */
export async function updateRegistrationPaymentInSupabase(
  registrationIdOrNumber: string,
  paymentStatus: 'PAID' | 'PENDING_INVOICE',
  paymentMethod: string,
  transactionId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updatePayload: any = {
      payment_status: paymentStatus,
      payment_method: paymentMethod,
    };
    if (transactionId) {
      updatePayload.transaction_id = transactionId;
    }

    await supabase
      .from('registrations')
      .update(updatePayload)
      .or(`registration_number.eq.${registrationIdOrNumber},id.eq.${registrationIdOrNumber}`);

    // Update local cache as well
    const cached = getLocalRegistrationsCache();
    const updated = cached.map((r) => {
      if (r.id === registrationIdOrNumber || r.registrationNumber === registrationIdOrNumber) {
        return {
          ...r,
          paymentStatus,
          paymentMethod: paymentMethod as any,
          transactionId: transactionId || r.transactionId,
          invoiceNumber: paymentStatus === 'PAID' ? r.invoiceNumber.replace('PINV-', 'INV-') : r.invoiceNumber,
        };
      }
      return r;
    });
    saveLocalRegistrationCache(updated);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export const SUPABASE_SQL_SETUP_SCRIPT = `-- ==============================================================
-- ALL INDIA MANAGEMENT ASSOCIATION (AIMA) - INDIA CASE LEAGUE 2026
-- Supabase Schema for Dynamic Registrations & Quiz Candidate Vault
-- ==============================================================

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
    payment_status TEXT NOT NULL DEFAULT 'PENDING_INVOICE', -- 'PAID' | 'PENDING_INVOICE'
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

-- Indices for rapid querying & admin dashboard filtering
CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.registrations(registration_number);
CREATE INDEX IF NOT EXISTS idx_registrations_email ON public.registrations(candidate_email);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(payment_status);
CREATE INDEX IF NOT EXISTS idx_registrations_mode ON public.registrations(registration_mode);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON public.registrations(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Allow public submission & read via publishable/anon key
DROP POLICY IF EXISTS "Allow anon submit and read registrations" ON public.registrations;
CREATE POLICY "Allow anon submit and read registrations" 
ON public.registrations 
FOR ALL 
USING (true) 
WITH CHECK (true);
`;
