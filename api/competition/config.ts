import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://setjjgjhuslevgnqcnhj.supabase.co';

const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_RDIbw6a-RZItDzeY80ylwA_-7XGzb5V';
function resolveRequestSchema(req: any): 'public' | 'uat' {
  const origin = ((req.headers?.origin || req.headers?.referer || '') as string).toLowerCase();
  const host = ((req.headers?.host || '') as string).toLowerCase();
  const explicit = ((req.headers?.['x-app-schema'] || req.headers?.['x-db-schema'] || '') as string).toLowerCase();

  if (explicit === 'public') return 'public';
  if (explicit === 'uat') return 'uat';
  if (origin.includes('research.aima.in') || host.includes('research.aima.in')) return 'public';
  if (origin.includes('vercel.app') || host.includes('vercel.app') || origin.includes('localhost') || host.includes('localhost')) return 'uat';

  return (process.env.VITE_DB_SCHEMA || process.env.DB_SCHEMA || 'uat') === 'public' ? 'public' : 'uat';
}

const adminClients: Record<'public' | 'uat', any> = {
  public: createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'public' },
  }),
  uat: createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
    db: { schema: 'uat' },
  }),
};

export default async function handler(req: any, res: any) {
  const schema = resolveRequestSchema(req);
  const supabaseAdmin = adminClients[schema];

  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-App-Schema, X-Db-Schema'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { data } = await supabaseAdmin
      .from('competition_config')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (data) {
      return res.status(200).json({
        leagueName: data.league_name,
        year: data.year,
        edition: data.edition,
        activeStage: data.active_stage,
        registrationOpen: data.registration_open,
        r1QuizStartTime: data.r1_quiz_start_time,
        r1QuizEndTime: data.r1_quiz_end_time,
        r1DurationMinutes: data.r1_duration_minutes,
        r1NegativeMarking: data.r1_negative_marking,
        r1CutoffScore: Number(data.r1_cutoff_score) || 60,
        r2SubmissionDeadline: data.r2_submission_deadline,
        r2MaxSlideCount: data.r2_max_slide_count,
        r2MaxFileSizeMB: data.r2_max_file_size_mb,
        feeR1R2: Number(data.fee_r1_r2) || 200,
        feeR3: Number(data.fee_r3) || 2000,
        feeR4: Number(data.fee_r4) || 2000,
        isPublicResultsPublished: data.is_public_results_published,
        updatedAt: data.updated_at,
      });
    }

    return res.status(200).json({
      leagueName: 'AIMA-ICRC India Case League',
      year: '2026',
      edition: 'Inaugural National Edition',
      activeStage: 'round_2',
      registrationOpen: true,
      r1QuizStartTime: '2026-09-10T10:00:00Z',
      r1QuizEndTime: '2026-09-10T22:00:00Z',
      r1DurationMinutes: 45,
      r1NegativeMarking: true,
      r1CutoffScore: 60,
      r2SubmissionDeadline: '2026-09-25T23:59:59Z',
      r2MaxSlideCount: 12,
      r2MaxFileSizeMB: 25,
      feeR1R2: 200,
      feeR3: 2000,
      feeR4: 2000,
      isPublicResultsPublished: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message });
  }
}
