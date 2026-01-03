/**
 * Budget search API functions
 */
import apiClient from './client';
import { Product } from './products';

export interface PaginatedProductResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Product[];
}

export const budgetApi = {
  /**
   * Search phones by budget (price range)
   */
  searchPhonesByBudget: async (
    minPrice: number,
    maxPrice: number
  ): Promise<PaginatedProductResponse> => {
    const response = await apiClient.get('/phone-search/', {
      params: {
        min_price: minPrice,
        max_price: maxPrice,
      },
    });
    return response.data;
  },
};







