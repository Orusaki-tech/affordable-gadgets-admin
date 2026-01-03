/**
 * Product API functions
 */
import apiClient from './client';

export interface Product {
  id: number;
  product_name: string;
  brand: string;
  model_series: string;
  product_type: string;
  product_description: string;
  long_description?: string | null;
  product_highlights?: string[];
  tags?: string[];
  available_units_count: number;
  interest_count: number;
  min_price: number | null;
  max_price: number | null;
  primary_image: string | null;
  slug: string;
  product_video_url?: string | null;
}

export interface InventoryUnitImage {
  id: number;
  image_url: string | null;
  is_primary: boolean;
  color_id: number | null;
  color_name: string | null;
  created_at: string;
}

export interface InventoryUnit {
  id: number;
  product_id?: number;
  product_name: string;
  product_slug?: string;
  selling_price: number;
  condition: string;
  grade: string | null;
  storage_gb: number | null;
  ram_gb: number | null;
  battery_mah: number | null;
  product_color: number | null;
  color_name: string | null;
  interest_count: number;
  images?: InventoryUnitImage[];
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const productsApi = {
  /**
   * Get all products (paginated)
   */
  getProducts: async (params?: {
    page?: number;
    page_size?: number;
    type?: string;
    search?: string;
    brand_filter?: string;
    min_price?: number;
    max_price?: number;
    ordering?: string;
    promotion?: number; // Promotion ID to filter products
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/products/', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   */
  getProduct: async (id: number): Promise<Product> => {
    try {
      const response = await apiClient.get(`/products/${id}/`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Product with ID ${id} not found`);
      }
      throw error;
    }
  },

  /**
   * Get product by slug or ID
   */
  getProductBySlug: async (slug: string): Promise<Product> => {
    // If slug is a number, try to get by ID first
    const slugAsNumber = parseInt(slug, 10);
    if (!isNaN(slugAsNumber)) {
      try {
        return await productsApi.getProduct(slugAsNumber);
      } catch (error: any) {
        // If ID lookup fails with 404, the product might not exist or be filtered
        if (error.response?.status === 404) {
          throw new Error(`Product with ID ${slugAsNumber} not found. It may be unpublished or discontinued.`);
        }
        // For other errors, continue to try slug lookup
        console.warn(`Product with ID ${slugAsNumber} lookup failed:`, error.message);
      }
    }
    
    // Try to get by slug parameter (exact match)
    try {
      const response = await apiClient.get(`/products/`, {
        params: { slug: slug },
      });
      const products = response.data.results;
      
      if (products.length > 0) {
        return products[0];
      }
    } catch (error: any) {
      console.warn('Slug filter query failed:', error.message);
    }
    
    // Try searching and finding by slug
    try {
      // First, try a broader search
      const searchResponse = await apiClient.get(`/products/`, {
        params: { page_size: 100 }, // Get more products to search through
      });
      const allProducts = searchResponse.data.results;
      
      // Try to find exact slug match
      const found = allProducts.find((p: Product) => p.slug === slug);
      if (found) {
        return found;
      }
      
      // If still not found, try searching by name
      if (slug.length > 2) {
        const nameSearchResponse = await apiClient.get(`/products/`, {
          params: { search: slug, page_size: 50 },
        });
        const searchProducts = nameSearchResponse.data.results;
        const slugMatch = searchProducts.find((p: Product) => p.slug === slug);
        if (slugMatch) {
          return slugMatch;
        }
      }
    } catch (error: any) {
      console.warn('Search failed:', error.message);
    }
    
    throw new Error(`Product "${slug}" not found. Make sure the product exists and is published.`);
  },

  /**
   * Get available units for a product
   */
  getProductUnits: async (productId: number): Promise<InventoryUnit[]> => {
    const response = await apiClient.get(`/products/${productId}/units/`);
    return response.data;
  },
};

