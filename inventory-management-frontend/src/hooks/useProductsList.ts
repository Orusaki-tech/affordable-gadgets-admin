import { useQuery } from '@tanstack/react-query';
import { ProductsService } from '../api/index';
import { queryKeys } from './queryKeys';

/**
 * Shared products list (first page, optional search). Same cache for Dashboard, ReviewsPage,
 * ProductAccessoriesPage, and UnitForm. Empty string search is treated as no search (key ['products-all']).
 */
export function useProductsList(search?: string) {
  const normalizedSearch = search?.trim() || undefined;
  return useQuery({
    queryKey: queryKeys.productsAll(normalizedSearch),
    queryFn: () =>
      ProductsService.productsList(undefined, 1, normalizedSearch),
    staleTime: 2 * 60 * 1000,
  });
}
