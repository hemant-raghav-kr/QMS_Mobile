import { apiClient, ApiError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { Meeting } from '@/types/database';
import type { GetMeetingsResponse } from '@/types/api';

export async function getMeetings(
  filter: 'upcoming' | 'past' | 'all' = 'upcoming'
): Promise<Meeting[]> {
  try {
    const res = await apiClient.get<GetMeetingsResponse | Meeting[]>('/api/v1/meetings', {
      params: { filter },
    });
    if ('data' in res && Array.isArray(res.data)) {
      return res.data;
    }
    if (Array.isArray(res)) {
      return res;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/meetings error:', err.message);
    }
  }

  // Fallback to direct authenticated Supabase query
  const now = new Date().toISOString();
  let query = supabase.from('meetings').select('*');

  if (filter === 'upcoming') {
    query = query.gte('scheduled_at', now).order('scheduled_at', { ascending: true });
  } else if (filter === 'past') {
    query = query.lt('scheduled_at', now).order('scheduled_at', { ascending: false });
  } else {
    query = query.order('scheduled_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching meetings from Supabase:', error);
    return [];
  }

  return (data as Meeting[]) || [];
}
