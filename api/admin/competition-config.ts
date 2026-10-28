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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, X-App-Schema, X-Db-Schema'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }
    body = body || {};

    const { updates } = body;
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ error: "Invalid payload: 'updates' object is required." });
    }

    const fieldMapping: Record<string, string> = {
      activeStage: 'active_stage',
      registrationOpen: 'registration_open',
      r1NegativeMarking: 'r1_negative_marking',
      isPublicResultsPublished: 'is_public_results_published',
      r1CutoffScore: 'r1_cutoff_score',
      r1DurationMinutes: 'r1_duration_minutes',
      r2SubmissionDeadline: 'r2_submission_deadline',
      r2MaxSlideCount: 'r2_max_slide_count',
      r2MaxFileSizeMB: 'r2_max_file_size_mb',
      r3RegionalStartDate: 'r3_regional_start_date',
      r4NationalFinaleDate: 'r4_national_finale_date',
      feeR1R2: 'fee_r1_r2',
      feeR3: 'fee_r3',
      feeR4: 'fee_r4',
    };

    const dbUpdates: any = {
      id: 'default',
      updated_at: new Date().toISOString(),
    };

    for (const [clientKey, dbKey] of Object.entries(fieldMapping)) {
      if (clientKey in updates) {
        dbUpdates[dbKey] = updates[clientKey];
      }
    }

    const { data: updatedConfigRow, error: updateError } = await supabaseAdmin
      .from('competition_config')
      .upsert(dbUpdates, { onConflict: 'id' })
      .select()
      .single();

    if (updateError) {
      return res.status(500).json({ error: updateError.message });
    }

    return res.status(200).json({
      success: true,
      schema,
      updatedConfig: updatedConfigRow,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
