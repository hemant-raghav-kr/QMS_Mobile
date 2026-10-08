import { apiClient, ApiError } from '@/lib/api/client';
import { supabase } from '@/lib/supabase/client';
import type { PointTransaction, UserPointsSummary } from '@/types/database';
import type {
  GetPointsSummaryResponse,
  GetPointsTransactionsResponse,
  AdminAwardPointsRequest,
  AdminAwardPointsResponse,
} from '@/types/api';

/**
 * Calculates current dynamic points summary from the immutable transaction ledger.
 * Total points is strictly SUM(amount) matching the web dashboard exactly.
 */
export async function getUserPointsSummary(userId: string): Promise<UserPointsSummary> {
  try {
    const res = await apiClient.get<GetPointsSummaryResponse | UserPointsSummary>('/api/v1/points');
    if ('data' in res && res.data) {
      return res.data;
    }
    if ('totalPoints' in res) {
      return res as UserPointsSummary;
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      console.warn('API /api/v1/points error:', err.message);
    }
  }

  // Fallback to immutable point_transactions ledger calculation
  const { data, error } = await supabase
    .from('point_transactions')
    .select('amount')
    .eq('user_id', userId);

  if (error || !data) {
    console.error('Error fetching point transactions summary:', error);
    return {
      totalPoints: 0,
      pointsEarned: 0,
      pointsDeducted: 0,
      transactionsCount: 0,
    };
  }

  let totalPoints = 0;
  let pointsEarned = 0;
  let pointsDeducted = 0;

  data.forEach((tx) => {
    const amt = Number(tx.amount) || 0;
    totalPoints += amt;
    if (amt > 0) {
      pointsEarned += amt;
    } else if (amt < 0) {
      pointsDeducted += Math.abs(amt);
    }
  });

  return {
    totalPoints,
    pointsEarned,
    pointsDeducted,
    transactionsCount: data.length,
  };
}

/**
 * Fetches point transaction history from the immutable ledger.
 */
export async function getPointsTransactions(
  userId: string,
  limit: number = 50
): Promise<PointTransaction[]> {
  try {
    const res = await apiClient.get<GetPointsTransactionsResponse | PointTransaction[]>(
      '/api/v1/points/transactions',
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
      console.warn('API /api/v1/points/transactions error:', err.message);
    }
  }

  // Fallback to direct authenticated Supabase query
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching point transactions:', error);
    return [];
  }

  return (data as PointTransaction[]) || [];
}

/**
 * Admin action: Manually award or deduct points for a member.
 * Server-side authorization enforces that only admins can insert.
 */
export async function adminAwardPoints(
  payload: AdminAwardPointsRequest
): Promise<{ success: boolean; data?: PointTransaction; error?: string }> {
  try {
    const res = await apiClient.post<AdminAwardPointsResponse | PointTransaction>(
      '/api/v1/admin/points',
      payload
    );
    if ('data' in res && res.data) {
      return { success: true, data: res.data };
    }
    if ('id' in res) {
      return { success: true, data: res as PointTransaction };
    }
  } catch (err: unknown) {
    if (err instanceof ApiError && err.status !== 404) {
      return { success: false, error: err.message };
    }
  }

  // Fallback to direct authenticated Supabase insert
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }

  const { data, error } = await supabase
    .from('point_transactions')
    .insert({
      user_id: payload.userId,
      amount: payload.amount,
      reason: payload.reason,
      type: payload.type || 'MANUAL',
      created_by: user.id,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, data: data as PointTransaction };
}
