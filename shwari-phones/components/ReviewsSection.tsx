'use client';

import { useProductReviews } from '@/lib/hooks/useReviews';
import { getPlaceholderVideoThumbnail, getPlaceholderVideoUrl, convertToYouTubeEmbed } from '@/lib/utils/placeholders';

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
}

interface ReviewsSectionProps {
  productId: number;
}

export function ReviewsSection({ productId }: ReviewsSectionProps) {
  const { data, isLoading, error } = useProductReviews(productId, { page_size: 10 });

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="text-center py-8 text-red-500">Error loading reviews</div>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    );
  }

  const averageRating = data.results.reduce((sum, review) => sum + review.rating, 0) / data.results.length;
  const ratingCounts = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: data.results.filter((r) => r.rating === rating).length,
  }));

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-5xl font-bold">{averageRating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${
                    star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </span>
              ))}
            </div>
            <p className="text-gray-600">Based on {data.count} review{data.count !== 1 ? 's' : ''}</p>
          </div>
        </div>
        
        {/* Rating Breakdown */}
        <div className="space-y-2">
          {ratingCounts.map(({ rating, count }) => {
            const percentage = data.count > 0 ? (count / data.count) * 100 : 0;
            return (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-12">{rating} star{rating !== 1 ? 's' : ''}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-6">
        {data.results.map((review) => (
          <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="font-semibold">
                    {review.customer_username || (review.is_admin_review ? 'Admin' : 'Anonymous')}
                  </span>
                  {review.is_admin_review && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      Verified
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  {formatDate(review.date_posted)}
                </p>
              </div>
            </div>
            
            {review.comment && (
              <p className="text-gray-700 mt-3 mb-3">{review.comment}</p>
            )}
            
            {/* Review Video */}
            <div className="mt-4">
              {review.video_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <iframe
                    src={convertToYouTubeEmbed(review.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : review.video_file_url ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                  <video
                    src={review.video_file_url}
                    controls
                    className="w-full h-full"
                  />
                </div>
              ) : (
                // Show placeholder video for reviews without videos
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <iframe
                    src={convertToYouTubeEmbed(getPlaceholderVideoUrl(`Review: ${review.product_name || 'Product'}`))}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Placeholder
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {(data.next || data.previous) && (
        <div className="flex justify-center gap-4 mt-8">
          <button
            disabled={!data.previous}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            disabled={!data.next}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

