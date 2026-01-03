'use client';

import Link from 'next/link';

const categories = [
  {
    name: 'Phones',
    href: '/products?type=PH',
    description: 'Latest smartphones',
    image: '/categories/phones.jpg',
  },
  {
    name: 'Laptops',
    href: '/products?type=LT',
    description: 'Powerful laptops',
    image: '/categories/laptops.jpg',
  },
  {
    name: 'Tablets',
    href: '/products?type=TB',
    description: 'Portable tablets',
    image: '/categories/tablets.jpg',
  },
  {
    name: 'Accessories',
    href: '/products?type=AC',
    description: 'Essential accessories',
    image: '/categories/accessories.jpg',
  },
];

export function CategoriesSection() {
  const categoryIcons = ['📱', '💻', '📱', '🎧'];
  const categoryGradients = [
    'from-blue-500 to-blue-700',
    'from-purple-500 to-purple-700',
    'from-pink-500 to-pink-700',
    'from-green-500 to-green-700',
  ];

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {categories.map((category, index) => (
          <Link
            key={category.name}
            href={category.href}
            className="group block bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-blue-300 transform hover:scale-105"
          >
            <div className={`aspect-video bg-gradient-to-br ${categoryGradients[index]} flex items-center justify-center relative overflow-hidden`}>
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors"></div>
              <span className="text-6xl transform group-hover:scale-110 transition-transform duration-300 relative z-10">
                {categoryIcons[index]}
              </span>
            </div>
            <div className="p-5 sm:p-6">
              <h3 className="font-bold text-xl mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">
                {category.name}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">{category.description}</p>
              <div className="mt-4 flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                <span>Explore</span>
                <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}







