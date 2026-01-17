/**
 * React Query hooks for promotions
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiService, PublicPromotion, PaginatedPublicPromotionList } from '@/lib/api/generated';

export function usePromotions(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedPublicPromotionList>({
    queryKey: ['promotions', params],
    queryFn: () => ApiService.apiV1PublicPromotionsList(params?.page),
    staleTime: 60000, // 1 minute
  });
}

export function usePromotion(id: number) {
  return useQuery<PublicPromotion>({
    queryKey: ['promotion', id],
    queryFn: () => ApiService.apiV1PublicPromotionsRetrieve(id),
    enabled: !!id,
  });
}







