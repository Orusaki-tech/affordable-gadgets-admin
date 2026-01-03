/**
 * React Query hooks for product accessories
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { accessoriesApi, ProductAccessoryLink } from '@/lib/api/accessories';

export function useProductAccessories(productId: number) {
  return useQuery<ProductAccessoryLink[]>({
    queryKey: ['product-accessories', productId],
    queryFn: () => accessoriesApi.getProductAccessories(productId),
    enabled: !!productId,
    staleTime: 300000, // 5 minutes (accessories don't change often)
  });
}







