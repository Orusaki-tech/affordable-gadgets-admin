/**
 * React Query hooks for promotions
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { promotionsApi, Promotion, PaginatedResponse } from '@/lib/api/promotions';

export function usePromotions(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedResponse<Promotion>>({
    queryKey: ['promotions', params],
    queryFn: () => promotionsApi.getPromotions(params),
    staleTime: 60000, // 1 minute
  });
}

export function usePromotion(id: number) {
  return useQuery<Promotion>({
    queryKey: ['promotion', id],
    queryFn: () => promotionsApi.getPromotion(id),
    enabled: !!id,
  });
}







