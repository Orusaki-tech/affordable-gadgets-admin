'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/hooks/useCart';
import { brandConfig } from '@/lib/config/brand';
import { SearchBar } from './SearchBar';

export function Header() {
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/products', label: 'Products' },
    { href: '/categories', label: 'Categories' },
    { href: '/budget-search', label: 'Budget Search' },
    { href: '/compare', label: 'Compare' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-3 shrink-0 hover:opacity-80 transition-opacity group"
          >
            {/* Logo Image Placeholder */}
            {/* 
              TO REPLACE WITH ACTUAL LOGO:
              1. Add your logo image to /public/logo.png (or logo.svg)
              2. Uncomment the Image component below
              3. Remove or comment out the SVG placeholder
              4. Adjust width/height as needed
            */}
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg shadow-md group-hover:shadow-lg transition-shadow overflow-hidden">
              {/* Placeholder SVG - This will be replaced with actual logo */}
              <svg 
                className="w-6 h-6 md:w-7 md:h-7 text-white" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2.5} 
                  d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
                />
              </svg>
              
              {/* Uncomment this when you have the logo image ready */}
              {/* 
              <Image 
                src="/logo.png" 
                alt={`${brandConfig.name} logo`}
                width={48}
                height={48}
                className="object-contain p-1"
                priority
              /> 
              */}
            </div>
            
            {/* Logo Text - Hidden on mobile/tablet, visible on desktop */}
            <span className="hidden lg:block text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              {brandConfig.name}
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block flex-1 max-w-3xl mx-6">
            <SearchBar />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-6 shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium text-sm relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors shrink-0 p-2 rounded-lg hover:bg-blue-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {itemCount}
              </span>
            )}
            <span className="hidden md:inline font-medium">Cart</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Search */}
        <div className="md:hidden mt-4">
          <SearchBar />
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="lg:hidden mt-4 pb-4 border-t border-gray-200 animate-fade-in">
            <div className="flex flex-col gap-2 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

