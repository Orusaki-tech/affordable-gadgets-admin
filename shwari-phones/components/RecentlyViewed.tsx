'use client';

import { useEffect, useState } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import { ProductCard } from './ProductCard';

export function RecentlyViewed() {
  const [productIds, setProductIds] = useState<number[]>([]);
  const { data } = useProducts({
    page_size: 10,
  });

  useEffect(() => {
    const recentlyViewed = JSON.parse(
      localStorage.getItem('recentlyViewed') || '[]'
    ) as number[];
    setProductIds(recentlyViewed);
  }, []);

  const recentlyViewedProducts = data?.results.filter((p) =>
    productIds.includes(p.id)
  ) || [];

  // Sort by recently viewed order
  const sortedProducts = recentlyViewedProducts.sort((a, b) => {
    const indexA = productIds.indexOf(a.id);
    const indexB = productIds.indexOf(b.id);
    return indexA - indexB;
  });

  if (productIds.length === 0 || sortedProducts.length === 0) {
    // Show placeholder recently viewed
    return (
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden opacity-60 border-2 border-gray-100">
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <span className="text-5xl opacity-50">👁️</span>
              </div>
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded mb-3 animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

