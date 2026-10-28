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
    const { data: programs, error } = await supabaseAdmin
      .from('quiz_programs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json({
      success: true,
      schema,
      programs: programs || [],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
