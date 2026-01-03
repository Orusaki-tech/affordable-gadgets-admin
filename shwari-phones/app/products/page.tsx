import { Metadata } from 'next';
import { ProductsPage } from '@/components/ProductsPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse our collection of phones, laptops, tablets, and accessories',
};

export default function ProductsListingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductsPage />
      </main>
      <Footer />
    </div>
  );
}







