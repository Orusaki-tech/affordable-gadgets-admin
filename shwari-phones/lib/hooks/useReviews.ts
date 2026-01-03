/**
 * React Query hooks for reviews
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { reviewsApi, Review, PaginatedReviewResponse } from '@/lib/api/reviews';

export function useProductReviews(productId: number, params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedReviewResponse>({
    queryKey: ['reviews', 'product', productId, params],
    queryFn: () => reviewsApi.getProductReviews(productId, params),
    enabled: !!productId,
    staleTime: 60000, // 1 minute
  });
}

export function useAllReviews(params?: {
  page?: number;
  page_size?: number;
}) {
  return useQuery<PaginatedReviewResponse>({
    queryKey: ['reviews', 'all', params],
    queryFn: () => reviewsApi.getAllReviews(params),
    staleTime: 60000, // 1 minute
  });
}

export function useReview(reviewId: number) {
  return useQuery<Review>({
    queryKey: ['review', reviewId],
    queryFn: () => reviewsApi.getReview(reviewId),
    enabled: !!reviewId,
  });
}







