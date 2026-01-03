'use client';

import Link from 'next/link';

const categories = [
  { name: 'Phones', href: '/products?type=PH', icon: '📱' },
  { name: 'Laptops', href: '/products?type=LT', icon: '💻' },
  { name: 'Tablets', href: '/products?type=TB', icon: '📱' },
  { name: 'Accessories', href: '/products?type=AC', icon: '🎧' },
];

export function QuickAccessBar() {
  return (
    <div className="w-full">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center">
        Quick Access
      </h3>
      <div className="flex items-center justify-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((category) => (
          <Link
            key={category.name}
            href={category.href}
            className="flex flex-col items-center gap-3 min-w-[100px] sm:min-w-[120px] p-5 sm:p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-200 hover:scale-105 group"
          >
            <div className="text-4xl sm:text-5xl transform group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <span className="text-sm sm:text-base font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">
              {category.name}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}







