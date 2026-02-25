import { useQuery } from '@tanstack/react-query';
import { BrandsService } from '../api/index';
import { queryKeys } from './queryKeys';

/**
 * Shared brands list (first page). Same cache used by AdminsPage and ProductForm.
 * Pass enabled: false to avoid fetching until needed (e.g. when modal opens).
 */
export function useBrandsList(options?: { enabled?: boolean }) {
  const { data, ...rest } = useQuery({
    queryKey: queryKeys.brands(),
    queryFn: async () => {
      const response = await BrandsService.brandsList(1);
      return response.results || [];
    },
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
  return { data: data ?? [], ...rest };
}
