'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import { usePromotions } from '@/lib/hooks/usePromotions';
import { useProducts } from '@/lib/hooks/useProducts';
import { Promotion } from '@/lib/api/promotions';
import { getPlaceholderBannerImage, getPlaceholderVideoThumbnail } from '@/lib/utils/placeholders';
import { useRouter } from 'next/navigation';

interface VideoModalProps {
  videoUrl: string;
  title: string;
  onClose: () => void;
}

function VideoModal({ videoUrl, title, onClose }: VideoModalProps) {
  // Convert YouTube URL to embed format
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    // Handle YouTube URLs
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    }
    // Handle Vimeo URLs
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-4xl mx-4 aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
          aria-label="Close video"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <iframe
          src={getEmbedUrl(videoUrl)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
          <h3 className="text-white font-semibold">{title}</h3>
        </div>
      </div>
    </div>
  );
}

interface StoriesCarouselProps {
  autoAdvanceDuration?: number;
}

export function StoriesCarousel({ autoAdvanceDuration = 5 }: StoriesCarouselProps) {
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; title: string } | null>(null);
  const router = useRouter();

  // Fetch promotions and products with videos
  const { data: promotionsData, isLoading: promotionsLoading } = usePromotions({ page_size: 100 });
  const { data: productsData, isLoading: productsLoading } = useProducts({ page_size: 100 });

  // Process promotions - combine special_offers and flash_sales
  const allPromotions = useMemo(() => {
    const promotions = (promotionsData?.results || []) as Promotion[];
    return promotions.filter((promo) => {
      const locations = promo.display_locations || [];
      return Array.isArray(locations) && (
        locations.includes('special_offers') || 
        locations.includes('flash_sales') ||
        locations.includes('stories_carousel')
      );
    }).sort((a, b) => {
      // Sort by carousel_position if set, otherwise by start_date
      const aPos = (a as any).carousel_position;
      const bPos = (b as any).carousel_position;
      
      if (aPos && bPos) {
        return aPos - bPos; // Sort by position number (1-5)
      } else if (aPos) {
        return -1; // Promotions with position come first
      } else if (bPos) {
        return 1;
      } else {
        // Both have no position, sort by date
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
      }
    });
  }, [promotionsData]);

  // Process products with videos
  const productsWithVideos = useMemo(() => {
    return (productsData?.results || []).filter((product) => product.product_video_url);
  }, [productsData]);

  const isLoading = promotionsLoading || productsLoading;

  // Get items for display: use carousel_position if set, otherwise use order
  const bannerItem = useMemo(() => {
    // Find promotion with position 1, or first promotion if no position set
    const position1Promo = allPromotions.find(p => (p as any).carousel_position === 1);
    if (position1Promo) return position1Promo;
    // Fallback to first promotion if no position 1 is set
    return allPromotions.length > 0 ? allPromotions[0] : null;
  }, [allPromotions]);

  const gridItems = useMemo(() => {
    const items: Array<{ type: 'promotion' | 'video'; data: any; uniqueKey: string; position: number }> = [];
    const usedPromotionIds = new Set<number>();
    
    // Add banner item to used set
    if (bannerItem) {
      usedPromotionIds.add(bannerItem.id);
    }
    
    // Get promotions with positions 2-5
    const positionedPromotions = allPromotions
      .filter(promo => {
        const pos = (promo as any).carousel_position;
        return pos && pos >= 2 && pos <= 5 && !usedPromotionIds.has(promo.id);
      })
      .sort((a, b) => (a as any).carousel_position - (b as any).carousel_position);
    
    // Add positioned promotions to their slots
    positionedPromotions.forEach(promo => {
      const pos = (promo as any).carousel_position;
      items.push({ 
        type: 'promotion', 
        data: promo, 
        uniqueKey: `promo-${promo.id}`,
        position: pos
      });
      usedPromotionIds.add(promo.id);
    });
    
    // Fill remaining slots with promotions without positions
    const unpositionedPromotions = allPromotions.filter(promo => 
      !usedPromotionIds.has(promo.id) && 
      (!(promo as any).carousel_position || (promo as any).carousel_position > 5)
    );
    
    // Fill positions 2-5 in order
    for (let pos = 2; pos <= 5 && items.length < 4; pos++) {
      const existingAtPos = items.find(item => item.position === pos);
      if (!existingAtPos) {
        // Try to find an unpositioned promotion
        const nextPromo = unpositionedPromotions.find(p => !usedPromotionIds.has(p.id));
        if (nextPromo) {
          items.push({ 
            type: 'promotion', 
            data: nextPromo, 
            uniqueKey: `promo-${nextPromo.id}`,
            position: pos
          });
          usedPromotionIds.add(nextPromo.id);
        } else if (productsWithVideos.length > 0 && items.length < 4) {
          // Add product video if no promotion available
          const featuredVideo = productsWithVideos[0];
          items.push({ 
            type: 'video', 
            data: featuredVideo, 
            uniqueKey: `video-${featuredVideo.id}`,
            position: pos
          });
          break; // Only add one video
        }
      }
    }
    
    // Sort by position and return
    return items.sort((a, b) => a.position - b.position).slice(0, 4);
  }, [allPromotions, productsWithVideos, bannerItem]);

  const handlePromotionClick = (promotion: Promotion) => {
    const firstProductId = promotion.products && promotion.products.length > 0 
      ? promotion.products[0] 
      : null;

    if (firstProductId) {
      router.push(`/products/${firstProductId}?promotion=${promotion.id}`);
    } else {
      router.push(`/products?promotion=${promotion.id}`);
    }
  };

  const handleVideoClick = (product: any) => {
    if (product.product_video_url) {
      setSelectedVideo({
        url: product.product_video_url,
        title: product.product_name
      });
    } else if (product.slug) {
      router.push(`/products/${product.slug}`);
    }
  };


  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div 
          className="lg:col-span-1 bg-gray-200 animate-pulse rounded-lg" 
          style={{ height: 'min(50vw, calc((100vh - 200px) * 0.9))' }}
        />
        <div className="lg:col-span-1 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i} 
              className="bg-gray-200 animate-pulse rounded-lg"
              style={{ height: 'min(25vw, calc((100vh - 200px) * 0.45))' }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {selectedVideo && (
        <VideoModal
          videoUrl={selectedVideo.url}
          title={selectedVideo.title}
          onClose={() => setSelectedVideo(null)}
        />
      )}

      <div className="relative w-full mb-6">
        {/* Desktop/Tablet: Large Banner + 2x2 Grid Layout - Matching Figma Design */}
        <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Large Banner - First Promotion (Left Side, 50% width, Square) */}
          {bannerItem ? (
            <div className="lg:col-span-1">
              <div
                className="group relative w-full h-full bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                style={{
                  maxHeight: 'calc(100vh - 250px)',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
                onClick={() => handlePromotionClick(bannerItem)}
              >
                <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                    <Image
                    src={bannerItem.banner_image_url || bannerItem.banner_image || getPlaceholderBannerImage(bannerItem.title)}
                    alt={bannerItem.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                      unoptimized={process.env.NODE_ENV === 'development'}
                    />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                  
                  {/* Badge */}
                  {bannerItem.discount_display && (
                    <div className="absolute top-3 left-3">
                      <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                        {bannerItem.discount_display}
                      </div>
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg">
                        🎉
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-base">Promotions</h3>
                        <p className="text-white/80 text-xs">{allPromotions.length} available</p>
                      </div>
                    </div>
                    <h4 className="text-white font-bold text-xl mb-2 line-clamp-2">
                      {bannerItem.title}
                    </h4>
                    {bannerItem.description && (
                      <p className="text-white/90 text-sm line-clamp-2 mb-4">
                        {bannerItem.description}
                      </p>
                    )}
                      <button
                      className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all text-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          const promotionsSection = document.getElementById('promotions');
                          if (promotionsSection) {
                            promotionsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          } else {
                            router.push('/#promotions');
                          }
                      }}
                    >
                      View All
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                  </div>
                </div>
              </div>
        </div>
          ) : (
          <div
              className="lg:col-span-1 h-full bg-gray-100 rounded-2xl flex items-center justify-center"
            style={{
                maxHeight: 'calc(100vh - 250px)'
              }}
            >
              <p className="text-gray-400">No promotions available</p>
            </div>
          )}

          {/* 2x2 Grid - Next 3 Promotions + 1 Product Video (Right Side, 50% width, Square cards) */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4 items-end">
            {gridItems.length > 0 ? (
              gridItems.map((item) => {
                if (item.type === 'promotion') {
                  const promotion = item.data as Promotion;
              return (
                <div
                      key={item.uniqueKey}
                      className="group relative w-full aspect-square bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                  style={{
                        maxHeight: 'calc((100vh - 250px) / 2 - 8px)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                      onClick={() => handlePromotionClick(promotion)}
                    >
                    <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                      <Image
                        src={promotion.banner_image_url || promotion.banner_image || getPlaceholderBannerImage(promotion.title)}
                        alt={promotion.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        unoptimized={process.env.NODE_ENV === 'development'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Badge */}
                      {promotion.discount_display && (
                        <div className="absolute top-2 left-2">
                          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                            {promotion.discount_display}
                          </div>
                    </div>
                  )}

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-bold text-base mb-1 line-clamp-2">
                          {promotion.title}
                        </h4>
                        {promotion.description && (
                          <p className="text-white/90 text-xs line-clamp-1">
                            {promotion.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
                } else {
                  // Product Video
                  const product = item.data;
                  return (
                    <div
                      key={item.uniqueKey}
                      className="group relative w-full aspect-square bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer"
                      style={{
                        maxHeight: 'calc((100vh - 250px) / 2 - 8px)',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                      }}
                      onClick={() => handleVideoClick(product)}
                    >
                      <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                      <Image
                        src={product.primary_image || getPlaceholderVideoThumbnail(product.product_name)}
                        alt={product.product_name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        unoptimized={process.env.NODE_ENV === 'development'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                      
                      {/* Play Button Badge */}
                      <div className="absolute top-2 left-2">
                        <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                          Play
                        </div>
                      </div>

                      {/* Video Play Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all z-10">
                        <div className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300">
                          <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>

                      {/* Content Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs">
                            🎥
                          </div>
                          <span className="text-white/90 text-xs">Product Video</span>
                        </div>
                        <h4 className="text-white font-bold text-base mb-1 line-clamp-2">
                          {product.product_name}
                        </h4>
                        {product.brand && (
                          <p className="text-white/80 text-xs line-clamp-1">
                            {product.brand}
                          </p>
                    )}
                  </div>
                </div>
              </div>
            );
              }
              })
            ) : (
              // Show placeholder squares if no items
              [...Array(4)].map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center"
                  style={{
                    maxHeight: 'calc((100vh - 250px) / 2 - 8px)',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <p className="text-gray-400 text-xs">No content</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile: Vertical Stack Layout - Matching Figma Design (Banner on top, 2x2 grid below) */}
        <div className="md:hidden space-y-4 mb-6">
          {/* Large Banner - First Promotion (Full width on mobile) */}
          {bannerItem && (
            <div
              className="group relative w-full aspect-square bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer mb-4"
              style={{
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                maxHeight: 'calc(100vh - 250px)'
              }}
              onClick={() => handlePromotionClick(bannerItem)}
            >
              <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                <Image
                  src={bannerItem.banner_image_url || bannerItem.banner_image || getPlaceholderBannerImage(bannerItem.title)}
                  alt={bannerItem.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="100vw"
                  unoptimized={process.env.NODE_ENV === 'development'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                
                {/* Badge */}
                {bannerItem.discount_display && (
                  <div className="absolute top-3 left-3">
                    <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-semibold text-gray-900 shadow-sm">
                      {bannerItem.discount_display}
                    </div>
                  </div>
                )}

                {/* Content Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-lg">
                      🎉
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">Promotions</h3>
                      <p className="text-white/80 text-xs">{allPromotions.length} available</p>
                    </div>
                  </div>
                  <h4 className="text-white font-bold text-xl mb-2 line-clamp-2">
                    {bannerItem.title}
                  </h4>
                  {bannerItem.description && (
                    <p className="text-white/90 text-sm line-clamp-2 mb-4">
                      {bannerItem.description}
                    </p>
                  )}
                        <button
                    className="flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-full font-semibold hover:bg-gray-100 transition-all text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                      router.push('/products');
                    }}
                  >
                    View All
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                </div>
              </div>
            </div>
          )}

          {/* 2x2 Grid - Next 3 Promotions + 1 Product Video (Full width on mobile) */}
          <div className="grid grid-cols-2 gap-4">
            {gridItems.length > 0 ? (
              gridItems.map((item) => {
                if (item.type === 'promotion') {
                  const promotion = item.data as Promotion;
                  return (
                    <div
                      key={item.uniqueKey}
                      className="group relative w-full aspect-square bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer mb-4"
                      style={{
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                      }}
                      onClick={() => handlePromotionClick(promotion)}
                    >
                      <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                        <Image
                          src={promotion.banner_image_url || promotion.banner_image || getPlaceholderBannerImage(promotion.title)}
                          alt={promotion.title}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="50vw"
                          unoptimized={process.env.NODE_ENV === 'development'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        
                        {/* Badge */}
                        {promotion.discount_display && (
                          <div className="absolute top-2 left-2">
                            <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm">
                              {promotion.discount_display}
                            </div>
                          </div>
                        )}

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <h4 className="text-white font-bold text-base mb-1 line-clamp-2">
                            {promotion.title}
                          </h4>
                          {promotion.description && (
                            <p className="text-white/90 text-xs line-clamp-1">
                              {promotion.description}
                            </p>
                      )}
                    </div>
                  </div>
                </div>
              );
                } else {
                  // Product Video
                  const product = item.data;
                  return (
                    <div
                      key={item.uniqueKey}
                      className="group relative w-full aspect-square bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer mb-4"
                      style={{
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                      }}
                      onClick={() => handleVideoClick(product)}
                    >
                      <div className="relative w-full h-full bg-gray-100 overflow-hidden">
                        <Image
                          src={product.primary_image || getPlaceholderVideoThumbnail(product.product_name)}
                          alt={product.product_name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                          sizes="50vw"
                          unoptimized={process.env.NODE_ENV === 'development'}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                        
                        {/* Play Button Badge */}
                        <div className="absolute top-2 left-2">
                          <div className="bg-white/95 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-semibold text-gray-900 shadow-sm flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                            Play
                          </div>
                        </div>

                        {/* Video Play Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-all z-10">
                          <div className="w-16 h-16 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-lg group-hover:scale-125 transition-transform duration-300">
                            <svg className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center text-xs">
                              🎥
                            </div>
                            <span className="text-white/90 text-xs">Product Video</span>
                          </div>
                          <h4 className="text-white font-bold text-base mb-1 line-clamp-2">
                            {product.product_name}
                          </h4>
                          {product.brand && (
                            <p className="text-white/80 text-xs line-clamp-1">
                              {product.brand}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              })
            ) : (
              // Show placeholder squares if no items
              [...Array(4)].map((_, i) => (
                <div
                  key={`placeholder-mobile-${i}`}
                  className="w-full aspect-square bg-gray-100 rounded-2xl flex items-center justify-center mb-4"
                >
                  <p className="text-gray-400 text-xs">No content</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
