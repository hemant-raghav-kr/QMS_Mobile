import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import {
  getUserPointsSummary,
  getPointsTransactions,
  adminAwardPoints,
} from '@/services/pointsService';
import type { AdminAwardPointsRequest } from '@/types/api';

export function usePointsSummary() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['points', 'summary', user?.id],
    queryFn: () => (user?.id ? getUserPointsSummary(user.id) : null),
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function usePointsTransactions(limit: number = 50) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['points', 'transactions', user?.id, limit],
    queryFn: () => (user?.id ? getPointsTransactions(user.id, limit) : []),
    enabled: !!user?.id,
    staleTime: 1000 * 30,
  });
}

export function useAdminAwardPoints() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminAwardPointsRequest) => adminAwardPoints(payload),
    onSuccess: (_data, variables) => {
      // Invalidate target user's points cache
      queryClient.invalidateQueries({ queryKey: ['points', 'summary', variables.userId] });
      queryClient.invalidateQueries({ queryKey: ['points', 'transactions', variables.userId] });
    },
  });
}
