'use client';

import Link from 'next/link';
import { useProducts } from '@/lib/hooks/useProducts';
import { ProductCard } from './ProductCard';

const categories = [
  {
    name: 'Phones',
    code: 'PH',
    description: 'Latest smartphones from top brands',
    icon: '📱',
    href: '/products?type=PH',
  },
  {
    name: 'Laptops',
    code: 'LT',
    description: 'Powerful laptops for work and play',
    icon: '💻',
    href: '/products?type=LT',
  },
  {
    name: 'Tablets',
    code: 'TB',
    description: 'Portable tablets for productivity',
    icon: '📱',
    href: '/products?type=TB',
  },
  {
    name: 'Accessories',
    code: 'AC',
    description: 'Essential accessories and peripherals',
    icon: '🎧',
    href: '/products?type=AC',
  },
];

export function CategoriesPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Shop by Category</h1>

      {/* Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {categories.map((category) => (
          <Link
            key={category.code}
            href={category.href}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden p-6 text-center"
          >
            <div className="text-6xl mb-4">{category.icon}</div>
            <h2 className="text-2xl font-semibold mb-2">{category.name}</h2>
            <p className="text-gray-600 text-sm">{category.description}</p>
          </Link>
        ))}
      </div>

      {/* Featured Products by Category */}
      <div className="space-y-12">
        {categories.map((category) => (
          <CategoryProducts key={category.code} category={category} />
        ))}
      </div>
    </div>
  );
}

function CategoryProducts({ category }: { category: typeof categories[0] }) {
  const { data, isLoading } = useProducts({ type: category.code, page_size: 4 });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">{category.name}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-96" />
          ))}
        </div>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold">{category.name}</h2>
        <Link
          href={category.href}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          View All →
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.results.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}







