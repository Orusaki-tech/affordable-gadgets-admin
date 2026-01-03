import { Metadata } from 'next';
import { CartPage } from '@/components/CartPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description: 'Review your cart items before checkout',
};

export default function Cart() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <CartPage />
      </main>
      <Footer />
    </div>
  );
}







