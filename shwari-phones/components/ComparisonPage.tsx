'use client';

import { useState, useMemo } from 'react';
import { useProducts, useProductUnits } from '@/lib/hooks/useProducts';
import { useCompare } from '@/lib/hooks/useCompare';
import { Product, InventoryUnit } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils/format';
import Link from 'next/link';
import Image from 'next/image';
import { getPlaceholderProductImage } from '@/lib/utils/placeholders';

interface ProductWithSpecs extends Product {
  units?: InventoryUnit[];
  storageRange?: string;
  ramRange?: string;
  batteryRange?: string;
  primaryImage?: string | null;
}

// Utility function to determine highlight class based on value comparison
function getHighlightClass(
  value: number | string | null | undefined,
  allValues: (number | string | null | undefined)[],
  higherIsBetter: boolean = true
): string {
  if (value === null || value === undefined || value === 'N/A') return '';
  
  const numericValues = allValues
    .map(v => {
      if (v === null || v === undefined || v === 'N/A') return null;
      if (typeof v === 'number') return v;
      // Try to extract number from strings like "64 - 256 GB"
      const match = String(v).match(/(\d+)/);
      return match ? parseFloat(match[1]) : null;
    })
    .filter((v): v is number => v !== null);

  if (numericValues.length === 0) return '';

  const max = Math.max(...numericValues);
  const min = Math.min(...numericValues);
  
  let currentValue: number | null = null;
  if (typeof value === 'number') {
    currentValue = value;
  } else {
    const match = String(value).match(/(\d+)/);
    currentValue = match ? parseFloat(match[1]) : null;
  }

  if (currentValue === null) return '';

  if (higherIsBetter) {
    if (currentValue === max && max !== min) return 'bg-green-50 border-l-4 border-l-green-500';
    if (currentValue === min && max !== min) return 'bg-red-50 border-l-4 border-l-red-500';
  } else {
    // For price, lower is better
    if (currentValue === min && max !== min) return 'bg-green-50 border-l-4 border-l-green-500';
    if (currentValue === max && max !== min) return 'bg-red-50 border-l-4 border-l-red-500';
  }

  return '';
}

// Component for rendering product image cell
function ProductImageCell({ product }: { product: Product }) {
  return (
    <td className="border-b border-gray-100 p-4">
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded overflow-hidden bg-gray-100">
        <Image
          src={product.primary_image || getPlaceholderProductImage(product.product_name)}
          alt={product.product_name}
          fill
          className="object-cover"
          unoptimized={!product.primary_image || product.primary_image.includes('localhost') || product.primary_image.includes('placehold.co')}
        />
      </div>
    </td>
  );
}

// Component for rendering price cell with highlighting
function PriceCell({ product, allProducts }: { product: Product; allProducts: Product[] }) {
  const price = product.min_price !== null && product.max_price !== null
    ? product.min_price === product.max_price
      ? product.min_price
      : (product.min_price + product.max_price) / 2 // Average for comparison
    : null;

  const allPrices = allProducts.map(p => 
    p.min_price !== null && p.max_price !== null
      ? p.min_price === p.max_price
        ? p.min_price
        : (p.min_price + p.max_price) / 2
      : null
  );

  const highlightClass = getHighlightClass(price, allPrices, false); // Lower price is better

  return (
    <td className={`border-b border-gray-100 p-4 ${highlightClass}`}>
      {product.min_price !== null && product.max_price !== null
        ? product.min_price === product.max_price
          ? formatPrice(product.min_price)
          : `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}`
        : 'N/A'}
    </td>
  );
}

