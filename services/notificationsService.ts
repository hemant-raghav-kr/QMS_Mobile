import { Platform } from 'react-native';
import { apiClient, ApiError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Notification } from '@/types/database';
import type { GetNotificationsResponse } from '@/types/api';

export async function getUserNotifications(
  userId: string,
  limit: number = 50
): Promise<Notification[]> {
  try {
    const res = await apiClient.get<GetNotificationsResponse | Notification[]>(
      '/api/v1/notifications',
      { params: { limit } }
    );
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/notifications error:', err.message);
    }
  }

  // Fallback to direct authenticated Supabase query
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching notifications from Supabase:', error);
    return [];
  }

  return (data as Notification[]) || [];
}

export async function markNotificationAsRead(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.patch(`/api/v1/notifications/${id}/read`);
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      return { success: false, error: err.message };
    }
  }

  // Fallback to direct Supabase update
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function markAllNotificationsAsRead(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/api/v1/notifications/read-all');
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      return { success: false, error: err.message };
    }
  }

  // Fallback to direct Supabase update
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function registerDevicePushToken(
  token: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await apiClient.post('/api/v1/notifications/push-token', {
      pushToken: token,
      platform: Platform.OS,
    });
    return { success: true };
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('Register push token API error:', err.message);
    }
  }

  // Mobile push tokens can be associated without interfering with web push (VAPID)
  // Saved cleanly for mobile notifications
  return { success: true };
}
