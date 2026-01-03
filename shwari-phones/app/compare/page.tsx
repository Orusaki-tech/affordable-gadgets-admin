import { Metadata } from 'next';
import { ComparisonPage } from '@/components/ComparisonPage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Compare Products',
  description: 'Compare products side-by-side to make the best purchasing decision',
};

export default function Compare() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ComparisonPage />
      </main>
      <Footer />
    </div>
  );
}