// Component for rendering spec cell (Storage, RAM, Battery) with highlighting
function SpecCell({ 
  productId, 
  specType, 
  allProductIds 
}: { 
  productId: number; 
  specType: 'storage' | 'ram' | 'battery';
  allProductIds: number[];
}) {
  const { data: units, isLoading } = useProductUnits(productId);

  if (isLoading) {
    return (
      <td className="border-b border-gray-100 p-4">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </td>
    );
  }

  if (!units || units.length === 0) {
    return (
      <td className="border-b border-gray-100 p-4 text-gray-500">
        N/A
      </td>
    );
  }

  // Helper function to get unique values
  const getUniqueValues = (key: 'storage_gb' | 'ram_gb' | 'battery_mah'): number[] => {
    const values = units
      .map(unit => unit[key])
      .filter((val): val is number => val !== null && val !== undefined && typeof val === 'number');
    return Array.from(new Set(values)).sort((a, b) => a - b);
  };

  // Helper function to format range
  const formatRange = (values: number[]): string => {
    if (values.length === 0) return 'N/A';
    if (values.length === 1) return `${values[0]}`;
    return `${values[0]} - ${values[values.length - 1]}`;
  };

  let value: string = 'N/A';
  let numericValue: number | null = null;
  
  if (specType === 'storage') {
    const storages = getUniqueValues('storage_gb');
    value = storages.length > 0 ? `${formatRange(storages)} GB` : 'N/A';
    numericValue = storages.length > 0 ? storages[storages.length - 1] : null; // Use max for comparison
  } else if (specType === 'ram') {
    const rams = getUniqueValues('ram_gb');
    value = rams.length > 0 ? `${formatRange(rams)} GB` : 'N/A';
    numericValue = rams.length > 0 ? rams[rams.length - 1] : null;
  } else if (specType === 'battery') {
    const batteries = getUniqueValues('battery_mah');
    value = batteries.length > 0 ? `${formatRange(batteries)} mAh` : 'N/A';
    numericValue = batteries.length > 0 ? batteries[batteries.length - 1] : null;
  }

  // Note: For highlighting, we'd need to compare across all products, but that requires
  // fetching all units. For now, we'll skip highlighting for specs to avoid complexity.
  // This can be enhanced later with a more sophisticated approach.

  return (
    <td className="border-b border-gray-100 p-4">
      {value}
    </td>
  );
}

