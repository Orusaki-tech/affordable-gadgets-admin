'use client';

import { useState, useEffect, useRef } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function SearchBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data } = useProducts({
    search: searchQuery,
    page_size: 5,
  });

  const suggestions = data?.results || [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  return (
    <div ref={searchRef} className="relative flex-1 w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(e.target.value.length > 0);
            }}
            onFocus={() => setIsOpen(searchQuery.length > 0 && suggestions.length > 0)}
            className="w-full pl-4 pr-12 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm hover:border-gray-400 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            aria-label="Search"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="block px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="font-medium text-gray-900">{product.product_name}</div>
              <div className="text-sm text-gray-500 mt-0.5">
                {product.brand} {product.model_series && `• ${product.model_series}`}
              </div>
            </Link>
          ))}
          {searchQuery && (
            <Link
              href={`/products?search=${encodeURIComponent(searchQuery)}`}
              onClick={() => {
                setIsOpen(false);
              }}
              className="block px-4 py-3 hover:bg-blue-50 border-t border-gray-200 font-medium text-blue-600 transition-colors"
            >
              View all results for "{searchQuery}"
            </Link>
          )}
        </div>
      )}
    </div>
  );
}







