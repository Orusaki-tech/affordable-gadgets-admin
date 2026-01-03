'use client';

import { useProducts } from '@/lib/hooks/useProducts';
import { ProductCard } from './ProductCard';
import { useState } from 'react';

export function ProductGrid() {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useProducts({ page, page_size: 12 });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
        ))}
      </div>
    );
  }

  if (error) {
    console.error('Product loading error:', error);
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-2">Error loading products. Please try again later.</p>
        <p className="text-sm text-gray-500">
          {error instanceof Error ? error.message : 'Unable to connect to the server'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    // Show placeholder products
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <span className="text-5xl opacity-50">📱</span>
            </div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data.results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Pagination */}
      {(data.next || data.previous) && (
        <div className="flex justify-center items-center gap-4 mt-12">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!data.previous}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          >
            Previous
          </button>
          <span className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold shadow-md">
            Page {page} of {Math.ceil(data.count / 12)}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.next}
            className="px-6 py-2.5 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 hover:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