// Component for rendering condition/grade/colors from units
function UnitAttributeCell({ 
  productId, 
  attributeType 
}: { 
  productId: number; 
  attributeType: 'condition' | 'grade' | 'colors' | 'processor';
}) {
  const { data: units, isLoading } = useProductUnits(productId);

  if (isLoading) {
    return (
      <td className="border-b border-gray-100 p-4">
        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
      </td>
    );
  }

  if (!units || units.length === 0) {
    return (
      <td className="border-b border-gray-100 p-4 text-gray-500">
        N/A
      </td>
    );
  }

  if (attributeType === 'condition') {
    const conditions = Array.from(new Set(units.map(u => u.condition).filter(Boolean)));
    const conditionLabels: Record<string, string> = {
      'N': 'New',
      'R': 'Refurbished',
      'P': 'Pre-owned',
      'D': 'Defective'
    };
    return (
      <td className="border-b border-gray-100 p-4">
        <div className="flex flex-wrap gap-1">
          {conditions.map((cond, idx) => (
            <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded">
              {conditionLabels[cond] || cond}
            </span>
          ))}
        </div>
      </td>
    );
  }

  if (attributeType === 'grade') {
    const grades = Array.from(new Set(units.map(u => u.grade).filter(Boolean)));
    return (
      <td className="border-b border-gray-100 p-4">
        <div className="flex flex-wrap gap-1">
          {grades.map((grade, idx) => (
            <span key={idx} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
              Grade {grade}
            </span>
          ))}
        </div>
      </td>
    );
  }

  if (attributeType === 'colors') {
    const colors = Array.from(new Set(units.map(u => u.color_name).filter(Boolean)));
    return (
      <td className="border-b border-gray-100 p-4">
        <div className="flex flex-wrap gap-1">
          {colors.length > 0 ? (
            colors.map((color, idx) => (
              <span key={idx} className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                {color}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">N/A</span>
          )}
        </div>
      </td>
    );
  }

  if (attributeType === 'processor') {
    // Processor is not in the InventoryUnit interface, so we'll skip it for now
    // This would need to be added to the API response
    return (
      <td className="border-b border-gray-100 p-4 text-gray-500">
        N/A
      </td>
    );
  }

  return (
    <td className="border-b border-gray-100 p-4 text-gray-500">
      N/A
    </td>
  );
}

// Component for rendering regular field cell
function FieldCell({ product, fieldKey, allProducts }: { product: Product; fieldKey: string; allProducts: Product[] }) {
  const fieldValue = (product as any)[fieldKey];
  
  // Add highlighting for numeric fields
  let highlightClass = '';
  if (fieldKey === 'available_units_count' || fieldKey === 'interest_count') {
    const allValues = allProducts.map(p => (p as any)[fieldKey]);
    highlightClass = getHighlightClass(fieldValue, allValues, true);
  }

  return (
    <td className={`border-b border-gray-100 p-4 ${highlightClass}`}>
      {fieldValue !== null && fieldValue !== undefined ? String(fieldValue) : 'N/A'}
    </td>
  );
}

export function ComparisonPage() {
  const { compareList, addProduct, removeProduct, clearCompare, count } = useCompare();
  const [searchQuery, setSearchQuery] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [priceRange, setPriceRange] = useState<{ min: number | ''; max: number | '' }>({ min: '', max: '' });
  const { data: productsData, isLoading: isLoadingProducts } = useProducts({ 
    page_size: 100, 
    search: searchQuery 
  });

  // Get selected products
  const selectedProductsData = useMemo(() => {
    if (!productsData?.results) return [];
    return productsData.results.filter((p) => compareList.includes(p.id));
  }, [productsData?.results, compareList]);

  // Filter available products
  const filteredProducts = useMemo(() => {
    if (!productsData?.results) return [];
    return productsData.results
      .filter((p) => !compareList.includes(p.id))
      .filter((p) => {
        if (brandFilter && p.brand?.toLowerCase() !== brandFilter.toLowerCase()) return false;
        if (priceRange.min !== '' && p.min_price !== null && p.min_price < Number(priceRange.min)) return false;
        if (priceRange.max !== '' && p.max_price !== null && p.max_price > Number(priceRange.max)) return false;
        return true;
      });
  }, [productsData?.results, compareList, brandFilter, priceRange]);

  // Get unique brands for filter
  const uniqueBrands = useMemo(() => {
    if (!productsData?.results) return [];
    return Array.from(new Set(productsData.results.map(p => p.brand).filter(Boolean))).sort();
  }, [productsData?.results]);

  const comparisonFields = [
    { label: 'Product Image', key: 'image', type: 'image' as const },
    { label: 'Product Name', key: 'product_name' },
    { label: 'Brand', key: 'brand' },
    { label: 'Model/Series', key: 'model_series' },
    { label: 'Price Range', key: 'price', type: 'price' as const },
    { label: 'Storage (GB)', key: 'storage', type: 'spec' as const, specType: 'storage' as const },
    { label: 'RAM (GB)', key: 'ram', type: 'spec' as const, specType: 'ram' as const },
    { label: 'Battery (mAh)', key: 'battery', type: 'spec' as const, specType: 'battery' as const },
    { label: 'Condition', key: 'condition', type: 'unitAttribute' as const, attributeType: 'condition' as const },
    { label: 'Grade', key: 'grade', type: 'unitAttribute' as const, attributeType: 'grade' as const },
    { label: 'Available Colors', key: 'colors', type: 'unitAttribute' as const, attributeType: 'colors' as const },
    { label: 'Available Units', key: 'available_units_count' },
    { label: 'Interest Count', key: 'interest_count' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2">Compare Products</h1>
        <p className="text-gray-600 text-sm sm:text-base">Select up to 4 products to compare side-by-side</p>
      </div>

      {/* Product Selection */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <h2 className="text-xl sm:text-2xl font-semibold">Select Products to Compare</h2>
          {count > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {count} of 4 selected
              </span>
              <button
                onClick={clearCompare}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          )}
        </div>
        
        {/* Filters */}
        <div className="mb-4 space-y-3 sm:space-y-0 sm:flex sm:gap-4">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">All Brands</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min Price"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Max Price"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value ? Number(e.target.value) : '' }))}
              className="w-full sm:w-32 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        {isLoadingProducts ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.slice(0, 9).map((product) => (
              <div
                key={product.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
              >
                <div className="relative w-full h-32 mb-3 rounded overflow-hidden bg-gray-100">
                  <Image
                    src={product.primary_image || getPlaceholderProductImage(product.product_name)}
                    alt={product.product_name}
                    fill
                    className="object-cover"
                    unoptimized={!product.primary_image || product.primary_image.includes('localhost') || product.primary_image.includes('placehold.co')}
                  />
                </div>
                <h3 className="font-semibold mb-1 text-gray-900">{product.product_name}</h3>
                <p className="text-sm text-gray-600 mb-3">
                  {product.brand} {product.model_series}
                </p>
                {product.min_price !== null && product.max_price !== null && (
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    {product.min_price === product.max_price
                      ? formatPrice(product.min_price)
                      : `${formatPrice(product.min_price)} - ${formatPrice(product.max_price)}`}
                  </p>
                )}
                <button
                  onClick={() => addProduct(product.id)}
                  disabled={count >= 4}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium text-sm"
                >
                  {count >= 4 ? 'Max 4 products' : 'Add to Comparison'}
                </button>
              </div>
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                No products found matching your filters.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Comparison Table */}
      {selectedProductsData.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-xl sm:text-2xl font-semibold">Comparison</h2>
            <div className="flex items-center gap-4 text-xs sm:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-50 border-l-4 border-l-green-500 rounded"></div>
                <span className="text-gray-600">Best Value</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-50 border-l-4 border-l-red-500 rounded"></div>
                <span className="text-gray-600">Lowest Value</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-sm -mx-4 sm:mx-0">
            <div className="inline-block min-w-full">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="border-b border-gray-200 p-3 sm:p-4 text-left font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10 min-w-[120px] sm:min-w-[150px]">
                      Feature
                    </th>
                    {selectedProductsData.map((product) => (
                      <th key={product.id} className="border-b border-gray-200 p-3 sm:p-4 text-left min-w-[180px] sm:min-w-[200px]">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-gray-900 block truncate">{product.product_name}</span>
                            <span className="text-xs sm:text-sm text-gray-600 truncate block">{product.brand}</span>
                          </div>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="ml-2 flex-shrink-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors"
                            title="Remove from comparison"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonFields.map((field) => (
                    <tr key={field.key} className="hover:bg-gray-50 transition-colors">
                      <td className="border-b border-gray-100 p-3 sm:p-4 font-semibold text-gray-700 sticky left-0 bg-white z-10 text-sm sm:text-base">
                        {field.label}
                      </td>
                      {selectedProductsData.map((product) => {
                        if (field.type === 'image') {
                          return <ProductImageCell key={product.id} product={product} />;
                        }
                        if (field.type === 'price') {
                          return <PriceCell key={product.id} product={product} allProducts={selectedProductsData} />;
                        }
                        if (field.type === 'spec' && field.specType) {
                          return (
                            <SpecCell 
                              key={product.id} 
                              productId={product.id} 
                              specType={field.specType}
                              allProductIds={selectedProductsData.map(p => p.id)}
                            />
                          );
                        }
                        if (field.type === 'unitAttribute' && field.attributeType) {
                          return (
                            <UnitAttributeCell 
                              key={product.id} 
                              productId={product.id} 
                              attributeType={field.attributeType}
                            />
                          );
                        }
                        return <FieldCell key={product.id} product={product} fieldKey={field.key} allProducts={selectedProductsData} />;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
            >
              Continue Shopping
            </Link>
            <button
              onClick={clearCompare}
              className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
            >
              Clear Comparison
            </button>
          </div>
        </div>
      )}

      {selectedProductsData.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-gray-600 text-lg mb-2">No products selected for comparison</p>
          <p className="text-gray-500 text-sm">Select products above to start comparing</p>
        </div>
      )}
    </div>
  );
}
