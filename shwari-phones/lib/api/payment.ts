/**
 * Payment API functions for Pesapal integration
 */
import apiClient from './client';

export interface InitiatePaymentRequest {
  callback_url: string;
  cancellation_url?: string;
  customer?: {
    email?: string;
    phone_number?: string;
    first_name?: string;
    last_name?: string;
  };
  billing_address?: {
    email_address?: string;
    phone_number?: string;
    country_code?: string;
    first_name?: string;
    last_name?: string;
    line_1?: string;
    line_2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
  };
}

export interface InitiatePaymentResponse {
  success: boolean;
  message?: string;
  order_tracking_id?: string;
  redirect_url?: string;
  payment_id?: number;
  error?: string;
}

export interface PaymentStatusResponse {
  status: string;
  order_tracking_id?: string;
  payment_id?: string;
  payment_reference?: string;
  amount?: string;
  currency?: string;
  payment_method?: string;
  redirect_url?: string;
  initiated_at?: string;
  completed_at?: string;
  is_verified?: boolean;
  ipn_received?: boolean;
  message?: string;
}

export const paymentApi = {
  /**
   * Initiate Pesapal payment for an order
   * Note: Uses /api/inventory/orders/ endpoint
   * For public checkout, this may require backend permission changes
   */
  initiatePayment: async (
    orderId: string,
    data: InitiatePaymentRequest
  ): Promise<InitiatePaymentResponse> => {
    console.log('\n[PESAPAL] ========== FRONTEND: INITIATE PAYMENT API CALL START ==========');
    console.log('[PESAPAL] Order ID:', orderId);
    console.log('[PESAPAL] Request Data:', JSON.stringify(data, null, 2));
    
    // Use inventory API endpoint
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    console.log('[PESAPAL] Base URL:', baseURL);
    console.log('[PESAPAL] Auth Token Present:', !!token);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Add auth token if available
    if (token) {
      headers['Authorization'] = `Token ${token}`;
      console.log('[PESAPAL] Authorization header added (token length:', token.length, ')');
    } else {
      console.log('[PESAPAL] No auth token - making unauthenticated request');
    }
    
    const url = `${baseURL}/api/inventory/orders/${orderId}/initiate_payment/`;
    console.log('[PESAPAL] Request URL:', url);
    console.log('[PESAPAL] Request Method: POST');
    console.log('[PESAPAL] Request Headers:', JSON.stringify(Object.keys(headers), null, 2));
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(data),
      });

      console.log('[PESAPAL] Response Status:', response.status, response.statusText);
      console.log('[PESAPAL] Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('[PESAPAL] ERROR - Response Body:', JSON.stringify(errorData, null, 2));
        
        // Extract detailed error message
        let errorMessage = 'Failed to initiate payment';
        
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData.detail) {
          errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
        } else if (errorData.message) {
          errorMessage = typeof errorData.message === 'string' ? errorData.message : JSON.stringify(errorData.message);
        }
        
        console.log('[PESAPAL] ========== FRONTEND: INITIATE PAYMENT API CALL FAILED ==========');
        console.log('[PESAPAL] Error Message:', errorMessage);
        console.log('[PESAPAL] ===============================================================\n');
        
        const error = new Error(errorMessage);
        (error as any).response = response;
        (error as any).data = errorData;
        throw error;
      }

      const result = await response.json();
      console.log('[PESAPAL] SUCCESS - Response Body:', JSON.stringify(result, null, 2));
      console.log('[PESAPAL] ========== FRONTEND: INITIATE PAYMENT API CALL SUCCESS ==========\n');
      return result;
    } catch (err: any) {
      console.log('[PESAPAL] ========== FRONTEND: INITIATE PAYMENT API CALL EXCEPTION ==========');
      console.log('[PESAPAL] Exception:', err?.message || 'Unknown error');
      console.log('[PESAPAL] Stack:', err?.stack);
      console.log('[PESAPAL] ================================================================\n');
      throw err;
    }
  },

  /**
   * Get payment status for an order
   * Note: Uses /api/inventory/orders/ endpoint (not public API)
   */
  getPaymentStatus: async (orderId: string): Promise<PaymentStatusResponse> => {
    console.log('\n[PESAPAL] ========== FRONTEND: GET PAYMENT STATUS API CALL START ==========');
    console.log('[PESAPAL] Order ID:', orderId);
    
    // Use inventory API endpoint (requires authentication)
    const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    console.log('[PESAPAL] Base URL:', baseURL);
    console.log('[PESAPAL] Auth Token Present:', !!token);
    
    const url = `${baseURL}/api/inventory/orders/${orderId}/payment_status/`;
    console.log('[PESAPAL] Request URL:', url);
    console.log('[PESAPAL] Request Method: GET');
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Token ${token}` }),
        },
        credentials: 'include',
      });

      console.log('[PESAPAL] Response Status:', response.status, response.statusText);
      console.log('[PESAPAL] Response OK:', response.ok);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.log('[PESAPAL] ERROR - Response Body:', JSON.stringify(errorData, null, 2));
        console.log('[PESAPAL] ========== FRONTEND: GET PAYMENT STATUS API CALL FAILED ==========\n');
        throw new Error(errorData.error || 'Failed to get payment status');
      }

      const result = await response.json();
      console.log('[PESAPAL] SUCCESS - Response Body:', JSON.stringify(result, null, 2));
      console.log('[PESAPAL] Payment Status:', result.status);
      console.log('[PESAPAL] ========== FRONTEND: GET PAYMENT STATUS API CALL SUCCESS ==========\n');
      return result;
    } catch (err: any) {
      console.log('[PESAPAL] ========== FRONTEND: GET PAYMENT STATUS API CALL EXCEPTION ==========');
      console.log('[PESAPAL] Exception:', err?.message || 'Unknown error');
      console.log('[PESAPAL] Stack:', err?.stack);
      console.log('[PESAPAL] ===================================================================\n');
      throw err;
    }
  },
};

