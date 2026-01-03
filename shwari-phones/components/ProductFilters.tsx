'use client';

import { useState } from 'react';

interface ProductFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  onSortChange: (sort: string) => void;
}

export interface FilterState {
  type: string;
  minPrice: string;
  maxPrice: string;
  brand: string;
}

const SORT_OPTIONS = [
  { value: '', label: 'Default' },
  { value: 'product_name', label: 'Name (A-Z)' },
  { value: '-product_name', label: 'Name (Z-A)' },
  { value: 'min_price', label: 'Price (Low to High)' },
  { value: '-min_price', label: 'Price (High to Low)' },
  { value: '-available_units_count', label: 'Most Available' },
];

export function ProductFilters({ onFiltersChange, onSortChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    type: '',
    minPrice: '',
    maxPrice: '',
    brand: '',
  });
  const [sort, setSort] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSortChange = (value: string) => {
    setSort(value);
    onSortChange(value);
  };

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      type: '',
      minPrice: '',
      maxPrice: '',
      brand: '',
    };
    setFilters(emptyFilters);
    setSort('');
    onFiltersChange(emptyFilters);
    onSortChange('');
  };

  return (
    <div className="mb-6">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </button>

        <select
          value={sort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {(filters.type || filters.minPrice || filters.maxPrice || filters.brand || sort) && (
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-red-600 hover:text-red-700"
          >
            Clear All
          </button>
        )}
      </div>

      {isOpen && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium mb-2">Product Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">All Types</option>
                <option value="PH">Phones</option>
                <option value="LT">Laptops</option>
                <option value="TB">Tablets</option>
                <option value="AC">Accessories</option>
              </select>
            </div>

            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Brand</label>
              <input
                type="text"
                value={filters.brand}
                onChange={(e) => handleFilterChange('brand', e.target.value)}
                placeholder="e.g., Apple, Samsung"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Min Price (KES)</label>
              <input
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                placeholder="0"
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium mb-2">Max Price (KES)</label>
              <input
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                placeholder="1000000"
                min="0"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}







