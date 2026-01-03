'use client';

import { useState } from 'react';
import { useProducts } from '@/lib/hooks/useProducts';
import { useProductUnits } from '@/lib/hooks/useProducts';
import { calculateMatchScores, MatchCriteria } from '@/lib/utils/matchScore';
import { Product } from '@/lib/api/products';
import { formatPrice } from '@/lib/utils/format';
import Link from 'next/link';

export function MatchScorePage() {
  const [criteria, setCriteria] = useState<MatchCriteria>({
    priceMin: undefined,
    priceMax: undefined,
    storage: [],
    ram: [],
    condition: [],
    mustBeInStock: false,
  });
  const [results, setResults] = useState<any[]>([]);
  const { data: productsData } = useProducts({ page_size: 100 });

  const handleCalculate = () => {
    if (!productsData) return;

    // Fetch units for all products (simplified - in production, you'd batch this)
    const unitsMap: Record<number, any[]> = {};
    // This is a simplified version - in production, you'd need to fetch units for each product
    // For now, we'll use empty arrays as placeholders

    const matchResults = calculateMatchScores(
      productsData.results,
      criteria,
      unitsMap
    );

    setResults(matchResults.slice(0, 10)); // Top 10 matches
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Find Your Perfect Match</h1>

      {/* Criteria Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <h2 className="text-2xl font-semibold mb-6">Your Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Price Range (KES)</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={criteria.priceMin || ''}
                onChange={(e) =>
                  setCriteria({ ...criteria, priceMin: e.target.value ? Number(e.target.value) : undefined })
                }
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <input
                type="number"
                placeholder="Max"
                value={criteria.priceMax || ''}
                onChange={(e) =>
                  setCriteria({ ...criteria, priceMax: e.target.value ? Number(e.target.value) : undefined })
                }
                className="flex-1 px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Storage */}
          <div>
            <label className="block text-sm font-medium mb-2">Storage (GB)</label>
            <div className="flex flex-wrap gap-2">
              {[64, 128, 256, 512, 1024].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    const newStorage = criteria.storage?.includes(size)
                      ? criteria.storage.filter((s) => s !== size)
                      : [...(criteria.storage || []), size];
                    setCriteria({ ...criteria, storage: newStorage });
                  }}
                  className={`px-3 py-1 rounded ${
                    criteria.storage?.includes(size)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {size}GB
                </button>
              ))}
            </div>
          </div>

          {/* RAM */}
          <div>
            <label className="block text-sm font-medium mb-2">RAM (GB)</label>
            <div className="flex flex-wrap gap-2">
              {[4, 6, 8, 12, 16].map((size) => (
                <button
                  key={size}
                  onClick={() => {
                    const newRam = criteria.ram?.includes(size)
                      ? criteria.ram.filter((r) => r !== size)
                      : [...(criteria.ram || []), size];
                    setCriteria({ ...criteria, ram: newRam });
                  }}
                  className={`px-3 py-1 rounded ${
                    criteria.ram?.includes(size)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {size}GB
                </button>
              ))}
            </div>
          </div>

          {/* Condition */}
          <div>
            <label className="block text-sm font-medium mb-2">Condition</label>
            <div className="flex flex-wrap gap-2">
              {['New', 'Refurbished', 'Used'].map((cond) => (
                <button
                  key={cond}
                  onClick={() => {
                    const newCondition = criteria.condition?.includes(cond)
                      ? criteria.condition.filter((c) => c !== cond)
                      : [...(criteria.condition || []), cond];
                    setCriteria({ ...criteria, condition: newCondition });
                  }}
                  className={`px-3 py-1 rounded ${
                    criteria.condition?.includes(cond)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {cond}
                </button>
              ))}
            </div>
          </div>

          {/* Must be in stock */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="mustBeInStock"
              checked={criteria.mustBeInStock}
              onChange={(e) => setCriteria({ ...criteria, mustBeInStock: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="mustBeInStock" className="text-sm font-medium">
              Must be in stock
            </label>
          </div>
        </div>

        <button
          onClick={handleCalculate}
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        >
          Find Matches
        </button>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Top Matches</h2>
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.product.id}
                className="bg-white p-6 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Link
                      href={`/products/${result.product.slug || result.product.id}`}
                      className="text-xl font-semibold hover:text-blue-600"
                    >
                      {result.product.product_name}
                    </Link>
                    <p className="text-gray-600 mt-1">
                      {result.product.brand} {result.product.model_series}
                    </p>
                    {result.product.min_price !== null && result.product.max_price !== null && (
                      <p className="text-lg font-semibold mt-2">
                        {formatPrice(result.product.min_price)} - {formatPrice(result.product.max_price)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">{result.score}%</div>
                    <div className="text-sm text-gray-600">Match Score</div>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Price</div>
                    <div className="font-semibold">{result.breakdown.price}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Specs</div>
                    <div className="font-semibold">{result.breakdown.specs}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Availability</div>
                    <div className="font-semibold">{result.breakdown.availability}%</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Rating</div>
                    <div className="font-semibold">{result.breakdown.rating}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}







