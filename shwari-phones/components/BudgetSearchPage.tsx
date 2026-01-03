'use client';

import { useState } from 'react';
import { useBudgetSearch } from '@/lib/hooks/useBudget';
import { formatPrice, formatPriceRange } from '@/lib/utils/format';
import { getPlaceholderProductImage } from '@/lib/utils/placeholders';
import Link from 'next/link';
import Image from 'next/image';

export function BudgetSearchPage() {
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchActive, setSearchActive] = useState(false);

  const { data, isLoading, error } = useBudgetSearch(
    searchActive && minPrice ? parseFloat(minPrice) : 0,
    searchActive && maxPrice ? parseFloat(maxPrice) : 0
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);
    
    if (!minPrice || !maxPrice) {
      alert('Please enter both minimum and maximum prices');
      return;
    }
    
    if (isNaN(min) || isNaN(max)) {
      alert('Please enter valid numbers for prices');
      return;
    }
    
    if (min < 0 || max < 0) {
      alert('Prices cannot be negative');
      return;
    }
    
    if (max < min) {
      alert('Maximum price must be greater than or equal to minimum price');
      return;
    }
    
    setSearchActive(true);
  };

  const handleReset = () => {
    setMinPrice('');
    setMaxPrice('');
    setSearchActive(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Budget Search</h1>
        <p className="text-gray-600 text-lg">
          Find the perfect phone within your budget range
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl shadow-sm mb-10 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Minimum Price (KES)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => {
                setMinPrice(e.target.value);
                setSearchActive(false);
              }}
              placeholder="0"
              min="0"
              step="100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg font-medium"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Maximum Price (KES)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(e.target.value);
                setSearchActive(false);
              }}
              placeholder="100000"
              min="0"
              step="100"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none text-lg font-medium"
              required
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-semibold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
            >
              Search
            </button>
            {searchActive && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 bg-white text-gray-700 border-2 border-gray-300 rounded-xl hover:bg-gray-50 font-semibold transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </form>

      {/* Results */}
      {isLoading && searchActive ? (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Searching for phones...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 rounded-2xl border-2 border-red-200">
          <div className="text-red-600 text-2xl mb-3">⚠️</div>
          <p className="text-red-700 font-semibold text-lg mb-2">Error loading results</p>
          {error instanceof Error && (
            <p className="text-sm text-red-600 mb-4">{error.message}</p>
          )}
          <button
            onClick={() => {
              setSearchActive(false);
              setMinPrice('');
              setMaxPrice('');
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      ) : searchActive && data ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <p className="text-gray-700 text-lg font-semibold">
              Found <span className="text-blue-600 font-bold">{data.count}</span> phone{data.count !== 1 ? 's' : ''} in your budget range
            </p>
          </div>
          {data.results.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <div className="text-gray-400 text-5xl mb-4">📱</div>
              <p className="text-gray-600 text-lg font-medium">No phones found in this price range.</p>
              <p className="text-gray-500 text-sm mt-2">Try adjusting your budget range</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.results.map((product: any) => {
                const hasStock = product.available_units_count > 0;
                const interestText = product.interest_count > 0 
                  ? `${product.interest_count} ${product.interest_count === 1 ? 'person' : 'people'} interested`
                  : null;

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug || product.id}`}
                    className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-300"
                  >
                    {/* Product Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <Image
                        src={product.primary_image || getPlaceholderProductImage(product.product_name)}
                        alt={product.product_name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        unoptimized={!product.primary_image || product.primary_image.includes('localhost') || product.primary_image.includes('127.0.0.1') || product.primary_image.includes('placehold.co')}
                      />
                      
                      {/* Stock Badge */}
                      {!hasStock && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
                          Out of Stock
                        </div>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-5">
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors text-gray-900">
                        {product.product_name}
                      </h3>
                      
                      <p className="text-sm text-gray-500 mb-3 font-medium">
                        {product.brand} {product.model_series && `• ${product.model_series}`}
                      </p>

                      {/* Tags */}
                      {product.tags && Array.isArray(product.tags) && product.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {product.tags.slice(0, 2).map((tag: string, idx: number) => (
                            <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded border border-blue-200 font-medium">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="mb-4">
                        {product.min_price !== null && product.max_price !== null ? (
                          <p className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                            {formatPriceRange(product.min_price, product.max_price)}
                          </p>
                        ) : (
                          <p className="text-xl font-bold text-gray-700">Price on request</p>
                        )}
                      </div>

                      {/* Stock & Interest Info */}
                      <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                        <span className={`font-semibold ${hasStock ? 'text-green-600' : 'text-red-600'}`}>
                          {hasStock ? (
                            <span className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              {product.available_units_count} {product.available_units_count === 1 ? 'unit' : 'units'}
                            </span>
                          ) : (
                            'Out of stock'
                          )}
                        </span>
                        {interestText && (
                          <span className="text-orange-600 font-semibold flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-full">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            {interestText}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-gray-400 text-5xl mb-4">💰</div>
          <p className="text-gray-600 text-lg font-medium mb-2">Enter a price range above to search for phones</p>
          <p className="text-gray-500 text-sm">Find the perfect phone that fits your budget</p>
        </div>
      )}
    </div>
  );
}

