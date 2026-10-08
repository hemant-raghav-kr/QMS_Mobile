import { apiClient, ApiError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Announcement, UserRole } from '@/types/database';
import type { GetAnnouncementsResponse } from '@/types/api';

export async function getAnnouncements(userRole?: UserRole | null): Promise<Announcement[]> {
  try {
    const res = await apiClient.get<GetAnnouncementsResponse | Announcement[]>(
      '/api/v1/announcements'
    );
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/announcements error:', err.message);
    }
  }

  // Fallback to direct authenticated Supabase query
  let query = supabase
    .from('announcements')
    .select('*')
    .eq('archived', false)
    .order('created_at', { ascending: false });

  if (userRole === 'MEMBER') {
    query = query.in('target_audience', ['ALL', 'MEMBERS']);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching announcements from Supabase:', error);
    return [];
  }

  return (data as Announcement[]) || [];
}
