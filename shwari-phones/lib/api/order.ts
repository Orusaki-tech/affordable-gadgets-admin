/**
 * Order API functions
 */
import apiClient from './client';

export interface CreateOrderRequest {
  order_items: Array<{
    inventory_unit_id: number;
    quantity: number;
  }>;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_address?: string;
  brand?: number;
}

export interface OrderResponse {
  order_id: string;
  status: string;
  total_amount: string;
  customer_username?: string;
  order_items?: Array<{
    id: number;
    inventory_unit: {
      id: number;
      product_name: string;
    };
    quantity: number;
    unit_price_at_purchase: string;
  }>;
  created_at: string;
}

export const orderApi = {
  /**
   * Create order from cart items
   * Note: Uses /api/inventory/orders/ endpoint (requires authentication)
   */
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    // Use inventory API endpoint (requires authentication)
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${baseURL}/api/inventory/orders/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      // Extract detailed error message - ensure it's always a string
      let errorMessage = 'Failed to create order';
      
      // Helper to safely convert to string
      const toString = (value: any): string => {
        if (typeof value === 'string') return value;
        if (Array.isArray(value)) return value.map(toString).join(', ');
        if (typeof value === 'object' && value !== null) {
          // Try to extract meaningful error messages from object
          if (value.message) return toString(value.message);
          if (value.error) return toString(value.error);
          // If it's an object with nested errors, try to extract them
          const entries = Object.entries(value).map(([key, val]) => {
            const valStr = toString(val);
            return valStr ? `${key}: ${valStr}` : '';
          }).filter(Boolean);
          return entries.length > 0 ? entries.join('; ') : JSON.stringify(value);
        }
        return String(value);
      };
      
      if (errorData.error) {
        errorMessage = toString(errorData.error);
      } else if (errorData.detail) {
        errorMessage = toString(errorData.detail);
      } else if (errorData.order_items) {
        // Validation errors for order_items
        const itemErrors = Object.values(errorData.order_items).flat();
        errorMessage = toString(itemErrors);
      } else if (errorData.non_field_errors) {
        errorMessage = toString(errorData.non_field_errors);
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      } else if (Object.keys(errorData).length > 0) {
        // Try to extract any error messages from the object
        errorMessage = toString(errorData);
      }
      
      const error = new Error(errorMessage);
      (error as any).response = response;
      (error as any).data = errorData;
      throw error;
    }

    return response.json();
  },

  /**
   * Get order details
   * Note: Uses /api/inventory/orders/ endpoint (requires authentication)
   */
  getOrder: async (orderId: string): Promise<OrderResponse> => {
    // Use inventory API endpoint (requires authentication)
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    const response = await fetch(`${baseURL}/api/inventory/orders/${orderId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Token ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to get order');
    }

    return response.json();
  },
};

