/**
 * React Query hooks for reviews
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiService, Review, PaginatedReviewList } from '@/lib/api/generated';

export function useProductReviews(productId: number, params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedReviewList>({
    queryKey: ['reviews', 'product', productId, params],
    queryFn: () => ApiService.apiV1PublicReviewsList(undefined, params?.page, productId),
    enabled: !!productId,
    staleTime: 60000, // 1 minute
  });
}

export function useAllReviews(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedReviewList>({
    queryKey: ['reviews', 'all', params],
    queryFn: () => ApiService.apiV1PublicReviewsList(undefined, params?.page),
    staleTime: 60000, // 1 minute
  });
}

export function useReview(reviewId: number) {
  return useQuery<Review>({
    queryKey: ['review', reviewId],
    queryFn: () => ApiService.apiV1PublicReviewsRetrieve(reviewId),
    enabled: !!reviewId,
  });
}







