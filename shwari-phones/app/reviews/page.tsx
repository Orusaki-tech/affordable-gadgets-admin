import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { SpecialOffers } from '@/components/SpecialOffers';
import { ReviewsShowcase } from '@/components/ReviewsShowcase';

export default function ReviewsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Stories Carousel */}
        <section className="container mx-auto px-4 py-6">
          <StoriesCarousel autoAdvanceDuration={5} />
        </section>

        {/* Reviews Showcase */}
        <section className="container mx-auto px-4 py-8">
          <ReviewsShowcase />
        </section>

        {/* Special Offers */}
        <section className="container mx-auto px-4 py-8">
          <SpecialOffers />
        </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-3xl font-bold mb-6">Featured Products</h2>
          <ProductGrid />
        </section>
      </main>

      <Footer />
    </div>
  );
}







