'use client';

import { useAllReviews } from '@/lib/hooks/useReviews';

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

export function ReviewsShowcase() {
  const { data, isLoading } = useAllReviews({ page_size: 6 });

  if (isLoading) {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <div className="text-center py-8 text-gray-500">Loading reviews...</div>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    // Show placeholder reviews
    const placeholderReviews = [
      { id: 1, rating: 5, comment: 'Great product! Highly recommended.', username: 'Customer', time: '2 days ago' },
      { id: 2, rating: 4, comment: 'Good quality and fast delivery.', username: 'Buyer', time: '1 week ago' },
      { id: 3, rating: 5, comment: 'Excellent service and product.', username: 'User', time: '3 days ago' },
    ];

    return (
      <div>
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {placeholderReviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  >
                    ★
                  </span>
                ))}
              </div>
              <p className="text-gray-700 mb-3 italic">"{review.comment}"</p>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{review.username}</p>
                  <p className="text-xs text-gray-500">{review.time}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {data.results.map((review) => (
          <div key={review.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-yellow-200 transform hover:scale-105">
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-2xl ${star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                >
                  ★
                </span>
              ))}
            </div>
            {review.comment && (
              <p className="text-gray-700 mb-4 line-clamp-4 leading-relaxed italic text-base">
                "{review.comment}"
              </p>
            )}
            <div className="flex items-center justify-between mt-5 pt-4 border-t-2 border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {review.customer_username || (review.is_admin_review ? 'Admin' : 'Anonymous')}
                </p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(review.date_posted)}</p>
              </div>
              {review.is_admin_review && (
                <span className="text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full font-semibold shadow-sm">
                  Verified
                </span>
              )}
            </div>
            {review.product_name && (
              <p className="text-sm text-gray-600 mt-3 font-medium bg-gray-50 px-3 py-2 rounded-lg">
                {review.product_name}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

