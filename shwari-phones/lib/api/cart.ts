/**
 * Cart API functions
 */
import apiClient from './client';

export interface CartItem {
  id: number;
  inventory_unit: {
    id: number;
    product_name: string;
    selling_price: number;
    condition: string;
    grade: string | null;
    storage_gb: number | null;
    ram_gb: number | null;
    color_name: string | null;
    interest_count: number;
  };
  inventory_unit_id: number;
  quantity: number;
  unit_price?: number;
  promotion_id?: number | null;
}

export interface Cart {
  id: number;
  items: CartItem[];
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_address: string;
  total_value: number;
  expires_at: string;
  is_submitted: boolean;
}

export interface CheckoutData {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  delivery_address?: string;
}

export interface CheckoutResponse {
  message: string;
  lead_reference: string;
  lead: {
    lead_reference: string;
    status: string;
    submitted_at: string;
    total_value: number;
    items: Array<{
      product_name: string;
      quantity: number;
      unit_price: string;
    }>;
  };
}

export const cartApi = {
  /**
   * Create or get existing cart
   */
  getOrCreateCart: async (sessionKey?: string, customerPhone?: string): Promise<Cart> => {
    const response = await apiClient.post('/cart/', {
      session_key: sessionKey,
      customer_phone: customerPhone,
    });
    return response.data;
  },

  /**
   * Get cart by ID
   */
  getCart: async (cartId: number): Promise<Cart> => {
    const response = await apiClient.get(`/cart/${cartId}/`);
    return response.data;
  },

  /**
   * Add item to cart
   */
  addItem: async (
    cartId: number, 
    inventoryUnitId: number, 
    quantity: number = 1,
    promotionId?: number,
    unitPrice?: number
  ): Promise<CartItem> => {
    const payload: any = {
      inventory_unit_id: inventoryUnitId,
      quantity,
    };
    
    if (promotionId) {
      payload.promotion_id = promotionId;
    }
    
    if (unitPrice !== undefined) {
      payload.unit_price = unitPrice;
    }
    
    const response = await apiClient.post(`/cart/${cartId}/items/`, payload);
    return response.data;
  },

  /**
   * Remove item from cart
   */
  removeItem: async (cartId: number, itemId: number): Promise<void> => {
    await apiClient.delete(`/cart/${cartId}/items/${itemId}/`);
  },

  /**
   * Checkout cart (convert to Lead)
   */
  checkout: async (cartId: number, checkoutData: CheckoutData): Promise<CheckoutResponse> => {
    const response = await apiClient.post(`/cart/${cartId}/checkout/`, checkoutData);
    return response.data;
  },

  /**
   * Recognize customer by phone
   */
  recognizeCustomer: async (phone: string): Promise<{
    customer: any | null;
    is_returning: boolean;
    message: string | null;
  }> => {
    const response = await apiClient.get(`/cart/recognize/`, {
      params: { phone },
    });
    return response.data;
  },
};







