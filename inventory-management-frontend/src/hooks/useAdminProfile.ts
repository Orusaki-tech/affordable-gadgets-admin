import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { ProfilesService } from '../api/index';
import { queryKeys } from './queryKeys';

/**
 * Single source of truth for admin profile.
 * - When AuthContext fetches profile on login/validate, it seeds the React Query cache.
 * - Enabled when we have a token (isAuthenticated) so we can load profile even if context user is incomplete.
 * - Any component that calls useAdminProfile() reads from that same cache and re-renders when the data updates.
 */
export function useAdminProfile() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.adminProfile(),
    queryFn: () => ProfilesService.profilesAdminRetrieve(),
    retry: false,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 min – treat as shared data, avoid refetch on every nav
  });
}
