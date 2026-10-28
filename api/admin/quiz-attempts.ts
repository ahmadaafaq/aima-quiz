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
    const { data: attempts, error } = await supabaseAdmin
      .from('quiz_attempts')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Enrich with participant info
    const { data: participants } = await supabaseAdmin
      .from('participants')
      .select('id, name, email, institute_name, registration_number');

    const partMap = new Map();
    if (Array.isArray(participants)) {
      participants.forEach((p: any) => {
        if (p.email) partMap.set(p.email.toLowerCase(), p);
        if (p.id) partMap.set(String(p.id), p);
      });
    }

    const enriched = (attempts || []).map((row: any) => {
      const p =
        (row.participant_email && partMap.get(row.participant_email.toLowerCase())) ||
        (row.student_id && partMap.get(String(row.student_id)));

      return {
        attempt_id: row.attempt_id,
        student_id: row.student_id,
        user_id: row.user_id || row.student_id,
        participant_email: row.participant_email,
        team_id: row.team_id || '',
        program_id: row.program_id,
        start_time: row.start_time,
        submitted_at: row.submitted_at,
        answers: row.answers || {},
        marked_for_review: row.marked_for_review || [],
        score: Number(row.score ?? 0),
        analytical_score: Number(row.analytical_score ?? 0),
        time_taken_seconds: Number(row.time_taken_seconds ?? 0),
        tab_switch_count: Number(row.tab_switch_count ?? 0),
        is_completed: Boolean(row.is_completed ?? true),
        candidate_name: p?.name || row.participant_email?.split('@')[0] || row.student_id,
        institute_name: p?.institute_name || 'National Management Institute',
        registration_number: p?.registration_number || 'AIMA-CL26-00000',
      };
    });

    return res.status(200).json({
      success: true,
      schema,
      attempts: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
