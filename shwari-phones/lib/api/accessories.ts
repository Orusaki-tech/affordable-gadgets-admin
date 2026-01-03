/**
 * Product accessories API functions
 */
import apiClient from './client';

export interface AccessoryColorVariant {
  color_id: number | null;
  color_name: string;
  hex_code: string | null;
  min_price: number | null;
  max_price: number | null;
  total_quantity: number;
  available_units: number;
  units: {
    unit_id: number;
    price: number;
    quantity: number;
    condition: string;
    image_url: string | null;
  }[];
}

export interface ProductAccessoryLink {
  id: number;
  main_product: number;
  accessory: number;
  required_quantity: number;
  main_product_name: string;
  accessory_name: string;
  accessory_slug: string;
  accessory_primary_image?: string | null;
  accessory_video_url?: string | null;
  accessory_price_range?: {
    min: number | null;
    max: number | null;
  };
  accessory_color_variants?: AccessoryColorVariant[];
}

export interface PaginatedAccessoryLinkResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ProductAccessoryLink[];
}

export const accessoriesApi = {
  /**
   * Get all product accessory links
   */
  getAccessoryLinks: async (params?: {
    page?: number;
    page_size?: number;
    main_product?: number;
  }): Promise<PaginatedAccessoryLinkResponse> => {
    const response = await apiClient.get('/accessories-link/', {
      params,
    });
    return response.data;
  },

  /**
   * Get accessories for a specific product
   */
  getProductAccessories: async (productId: number): Promise<ProductAccessoryLink[]> => {
    const response = await accessoriesApi.getAccessoryLinks({
      main_product: productId,
      page_size: 100, // Get all accessories
    });
    return response.results;
  },
};







