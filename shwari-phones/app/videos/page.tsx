import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { ProductVideosSection } from '@/components/ProductVideosSection';
import { SpecialOffers } from '@/components/SpecialOffers';
import { ReviewsShowcase } from '@/components/ReviewsShowcase';

export default function VideosPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {/* Stories Carousel */}
        <section className="container mx-auto px-4 py-6">
          <StoriesCarousel autoAdvanceDuration={5} />
        </section>

        {/* Product Videos Section */}
        <section className="container mx-auto px-4 py-8">
          <ProductVideosSection />
        </section>

        {/* Special Offers */}
        <section className="container mx-auto px-4 py-8">
          <SpecialOffers />
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

