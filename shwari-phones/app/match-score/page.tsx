import { Metadata } from 'next';
import { MatchScorePage } from '@/components/MatchScorePage';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Find Your Perfect Match',
  description: 'Use our match score calculator to find products that match your criteria',
};

export default function MatchScore() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <MatchScorePage />
      </main>
      <Footer />
    </div>
  );
}







