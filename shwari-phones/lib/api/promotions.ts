/**
 * Promotions API functions
 */
import apiClient from './client';
import { PaginatedResponse } from './products';

export interface Promotion {
  id: number;
  title: string;
  description: string;
  banner_image: string | null;
  banner_image_url: string | null;
  discount_percentage: number | null;
  discount_amount: number | null;
  discount_display: string | null;
  start_date: string;
  end_date: string;
  is_currently_active: boolean;
  product_types: string | null;
  display_locations: string[]; // Array of display location strings: 'stories_carousel', 'special_offers', 'flash_sales'
  products: number[]; // Array of product IDs associated with this promotion
}

export const promotionsApi = {
  /**
   * Get all active promotions
   */
  getPromotions: async (params?: {
    page?: number;
    page_size?: number;
  }): Promise<PaginatedResponse<Promotion>> => {
    const response = await apiClient.get('/promotions/', { params });
    return response.data;
  },

  /**
   * Get single promotion by ID
   */
  getPromotion: async (id: number): Promise<Promotion> => {
    const response = await apiClient.get(`/promotions/${id}/`);
    return response.data;
  },
};







