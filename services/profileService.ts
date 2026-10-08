import { apiClient, ApiError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/database';
import type { GetProfileResponse, UpdateProfileRequest, UpdateProfileResponse } from '@/types/api';

export async function getCurrentProfile(userId: string): Promise<Profile | null> {
  try {
    const res = await apiClient.get<GetProfileResponse | Profile>('/api/v1/profile');
    if ('data' in res && res.data) {
      return res.data;
    }
    if ('id' in res) {
      return res as Profile;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/profile error:', err.message);
    }
  }

  // Fallback to direct authenticated Supabase client query with RLS
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile from Supabase:', error);
    return null;
  }

  return data as Profile;
}

export async function updateCurrentUserProfile(
  updates: UpdateProfileRequest
): Promise<{ success: boolean; data?: Profile; error?: string }> {
  try {
    const res = await apiClient.patch<UpdateProfileResponse | Profile>('/api/v1/profile', updates);
    if ('data' in res && res.data) {
      return { success: true, data: res.data };
    }
    if ('id' in res) {
      return { success: true, data: res as Profile };
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      return { success: false, error: err.message };
    }
  }

  // Fallback to direct authenticated Supabase client update with RLS
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'User is not authenticated' };
  }

  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.full_name !== undefined) {
    payload.full_name = updates.full_name ? updates.full_name.trim() : null;
  }
  if (updates.avatar_url !== undefined) {
    payload.avatar_url = updates.avatar_url ? updates.avatar_url.trim() : null;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (updates.full_name !== undefined) {
    await supabase.auth.updateUser({
      data: { full_name: updates.full_name ? updates.full_name.trim() : null },
    });
  }

  return { success: true, data: data as Profile };
}

export async function getAllMembers(): Promise<Profile[]> {
  try {
    const res = await apiClient.get<Profile[]>('/api/v1/admin/members');
    if (Array.isArray(res)) return res;
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/admin/members error:', err.message);
    }
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name', { ascending: true });

  if (error) {
    console.error('Error fetching members:', error);
    return [];
  }
  return (data as Profile[]) || [];
}
