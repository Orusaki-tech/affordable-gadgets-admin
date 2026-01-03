'use client';

import { usePromotions } from '@/lib/hooks/usePromotions';
import { useProduct } from '@/lib/hooks/useProducts';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPlaceholderBannerImage } from '@/lib/utils/placeholders';

interface SpecialOffersProps {
  filter?: 'special_offers' | 'flash_sales';
}

export function SpecialOffers({ filter }: SpecialOffersProps = {}) {
  const { data, isLoading } = usePromotions({ page_size: 100 });
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-48" />
        ))}
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    // Show placeholder offers
    const placeholderOffers = [
      { id: 1, title: 'Flash Sale', discount: '50% OFF', description: 'Limited time offer', icon: '🎁' },
      { id: 2, title: 'New Arrivals', discount: '30% OFF', description: 'Latest products', icon: '🆕' },
      { id: 3, title: 'Weekend Deal', discount: '25% OFF', description: 'Special weekend prices', icon: '📅' },
    ];

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderOffers.map((offer) => (
            <div
              key={offer.id}
              className="relative block rounded-lg overflow-hidden shadow-md bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <div className="text-5xl mb-3 opacity-80">{offer.icon}</div>
                  <h3 className="font-semibold text-xl mb-2">{offer.title}</h3>
                  <p className="text-2xl font-bold mb-1">{offer.discount}</p>
                  <p className="text-sm opacity-90">{offer.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter promotions based on filter prop or default behavior
  const specialOffersPromotions = (data?.results || []).filter((promo: any) => {
    const locations = promo.display_locations || [];
    if (filter === 'special_offers') {
      return Array.isArray(locations) && locations.includes('special_offers');
    } else if (filter === 'flash_sales') {
      return Array.isArray(locations) && locations.includes('flash_sales');
    } else {
      // Default: show both special_offers and flash_sales
      return Array.isArray(locations) && (locations.includes('special_offers') || locations.includes('flash_sales'));
    }
  });

  const sectionTitle = filter === 'flash_sales' 
    ? 'Flash Sales' 
    : filter === 'special_offers' 
    ? 'Special Offers' 
    : 'Special Offers';

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">{sectionTitle}</h2>
      {specialOffersPromotions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No special offers available at the moment.</p>
          <Link href="/products" className="text-blue-600 hover:underline">
            View All Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {specialOffersPromotions.map((promotion) => {
            // Get first product ID from promotion
            const firstProductId = promotion.products && promotion.products.length > 0 
              ? promotion.products[0] 
              : null;
            
            // Component to handle product slug fetching and redirect
            const PromotionCard = () => {
              const { data: product } = useProduct(firstProductId || 0);
              
              const handleClick = (e: React.MouseEvent) => {
                e.preventDefault();
                if (product?.slug) {
                  router.push(`/products/${product.slug}?promotion=${promotion.id}`);
                } else if (firstProductId) {
                  // Fallback: try to navigate with product ID if slug not available
                  router.push(`/products/${firstProductId}?promotion=${promotion.id}`);
                } else {
                  // No products in promotion, go to products list
                  router.push(`/products?promotion=${promotion.id}`);
                }
              };
              
              return (
                <div
                  onClick={handleClick}
                  className="relative block rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative h-48">
                    <Image
                      src={promotion.banner_image || getPlaceholderBannerImage(promotion.title)}
                      alt={promotion.title}
                      fill
                      className="object-cover"
                      unoptimized={!promotion.banner_image || promotion.banner_image.includes('placehold.co')}
                    />
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-lg mb-2">{promotion.title}</h3>
                    {promotion.discount_display && (
                      <p className="text-red-600 font-bold text-xl">{promotion.discount_display}</p>
                    )}
                    {promotion.description && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{promotion.description}</p>
                    )}
                  </div>
                </div>
              );
            };
            
            return <PromotionCard key={promotion.id} />;
          })}
        </div>
      )}
    </div>
  );
}

