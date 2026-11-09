import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);
  const exchangeInFlight = useRef(null);

  const saveSession = useCallback((data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data;
  }, []);

  const exchangeSupabaseSession = useCallback(async (session) => {
    if (!session?.access_token) return null;
    if (exchangeInFlight.current) return exchangeInFlight.current;
    exchangeInFlight.current = api.post('/auth/google', { access_token: session.access_token })
      .then(({ data }) => saveSession(data))
      .finally(() => { exchangeInFlight.current = null; });
    return exchangeInFlight.current;
  }, [saveSession]);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const token     = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    if (!supabase) {
      setLoading(false);
      return undefined;
    }

    let mounted = true;
    const loadSupabaseSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        try { await exchangeSupabaseSession(session); } catch (error) { console.error('Google sign-in failed:', error); }
      }
      if (mounted) setLoading(false);
    };
    loadSupabaseSession();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        exchangeSupabaseSession(session).catch((error) => console.error('Google sign-in failed:', error));
      }
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, [exchangeSupabaseSession]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return saveSession(data);
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    return saveSession(data);
  }, []);

  const loginWithGoogle = useCallback(async (redirectPath = '/login') => {
    if (!supabase) throw new Error('Google sign-in is not configured yet.');
    // Warm the Render service while the user completes Google's consent step.
    void api.get('/health').catch(() => {});
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${redirectPath}` },
    });
    if (error) throw error;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    if (supabase) supabase.auth.signOut().catch(() => {});
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, register, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
