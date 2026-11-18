import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { ApiError } from './validate.js';

export function requireDatabase(req, res, next) {
  if (!isSupabaseConfigured() || !supabaseAdmin) {
    return next(
      new ApiError(
        503,
        'Supabase backend credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.'
      )
    );
  }
  return next();
}

/**
 * Verifies the Supabase Auth JWT from Authorization: Bearer <token>,
 * resolves the user's profile from PostgreSQL, and attaches req.user & req.profile.
 */
export async function requireAuth(req, res, next) {
  try {
    if (!isSupabaseConfigured() || !supabaseAdmin) {
      throw new ApiError(
        503,
        'Supabase backend credentials are not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.'
      );
    }

    const authHeader = req.headers.authorization || '';
    if (!authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authentication required. Please log in.');
    }

    const token = authHeader.slice(7).trim();
    if (!token) {
      throw new ApiError(401, 'Invalid authentication token.');
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userData?.user) {
      throw new ApiError(401, 'Your session has expired or is invalid. Please log in again.');
    }

    const user = userData.user;

    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, phone, role, created_at, updated_at')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      throw new ApiError(500, 'Failed to load user profile.', profileError.message);
    }

    // Fallback creation if user signed up before trigger was installed
    if (!profile) {
      const { data: createdProfile, error: createError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || '',
          phone: user.user_metadata?.phone || '',
          role: 'customer',
        })
        .select('id, full_name, email, phone, role, created_at, updated_at')
        .single();

      if (createError) {
        throw new ApiError(500, 'Failed to initialize user profile.', createError.message);
      }
      profile = createdProfile;
    }

    req.user = user;
    req.profile = profile;
    return next();
  } catch (err) {
    return next(err);
  }
}

/**
 * Optional auth middleware for public endpoints that vary behavior for admins.
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ') || !isSupabaseConfigured() || !supabaseAdmin) {
    return next();
  }
  try {
    const token = authHeader.slice(7).trim();
    if (!token) return next();
    const { data: userData } = await supabaseAdmin.auth.getUser(token);
    if (userData?.user) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, email, phone, role')
        .eq('id', userData.user.id)
        .maybeSingle();
      req.user = userData.user;
      req.profile = profile || null;
    }
  } catch {
    // Ignore optional auth failures on public routes
  }
  return next();
}

/**
 * Enforces server-side administrator role authorization.
 */
export function requireAdmin(req, res, next) {
  if (!req.profile || req.profile.role !== 'admin') {
    return next(new ApiError(403, 'Forbidden: Administrator privileges are required.'));
  }
  return next();
}
