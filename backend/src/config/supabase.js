import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL?.trim();
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

export function isSupabaseConfigured() {
  return Boolean(
    supabaseUrl &&
      serviceRoleKey &&
      !supabaseUrl.includes('your-project-ref') &&
      !serviceRoleKey.includes('your-supabase-service-role-key')
  );
}

/**
 * Service-role Supabase client for server-side database & auth verification.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the frontend.
 */
export const supabaseAdmin = isSupabaseConfigured()
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;
