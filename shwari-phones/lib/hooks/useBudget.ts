/**
 * React Query hooks for budget search
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { budgetApi, PaginatedProductResponse } from '@/lib/api/budget';

export function useBudgetSearch(minPrice: number, maxPrice: number) {
  return useQuery<PaginatedProductResponse>({
    queryKey: ['budget-search', minPrice, maxPrice],
    queryFn: () => budgetApi.searchPhonesByBudget(minPrice, maxPrice),
    enabled: minPrice >= 0 && maxPrice > 0 && maxPrice >= minPrice,
    staleTime: 60000, // 1 minute
    retry: 1,
  });
}

