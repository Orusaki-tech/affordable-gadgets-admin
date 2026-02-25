/**
 * Centralized query keys for shared data.
 * Same key = same cache entry = one request, many subscribers get the same data and re-render when it updates.
 */

export const queryKeys = {
  adminProfile: (userId: number | undefined) => ['admin-profile', userId] as const,
  brands: () => ['brands'] as const,
  colorsAll: () => ['colors-all'] as const,
  sourcesAll: () => ['sources-all'] as const,
  productsAll: (search?: string) => {
    const s = search?.trim();
    return (s ? ['products-all', s] : ['products-all']) as const;
  },
  orders: (page: number, pageSize: number) => ['orders', page, pageSize] as const,
  promotionsAll: () => ['promotions-all'] as const,
  promotionsAllForAttach: () => ['promotions-all-for-attach'] as const,
};
