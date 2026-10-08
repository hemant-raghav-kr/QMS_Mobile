import { useQuery } from '@tanstack/react-query';
import { getMeetings } from '@/services/meetingsService';

export function useMeetings(filter: 'upcoming' | 'past' | 'all' = 'upcoming') {
  return useQuery({
    queryKey: ['meetings', filter],
    queryFn: () => getMeetings(filter),
    staleTime: 1000 * 60, // 1 minute
  });
}
