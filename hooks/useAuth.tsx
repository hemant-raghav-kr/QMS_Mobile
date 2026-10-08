import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';
import { apiClient } from '@/lib/api/client';
import { getCurrentProfile } from '@/services/profileService';
import {
  signInWithEmail,
  signUpWithEmail,
  signOut as authSignOut,
  resetPasswordForEmail,
  updateUserPassword,
} from '@/services/authService';
import type { Profile, UserRole } from '@/types/database';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  role: UserRole | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, pass: string) => Promise<{ error?: string }>;
  signUp: (email: string, pass: string, name: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (password: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await getCurrentProfile(userId);
      setProfile(p);
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
  }, []);

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    // 2. Listen to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        await fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    // 3. Centralized 401 callback for automatic logout if refresh fails
    apiClient.setOnUnauthorized(async () => {
      await authSignOut();
      setSession(null);
      setUser(null);
      setProfile(null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, pass: string) => {
    setIsLoading(true);
    const { session: newSession, error } = await signInWithEmail(email, pass);
    if (error) {
      setIsLoading(false);
      return { error };
    }
    if (newSession?.user) {
      await fetchProfile(newSession.user.id);
    }
    setIsLoading(false);
    return {};
  };

  const signUp = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    const res = await signUpWithEmail(email, pass, name);
    if (res.error) {
      setIsLoading(false);
      return { error: res.error };
    }
    if (res.session?.user) {
      await fetchProfile(res.session.user.id);
    }
    setIsLoading(false);
    return { requiresEmailConfirmation: res.requiresEmailConfirmation };
  };

  const signOut = async () => {
    setIsLoading(true);
    await authSignOut();
    setSession(null);
    setUser(null);
    setProfile(null);
    setIsLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const resetPassword = async (email: string) => {
    const res = await resetPasswordForEmail(email);
    if (!res.success) {
      return { error: res.error || 'Password reset failed' };
    }
    return {};
  };

  const updatePassword = async (password: string) => {
    const res = await updateUserPassword(password);
    if (!res.success) {
      return { error: res.error || 'Password update failed' };
    }
    return {};
  };

  const role = profile?.role ?? null;
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';
  const isSuperAdmin = role === 'SUPER_ADMIN';

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      role,
      isAdmin,
      isSuperAdmin,
      isLoading,
      signIn,
      signUp,
      signOut,
      refreshProfile,
      resetPassword,
      updatePassword,
    }),
    [session, user, profile, role, isAdmin, isSuperAdmin, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
