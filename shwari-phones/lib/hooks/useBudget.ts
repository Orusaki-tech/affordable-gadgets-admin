/**
 * React Query hooks for budget search
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiService, PaginatedPublicProductList } from '@/lib/api/generated';

export function useBudgetSearch(minPrice: number, maxPrice: number) {
  return useQuery<PaginatedPublicProductList>({
    queryKey: ['budget-search', minPrice, maxPrice],
    queryFn: () => ApiService.apiV1PublicPhoneSearchList(minPrice, maxPrice),
    enabled: minPrice >= 0 && maxPrice > 0 && maxPrice >= minPrice,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

