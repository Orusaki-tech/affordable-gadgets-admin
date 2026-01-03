import { Metadata } from 'next';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CategoriesPage } from '@/components/CategoriesPage';

export const metadata: Metadata = {
  title: 'Categories',
  description: 'Browse products by category - Phones, Laptops, Tablets, and Accessories',
};

export default function Categories() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CategoriesPage />
      </main>
      <Footer />
    </div>
  );
}







