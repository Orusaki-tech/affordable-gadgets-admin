/**
 * Centralized query keys for shared data.
 * Same key = same cache entry = one request, many subscribers get the same data and re-render when it updates.
 */

export const queryKeys = {
  /** Stable key for current user's admin profile – do not key by userId so cache is shared after login before context updates */
  adminProfile: () => ['admin-profile'] as const,
  brands: () => ['brands'] as const,
  colorsAll: () => ['colors-all'] as const,
  sourcesAll: () => ['sources-all'] as const,
  productsAll: (search?: string): readonly ['products-all'] | readonly ['products-all', string] => {
    const s = search?.trim();
    if (s) return ['products-all', s] as readonly ['products-all', string];
    return ['products-all'] as const;
  },
  orders: (page: number, pageSize: number) => ['orders', page, pageSize] as const,
  promotionsAll: () => ['promotions-all'] as const,
  promotionsAllForAttach: () => ['promotions-all-for-attach'] as const,
};
