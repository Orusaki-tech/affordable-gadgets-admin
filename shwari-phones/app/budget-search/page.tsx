import { Metadata } from 'next';
import { BudgetSearchPage } from '@/components/BudgetSearchPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Budget Search',
  description: 'Find phones within your budget',
};

export default function BudgetSearch() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <BudgetSearchPage />
      </main>
      <Footer />
    </div>
  );
}







