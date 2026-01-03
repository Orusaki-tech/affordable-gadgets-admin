'use client';

import { useSearchParams } from 'next/navigation';
import { useProducts } from '@/lib/hooks/useProducts';
import { usePromotion } from '@/lib/hooks/usePromotions';
import { ProductCard } from './ProductCard';
import { ProductFilters, FilterState } from './ProductFilters';
import { useState, useMemo } from 'react';
import Link from 'next/link';

export function ProductsPage() {
  const searchParams = useSearchParams();
  const promotionId = searchParams.get('promotion');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [filters, setFilters] = useState<FilterState>({
    type: searchParams.get('type') || '',
    minPrice: '',
    maxPrice: '',
    brand: '',
  });
  const [sort, setSort] = useState('');

  // Fetch promotion details if promotion ID is in URL
  const { data: promotionData } = usePromotion(promotionId ? parseInt(promotionId) : 0);

  // Use backend filter for promotion - this ensures proper pagination and filtering
  const { data, isLoading, error } = useProducts({
    page,
    page_size: 24,
    type: filters.type || undefined,
    search: search || undefined,
    brand_filter: filters.brand || undefined,
    min_price: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
    max_price: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
    ordering: sort || undefined,
    promotion: promotionId ? parseInt(promotionId) : undefined, // Backend will filter by promotion
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
  };

  return (
    <div>
      {promotionData ? (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h1 className="text-4xl font-bold mb-2">{(promotionData as any).title}</h1>
          {(promotionData as any).description && (
            <p className="text-gray-600 mb-2">{(promotionData as any).description}</p>
          )}
          {(promotionData as any).promotion_code && (
            <p className="text-sm text-gray-500">
              Promotion Code: <code className="bg-white px-2 py-1 rounded">{(promotionData as any).promotion_code}</code>
            </p>
          )}
        </div>
      ) : (
        <h1 className="text-4xl font-bold mb-8">Products</h1>
      )}

      {/* Search Bar */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {/* Filters and Sort */}
      <ProductFilters onFiltersChange={handleFiltersChange} onSortChange={handleSortChange} />

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">Error loading products. Please try again later.</p>
        </div>
      ) : !data || data.results.length === 0 ? (
        <div className="text-center py-12">
          {promotionId && promotionData ? (
            <p className="text-gray-600 mb-4">No products available for this promotion.</p>
          ) : (
            <p className="text-gray-600">No products found.</p>
          )}
        </div>
      ) : (
        <>
          <p className="text-gray-600 mb-4">
            Showing {data.results.length} of {data.count} product{data.count !== 1 ? 's' : ''}
            {promotionId && promotionData && (
              <span className="ml-2 text-sm text-blue-600">
                (filtered by promotion: {(promotionData as any).title})
              </span>
            )}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {(data.next || data.previous) && (
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!data.previous}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {page} of {Math.ceil(data.count / 24)}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!data.next}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

