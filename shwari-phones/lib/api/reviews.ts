/**
 * Reviews API functions
 */
import axios from 'axios';
import { brandConfig } from '@/lib/config/brand';

const apiBaseUrl = brandConfig.apiBaseUrl || 'http://localhost:8000';

export interface Review {
  id: number;
  product: number;
  product_name: string;
  rating: number;
  comment: string;
  video_url?: string | null;
  video_file_url?: string | null;
  customer_username?: string | null;
  is_admin_review: boolean;
  date_posted: string;
}

export interface PaginatedReviewResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Review[];
}

export const reviewsApi = {
  /**
   * Get reviews for a product
   */
  getProductReviews: async (productId: number, params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedReviewResponse> => {
    const response = await axios.get(`${apiBaseUrl}/api/v1/public/reviews/`, {
      params: {
        product: productId,
        ...params,
      },
    });
    return response.data;
  },

  /**
   * Get all reviews (for homepage showcase)
   */
  getAllReviews: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedReviewResponse> => {
    const response = await axios.get(`${apiBaseUrl}/api/v1/public/reviews/`, {
      params,
    });
    return response.data;
  },

  /**
   * Get single review by ID
   */
  getReview: async (reviewId: number): Promise<Review> => {
    const response = await axios.get(`${apiBaseUrl}/api/v1/public/reviews/${reviewId}/`);
    return response.data;
  },
};

