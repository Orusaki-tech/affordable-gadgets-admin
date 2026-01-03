'use client';

import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { SpecialOffers } from '@/components/SpecialOffers';
import { ReviewsShowcase } from '@/components/ReviewsShowcase';
import { useSearchParams } from 'next/navigation';

export default function PromotionsPage() {
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter');

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Stories Carousel */}
        <section className="container mx-auto px-4 py-6">
          <StoriesCarousel autoAdvanceDuration={5} />
        </section>

        {/* Special Offers / Flash Sales (filtered if filter param exists) */}
        <section className="container mx-auto px-4 py-8">
          <SpecialOffers filter={filter || undefined} />
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
          <ProductGrid />
        </section>

        {/* Reviews Showcase */}
        <section className="container mx-auto px-4 py-8">
          <ReviewsShowcase />
        </section>
      </main>

      <Footer />
    </div>
  );
}







