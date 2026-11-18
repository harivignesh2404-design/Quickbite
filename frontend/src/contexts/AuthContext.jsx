import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setProfile(null);
      return null;
    }
    try {
      const profileData = await api.getProfile();
      setProfile(profileData);
      return profileData;
    } catch {
      // Fallback to direct Supabase query if Express is momentarily unreachable
      if (supabase) {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name, email, phone, role')
          .eq('id', authUser.id)
          .maybeSingle();
        if (data) {
          setProfile(data);
          return data;
        }
      }
      setProfile({
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || '',
        phone: authUser.user_metadata?.phone || '',
        role: 'customer',
      });
      return null;
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!mounted) return;
      const sessionUser = data?.session?.user || null;
      setUser(sessionUser);
      if (sessionUser) {
        await loadProfile(sessionUser);
      }
      if (mounted) setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user || null;
      setUser(nextUser);
      if (nextUser) {
        await loadProfile(nextUser);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, [loadProfile]);

  const register = async ({ fullName, email, phone, password }) => {
    if (!supabase) {
      throw new Error(
        'Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.'
      );
    }
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          phone: phone.trim(),
        },
      },
    });
    if (error) throw new Error(error.message);
    return data;
  };

  const login = async ({ email, password }) => {
    if (!supabase) {
      throw new Error(
        'Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.'
      );
    }
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      await loadProfile(data.user);
    }
    return data;
  };

  const logout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      return loadProfile(user);
    }
    return null;
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isAuthenticated: Boolean(user),
        isSupabaseConfigured,
        register,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
