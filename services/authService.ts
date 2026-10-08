import { supabase } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

export async function signInWithEmail(email: string, password: string): Promise<{ session: Session | null; user: User | null; error?: string }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return { session: null, user: null, error: error.message };
    }

    return { session: data.session, user: data.user };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sign in failed';
    return { session: null, user: null, error: msg };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string
): Promise<{ user: User | null; session: Session | null; error?: string; requiresEmailConfirmation?: boolean }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      return { user: null, session: null, error: error.message };
    }

    const requiresEmailConfirmation = !data.session && !!data.user;
    return {
      user: data.user,
      session: data.session,
      requiresEmailConfirmation,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Sign up failed';
    return { user: null, session: null, error: msg };
  }
}

export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: 'qms://reset-password',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to send reset email';
    return { success: false, error: msg };
  }
}

export async function updateUserPassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Password update failed';
    return { success: false, error: msg };
  }
}

export async function signOut(): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { error: error.message };
    }
    return {};
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Sign out failed' };
  }
}

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentUser(): Promise<User | null> {
  const { data } = await supabase.auth.getUser();
  return data.user;
}
