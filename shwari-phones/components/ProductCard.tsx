'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/api/products';
import { formatPrice, formatPriceRange } from '@/lib/utils/format';
import { getPlaceholderProductImage } from '@/lib/utils/placeholders';

interface ProductCardProps {
  product: Product;
  showInterestCount?: boolean;
}

export function ProductCard({ product, showInterestCount = true }: ProductCardProps) {
  const hasStock = product.available_units_count > 0;
  const interestText = product.interest_count > 0 
    ? `${product.interest_count} ${product.interest_count === 1 ? 'person' : 'people'} interested`
    : null;

  return (
    <Link 
      href={`/products/${product.slug || product.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 animate-fade-in"
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
          <div className="flex flex-wrap gap-1 mb-2">
            {product.tags.slice(0, 2).map((tag: string, idx: number) => (
              <span key={idx} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded border border-blue-200">
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
          {showInterestCount && interestText && (
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
}

