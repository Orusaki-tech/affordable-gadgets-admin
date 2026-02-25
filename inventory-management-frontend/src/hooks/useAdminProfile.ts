import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';
import { queryKeys } from './queryKeys';

/**
 * Single source of truth for admin profile.
 * - When AuthContext fetches profile on login/validate, it seeds the React Query cache.
 * - Any component that calls useAdminProfile() reads from that same cache and re-renders when the data updates.
 * - Only one request is made (or cache is used); no duplicate requests per page.
 */
export function useAdminProfile() {
  const { user } = useAuth();
  return useQuery({
    queryKey: queryKeys.adminProfile(user?.id),
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 min – treat as shared data, avoid refetch on every nav
  });
}
