import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { StoriesCarousel } from '@/components/StoriesCarousel';
import { ProductGrid } from '@/components/ProductGrid';
import { SpecialOffers } from '@/components/SpecialOffers';
import { QuickAccessBar } from '@/components/QuickAccessBar';
import { ReviewsShowcase } from '@/components/ReviewsShowcase';
import { CategoriesSection } from '@/components/CategoriesSection';
import { RecentlyViewed } from '@/components/RecentlyViewed';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <Header />
      
      <main className="flex-1">
        {/* Stories Carousel */}
        <section className="bg-white border-b-2 border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
            <StoriesCarousel autoAdvanceDuration={5} />
          </div>
        </section>

        {/* Quick Access Bar */}
        <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-b-2 border-gray-100 shadow-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <QuickAccessBar />
          </div>
        </section>

        {/* Promotions */}
        <section id="promotions" className="bg-white scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="text-center mb-10 lg:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
                  Promotions
                </span>
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl">Don't miss out on these amazing deals</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500 mx-auto mt-6 rounded-full shadow-md"></div>
            </div>
            <SpecialOffers />
          </div>
        </section>

        {/* Featured Products */}
        <section id="featured-products" className="bg-gradient-to-b from-gray-50 to-white scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Featured Products
                </span>
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl mb-2">Handpicked for you</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mx-auto mt-6 rounded-full shadow-md"></div>
            </div>
            <ProductGrid />
          </div>
        </section>

        {/* Reviews Showcase */}
        <section id="reviews" className="bg-white scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                  What Our Customers Say
                </span>
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl mb-2">Real reviews from real customers</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 mx-auto mt-6 rounded-full shadow-md"></div>
            </div>
            <ReviewsShowcase />
          </div>
        </section>

        {/* Categories */}
        <section id="categories" className="bg-gradient-to-b from-white via-gray-50 to-white scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                  Shop by Category
                </span>
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl mb-2">Find exactly what you're looking for</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 mx-auto mt-6 rounded-full shadow-md"></div>
            </div>
            <CategoriesSection />
          </div>
        </section>

        {/* Recently Viewed */}
        <section id="recently-viewed" className="bg-white scroll-mt-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
            <div className="text-center mb-12 lg:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent">
                  Recently Viewed
                </span>
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl mb-2">Continue browsing where you left off</p>
              <div className="w-32 h-1.5 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mx-auto mt-6 rounded-full shadow-md"></div>
            </div>
            <RecentlyViewed />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
