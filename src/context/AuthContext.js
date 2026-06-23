import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [realName, setRealName] = useState('');

  const loadProfile = useCallback(async (u) => {
    if (!u) { setRealName(''); return; }
    const { data } = await supabase
      .from('user_profiles')
      .select('real_name')
      .eq('user_id', u.id)
      .maybeSingle();
    setRealName(data?.real_name ?? '');
  }, []);

  useEffect(() => {
    // Recupera sessao persistida
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      loadProfile(u).finally(() => setLoading(false));
    });

    // Escuta mudancas de auth (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const u = session?.user ?? null;
        setUser(u);
        loadProfile(u);
      }
    );

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  async function signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setRealName('');
  }

  async function updateRealName(name) {
    if (!user) return;
    const trimmed = (name ?? '').trim();
    const { error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: user.id, real_name: trimmed, updated_at: new Date().toISOString() });
    if (error) throw error;
    setRealName(trimmed);
  }

  return (
    <AuthContext.Provider value={{ user, loading, realName, signUp, signIn, signOut, updateRealName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
