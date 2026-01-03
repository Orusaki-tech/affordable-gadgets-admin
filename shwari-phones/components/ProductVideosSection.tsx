'use client';

import { useProducts } from '@/lib/hooks/useProducts';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getPlaceholderVideoThumbnail, getPlaceholderVideoUrl, getPlaceholderVideoUrls, convertToYouTubeEmbed } from '@/lib/utils/placeholders';

export function ProductVideosSection() {
  const searchParams = useSearchParams();
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const { data, isLoading } = useProducts({ page_size: 50 });

  // Check if there's a video ID in the URL hash or query params
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check URL hash (e.g., /videos#video-123)
      const hash = window.location.hash;
      if (hash.startsWith('#video-')) {
        const videoId = parseInt(hash.replace('#video-', ''));
        if (videoId) {
          setSelectedVideo(videoId);
          // Scroll to the video section
          setTimeout(() => {
            const element = document.getElementById(`video-card-${videoId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
      
      // Also check query params (e.g., /videos?video=123)
      const videoParam = searchParams.get('video');
      if (videoParam) {
        const videoId = parseInt(videoParam);
        if (videoId) {
          setSelectedVideo(videoId);
          setTimeout(() => {
            const element = document.getElementById(`video-card-${videoId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 100);
        }
      }
    }
  }, [searchParams]);

  // Filter products that have videos, or use all products with dummy videos
  const productsWithVideos = (data?.results || []).filter(
    (product) => product.product_video_url
  );

  // If no products have videos, show products with dummy videos
  const productsToShow = productsWithVideos.length > 0 
    ? productsWithVideos 
    : (data?.results || []).slice(0, 6).map((product) => ({
        ...product,
        product_video_url: getPlaceholderVideoUrl(product.product_name),
      }));

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-200 animate-pulse rounded-lg h-64" />
        ))}
      </div>
    );
  }

  if (productsToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No product videos available at the moment.</p>
        <Link href="/products" className="text-blue-600 hover:underline">
          View All Products
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Product Videos</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {productsToShow.map((product) => (
          <div
            key={product.id}
            id={`video-card-${product.id}`}
            className="relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group"
            onClick={() => setSelectedVideo(selectedVideo === product.id ? null : product.id)}
          >
            {/* Product Image/Thumbnail */}
            <div className="relative aspect-video bg-gray-100">
              <Image
                src={product.primary_image || getPlaceholderVideoThumbnail(product.product_name)}
                alt={product.product_name}
                fill
                className="object-cover"
                unoptimized={!product.primary_image || product.primary_image.includes('placehold.co')}
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:scale-110 transition-transform">
                  <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div className="p-4 bg-white">
              <h3 className="font-semibold text-lg mb-2">{product.product_name}</h3>
              {product.brand && (
                <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
              )}
              {product.min_price && product.max_price && (
                <p className="text-lg font-bold text-blue-600">
                  KES {product.min_price.toLocaleString()} - {product.max_price.toLocaleString()}
                </p>
              )}
            </div>

            {/* Video Player (shown when selected) */}
            {selectedVideo === product.id && (
              <div className="absolute inset-0 z-10 bg-black/95 flex items-center justify-center p-4">
                <div className="relative w-full max-w-4xl aspect-video">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVideo(null);
                    }}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300 text-2xl font-bold"
                  >
                    ×
                  </button>
                  <iframe
                    src={convertToYouTubeEmbed(product.product_video_url || getPlaceholderVideoUrl(product.product_name))}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

