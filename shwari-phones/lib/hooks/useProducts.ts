/**
 * React Query hooks for products
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { productsApi, Product, InventoryUnit, PaginatedResponse } from '@/lib/api/products';

export function useProducts(params?: {
  page?: number;
  page_size?: number;
  type?: string;
  search?: string;
  brand_filter?: string;
  min_price?: number;
  max_price?: number;
  ordering?: string;
  promotion?: number; // Promotion ID to filter products
}) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
    staleTime: 30000, // 30 seconds
  });
}

export function useProduct(id: number) {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
  });
}

export function useProductBySlug(slug: string) {
  return useQuery<Product>({
    queryKey: ['product', 'slug', slug],
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
    retry: 1, // Only retry once
    retryOnMount: false, // Don't retry on mount if it failed
  });
}

export function useProductUnits(productId: number) {
  return useQuery<InventoryUnit[]>({
    queryKey: ['product', productId, 'units'],
    queryFn: () => productsApi.getProductUnits(productId),
    enabled: !!productId,
    staleTime: 10000, // 10 seconds (more frequent updates for stock)
  });
}

