/**
 * React Query hooks for product accessories
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { ApiService, ProductAccessory } from '@/lib/api/generated';

export function useProductAccessories(productId: number) {
  return useQuery<ProductAccessory[]>({
    queryKey: ['product-accessories', productId],
    queryFn: () =>
      ApiService.apiV1PublicAccessoriesLinkList(undefined, productId, 1).then(
        (response) => response.results
      ),
    enabled: !!productId,
    staleTime: 300000, // 5 minutes (accessories don't change often)
  });
}







