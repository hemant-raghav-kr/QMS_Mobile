import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { getAnnouncements } from '@/services/announcementsService';

export function useAnnouncements() {
  const { role } = useAuth();

  return useQuery({
    queryKey: ['announcements', role],
    queryFn: () => getAnnouncements(role),
    staleTime: 1000 * 60, // 1 minute
  });
}
