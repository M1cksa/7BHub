import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

/**
 * Helper: Supabase-Clients innerhalb einer Edge Function.
 *
 *  - userClient(req)       : respektiert RLS, nutzt Auth-Token aus dem Request
 *  - serviceClient()       : bypass RLS, für vertrauenswürdige Ops (Admin, Drive-Uploads)
 *  - requireUser(req)      : liest den aktuellen User oder wirft 401
 */

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export function userClient(req: Request): SupabaseClient {
  const authHeader = req.headers.get('Authorization') ?? '';
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
}

export function serviceClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
}

export async function requireUser(req: Request) {
  const client = userClient(req);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) {
    throw new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }
  return { user, client };
}
